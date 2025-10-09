import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Transactions' }} />
        <Stack.Screen name="add" options={{ title: 'Add Transaction', presentation: 'modal' }} />
        <Stack.Screen name="categories" options={{ title: 'Pick Category' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
