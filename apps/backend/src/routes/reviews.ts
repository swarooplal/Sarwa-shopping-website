import { Router } from 'express';
import { ReviewSchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { created, ok } from '../utils/response';
import { authenticate, AuthedRequest, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const where: any = { status: 'APPROVED' };
    if (req.query.productId) where.productId = String(req.query.productId);
    const items = await prisma.review.findMany({ where, orderBy: { createdAt: 'desc' } });
    return ok(res, items);
  } catch (e) { return next(e); }
});

router.post('/', authenticate, async (req: AuthedRequest, res, next) => {
  try {
    const body = ReviewSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    const review = await prisma.review.create({
      data: {
        productId: body.productId,
        userId: req.user!.sub,
        userName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.email || 'Customer',
        rating: body.rating,
        title: body.title,
        comment: body.comment,
        status: 'PENDING',
      },
    });
    return created(res, review);
  } catch (e) { return next(e); }
});

router.get('/admin', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'STAFF' as any), async (req, res, next) => {
  try {
    const items = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
    return ok(res, items);
  } catch (e) { return next(e); }
});

router.patch('/admin/:id', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'STAFF' as any), async (req, res, next) => {
  try {
    const schema = (await import('zod')).z.object({
      status: (await import('zod')).z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
      reply: (await import('zod')).z.string().optional(),
    });
    const body = schema.parse(req.body);
    const review = await prisma.review.update({ where: { id: String(req.params.id) }, data: body });
    return ok(res, review);
  } catch (e) { return next(e); }
});

export default router;
