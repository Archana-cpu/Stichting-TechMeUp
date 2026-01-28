// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - RATE LIMITS & QUOTAS
// ══════════════════════════════════════════════════════════════════════════════

import type { SubscriptionTier, VerificationLevel } from './roles'

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Configurations
// ─────────────────────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  limit: number
  window: number // in seconds
  prefix: string
}

export const RATE_LIMITS = {
  // Auth
  login: { limit: 5, window: 900, prefix: 'rl:auth:login' }, // 5 per 15 min
  register: { limit: 3, window: 3600, prefix: 'rl:auth:register' }, // 3 per hour
  passwordReset: { limit: 3, window: 3600, prefix: 'rl:auth:pwd-reset' }, // 3 per hour
  passwordChange: { limit: 5, window: 3600, prefix: 'rl:auth:pwd-change' }, // 5 per hour
  refreshToken: { limit: 10, window: 3600, prefix: 'rl:auth:refresh' }, // 10 per hour
  verifyEmail: { limit: 5, window: 900, prefix: 'rl:auth:verify' }, // 5 per 15 min
  sendVerification: { limit: 3, window: 3600, prefix: 'rl:auth:send-verify' }, // 3 per hour

  // Content Creation
  createPoll: { limit: 10, window: 3600, prefix: 'rl:poll:create' }, // 10 per hour
  createSurvey: { limit: 5, window: 3600, prefix: 'rl:survey:create' }, // 5 per hour
  createTest: { limit: 5, window: 3600, prefix: 'rl:test:create' }, // 5 per hour
  createComment: { limit: 30, window: 3600, prefix: 'rl:comment:create' }, // 30 per hour (Bible P-058)

  // Interactions
  vote: { limit: 100, window: 3600, prefix: 'rl:vote' }, // 100 per hour
  follow: { limit: 50, window: 3600, prefix: 'rl:follow' }, // 50 per hour
  report: { limit: 10, window: 3600, prefix: 'rl:report' }, // 10 per hour

  // Messaging (Bible P-058)
  dmFree: { limit: 0, window: 86400, prefix: 'rl:dm:free' }, // FREE: 0 DMs
  dmPlus: { limit: 25, window: 86400, prefix: 'rl:dm:plus' }, // PLUS: 25/day
  dmPremium: { limit: 1000, window: 86400, prefix: 'rl:dm:premium' }, // PREMIUM: 1000/day

  // Live Poll (Bible P-058)
  livePollCodeGuess: { limit: 5, window: 300, prefix: 'rl:live:code' }, // 5 per 5 min + exponential backoff

  // General
  api: { limit: 100, window: 60, prefix: 'rl:api' }, // 100 per minute
  search: { limit: 30, window: 60, prefix: 'rl:search' }, // 30 per minute

  // Dangerous
  deleteAccount: { limit: 1, window: 86400, prefix: 'rl:delete-account' }, // 1 per day
  orgCreate: { limit: 3, window: 86400, prefix: 'rl:org:create' }, // 3 per day
} as const satisfies Record<string, RateLimitConfig>

// ─────────────────────────────────────────────────────────────────────────────
// Content Quotas by Subscription Tier
// ─────────────────────────────────────────────────────────────────────────────

export interface TierQuotas {
  pollsPerDay: number
  surveysPerMonth: number
  testsPerMonth: number
  testsPerWeek: number // Bible: testsPerWeek instead of testsPerMonth
  dmsPerDay: number // Bible P-058
  maxPollOptions: number
  maxSurveyQuestions: number
  maxTestQuestions: number
  maxFileUploadMB: number
  livePolls: boolean
  analytics: boolean
  exportData: boolean
  customBranding: boolean
  apiAccess: boolean
  prioritySupport: boolean
}

