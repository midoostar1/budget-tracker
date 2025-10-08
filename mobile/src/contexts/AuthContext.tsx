import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, SocialLoginResponse } from '../services/api';
import { signInWithApple, AppleAuthResult } from '../services/appleAuth';
import { signInWithFacebook, FacebookAuthResult } from '../services/facebookAuth';
import { signInWithGoogleToken } from '../services/googleAuth';

interface User {
  id: string;
  email: string;
  name?: string;
  profilePicture?: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userJson = await AsyncStorage.getItem('user');
      
      if (token && userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (response: SocialLoginResponse) => {
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setIsLoading(true);
      
      // Verify token with Firebase and get user info
      const googleUser = await signInWithGoogleToken(idToken);
      
      // Exchange with backend
      const response = await authApi.socialLogin({
        provider: 'google',
        idToken,
        user: {
          email: googleUser.user.email,
          name: googleUser.user.name,
        },
      });

      await handleAuthSuccess(response);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      
      const appleResult: AppleAuthResult = await signInWithApple();
      
      // Exchange with backend
      const response = await authApi.socialLogin({
        provider: 'apple',
        identityToken: appleResult.identityToken,
        authorizationCode: appleResult.authorizationCode,
        user: appleResult.user,
      });

      await handleAuthSuccess(response);
    } catch (error) {
      console.error('Apple sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setIsLoading(true);
      
      const facebookResult: FacebookAuthResult = await signInWithFacebook();
      
      // Exchange with backend
      const response = await authApi.socialLogin({
        provider: 'facebook',
        accessToken: facebookResult.accessToken,
        user: {
          email: facebookResult.user.email,
          name: facebookResult.user.name,
        },
      });

      await handleAuthSuccess(response);
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle: handleGoogleSignIn,
        signInWithApple: handleAppleSignIn,
        signInWithFacebook: handleFacebookSignIn,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
