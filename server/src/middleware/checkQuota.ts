import { Request, Response, NextFunction } from 'express';
import { checkReceiptQuota } from '../services/usageService';
import { logger } from '../lib/logger';

/**
 * Middleware to check receipt upload quota before allowing upload
 * 
 * - Free tier: 10 receipts per month
 * - Premium tier: Unlimited
 * 
 * Returns 402 Payment Required if quota exceeded
 */
export async function checkReceiptUploadQuota(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const quotaCheck = await checkReceiptQuota(userId);

    if (!quotaCheck.allowed) {
      logger.warn(
        { userId, reason: quotaCheck.reason, usage: quotaCheck.usage },
        'Receipt quota exceeded'
      );

      res.status(402).json({
        error: 'PAYMENT_REQUIRED',
        code: quotaCheck.reason || 'FREE_QUOTA_EXCEEDED',
        message: 'You have reached your monthly receipt limit. Upgrade to Premium for unlimited scans.',
        usage: quotaCheck.usage,
        upgradeUrl: '/upgrade', // Mobile can navigate to upgrade screen
      });
      return;
    }

    // Quota OK, proceed to upload
    logger.debug({ userId, usage: quotaCheck.usage }, 'Receipt quota check passed');
    next();
  } catch (error) {
    logger.error({ error, userId: req.user?.userId }, 'Error checking receipt quota');
    
    // On error, allow upload (fail open) but log the issue
    next();
  }
}

