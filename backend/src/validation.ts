import { z } from 'zod';
import { Decimal } from 'decimal.js';

// Custom Zod type for Decimal
const decimalSchema = z.string().transform((val, ctx) => {
  try {
    const decimal = new Decimal(val);
    if (decimal.isNaN()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid decimal number',
      });
      return z.NEVER;
    }
    return decimal;
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid decimal format',
    });
    return z.NEVER;
  }
});

export const createTransactionSchema = z.object({
  amount: decimalSchema,
  description: z.string().min(1).max(500),
  categoryId: z.string().uuid(),
  date: z.string().datetime().optional(),
});

export const updateTransactionSchema = z.object({
  amount: decimalSchema.optional(),
  description: z.string().min(1).max(500).optional(),
  categoryId: z.string().uuid().optional(),
  date: z.string().datetime().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const getTransactionsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  pageSize: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().optional(),
});

export type CreateTransactionInput = z.input<typeof createTransactionSchema>;
export type CreateTransactionData = z.output<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.input<typeof updateTransactionSchema>;
export type UpdateTransactionData = z.output<typeof updateTransactionSchema>;
export type GetTransactionsQuery = z.output<typeof getTransactionsQuerySchema>;
export type CreateCategoryInput = z.input<typeof createCategorySchema>;
export type CreateCategoryData = z.output<typeof createCategorySchema>;