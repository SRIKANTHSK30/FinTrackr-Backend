import { Response } from 'express';
import prisma from '@/config/database';
import { AuthenticatedRequest } from '@/middleware/auth';
import logger from '@/utils/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique user identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         name:
 *           type: string
 *           description: User's full name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last profile update timestamp
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         email: "user@example.com"
 *         name: "John Doe"
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 *     
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *     
 *     DashboardData:
 *       type: object
 *       properties:
 *         balance:
 *           type: number
 *           format: decimal
 *           description: Current account balance
 *         totalIncome:
 *           type: number
 *           format: decimal
 *           description: Total income amount
 *         totalExpenses:
 *           type: number
 *           format: decimal
 *           description: Total expenses amount
 *         recentTransactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [CREDIT, DEBIT]
 *               amount:
 *                 type: number
 *                 format: decimal
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *         categoryBreakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               _sum:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     format: decimal
 *               _count:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *         monthlySpending:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               _sum:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     format: decimal
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         user:
 *           $ref: '#/components/schemas/UserProfile'
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         details:
 *           type: array
 *           items:
 *             type: object
 *           description: Validation error details (optional)
 */

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *             example:
 *               user:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 createdAt: "2023-01-01T00:00:00.000Z"
 *                 updatedAt: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
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

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information (name and/or email)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           example:
 *             name: "John Doe Updated"
 *             email: "john.doe.updated@example.com"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Profile updated successfully"
 *               user:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 email: "john.doe.updated@example.com"
 *                 name: "John Doe Updated"
 *                 updatedAt: "2023-01-01T12:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Validation failed"
 *               details: [{"field": "email", "message": "Invalid email format"}]
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       409:
 *         description: Conflict - Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Email already in use"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
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

/**
 * @swagger
 * /api/v1/users/account:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete the authenticated user's account and all associated data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *             example:
 *               message: "Account deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Too many requests"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error"
 */
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

/**
 * @swagger
 * /api/v1/users/dashboard:
 *   get:
 *     summary: Get user dashboard data
 *     description: Retrieve comprehensive financial dashboard data including balance, transactions, and analytics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardData'
 *             example:
 *               balance: 1500.50
 *               totalIncome: 5000.00
 *               totalExpenses: 3499.50
 *               recentTransactions:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   type: "CREDIT"
 *                   amount: 1000.00
 *                   category: "Salary"
 *                   description: "Monthly salary"
 *                   date: "2023-01-01T00:00:00.000Z"
 *                 - id: "123e4567-e89b-12d3-a456-426614174001"
 *                   type: "DEBIT"
 *                   amount: 50.00
 *                   category: "Food"
 *                   description: "Grocery shopping"
 *                   date: "2023-01-01T12:00:00.000Z"
 *               categoryBreakdown:
 *                 - category: "Salary"
 *                   type: "CREDIT"
 *                   _sum:
 *                     amount: 5000.00
 *                   _count:
 *                     id: 1
 *                 - category: "Food"
 *                   type: "DEBIT"
 *                   _sum:
 *                     amount: 500.00
 *                   _count:
 *                     id: 10
 *               monthlySpending:
 *                 - date: "2023-01-01T00:00:00.000Z"
 *                   _sum:
 *                     amount: 1000.00
 *                 - date: "2023-02-01T00:00:00.000Z"
 *                   _sum:
 *                     amount: 1200.00
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
