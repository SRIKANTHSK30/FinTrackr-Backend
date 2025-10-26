import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import transactionRoutes from './transactions';
import categoryRoutes from './categories';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);

// Health check route
router.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
