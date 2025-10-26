import { Response } from 'express';
import { z } from 'zod';
import prisma from '@/config/database';
import { AuthenticatedRequest } from '@/middleware/auth';
import logger from '@/utils/logger';

const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
});

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = createCategorySchema.parse(req.body);

    // Check if category already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        name: data.name,
        type: data.type
      }
    });

    if (existingCategory) {
      res.status(409).json({ error: 'Category already exists' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        ...data,
        userId,
        color: data.color || '#3B82F6'
      },
      select: {
        id: true,
        name: true,
        type: true,
        color: true
      }
    });

    logger.info('Category created', { 
      userId, 
      categoryId: category.id,
      name: category.name,
      type: category.type
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
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

export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    const where = {
      userId,
      ...(type && { type: type as 'INCOME' | 'EXPENSE' })
    };

    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        type: true,
        color: true
      }
    });

    res.json({ categories });
  } catch (error) {
    throw error;
  }
};

export const getCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params['id']!;

    const category = await prisma.category.findFirst({
      where: {
        id,
        userId
      },
      select: {
        id: true,
        name: true,
        type: true,
        color: true
      }
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ category });
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params['id']!;
    const data = updateCategorySchema.parse(req.body);

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!existingCategory) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Check if new name conflicts with existing category
    if (data.name && data.name !== existingCategory.name) {
      const conflictingCategory = await prisma.category.findFirst({
        where: {
          userId,
          name: data.name,
          type: data.type || existingCategory.type,
          NOT: { id }
        }
      });

      if (conflictingCategory) {
        res.status(409).json({ error: 'Category name already exists' });
        return;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.color && { color: data.color })
      },
      select: {
        id: true,
        name: true,
        type: true,
        color: true
      }
    });

    logger.info('Category updated', { 
      userId, 
      categoryId: category.id,
      name: category.name
    });

    res.json({
      message: 'Category updated successfully',
      category
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

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params['id']!;

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!existingCategory) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    // Check if category is being used in transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        userId,
        category: existingCategory.name
      }
    });

    if (transactionCount > 0) {
      res.status(400).json({
        error: 'Cannot delete category that is being used in transactions',
        transactionCount
      });
      return;
    }

    await prisma.category.delete({
      where: { id }
    });

    logger.info('Category deleted', { 
      userId, 
      categoryId: id,
      name: existingCategory.name
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    throw error;
  }
};

export const getCategoryStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params['id']!;

    const category = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const stats = await prisma.transaction.aggregate({
      where: {
        userId,
        category: category.name
      },
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true }
    });

    const totalAmount = Number(stats._sum.amount || 0);
    const transactionCount = stats._count.id;
    const averageAmount = Number(stats._avg.amount || 0);

    res.json({
      category: {
        id: category.id,
        name: category.name,
        type: category.type,
        color: category.color
      },
      stats: {
        totalAmount,
        transactionCount,
        averageAmount
      }
    });
  } catch (error) {
    throw error;
  }
};
