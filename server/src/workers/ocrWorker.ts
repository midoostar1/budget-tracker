import cron from 'node-cron';
import { logger } from '../lib/logger';
import { processPendingReceipts } from '../services/ocrService';

/**
 * OCR Worker for batch processing receipts
 * 
 * This worker processes pending receipts on a schedule.
 * In production, you may want to use Cloud Scheduler with a webhook instead.
 */

/**
 * Process pending receipts on a schedule
 * Default: Every 5 minutes
 */
export function startOCRWorker() {
  // Process pending receipts every 5 minutes
  const task = cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('Starting scheduled OCR batch processing');
      
      const result = await processPendingReceipts(10); // Process up to 10 receipts
      
      logger.info(
        {
          processed: result.processed,
          failed: result.failed,
          total: result.processed + result.failed,
        },
        'Scheduled OCR batch processing completed'
      );

      // Log failures for monitoring
      if (result.failed > 0) {
        logger.warn(
          { failures: result.results.filter(r => !r.success) },
          'Some receipts failed to process'
        );
      }
    } catch (error) {
      logger.error({ error }, 'Scheduled OCR batch processing error');
    }
  });

  logger.info('OCR worker started - processing every 5 minutes');

  return task;
}

/**
 * Stop the OCR worker
 */
export function stopOCRWorker(task: any) {
  task.stop();
  logger.info('OCR worker stopped');
}

/**
 * Manually trigger batch processing (for testing or one-off runs)
 */
export async function triggerOCRBatch(limit: number = 10) {
  logger.info({ limit }, 'Manually triggered OCR batch processing');
  
  try {
    const result = await processPendingReceipts(limit);
    
    logger.info(
      {
        processed: result.processed,
        failed: result.failed,
        total: result.processed + result.failed,
      },
      'Manual OCR batch processing completed'
    );

    return result;
  } catch (error) {
    logger.error({ error }, 'Manual OCR batch processing error');
    throw error;
  }
}

