import { Router } from 'express';
import { CategorySchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { buildTree, created, noContent, notFound, ok } from '../utils/response';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const items = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    const tree = buildTree(items as any);
    return ok(res, tree);
  } catch (e) {
    return next(e);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const item = await prisma.category.findUnique({ where: { slug: String(req.params.slug) } });
    if (!item) return notFound(res);
    return ok(res, item);
  } catch (e) {
    return next(e);
  }
});

router.post('/', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const body = CategorySchema.parse(req.body);
    const item = await prisma.category.create({ data: body });
    return created(res, item);
  } catch (e) {
    return next(e);
  }
});

router.put('/:id', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const body = CategorySchema.partial().parse(req.body);
    const item = await prisma.category.update({ where: { id: String(req.params.id) }, data: body });
    return ok(res, item);
  } catch (e) {
    return next(e);
  }
});

router.delete('/:id', authenticate, requireRoles('ADMIN' as any), async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: String(req.params.id) } });
    return noContent(res);
  } catch (e) {
    return next(e);
  }
});

export default router;
