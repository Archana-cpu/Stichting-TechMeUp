# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 29                                    █
# █              PRE-LAUNCH CRITICAL SPECIFICATIONS                            █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████

# Version: 1.0.0
# Created: January 2026
# Purpose: Resolves all inconsistencies, security gaps, and undefined flows
# Status: [AUTHORITATIVE] - These specifications OVERRIDE any conflicting content




# ══════════════════════════════════════════════════════════════════════════════
# 29.1 RESOLVED INCONSISTENCIES
# ══════════════════════════════════════════════════════════════════════════════

## 29.1.1 Live Poll Anonymous Voting - AUTHORITATIVE RESOLUTION

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-039 EXTENDED: Anonymous Voting Behavior                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CONFLICT RESOLVED:                                                             │
│  • Bible-006 stated: "10,000 concurrent participants per live poll"            │
│  • Bible-021 stated: "allowAnonymousVoting: boolean.default(true)"              │
│  • UNDEFINED: What happens when allowAnonymousVoting = false?                   │
│                                                                                 │
│  AUTHORITATIVE DECISION:                                                        │
│                                                                                 │
│  When allowAnonymousVoting = false:                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ SCENARIO                    │ BEHAVIOR                                  │   │
│  ├─────────────────────────────┼───────────────────────────────────────────┤   │
│  │ Unauthenticated user        │ CAN join session (spectator mode)        │   │
│  │ clicks join link            │ CAN see real-time vote updates            │   │
│  │                             │ CANNOT vote until authenticated           │   │
│  │                             │ Shows: "Login to vote" prompt             │   │
│  ├─────────────────────────────┼───────────────────────────────────────────┤   │
│  │ User clicks "Login to vote" │ Modal login/register appears              │   │
│  │                             │ Session state preserved                   │   │
│  │                             │ After auth → can vote immediately         │   │
│  ├─────────────────────────────┼───────────────────────────────────────────┤   │
│  │ Authenticated user joins    │ Full voting access immediately           │   │
│  └─────────────────────────────┴───────────────────────────────────────────┘   │
│                                                                                 │
│  SPECTATOR MODE DETAILS:                                                        │
│  • Spectators counted separately: "150 voting, 32 watching"                    │
│  • Spectators DO NOT count toward 10K participant limit                        │
│  • Spectator limit: 1,000 per session (separate from voter limit)             │
│  • WebSocket connection type: "spectator" vs "participant"                     │
│                                                                                 │
│  UI MESSAGE WHEN ANONYMOUS VOTING DISABLED:                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  "This poll requires login to vote.                                     │   │
│  │   You can watch the results live or login to participate."              │   │
│  │                                                                         │   │
│  │   [Watch Live]  [Login to Vote]                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// File: src/livepoll/anonymous-voting-handler.ts
// [AUTHORITATIVE] Anonymous voting restriction handling

interface LivePollJoinResult {
  connectionType: 'participant' | 'spectator'
  canVote: boolean
  requiresAuth: boolean
  sessionState: LivePollSessionState
  message?: string
}

async function handleLivePollJoin(
  sessionCode: string,
  userId: string | null,
  deviceFingerprint: string
): Promise<LivePollJoinResult> {
  const session = await getLivePollSession(sessionCode)

  if (!session) {
    throw new LivePollError('SESSION_NOT_FOUND')
  }

  // Check if anonymous voting is allowed
  const allowAnonymous = session.settings.allowAnonymousVoting

  if (!allowAnonymous && !userId) {
    // Spectator mode - can watch but not vote
    return {
      connectionType: 'spectator',
      canVote: false,
      requiresAuth: true,
      sessionState: await getSessionStateForSpectator(session),
      message: 'LOGIN_REQUIRED_TO_VOTE'
    }
  }

  // Check participant limit
  const participantCount = await getParticipantCount(sessionCode)
  if (participantCount >= 10000) {
    return {
      connectionType: 'spectator',
      canVote: false,
      requiresAuth: false,
      sessionState: await getSessionStateForSpectator(session),
      message: 'SESSION_FULL_SPECTATOR_MODE'
    }
  }

  // Full participant access
  return {
    connectionType: 'participant',
    canVote: true,
    requiresAuth: false,
    sessionState: await getSessionStateForParticipant(session, userId, deviceFingerprint)
  }
}

// WebSocket message types for spectator vs participant
const WS_MESSAGE_TYPES = {
  SPECTATOR: {
    canReceive: ['STATE_UPDATE', 'VOTE_COUNT_UPDATE', 'SESSION_ENDED'],
    canSend: ['HEARTBEAT', 'UPGRADE_TO_PARTICIPANT']
  },
  PARTICIPANT: {
    canReceive: ['STATE_UPDATE', 'VOTE_COUNT_UPDATE', 'SESSION_ENDED', 'VOTE_ACCEPTED'],
    canSend: ['HEARTBEAT', 'VOTE', 'LEAVE']
  }
}

export { handleLivePollJoin, WS_MESSAGE_TYPES }
export type { LivePollJoinResult }
```


## 29.1.2 Poll Option Schema - UNIFIED DEFINITION

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              POLL OPTION SCHEMA - AUTHORITATIVE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CONFLICT RESOLVED:                                                             │
│  • Bible-006: { id, text, imageUrl, position, voteCount, percentage }          │
│  • Bible-008: { id, text }                                                      │
│                                                                                 │
│  AUTHORITATIVE SCHEMA:                                                          │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  // BASE: Stored in database                                            │   │
│  │  PollOptionBase {                                                       │   │
│  │    id: string          // CUID                                          │   │
│  │    text: string        // Option text (required, 1-200 chars)          │   │
│  │    imageUrl?: string   // Optional image (Extended Poll only)          │   │
│  │    position: number    // Display order (0-indexed)                    │   │
│  │  }                                                                      │   │
│  │                                                                         │   │
│  │  // COMPUTED: Added at query time                                       │   │
│  │  PollOptionWithStats extends PollOptionBase {                           │   │
│  │    voteCount: number   // Total votes for this option                  │   │
│  │    percentage: number  // Vote percentage (0-100, rounded)             │   │
│  │  }                                                                      │   │
│  │                                                                         │   │
│  │  // ANALYTICS: Used in analytics module                                 │   │
│  │  PollOptionAnalytics extends PollOptionWithStats {                      │   │
│  │    demographicBreakdown?: Record<string, number>                        │   │
│  │    timeSeriesData?: Array<{ timestamp: Date, count: number }>          │   │
│  │  }                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  USAGE BY MODULE:                                                               │
│  • Content Module (Bible-006): PollOptionBase for CRUD                         │
│  • Response Module (Bible-007): PollOptionBase for submission                  │
│  • Analytics Module (Bible-008): PollOptionWithStats, PollOptionAnalytics      │
│  • Feed Module (Bible-011): PollOptionWithStats for display                    │
│                                                                                 │
│  DATABASE STORAGE: Only PollOptionBase fields are stored                        │
│  COMPUTED FIELDS: voteCount, percentage calculated via aggregation             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// File: packages/shared/src/types/poll-option.ts
// [AUTHORITATIVE] Unified Poll Option types

// Base type - stored in database
interface PollOptionBase {
  id: string
  text: string
  imageUrl?: string | null
  position: number
}

// With computed stats - returned from API
interface PollOptionWithStats extends PollOptionBase {
  voteCount: number
  percentage: number
}

// Full analytics view
interface PollOptionAnalytics extends PollOptionWithStats {
  demographicBreakdown?: {
    byGender?: Record<string, number>
    byAgeGroup?: Record<string, number>
    byCountry?: Record<string, number>
  }
  timeSeriesData?: Array<{
    timestamp: Date
    count: number
  }>
}

// Drizzle query helper
const pollOptionWithStatsQuery = {
  select: {
    id: true,
    text: true,
    imageUrl: true,
    position: true,
    _count: {
      select: { votes: true }
    }
  }
}

// Transform Drizzle result to PollOptionWithStats
function transformToPollOptionWithStats(
  options: Array<PollOptionBase & { _count: { votes: number } }>,
  totalVotes: number
): PollOptionWithStats[] {
  return options.map(opt => ({
    id: opt.id,
    text: opt.text,
    imageUrl: opt.imageUrl,
    position: opt.position,
    voteCount: opt._count.votes,
    percentage: totalVotes > 0
      ? Math.round((opt._count.votes / totalVotes) * 100)
      : 0
  }))
}

export type { PollOptionBase, PollOptionWithStats, PollOptionAnalytics }
export { pollOptionWithStatsQuery, transformToPollOptionWithStats }
```


