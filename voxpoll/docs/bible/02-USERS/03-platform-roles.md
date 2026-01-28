# ═══════════════════════════════════════════════════════════════════════════════
# USERS - Platform Roles (Admin, Moderator, System)
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-005.md (sections 5.6, 5.8)
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# PLATFORM-LEVEL ROLES
# ═══════════════════════════════════════════════════════════════════════════════

Platform roles are separate from organization roles and grant special privileges
across the entire VoxPoll platform.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       PLATFORM ROLE HIERARCHY                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                    ┌────────────────────────────┐                               │
│                    │      SUPER_ADMIN           │                               │
│                    │  Full platform control     │                               │
│                    └─────────────┬──────────────┘                               │
│                                  │                                              │
│              ┌───────────────────┼───────────────────┐                          │
│              │                   │                   │                          │
│    ┌─────────┴─────────┐ ┌───────┴───────┐ ┌────────┴────────┐                 │
│    │    PLATFORM_ADMIN │ │    SUPPORT    │ │    MODERATOR    │                 │
│    │  Manage orgs/users│ │  User issues  │ │  Content review │                 │
│    └───────────────────┘ └───────────────┘ └─────────────────┘                 │
│                                                                                 │
│                         ┌───────────────────┐                                   │
│                         │    REGULAR_USER    │                                   │
│                         │  Standard access   │                                   │
│                         └───────────────────┘                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Platform Role Definitions

```typescript
type PlatformRole = "SUPER_ADMIN" | "PLATFORM_ADMIN" | "SUPPORT" | "MODERATOR" | "USER"

interface PlatformRoleDefinition {
  role: PlatformRole
  name: string
  description: string
  level: number
  permissions: PlatformPermission[]
}

const PLATFORM_ROLES: Record<PlatformRole, Omit<PlatformRoleDefinition, "role">> = {
  SUPER_ADMIN: {
    name: "Super Administrator",
    description: "Full control over the entire platform",
    level: 100,
    permissions: [
      "platform:all",
      "users:impersonate",
      "users:ban",
      "users:verify",
      "orgs:manage_all",
      "content:delete_any",
      "content:feature",
      "system:configure",
      "billing:manage_all",
      "analytics:view_all",
      "audit:view_all"
    ]
  },
  PLATFORM_ADMIN: {
    name: "Platform Administrator",
    description: "Manage organizations, users, and platform settings",
    level: 80,
    permissions: [
      "users:view_all",
      "users:suspend",
      "users:verify",
      "orgs:view_all",
      "orgs:suspend",
      "content:hide",
      "analytics:view_all",
      "audit:view_all"
    ]
  },
  SUPPORT: {
    name: "Customer Support",
    description: "Handle user issues and support tickets",
    level: 50,
    permissions: [
      "users:view_all",
      "users:reset_password",
      "users:verify",
      "tickets:manage",
      "orgs:view_all",
      "audit:view_limited"
    ]
  },
  MODERATOR: {
    name: "Content Moderator",
    description: "Review and moderate user-generated content",
    level: 40,
    permissions: [
      "content:review",
      "content:hide",
      "content:flag",
      "reports:view",
      "reports:resolve",
      "users:warn"
    ]
  },
  USER: {
    name: "Regular User",
    description: "Standard platform user",
    level: 0,
    permissions: []
  }
}

export type { PlatformRole, PlatformRoleDefinition }
export { PLATFORM_ROLES }
```



# ═══════════════════════════════════════════════════════════════════════════════
# PLATFORM PERMISSIONS
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
type PlatformPermission =
  // Platform-wide
  | "platform:all"

  // User management
  | "users:view_all"
  | "users:impersonate"
  | "users:ban"
  | "users:suspend"
  | "users:verify"
  | "users:reset_password"
  | "users:warn"

  // Organization management
  | "orgs:manage_all"
  | "orgs:view_all"
  | "orgs:suspend"

  // Content management
  | "content:delete_any"
  | "content:hide"
  | "content:flag"
  | "content:feature"
  | "content:review"

  // Reports
  | "reports:view"
  | "reports:resolve"

  // Support
  | "tickets:manage"

  // System
  | "system:configure"
  | "billing:manage_all"
  | "analytics:view_all"
  | "audit:view_all"
  | "audit:view_limited"

function hasPlatformPermission(
  role: PlatformRole,
  permission: PlatformPermission
): boolean {
  const roleConfig = PLATFORM_ROLES[role]

  if (roleConfig.permissions.includes("platform:all")) {
    return true
  }

  return roleConfig.permissions.includes(permission)
}

export type { PlatformPermission }
export { hasPlatformPermission }
```



# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════════

## User Suspension Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       USER SUSPENSION PROCESS                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. Admin identifies user for suspension                                        │
│     - Via report review                                                         │
│     - Via fraud detection alert                                                 │
│     - Via manual investigation                                                  │
│                                                                                 │
│  2. Admin selects suspension type:                                              │
│     ┌─────────────────────────────────────────────────────────────┐             │
│     │ TEMPORARY: 24h, 7d, 30d - User can return after period     │             │
│     │ INDEFINITE: No end date - Requires manual review to lift   │             │
│     │ PERMANENT: Account banned - Cannot be reversed             │             │
│     └─────────────────────────────────────────────────────────────┘             │
│                                                                                 │
│  3. System actions on suspension:                                               │
│     - Terminate all active sessions                                             │
│     - Block login attempts                                                      │
│     - Hide public content (optional)                                            │
│     - Notify user via email                                                     │
│     - Create audit log entry                                                    │
│                                                                                 │
│  4. Appeal process (if enabled):                                                │
│     - User can submit appeal within 14 days                                     │
│     - Appeal reviewed by different admin                                        │
│     - Decision communicated via email                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Content Moderation Actions

| Action | Description | Reversible | Requires Reason |
|--------|-------------|------------|-----------------|
| HIDE | Content hidden from public view | Yes | Yes |
| FLAG | Content flagged for review | Yes | No |
| REMOVE | Content permanently removed | No | Yes |
| FEATURE | Content featured on discover page | Yes | No |
| UNFEATURE | Remove from featured | Yes | No |
| RESTRICT | Limit content visibility | Yes | Yes |


## Audit Logging Requirements

All administrative actions MUST be logged with:

```typescript
interface AdminAuditEntry {
  id: string
  timestamp: Date
  adminId: string
  adminRole: PlatformRole
  action: AdminAction
  targetType: "USER" | "ORGANIZATION" | "CONTENT" | "SYSTEM"
  targetId: string
  reason: string | null
  previousState: Record<string, unknown> | null
  newState: Record<string, unknown> | null
  ipAddress: string
  userAgent: string
}

