import { Transaction, Prisma } from '@prisma/client';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQuery,
} from '../models/transactionSchema';

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  userId: string,
  data: CreateTransactionInput
): Promise<Transaction> {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: data.amount,
        type: data.type,
        category: data.category,
        payee: data.payee || null,
        notes: data.notes || null,
        transactionDate: data.transactionDate,
        status: data.status,
      },
    });

    logger.info({ transactionId: transaction.id, userId }, 'Transaction created');
    return transaction;
  } catch (error) {
    logger.error({ error, userId }, 'Failed to create transaction');
    throw new Error('Failed to create transaction');
  }
}

/**
 * Get transactions for a user with pagination and filters
 */
export async function getTransactions(
  userId: string,
  query: TransactionQuery
): Promise<PaginatedTransactions> {
  try {
    const { page, limit, status, type, category, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder } = query;

    // Build where clause
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(status && { status }),
      ...(type && { type }),
      ...(category && { category }),
      ...(startDate || endDate
        ? {
            transactionDate: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
      ...(minAmount || maxAmount
        ? {
            amount: {
              ...(minAmount && { gte: minAmount }),
              ...(maxAmount && { lte: maxAmount }),
            },
          }
        : {}),
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          receipt: {
            select: {
              id: true,
              imageUrl: true,
              ocrStatus: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error({ error, userId }, 'Failed to get transactions');
    throw new Error('Failed to fetch transactions');
  }
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(
  userId: string,
  transactionId: string
): Promise<Transaction | null> {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId, // Ensure user owns this transaction
      },
      include: {
        receipt: true,
      },
    });

    return transaction;
  } catch (error) {
    logger.error({ error, userId, transactionId }, 'Failed to get transaction');
    throw new Error('Failed to fetch transaction');
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: UpdateTransactionInput
): Promise<Transaction> {
  try {
    // First check if transaction exists and belongs to user
    const existing = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!existing) {
      throw new Error('Transaction not found or access denied');
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type && { type: data.type }),
        ...(data.category && { category: data.category }),
        ...(data.payee !== undefined && { payee: data.payee }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.transactionDate && { transactionDate: data.transactionDate }),
        ...(data.status && { status: data.status }),
      },
    });

    logger.info({ transactionId, userId }, 'Transaction updated');
    return transaction;
  } catch (error) {
    logger.error({ error, userId, transactionId }, 'Failed to update transaction');
    throw error instanceof Error ? error : new Error('Failed to update transaction');
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  try {
    // Delete will fail if transaction doesn't exist or doesn't belong to user
    const result = await prisma.transaction.deleteMany({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (result.count === 0) {
      throw new Error('Transaction not found or access denied');
    }

    logger.info({ transactionId, userId }, 'Transaction deleted');
  } catch (error) {
    logger.error({ error, userId, transactionId }, 'Failed to delete transaction');
    throw error instanceof Error ? error : new Error('Failed to delete transaction');
  }
}

/**
 * Get transaction statistics for a user
 */
export async function getTransactionStats(userId: string, startDate?: Date, endDate?: Date) {
  try {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(startDate || endDate
        ? {
            transactionDate: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [totalIncome, totalExpense, transactionCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'income',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'expense',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const income = totalIncome._sum.amount ? Number(totalIncome._sum.amount) : 0;
    const expense = totalExpense._sum.amount ? Number(totalExpense._sum.amount) : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      transactionCount,
    };
  } catch (error) {
    logger.error({ error, userId }, 'Failed to get transaction stats');
    throw new Error('Failed to fetch transaction statistics');
  }
}

