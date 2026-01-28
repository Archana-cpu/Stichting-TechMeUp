# ═══════════════════════════════════════════════════════════════════════════════
# FEATURES - Social Features (Follow, Friends, DM, Profile Visits)
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-005.md (section 5.9)
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# SOCIAL FEATURES OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

[DECISION P-022 UPDATED] VoxPoll includes comprehensive social features to enable
user interaction beyond content-based discussions. This includes following users,
direct messaging, friend system, and profile visits.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        VOXPOLL SOCIAL FEATURES                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         FOLLOW SYSTEM                                    │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  • One-way following (like Twitter/Instagram)                           │   │
│  │  • See followed users' public content in Home feed                      │   │
│  │  • Get notified when followed users create new content                  │   │
│  │  • Profile shows followers/following counts                             │   │
│  │  • No approval required for public profiles                             │   │
│  │  • Private profiles require follow request approval                     │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         FRIENDS SYSTEM                                   │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  MUTUAL FOLLOW = FRIENDS                                                │   │
│  │  • When two users follow each other, they become "friends"              │   │
│  │  • Friends badge appears on profile                                     │   │
│  │  • Friends can see each other's friend-only content                     │   │
│  │  • Friends have priority in DM delivery                                 │   │
│  │  • Friends appear in separate "Friends" list in profile                 │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     DIRECT MESSAGING (DM)                                │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  • Send private messages to any user (with limits)                      │   │
│  │  • Text messages only (no media in DMs)                                 │   │
│  │  • Read receipts optional (user preference)                             │   │
│  │  • Block users to prevent messages                                      │   │
│  │  • Report inappropriate messages                                        │   │
│  │  • Message retention: 1 year (auto-delete older)                        │   │
│  │                                                                         │   │
│  │  DM LIMITS BY TIER:                                                     │   │
│  │  ─────────────────                                                      │   │
│  │  • Free: 5 DMs/day to non-friends, unlimited to friends                 │   │
│  │  • Plus: 25 DMs/day to non-friends, unlimited to friends                │   │
│  │  • Premium: Unlimited DMs                                               │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       PROFILE VISITS                                     │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  • Track who visited your profile (Plus/Premium only)                   │   │
│  │  • See list of recent profile visitors                                  │   │
│  │  • Anonymous visit option (Premium only)                                │   │
│  │  • Profile visit counts shown on stats                                  │   │
│  │  • Weekly profile insights email (optional)                             │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# FOLLOW SYSTEM DATA MODEL
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
import { z } from "zod"

const followSchema = z.object({
  id: z.string().cuid(),
  followerId: z.string().cuid(),       // User who follows
  followingId: z.string().cuid(),      // User being followed
  status: z.enum(["ACTIVE", "PENDING", "BLOCKED"]),
  createdAt: z.date(),

  // For private profiles - follow request
  requestedAt: z.date().nullable(),
  approvedAt: z.date().nullable()
})

type Follow = z.infer<typeof followSchema>

// Check if mutual follow (friends)
async function areFriends(userA: string, userB: string): Promise<boolean> {
  const follows = await db.follow.findMany({
    where: {
      OR: [
        { followerId: userA, followingId: userB, status: "ACTIVE" },
        { followerId: userB, followingId: userA, status: "ACTIVE" }
      ]
    }
  })
  return follows.length === 2
}

// Get relationship status between two users
async function getRelationship(
  viewerId: string,
  profileId: string
): Promise<{
  isFollowing: boolean
  isFollowedBy: boolean
  isFriend: boolean
  isBlocked: boolean
}> {
  const [viewerToProfile, profileToViewer] = await Promise.all([
    db.follow.findFirst({
      where: { followerId: viewerId, followingId: profileId }
    }),
    db.follow.findFirst({
      where: { followerId: profileId, followingId: viewerId }
    })
  ])

  return {
    isFollowing: viewerToProfile?.status === "ACTIVE",
    isFollowedBy: profileToViewer?.status === "ACTIVE",
    isFriend: viewerToProfile?.status === "ACTIVE" && profileToViewer?.status === "ACTIVE",
    isBlocked: viewerToProfile?.status === "BLOCKED" || profileToViewer?.status === "BLOCKED"
  }
}

