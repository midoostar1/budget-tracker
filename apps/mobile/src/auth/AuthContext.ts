import { createContext } from 'react';

export type UserInfo = {
  id: string;
  email: string | null;
  name: string | null;
  image?: string | null;
};

export type AuthContextType = {
  user: UserInfo | null;
  accessToken: string | null;
  setAuth: (user: UserInfo, accessToken: string, refreshToken?: string | null) => Promise<void>;
  clearAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  async setAuth() {},
  async clearAuth() {},
});
