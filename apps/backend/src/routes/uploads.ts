import { Router } from 'express';
import multer from 'multer';
import { prisma } from '@sarwa/prisma';
import { authenticate, requireRoles } from '../middleware/auth';
import { created, ok } from '../utils/response';
import { saveLocal } from '../utils/storage';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return ok(res, { uploaded: false });
    const result = await saveLocal(req.file);
    const media = await prisma.media.create({
      data: {
        url: result.url,
        filename: result.filename,
        mimeType: result.mimeType,
        size: result.size,
        bucket: 'local',
        key: result.filename,
      },
    });
    return created(res, media);
  } catch (e) { return next(e); }
});

router.post('/multiple', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), upload.array('files', 10), async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const results = await Promise.all(files.map(saveLocal));
    await prisma.media.createMany({
      data: results.map((r) => ({
        url: r.url,
        filename: r.filename,
        mimeType: r.mimeType,
        size: r.size,
        bucket: 'local',
        key: r.filename,
      })),
    });
    return created(res, results);
  } catch (e) { return next(e); }
});

router.get('/', authenticate, requireRoles('ADMIN' as any, 'MANAGER' as any, 'EDITOR' as any), async (req, res, next) => {
  try {
    const items = await prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return ok(res, items);
  } catch (e) { return next(e); }
});

export default router;
