import { Router } from 'express';
import { monthlySummary } from '../controllers/reportsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All report routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/reports/monthly-summary
 * @desc    Get monthly summary report with export options
 * @access  Private
 * @query   month (MM), year (YYYY), format (json|csv|pdf), page, limit
 */
router.get('/monthly-summary', monthlySummary);

export default router;


