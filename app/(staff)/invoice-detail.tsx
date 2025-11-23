import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { theme } from '@/constants/theme';
import { Invoice, getInvoiceById } from '@/services/invoiceService';
import {
  ArrowLeft,
  Building,
  DollarSign,
  Calendar,
  FileText,
  Hash,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react-native';

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    if (!invoiceId) return;

    try {
      const data = await getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={24} color={theme.colors.status.success} />;
      case 'failed':
        return <XCircle size={24} color={theme.colors.status.error} />;
      default:
        return <Clock size={24} color={theme.colors.status.warning} />;
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoice Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoice Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageSection}>
          <Image source={{ uri: invoice.image_url }} style={styles.invoiceImage} />
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon(invoice.status)}
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(invoice.status) }]}>
                {getStatusText(invoice.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.uploadDate}>
            Uploaded {new Date(invoice.uploaded_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OCR Extracted Data</Text>
          <Text style={styles.sectionSubtitle}>
            Fields will be populated after OCR processing
          </Text>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <Building size={20} color={theme.colors.accents.waterDark} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Vendor Name</Text>
              <Text style={styles.fieldValue}>
                {invoice.ocr_data?.vendor_name || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <Hash size={20} color={theme.colors.accents.iceDark} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Invoice Number</Text>
              <Text style={styles.fieldValue}>
                {invoice.ocr_data?.invoice_number || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <Calendar size={20} color={theme.colors.accents.treeDark} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Invoice Date</Text>
              <Text style={styles.fieldValue}>
                {invoice.ocr_data?.invoice_date || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <DollarSign size={20} color={theme.colors.accents.fireDark} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Total Amount</Text>
              <Text style={styles.fieldValue}>
                {invoice.ocr_data?.total_amount || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <FileText size={20} color={theme.colors.text.secondary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Description</Text>
              <Text style={styles.fieldValue}>
                {invoice.ocr_data?.description || '—'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xxl + 12,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  imageSection: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  invoiceImage: {
    width: '100%',
    height: '100%',
  },
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  statusValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  uploadDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  fieldValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.status.error,
  },
});