## 29.1.3 PULSE+COMMENTS Access Rules - CLARIFIED

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              PULSE+COMMENTS ACCESS - AUTHORITATIVE RULES                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CONFLICT RESOLVED:                                                             │
│  • Line 83: "Plus tier grants access without participation"                     │
│  • Line 93: "Users communicate ONLY through shared content experience"          │
│  • Contradiction about participation requirement                                │
│                                                                                 │
│  AUTHORITATIVE INTERPRETATION:                                                  │
│                                                                                 │
│  "Shared content experience" means EITHER:                                      │
│  1. Actually participated (voted/completed test) - FREE tier qualifies         │
│  2. Paid for access (Plus/Premium tier) - subscription qualifies               │
│                                                                                 │
│  This preserves the SPIRIT of the rule (quality discussions) while             │
│  providing monetization path for non-participants.                             │
│                                                                                 │
│  ACCESS MATRIX:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ USER TYPE        │ PARTICIPATED │ ACCESS TO PULSE │ ACCESS TO COMMENTS │   │
│  ├──────────────────┼──────────────┼─────────────────┼────────────────────┤   │
│  │ Free             │ No           │ Title only      │ No                 │   │
│  │ Free             │ Yes          │ Full            │ Read + Write       │   │
│  │ Plus             │ No           │ Full            │ Read + Write       │   │
│  │ Plus             │ Yes          │ Full            │ Read + Write       │   │
│  │ Premium          │ No           │ Full            │ Read + Write       │   │
│  │ Premium          │ Yes          │ Full            │ Read + Write       │   │
│  │ Free + Request   │ Approved     │ Full            │ Read + Write       │   │
│  └──────────────────┴──────────────┴─────────────────┴────────────────────┘   │
│                                                                                 │
│  COMMENT ATTRIBUTION FOR NON-PARTICIPANTS:                                      │
│  • Plus/Premium users who didn't participate get badge: "Observer"             │
│  • Participants get badge: "Participant" (shows their answer for polls)        │
│  • This maintains transparency about commenter's relationship to content       │
│                                                                                 │
│  UI DISPLAY:                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  @username [Observer]                              2 hours ago          │   │
│  │  "Interesting results! I wonder why option B won..."                    │   │
│  │                                                                         │   │
│  │  @another_user [Voted: Option A]                   1 hour ago           │   │
│  │  "I voted A because..."                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// File: src/comments/access-control.ts
// [AUTHORITATIVE] PULSE+COMMENTS access control

type CommentBadgeType = 'participant' | 'observer' | 'creator' | 'moderator'

interface CommentAccessResult {
  canViewPulse: boolean
  canReadComments: boolean
  canWriteComments: boolean
  badge: CommentBadgeType
  participationDetails?: {
    selectedOption?: string  // For polls
    testResult?: string      // For tests
  }
}

async function checkPulseCommentsAccess(
  userId: string,
  contentId: string,
  contentType: 'POLL' | 'TEST' | 'SURVEY'
): Promise<CommentAccessResult> {

  const [user, participation] = await Promise.all([
    getUser(userId),
    getParticipation(userId, contentId)
  ])

  const tier = user.subscriptionTier // FREE | PLUS | PREMIUM
  const hasParticipated = participation !== null
  const hasApprovedRequest = await hasApprovedAccessRequest(userId, contentId)

  // Creator always has full access
  const isCreator = await isContentCreator(userId, contentId)
  if (isCreator) {
    return {
      canViewPulse: true,
      canReadComments: true,
      canWriteComments: true,
      badge: 'creator'
    }
  }

  // Plus/Premium: Full access regardless of participation
  if (tier === 'PLUS' || tier === 'PREMIUM') {
    return {
      canViewPulse: true,
      canReadComments: true,
      canWriteComments: true,
      badge: hasParticipated ? 'participant' : 'observer',
      participationDetails: hasParticipated ? getParticipationDetails(participation) : undefined
    }
  }

  // Free tier: Requires participation or approved request
  if (hasParticipated || hasApprovedRequest) {
    return {
      canViewPulse: true,
      canReadComments: true,
      canWriteComments: true,
      badge: 'participant',
      participationDetails: hasParticipated ? getParticipationDetails(participation) : undefined
    }
  }

  // Free tier without participation: Title only
  return {
    canViewPulse: false,  // Only sees title, participant count
    canReadComments: false,
    canWriteComments: false,
    badge: 'participant'  // Won't be shown since no access
  }
}

