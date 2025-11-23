// app/ocr-result.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, FileText, Check } from 'lucide-react-native';

type LineItem = {
  description: string;
  qty?: number;
  amount?: number;
};

type OCRResult = {
  vendor_name?: string;
  gstin?: string;
  invoice_number?: string;
  date?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  line_items?: LineItem[];
};

export default function OCRResultScreen() {
  const { uploadId } = useLocalSearchParams<{ uploadId?: string }>();
  const router = useRouter();
  const { appUser } = useAuth();
  const role = appUser?.role ?? 'staff';
  const isStaff = role === 'staff';

  const [loading, setLoading] = useState(true);
  const [ocr, setOcr] = useState<OCRResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  // Micro-interaction: subtle pulse for the Send button when ready
  useEffect(() => {
    if (ocr) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.03, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [ocr]);

  // Polling helper: poll /api/ocr-result/:uploadId
  useEffect(() => {
    if (!uploadId) {
      // If invoked without uploadId, allow manual paste or fallback
      setLoading(false);
      return;
    }

    let mounted = true;
    const poll = async () => {
      try {
        const res = await fetch(`https://your-server.example.com/api/ocr-result/${uploadId}`);
        if (res.status === 200) {
          const json = await res.json();
          if (mounted) {
            setOcr(json);
            setLoading(false);
          }
          return; // stop polling once result arrives
        }
      } catch (e) {
        // ignore network noise, continue polling
      }
      if (!mounted) return;
      setTimeout(poll, 1500); // poll interval
    };

    poll();
    return () => { mounted = false; };
  }, [uploadId]);

  const updateField = (key: keyof OCRResult, value: any) => {
    setOcr(prev => ({ ...(prev ?? {}), [key]: value }));
  };

  const updateLineItem = (index: number, patch: Partial<LineItem>) => {
    setOcr(prev => {
      const li = (prev?.line_items ?? []).slice();
      li[index] = { ...(li[index] ?? { description: '', qty: 1, amount: 0 }), ...patch };
      return { ...(prev ?? {}), line_items: li };
    });
  };

  const addLineItem = () => {
    setOcr(prev => ({ ...(prev ?? {}), line_items: [...(prev?.line_items ?? []), { description: '', qty: 1, amount: 0 }] }));
  };

  const removeLineItem = (index: number) => {
    setOcr(prev => {
      const li = (prev?.line_items ?? []).slice();
      li.splice(index, 1);
      return { ...(prev ?? {}), line_items: li };
    });
  };

  const handleSendForApproval = async () => {
    if (!ocr) return;
    setSaving(true);
    try {
      // Send edited payload to backend for approval workflow (backend stub)
      await fetch(`https://your-server.example.com/api/send-for-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, ocr }),
      });
      setSent(true);
    } catch (e) {
      console.error(e);
      // show silent fail - you said no approval flow here
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
        <Text style={{ marginTop: 12, color: theme.colors.text.secondary }}>Processing OCR result...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <FileText size={22} color={theme.colors.text.primary} />
        <Text style={styles.title}>OCR Result</Text>
      </View>

      {!ocr && (
        <View style={styles.empty}>
          <Text style={styles.subtitle}>No OCR result yet. If you tested with a webhook, check your server and try again.</Text>
        </View>
      )}

      {ocr && (
        <>
          <LabeledField label="Vendor name">
            <TextInput
              style={styles.input}
              value={ocr.vendor_name ?? ''}
              onChangeText={v => updateField('vendor_name', v)}
              editable={isStaff}
              placeholder="Vendor name"
            />
          </LabeledField>

          <LabeledField label="GSTIN">
            <TextInput
              style={styles.input}
              value={ocr.gstin ?? ''}
              onChangeText={v => updateField('gstin', v)}
              editable={isStaff}
              placeholder="GSTIN"
            />
          </LabeledField>

          <LabeledField label="Invoice number">
            <TextInput
              style={styles.input}
              value={ocr.invoice_number ?? ''}
              onChangeText={v => updateField('invoice_number', v)}
              editable={isStaff}
              placeholder="Invoice number"
            />
          </LabeledField>

          <LabeledField label="Date">
            <TextInput
              style={styles.input}
              value={ocr.date ?? ''}
              onChangeText={v => updateField('date', v)}
              editable={isStaff}
              placeholder="YYYY-MM-DD"
            />
          </LabeledField>

          <LabeledField label="Subtotal">
            <TextInput
              style={styles.input}
              value={String(ocr.subtotal ?? '')}
              onChangeText={v => updateField('subtotal', Number(v || 0))}
              keyboardType="numeric"
              editable={isStaff}
            />
          </LabeledField>

          <LabeledField label="Tax">
            <TextInput
              style={styles.input}
              value={String(ocr.tax ?? '')}
              onChangeText={v => updateField('tax', Number(v || 0))}
              keyboardType="numeric"
              editable={isStaff}
            />
          </LabeledField>

          <LabeledField label="Total">
            <TextInput
              style={styles.input}
              value={String(ocr.total ?? '')}
              onChangeText={v => updateField('total', Number(v || 0))}
              keyboardType="numeric"
              editable={isStaff}
            />
          </LabeledField>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.sectionTitle}>Line items</Text>
            <FlatList
              data={ocr.line_items ?? []}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item, index }) => (
                <View key={index} style={styles.lineItem}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Description"
                    value={item.description}
                    onChangeText={v => updateLineItem(index, { description: v })}
                    editable={isStaff}
                  />
                  <TextInput
                    style={[styles.input, { width: 80, marginLeft: 8 }]}
                    placeholder="Qty"
                    value={String(item.qty ?? '')}
                    onChangeText={v => updateLineItem(index, { qty: Number(v || 0) })}
                    keyboardType="numeric"
                    editable={isStaff}
                  />
                  <TextInput
                    style={[styles.input, { width: 100, marginLeft: 8 }]}
                    placeholder="Amount"
                    value={String(item.amount ?? '')}
                    onChangeText={v => updateLineItem(index, { amount: Number(v || 0) })}
                    keyboardType="numeric"
                    editable={isStaff}
                  />
                  {isStaff && (
                    <TouchableOpacity onPress={() => removeLineItem(index)} style={styles.removeBtn}>
                      <Text style={{ color: theme.colors.status.error }}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              ListEmptyComponent={<Text style={{ color: theme.colors.text.tertiary }}>No line items</Text>}
            />
            {isStaff && (
              <TouchableOpacity style={styles.addBtn} onPress={addLineItem}>
                <Text style={{ color: theme.colors.text.primary }}>+ Add item</Text>
              </TouchableOpacity>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <TouchableOpacity
              onPress={handleSendForApproval}
              disabled={saving || sent}
              activeOpacity={0.8}
              style={[styles.sendBtn, (saving || sent) && { opacity: 0.6 }]}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : sent ? (
                <>
                  <Check size={16} color="#fff" />
                  <Text style={styles.sendBtnText}> Sent</Text>
                </>
              ) : (
                <Text style={styles.sendBtnText}>Send for Approval</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

// small helper component
function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 36,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    color: theme.colors.text.primary,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.text.secondary,
  },
  empty: {
    padding: 16,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeBtn: {
    marginLeft: 8,
  },
  addBtn: {
    marginTop: 8,
    padding: 10,
    alignItems: 'center',
  },
  sendBtn: {
    marginTop: 18,
    backgroundColor: theme.colors.text.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
