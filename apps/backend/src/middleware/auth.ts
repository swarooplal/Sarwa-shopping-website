import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { forbidden, unauthorized } from '../utils/response';
import { Role } from '@prisma/client';
import { ROLE_PERMISSIONS } from '@sarwa/shared';

export interface AuthedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Missing token');
  }
  const token = header.slice(7);
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }
}

export function requireRoles(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res);
    if (!roles.includes(req.user.role as Role)) {
      return forbidden(res, 'Insufficient role');
    }
    return next();
  };
}

export function requirePermission(permission: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res);
    const role = req.user.role as Role;
    const allowed = ROLE_PERMISSIONS[role] ?? [];
    const matchAll = allowed.includes('*');
    const matchPrefix = allowed.some((p) => permission.startsWith(p.replace('*', '')));
    if (!matchAll && !matchPrefix) return forbidden(res, `Missing permission: ${permission}`);
    return next();
  };
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(header.slice(7));
    } catch {
      // ignore
    }
  }
  return next();
}
