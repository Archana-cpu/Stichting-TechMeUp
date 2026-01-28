'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - USER HOOKS
// React Query hooks for user profiles and social features
// ══════════════════════════════════════════════════════════════════════════════

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
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

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

const userKeys = {
  all: ['users'] as const,
  profile: (username: string) => [...userKeys.all, 'profile', username] as const,
  settings: () => [...userKeys.all, 'settings'] as const,
  followers: (username: string) => [...userKeys.all, 'followers', username] as const,
  following: (username: string) => [...userKeys.all, 'following', username] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Hooks
// ─────────────────────────────────────────────────────────────────────────────

function useUserProfile(username: string) {
  const api = getClientApi()

  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => api.users.getProfile(username),
    staleTime: 60 * 1000,
    enabled: !!username,
  })
}

function useUpdateProfile() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (data: { displayName?: string; bio?: string; avatarUrl?: string }) =>
      api.users.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(data.username), data)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Hooks
// ─────────────────────────────────────────────────────────────────────────────

function useUserSettings() {
  const api = getClientApi()

  return useQuery({
    queryKey: userKeys.settings(),
    queryFn: () => api.users.getSettings(),
    staleTime: 5 * 60 * 1000,
  })
}

function useUpdateSettings() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (settings: Record<string, unknown>) => api.users.updateSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.settings(), data)
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Social Hooks
// ─────────────────────────────────────────────────────────────────────────────

function useFollowers(username: string) {
  const api = getClientApi()

  return useInfiniteQuery({
    queryKey: userKeys.followers(username),
    queryFn: ({ pageParam = 1 }) => api.users.getFollowers(username, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
    enabled: !!username,
  })
}

function useFollowing(username: string) {
  const api = getClientApi()

  return useInfiniteQuery({
    queryKey: userKeys.following(username),
    queryFn: ({ pageParam = 1 }) => api.users.getFollowing(username, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
    enabled: !!username,
  })
}

function useFollow() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (username: string) => api.users.follow(username),
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(username) })
      queryClient.invalidateQueries({ queryKey: userKeys.followers(username) })
    },
  })
}

function useUnfollow() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (username: string) => api.users.unfollow(username),
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(username) })
      queryClient.invalidateQueries({ queryKey: userKeys.followers(username) })
    },
  })
}

function useBlock() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (username: string) => api.users.block(username),
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(username) })
    },
  })
}

function useUnblock() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (username: string) => api.users.unblock(username),
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(username) })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Search Hook
// ─────────────────────────────────────────────────────────────────────────────

function useSearchUsers(query: string) {
  const api = getClientApi()

  return useInfiniteQuery({
    queryKey: userKeys.search(query),
    queryFn: ({ pageParam = 1 }) => api.users.search(query, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
    enabled: query.length >= 2,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  userKeys,
  useUserProfile,
  useUpdateProfile,
  useUserSettings,
  useUpdateSettings,
  useFollowers,
  useFollowing,
  useFollow,
  useUnfollow,
  useBlock,
  useUnblock,
  useSearchUsers,
}

export type { User }
