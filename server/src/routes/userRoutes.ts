import { Router } from 'express';
import {
  registerDevice,
  getUserDevices,
  unregisterDevice,
  getSubscription,
} from '../controllers/userController';
import { upgradeStub, downgradeStub } from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/users/register-device
 * @desc    Register or update a device for push notifications
 * @access  Private
 * @body    { fcmToken: string, platform: 'ios' | 'android' }
 */
router.post('/register-device', registerDevice);

/**
 * @route   GET /api/users/devices
 * @desc    Get all registered devices for the authenticated user
 * @access  Private
 */
router.get('/devices', getUserDevices);

/**
 * @route   DELETE /api/users/devices/:id
 * @desc    Unregister a device
 * @access  Private
 */
router.delete('/devices/:id', unregisterDevice);

/**
 * @route   GET /api/users/subscription
 * @desc    Get user's subscription tier and monthly usage statistics
 * @access  Private
 */
router.get('/subscription', getSubscription);

/**
 * @route   POST /api/users/subscription/upgrade-stub
 * @desc    Stub endpoint to upgrade user to premium (no payment processing)
 * @access  Private
 * @body    { plan: 'monthly' | 'yearly', paymentMethod: 'stub' }
 * @note    DEVELOPMENT ONLY - Replace with real payment processing
 */
router.post('/subscription/upgrade-stub', upgradeStub);

/**
 * @route   POST /api/users/subscription/downgrade-stub
 * @desc    Stub endpoint to downgrade user to free tier
 * @access  Private
 * @note    DEVELOPMENT ONLY
 */
router.post('/subscription/downgrade-stub', downgradeStub);

export default router;


