import { prisma } from '../db/client';
import { logger } from '../lib/logger';

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get or create usage record for current month
 */
export async function getOrCreateUsage(userId: string) {
  const month = getCurrentMonth();

  const usage = await prisma.usage.upsert({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
    update: {},
    create: {
      userId,
      month,
      receiptCaptures: 0,
    },
  });

  return usage;
}

/**
 * Increment receipt captures for current month
 */
export async function incrementReceiptCaptures(userId: string): Promise<number> {
  const month = getCurrentMonth();

  const usage = await prisma.usage.upsert({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
    update: {
      receiptCaptures: {
        increment: 1,
      },
    },
    create: {
      userId,
      month,
      receiptCaptures: 1,
    },
  });

  logger.info({ userId, month, count: usage.receiptCaptures }, 'Receipt capture incremented');

  return usage.receiptCaptures;
}

/**
 * Get receipt captures for current month
 */
export async function getCurrentMonthReceiptCount(userId: string): Promise<number> {
  const month = getCurrentMonth();

  const usage = await prisma.usage.findUnique({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
  });

  return usage?.receiptCaptures || 0;
}

/**
 * Check if user has exceeded their quota
 * Returns true if user can upload, false if quota exceeded
 */
export async function checkReceiptQuota(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  usage?: {
    used: number;
    limit: number;
    remaining: number;
  };
}> {
  // Get user's subscription tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  // Premium users have unlimited receipts
  if (user.subscriptionTier === 'premium') {
    return { allowed: true };
  }

  // Free tier: 10 receipts per month
  const FREE_TIER_LIMIT = 10;
  const currentCount = await getCurrentMonthReceiptCount(userId);

  if (currentCount >= FREE_TIER_LIMIT) {
    return {
      allowed: false,
      reason: 'FREE_QUOTA_EXCEEDED',
      usage: {
        used: currentCount,
        limit: FREE_TIER_LIMIT,
        remaining: 0,
      },
    };
  }

  return {
    allowed: true,
    usage: {
      used: currentCount,
      limit: FREE_TIER_LIMIT,
      remaining: FREE_TIER_LIMIT - currentCount,
    },
  };
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId: string) {
  const month = getCurrentMonth();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const usage = await prisma.usage.findUnique({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
  });

  const tier = user?.subscriptionTier || 'free';
  const limit = tier === 'premium' ? -1 : 10; // -1 = unlimited
  const used = usage?.receiptCaptures || 0;
  const remaining = tier === 'premium' ? -1 : Math.max(0, limit - used);

  // Calculate next reset date (first day of next month)
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    tier,
    receiptsUsedThisMonth: used,
    receiptsLimitThisMonth: limit === -1 ? 9999 : limit, // Mobile expects number
    receiptsRemaining: remaining === -1 ? 9999 : remaining,
    monthlyResetDate: nextMonth.toISOString(),
  };
}

