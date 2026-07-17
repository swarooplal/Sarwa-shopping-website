import { Router } from 'express';
import { ProductSchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { buildMeta, buildTree, created, noContent, notFound, ok, paginationFromQuery } from '../utils/response';
import { authenticate, optionalAuth, requireRoles } from '../middleware/auth';
import { serializeProduct } from '../utils/serialize';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = paginationFromQuery(req.query);
    const where: any = { isActive: true };
    if (req.query.search) {
      where.OR = [
        { name: { contains: String(req.query.search) } },
        { description: { contains: String(req.query.search) } },
      ];
    }
    if (req.query.featured === 'true') where.isFeatured = true;
    if (req.query.trending === 'true') where.isTrending = true;
    if (req.query.new === 'true') where.isNewArrival = true;
    if (req.query.bestSeller === 'true') where.isBestSeller = true;
    if (req.query.category) {
      where.categories = { some: { category: { slug: String(req.query.category) } } };
    }
    if (req.query.collection) {
      where.collections = { some: { collection: { slug: String(req.query.collection) } } };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price.gte = Number(req.query.minPrice);
      if (req.query.maxPrice) where.price.lte = Number(req.query.maxPrice);
    }

    const orderBy: any = (() => {
      switch (req.query.sortBy) {
        case 'price-asc': return { price: 'asc' };
        case 'price-desc': return { price: 'desc' };
        case 'newest': return { createdAt: 'desc' };
        default: return { createdAt: 'desc' };
      }
    })();

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: { images: true, variants: true, categories: { include: { category: true } }, collections: { include: { collection: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return ok(res, items.map(serializeProduct), buildMeta(total, page, pageSize));
  } catch (e) {
    return next(e);
  }
});

router.get('/featured', async (_req, res, next) => {
  try {
    const items = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      include: { images: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, items.map(serializeProduct));
  } catch (e) { return next(e); }
});

router.get('/new-arrivals', async (_req, res, next) => {
  try {
    const items = await prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: 12,
      include: { images: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, items.map(serializeProduct));
  } catch (e) { return next(e); }
});

router.get('/trending', async (_req, res, next) => {
  try {
    const items = await prisma.product.findMany({
      where: { isActive: true, isTrending: true },
      take: 12,
      include: { images: true, variants: true },
    });
    return ok(res, items.map(serializeProduct));
  } catch (e) { return next(e); }
});

router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const p = await prisma.product.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        categories: { include: { category: true } },
        collections: { include: { collection: true } },
      },
    });
    if (!p || !p.isActive) return notFound(res);
    return ok(res, serializeProduct(p));
  } catch (e) { return next(e); }
});

router.get('/:id/related', async (req, res, next) => {
  try {
    const relations = await prisma.productRelation.findMany({
      where: { fromId: String(req.params.id), type: 'RELATED' },
      include: { relatedProduct: { include: { images: true } } },
    });
    return ok(res, relations.map((r) => serializeProduct(r.relatedProduct)));
  } catch (e) { return next(e); }
});

router.post('/', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const body = ProductSchema.parse(req.body);
    const imageUrls: string[] = Array.isArray(req.body?.imageUrls) ? req.body.imageUrls : [];
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        shortDescription: body.shortDescription,
        description: body.description,
        price: body.price,
        offerPrice: body.offerPrice ?? null,
        stock: body.stock,
        brand: body.brand,
        fabric: body.fabric,
        occasion: body.occasion,
        color: body.color,
        weight: body.weight,
        tagsJson: JSON.stringify(body.tags ?? []),
        metaKeywordsJson: JSON.stringify(body.metaKeywords ?? []),
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        isFeatured: body.isFeatured,
        isTrending: body.isTrending,
        isNewArrival: body.isNewArrival,
        isBestSeller: body.isBestSeller,
        isActive: body.isActive ?? true,
        images: { create: imageUrls.map((url, i) => ({ url, sortOrder: i })) },
        categories: body.categoryIds?.length
          ? { create: body.categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
        collections: body.collectionIds?.length
          ? { create: body.collectionIds.map((collectionId) => ({ collectionId })) }
          : undefined,
        variants: body.variants?.length
          ? { create: body.variants }
          : undefined,
      },
    });
    return created(res, serializeProduct(product));
  } catch (e) { return next(e); }
});

router.put('/:id', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const body = ProductSchema.partial().parse(req.body);
    const data: any = { ...body };
    if (body.tags) data.tagsJson = JSON.stringify(body.tags);
    if (body.metaKeywords) data.metaKeywordsJson = JSON.stringify(body.metaKeywords);
    delete data.tags;
    delete data.metaKeywords;
    if (Array.isArray(req.body?.imageUrls)) {
      data.images = {
        create: req.body.imageUrls.map((url: string, i: number) => ({ url, sortOrder: i })),
      };
    }
    const product = await prisma.product.update({ where: { id: String(req.params.id) }, data });
    return ok(res, serializeProduct(product));
  } catch (e) { return next(e); }
});

router.post('/:id/duplicate', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any), async (req, res, next) => {
  try {
    const source = await prisma.product.findUnique({ where: { id: String(req.params.id) }, include: { images: true, variants: true } });
    if (!source) return notFound(res);
    const copy = await prisma.product.create({
      data: {
        name: `${source.name} (Copy)`,
        slug: `${source.slug}-copy-${Date.now()}`,
        sku: `${source.sku}-COPY`,
        description: source.description,
        shortDescription: source.shortDescription,
        price: source.price,
        offerPrice: source.offerPrice,
        stock: 0,
        fabric: source.fabric,
        occasion: source.occasion,
        color: source.color,
        tagsJson: source.tagsJson,
        isActive: false,
      },
    });
    return created(res, serializeProduct(copy));
  } catch (e) { return next(e); }
});

router.delete('/:id', authenticate, requireRoles('ADMIN' as any), async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    return noContent(res);
  } catch (e) { return next(e); }
});

export default router;
