# ═══════════════════════════════════════════════════════════════════════════════
# FEATURES - Notification System
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-019.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# NOTIFICATION TYPES
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
type NotificationType =
  // Content-related
  | "POLL_ENDED"                 // A poll you created/participated in has ended
  | "SURVEY_ENDED"               // A survey you created/participated in has ended
  | "TEST_RESULT_READY"          // Your test result is available
  | "CONTENT_MILESTONE"          // Your content reached a milestone (100, 500, 1000 participants)
  | "NEW_CONTENT_FROM_FOLLOWING" // Someone you follow posted new content

  // Social
  | "NEW_FOLLOWER"               // Someone followed you
  | "NEW_FRIEND"                 // Mutual follow established (you're now friends)
  | "MENTION_IN_COMMENT"         // Someone mentioned you in a comment
  | "REPLY_TO_COMMENT"           // Someone replied to your comment
  | "COMMENT_UPVOTED"            // Your comment was upvoted
  | "COMMENT_HEARTED"            // Creator hearted your comment

  // Direct Messages
  | "NEW_DM"                     // You received a new direct message
  | "DM_REQUEST"                 // DM request from non-friend (if enabled)

  // Organization
  | "ORG_INVITE"                 // You were invited to join an organization
  | "ORG_ROLE_CHANGED"           // Your role in an organization was changed
  | "SURVEY_ASSIGNED"            // A survey was assigned to you

  // System
  | "ACCOUNT_VERIFICATION"       // Verification level updated
  | "SUBSCRIPTION_REMINDER"      // Subscription expiring soon
  | "SUBSCRIPTION_CHANGED"       // Subscription tier changed
  | "SECURITY_ALERT"             // Suspicious login or security issue
