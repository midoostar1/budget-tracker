import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuthStore } from '../state/authStore';
import { theme } from '../theme';

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * AuthGate component
 * 
 * Protects routes and redirects unauthenticated users to login.
 * Handles authentication state changes and navigation.
 */
export function AuthGate({ children }: AuthGateProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      // Still checking authentication status
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected route
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      // Redirect to dashboard if authenticated and on login screen
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

