import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpires } as SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.refreshExpires } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
