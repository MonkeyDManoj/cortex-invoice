import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

function RootNavigator() {
  const { appUser, loading, appUserLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  // Prevent repeat redirects (the real fix)
  const lastRedirect = useRef<string | null>(null);

  const safeRedirect = (path: string) => {
    if (lastRedirect.current === path) return; // Prevent loops
    lastRedirect.current = path;
    router.replace(path);
  };

  useEffect(() => {
    if (loading || appUserLoading) return;

    // Always reset redirect memory on each new screen
    lastRedirect.current = null;

    const inRoleGroup =
      segments[0] === '(staff)' ||
      segments[0] === '(manager)' ||
      segments[0] === '(owner)' ||
      segments[0] === '(accountant)';

    // ------------------------------------------------------------
    // 1. NO USER LOGGED IN
    // ------------------------------------------------------------
    if (!appUser) {
      if (inRoleGroup) safeRedirect('/role-selection');
      return;
    }

    const role = appUser.role;
    const requiresBiometric = appUser.requires_biometric;

    // ------------------------------------------------------------
    // 2. BIOMETRIC LOCK FIRST
    // ALWAYS send user to biometric-unlock if required and not already there
    // ------------------------------------------------------------
    if (requiresBiometric) {
      const isOnUnlock =
        pathname === '/biometric-unlock' || pathname === '/pin-unlock';

      if (!isOnUnlock) {
        safeRedirect('/biometric-unlock');
        return;
      }

      // If they are already on unlock screen, do nothing
      if (isOnUnlock) return;
    }

    // ------------------------------------------------------------
    // 3. ROLE ROUTING (only AFTER biometric passes)
    // ------------------------------------------------------------
    const rolePathMap: Record<string, string> = {
      staff: '/(staff)',
      manager: '/(manager)',
      owner: '/(owner)',
      accountant: '/(accountant)',
    };

    const targetPath = rolePathMap[role];

    if (!pathname.startsWith(targetPath)) {
      safeRedirect(targetPath);
    }
  }, [appUser, loading, appUserLoading, pathname, segments]);

  if (loading || appUserLoading) {
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
      <Stack.Screen name="register" />
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
