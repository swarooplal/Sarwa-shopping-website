import { Router } from 'express';
import { CouponSchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { created, noContent, notFound, ok } from '../utils/response';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/admin', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any), async (_req, res, next) => {
  try {
    const items = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return ok(res, items);
  } catch (e) { return next(e); }
});

router.post('/admin', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any), async (req, res, next) => {
  try {
    const body = CouponSchema.parse(req.body);
    const coupon = await prisma.coupon.create({
      data: {
        ...body,
        expiry: body.expiry ? new Date(body.expiry) : null,
      },
    });
    return created(res, coupon);
  } catch (e) { return next(e); }
});

router.put('/admin/:id', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any), async (req, res, next) => {
  try {
    const body = CouponSchema.partial().parse(req.body);
    const coupon = await prisma.coupon.update({
      where: { id: String(req.params.id) },
      data: { ...body, expiry: body.expiry ? new Date(body.expiry) : undefined },
    });
    return ok(res, coupon);
  } catch (e) { return next(e); }
});

router.delete('/admin/:id', authenticate, requireRoles('ADMIN' as any), async (req, res, next) => {
  try {
    const exists = await prisma.coupon.findUnique({ where: { id: String(req.params.id) } });
    if (!exists) return notFound(res);
    await prisma.coupon.delete({ where: { id: String(req.params.id) } });
    return noContent(res);
  } catch (e) { return next(e); }
});

export default router;
