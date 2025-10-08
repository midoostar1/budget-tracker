import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import { Button } from '@packages/ui';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Welcome to Finance App</Text>
      <Link href="/camera" asChild>
        <Button label="Scan a receipt" />
      </Link>
    </SafeAreaView>
  );
}
