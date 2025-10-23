import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
} from '@/controllers/transactionController';
import { authenticate } from '@/middleware/auth';
import { validateTransaction } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Transaction CRUD routes
router.post('/', validateTransaction, createTransaction);
router.get('/', getTransactions);
router.get('/summary', getTransactionSummary);
router.get('/:id', getTransaction);
router.put('/:id', validateTransaction, updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
