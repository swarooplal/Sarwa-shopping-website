import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@sarwa/prisma';
import { created, noContent, ok } from '../utils/response';
import { authenticate, AuthedRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: { user: false },
    });
    return ok(res, items);
  } catch (e) {
    return next(e);
  }
});

router.post('/', async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({ productId: z.string() });
    const { productId } = schema.parse(req.body);
    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user!.sub, productId } },
      create: { userId: req.user!.sub, productId },
      update: {},
    });
    return created(res, item);
  } catch (e) {
    return next(e);
  }
});

router.delete('/:productId', async (req: AuthedRequest, res, next) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.sub, productId: String(req.params.productId) },
    });
    return noContent(res);
  } catch (e) {
    return next(e);
  }
});

export default router;
