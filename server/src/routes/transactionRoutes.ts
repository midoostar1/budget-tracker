import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics (income, expense, balance)
 * @access  Private
 * @query   startDate, endDate (optional)
 */
router.get('/stats', getTransactionStats);

/**
 * @route   POST /api/transactions
 * @desc    Create a new manual transaction (status: cleared)
 * @access  Private
 * @body    { amount, type, category, payee?, notes?, transactionDate, status? }
 */
router.post('/', createTransaction);

/**
 * @route   GET /api/transactions
 * @desc    Get paginated list of transactions with filters
 * @access  Private
 * @query   page, limit, status, type, category, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder
 */
router.get('/', getTransactions);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get a single transaction by ID
 * @access  Private
 */
router.get('/:id', getTransactionById);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update a transaction
 * @access  Private
 * @body    { amount?, type?, category?, payee?, notes?, transactionDate?, status? }
 */
router.put('/:id', updateTransaction);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction
 * @access  Private
 */
router.delete('/:id', deleteTransaction);

export default router;