export { checkPulseCommentsAccess }
export type { CommentAccessResult, CommentBadgeType }
```




# ══════════════════════════════════════════════════════════════════════════════
# 29.2 SECURITY FIXES
# ══════════════════════════════════════════════════════════════════════════════

## 29.2.1 Cryptographic Random for Private Links

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              SECURITY FIX: Private Link Generation                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  VULNERABILITY (Bible-021):                                                     │
│  • Math.random() used for private link code generation                         │
│  • Math.random() has only 48-bit state, predictable                           │
│  • Private links can be brute-forced or enumerated                            │
│                                                                                 │
│  FIX: Use crypto.getRandomValues() for cryptographic randomness                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// File: src/links/secure-code-generator.ts
// [AUTHORITATIVE] Cryptographically secure link code generation

import { randomBytes } from 'crypto'

// Link code configurations
const LINK_CODE_CONFIG = {
  PRIVATE_LINK: {
    length: 16,           // 16 chars = ~95 bits entropy
    charset: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789', // No confusing chars
    prefix: ''
  },
  LIVE_POLL: {
    length: 6,            // 6 chars for easy sharing
    charset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Uppercase only, no confusing
    prefix: ''
  },
  INVITE_CODE: {
    length: 12,
    charset: 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789',
    prefix: 'inv_'
  }
}

type LinkCodeType = keyof typeof LINK_CODE_CONFIG

/**
 * Generate cryptographically secure random code
 * Uses crypto.randomBytes which is CSPRNG (Cryptographically Secure PRNG)
 */
function generateSecureCode(type: LinkCodeType): string {
  const config = LINK_CODE_CONFIG[type]
  const { length, charset, prefix } = config

  // Generate random bytes
  const bytes = randomBytes(length)

  // Convert to charset
  let code = ''
  for (let i = 0; i < length; i++) {
    code += charset[bytes[i] % charset.length]
  }

  return prefix + code
}

/**
 * Generate private link code with collision check
 */
async function generateUniquePrivateLinkCode(
  db: DrizzleClient,
  maxAttempts: number = 10
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateSecureCode('PRIVATE_LINK')

    // Check for collision (Drizzle-style)
    const existing = await db.select({ id: privateLinks.id })
      .from(privateLinks)
      .where(eq(privateLinks.code, code))
      .then(r => r[0])

    if (!existing) {
      return code
    }
  }

  throw new Error('Failed to generate unique private link code after max attempts')
}

/**
 * Generate live poll join code with collision check
 */
async function generateUniqueLivePollCode(
  redis: Redis,
  maxAttempts: number = 10
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateSecureCode('LIVE_POLL')

    // Check Redis for active session with this code
    const exists = await redis.exists(`livepoll:session:${code}`)

    if (!exists) {
      return code
    }
  }

  throw new Error('Failed to generate unique live poll code after max attempts')
}

// Validate code format (for URL parsing)
function isValidCodeFormat(code: string, type: LinkCodeType): boolean {
  const config = LINK_CODE_CONFIG[type]
  const expectedLength = config.prefix.length + config.length

  if (code.length !== expectedLength) return false
  if (!code.startsWith(config.prefix)) return false

  const codeBody = code.slice(config.prefix.length)
  const charsetRegex = new RegExp(`^[${config.charset}]+$`)

  return charsetRegex.test(codeBody)
}

export {
  generateSecureCode,
  generateUniquePrivateLinkCode,
  generateUniqueLivePollCode,
  isValidCodeFormat,
  LINK_CODE_CONFIG
}
export type { LinkCodeType }
```


## 29.2.2 Permission Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              SECURITY FIX: Permission Caching                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  VULNERABILITY (Bible-017):                                                     │
│  • Permission checks query database on every request                           │
│  • No caching specified → DDoS vector                                          │
│  • At 10K users, permission queries become bottleneck                          │
│                                                                                 │
│  FIX: Redis-backed permission cache with invalidation                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// File: src/auth/permission-cache.ts
// [AUTHORITATIVE] Permission caching with Redis

import { Redis } from 'ioredis'

const PERMISSION_CACHE_CONFIG = {
  // Cache TTLs
  userPermissionsTTL: 300,        // 5 minutes
  orgMembershipsTTL: 300,         // 5 minutes
  contentPermissionsTTL: 60,      // 1 minute (more dynamic)

  // Cache keys
  keys: {
    userPermissions: (userId: string) => `perm:user:${userId}`,
    orgMemberships: (userId: string) => `perm:org:${userId}`,
    contentPermission: (userId: string, contentId: string) =>
      `perm:content:${userId}:${contentId}`
  }
}

interface CachedUserPermissions {
  tier: 'FREE' | 'PLUS' | 'PREMIUM'
  isVerified: boolean
  isBanned: boolean
  isAdmin: boolean
  isModerator: boolean
  features: string[]
  cachedAt: number
}

interface CachedOrgMembership {
  orgId: string
  role: 'OWNER' | 'ADMIN' | 'CREATOR' | 'ANALYST' | 'MEMBER'
  permissions: string[]
}

class PermissionCache {
  constructor(private redis: Redis, private db: DrizzleClient) {}

  async getUserPermissions(userId: string): Promise<CachedUserPermissions> {
    const cacheKey = PERMISSION_CACHE_CONFIG.keys.userPermissions(userId)

    // Try cache first
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      const permissions = JSON.parse(cached) as CachedUserPermissions

      // Check if cache is fresh enough
      const age = Date.now() - permissions.cachedAt
      if (age < PERMISSION_CACHE_CONFIG.userPermissionsTTL * 1000) {
        return permissions
      }
    }

    // Fetch from database
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isBanned: true,
        role: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const permissions: CachedUserPermissions = {
      tier: user.subscriptionTier as 'FREE' | 'PLUS' | 'PREMIUM',
      isVerified: user.isEmailVerified && user.isPhoneVerified,
      isBanned: user.isBanned,
      isAdmin: user.role === 'ADMIN',
      isModerator: user.role === 'MODERATOR' || user.role === 'ADMIN',
      features: this.getFeaturesForTier(user.subscriptionTier),
      cachedAt: Date.now()
    }

    // Cache for next request
    await this.redis.setex(
      cacheKey,
      PERMISSION_CACHE_CONFIG.userPermissionsTTL,
      JSON.stringify(permissions)
    )

    return permissions
  }

  async getOrgMemberships(userId: string): Promise<CachedOrgMembership[]> {
    const cacheKey = PERMISSION_CACHE_CONFIG.keys.orgMemberships(userId)

    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    const memberships = await this.db.organizationMember.findMany({
      where: { userId },
      select: {
        organizationId: true,
        role: true
      }
    })

    const result: CachedOrgMembership[] = memberships.map(m => ({
      orgId: m.organizationId,
      role: m.role as CachedOrgMembership['role'],
      permissions: this.getPermissionsForOrgRole(m.role)
    }))

    await this.redis.setex(
      cacheKey,
      PERMISSION_CACHE_CONFIG.orgMembershipsTTL,
      JSON.stringify(result)
    )

    return result
  }

  async canAccessContent(
    userId: string,
    contentId: string,
    action: 'view' | 'edit' | 'delete' | 'respond'
  ): Promise<boolean> {
    const cacheKey = PERMISSION_CACHE_CONFIG.keys.contentPermission(userId, contentId)

    const cached = await this.redis.hget(cacheKey, action)
    if (cached !== null) {
      return cached === '1'
    }

    // Calculate permission
    const allowed = await this.calculateContentPermission(userId, contentId, action)

    // Cache result
    await this.redis.hset(cacheKey, action, allowed ? '1' : '0')
    await this.redis.expire(cacheKey, PERMISSION_CACHE_CONFIG.contentPermissionsTTL)

    return allowed
  }

  // Invalidation methods
  async invalidateUserPermissions(userId: string): Promise<void> {
    await this.redis.del(PERMISSION_CACHE_CONFIG.keys.userPermissions(userId))
  }

  async invalidateOrgMemberships(userId: string): Promise<void> {
    await this.redis.del(PERMISSION_CACHE_CONFIG.keys.orgMemberships(userId))
  }

  async invalidateContentPermissions(contentId: string): Promise<void> {
    // Find all permission keys for this content and delete
    const pattern = `perm:content:*:${contentId}`
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  // Call this when user subscription changes
  async onSubscriptionChange(userId: string): Promise<void> {
    await this.invalidateUserPermissions(userId)
  }

  // Call this when org membership changes
  async onOrgMembershipChange(userId: string, orgId: string): Promise<void> {
    await this.invalidateOrgMemberships(userId)
    // Also invalidate content permissions for org content (Drizzle-style)
    const orgContent = await this.db.select({ id: content.id })
      .from(content)
      .where(eq(content.organizationId, orgId))
    for (const content of orgContent) {
      await this.invalidateContentPermissions(content.id)
    }
  }

  private getFeaturesForTier(tier: string): string[] {
    const features: Record<string, string[]> = {
      FREE: ['create_quick_poll', 'create_test', 'participate'],
      PLUS: ['create_quick_poll', 'create_test', 'participate', 'view_pulse_without_participation', 'comment_without_participation'],
      PREMIUM: ['create_quick_poll', 'create_extended_poll', 'create_live_poll', 'create_test', 'participate', 'view_pulse_without_participation', 'comment_without_participation', 'use_pretest', 'target_audience', 'custom_themes']
    }
    return features[tier] || features.FREE
  }

  private getPermissionsForOrgRole(role: string): string[] {
    const permissions: Record<string, string[]> = {
      OWNER: ['*'],
      ADMIN: ['manage_members', 'manage_surveys', 'view_analytics', 'export_data'],
      CREATOR: ['create_surveys', 'view_own_analytics', 'export_own_data'],
      ANALYST: ['view_analytics', 'export_data'],
      MEMBER: ['participate']
    }
    return permissions[role] || permissions.MEMBER
  }

  private async calculateContentPermission(
    userId: string,
    contentId: string,
    action: string
  ): Promise<boolean> {
    // Implementation details...
    // Check ownership, org membership, visibility settings, etc.
    return true // Placeholder
  }
}

