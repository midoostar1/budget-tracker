import api from './api';
import { Receipt } from '../types';
import axios from 'axios';

export class QuotaExceededError extends Error {
  code: string;
  usage: {
    used: number;
    limit: number;
    remaining: number;
  };

  constructor(code: string, message: string, usage: any) {
    super(message);
    this.name = 'QuotaExceededError';
    this.code = code;
    this.usage = usage;
  }
}

export const receiptService = {
  /**
   * Upload receipt image
   * Throws QuotaExceededError if free tier limit reached
   */
  uploadReceipt: async (imageUri: string) => {
    try {
      const formData = new FormData();
      
      // Create file object for upload
      const file: any = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      };
      
      formData.append('image', file);

      const response = await api.post<{
        transactionId: string;
        receiptId: string;
        signedUrl?: string;
        message: string;
      }>('/api/receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      // Handle quota exceeded error (402)
      if (axios.isAxiosError(error) && error.response?.status === 402) {
        const data = error.response.data;
        throw new QuotaExceededError(
          data.code || 'FREE_QUOTA_EXCEEDED',
          data.message || 'Receipt quota exceeded',
          data.usage || { used: 10, limit: 10, remaining: 0 }
        );
      }
      throw error;
    }
  },

  /**
   * Get receipt with signed URL
   */
  getReceipt: async (id: string, expiration: number = 60) => {
    const response = await api.get<{ receipt: Receipt }>(`/api/receipts/${id}`, {
      params: { expiration },
    });
    return response.data;
  },

  /**
   * Delete receipt
   */
  deleteReceipt: async (id: string) => {
    await api.delete(`/api/receipts/${id}`);
  },

  /**
   * Process receipt with OCR
   */
  processReceipt: async (id: string) => {
    const response = await api.post(`/api/receipts/process/${id}`);
    return response.data;
  },

  /**
   * Get receipts for a transaction
   */
  getTransactionReceipts: async (transactionId: string) => {
    const response = await api.get<{ receipts: Receipt[] }>(
      `/api/receipts/transaction/${transactionId}`
    );
    return response.data;
  },
};

