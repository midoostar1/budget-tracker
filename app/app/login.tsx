import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '../src/theme';
import { useAuth } from '../src/hooks/useAuth';
import {
  signInWithGoogle,
  signInWithApple,
  signInWithFacebook,
} from '../src/services/socialAuth';
import { setupPushNotifications } from '../src/services/pushNotifications';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const handleSocialLogin = async (
    provider: 'google' | 'apple' | 'facebook',
    signInFunction: () => Promise<any>
  ) => {
    try {
      setLoading(true);
      setActiveProvider(provider);

      // Call the social authentication function
      const result = await signInFunction();

      if (!result) {
        throw new Error('Authentication cancelled');
      }

      // Login with backend and store tokens
      await login(result.user, result.accessToken);

      // Register device for push notifications (non-blocking)
      setupPushNotifications().catch((error) => {
        console.warn('Failed to setup push notifications:', error);
        // Don't block login flow if push notification setup fails
      });

      // Navigate to dashboard
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      
      // Show user-friendly error
      Alert.alert(
        'Authentication Error',
        error instanceof Error ? error.message : `Failed to sign in with ${provider}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setActiveProvider(null);
    }
  };

  const handleGoogleSignIn = () => {
    handleSocialLogin('google', signInWithGoogle);
  };

  const handleAppleSignIn = () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign In is only available on iOS devices');
      return;
    }
    handleSocialLogin('apple', signInWithApple);
  };

  const handleFacebookSignIn = () => {
    handleSocialLogin('facebook', signInWithFacebook);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Budget Tracker</Text>
          <Text style={styles.subtitle}>
            Track your expenses, scan receipts, and manage your budget
          </Text>
        </View>

        {/* Login Buttons */}
        <View style={styles.buttonContainer}>
          {/* Google Sign In */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.googleButton,
              loading && activeProvider !== 'google' && styles.buttonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading && activeProvider === 'google' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonIcon}>G</Text>
                <Text style={styles.buttonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign In (iOS only) */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.appleButton,
                loading && activeProvider !== 'apple' && styles.buttonDisabled,
              ]}
              onPress={handleAppleSignIn}
              disabled={loading}
            >
              {loading && activeProvider === 'apple' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonIcon}></Text>
                  <Text style={styles.buttonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Facebook Login */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.facebookButton,
              loading && activeProvider !== 'facebook' && styles.buttonDisabled,
            ]}
            onPress={handleFacebookSignIn}
            disabled={loading}
          >
            {loading && activeProvider === 'facebook' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonIcon}>f</Text>
                <Text style={styles.buttonText}>Continue with Facebook</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl * 2,
  },
  title: {
    fontSize: 36,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    marginRight: theme.spacing.md,
  },
  buttonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  terms: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
    lineHeight: 18,
  },
});

