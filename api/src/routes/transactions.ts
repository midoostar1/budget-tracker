import { OpenAPIHono } from '@hono/zod-openapi';
import { Routes, TransactionCreate, TransactionUpdate, PaginationQuery } from '../schemas.js';
import { store } from '../store.js';

export const transactions = new OpenAPIHono();

transactions.openapi(Routes.createTransaction, async (c) => {
  const body = await c.req.json();
  const input = TransactionCreate.parse(body);

  // Ensure category exists
  const category = store.getCategory(input.categoryId);
  if (!category) return c.text('Category not found', 400);

  const created = store.createTransaction({ ...input });
  return c.json(created, 201);
});

transactions.openapi(Routes.listTransactions, async (c) => {
  const q = c.req.query();
  const parsed = PaginationQuery.parse({
    from: q.from,
    to: q.to,
    limit: q.limit,
    cursor: q.cursor
  });
  const { items, nextCursor } = store.listTransactions(parsed);
  return c.json({ items, nextCursor }, 200);
});

transactions.openapi(Routes.updateTransaction, async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const updates = TransactionUpdate.parse(body);
  const updated = store.updateTransaction(id, updates);
  if (!updated) return c.text('Not found', 404);
  return c.json(updated, 200);
});

transactions.openapi(Routes.deleteTransaction, async (c) => {
  const { id } = c.req.param();
  const ok = store.deleteTransaction(id);
  if (!ok) return c.text('Not found', 404);
  return c.body(null, 204);
});
