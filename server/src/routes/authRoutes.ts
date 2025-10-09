import { Router } from 'express';
import {
  socialLogin,
  refreshAccessToken,
  logout,
  logoutAll,
  getCurrentUser,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/social-login
 * @desc    Authenticate user with social provider (Google, Apple, Facebook)
 * @access  Public
 * @body    { provider: 'google' | 'apple' | 'facebook', token: string, email?: string, firstName?: string, lastName?: string }
 */
router.post('/social-login', socialLogin);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token from HTTP-only cookie
 * @access  Public (requires refresh token cookie)
 */
router.post('/refresh', refreshAccessToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and revoke refresh token
 * @access  Public (no auth required, uses cookie)
 */
router.post('/logout', logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices (revoke all refresh tokens)
 * @access  Private (requires authentication)
 */
router.post('/logout-all', authenticate, logoutAll);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private (requires authentication)
 */
router.get('/me', authenticate, getCurrentUser);

export default router;


