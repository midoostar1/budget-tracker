import { Request, Response } from 'express';
import { logger } from '../lib/logger';
import { validateImageFile } from '../lib/gcsStorage';
import * as receiptService from '../services/receiptService';
import * as ocrService from '../services/ocrService';

/**
 * POST /api/receipts/upload
 * Upload a receipt image and create transaction with pending_receipt status
 */
export async function uploadReceipt(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'No image file provided',
      });
      return;
    }

    // Validate file
    const validation = validateImageFile(req.file.mimetype, req.file.size);
    if (!validation.valid) {
      res.status(400).json({
        error: 'Validation Error',
        message: validation.error,
      });
      return;
    }

    // Upload receipt and create transaction/receipt
    const result = await receiptService.uploadReceipt(
      req.user.userId,
      req.file.buffer,
      req.file.mimetype
    );

    res.status(201).json({
      transactionId: result.transactionId,
      receiptId: result.receiptId,
      signedUrl: result.signedUrl,
      message: 'Receipt uploaded successfully',
    });
  } catch (error) {
    logger.error({ error }, 'Upload receipt error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to upload receipt',
    });
  }
}

/**
 * GET /api/receipts/:id
 * Get a receipt with signed URL
 */
export async function getReceipt(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    // Get expiration from query (default 60 minutes)
    const expiration = req.query.expiration
      ? parseInt(req.query.expiration as string, 10)
      : 60;

    const receipt = await receiptService.getReceiptWithSignedUrl(
      req.user.userId,
      id,
      expiration
    );

    if (!receipt) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Receipt not found',
      });
      return;
    }

    res.status(200).json({ receipt });
  } catch (error) {
    logger.error({ error }, 'Get receipt error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch receipt',
    });
  }
}

/**
 * DELETE /api/receipts/:id
 * Delete a receipt and its associated file
 */
export async function deleteReceipt(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    await receiptService.deleteReceipt(req.user.userId, id);

    res.status(200).json({
      message: 'Receipt deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
      return;
    }

    logger.error({ error }, 'Delete receipt error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete receipt',
    });
  }
}

/**
 * GET /api/receipts/transaction/:transactionId
 * Get all receipts for a transaction with signed URLs
 */
export async function getTransactionReceipts(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { transactionId } = req.params;

    // Get expiration from query (default 60 minutes)
    const expiration = req.query.expiration
      ? parseInt(req.query.expiration as string, 10)
      : 60;

    const receipts = await receiptService.getTransactionReceipts(
      req.user.userId,
      transactionId,
      expiration
    );

    res.status(200).json({ receipts });
  } catch (error) {
    logger.error({ error }, 'Get transaction receipts error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transaction receipts',
    });
  }
}

/**
 * POST /api/receipts/process/:receiptId
 * Process a receipt with OCR (Veryfi)
 */
export async function processReceipt(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { receiptId } = req.params;

    // Verify user owns this receipt
    const receipt = await receiptService.getReceiptWithSignedUrl(req.user.userId, receiptId, 1);
    
    if (!receipt) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Receipt not found',
      });
      return;
    }

    // Process receipt with OCR
    try {
      const result = await ocrService.processReceipt(receiptId);

      res.status(200).json({
        message: 'Receipt processed successfully',
        result: {
          total: result.total,
          vendor: result.vendor,
          date: result.date,
        },
      });
    } catch (ocrError) {
      logger.error({ error: ocrError, receiptId }, 'OCR processing failed');
      
      res.status(502).json({
        error: 'OCR Processing Failed',
        message: ocrError instanceof Error ? ocrError.message : 'Failed to process receipt with OCR',
      });
      return;
    }
  } catch (error) {
    logger.error({ error }, 'Process receipt error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process receipt',
    });
  }
}

/**
 * POST /api/receipts/process/batch
 * Process all pending receipts (admin/cron use)
 */
export async function processBatchReceipts(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Optional: Add admin check here
    // if (!isAdmin(req.user)) { ... }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const result = await ocrService.processPendingReceipts(limit);

    res.status(200).json({
      message: 'Batch processing completed',
      ...result,
    });
  } catch (error) {
    logger.error({ error }, 'Batch process receipts error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process batch receipts',
    });
  }
}

/**
 * GET /api/receipts/ocr/stats
 * Get OCR processing statistics
 */
export async function getOCRStats(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const stats = await ocrService.getOCRStats();

    res.status(200).json({ stats });
  } catch (error) {
    logger.error({ error }, 'Get OCR stats error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch OCR statistics',
    });
  }
}

/**
 * POST /api/receipts/retry/:receiptId
 * Retry processing a failed receipt
 */
export async function retryProcessReceipt(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const { receiptId } = req.params;

    // Verify user owns this receipt
    const receipt = await receiptService.getReceiptWithSignedUrl(req.user.userId, receiptId, 1);
    
    if (!receipt) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Receipt not found',
      });
      return;
    }

    // Retry processing
    try {
      const result = await ocrService.retryFailedReceipt(receiptId);

      res.status(200).json({
        message: 'Receipt reprocessed successfully',
        result: {
          total: result.total,
          vendor: result.vendor,
          date: result.date,
        },
      });
    } catch (ocrError) {
      logger.error({ error: ocrError, receiptId }, 'OCR retry failed');
      
      res.status(502).json({
        error: 'OCR Processing Failed',
        message: ocrError instanceof Error ? ocrError.message : 'Failed to reprocess receipt',
      });
      return;
    }
  } catch (error) {
    logger.error({ error }, 'Retry process receipt error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retry receipt processing',
    });
  }
}

