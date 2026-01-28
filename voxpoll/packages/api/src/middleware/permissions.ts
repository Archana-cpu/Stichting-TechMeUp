// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - PERMISSIONS MIDDLEWARE
// Role-based access control and authorization
// ══════════════════════════════════════════════════════════════════════════════

import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import { db, organizationMembers, eq, and } from '@voxpoll/database'
import { ApiError } from './error-handler'
import type { AppEnv } from '../types'
import {
  USER_ROLE_LEVELS,
  ORG_ROLE_LEVELS,
  SUBSCRIPTION_TIERS,
  type UserRole,
  type OrgRole,
  type SubscriptionTier,
} from '../constants/roles'
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/messages'

// ─────────────────────────────────────────────────────────────────────────────
// Require Minimum User Role
// ─────────────────────────────────────────────────────────────────────────────

export function requireRole(minimumRole: UserRole) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    }

    const userRole = (user.role as UserRole) || 'USER'
    const userLevel = USER_ROLE_LEVELS[userRole] ?? 0
    const requiredLevel = USER_ROLE_LEVELS[minimumRole]

    if (userLevel < requiredLevel) {
      throw ApiError.forbidden(
        `This action requires ${minimumRole} role or higher`,
        ERROR_CODES.FORBIDDEN
      )
    }

    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Require Email Verification
// ─────────────────────────────────────────────────────────────────────────────

export const requireVerified = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user')

  if (!user) {
    throw ApiError.unauthorized(
      ERROR_MESSAGES.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    )
  }

  if (!user.emailVerified) {
    throw ApiError.forbidden(
      ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
      ERROR_CODES.EMAIL_NOT_VERIFIED
    )
  }

  await next()
})

// ─────────────────────────────────────────────────────────────────────────────
// Require Active Account
// ─────────────────────────────────────────────────────────────────────────────

export const requireActive = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user')

  if (!user) {
    throw ApiError.unauthorized(
      ERROR_MESSAGES.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    )
  }

  switch (user.status) {
    case 'BANNED':
      throw ApiError.forbidden(
        ERROR_MESSAGES.ACCOUNT_BANNED,
        ERROR_CODES.ACCOUNT_BANNED
      )
    case 'SUSPENDED':
      throw ApiError.forbidden(
        ERROR_MESSAGES.ACCOUNT_SUSPENDED,
        ERROR_CODES.ACCOUNT_SUSPENDED
      )
    case 'DEACTIVATED':
      throw ApiError.forbidden(
        ERROR_MESSAGES.ACCOUNT_DEACTIVATED,
        ERROR_CODES.ACCOUNT_DEACTIVATED
      )
    case 'PENDING_VERIFICATION':
      // Allow pending verification users to complete verification
      break
    case 'ACTIVE':
      // All good
      break
    default:
      // Unknown status, allow
      break
  }

  await next()
})

// ─────────────────────────────────────────────────────────────────────────────
// Require Premium Subscription
// ─────────────────────────────────────────────────────────────────────────────

export const requirePremium = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get('user')

  if (!user) {
    throw ApiError.unauthorized(
      ERROR_MESSAGES.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    )
  }

  const tier = (user.subscriptionTier as SubscriptionTier) || SUBSCRIPTION_TIERS.FREE

  if (tier === SUBSCRIPTION_TIERS.FREE) {
    throw ApiError.forbidden(
      ERROR_MESSAGES.PREMIUM_REQUIRED,
      ERROR_CODES.PREMIUM_REQUIRED
    )
  }

  await next()
})

// ─────────────────────────────────────────────────────────────────────────────
// Require Minimum Subscription Tier
// ─────────────────────────────────────────────────────────────────────────────

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  FREE: 0,
  PLUS: 1,
  PREMIUM: 2,
  ENTERPRISE: 3,
}

export function requireTier(minimumTier: SubscriptionTier) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    }

    const userTier = (user.subscriptionTier as SubscriptionTier) || SUBSCRIPTION_TIERS.FREE
    const userLevel = TIER_LEVELS[userTier] ?? 0
    const requiredLevel = TIER_LEVELS[minimumTier]

    if (userLevel < requiredLevel) {
      throw ApiError.forbidden(
        `This feature requires ${minimumTier} subscription or higher`,
        ERROR_CODES.SUBSCRIPTION_REQUIRED
      )
    }

    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Require Organization Membership
