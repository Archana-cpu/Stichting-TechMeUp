# ═══════════════════════════════════════════════════════════════════════════════
# USERS - Organization Roles & Management (B2B)
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-005.md (sections 5.5, 5.6, 5.7, 5.8)
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# ORGANIZATION TYPES
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ORGANIZATION TYPES                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [Building2] CORPORATE                                                         │
│  ─────────────────────────────────────────────────────────────                 │
│  Private companies and businesses                                              │
│  - Employee surveys, internal feedback                                         │
│  - Customer satisfaction, market research                                      │
│  - Full SSO integration, advanced analytics                                    │
│  - White-label options available                                               │
│                                                                                 │
│  [Landmark] GOVERNMENT                                                         │
│  ─────────────────────────────────────────────────────────────                 │
│  Municipalities, government agencies, public institutions                      │
│  - Citizen feedback, public service evaluation                                 │
│  - e-Government integration for verified citizens                              │
│  - Enhanced data residency and compliance                                      │
│  - Public transparency reports                                                 │
│                                                                                 │
│  [GraduationCap] EDUCATIONAL                                                   │
│  ─────────────────────────────────────────────────────────────                 │
│  Universities, schools, research institutions                                  │
│  - Student/faculty surveys, course evaluations                                 │
│  - Academic research data collection                                           │
│  - IRB compliance features                                                     │
│  - Educational pricing                                                         │
│                                                                                 │
│  [HeartPulse] HEALTHCARE                                                       │
│  ─────────────────────────────────────────────────────────────                 │
│  Hospitals, clinics, healthcare providers                                      │
│  - Patient satisfaction, staff feedback                                        │
│  - Enhanced privacy controls                                                   │
│  - HIPAA-aware features (for US expansion)                                     │
│  - Sensitive data handling                                                     │
│                                                                                 │
│  [Users] NON-PROFIT                                                            │
│  ─────────────────────────────────────────────────────────────                 │
│  NGOs, charities, community organizations                                      │
│  - Volunteer/donor feedback                                                    │
│  - Community needs assessment                                                  │
│  - Non-profit pricing (50% discount)                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Organization Data Structure

```typescript
import { z } from "zod"

type OrganizationType = "CORPORATION" | "MUNICIPALITY" | "GOVERNMENT" | "NGO" | "EDUCATION" | "MEDIA" | "RESEARCH" | "OTHER"

const organizationSchema = z.object({
  id: z.string().uuid(),

  name: z.string().min(2).max(100),

  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),

  type: z.enum(["CORPORATION", "MUNICIPALITY", "GOVERNMENT", "NGO", "EDUCATION", "MEDIA", "RESEARCH", "OTHER"]),

  logoUrl: z.string().url().nullable(),

  description: z.string().max(500).nullable(),

  website: z.string().url().nullable(),

  industry: z.string().max(100).nullable(),

  size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1001-5000", "5000+"]),

  country: z.string().length(2),

  isVerified: z.boolean().default(false),

  verificationDate: z.date().nullable(),

  settings: z.object({
    allowPublicSurveys: z.boolean().default(true),
    requireSSOForMembers: z.boolean().default(false),
    defaultSurveyAnonymity: z.boolean().default(true),
    dataRetentionDays: z.number().int().min(30).max(3650).default(365),
    allowExternalParticipants: z.boolean().default(false)
  }),

  subscription: z.object({
    plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE", "CUSTOM"]),
    status: z.enum(["ACTIVE", "PAST_DUE", "CANCELLED", "TRIAL"]),
    trialEndsAt: z.date().nullable(),
    currentPeriodEndsAt: z.date()
  }),

  stats: z.object({
    memberCount: z.number().int().default(0),
    surveyCount: z.number().int().default(0),
    totalResponses: z.number().int().default(0),
    createdAt: z.date(),
    lastActivityAt: z.date()
  }),

  ssoConfig: z.object({
    enabled: z.boolean().default(false),
    provider: z.enum(["SAML", "OIDC"]).nullable(),
    entityId: z.string().nullable(),
    ssoUrl: z.string().url().nullable(),
    certificate: z.string().nullable()
  }).nullable()
})

type Organization = z.infer<typeof organizationSchema>

export { organizationSchema }
export type { Organization, OrganizationType }
```



