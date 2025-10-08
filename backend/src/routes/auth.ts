import { Router } from 'express';
import { body } from 'express-validator';
import { socialLogin, refreshAccessToken, logout } from '../controllers/authController';

const router = Router();

// Social login endpoint
router.post(
  '/social/login',
  [
    body('provider').isIn(['google', 'apple', 'facebook']).withMessage('Invalid provider'),
    body('idToken').optional().isString(),
    body('accessToken').optional().isString(),
    body('identityToken').optional().isString(),
    body('authorizationCode').optional().isString(),
  ],
  socialLogin
);

// Refresh token endpoint
router.post('/refresh', refreshAccessToken);

// Logout endpoint
router.post('/logout', logout);

export default router;