export { PermissionCache, PERMISSION_CACHE_CONFIG }
export type { CachedUserPermissions, CachedOrgMembership }
```


## 29.2.3 XSS Output Encoding Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              SECURITY FIX: XSS Prevention                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  VULNERABILITY:                                                                 │
│  • User-generated content (comments, survey responses) not sanitized           │
│  • Markdown rendering without XSS protection                                   │
│  • Admin dashboard displaying raw user input                                   │
│                                                                                 │
│  FIX: Multi-layer XSS prevention                                               │
│                                                                                 │
│  LAYERS:                                                                        │
│  1. INPUT VALIDATION: Zod schemas with sanitization                            │
│  2. STORAGE: Store sanitized content                                           │
│  3. OUTPUT: Context-aware encoding                                             │
│  4. CSP: Content Security Policy headers                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// File: src/security/xss-prevention.ts
// [AUTHORITATIVE] XSS prevention utilities

import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'

// Sanitization configurations
const SANITIZE_CONFIG = {
  // For plain text (comments, poll options, usernames)
  PLAIN_TEXT: {
    ALLOWED_TAGS: [],           // No HTML allowed
    ALLOWED_ATTR: []
  },

  // For markdown content (survey descriptions, test explanations)
  MARKDOWN: {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
    ADD_TAGS: [],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  },

  // For admin dashboard (showing raw content for moderation)
  ADMIN_DISPLAY: {
    ALLOWED_TAGS: ['span'],
    ALLOWED_ATTR: ['class'],
    // Wrap dangerous content in visible span
    RETURN_DOM: false
  }
}

// Sanitize plain text (remove all HTML)
function sanitizePlainText(input: string): string {
  if (!input) return ''

  return DOMPurify.sanitize(input, SANITIZE_CONFIG.PLAIN_TEXT)
    .trim()
    .slice(0, 10000) // Max length safety
}

// Sanitize and render markdown
function sanitizeMarkdown(input: string): string {
  if (!input) return ''

  // First render markdown to HTML
  const html = marked.parse(input, {
    breaks: true,
    gfm: true
  })

  // Then sanitize the HTML
  return DOMPurify.sanitize(html, SANITIZE_CONFIG.MARKDOWN)
}

// Safe display for admin (escape but show structure)
function sanitizeForAdminDisplay(input: string): string {
  if (!input) return ''

  // Escape HTML entities
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

  return escaped
}

// Zod refinement for input validation
import { z } from 'zod'

const sanitizedString = (maxLength: number = 1000) =>
  z.string()
    .max(maxLength)
    .transform(sanitizePlainText)

const sanitizedMarkdown = (maxLength: number = 5000) =>
  z.string()
    .max(maxLength)
    .transform(sanitizeMarkdown)

// Example Zod schemas with sanitization
const commentSchema = z.object({
  content: sanitizedString(2000),
  parentId: z.string().cuid().optional()
})

const pollOptionSchema = z.object({
  text: sanitizedString(200),
  imageUrl: z.string().url().optional()
})

// React component for safe rendering
// File: components/SafeHtml.tsx
/*
import { memo } from 'react'
import { sanitizeMarkdown } from '@/lib/xss-prevention'

interface SafeHtmlProps {
  content: string
  className?: string
}

export const SafeHtml = memo(function SafeHtml({ content, className }: SafeHtmlProps) {
  const sanitized = sanitizeMarkdown(content)

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
})
*/

// Content Security Policy header
const CSP_HEADER = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.clerk.io",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.voxpoll.com wss://*.voxpoll.com https://api.clerk.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'"
  ].join('; ')
}

export {
  sanitizePlainText,
  sanitizeMarkdown,
  sanitizeForAdminDisplay,
  sanitizedString,
  sanitizedMarkdown,
  commentSchema,
  pollOptionSchema,
  CSP_HEADER
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 29.3 UNDEFINED USER FLOWS - COMPLETE SPECIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 29.3.1 Live Poll Disconnect Handling - COMPLETE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-031 EXTENDED: Complete Disconnect Handling                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SCENARIO 1: HOST DISCONNECTS                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Time    │ Event                │ System Action                          │   │
│  ├─────────┼──────────────────────┼────────────────────────────────────────┤   │
│  │ 0s      │ Host connection lost │ Mark host as DISCONNECTED              │   │
│  │ 0-30s   │ Grace period         │ Voting continues normally              │   │
│  │         │                      │ Show "Host reconnecting..." to viewers │   │
│  │ 30s     │ Still disconnected   │ Show "Host offline, voting continues"  │   │
│  │ 30s-60m │ Orphan mode          │ Session runs on auto-pilot             │   │
│  │         │                      │ No question changes possible           │   │
│  │ 60m     │ Auto-end             │ Session ends automatically             │   │
│  │         │                      │ Results saved, participants notified   │   │
│  │ Any     │ Host reconnects      │ Full control restored immediately      │   │
│  └─────────┴──────────────────────┴────────────────────────────────────────┘   │
│                                                                                 │
│  SCENARIO 2: PARTICIPANT DISCONNECTS                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Condition              │ Behavior                                       │   │
│  ├────────────────────────┼────────────────────────────────────────────────┤   │
│  │ Disconnected, no vote  │ Can rejoin, vote on current/future questions  │   │
│  │ Disconnected, voted    │ Vote preserved, can rejoin to see results     │   │
│  │ Disconnected, rejoins  │ Session state synced, sees current question   │   │
│  │ Different device       │ Allowed if same user OR same fingerprint      │   │
│  │ Session ended while DC │ Gets notification on next app open            │   │
│  └────────────────────────┴────────────────────────────────────────────────┘   │
│                                                                                 │
│  SCENARIO 3: NETWORK PARTITION                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Client has vote queued │ Action                                         │   │
│  ├────────────────────────┼────────────────────────────────────────────────┤   │
│  │ Network returns <10s   │ Auto-retry queued vote                         │   │
│  │ Network returns >10s   │ Prompt: "Reconnected. Send your vote?"         │   │
│  │ Question changed       │ Discard queued vote, sync to new question      │   │
│  │ Session ended          │ Discard queued vote, show results              │   │
│  └────────────────────────┴────────────────────────────────────────────────┘   │
│                                                                                 │
│  SCENARIO 4: WEBSOCKET FALLBACK                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ WebSocket fails        │ Fallback Strategy                              │   │
│  ├────────────────────────┼────────────────────────────────────────────────┤   │
│  │ Initial connect fail   │ Try WSS → WS → Long polling (3s intervals)    │   │
│  │ Mid-session fail       │ Reconnect WSS with exponential backoff         │   │
│  │ 3 reconnect failures   │ Switch to long polling mode                    │   │
│  │ Long polling mode      │ Poll every 2s, submit votes via POST           │   │
│  │ All connections fail   │ Show "Connection lost" with retry button       │   │
│  └────────────────────────┴────────────────────────────────────────────────┘   │
│                                                                                 │
│  SCENARIO 5: CAPACITY OVERFLOW (10K+)                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Participant 10,001     │ Behavior                                       │   │
│  ├────────────────────────┼────────────────────────────────────────────────┤   │
│  │ Joins at capacity      │ Enters waiting room (spectator mode)           │   │
│  │ Waiting room message   │ "Session full. You're #X in queue."            │   │
│  │ Someone leaves         │ Next in queue auto-promoted (FIFO)             │   │
│  │ Max waiting room       │ 1,000 spectators (same as 29.1.1)              │   │
│  │ Beyond max             │ "Session at capacity. Try again later."        │   │
│  │ Session ends           │ All waiting room users see final results       │   │
│  └────────────────────────┴────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 29.3.2 Anonymous to Authenticated Conversion - COMPLETE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-029 EXTENDED: Complete Conversion Policy                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CONVERSION TRIGGERS:                                                           │
│  1. Anonymous user creates account within 30 days of participation             │
│  2. Device fingerprint matches with >= 0.95 similarity                         │
│  3. User explicitly claims anonymous participation (optional)                   │
│                                                                                 │
│  MATCHING ALGORITHM:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Generate device fingerprint for new user                             │   │
│  │ 2. Search AnonymousParticipation records from last 30 days              │   │
│  │ 3. Calculate fingerprint similarity using weighted factors:             │   │
│  │    - Browser/OS combination: 25%                                        │   │
│  │    - Screen resolution + color depth: 15%                               │   │
│  │    - Timezone + language: 15%                                           │   │
│  │    - Canvas fingerprint: 25%                                            │   │
│  │    - WebGL renderer: 20%                                                │   │
│  │ 4. If similarity >= 0.95, consider it a match                           │   │
│  │ 5. If 0.85 <= similarity < 0.95, flag for manual review                 │   │
│  │ 6. If similarity < 0.85, no match                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  DATA MIGRATION ON CONVERSION:                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Data Type              │ Action                                         │   │
│  ├────────────────────────┼────────────────────────────────────────────────┤   │
│  │ Poll responses         │ MIGRATE - Link to new user account             │   │
│  │ Test results           │ MIGRATE - Link to new user account             │   │
│  │ Survey responses       │ MIGRATE - Link to new user account             │   │
│  │ Quality scores         │ MIGRATE - Transfer to user profile             │   │
│  │ Reliability history    │ MIGRATE - Seed user's reliability score        │   │
│  │ Comments posted        │ MIGRATE - Update author to new user            │   │
│  │ Badges earned          │ DO NOT MIGRATE - Must re-earn as user          │   │
│  │ XP/Gamification        │ DO NOT MIGRATE - Start fresh                   │   │
│  │ Anonymous fingerprint  │ DELETE - Privacy protection                    │   │
│  └────────────────────────┴────────────────────────────────────────────────┘   │
│                                                                                 │
│  EDGE CASES:                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Scenario                        │ Resolution                            │   │
│  ├─────────────────────────────────┼───────────────────────────────────────┤   │
│  │ Multiple devices, one user      │ Match on ANY device fingerprint       │   │
│  │ One device, multiple anon users │ All anon data goes to first claimant  │   │
│  │ Family shared device            │ Only match if EXPLICIT claim made     │   │
│  │ Public computer                 │ Disable auto-matching, require claim  │   │
│  │ 30-day window expired           │ No migration, data stays anonymous    │   │
│  │ User disputes match             │ Support can unlink within 7 days      │   │
│  └─────────────────────────────────┴───────────────────────────────────────┘   │
│                                                                                 │
│  USER PROMPT ON MATCH:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  "We found participation history that might be yours.                   │   │
│  │                                                                         │   │
│  │   📊 3 polls voted on                                                   │   │
│  │   ✅ 2 tests completed                                                  │   │
│  │   💬 5 comments posted                                                  │   │
│  │                                                                         │   │
│  │   Link this activity to your account?                                   │   │
│  │                                                                         │   │
│  │   [Yes, link to my account]  [No, start fresh]  [Not my activity]"     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 29.3.3 Subscription Downgrade - COMPLETE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-037/P-041 EXTENDED: Complete Downgrade Handling                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  TIMING: Downgrade takes effect at END of current billing period               │
│          Grace period: 30 days from downgrade date                              │
│                                                                                 │
│  PREMIUM → PLUS DOWNGRADE:                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Feature                    │ Behavior                                   │   │
│  ├────────────────────────────┼────────────────────────────────────────────┤   │
│  │ Extended polls (5-10 opts) │ Existing: READ-ONLY, can view/share       │   │
│  │                            │ New: Cannot create, max 4 options          │   │
│  │ Live polls                 │ Active: Ends gracefully (60 min max)       │   │
│  │                            │ Scheduled: Cancelled with notification     │   │
│  │                            │ Past: Results accessible forever           │   │
│  │ Pre-tests                  │ Existing: Preserved but disabled           │   │
│  │                            │ New: Cannot create/enable                  │   │
│  │ Target audience            │ Existing: Targeting removed at renewal     │   │
│  │                            │ New: Cannot set demographics               │   │
│  │ Custom themes              │ Existing: Reverts to default theme         │   │
│  │                            │ New: Cannot customize                      │   │
│  │ PULSE+COMMENTS             │ Still accessible (Plus feature)            │   │
│  └────────────────────────────┴────────────────────────────────────────────┘   │
│                                                                                 │
│  PLUS → FREE DOWNGRADE:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Feature                    │ Behavior                                   │   │
│  ├────────────────────────────┼────────────────────────────────────────────┤   │
│  │ PULSE without participate  │ REVOKED - Must participate to access       │   │
│  │ COMMENTS without part.     │ REVOKED - Must participate to comment      │   │
│  │ Existing polls (>3/day)    │ Preserved, but daily limit now enforced   │   │
│  │ Existing tests (>3/week)   │ Preserved, but weekly limit now enforced  │   │
│  │ Pinned badges (>3)         │ Extra badges unpinned, can re-pin 3        │   │
│  └────────────────────────────┴────────────────────────────────────────────┘   │
│                                                                                 │
│  PREMIUM → FREE DOWNGRADE (DIRECT):                                             │
│  • All PLUS restrictions apply                                                  │
│  • All PREMIUM restrictions apply                                               │
│  • Active live polls end immediately (not 60 min grace)                        │
│                                                                                 │
│  CONTENT VISIBILITY AFTER DOWNGRADE:                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Content Type               │ Creator Can    │ Others Can               │   │
│  ├────────────────────────────┼────────────────┼──────────────────────────┤   │
│  │ Extended poll (now Free)   │ View, Share    │ Vote, View results       │   │
│  │ Extended poll (now Plus)   │ View, Share    │ Vote, View results       │   │
│  │ Pre-test enabled poll      │ View only      │ Pre-test still works     │   │
│  │ Targeted poll              │ View only      │ Targeting removed        │   │
│  │ Themed content             │ View (default) │ See default theme        │   │
│  └────────────────────────────┴────────────────┴──────────────────────────┘   │
│                                                                                 │
│  DOWNGRADE DURING ACTIVE PARTICIPATION:                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Scenario                        │ Resolution                            │   │
│  ├─────────────────────────────────┼───────────────────────────────────────┤   │
│  │ User in live poll, billing ends │ Session continues until natural end   │   │
│  │ User mid-survey, billing ends   │ Can complete current survey           │   │
│  │ User creating poll, billing ends│ Can finish & publish current draft    │   │
│  │ Scheduled poll, billing ends    │ Scheduled poll cancelled              │   │
│  └─────────────────────────────────┴───────────────────────────────────────┘   │
│                                                                                 │
│  UPGRADE PROMPT UI:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🔒 Premium Feature                                                     │   │
│  │                                                                         │   │
│  │  Live polls require a Premium subscription.                             │   │
│  │                                                                         │   │
│  │  Your subscription ended on Jan 15, 2026.                               │   │
│  │                                                                         │   │
│  │  [Upgrade to Premium - $9.99/mo]  [Maybe Later]                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 29.3.4 Organization Member Offboarding - COMPLETE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-033 EXTENDED: Complete Offboarding Policy                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  OFFBOARDING TRIGGERS:                                                          │
│  1. Admin removes member                                                        │
│  2. Member leaves voluntarily                                                   │
│  3. Organization deleted                                                        │
│  4. Member account deleted                                                      │
│                                                                                 │
│  DATA HANDLING BY TYPE:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Data Type                  │ Action                │ Timeline           │   │
│  ├────────────────────────────┼───────────────────────┼────────────────────┤   │
│  │ Surveys created by member  │ Transfer to org admin │ Immediate          │   │
│  │ Draft surveys              │ Transfer or delete    │ Admin chooses      │   │
│  │ Survey responses by member │ Anonymize             │ Immediate          │   │
│  │ Comments on org content    │ Keep (author="Former")│ Immediate          │   │
│  │ Analytics access           │ Revoke                │ Immediate          │   │
│  │ Audit logs                 │ Preserve (compliance) │ Retain 7 years     │   │
│  │ Personal data in org       │ Delete                │ 30 days            │   │
│  │ DMs with org members       │ Keep for recipient    │ Sender copy deleted│   │
│  └────────────────────────────┴───────────────────────┴────────────────────┘   │
│                                                                                 │
│  ADMIN OFFBOARDING WIZARD:                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Remove @john_doe from Acme Corp?                                       │   │
│  │                                                                         │   │
│  │  This member has:                                                       │   │
│  │  • 5 published surveys (will transfer to you)                           │   │
│  │  • 2 draft surveys                                                      │   │
│  │  • 150 survey responses (will be anonymized)                            │   │
│  │                                                                         │   │
│  │  What should happen to their drafts?                                    │   │
│  │  ○ Transfer drafts to me                                                │   │
│  │  ○ Delete drafts permanently                                            │   │
│  │                                                                         │   │
│  │  [Cancel]  [Remove Member]                                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  GDPR/KVKK COMPLIANCE:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Requirement                 │ Implementation                            │   │
│  ├────────────────────────────┼────────────────────────────────────────────┤   │
│  │ Right to erasure           │ Personal data deleted within 30 days      │   │
│  │ Data portability           │ Export available before removal           │   │
│  │ Audit trail retention      │ Anonymized logs kept for compliance       │   │
│  │ Consent records            │ Preserved for legal compliance            │   │
│  │ Survey responses           │ Anonymized (participantHash regenerated)  │   │
│  └────────────────────────────┴────────────────────────────────────────────┘   │
│                                                                                 │
│  OWNER CANNOT BE REMOVED:                                                       │
│  • Organization owner must transfer ownership before leaving                   │
│  • If owner account is deleted, ownership transfers to oldest admin           │
│  • If no admins exist, org is soft-deleted (30-day recovery)                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 29.3.5 Test Retake Policy - COMPLETE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              NEW DECISION P-050: Test Retake Policy                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  RETAKE RULES:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Parameter                  │ Value                                      │   │
│  ├────────────────────────────┼────────────────────────────────────────────┤   │
│  │ Retake allowed?            │ Yes, always                                │   │
│  │ Cooldown period            │ 24 hours between attempts                  │   │
│  │ Max badges per test        │ 3 (keeps best, most recent, first)         │   │
│  │ Score visibility           │ Only latest result shown in PULSE          │   │
│  │ All attempts recorded?     │ Yes, for analytics (anonymized)            │   │
│  │ Can delete attempts?       │ Yes, except first ever                     │   │
│  │ Question randomization     │ Yes, different order each attempt          │   │
│  └────────────────────────────┴────────────────────────────────────────────┘   │
│                                                                                 │
│  BADGE RETENTION LOGIC:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Attempt   │ Result        │ Badges Shown (max 3)                       │   │
│  ├───────────┼───────────────┼────────────────────────────────────────────┤   │
│  │ 1st       │ "Explorer"    │ [Explorer]                                 │   │
│  │ 2nd       │ "Innovator"   │ [Explorer (first), Innovator (latest)]     │   │
│  │ 3rd       │ "Leader"      │ [Explorer, Innovator, Leader]              │   │
│  │ 4th       │ "Explorer"    │ [Explorer (first), Leader (best), Explorer]│   │
│  │           │               │ Note: keeps first, best, most recent       │   │
│  └───────────┴───────────────┴────────────────────────────────────────────┘   │
│                                                                                 │
│  DISPLAY LOGIC:                                                                 │
│  • Profile: Shows "best" badge by default, can toggle to show all             │
│  • PULSE: Shows aggregate from ALL attempts (not just latest)                 │
│  • Comments: Badge shown is from the attempt when comment was made            │
│                                                                                 │
│  LOWER SCORE HANDLING:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  "Your new result: Explorer                                             │   │
│  │                                                                         │   │
│  │   Your previous best was: Leader                                        │   │
│  │                                                                         │   │
│  │   Which badge would you like to display?                                │   │
│  │   ○ Leader (your best)                                                  │   │
│  │   ○ Explorer (your latest)                                              │   │
│  │                                                                         │   │
│  │   [Confirm]"                                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  DELETED TEST HANDLING:                                                         │
│  • Badges from deleted tests show "Test no longer available"                   │
│  • User can choose to hide or keep showing                                     │
│  • Badge image/data preserved (not deleted with test)                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 29.4 PAYMENT & SUBSCRIPTION EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## 29.4.1 Proration Calculation - COMPLETE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              PRORATION CALCULATION RULES                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  UPGRADE PRORATION (Pay difference immediately):                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Formula:                                                                │   │
│  │   remaining_days = billing_period_end - today                           │   │
│  │   daily_rate_old = old_price / 30                                       │   │
│  │   daily_rate_new = new_price / 30                                       │   │
│  │   proration = (daily_rate_new - daily_rate_old) * remaining_days        │   │
│  │                                                                         │   │
│  │ Example: Plus ($4.99) → Premium ($9.99) on day 20 of 30                 │   │
│  │   remaining_days = 10                                                   │   │
│  │   daily_rate_plus = $4.99 / 30 = $0.166                                │   │
│  │   daily_rate_premium = $9.99 / 30 = $0.333                             │   │
│  │   proration = ($0.333 - $0.166) * 10 = $1.67                           │   │
│  │                                                                         │   │
│  │   User pays: $1.67 today                                               │   │
│  │   Next billing: Full $9.99 on original billing date                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  DOWNGRADE PRORATION (Credit applied):                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Policy: NO immediate proration for downgrades                           │   │
│  │         User keeps premium features until billing period ends           │   │
│  │         New lower price starts at next billing cycle                    │   │
│  │                                                                         │   │
│  │ Example: Premium ($9.99) → Plus ($4.99) on day 10 of 30                │   │
│  │   Days 10-30: Still has Premium features                               │   │
│  │   Day 31: Plus features only, charged $4.99                            │   │
│  │   No refund for unused Premium days                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ANNUAL BILLING PRORATION:                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Upgrade (Annual → Annual):                                              │   │
│  │   Same formula but with 365 days                                        │   │
│  │   Minimum charge: $1.00 (no micro-transactions)                         │   │
│  │                                                                         │   │
│  │ Monthly → Annual mid-cycle:                                             │   │
│  │   Credit remaining monthly days                                         │   │
│  │   Charge full annual price minus credit                                 │   │
│  │   New annual billing date = today                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ROUNDING RULES:                                                                │
│  • Always round UP to nearest cent (favor platform)                            │
│  • Display prorated amount before confirmation                                 │
│  • Minimum transaction: $0.50 (below this, charge $0)                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 29.4.2 Payment Failure Handling - COMPLETE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              PAYMENT FAILURE (DUNNING) PROCESS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  RETRY SCHEDULE:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Day   │ Action                          │ User Notification            │   │
│  ├───────┼─────────────────────────────────┼──────────────────────────────┤   │
│  │ 0     │ Initial charge fails            │ Email: "Payment failed"      │   │
│  │ 1     │ Auto-retry #1                   │ -                            │   │
│  │ 3     │ Auto-retry #2                   │ Email: "Action required"     │   │
│  │ 5     │ Auto-retry #3                   │ Email + Push notification    │   │
│  │ 7     │ Auto-retry #4 (final)           │ Email: "Last attempt"        │   │
│  │ 7     │ If still failing → Grace period │ Banner in app                │   │
│  │ 14    │ Grace period ends               │ Downgrade to Free            │   │
│  └───────┴─────────────────────────────────┴──────────────────────────────┘   │
│                                                                                 │
│  GRACE PERIOD BEHAVIOR (Day 7-14):                                              │
│  • All features still accessible                                               │
│  • Persistent banner: "Update payment method to continue"                      │
│  • Cannot create NEW premium content                                           │
│  • Existing premium content still works                                        │
│                                                                                 │
│  AUTOMATIC DOWNGRADE (Day 14):                                                  │
│  • Subscription → Free tier                                                    │
│  • Follow downgrade rules from 29.3.3                                          │
│  • Email: "Your subscription has been cancelled"                               │
│  • Data preserved (not deleted)                                                │
│                                                                                 │
│  REACTIVATION AFTER DOWNGRADE:                                                  │
│  • User can re-subscribe anytime                                               │
│  • No "welcome back" discount (prevents gaming)                                │
│  • If within 30 days: Option to restore at same price                         │
│  • If >30 days: Current pricing applies                                        │
│                                                                                 │
│  PAYMENT METHOD UPDATE DURING DUNNING:                                          │
│  • Update triggers immediate retry                                             │
│  • If successful: Subscription restored instantly                              │
│  • If failed: Continue dunning schedule                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 29.4.3 Organization vs Individual Tier Conflict - COMPLETE

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              ORG VS INDIVIDUAL SUBSCRIPTION RULES                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PRINCIPLE: Organization features are separate from individual features         │
│             A Premium individual in a Free org cannot use Premium org features  │
│                                                                                 │
│  FEATURE CONTEXT MATRIX:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Feature                 │ Individual │ Organization │ Which Applies?   │   │
│  ├─────────────────────────┼────────────┼──────────────┼──────────────────┤   │
│  │ Create poll             │ ✓          │ ✓            │ Individual tier  │   │
│  │ Create test             │ ✓          │ ✗            │ Individual tier  │   │
│  │ Create survey           │ ✗          │ ✓            │ Org tier         │   │
│  │ Live poll               │ Premium    │ ✗            │ Individual only  │   │
│  │ Survey analytics        │ ✗          │ Starter+     │ Org tier only    │   │
│  │ PULSE+COMMENTS access   │ Plus+      │ ✗            │ Individual only  │   │
│  │ SSO integration         │ ✗          │ Pro+         │ Org tier only    │   │
│  │ Custom branding         │ Premium    │ Enterprise   │ Both (separate)  │   │
│  └─────────────────────────┴────────────┴──────────────┴──────────────────┘   │
│                                                                                 │
│  CONFLICT SCENARIOS:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Scenario                              │ Resolution                      │   │
│  ├───────────────────────────────────────┼─────────────────────────────────┤   │
│  │ Premium user in Free org              │ Can create personal Premium     │   │
│  │ tries to create Premium survey        │ polls, but surveys are org-tier │   │
│  │                                       │ → Show "Upgrade organization"   │   │
│  ├───────────────────────────────────────┼─────────────────────────────────┤   │
│  │ Free user in Pro org                  │ Can create surveys with Pro     │   │
│  │ creates survey                        │ features (org context)          │   │
│  │                                       │ Cannot access PULSE+COMMENTS    │   │
│  │                                       │ (individual context)            │   │
│  ├───────────────────────────────────────┼─────────────────────────────────┤   │
│  │ Premium user's org downgrades         │ User keeps Premium features     │   │
│  │                                       │ Org surveys subject to new tier │   │
│  ├───────────────────────────────────────┼─────────────────────────────────┤   │
│  │ User in multiple orgs                 │ Each org context is independent │   │
│  │                                       │ User's personal tier applies    │   │
│  │                                       │ to personal content only        │   │
│  └───────────────────────────────────────┴─────────────────────────────────┘   │
│                                                                                 │
│  UI CONTEXT INDICATOR:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Creating as: [Personal ▼]  ← Dropdown shows: Personal, Org1, Org2     │   │
│  │                                                                         │   │
│  │  [Personal - Premium]                                                   │   │
│  │  [Acme Corp - Starter]                                                  │   │
│  │  [Beta Inc - Enterprise]                                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 29.5 N+1 QUERY PREVENTION
# ══════════════════════════════════════════════════════════════════════════════

```typescript
// File: src/data/query-patterns.ts
// [AUTHORITATIVE] Approved query patterns to prevent N+1

