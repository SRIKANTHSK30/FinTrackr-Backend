import { Response } from 'express';
import { z } from 'zod';
import prisma from '@/config/database';
import { AuthenticatedRequest } from '@/middleware/auth';
import logger from '@/utils/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique category identifier
 *         name:
 *           type: string
 *           description: Category name
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           description: Category type
 *         color:
 *           type: string
 *           pattern: '^#[0-9A-F]{6}$'
 *           description: Category color in hex format
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Food"
 *         type: "EXPENSE"
 *         color: "#3B82F6"
 *     
 *     CreateCategoryRequest:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           description: Category name
 *           example: "Food"
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           description: Category type
 *           example: "EXPENSE"
 *         color:
 *           type: string
 *           pattern: '^#[0-9A-F]{6}$'
 *           description: Category color in hex format
 *           example: "#3B82F6"
 *     
 *     UpdateCategoryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           description: Category name
 *           example: "Food & Dining"
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           description: Category type
 *           example: "EXPENSE"
 *         color:
 *           type: string
 *           pattern: '^#[0-9A-F]{6}$'
 *           description: Category color in hex format
 *           example: "#EF4444"
 *     
 *     CategoryStats:
 *       type: object
 *       properties:
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         stats:
 *           type: object
 *           properties:
 *             totalAmount:
 *               type: number
 *               format: decimal
 *               description: Total amount for this category
 *             transactionCount:
 *               type: number
 *               description: Number of transactions in this category
 *             averageAmount:
 *               type: number
 *               format: decimal
 *               description: Average transaction amount for this category
 *     
 *     CategoryListResponse:
 *       type: object
 *       properties:
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *     
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         category:
 *           $ref: '#/components/schemas/Category'
 */

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

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a new income or expense category for the authenticated user
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *           example:
 *             name: "Food"
 *             type: "EXPENSE"
 *             color: "#3B82F6"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *             example:
 *               message: "Category created successfully"
 *               category:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Food"
 *                 type: "EXPENSE"
 *                 color: "#3B82F6"
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               details: [{"field": "name", "message": "Name is required"}]
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       409:
 *         description: Conflict - Category already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Category already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
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

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve all categories for the authenticated user, optionally filtered by type
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter categories by type
 *         example: "EXPENSE"
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryListResponse'
 *             example:
 *               categories:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "Food"
 *                   type: "EXPENSE"
 *                   color: "#3B82F6"
 *                 - id: "123e4567-e89b-12d3-a456-426614174001"
 *                   name: "Salary"
 *                   type: "INCOME"
 *                   color: "#10B981"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
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

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a specific category by its ID for the authenticated user
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *             example:
 *               category:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Food"
 *                 type: "EXPENSE"
 *                 color: "#3B82F6"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Category not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
export const getCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
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

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Update category
 *     description: Update an existing category for the authenticated user
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *           example:
 *             name: "Food & Dining"
 *             type: "EXPENSE"
 *             color: "#EF4444"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *             example:
 *               message: "Category updated successfully"
 *               category:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Food & Dining"
 *                 type: "EXPENSE"
 *                 color: "#EF4444"
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               details: [{"field": "name", "message": "Name is required"}]
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Category not found"
 *       409:
 *         description: Conflict - Category name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Category name already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
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

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Delete a category for the authenticated user (only if not used in transactions)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *             example:
 *               message: "Category deleted successfully"
 *       400:
 *         description: Bad request - Category is being used in transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 transactionCount:
 *                   type: number
 *             example:
 *               error: "Cannot delete category that is being used in transactions"
 *               transactionCount: 5
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Category not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
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

/**
 * @swagger
 * /api/v1/categories/{id}/stats:
 *   get:
 *     summary: Get category statistics
 *     description: Get detailed statistics for a specific category including total amount, transaction count, and average amount
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Category statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryStats'
 *             example:
 *               category:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Food"
 *                 type: "EXPENSE"
 *                 color: "#3B82F6"
 *               stats:
 *                 totalAmount: 1250.50
 *                 transactionCount: 15
 *                 averageAmount: 83.37
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Category not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
export const getCategoryStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser!.id;
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
