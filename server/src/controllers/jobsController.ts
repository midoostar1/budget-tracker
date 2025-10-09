import { Request, Response } from 'express';
import { logger } from '../lib/logger';
import { runDailyDigest, getJobStats } from '../services/jobsService';

/**
 * POST /jobs/daily-digest
 * Run daily digest job - send notifications for pending receipts and upcoming bills
 * Protected by x-cron-secret header
 */
export async function dailyDigest(_req: Request, res: Response): Promise<void> {
  const jobStartTime = Date.now();

  try {
    logger.info('Daily digest job triggered');

    const result = await runDailyDigest();

    const duration = Date.now() - jobStartTime;

    res.status(200).json({
      message: 'Daily digest completed successfully',
      duration: `${duration}ms`,
      stats: {
        pendingReceiptNotifications: result.pendingReceiptNotifications,
        billReminderNotifications: result.billReminderNotifications,
        totalUsersPending: result.totalUsersPending,
        totalBillsUpcoming: result.totalBillsUpcoming,
        errors: result.errors,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - jobStartTime;

    logger.error({ error, duration }, 'Daily digest job failed');

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Daily digest job failed',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * GET /jobs/stats
 * Get current job statistics (what would be processed)
 * Protected by x-cron-secret header
 */
export async function getJobStatistics(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await getJobStats();

    res.status(200).json({
      stats: {
        pendingReceipts: stats.pendingReceipts,
        upcomingBills: stats.upcomingBills,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get job stats');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch job statistics',
    });
  }
}

