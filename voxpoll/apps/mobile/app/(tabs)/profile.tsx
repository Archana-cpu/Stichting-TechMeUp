// ══════════════════════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ══════════════════════════════════════════════════════════════════════════════

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useAuth } from '@/providers/AuthProvider'
import { handleLogout } from '@/lib/api'

export default function ProfileScreen() {
  const { user } = useAuth()

  async function onLogout() {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: handleLogout },
    ])
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Polls</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Takipçi</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Takip</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <MenuItem label="Profili Düzenle" icon="✏️" onPress={() => {}} />
        <MenuItem label="Ayarlar" icon="⚙️" onPress={() => {}} />
        <MenuItem label="Bildirim Tercihleri" icon="🔔" onPress={() => {}} />
        <MenuItem label="Gizlilik" icon="🔒" onPress={() => {}} />
        <MenuItem label="Yardım" icon="❓" onPress={() => {}} />
        <MenuItem label="Çıkış Yap" icon="🚪" onPress={onLogout} danger />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.infoText}>
          Üyelik: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
        </Text>
        <Text style={styles.infoText}>Plan: {user.subscriptionTier}</Text>
        <Text style={styles.infoText}>
          Email: {user.emailVerified ? '✅ Doğrulandı' : '⚠️ Doğrulanmadı'}
        </Text>
      </View>
    </ScrollView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Menu Item Component
// ─────────────────────────────────────────────────────────────────────────────

function MenuItem({
  label,
  icon,
  onPress,
  danger,
}: {
  label: string
  icon: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  username: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  menu: {
    backgroundColor: '#fff',
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  menuLabelDanger: {
    color: '#ef4444',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  info: {
    padding: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
})
