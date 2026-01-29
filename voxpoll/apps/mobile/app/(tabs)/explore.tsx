// ══════════════════════════════════════════════════════════════════════════════
// EXPLORE SCREEN
// ══════════════════════════════════════════════════════════════════════════════

import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import { useState } from 'react'

export default function ExploreScreen() {
  const [search, setSearch] = useState('')

  const categories = [
    { id: '1', name: 'Teknoloji', icon: '💻', color: '#3b82f6' },
    { id: '2', name: 'Spor', icon: '⚽', color: '#22c55e' },
    { id: '3', name: 'Müzik', icon: '🎵', color: '#a855f7' },
    { id: '4', name: 'Film & Dizi', icon: '🎬', color: '#ef4444' },
    { id: '5', name: 'Yemek', icon: '🍕', color: '#f97316' },
    { id: '6', name: 'Seyahat', icon: '✈️', color: '#06b6d4' },
    { id: '7', name: 'Oyun', icon: '🎮', color: '#8b5cf6' },
    { id: '8', name: 'Bilim', icon: '🔬', color: '#10b981' },
  ]

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Poll, kullanıcı veya konu ara..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <View style={styles.categories}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, { backgroundColor: cat.color + '15' }]}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Trending */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Trend Konular</Text>
        <View style={styles.trendingList}>
          {['#yapay-zeka', '#2024secimleri', '#futbol', '#netflix'].map((tag) => (
            <TouchableOpacity key={tag} style={styles.trendingItem}>
              <Text style={styles.trendingTag}>{tag}</Text>
              <Text style={styles.trendingCount}>2.5k poll</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendingList: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  trendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  trendingTag: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366f1',
  },
  trendingCount: {
    fontSize: 14,
    color: '#6b7280',
  },
})