# ═══════════════════════════════════════════════════════════════════════════════
# ORGANIZATION ROLE HIERARCHY
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION ROLE HIERARCHY                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                         ┌───────────────┐                                      │
│                         │     OWNER     │                                      │
│                         │  [Crown]      │                                      │
│                         └───────┬───────┘                                      │
│                                 │                                              │
│                         ┌───────┴───────┐                                      │
│                         │     ADMIN     │                                      │
│                         │  [Shield]     │                                      │
│                         └───────┬───────┘                                      │
│                                 │                                              │
│              ┌───────────────────┼───────────────────┐                         │
│              │                   │                   │                         │
│      ┌───────┴───────┐   ┌───────┴───────┐   ┌───────┴───────┐                │
│      │    MANAGER    │   │    ANALYST    │   │    CREATOR    │                │
│      │  [UserCog]    │   │  [LineChart]  │   │  [PenTool]    │                │
│      └───────────────┘   └───────────────┘   └───────────────┘                │
│                                 │                                              │
│                         ┌───────┴───────┐                                      │
│                         │    MEMBER     │                                      │
│                         │  [User]       │                                      │
│                         └───────────────┘                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Role Definitions

```typescript
type OrganizationRole = "OWNER" | "ADMIN" | "MANAGER" | "ANALYST" | "CREATOR" | "MEMBER"

interface RoleDefinition {
  role: OrganizationRole
  name: string
  description: string
  icon: string
  level: number
  maxPerOrg: number | null
  requiresVerificationLevel: number
}

const ROLE_DEFINITIONS: Record<OrganizationRole, Omit<RoleDefinition, "role">> = {
  OWNER: {
    name: "Owner",
    description: "Full control over organization, billing, and deletion",
    icon: "Crown",
    level: 100,
    maxPerOrg: 1,
    requiresVerificationLevel: 4
  },
  ADMIN: {
    name: "Administrator",
    description: "Manage members, settings, and all content",
    icon: "Shield",
    level: 80,
    maxPerOrg: 5,
    requiresVerificationLevel: 3
  },
  MANAGER: {
    name: "Manager",
    description: "Create/manage surveys, view all results, manage team",
    icon: "UserCog",
    level: 60,
    maxPerOrg: null,
    requiresVerificationLevel: 2
  },
  ANALYST: {
    name: "Analyst",
    description: "View all survey results and analytics, export data",
    icon: "LineChart",
    level: 40,
    maxPerOrg: null,
    requiresVerificationLevel: 2
  },
  CREATOR: {
    name: "Creator",
    description: "Create surveys, view own results",
    icon: "PenTool",
    level: 30,
    maxPerOrg: null,
    requiresVerificationLevel: 2
  },
  MEMBER: {
    name: "Member",
    description: "Participate in organization surveys",
    icon: "User",
    level: 10,
    maxPerOrg: null,
    requiresVerificationLevel: 1
  }
}

export type { OrganizationRole, RoleDefinition }
export { ROLE_DEFINITIONS }
```


## Permission Matrix

| Permission | Owner | Admin | Manager | Analyst | Creator | Member |
|------------|-------|-------|---------|---------|---------|--------|
| Delete organization | Y | | | | | |
| Manage billing | Y | | | | | |
| Transfer ownership | Y | | | | | |
| Manage SSO | Y | Y | | | | |
| Manage admins | Y | | | | | |
| Manage members | Y | Y | Y | | | |
| Edit org settings | Y | Y | | | | |
| View audit logs | Y | Y | | | | |
| Create surveys | Y | Y | Y | | Y | |
| Edit any survey | Y | Y | Y | | | |
| View all results | Y | Y | Y | Y | | |
| Export data | Y | Y | Y | Y | | |
| View own results | Y | Y | Y | Y | Y | |
| Participate | Y | Y | Y | Y | Y | Y |


## Permission Constants

