// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL MOBILE - POLL HOOKS
// React Query hooks for polls
// ══════════════════════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api, queryKeys } from '@/lib/api'
import type { CreatePollInput, VoteInput } from '@voxpoll/api/client'

// ─────────────────────────────────────────────────────────────────────────────
// List Polls Hook (Infinite Scroll)
// ─────────────────────────────────────────────────────────────────────────────

export function usePolls(params?: { sort?: string; category?: string }) {
  return useInfiniteQuery({
    queryKey: queryKeys.polls(params),
    queryFn: ({ pageParam = 1 }) =>
      api.polls.list({ ...params, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Single Poll Hook
// ─────────────────────────────────────────────────────────────────────────────

export function usePoll(id: string) {
  return useQuery({
    queryKey: queryKeys.poll(id),
    queryFn: () => api.polls.get(id),
    enabled: !!id,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Poll Results Hook
// ─────────────────────────────────────────────────────────────────────────────

export function usePollResults(id: string) {
  return useQuery({
    queryKey: queryKeys.pollResults(id),
    queryFn: () => api.polls.getResults(id),
    enabled: !!id,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Poll Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCreatePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePollInput) => api.polls.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Poll Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useUpdatePoll(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Partial<CreatePollInput>) => api.polls.update(id, input),
    onSuccess: (poll) => {
      queryClient.setQueryData(queryKeys.poll(id), poll)
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Poll Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useDeletePoll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.polls.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.poll(id) })
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Vote Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useVote(pollId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: VoteInput) => api.polls.vote(pollId, input),
    onSuccess: (results) => {
      queryClient.setQueryData(queryKeys.pollResults(pollId), results)
      queryClient.invalidateQueries({ queryKey: queryKeys.poll(pollId) })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Live Poll Hooks
// ─────────────────────────────────────────────────────────────────────────────

export function useStartLivePoll(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.polls.startLive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poll(id) })
    },
  })
}

export function useEndLivePoll(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.polls.endLive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poll(id) })
    },
  })
}
