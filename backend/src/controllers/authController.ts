import { Request, Response } from 'express';
import User from '../models/User';
import AccountProvider from '../models/AccountProvider';
import RefreshToken from '../models/RefreshToken';
import {
  verifyGoogleToken,
  verifyAppleToken,
  verifyFacebookToken,
} from '../services/providerVerification';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';

export async function socialLogin(req: Request, res: Response) {
  try {
    const { provider, idToken, accessToken, identityToken, authorizationCode, user: userData } = req.body;

    // Validate provider
    if (!['google', 'apple', 'facebook'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    let verifiedUser: any;
    let providerId: string;

    // Verify token based on provider
    switch (provider) {
      case 'google':
        if (!idToken) {
          return res.status(400).json({ error: 'ID token required for Google' });
        }
        verifiedUser = await verifyGoogleToken(idToken);
        providerId = verifiedUser.providerId;
        break;

      case 'apple':
        if (!identityToken) {
          return res.status(400).json({ error: 'Identity token required for Apple' });
        }
        verifiedUser = await verifyAppleToken(identityToken, authorizationCode);
        providerId = verifiedUser.providerId;
        // Apple might not provide email on subsequent logins
        if (!verifiedUser.email && userData?.email) {
          verifiedUser.email = userData.email;
        }
        if (!verifiedUser.name && userData?.name) {
          verifiedUser.name = userData.name;
        }
        break;

      case 'facebook':
        if (!accessToken) {
          return res.status(400).json({ error: 'Access token required for Facebook' });
        }
        verifiedUser = await verifyFacebookToken(accessToken);
        providerId = verifiedUser.providerId;
        break;

      default:
        return res.status(400).json({ error: 'Unsupported provider' });
    }

    if (!verifiedUser.email) {
      return res.status(400).json({ error: 'Email not provided by provider' });
    }

    // Find or create account provider
    let accountProvider = await AccountProvider.findOne({
      provider,
      providerId,
    });

    let user;

    if (accountProvider) {
      // Existing provider link, get user
      user = await User.findById(accountProvider.userId);
      
      if (!user) {
        // Orphaned provider record, clean up and create new user
        await AccountProvider.deleteOne({ _id: accountProvider._id });
        accountProvider = null;
      }
    }

    if (!accountProvider) {
      // Check if user exists with this email
      user = await User.findOne({ email: verifiedUser.email });

      if (!user) {
        // Create new user
        user = await User.create({
          email: verifiedUser.email,
          name: verifiedUser.name || userData?.name,
          profilePicture: verifiedUser.picture,
        });
      }

      // Create account provider link
      accountProvider = await AccountProvider.create({
        userId: user._id,
        provider,
        providerId,
        accessToken: provider === 'facebook' ? accessToken : undefined,
      });
    } else {
      // Update user info if needed
      if (verifiedUser.name && !user!.name) {
        user!.name = verifiedUser.name;
      }
      if (verifiedUser.picture && !user!.profilePicture) {
        user!.profilePicture = verifiedUser.picture;
      }
      await user!.save();
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user!._id.toString(),
      email: user!.email,
    };

    const jwtAccessToken = generateAccessToken(tokenPayload);
    const jwtRefreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database
    await RefreshToken.create({
      userId: user!._id,
      token: jwtRefreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', jwtRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token and user info
    res.json({
      accessToken: jwtAccessToken,
      user: {
        id: user!._id.toString(),
        email: user!.email,
        name: user!.name,
        profilePicture: user!.profilePicture,
      },
    });
  } catch (error: any) {
    console.error('Social login error:', error);
    res.status(500).json({ error: error.message || 'Authentication failed' });
  }
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: payload.userId,
    });

    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Get user
    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Delete refresh token from database
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}
