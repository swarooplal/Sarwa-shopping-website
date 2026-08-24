import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import {
  comparePassword,
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { created, ok, unauthorized, conflict, badRequest, notFound } from '../utils/response';
import { authenticate, AuthedRequest } from '../middleware/auth';

const router = Router();

function issueTokensForUser(user: { id: string; email: string; role: string }) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) };
}

async function persistRefreshToken(userId: string, refreshToken: string, req: any) {
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.header('user-agent') ?? '',
      ip: req.ip,
    },
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const body = RegisterSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return conflict(res, 'An account with this email already exists');
    const password = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password,
        firstName: body.firstName,
        lastName: body.lastName,
        role: 'CUSTOMER',
      },
    });
    const { accessToken, refreshToken } = issueTokensForUser(user);
    await persistRefreshToken(user.id, refreshToken, req);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return created(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (e: any) {
    if (e?.name === 'ZodError') return badRequest(res, 'Invalid input');
    return next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) return unauthorized(res, 'Invalid email or password');
    const ok_pw = await comparePassword(body.password, user.password);
    if (!ok_pw) return unauthorized(res, 'Invalid email or password');
    const { accessToken, refreshToken } = issueTokensForUser(user);
    await persistRefreshToken(user.id, refreshToken, req);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return ok(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (e: any) {
    if (e?.name === 'ZodError') return badRequest(res, 'Invalid email or password');
    return next(e);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const schema = z.object({ refreshToken: z.string() });
    const { refreshToken } = schema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findFirst({ where: { tokenHash: hashToken(refreshToken) } });
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

// ─── Forgot / reset password ────────────────────────────────────────

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

router.post('/forgot-password', async (req, res, next) => {
  try {
    const body = ForgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      // Don't reveal whether the email is registered.
      return ok(res, { sent: true });
    }
    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await prisma.passwordReset.create({
      data: { userId: user.id, email: body.email, tokenHash, expiresAt },
    });
    // In production this would email a link like:
    //   ${frontendOrigin}/account/reset?token=${rawToken}
    // In dev we return the token so the developer can complete the flow.
    return ok(res, {
      sent: true,
      ...(process.env.NODE_ENV !== 'production' ? { devResetToken: rawToken } : {}),
    });
  } catch (e: any) {
    if (e?.name === 'ZodError') return badRequest(res, 'Invalid email');
    return next(e);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const body = ResetPasswordSchema.parse(req.body);
    const tokenHash = hashToken(body.token);
    const record = await prisma.passwordReset.findUnique({ where: { tokenHash } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return badRequest(res, 'This reset link is invalid or has expired.');
    }
    const hashed = await hashPassword(body.password);
    const userId = record.userId ?? (await prisma.user.findUnique({ where: { email: record.email } }))?.id;
    if (!userId) return badRequest(res, 'This reset link is invalid.');
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { password: hashed } }),
      prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
    return ok(res, { updated: true });
  } catch (e: any) {
    if (e?.name === 'ZodError') return badRequest(res, 'Invalid input');
    return next(e);
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

// ─── Email existence check (used by the checkout-time registration
// gate: if the entered email already has an account we prompt to log in
// instead of letting them register again).

router.get('/check-email', async (req, res, next) => {
  try {
    const email = String(req.query.email || '').toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest(res, 'Invalid email');
    }
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    return ok(res, { exists: !!user });
  } catch (e) {
    return next(e);
  }
});

export default router;