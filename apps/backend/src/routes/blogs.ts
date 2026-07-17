import { Router } from 'express';
import { BlogPostSchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { buildMeta, created, noContent, notFound, ok, paginationFromQuery } from '../utils/response';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { page, pageSize, skip } = paginationFromQuery(req.query);
    const where: any = { isPublished: true };
    if (req.query.search) where.title = { contains: String(req.query.search), mode: 'insensitive' };
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({ where, skip, take: pageSize, orderBy: { publishedAt: 'desc' } }),
      prisma.blogPost.count({ where }),
    ]);
    return ok(res, items, buildMeta(total, page, pageSize));
  } catch (e) { return next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: String(req.params.slug) },
      include: { tags: { include: { tag: true } }, comments: { where: { status: 'APPROVED' } }, category: true },
    });
    if (!post || !post.isPublished) return notFound(res);
    return ok(res, post);
  } catch (e) { return next(e); }
});

router.post('/', authenticate, requireRoles('ADMIN' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const body = BlogPostSchema.parse(req.body);
    const post = await prisma.blogPost.create({
      data: {
        ...body,
        publishedAt: body.isPublished ? new Date() : null,
      },
    });
    return created(res, post);
  } catch (e) { return next(e); }
});

router.put('/:id', authenticate, requireRoles('ADMIN' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const body = BlogPostSchema.partial().parse(req.body);
    const post = await prisma.blogPost.update({
      where: { id: String(req.params.id) },
      data: { ...body, publishedAt: body.isPublished ? new Date() : undefined },
    });
    return ok(res, post);
  } catch (e) { return next(e); }
});

router.delete('/:id', authenticate, requireRoles('ADMIN' as any), async (req, res, next) => {
  try {
    const exists = await prisma.blogPost.findUnique({ where: { id: String(req.params.id) } });
    if (!exists) return notFound(res);
    await prisma.blogPost.delete({ where: { id: String(req.params.id) } });
    return noContent(res);
  } catch (e) { return next(e); }
});

router.post('/:id/comments', async (req, res, next) => {
  try {
    const schema = (await import('zod')).z.object({
      name: (await import('zod')).z.string().min(1),
      email: (await import('zod')).z.string().email(),
      content: (await import('zod')).z.string().min(2),
    });
    const body = schema.parse(req.body);
    const comment = await prisma.blogComment.create({
      data: { postId: String(req.params.id), ...body, status: 'PENDING' },
    });
    return created(res, comment);
  } catch (e) { return next(e); }
});

export default router;
