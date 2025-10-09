import { prisma } from '../db/client';
import { logger } from '../lib/logger';
import { sendMulticast } from './push';

export interface DailyDigestResult {
  pendingReceiptNotifications: number;
  billReminderNotifications: number;
  totalUsersPending: number;
  totalBillsUpcoming: number;
  errors: number;
}

/**
 * Daily digest job - sends notifications for pending receipts and upcoming bills
 */
export async function runDailyDigest(): Promise<DailyDigestResult> {
  const startTime = Date.now();
  logger.info('Starting daily digest job');

  let pendingReceiptNotifications = 0;
  let billReminderNotifications = 0;
  let totalUsersPending = 0;
  let totalBillsUpcoming = 0;
  let errors = 0;

  try {
    // Part 1: Notify users with pending receipts
    const result1 = await notifyPendingReceipts();
    pendingReceiptNotifications = result1.notificationsSent;
    totalUsersPending = result1.usersNotified;
    errors += result1.errors;

    // Part 2: Notify users of upcoming bills (within 3 days)
    const result2 = await notifyUpcomingBills();
    billReminderNotifications = result2.notificationsSent;
    totalBillsUpcoming = result2.billsFound;
    errors += result2.errors;

    const duration = Date.now() - startTime;

    logger.info(
      {
        duration,
        pendingReceiptNotifications,
        billReminderNotifications,
        totalUsersPending,
        totalBillsUpcoming,
        errors,
      },
      'Daily digest job completed'
    );

    return {
      pendingReceiptNotifications,
      billReminderNotifications,
      totalUsersPending,
      totalBillsUpcoming,
      errors,
    };
  } catch (error) {
    logger.error({ error }, 'Daily digest job failed');
    throw error;
  }
}

/**
 * Notify users who have pending receipt transactions
 */
async function notifyPendingReceipts(): Promise<{
  notificationsSent: number;
  usersNotified: number;
  errors: number;
}> {
  let notificationsSent = 0;
  let usersNotified = 0;
  let errors = 0;

  try {
    // Find users with pending_receipt transactions
    const usersWithPending = await prisma.user.findMany({
      where: {
        transactions: {
          some: {
            status: 'pending_receipt',
          },
        },
      },
      include: {
        devices: true,
        transactions: {
          where: {
            status: 'pending_receipt',
          },
        },
      },
    });

    logger.info(
      { count: usersWithPending.length },
      'Found users with pending receipt transactions'
    );

    for (const user of usersWithPending) {
      if (user.devices.length === 0) {
        logger.debug({ userId: user.id }, 'User has no devices registered');
        continue;
      }

      const pendingCount = user.transactions.length;
      const tokens = user.devices.map((d) => d.fcmToken);

      try {
        const result = await sendMulticast(tokens, {
          title: 'Receipts to Review',
          body: `You have ${pendingCount} receipt${pendingCount > 1 ? 's' : ''} to review!`,
          data: {
            type: 'pending_receipts',
            count: pendingCount.toString(),
          },
        });

        notificationsSent += result.success;
        usersNotified++;

        logger.info(
          { userId: user.id, pendingCount, sent: result.success },
          'Sent pending receipt notification'
        );
      } catch (error) {
        logger.error({ error, userId: user.id }, 'Failed to send pending receipt notification');
        errors++;
      }
    }

    return { notificationsSent, usersNotified, errors };
  } catch (error) {
    logger.error({ error }, 'Failed to notify pending receipts');
    throw error;
  }
}

/**
 * Notify users of bills due within 3 days
 */
async function notifyUpcomingBills(): Promise<{
  notificationsSent: number;
  billsFound: number;
  errors: number;
}> {
  let notificationsSent = 0;
  let billsFound = 0;
  let errors = 0;

  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find bills due within 3 days
    const upcomingBills = await prisma.scheduledTransaction.findMany({
      where: {
        isBill: true,
        nextDueDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
      include: {
        user: {
          include: {
            devices: true,
          },
        },
      },
    });

    logger.info({ count: upcomingBills.length }, 'Found upcoming bills');
    billsFound = upcomingBills.length;

    for (const bill of upcomingBills) {
      if (bill.user.devices.length === 0) {
        logger.debug({ userId: bill.user.id }, 'User has no devices registered');
        continue;
      }

      const daysUntilDue = Math.ceil(
        (bill.nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      let dueDateText = 'today';
      if (daysUntilDue === 1) {
        dueDateText = 'tomorrow';
      } else if (daysUntilDue === 2) {
        dueDateText = 'in 2 days';
      } else if (daysUntilDue === 3) {
        dueDateText = 'in 3 days';
      }

      const tokens = bill.user.devices.map((d) => d.fcmToken);

      try {
        const result = await sendMulticast(tokens, {
          title: 'Bill Reminder',
          body: `Your ${bill.description} bill ($${Number(bill.amount).toFixed(2)}) is due ${dueDateText}`,
          data: {
            type: 'bill_reminder',
            scheduledTransactionId: bill.id,
            description: bill.description,
            amount: bill.amount.toString(),
            dueDate: bill.nextDueDate.toISOString(),
            daysUntil: daysUntilDue.toString(),
          },
        });

        notificationsSent += result.success;

        logger.info(
          {
            userId: bill.user.id,
            billId: bill.id,
            description: bill.description,
            daysUntil: daysUntilDue,
            sent: result.success,
          },
          'Sent bill reminder notification'
        );
      } catch (error) {
        logger.error(
          { error, userId: bill.user.id, billId: bill.id },
          'Failed to send bill reminder notification'
        );
        errors++;
      }
    }

    return { notificationsSent, billsFound, errors };
  } catch (error) {
    logger.error({ error }, 'Failed to notify upcoming bills');
    throw error;
  }
}

/**
 * Get job statistics
 */
export async function getJobStats(): Promise<{
  pendingReceipts: number;
  upcomingBills: number;
}> {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [pendingReceipts, upcomingBills] = await Promise.all([
      prisma.transaction.count({
        where: {
          status: 'pending_receipt',
        },
      }),
      prisma.scheduledTransaction.count({
        where: {
          isBill: true,
          nextDueDate: {
            gte: now,
            lte: threeDaysFromNow,
          },
        },
      }),
    ]);

    return {
      pendingReceipts,
      upcomingBills,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get job stats');
    throw new Error('Failed to fetch job statistics');
  }
}


