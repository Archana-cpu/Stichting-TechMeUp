// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - API TYPES
// Shared types for API client and hooks
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// User Types
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
// Poll Types
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

interface PollListParams {
  page?: number
  limit?: number
  sort?: string
  category?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Types
// ─────────────────────────────────────────────────────────────────────────────

interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export type {
  User,
  LoginInput,
  RegisterInput,
  PollOption,
  Poll,
  CreatePollInput,
  VoteInput,
  PollResults,
  PollListParams,
  PaginatedResponse,
}
