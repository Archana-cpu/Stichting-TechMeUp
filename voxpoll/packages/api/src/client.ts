// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API CLIENT
// Type-safe API client for Next.js, React Native, and other platforms
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiClientConfig {
  baseUrl: string
  getToken?: () => Promise<string | null> | string | null
  onUnauthorized?: () => void
  onError?: (error: ApiError) => void
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface PaginatedResponse<T> {
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
// Auth Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string
  password: string
  username: string
  displayName?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthSession {
  token: string
  refreshToken: string
  expiresAt: string
}

export interface User {
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

export interface AuthResult {
  user: User
  session: AuthSession
}

// ─────────────────────────────────────────────────────────────────────────────
// Poll Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PollOption {
  id: string
  text: string
  order: number
  voteCount?: number
}

export interface Poll {
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

export interface CreatePollInput {
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

export interface VoteInput {
  optionIds: string[]
}

export interface PollResults {
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
// Survey Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Survey {
  id: string
  title: string
  description: string | null
  slug: string
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'
  responseCount: number
  createdAt: string
  sections: SurveySection[]
}

export interface SurveySection {
  id: string
  title: string
  description: string | null
  order: number
  questions: SurveyQuestion[]
}

export interface SurveyQuestion {
  id: string
  type: 'TEXT' | 'TEXTAREA' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'RATING' | 'SCALE' | 'DATE' | 'FILE'
  text: string
  required: boolean
  order: number
  options?: { id: string; text: string }[]
  settings?: Record<string, unknown>
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Test {
  id: string
  title: string
  description: string | null
  type: 'PERSONALITY' | 'QUIZ' | 'ASSESSMENT'
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'
  timeLimit: number | null
  attemptCount: number
  createdAt: string
}

export interface TestResult {
  id: string
  testId: string
  score?: number
  passed?: boolean
  resultType?: string
  completedAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  read: boolean
  createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  website: string | null
  memberCount: number
  createdAt: string
}

export interface OrganizationMember {
  id: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
  joinedAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Gamification Types
// ─────────────────────────────────────────────────────────────────────────────

export interface GamificationProfile {
  userId: string
  level: number
  xp: number
  xpToNextLevel: number
  rank: number
  badges: Badge[]
  streak: number
}

export interface Badge {
  id: string
  name: string
  description: string
  iconUrl: string
  earnedAt?: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  xp: number
  level: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────────────────────

function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    data.success === false &&
    'error' in data
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// API Client Class
// ─────────────────────────────────────────────────────────────────────────────

export class VoxPollClient {
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = config
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Core Request Method
  // ─────────────────────────────────────────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown
      params?: Record<string, string | number | boolean | undefined>
      requireAuth?: boolean
    }
  ): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path}`)

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value))
        }
      })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (options?.requireAuth !== false) {
      const token = await this.config.getToken?.()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })

    const data: unknown = await response.json()

    if (!response.ok || isApiError(data)) {
      if (response.status === 401) {
        this.config.onUnauthorized?.()
      }

      if (isApiError(data)) {
        this.config.onError?.(data)
        throw new VoxPollApiError(data.error.message, data.error.code, response.status)
      }

      throw new VoxPollApiError('Unknown error', 'UNKNOWN_ERROR', response.status)
    }

    return (data as ApiResponse<T>).data
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Auth Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  auth = {
    register: (input: RegisterInput) =>
      this.request<{ user: User; message: string }>('POST', '/auth/register', {
        body: input,
        requireAuth: false,
      }),

    login: (input: LoginInput) =>
      this.request<AuthResult>('POST', '/auth/login', {
        body: input,
        requireAuth: false,
      }),

    logout: () => this.request<void>('POST', '/auth/logout'),

    logoutAll: () => this.request<{ revokedCount: number }>('POST', '/auth/logout-all'),

    refresh: (refreshToken: string) =>
      this.request<AuthSession>('POST', '/auth/refresh', {
        body: { refreshToken },
        requireAuth: false,
      }),

    me: () => this.request<User>('GET', '/auth/me'),

    sessions: () =>
      this.request<
        {
          id: string
          device: string
          ipAddress: string
          lastActivityAt: string
          isCurrent: boolean
        }[]
      >('GET', '/auth/sessions'),

    revokeSession: (sessionId: string) =>
      this.request<void>('DELETE', `/auth/sessions/${sessionId}`),

    sendVerificationCode: () =>
      this.request<{ expiresAt: string }>('POST', '/auth/verify/resend'),

    verifyEmail: (code: string) =>
      this.request<void>('POST', '/auth/verify/email', { body: { code } }),

    forgotPassword: (email: string) =>
      this.request<void>('POST', '/auth/password/forgot', {
        body: { email },
        requireAuth: false,
      }),

    resetPassword: (token: string, password: string) =>
      this.request<void>('POST', '/auth/password/reset', {
        body: { token, password },
        requireAuth: false,
      }),

    changePassword: (currentPassword: string, newPassword: string) =>
      this.request<void>('POST', '/auth/password/change', {
        body: { currentPassword, newPassword },
      }),

    getOAuthUrl: (provider: 'google' | 'github' | 'twitter') =>
      `${this.config.baseUrl}/auth/oauth/${provider}/initiate`,
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // User Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  users = {
    getProfile: (username: string) =>
      this.request<User>('GET', `/users/${username}`, { requireAuth: false }),

    updateProfile: (data: { displayName?: string; bio?: string; avatarUrl?: string }) =>
      this.request<User>('PATCH', '/users/me', { body: data }),

    getSettings: () => this.request<Record<string, unknown>>('GET', '/users/me/settings'),

    updateSettings: (settings: Record<string, unknown>) =>
      this.request<Record<string, unknown>>('PATCH', '/users/me/settings', { body: settings }),

    follow: (username: string) => this.request<void>('POST', `/users/${username}/follow`),

    unfollow: (username: string) => this.request<void>('DELETE', `/users/${username}/follow`),

    getFollowers: (username: string, page = 1, limit = 20) =>
      this.request<PaginatedResponse<User>>('GET', `/users/${username}/followers`, {
        params: { page, limit },
        requireAuth: false,
      }),

    getFollowing: (username: string, page = 1, limit = 20) =>
      this.request<PaginatedResponse<User>>('GET', `/users/${username}/following`, {
        params: { page, limit },
        requireAuth: false,
      }),

    block: (username: string) => this.request<void>('POST', `/users/${username}/block`),

    unblock: (username: string) => this.request<void>('DELETE', `/users/${username}/block`),

    search: (query: string, page = 1, limit = 20) =>
      this.request<PaginatedResponse<User>>('GET', '/users/search', {
        params: { q: query, page, limit },
        requireAuth: false,
      }),
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Poll Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  polls = {
    list: (params?: { page?: number; limit?: number; sort?: string; category?: string }) =>
      this.request<PaginatedResponse<Poll>>('GET', '/polls', {
        params,
        requireAuth: false,
      }),

    get: (id: string) =>
      this.request<Poll>('GET', `/polls/${id}`, { requireAuth: false }),

    create: (input: CreatePollInput) =>
      this.request<Poll>('POST', '/polls', { body: input }),

    update: (id: string, input: Partial<CreatePollInput>) =>
      this.request<Poll>('PATCH', `/polls/${id}`, { body: input }),

    delete: (id: string) => this.request<void>('DELETE', `/polls/${id}`),

    vote: (id: string, input: VoteInput) =>
      this.request<PollResults>('POST', `/polls/${id}/vote`, { body: input }),

    getResults: (id: string) =>
      this.request<PollResults>('GET', `/polls/${id}/results`, { requireAuth: false }),

    getAnalytics: (id: string) =>
      this.request<Record<string, unknown>>('GET', `/polls/${id}/analytics`),

    startLive: (id: string) => this.request<void>('POST', `/polls/${id}/live/start`),

    endLive: (id: string) => this.request<void>('POST', `/polls/${id}/live/end`),
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Survey Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  surveys = {
    list: (params?: { page?: number; limit?: number }) =>
      this.request<PaginatedResponse<Survey>>('GET', '/surveys', {
        params,
        requireAuth: false,
      }),

    get: (id: string) =>
      this.request<Survey>('GET', `/surveys/${id}`, { requireAuth: false }),

    create: (input: { title: string; description?: string; visibility: string }) =>
      this.request<Survey>('POST', '/surveys', { body: input }),

    update: (id: string, input: Partial<Survey>) =>
      this.request<Survey>('PATCH', `/surveys/${id}`, { body: input }),

    delete: (id: string) => this.request<void>('DELETE', `/surveys/${id}`),

    publish: (id: string) => this.request<Survey>('POST', `/surveys/${id}/publish`),

    addSection: (id: string, section: { title: string; description?: string; order: number }) =>
      this.request<SurveySection>('POST', `/surveys/${id}/sections`, { body: section }),

    addQuestion: (id: string, question: Omit<SurveyQuestion, 'id'> & { sectionId: string }) =>
      this.request<SurveyQuestion>('POST', `/surveys/${id}/questions`, { body: question }),

    respond: (id: string, answers: { questionId: string; value: unknown }[]) =>
      this.request<void>('POST', `/surveys/${id}/respond`, { body: { answers } }),

    getResponses: (id: string, page = 1, limit = 20) =>
      this.request<PaginatedResponse<Record<string, unknown>>>('GET', `/surveys/${id}/responses`, {
        params: { page, limit },
      }),

    getAnalytics: (id: string) =>
      this.request<Record<string, unknown>>('GET', `/surveys/${id}/analytics`),
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Test Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  tests = {
    list: (params?: { page?: number; limit?: number; type?: string }) =>
      this.request<PaginatedResponse<Test>>('GET', '/tests', {
        params,
        requireAuth: false,
      }),

    get: (id: string) =>
      this.request<Test>('GET', `/tests/${id}`, { requireAuth: false }),

    createPersonality: (input: Record<string, unknown>) =>
      this.request<Test>('POST', '/tests/personality', { body: input }),

    createQuiz: (input: Record<string, unknown>) =>
      this.request<Test>('POST', '/tests/quiz', { body: input }),

    update: (id: string, input: Partial<Test>) =>
      this.request<Test>('PATCH', `/tests/${id}`, { body: input }),

    delete: (id: string) => this.request<void>('DELETE', `/tests/${id}`),

    startAttempt: (id: string) =>
      this.request<{ attemptId: string; questions: unknown[] }>('POST', `/tests/${id}/attempt`),

    submit: (id: string, attemptId: string, answers: { questionId: string; selectedOptionId: string }[]) =>
      this.request<TestResult>('POST', `/tests/${id}/submit`, { body: { attemptId, answers } }),

    getResults: (id: string) =>
      this.request<TestResult[]>('GET', `/tests/${id}/results`),

    getLeaderboard: (id: string, limit = 10) =>
      this.request<LeaderboardEntry[]>('GET', `/tests/${id}/leaderboard`, {
        params: { limit },
        requireAuth: false,
      }),
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Notification Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  notifications = {
    list: (page = 1, limit = 20) =>
      this.request<PaginatedResponse<Notification>>('GET', '/notifications', {
        params: { page, limit },
      }),

    getUnreadCount: () =>
      this.request<{ count: number }>('GET', '/notifications/unread-count'),

    markAsRead: (id: string) =>
      this.request<void>('POST', `/notifications/${id}/read`),

    markAllAsRead: () => this.request<void>('POST', '/notifications/read-all'),

    delete: (id: string) => this.request<void>('DELETE', `/notifications/${id}`),

    getPreferences: () =>
      this.request<Record<string, unknown>>('GET', '/notifications/preferences'),

    updatePreferences: (prefs: Record<string, unknown>) =>
      this.request<Record<string, unknown>>('PATCH', '/notifications/preferences', { body: prefs }),
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Organization Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  organizations = {
    list: () => this.request<Organization[]>('GET', '/organizations'),

    get: (id: string) =>
      this.request<Organization>('GET', `/organizations/${id}`, { requireAuth: false }),

    create: (input: { name: string; slug: string; description?: string; website?: string }) =>
      this.request<Organization>('POST', '/organizations', { body: input }),

    update: (id: string, input: Partial<Organization>) =>
      this.request<Organization>('PATCH', `/organizations/${id}`, { body: input }),

    delete: (id: string) => this.request<void>('DELETE', `/organizations/${id}`),

    getMembers: (id: string) =>
      this.request<OrganizationMember[]>('GET', `/organizations/${id}/members`),

    invite: (id: string, email: string, role: string) =>
      this.request<void>('POST', `/organizations/${id}/invitations`, { body: { email, role } }),

    updateMemberRole: (orgId: string, userId: string, role: string) =>
      this.request<void>('PATCH', `/organizations/${orgId}/members/${userId}/role`, { body: { role } }),

    removeMember: (orgId: string, userId: string) =>
      this.request<void>('DELETE', `/organizations/${orgId}/members/${userId}`),
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Gamification Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  gamification = {
    getProfile: () => this.request<GamificationProfile>('GET', '/gamification/profile'),

    getAllBadges: () =>
      this.request<Badge[]>('GET', '/gamification/badges', { requireAuth: false }),

    getEarnedBadges: () => this.request<Badge[]>('GET', '/gamification/badges/earned'),

    getLeaderboard: (period: 'daily' | 'weekly' | 'monthly' | 'allTime' = 'weekly', limit = 50) =>
      this.request<LeaderboardEntry[]>('GET', '/gamification/leaderboard', {
        params: { period, limit },
        requireAuth: false,
      }),

    getXpHistory: (page = 1, limit = 20) =>
      this.request<PaginatedResponse<{ action: string; xp: number; createdAt: string }>>(
        'GET',
        '/gamification/xp-history',
        { params: { page, limit } }
      ),
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Payment Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  payments = {
    getSubscription: () =>
      this.request<{ tier: string; status: string; expiresAt: string | null }>('GET', '/payments/subscription'),

    createCheckout: (tier: string, billingPeriod: string, currency: string) =>
      this.request<{ checkoutUrl: string }>('POST', '/payments/checkout', {
        body: { tier, billingPeriod, currency },
      }),

    cancel: (reason: string, feedback?: string) =>
      this.request<void>('POST', '/payments/cancel', { body: { reason, feedback } }),

    requestRefund: (reason: string, refundCase: string) =>
      this.request<void>('POST', '/payments/refund', { body: { reason, case: refundCase } }),

    getHistory: (page = 1, limit = 20) =>
      this.request<PaginatedResponse<Record<string, unknown>>>('GET', '/payments/history', {
        params: { page, limit },
      }),
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Moderation Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  moderation = {
    createReport: (input: {
      targetType: 'POLL' | 'SURVEY' | 'TEST' | 'COMMENT' | 'USER'
      targetId: string
      reason: string
      description?: string
    }) => this.request<void>('POST', '/reports', { body: input }),
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Comments Endpoints
  // ─────────────────────────────────────────────────────────────────────────────

  comments = {
    list: (discussionId: string, page = 1, limit = 20) =>
      this.request<PaginatedResponse<{ id: string; content: string; author: User; createdAt: string }>>(
        'GET',
        `/discussions/${discussionId}/comments`,
        { params: { page, limit }, requireAuth: false }
      ),

    create: (discussionId: string, content: string) =>
      this.request<{ id: string; content: string }>('POST', `/discussions/${discussionId}/comments`, {
        body: { content },
      }),

    update: (id: string, content: string) =>
      this.request<void>('PATCH', `/comments/${id}`, { body: { content } }),

    delete: (id: string) => this.request<void>('DELETE', `/comments/${id}`),

    vote: (id: string, value: 1 | -1 | 0) =>
      this.request<void>('POST', `/comments/${id}/vote`, { body: { value } }),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Class
// ─────────────────────────────────────────────────────────────────────────────

export class VoxPollApiError extends Error {
  code: string
  statusCode: number

  constructor(message: string, code: string, statusCode: number) {
    super(message)
    this.name = 'VoxPollApiError'
    this.code = code
    this.statusCode = statusCode
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory Function
// ─────────────────────────────────────────────────────────────────────────────

export function createVoxPollClient(config: ApiClientConfig): VoxPollClient {
  return new VoxPollClient(config)
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Export
// ─────────────────────────────────────────────────────────────────────────────

export default VoxPollClient