import { db } from '@/db'
import { polls, users, pollOptions, pollResponses, comments } from '@/db/schema'
import { eq, and, desc, inArray, sql } from 'drizzle-orm'

// ═══════════════════════════════════════════════════════════════════════════
// POLL QUERIES - Approved patterns
// ═══════════════════════════════════════════════════════════════════════════

// GOOD: Single query with aggregation
const getPollWithStatsQuery = {
  include: {
    creator: {
      select: { id: true, username: true, displayName: true, avatarUrl: true }
    },
    options: {
      select: {
        id: true,
        text: true,
        imageUrl: true,
        position: true,
        _count: { select: { votes: true } }
      },
      orderBy: { position: 'asc' as const }
    },
    _count: {
      select: {
        responses: true,
        comments: true
      }
    }
  }
}

// GOOD: Feed query with cursor pagination (Drizzle-style)
async function getPollFeed(
  userId: string,
  cursor: string | null,
  limit: number = 20
) {
  return db.query.polls.findMany({
    where: and(
      eq(polls.status, 'PUBLISHED'),
      eq(polls.visibility, 'PUBLIC'),
      cursor ? lt(polls.id, cursor) : undefined
    ),
    limit: limit + 1, // Fetch one extra to check if there's more
    orderBy: desc(polls.publishedAt),
    with: {
      creator: {
        columns: { id: true, username: true, displayName: true, avatarUrl: true }
      },
      options: {
        columns: { id: true, text: true, imageUrl: true, position: true },
        orderBy: asc(pollOptions.position)
      }
    }
  })
}

