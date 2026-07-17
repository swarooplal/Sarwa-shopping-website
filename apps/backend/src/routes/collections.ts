import { Router } from 'express';
import { prisma } from '@sarwa/prisma';
import { created, ok } from '../utils/response';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const items = await prisma.collection.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return ok(res, items);
  } catch (e) {
    return next(e);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const item = await prisma.collection.findUnique({
      where: { slug: String(req.params.slug) },
      include: { products: { include: { product: { include: { images: true } } } } },
    });
    return ok(res, item);
  } catch (e) {
    return next(e);
  }
});

router.post('/', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const item = await prisma.collection.create({ data: req.body });
    return created(res, item);
  } catch (e) {
    return next(e);
  }
});

router.put('/:id', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const item = await prisma.collection.update({ where: { id: String(req.params.id) }, data: req.body });
    return ok(res, item);
  } catch (e) {
    return next(e);
  }
});

router.delete('/:id', authenticate, requireRoles('ADMIN' as any), async (req, res, next) => {
  try {
    await prisma.collection.delete({ where: { id: String(req.params.id) } });
    return ok(res, { deleted: true });
  } catch (e) {
    return next(e);
  }
});

export default router;
