import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Finance' }} />
      <Stack.Screen name="camera" options={{ title: 'Scan Receipt' }} />
    </Stack>
  );
}