```typescript
type Permission =
  | "org:delete"
  | "org:billing"
  | "org:transfer"
  | "org:sso"
  | "org:settings"
  | "org:audit"
  | "members:manage_admins"
  | "members:manage"
  | "members:view"
  | "surveys:create"
  | "surveys:edit_any"
  | "surveys:delete_any"
  | "results:view_all"
  | "results:view_own"
  | "results:export"
  | "participate"

const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
  OWNER: [
    "org:delete", "org:billing", "org:transfer", "org:sso", "org:settings", "org:audit",
    "members:manage_admins", "members:manage", "members:view",
    "surveys:create", "surveys:edit_any", "surveys:delete_any",
    "results:view_all", "results:view_own", "results:export",
    "participate"
  ],
  ADMIN: [
    "org:sso", "org:settings", "org:audit",
    "members:manage", "members:view",
    "surveys:create", "surveys:edit_any", "surveys:delete_any",
    "results:view_all", "results:view_own", "results:export",
    "participate"
  ],
  MANAGER: [
    "members:manage", "members:view",
    "surveys:create", "surveys:edit_any",
    "results:view_all", "results:view_own", "results:export",
    "participate"
  ],
  ANALYST: [
    "members:view",
    "results:view_all", "results:view_own", "results:export",
    "participate"
  ],
  CREATOR: [
    "surveys:create",
    "results:view_own",
    "participate"
  ],
  MEMBER: [
    "participate"
  ]
}

function hasPermission(role: OrganizationRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

function canManageRole(managerRole: OrganizationRole, targetRole: OrganizationRole): boolean {
  const managerLevel = ROLE_DEFINITIONS[managerRole].level
  const targetLevel = ROLE_DEFINITIONS[targetRole].level
  return managerLevel > targetLevel
}

export type { Permission }
export { ROLE_PERMISSIONS, hasPermission, canManageRole }
```



# ═══════════════════════════════════════════════════════════════════════════════
# ORGANIZATION SUBSCRIPTION TIERS
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION SUBSCRIPTION TIERS                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STARTER                                              $99/month                 │
│  ─────────────────────────────────────────────────────────────                 │
│  - Up to 25 team members                                                       │
│  - 10 active surveys/month                                                     │
│  - 1,000 responses/month                                                       │
│  - Basic analytics                                                             │
│  - Email support                                                               │
│  - CSV export                                                                  │
│                                                                                 │
│  PROFESSIONAL                                         $299/month                │
│  ─────────────────────────────────────────────────────────────                 │
│  - Up to 100 team members                                                      │
│  - 50 active surveys/month                                                     │
│  - 10,000 responses/month                                                      │
│  - Advanced analytics + dashboards                                             │
│  - Priority support                                                            │
│  - API access                                                                  │
│  - Custom branding                                                             │
│  - Domain auto-join                                                            │
│                                                                                 │
│  ENTERPRISE                                           $999/month                │
│  ─────────────────────────────────────────────────────────────                 │
│  - Unlimited team members                                                      │
│  - Unlimited surveys                                                           │
│  - 100,000 responses/month                                                     │
│  - SSO (SAML/OIDC)                                                             │
│  - Dedicated support manager                                                   │
│  - SLA guarantee (99.9%)                                                       │
│  - Advanced security (audit logs, IP allowlist)                                │
│  - Custom integrations                                                         │
│  - White-label option                                                          │
│                                                                                 │
│  CUSTOM                                               Contact Sales             │
│  ─────────────────────────────────────────────────────────────                 │
│  - Everything in Enterprise                                                    │
│  - Unlimited responses                                                         │
│  - On-premise deployment option                                                │
│  - Custom SLA                                                                  │
│  - Dedicated infrastructure                                                    │
│  - Professional services                                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Subscription Constants

```typescript
type SubscriptionPlan = "STARTER" | "PROFESSIONAL" | "ENTERPRISE" | "CUSTOM"

interface PlanLimits {
  maxMembers: number | null
  maxSurveysPerMonth: number | null
  maxResponsesPerMonth: number | null
  features: string[]
}

const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanLimits & { price: number | null }> = {
  STARTER: {
    price: 99,
    maxMembers: 25,
    maxSurveysPerMonth: 10,
    maxResponsesPerMonth: 1000,
    features: [
      "basic_analytics",
      "csv_export",
      "email_support"
    ]
  },
  PROFESSIONAL: {
    price: 299,
    maxMembers: 100,
    maxSurveysPerMonth: 50,
    maxResponsesPerMonth: 10000,
    features: [
      "advanced_analytics",
      "api_access",
      "custom_branding",
      "domain_auto_join",
      "priority_support"
    ]
  },
  ENTERPRISE: {
    price: 999,
    maxMembers: null,
    maxSurveysPerMonth: null,
    maxResponsesPerMonth: 100000,
    features: [
      "sso_saml",
      "sso_oidc",
      "audit_logs",
      "ip_allowlist",
      "dedicated_support",
      "sla_guarantee",
      "white_label"
    ]
  },
  CUSTOM: {
    price: null,
    maxMembers: null,
    maxSurveysPerMonth: null,
    maxResponsesPerMonth: null,
    features: [
      "on_premise",
      "custom_sla",
      "dedicated_infrastructure",
      "professional_services"
    ]
  }
}

export type { SubscriptionPlan, PlanLimits }
export { SUBSCRIPTION_PLANS }
```



