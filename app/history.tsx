// app/history.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';
import { FileText } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

// mock example row using your uploaded file path
const mockUploads = [
  {
    id: 'u1',
    vendor_name: 'Acme Supplies',
    invoice_number: 'INV-12345',
    total: 1180,
    status: 'Pending',
    created_at: '2025-11-23T12:00:00Z',
    file_url: 'file:///mnt/data/b3a28c8f-bca6-48e8-8cc0-b05f8ed46931.png',
    logs: [
      { type: 'upload', user: 'Manoj', ts: '2025-11-23T12:00:00Z', note: 'Uploaded image' },
      { type: 'ocr', user: 'system', ts: '2025-11-23T12:00:15Z', note: 'OCR extracted fields' },
    ],
  },
  {
    id: 'u2',
    vendor_name: 'Trinity Traders',
    invoice_number: 'INV-99876',
    total: 7500,
    status: 'Approved',
    created_at: '2025-11-22T09:10:00Z',
    file_url: '',
    logs: [
      { type: 'upload', user: 'Rita', ts: '2025-11-22T09:10:00Z', note: 'Uploaded' },
      { type: 'edit', user: 'Manager Raj', ts: '2025-11-22T09:14:00Z', note: 'Corrected GSTIN' },
      { type: 'approval', user: 'Owner Sam', ts: '2025-11-22T09:20:00Z', note: 'Approved' },
    ],
  },
];

export default function HistoryScreen() {
  const { appUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    // Replace with real fetch from Bolt or Supabase
    setItems(mockUploads);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FileText size={22} color={theme.colors.text.primary} />
        <Text style={styles.title}>Upload History</Text>
      </View>

      <FlatList data={items} keyExtractor={i => i.id} renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.vendor_name}</Text>
            <Text style={styles.cardSub}>#{item.invoice_number} • {item.status} • ₹{item.total}</Text>
            <Text style={{ color: theme.colors.text.tertiary, marginTop: 8 }}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      )} ListEmptyComponent={<Text style={{ color: theme.colors.text.secondary }}>No uploads yet</Text>} />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text.primary }}>{selected?.vendor_name}</Text>
            <Text style={{ color: theme.colors.text.secondary, marginTop: 4 }}>Invoice {selected?.invoice_number} • {selected?.status}</Text>
          </View>
          <ScrollView style={{ padding: 16 }}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Log Trail</Text>
            {(selected?.logs ?? []).map((l: any, idx: number) => (
              <View key={idx} style={styles.logRow}>
                <View style={styles.logBadge}><Text style={{ color: '#fff', fontSize: 12 }}>{l.type.toUpperCase()}</Text></View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontWeight: '600', color: theme.colors.text.primary }}>{l.user}</Text>
                  <Text style={{ color: theme.colors.text.secondary }}>{new Date(l.ts).toLocaleString()}</Text>
                  <Text style={{ marginTop: 6, color: theme.colors.text.tertiary }}>{l.note}</Text>
                </View>
              </View>
            ))}
            <View style={{ height: 80 }} />
          </ScrollView>

          <View style={{ padding: 12 }}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.colors.text.primary }]} onPress={() => setSelected(null)}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.text.primary },
  card: { padding: 12, borderRadius: 10, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 8 },
  cardTitle: { fontWeight: '700', color: theme.colors.text.primary },
  cardSub: { color: theme.colors.text.secondary, marginTop: 6 },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  logBadge: { width: 60, height: 40, borderRadius: 8, backgroundColor: theme.colors.text.primary, alignItems: 'center', justifyContent: 'center' },
  btn: { padding: 14, borderRadius: 12, alignItems: 'center' },
});
