// API Types

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  provider: 'google' | 'apple' | 'facebook';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: string | null;
  type: 'income' | 'expense';
  category: string;
  payee?: string | null;
  notes?: string | null;
  transactionDate: string;
  status: 'cleared' | 'pending_receipt';
  createdAt: string;
  updatedAt: string;
  receipt?: Receipt;
}

export interface Receipt {
  id: string;
  transactionId: string;
  imageUrl: string;
  ocrStatus: 'pending' | 'processed' | 'failed';
  ocrData?: any;
  createdAt: string;
  updatedAt: string;
  signedUrl?: string;
}

export interface Device {
  id: string;
  platform: 'ios' | 'android';
  createdAt: string;
}

export interface UserSubscription {
  tier: 'free' | 'premium';
  receiptsUsedThisMonth: number;
  receiptsLimitThisMonth: number;
  receiptsRemaining: number;
  monthlyResetDate: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

