// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL MOBILE - ROOT LAYOUT
// Ana layout - providers ve navigation yapısı
// ══════════════════════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/providers/AuthProvider'

// ─────────────────────────────────────────────────────────────────────────────
// React Query Client
// ─────────────────────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika
      retry: 2,
    },
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          {/* Auth screens - no header */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          {/* Main app with tabs */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Modal screens */}
          <Stack.Screen
            name="poll/[id]"
            options={{ title: 'Poll', presentation: 'card' }}
          />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  )
}
