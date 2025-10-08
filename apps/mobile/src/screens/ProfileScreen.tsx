import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../auth/AuthContext';
import { api } from '../api/client';

export default function ProfileScreen({ navigation }: any) {
  const { clearAuth } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/me');
        setProfile(res.data);
      } catch (e) {
        console.warn('Failed to fetch profile:', e);
      }
    })();
  }, []);

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {}
    await clearAuth();
    navigation.replace('Welcome');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {profile && (
        <>
          <Text>ID: {profile.id}</Text>
          <Text>Email: {profile.email || '-'}</Text>
          <Text>Name: {profile.name || '-'}</Text>
        </>
      )}
      <View style={{ height: 16 }} />
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
});
