import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export const generateAccessToken = (payload: Omit<JWTPayload, 'type'>): string => {
  const tokenPayload = { ...payload, type: 'access' as const };
  const secret = env.JWT_SECRET;
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };

  return jwt.sign(tokenPayload, secret, options);
};

export const generateRefreshToken = (payload: Omit<JWTPayload, 'type'>): string => {
  const tokenPayload = { ...payload, type: 'refresh' as const };
  const secret = env.JWT_REFRESH_SECRET;
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };

  return jwt.sign(tokenPayload, secret, options);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_SECRET as string) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as string) as JWTPayload;
};

export const generateTokenPair = (payload: Omit<JWTPayload, 'type'>) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
