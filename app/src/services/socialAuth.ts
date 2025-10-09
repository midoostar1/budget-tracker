import { Platform } from 'react-native';
import { authService } from './authService';
import ENV from '../config/env';

// Conditional imports for native modules (not available in Expo Go)
let GoogleSignin: any;
let appleAuth: any;
let LoginManager: any;
let AccessToken: any;

try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  console.warn('Google Sign-In not available (use development build)');
}

try {
  appleAuth = require('@invertase/react-native-apple-authentication').default;
} catch (e) {
  console.warn('Apple Sign-In not available (use development build)');
}

try {
  const fbsdk = require('react-native-fbsdk-next');
  LoginManager = fbsdk.LoginManager;
  AccessToken = fbsdk.AccessToken;
} catch (e) {
  console.warn('Facebook SDK not available (use development build)');
}

/**
 * Initialize Google Sign-In
 */
export function initializeGoogleSignIn() {
  if (!GoogleSignin) {
    throw new Error('Google Sign-In is not available. Please use a development build.');
  }
  
  GoogleSignin.configure({
    webClientId: ENV.googleWebClientId,
    iosClientId: ENV.googleIosClientId,
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    if (!GoogleSignin) {
      throw new Error('Google Sign-In requires a development build. Not available in Expo Go.');
    }

    // Initialize if not already done
    initializeGoogleSignIn();

    // Check if device supports Google Play Services (Android)
    await GoogleSignin.hasPlayServices();

    // Sign in
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.data?.idToken) {
      throw new Error('No ID token received from Google');
    }

    // Send to backend
    const response = await authService.socialLogin({
      provider: 'google',
      token: userInfo.data.idToken,
      email: userInfo.data.user.email,
      firstName: userInfo.data.user.givenName || undefined,
      lastName: userInfo.data.user.familyName || undefined,
    });

    return response;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

/**
 * Sign in with Apple (iOS only)
 */
export async function signInWithApple() {
  try {
    if (!appleAuth) {
      throw new Error('Apple Sign-In requires a development build. Not available in Expo Go.');
    }
    
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign In is only available on iOS');
    }

    // Perform sign in
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Get credential state
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user
    );

    if (credentialState !== appleAuth.State.AUTHORIZED) {
      throw new Error('Apple Sign In failed');
    }

    const { identityToken, fullName, email } = appleAuthRequestResponse;

    if (!identityToken) {
      throw new Error('No identity token received from Apple');
    }

    // Send to backend
    const response = await authService.socialLogin({
      provider: 'apple',
      token: identityToken,
      email: email || undefined,
      firstName: fullName?.givenName || undefined,
      lastName: fullName?.familyName || undefined,
    });

    return response;
  } catch (error) {
    if ((error as any).code === appleAuth.Error.CANCELED) {
      throw new Error('Apple Sign In was cancelled');
    }
    console.error('Apple Sign In Error:', error);
    throw error;
  }
}

/**
 * Sign in with Facebook
 */
export async function signInWithFacebook() {
  try {
    if (!LoginManager || !AccessToken) {
      throw new Error('Facebook SDK requires a development build. Not available in Expo Go.');
    }

    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      throw new Error('Facebook login was cancelled');
    }

    // Get access token
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw new Error('No access token received from Facebook');
    }

    // Send to backend
    const response = await authService.socialLogin({
      provider: 'facebook',
      token: data.accessToken,
    });

    return response;
  } catch (error) {
    console.error('Facebook Sign In Error:', error);
    throw error;
  }
}

/**
 * Sign out from all providers
 */
export async function signOutFromProviders() {
  try {
    // Google - attempt to sign out (will fail silently if not signed in)
    if (GoogleSignin) {
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // User may not be signed in with Google
      }
    }

    // Facebook
    if (LoginManager) {
      LoginManager.logOut();
    }

    // Apple doesn't require explicit sign out
  } catch (error) {
    console.error('Error signing out from providers:', error);
  }
}

