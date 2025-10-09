import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/state/authStore';
import { validateConfig } from '../src/config/env';
import { AuthGate } from '../src/components/AuthGate';
import { usePushNotifications } from '../src/hooks/usePushNotifications';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function RootNavigator() {
  // Setup push notifications (requests permissions, registers device)
  usePushNotifications();

  return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
          <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
  );
}

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    // Validate environment configuration
    validateConfig();
    
    // Load stored authentication
    loadStoredAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <RootNavigator />
      </AuthGate>
    </QueryClientProvider>
  );
}

