// ══════════════════════════════════════════════════════════════════════════════
// POLL DETAIL SCREEN
// ══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { usePoll, usePollResults, useVote } from '@/hooks/usePolls'

export default function PollDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const { data: poll, isLoading: pollLoading } = usePoll(id)
  const { data: results } = usePollResults(id)
  const vote = useVote(id)

  const hasVoted = !!results?.userVote?.length

  function toggleOption(optionId: string) {
    if (hasVoted) return

    if (poll?.type === 'SINGLE_CHOICE') {
      setSelectedOptions([optionId])
    } else {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      )
    }
  }

  function handleVote() {
    if (selectedOptions.length === 0) {
      Alert.alert('Hata', 'Lütfen bir seçenek seçin')
      return
    }

    vote.mutate(
      { optionIds: selectedOptions },
      {
        onSuccess: () => {
          Alert.alert('Başarılı', 'Oyunuz kaydedildi!')
        },
        onError: (error) => {
          Alert.alert('Hata', error.message)
        },
      }
    )
  }

  if (pollLoading || !poll) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.creatorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {poll.creator.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.creatorName}>{poll.creator.displayName}</Text>
            <Text style={styles.creatorUsername}>@{poll.creator.username}</Text>
          </View>
        </View>

        <Text style={styles.title}>{poll.title}</Text>
        {poll.description && (
          <Text style={styles.description}>{poll.description}</Text>
        )}

        <View style={styles.stats}>
          <Text style={styles.statText}>{poll.totalVotes} oy</Text>
          <Text style={styles.statDot}>•</Text>
          <Text style={styles.statText}>
            {poll.type === 'SINGLE_CHOICE' ? 'Tek seçim' : 'Çoklu seçim'}
          </Text>
        </View>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {poll.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id)
          const votedFor = results?.userVote?.includes(option.id)
          const result = results?.options.find((o) => o.id === option.id)
          const percentage = result?.percentage || 0

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                votedFor && styles.optionVoted,
              ]}
              onPress={() => toggleOption(option.id)}
              disabled={hasVoted}
            >
              {/* Progress bar (only show after voting) */}
              {hasVoted && (
                <View
                  style={[
                    styles.progressBar,
                    { width: `${percentage}%` },
                    votedFor && styles.progressBarVoted,
                  ]}
                />
              )}

              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {option.text}
                </Text>

                {hasVoted && (
                  <Text style={styles.optionPercentage}>{percentage}%</Text>
                )}
              </View>

              {/* Checkmark */}
              {(isSelected || votedFor) && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Vote Button */}
      {!hasVoted && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.voteButton,
              selectedOptions.length === 0 && styles.voteButtonDisabled,
            ]}
            onPress={handleVote}
            disabled={selectedOptions.length === 0 || vote.isPending}
          >
            {vote.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.voteButtonText}>Oy Ver</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  creatorUsername: {
    fontSize: 14,
    color: '#6b7280',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statDot: {
    marginHorizontal: 8,
    color: '#d1d5db',
  },
  options: {
    padding: 16,
    gap: 12,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    position: 'relative',
  },
  optionSelected: {
    borderColor: '#6366f1',
  },
  optionVoted: {
    borderColor: '#6366f1',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#e5e7eb',
  },
  progressBarVoted: {
    backgroundColor: '#c7d2fe',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#6366f1',
  },
  optionPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 12,
  },
  checkmark: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  voteButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
})
