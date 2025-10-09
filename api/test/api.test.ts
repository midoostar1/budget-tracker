import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../src/app.js';
import { store } from '../src/store.js';

async function request(method: string, path: string, body?: unknown) {
  const url = new URL(`http://localhost${path}`);
  return await app.request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
}

describe('API', () => {
  beforeEach(() => store._reset());

  it('creates and lists categories', async () => {
    const createRes = await request('POST', '/categories', { name: 'Food', icon: 'utensils' });
    expect(createRes.status).toBe(201);
    const cat = await createRes.json();
    expect(cat.name).toBe('Food');

    const listRes = await request('GET', '/categories');
    const body = await listRes.json();
    expect(body.items.length).toBe(1);
  });

  it('creates, paginates, updates and deletes transactions', async () => {
    const catRes = await request('POST', '/categories', { name: 'Groceries', icon: 'cart' });
    const category = await catRes.json();

    const t1 = await request('POST', '/transactions', { amount: '12.34', currency: 'usd', categoryId: category.id, occurredAt: '2025-10-01T10:00:00.000Z' });
    expect(t1.status).toBe(201);
    const t2 = await request('POST', '/transactions', { amount: '5', currency: 'USD', categoryId: category.id, note: 'snack', occurredAt: '2025-10-02T11:00:00.000Z' });
    expect(t2.status).toBe(201);

    const list1 = await request('GET', '/transactions?limit=1');
    const body1 = await list1.json();
    expect(body1.items.length).toBe(1);
    expect(typeof body1.nextCursor === 'string' || body1.nextCursor === null).toBe(true);

    if (body1.nextCursor) {
      const list2 = await request('GET', `/transactions?cursor=${body1.nextCursor}&limit=10`);
      const body2 = await list2.json();
      expect(body2.items.length).toBeGreaterThan(0);
    }

    const created = await t1.json();
    const upd = await request('PATCH', `/transactions/${created.id}`, { note: 'updated' });
    expect(upd.status).toBe(200);
    const updated = await upd.json();
    expect(updated.note).toBe('updated');

    const del = await request('DELETE', `/transactions/${created.id}`);
    expect(del.status).toBe(204);

    const delAgain = await request('DELETE', `/transactions/${created.id}`);
    expect(delAgain.status).toBe(404);
  });
});
