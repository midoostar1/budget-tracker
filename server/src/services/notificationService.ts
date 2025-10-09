import { prisma } from '../db/client';
import { logger } from '../lib/logger';
import { sendMulticast } from './push';

/**
 * Send notification to all user's devices
 */
async function notifyUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    // Get all user's devices
    const devices = await prisma.device.findMany({
      where: { userId },
    });

    if (devices.length === 0) {
      logger.debug({ userId }, 'No devices registered for user');
      return;
    }

    const tokens = devices.map((d) => d.fcmToken);

    const result = await sendMulticast(tokens, { title, body, data });

    logger.info(
      { userId, success: result.success, failure: result.failure },
      'User notification sent'
    );

    // Clean up failed tokens (optional)
    if (result.failedTokens.length > 0) {
      logger.warn(
        { userId, failedCount: result.failedTokens.length },
        'Some devices failed to receive notification'
      );
    }
  } catch (error) {
    logger.error({ error, userId }, 'Failed to notify user');
  }
}

/**
 * Notify user when receipt is processed
 */
export async function notifyReceiptProcessed(
  userId: string,
  receiptId: string,
  vendor: string,
  total: number
): Promise<void> {
  await notifyUser(
    userId,
    'Receipt Processed',
    `Receipt from ${vendor} ($${total.toFixed(2)}) has been processed`,
    {
      type: 'receipt_processed',
      receiptId,
      vendor,
      total: total.toString(),
    }
  );
}

/**
 * Notify user when transaction is created
 */
export async function notifyTransactionCreated(
  userId: string,
  transactionId: string,
  type: 'income' | 'expense',
  amount: number,
  category: string
): Promise<void> {
  const action = type === 'income' ? 'Received' : 'Spent';
  
  await notifyUser(
    userId,
    'Transaction Recorded',
    `${action} $${amount.toFixed(2)} in ${category}`,
    {
      type: 'transaction_created',
      transactionId,
      transactionType: type,
      amount: amount.toString(),
      category,
    }
  );
}

/**
 * Notify user of upcoming bill
 */
export async function notifyBillReminder(
  userId: string,
  scheduledTransactionId: string,
  description: string,
  amount: number,
  dueDate: Date
): Promise<void> {
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  let dueDateText = 'today';
  if (daysUntilDue === 1) {
    dueDateText = 'tomorrow';
  } else if (daysUntilDue > 1) {
    dueDateText = `in ${daysUntilDue} days`;
  }

  await notifyUser(
    userId,
    'Bill Reminder',
    `${description} ($${amount.toFixed(2)}) is due ${dueDateText}`,
    {
      type: 'bill_reminder',
      scheduledTransactionId,
      description,
      amount: amount.toString(),
      dueDate: dueDate.toISOString(),
    }
  );
}

/**
 * Notify user of budget alert
 */
export async function notifyBudgetAlert(
  userId: string,
  category: string,
  spent: number,
  budget: number,
  percentage: number
): Promise<void> {
  await notifyUser(
    userId,
    'Budget Alert',
    `You've spent ${percentage}% of your ${category} budget ($${spent.toFixed(2)} of $${budget.toFixed(2)})`,
    {
      type: 'budget_alert',
      category,
      spent: spent.toString(),
      budget: budget.toString(),
      percentage: percentage.toString(),
    }
  );
}

/**
 * Notify user of OCR failure
 */
export async function notifyOCRFailed(
  userId: string,
  receiptId: string,
  transactionId: string
): Promise<void> {
  await notifyUser(
    userId,
    'Receipt Processing Failed',
    'We couldn\'t automatically process your receipt. Please review and enter details manually.',
    {
      type: 'ocr_failed',
      receiptId,
      transactionId,
    }
  );
}

export { notifyUser };


