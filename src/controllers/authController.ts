import { Request, Response } from 'express';
import { z } from 'zod';
import passport from 'passport';
import prisma from '@/config/database';
import { hashPassword, comparePassword } from '@/utils/bcrypt';
import { generateTokenPair, verifyRefreshToken } from '@/utils/jwt';
import logger from '@/utils/logger';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({ error: 'User already exists with this email' });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt
      }
    });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      ...tokens
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

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt
      }
    });

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      ...tokens
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

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    if (payload.type !== 'refresh') {
      res.status(401).json({ error: 'Invalid token type' });
      return;
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.userId,
        token: refreshToken,
        expiresAt: {
          gt: new Date() // Token not expired
        }
      }
    });

    if (!storedToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: payload.userId,
      email: payload.email
    });

    // Update refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Delete old refresh token and create new one
    await prisma.refreshToken.deleteMany({
      where: { userId: payload.userId }
    });

    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: tokens.refreshToken,
        expiresAt
      }
    });

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyRefreshToken(token);

    // Remove refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { userId: payload.userId }
    });

    logger.info('User logged out successfully', { userId: payload.userId });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Google OAuth methods
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

export const googleCallback = (req: Request, res: Response): void => {
  passport.authenticate('google', async (err: any, user: any) => {
    if (err) {
      logger.error('Google OAuth error', { error: err });
      res.status(500).json({ error: 'Authentication failed' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }

    try {
      // Generate tokens for the authenticated user
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email
      });

      // Store refresh token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt
        }
      });

      logger.info('User authenticated via Google OAuth', { 
        userId: user.id, 
        email: user.email,
        googleId: user.googleId 
      });

      // For development, redirect to frontend with tokens
      // In production, you might want to redirect to a success page
      const frontendUrl = process.env['FRONTEND_URL'] || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`;
      
      res.redirect(redirectUrl);
    } catch (tokenError) {
      logger.error('Token generation error', { error: tokenError, userId: user.id });
      res.status(500).json({ error: 'Token generation failed' });
    }
  })(req, res);
};
