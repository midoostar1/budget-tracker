import { Receipt } from '@prisma/client';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';
import { uploadToGCS, generateSignedUrl, deleteFromGCS } from '../lib/gcsStorage';
import { incrementReceiptCaptures } from './usageService';

export interface ReceiptUploadResult {
  transactionId: string;
  receiptId: string;
  signedUrl?: string;
}

/**
 * Upload receipt and create transaction with pending_receipt status
 */
export async function uploadReceipt(
  userId: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<ReceiptUploadResult> {
  try {
    // Upload file to GCS
    const uploadResult = await uploadToGCS(fileBuffer, userId, contentType);

    logger.info({ userId, gsPath: uploadResult.gsPath }, 'Receipt uploaded to GCS');

    // Create transaction and receipt in a transaction (database transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction with pending_receipt status
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount: null, // Amount will be filled later
          type: 'expense',
          category: 'Uncategorized', // Default category
          transactionDate: new Date(),
          status: 'pending_receipt',
        },
      });

      // Create receipt linked to transaction
      const receipt = await tx.receipt.create({
        data: {
          transactionId: transaction.id,
          imageUrl: uploadResult.gsPath, // Store canonical gs:// path
          ocrStatus: 'pending',
        },
      });

      return { transaction, receipt };
    });

    logger.info(
      { transactionId: result.transaction.id, receiptId: result.receipt.id, userId },
      'Transaction and receipt created'
    );

    // Increment usage counter (count on upload)
    try {
      const newCount = await incrementReceiptCaptures(userId);
      logger.info({ userId, receiptCount: newCount }, 'Usage counter incremented');
    } catch (error) {
      logger.error({ error, userId }, 'Failed to increment receipt captures');
      // Don't fail the upload if usage tracking fails
    }

    // Generate signed URL for client display (60 minutes)
    let signedUrl: string | undefined;
    try {
      signedUrl = await generateSignedUrl(uploadResult.gsPath, 60);
    } catch (error) {
      logger.warn({ error }, 'Failed to generate signed URL, continuing without it');
    }

    return {
      transactionId: result.transaction.id,
      receiptId: result.receipt.id,
      signedUrl,
    };
  } catch (error) {
    logger.error({ error, userId }, 'Failed to upload receipt');
    throw new Error(
      `Failed to upload receipt: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get receipt with signed URL
 */
export async function getReceiptWithSignedUrl(
  userId: string,
  receiptId: string,
  expirationMinutes: number = 60
): Promise<(Receipt & { signedUrl?: string }) | null> {
  try {
    // Get receipt and verify user owns it
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        transaction: {
          userId,
        },
      },
    });

    if (!receipt) {
      return null;
    }

    // Generate signed URL
    let signedUrl: string | undefined;
    if (receipt.imageUrl) {
      try {
        signedUrl = await generateSignedUrl(receipt.imageUrl, expirationMinutes);
      } catch (error) {
        logger.warn({ error, receiptId }, 'Failed to generate signed URL');
      }
    }

    return {
      ...receipt,
      signedUrl,
    };
  } catch (error) {
    logger.error({ error, userId, receiptId }, 'Failed to get receipt');
    throw new Error('Failed to fetch receipt');
  }
}

/**
 * Delete receipt and associated file
 */
export async function deleteReceipt(userId: string, receiptId: string): Promise<void> {
  try {
    // Get receipt and verify user owns it
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        transaction: {
          userId,
        },
      },
    });

    if (!receipt) {
      throw new Error('Receipt not found or access denied');
    }

    // Delete file from GCS
    if (receipt.imageUrl) {
      try {
        await deleteFromGCS(receipt.imageUrl);
        logger.info({ receiptId, imageUrl: receipt.imageUrl }, 'Receipt file deleted from GCS');
      } catch (error) {
        logger.warn({ error, receiptId }, 'Failed to delete receipt file from GCS');
        // Continue with database deletion even if GCS deletion fails
      }
    }

    // Delete receipt from database
    await prisma.receipt.delete({
      where: { id: receiptId },
    });

    logger.info({ receiptId, userId }, 'Receipt deleted');
  } catch (error) {
    logger.error({ error, userId, receiptId }, 'Failed to delete receipt');
    throw error instanceof Error ? error : new Error('Failed to delete receipt');
  }
}

/**
 * Get receipts for a transaction with signed URLs
 */
export async function getTransactionReceipts(
  userId: string,
  transactionId: string,
  expirationMinutes: number = 60
): Promise<Array<Receipt & { signedUrl?: string }>> {
  try {
    // Get transaction and verify ownership
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        receipt: true,
      },
    });

    if (!transaction || !transaction.receipt) {
      return [];
    }

    // Generate signed URL
    let signedUrl: string | undefined;
    if (transaction.receipt.imageUrl) {
      try {
        signedUrl = await generateSignedUrl(transaction.receipt.imageUrl, expirationMinutes);
      } catch (error) {
        logger.warn({ error, transactionId }, 'Failed to generate signed URL');
      }
    }

    return [
      {
        ...transaction.receipt,
        signedUrl,
      },
    ];
  } catch (error) {
    logger.error({ error, userId, transactionId }, 'Failed to get transaction receipts');
    throw new Error('Failed to fetch transaction receipts');
  }
}

/**
 * Update receipt OCR status and data
 */
export async function updateReceiptOCR(
  receiptId: string,
  ocrStatus: 'pending' | 'processed' | 'failed',
  ocrData?: any
): Promise<Receipt> {
  try {
    const receipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        ocrStatus,
        ...(ocrData && { ocrData }),
      },
    });

    logger.info({ receiptId, ocrStatus }, 'Receipt OCR status updated');
    return receipt;
  } catch (error) {
    logger.error({ error, receiptId }, 'Failed to update receipt OCR');
    throw new Error('Failed to update receipt OCR status');
  }
}

