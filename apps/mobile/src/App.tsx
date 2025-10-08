import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import ProfileScreen from './screens/ProfileScreen';
import { AuthContext, AuthContextType, UserInfo } from './auth/AuthContext';
import { getStoredTokens, removeStoredTokens, setStoredTokens } from './auth/tokenStorage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const tokens = await getStoredTokens();
      if (tokens?.accessToken) setAccessToken(tokens.accessToken);
      setLoading(false);
    })();
  }, []);

  const authContextValue = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      setAuth: async (info, token, refreshToken) => {
        setUser(info);
        setAccessToken(token);
        await setStoredTokens({ accessToken: token, refreshToken: refreshToken || null });
      },
      clearAuth: async () => {
        setUser(null);
        setAccessToken(null);
        await removeStoredTokens();
      },
    }),
    [user, accessToken]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!accessToken ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="SignIn" component={SignInScreen} />
            </>
          ) : (
            <Stack.Screen name="Profile" component={ProfileScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
