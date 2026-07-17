import { doubleCsrf } from 'csrf-csrf';
// CSRF protection helper (modern double-submit cookie pattern). Falls back to manual check if lib not installed.

// Lightweight CSRF middleware (stateless double-submit cookie). For production add `csrf-csrf` or `csurf`.
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { forbidden } from '../utils/response';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'sarwa_csrf';

export function ensureCsrf(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = (req as any).cookies?.[CSRF_COOKIE];
  const headerToken = req.header(CSRF_HEADER);

  if (!cookieToken) {
    const token = crypto.randomBytes(24).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false, // readable by frontend
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    if (!headerToken) return next(); // first request, accept
    return forbidden(res, 'CSRF token invalid');
  }

  if (!headerToken || headerToken !== cookieToken) {
    return forbidden(res, 'CSRF token mismatch');
  }
  return next();
}
