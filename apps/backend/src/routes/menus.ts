import { Router } from 'express';
import { MenuSchema, MenuReorderSchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { buildTree, created, noContent, notFound, ok } from '../utils/response';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

async function loadFlat() {
  return prisma.menuItem.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      products: {
        include: { product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } } },
      },
    },
  });
}

function serialize(item: any) {
  return {
    id: item.id,
    label: item.label,
    link: item.link,
    icon: item.icon,
    parentId: item.parentId,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    categorySlug: item.categorySlug,
    products: item.products?.map((p: any) => p.product) ?? [],
  };
}

router.get('/', async (_req, res, next) => {
  try {
    const flat = await loadFlat();
    const tree = buildTree(flat.map(serialize));
    return ok(res, tree);
  } catch (e) {
    return next(e);
  }
});

router.post(
  '/',
  authenticate,
  requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any),
  async (req, res, next) => {
    try {
      const body = MenuSchema.parse(req.body);
      const item = await prisma.menuItem.create({
        data: {
          label: body.label,
          link: body.link ?? null,
          icon: body.icon ?? null,
          parentId: body.parentId ?? null,
          sortOrder: body.sortOrder,
          isActive: body.isActive,
          categorySlug: body.categorySlug ?? null,
        },
      });
      if (body.productIds?.length) {
        await prisma.menuItemProduct.createMany({
          data: body.productIds.map((productId) => ({ menuItemId: item.id, productId })),
        });
      }
      return created(res, item);
    } catch (e) {
      return next(e);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any),
  async (req, res, next) => {
    try {
      const body = MenuSchema.partial().parse(req.body);
      const item = await prisma.menuItem.update({
        where: { id: String(req.params.id) },
        data: {
          label: body.label ?? undefined,
          link: body.link ?? undefined,
          icon: body.icon ?? undefined,
          parentId: body.parentId ?? undefined,
          sortOrder: body.sortOrder ?? undefined,
          isActive: body.isActive ?? undefined,
          categorySlug: body.categorySlug ?? undefined,
        },
      });
      return ok(res, item);
    } catch (e) {
      return next(e);
    }
  }
);

router.put(
  '/reorder/bulk',
  authenticate,
  requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any),
  async (req, res, next) => {
    try {
      const items = MenuReorderSchema.parse(req.body);
      await Promise.all(
        items.map((i) =>
          prisma.menuItem.update({
            where: { id: i.id },
            data: { parentId: i.parentId ?? null, sortOrder: i.sortOrder },
          })
        )
      );
      return ok(res, { updated: items.length });
    } catch (e) {
      return next(e);
    }
  }
);

router.delete('/:id', authenticate, requireRoles('ADMIN' as any), async (req, res, next) => {
  try {
    const existing = await prisma.menuItem.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) return notFound(res);
    await prisma.menuItem.delete({ where: { id: String(req.params.id) } });
    return noContent(res);
  } catch (e) {
    return next(e);
  }
});

export default router;
