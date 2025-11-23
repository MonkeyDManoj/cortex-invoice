import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

function RootNavigator() {
  const { appUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

 useEffect(() => {
    if (loading) return;

    // Freeze duplicate redirects
    let redirected = false;

    const inAuthGroup =
      segments[0] === '(staff)' ||
      segments[0] === '(manager)' ||
      segments[0] === '(owner)' ||
      segments[0] === '(accountant)';

    // 1. Not logged in && inside a protected group
    if (!appUser && inAuthGroup) {
      if (!redirected) {
        redirected = true;
        router.replace('/role-selection');
      }
      return;
    }

    if (!appUser) return;

    const role = appUser.role;
    const requiresBiometric = appUser.requires_biometric;

    // 2. Biometric lock flow
    if (requiresBiometric) {
     const current = `/${segments.join('/')}`;

      const needsUnlock =
        !segments.includes('biometric-unlock') &&
        !segments.includes('pin-unlock');

      if (needsUnlock && current !== '/biometric-unlock' && current !== '/pin-unlock') {
        if (!redirected) {
          redirected = true;
          router.replace('/biometric-unlock');
        }
        return;
      }
    }

    // 3. Role-based redirect (only redirect once)
    if (!redirected) {
      if (role === 'staff' && segments[0] !== '(staff)') {
        redirected = true;
        router.replace('/(staff)');
      }
      if (role === 'manager' && segments[0] !== '(manager)') {
        redirected = true;
        router.replace('/(manager)');
      }
      if (role === 'owner' && segments[0] !== '(owner)') {
        redirected = true;
        router.replace('/(owner)');
      }
      if (role === 'accountant' && segments[0] !== '(accountant)') {
        redirected = true;
        router.replace('/(accountant)');
      }
    }
  }, [appUser, loading, segments]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="login" />
      <Stack.Screen name="biometric-unlock" />
      <Stack.Screen name="pin-unlock" />
      <Stack.Screen name="(staff)" />
      <Stack.Screen name="(manager)" />
      <Stack.Screen name="(owner)" />
      <Stack.Screen name="(accountant)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