```



# ═══════════════════════════════════════════════════════════════════════════════
# NOTIFICATION CHANNELS
# ═══════════════════════════════════════════════════════════════════════════════

| Channel | Description | When Used |
|---------|-------------|-----------|
| In-App | Bell icon + notification drawer | All notifications |
| Push | Mobile/Web push notifications | Time-sensitive, user-enabled |
| Email | Email notifications | Important events, digests |
| SMS | Text messages | Critical security alerts only |


## Channel Priority by Notification Type

```typescript
const NOTIFICATION_CHANNEL_CONFIG: Record<NotificationType, {
  inApp: boolean
  push: boolean
  email: boolean
  sms: boolean
  defaultEnabled: boolean
}> = {
  // Content-related
  POLL_ENDED: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },
  SURVEY_ENDED: { inApp: true, push: true, email: true, sms: false, defaultEnabled: true },
  TEST_RESULT_READY: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },
  CONTENT_MILESTONE: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },
  NEW_CONTENT_FROM_FOLLOWING: { inApp: true, push: false, email: false, sms: false, defaultEnabled: true },

  // Social
  NEW_FOLLOWER: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },
  NEW_FRIEND: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },
  MENTION_IN_COMMENT: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },
  REPLY_TO_COMMENT: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },
  COMMENT_UPVOTED: { inApp: true, push: false, email: false, sms: false, defaultEnabled: false },
  COMMENT_HEARTED: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },

  // Direct Messages
  NEW_DM: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },
  DM_REQUEST: { inApp: true, push: true, email: false, sms: false, defaultEnabled: true },

  // Organization
  ORG_INVITE: { inApp: true, push: true, email: true, sms: false, defaultEnabled: true },
  ORG_ROLE_CHANGED: { inApp: true, push: true, email: true, sms: false, defaultEnabled: true },
  SURVEY_ASSIGNED: { inApp: true, push: true, email: true, sms: false, defaultEnabled: true },

  // System
  ACCOUNT_VERIFICATION: { inApp: true, push: true, email: true, sms: false, defaultEnabled: true },
  SUBSCRIPTION_REMINDER: { inApp: true, push: true, email: true, sms: false, defaultEnabled: true },
  SUBSCRIPTION_CHANGED: { inApp: true, push: true, email: true, sms: false, defaultEnabled: true },
  SECURITY_ALERT: { inApp: true, push: true, email: true, sms: true, defaultEnabled: true }
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# NOTIFICATION DATA MODEL
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface Notification {
  id: string
  userId: string
  type: NotificationType

  title: string
  body: string
  imageUrl: string | null

  data: {
    contentId: string | null
    contentType: "POLL" | "SURVEY" | "TEST" | null
    actorId: string | null
    actorUsername: string | null
    actorAvatarUrl: string | null
    deepLink: string | null
    metadata: Record<string, unknown>
  }

  channels: {
    inApp: { sent: boolean, readAt: Date | null }
    push: { sent: boolean, clickedAt: Date | null } | null
    email: { sent: boolean, openedAt: Date | null } | null
  }

  status: "UNREAD" | "READ" | "ARCHIVED"
  createdAt: Date
  expiresAt: Date | null
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# USER NOTIFICATION PREFERENCES
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface NotificationPreferences {
  userId: string

  // Global toggles
  globalEnabled: boolean
  pushEnabled: boolean
  emailEnabled: boolean
  doNotDisturbStart: number | null    // Hour (0-23)
  doNotDisturbEnd: number | null      // Hour (0-23)

  // Per-type preferences
  typePreferences: Record<NotificationType, {
    enabled: boolean
    channels: {
      inApp: boolean
      push: boolean
      email: boolean
    }
  }>

  // Email digest
  emailDigest: {
    enabled: boolean
    frequency: "DAILY" | "WEEKLY" | "NEVER"
    dayOfWeek: number | null          // 0-6 for weekly
    hourOfDay: number                 // 0-23
  }

  // Quiet hours
  quietHours: {
    enabled: boolean
    start: string                     // "22:00"
    end: string                       // "08:00"
    timezone: string                  // "Europe/Istanbul"
  }
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# NOTIFICATION UI
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION DRAWER                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [Bell Icon with badge: 5]                                                      │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  NOTIFICATIONS                                    [Mark all as read]    │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  TODAY                                                                  │   │
│  │  ─────                                                                  │   │
│  │  [Avatar] @jane_doe followed you                          2 min ago    │   │
│  │  [Poll icon] Your poll reached 1,000 votes!               15 min ago   │   │
│  │  [Avatar] @tech_guru mentioned you in a comment           1 hour ago   │   │
│  │                                                                         │   │
│  │  YESTERDAY                                                              │   │
│  │  ──────────                                                             │   │
│  │  [Test icon] Test result ready: "Which Developer Are You?" 23 hours    │   │
│  │  [Avatar] @coding_master replied to your comment          1 day ago    │   │
│  │                                                                         │   │
│  │  EARLIER                                                                │   │
│  │  ────────                                                               │   │
│  │  [Org icon] You were invited to join TechCorp             3 days ago   │   │
│  │  [Poll icon] Poll ended: "Best Framework 2025"            5 days ago   │   │
│  │                                                                         │   │
│  │  [See all notifications]                                               │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# NOTIFICATION GROUPING
# ═══════════════════════════════════════════════════════════════════════════════

Similar notifications are grouped to prevent spam:

| Notification Type | Grouping Rule |
|-------------------|---------------|
| NEW_FOLLOWER | "X and Y others followed you" (group by time) |
| COMMENT_UPVOTED | "Your comment received 10 upvotes" (aggregate count) |
| MENTION_IN_COMMENT | Group by content (same poll/test) |
| NEW_CONTENT_FROM_FOLLOWING | Show individual items |
| CONTENT_MILESTONE | Show each milestone separately |


## Grouping Example

Instead of:
- @user1 followed you
- @user2 followed you
- @user3 followed you
- @user4 followed you
- @user5 followed you

Show:
- @user1 and 4 others followed you



# ═══════════════════════════════════════════════════════════════════════════════
# PUSH NOTIFICATION FORMAT
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface PushNotificationPayload {
  title: string               // "Your poll ended!"
  body: string                // "2,341 people voted. See the results."
  icon: string                // App icon or content thumbnail
  badge: number               // Unread count
  data: {
    notificationId: string
    type: NotificationType
    deepLink: string          // "voxpoll://poll/abc123/results"
  }
  actions: PushAction[]
}

interface PushAction {
  action: string              // "view_results", "dismiss"
  title: string               // "View Results"
  icon: string | null
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# EMAIL TEMPLATES
# ═══════════════════════════════════════════════════════════════════════════════

| Template | Subject | When Sent |
|----------|---------|-----------|
| poll_ended | "Your poll has ended - See the results!" | Poll closes |
| survey_ended | "Survey completed - View your responses" | Survey closes |
| org_invite | "You're invited to join [Org Name]" | Org invitation |
| security_alert | "Security Alert: New login detected" | Suspicious activity |
| weekly_digest | "Your VoxPoll Weekly: [X] new followers, [Y] votes" | Weekly summary |
| subscription_expiring | "Your Premium subscription expires in 3 days" | 3 days before expiry |
