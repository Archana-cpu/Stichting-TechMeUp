// ══════════════════════════════════════════════════════════════════════════════
// INDEX - REDIRECT
// Auth durumuna göre yönlendirme
// ══════════════════════════════════════════════════════════════════════════════

import { Redirect } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuth } from '@/providers/AuthProvider'

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth()

  // Auth durumu yüklenirken loading göster
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  // Auth durumuna göre yönlendir
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />
  }

  return <Redirect href="/(auth)/login" />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
})
