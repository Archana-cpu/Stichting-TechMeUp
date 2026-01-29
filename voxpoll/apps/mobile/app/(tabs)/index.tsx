// ══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN - POLLS LIST
// Ana sayfa - Poll listesi
// ══════════════════════════════════════════════════════════════════════════════

import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { usePolls } from '@/hooks/usePolls'
import type { Poll } from '@voxpoll/api/client'

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

const badgeStyles: Record<string, { backgroundColor: string }> = {
  SINGLE_CHOICE: { backgroundColor: '#dbeafe' },
  MULTIPLE_CHOICE: { backgroundColor: '#fef3c7' },
  RANKING: { backgroundColor: '#dcfce7' },
  RATING: { backgroundColor: '#fce7f3' },
}

function getBadgeStyle(type: string) {
  return badgeStyles[type] || { backgroundColor: '#e5e7eb' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Poll Card Component
// ─────────────────────────────────────────────────────────────────────────────

function PollCard({ poll, onPress }: { poll: Poll; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {poll.creator.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.creatorName}>{poll.creator.displayName}</Text>
          <Text style={styles.creatorUsername}>@{poll.creator.username}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{poll.title}</Text>

      {poll.description && (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {poll.description}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.voteCount}>{poll.totalVotes} oy</Text>
        <Text style={styles.optionCount}>{poll.options.length} seçenek</Text>
        <View style={[styles.badge, getBadgeStyle(poll.type)]}>
          <Text style={styles.badgeText}>
            {poll.type === 'SINGLE_CHOICE' ? 'Tek Seçim' : 'Çoklu Seçim'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Home Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter()
  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage } = usePolls()

  // Tüm sayfaları birleştir
  const polls = data?.pages.flatMap((page) => page.items) ?? []

  function handlePollPress(pollId: string) {
    router.push(`/poll/${pollId}`)
  }

  function handleLoadMore() {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PollCard poll={item} onPress={() => handlePollPress(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz poll yok</Text>
              <Text style={styles.emptySubtext}>
                İlk poll'u oluşturmak için + butonuna tıklayın
              </Text>
            </View>
          ) : null
        }
      />
    </View>
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardMeta: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  creatorUsername: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voteCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  optionCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  badge_default: {
    backgroundColor: '#e5e7eb',
  },
  badge_SINGLE_CHOICE: {
    backgroundColor: '#dbeafe',
  },
  badge_MULTIPLE_CHOICE: {
    backgroundColor: '#fef3c7',
  },
  badge_RANKING: {
    backgroundColor: '#dcfce7',
  },
  badge_RATING: {
    backgroundColor: '#fce7f3',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
})