// ─────────────────────────────────────────────────────────────────────────────

export function requireOrgMember(getOrgId?: (c: Context<AppEnv>) => string | undefined) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    }

    // Get organization ID from param, query, or custom getter
    const orgId = getOrgId?.(c) ?? c.req.param('organizationId') ?? c.req.query('organizationId')

    if (!orgId) {
      throw ApiError.badRequest(
        'Organization ID is required',
        ERROR_CODES.BAD_REQUEST
      )
    }

    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, user.id)
        )
      )
      .limit(1)

    if (!membership) {
      throw ApiError.forbidden(
        'You are not a member of this organization',
        ERROR_CODES.ORG_MEMBER_NOT_FOUND
      )
    }

    // Store membership in context for later use
    c.set('orgMembership', membership)

    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Require Organization Role
// ─────────────────────────────────────────────────────────────────────────────

export function requireOrgRole(minimumRole: OrgRole, getOrgId?: (c: Context<AppEnv>) => string | undefined) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    }

    // Get organization ID
    const orgId = getOrgId?.(c) ?? c.req.param('organizationId') ?? c.req.query('organizationId')

    if (!orgId) {
      throw ApiError.badRequest(
        'Organization ID is required',
        ERROR_CODES.BAD_REQUEST
      )
    }

    const [membership] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, orgId),
          eq(organizationMembers.userId, user.id)
        )
      )
      .limit(1)

    if (!membership) {
      throw ApiError.forbidden(
        'You are not a member of this organization',
        ERROR_CODES.ORG_MEMBER_NOT_FOUND
      )
    }

    const memberRole = membership.role as OrgRole
    const memberLevel = ORG_ROLE_LEVELS[memberRole] ?? 0
    const requiredLevel = ORG_ROLE_LEVELS[minimumRole]

    if (memberLevel < requiredLevel) {
      throw ApiError.forbidden(
        `This action requires ${minimumRole} role or higher in the organization`,
        ERROR_CODES.ORG_ROLE_REQUIRED
      )
    }

    // Store membership in context
    c.set('orgMembership', membership)

    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Require Resource Ownership
// ─────────────────────────────────────────────────────────────────────────────

export function requireOwnership(getOwnerId: (c: Context<AppEnv>) => Promise<string | null> | string | null) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    }

    // Admin and SuperAdmin can bypass ownership check
    const userRole = (user.role as UserRole) || 'USER'
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      await next()
      return
    }

    // Get the owner ID
    const ownerId = await Promise.resolve(getOwnerId(c))

    if (!ownerId) {
      throw ApiError.notFound(
        ERROR_MESSAGES.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      )
    }

    if (ownerId !== user.id) {
      throw ApiError.forbidden(
        'You do not have permission to access this resource',
        ERROR_CODES.FORBIDDEN
      )
    }

    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Require Self or Admin
// For endpoints that can be accessed by the user themselves or by admins
// ─────────────────────────────────────────────────────────────────────────────

export function requireSelfOrAdmin(getUserId: (c: Context<AppEnv>) => string | undefined) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    }

    const targetUserId = getUserId(c)

    if (!targetUserId) {
      throw ApiError.badRequest(
        'User ID is required',
        ERROR_CODES.BAD_REQUEST
      )
    }

    // Check if admin
    const userRole = (user.role as UserRole) || 'USER'
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'

    // Check if self
    const isSelf = user.id === targetUserId

    if (!isAdmin && !isSelf) {
      throw ApiError.forbidden(
        'You do not have permission to access this resource',
        ERROR_CODES.FORBIDDEN
      )
    }

    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Check Feature Access
// Checks if user's subscription tier allows access to a feature
// ─────────────────────────────────────────────────────────────────────────────

export function checkFeatureAccess(feature: keyof typeof FEATURE_TIERS) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    }

    const userTier = (user.subscriptionTier as SubscriptionTier) || SUBSCRIPTION_TIERS.FREE
    const requiredTier = FEATURE_TIERS[feature]

    const userLevel = TIER_LEVELS[userTier] ?? 0
    const requiredLevel = TIER_LEVELS[requiredTier]

    if (userLevel < requiredLevel) {
      throw ApiError.forbidden(
        `${feature} requires ${requiredTier} subscription or higher`,
        ERROR_CODES.SUBSCRIPTION_REQUIRED
      )
    }

    await next()
  })
}

