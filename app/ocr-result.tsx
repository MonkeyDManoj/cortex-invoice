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
import { FileText, Check } from 'lucide-react-native';

// --------------------
// Vendor matching data
// --------------------
const mockVendors = [
  { id: "v1", name: "Acme Supplies", gstin: "22AAAAA0000A1Z5", phone: "9876543210", email: "billing@acme.com", bank: "AXIS" },
  { id: "v2", name: "Trinity Traders", gstin: "27BBBBB1111B2Z8", phone: "9123456780", email: "pay@trinity.in", bank: "HDFC" },
  { id: "v3", name: "Global Foods Pvt Ltd", gstin: "29CCCCC2222C3Z9", phone: "", email: "", bank: "ICICI" },
];

const normalize = (s?: string) =>
  (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const fuzzy = (a?: string, b?: string) => {
  if (!a || !b) return 0;
  a = normalize(a);
  b = normalize(b);
  if (a === b) return 1;
  const A = a.split(/[\s,.-]+/);
  const B = b.split(/[\s,.-]+/);
  let matches = 0;
  A.forEach(t => { if (B.includes(t)) matches++; });
  return Math.min(0.99, matches / Math.max(A.length, 1));
};


// --------------
// Types
// --------------
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
  phone?: string;
  email?: string;
  bank?: string;
  line_items?: LineItem[];
};


