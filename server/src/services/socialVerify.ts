import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import axios from 'axios';
import { config } from '../config';
import { logger } from '../lib/logger';

export interface SocialProfile {
  providerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

/**
 * Verify Google ID Token
 * @param idToken - Google ID token from client
 * @param audience - Google client ID (defaults to GOOGLE_WEB_CLIENT_ID from config)
 */
export async function verifyGoogleIdToken(
  idToken: string,
  audience?: string
): Promise<SocialProfile> {
  try {
    // Accept tokens from web, iOS, and Android clients
    const validAudiences = [
      config.GOOGLE_WEB_CLIENT_ID,
      config.GOOGLE_ANDROID_CLIENT_ID,
      config.GOOGLE_IOS_CLIENT_ID,
    ].filter((id): id is string => typeof id === 'string' && id.length > 0);

    // DEBUG: Log what audiences we're accepting
    logger.info({ 
      validAudiences,
      webClientId: config.GOOGLE_WEB_CLIENT_ID,
      androidClientId: config.GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: config.GOOGLE_IOS_CLIENT_ID,
    }, 'Google token verification - valid audiences');

    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
      idToken,
      audience: audience || validAudiences,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    if (!payload.email) {
      throw new Error('Email not provided by Google');
    }

    return {
      providerId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to verify Google ID token');
    throw new Error(
      `Google token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify Apple Identity Token
 * @param identityToken - Apple identity token (JWT) from client
 * @param audience - Apple bundle ID or service ID (defaults to APPLE_BUNDLE_ID from config)
 */
export async function verifyAppleIdentityToken(
  identityToken: string,
  audience?: string
): Promise<SocialProfile> {
  try {
    const appleIdTokenClaims = await appleSignin.verifyIdToken(identityToken, {
      audience: audience || config.APPLE_BUNDLE_ID,
      // Apple's issuer
      ignoreExpiration: false,
    });

    if (!appleIdTokenClaims.sub) {
      throw new Error('Invalid Apple token: missing subject');
    }

    // Apple may return email or a private relay email
    let email = appleIdTokenClaims.email || '';
    
    // If email is not provided (user chose to hide email), generate a unique identifier
    // In production, you'd handle private relay emails properly
    if (!email && appleIdTokenClaims.sub) {
      // Apple private relay format: user_id@privaterelay.appleid.com
      // For this implementation, we'll require email from the client-side user object
      throw new Error('Email not provided by Apple. Please handle user object from client.');
    }

    // Parse name from token if available
    // Note: Name is only provided on first sign-in, client should send it separately
    const firstName = undefined;
    const lastName = undefined;

    return {
      providerId: appleIdTokenClaims.sub,
      email: email,
      firstName,
      lastName,
      emailVerified: appleIdTokenClaims.email_verified === 'true',
    };
  } catch (error) {
    logger.error({ error }, 'Failed to verify Apple identity token');
    throw new Error(
      `Apple token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify Facebook Access Token
 * @param accessToken - Facebook access token from client
 * @returns User profile information
 */
export async function verifyFacebookToken(accessToken: string): Promise<SocialProfile> {
  try {
    const appId = config.FACEBOOK_APP_ID;
    const appSecret = config.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error('Facebook app credentials not configured');
    }

    // Step 1: Verify token using debug_token endpoint
    const debugTokenUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`;

    const debugResponse = await axios.get(debugTokenUrl);
    const debugData = debugResponse.data.data;

    // Validate the token
    if (!debugData.is_valid) {
      throw new Error('Invalid Facebook token');
    }

    if (debugData.app_id !== appId) {
      throw new Error('Token does not belong to this app');
    }

    // Check if token is expired
    if (debugData.expires_at && debugData.expires_at < Date.now() / 1000) {
      throw new Error('Facebook token has expired');
    }

    const userId = debugData.user_id;

    // Step 2: Fetch user profile information
    const profileUrl = `https://graph.facebook.com/v18.0/${userId}?fields=id,email,first_name,last_name&access_token=${accessToken}`;

    const profileResponse = await axios.get(profileUrl);
    const profileData = profileResponse.data;

    if (!profileData.email) {
      throw new Error('Email not provided by Facebook. User must grant email permission.');
    }

    return {
      providerId: profileData.id,
      email: profileData.email,
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      emailVerified: true, // Facebook emails are considered verified
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        { error: error.response?.data || error.message },
        'Facebook API error'
      );
      throw new Error(
        `Facebook token verification failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
    logger.error({ error }, 'Failed to verify Facebook token');
    throw new Error(
      `Facebook token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify social provider token based on provider type
 */
export async function verifySocialToken(
  provider: 'google' | 'apple' | 'facebook',
  token: string,
  additionalData?: { email?: string; firstName?: string; lastName?: string }
): Promise<SocialProfile> {
  switch (provider) {
    case 'google':
      return verifyGoogleIdToken(token);

    case 'apple': {
      const profile = await verifyAppleIdentityToken(token);
      // For Apple, merge additional data sent from client (name is only in first sign-in)
      return {
        ...profile,
        email: profile.email || additionalData?.email || '',
        firstName: additionalData?.firstName || profile.firstName,
        lastName: additionalData?.lastName || profile.lastName,
      };
    }

    case 'facebook':
      return verifyFacebookToken(token);

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}