type AdminAction =
  | "USER_SUSPENDED"
  | "USER_BANNED"
  | "USER_UNSUSPENDED"
  | "USER_VERIFIED"
  | "USER_IMPERSONATED"
  | "ORG_SUSPENDED"
  | "ORG_VERIFIED"
  | "CONTENT_HIDDEN"
  | "CONTENT_REMOVED"
  | "CONTENT_FEATURED"
  | "CONFIG_CHANGED"
  | "PERMISSION_GRANTED"
  | "PERMISSION_REVOKED"
```



# ═══════════════════════════════════════════════════════════════════════════════
# MODERATOR WORKFLOWS
# ═══════════════════════════════════════════════════════════════════════════════

## Content Review Queue

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     MODERATION QUEUE PRIORITIES                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PRIORITY 1 - URGENT (< 1 hour SLA)                                            │
│  ─────────────────────────────────────                                          │
│  - Multiple reports on same content                                             │
│  - Reports of illegal content                                                   │
│  - Reports of harassment/threats                                                │
│  - Auto-flagged high-confidence violations                                      │
│                                                                                 │
│  PRIORITY 2 - HIGH (< 4 hours SLA)                                             │
│  ─────────────────────────────────────                                          │
│  - Single reports with detailed description                                     │
│  - Reports from verified users                                                  │
│  - Content from new accounts                                                    │
│                                                                                 │
│  PRIORITY 3 - NORMAL (< 24 hours SLA)                                          │
│  ─────────────────────────────────────                                          │
│  - Standard content reports                                                     │
│  - Auto-flagged medium-confidence items                                         │
│  - Appeal reviews                                                               │
│                                                                                 │
│  PRIORITY 4 - LOW (< 72 hours SLA)                                             │
│  ─────────────────────────────────────                                          │
│  - Spam reports                                                                 │
│  - Quality concerns                                                             │
│  - Feature requests disguised as reports                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Report Resolution Types

```typescript
type ReportResolution =
  | "CONTENT_REMOVED"       // Violation confirmed, content removed
  | "CONTENT_HIDDEN"        // Borderline case, hidden but not removed
  | "USER_WARNED"           // User received warning
  | "USER_SUSPENDED"        // User suspended for violation
  | "NO_VIOLATION"          // Report reviewed, no action needed
  | "DUPLICATE"             // Already handled in another report
  | "INSUFFICIENT_INFO"     // Cannot determine, needs more context

interface ReportResolutionRecord {
  reportId: string
  resolution: ReportResolution
  moderatorId: string
  resolvedAt: Date
  notes: string
  appealable: boolean
  appealDeadline: Date | null
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# SYSTEM ROLES
# ═══════════════════════════════════════════════════════════════════════════════

## Automated System Actors

```typescript
const SYSTEM_ACTORS = {
  FRAUD_DETECTOR: {
    id: "system:fraud_detector",
    name: "Fraud Detection System",
    capabilities: [
      "flag_suspicious_responses",
      "auto_suspend_accounts",
      "update_trust_scores"
    ],
    auditRequired: true
  },

  CONTENT_ANALYZER: {
    id: "system:content_analyzer",
    name: "Content Analysis System",
    capabilities: [
      "flag_inappropriate_content",
      "auto_moderate_comments",
      "detect_spam"
    ],
    auditRequired: true
  },

  SCHEDULER: {
    id: "system:scheduler",
    name: "Task Scheduler",
    capabilities: [
      "publish_scheduled_content",
      "end_expired_polls",
      "process_dormant_accounts"
    ],
    auditRequired: false
  },

  BILLING: {
    id: "system:billing",
    name: "Billing System",
    capabilities: [
      "process_subscriptions",
      "apply_tier_changes",
      "send_payment_reminders"
    ],
    auditRequired: true
  },

  NOTIFICATION: {
    id: "system:notification",
    name: "Notification System",
    capabilities: [
      "send_push_notifications",
      "send_email_notifications",
      "batch_digest_emails"
    ],
    auditRequired: false
  }
}

export { SYSTEM_ACTORS }
```


## System Action Audit

System actions that modify user data or access must be logged:

```typescript
interface SystemAuditEntry {
  id: string
  timestamp: Date
  systemActor: keyof typeof SYSTEM_ACTORS
  action: string
  targetType: "USER" | "CONTENT" | "ORGANIZATION" | "SUBSCRIPTION"
  targetId: string
  reason: string
  triggeredBy: "SCHEDULED" | "EVENT" | "THRESHOLD" | "MANUAL_TRIGGER"
  result: "SUCCESS" | "FAILURE" | "PARTIAL"
  details: Record<string, unknown>
}
```
