import { Transaction, Category, TransactionDTO, CategoryDTO } from './types';
import { Decimal } from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with database in production)
class Storage {
  private transactions: Map<string, Transaction> = new Map();
  private categories: Map<string, Category> = new Map();

  constructor() {
    // Initialize with some default categories
    this.seedCategories();
  }

  private seedCategories() {
    const defaultCategories = [
      { name: 'Food & Dining', color: '#FF6B6B', icon: '🍔' },
      { name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
      { name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
      { name: 'Entertainment', color: '#FFA07A', icon: '🎬' },
      { name: 'Bills & Utilities', color: '#98D8C8', icon: '💡' },
      { name: 'Health', color: '#F7DC6F', icon: '🏥' },
      { name: 'Income', color: '#82E0AA', icon: '💰' },
      { name: 'Other', color: '#D7BDE2', icon: '📦' },
    ];

    defaultCategories.forEach(cat => {
      const category: Category = {
        id: uuidv4(),
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        createdAt: new Date(),
      };
      this.categories.set(category.id, category);
    });
  }

  // Transactions
  createTransaction(data: {
    amount: Decimal;
    description: string;
    categoryId: string;
    date?: Date;
  }): Transaction {
    const transaction: Transaction = {
      id: uuidv4(),
      amount: data.amount,
      description: data.description,
      categoryId: data.categoryId,
      date: data.date || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  getTransactions(filters?: {
    from?: Date;
    to?: Date;
  }): Transaction[] {
    let transactions = Array.from(this.transactions.values());

    if (filters?.from) {
      transactions = transactions.filter(t => t.date >= filters.from!);
    }
    if (filters?.to) {
      transactions = transactions.filter(t => t.date <= filters.to!);
    }

    // Sort by date descending (newest first)
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  updateTransaction(
    id: string,
    updates: Partial<Pick<Transaction, 'amount' | 'description' | 'categoryId' | 'date'>>
  ): Transaction | undefined {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updated: Transaction = {
      ...transaction,
      ...updates,
      updatedAt: new Date(),
    };
    this.transactions.set(id, updated);
    return updated;
  }

  deleteTransaction(id: string): boolean {
    return this.transactions.delete(id);
  }

  // Categories
  createCategory(data: {
    name: string;
    color: string;
    icon?: string;
  }): Category {
    const category: Category = {
      id: uuidv4(),
      name: data.name,
      color: data.color,
      icon: data.icon,
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  getCategories(): Category[] {
    return Array.from(this.categories.values()).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.get(id);
  }

  // Helpers
  transactionToDTO(transaction: Transaction): TransactionDTO {
    return {
      id: transaction.id,
      amount: transaction.amount.toString(),
      description: transaction.description,
      categoryId: transaction.categoryId,
      date: transaction.date.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };
  }

  categoryToDTO(category: Category): CategoryDTO {
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      createdAt: category.createdAt.toISOString(),
    };
  }
}

export const storage = new Storage();