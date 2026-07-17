import { Router } from 'express';
import { CmsPageSchema, CmsPageUpdateSchema, ContactSchema, NewsletterSchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { created, notFound, ok } from '../utils/response';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/pages', async (_req, res, next) => {
  try {
    const items = await prisma.cmsPage.findMany({ where: { isPublished: true } });
    return ok(res, items);
  } catch (e) { return next(e); }
});

router.get('/pages/:slug', async (req, res, next) => {
  try {
    const page = await prisma.cmsPage.findUnique({ where: { slug: String(req.params.slug) } });
    if (!page || !page.isPublished) return notFound(res);
    return ok(res, page);
  } catch (e) { return next(e); }
});

router.put('/pages/admin/:id', authenticate, requireRoles('ADMIN' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const body = CmsPageUpdateSchema.parse(req.body);
    const page = await prisma.cmsPage.update({ where: { id: String(req.params.id) }, data: body });
    return ok(res, page);
  } catch (e) { return next(e); }
});

router.post('/contact', async (req, res, next) => {
  try {
    const body = ContactSchema.parse(req.body);
    const message = await prisma.contactMessage.create({ data: body });
    return created(res, message);
  } catch (e) { return next(e); }
});

router.post('/newsletter', async (req, res, next) => {
  try {
    const body = NewsletterSchema.parse(req.body);
    const sub = await prisma.newsletterSubscriber.upsert({
      where: { email: body.email },
      create: { email: body.email },
      update: { active: true },
    });
    return ok(res, sub);
  } catch (e) { return next(e); }
});

export default router;
