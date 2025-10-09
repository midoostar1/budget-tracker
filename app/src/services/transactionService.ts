import api from './api';
import { Transaction, TransactionStats, PaginatedResponse } from '../types';

export interface CreateTransactionRequest {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  payee?: string;
  notes?: string;
  transactionDate: string;
  status?: 'cleared' | 'pending_receipt';
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: 'cleared' | 'pending_receipt';
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'transactionDate' | 'amount' | 'createdAt' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export const transactionService = {
  /**
   * Get paginated transactions
   */
  getTransactions: async (filters?: TransactionFilters) => {
    const response = await api.get<PaginatedResponse<Transaction>>('/api/transactions', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single transaction
   */
  getTransaction: async (id: string) => {
    const response = await api.get<{ transaction: Transaction }>(`/api/transactions/${id}`);
    return response.data;
  },

  /**
   * Create transaction
   */
  createTransaction: async (data: CreateTransactionRequest) => {
    const response = await api.post<{ transaction: Transaction }>('/api/transactions', data);
    return response.data;
  },

  /**
   * Update transaction
   */
  updateTransaction: async (id: string, data: Partial<CreateTransactionRequest>) => {
    const response = await api.put<{ transaction: Transaction }>(`/api/transactions/${id}`, data);
    return response.data;
  },

  /**
   * Delete transaction
   */
  deleteTransaction: async (id: string) => {
    await api.delete(`/api/transactions/${id}`);
  },

  /**
   * Get transaction statistics
   */
  getStats: async (startDate?: string, endDate?: string) => {
    const response = await api.get<{ stats: TransactionStats }>('/api/transactions/stats', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

