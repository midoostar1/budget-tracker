import api from './api';
import { User } from '../types';

export interface SocialLoginRequest {
  provider: 'google' | 'apple' | 'facebook';
  token: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface SocialLoginResponse {
  user: User;
  accessToken: string;
  message: string;
}

export const authService = {
  /**
   * Login with social provider
   */
  socialLogin: async (data: SocialLoginRequest): Promise<SocialLoginResponse> => {
    const response = await api.post('/api/auth/social-login', data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  /**
   * Logout current session
   */
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  /**
   * Logout from all devices
   */
  logoutAll: async (): Promise<void> => {
    await api.post('/api/auth/logout-all');
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

