'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - AUTH HOOKS
// React Query hooks for authentication
// ══════════════════════════════════════════════════════════════════════════════

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getClientApi } from '../../api'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  status: string
  role: string
  verificationLevel: string
  emailVerified: boolean
  subscriptionTier: string
  createdAt: string
  hasPassword: boolean
  linkedProviders: string[]
}

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  email: string
  password: string
  username: string
  displayName?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

function useCurrentUser() {
  const api = getClientApi()

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => api.auth.me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const api = getClientApi()

  return useMutation({
    mutationFn: (input: LoginInput) => api.auth.login(input),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user)
      queryClient.invalidateQueries({ queryKey: authKeys.all })
      router.push('/dashboard')
    },
  })
}

function useRegister() {
  const router = useRouter()
  const api = getClientApi()

  return useMutation({
    mutationFn: (input: RegisterInput) => api.auth.register(input),
    onSuccess: () => {
      router.push('/auth/login?registered=true')
    },
  })
}

function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const api = getClientApi()

  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      queryClient.clear()
      router.push('/auth/login')
    },
  })
}

function useLogoutAll() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const api = getClientApi()

  return useMutation({
    mutationFn: () => api.auth.logoutAll(),
    onSuccess: () => {
      queryClient.clear()
      router.push('/auth/login')
    },
  })
}

function useSessions() {
  const api = getClientApi()

  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => api.auth.sessions(),
    staleTime: 30 * 1000,
  })
}

function useRevokeSession() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (sessionId: string) => api.auth.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() })
    },
  })
}

function useForgotPassword() {
  const api = getClientApi()

  return useMutation({
    mutationFn: (email: string) => api.auth.forgotPassword(email),
  })
}

function useResetPassword() {
  const router = useRouter()
  const api = getClientApi()

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      api.auth.resetPassword(token, password),
    onSuccess: () => {
      router.push('/auth/login?reset=true')
    },
  })
}

function useChangePassword() {
  const api = getClientApi()

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      api.auth.changePassword(currentPassword, newPassword),
  })
}

function useVerifyEmail() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (code: string) => api.auth.verifyEmail(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
  })
}

function useResendVerification() {
  const api = getClientApi()

  return useMutation({
    mutationFn: () => api.auth.sendVerificationCode(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  authKeys,
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useLogoutAll,
  useSessions,
  useRevokeSession,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useVerifyEmail,
  useResendVerification,
}

export type { User, LoginInput, RegisterInput }
