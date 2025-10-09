import { Request, Response } from 'express';
import { logger } from '../lib/logger';
import {
  CreateTransactionSchema,
  UpdateTransactionSchema,
  TransactionQuerySchema,
  TransactionIdSchema,
} from '../models/transactionSchema';
import * as transactionService from '../services/transactionService';
import { z } from 'zod';

/**
 * POST /api/transactions
 * Create a new manual transaction (cleared status)
 */
export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Validate request body
    const validatedData = CreateTransactionSchema.parse(req.body);

    // Create transaction
    const transaction = await transactionService.createTransaction(
      req.user.userId,
      validatedData
    );

    res.status(201).json({
      transaction,
      message: 'Transaction created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid transaction data',
        details: error.issues,
      });
      return;
    }

    logger.error({ error }, 'Create transaction error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create transaction',
    });
  }
}

/**
 * GET /api/transactions
 * Get paginated list of transactions with filters
 */
export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Validate query parameters
    const query = TransactionQuerySchema.parse(req.query);

    // Get transactions
    const result = await transactionService.getTransactions(req.user.userId, query);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.issues,
      });
      return;
    }

    logger.error({ error }, 'Get transactions error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transactions',
    });
  }
}

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
export async function getTransactionById(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Validate transaction ID
    const { id } = TransactionIdSchema.parse(req.params);

    // Get transaction
    const transaction = await transactionService.getTransactionById(req.user.userId, id);

    if (!transaction) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Transaction not found',
      });
      return;
    }

    res.status(200).json({ transaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid transaction ID',
        details: error.issues,
      });
      return;
    }

    logger.error({ error }, 'Get transaction by ID error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transaction',
    });
  }
}

/**
 * PUT /api/transactions/:id
 * Update a transaction
 */
export async function updateTransaction(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Validate transaction ID
    const { id } = TransactionIdSchema.parse(req.params);

    // Validate request body
    const validatedData = UpdateTransactionSchema.parse(req.body);

    // Check if there's any data to update
    if (Object.keys(validatedData).length === 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'No fields provided for update',
      });
      return;
    }

    // Update transaction
    const transaction = await transactionService.updateTransaction(
      req.user.userId,
      id,
      validatedData
    );

    res.status(200).json({
      transaction,
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid transaction data',
        details: error.issues,
      });
      return;
    }

    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
      return;
    }

    logger.error({ error }, 'Update transaction error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update transaction',
    });
  }
}

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Validate transaction ID
    const { id } = TransactionIdSchema.parse(req.params);

    // Delete transaction
    await transactionService.deleteTransaction(req.user.userId, id);

    res.status(200).json({
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid transaction ID',
        details: error.issues,
      });
      return;
    }

    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
      return;
    }

    logger.error({ error }, 'Delete transaction error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete transaction',
    });
  }
}

/**
 * GET /api/transactions/stats
 * Get transaction statistics for the authenticated user
 */
export async function getTransactionStats(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const stats = await transactionService.getTransactionStats(
      req.user.userId,
      startDate,
      endDate
    );

    res.status(200).json({ stats });
  } catch (error) {
    logger.error({ error }, 'Get transaction stats error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch transaction statistics',
    });
  }
}

