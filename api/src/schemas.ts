import { createRoute, z } from '@hono/zod-openapi';
import Decimal from 'decimal.js';

export const Category = z.object({
  id: z.string().uuid().openapi({ example: 'a3b1d5c6-7890-1234-5678-90abcdef1234' }),
  name: z.string().min(1).max(50).openapi({ example: 'Groceries' }),
  icon: z.string().min(1).max(20).openapi({ example: 'shopping-cart' })
}).openapi('Category');

export const CategoryCreate = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().min(1).max(20)
}).openapi('CategoryCreate');

export const Transaction = z.object({
  id: z.string().uuid().openapi({ example: 'c2c3e8d2-8c2e-4d20-9c0a-6b4f9f2e0aa1' }),
  amount: z.string().refine(v => {
    try { new Decimal(v); return true; } catch { return false; }
  }, { message: 'Invalid decimal amount' }).openapi({ example: '12.34' }),
  currency: z.string().length(3).toUpperCase().openapi({ example: 'USD' }),
  categoryId: z.string().uuid().openapi({ example: 'a3b1d5c6-7890-1234-5678-90abcdef1234' }),
  note: z.string().max(200).optional().openapi({ example: 'Lunch with team' }),
  occurredAt: z.string().datetime().openapi({ example: '2025-10-08T12:34:56.000Z' })
}).openapi('Transaction');

export const TransactionCreate = z.object({
  amount: z.string().superRefine((v, ctx) => {
    try {
      const d = new Decimal(v);
      if (!d.isFinite()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Amount must be finite' });
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid decimal amount' });
    }
  }),
  currency: z.string().length(3).toUpperCase(),
  categoryId: z.string().uuid(),
  note: z.string().max(200).optional(),
  occurredAt: z.string().datetime()
}).openapi('TransactionCreate');

export const TransactionUpdate = z.object({
  amount: z.string().optional().superRefine((v, ctx) => {
    if (v === undefined) return;
    try {
      const d = new Decimal(v);
      if (!d.isFinite()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Amount must be finite' });
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid decimal amount' });
    }
  }),
  currency: z.string().length(3).toUpperCase().optional(),
  categoryId: z.string().uuid().optional(),
  note: z.string().max(200).optional(),
  occurredAt: z.string().datetime().optional()
}).openapi('TransactionUpdate');

export const PaginationQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional()
}).openapi('PaginationQuery');

export type Category = z.infer<typeof Category>;
export type CategoryCreate = z.infer<typeof CategoryCreate>;
export type Transaction = z.infer<typeof Transaction>;
export type TransactionCreate = z.infer<typeof TransactionCreate>;
export type TransactionUpdate = z.infer<typeof TransactionUpdate>;
export type PaginationQuery = z.infer<typeof PaginationQuery>;

export const Routes = {
  listCategories: createRoute({
    method: 'get',
    path: '/categories',
    request: {},
    responses: {
      200: { description: 'List categories', content: { 'application/json': { schema: z.object({ items: z.array(Category) }) } } }
    }
  }),
  createCategory: createRoute({
    method: 'post',
    path: '/categories',
    request: { body: { content: { 'application/json': { schema: CategoryCreate } } } },
    responses: {
      201: { description: 'Created', content: { 'application/json': { schema: Category } } }
    }
  }),
  createTransaction: createRoute({
    method: 'post',
    path: '/transactions',
    request: { body: { content: { 'application/json': { schema: TransactionCreate } } } },
    responses: {
      201: { description: 'Created', content: { 'application/json': { schema: Transaction } } }
    }
  }),
  listTransactions: createRoute({
    method: 'get',
    path: '/transactions',
    request: { query: PaginationQuery },
    responses: {
      200: {
        description: 'List transactions',
        content: { 'application/json': { schema: z.object({ items: z.array(Transaction), nextCursor: z.string().uuid().nullable() }) } }
      }
    }
  }),
  updateTransaction: createRoute({
    method: 'patch',
    path: '/transactions/{id}',
    request: { params: z.object({ id: z.string().uuid() }), body: { content: { 'application/json': { schema: TransactionUpdate } } } },
    responses: {
      200: { description: 'Updated', content: { 'application/json': { schema: Transaction } } },
      404: { description: 'Not found' }
    }
  }),
  deleteTransaction: createRoute({
    method: 'delete',
    path: '/transactions/{id}',
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } }
  })
} as const;
