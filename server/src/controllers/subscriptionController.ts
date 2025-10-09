import { Request, Response } from 'express';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';

/**
 * POST /api/users/subscription/upgrade-stub
 * Stub endpoint for upgrading to premium
 * 
 * In production, this would:
 * 1. Create Stripe checkout session
 * 2. Process StoreKit/Play Billing purchase
 * 3. Verify payment
 * 4. Update subscription
 * 
 * For now, it just updates the user's subscriptionTier flag
 */
export async function upgradeStub(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { plan, paymentMethod } = req.body;

    logger.warn(
      { userId: req.user.userId, plan, paymentMethod },
      'STUB: Premium upgrade requested (payment not processed)'
    );

    // Stub: Just update the user's subscription tier
    // In production, this would only happen after payment confirmation
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        subscriptionTier: 'premium',
      },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
      },
    });

    logger.info(
      { userId: updatedUser.id, tier: updatedUser.subscriptionTier },
      'STUB: User upgraded to premium (no payment processed)'
    );

    res.status(200).json({
      success: true,
      subscription: {
        tier: updatedUser.subscriptionTier,
        plan,
      },
      message: 'Upgraded to Premium (STUB - no payment processed)',
      warning: 'This is a stub endpoint. Payment processing not implemented.',
    });
  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Upgrade stub error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process upgrade',
    });
  }
}

/**
 * POST /api/users/subscription/downgrade-stub
 * Stub endpoint for downgrading to free tier
 */
export async function downgradeStub(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        subscriptionTier: 'free',
      },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
      },
    });

    logger.info({ userId: updatedUser.id }, 'User downgraded to free tier');

    res.status(200).json({
      success: true,
      subscription: {
        tier: updatedUser.subscriptionTier,
      },
      message: 'Downgraded to Free tier',
    });
  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Downgrade stub error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process downgrade',
    });
  }
}

