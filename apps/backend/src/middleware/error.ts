import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { badRequest, serverError } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return badRequest(res, err.errors[0]?.message || 'Invalid input', 'VALIDATION');
  }
  if (err?.code === 'P2002') {
    return badRequest(res, 'Duplicate entry', 'CONFLICT');
  }
  if (err?.code === 'P2025') {
    return badRequest(res, 'Resource not found', 'NOT_FOUND');
  }
  // eslint-disable-next-line no-console
  console.error(err);
  return serverError(res);
}
