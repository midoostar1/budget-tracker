import Client from '@veryfi/veryfi-sdk';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';
import { config } from '../config';
import { generateSignedUrl } from '../lib/gcsStorage';
import axios from 'axios';

// Initialize Veryfi client
let veryfiClient: any = null;

function getVeryfiClient() {
  if (!veryfiClient) {
    if (!config.VERYFI_CLIENT_ID || !config.VERYFI_CLIENT_SECRET || !config.VERYFI_USERNAME || !config.VERYFI_API_KEY) {
      throw new Error('Veryfi credentials not configured');
    }

    veryfiClient = new Client(
      config.VERYFI_CLIENT_ID,
      config.VERYFI_CLIENT_SECRET,
      config.VERYFI_USERNAME,
      config.VERYFI_API_KEY
    );
  }
  return veryfiClient;
}

export interface OCRResult {
  total: number;
  vendor: string;
  date: string;
  rawData: any;
}

/**
 * Process a single receipt with OCR
 */
export async function processReceipt(receiptId: string): Promise<OCRResult> {
  try {
    // Load receipt and transaction
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        transaction: true,
      },
    });

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    if (!receipt.transaction) {
      throw new Error('Transaction not found for receipt');
    }

    logger.info({ receiptId, transactionId: receipt.transactionId }, 'Starting OCR processing');

    // Generate signed URL for the image (valid for 60 minutes)
    const imageUrl = await generateSignedUrl(receipt.imageUrl, 60);

    // Download image to buffer
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    });
    const imageBuffer = Buffer.from(imageResponse.data);
    const base64Image = imageBuffer.toString('base64');

    // Get Veryfi client
    const client = getVeryfiClient();

    // Process document with Veryfi
    logger.debug({ receiptId }, 'Sending to Veryfi for processing');
    
    const veryfiResponse = await client.process_document(
      `receipt_${receiptId}.jpg`,
      base64Image,
      {
        categories: ['Expense'],
        delete_after_processing: true,
      }
    );

    logger.info({ receiptId, veryfiId: veryfiResponse.id }, 'Veryfi processing completed');

    // Extract relevant data
    const ocrData = {
      total: veryfiResponse.total || 0,
      vendor: {
        name: veryfiResponse.vendor?.name || 'Unknown',
        address: veryfiResponse.vendor?.address,
        phone: veryfiResponse.vendor?.phone_number,
      },
      date: veryfiResponse.date,
      currency: veryfiResponse.currency_code || 'USD',
      tax: veryfiResponse.tax,
      tip: veryfiResponse.tip,
      lineItems: veryfiResponse.line_items?.map((item: any) => ({
        description: item.description,
        total: item.total,
        quantity: item.quantity,
        price: item.price,
      })) || [],
      paymentMethod: veryfiResponse.payment?.type,
      confidence: veryfiResponse.document_quality_score,
      veryfiId: veryfiResponse.id,
      rawResponse: veryfiResponse,
    };

    // Update receipt with OCR data
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        ocrStatus: 'processed',
        ocrData: ocrData as any,
      },
    });

    // Update transaction with extracted data
    const transactionDate = veryfiResponse.date 
      ? new Date(veryfiResponse.date) 
      : receipt.transaction.transactionDate;

    await prisma.transaction.update({
      where: { id: receipt.transactionId },
      data: {
        amount: veryfiResponse.total || receipt.transaction.amount,
        payee: veryfiResponse.vendor?.name || receipt.transaction.payee,
        transactionDate: transactionDate,
        // Keep status as pending_receipt for user review
        status: 'pending_receipt',
      },
    });

    logger.info(
      {
        receiptId,
        transactionId: receipt.transactionId,
        total: veryfiResponse.total,
        vendor: veryfiResponse.vendor?.name,
      },
      'Receipt processed and transaction updated'
    );

    return {
      total: veryfiResponse.total || 0,
      vendor: veryfiResponse.vendor?.name || 'Unknown',
      date: veryfiResponse.date,
      rawData: ocrData,
    };
  } catch (error) {
    logger.error({ error, receiptId }, 'OCR processing failed');

    // Update receipt status to failed
    try {
      await prisma.receipt.update({
        where: { id: receiptId },
        data: {
          ocrStatus: 'failed',
        },
      });
    } catch (updateError) {
      logger.error({ error: updateError, receiptId }, 'Failed to update receipt status');
    }

    throw error;
  }
}

/**
 * Process all pending receipts (for batch/cron use)
 */
export async function processPendingReceipts(limit: number = 10): Promise<{
  processed: number;
  failed: number;
  results: Array<{ receiptId: string; success: boolean; error?: string }>;
}> {
  try {
    logger.info({ limit }, 'Starting batch OCR processing');

    // Get pending receipts
    const pendingReceipts = await prisma.receipt.findMany({
      where: {
        ocrStatus: 'pending',
      },
      take: limit,
      orderBy: {
        createdAt: 'asc', // Process oldest first
      },
    });

    logger.info({ count: pendingReceipts.length }, 'Found pending receipts');

    if (pendingReceipts.length === 0) {
      return { processed: 0, failed: 0, results: [] };
    }

    const results: Array<{ receiptId: string; success: boolean; error?: string }> = [];
    let processed = 0;
    let failed = 0;

    // Process each receipt sequentially to avoid rate limits
    for (const receipt of pendingReceipts) {
      try {
        await processReceipt(receipt.id);
        results.push({ receiptId: receipt.id, success: true });
        processed++;
        
        // Add delay to avoid rate limiting (adjust based on Veryfi plan)
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      } catch (error) {
        logger.error({ error, receiptId: receipt.id }, 'Failed to process receipt in batch');
        results.push({
          receiptId: receipt.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failed++;
      }
    }

    logger.info({ processed, failed, total: pendingReceipts.length }, 'Batch OCR processing completed');

    return { processed, failed, results };
  } catch (error) {
    logger.error({ error }, 'Batch OCR processing error');
    throw new Error('Failed to process pending receipts');
  }
}

/**
 * Get OCR processing stats
 */
export async function getOCRStats(): Promise<{
  pending: number;
  processed: number;
  failed: number;
  total: number;
}> {
  try {
    const [pending, processed, failed, total] = await Promise.all([
      prisma.receipt.count({ where: { ocrStatus: 'pending' } }),
      prisma.receipt.count({ where: { ocrStatus: 'processed' } }),
      prisma.receipt.count({ where: { ocrStatus: 'failed' } }),
      prisma.receipt.count(),
    ]);

    return { pending, processed, failed, total };
  } catch (error) {
    logger.error({ error }, 'Failed to get OCR stats');
    throw new Error('Failed to fetch OCR statistics');
  }
}

/**
 * Retry failed receipt processing
 */
export async function retryFailedReceipt(receiptId: string): Promise<OCRResult> {
  try {
    // Reset status to pending
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        ocrStatus: 'pending',
      },
    });

    // Process receipt
    return await processReceipt(receiptId);
  } catch (error) {
    logger.error({ error, receiptId }, 'Failed to retry receipt processing');
    throw error;
  }
}


