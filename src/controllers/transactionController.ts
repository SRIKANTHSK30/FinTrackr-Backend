import { Response } from 'express';
import { z } from 'zod';
import prisma from '@/config/database';
import { AuthenticatedRequest } from '@/middleware/auth';
import logger from '@/utils/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique transaction identifier
 *         type:
 *           type: string
 *           enum: [CREDIT, DEBIT]
 *           description: Transaction type
 *         amount:
 *           type: number
 *           format: decimal
 *           description: Transaction amount
 *         category:
 *           type: string
 *           description: Transaction category
 *         description:
 *           type: string
 *           nullable: true
 *           description: Transaction description
 *         date:
 *           type: string
 *           format: date-time
 *           description: Transaction date
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Transaction creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Transaction last update timestamp
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         type: "DEBIT"
 *         amount: 25.50
 *         category: "Food"
 *         description: "Lunch at restaurant"
 *         date: "2023-01-01T12:00:00.000Z"
 *         createdAt: "2023-01-01T12:00:00.000Z"
 *         updatedAt: "2023-01-01T12:00:00.000Z"
 *     
 *     CreateTransactionRequest:
 *       type: object
 *       required:
 *         - type
 *         - amount
 *         - category
 *       properties:
 *         type:
 *           type: string
 *           enum: [CREDIT, DEBIT]
 *           description: Transaction type
 *           example: "DEBIT"
 *         amount:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           description: Transaction amount (must be positive)
 *           example: 25.50
 *         category:
 *           type: string
 *           minLength: 1
 *           description: Transaction category
 *           example: "Food"
 *         description:
 *           type: string
 *           description: Transaction description
 *           example: "Lunch at restaurant"
 *         date:
 *           type: string
 *           format: date-time
 *           description: Transaction date (defaults to current date)
 *           example: "2023-01-01T12:00:00.000Z"
 *     
 *     UpdateTransactionRequest:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [CREDIT, DEBIT]
 *           description: Transaction type
 *           example: "DEBIT"
 *         amount:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           description: Transaction amount (must be positive)
 *           example: 30.00
 *         category:
 *           type: string
 *           minLength: 1
 *           description: Transaction category
 *           example: "Food & Dining"
 *         description:
 *           type: string
 *           description: Transaction description
 *           example: "Dinner at restaurant"
 *         date:
 *           type: string
 *           format: date-time
 *           description: Transaction date
 *           example: "2023-01-01T18:00:00.000Z"
 *     
 *     TransactionListResponse:
 *       type: object
 *       properties:
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               description: Current page number
 *             limit:
 *               type: number
 *               description: Number of items per page
 *             total:
 *               type: number
 *               description: Total number of transactions
 *             totalPages:
 *               type: number
 *               description: Total number of pages
 *             hasNext:
 *               type: boolean
 *               description: Whether there is a next page
 *             hasPrev:
 *               type: boolean
 *               description: Whether there is a previous page
 *     
 *     TransactionResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         transaction:
 *           $ref: '#/components/schemas/Transaction'
 *     
 *     TransactionSummary:
 *       type: object
 *       properties:
 *         balance:
 *           type: number
 *           format: decimal
 *           description: Current balance (income - expenses)
 *         totalIncome:
 *           type: number
 *           format: decimal
 *           description: Total income amount
 *         totalExpenses:
 *           type: number
 *           format: decimal
 *           description: Total expenses amount
 *         transactionCount:
 *           type: object
 *           properties:
 *             income:
 *               type: number
 *               description: Number of income transactions
 *             expenses:
 *               type: number
 *               description: Number of expense transactions
 */

const createTransactionSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.coerce.date().optional()
});

const updateTransactionSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.coerce.date().optional()
});

const getTransactionsSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  category: z.string().optional(),
  startDate: z.string().transform(Date).optional(),
  endDate: z.string().transform(Date).optional()
  
});

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Create a new income or expense transaction for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *           example:
 *             type: "DEBIT"
 *             amount: 25.50
 *             category: "Food"
 *             description: "Lunch at restaurant"
 *             date: "2023-01-01T12:00:00.000Z"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *             example:
 *               message: "Transaction created successfully"
 *               transaction:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 type: "DEBIT"
 *                 amount: 25.50
 *                 category: "Food"
 *                 description: "Lunch at restaurant"
 *                 date: "2023-01-01T12:00:00.000Z"
 *                 createdAt: "2023-01-01T12:00:00.000Z"
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               details: [{"field": "amount", "message": "Amount must be positive"}]
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

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieve paginated transactions for the authenticated user with optional filtering
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of transactions per page
 *         example: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [CREDIT, DEBIT]
 *         description: Filter transactions by type
 *         example: "DEBIT"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter transactions by category
 *         example: "Food"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions from this date
 *         example: "2023-01-01T00:00:00.000Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions until this date
 *         example: "2023-01-31T23:59:59.999Z"
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionListResponse'
 *             example:
 *               transactions:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   type: "DEBIT"
 *                   amount: 25.50
 *                   category: "Food"
 *                   description: "Lunch at restaurant"
 *                   date: "2023-01-01T12:00:00.000Z"
 *                   createdAt: "2023-01-01T12:00:00.000Z"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 50
 *                 totalPages: 5
 *                 hasNext: true
 *                 hasPrev: false
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               details: [{"field": "page", "message": "Page must be a positive number"}]
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

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieve a specific transaction by its ID for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Transaction ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 *             example:
 *               transaction:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 type: "DEBIT"
 *                 amount: 25.50
 *                 category: "Food"
 *                 description: "Lunch at restaurant"
 *                 date: "2023-01-01T12:00:00.000Z"
 *                 createdAt: "2023-01-01T12:00:00.000Z"
 *                 updatedAt: "2023-01-01T12:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Transaction not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
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

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   put:
 *     summary: Update transaction
 *     description: Update an existing transaction for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Transaction ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransactionRequest'
 *           example:
 *             type: "DEBIT"
 *             amount: 30.00
 *             category: "Food & Dining"
 *             description: "Dinner at restaurant"
 *             date: "2023-01-01T18:00:00.000Z"
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *             example:
 *               message: "Transaction updated successfully"
 *               transaction:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 type: "DEBIT"
 *                 amount: 30.00
 *                 category: "Food & Dining"
 *                 description: "Dinner at restaurant"
 *                 date: "2023-01-01T18:00:00.000Z"
 *                 updatedAt: "2023-01-01T18:30:00.000Z"
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               details: [{"field": "amount", "message": "Amount must be positive"}]
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Transaction not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
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

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     description: Delete a transaction for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Transaction ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *             example:
 *               message: "Transaction deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Transaction not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
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

/**
 * @swagger
 * /api/v1/transactions/summary:
 *   get:
 *     summary: Get transaction summary
 *     description: Get financial summary including balance, total income, total expenses, and transaction counts
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for summary period
 *         example: "2023-01-01T00:00:00.000Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for summary period
 *         example: "2023-01-31T23:59:59.999Z"
 *     responses:
 *       200:
 *         description: Transaction summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionSummary'
 *             example:
 *               balance: 1500.50
 *               totalIncome: 5000.00
 *               totalExpenses: 3499.50
 *               transactionCount:
 *                 income: 5
 *                 expenses: 20
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
