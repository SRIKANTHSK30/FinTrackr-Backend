import { Response } from 'express';
import { z } from 'zod';
import prisma from '@/config/database';
import { AuthenticatedRequest } from '@/middleware/auth';
import logger from '@/utils/logger';

const createTransactionSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.date().optional()
});

const updateTransactionSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.date().optional()
});

const getTransactionsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  category: z.string().optional(),
  startDate: z.string().transform(Date).optional(),
  endDate: z.string().transform(Date).optional()
});

export const createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
    const data = createTransactionSchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId,
        date: data.date || new Date(),
        description: data.description ?? null
      },
      select: {
        id: true,
        type: true,
        amount: true,
        category: true,
        description: true,
        date: true,
        createdAt: true
      }
    });

    logger.info('Transaction created', { 
      userId, 
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }
    throw error;
  }
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
    const { page, limit, type, category, startDate, endDate } = getTransactionsSchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(type && { type }),
      ...(category && { category }),
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          category: true,
          description: true,
          date: true,
          createdAt: true
        }
      }),
      prisma.transaction.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }
    throw error;
  }
};

export const getTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
    const id = req.params['id']!;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      },
      select: {
        id: true,
        type: true,
        amount: true,
        category: true,
        description: true,
        date: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json({ transaction });
  } catch (error) {
    throw error;
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
    const id = req.params['id']!;
    const data = updateTransactionSchema.parse(req.body);

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTransaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.amount && { amount: data.amount }),
        ...(data.category && { category: data.category }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date && { date: data.date })
      },
      select: {
        id: true,
        type: true,
        amount: true,
        category: true,
        description: true,
        date: true,
        updatedAt: true
      }
    });

    logger.info('Transaction updated', { 
      userId, 
      transactionId: transaction.id 
    });

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }
    throw error;
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
    const id = req.params['id']!;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTransaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    await prisma.transaction.delete({
      where: { id }
    });

    logger.info('Transaction deleted', { 
      userId, 
      transactionId: id 
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getTransactionSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
    const { startDate, endDate } = req.query;

    const where = {
      userId,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      })
    };

    const [income, expenses] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'CREDIT' },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'DEBIT' },
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);
    const balance = totalIncome - totalExpenses;

    res.json({
      balance,
      totalIncome,
      totalExpenses,
      transactionCount: {
        income: income._count.id,
        expenses: expenses._count.id
      }
    });
  } catch (error) {
    throw error;
  }
};
