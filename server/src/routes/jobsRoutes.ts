import { Router } from 'express';
import { dailyDigest, getJobStatistics } from '../controllers/jobsController';
import { verifyCronSecret } from '../middleware/cronAuth';

const router = Router();

// All job routes require cron secret authentication
router.use(verifyCronSecret);

/**
 * @route   POST /jobs/daily-digest
 * @desc    Run daily digest job (pending receipts + upcoming bills)
 * @access  Protected by x-cron-secret header
 * @header  x-cron-secret: CRON_SECRET
 */
router.post('/daily-digest', dailyDigest);

/**
 * @route   GET /jobs/stats
 * @desc    Get current job statistics (pending items count)
 * @access  Protected by x-cron-secret header
 * @header  x-cron-secret: CRON_SECRET
 */
router.get('/stats', getJobStatistics);

export default router;


