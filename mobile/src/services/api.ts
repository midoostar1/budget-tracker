import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken } = response.data;
        await AsyncStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        await AsyncStorage.removeItem('accessToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface SocialLoginRequest {
  provider: 'google' | 'apple' | 'facebook';
  idToken?: string;
  accessToken?: string;
  identityToken?: string;
  authorizationCode?: string;
  user?: {
    email?: string;
    name?: string;
  };
}

export interface SocialLoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    profilePicture?: string;
  };
}

export const authApi = {
  socialLogin: async (data: SocialLoginRequest): Promise<SocialLoginResponse> => {
    const response = await api.post('/auth/social/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    await AsyncStorage.removeItem('accessToken');
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

export default api;
