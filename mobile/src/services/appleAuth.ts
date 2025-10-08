import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export interface AppleAuthResult {
  identityToken: string;
  authorizationCode: string;
  user: {
    email?: string;
    name?: string;
  };
}

export const signInWithApple = async (): Promise<AppleAuthResult> => {
  try {
    // Check if Apple Authentication is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Note: fullName is only provided on first sign-in
    const name = credential.fullName
      ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
      : undefined;

    if (!credential.identityToken) {
      throw new Error('No identity token received');
    }

    return {
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode || '',
      user: {
        email: credential.email || undefined,
        name,
      },
    };
  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      throw new Error('Apple Sign-In was canceled');
    }
    console.error('Apple sign-in error:', error);
    throw error;
  }
};