export { followSchema, areFriends, getRelationship }
export type { Follow }
```



# ═══════════════════════════════════════════════════════════════════════════════
# DIRECT MESSAGING SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
import { z } from "zod"

const directMessageSchema = z.object({
  id: z.string().cuid(),
  conversationId: z.string().cuid(),
  senderId: z.string().cuid(),
  content: z.string().min(1).max(2000),

  readAt: z.date().nullable(),
  deletedBySender: z.boolean().default(false),
  deletedByRecipient: z.boolean().default(false),

  createdAt: z.date()
})

const conversationSchema = z.object({
  id: z.string().cuid(),
  participantIds: z.array(z.string().cuid()).length(2),

  lastMessageAt: z.date(),
  lastMessagePreview: z.string().max(100).nullable(),

  // Per-participant settings
  mutedByParticipant: z.record(z.string(), z.boolean()).default({}),
  archivedByParticipant: z.record(z.string(), z.boolean()).default({}),

  createdAt: z.date()
})

type DirectMessage = z.infer<typeof directMessageSchema>
type Conversation = z.infer<typeof conversationSchema>

// DM rate limits by subscription tier
const DM_LIMITS = {
  FREE: {
    nonFriendsPerDay: 5,
    friendsPerDay: Infinity,
    maxMessageLength: 500
  },
  PLUS: {
    nonFriendsPerDay: 25,
    friendsPerDay: Infinity,
    maxMessageLength: 1000
  },
  PREMIUM: {
    nonFriendsPerDay: Infinity,
    friendsPerDay: Infinity,
    maxMessageLength: 2000
  }
} as const

// Check if user can send DM
async function canSendDM(
  senderId: string,
  recipientId: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Check if blocked
  const block = await db.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: recipientId, blockedId: senderId },
        { blockerId: senderId, blockedId: recipientId }
      ]
    }
  })

  if (block) {
    return { allowed: false, reason: "USER_BLOCKED" }
  }

  // Check DM settings
  const recipient = await db.user.findUnique({
    where: { id: recipientId },
    select: {
      dmSettings: true,
      subscriptionTier: true
    }
  })

  if (recipient?.dmSettings?.disableDMs) {
    return { allowed: false, reason: "DMS_DISABLED" }
  }

  if (recipient?.dmSettings?.friendsOnly) {
    const isFriend = await areFriends(senderId, recipientId)
    if (!isFriend) {
      return { allowed: false, reason: "FRIENDS_ONLY" }
    }
  }

  // Check rate limits for non-friends
  const isFriend = await areFriends(senderId, recipientId)
  if (!isFriend) {
    const sender = await db.user.findUnique({
      where: { id: senderId },
      select: { subscriptionTier: true }
    })

    const tier = sender?.subscriptionTier || "FREE"
    const limit = DM_LIMITS[tier as keyof typeof DM_LIMITS].nonFriendsPerDay

    if (limit !== Infinity) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const sentToday = await db.directMessage.count({
        where: {
          senderId,
          createdAt: { gte: todayStart },
          conversation: {
            participantIds: { has: recipientId }
          }
        }
      })

      if (sentToday >= limit) {
        return { allowed: false, reason: "DAILY_LIMIT_REACHED" }
      }
    }
  }

  return { allowed: true }
}

export { directMessageSchema, conversationSchema, DM_LIMITS, canSendDM }
export type { DirectMessage, Conversation }
```



# ═══════════════════════════════════════════════════════════════════════════════
# PROFILE VISITS TRACKING
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
import { z } from "zod"

const profileVisitSchema = z.object({
  id: z.string().cuid(),
  visitorId: z.string().cuid().nullable(),  // null = anonymous visitor
  profileId: z.string().cuid(),

  // Visitor details (for analytics)
  isAnonymous: z.boolean().default(false),
  source: z.enum(["SEARCH", "FEED", "COMMENT", "MENTION", "DIRECT", "EXTERNAL"]),

  visitedAt: z.date()
})

type ProfileVisit = z.infer<typeof profileVisitSchema>

// Profile visit feature availability by tier
const PROFILE_VISIT_FEATURES = {
  FREE: {
    canSeeVisitors: false,
    canVisitAnonymously: false,
    visitHistoryDays: 0
  },
  PLUS: {
    canSeeVisitors: true,
    canVisitAnonymously: false,
    visitHistoryDays: 7
  },
  PREMIUM: {
    canSeeVisitors: true,
    canVisitAnonymously: true,
    visitHistoryDays: 30
  }
} as const

// Get profile visitors (Plus/Premium only)
async function getProfileVisitors(
  profileId: string,
  viewerId: string,
  limit: number = 20
): Promise<ProfileVisit[]> {
  const viewer = await db.user.findUnique({
    where: { id: viewerId },
    select: { subscriptionTier: true }
  })

  const tier = viewer?.subscriptionTier || "FREE"
  const features = PROFILE_VISIT_FEATURES[tier as keyof typeof PROFILE_VISIT_FEATURES]

  if (!features.canSeeVisitors) {
    throw new Error("UPGRADE_REQUIRED: Profile visitors require Plus or Premium")
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - features.visitHistoryDays)

  return db.profileVisit.findMany({
    where: {
      profileId,
      visitedAt: { gte: cutoffDate },
      isAnonymous: false
    },
    orderBy: { visitedAt: "desc" },
    take: limit
  })
}

