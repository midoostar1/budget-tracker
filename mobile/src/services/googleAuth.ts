import { 
  GoogleAuthProvider, 
  signInWithCredential,
  signInWithPopup,
  OAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// For web/development
const googleProvider = new GoogleAuthProvider();

export interface GoogleAuthResult {
  idToken: string;
  user: {
    email: string;
    name: string;
    photo?: string;
  };
}

export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    if (Platform.OS === 'web') {
      // Web sign-in
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;

      if (!idToken) {
        throw new Error('No ID token received');
      }

      return {
        idToken,
        user: {
          email: result.user.email || '',
          name: result.user.displayName || '',
          photo: result.user.photoURL || undefined,
        },
      };
    } else {
      // Mobile sign-in using expo-auth-session
      const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
        webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      });

      // This needs to be called in a component with hooks
      // For now, we'll use a direct implementation
      throw new Error('Google Sign-In for mobile requires component-level implementation');
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Alternative approach using Firebase Auth REST API for mobile
export const signInWithGoogleToken = async (idToken: string): Promise<GoogleAuthResult> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);

  return {
    idToken,
    user: {
      email: result.user.email || '',
      name: result.user.displayName || '',
      photo: result.user.photoURL || undefined,
    },
  };
};
