import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import { AuthContext } from '../auth/AuthContext';
import { useGoogleLogin, signInWithApple, useFacebookLogin } from '../services/socialAuth';

export default function SignInScreen({ navigation }: any) {
  const { setAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { signIn: googleSignIn } = useGoogleLogin();
  const { signIn: facebookSignIn } = useFacebookLogin();

  async function handleGoogle() {
    try {
      setLoading(true);
      const res = await googleSignIn();
      await setAuth(res.user, res.accessToken, res.refreshToken || null);
      navigation.replace('Profile');
    } catch (e: any) {
      console.warn(e?.message || e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApple() {
    try {
      setLoading(true);
      const res = await signInWithApple();
      await setAuth(res.user, res.accessToken, (res as any).refreshToken || null);
      navigation.replace('Profile');
    } catch (e: any) {
      console.warn(e?.message || e);
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebook() {
    try {
      setLoading(true);
      const res = await facebookSignIn();
      await setAuth(res.user, res.accessToken, (res as any).refreshToken || null);
      navigation.replace('Profile');
    } catch (e: any) {
      console.warn(e?.message || e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <View style={{ height: 12 }} />
      <Button title={loading ? 'Loading…' : 'Continue with Google'} onPress={handleGoogle} disabled={loading} />
      <View style={{ height: 12 }} />
      {Platform.OS === 'ios' && (
        <>
          <Button title={loading ? 'Loading…' : 'Sign in with Apple'} onPress={handleApple} disabled={loading} />
          <View style={{ height: 12 }} />
        </>
      )}
      <Button title={loading ? 'Loading…' : 'Continue with Facebook'} onPress={handleFacebook} disabled={loading} />
      <View style={{ height: 24 }} />
      <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>
        By offering Google or Facebook login on iOS, you must also offer Sign in with Apple.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold' },
});
