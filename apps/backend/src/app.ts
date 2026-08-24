import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { config } from './config';
import { errorHandler } from './middleware/error';
import { ensureCsrf } from './middleware/csrf';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import collectionRoutes from './routes/collections';
import menuRoutes from './routes/menus';
import bannerRoutes from './routes/banners';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import orderRoutes from './routes/orders';
import customerRoutes from './routes/customer';
import reviewRoutes from './routes/reviews';
import couponRoutes from './routes/coupons';
import blogRoutes from './routes/blogs';
import cmsRoutes from './routes/cms';
import adminRoutes from './routes/admin';
import searchRoutes from './routes/search';
import uploadRoutes from './routes/uploads';
import seoRoutes from './routes/seo';
import paymentRoutes from './routes/payments';

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.use('/uploads', express.static(path.resolve(process.cwd(), config.uploadDir)));

  // Global rate limit
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 200,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
    })
  );

  // CSRF (skipped for GET/HEAD and for cookie-less first request)
  app.use(ensureCsrf);

  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', service: 'sarwa-api', version: '1.0.0' })
  );

  const api = '/api/v1';
  app.use(`${api}/auth`, authRoutes);
  app.use(`${api}/products`, productRoutes);
  app.use(`${api}/categories`, categoryRoutes);
  app.use(`${api}/collections`, collectionRoutes);
  app.use(`${api}/menus`, menuRoutes);
  app.use(`${api}/banners`, bannerRoutes);
  app.use(`${api}/cart`, cartRoutes);
  app.use(`${api}/wishlist`, wishlistRoutes);
  app.use(`${api}/orders`, orderRoutes);
  app.use(`${api}/customer`, customerRoutes);
  app.use(`${api}/reviews`, reviewRoutes);
  app.use(`${api}/coupons`, couponRoutes);
  app.use(`${api}/blogs`, blogRoutes);
  app.use(`${api}/cms`, cmsRoutes);
  app.use(`${api}/admin`, adminRoutes);
  app.use(`${api}/search`, searchRoutes);
  app.use(`${api}/uploads`, uploadRoutes);
  app.use(`${api}/seo`, seoRoutes);
  app.use(`${api}/payments`, paymentRoutes);

  app.use(errorHandler);
  return app;
}
