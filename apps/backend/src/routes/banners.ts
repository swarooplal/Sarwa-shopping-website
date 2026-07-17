import { Router } from 'express';
import { BannerSchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { created, noContent, notFound, ok } from '../utils/response';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const where: any = { isActive: true };
    if (req.query.position) where.position = String(req.query.position);
    const now = new Date();
    const items = await prisma.banner.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });
    const filtered = items.filter((b) => {
      if (b.startAt && b.startAt > now) return false;
      if (b.endAt && b.endAt < now) return false;
      return true;
    });
    return ok(res, filtered);
  } catch (e) {
    return next(e);
  }
});

router.post('/', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const body = BannerSchema.parse(req.body);
    const banner = await prisma.banner.create({
      data: {
        ...body,
        startAt: body.startAt ? new Date(body.startAt) : null,
        endAt: body.endAt ? new Date(body.endAt) : null,
      },
    });
    return created(res, banner);
  } catch (e) {
    return next(e);
  }
});

router.put('/:id', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const body = BannerSchema.partial().parse(req.body);
    const banner = await prisma.banner.update({
      where: { id: String(req.params.id) },
      data: {
        ...body,
        startAt: body.startAt ? new Date(body.startAt) : undefined,
        endAt: body.endAt ? new Date(body.endAt) : undefined,
      },
    });
    return ok(res, banner);
  } catch (e) {
    return next(e);
  }
});

router.delete('/:id', authenticate, requireRoles('ADMIN' as any), async (req, res, next) => {
  try {
    const item = await prisma.banner.findUnique({ where: { id: String(req.params.id) } });
    if (!item) return notFound(res);
    await prisma.banner.delete({ where: { id: String(req.params.id) } });
    return noContent(res);
  } catch (e) {
    return next(e);
  }
});

export default router;
