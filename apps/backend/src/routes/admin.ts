import { Router } from 'express';
import { prisma } from '@sarwa/prisma';
import { ok, buildMeta, paginationFromQuery } from '../utils/response';
import { authenticate, AuthedRequest, requireRoles } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any, 'STAFF' as any));

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [orders, customers, products, paidOrders, revenueAgg] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.total ?? 0);
    const conversionRate = customers > 0 ? (orders / customers) * 100 : 0;

    const productSales = new Map<string, { sold: number; revenue: number; name: string }>();
    for (const o of paidOrders) {
      for (const i of o.items) {
        const existing = productSales.get(i.productId ?? '') ?? { sold: 0, revenue: 0, name: i.name };
        existing.sold += i.quantity;
        existing.revenue += Number(i.total);
        existing.name = i.name;
        productSales.set(i.productId ?? '', existing);
      }
    }
    const topProducts = Array.from(productSales.entries())
      .map(([id, v]) => ({ productId: id, name: v.name, sold: v.sold, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Build last 14-day sales series
    const days: { date: string; amount: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const sum = await prisma.order.aggregate({
        where: { createdAt: { gte: d, lt: next }, paymentStatus: 'PAID' },
        _sum: { total: true },
      });
      days.push({ date: d.toISOString().slice(0, 10), amount: Number(sum._sum.total ?? 0) });
    }

    return ok(res, {
      revenue: totalRevenue,
      orders,
      customers,
      products,
      conversionRate: Number(conversionRate.toFixed(2)),
      visitors: 0,
      topProducts,
      salesSeries: days,
    });
  } catch (e) { return next(e); }
});

router.get('/customers', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = paginationFromQuery(req.query);
    const where: any = { role: 'CUSTOMER' };
    if (req.query.search) where.email = { contains: String(req.query.search), mode: 'insensitive' };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { orders: true, _count: { select: { orders: true, wishlist: true } } },
      }),
      prisma.user.count({ where }),
    ]);
    return ok(res, items.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      isActive: u.isActive,
      createdAt: u.createdAt,
      orderCount: (u as any)._count?.orders ?? 0,
      totalSpent: u.orders.reduce((s, o) => s + Number(o.total), 0),
    })), buildMeta(total, page, pageSize));
  } catch (e) { return next(e); }
});

router.get('/low-stock', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      orderBy: { stock: 'asc' },
      take: 50,
    });
    return ok(res, products);
  } catch (e) { return next(e); }
});

router.post('/inventory/bulk-update', async (req, res, next) => {
  try {
    const schema = (await import('zod')).z.object({
      updates: (await import('zod')).z.array(
        (await import('zod')).z.object({
          productId: (await import('zod')).z.string(),
          stock: (await import('zod')).z.number().int().min(0),
        })
      ),
    });
    const { updates } = schema.parse(req.body);
    await Promise.all(
      updates.map((u) =>
        prisma.product.update({ where: { id: u.productId }, data: { stock: u.stock } })
      )
    );
    return ok(res, { updated: updates.length });
  } catch (e) { return next(e); }
});

router.get('/users', requireRoles('ADMIN' as any), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, users);
  } catch (e) { return next(e); }
});

router.patch('/users/:id/role', requireRoles('ADMIN' as any), async (req, res, next) => {
  try {
    const schema = (await import('zod')).z.object({ role: (await import('zod')).z.enum(['ADMIN', 'MANAGER', 'EDITOR', 'STAFF', 'CUSTOMER']) });
    const { role } = schema.parse(req.body);
    const user = await prisma.user.update({ where: { id: String(req.params.id) }, data: { role } });
    return ok(res, { id: user.id, role: user.role });
  } catch (e) { return next(e); }
});

router.get('/messages', async (_req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    return ok(res, messages);
  } catch (e) { return next(e); }
});

export default router;