// Bible P-027: Tier-based Poll Option Limits
// FREE: 2-4 options, PLUS: 2-4 options, PREMIUM: 2-10 options
export const TIER_QUOTAS: Record<SubscriptionTier, TierQuotas> = {
  FREE: {
    pollsPerDay: 3,
    surveysPerMonth: 0,
    testsPerMonth: 1,
    testsPerWeek: 3, // Bible: 3 tests/week
    dmsPerDay: 0, // Bible P-058: FREE = 0 DMs
    maxPollOptions: 4, // P-027: 2-4 options (Quick Poll)
    maxSurveyQuestions: 0,
    maxTestQuestions: 10,
    maxFileUploadMB: 5,
    livePolls: false,
    analytics: false,
    exportData: false,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
  },
  PLUS: {
    pollsPerDay: 10,
    surveysPerMonth: 0, // P-015: Surveys B2B only
    testsPerMonth: 5,
    testsPerWeek: 10, // Bible: 10 tests/week
    dmsPerDay: 25, // Bible P-058: PLUS = 25/day
    maxPollOptions: 4, // P-027: 2-4 options (Quick Poll - same as FREE)
    maxSurveyQuestions: 0, // P-015: Surveys B2B only
    maxTestQuestions: 30,
    maxFileUploadMB: 25,
    livePolls: false, // P-014: Live Poll PREMIUM only
    analytics: true,
    exportData: true,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
  },
  PREMIUM: {
    pollsPerDay: -1, // P-058: unlimited
    surveysPerMonth: 0, // P-015: Surveys B2B only (org context required)
    testsPerMonth: -1, // P-058: unlimited
    testsPerWeek: -1, // Bible: unlimited
    dmsPerDay: 1000, // Bible P-058: PREMIUM = 1000/day
    maxPollOptions: 10, // P-027: 2-10 options (Extended Poll)
    maxSurveyQuestions: 0, // P-015: Surveys B2B only
    maxTestQuestions: 50,
    maxFileUploadMB: 100,
    livePolls: true, // P-014: PREMIUM feature
    analytics: true,
    exportData: true,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
  },
  ENTERPRISE: {
    pollsPerDay: -1,
    surveysPerMonth: -1,
    testsPerMonth: -1,
    testsPerWeek: -1,
    dmsPerDay: -1, // Unlimited
    maxPollOptions: 20,
    maxSurveyQuestions: 500,
    maxTestQuestions: 200,
    maxFileUploadMB: 500,
    livePolls: true,
    analytics: true,
    exportData: true,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Limits
// ─────────────────────────────────────────────────────────────────────────────

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Content Limits
// ─────────────────────────────────────────────────────────────────────────────

export const CONTENT_LIMITS = {
  // User
  usernameMin: 3,
  usernameMax: 30,
  displayNameMax: 50,
  bioMax: 500,
  websiteMax: 255,

  // Poll
  pollTitleMin: 5,
  pollTitleMax: 200,
  pollDescriptionMax: 2000,
  pollOptionMin: 1,
  pollOptionMax: 100,

  // Survey
  surveyTitleMin: 5,
  surveyTitleMax: 200,
  surveyDescriptionMax: 5000,

  // Comment
  commentMin: 1,
  commentMax: 5000,

  // Organization
  orgNameMin: 2,
  orgNameMax: 100,
  orgDescriptionMax: 1000,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Verification Level Response Weights (Bible: 02-USERS, P-004)
// ─────────────────────────────────────────────────────────────────────────────

export const VERIFICATION_WEIGHTS: Record<VerificationLevel, number> = {
  NONE: 0.5,           // Level 0: Unverified (0.5x)
  BASIC: 1.0,          // Level 1: Email verified (1.0x)
  VERIFIED: 1.1,       // Level 2: Phone verified (1.1x)
  IDENTITY: 1.2,       // Level 3: Identity document verified (1.2x)
  FULLY_VERIFIED: 1.5, // Level 4: e-Devlet/Gov ID verified (1.5x)
} as const

export function getVerificationWeight(level: string | null | undefined): number {
  if (!level || !(level in VERIFICATION_WEIGHTS)) {
    return VERIFICATION_WEIGHTS.NONE
  }
  return VERIFICATION_WEIGHTS[level as VerificationLevel]
}

// ─────────────────────────────────────────────────────────────────────────────
// Session & Token Limits (Bible: T-005)
// ─────────────────────────────────────────────────────────────────────────────

export const SESSION_LIMITS = {
  accessTokenExpiry: 15 * 60 * 1000, // 15 minutes (Bible T-005)
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days (Bible T-005)
  sessionExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days (matches refresh token)
  verificationCodeExpiry: 15 * 60 * 1000, // 15 minutes
  passwordResetExpiry: 60 * 60 * 1000, // 1 hour
  maxSessionsPerUser: 5, // Bible T-005: Max 5 concurrent sessions
  maxSessionsPerDevice: 1, // Bible T-005: Max 1 session per device
  oauthStateExpiry: 5 * 60, // 5 minutes (seconds for Redis)
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Cache TTLs (in seconds)
// ─────────────────────────────────────────────────────────────────────────────

// Bible P-034: Result Caching - 5 minutes cache, invalidate on new response
export const CACHE_TTL = {
  userProfile: 300, // 5 minutes
  pollResults: 300, // 5 minutes (Bible P-034)
  surveyAnalytics: 300, // 5 minutes
  leaderboard: 60, // 1 minute
  feed: 30, // 30 seconds
  organizationData: 300, // 5 minutes
  notifications: 60, // 1 minute
} as const
