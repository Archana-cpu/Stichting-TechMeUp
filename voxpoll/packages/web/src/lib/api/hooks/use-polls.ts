'use client'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - POLL HOOKS
// React Query hooks for polls
// ══════════════════════════════════════════════════════════════════════════════

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { getClientApi } from '../../api'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PollOption {
  id: string
  text: string
  order: number
  voteCount?: number
}

interface Poll {
  id: string
  title: string
  description: string | null
  slug: string
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'RANKING' | 'RATING'
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'
  options: PollOption[]
  totalVotes: number
  createdAt: string
  endsAt: string | null
  creator: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
}

interface CreatePollInput {
  title: string
  description?: string
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'RANKING' | 'RATING'
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
  options: { text: string; order: number }[]
  endsAt?: string
  settings?: {
    allowAnonymous?: boolean
    showResultsBeforeVoting?: boolean
    requireVerification?: boolean
    maxVotesPerUser?: number
  }
}

interface VoteInput {
  optionIds: string[]
}

interface PollResults {
  pollId: string
  totalVotes: number
  options: {
    id: string
    text: string
    voteCount: number
    percentage: number
  }[]
  userVote?: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

const pollKeys = {
  all: ['polls'] as const,
  lists: () => [...pollKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...pollKeys.lists(), filters] as const,
  details: () => [...pollKeys.all, 'detail'] as const,
  detail: (id: string) => [...pollKeys.details(), id] as const,
  results: (id: string) => [...pollKeys.detail(id), 'results'] as const,
  analytics: (id: string) => [...pollKeys.detail(id), 'analytics'] as const,
  my: () => [...pollKeys.all, 'my'] as const,
}

// ─────────────────────────────────────────────────────────────────────────────
// List Hooks
// ─────────────────────────────────────────────────────────────────────────────

interface PollListParams {
  page?: number
  limit?: number
  sort?: string
  category?: string
}

function usePolls(params?: PollListParams) {
  const api = getClientApi()

  return useQuery({
    queryKey: pollKeys.list((params ?? {}) as Record<string, unknown>),
    queryFn: () => api.polls.list(params),
    staleTime: 30 * 1000,
  })
}

function usePollsInfinite(params?: Omit<PollListParams, 'page'>) {
  const api = getClientApi()

  return useInfiniteQuery({
    queryKey: pollKeys.list({ ...params, infinite: true }),
    queryFn: ({ pageParam = 1 }) =>
      api.polls.list({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail Hooks
// ─────────────────────────────────────────────────────────────────────────────

function usePoll(id: string) {
  const api = getClientApi()

  return useQuery({
    queryKey: pollKeys.detail(id),
    queryFn: () => api.polls.get(id),
    staleTime: 30 * 1000,
    enabled: !!id,
  })
}

function usePollResults(id: string) {
  const api = getClientApi()

  return useQuery({
    queryKey: pollKeys.results(id),
    queryFn: () => api.polls.getResults(id),
    staleTime: 10 * 1000,
    enabled: !!id,
  })
}

function usePollAnalytics(id: string) {
  const api = getClientApi()

  return useQuery({
    queryKey: pollKeys.analytics(id),
    queryFn: () => api.polls.getAnalytics(id),
    staleTime: 60 * 1000,
    enabled: !!id,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutation Hooks
// ─────────────────────────────────────────────────────────────────────────────

function useCreatePoll() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (input: CreatePollInput) => api.polls.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pollKeys.my() })
    },
  })
}

function useUpdatePoll() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreatePollInput> }) =>
      api.polls.update(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(pollKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() })
    },
  })
}

function useDeletePoll() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (id: string) => api.polls.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: pollKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: pollKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pollKeys.my() })
    },
  })
}

function useVote() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: ({ pollId, input }: { pollId: string; input: VoteInput }) =>
      api.polls.vote(pollId, input),
    onSuccess: (data, { pollId }) => {
      queryClient.setQueryData(pollKeys.results(pollId), data)
      queryClient.invalidateQueries({ queryKey: pollKeys.detail(pollId) })
    },
  })
}

function useStartLivePoll() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (id: string) => api.polls.startLive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: pollKeys.detail(id) })
    },
  })
}

function useEndLivePoll() {
  const queryClient = useQueryClient()
  const api = getClientApi()

  return useMutation({
    mutationFn: (id: string) => api.polls.endLive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: pollKeys.detail(id) })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  pollKeys,
  usePolls,
  usePollsInfinite,
  usePoll,
  usePollResults,
  usePollAnalytics,
  useCreatePoll,
  useUpdatePoll,
  useDeletePoll,
  useVote,
  useStartLivePoll,
  useEndLivePoll,
}

export type { Poll, CreatePollInput, VoteInput, PollResults, PollListParams }
