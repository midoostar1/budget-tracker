import { Decimal } from 'decimal.js';

export interface Transaction {
  id: string;
  amount: Decimal;
  description: string;
  categoryId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionDTO {
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
  createdAt: Date;
}

export interface CategoryDTO {
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