export default function OCRResultScreen() {
  const { uploadId } = useLocalSearchParams<{ uploadId?: string }>();
  const router = useRouter();
  const { appUser } = useAuth();
  const isStaff = (appUser?.role ?? "staff") === "staff";

  const [loading, setLoading] = useState(true);
  const [ocr, setOcr] = useState<OCRResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  // Vendor Matching State
  const [match, setMatch] = useState<{
    vendor?: any;
    reason?: string;
    confidence?: number;
  } | null>(null);

  const pulse = useRef(new Animated.Value(1)).current;


  // ---------------------------------------------------------
  // Poll OCR result
  // ---------------------------------------------------------
  useEffect(() => {
    if (!uploadId) {
      setLoading(false);
      return;
    }

    let active = true;

    const poll = async () => {
      try {
        const res = await fetch(`https://your-server.example.com/api/ocr-result/${uploadId}`);
        if (res.status === 200) {
          const json = await res.json();
          if (active) {
            setOcr(json);
            setLoading(false);
          }
          return;
        }
      } catch (_) {}

      if (active) setTimeout(poll, 1500);
    };

    poll();
    return () => { active = false };
  }, [uploadId]);


  // ---------------------------------------------------------
  // Micro pulse animation
  // ---------------------------------------------------------
  useEffect(() => {
    if (!ocr) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [ocr]);



  // ---------------------------------------------------------
  // Vendor Matching Logic — Iteration 6
  // ---------------------------------------------------------
  useEffect(() => {
    if (!ocr) return;

    const { gstin, vendor_name, phone, email, bank } = ocr;

    // 1) GSTIN strict
    if (gstin) {
      const v = mockVendors.find(v => normalize(v.gstin) === normalize(gstin));
      if (v) {
        setMatch({ vendor: v, reason: "GSTIN match", confidence: 1 });
        return;
      }
    }

    // 2) Phone strict
    if (phone) {
      const v = mockVendors.find(v => normalize(v.phone) === normalize(phone));
      if (v) {
        setMatch({ vendor: v, reason: "Phone match", confidence: 0.98 });
        return;
      }
    }

    // 3) Email strict
    if (email) {
      const v = mockVendors.find(v => normalize(v.email) === normalize(email));
      if (v) {
        setMatch({ vendor: v, reason: "Email match", confidence: 0.98 });
        return;
      }
    }

    // 4) Vendor name fuzzy
    if (vendor_name) {
      let best: any = null;
      let bestScore = 0;
      mockVendors.forEach(v => {
        const score = fuzzy(v.name, vendor_name);
        if (score > bestScore) {
          bestScore = score;
          best = v;
        }
      });

      if (best && bestScore > 0.35) {
        setMatch({ vendor: best, reason: "Name fuzzy", confidence: bestScore });
        return;
      }
    }

    // 5) Fallback — bank + invoice_number + amount
    if (bank) {
      const v = mockVendors.find(v => normalize(v.bank) === normalize(bank));
      if (v) {
        setMatch({ vendor: v, reason: "Bank fallback", confidence: 0.6 });
        return;
      }
    }

    setMatch(null);
  }, [ocr]);


  // ---------------------------------------------------------
  // Field updates
  // ---------------------------------------------------------
  const updateField = (key: keyof OCRResult, value: any) =>
    setOcr(prev => ({ ...(prev ?? {}), [key]: value }));


  const updateLineItem = (index: number, patch: Partial<LineItem>) =>
    setOcr(prev => {
      const arr = (prev?.line_items ?? []).slice();
      arr[index] = { ...(arr[index] ?? {}), ...patch };
      return { ...(prev ?? {}), line_items: arr };
    });



  // ---------------------------------------------------------
  // Send for approval
  // ---------------------------------------------------------
  const handleSendForApproval = async () => {
    if (!ocr) return;
    setSaving(true);

    try {
      await fetch(`https://your-server.example.com/api/send-for-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, ocr }),
      });
      setSent(true);
    } catch (e) {
      console.log(e);
    } finally {
      setSaving(false);
    }
  };



  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
        <Text style={{ marginTop: 12, color: theme.colors.text.secondary }}>
          Processing OCR...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <FileText size={22} color={theme.colors.text.primary} />
        <Text style={styles.title}>OCR Result</Text>
      </View>

      {ocr && (
        <>
          {/* ---------------------- */}
          {/* Iteration 6: Vendor Match */}
          {/* ---------------------- */}
          <View style={styles.vendorBox}>
            <Text style={styles.vendorLabel}>Likely Vendor</Text>

            <Text style={styles.vendorValue}>
              {match?.vendor ? match.vendor.name : "No strong match"}
            </Text>

            {match && (
              <>
                <Text style={styles.vendorReason}>{match.reason}</Text>
                <Text style={styles.vendorConfidence}>
                  Confidence {(match.confidence! * 100).toFixed(0)}%
                </Text>
              </>
            )}
          </View>

          {/* Existing fields kept identical */}
          <Labeled label="Vendor Name">
            <TextInput
              style={styles.input}
              value={ocr.vendor_name ?? ''}
              onChangeText={(v) => updateField("vendor_name", v)}
              editable={isStaff}
            />
          </Labeled>

          <Labeled label="GSTIN">
            <TextInput
              style={styles.input}
              value={ocr.gstin ?? ''}
              onChangeText={(v) => updateField("gstin", v)}
              editable={isStaff}
            />
          </Labeled>

          <Labeled label="Invoice Number">
            <TextInput
              style={styles.input}
              value={ocr.invoice_number ?? ''}
              onChangeText={(v) => updateField("invoice_number", v)}
              editable={isStaff}
            />
          </Labeled>

          <Labeled label="Subtotal">
            <TextInput
              style={styles.input}
              value={String(ocr.subtotal ?? '')}
              onChangeText={(v) => updateField("subtotal", Number(v || 0))}
              keyboardType="numeric"
              editable={isStaff}
            />
          </Labeled>

          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <TouchableOpacity
              style={[styles.sendBtn, sent && { opacity: 0.5 }]}
              disabled={saving || sent}
              onPress={handleSendForApproval}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : sent ? (
                <>
                  <Check size={16} color="#fff" />
                  <Text style={styles.sendText}> Sent</Text>
                </>
              ) : (
                <Text style={styles.sendText}>Send for Approval</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}


function Labeled({ label, children }: { label: string; children: any }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, color: theme.colors.text.secondary }}>
        {label}
      </Text>
      {children}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text.primary,
  },

  // Vendor match box
  vendorBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
  },
  vendorLabel: { fontSize: 12, color: theme.colors.text.secondary },
  vendorValue: { fontSize: 16, fontWeight: "700", color: theme.colors.text.primary, marginTop: 4 },
  vendorReason: { color: theme.colors.text.secondary, marginTop: 4 },
  vendorConfidence: { color: theme.colors.text.tertiary, fontSize: 12, marginTop: 4 },

  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    color: theme.colors.text.primary,
    marginTop: 4,
  },

  sendBtn: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.text.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  sendText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