// Feature to minimum tier mapping
const FEATURE_TIERS = {
  livePolls: 'PLUS' as SubscriptionTier,
  analytics: 'PLUS' as SubscriptionTier,
  exportData: 'PLUS' as SubscriptionTier,
  surveys: 'PLUS' as SubscriptionTier,
  customBranding: 'PREMIUM' as SubscriptionTier,
  apiAccess: 'PREMIUM' as SubscriptionTier,
  preTests: 'PREMIUM' as SubscriptionTier,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit by Tier
// Different rate limits based on subscription tier
// ─────────────────────────────────────────────────────────────────────────────

export function getTierMultiplier(tier: SubscriptionTier): number {
  switch (tier) {
    case 'ENTERPRISE':
      return 10
    case 'PREMIUM':
      return 5
    case 'PLUS':
      return 2
    case 'FREE':
    default:
      return 1
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PULSE Access Control (Bible - Results + Discussion Access)
// Free users: Must participate to access
// Plus/Premium: Can access without participation
// ─────────────────────────────────────────────────────────────────────────────

export interface PulseAccessResult {
  hasAccess: boolean
  reason?: 'participated' | 'premium_access' | 'creator' | 'admin'
  requiresParticipation?: boolean
}

export async function checkPulseAccess(
  userId: string | null,
  contentId: string,
  contentType: 'POLL' | 'SURVEY' | 'TEST',
  creatorId: string,
  participantHash?: string
): Promise<PulseAccessResult> {
  if (!userId) {
    return { hasAccess: false, requiresParticipation: true }
  }

  const { users, pollResponses, surveyResponses, personalityTestResults, quizAttempts } = await import('@voxpoll/database')
  const { eq, and, or } = await import('@voxpoll/database')

  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      subscriptionTier: users.subscriptionTier,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return { hasAccess: false, requiresParticipation: true }
  }

  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return { hasAccess: true, reason: 'admin' }
  }

  if (userId === creatorId) {
    return { hasAccess: true, reason: 'creator' }
  }

  const tier = (user.subscriptionTier as SubscriptionTier) || 'FREE'

  if (tier !== 'FREE') {
    return { hasAccess: true, reason: 'premium_access' }
  }

  if (participantHash) {
    let hasParticipated = false

    if (contentType === 'POLL') {
      const [response] = await db
        .select({ id: pollResponses.id })
        .from(pollResponses)
        .where(and(
          eq(pollResponses.pollId, contentId),
          eq(pollResponses.participantHash, participantHash)
        ))
        .limit(1)
      hasParticipated = !!response
    } else if (contentType === 'SURVEY') {
      const [response] = await db
        .select({ id: surveyResponses.id })
        .from(surveyResponses)
        .where(and(
          eq(surveyResponses.surveyId, contentId),
          eq(surveyResponses.participantHash, participantHash)
        ))
        .limit(1)
      hasParticipated = !!response
    } else if (contentType === 'TEST') {
      const [personalityResult] = await db
        .select({ id: personalityTestResults.id })
        .from(personalityTestResults)
        .where(and(
          eq(personalityTestResults.testId, contentId),
          eq(personalityTestResults.userId, userId)
        ))
        .limit(1)

      if (!personalityResult) {
        const [quizAttempt] = await db
          .select({ id: quizAttempts.id })
          .from(quizAttempts)
          .where(and(
            eq(quizAttempts.testId, contentId),
            eq(quizAttempts.userId, userId)
          ))
          .limit(1)
        hasParticipated = !!quizAttempt
      } else {
        hasParticipated = true
      }
    }

    if (hasParticipated) {
      return { hasAccess: true, reason: 'participated' }
    }
  }

  return { hasAccess: false, requiresParticipation: true }
}

export function requirePulseAccess(
  getContentInfo: (c: Context<AppEnv>) => Promise<{
    contentId: string
    contentType: 'POLL' | 'SURVEY' | 'TEST'
    creatorId: string
  }>
) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')
    const userId = user?.id ?? null

    const { contentId, contentType, creatorId } = await getContentInfo(c)

    const participantHash = c.req.header('X-Participant-Hash') || c.req.query('participantHash')

    const access = await checkPulseAccess(userId, contentId, contentType, creatorId, participantHash)

    if (!access.hasAccess) {
      throw ApiError.forbidden(
        'You must participate in this content to view results',
        ERROR_CODES.PULSE_ACCESS_DENIED
      )
    }

    c.set('pulseAccessReason', access.reason)
    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Comment Access Control (Bible P-060)
// READ: Same as PULSE (Free needs participation, Plus/Premium immediate)
// WRITE: Everyone must participate, Free also needs voice access request
// ─────────────────────────────────────────────────────────────────────────────

export interface CommentAccessResult {
  canRead: boolean
  canWrite: boolean
  readReason?: 'participated' | 'premium_access' | 'creator' | 'admin'
  writeReason?: 'participated' | 'creator' | 'admin'
  requiresParticipation?: boolean
  requiresVoiceAccess?: boolean
}

export async function checkCommentAccess(
  userId: string | null,
  contentId: string,
  contentType: 'POLL' | 'SURVEY' | 'TEST',
  creatorId: string,
  participantHash?: string
): Promise<CommentAccessResult> {
  if (!userId) {
    return {
      canRead: false,
      canWrite: false,
      requiresParticipation: true,
    }
  }

  const { users, pollResponses, surveyResponses, personalityTestResults, quizAttempts } = await import('@voxpoll/database')
  const { eq, and } = await import('@voxpoll/database')

  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      subscriptionTier: users.subscriptionTier,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return {
      canRead: false,
      canWrite: false,
      requiresParticipation: true,
    }
  }

  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return {
      canRead: true,
      canWrite: true,
      readReason: 'admin',
      writeReason: 'admin',
    }
  }

  if (userId === creatorId) {
    return {
      canRead: true,
      canWrite: true,
      readReason: 'creator',
      writeReason: 'creator',
    }
  }

  const tier = (user.subscriptionTier as SubscriptionTier) || 'FREE'
  let hasParticipated = false

  if (participantHash) {
    if (contentType === 'POLL') {
      const [response] = await db
        .select({ id: pollResponses.id })
        .from(pollResponses)
        .where(and(
          eq(pollResponses.pollId, contentId),
          eq(pollResponses.participantHash, participantHash)
        ))
        .limit(1)
      hasParticipated = !!response
    } else if (contentType === 'SURVEY') {
      const [response] = await db
        .select({ id: surveyResponses.id })
        .from(surveyResponses)
        .where(and(
          eq(surveyResponses.surveyId, contentId),
          eq(surveyResponses.participantHash, participantHash)
        ))
        .limit(1)
      hasParticipated = !!response
    } else if (contentType === 'TEST') {
      const [personalityResult] = await db
        .select({ id: personalityTestResults.id })
        .from(personalityTestResults)
        .where(and(
          eq(personalityTestResults.testId, contentId),
          eq(personalityTestResults.userId, userId)
        ))
        .limit(1)

      if (!personalityResult) {
        const [quizAttempt] = await db
          .select({ id: quizAttempts.id })
          .from(quizAttempts)
          .where(and(
            eq(quizAttempts.testId, contentId),
            eq(quizAttempts.userId, userId)
          ))
          .limit(1)
        hasParticipated = !!quizAttempt
      } else {
        hasParticipated = true
      }
    }
  }

  const canReadByTier = tier !== 'FREE'
  const canRead = canReadByTier || hasParticipated
  const canWrite = hasParticipated
  const requiresVoiceAccess = tier === 'FREE' && hasParticipated

  return {
    canRead,
    canWrite,
    readReason: canRead ? (canReadByTier ? 'premium_access' : 'participated') : undefined,
    writeReason: canWrite ? 'participated' : undefined,
    requiresParticipation: !hasParticipated,
    requiresVoiceAccess,
  }
}

