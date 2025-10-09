import { Request, Response } from 'express';
import { AuthProvider } from '@prisma/client';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';
import { verifySocialToken } from '../services/socialVerify';
import {
  generateTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../services/tokenService';

// Cookie configuration
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/api/auth',
};

/**
 * POST /api/auth/social-login
 * Body: { provider: 'google' | 'apple' | 'facebook', token: string, email?: string, firstName?: string, lastName?: string }
 */
export async function socialLogin(req: Request, res: Response): Promise<void> {
  try {
    const { provider, token, email, firstName, lastName } = req.body;

    // Validate input
    if (!provider || !token) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Provider and token are required',
      });
      return;
    }

    if (!['google', 'apple', 'facebook'].includes(provider)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid provider. Must be google, apple, or facebook',
      });
      return;
    }

    // Verify token with social provider
    let profile;
    try {
      profile = await verifySocialToken(provider as 'google' | 'apple' | 'facebook', token, {
        email,
        firstName,
        lastName,
      });
    } catch (error) {
      logger.warn({ error, provider }, 'Social token verification failed');
      res.status(401).json({
        error: 'Unauthorized',
        message: error instanceof Error ? error.message : 'Token verification failed',
      });
      return;
    }

    // Validate email is present
    if (!profile.email) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Email is required. Please ensure email permission is granted.',
      });
      return;
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: {
        provider_providerId: {
          provider: provider.toLowerCase() as AuthProvider,
          providerId: profile.providerId,
        },
      },
      update: {
        email: profile.email,
        firstName: profile.firstName || undefined,
        lastName: profile.lastName || undefined,
        updatedAt: new Date(),
      },
      create: {
        email: profile.email,
        provider: provider.toLowerCase() as AuthProvider,
        providerId: profile.providerId,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
      },
    });

    logger.info({ userId: user.id, provider }, 'User authenticated via social login');

    // Generate access and refresh tokens
    const tokens = await generateTokenPair(user.id, user.email);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    // Return user data and access token
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        provider: user.provider,
      },
      accessToken: tokens.accessToken,
      message: 'Login successful',
    });
  } catch (error) {
    logger.error({ error }, 'Social login error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process social login',
    });
  }
}

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token from cookie
 */
export async function refreshAccessToken(req: Request, res: Response): Promise<void> {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token not found',
      });
      return;
    }

    // Rotate refresh token (validates and generates new tokens)
    let tokens;
    try {
      tokens = await rotateRefreshToken(refreshToken);
    } catch (error) {
      logger.warn({ error }, 'Refresh token rotation failed');
      res.clearCookie('refreshToken', { path: '/api/auth' });
      res.status(401).json({
        error: 'Unauthorized',
        message: error instanceof Error ? error.message : 'Invalid or expired refresh token',
      });
      return;
    }

    // Set new refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    logger.debug('Access token refreshed successfully');

    // Return new access token
    res.status(200).json({
      accessToken: tokens.accessToken,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Token refresh error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to refresh token',
    });
  }
}

/**
 * POST /api/auth/logout
 * Revoke refresh token and clear cookie
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Revoke the refresh token
      try {
        await revokeRefreshToken(refreshToken);
        logger.info('User logged out, refresh token revoked');
      } catch (error) {
        logger.warn({ error }, 'Failed to revoke refresh token during logout');
        // Continue with logout even if revocation fails
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', { path: '/api/auth' });

    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Logout error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to logout',
    });
  }
}

/**
 * POST /api/auth/logout-all
 * Revoke all refresh tokens for the authenticated user
 */
export async function logoutAll(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Revoke all refresh tokens for the user
    await revokeAllUserTokens(req.user.userId);

    // Clear current refresh token cookie
    res.clearCookie('refreshToken', { path: '/api/auth' });

    logger.info({ userId: req.user.userId }, 'All user sessions logged out');

    res.status(200).json({
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Logout all error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to logout from all devices',
    });
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    logger.error({ error }, 'Get current user error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user',
    });
  }
}


