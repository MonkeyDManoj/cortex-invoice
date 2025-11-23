import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { UserRole } from '@/types/database.types';
import { theme } from '@/constants/theme';
import { Users, Shield, Crown, Calculator } from 'lucide-react-native';

const roles: { value: UserRole; label: string; description: string; icon: any; accent: string }[] = [
  {
    value: 'staff',
    label: 'Staff',
    description: 'Capture and upload invoices',
    icon: Users,
    accent: theme.colors.accents.waterDark,
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Review and approve invoices',
    icon: Shield,
    accent: theme.colors.accents.iceDark,
  },
  {
    value: 'owner',
    label: 'Owner',
    description: 'Full access and oversight',
    icon: Crown,
    accent: theme.colors.accents.fireDark,
  },
  {
    value: 'accountant',
    label: 'Accountant',
    description: 'View invoice history',
    icon: Calculator,
    accent: theme.colors.accents.treeDark,
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      router.push({
        pathname: '/login',
        params: { role: selectedRole },
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Invoice Manager</Text>
          <Text style={styles.subtitle}>Beta v1</Text>
          <Text style={styles.description}>Select your role to continue</Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.value;
            return (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleCard,
                  isSelected && { borderColor: role.accent, borderWidth: 2 },
                ]}
                onPress={() => handleRoleSelect(role.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: role.accent + '20' }]}>
                  <Icon size={32} color={role.accent} strokeWidth={2} />
                </View>
                <View style={styles.roleContent}>
                  <Text style={styles.roleLabel}>{role.label}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.continueButtonText,
              !selectedRole && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
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
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  rolesContainer: {
    gap: theme.spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  roleContent: {
    flex: 1,
  },
  roleLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  roleDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
    backgroundColor: theme.colors.text.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.surface,
  },
  continueButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  continueButtonTextDisabled: {
    color: theme.colors.text.tertiary,
  },
});
