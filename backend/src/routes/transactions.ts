import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsQuerySchema,
} from '../validation';
import { PaginatedResponse, TransactionDTO } from '../types';
import { z } from 'zod';

const router = Router();

/**
 * POST /transactions - Create a new transaction
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createTransactionSchema.parse(req.body);

    // Verify category exists
    const category = storage.getCategoryById(validatedData.categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const transaction = storage.createTransaction({
      amount: validatedData.amount,
      description: validatedData.description,
      categoryId: validatedData.categoryId,
      date: validatedData.date ? new Date(validatedData.date) : undefined,
    });

    res.status(201).json(storage.transactionToDTO(transaction));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /transactions - Get transactions with optional filters and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = getTransactionsQuerySchema.parse(req.query);

    const filters = {
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    };

    const allTransactions = storage.getTransactions(filters);
    const total = allTransactions.length;

    // Pagination
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);

    const response: PaginatedResponse<TransactionDTO> = {
      data: paginatedTransactions.map(t => storage.transactionToDTO(t)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /transactions/:id - Update a transaction
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingTransaction = storage.getTransactionById(id);
    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const validatedData = updateTransactionSchema.parse(req.body);

    // If updating categoryId, verify it exists
    if (validatedData.categoryId) {
      const category = storage.getCategoryById(validatedData.categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const updates = {
      ...(validatedData.amount && { amount: validatedData.amount }),
      ...(validatedData.description && { description: validatedData.description }),
      ...(validatedData.categoryId && { categoryId: validatedData.categoryId }),
      ...(validatedData.date && { date: new Date(validatedData.date) }),
    };

    const updated = storage.updateTransaction(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(storage.transactionToDTO(updated));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /transactions/:id - Delete a transaction
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = storage.deleteTransaction(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;