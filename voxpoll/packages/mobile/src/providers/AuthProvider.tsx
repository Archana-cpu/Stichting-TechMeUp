// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL MOBILE - AUTH PROVIDER
// Authentication context ve state yönetimi
// ══════════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { tokenStorage } from '@/lib/api'
import type { User } from '@voxpoll/api/client'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: () => {},
})

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const segments = useSegments()

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Protect routes
  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'
    const isAuthenticated = !!user

    if (!isAuthenticated && !inAuthGroup) {
      // Kullanıcı giriş yapmamış ve auth sayfasında değil -> login'e yönlendir
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      // Kullanıcı giriş yapmış ve auth sayfasında -> ana sayfaya yönlendir
      router.replace('/(tabs)')
    }
  }, [user, segments, isLoading])

  async function checkAuthStatus() {
    try {
      const token = await tokenStorage.getAccessToken()

      if (token) {
        // Token var, kullanıcı bilgisini al
        const { api } = await import('@/lib/api')
        const userData = await api.auth.me()
        setUser(userData)
      }
    } catch (error) {
      // Token geçersiz veya expired
      await tokenStorage.clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
