import { z } from 'zod';

// Transaction type enum
export const TransactionTypeSchema = z.enum(['income', 'expense']);

// Transaction status enum
export const TransactionStatusSchema = z.enum(['cleared', 'pending_receipt']);

/**
 * Schema for creating a new transaction
 */
export const CreateTransactionSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(9999999999.99, 'Amount exceeds maximum allowed value')
    .transform((val) => val.toFixed(2)),
  type: TransactionTypeSchema,
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must be less than 100 characters'),
  payee: z
    .string()
    .max(200, 'Payee must be less than 200 characters')
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .optional()
    .nullable(),
  transactionDate: z.coerce.date(),
  status: TransactionStatusSchema.default('cleared'), // Default to cleared for manual transactions
});

/**
 * Schema for updating an existing transaction
 */
export const UpdateTransactionSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(9999999999.99, 'Amount exceeds maximum allowed value')
    .transform((val) => val.toFixed(2))
    .optional(),
  type: TransactionTypeSchema.optional(),
  category: z
    .string()
    .min(1, 'Category cannot be empty')
    .max(100, 'Category must be less than 100 characters')
    .optional(),
  payee: z
    .string()
    .max(200, 'Payee must be less than 200 characters')
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .optional()
    .nullable(),
  transactionDate: z.coerce.date().optional(),
  status: TransactionStatusSchema.optional(),
});

/**
 * Schema for transaction query filters
 */
export const TransactionQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1, 'Page must be at least 1')),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100, 'Limit must be between 1 and 100')),
  status: TransactionStatusSchema.optional(),
  type: TransactionTypeSchema.optional(),
  category: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().nonnegative().optional()),
  maxAmount: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().nonnegative().optional()),
  sortBy: z
    .enum(['transactionDate', 'amount', 'createdAt', 'category'])
    .optional()
    .default('transactionDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Schema for transaction ID parameter
 */
export const TransactionIdSchema = z.object({
  id: z.string().uuid('Invalid transaction ID format'),
});

// Export types
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;
export type TransactionIdParam = z.infer<typeof TransactionIdSchema>;


