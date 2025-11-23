import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import { FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { Invoice, getUserInvoices } from '@/services/invoiceService';

export default function StaffHistoryScreen() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [appUser?.id]);

  const loadInvoices = async () => {
    if (!appUser?.id) return;

    try {
      const data = await getUserInvoices(appUser.id);
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const handleInvoicePress = (invoiceId: string) => {
    router.push({
      pathname: '/(staff)/invoice-detail',
      params: { invoiceId },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color={theme.colors.status.success} />;
      case 'failed':
        return <XCircle size={20} color={theme.colors.status.error} />;
      default:
        return <Clock size={20} color={theme.colors.status.warning} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Processing';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.status.success;
      case 'failed':
        return theme.colors.status.error;
      default:
        return theme.colors.status.warning;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (invoices.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FileText size={64} color={theme.colors.text.tertiary} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No uploads yet</Text>
            <Text style={styles.emptyDescription}>
              Your uploaded invoices will appear here
            </Text>
          </View>

          <View style={styles.infoBox}>
            <AlertCircle size={20} color={theme.colors.text.secondary} />
            <Text style={styles.infoText}>
              Upload history will show all your captured and submitted invoices
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {invoices.map((invoice) => (
          <TouchableOpacity
            key={invoice.id}
            style={styles.invoiceCard}
            onPress={() => handleInvoicePress(invoice.id)}
            activeOpacity={0.7}
          >
            <View style={styles.invoiceThumbnail}>
              <Image
                source={{ uri: invoice.image_url }}
                style={styles.thumbnailImage}
              />
            </View>
            <View style={styles.invoiceContent}>
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceId}>
                  Invoice #{invoice.id.slice(0, 8)}
                </Text>
                <View style={styles.statusBadge}>
                  {getStatusIcon(invoice.status)}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(invoice.status) },
                    ]}
                  >
                    {getStatusText(invoice.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.invoiceDate}>
                {new Date(invoice.uploaded_at).toLocaleDateString()} at{' '}
                {new Date(invoice.uploaded_at).toLocaleTimeString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    justifyContent: 'center',
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: theme.typography.sizes.md,
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
    marginTop: theme.spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  invoiceCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  invoiceThumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  invoiceContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  invoiceId: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
  },
  invoiceDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
});
