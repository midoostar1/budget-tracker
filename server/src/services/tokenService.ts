import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../db/client';
import { config } from '../config';
import { logger } from '../lib/logger';

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access token (15 minutes)
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'budget-tracker',
    audience: 'budget-tracker-client',
  });
}

/**
 * Generate refresh token (30 days)
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'budget-tracker',
    audience: 'budget-tracker-client',
  });
}

/**
 * Verify and decode access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: 'budget-tracker',
      audience: 'budget-tracker-client',
    }) as AccessTokenPayload;
    return decoded;
  } catch (error) {
    logger.debug('Failed to verify access token'); // Don't log token or error details
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify and decode refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: 'budget-tracker',
      audience: 'budget-tracker-client',
    }) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    logger.debug('Failed to verify refresh token'); // Don't log token or error details
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Hash a refresh token for storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Store refresh token in database
 */
export async function storeRefreshToken(
  userId: string,
  refreshToken: string
): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  try {
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
    logger.debug({ userId }, 'Refresh token stored');
  } catch (error) {
    logger.error({ error, userId }, 'Failed to store refresh token');
    throw new Error('Failed to store refresh token');
  }
}

/**
 * Validate refresh token against database
 */
export async function validateRefreshToken(token: string): Promise<string> {
  const tokenHash = hashToken(token);

  try {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Refresh token not found');
    }

    if (storedToken.revokedAt) {
      throw new Error('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new Error('Refresh token has expired');
    }

    return storedToken.userId;
  } catch (error) {
    logger.debug('Refresh token validation failed'); // Don't log token hash
    throw error instanceof Error ? error : new Error('Invalid refresh token');
  }
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);

  try {
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    logger.debug('Refresh token revoked');
  } catch (error) {
    logger.error({ error }, 'Failed to revoke refresh token');
    throw new Error('Failed to revoke refresh token');
  }
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  try {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    logger.info({ userId }, 'All user refresh tokens revoked');
  } catch (error) {
    logger.error({ error, userId }, 'Failed to revoke user tokens');
    throw new Error('Failed to revoke user tokens');
  }
}

/**
 * Clean up expired tokens (call this periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    logger.info({ count: result.count }, 'Expired tokens cleaned up');
    return result.count;
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup expired tokens');
    return 0;
  }
}

/**
 * Generate access and refresh token pair
 */
export async function generateTokenPair(
  userId: string,
  email: string
): Promise<TokenPair> {
  const accessToken = signAccessToken({ userId, email });
  const refreshToken = signRefreshToken({ userId });

  // Store refresh token in database
  await storeRefreshToken(userId, refreshToken);

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Rotate refresh token (revoke old, issue new)
 */
export async function rotateRefreshToken(oldToken: string): Promise<TokenPair> {
  // Validate old token
  const userId = await validateRefreshToken(oldToken);

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Revoke old token
  await revokeRefreshToken(oldToken);

  // Generate new token pair
  return generateTokenPair(user.id, user.email);
}

