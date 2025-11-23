import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import { Fingerprint, Lock, LogOut } from 'lucide-react-native';

export default function BiometricUnlockScreen() {
  const router = useRouter();
  const { appUser, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleBiometricUnlock = () => {
    setError('Biometric authentication will be implemented soon');
  };

  const handlePinUnlock = () => {
    router.push('/pin-unlock');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Fingerprint
              size={64}
              color={theme.colors.accents.iceDark}
              strokeWidth={1.5}
            />
          </View>
          <Text style={styles.title}>Unlock Required</Text>
          <Text style={styles.subtitle}>
            {appUser?.role === 'manager' ? 'Manager' : 'Owner'} access requires
            authentication
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleBiometricUnlock}
            activeOpacity={0.8}
          >
            <Fingerprint
              size={24}
              color={theme.colors.text.inverse}
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>
              Use Biometric
            </Text>
            <Text style={styles.buttonSubtext}>Face ID / Fingerprint</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePinUnlock}
            activeOpacity={0.7}
          >
            <Lock
              size={20}
              color={theme.colors.text.primary}
              style={styles.buttonIcon}
            />
            <Text style={styles.secondaryButtonText}>Use PIN Instead</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <LogOut size={16} color={theme.colors.text.secondary} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This verification happens each session for security
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.accents.ice,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: theme.colors.accents.fire,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.text.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  buttonIcon: {
    marginBottom: theme.spacing.sm,
  },
  primaryButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  buttonSubtext: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.inverse,
    marginTop: theme.spacing.xs,
    opacity: 0.8,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  signOutText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});