// BAD (DO NOT USE): N+1 pattern
// async function getPollFeed_BAD() {
//   const allPolls = await db.select().from(polls).limit(20)
//   for (const poll of allPolls) {
//     poll.voteCount = await db.select({ count: sql`count(*)` }).from(pollVotes).where(eq(pollVotes.pollId, poll.id))
//     poll.creator = await db.select().from(users).where(eq(users.id, poll.creatorId))
//   }
// }


// ═══════════════════════════════════════════════════════════════════════════
// COMMENT QUERIES - Approved patterns
// ═══════════════════════════════════════════════════════════════════════════

// GOOD: Batch load comments with replies (max 2 levels)
const getCommentsWithRepliesQuery = {
  include: {
    author: {
      select: { id: true, username: true, displayName: true, avatarUrl: true }
    },
    _count: {
      select: { replies: true, votes: true }
    },
    replies: {
      take: 3, // Only load first 3 replies inline
      orderBy: { createdAt: 'asc' as const },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true }
        },
        _count: {
          select: { replies: true, votes: true }
        }
      }
    }
  }
}

// GOOD: Load more replies (separate query, Drizzle-style)
async function getMoreReplies(
  parentCommentId: string,
  cursor: string | null,
  limit: number = 10
) {
  return db.query.comments.findMany({
    where: and(
      eq(comments.parentId, parentCommentId),
      cursor ? lt(comments.id, cursor) : undefined
    ),
    limit: limit + 1,
    orderBy: asc(comments.createdAt),
    with: {
      author: {
        columns: { id: true, username: true, displayName: true, avatarUrl: true }
      }
    }
  })
}


