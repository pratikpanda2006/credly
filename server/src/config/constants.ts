import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'credly-access-super-secret-key-2026-secure';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'credly-refresh-super-secret-key-2026-secure';

// Unambiguous alphabet (no 0, O, 1, I)
export const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
};
