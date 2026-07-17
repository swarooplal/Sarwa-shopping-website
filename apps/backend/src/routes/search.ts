import { Router } from 'express';
import { prisma } from '@sarwa/prisma';
import { ok } from '../utils/response';
import { authenticate, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/autocomplete', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '');
    if (!q || q.length < 1) return ok(res, { suggestions: [], products: [] });

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { tags: { has: q } },
          ],
        },
        take: 6,
        include: { images: true },
      }),
      prisma.category.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: 5,
      }),
    ]);

    return ok(res, {
      suggestions: categories.map((c) => ({ type: 'category', label: c.name, link: `/shop/${c.slug}` })),
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        offerPrice: p.offerPrice ? Number(p.offerPrice) : null,
        image: p.images[0]?.url ?? null,
      })),
    });
  } catch (e) { return next(e); }
});

router.post('/history', authenticate, async (req: AuthedRequest, res, next) => {
  try {
    const schema = (await import('zod')).z.object({ query: (await import('zod')).z.string().min(1) });
    const { query } = schema.parse(req.body);
    const entry = await prisma.searchHistory.create({
      data: { userId: req.user!.sub, query },
    });
    return ok(res, entry);
  } catch (e) { return next(e); }
});

router.get('/history', authenticate, async (req: AuthedRequest, res, next) => {
  try {
    const items = await prisma.searchHistory.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return ok(res, items);
  } catch (e) { return next(e); }
});

export default router;
