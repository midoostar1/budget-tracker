import axios from 'axios';
import Constants from 'expo-constants';
import { getStoredTokens, setStoredTokens } from '../auth/tokenStorage';

const baseURL = (Constants.expoConfig?.extra as any)?.apiUrl || 'http://localhost:4000';

export const api = axios.create({ baseURL, withCredentials: true });

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

api.interceptors.request.use(async (config) => {
  const tokens = await getStoredTokens();
  if (tokens?.accessToken) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => pendingRequests.push(resolve));
        return api(original);
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const tokens = await getStoredTokens();
        const refreshToken = tokens?.refreshToken || undefined;
        const res = await api.post('/auth/refresh', refreshToken ? { refreshToken } : undefined);
        const newAccess = res.data?.accessToken as string | undefined;
        const newRefresh = (res.data?.refreshToken as string | undefined) ?? tokens?.refreshToken ?? null;
        if (newAccess) {
          await setStoredTokens({ accessToken: newAccess, refreshToken: newRefresh });
          pendingRequests.forEach((fn) => fn());
          pendingRequests = [];
          return api(original);
        }
      } catch (e) {
        pendingRequests = [];
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
