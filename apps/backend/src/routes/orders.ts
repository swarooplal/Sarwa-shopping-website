import { Router } from 'express';
import { z } from 'zod';
import { generateOrderNumber } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { badRequest, buildMeta, created, notFound, ok, paginationFromQuery } from '../utils/response';
import { authenticate, AuthedRequest, optionalAuth, requireRoles } from '../middleware/auth';
import { serializeOrder } from '../utils/serialize';

const router = Router();

router.post('/checkout', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      cartId: z.string(),
      shippingAddress: z.object({
        fullName: z.string(),
        phone: z.string(),
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        pincode: z.string(),
        country: z.string().default('India'),
      }),
      paymentMethod: z.enum(['RAZORPAY', 'STRIPE', 'COD']),
      notes: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const cart = await prisma.cart.findUnique({ where: { id: body.cartId }, include: { items: true } });
    if (!cart || cart.items.length === 0) return badRequest(res, 'Cart is empty');

    const productIds = cart.items.map((i) => i.productId).filter(Boolean) as string[];
    const products = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            sku: true,
            images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
          },
        })
      : [];
    const productById = new Map(products.map((p) => [p.id, p]));

    const orderNumber = generateOrderNumber();
    const userId = req.user?.sub ?? null;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        guestEmail: userId ? null : body.email,
        userId,
        subtotal: cart.subtotal,
        discount: cart.discount,
        shipping: cart.shipping,
        tax: cart.tax,
        total: cart.total,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
        items: {
          create: cart.items.map((i) => {
            const product = i.productId ? productById.get(i.productId) : null;
            return {
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
              size: i.size,
              unitPrice: i.unitPrice,
              total: Number(i.unitPrice) * i.quantity,
              name: product?.name ?? 'Item',
              sku: product?.sku ?? null,
              image: product?.images?.[0]?.url ?? null,
            };
          }),
        },
        timeline: {
          create: [{ status: 'PENDING', note: 'Order placed' }],
        },
      },
      include: { items: true, timeline: true },
    });

    if (cart.couponCode) {
      await prisma.couponRedemption.create({
        data: {
          couponId: (await prisma.coupon.findUnique({ where: { code: cart.couponCode } }))!.id,
          userId: userId ?? 'guest',
          orderId: order.id,
        },
      });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, couponCode: null },
    });

    return created(res, serializeOrder(order));
  } catch (e) {
    return next(e);
  }
});

router.get('/admin', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'STAFF' as any), async (req, res, next) => {
  try {
    const { page, pageSize, skip } = paginationFromQuery(req.query);
    const where: any = {};
    if (req.query.status) where.status = String(req.query.status);
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { items: true, user: true, timeline: true },
      }),
      prisma.order.count({ where }),
    ]);
    return ok(res, items, buildMeta(total, page, pageSize));
  } catch (e) {
    return next(e);
  }
});

router.get('/customer', authenticate, async (req: AuthedRequest, res, next) => {
  try {
    const items = await prisma.order.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      include: { items: true, timeline: true },
    });
    return ok(res, items);
  } catch (e) {
    return next(e);
  }
});

router.get('/:orderNumber', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: String(req.params.orderNumber) },
      include: {
        items: true,
        timeline: { orderBy: { at: 'asc' } },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
        shippingAddress: true,
      },
    });
    if (!order) return notFound(res);
    return ok(res, order);
  } catch (e) {
    return next(e);
  }
});

router.get('/admin/:orderNumber', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'STAFF' as any), async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: String(req.params.orderNumber) },
      include: {
        items: true,
        timeline: { orderBy: { at: 'asc' } },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
        shippingAddress: true,
      },
    });
    if (!order) return notFound(res);
    return ok(res, order);
  } catch (e) {
    return next(e);
  }
});

router.patch('/admin/:id/status', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'STAFF' as any), async (req, res, next) => {
  try {
    const schema = z.object({ status: z.string(), note: z.string().optional() });
    const { status, note } = schema.parse(req.body);
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { status: status as any },
    });
    await prisma.orderTimeline.create({
      data: { orderId: order.id, status, note },
    });
    return ok(res, order);
  } catch (e) {
    return next(e);
  }
});

router.post('/:orderNumber/cancel', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { orderNumber: String(req.params.orderNumber) } });
    if (!order) return notFound(res);
    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      return badRequest(res, 'Order cannot be cancelled at this stage');
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });
    await prisma.orderTimeline.create({ data: { orderId: order.id, status: 'CANCELLED', note: 'Cancelled' } });
    return ok(res, updated);
  } catch (e) {
    return next(e);
  }
});

router.post('/:orderNumber/refund', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any), async (req, res, next) => {
  try {
    const schema = z.object({ amount: z.number().positive(), reason: z.string().optional() });
    const { amount, reason } = schema.parse(req.body);
    const order = await prisma.order.findUnique({ where: { orderNumber: String(req.params.orderNumber) } });
    if (!order) return notFound(res);
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
    });
    await prisma.orderTimeline.create({
      data: { orderId: order.id, status: 'REFUNDED', note: `Refunded ₹${amount} ${reason ?? ''}` },
    });
    return ok(res, updated);
  } catch (e) {
    return next(e);
  }
});

export default router;
