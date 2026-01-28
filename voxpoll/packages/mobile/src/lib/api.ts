// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL MOBILE - API CLIENT SETUP
// React Native API client with secure token storage
// ══════════════════════════════════════════════════════════════════════════════

import { createVoxPollClient, VoxPollClient } from '@voxpoll/api/client'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const ACCESS_TOKEN_KEY = 'voxpoll_access_token'
const REFRESH_TOKEN_KEY = 'voxpoll_refresh_token'

// ─────────────────────────────────────────────────────────────────────────────
// Token Storage (Secure Store for React Native)
// ─────────────────────────────────────────────────────────────────────────────

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
    } catch {
      return null
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
    } catch {
      return null
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken)
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// API Client Instance
// ─────────────────────────────────────────────────────────────────────────────

let apiClient: VoxPollClient | null = null

export function getApi(): VoxPollClient {
  if (!apiClient) {
    apiClient = createVoxPollClient({
      baseUrl: API_URL,
      getToken: () => tokenStorage.getAccessToken(),
      onUnauthorized: async () => {
        // Try to refresh token
        const refreshToken = await tokenStorage.getRefreshToken()
        if (refreshToken) {
          try {
            const newSession = await apiClient!.auth.refresh(refreshToken)
            await tokenStorage.setTokens(newSession.token, newSession.refreshToken)
            return // Token refreshed, retry will happen automatically
          } catch {
            // Refresh failed, logout
          }
        }

        // Clear tokens and redirect to login
        await tokenStorage.clearTokens()
        router.replace('/(auth)/login')
      },
      onError: (error) => {
        console.error('API Error:', error)
      },
    })
  }

  return apiClient
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Helpers
// ─────────────────────────────────────────────────────────────────────────────

export async function handleLogin(email: string, password: string) {
  const api = getApi()
  const result = await api.auth.login({ email, password })

  await tokenStorage.setTokens(result.session.token, result.session.refreshToken)

  return result.user
}

export async function handleLogout() {
  const api = getApi()

  try {
    await api.auth.logout()
  } catch {
    // Ignore errors
  } finally {
    await tokenStorage.clearTokens()
    router.replace('/(auth)/login')
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await tokenStorage.getAccessToken()
  return !!token
}

// ─────────────────────────────────────────────────────────────────────────────
// React Query Integration
// ─────────────────────────────────────────────────────────────────────────────

// Example query keys for React Query / TanStack Query
export const queryKeys = {
  // Auth
  currentUser: ['auth', 'me'] as const,
  sessions: ['auth', 'sessions'] as const,

  // Polls
  polls: (params?: Record<string, unknown>) => ['polls', params] as const,
  poll: (id: string) => ['polls', id] as const,
  pollResults: (id: string) => ['polls', id, 'results'] as const,

  // Surveys
  surveys: (params?: Record<string, unknown>) => ['surveys', params] as const,
  survey: (id: string) => ['surveys', id] as const,

  // Tests
  tests: (params?: Record<string, unknown>) => ['tests', params] as const,
  test: (id: string) => ['tests', id] as const,

  // Users
  user: (username: string) => ['users', username] as const,
  followers: (username: string) => ['users', username, 'followers'] as const,
  following: (username: string) => ['users', username, 'following'] as const,

  // Notifications
  notifications: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,

  // Gamification
  gamificationProfile: ['gamification', 'profile'] as const,
  leaderboard: (period: string) => ['gamification', 'leaderboard', period] as const,
  badges: ['gamification', 'badges'] as const,

  // Organizations
  organizations: ['organizations'] as const,
  organization: (id: string) => ['organizations', id] as const,
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const api = getApi()
export default api
