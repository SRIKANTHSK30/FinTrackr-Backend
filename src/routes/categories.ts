import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} from '@/controllers/categoryController';
import { authenticate } from '@/middleware/auth';
import { validateCategory } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Category CRUD routes
router.post('/', validateCategory, createCategory);
router.get('/', getCategories);
router.get('/:id', getCategory);
router.get('/:id/stats', getCategoryStats);
router.put('/:id', validateCategory, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
