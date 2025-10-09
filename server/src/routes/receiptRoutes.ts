import { Router } from 'express';
import multer from 'multer';
import {
  uploadReceipt,
  getReceipt,
  deleteReceipt,
  getTransactionReceipts,
  processReceipt,
  processBatchReceipts,
  getOCRStats,
  retryProcessReceipt,
} from '../controllers/receiptController';
import { authenticate } from '../middleware/auth';
import { checkReceiptUploadQuota } from '../middleware/checkQuota';

const router = Router();

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept images only
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  },
});

// All receipt routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/receipts/upload
 * @desc    Upload receipt image and create transaction with pending_receipt status
 * @access  Private
 * @body    multipart/form-data with 'image' field
 * @note    Quota check: Free tier limited to 10 receipts/month
 */
router.post('/upload', checkReceiptUploadQuota, upload.single('image'), uploadReceipt);

/**
 * @route   GET /api/receipts/:id
 * @desc    Get a receipt with signed URL
 * @access  Private
 * @query   expiration (optional, default: 60 minutes)
 */
router.get('/:id', getReceipt);

/**
 * @route   DELETE /api/receipts/:id
 * @desc    Delete a receipt and its file
 * @access  Private
 */
router.delete('/:id', deleteReceipt);

/**
 * @route   GET /api/receipts/transaction/:transactionId
 * @desc    Get all receipts for a transaction
 * @access  Private
 * @query   expiration (optional, default: 60 minutes)
 */
router.get('/transaction/:transactionId', getTransactionReceipts);

/**
 * @route   POST /api/receipts/process/:receiptId
 * @desc    Process a receipt with OCR (Veryfi)
 * @access  Private
 */
router.post('/process/:receiptId', processReceipt);

/**
 * @route   POST /api/receipts/process/batch
 * @desc    Process all pending receipts (batch/cron use)
 * @access  Private
 * @query   limit (optional, default: 10)
 */
router.post('/process/batch', processBatchReceipts);

/**
 * @route   GET /api/receipts/ocr/stats
 * @desc    Get OCR processing statistics
 * @access  Private
 */
router.get('/ocr/stats', getOCRStats);

/**
 * @route   POST /api/receipts/retry/:receiptId
 * @desc    Retry processing a failed receipt
 * @access  Private
 */
router.post('/retry/:receiptId', retryProcessReceipt);

// Error handler for multer errors
router.use((error: any, _req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File Too Large',
        message: 'File size exceeds 10MB limit',
      });
    }
    return res.status(400).json({
      error: 'Upload Error',
      message: error.message,
    });
  }

  if (error.message) {
    return res.status(400).json({
      error: 'Upload Error',
      message: error.message,
    });
  }

  next(error);
});

export default router;

