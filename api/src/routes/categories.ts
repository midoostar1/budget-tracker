import { OpenAPIHono, z } from '@hono/zod-openapi';
import { Routes, CategoryCreate } from '../schemas.js';
import { store } from '../store.js';

export const categories = new OpenAPIHono();

categories.openapi(Routes.listCategories, async (c) => {
  const items = store.listCategories();
  return c.json({ items }, 200);
});

categories.openapi(Routes.createCategory, async (c) => {
  const input = await c.req.json();
  const parsed = CategoryCreate.parse(input);
  const created = store.createCategory(parsed.name, parsed.icon);
  return c.json(created, 201);
});
