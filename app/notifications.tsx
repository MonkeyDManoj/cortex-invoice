// app/notifications.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch, Alert } from 'react-native';
import { theme } from '@/constants/theme';
import { Bell, Mail, MessageSquare } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  created_at: string;
  type?: 'approval' | 'duplicate' | 'edited' | 'budget';
  read?: boolean;
};

function nowIso() { return new Date().toISOString(); }
function uid() { return Math.random().toString(36).slice(2, 9); }

// placeholders for external channels
const sendEmail = async (to: string, subject: string, body: string) => {
  console.log('[MOCK EMAIL]', to, subject, body);
  return true;
};
const sendWhatsApp = async (to: string, body: string) => {
  console.log('[MOCK WHATSAPP]', to, body);
  return true;
};

export default function NotificationsScreen() {
  const { appUser } = useAuth();
  const [list, setList] = useState<NotificationItem[]>([]);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [waEnabled, setWaEnabled] = useState(false);

  const push = async (type: NotificationItem['type']) => {
    const newItem: NotificationItem = {
      id: uid(),
      title: type === 'approval' ? 'Approval pending' : type === 'duplicate' ? 'Duplicate flagged' : type === 'edited' ? 'Upload edited' : 'Budget alert',
      body: `Mock ${type} triggered`,
      created_at: nowIso(),
      type,
    };
    setList(prev => [newItem, ...prev]);

    // trigger mock channels
    if (emailEnabled && appUser?.email) {
      await sendEmail(appUser.email, newItem.title, newItem.body ?? '');
    }
    if (waEnabled && appUser?.phone) {
      await sendWhatsApp(appUser.phone, `${newItem.title}: ${newItem.body}`);
    }

    Alert.alert('Notification', `Sent in-app${emailEnabled ? ' + email' : ''}${waEnabled ? ' + WhatsApp' : ''}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bell size={22} color={theme.colors.text.primary} />
        <Text style={styles.title}>Notifications</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.triggerBtn} onPress={() => push('approval')}>
          <Text style={styles.triggerText}>Trigger Approval Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.triggerBtn} onPress={() => push('duplicate')}>
          <Text style={styles.triggerText}>Trigger Duplicate Flag</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.triggerBtn} onPress={() => push('edited')}>
          <Text style={styles.triggerText}>Trigger Edited Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.triggerBtn} onPress={() => push('budget')}>
          <Text style={styles.triggerText}>Trigger Budget Alert</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.channelRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Mail size={16} color={theme.colors.text.primary} />
          <Text style={{ marginLeft: 8 }}>Email</Text>
        </View>
        <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
      </View>

      <View style={styles.channelRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MessageSquare size={16} color={theme.colors.text.primary} />
          <Text style={{ marginLeft: 8 }}>WhatsApp (mock)</Text>
        </View>
        <Switch value={waEnabled} onValueChange={setWaEnabled} />
      </View>

      <FlatList data={list} keyExtractor={i => i.id} renderItem={({ item }) => (
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>{item.title}</Text>
          <Text style={styles.noteBody}>{item.body}</Text>
          <Text style={styles.noteTime}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
      )} ListEmptyComponent={<Text style={{ color: theme.colors.text.secondary }}>No notifications yet</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.text.primary },
  controls: { marginBottom: 12 },
  triggerBtn: { backgroundColor: theme.colors.surface, padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  triggerText: { color: theme.colors.text.primary, fontWeight: '600' },
  channelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  noteCard: { padding: 12, backgroundColor: theme.colors.surface, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 8 },
  noteTitle: { fontWeight: '700', color: theme.colors.text.primary },
  noteBody: { color: theme.colors.text.secondary, marginTop: 6 },
  noteTime: { color: theme.colors.text.tertiary, marginTop: 8, fontSize: 12 },
});
