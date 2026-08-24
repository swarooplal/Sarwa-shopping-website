import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { LoginSchema, RegisterSchema, QuickAuthSchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import {
  comparePassword,
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { created, ok, unauthorized, conflict, badRequest } from '../utils/response';
import { authenticate, AuthedRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const body = RegisterSchema.parse(req.body);
    if (!body.email || !body.password) {
      return badRequest(res, 'Email and password are required for signup');
    }
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return conflict(res, 'Email already registered');
    const password = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        role: 'CUSTOMER',
      },
    });
    return created(res, { id: user.id, email: user.email });
  } catch (e) {
    return next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = LoginSchema.parse(req.body);
    if (!body.email) return badRequest(res, 'Email is required');

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) return unauthorized(res, 'Invalid credentials');

    if (body.password) {
      const ok_pw = await comparePassword(body.password, user.password);
      if (!ok_pw) return unauthorized(res, 'Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.header('user-agent') ?? '',
        ip: req.ip,
      },
    });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return ok(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (e) {
    return next(e);
  }
});

// Login by phone OR email (no password required). If the user does not
// exist they are auto-created with a random password and signed in.
// This is the entry point used by the storefront "sign in to continue"
// modal before checkout / add-to-bag.
router.post('/quick', async (req, res, next) => {
  try {
    const body = QuickAuthSchema.parse(req.body);
    const raw = body.identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
    const phoneDigits = raw.replace(/[^0-9]/g, '');
    const isPhone = !isEmail && phoneDigits.length >= 7 && phoneDigits.length <= 15;
    if (!isEmail && !isPhone) {
      return badRequest(res, 'Enter a valid email or phone number');
    }

    let user = isEmail
      ? await prisma.user.findUnique({ where: { email: raw.toLowerCase() } })
      : await prisma.user.findUnique({ where: { phone: phoneDigits } });

    let created = false;
    if (!user) {
      const randomPass = await hashPassword(crypto.randomBytes(24).toString('hex'));
      user = await prisma.user.create({
        data: {
          email: isEmail ? raw.toLowerCase() : `phone_${phoneDigits}@guest.sarwa.in`,
          password: randomPass,
          phone: isPhone ? phoneDigits : null,
          firstName: body.firstName,
          lastName: body.lastName,
          role: 'CUSTOMER',
        },
      });
      created = true;
    }

    if (!user.isActive) return unauthorized(res, 'Account disabled');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.header('user-agent') ?? '',
        ip: req.ip,
      },
    });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return ok(res, {
      accessToken,
      refreshToken,
      created,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (e: any) {
    if (e?.name === 'ZodError') return badRequest(res, 'Invalid input');
    if (e?.code === 'P2002') return conflict(res, 'Account already exists with this detail');
    return next(e);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const schema = z.object({ refreshToken: z.string() });
    const { refreshToken } = schema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return unauthorized(res, 'Refresh token invalid');
    }
    const access = signAccessToken({ sub: payload.sub, email: payload.email, role: payload.role });
    return ok(res, { accessToken: access });
  } catch {
    return unauthorized(res, 'Invalid refresh');
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const schema = z.object({ refreshToken: z.string().optional() });
    const { refreshToken } = schema.parse(req.body ?? {});
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return ok(res, { loggedOut: true });
  } catch (e) {
    return next(e);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email() });
    const { email } = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return ok(res, { sent: true });
    // In production: email a token; here we return a stub.
    return ok(res, { sent: true, message: 'Reset link sent if account exists.' });
  } catch (e) {
    return next(e);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const schema = z.object({ token: z.string(), password: z.string().min(8) });
    const { password } = schema.parse(req.body);
    // Token verification happens against passwordReset table in production.
    const hashed = await hashPassword(password);
    return ok(res, { updated: !!hashed });
  } catch (e) {
    return badRequest(res, 'Invalid token');
  }
});

router.get('/me', authenticate, async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
    if (!user) return unauthorized(res);
    return ok(res, user);
  } catch (e) {
    return next(e);
  }
});

export default router;
