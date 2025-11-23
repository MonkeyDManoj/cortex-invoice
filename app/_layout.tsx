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

    const inAuthGroup = segments[0] === '(staff)' ||
                       segments[0] === '(manager)' ||
                       segments[0] === '(owner)' ||
                       segments[0] === '(accountant)';

    if (!appUser && inAuthGroup) {
      router.replace('/role-selection');
    } else if (appUser) {
      const role = appUser.role;
      const requiresBiometric = appUser.requires_biometric;

      if (requiresBiometric && !segments.includes('biometric-unlock') && !segments.includes('pin-unlock')) {
        const currentPath = `/${segments.join('/')}`;
        if (currentPath !== '/biometric-unlock' && currentPath !== '/pin-unlock') {
          router.replace('/biometric-unlock');
          return;
        }
      }

      if (!requiresBiometric || segments.includes('biometric-unlock') || segments.includes('pin-unlock')) {
        if (role === 'staff' && segments[0] !== '(staff)') {
          router.replace('/(staff)');
        } else if (role === 'manager' && segments[0] !== '(manager)') {
          router.replace('/(manager)');
        } else if (role === 'owner' && segments[0] !== '(owner)') {
          router.replace('/(owner)');
        } else if (role === 'accountant' && segments[0] !== '(accountant)') {
          router.replace('/(accountant)');
        }
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
