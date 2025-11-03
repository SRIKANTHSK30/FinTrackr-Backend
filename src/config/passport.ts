import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '@/config/database';
import { env } from '@/config/env';
import logger from '@/utils/logger';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `http://localhost:${env.PORT || 3000}/api/v1/auth/google/callback`,
      scope: ['profile', 'email'],

    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const { id: googleId, emails, displayName } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if user already exists with this Google ID
        let user = await prisma.user.findUnique({
          where: { googleId }
        });

        if (user) {
          logger.info('User found with Google ID', { userId: user.id, googleId });
          return done(null, user);
        }

        // Check if user exists with this email (for account linking)
        user = await prisma.user.findUnique({
          where: { email }
        });

        if (user) {
          // Link Google account to existing user
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { googleId },
            select: {
              id: true,
              email: true,
              name: true,
              googleId: true,
              createdAt: true
            }
          });
          logger.info('Google account linked to existing user', { userId: updatedUser.id, googleId });
          return done(null, updatedUser);
        }

        // Create new user
        const newUser = await prisma.user.create({
          data: {
            googleId,
            email,
            name: displayName || email.split('@')[0] || 'User',
            passwordHash: null // No password for OAuth users
          },
          select: {
            id: true,
            email: true,
            name: true,
            googleId: true,
            createdAt: true
          }
        });

        logger.info('New user created via Google OAuth', { userId: newUser.id, googleId, email });
        return done(null, newUser);
      } catch (error) {
        logger.error('Google OAuth strategy error', { error, googleId: profile.id });
        return done(error, undefined);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
        createdAt: true
      }
    });
    done(null, user || false);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
