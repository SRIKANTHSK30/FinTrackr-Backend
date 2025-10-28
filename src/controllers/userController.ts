import { Response } from 'express';
import prisma from '@/config/database';
import { AuthenticatedRequest } from '@/middleware/auth';
import logger from '@/utils/logger';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.authUser!.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
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

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.authUser!.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.authUser!.id },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true
      }
    });

    logger.info('User profile updated', { userId: req.authUser!.id });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    throw error;
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: req.authUser!.id }
    });

    logger.info('User account deleted', { userId: req.authUser!.id });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;

    // Get recent transactions
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
        date: true
      }
    });

    // Get balance summary
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        type: true,
        amount: true
      }
    });

    const totalIncome = transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Get category breakdown
    const categoryBreakdown = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: { userId },
      _sum: { amount: true },
      _count: { id: true }
    });

    // Get monthly spending (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpending = await prisma.transaction.groupBy({
      by: ['date'],
      where: {
        userId,
        type: 'DEBIT',
        date: { gte: sixMonthsAgo }
      },
      _sum: { amount: true },
      orderBy: { date: 'asc' }
    });

    res.json({
      balance,
      totalIncome,
      totalExpenses,
      recentTransactions,
      categoryBreakdown,
      monthlySpending
    });
  } catch (error) {
    throw error;
  }
};