export function requireCommentReadAccess(
  getContentInfo: (c: Context<AppEnv>) => Promise<{
    contentId: string
    contentType: 'POLL' | 'SURVEY' | 'TEST'
    creatorId: string
  }>
) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')
    const userId = user?.id ?? null

    const { contentId, contentType, creatorId } = await getContentInfo(c)
    const participantHash = c.req.header('X-Participant-Hash') || c.req.query('participantHash')

    const access = await checkCommentAccess(userId, contentId, contentType, creatorId, participantHash)

    if (!access.canRead) {
      throw ApiError.forbidden(
        'You must participate in this content to read comments',
        ERROR_CODES.COMMENT_READ_DENIED
      )
    }

    c.set('commentAccessReason', access.readReason)
    await next()
  })
}

export function requireCommentWriteAccess(
  getContentInfo: (c: Context<AppEnv>) => Promise<{
    contentId: string
    contentType: 'POLL' | 'SURVEY' | 'TEST'
    creatorId: string
  }>
) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')
    const userId = user?.id ?? null

    const { contentId, contentType, creatorId } = await getContentInfo(c)
    const participantHash = c.req.header('X-Participant-Hash') || c.req.query('participantHash')

    const access = await checkCommentAccess(userId, contentId, contentType, creatorId, participantHash)

    if (!access.canWrite) {
      if (access.requiresParticipation) {
        throw ApiError.forbidden(
          'You must participate in this content to write comments',
          ERROR_CODES.COMMENT_WRITE_DENIED
        )
      }
      throw ApiError.forbidden(
        'You do not have permission to write comments',
        ERROR_CODES.COMMENT_WRITE_DENIED
      )
    }

    c.set('commentAccessReason', access.writeReason)
    c.set('requiresVoiceAccess', access.requiresVoiceAccess)
    await next()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// B2B Survey Access Control (Bible P-015, P1-011)
