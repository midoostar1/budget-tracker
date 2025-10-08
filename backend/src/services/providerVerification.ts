import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import axios from 'axios';

// Google verification
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUserInfo {
  providerId: string;
  email: string;
  name?: string;
  picture?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    return {
      providerId: payload.sub,
      email: payload.email || '',
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Failed to verify Google token');
  }
}

// Apple verification
export interface AppleUserInfo {
  providerId: string;
  email?: string;
  name?: string;
}

export async function verifyAppleToken(
  identityToken: string,
  authorizationCode?: string
): Promise<AppleUserInfo> {
  try {
    const appleIdTokenType = await appleSignin.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID || '',
      ignoreExpiration: false,
    });

    return {
      providerId: appleIdTokenType.sub,
      email: appleIdTokenType.email,
    };
  } catch (error) {
    console.error('Apple token verification error:', error);
    throw new Error('Failed to verify Apple token');
  }
}

// Facebook verification
export interface FacebookUserInfo {
  providerId: string;
  email?: string;
  name?: string;
  picture?: string;
}

export async function verifyFacebookToken(accessToken: string): Promise<FacebookUserInfo> {
  try {
    // Verify token with Facebook
    const appTokenResponse = await axios.get(
      `https://graph.facebook.com/oauth/access_token`,
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          grant_type: 'client_credentials',
        },
      }
    );

    const appToken = appTokenResponse.data.access_token;

    // Debug token to verify it's valid
    const debugResponse = await axios.get(
      `https://graph.facebook.com/debug_token`,
      {
        params: {
          input_token: accessToken,
          access_token: appToken,
        },
      }
    );

    if (!debugResponse.data.data.is_valid) {
      throw new Error('Invalid Facebook token');
    }

    // Get user info
    const userResponse = await axios.get(
      `https://graph.facebook.com/me`,
      {
        params: {
          fields: 'id,email,name,picture',
          access_token: accessToken,
        },
      }
    );

    const userData = userResponse.data;

    return {
      providerId: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture?.data?.url,
    };
  } catch (error) {
    console.error('Facebook token verification error:', error);
    throw new Error('Failed to verify Facebook token');
  }
}
