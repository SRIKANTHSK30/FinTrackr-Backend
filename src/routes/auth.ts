import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout
} from '@/controllers/authController';
import { validateRegister, validateLogin } from '@/middleware/validation';
import { authLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', logout);

export default router;