# ═══════════════════════════════════════════════════════════════════════════════
# MEMBER INVITATION FLOW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       MEMBER INVITATION METHODS                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Method 1: Email Invitation                                                    │
│  ─────────────────────────────────────────────────────────────                 │
│  - Admin enters email address and selects role                                  │
│  - Invitation email sent with unique link                                      │
│  - Link expires in 7 days                                                      │
│  - User creates account or links existing account                              │
│  - Role assigned upon acceptance                                               │
│                                                                                 │
│  Method 2: Domain Auto-Join                                                    │
│  ─────────────────────────────────────────────────────────────                 │
│  - Organization verifies domain ownership                                      │
│  - Users with @domain.com email can auto-join                                  │
│  - Default role: MEMBER (configurable)                                         │
│  - Optional: Admin approval required                                           │
│                                                                                 │
│  Method 3: SSO Auto-Provisioning (Enterprise)                                  │
│  ─────────────────────────────────────────────────────────────                 │
│  - User authenticates via SSO                                                  │
│  - Account automatically created if not exists                                 │
│  - Role determined by IdP groups/attributes                                    │
│  - Verification level: 2 (automatic)                                           │
│                                                                                 │
│  Method 4: Bulk Import (Enterprise)                                            │
│  ─────────────────────────────────────────────────────────────                 │
│  - Upload CSV with email addresses and roles                                   │
│  - System validates and sends batch invitations                                │
│  - Progress tracking and error reporting                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# MEMBER OFFBOARDING POLICY
# ═══════════════════════════════════════════════════════════════════════════════

[DECISION P-033] Organization Member Offboarding & Data Handling

```typescript
const ORG_MEMBER_OFFBOARDING = {
  // DATA HANDLING ON REMOVAL
  dataHandling: {
    surveyResponses: "ANONYMIZE",       // Keep data, remove user link
    surveysCreated: "TRANSFER",         // Transfer ownership to org admin
    reports: "RETAIN",                  // Keep with org, creator info removed
    auditLogs: "RETAIN_90_DAYS",        // Keep for compliance, then anonymize
    comments: "ANONYMIZE"               // Keep content, show as "Former member"
  },

  // PERSONAL DATA (GDPR/KVKK COMPLIANCE)
  personalData: {
    action: "DELETE",                   // Delete personal data from org records
    retentionDays: 30,                  // Grace period before deletion
    exportBeforeDelete: true,           // Offer data export to user

    deletedFields: [
      "memberProfile",
      "accessLogs",
      "deviceHistory",
      "emailPreferences"
    ],

    retainedAnonymized: [
      "responseData",                   // Survey responses (no user link)
      "aggregatedMetrics",              // Contribution to org statistics
      "contentCreated"                  // Surveys/content transferred to admin
    ]
  },

  // ACCESS REVOCATION
  accessRevocation: {
    immediateRevocation: true,          // Access removed immediately
    invalidateSessions: true,           // All active sessions terminated
    revokeAPIKeys: true,                // Any API keys deactivated
    removeFromTeams: true,              // Remove from all teams/groups
    removeNotifications: true           // Stop all org notifications
  },

  // OFFBOARDING TYPES
  offboardingTypes: {
    VOLUNTARY: {
      gracePeroid: 0,                   // Immediate
      canRejoin: true,                  // Can be re-invited
      dataTreatment: "FULL_OFFBOARD"
    },
    REMOVED: {
      gracePeroid: 0,
      canRejoin: true,                  // Admin can re-invite
      dataTreatment: "FULL_OFFBOARD"
    },
    ACCOUNT_DELETED: {
      gracePeroid: 30,                  // 30 day grace for account recovery
      canRejoin: false,
      dataTreatment: "FULL_ANONYMIZATION"
    },
    BANNED: {
      gracePeroid: 0,
      canRejoin: false,
      dataTreatment: "FULL_OFFBOARD",
      flagForAudit: true
    }
  }
}

export { ORG_MEMBER_OFFBOARDING }
```



# ═══════════════════════════════════════════════════════════════════════════════
# SSO INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════

## Supported SSO Protocols

| Protocol | Description | Use Case |
|----------|-------------|----------|
| SAML 2.0 | XML-based, enterprise standard | Large enterprises, government |
| OIDC | OAuth 2.0 based, modern | Modern enterprises, SaaS integrations |


