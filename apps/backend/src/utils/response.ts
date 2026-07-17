import { Response } from 'express';
import { buildTree } from '@sarwa/shared';

export { buildTree };

export interface ApiMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export function ok<T>(res: Response, data: T, meta?: ApiMeta): Response {
  return res.json({ data, meta, error: null });
}

export function created<T>(res: Response, data: T): Response {
  return res.status(201).json({ data, meta: null, error: null });
}

export function noContent(res: Response): Response {
  return res.status(204).end();
}

export function badRequest(res: Response, message: string, code = 'BAD_REQUEST'): Response {
  return res.status(400).json({ data: null, meta: null, error: { code, message } });
}

export function unauthorized(res: Response, message = 'Unauthorized'): Response {
  return res.status(401).json({ data: null, meta: null, error: { code: 'UNAUTHORIZED', message } });
}

export function forbidden(res: Response, message = 'Forbidden'): Response {
  return res.status(403).json({ data: null, meta: null, error: { code: 'FORBIDDEN', message } });
}

export function notFound(res: Response, message = 'Not found'): Response {
  return res.status(404).json({ data: null, meta: null, error: { code: 'NOT_FOUND', message } });
}

export function conflict(res: Response, message: string): Response {
  return res.status(409).json({ data: null, meta: null, error: { code: 'CONFLICT', message } });
}

export function serverError(res: Response, message = 'Internal server error'): Response {
  return res.status(500).json({ data: null, meta: null, error: { code: 'SERVER_ERROR', message } });
}

export function paginationFromQuery(query: any) {
  const page = Math.max(parseInt(query.page as string) || 1, 1);
  const pageSize = Math.min(parseInt(query.pageSize as string) || 20, 100);
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

export function buildMeta(total: number, page: number, pageSize: number) {
  return { total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
