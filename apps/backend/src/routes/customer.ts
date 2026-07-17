import { Router } from 'express';
import { z } from 'zod';
import { AddressSchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { created, noContent, notFound, ok } from '../utils/response';
import { authenticate, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/profile', async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true },
    });
    return ok(res, user);
  } catch (e) { return next(e); }
});

router.patch('/profile', async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.user!.sub }, data: body });
    return ok(res, { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone });
  } catch (e) { return next(e); }
});

router.get('/addresses', async (req: AuthedRequest, res, next) => {
  try {
    const items = await prisma.address.findMany({ where: { userId: req.user!.sub }, orderBy: { createdAt: 'desc' } });
    return ok(res, items);
  } catch (e) { return next(e); }
});

router.post('/addresses', async (req: AuthedRequest, res, next) => {
  try {
    const body = AddressSchema.parse(req.body);
    const address = await prisma.address.create({
      data: { ...body, userId: req.user!.sub },
    });
    return created(res, address);
  } catch (e) { return next(e); }
});

router.put('/addresses/:id', async (req: AuthedRequest, res, next) => {
  try {
    const body = AddressSchema.partial().parse(req.body);
    const existing = await prisma.address.findFirst({ where: { id: String(req.params.id), userId: req.user!.sub } });
    if (!existing) return notFound(res);
    const address = await prisma.address.update({ where: { id: existing.id }, data: body });
    return ok(res, address);
  } catch (e) { return next(e); }
});

router.delete('/addresses/:id', async (req: AuthedRequest, res, next) => {
  try {
    const existing = await prisma.address.findFirst({ where: { id: String(req.params.id), userId: req.user!.sub } });
    if (!existing) return notFound(res);
    await prisma.address.delete({ where: { id: existing.id } });
    return noContent(res);
  } catch (e) { return next(e); }
});

router.get('/orders', async (req: AuthedRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      include: { items: true, timeline: true },
    });
    return ok(res, orders);
  } catch (e) { return next(e); }
});

router.get('/wishlist', async (req: AuthedRequest, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({ where: { userId: req.user!.sub } });
    return ok(res, items);
  } catch (e) { return next(e); }
});

router.get('/coupons', async (req: AuthedRequest, res, next) => {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: { active: true, OR: [{ expiry: null }, { expiry: { gt: now } }] },
    });
    return ok(res, coupons);
  } catch (e) { return next(e); }
});

export default router;
