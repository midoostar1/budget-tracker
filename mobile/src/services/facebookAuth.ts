import * as Facebook from 'expo-facebook';

export interface FacebookAuthResult {
  accessToken: string;
  user: {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
  };
}

export const signInWithFacebook = async (): Promise<FacebookAuthResult> => {
  try {
    // Initialize Facebook SDK
    await Facebook.initializeAsync({
      appId: process.env.FACEBOOK_APP_ID || '',
    });

    const result = await Facebook.logInWithReadPermissionsAsync({
      permissions: ['public_profile', 'email'],
    });

    if (result.type !== 'success') {
      throw new Error('Facebook login was canceled or failed');
    }

    const { token } = result;

    // Fetch user profile
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`
    );
    const userData = await response.json();

    return {
      accessToken: token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture?.data?.url,
      },
    };
  } catch (error) {
    console.error('Facebook sign-in error:', error);
    throw error;
  }
};
