import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import { ClipboardCheck, AlertCircle, ChevronRight } from 'lucide-react-native';
import { getPendingInvoices, ApprovalInvoice } from '@/services/approvalService';

export default function OwnerApprovalsScreen() {
  const router = useRouter();
  const { appUser } = useAuth();
  const [invoices, setInvoices] = useState<ApprovalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await getPendingInvoices();
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
      pathname: '/(owner)/approval-detail',
      params: { invoiceId },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={invoices.length === 0 ? styles.scrollContent : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {invoices.length === 0 ? (
          <>
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <ClipboardCheck size={64} color={theme.colors.text.tertiary} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No pending approvals</Text>
              <Text style={styles.emptyDescription}>
                Invoices awaiting approval will appear here
              </Text>
            </View>

            <View style={styles.infoBox}>
              <AlertCircle size={20} color={theme.colors.text.secondary} />
              <Text style={styles.infoText}>
                Review and approve invoices with full oversight capabilities
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.subtitle}>
                {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} awaiting approval
              </Text>
            </View>

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
                  <Text style={styles.invoiceVendor}>
                    {invoice.ocr_data?.vendor_name || 'Unknown Vendor'}
                  </Text>
                  <Text style={styles.invoiceDetails}>
                    {invoice.ocr_data?.invoice_number || 'No invoice number'}
                  </Text>
                  <Text style={styles.invoiceUploader}>
                    Uploaded by {invoice.uploader?.full_name || 'Unknown'}
                  </Text>
                  <Text style={styles.invoiceDate}>
                    {new Date(invoice.uploaded_at).toLocaleDateString()}
                  </Text>
                </View>
                <ChevronRight size={24} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  listHeader: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
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
    alignItems: 'center',
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
  },
  invoiceVendor: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  invoiceDetails: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  invoiceUploader: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
  },
  invoiceDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
});
