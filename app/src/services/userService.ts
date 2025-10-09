import api from './api';
import { User, Device } from '../types';

export interface UserSubscription {
  tier: 'free' | 'premium';
  receiptsUsedThisMonth: number;
  receiptsLimitThisMonth: number;
  receiptsRemaining: number;
  monthlyResetDate: string;
}

export interface UserProfile {
  user: User;
  subscription: UserSubscription;
}

export const userService = {
  /**
   * Get current user profile with subscription info
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  /**
   * Get user subscription and usage
   */
  getSubscription: async (): Promise<UserSubscription> => {
    const response = await api.get('/api/users/subscription');
    return response.data;
  },

  /**
   * Get all registered devices
   */
  getDevices: async (): Promise<{ devices: Device[] }> => {
    const response = await api.get('/api/users/devices');
    return response.data;
  },

  /**
   * Register a new device
   */
  registerDevice: async (fcmToken: string, platform: 'ios' | 'android') => {
    const response = await api.post('/api/users/register-device', {
      fcmToken,
      platform,
    });
    return response.data;
  },

  /**
   * Unregister a device
   */
  unregisterDevice: async (deviceId: string) => {
    await api.delete(`/api/users/devices/${deviceId}`);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: { firstName?: string; lastName?: string }) => {
    const response = await api.put('/api/users/profile', data);
    return response.data;
  },
};