export { profileVisitSchema, PROFILE_VISIT_FEATURES, getProfileVisitors }
export type { ProfileVisit }
```



# ═══════════════════════════════════════════════════════════════════════════════
# SOCIAL PRIVACY SETTINGS
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
import { z } from "zod"

const socialPrivacySettingsSchema = z.object({
  userId: z.string().cuid(),

  // Profile visibility
  profileVisibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),

  // Follow settings
  allowFollowers: z.boolean().default(true),
  requireFollowApproval: z.boolean().default(false),
  showFollowerCount: z.boolean().default(true),
  showFollowingCount: z.boolean().default(true),

  // DM settings
  allowDMs: z.boolean().default(true),
  dmFromFriendsOnly: z.boolean().default(false),
  showReadReceipts: z.boolean().default(true),

  // Activity visibility
  showOnlineStatus: z.boolean().default(false),
  showLastActive: z.boolean().default(false),
  showActivityFeed: z.boolean().default(true),

  // Profile visits
  allowProfileVisitTracking: z.boolean().default(true),
  visitAnonymously: z.boolean().default(false),  // Premium only

  // Block list
  blockedUserIds: z.array(z.string().cuid()).default([])
})

type SocialPrivacySettings = z.infer<typeof socialPrivacySettingsSchema>

export { socialPrivacySettingsSchema }
export type { SocialPrivacySettings }
```



# ═══════════════════════════════════════════════════════════════════════════════
# USER PROFILE DISPLAY WITH SOCIAL FEATURES
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ENHANCED USER PROFILE VIEW                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────┐                                                                    │
│  │        │  @johndoe                               [BadgeCheck] Verified      │
│  │ Avatar │  John Doe                                                          │
│  │        │  "Survey enthusiast and data nerd"                                 │
│  └────────┘                                                                    │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  [Users] 234 Followers    [UserPlus] 156 Following    [Heart] 45 Friends       │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │    [Follow]     │  │   [Message]     │  │     [More]      │                │
│  │   Following ✓   │  │  Send Message   │  │       ...       │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  [BarChart3] 23 polls created    [ClipboardCheck] 156 participations          │
│  [MessageSquare] 45 discussions  [Calendar] Member since Jan 2025              │
│  [Eye] 1.2K profile visits                                                     │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  Test Badges (PROFILE BADGES):                                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐    │
│  │ INTJ-A Architect  │ True Neutral  │ Ocean Explorer                    │    │
│  │ Personality Test  │ Alignment Test│ Which Sea Quiz                    │    │
│  └───────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  Tabs: [Activity] [Polls] [Tests] [COMMENTS] [Followers] [Following]           │
│                                                                                 │
│  Recent Activity:                                                              │
│  • Participated in "Best Coffee Chains 2026" - 2 hours ago                    │
│  • Created "Tech Salary Survey" - 1 day ago                                   │
│  • Commented on "Political Compass Results" - 3 days ago                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# BLOCK AND REPORT SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
import { z } from "zod"

const userBlockSchema = z.object({
  id: z.string().cuid(),
  blockerId: z.string().cuid(),
  blockedId: z.string().cuid(),
  reason: z.string().max(500).optional(),
  createdAt: z.date()
})

const userReportSchema = z.object({
  id: z.string().cuid(),
  reporterId: z.string().cuid(),
  reportedId: z.string().cuid(),

  type: z.enum([
    "SPAM",
    "HARASSMENT",
    "INAPPROPRIATE_CONTENT",
    "IMPERSONATION",
    "SCAM",
    "OTHER"
  ]),

  context: z.enum(["DM", "COMMENT", "PROFILE", "CONTENT"]),
  contextId: z.string().optional(),  // messageId, commentId, etc.

  description: z.string().max(1000),
  screenshotUrls: z.array(z.string().url()).max(3).default([]),

  status: z.enum(["PENDING", "REVIEWING", "RESOLVED", "DISMISSED"]).default("PENDING"),
  resolvedAt: z.date().nullable(),
  resolution: z.string().max(500).nullable(),

  createdAt: z.date()
})

type UserBlock = z.infer<typeof userBlockSchema>
type UserReport = z.infer<typeof userReportSchema>

// Block consequences
async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  await db.$transaction([
    // Create block record
    db.userBlock.create({
      data: { blockerId, blockedId }
    }),

    // Remove any existing follow relationships
    db.follow.deleteMany({
      where: {
        OR: [
          { followerId: blockerId, followingId: blockedId },
          { followerId: blockedId, followingId: blockerId }
        ]
      }
    }),

    // Archive conversations (don't delete, for support purposes)
    db.conversation.updateMany({
      where: {
        participantIds: { hasEvery: [blockerId, blockedId] }
      },
      data: {
        archivedByParticipant: {
          [blockerId]: true
        }
      }
    })
  ])
}

export { userBlockSchema, userReportSchema, blockUser }
export type { UserBlock, UserReport }
```
