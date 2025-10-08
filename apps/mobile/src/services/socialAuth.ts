import Constants from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { firebaseAuth } from '../services/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { api } from '../api/client';
import { Platform } from 'react-native';

export async function loginWithGoogle(): Promise<{ accessToken: string; user: any; refreshToken?: string }>{
  const extra: any = Constants.expoConfig?.extra || {};
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: extra.googleExpoClientId || extra.googleAndroidClientId || extra.googleIosClientId,
    iosClientId: extra.googleIosClientId,
    androidClientId: extra.googleAndroidClientId,
    responseType: 'id_token',
    scopes: ['profile', 'email'],
  });
  // In functional components, hooks must run at render time. Instead expose a wrapper in screen.
  throw new Error('loginWithGoogle must be called via hook-based helper. Use useGoogleLogin in SignInScreen.');
}

export function useGoogleLogin() {
  const extra: any = Constants.expoConfig?.extra || {};
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: extra.googleExpoClientId || extra.googleAndroidClientId || extra.googleIosClientId,
    iosClientId: extra.googleIosClientId,
    androidClientId: extra.googleAndroidClientId,
    responseType: 'id_token',
    scopes: ['profile', 'email'],
  });

  async function signIn() {
    const result = await promptAsync();
    if (result.type !== 'success') throw new Error('Google sign-in canceled');
    const googleIdToken = result.params.id_token as string;
    const credential = GoogleAuthProvider.credential(googleIdToken);
    await signInWithCredential(firebaseAuth, credential);
    const firebaseUser = firebaseAuth.currentUser;
    const firebaseIdToken = await firebaseUser?.getIdToken(true);
    if (!firebaseIdToken) throw new Error('Failed to obtain Firebase ID token');
    const backend = await api.post('/auth/social/login', { provider: 'google', idToken: firebaseIdToken });
    return backend.data as { accessToken: string; refreshToken?: string; user: any };
  }

  return { request, response, signIn };
}

export async function signInWithApple() {
  if (Platform.OS !== 'ios') throw new Error('Apple Sign-In is iOS only');
  const result = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
  });
  const identityToken = result.identityToken;
  if (!identityToken) throw new Error('No Apple identity token');
  const backend = await api.post('/auth/social/login', { provider: 'apple', idToken: identityToken });
  return backend.data as { accessToken: string; user: any };
}

export function useFacebookLogin() {
  const extra: any = Constants.expoConfig?.extra || {};
  const [request, response, promptAsync] = Facebook.useAuthRequest({ clientId: extra.facebookAppId, responseType: 'token' });
  async function signIn() {
    const result = await promptAsync();
    if (result.type !== 'success') throw new Error('Facebook sign-in canceled');
    const accessToken = result.params.access_token as string;
    const backend = await api.post('/auth/social/login', { provider: 'facebook', accessToken });
    return backend.data as { accessToken: string; user: any };
  }
  return { request, response, signIn };
}
