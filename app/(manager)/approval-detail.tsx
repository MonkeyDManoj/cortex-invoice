import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import {
  getInvoiceForApproval,
  updateInvoiceData,
  approveInvoice,
  rejectInvoice,
  ApprovalInvoice,
} from '@/services/approvalService';
import {
  ArrowLeft,
  Building,
  DollarSign,
  Calendar,
  FileText,
  Hash,
  CheckCircle,
  XCircle,
  Edit3,
  Save,
  User,
} from 'lucide-react-native';

export default function ApprovalDetailScreen() {
  const router = useRouter();
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  const { appUser } = useAuth();

  const [invoice, setInvoice] = useState<ApprovalInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editedData, setEditedData] = useState({
    vendor_name: '',
    invoice_number: '',
    invoice_date: '',
    total_amount: '',
    description: '',
  });

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    if (!invoiceId) return;

    try {
      const data = await getInvoiceForApproval(invoiceId);
      setInvoice(data);

      if (data?.ocr_data) {
        setEditedData({
          vendor_name: data.ocr_data.vendor_name || '',
          invoice_number: data.ocr_data.invoice_number || '',
          invoice_date: data.ocr_data.invoice_date || '',
          total_amount: data.ocr_data.total_amount || '',
          description: data.ocr_data.description || '',
        });
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!invoiceId || !appUser) return;

    setSaving(true);
    try {
      await updateInvoiceData(
        invoiceId,
        editedData,
        appUser.id,
        appUser.full_name || appUser.email
      );
      setIsEditing(false);
      await loadInvoice();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!invoiceId || !appUser) return;

    setSaving(true);
    try {
      await approveInvoice(
        invoiceId,
        appUser.id,
        appUser.full_name || appUser.email,
        editedData
      );
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!invoiceId || !appUser) return;
    if (!rejectionComment.trim()) {
      Alert.alert('Error', 'Please enter a comment for rejection');
      return;
    }

    setSaving(true);
    try {
      await rejectInvoice(
        invoiceId,
        appUser.id,
        appUser.full_name || appUser.email,
        rejectionComment,
        editedData
      );
      setShowRejectModal(false);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoice Review</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text.primary} />
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
          <Text style={styles.headerTitle}>Invoice Review</Text>
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
        <Text style={styles.headerTitle}>Invoice Review</Text>
        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              handleSaveEdits();
            } else {
              setIsEditing(true);
            }
          }}
          style={styles.editButton}
        >
          {isEditing ? (
            <Save size={24} color={theme.colors.accents.treeDark} />
          ) : (
            <Edit3 size={24} color={theme.colors.text.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageSection}>
          <Image source={{ uri: invoice.image_url }} style={styles.invoiceImage} />
        </View>

        {invoice.uploader && (
          <View style={styles.uploaderCard}>
            <User size={20} color={theme.colors.text.secondary} />
            <View style={styles.uploaderInfo}>
              <Text style={styles.uploaderLabel}>Uploaded by</Text>
              <Text style={styles.uploaderName}>
                {invoice.uploader.full_name || invoice.uploader.email}
              </Text>
              <Text style={styles.uploadDate}>
                {new Date(invoice.uploaded_at).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Data</Text>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <Building size={20} color={theme.colors.accents.waterDark} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Vendor Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editedData.vendor_name}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, vendor_name: text })
                  }
                  placeholder="Enter vendor name"
                />
              ) : (
                <Text style={styles.fieldValue}>{editedData.vendor_name || '—'}</Text>
              )}
            </View>
          </View>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <Hash size={20} color={theme.colors.accents.iceDark} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Invoice Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editedData.invoice_number}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, invoice_number: text })
                  }
                  placeholder="Enter invoice number"
                />
              ) : (
                <Text style={styles.fieldValue}>{editedData.invoice_number || '—'}</Text>
              )}
            </View>
          </View>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <Calendar size={20} color={theme.colors.accents.treeDark} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Invoice Date</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editedData.invoice_date}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, invoice_date: text })
                  }
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Text style={styles.fieldValue}>{editedData.invoice_date || '—'}</Text>
              )}
            </View>
          </View>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <DollarSign size={20} color={theme.colors.accents.fireDark} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Total Amount</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={editedData.total_amount}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, total_amount: text })
                  }
                  placeholder="Enter amount"
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>{editedData.total_amount || '—'}</Text>
              )}
            </View>
          </View>

          <View style={styles.fieldCard}>
            <View style={styles.fieldIcon}>
              <FileText size={20} color={theme.colors.text.secondary} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.fieldInput, styles.multilineInput]}
                  value={editedData.description}
                  onChangeText={(text) =>
                    setEditedData({ ...editedData, description: text })
                  }
                  placeholder="Enter description"
                  multiline
                />
              ) : (
                <Text style={styles.fieldValue}>{editedData.description || '—'}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.rejectButton, saving && styles.buttonDisabled]}
          onPress={() => setShowRejectModal(true)}
          disabled={saving}
          activeOpacity={0.7}
        >
          <XCircle size={20} color={theme.colors.status.error} />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveButton, saving && styles.buttonDisabled]}
          onPress={handleApprove}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.text.inverse} />
          ) : (
            <>
              <CheckCircle size={20} color={theme.colors.text.inverse} />
              <Text style={styles.approveButtonText}>Approve</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showRejectModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Invoice</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejection
            </Text>

            <TextInput
              style={styles.commentInput}
              value={rejectionComment}
              onChangeText={setRejectionComment}
              placeholder="Enter rejection comment"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionComment('');
                }}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalRejectButton, saving && styles.buttonDisabled]}
                onPress={handleReject}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.text.inverse} />
                ) : (
                  <Text style={styles.modalRejectText}>Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  editButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
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
  uploaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  uploaderInfo: {
    flex: 1,
  },
  uploaderLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  uploaderName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  uploadDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  fieldInput: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.status.error,
  },
  rejectButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.status.error,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.status.success,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  approveButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  commentInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  modalRejectButton: {
    flex: 1,
    backgroundColor: theme.colors.status.error,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  modalRejectText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
});
