import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  googleAuth,
  googleCallback
} from '@/controllers/authController';
import { validateRegister, validateLogin } from '@/middleware/validation';
import { authLimiter } from '@/middleware/rateLimiter';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization operations
 */

const router = Router();

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', refreshToken);

// Google OAuth routes
router.get('/google', authLimiter, googleAuth);
router.get('/google/callback', googleCallback);

// Protected routes
router.post('/logout', logout);

export default router;
