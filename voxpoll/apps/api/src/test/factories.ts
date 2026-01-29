// @ts-nocheck
// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEST FACTORIES
// Type-safe mock data generators for testing
// TODO: Update factories to match current database schema
// ══════════════════════════════════════════════════════════════════════════════

import { createId } from '@paralleldrive/cuid2'
import type {
  User,
  Poll,
  Survey,
  Session,
  Organization,
  OrganizationMember,
  Notification,
  Comment,
  Badge,
} from '@voxpoll/database'
import type { PaginationMeta, PaginatedResult } from '../types/common.types'

// ─────────────────────────────────────────────────────────────────────────────
// Base Factory Helper
// ─────────────────────────────────────────────────────────────────────────────

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

function createFactory<T>(defaults: () => T) {
  return (overrides: DeepPartial<T> = {}): T => ({
    ...defaults(),
    ...overrides,
  }) as T
}

// ─────────────────────────────────────────────────────────────────────────────
// User Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockUser = createFactory<User>(() => ({
  id: createId(),
  email: `user-${createId()}@test.local`,
  username: `user_${createId().slice(0, 8)}`,
  displayName: 'Test User',
  passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$mock$hash',
  role: 'USER',
  status: 'ACTIVE',
  subscriptionTier: 'FREE',
  subscriptionExpiresAt: null,
  emailVerified: true,
  emailVerifiedAt: new Date(),
  phoneNumber: null,
  phoneVerified: false,
  phoneVerifiedAt: null,
  verificationLevel: 'BASIC',
  avatarUrl: null,
  coverImageUrl: null,
  bio: null,
  website: null,
  location: null,
  birthDate: null,
  gender: null,
  language: 'en',
  timezone: 'UTC',
  country: null,
  city: null,
  demographicsCompleted: false,
  privacySettings: {},
  notificationSettings: {},
  onboardingCompleted: true,
  onboardingStep: null,
  lastLoginAt: new Date(),
  lastActiveAt: new Date(),
  loginCount: 1,
  failedLoginAttempts: 0,
  lockoutUntil: null,
  totpEnabled: false,
  totpSecret: null,
  backupCodes: [],
  recoveryEmail: null,
  recoveryPhone: null,
  trustedDevices: [],
  activeSessions: 1,
  deactivatedAt: null,
  deactivationReason: null,
  suspendedAt: null,
  suspensionReason: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Session Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockSession = createFactory<Session>(() => {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  return {
    id: createId(),
    userId: createId(),
    tokenHash: `hash_${createId()}`,
    refreshTokenHash: `refresh_${createId()}`,
    deviceId: createId(),
    deviceName: 'Test Device',
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    ip: '127.0.0.1',
    location: null,
    isRevoked: false,
    revokedAt: null,
    revokedReason: null,
    lastActivityAt: now,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Poll Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockPoll = createFactory<Poll>(() => {
  const now = new Date()
  const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  return {
    id: createId(),
    creatorId: createId(),
    organizationId: null,
    type: 'STANDARD',
    votingSystem: 'SINGLE_CHOICE',
    title: 'Test Poll',
    description: 'A test poll for unit testing',
    slug: `test-poll-${createId().slice(0, 6)}`,
    coverImageUrl: null,
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    approvalStatus: 'NONE',
    requiresApproval: false,
    currentApprovalId: null,
    categoryId: null,
    tags: [],
    startsAt: null,
    endsAt,
    options: [
      { id: createId(), text: 'Option A', position: 0 },
      { id: createId(), text: 'Option B', position: 1 },
    ],
    allowMultipleVotes: false,
    maxVotesPerUser: 1,
    requireAuth: false,
    showResultsBeforeVote: false,
    resultVisibility: 'ALWAYS',
    isAnonymous: true,
    hasPreTest: false,
    preTestQuestions: [],
    preTestPassingScore: null,
    allowDiscussion: true,
    participantCount: 0,
    viewCount: 0,
    shareCount: 0,
    commentCount: 0,
    hotScore: 0,
    hotScoreUpdatedAt: null,
    reliabilityScore: null,
    reliabilityFactors: {},
    reliabilityUpdatedAt: null,
    qualityThreshold: 0,
    version: 1,
    premiumLocked: false,
    editLocked: false,
    publishedAt: now,
    archivedAt: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Poll with Relations (for service return types)
// ─────────────────────────────────────────────────────────────────────────────

export interface PollWithRelations extends Poll {
  creator: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
    verificationLevel: User['verificationLevel']
  } | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  _count: {
    responses: number
  }
}

export const createMockPollWithRelations = (
  overrides: DeepPartial<PollWithRelations> = {}
): PollWithRelations => {
  const basePoll = createMockPoll(overrides)
  return {
    ...basePoll,
    creator: overrides.creator ?? {
      id: basePoll.creatorId,
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: null,
      verificationLevel: 'BASIC',
    },
    category: overrides.category ?? null,
    _count: overrides._count ?? { responses: 0 },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Survey Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockSurvey = createFactory<Survey>(() => {
  const now = new Date()

  return {
    id: createId(),
    creatorId: createId(),
    organizationId: null,
    title: 'Test Survey',
    description: 'A test survey for unit testing',
    slug: `test-survey-${createId().slice(0, 6)}`,
    coverImageUrl: null,
    status: 'ACTIVE',
    visibility: 'PUBLIC',
    approvalStatus: 'NONE',
    requiresApproval: false,
    currentApprovalId: null,
    categoryId: null,
    tags: [],
    estimatedDuration: 10,
    maxResponses: null,
    requireAuth: false,
    allowAnonymous: true,
    showProgressBar: true,
    allowBackNavigation: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    completionMessage: null,
    redirectUrl: null,
    participantCount: 0,
    completionCount: 0,
    averageCompletionTime: null,
    abandonmentRate: null,
    viewCount: 0,
    shareCount: 0,
    hotScore: 0,
    hotScoreUpdatedAt: null,
    reliabilityScore: null,
    reliabilityFactors: {},
    reliabilityUpdatedAt: null,
    qualityThreshold: 0,
    version: 1,
    premiumLocked: false,
    editLocked: false,
    startsAt: null,
    endsAt: null,
    publishedAt: now,
    archivedAt: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Organization Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockOrganization = createFactory<Organization>(() => ({
  id: createId(),
  name: 'Test Organization',
  slug: `test-org-${createId().slice(0, 6)}`,
  description: 'A test organization',
  logoUrl: null,
  coverImageUrl: null,
  website: null,
  type: 'COMPANY',
  plan: 'FREE',
  maxMembers: 10,
  isVerified: false,
  verifiedAt: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  settings: {},
  createdAt: new Date(),
  updatedAt: new Date(),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Organization Member Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockOrgMember = createFactory<OrganizationMember>(() => ({
  id: createId(),
  organizationId: createId(),
  userId: createId(),
  role: 'MEMBER',
  permissions: [],
  invitedBy: null,
  joinedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Comment Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockComment = createFactory<Comment>(() => ({
  id: createId(),
  discussionId: createId(),
  authorId: createId(),
  testId: null,
  parentId: null,
  rootId: null,
  depth: 0,
  content: 'Test comment content',
  upvotes: 0,
  downvotes: 0,
  wilsonScore: 0,
  controversyScore: 0,
  replyCount: 0,
  isEdited: false,
  editedAt: null,
  editHistory: [],
  isPinned: false,
  pinnedAt: null,
  status: 'VISIBLE',
  hiddenAt: null,
  hiddenReason: null,
  reportCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}))

// ─────────────────────────────────────────────────────────────────────────────
// Notification Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockNotification = createFactory<Notification>(() => ({
  id: createId(),
  userId: createId(),
  type: 'POLL_VOTE',
  category: 'ENGAGEMENT',
  priority: 'NORMAL',
  title: 'Test Notification',
  body: 'This is a test notification',
  actorId: null,
  actorType: 'USER',
  actorName: null,
  actorAvatarUrl: null,
  resourceId: null,
  resourceType: null,
  resourceTitle: null,
  actionUrl: null,
  actionLabel: null,
  imageUrl: null,
  aggregationId: null,
  aggregatedCount: 1,
  metadata: {},
  status: 'UNREAD',
  readAt: null,
  archivedAt: null,
  deletedAt: null,
  expiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Badge Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockBadge = createFactory<Badge>(() => ({
  id: createId(),
  name: 'Test Badge',
  description: 'A test badge',
  iconUrl: '/badges/test.svg',
  category: 'ACHIEVEMENT',
  rarity: 'COMMON',
  xpReward: 10,
  criteria: {},
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Factory
// ─────────────────────────────────────────────────────────────────────────────

export const createMockPaginationMeta = (
  overrides: Partial<PaginationMeta> = {}
): PaginationMeta => ({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasMore: false,
  ...overrides,
})

export function createMockPaginatedResult<T>(
  items: T[],
  meta?: Partial<PaginationMeta>
): PaginatedResult<T> {
  return {
    items,
    meta: createMockPaginationMeta({
      total: items.length,
      totalPages: 1,
      ...meta,
    }),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Vote Metadata Factory
// ─────────────────────────────────────────────────────────────────────────────

export interface VoteMetadata {
  ip?: string
  userAgent?: string
  deviceFingerprint?: string
}

export const createMockVoteMetadata = (
  overrides: Partial<VoteMetadata> = {}
): VoteMetadata => ({
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0 (Test)',
  ...overrides,
})

// ─────────────────────────────────────────────────────────────────────────────
// Auth Token Factory
// ─────────────────────────────────────────────────────────────────────────────

export interface MockAuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export const createMockAuthTokens = (): MockAuthTokens => ({
  accessToken: `access_${createId()}`,
  refreshToken: `refresh_${createId()}`,
  expiresIn: 900,
})