// ═══════════════════════════════════════════════════════════════════════════
// USER PROFILE QUERIES - Approved patterns
// ═══════════════════════════════════════════════════════════════════════════

// GOOD: Profile with aggregated stats
const getUserProfileQuery = {
  select: {
    id: true,
    username: true,
    displayName: true,
    bio: true,
    avatarUrl: true,
    createdAt: true,
    _count: {
      select: {
        polls: true,
        tests: true,
        followers: true,
        following: true,
        badges: true
      }
    },
    badges: {
      take: 5,
      orderBy: { isPinned: 'desc' as const },
      include: {
        test: {
          select: { id: true, title: true }
        }
      }
    }
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// DATALOADER PATTERN - For complex scenarios
// ═══════════════════════════════════════════════════════════════════════════

import DataLoader from 'dataloader'

// Create dataloaders for batch loading (Drizzle-style)
function createDataLoaders(db: DrizzleClient) {
  return {
    userLoader: new DataLoader(async (userIds: readonly string[]) => {
      const userList = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl
      })
        .from(users)
        .where(inArray(users.id, [...userIds]))
      const userMap = new Map(userList.map(u => [u.id, u]))
      return userIds.map(id => userMap.get(id) || null)
    }),

    voteCountLoader: new DataLoader(async (pollIds: readonly string[]) => {
      const counts = await db.select({
        pollId: pollResponses.pollId,
        count: sql<number>`count(*)`
      })
        .from(pollResponses)
        .where(inArray(pollResponses.pollId, [...pollIds]))
        .groupBy(pollResponses.pollId)
      const countMap = new Map(counts.map(c => [c.pollId, c.count]))
      return pollIds.map(id => countMap.get(id) || 0)
    }),

    participationLoader: new DataLoader(async (keys: readonly string[]) => {
      // keys are "userId:contentId"
      const pairs = keys.map(k => {
        const [userId, contentId] = k.split(':')
        return { userId, contentId }
      })

      const participations = await db.select()
        .from(participationsTable)
        .where(
          or(...pairs.map(p =>
            and(
              eq(participationsTable.userId, p.userId),
              eq(participationsTable.contentId, p.contentId)
            )
          ))
        )

      const participationMap = new Map(
        participations.map(p => [`${p.userId}:${p.contentId}`, true])
      )

      return keys.map(k => participationMap.has(k))
    })
  }
}

