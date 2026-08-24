import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { LoginSchema, RegisterSchema, QuickAuthSchema, OtpRequestSchema, OtpVerifySchema } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { config } from '../config';
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
import { requestOtp, verifyOtp } from '../services/otp';

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

// ─── Phone OTP ──────────────────────────────────────────────────────

router.post('/otp/request', async (req, res, next) => {
  try {
    const body = OtpRequestSchema.parse(req.body);
    const phone = body.phone.replace(/[^0-9]/g, '');
    if (phone.length < 7 || phone.length > 15) return badRequest(res, 'Invalid phone number');
    const code = requestOtp(phone, body.channel);
    return ok(res, {
      sent: true,
      channel: body.channel,
      // Dev mode surfaces the code so the developer can read it from the
      // backend console. In production remove this field.
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    });
  } catch (e: any) {
    if (e?.name === 'ZodError') return badRequest(res, 'Invalid input');
    return next(e);
  }
});

router.post('/otp/verify', async (req, res, next) => {
  try {
    const body = OtpVerifySchema.parse(req.body);
    const phone = body.phone.replace(/[^0-9]/g, '');
    const okOtp = verifyOtp(phone, body.code, body.channel);
    if (!okOtp) return unauthorized(res, 'Invalid or expired OTP');

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      const randomPass = await hashPassword(crypto.randomBytes(24).toString('hex'));
      user = await prisma.user.create({
        data: {
          email: `phone_${phone}@guest.sarwa.in`,
          password: randomPass,
          phone,
          role: 'CUSTOMER',
        },
      });
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
      created: true,
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
    return next(e);
  }
});

// ─── Google OAuth ────────────────────────────────────────────────────

router.get('/google', (req, res) => {
  if (!config.google.clientId) {
    return res.status(503).json({
      data: null,
      meta: null,
      error: {
        code: 'GOOGLE_NOT_CONFIGURED',
        message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the backend .env to enable Google sign-in.',
      },
    });
  }
  const state = crypto.randomBytes(16).toString('hex');
  const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : '/account';
  res.cookie('sarwa_oauth_state', `${state}|${encodeURIComponent(returnTo)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000,
  });
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get('/google/callback', async (req, res, next) => {
  try {
    if (!config.google.clientId || !config.google.clientSecret) {
      return res.status(503).send('Google OAuth not configured on server.');
    }
    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    const cookieState = (req as any).cookies?.sarwa_oauth_state || '';
    if (!code || !state || !cookieState.startsWith(state)) {
      return res.status(400).send('Invalid OAuth state.');
    }
    const returnTo = decodeURIComponent(cookieState.split('|')[1] || '/account');
    res.clearCookie('sarwa_oauth_state');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });
    const tokenJson: any = await tokenRes.json();
    if (!tokenJson.access_token) {
      return res.status(400).send('Failed to exchange OAuth code.');
    }
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const profile: any = await profileRes.json();
    if (!profile.email) return res.status(400).send('Google profile missing email.');

    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      const randomPass = await hashPassword(crypto.randomBytes(24).toString('hex'));
      user = await prisma.user.create({
        data: {
          email: profile.email,
          password: randomPass,
          firstName: profile.given_name ?? profile.name?.split(' ')?.[0],
          lastName: profile.family_name ?? profile.name?.split(' ')?.slice(1).join(' '),
          avatar: profile.picture,
          emailVerified: profile.verified_email ?? false,
          role: 'CUSTOMER',
        },
      });
    } else if (!user.avatar && profile.picture) {
      await prisma.user.update({ where: { id: user.id }, data: { avatar: profile.picture } });
    }
    if (!user.isActive) return res.status(403).send('Account disabled.');

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

    // Hand the tokens back to the frontend via URL fragment so JS can
    // grab them and persist in localStorage. The fragment is never sent
    // to servers, so this is safe.
    const frontendOrigin = (config.corsOrigin[0] || 'http://localhost:3000').replace(/\/$/, '');
    const target = new URL(returnTo, frontendOrigin).toString();
    const sep = target.includes('#') ? '&' : '#';
    const finalUrl = `${target}${sep}access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`;
    return res.redirect(finalUrl);
  } catch (e) {
    return next(e);
  }
});

export default router;
