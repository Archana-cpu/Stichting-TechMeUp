// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL MOBILE - AUTH HOOKS
// React Query hooks for authentication
// ══════════════════════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys, tokenStorage, handleLogin, handleLogout } from '@/lib/api'
import type { User, RegisterInput } from '@voxpoll/api/client'

// ─────────────────────────────────────────────────────────────────────────────
// Current User Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => api.auth.me(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Login Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      handleLogin(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.currentUser, user)
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Register Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => api.auth.register(input),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Logout Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: handleLogout,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Sessions Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => api.auth.sessions(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Revoke Session Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useRevokeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => api.auth.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify Email Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useVerifyEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => api.auth.verifyEmail(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Resend Verification Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useResendVerification() {
  return useMutation({
    mutationFn: () => api.auth.sendVerificationCode(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Forgot Password Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.auth.forgotPassword(email),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset Password Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      api.auth.resetPassword(token, password),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Change Password Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => api.auth.changePassword(currentPassword, newPassword),
  })
}
