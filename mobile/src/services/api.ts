import axios from 'axios';
import { Decimal } from 'decimal.js';

// Change this to your actual API URL
const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Transaction {
  id: string;
  amount: string;
  description: string;
  categoryId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const transactionsApi = {
  create: async (data: {
    amount: string;
    description: string;
    categoryId: string;
    date?: string;
  }): Promise<Transaction> => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  list: async (params?: {
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Transaction>> => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<{
      amount: string;
      description: string;
      categoryId: string;
      date: string;
    }>
  ): Promise<Transaction> => {
    const response = await api.patch(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data: {
    name: string;
    color: string;
    icon?: string;
  }): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },
};

export const formatAmount = (amount: string): string => {
  try {
    const decimal = new Decimal(amount);
    return decimal.toFixed(2);
  } catch {
    return '0.00';
  }
};

export default api;