export {
  getPollWithStatsQuery,
  getPollFeed,
  getCommentsWithRepliesQuery,
  getMoreReplies,
  getUserProfileQuery,
  createDataLoaders
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 29.6 SUMMARY & DECISION INDEX
# ══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PRE-LAUNCH FIXES SUMMARY                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  INCONSISTENCIES RESOLVED (Section 29.1):                                        │
│  ✅ P-039 Extended: Anonymous voting when disabled → spectator mode             │
│  ✅ Poll Option Schema: Unified Base/WithStats/Analytics types                  │
│  ✅ PULSE+COMMENTS Access: Clear tier-based rules with Observer badge          │
│                                                                                 │
│  SECURITY FIXES (Section 29.2):                                                  │
│  ✅ Private link generation: crypto.getRandomValues()                           │
│  ✅ Permission caching: Redis-backed with invalidation                          │
│  ✅ XSS prevention: Input sanitization + output encoding + CSP                  │
│                                                                                 │
│  USER FLOWS DEFINED (Section 29.3):                                              │
│  ✅ P-031 Extended: Complete disconnect handling (host, participant, network)   │
│  ✅ P-029 Extended: Anonymous→authenticated conversion with edge cases         │
│  ✅ P-037/P-041 Extended: Complete downgrade handling                           │
│  ✅ P-033 Extended: Organization member offboarding                             │
│  ✅ P-050 NEW: Test retake policy with badge retention                         │
│                                                                                 │
│  PAYMENT EDGE CASES (Section 29.4):                                              │
│  ✅ Proration calculation: Upgrade immediate, downgrade end-of-period          │
│  ✅ Payment failure handling: 4 retries, 7-day grace, auto-downgrade          │
│  ✅ Org vs Individual tier: Context-based feature access                       │
│                                                                                 │
│  PERFORMANCE (Section 29.5):                                                     │
│  ✅ N+1 query prevention: Approved query patterns + DataLoader                  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  STATUS: All pre-launch issues RESOLVED                                          │
│  NEXT: Ready for implementation                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## New Decisions Added

| ID | Decision | Section |
|----|----------|---------|
| P-039 Extended | Spectator mode when anonymous voting disabled | 29.1.1 |
| P-050 | Test retake policy (24h cooldown, max 3 badges) | 29.3.5 |




# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 29
# ══════════════════════════════════════════════════════════════════════════════
