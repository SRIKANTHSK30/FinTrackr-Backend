import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getDashboard
} from '@/controllers/userController';
import { authenticate } from '@/middleware/auth';
import { strictLimiter } from '@/middleware/rateLimiter';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile operations
 */

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/account', strictLimiter, deleteAccount);

// Dashboard route
router.get('/dashboard', getDashboard);

export default router;
