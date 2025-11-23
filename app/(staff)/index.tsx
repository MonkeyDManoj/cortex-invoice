import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import { Camera, Image as ImageIcon, Upload, LogOut } from 'lucide-react-native';

export default function StaffCaptureScreen() {
  const { appUser, signOut } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  const handleCameraCapture = () => {
    setStatus('Camera capture will be implemented in next phase');
  };

  const handleGalleryPick = () => {
    setStatus('Gallery picker will be implemented in next phase');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err: any) {
      setStatus(err.message || 'Sign out failed');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {appUser?.full_name || 'Staff'}</Text>
          <Text style={styles.subtitle}>Capture and upload invoices</Text>
        </View>

        {status && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.accents.water }]}
            onPress={handleCameraCapture}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <Camera size={48} color={theme.colors.accents.waterDark} strokeWidth={1.5} />
            </View>
            <Text style={styles.actionTitle}>Capture Invoice</Text>
            <Text style={styles.actionDescription}>Take a photo of an invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.accents.ice }]}
            onPress={handleGalleryPick}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <ImageIcon size={48} color={theme.colors.accents.iceDark} strokeWidth={1.5} />
            </View>
            <Text style={styles.actionTitle}>Choose from Gallery</Text>
            <Text style={styles.actionDescription}>Select an existing photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Upload size={20} color={theme.colors.text.secondary} />
          <Text style={styles.infoText}>
            Capture clear photos of invoices for processing
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <LogOut size={16} color={theme.colors.text.secondary} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  statusContainer: {
    backgroundColor: theme.colors.accents.ice,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statusText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  actionsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  actionIconContainer: {
    marginBottom: theme.spacing.md,
  },
  actionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  actionDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  signOutText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
});