// Surveys are exclusively for B2B organizations
// ─────────────────────────────────────────────────────────────────────────────

export interface B2BSurveyAccessResult {
  canAccess: boolean
  reason?: 'valid_membership' | 'owner' | 'admin'
  denied?: 'no_org' | 'not_member' | 'insufficient_role' | 'no_subscription'
}

export async function checkB2BSurveyAccess(
  userId: string,
  organizationId: string,
  requiredRole: OrgRole = 'CREATOR'
): Promise<B2BSurveyAccessResult> {
  const { organizations } = await import('@voxpoll/database')

  const [org] = await db
    .select({
      id: organizations.id,
      plan: organizations.plan,
      isVerified: organizations.isVerified,
      stripeSubscriptionId: organizations.stripeSubscriptionId,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)

  if (!org) {
    return { canAccess: false, denied: 'no_org' }
  }

  const [membership] = await db
    .select({
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId)
      )
    )
    .limit(1)

  if (!membership) {
    return { canAccess: false, denied: 'not_member' }
  }

  const memberRole = membership.role as OrgRole
  const memberLevel = ORG_ROLE_LEVELS[memberRole] ?? 0
  const requiredLevel = ORG_ROLE_LEVELS[requiredRole]

  if (memberLevel < requiredLevel) {
    return { canAccess: false, denied: 'insufficient_role' }
  }

  if (memberRole === 'OWNER') {
    return { canAccess: true, reason: 'owner' }
  }
  if (memberRole === 'ADMIN') {
    return { canAccess: true, reason: 'admin' }
  }

  return { canAccess: true, reason: 'valid_membership' }
}

export function requireB2BSurveyAccess(
  getOrgId: (c: Context<AppEnv>) => string | undefined,
  minimumRole: OrgRole = 'CREATOR'
) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      throw ApiError.unauthorized(
        ERROR_MESSAGES.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      )
    }

    const orgId = getOrgId(c)

    if (!orgId) {
      throw ApiError.badRequest(
        'Organization ID is required for survey operations',
        ERROR_CODES.BAD_REQUEST
      )
    }

    const access = await checkB2BSurveyAccess(user.id, orgId, minimumRole)

    if (!access.canAccess) {
      switch (access.denied) {
        case 'no_org':
          throw ApiError.notFound(
            'Organization not found',
            ERROR_CODES.ORG_NOT_FOUND
          )
        case 'not_member':
          throw ApiError.forbidden(
            'Surveys can only be created by organization members (B2B feature)',
            ERROR_CODES.SURVEY_B2B_REQUIRED
          )
        case 'insufficient_role':
          throw ApiError.forbidden(
            `You need ${minimumRole} role or higher in the organization to create surveys`,
            ERROR_CODES.ORG_ROLE_REQUIRED
          )
        case 'no_subscription':
          throw ApiError.forbidden(
            'Organization must have an active subscription to create surveys',
            ERROR_CODES.SUBSCRIPTION_REQUIRED
          )
        default:
          throw ApiError.forbidden(
            'You do not have permission to create surveys',
            ERROR_CODES.FORBIDDEN
          )
      }
    }

    await next()
  })
}
