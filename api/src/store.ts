import { v4 as uuid } from 'uuid';
import Decimal from 'decimal.js';
import type { Category, Transaction } from './schemas.js';

const categories = new Map<string, Category>();
const transactions = new Map<string, Transaction>();

export const store = {
  createCategory(name: string, icon: string): Category {
    const id = uuid();
    const category: Category = { id, name, icon };
    categories.set(id, category);
    return category;
  },
  listCategories(): Category[] {
    return [...categories.values()];
  },
  getCategory(id: string): Category | undefined {
    return categories.get(id);
  },
  createTransaction(input: Omit<Transaction, 'id'>): Transaction {
    // Validate Decimal at store-level too
    const _ = new Decimal(input.amount);
    const id = uuid();
    const tx: Transaction = { id, ...input };
    transactions.set(id, tx);
    return tx;
  },
  listTransactions(params: { from?: string; to?: string; limit: number; cursor?: string }): { items: Transaction[]; nextCursor: string | null } {
    let items = [...transactions.values()];
    if (params.from) items = items.filter(t => new Date(t.occurredAt) >= new Date(params.from!));
    if (params.to) items = items.filter(t => new Date(t.occurredAt) <= new Date(params.to!));

    // Sort by occurredAt desc, then id desc for stable cursor
    items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id));

    if (params.cursor) {
      const idx = items.findIndex(t => t.id === params.cursor);
      if (idx >= 0) items = items.slice(idx + 1);
    }

    const page = items.slice(0, params.limit);
    const nextCursor = page.length === params.limit ? page[page.length - 1].id : null;
    return { items: page, nextCursor };
  },
  getTransaction(id: string): Transaction | undefined {
    return transactions.get(id);
  },
  updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id'>>): Transaction | undefined {
    const current = transactions.get(id);
    if (!current) return undefined;
    const merged = { ...current, ...updates } as Transaction;
    if (updates.amount !== undefined) new Decimal(updates.amount); // validate
    transactions.set(id, merged);
    return merged;
  },
  deleteTransaction(id: string): boolean {
    return transactions.delete(id);
  },
  _reset() {
    categories.clear();
    transactions.clear();
  }
};
