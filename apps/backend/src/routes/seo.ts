import { Router } from 'express';

const router = Router();

router.get('/sitemap.xml', async (_req, res, next) => {
  try {
    const base = process.env.PUBLIC_URL || 'http://localhost:3000';
    const urls = ['', 'shop', 'collections', 'about', 'contact', 'blog', 'faq'];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${base}/${u}</loc><changefreq>daily</changefreq></url>`)
  .join('\n')}
</urlset>`;
    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (e) { return next(e); }
});

router.get('/robots.txt', async (_req, res, next) => {
  try {
    const base = process.env.PUBLIC_URL || 'http://localhost:3000';
    const body = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${base}/api/v1/seo/sitemap.xml`;
    res.header('Content-Type', 'text/plain');
    return res.send(body);
  } catch (e) { return next(e); }
});

export default router;
