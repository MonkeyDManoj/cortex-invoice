import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import {
  LayoutDashboard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
} from 'lucide-react-native';

export default function OwnerDashboardScreen() {
  const { appUser, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err: any) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {appUser?.full_name || 'Owner'}</Text>
          <Text style={styles.subtitle}>Full oversight of invoice operations</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.accents.tree }]}>
            <CheckCircle
              size={32}
              color={theme.colors.accents.treeDark}
              strokeWidth={2}
            />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.accents.fire }]}>
            <Clock size={32} color={theme.colors.accents.fireDark} strokeWidth={2} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.accents.water }]}>
            <TrendingUp
              size={32}
              color={theme.colors.accents.waterDark}
              strokeWidth={2}
            />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.accents.ice }]}>
            <AlertTriangle
              size={32}
              color={theme.colors.accents.iceDark}
              strokeWidth={2}
            />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Flagged</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyActivityState}>
            <LayoutDashboard
              size={48}
              color={theme.colors.text.tertiary}
              strokeWidth={1.5}
            />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  emptyActivityState: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.tertiary,
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
