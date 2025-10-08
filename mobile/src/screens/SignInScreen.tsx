import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../contexts/AuthContext';

export default function SignInScreen() {
  const { signInWithGoogle, signInWithApple, signInWithFacebook } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // Note: For mobile, you would use expo-auth-session
      // This is a simplified version - see documentation for full implementation
      Alert.alert(
        'Google Sign-In',
        'Please configure Google Sign-In in your Firebase console and implement the auth flow'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithApple();
    } catch (error: any) {
      if (!error.message?.includes('canceled')) {
        Alert.alert('Error', error.message || 'Failed to sign in with Apple');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);
      await signInWithFacebook();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in with Facebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Choose your preferred sign-in method
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          {/* Google Sign-In */}
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text style={styles.socialButtonIcon}>G</Text>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Apple Sign-In - iOS only */}
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Facebook Sign-In */}
          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            onPress={handleFacebookSignIn}
            disabled={loading}
          >
            <Text style={styles.socialButtonIcon}>f</Text>
            <Text style={[styles.socialButtonText, styles.facebookButtonText]}>
              Continue with Facebook
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {Platform.OS === 'ios'
              ? 'Sign in with Apple, Google, or Facebook to continue'
              : 'Sign in with Google or Facebook to continue'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  appleButton: {
    height: 56,
  },
  socialButtonIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  facebookButtonText: {
    color: '#fff',
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
