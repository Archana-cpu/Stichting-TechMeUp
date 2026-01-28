# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 12                                    █
# █                         NOTIFICATION SYSTEM                                █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 12.1 NOTIFICATION SYSTEM ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 12.1.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION SYSTEM ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        EVENT SOURCES                                │   │
│  │  • Content Events (poll/survey published, ended, results)          │   │
│  │  • Social Events (follow, comment, reply, mention, vote)           │   │
│  │  • System Events (verification, badge, announcement)               │   │
│  │  • Organization Events (access granted, invitation)                │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     EVENT PROCESSOR                                 │   │
│  │  • Event validation & deduplication                                │   │
│  │  • Recipient resolution (direct, fan-out, batch)                   │   │
│  │  • Preference filtering                                            │   │
│  │  • Rate limiting & aggregation                                     │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     DELIVERY CHANNELS                               │   │
│  ├─────────────┬─────────────┬─────────────┬─────────────┬────────────┤   │
│  │   IN-APP    │    PUSH     │   EMAIL     │     SMS     │  WEBHOOK   │   │
│  │  (Primary)  │  (Mobile)   │ (Digest)    │ (Critical)  │  (API)     │   │
│  │             │             │             │             │            │   │
│  │  • Badge    │  • FCM      │  • Daily    │  • OTP only │  • Org     │   │
│  │  • Toast    │  • APNs     │  • Weekly   │  • Verify   │    events  │   │
│  │  • Feed     │  • Web Push │  • Instant  │             │  • Custom  │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┴────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     NOTIFICATION STORAGE                            │   │
│  │  • PostgreSQL: Persistent notification records                     │   │
│  │  • Redis: Unread counts, real-time state, rate limits              │   │
│  │  • Retention: 90 days (configurable per notification type)         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 12.1.2 Notification Types

```typescript
import { z } from "zod"

const NotificationCategorySchema = z.enum([
  "CONTENT",
  "SOCIAL",
  "SYSTEM",
  "ORGANIZATION",
  "MODERATION"
])

const NotificationTypeSchema = z.enum([
  "POLL_PUBLISHED",
  "POLL_ENDING_SOON",
  "POLL_ENDED",
  "POLL_RESULTS_AVAILABLE",
  "SURVEY_INVITATION",
  "SURVEY_REMINDER",
  "SURVEY_ENDED",
  "TEST_RESULTS_AVAILABLE",

  "NEW_FOLLOWER",
  "FOLLOW_REQUEST",
  "FOLLOW_REQUEST_ACCEPTED",
  "COMMENT_ON_YOUR_CONTENT",
  "REPLY_TO_YOUR_COMMENT",
  "MENTION_IN_COMMENT",
  "COMMENT_UPVOTED",
  "CONTENT_SHARED",
  "ACCESS_REQUEST_RECEIVED",
  "ACCESS_REQUEST_APPROVED",
  "ACCESS_REQUEST_DENIED",

  "ACCOUNT_VERIFIED",
  "BADGE_EARNED",
  "LEVEL_UP",
  "STREAK_MILESTONE",
  "SYSTEM_ANNOUNCEMENT",
  "SECURITY_ALERT",
  "PASSWORD_CHANGED",
  "NEW_DEVICE_LOGIN",
  "ACCOUNT_WARNING",

  "ORG_INVITATION",
  "ORG_ROLE_CHANGED",
  "ORG_CONTENT_PUBLISHED",
  "ORG_MEMBER_JOINED",
  "ORG_SURVEY_RESPONSE_MILESTONE",

  "CONTENT_REMOVED",
  "CONTENT_RESTORED",
  "COMMENT_REMOVED",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_UNSUSPENDED",
  "REPORT_RESOLVED"
])

const NotificationPrioritySchema = z.enum([
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT"
])

type NotificationCategory = z.infer<typeof NotificationCategorySchema>
type NotificationType = z.infer<typeof NotificationTypeSchema>
type NotificationPriority = z.infer<typeof NotificationPrioritySchema>
```

## 12.1.3 Channel Priority System

### [DECISION P-036] Notification Channel Priority & Fallback

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION CHANNEL PRIORITY SYSTEM
// Defines delivery order and fallback behavior for each notification category
// ═══════════════════════════════════════════════════════════════════════════════