## SSO Configuration Schemas

```typescript
import { z } from "zod"

const samlConfigSchema = z.object({
  provider: z.literal("SAML"),
  entityId: z.string().min(1),
  ssoUrl: z.string().url(),
  sloUrl: z.string().url().optional(),
  certificate: z.string().min(1),
  signatureAlgorithm: z.enum(["RSA-SHA256", "RSA-SHA512"]).default("RSA-SHA256"),
  nameIdFormat: z.enum([
    "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
    "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"
  ]).default("urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"),
  attributeMapping: z.object({
    email: z.string().default("email"),
    firstName: z.string().default("firstName"),
    lastName: z.string().default("lastName"),
    groups: z.string().optional()
  })
})

const oidcConfigSchema = z.object({
  provider: z.literal("OIDC"),
  issuer: z.string().url(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  authorizationUrl: z.string().url(),
  tokenUrl: z.string().url(),
  userInfoUrl: z.string().url(),
  scopes: z.array(z.string()).default(["openid", "email", "profile"]),
  claimMapping: z.object({
    email: z.string().default("email"),
    name: z.string().default("name"),
    groups: z.string().optional()
  })
})

const ssoConfigSchema = z.discriminatedUnion("provider", [
  samlConfigSchema,
  oidcConfigSchema
])

type SSOConfig = z.infer<typeof ssoConfigSchema>

export { ssoConfigSchema, samlConfigSchema, oidcConfigSchema }
export type { SSOConfig }
```


## SSO Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SSO AUTHENTICATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User          VOXPOLL           Identity Provider                             │
│   |               |                     |                                      │
│   |-- 1. Login -->|                     |                                      │
│   |               |                     |                                      │
│   |<- 2. Redirect |                     |                                      │
│   |               |                     |                                      │
│   |--------- 3. Authenticate --------->|                                      │
│   |               |                     |                                      │
│   |<-------- 4. SAML/OIDC Response ----|                                      │
│   |               |                     |                                      │
│   |- 5. Callback ->|                     |                                      │
│   |               |                     |                                      │
│   |               |-- 6. Validate ----->| (verify signature)                   │
│   |               |                     |                                      │
│   |               |<- 7. User Info -----|                                      │
│   |               |                     |                                      │
│   |<- 8. Session -|                     |                                      │
│   |   Created     |                     |                                      │
│                                                                                 │
│  User provisioning on first SSO login:                                         │
│  - Account created automatically                                               │
│  - Linked to organization                                                      │
│  - Verification level set to 2                                                 │
│  - Role determined by IdP groups (or default MEMBER)                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## SSO Group-to-Role Mapping

```typescript
import { z } from "zod"

const groupMappingSchema = z.object({
  idpGroupName: z.string(),
  voxpollRole: z.enum(["OWNER", "ADMIN", "MANAGER", "ANALYST", "CREATOR", "MEMBER"]),
  priority: z.number().int().min(0).default(0)
})

const groupMappingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  defaultRole: z.enum(["MEMBER", "CREATOR"]).default("MEMBER"),
  mappings: z.array(groupMappingSchema).default([]),
  syncOnLogin: z.boolean().default(true)
})

function determineRoleFromGroups(
  userGroups: string[],
  config: z.infer<typeof groupMappingConfigSchema>
): OrganizationRole {
  if (!config.enabled || config.mappings.length === 0) {
    return config.defaultRole
  }

  const matchingMappings = config.mappings
    .filter(mapping => userGroups.includes(mapping.idpGroupName))
    .sort((a, b) => b.priority - a.priority)

  if (matchingMappings.length === 0) {
    return config.defaultRole
  }

  const highestPriority = matchingMappings[0].priority
  const topMappings = matchingMappings.filter(m => m.priority === highestPriority)

  const roleHierarchy: OrganizationRole[] = ["OWNER", "ADMIN", "MANAGER", "ANALYST", "CREATOR", "MEMBER"]
  const highestRole = topMappings.reduce((highest, mapping) => {
    const currentIndex = roleHierarchy.indexOf(mapping.voxpollRole)
    const highestIndex = roleHierarchy.indexOf(highest)
    return currentIndex < highestIndex ? mapping.voxpollRole : highest
  }, "MEMBER" as OrganizationRole)

  return highestRole
}

export { groupMappingSchema, groupMappingConfigSchema, determineRoleFromGroups }
```
