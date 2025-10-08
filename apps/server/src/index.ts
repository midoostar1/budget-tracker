import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import axios from 'axios';
import * as admin from 'firebase-admin';
import appleSignin from 'apple-signin-auth';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin === '*' ? true : [allowedOrigin],
    credentials: true,
  })
);

// Firebase Admin init for verifying Google(Firebase) tokens
let firebaseInitialized = false;
if (!firebaseInitialized) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    firebaseInitialized = true;
  } else {
    console.warn('Firebase Admin is not fully configured. Google verification will fail until configured.');
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '30', 10);
const COOKIE_SECURE = (process.env.COOKIE_SECURE || 'false') === 'true';
const APPLE_BUNDLE_IDS = (process.env.APPLE_BUNDLE_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

function signAccessToken(userId: string) {
  const secret: Secret = JWT_SECRET as unknown as Secret;
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign({ sub: userId }, secret, options);
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setRefreshCookie(res: express.Response, token: string) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SECURE ? 'none' : 'lax',
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: '/auth',
  });
}

async function verifyGoogleIdToken(idToken: string) {
  if (!firebaseInitialized) throw new Error('Firebase not initialized');
  const decoded = await admin.auth().verifyIdToken(idToken);
  const providerUserId = decoded.uid;
  return {
    provider: 'google' as const,
    providerUserId,
    email: decoded.email || null,
    name: decoded.name || null,
    picture: decoded.picture || null,
    emailVerified: decoded.email_verified || false,
  };
}

async function verifyAppleIdentityToken(identityToken: string) {
  if (APPLE_BUNDLE_IDS.length === 0) throw new Error('APPLE_BUNDLE_IDS not configured');
  const { sub, email, email_verified, aud } = await appleSignin.verifyIdToken(identityToken, {
    audience: APPLE_BUNDLE_IDS,
  });
  if (!APPLE_BUNDLE_IDS.includes(aud as string)) {
    throw new Error('Invalid Apple audience');
  }
  return {
    provider: 'apple' as const,
    providerUserId: String(sub),
    email: (email as string) || null, // may be null on subsequent logins
    name: null,
    picture: null,
    emailVerified: Boolean(email_verified),
  };
}

async function verifyFacebookAccessToken(accessToken: string) {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) throw new Error('Facebook app not configured');
  const appAccessToken = `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`;
  const debugUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`;
  const debug = await axios.get(debugUrl).then((r) => r.data);
  const data = debug.data;
  if (!data || !data.is_valid || data.app_id !== FACEBOOK_APP_ID) {
    throw new Error('Invalid Facebook token');
  }
  const meUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
  const me = await axios.get(meUrl).then((r) => r.data);
  return {
    provider: 'facebook' as const,
    providerUserId: String(me.id),
    email: (me.email as string) || null,
    name: (me.name as string) || null,
    picture: null,
    emailVerified: Boolean(me.email),
  };
}

async function findOrCreateUser(input: {
  provider: 'google' | 'apple' | 'facebook';
  providerUserId: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}) {
  const existingAccount = await prisma.accountProvider.findUnique({
    where: { provider_providerUserId: { provider: input.provider, providerUserId: input.providerUserId } },
    include: { user: true },
  });
  if (existingAccount) return existingAccount.user;

  if (input.email) {
    const userByEmail = await prisma.user.findUnique({ where: { email: input.email } });
    if (userByEmail) {
      await prisma.accountProvider.create({
        data: {
          provider: input.provider,
          providerUserId: input.providerUserId,
          email: input.email,
          userId: userByEmail.id,
        },
      });
      return userByEmail;
    }
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      image: input.picture,
      accounts: {
        create: {
          provider: input.provider,
          providerUserId: input.providerUserId,
          email: input.email,
        },
      },
    },
  });
  return user;
}

async function rotateRefreshToken(userId: string, currentToken?: string) {
  if (currentToken) {
    const hash = hashToken(currentToken);
    const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
    if (existing && !existing.revoked) {
      await prisma.refreshToken.update({ where: { id: existing.id }, data: { revoked: true } });
    }
  }
  const newToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(newToken), expiresAt },
  });
  return newToken;
}

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    (req as any).userId = payload.sub;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/auth/social/login', async (req, res) => {
  const { provider, idToken, accessToken } = req.body || {};
  try {
    let verified:
      | Awaited<ReturnType<typeof verifyGoogleIdToken>>
      | Awaited<ReturnType<typeof verifyAppleIdentityToken>>
      | Awaited<ReturnType<typeof verifyFacebookAccessToken>>;

    if (provider === 'google') {
      if (!idToken) return res.status(400).json({ error: 'idToken required for Google' });
      verified = await verifyGoogleIdToken(idToken);
    } else if (provider === 'apple') {
      if (!idToken) return res.status(400).json({ error: 'idToken required for Apple' });
      verified = await verifyAppleIdentityToken(idToken);
    } else if (provider === 'facebook') {
      if (!accessToken) return res.status(400).json({ error: 'accessToken required for Facebook' });
      verified = await verifyFacebookAccessToken(accessToken);
    } else {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    const user = await findOrCreateUser({
      provider: verified.provider,
      providerUserId: verified.providerUserId,
      email: verified.email,
      name: verified.name,
      picture: verified.picture,
    });

    const access = signAccessToken(user.id);
    const currentCookieToken = req.cookies?.['refresh_token'];
    const refresh = await rotateRefreshToken(user.id, currentCookieToken);
    setRefreshCookie(res, refresh);

    // Return refreshToken in body for native clients that cannot use cookies
    return res.json({ accessToken: access, refreshToken: refresh, user: { id: user.id, email: user.email, name: user.name, image: user.image } });
  } catch (err: any) {
    console.error(err);
    return res.status(401).json({ error: err?.message || 'Authentication failed' });
  }
});

app.post('/auth/refresh', async (req, res) => {
  const bodyToken = req.body?.refreshToken as string | undefined;
  const cookieToken = req.cookies?.['refresh_token'] as string | undefined;
  const token = bodyToken || cookieToken;
  if (!token) return res.status(400).json({ error: 'No refresh token provided' });
  try {
    const hash = hashToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) return res.status(401).json({ error: 'Invalid refresh token' });
    const userId = stored.userId;
    const access = signAccessToken(userId);
    const newRefresh = await rotateRefreshToken(userId, token);
    setRefreshCookie(res, newRefresh);
    return res.json({ accessToken: access, refreshToken: newRefresh });
  } catch (err: any) {
    console.error(err);
    return res.status(401).json({ error: 'Refresh failed' });
  }
});

app.post('/auth/logout', async (req, res) => {
  const cookieToken = req.cookies?.['refresh_token'] as string | undefined;
  const bodyToken = req.body?.refreshToken as string | undefined;
  const token = bodyToken || cookieToken;
  if (token) {
    try {
      await prisma.refreshToken.update({ where: { tokenHash: hashToken(token) }, data: { revoked: true } });
    } catch {}
  }
  res.clearCookie('refresh_token', { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SECURE ? 'none' : 'lax', path: '/auth' });
  return res.json({ success: true });
});

app.get('/me', authenticate, async (req, res) => {
  const userId = (req as any).userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  return res.json({ id: user.id, email: user.email, name: user.name, image: user.image });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Auth server listening on http://localhost:${port}`);
});
