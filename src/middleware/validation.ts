import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { z } from 'zod';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

// User validation schemas
export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Transaction validation schemas
export const validateTransaction = [
  body('type').isIn(['CREDIT', 'DEBIT']).withMessage('Type must be CREDIT or DEBIT'),
  body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Amount must be a valid decimal'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').optional().trim(),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  handleValidationErrors
];

// Category validation schemas
export const validateCategory = [
  body('name').trim().isLength({ min: 1 }).withMessage('Category name is required'),
  body('type').isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color'),
  handleValidationErrors
];

// Zod schemas for more complex validation
export const transactionSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.date().optional()
});

export const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
});

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});
