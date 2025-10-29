import { Response } from 'express';
import { Transaction } from '@prisma/client';
import prisma from '@/config/database';
import { AuthenticatedRequest } from '@/middleware/auth';
import logger from '@/utils/logger';

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.authUser!.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.authUser!.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.authUser!.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    logger.info('User profile updated', { userId: req.authUser!.id });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    await prisma.user.delete({
      where: { id: req.authUser!.id },
    });

    logger.info('User account deleted', { userId: req.authUser!.id });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.authUser!.id;

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        category: true,
        description: true,
        date: true,
      },
    });

    // All transactions for summary
    const transactions: Pick<Transaction, 'type' | 'amount'>[] =
      await prisma.transaction.findMany({
        where: { userId },
        select: {
          type: true,
          amount: true,
        },
      });

    const totalIncome = transactions
      .filter(t => t.type === 'CREDIT')
      .map(t => Number(t.amount))
      .reduce((sum, amount) => sum + amount, 0);

    const totalExpenses = transactions
  .filter(t => t.type === 'DEBIT')
  .map(t => Number(t.amount))
  .reduce((sum, amount) => sum + amount, 0);

    const balance = totalIncome - totalExpenses;

    // Category breakdown
    const categoryBreakdown = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: { userId },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Monthly spending (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await prisma.transaction.groupBy({
      by: ['date'],
      where: {
        userId,
        type: 'DEBIT',
        date: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
      orderBy: { date: 'asc' },
    });

    res.json({
      balance,
      totalIncome,
      totalExpenses,
      recentTransactions,
      categoryBreakdown,
      monthlySpending,
    });
  } catch (error) {
    throw error;
  }
};