const NOTIFICATION_CHANNEL_PRIORITY = {
  // ─────────────────────────────────────────────────────────────────────────────
  // CATEGORY-BASED PRIORITY
  // Defines default channel priority order when user has no preferences
  // ─────────────────────────────────────────────────────────────────────────────

  categoryPriority: {
    // User engagement notifications (new follower, comment, etc.)
    SOCIAL: {
      priority: ["IN_APP", "PUSH"],
      requireAtLeast: 1,              // Must deliver to at least 1 channel
      fallbackToEmail: false
    },

    // Content notifications (poll published, results available)
    CONTENT: {
      priority: ["IN_APP", "PUSH", "EMAIL"],
      requireAtLeast: 1,
      fallbackToEmail: true           // Email as last resort
    },

    // System notifications (account, updates)
    SYSTEM: {
      priority: ["IN_APP", "EMAIL", "PUSH"],
      requireAtLeast: 1,
      fallbackToEmail: true
    },

    // Organization notifications (survey invites, admin actions)
    ORGANIZATION: {
      priority: ["EMAIL", "IN_APP", "PUSH"],
      requireAtLeast: 1,
      fallbackToEmail: true
    },

    // Moderation notifications (content removed, warnings)
    MODERATION: {
      priority: ["IN_APP", "EMAIL"],
      requireAtLeast: 2,              // Must reach user through 2 channels
      fallbackToEmail: true
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIORITY-BASED OVERRIDE
  // Critical/Urgent notifications override user preferences
  // ─────────────────────────────────────────────────────────────────────────────

  priorityOverride: {
    CRITICAL: {
      // Security alerts, account compromise, legal notices
      channels: ["SMS", "EMAIL", "PUSH", "IN_APP"],  // Use ALL available
      ignoreUserPreferences: true,
      requireDeliveryConfirmation: true,
      retryOnFailure: {
        enabled: true,
        maxRetries: 3,
        retryDelayMs: [60000, 300000, 900000]  // 1min, 5min, 15min
      }
    },

    URGENT: {
      // Time-sensitive (poll ending, survey deadline)
      channels: ["PUSH", "IN_APP", "EMAIL"],
      ignoreUserPreferences: false,
      retryOnFailure: {
        enabled: true,
        maxRetries: 2,
        retryDelayMs: [300000, 900000]  // 5min, 15min
      }
    },

    NORMAL: {
      // Standard notifications
      channels: null,  // Use category default
      ignoreUserPreferences: false,
      retryOnFailure: {
        enabled: false
      }
    },

    LOW: {
      // Informational, can be delayed
      channels: ["IN_APP"],
      ignoreUserPreferences: false,
      allowBatching: true,
      batchWindowHours: 4
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SPECIAL SCENARIOS
  // ─────────────────────────────────────────────────────────────────────────────

  specialScenarios: {
    // User is offline (no push token, not in app)
    userOffline: {
      queueForPush: true,             // Queue push for when they return
      sendEmailAfterHours: 24,        // Fallback to email after 24h
      maxQueueAge: 72                 // Discard if not delivered in 72h
    },

    // User has all channels disabled
    allChannelsDisabled: {
      forceCritical: true,            // Critical still goes through
      logForAudit: true,              // Record that we couldn't notify
      showInAppOnNextVisit: true      // Show when they open app
    },

    // Rate limit exceeded
    rateLimitExceeded: {
      prioritizeBy: "PRIORITY",       // CRITICAL first, then URGENT, etc.
      dropLowPriority: true,          // Drop LOW priority if rate limited
      aggregateNormal: true           // Combine NORMAL notifications
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DELIVERY CONFIRMATION
  // ─────────────────────────────────────────────────────────────────────────────

  deliveryConfirmation: {
    trackDelivery: {
      IN_APP: true,                   // Track when shown in UI
      PUSH: true,                     // Track FCM/APNs delivery receipt
      EMAIL: true,                    // Track open/click
      SMS: true,                      // Track delivery status
      WEBHOOK: true                   // Track HTTP response
    },

    // Mark as "delivered" when ANY channel succeeds
    successCriteria: "ANY_CHANNEL",

    // Retry on specific channels if failed
    retryChannels: ["EMAIL", "SMS"]   // Only retry these, not push
  }
}

// Get channel priority for a notification
function getChannelPriority(
  category: NotificationCategory,
  priority: NotificationPriority,
  userPreferences?: UserNotificationPreferences
): string[] {
  const config = NOTIFICATION_CHANNEL_PRIORITY

  // Critical/Urgent override
  if (priority === "CRITICAL" || priority === "URGENT") {
    const override = config.priorityOverride[priority]
    if (override.ignoreUserPreferences || !userPreferences) {
      return override.channels || config.categoryPriority[category].priority
    }
  }

  // User preferences override (if they have any)
  if (userPreferences?.channelOrder) {
    return userPreferences.channelOrder.filter(ch =>
      userPreferences.enabledChannels.includes(ch)
    )
  }

  // Default category priority
  return config.categoryPriority[category].priority
}

export { NOTIFICATION_CHANNEL_PRIORITY, getChannelPriority }
```

## 12.1.4 Type Configuration Map

```typescript
interface NotificationTypeConfig {
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  channels: {
    inApp: boolean
    push: boolean
    email: boolean
    sms: boolean
  }
  aggregatable: boolean
  aggregationWindow: number
  maxAggregationCount: number
  retentionDays: number
  actionable: boolean
  actionUrl?: string
}

const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  POLL_PUBLISHED: {
    type: "POLL_PUBLISHED",
    category: "CONTENT",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 3600000,
    maxAggregationCount: 10,
    retentionDays: 30,
    actionable: true
  },
  POLL_ENDING_SOON: {
    type: "POLL_ENDING_SOON",
    category: "CONTENT",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 7,
    actionable: true
  },
  POLL_ENDED: {
    type: "POLL_ENDED",
    category: "CONTENT",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 30,
    actionable: true
  },
  POLL_RESULTS_AVAILABLE: {
    type: "POLL_RESULTS_AVAILABLE",
    category: "CONTENT",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: true
  },
  SURVEY_INVITATION: {
    type: "SURVEY_INVITATION",
    category: "CONTENT",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: true
  },
  SURVEY_REMINDER: {
    type: "SURVEY_REMINDER",
    category: "CONTENT",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 30,
    actionable: true
  },
  SURVEY_ENDED: {
    type: "SURVEY_ENDED",
    category: "CONTENT",
    priority: "NORMAL",
    channels: { inApp: true, push: false, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 30,
    actionable: false
  },
  TEST_RESULTS_AVAILABLE: {
    type: "TEST_RESULTS_AVAILABLE",
    category: "CONTENT",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: true
  },

  NEW_FOLLOWER: {
    type: "NEW_FOLLOWER",
    category: "SOCIAL",
    priority: "LOW",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 3600000,
    maxAggregationCount: 50,
    retentionDays: 30,
    actionable: true
  },
  FOLLOW_REQUEST: {
    type: "FOLLOW_REQUEST",
    category: "SOCIAL",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 3600000,
    maxAggregationCount: 20,
    retentionDays: 30,
    actionable: true
  },
  FOLLOW_REQUEST_ACCEPTED: {
    type: "FOLLOW_REQUEST_ACCEPTED",
    category: "SOCIAL",
    priority: "LOW",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 3600000,
    maxAggregationCount: 20,
    retentionDays: 14,
    actionable: true
  },
  COMMENT_ON_YOUR_CONTENT: {
    type: "COMMENT_ON_YOUR_CONTENT",
    category: "SOCIAL",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 1800000,
    maxAggregationCount: 20,
    retentionDays: 30,
    actionable: true
  },
  REPLY_TO_YOUR_COMMENT: {
    type: "REPLY_TO_YOUR_COMMENT",
    category: "SOCIAL",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 1800000,
    maxAggregationCount: 10,
    retentionDays: 30,
    actionable: true
  },
  MENTION_IN_COMMENT: {
    type: "MENTION_IN_COMMENT",
    category: "SOCIAL",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 1800000,
    maxAggregationCount: 10,
    retentionDays: 30,
    actionable: true
  },
  COMMENT_UPVOTED: {
    type: "COMMENT_UPVOTED",
    category: "SOCIAL",
    priority: "LOW",
    channels: { inApp: true, push: false, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 3600000,
    maxAggregationCount: 100,
    retentionDays: 14,
    actionable: true
  },
  CONTENT_SHARED: {
    type: "CONTENT_SHARED",
    category: "SOCIAL",
    priority: "LOW",
    channels: { inApp: true, push: false, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 3600000,
    maxAggregationCount: 50,
    retentionDays: 14,
    actionable: true
  },
  ACCESS_REQUEST_RECEIVED: {
    type: "ACCESS_REQUEST_RECEIVED",
    category: "SOCIAL",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: true,
    aggregationWindow: 3600000,
    maxAggregationCount: 20,
    retentionDays: 30,
    actionable: true
  },
  ACCESS_REQUEST_APPROVED: {
    type: "ACCESS_REQUEST_APPROVED",
    category: "SOCIAL",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 30,
    actionable: true
  },
  ACCESS_REQUEST_DENIED: {
    type: "ACCESS_REQUEST_DENIED",
    category: "SOCIAL",
    priority: "NORMAL",
    channels: { inApp: true, push: false, email: false, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 30,
    actionable: false
  },

  ACCOUNT_VERIFIED: {
    type: "ACCOUNT_VERIFIED",
    category: "SYSTEM",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: false
  },
  BADGE_EARNED: {
    type: "BADGE_EARNED",
    category: "SYSTEM",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 86400000,
    maxAggregationCount: 5,
    retentionDays: 90,
    actionable: true
  },
  LEVEL_UP: {
    type: "LEVEL_UP",
    category: "SYSTEM",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: true
  },
  STREAK_MILESTONE: {
    type: "STREAK_MILESTONE",
    category: "SYSTEM",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 30,
    actionable: false
  },
  SYSTEM_ANNOUNCEMENT: {
    type: "SYSTEM_ANNOUNCEMENT",
    category: "SYSTEM",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: true
  },
  SECURITY_ALERT: {
    type: "SECURITY_ALERT",
    category: "SYSTEM",
    priority: "URGENT",
    channels: { inApp: true, push: true, email: true, sms: true },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 365,
    actionable: true
  },
  PASSWORD_CHANGED: {
    type: "PASSWORD_CHANGED",
    category: "SYSTEM",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 365,
    actionable: false
  },
  NEW_DEVICE_LOGIN: {
    type: "NEW_DEVICE_LOGIN",
    category: "SYSTEM",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: true
  },
  ACCOUNT_WARNING: {
    type: "ACCOUNT_WARNING",
    category: "SYSTEM",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 365,
    actionable: true
  },

  ORG_INVITATION: {
    type: "ORG_INVITATION",
    category: "ORGANIZATION",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 30,
    actionable: true
  },
  ORG_ROLE_CHANGED: {
    type: "ORG_ROLE_CHANGED",
    category: "ORGANIZATION",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: false
  },
  ORG_CONTENT_PUBLISHED: {
    type: "ORG_CONTENT_PUBLISHED",
    category: "ORGANIZATION",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 3600000,
    maxAggregationCount: 10,
    retentionDays: 30,
    actionable: true
  },
  ORG_MEMBER_JOINED: {
    type: "ORG_MEMBER_JOINED",
    category: "ORGANIZATION",
    priority: "LOW",
    channels: { inApp: true, push: false, email: false, sms: false },
    aggregatable: true,
    aggregationWindow: 86400000,
    maxAggregationCount: 50,
    retentionDays: 14,
    actionable: false
  },
  ORG_SURVEY_RESPONSE_MILESTONE: {
    type: "ORG_SURVEY_RESPONSE_MILESTONE",
    category: "ORGANIZATION",
    priority: "NORMAL",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: true
  },

  CONTENT_REMOVED: {
    type: "CONTENT_REMOVED",
    category: "MODERATION",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 365,
    actionable: true
  },
  CONTENT_RESTORED: {
    type: "CONTENT_RESTORED",
    category: "MODERATION",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 365,
    actionable: true
  },
  COMMENT_REMOVED: {
    type: "COMMENT_REMOVED",
    category: "MODERATION",
    priority: "NORMAL",
    channels: { inApp: true, push: false, email: false, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 365,
    actionable: false
  },
  ACCOUNT_SUSPENDED: {
    type: "ACCOUNT_SUSPENDED",
    category: "MODERATION",
    priority: "URGENT",
    channels: { inApp: true, push: true, email: true, sms: true },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 365,
    actionable: true
  },
  ACCOUNT_UNSUSPENDED: {
    type: "ACCOUNT_UNSUSPENDED",
    category: "MODERATION",
    priority: "HIGH",
    channels: { inApp: true, push: true, email: true, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 365,
    actionable: false
  },
  REPORT_RESOLVED: {
    type: "REPORT_RESOLVED",
    category: "MODERATION",
    priority: "NORMAL",
    channels: { inApp: true, push: false, email: false, sms: false },
    aggregatable: false,
    aggregationWindow: 0,
    maxAggregationCount: 1,
    retentionDays: 90,
    actionable: false
  }
}

export {
  NotificationCategorySchema,
  NotificationTypeSchema,
  NotificationPrioritySchema,
  NOTIFICATION_TYPE_CONFIG
}
export type {
  NotificationCategory,
  NotificationType,
  NotificationPriority,
  NotificationTypeConfig
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.2 NOTIFICATION EVENT PROCESSING
# ══════════════════════════════════════════════════════════════════════════════

## 12.2.1 Event Schema

```typescript
import { z } from "zod"

const NotificationEventSchema = z.object({
  id: z.string().cuid2(),
  type: NotificationTypeSchema,
  actorId: z.string().cuid2().nullable(),
  actorType: z.enum(["USER", "ORGANIZATION", "SYSTEM"]),
  targetId: z.string().cuid2(),
  targetType: z.enum(["USER", "ORGANIZATION"]),
  resourceId: z.string().cuid2().nullable(),
  resourceType: z.enum([
    "POLL",
    "SURVEY",
    "TEST",
    "COMMENT",
    "DISCUSSION",
    "BADGE",
    "REPORT"
  ]).nullable(),
  metadata: z.record(z.unknown()).default({}),
  deduplicationKey: z.string().optional(),
  scheduledFor: z.date().optional(),
  expiresAt: z.date().optional(),
  createdAt: z.date()
})

type NotificationEvent = z.infer<typeof NotificationEventSchema>

export { NotificationEventSchema }
export type { NotificationEvent }
```

## 12.2.2 Event Processor

```typescript
interface EventProcessorConfig {
  batchSize: number
  processingInterval: number
  maxRetries: number
  retryDelay: number
  deduplicationWindowMs: number
}

const DEFAULT_PROCESSOR_CONFIG: EventProcessorConfig = {
  batchSize: 100,
  processingInterval: 1000,
  maxRetries: 3,
  retryDelay: 5000,
  deduplicationWindowMs: 300000
}

interface ProcessedNotification {
  event: NotificationEvent
  recipients: string[]
  channels: ("IN_APP" | "PUSH" | "EMAIL" | "SMS")[]
  aggregationKey: string | null
  priority: NotificationPriority
}

interface EventProcessor {
  processEvent(event: NotificationEvent): Promise<ProcessedNotification[]>
  resolveRecipients(event: NotificationEvent): Promise<string[]>
  filterByPreferences(
    recipientIds: string[],
    notificationType: NotificationType
  ): Promise<Map<string, ("IN_APP" | "PUSH" | "EMAIL" | "SMS")[]>>
  checkDeduplication(event: NotificationEvent): Promise<boolean>
  generateAggregationKey(event: NotificationEvent): string | null
}
```

## 12.2.3 Recipient Resolution Strategies

```typescript
const RecipientStrategySchema = z.enum([
  "DIRECT",
  "FOLLOWERS",
  "ORG_MEMBERS",
  "ORG_ADMINS",
  "CONTENT_PARTICIPANTS",
  "DISCUSSION_PARTICIPANTS"
])

type RecipientStrategy = z.infer<typeof RecipientStrategySchema>

interface RecipientResolver {
  strategy: RecipientStrategy
  resolve(event: NotificationEvent): Promise<string[]>
  maxRecipients: number
  batchSize: number
}

const RECIPIENT_STRATEGY_MAP: Record<NotificationType, RecipientStrategy> = {
  POLL_PUBLISHED: "FOLLOWERS",
  POLL_ENDING_SOON: "CONTENT_PARTICIPANTS",
  POLL_ENDED: "CONTENT_PARTICIPANTS",
  POLL_RESULTS_AVAILABLE: "CONTENT_PARTICIPANTS",
  SURVEY_INVITATION: "DIRECT",
  SURVEY_REMINDER: "DIRECT",
  SURVEY_ENDED: "DIRECT",
  TEST_RESULTS_AVAILABLE: "DIRECT",

  NEW_FOLLOWER: "DIRECT",
  FOLLOW_REQUEST: "DIRECT",
  FOLLOW_REQUEST_ACCEPTED: "DIRECT",
  COMMENT_ON_YOUR_CONTENT: "DIRECT",
  REPLY_TO_YOUR_COMMENT: "DIRECT",
  MENTION_IN_COMMENT: "DIRECT",
  COMMENT_UPVOTED: "DIRECT",
  CONTENT_SHARED: "DIRECT",
  ACCESS_REQUEST_RECEIVED: "DIRECT",
  ACCESS_REQUEST_APPROVED: "DIRECT",
  ACCESS_REQUEST_DENIED: "DIRECT",

  ACCOUNT_VERIFIED: "DIRECT",
  BADGE_EARNED: "DIRECT",
  LEVEL_UP: "DIRECT",
  STREAK_MILESTONE: "DIRECT",
  SYSTEM_ANNOUNCEMENT: "FOLLOWERS",
  SECURITY_ALERT: "DIRECT",
  PASSWORD_CHANGED: "DIRECT",
  NEW_DEVICE_LOGIN: "DIRECT",
  ACCOUNT_WARNING: "DIRECT",

  ORG_INVITATION: "DIRECT",
  ORG_ROLE_CHANGED: "DIRECT",
  ORG_CONTENT_PUBLISHED: "ORG_MEMBERS",
  ORG_MEMBER_JOINED: "ORG_ADMINS",
  ORG_SURVEY_RESPONSE_MILESTONE: "ORG_ADMINS",

  CONTENT_REMOVED: "DIRECT",
  CONTENT_RESTORED: "DIRECT",
  COMMENT_REMOVED: "DIRECT",
  ACCOUNT_SUSPENDED: "DIRECT",
  ACCOUNT_UNSUSPENDED: "DIRECT",
  REPORT_RESOLVED: "DIRECT"
}

const RECIPIENT_LIMITS: Record<RecipientStrategy, number> = {
  DIRECT: 1,
  FOLLOWERS: 100000,
  ORG_MEMBERS: 50000,
  ORG_ADMINS: 100,
  CONTENT_PARTICIPANTS: 10000,
  DISCUSSION_PARTICIPANTS: 1000
}

export {
  RecipientStrategySchema,
  RECIPIENT_STRATEGY_MAP,
  RECIPIENT_LIMITS
}
export type { RecipientStrategy, RecipientResolver }
```

## 12.2.4 Deduplication Logic

```typescript
interface DeduplicationConfig {
  enabled: boolean
  windowMs: number
  keyGenerator: (event: NotificationEvent) => string
}

const generateDeduplicationKey = (event: NotificationEvent): string => {
  const parts = [
    event.type,
    event.targetId,
    event.actorId || "system",
    event.resourceId || "none"
  ]
  return parts.join(":")
}

const DEDUPLICATION_WINDOWS: Partial<Record<NotificationType, number>> = {
  NEW_FOLLOWER: 3600000,
  COMMENT_UPVOTED: 3600000,
  CONTENT_SHARED: 3600000,
  FOLLOW_REQUEST: 86400000,
  POLL_ENDING_SOON: 86400000,
  SURVEY_REMINDER: 86400000
}

interface DeduplicationResult {
  isDuplicate: boolean
  existingNotificationId: string | null
  shouldAggregate: boolean
}

export {
  generateDeduplicationKey,
  DEDUPLICATION_WINDOWS
}
export type { DeduplicationConfig, DeduplicationResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.3 NOTIFICATION AGGREGATION
# ══════════════════════════════════════════════════════════════════════════════

## 12.3.1 Aggregation Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NOTIFICATION AGGREGATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    AGGREGATION RULES                                │   │
│  │                                                                     │   │
│  │  1. Same notification type                                         │   │
│  │  2. Same target user                                               │   │
│  │  3. Same resource (optional, type-dependent)                       │   │
│  │  4. Within aggregation window                                      │   │
│  │  5. Under max aggregation count                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    AGGREGATION EXAMPLES                             │   │
│  │                                                                     │   │
│  │  NEW_FOLLOWER:                                                     │   │
│  │    "Ali, Ayşe ve 5 kişi daha seni takip etti"                      │   │
│  │                                                                     │   │
│  │  COMMENT_UPVOTED:                                                  │   │
│  │    "Yorumun 15 oy aldı"                                            │   │
│  │                                                                     │   │
│  │  COMMENT_ON_YOUR_CONTENT:                                          │   │
│  │    "Anketine 8 yeni yorum yapıldı"                                 │   │
│  │                                                                     │   │
│  │  BADGE_EARNED:                                                     │   │
│  │    "3 yeni rozet kazandın!"                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 12.3.2 Aggregation Schema

```typescript
import { z } from "zod"

const AggregationKeySchema = z.object({
  type: NotificationTypeSchema,
  targetId: z.string().cuid2(),
  resourceId: z.string().cuid2().optional(),
  windowStart: z.date()
})

const AggregatedNotificationSchema = z.object({
  id: z.string().cuid2(),
  aggregationKey: z.string(),
  type: NotificationTypeSchema,
  targetId: z.string().cuid2(),
  resourceId: z.string().cuid2().nullable(),
  actorIds: z.array(z.string().cuid2()),
  actorCount: z.number().int().positive(),
  firstActorId: z.string().cuid2(),
  lastActorId: z.string().cuid2(),
  metadata: z.record(z.unknown()),
  windowStart: z.date(),
  windowEnd: z.date(),
  lastUpdatedAt: z.date(),
  isDelivered: z.boolean(),
  deliveredAt: z.date().nullable()
})

type AggregationKey = z.infer<typeof AggregationKeySchema>
type AggregatedNotification = z.infer<typeof AggregatedNotificationSchema>

const generateAggregationKey = (
  type: NotificationType,
  targetId: string,
  resourceId: string | null,
  windowStart: Date
): string => {
  const parts = [
    type,
    targetId,
    resourceId || "global",
    Math.floor(windowStart.getTime() / 1000)
  ]
  return parts.join(":")
}

export {
  AggregationKeySchema,
  AggregatedNotificationSchema,
  generateAggregationKey
}
export type { AggregationKey, AggregatedNotification }
```

## 12.3.3 Aggregation Templates

```typescript
interface AggregationTemplate {
  type: NotificationType
  single: (actor: string, resource?: string) => string
  few: (actors: string[], count: number, resource?: string) => string
  many: (firstActors: string[], totalCount: number, resource?: string) => string
}

const AGGREGATION_TEMPLATES: Partial<Record<NotificationType, AggregationTemplate>> = {
  NEW_FOLLOWER: {
    type: "NEW_FOLLOWER",
    single: (actor) => `${actor} seni takip etti`,
    few: (actors, count) => `${actors.join(", ")} seni takip etti`,
    many: (actors, count) => `${actors.slice(0, 2).join(", ")} ve ${count - 2} kişi daha seni takip etti`
  },
  COMMENT_ON_YOUR_CONTENT: {
    type: "COMMENT_ON_YOUR_CONTENT",
    single: (actor, resource) => `${actor} "${resource}" içeriğine yorum yaptı`,
    few: (actors, count, resource) => `${actors.join(", ")} "${resource}" içeriğine yorum yaptı`,
    many: (actors, count, resource) => `"${resource}" içeriğine ${count} yeni yorum yapıldı`
  },
  COMMENT_UPVOTED: {
    type: "COMMENT_UPVOTED",
    single: (actor) => `${actor} yorumunu beğendi`,
    few: (actors, count) => `Yorumun ${count} beğeni aldı`,
    many: (actors, count) => `Yorumun ${count} beğeni aldı`
  },
  CONTENT_SHARED: {
    type: "CONTENT_SHARED",
    single: (actor, resource) => `${actor} "${resource}" içeriğini paylaştı`,
    few: (actors, count, resource) => `${count} kişi "${resource}" içeriğini paylaştı`,
    many: (actors, count, resource) => `${count} kişi "${resource}" içeriğini paylaştı`
  },
  BADGE_EARNED: {
    type: "BADGE_EARNED",
    single: (actor, resource) => `"${resource}" rozetini kazandın!`,
    few: (actors, count) => `${count} yeni rozet kazandın!`,
    many: (actors, count) => `${count} yeni rozet kazandın!`
  },
  ORG_MEMBER_JOINED: {
    type: "ORG_MEMBER_JOINED",
    single: (actor, resource) => `${actor} "${resource}" organizasyonuna katıldı`,
    few: (actors, count, resource) => `${count} kişi "${resource}" organizasyonuna katıldı`,
    many: (actors, count, resource) => `${count} kişi "${resource}" organizasyonuna katıldı`
  }
}

const formatAggregatedMessage = (
  template: AggregationTemplate,
  actorNames: string[],
  totalCount: number,
  resourceName?: string
): string => {
  if (totalCount === 1) {
    return template.single(actorNames[0], resourceName)
  } else if (totalCount <= 3) {
    return template.few(actorNames, totalCount, resourceName)
  } else {
    return template.many(actorNames, totalCount, resourceName)
  }
}

export { AGGREGATION_TEMPLATES, formatAggregatedMessage }
export type { AggregationTemplate }
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.4 USER NOTIFICATION PREFERENCES
# ══════════════════════════════════════════════════════════════════════════════

## 12.4.1 Preference Schema

```typescript
import { z } from "zod"

const ChannelPreferenceSchema = z.object({
  inApp: z.boolean().default(true),
  push: z.boolean().default(true),
  email: z.boolean().default(false),
  sms: z.boolean().default(false)
})

const CategoryPreferenceSchema = z.object({
  enabled: z.boolean().default(true),
  channels: ChannelPreferenceSchema
})

const NotificationPreferencesSchema = z.object({
  userId: z.string().cuid2(),

  globalEnabled: z.boolean().default(true),

  quietHours: z.object({
    enabled: z.boolean().default(false),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default("22:00"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default("08:00"),
    timezone: z.string().default("Europe/Istanbul"),
    allowUrgent: z.boolean().default(true)
  }),

  categories: z.object({
    CONTENT: CategoryPreferenceSchema.default({
      enabled: true,
      channels: { inApp: true, push: true, email: false, sms: false }
    }),
    SOCIAL: CategoryPreferenceSchema.default({
      enabled: true,
      channels: { inApp: true, push: true, email: false, sms: false }
    }),
    SYSTEM: CategoryPreferenceSchema.default({
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: false }
    }),
    ORGANIZATION: CategoryPreferenceSchema.default({
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: false }
    }),
    MODERATION: CategoryPreferenceSchema.default({
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: false }
    })
  }),

  typeOverrides: z.record(
    NotificationTypeSchema,
    z.object({
      enabled: z.boolean(),
      channels: ChannelPreferenceSchema.optional()
    })
  ).default({}),

  emailDigest: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(["DAILY", "WEEKLY"]).default("DAILY"),
    dayOfWeek: z.number().int().min(0).max(6).default(1),
    timeOfDay: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).default("09:00")
  }),

  mutedUsers: z.array(z.string().cuid2()).default([]),
  mutedOrganizations: z.array(z.string().cuid2()).default([]),
  mutedContentIds: z.array(z.string().cuid2()).default([]),

  createdAt: z.date(),
  updatedAt: z.date()
})

type ChannelPreference = z.infer<typeof ChannelPreferenceSchema>
type CategoryPreference = z.infer<typeof CategoryPreferenceSchema>
type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>

export {
  ChannelPreferenceSchema,
  CategoryPreferenceSchema,
  NotificationPreferencesSchema
}
export type {
  ChannelPreference,
  CategoryPreference,
  NotificationPreferences
}
```

## 12.4.2 Preference Resolution

```typescript
interface ChannelDecision {
  inApp: boolean
  push: boolean
  email: boolean
  sms: boolean
}

const resolveChannelPreferences = (
  preferences: NotificationPreferences,
  notificationType: NotificationType,
  config: NotificationTypeConfig
): ChannelDecision => {
  if (!preferences.globalEnabled) {
    return { inApp: false, push: false, email: false, sms: false }
  }

  const category = config.category
  const categoryPref = preferences.categories[category]

  if (!categoryPref.enabled) {
    return { inApp: false, push: false, email: false, sms: false }
  }

  const typeOverride = preferences.typeOverrides[notificationType]
  if (typeOverride && !typeOverride.enabled) {
    return { inApp: false, push: false, email: false, sms: false }
  }

  const channelPref = typeOverride?.channels || categoryPref.channels

  return {
    inApp: config.channels.inApp && channelPref.inApp,
    push: config.channels.push && channelPref.push,
    email: config.channels.email && channelPref.email,
    sms: config.channels.sms && channelPref.sms
  }
}

const isInQuietHours = (
  preferences: NotificationPreferences,
  priority: NotificationPriority
): boolean => {
  if (!preferences.quietHours.enabled) return false
  if (priority === "URGENT" && preferences.quietHours.allowUrgent) return false

  const now = new Date()
  const userTimezone = preferences.quietHours.timezone

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: userTimezone
  })

  const currentTime = formatter.format(now)
  const startTime = preferences.quietHours.startTime
  const endTime = preferences.quietHours.endTime

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime < endTime
  } else {
    return currentTime >= startTime || currentTime < endTime
  }
}

const isMuted = (
  preferences: NotificationPreferences,
  event: NotificationEvent
): boolean => {
  if (event.actorId && preferences.mutedUsers.includes(event.actorId)) {
    return true
  }

  if (event.actorType === "ORGANIZATION" &&
      event.actorId &&
      preferences.mutedOrganizations.includes(event.actorId)) {
    return true
  }

  if (event.resourceId && preferences.mutedContentIds.includes(event.resourceId)) {
    return true
  }

  return false
}

export {
  resolveChannelPreferences,
  isInQuietHours,
  isMuted
}
export type { ChannelDecision }
```

## 12.4.3 Default Preferences

```typescript
const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, "userId" | "createdAt" | "updatedAt"> = {
  globalEnabled: true,
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
    timezone: "Europe/Istanbul",
    allowUrgent: true
  },
  categories: {
    CONTENT: {
      enabled: true,
      channels: { inApp: true, push: true, email: false, sms: false }
    },
    SOCIAL: {
      enabled: true,
      channels: { inApp: true, push: true, email: false, sms: false }
    },
    SYSTEM: {
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: false }
    },
    ORGANIZATION: {
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: false }
    },
    MODERATION: {
      enabled: true,
      channels: { inApp: true, push: true, email: true, sms: false }
    }
  },
  typeOverrides: {},
  emailDigest: {
    enabled: false,
    frequency: "DAILY",
    dayOfWeek: 1,
    timeOfDay: "09:00"
  },
  mutedUsers: [],
  mutedOrganizations: [],
  mutedContentIds: []
}

export { DEFAULT_NOTIFICATION_PREFERENCES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.5 IN-APP NOTIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 12.5.1 In-App Notification Schema

```typescript
import { z } from "zod"

const InAppNotificationStatusSchema = z.enum([
  "UNREAD",
  "READ",
  "ARCHIVED",
  "DELETED"
])

const InAppNotificationSchema = z.object({
  id: z.string().cuid2(),
  userId: z.string().cuid2(),
  type: NotificationTypeSchema,
  category: NotificationCategorySchema,
  priority: NotificationPrioritySchema,

  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),

  actorId: z.string().cuid2().nullable(),
  actorType: z.enum(["USER", "ORGANIZATION", "SYSTEM"]),
  actorName: z.string().nullable(),
  actorAvatarUrl: z.string().url().nullable(),

  resourceId: z.string().cuid2().nullable(),
  resourceType: z.enum(["POLL", "SURVEY", "TEST", "COMMENT", "DISCUSSION", "BADGE", "REPORT"]).nullable(),
  resourceTitle: z.string().nullable(),

  actionUrl: z.string().nullable(),
  actionLabel: z.string().nullable(),

  imageUrl: z.string().url().nullable(),

  aggregationId: z.string().cuid2().nullable(),
  aggregatedCount: z.number().int().min(1).default(1),
  aggregatedActors: z.array(z.object({
    id: z.string().cuid2(),
    name: z.string(),
    avatarUrl: z.string().url().nullable()
  })).default([]),

  metadata: z.record(z.unknown()).default({}),

  status: InAppNotificationStatusSchema.default("UNREAD"),
  readAt: z.date().nullable(),
  archivedAt: z.date().nullable(),

  expiresAt: z.date().nullable(),

  createdAt: z.date(),
  updatedAt: z.date()
})

type InAppNotificationStatus = z.infer<typeof InAppNotificationStatusSchema>
type InAppNotification = z.infer<typeof InAppNotificationSchema>

export {
  InAppNotificationStatusSchema,
  InAppNotificationSchema
}
export type { InAppNotificationStatus, InAppNotification }
```

## 12.5.2 Notification Feed

```typescript
const NotificationFeedRequestSchema = z.object({
  userId: z.string().cuid2(),
  filter: z.enum(["ALL", "UNREAD", "READ"]).default("ALL"),
  category: NotificationCategorySchema.optional(),
  cursor: z.string().cuid2().optional(),
  limit: z.number().int().min(1).max(50).default(20)
})

const NotificationFeedResponseSchema = z.object({
  notifications: z.array(InAppNotificationSchema),
  unreadCount: z.number().int().min(0),
  unreadByCategory: z.record(NotificationCategorySchema, z.number().int().min(0)),
  cursor: z.string().cuid2().nullable(),
  hasMore: z.boolean()
})

type NotificationFeedRequest = z.infer<typeof NotificationFeedRequestSchema>
type NotificationFeedResponse = z.infer<typeof NotificationFeedResponseSchema>

export {
  NotificationFeedRequestSchema,
  NotificationFeedResponseSchema
}
export type { NotificationFeedRequest, NotificationFeedResponse }
```

## 12.5.3 Notification Actions

```typescript
const MarkNotificationReadSchema = z.object({
  userId: z.string().cuid2(),
  notificationId: z.string().cuid2()
})

const MarkAllReadSchema = z.object({
  userId: z.string().cuid2(),
  category: NotificationCategorySchema.optional(),
  beforeDate: z.date().optional()
})

const ArchiveNotificationSchema = z.object({
  userId: z.string().cuid2(),
  notificationId: z.string().cuid2()
})

const DeleteNotificationSchema = z.object({
  userId: z.string().cuid2(),
  notificationId: z.string().cuid2()
})

const BulkArchiveSchema = z.object({
  userId: z.string().cuid2(),
  notificationIds: z.array(z.string().cuid2()).min(1).max(100)
})

type MarkNotificationRead = z.infer<typeof MarkNotificationReadSchema>
type MarkAllRead = z.infer<typeof MarkAllReadSchema>
type ArchiveNotification = z.infer<typeof ArchiveNotificationSchema>
type DeleteNotification = z.infer<typeof DeleteNotificationSchema>
type BulkArchive = z.infer<typeof BulkArchiveSchema>

export {
  MarkNotificationReadSchema,
  MarkAllReadSchema,
  ArchiveNotificationSchema,
  DeleteNotificationSchema,
  BulkArchiveSchema
}
export type {
  MarkNotificationRead,
  MarkAllRead,
  ArchiveNotification,
  DeleteNotification,
  BulkArchive
}
```

## 12.5.4 Real-time Updates

```typescript
const NotificationRealtimeEventSchema = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("NEW_NOTIFICATION"),
    payload: InAppNotificationSchema
  }),
  z.object({
    event: z.literal("NOTIFICATION_UPDATED"),
    payload: z.object({
      id: z.string().cuid2(),
      updates: z.object({
        status: InAppNotificationStatusSchema.optional(),
        aggregatedCount: z.number().int().optional(),
        aggregatedActors: z.array(z.object({
          id: z.string().cuid2(),
          name: z.string(),
          avatarUrl: z.string().url().nullable()
        })).optional()
      })
    })
  }),
  z.object({
    event: z.literal("UNREAD_COUNT_UPDATED"),
    payload: z.object({
      totalUnread: z.number().int().min(0),
      byCategory: z.record(NotificationCategorySchema, z.number().int().min(0))
    })
  }),
  z.object({
    event: z.literal("NOTIFICATIONS_MARKED_READ"),
    payload: z.object({
      notificationIds: z.array(z.string().cuid2())
    })
  })
])

type NotificationRealtimeEvent = z.infer<typeof NotificationRealtimeEventSchema>

export { NotificationRealtimeEventSchema }
export type { NotificationRealtimeEvent }
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.6 PUSH NOTIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 12.6.1 Push Token Management

```typescript
import { z } from "zod"

const PushPlatformSchema = z.enum([
  "FCM",
  "APNS",
  "WEB_PUSH"
])

const PushTokenSchema = z.object({
  id: z.string().cuid2(),
  userId: z.string().cuid2(),
  platform: PushPlatformSchema,
  token: z.string().min(1).max(4096),
  deviceId: z.string().cuid2(),
  deviceName: z.string().max(100).nullable(),
  deviceModel: z.string().max(100).nullable(),
  osVersion: z.string().max(50).nullable(),
  appVersion: z.string().max(50).nullable(),

  isActive: z.boolean().default(true),
  lastUsedAt: z.date(),
  failureCount: z.number().int().min(0).default(0),
  lastFailureAt: z.date().nullable(),
  lastFailureReason: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date()
})

const RegisterPushTokenSchema = z.object({
  userId: z.string().cuid2(),
  platform: PushPlatformSchema,
  token: z.string().min(1).max(4096),
  deviceId: z.string().cuid2(),
  deviceName: z.string().max(100).optional(),
  deviceModel: z.string().max(100).optional(),
  osVersion: z.string().max(50).optional(),
  appVersion: z.string().max(50).optional()
})

type PushPlatform = z.infer<typeof PushPlatformSchema>
type PushToken = z.infer<typeof PushTokenSchema>
type RegisterPushToken = z.infer<typeof RegisterPushTokenSchema>

const MAX_TOKENS_PER_USER = 10
const MAX_FAILURE_COUNT = 5
const TOKEN_CLEANUP_DAYS = 90

export {
  PushPlatformSchema,
  PushTokenSchema,
  RegisterPushTokenSchema,
  MAX_TOKENS_PER_USER,
  MAX_FAILURE_COUNT,
  TOKEN_CLEANUP_DAYS
}
export type { PushPlatform, PushToken, RegisterPushToken }
```

## 12.6.2 Push Payload Structure

```typescript
const PushPayloadSchema = z.object({
  notification: z.object({
    title: z.string().max(100),
    body: z.string().max(250),
    imageUrl: z.string().url().optional(),
    badge: z.number().int().min(0).optional(),
    sound: z.string().optional(),
    tag: z.string().optional(),
    clickAction: z.string().optional()
  }),

  data: z.object({
    notificationId: z.string().cuid2(),
    type: NotificationTypeSchema,
    category: NotificationCategorySchema,
    priority: NotificationPrioritySchema,
    actionUrl: z.string().optional(),
    resourceId: z.string().cuid2().optional(),
    resourceType: z.string().optional(),
    metadata: z.string().optional()
  }),

  android: z.object({
    channelId: z.string(),
    priority: z.enum(["HIGH", "NORMAL"]),
    ttl: z.number().int().positive(),
    collapseKey: z.string().optional(),
    restrictedPackageName: z.string().optional()
  }).optional(),

  apns: z.object({
    headers: z.object({
      "apns-priority": z.enum(["5", "10"]),
      "apns-expiration": z.string(),
      "apns-collapse-id": z.string().optional(),
      "apns-push-type": z.enum(["alert", "background"])
    }),
    payload: z.object({
      aps: z.object({
        alert: z.object({
          title: z.string(),
          body: z.string(),
          "launch-image": z.string().optional()
        }),
        badge: z.number().int().optional(),
        sound: z.string().optional(),
        "thread-id": z.string().optional(),
        "category": z.string().optional(),
        "mutable-content": z.literal(1).optional()
      })
    })
  }).optional(),

  webPush: z.object({
    headers: z.record(z.string()),
    notification: z.object({
      title: z.string(),
      body: z.string(),
      icon: z.string().url().optional(),
      badge: z.string().url().optional(),
      image: z.string().url().optional(),
      tag: z.string().optional(),
      renotify: z.boolean().optional(),
      requireInteraction: z.boolean().optional(),
      actions: z.array(z.object({
        action: z.string(),
        title: z.string(),
        icon: z.string().url().optional()
      })).optional()
    })
  }).optional()
})

type PushPayload = z.infer<typeof PushPayloadSchema>

export { PushPayloadSchema }
export type { PushPayload }
```

## 12.6.3 Android Notification Channels

```typescript
interface AndroidChannel {
  id: string
  name: string
  description: string
  importance: "HIGH" | "DEFAULT" | "LOW" | "MIN"
  sound: string | null
  vibration: boolean
  lights: boolean
  lightColor: string | null
  showBadge: boolean
}

const ANDROID_CHANNELS: AndroidChannel[] = [
  {
    id: "content_notifications",
    name: "İçerik Bildirimleri",
    description: "Anket, araştırma ve test bildirimleri",
    importance: "DEFAULT",
    sound: "default",
    vibration: true,
    lights: true,
    lightColor: "#6366F1",
    showBadge: true
  },
  {
    id: "social_notifications",
    name: "Sosyal Bildirimler",
    description: "Takip, yorum ve beğeni bildirimleri",
    importance: "DEFAULT",
    sound: "default",
    vibration: true,
    lights: true,
    lightColor: "#22C55E",
    showBadge: true
  },
  {
    id: "system_notifications",
    name: "Sistem Bildirimleri",
    description: "Hesap ve güvenlik bildirimleri",
    importance: "HIGH",
    sound: "default",
    vibration: true,
    lights: true,
    lightColor: "#EF4444",
    showBadge: true
  },
  {
    id: "organization_notifications",
    name: "Organizasyon Bildirimleri",
    description: "Kurumsal bildirimler",
    importance: "DEFAULT",
    sound: "default",
    vibration: true,
    lights: true,
    lightColor: "#8B5CF6",
    showBadge: true
  },
  {
    id: "urgent_notifications",
    name: "Acil Bildirimler",
    description: "Kritik güvenlik uyarıları",
    importance: "HIGH",
    sound: "urgent",
    vibration: true,
    lights: true,
    lightColor: "#DC2626",
    showBadge: true
  }
]

const getAndroidChannelForType = (type: NotificationType): string => {
  const config = NOTIFICATION_TYPE_CONFIG[type]

  if (config.priority === "URGENT") {
    return "urgent_notifications"
  }

  switch (config.category) {
    case "CONTENT":
      return "content_notifications"
    case "SOCIAL":
      return "social_notifications"
    case "SYSTEM":
      return "system_notifications"
    case "ORGANIZATION":
      return "organization_notifications"
    case "MODERATION":
      return "system_notifications"
    default:
      return "content_notifications"
  }
}

export { ANDROID_CHANNELS, getAndroidChannelForType }
export type { AndroidChannel }
```

## 12.6.4 Push Rate Limiting

```typescript
interface PushRateLimitConfig {
  maxPerMinute: number
  maxPerHour: number
  maxPerDay: number
  burstLimit: number
  burstWindow: number
}

const PUSH_RATE_LIMITS: Record<NotificationPriority, PushRateLimitConfig> = {
  URGENT: {
    maxPerMinute: 10,
    maxPerHour: 30,
    maxPerDay: 100,
    burstLimit: 5,
    burstWindow: 10000
  },
  HIGH: {
    maxPerMinute: 5,
    maxPerHour: 20,
    maxPerDay: 50,
    burstLimit: 3,
    burstWindow: 30000
  },
  NORMAL: {
    maxPerMinute: 3,
    maxPerHour: 15,
    maxPerDay: 30,
    burstLimit: 2,
    burstWindow: 60000
  },
  LOW: {
    maxPerMinute: 2,
    maxPerHour: 10,
    maxPerDay: 20,
    burstLimit: 1,
    burstWindow: 120000
  }
}

interface RateLimitResult {
  allowed: boolean
  retryAfter: number | null
  reason: string | null
}

export { PUSH_RATE_LIMITS }
export type { PushRateLimitConfig, RateLimitResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.7 EMAIL NOTIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 12.7.1 Email Configuration

```typescript
import { z } from "zod"

const EmailTypeSchema = z.enum([
  "TRANSACTIONAL",
  "NOTIFICATION",
  "DIGEST",
  "MARKETING"
])

const EmailTemplateSchema = z.object({
  id: z.string(),
  type: EmailTypeSchema,
  name: z.string(),
  subject: z.string(),
  preheader: z.string().optional(),
  htmlTemplate: z.string(),
  textTemplate: z.string(),
  variables: z.array(z.string()),
  isActive: z.boolean().default(true)
})

type EmailType = z.infer<typeof EmailTypeSchema>
type EmailTemplate = z.infer<typeof EmailTemplateSchema>

export { EmailTypeSchema, EmailTemplateSchema }
export type { EmailType, EmailTemplate }
```

## 12.7.2 Email Payload

```typescript
const EmailPayloadSchema = z.object({
  to: z.string().email(),
  toName: z.string().optional(),
  from: z.string().email().default("bildirim@voxpoll.com"),
  fromName: z.string().default("VoxPoll"),
  replyTo: z.string().email().optional(),

  subject: z.string().max(200),
  preheader: z.string().max(150).optional(),

  templateId: z.string(),
  templateData: z.record(z.unknown()),

  category: z.string(),
  tags: z.array(z.string()).default([]),

  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),

  scheduledFor: z.date().optional(),

  metadata: z.object({
    userId: z.string().cuid2(),
    notificationId: z.string().cuid2().optional(),
    notificationType: NotificationTypeSchema.optional()
  })
})

type EmailPayload = z.infer<typeof EmailPayloadSchema>

export { EmailPayloadSchema }
export type { EmailPayload }
```

## 12.7.3 Email Templates Mapping

```typescript
const EMAIL_TEMPLATES: Partial<Record<NotificationType, string>> = {
  POLL_ENDING_SOON: "poll-ending-soon",
  POLL_RESULTS_AVAILABLE: "poll-results",
  SURVEY_INVITATION: "survey-invitation",
  SURVEY_REMINDER: "survey-reminder",
  TEST_RESULTS_AVAILABLE: "test-results",

  ACCESS_REQUEST_RECEIVED: "access-request-received",

  ACCOUNT_VERIFIED: "account-verified",
  SYSTEM_ANNOUNCEMENT: "system-announcement",
  SECURITY_ALERT: "security-alert",
  PASSWORD_CHANGED: "password-changed",
  NEW_DEVICE_LOGIN: "new-device-login",
  ACCOUNT_WARNING: "account-warning",

  ORG_INVITATION: "org-invitation",
  ORG_ROLE_CHANGED: "org-role-changed",
  ORG_SURVEY_RESPONSE_MILESTONE: "org-survey-milestone",

  CONTENT_REMOVED: "content-removed",
  CONTENT_RESTORED: "content-restored",
  ACCOUNT_SUSPENDED: "account-suspended",
  ACCOUNT_UNSUSPENDED: "account-unsuspended"
}

interface EmailTemplateVariables {
  userName: string
  userEmail: string
  actionUrl?: string
  resourceTitle?: string
  resourceDescription?: string
  actorName?: string
  organizationName?: string
  expiresAt?: string
  additionalData?: Record<string, unknown>
}

export { EMAIL_TEMPLATES }
export type { EmailTemplateVariables }
```

## 12.7.4 Email Digest

```typescript
const DigestFrequencySchema = z.enum(["DAILY", "WEEKLY"])

const DigestContentSchema = z.object({
  notifications: z.array(z.object({
    type: NotificationTypeSchema,
    title: z.string(),
    body: z.string(),
    actionUrl: z.string().optional(),
    timestamp: z.date()
  })),

  stats: z.object({
    totalNotifications: z.number().int(),
    byCategory: z.record(NotificationCategorySchema, z.number().int())
  }),

  highlights: z.array(z.object({
    type: z.enum(["TRENDING_POLL", "NEW_BADGE", "FOLLOWER_MILESTONE", "ENGAGEMENT_SUMMARY"]),
    title: z.string(),
    description: z.string(),
    actionUrl: z.string().optional()
  })),

  periodStart: z.date(),
  periodEnd: z.date()
})

const DigestEmailPayloadSchema = z.object({
  userId: z.string().cuid2(),
  email: z.string().email(),
  userName: z.string(),
  frequency: DigestFrequencySchema,
  content: DigestContentSchema
})

type DigestFrequency = z.infer<typeof DigestFrequencySchema>
type DigestContent = z.infer<typeof DigestContentSchema>
type DigestEmailPayload = z.infer<typeof DigestEmailPayloadSchema>

export {
  DigestFrequencySchema,
  DigestContentSchema,
  DigestEmailPayloadSchema
}
export type { DigestFrequency, DigestContent, DigestEmailPayload }
```

## 12.7.5 Email Rate Limiting

```typescript
const EMAIL_RATE_LIMITS = {
  TRANSACTIONAL: {
    perHour: 20,
    perDay: 50
  },
  NOTIFICATION: {
    perHour: 10,
    perDay: 30
  },
  DIGEST: {
    perDay: 1
  },
  MARKETING: {
    perWeek: 2,
    perMonth: 5
  }
}

const EMAIL_COOLDOWNS: Partial<Record<NotificationType, number>> = {
  SURVEY_REMINDER: 86400000,
  POLL_ENDING_SOON: 43200000,
  ACCOUNT_WARNING: 86400000
}

export { EMAIL_RATE_LIMITS, EMAIL_COOLDOWNS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.8 SMS NOTIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 12.8.1 SMS Configuration

```typescript
import { z } from "zod"

const SMSTypeSchema = z.enum([
  "OTP",
  "VERIFICATION",
  "SECURITY_ALERT",
  "CRITICAL_NOTIFICATION"
])

const SMSPayloadSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/),
  type: SMSTypeSchema,
  message: z.string().min(1).max(160),

  metadata: z.object({
    userId: z.string().cuid2(),
    notificationId: z.string().cuid2().optional(),
    notificationType: NotificationTypeSchema.optional()
  }),

  expiresAt: z.date().optional()
})

type SMSType = z.infer<typeof SMSTypeSchema>
type SMSPayload = z.infer<typeof SMSPayloadSchema>

export { SMSTypeSchema, SMSPayloadSchema }
export type { SMSType, SMSPayload }
```

## 12.8.2 SMS Templates

```typescript
const SMS_TEMPLATES: Record<SMSType, string> = {
  OTP: "VoxPoll doğrulama kodunuz: {{code}}. Bu kod 10 dakika geçerlidir.",
  VERIFICATION: "VoxPoll hesabınız doğrulandı. Artık tüm özellikleri kullanabilirsiniz.",
  SECURITY_ALERT: "VoxPoll: Hesabınızda şüpheli aktivite tespit edildi. Hesabınızı kontrol edin.",
  CRITICAL_NOTIFICATION: "VoxPoll: {{message}}"
}

const SMS_ALLOWED_TYPES: NotificationType[] = [
  "SECURITY_ALERT",
  "ACCOUNT_SUSPENDED"
]

const formatSMSMessage = (
  type: SMSType,
  variables: Record<string, string>
): string => {
  let message = SMS_TEMPLATES[type]

  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(`{{${key}}}`, value)
  }

  return message.slice(0, 160)
}

export { SMS_TEMPLATES, SMS_ALLOWED_TYPES, formatSMSMessage }
```

## 12.8.3 SMS Rate Limiting

```typescript
const SMS_RATE_LIMITS = {
  OTP: {
    perMinute: 1,
    perHour: 5,
    perDay: 10
  },
  VERIFICATION: {
    perHour: 2,
    perDay: 5
  },
  SECURITY_ALERT: {
    perHour: 3,
    perDay: 10
  },
  CRITICAL_NOTIFICATION: {
    perHour: 2,
    perDay: 5
  }
}

const SMS_COOLDOWNS: Record<SMSType, number> = {
  OTP: 60000,
  VERIFICATION: 3600000,
  SECURITY_ALERT: 1800000,
  CRITICAL_NOTIFICATION: 3600000
}

export { SMS_RATE_LIMITS, SMS_COOLDOWNS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.9 WEBHOOK NOTIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 12.9.1 Webhook Configuration

```typescript
import { z } from "zod"

const WebhookEventTypeSchema = z.enum([
  "survey.created",
  "survey.published",
  "survey.completed",
  "survey.response.submitted",
  "survey.response.milestone",
  "poll.created",
  "poll.published",
  "poll.ended",
  "test.created",
  "test.published",
  "test.completed",
  "organization.member.joined",
  "organization.member.left",
  "organization.role.changed"
])

const WebhookEndpointSchema = z.object({
  id: z.string().cuid2(),
  organizationId: z.string().cuid2(),

  url: z.string().url(),
  secret: z.string().min(32),

  events: z.array(WebhookEventTypeSchema).min(1),

  isActive: z.boolean().default(true),

  headers: z.record(z.string()).default({}),

  retryPolicy: z.object({
    maxRetries: z.number().int().min(0).max(10).default(3),
    initialDelay: z.number().int().min(1000).max(60000).default(5000),
    maxDelay: z.number().int().min(60000).max(3600000).default(300000),
    backoffMultiplier: z.number().min(1).max(4).default(2)
  }).default({}),

  rateLimit: z.object({
    maxPerMinute: z.number().int().min(1).max(100).default(60),
    maxPerHour: z.number().int().min(1).max(1000).default(500)
  }).default({}),

  metadata: z.record(z.unknown()).default({}),

  lastTriggeredAt: z.date().nullable(),
  lastSuccessAt: z.date().nullable(),
  lastFailureAt: z.date().nullable(),
  consecutiveFailures: z.number().int().min(0).default(0),

  createdAt: z.date(),
  updatedAt: z.date()
})

type WebhookEventType = z.infer<typeof WebhookEventTypeSchema>
type WebhookEndpoint = z.infer<typeof WebhookEndpointSchema>

export { WebhookEventTypeSchema, WebhookEndpointSchema }
export type { WebhookEventType, WebhookEndpoint }
```

## 12.9.2 Webhook Payload

```typescript
const WebhookPayloadSchema = z.object({
  id: z.string().cuid2(),
  event: WebhookEventTypeSchema,
  apiVersion: z.string().default("2024-01-01"),

  timestamp: z.date(),

  organization: z.object({
    id: z.string().cuid2(),
    name: z.string()
  }),

  data: z.record(z.unknown()),

  metadata: z.object({
    attempt: z.number().int().min(1),
    webhookEndpointId: z.string().cuid2()
  })
})

const WebhookDeliverySchema = z.object({
  id: z.string().cuid2(),
  webhookEndpointId: z.string().cuid2(),

  event: WebhookEventTypeSchema,
  payload: WebhookPayloadSchema,

  status: z.enum(["PENDING", "DELIVERED", "FAILED", "RETRYING"]),

  attempts: z.array(z.object({
    attemptNumber: z.number().int(),
    timestamp: z.date(),
    statusCode: z.number().int().nullable(),
    responseBody: z.string().nullable(),
    errorMessage: z.string().nullable(),
    durationMs: z.number().int()
  })),

  nextRetryAt: z.date().nullable(),

  createdAt: z.date(),
  updatedAt: z.date()
})

type WebhookPayload = z.infer<typeof WebhookPayloadSchema>
type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>

export { WebhookPayloadSchema, WebhookDeliverySchema }
export type { WebhookPayload, WebhookDelivery }
```

## 12.9.3 Webhook Signature

```typescript
const generateWebhookSignature = (
  payload: string,
  secret: string,
  timestamp: number
): string => {
  const signedPayload = `${timestamp}.${payload}`
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(signedPayload)
  return hmac.digest("hex")
}

const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string,
  timestamp: number,
  toleranceSeconds: number = 300
): boolean => {
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return false
  }

  const expectedSignature = generateWebhookSignature(payload, secret, timestamp)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

interface WebhookHeaders {
  "X-VoxPoll-Signature": string
  "X-VoxPoll-Timestamp": string
  "X-VoxPoll-Event": string
  "X-VoxPoll-Delivery-Id": string
  "Content-Type": "application/json"
}

const buildWebhookHeaders = (
  payload: string,
  secret: string,
  event: WebhookEventType,
  deliveryId: string
): WebhookHeaders => {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = generateWebhookSignature(payload, secret, timestamp)

  return {
    "X-VoxPoll-Signature": `v1=${signature}`,
    "X-VoxPoll-Timestamp": timestamp.toString(),
    "X-VoxPoll-Event": event,
    "X-VoxPoll-Delivery-Id": deliveryId,
    "Content-Type": "application/json"
  }
}

export {
  generateWebhookSignature,
  verifyWebhookSignature,
  buildWebhookHeaders
}
export type { WebhookHeaders }
```

## 12.9.4 Webhook Auto-Disable

```typescript
const WEBHOOK_DISABLE_CONFIG = {
  consecutiveFailureThreshold: 10,
  failureWindowHours: 24,
  disableDurationHours: 24,
  notifyOnDisable: true,
  autoReenableAfterHours: 168
}

const shouldDisableWebhook = (endpoint: WebhookEndpoint): boolean => {
  if (endpoint.consecutiveFailures >= WEBHOOK_DISABLE_CONFIG.consecutiveFailureThreshold) {
    return true
  }
  return false
}

const getWebhookHealthStatus = (endpoint: WebhookEndpoint): "HEALTHY" | "DEGRADED" | "UNHEALTHY" => {
  if (endpoint.consecutiveFailures === 0) {
    return "HEALTHY"
  } else if (endpoint.consecutiveFailures < 5) {
    return "DEGRADED"
  } else {
    return "UNHEALTHY"
  }
}

export { WEBHOOK_DISABLE_CONFIG, shouldDisableWebhook, getWebhookHealthStatus }
```

## 12.9.5 Webhook Retry Algorithm

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// WEBHOOK RETRY CONFIGURATION
// Exponential backoff with jitter for distributed systems
// ═══════════════════════════════════════════════════════════════════════════════

const WEBHOOK_RETRY_CONFIG = {
  maxAttempts: 5,

  // Exponential backoff intervals (in milliseconds)
  // Attempt 1: immediate, Attempt 2: 30s, Attempt 3: 2min, Attempt 4: 10min, Attempt 5: 1h
  backoffIntervals: [
    0,           // Attempt 1: immediate
    30_000,      // Attempt 2: 30 seconds
    120_000,     // Attempt 3: 2 minutes
    600_000,     // Attempt 4: 10 minutes
    3_600_000    // Attempt 5: 1 hour
  ],

  // Add random jitter to prevent thundering herd
  jitterPercent: 0.1,  // ±10% randomization

  // HTTP timeout per attempt
  timeoutMs: 10_000,   // 10 seconds

  // Acceptable HTTP status codes (consider successful)
  successStatusCodes: [200, 201, 202, 204],

  // Status codes that should NOT be retried (permanent failures)
  permanentFailureStatusCodes: [400, 401, 403, 404, 405, 410, 422]
}

interface WebhookAttempt {
  attemptNumber: number
  timestamp: Date
  statusCode: number | null
  responseTimeMs: number
  errorMessage: string | null
}

async function executeWebhookWithRetry(
  delivery: WebhookDelivery,
  endpoint: WebhookEndpoint
): Promise<{ success: boolean; attempts: WebhookAttempt[] }> {
  const attempts: WebhookAttempt[] = []

  for (let attempt = 1; attempt <= WEBHOOK_RETRY_CONFIG.maxAttempts; attempt++) {
    // Calculate delay with jitter
    const baseDelay = WEBHOOK_RETRY_CONFIG.backoffIntervals[attempt - 1]
    const jitter = baseDelay * WEBHOOK_RETRY_CONFIG.jitterPercent * (Math.random() * 2 - 1)
    const delay = Math.max(0, baseDelay + jitter)

    if (delay > 0) {
      await sleep(delay)
    }

    const startTime = Date.now()
    const attemptResult = await executeWebhookAttempt(delivery, endpoint)
    const responseTimeMs = Date.now() - startTime

    attempts.push({
      attemptNumber: attempt,
      timestamp: new Date(),
      statusCode: attemptResult.statusCode,
      responseTimeMs,
      errorMessage: attemptResult.errorMessage
    })

    // Success
    if (attemptResult.statusCode &&
        WEBHOOK_RETRY_CONFIG.successStatusCodes.includes(attemptResult.statusCode)) {
      return { success: true, attempts }
    }

    // Permanent failure - don't retry
    if (attemptResult.statusCode &&
        WEBHOOK_RETRY_CONFIG.permanentFailureStatusCodes.includes(attemptResult.statusCode)) {
      return { success: false, attempts }
    }

    // Transient failure - continue to next attempt (5xx, timeout, network error)
  }

  return { success: false, attempts }
}

async function executeWebhookAttempt(
  delivery: WebhookDelivery,
  endpoint: WebhookEndpoint
): Promise<{ statusCode: number | null; errorMessage: string | null }> {
  try {
    const payload = JSON.stringify(delivery.payload)
    const headers = buildWebhookHeaders(
      payload,
      endpoint.secret,
      delivery.event,
      delivery.id
    )

    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      WEBHOOK_RETRY_CONFIG.timeoutMs
    )

    const response = await fetch(endpoint.url, {
      method: "POST",
      headers,
      body: payload,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    return { statusCode: response.status, errorMessage: null }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { statusCode: null, errorMessage: "Request timeout" }
      }
      return { statusCode: null, errorMessage: error.message }
    }
    return { statusCode: null, errorMessage: "Unknown error" }
  }
}

function calculateNextRetryAt(attemptCount: number): Date | null {
  if (attemptCount >= WEBHOOK_RETRY_CONFIG.maxAttempts) {
    return null // No more retries
  }

  const baseDelay = WEBHOOK_RETRY_CONFIG.backoffIntervals[attemptCount]
  const jitter = baseDelay * WEBHOOK_RETRY_CONFIG.jitterPercent * (Math.random() * 2 - 1)
  const delay = Math.max(0, baseDelay + jitter)

  return new Date(Date.now() + delay)
}

export {
  WEBHOOK_RETRY_CONFIG,
  executeWebhookWithRetry,
  calculateNextRetryAt
}
export type { WebhookAttempt }
```


# ══════════════════════════════════════════════════════════════════════════════
# 12.10 DRIZZLE SCHEMA (NOTIFICATION TABLES)
# ══════════════════════════════════════════════════════════════════════════════

## 12.10.1 Notification Models

```typescript
// Drizzle schema
model Notification {
  id                String                 @id @default(cuid())
  userId            String
  type              NotificationType
  category          NotificationCategory
  priority          NotificationPriority

  title             String                 @db.VarChar(100)
  body              String                 @db.VarChar(500)

  actorId           String?
  actorType         ActorType
  actorName         String?
  actorAvatarUrl    String?

  resourceId        String?
  resourceType      ResourceType?
  resourceTitle     String?

  actionUrl         String?
  actionLabel       String?
  imageUrl          String?

  aggregationId     String?
  aggregatedCount   Int                    @default(1)

  metadata          Json                   @default("{}")

  status            NotificationStatus     @default(UNREAD)
  readAt            DateTime?
  archivedAt        DateTime?
  deletedAt         DateTime?

  expiresAt         DateTime?

  createdAt         DateTime               @default(now())
  updatedAt         DateTime               @updatedAt

  user              User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  aggregation       NotificationAggregation? @relation(fields: [aggregationId], references: [id])

  @@index([userId, status, createdAt(sort: Desc)])
  @@index([userId, category, status])
  @@index([userId, type, createdAt(sort: Desc)])
  @@index([aggregationId])
  @@index([expiresAt])
  @@index([createdAt])
  @@map("notifications")
}

model NotificationAggregation {
  id                String               @id @default(cuid())
  aggregationKey    String               @unique
  type              NotificationType
  targetId          String
  resourceId        String?

  actorIds          String[]
  actorCount        Int
  firstActorId      String
  lastActorId       String

  metadata          Json                 @default("{}")

  windowStart       DateTime
  windowEnd         DateTime

  isDelivered       Boolean              @default(false)
  deliveredAt       DateTime?

  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  notifications     Notification[]

  @@index([targetId, type, windowStart])
  @@index([aggregationKey])
  @@index([windowEnd, isDelivered])
  @@map("notification_aggregations")
}

model NotificationPreference {
  id                    String             @id @default(cuid())
  userId                String             @unique

  globalEnabled         Boolean            @default(true)

  quietHoursEnabled     Boolean            @default(false)
  quietHoursStart       String             @default("22:00")
  quietHoursEnd         String             @default("08:00")
  quietHoursTimezone    String             @default("Europe/Istanbul")
  quietHoursAllowUrgent Boolean            @default(true)

  categoryPreferences   Json               @default("{}")
  typeOverrides         Json               @default("{}")

  emailDigestEnabled    Boolean            @default(false)
  emailDigestFrequency  DigestFrequency    @default(DAILY)
  emailDigestDay        Int                @default(1)
  emailDigestTime       String             @default("09:00")

  mutedUserIds          String[]           @default([])
  mutedOrgIds           String[]           @default([])
  mutedContentIds       String[]           @default([])

  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  user                  User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
}

enum NotificationType {
  POLL_PUBLISHED
  POLL_ENDING_SOON
  POLL_ENDED
  POLL_RESULTS_AVAILABLE
  SURVEY_INVITATION
  SURVEY_REMINDER
  SURVEY_ENDED
  TEST_RESULTS_AVAILABLE
  NEW_FOLLOWER
  FOLLOW_REQUEST
  FOLLOW_REQUEST_ACCEPTED
  COMMENT_ON_YOUR_CONTENT
  REPLY_TO_YOUR_COMMENT
  MENTION_IN_COMMENT
  COMMENT_UPVOTED
  CONTENT_SHARED
  ACCESS_REQUEST_RECEIVED
  ACCESS_REQUEST_APPROVED
  ACCESS_REQUEST_DENIED
  ACCOUNT_VERIFIED
  BADGE_EARNED
  LEVEL_UP
  STREAK_MILESTONE
  SYSTEM_ANNOUNCEMENT
  SECURITY_ALERT
  PASSWORD_CHANGED
  NEW_DEVICE_LOGIN
  ACCOUNT_WARNING
  ORG_INVITATION
  ORG_ROLE_CHANGED
  ORG_CONTENT_PUBLISHED
  ORG_MEMBER_JOINED
  ORG_SURVEY_RESPONSE_MILESTONE
  CONTENT_REMOVED
  CONTENT_RESTORED
  COMMENT_REMOVED
  ACCOUNT_SUSPENDED
  ACCOUNT_UNSUSPENDED
  REPORT_RESOLVED
}

enum NotificationCategory {
  CONTENT
  SOCIAL
  SYSTEM
  ORGANIZATION
  MODERATION
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum NotificationStatus {
  UNREAD
  READ
  ARCHIVED
  DELETED
}

enum ActorType {
  USER
  ORGANIZATION
  SYSTEM
}

enum ResourceType {
  POLL
  SURVEY
  TEST
  COMMENT
  DISCUSSION
  BADGE
  REPORT
}

enum DigestFrequency {
  DAILY
  WEEKLY
}
```

## 12.10.2 Push Token Model

```typescript
// Drizzle schema
model PushToken {
  id                String           @id @default(cuid())
  userId            String
  platform          PushPlatform
  token             String           @db.VarChar(4096)
  deviceId          String
  deviceName        String?          @db.VarChar(100)
  deviceModel       String?          @db.VarChar(100)
  osVersion         String?          @db.VarChar(50)
  appVersion        String?          @db.VarChar(50)

  isActive          Boolean          @default(true)
  lastUsedAt        DateTime         @default(now())

  failureCount      Int              @default(0)
  lastFailureAt     DateTime?
  lastFailureReason String?

  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  user              User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId, platform])
  @@index([userId, isActive])
  @@index([token])
  @@index([lastUsedAt])
  @@index([failureCount, lastFailureAt])
  @@map("push_tokens")
}

enum PushPlatform {
  FCM
  APNS
  WEB_PUSH
}
```

## 12.10.3 Notification Delivery Log

```typescript
// Drizzle schema
model NotificationDelivery {
  id                String              @id @default(cuid())
  notificationId    String
  userId            String

  channel           DeliveryChannel

  status            DeliveryStatus      @default(PENDING)

  providerMessageId String?

  sentAt            DateTime?
  deliveredAt       DateTime?
  failedAt          DateTime?

  errorCode         String?
  errorMessage      String?

  attempts          Int                 @default(0)
  lastAttemptAt     DateTime?
  nextRetryAt       DateTime?

  metadata          Json                @default("{}")

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([notificationId])
  @@index([userId, channel, status])
  @@index([status, nextRetryAt])
  @@index([createdAt])
  @@map("notification_deliveries")
}

enum DeliveryChannel {
  IN_APP
  PUSH
  EMAIL
  SMS
  WEBHOOK
}

enum DeliveryStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  BOUNCED
  SUPPRESSED
}
```

## 12.10.4 Webhook Models

```typescript
// Drizzle schema
model WebhookEndpoint {
  id                  String              @id @default(cuid())
  organizationId      String

  url                 String
  secret              String              @db.VarChar(64)

  events              WebhookEventType[]

  isActive            Boolean             @default(true)

  customHeaders       Json                @default("{}")

  maxRetries          Int                 @default(3)
  initialDelayMs      Int                 @default(5000)
  maxDelayMs          Int                 @default(300000)
  backoffMultiplier   Float               @default(2)

  maxPerMinute        Int                 @default(60)
  maxPerHour          Int                 @default(500)

  metadata            Json                @default("{}")

  lastTriggeredAt     DateTime?
  lastSuccessAt       DateTime?
  lastFailureAt       DateTime?
  consecutiveFailures Int                 @default(0)

  disabledAt          DateTime?
  disabledReason      String?

  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  organization        Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  deliveries          WebhookDelivery[]

  @@index([organizationId, isActive])
  @@index([isActive, events])
  @@map("webhook_endpoints")
}

model WebhookDelivery {
  id                String              @id @default(cuid())
  webhookEndpointId String

  event             WebhookEventType
  payload           Json

  status            WebhookDeliveryStatus @default(PENDING)

  attempts          Json                @default("[]")
  attemptCount      Int                 @default(0)

  nextRetryAt       DateTime?

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  endpoint          WebhookEndpoint     @relation(fields: [webhookEndpointId], references: [id], onDelete: Cascade)

  @@index([webhookEndpointId, status])
  @@index([status, nextRetryAt])
  @@index([createdAt])
  @@map("webhook_deliveries")
}

enum WebhookEventType {
  survey_created
  survey_published
  survey_completed
  survey_response_submitted
  survey_response_milestone
  poll_created
  poll_published
  poll_ended
  test_created
  test_published
  test_completed
  organization_member_joined
  organization_member_left
  organization_role_changed
}

enum WebhookDeliveryStatus {
  PENDING
  DELIVERED
  FAILED
  RETRYING
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.11 PERFORMANCE & CACHING
# ══════════════════════════════════════════════════════════════════════════════

## 12.11.1 Cache Strategy

```typescript
const NOTIFICATION_CACHE_CONFIG = {
  unreadCount: {
    key: (userId: string) => `notif:unread:${userId}`,
    ttl: 300,
    invalidateOn: ["NEW_NOTIFICATION", "MARK_READ", "MARK_ALL_READ"]
  },

  unreadByCategory: {
    key: (userId: string) => `notif:unread:cat:${userId}`,
    ttl: 300,
    invalidateOn: ["NEW_NOTIFICATION", "MARK_READ", "MARK_ALL_READ"]
  },

  recentNotifications: {
    key: (userId: string) => `notif:recent:${userId}`,
    ttl: 60,
    maxItems: 10,
    invalidateOn: ["NEW_NOTIFICATION"]
  },

  preferences: {
    key: (userId: string) => `notif:prefs:${userId}`,
    ttl: 3600,
    invalidateOn: ["PREFERENCES_UPDATED"]
  },

  aggregationWindow: {
    key: (aggregationKey: string) => `notif:agg:${aggregationKey}`,
    ttl: 3600
  },

  deduplication: {
    key: (dedupKey: string) => `notif:dedup:${dedupKey}`,
    ttl: 300
  },

  rateLimits: {
    push: {
      key: (userId: string, window: string) => `notif:rl:push:${userId}:${window}`,
      ttl: 86400
    },
    email: {
      key: (userId: string, window: string) => `notif:rl:email:${userId}:${window}`,
      ttl: 86400
    },
    sms: {
      key: (userId: string, window: string) => `notif:rl:sms:${userId}:${window}`,
      ttl: 86400
    }
  }
}

export { NOTIFICATION_CACHE_CONFIG }
```

## 12.11.2 Batch Processing

```typescript
const BATCH_CONFIG = {
  inApp: {
    batchSize: 1000,
    flushInterval: 1000,
    maxConcurrent: 10
  },

  push: {
    batchSize: 500,
    flushInterval: 2000,
    maxConcurrent: 5,
    fcmBatchSize: 500,
    apnsBatchSize: 400
  },

  email: {
    batchSize: 100,
    flushInterval: 5000,
    maxConcurrent: 3
  },

  webhook: {
    batchSize: 50,
    flushInterval: 1000,
    maxConcurrent: 20
  }
}

interface BatchJob<T> {
  id: string
  items: T[]
  createdAt: Date
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  processedCount: number
  failedCount: number
  errors: Array<{ index: number; error: string }>
}

export { BATCH_CONFIG }
export type { BatchJob }
```

## 12.11.3 Index Definitions

```sql
-- High-frequency query indexes
CREATE INDEX CONCURRENTLY idx_notifications_user_feed
ON notifications(user_id, status, created_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_notifications_user_unread
ON notifications(user_id, category)
WHERE status = 'UNREAD' AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_notifications_expiry
ON notifications(expires_at)
WHERE expires_at IS NOT NULL AND status != 'DELETED';

-- Aggregation indexes
CREATE INDEX CONCURRENTLY idx_aggregation_active
ON notification_aggregations(target_id, type, window_end)
WHERE is_delivered = false;

-- Push token indexes
CREATE INDEX CONCURRENTLY idx_push_tokens_active
ON push_tokens(user_id)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_push_tokens_stale
ON push_tokens(last_used_at)
WHERE is_active = true AND failure_count < 5;

-- Delivery tracking indexes
CREATE INDEX CONCURRENTLY idx_delivery_retry
ON notification_deliveries(next_retry_at)
WHERE status IN ('PENDING', 'RETRYING');

CREATE INDEX CONCURRENTLY idx_delivery_analytics
ON notification_deliveries(channel, status, created_at);

-- Webhook indexes
CREATE INDEX CONCURRENTLY idx_webhook_active
ON webhook_endpoints(organization_id)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_webhook_delivery_retry
ON webhook_deliveries(next_retry_at)
WHERE status = 'RETRYING';
```

## 12.11.4 Performance Targets

```typescript
const PERFORMANCE_TARGETS = {
  latency: {
    inAppDelivery: {
      p50: 50,
      p95: 200,
      p99: 500
    },
    pushDelivery: {
      p50: 100,
      p95: 500,
      p99: 1000
    },
    feedLoad: {
      p50: 30,
      p95: 100,
      p99: 200
    },
    unreadCount: {
      p50: 5,
      p95: 20,
      p99: 50
    },
    markRead: {
      p50: 20,
      p95: 50,
      p99: 100
    }
  },

  throughput: {
    eventsPerSecond: 10000,
    inAppDeliveriesPerSecond: 50000,
    pushDeliveriesPerSecond: 10000,
    emailDeliveriesPerHour: 100000,
    webhookDeliveriesPerSecond: 1000
  },

  reliability: {
    inAppDeliveryRate: 0.9999,
    pushDeliveryRate: 0.995,
    emailDeliveryRate: 0.99,
    webhookDeliveryRate: 0.99
  },

  storage: {
    notificationRetentionDays: 90,
    deliveryLogRetentionDays: 30,
    webhookDeliveryRetentionDays: 14
  }
}

export { PERFORMANCE_TARGETS }
```

## 12.11.5 Cleanup Jobs

```typescript
const CLEANUP_JOBS = {
  expiredNotifications: {
    schedule: "0 3 * * *",
    batchSize: 10000,
    description: "Delete notifications past expiry date"
  },

  oldReadNotifications: {
    schedule: "0 4 * * *",
    batchSize: 10000,
    retentionDays: 90,
    description: "Archive old read notifications"
  },

  stalePushTokens: {
    schedule: "0 5 * * 0",
    inactiveDays: 90,
    description: "Deactivate unused push tokens"
  },

  failedPushTokens: {
    schedule: "0 5 * * *",
    maxFailures: 5,
    description: "Deactivate tokens with too many failures"
  },

  oldDeliveryLogs: {
    schedule: "0 6 * * *",
    batchSize: 50000,
    retentionDays: 30,
    description: "Delete old delivery logs"
  },

  completedAggregations: {
    schedule: "0 * * * *",
    olderThanHours: 24,
    description: "Clean up delivered aggregations"
  },

  webhookDeliveryLogs: {
    schedule: "0 7 * * *",
    batchSize: 10000,
    retentionDays: 14,
    description: "Delete old webhook delivery logs"
  }
}

export { CLEANUP_JOBS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.12 NOTIFICATION SETTINGS UI
# ══════════════════════════════════════════════════════════════════════════════

## 12.12.1 Notification Settings Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION SETTINGS (/settings/notifications)              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Bildirim Ayarları                                                        │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Bildirimlerin nasıl ve ne zaman ulaşacağını buradan yönetin.             │ │
│  │                                                                           │ │
│  │  [Genel]  [Kategoriler]  [Sessiz Saatler]                                 │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  GENEL AYARLAR                                                            │ │
│  │  ─────────────                                                            │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Tüm Bildirimler                                            [ON]   │  │ │
│  │  │  Ana anahtar - kapatırsanız hiçbir bildirim almayacaksınız         │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Push Bildirimleri                                          [ON]   │  │ │
│  │  │  Telefon ve tarayıcı bildirimleri                                  │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  E-posta Bildirimleri                                       [ON]   │  │ │
│  │  │  ahmet@example.com adresine gönderilir                             │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  SMS Bildirimleri                                          [OFF]   │  │ │
│  │  │  Sadece kritik güvenlik uyarıları için                             │  │ │
│  │  │  Telefon: +90 5** *** **45                                         │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Uygulama İçi Bildirimler                                   [ON]   │  │ │
│  │  │  Uygulama içinde zil ikonunda görünen bildirimler                  │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 12.12.2 Category-Based Notification Settings

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION CATEGORIES TAB                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  [Genel]  [Kategoriler]  [Sessiz Saatler]                                 │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  KATEGORİ BAZLI AYARLAR                                                   │ │
│  │  ─────────────────────                                                    │ │
│  │                                                                           │ │
│  │  Her kategori için hangi kanallardan bildirim almak istediğinizi seçin.   │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  📊 İÇERİKLERİM                                                           │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Yeni oy/yanıt aldığımda                 [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☑️      ☐        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  İçeriğime yorum yapıldığında            [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☑️      ☑️        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Anketim/testim sona erdiğinde           [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☑️      ☑️        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Milestone'a ulaşıldığında (100, 1K...)  [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☑️      ☐        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  💬 YORUMLAR VE ETKİLEŞİMLER                                              │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Yorumuma yanıt verildiğinde             [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☑️      ☐        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Yorumum beğenildiğinde                  [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☐      ☐        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Bahsedildiğimde (@mention)              [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☑️      ☑️        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  👥 SOSYAL                                                                │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Yeni takipçi kazandığımda               [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☐      ☐        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Yeni mesaj aldığımda                    [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☑️      ☐        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Mesaj isteği aldığımda                  [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☑️      ☑️        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  🔔 SİSTEM                                                                │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Güvenlik uyarıları (yeni giriş, vb.)    [Push] [E-posta] [SMS]    │  │ │
│  │  │  🔒 Bu ayar değiştirilemez               ☑️      ☑️        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Abonelik ve fatura bildirimleri         [Push] [E-posta] [App]    │  │ │
│  │  │  🔒 Bu ayar değiştirilemez               ☑️      ☑️        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Hesap durumu değişiklikleri             [Push] [E-posta] [App]    │  │ │
│  │  │  (yasak, uyarı, vb.)                       ☑️      ☑️        ☑️      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Ürün güncellemeleri ve haberler         [Push] [E-posta] [App]    │  │ │
│  │  │                                            ☐      ☑️        ☐      │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 12.12.3 Quiet Hours Settings

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     QUIET HOURS TAB                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  [Genel]  [Kategoriler]  [Sessiz Saatler]                                 │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  SESSİZ SAATLER                                                           │ │
│  │  ─────────────                                                            │ │
│  │                                                                           │ │
│  │  Belirlediğiniz saatlerde push bildirimleri ve sesli uyarılar             │ │
│  │  devre dışı bırakılır. E-posta bildirimleri etkilenmez.                   │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Sessiz Saatleri Etkinleştir                                [ON]   │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  ZAMAN ARALIĞI                                                            │ │
│  │                                                                           │ │
│  │  Başlangıç                           Bitiş                                │ │
│  │  ┌────────────────────────┐          ┌────────────────────────┐           │ │
│  │  │  23:00             ▼   │          │  07:00             ▼   │           │ │
│  │  └────────────────────────┘          └────────────────────────┘           │ │
│  │                                                                           │ │
│  │  ℹ️ Sessiz saatler her gün 23:00 - 07:00 arasında aktif olacak           │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  GÜNLER                                                                   │ │
│  │                                                                           │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │ │
│  │  │ Pzt │ │ Sal │ │ Çar │ │ Per │ │ Cum │ │ Cmt │ │ Paz │                  │ │
│  │  │  ☑️  │ │  ☑️  │ │  ☑️  │ │  ☑️  │ │  ☑️  │ │  ☑️  │ │  ☑️  │                  │ │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                  │ │
│  │                                                                           │ │
│  │  [Tüm Günler]  [Hafta İçi]  [Hafta Sonu]                                  │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  İSTİSNALAR                                                               │ │
│  │                                                                           │ │
│  │  Sessiz saatlerde bile şu bildirimler gelir:                              │ │
│  │                                                                           │ │
│  │  ☑️ Güvenlik uyarıları (yeni cihaz girişi, şüpheli aktivite)              │ │
│  │  ☐ Takip ettiğim kişilerin canlı anketleri                                │ │
│  │  ☐ Organizasyon acil duyuruları                                           │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  SAAT DİLİMİ                                                              │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  Europe/Istanbul (UTC+3)                                       ▼   │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 12.12.4 Email Frequency Settings

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     EMAIL FREQUENCY SETTINGS                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  E-POSTA SIKLIĞI (Digest Ayarları)                                              │
│  ─────────────────────────────────                                              │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  E-posta Gönderim Sıklığı                                                 │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Etkileşim bildirimleri (yorumlar, beğeniler, takipler):                  │ │
│  │                                                                           │ │
│  │  ○ Anında - Her bildirimde ayrı e-posta                                   │ │
│  │  ● Günlük özet - Günde bir kez toplu e-posta (önerilen)                   │ │
│  │  ○ Haftalık özet - Haftada bir kez toplu e-posta                          │ │
│  │  ○ Kapalı - E-posta gönderme                                              │ │
│  │                                                                           │ │
│  │  Günlük özet gönderim saati:                                              │ │
│  │  ┌────────────────────────┐                                               │ │
│  │  │  09:00             ▼   │                                               │ │
│  │  └────────────────────────┘                                               │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  ⚠️ NOT: Güvenlik e-postaları ve kritik hesap bildirimleri her zaman      │ │
│  │     anında gönderilir.                                                    │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  E-POSTA ÖNİZLEME                                                               │
│  ────────────────                                                               │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  📧 Günlük Özet Önizleme                                                  │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  From: VoxPoll <noreply@voxpoll.com>                                      │ │
│  │  Subject: Günlük özet: 5 yeni etkileşim                                   │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Merhaba @ahmet_yilmaz!                                             │  │ │
│  │  │                                                                     │  │ │
│  │  │  Bugünkü etkileşimleriniz:                                          │  │ │
│  │  │                                                                     │  │ │
│  │  │  📊 Anketleriniz                                                    │  │ │
│  │  │  • "Favori kahvaltılık" 12 yeni oy aldı                             │  │ │
│  │  │  • "En iyi film türü" 3 yeni yorum aldı                             │  │ │
│  │  │                                                                     │  │ │
│  │  │  💬 Yorumlar                                                        │  │ │
│  │  │  • Yorumunuza 2 yanıt geldi                                         │  │ │
│  │  │  • 5 kişi yorumunuzu beğendi                                        │  │ │
│  │  │                                                                     │  │ │
│  │  │  👥 Sosyal                                                          │  │ │
│  │  │  • 3 yeni takipçi kazandınız                                        │  │ │
│  │  │                                                                     │  │ │
│  │  │  [Tümünü Gör]                                                       │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 12.12.5 Push Notification Management

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     PUSH NOTIFICATION MANAGEMENT                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  BROWSER PUSH PERMISSION FLOW                                                   │
│  ────────────────────────────                                                   │
│                                                                                 │
│  State 1: Not Asked                                                             │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  🔔 Push Bildirimlerini Etkinleştir                                       │ │
│  │                                                                           │ │
│  │  Anketlerinize gelen yanıtları ve mesajları anında öğrenmek için          │ │
│  │  push bildirimlerini etkinleştirin.                                       │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │              Bildirimleri Etkinleştir                              │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  [Şimdi Değil]                                                            │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  State 2: Blocked by Browser                                                    │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ⚠️ Push Bildirimleri Engellendi                                          │ │
│  │                                                                           │ │
│  │  Tarayıcınızda VoxPoll için bildirimler engelli.                          │ │
│  │  Etkinleştirmek için:                                                     │ │
│  │                                                                           │ │
│  │  1. Adres çubuğundaki 🔒 simgesine tıklayın                               │ │
│  │  2. "Site ayarları" veya "İzinler" seçin                                  │ │
│  │  3. Bildirimleri "İzin Ver" olarak değiştirin                             │ │
│  │  4. Sayfayı yenileyin                                                     │ │
│  │                                                                           │ │
│  │  [Sayfayı Yenile]                                                         │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  State 3: Enabled                                                               │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ✅ Push Bildirimleri Etkin                                               │ │
│  │                                                                           │ │
│  │  Bu cihazda push bildirimleri alacaksınız.                                │ │
│  │                                                                           │ │
│  │  [Test Bildirimi Gönder]                                                  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  REGISTERED DEVICES                                                             │
│  ──────────────────                                                             │ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Kayıtlı Cihazlar (3)                                                     │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  🖥️ Chrome - Windows                                 BU CİHAZ       │  │ │
│  │  │     Son aktivite: Şimdi                                             │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  📱 VoxPoll iOS - iPhone                         [Bildirimleri Kapat]│  │ │
│  │  │     Son aktivite: 2 saat önce                                       │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  🌐 Safari - macOS                               [Bildirimleri Kapat]│  │ │
│  │  │     Son aktivite: 1 gün önce                                        │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 12.12.6 Notification Settings Functions

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION SETTINGS FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"
import { db } from "@/lib/db"

const notificationChannelSchema = z.enum(["PUSH", "EMAIL", "SMS", "IN_APP"])

const notificationCategorySchema = z.enum([
  "CONTENT_VOTES",
  "CONTENT_COMMENTS",
  "CONTENT_ENDED",
  "CONTENT_MILESTONES",
  "COMMENT_REPLIES",
  "COMMENT_LIKES",
  "MENTIONS",
  "NEW_FOLLOWERS",
  "NEW_MESSAGES",
  "MESSAGE_REQUESTS",
  "SECURITY_ALERTS",
  "BILLING",
  "ACCOUNT_STATUS",
  "PRODUCT_UPDATES"
])

const notificationSettingsSchema = z.object({
  userId: z.string().cuid(),

  globalEnabled: z.boolean().default(true),

  channelsEnabled: z.object({
    push: z.boolean().default(true),
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    inApp: z.boolean().default(true)
  }),

  categorySettings: z.record(
    notificationCategorySchema,
    z.object({
      push: z.boolean(),
      email: z.boolean(),
      sms: z.boolean(),
      inApp: z.boolean()
    })
  ),

  quietHours: z.object({
    enabled: z.boolean().default(false),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    days: z.array(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])),
    timezone: z.string(),
    exceptions: z.object({
      securityAlerts: z.boolean().default(true),
      livePolls: z.boolean().default(false),
      orgUrgent: z.boolean().default(false)
    })
  }),

  emailFrequency: z.object({
    mode: z.enum(["INSTANT", "DAILY_DIGEST", "WEEKLY_DIGEST", "DISABLED"]),
    digestTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    weeklyDigestDay: z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]).optional()
  }),

  updatedAt: z.date()
})

type NotificationSettings = z.infer<typeof notificationSettingsSchema>

const DEFAULT_CATEGORY_SETTINGS: Record<string, { push: boolean; email: boolean; sms: boolean; inApp: boolean }> = {
  CONTENT_VOTES: { push: true, email: false, sms: false, inApp: true },
  CONTENT_COMMENTS: { push: true, email: true, sms: false, inApp: true },
  CONTENT_ENDED: { push: true, email: true, sms: false, inApp: true },
  CONTENT_MILESTONES: { push: true, email: false, sms: false, inApp: true },
  COMMENT_REPLIES: { push: true, email: false, sms: false, inApp: true },
  COMMENT_LIKES: { push: false, email: false, sms: false, inApp: true },
  MENTIONS: { push: true, email: true, sms: false, inApp: true },
  NEW_FOLLOWERS: { push: false, email: false, sms: false, inApp: true },
  NEW_MESSAGES: { push: true, email: false, sms: false, inApp: true },
  MESSAGE_REQUESTS: { push: true, email: true, sms: false, inApp: true },
  SECURITY_ALERTS: { push: true, email: true, sms: true, inApp: true },
  BILLING: { push: true, email: true, sms: false, inApp: true },
  ACCOUNT_STATUS: { push: true, email: true, sms: false, inApp: true },
  PRODUCT_UPDATES: { push: false, email: true, sms: false, inApp: false }
}

const LOCKED_CATEGORIES = ["SECURITY_ALERTS", "BILLING"]

async function getNotificationSettings(userId: string): Promise<NotificationSettings> {
  const settings = await db.notificationSettings.findUnique({
    where: { userId }
  })

  if (!settings) {
    return {
      userId,
      globalEnabled: true,
      channelsEnabled: { push: true, email: true, sms: false, inApp: true },
      categorySettings: DEFAULT_CATEGORY_SETTINGS,
      quietHours: {
        enabled: false,
        startTime: "23:00",
        endTime: "07:00",
        days: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        timezone: "Europe/Istanbul",
        exceptions: { securityAlerts: true, livePolls: false, orgUrgent: false }
      },
      emailFrequency: { mode: "DAILY_DIGEST", digestTime: "09:00" },
      updatedAt: new Date()
    }
  }

  return settings as NotificationSettings
}

async function updateNotificationSettings(
  userId: string,
  updates: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  if (updates.categorySettings) {
    for (const category of LOCKED_CATEGORIES) {
      if (updates.categorySettings[category]) {
        delete updates.categorySettings[category]
      }
    }
  }

  const updated = await db.notificationSettings.upsert({
    where: { userId },
    update: { ...updates, updatedAt: new Date() },
    create: {
      userId,
      ...updates,
      categorySettings: { ...DEFAULT_CATEGORY_SETTINGS, ...updates.categorySettings },
      updatedAt: new Date()
    }
  })

  return updated as NotificationSettings
}

async function updateCategoryChannel(
  userId: string,
  category: string,
  channel: "push" | "email" | "sms" | "inApp",
  enabled: boolean
): Promise<void> {
  if (LOCKED_CATEGORIES.includes(category)) {
    throw new Error(`Category ${category} settings cannot be modified`)
  }

  const settings = await getNotificationSettings(userId)
  const categorySettings = settings.categorySettings[category] || DEFAULT_CATEGORY_SETTINGS[category]

  categorySettings[channel] = enabled

  await db.notificationSettings.upsert({
    where: { userId },
    update: {
      categorySettings: {
        ...settings.categorySettings,
        [category]: categorySettings
      },
      updatedAt: new Date()
    },
    create: {
      userId,
      categorySettings: {
        ...DEFAULT_CATEGORY_SETTINGS,
        [category]: categorySettings
      },
      updatedAt: new Date()
    }
  })
}

function shouldSendNotification(
  settings: NotificationSettings,
  category: string,
  channel: "push" | "email" | "sms" | "inApp"
): boolean {
  if (!settings.globalEnabled) return false

  if (!settings.channelsEnabled[channel]) return false

  const categorySettings = settings.categorySettings[category]
  if (!categorySettings) return DEFAULT_CATEGORY_SETTINGS[category]?.[channel] ?? false

  if (!categorySettings[channel]) return false

  if (channel === "push" && settings.quietHours.enabled) {
    if (isInQuietHours(settings.quietHours)) {
      if (LOCKED_CATEGORIES.includes(category) && settings.quietHours.exceptions.securityAlerts) {
        return true
      }
      return false
    }
  }

  return true
}

function isInQuietHours(quietHours: NotificationSettings["quietHours"]): boolean {
  const now = new Date()
  const userTime = new Date(now.toLocaleString("en-US", { timeZone: quietHours.timezone }))

  const dayOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][userTime.getDay()]
  if (!quietHours.days.includes(dayOfWeek as any)) return false

  const currentTime = userTime.getHours() * 60 + userTime.getMinutes()
  const [startHour, startMin] = quietHours.startTime.split(":").map(Number)
  const [endHour, endMin] = quietHours.endTime.split(":").map(Number)

  const startTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin

  if (startTime < endTime) {
    return currentTime >= startTime && currentTime < endTime
  } else {
    return currentTime >= startTime || currentTime < endTime
  }
}

export {
  notificationSettingsSchema,
  getNotificationSettings,
  updateNotificationSettings,
  updateCategoryChannel,
  shouldSendNotification,
  isInQuietHours,
  DEFAULT_CATEGORY_SETTINGS,
  LOCKED_CATEGORIES
}
export type { NotificationSettings }
```


# ══════════════════════════════════════════════════════════════════════════════
# 12.9 NOTIFICATION AGGREGATION SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 12.9.1 Aggregation Rules

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION AGGREGATION CONFIGURATION
// Prevents notification spam by grouping similar events
// ══════════════════════════════════════════════════════════════════════════════

interface AggregationConfig {
  // Time window for grouping notifications (milliseconds)
  windowDuration: number
  // Maximum actors to show in grouped notification
  maxActors: number
  // Minimum events to trigger aggregation
  minEventsToAggregate: number
  // Whether to show individual notifications until threshold
  showIndividualUntilThreshold: boolean
}

const NOTIFICATION_AGGREGATION_CONFIG: Record<string, AggregationConfig> = {
  // Like/Vote notifications - aggregate quickly
  POLL_VOTE: {
    windowDuration: 5 * 60 * 1000,    // 5 minutes
    maxActors: 3,                      // "Ali, Ayşe ve 15 diğer kişi"
    minEventsToAggregate: 3,
    showIndividualUntilThreshold: true
  },

  COMMENT_LIKE: {
    windowDuration: 10 * 60 * 1000,   // 10 minutes
    maxActors: 3,
    minEventsToAggregate: 3,
    showIndividualUntilThreshold: true
  },

  // Follow notifications - longer window
  NEW_FOLLOWER: {
    windowDuration: 60 * 60 * 1000,   // 1 hour
    maxActors: 5,
    minEventsToAggregate: 5,
    showIndividualUntilThreshold: true
  },

  // Comment notifications - moderate aggregation
  NEW_COMMENT: {
    windowDuration: 15 * 60 * 1000,   // 15 minutes
    maxActors: 3,
    minEventsToAggregate: 3,
    showIndividualUntilThreshold: true
  },

  COMMENT_REPLY: {
    windowDuration: 10 * 60 * 1000,   // 10 minutes
    maxActors: 2,
    minEventsToAggregate: 2,
    showIndividualUntilThreshold: false  // Always show replies
  },

  // Mention notifications - never aggregate
  MENTIONED: {
    windowDuration: 0,                // No aggregation
    maxActors: 1,
    minEventsToAggregate: 999,        // Effectively disabled
    showIndividualUntilThreshold: true
  },

  // Survey completion - daily digest
  SURVEY_RESPONSE: {
    windowDuration: 24 * 60 * 60 * 1000,  // 24 hours
    maxActors: 0,                          // Just show count
    minEventsToAggregate: 10,
    showIndividualUntilThreshold: false    // Always aggregate
  },

  // System notifications - never aggregate
  SYSTEM: {
    windowDuration: 0,
    maxActors: 1,
    minEventsToAggregate: 999,
    showIndividualUntilThreshold: true
  }
}

// Default for any notification type not explicitly configured
const DEFAULT_AGGREGATION_CONFIG: AggregationConfig = {
  windowDuration: 30 * 60 * 1000,     // 30 minutes
  maxActors: 3,
  minEventsToAggregate: 5,
  showIndividualUntilThreshold: true
}
```


## 12.9.2 Aggregation Data Model

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// AGGREGATED NOTIFICATION STRUCTURE
// ══════════════════════════════════════════════════════════════════════════════

interface AggregatedNotification {
  id: string
  userId: string                      // Recipient
  type: NotificationType
  aggregationKey: string              // e.g., "POLL_VOTE:poll_123"

  // Aggregation metadata
  eventCount: number                  // Total events in this group
  actors: Array<{
    id: string
    displayName: string
    avatar: string | null
  }>                                  // First N actors
  additionalActorCount: number        // eventCount - actors.length

  // Target content
  targetType: "POLL" | "SURVEY" | "TEST" | "COMMENT" | "USER"
  targetId: string
  targetTitle: string | null          // For display

  // Timestamps
  firstEventAt: Date
  lastEventAt: Date
  windowExpiresAt: Date               // When to start new aggregation

  // Display
  isRead: boolean
  readAt: Date | null
}

// Database model for aggregation tracking
const AggregationWindow = `
model NotificationAggregation {
  id              String    @id @default(cuid())
  userId          String
  aggregationKey  String    // "TYPE:targetId"

  // Window tracking
  windowStart     DateTime
  windowEnd       DateTime
  eventCount      Int       @default(0)

  // Actors (stored as JSON array of user IDs)
  actorIds        Json      // String[]

  // Target reference
  targetType      String
  targetId        String

  // State
  notificationId  String?   // Created notification ID
  isFinalized     Boolean   @default(false)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([userId, aggregationKey, windowStart])
  @@index([userId, windowEnd])
  @@index([aggregationKey])
}
`
```


## 12.9.3 Aggregation Service

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION AGGREGATION SERVICE
// ══════════════════════════════════════════════════════════════════════════════

class NotificationAggregationService {
  constructor(
    private db: DrizzleClient,
    private redis: Redis
  ) {}

  async processEvent(event: NotificationEvent): Promise<void> {
    const config = NOTIFICATION_AGGREGATION_CONFIG[event.type] || DEFAULT_AGGREGATION_CONFIG

    // No aggregation for this type
    if (config.windowDuration === 0) {
      await this.createIndividualNotification(event)
      return
    }

    const aggregationKey = this.buildAggregationKey(event)
    const now = new Date()

    // Find or create aggregation window
    let window = await this.findActiveWindow(event.userId, aggregationKey, now)

    if (!window) {
      // Start new window
      window = await this.createWindow(event, config, now)

      // If showing individual until threshold, create notification immediately
      if (config.showIndividualUntilThreshold) {
        await this.createIndividualNotification(event)
      }
    } else {
      // Add to existing window
      await this.addToWindow(window, event, config)
    }
  }

  private buildAggregationKey(event: NotificationEvent): string {
    // Group by: notification type + target
    return `${event.type}:${event.targetId}`
  }

  private async findActiveWindow(
    userId: string,
    aggregationKey: string,
    now: Date
  ): Promise<NotificationAggregation | null> {
    return this.db.notificationAggregation.findFirst({
      where: {
        userId,
        aggregationKey,
        windowEnd: { gt: now },
        isFinalized: false
      }
    })
  }

  private async createWindow(
    event: NotificationEvent,
    config: AggregationConfig,
    now: Date
  ): Promise<NotificationAggregation> {
    const windowEnd = new Date(now.getTime() + config.windowDuration)

    return this.db.notificationAggregation.create({
      data: {
        userId: event.userId,
        aggregationKey: this.buildAggregationKey(event),
        windowStart: now,
        windowEnd,
        eventCount: 1,
        actorIds: [event.actorId],
        targetType: event.targetType,
        targetId: event.targetId
      }
    })
  }

  private async addToWindow(
    window: NotificationAggregation,
    event: NotificationEvent,
    config: AggregationConfig
  ): Promise<void> {
    const actorIds = window.actorIds as string[]

    // Add actor if not already present (up to max)
    if (!actorIds.includes(event.actorId) && actorIds.length < config.maxActors) {
      actorIds.push(event.actorId)
    }

    const newCount = window.eventCount + 1

    await this.db.notificationAggregation.update({
      where: { id: window.id },
      data: {
        eventCount: newCount,
        actorIds
      }
    })

    // Check if we should create/update aggregated notification
    if (newCount >= config.minEventsToAggregate) {
      await this.createOrUpdateAggregatedNotification(window, newCount, actorIds, config)
    }
  }

  private async createOrUpdateAggregatedNotification(
    window: NotificationAggregation,
    eventCount: number,
    actorIds: string[],
    config: AggregationConfig
  ): Promise<void> {
    // Fetch actor details
    const actors = await this.db.user.findMany({
      where: { id: { in: actorIds.slice(0, config.maxActors) } },
      select: { id: true, displayName: true, avatar: true }
    })

    const additionalCount = eventCount - actors.length

    // Build aggregated message
    const message = this.buildAggregatedMessage(
      window.targetType,
      actors,
      additionalCount,
      eventCount
    )

    if (window.notificationId) {
      // Update existing notification
      await this.db.notification.update({
        where: { id: window.notificationId },
        data: {
          message,
          metadata: {
            eventCount,
            actors: actors.map(a => ({ id: a.id, displayName: a.displayName })),
            additionalActorCount: additionalCount
          },
          updatedAt: new Date()
        }
      })
    } else {
      // Create new aggregated notification and delete individuals
      const notification = await this.db.notification.create({
        data: {
          userId: window.userId,
          type: window.targetType as NotificationType,
          message,
          targetType: window.targetType,
          targetId: window.targetId,
          isAggregated: true,
          metadata: {
            eventCount,
            actors: actors.map(a => ({ id: a.id, displayName: a.displayName })),
            additionalActorCount: additionalCount
          }
        }
      })

      // Update window with notification ID
      await this.db.notificationAggregation.update({
        where: { id: window.id },
        data: { notificationId: notification.id }
      })

      // Remove individual notifications that were created before threshold
      if (config.showIndividualUntilThreshold) {
        await this.deleteIndividualNotifications(window)
      }
    }
  }

  private buildAggregatedMessage(
    targetType: string,
    actors: Array<{ displayName: string }>,
    additionalCount: number,
    totalCount: number
  ): string {
    const actorNames = actors.map(a => a.displayName)

    if (additionalCount === 0) {
      // "Ali, Ayşe ve Mehmet"
      if (actorNames.length === 1) return actorNames[0]
      if (actorNames.length === 2) return `${actorNames[0]} ve ${actorNames[1]}`
      const last = actorNames.pop()
      return `${actorNames.join(", ")} ve ${last}`
    } else {
      // "Ali, Ayşe ve 15 diğer kişi"
      if (actorNames.length === 1) {
        return `${actorNames[0]} ve ${additionalCount} diğer kişi`
      }
      return `${actorNames.join(", ")} ve ${additionalCount} diğer kişi`
    }
  }

  private async deleteIndividualNotifications(window: NotificationAggregation): Promise<void> {
    await this.db.notification.deleteMany({
      where: {
        userId: window.userId,
        targetId: window.targetId,
        isAggregated: false,
        createdAt: {
          gte: window.windowStart,
          lte: window.windowEnd
        }
      }
    })
  }

  private async createIndividualNotification(event: NotificationEvent): Promise<void> {
    await this.db.notification.create({
      data: {
        userId: event.userId,
        type: event.type,
        actorId: event.actorId,
        targetType: event.targetType,
        targetId: event.targetId,
        message: event.message,
        isAggregated: false
      }
    })
  }
}

// Background job: Finalize expired windows
async function finalizeExpiredAggregations(): Promise<void> {
  const now = new Date()

  const expiredWindows = await db.notificationAggregation.findMany({
    where: {
      windowEnd: { lt: now },
      isFinalized: false
    }
  })

  for (const window of expiredWindows) {
    await db.notificationAggregation.update({
      where: { id: window.id },
      data: { isFinalized: true }
    })
  }
}

export {
  NotificationAggregationService,
  NOTIFICATION_AGGREGATION_CONFIG,
  DEFAULT_AGGREGATION_CONFIG,
  finalizeExpiredAggregations
}
```


## 12.9.4 Aggregation Display Examples

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  AGGREGATED NOTIFICATION EXAMPLES                                               │
│  ════════════════════════════════                                               │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  POLL VOTES (3+ in 5 min window)                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 👥 Ali, Ayşe ve 47 diğer kişi anketine oy verdi                        │   │
│  │    "En sevdiğiniz kahve türü?"                           5 dakika önce │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  NEW FOLLOWERS (5+ in 1 hour window)                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 👥 Mehmet, Zeynep, Emre ve 12 diğer kişi seni takip etti               │   │
│  │                                                          30 dakika önce │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  COMMENTS (3+ in 15 min window)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 💬 Selin, Can ve 8 diğer kişi yorumuna yorum yaptı                     │   │
│  │    "TypeScript kesinlikle daha iyi..."                    2 saat önce  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  SURVEY RESPONSES (Daily digest)                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 Anketine bugün 156 yeni yanıt geldi                                 │   │
│  │    "Çalışan Memnuniyeti Araştırması 2026"                    Bugün     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  NON-AGGREGATED (Mentions - always individual)                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 📣 @ahmet_y seni bir yorumda etiketledi                                │   │
│  │    "Bu konuda @senin_username ne düşünüyor?"             10 dakika önce │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 12.13 NOTIFICATION DEDUPLICATION SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 12.13.1 Deduplication Configuration

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION DEDUPLICATION SYSTEM (P-046)
// Prevents duplicate notifications from overwhelming users
// ══════════════════════════════════════════════════════════════════════════════

const NOTIFICATION_DEDUP_CONFIG = {
  // ────────────────────────────────────────────────────────────────────────────
  // DEDUPLICATION WINDOWS
  // ────────────────────────────────────────────────────────────────────────────
  windows: {
    // Same notification type for same content
    SAME_CONTENT: {
      windowMs: 60 * 60 * 1000,  // 1 hour
      strategy: "FIRST_ONLY"     // Only send first, ignore rest
    },

    // Same notification type from same user
    SAME_SOURCE: {
      windowMs: 5 * 60 * 1000,   // 5 minutes
      strategy: "AGGREGATE"      // Combine into one
    },

    // Global per-user limit
    USER_GLOBAL: {
      maxPerHour: 50,
      maxPerDay: 200,
      strategy: "PRIORITY_QUEUE"  // Keep high priority, drop low
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // NOTIFICATION TYPE SPECIFIC RULES
  // ────────────────────────────────────────────────────────────────────────────
  rules: {
    // LIKE notifications - aggregate multiple likes
    CONTENT_LIKED: {
      windowMs: 15 * 60 * 1000,  // 15 minutes
      strategy: "AGGREGATE",
      aggregateTemplate: "{count} people liked your {contentType}",
      maxAggregate: 100,
      showAfter: 1  // Show after first like, then aggregate
    },

    // COMMENT notifications - aggregate per content
    NEW_COMMENT: {
      windowMs: 30 * 60 * 1000,  // 30 minutes
      strategy: "AGGREGATE",
      aggregateTemplate: "{count} new comments on your {contentType}",
      maxAggregate: 50,
      showAfter: 1
    },

    // REPLY notifications - show each (higher priority)
    COMMENT_REPLY: {
      windowMs: 0,  // No dedup
      strategy: "NONE",
      alwaysDeliver: true
    },

    // MENTION notifications - show each (highest priority)
    MENTIONED: {
      windowMs: 0,
      strategy: "NONE",
      alwaysDeliver: true
    },

    // FOLLOW notifications - aggregate
    NEW_FOLLOWER: {
      windowMs: 60 * 60 * 1000,  // 1 hour
      strategy: "AGGREGATE",
      aggregateTemplate: "{count} new followers",
      maxAggregate: 100,
      showAfter: 3  // Aggregate after 3 followers
    },

    // VOTE COUNT updates - rate limit
    VOTE_MILESTONE: {
      windowMs: 24 * 60 * 60 * 1000,  // 24 hours per milestone
      strategy: "MILESTONE_ONLY",
      milestones: [10, 50, 100, 500, 1000, 5000, 10000]
    },

    // POLL ENDED - no dedup (critical)
    POLL_ENDED: {
      windowMs: 0,
      strategy: "NONE",
      alwaysDeliver: true
    },

    // DM notifications - aggregate per conversation
    NEW_DM: {
      windowMs: 5 * 60 * 1000,  // 5 minutes
      strategy: "AGGREGATE_PER_CONVERSATION",
      aggregateTemplate: "{count} new messages from {senderName}",
      maxAggregate: 20
    },

    // SYSTEM notifications - no dedup
    SYSTEM_ANNOUNCEMENT: {
      windowMs: 0,
      strategy: "NONE",
      alwaysDeliver: true
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // DEDUPLICATION KEY GENERATION
  // ────────────────────────────────────────────────────────────────────────────
  keyGeneration: {
    // Pattern: {userId}:{notificationType}:{contentId}:{sourceId}
    pattern: "{userId}:{type}:{contentId}:{sourceId}",

    // Hash function for key
    hashFunction: "sha256",

    // Key expiration matches window
    keyExpirationMs: 24 * 60 * 60 * 1000  // 24 hours max
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// DEDUPLICATION STRATEGIES
// ══════════════════════════════════════════════════════════════════════════════

type DeduplicationStrategy =
  | "NONE"              // No deduplication, always deliver
  | "FIRST_ONLY"        // Only deliver first, ignore subsequent
  | "LAST_ONLY"         // Deliver last, replace previous
  | "AGGREGATE"         // Combine into single notification
  | "AGGREGATE_PER_CONVERSATION"  // Special for DMs
  | "MILESTONE_ONLY"    // Only at specific milestones
  | "PRIORITY_QUEUE"    // Keep high priority, drop low

interface DeduplicationResult {
  action: "DELIVER" | "AGGREGATE" | "DROP" | "QUEUE"
  aggregatedCount?: number
  aggregatedNotifications?: string[]
  reason?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// DEDUPLICATION SERVICE
// ══════════════════════════════════════════════════════════════════════════════

class NotificationDeduplicationService {
  private redis: Redis

  constructor(redis: Redis) {
    this.redis = redis
  }

  async shouldDeliver(notification: {
    type: string
    userId: string
    contentId?: string
    sourceId?: string
  }): Promise<DeduplicationResult> {
    const rule = NOTIFICATION_DEDUP_CONFIG.rules[notification.type as keyof typeof NOTIFICATION_DEDUP_CONFIG.rules]

    if (!rule || rule.strategy === "NONE") {
      return { action: "DELIVER" }
    }

    const dedupKey = this.generateKey(notification)
    const windowMs = rule.windowMs

    switch (rule.strategy) {
      case "FIRST_ONLY":
        return await this.handleFirstOnly(dedupKey, windowMs)

      case "AGGREGATE":
        return await this.handleAggregate(dedupKey, windowMs, rule)

      case "MILESTONE_ONLY":
        return await this.handleMilestone(notification, rule.milestones)

      default:
        return { action: "DELIVER" }
    }
  }

  private generateKey(notification: {
    type: string
    userId: string
    contentId?: string
    sourceId?: string
  }): string {
    return `notif:dedup:${notification.userId}:${notification.type}:${notification.contentId || "none"}`
  }

  private async handleFirstOnly(key: string, windowMs: number): Promise<DeduplicationResult> {
    const exists = await this.redis.exists(key)

    if (exists) {
      return { action: "DROP", reason: "Duplicate within window" }
    }

    await this.redis.setex(key, Math.ceil(windowMs / 1000), "1")
    return { action: "DELIVER" }
  }

  private async handleAggregate(
    key: string,
    windowMs: number,
    rule: { showAfter?: number; aggregateTemplate?: string }
  ): Promise<DeduplicationResult> {
    const countKey = `${key}:count`
    const count = await this.redis.incr(countKey)

    if (count === 1) {
      await this.redis.expire(countKey, Math.ceil(windowMs / 1000))
    }

    const showAfter = rule.showAfter || 1

    if (count <= showAfter) {
      return { action: "DELIVER" }
    }

    // Update aggregated notification
    return {
      action: "AGGREGATE",
      aggregatedCount: count,
      reason: `Aggregating ${count} notifications`
    }
  }

  private async handleMilestone(
    notification: { userId: string; contentId?: string },
    milestones: number[]
  ): Promise<DeduplicationResult> {
    // Get current count (e.g., vote count)
    // Only deliver if count matches a milestone
    // This is checked by the caller
    return { action: "DELIVER" }
  }

  // Flush aggregated notifications (called by cron job)
  async flushAggregatedNotifications(): Promise<void> {
    // Find all aggregation keys
    // Create single notification for each
    // Delete keys
  }
}

export { NotificationDeduplicationService, NOTIFICATION_DEDUP_CONFIG }
export type { DeduplicationStrategy, DeduplicationResult }
```

## 12.13.2 Aggregation Examples

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION AGGREGATION EXAMPLES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * AGGREGATION FLOW
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ Time   │ Event                    │ Action                                 │
 * ├────────┼──────────────────────────┼────────────────────────────────────────┤
 * │ 10:00  │ User A likes poll        │ DELIVER: "User A liked your poll"     │
 * │ 10:02  │ User B likes poll        │ AGGREGATE (count=2)                   │
 * │ 10:05  │ User C likes poll        │ AGGREGATE (count=3)                   │
 * │ 10:08  │ User D likes poll        │ AGGREGATE (count=4)                   │
 * │ 10:15  │ Flush timer              │ DELIVER: "4 people liked your poll"   │
 * │ 10:20  │ User E likes poll        │ DELIVER: "User E liked your poll"     │
 * │        │ (new window)             │ (first in new window)                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

const AGGREGATION_TEMPLATES = {
  // Likes
  CONTENT_LIKED: {
    single: "{actor} liked your {contentType}",
    aggregate_2: "{actor1} and {actor2} liked your {contentType}",
    aggregate_3: "{actor1}, {actor2}, and 1 other liked your {contentType}",
    aggregate_many: "{actor1}, {actor2}, and {remainingCount} others liked your {contentType}"
  },

  // Comments
  NEW_COMMENT: {
    single: "{actor} commented on your {contentType}",
    aggregate_2: "{actor1} and {actor2} commented on your {contentType}",
    aggregate_many: "{count} new comments on your {contentType}"
  },

  // Followers
  NEW_FOLLOWER: {
    single: "{actor} started following you",
    aggregate_2: "{actor1} and {actor2} started following you",
    aggregate_3: "{actor1}, {actor2}, and 1 other started following you",
    aggregate_many: "{count} new followers"
  },

  // DMs (per conversation)
  NEW_DM: {
    single: "New message from {actor}",
    aggregate: "{count} new messages from {actor}"
  },

  // Votes
  VOTE_MILESTONE: {
    milestone_10: "Your {contentType} reached 10 votes!",
    milestone_50: "Your {contentType} reached 50 votes! 🎉",
    milestone_100: "Your {contentType} reached 100 votes! 🔥",
    milestone_1000: "Your {contentType} reached 1,000 votes! 🚀"
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// DEDUPLICATION REDIS SCHEMA
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Redis Key Structure:
 *
 * notif:dedup:{userId}:{type}:{contentId}          = "1" (exists flag)
 * notif:dedup:{userId}:{type}:{contentId}:count    = 5  (aggregation count)
 * notif:dedup:{userId}:{type}:{contentId}:actors   = ["user1", "user2", ...] (for template)
 * notif:dedup:{userId}:daily                       = 45 (daily count)
 * notif:dedup:{userId}:hourly                      = 12 (hourly count)
 */

const REDIS_KEY_PATTERNS = {
  existsFlag: "notif:dedup:{userId}:{type}:{contentId}",
  aggregateCount: "notif:dedup:{userId}:{type}:{contentId}:count",
  aggregateActors: "notif:dedup:{userId}:{type}:{contentId}:actors",
  dailyCount: "notif:dedup:{userId}:daily",
  hourlyCount: "notif:dedup:{userId}:hourly"
}
```


# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 12 - NOTIFICATION SYSTEM
# ══════════════════════════════════════════════════════════════════════════════
