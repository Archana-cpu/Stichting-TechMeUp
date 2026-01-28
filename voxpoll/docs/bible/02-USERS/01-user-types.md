# ═══════════════════════════════════════════════════════════════════════════════
# USERS - User Types & Subscription Tiers (B2C)
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-005.md (sections 5.1, 5.2, 5.4, 5.8)
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# ACCOUNT TYPES OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VOXPOLL ACCOUNT TYPES                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  INDIVIDUAL ACCOUNTS                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ - Personal use for participating in polls/surveys/tests                 │   │
│  │ - Can create public content (polls, personality tests)                  │   │
│  │ - Free tier available with premium upgrades                             │   │
│  │ - Verification levels 0-4 based on identity proof                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ORGANIZATION ACCOUNTS                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ - Business/institutional use for B2B survey features                    │   │
│  │ - Can create private surveys restricted to members                      │   │
│  │ - SSO integration for employee authentication                           │   │
│  │ - Advanced analytics and export capabilities                            │   │
│  │ - Subscription-based pricing                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# ACCOUNT LIFECYCLE STATES
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
type AccountStatus =
  | "PENDING_VERIFICATION"    // Email/phone not yet verified
  | "ACTIVE"                  // Normal operational state
  | "SUSPENDED"               // Temporarily disabled (fraud, violation)
  | "BANNED"                  // Permanently disabled
  | "DELETED"                 // Soft-deleted, data anonymized
  | "DORMANT"                 // No activity for 12+ months

interface AccountStatusTransition {
  from: AccountStatus
  to: AccountStatus
  allowedBy: "SYSTEM" | "ADMIN" | "USER"
  requiresReason: boolean
}

const ALLOWED_TRANSITIONS: AccountStatusTransition[] = [
  { from: "PENDING_VERIFICATION", to: "ACTIVE", allowedBy: "SYSTEM", requiresReason: false },
  { from: "ACTIVE", to: "SUSPENDED", allowedBy: "ADMIN", requiresReason: true },
  { from: "ACTIVE", to: "DELETED", allowedBy: "USER", requiresReason: false },
  { from: "ACTIVE", to: "DORMANT", allowedBy: "SYSTEM", requiresReason: false },
  { from: "SUSPENDED", to: "ACTIVE", allowedBy: "ADMIN", requiresReason: true },
  { from: "SUSPENDED", to: "BANNED", allowedBy: "ADMIN", requiresReason: true },
  { from: "DORMANT", to: "ACTIVE", allowedBy: "USER", requiresReason: false },
  { from: "DORMANT", to: "DELETED", allowedBy: "SYSTEM", requiresReason: false }
]

export type { AccountStatus, AccountStatusTransition }
export { ALLOWED_TRANSITIONS }
```



# ═══════════════════════════════════════════════════════════════════════════════
# REGISTRATION & AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════════════════

## Registration Methods

| Method | Description | Verification Level | Use Case |
|--------|-------------|-------------------|----------|
| Email + Password | Traditional registration | Level 0 | Basic access |
| Phone + OTP | SMS verification required | Level 1 | Enhanced trust |
| OAuth (Google) | Google account linking | Level 0-1 | Quick signup |
| OAuth (Apple) | Apple ID linking | Level 0-1 | iOS users |
| SSO (SAML/OIDC) | Enterprise identity provider | Level 2 | Organization members |
| e-Government | National ID verification | Level 3-4 | High-trust surveys |


## Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         INDIVIDUAL REGISTRATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Step 1: Initial Signup                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ - User selects registration method (email/phone/OAuth)                  │   │
│  │ - Provides basic information: display name, email/phone                 │   │
│  │ - Accepts Terms of Service and Privacy Policy                           │   │
│  │ - [!] Consent checkboxes must be unchecked by default (GDPR)            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                              |                                                 │
│                              v                                                 │
│  Step 2: Primary Verification                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ - Email: Verification link sent (expires in 24 hours)                   │   │
│  │ - Phone: 6-digit OTP sent via SMS (expires in 10 minutes)               │   │
│  │ - OAuth: Redirect to provider, receive tokens                           │   │
│  │ - Max 3 OTP attempts before 1-hour cooldown                             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                              |                                                 │
│                              v                                                 │
│  Step 3: Profile Setup (Optional)                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ - Avatar upload (max 2MB, jpg/png/webp)                                 │   │
│  │ - Bio (max 500 characters)                                              │   │
│  │ - Demographics (for feed personalization, fully optional)               │   │
│  │ - Interest categories selection                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                              |                                                 │
│                              v                                                 │
│  Step 4: Account Ready                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ - Account status: ACTIVE                                                │   │
│  │ - Verification level: 0 (email only) or 1 (phone verified)              │   │
│  │ - User trust score initialized: 50                                      │   │
│  │ - Can immediately participate in public content                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Authentication Configuration

```typescript
// [P-049] CRITICAL SECURITY DECISION:
// X Facebook OAuth: NEVER SUPPORTED (privacy concerns, data harvesting)
// X Twitter/X OAuth: NEVER SUPPORTED (API instability, ownership changes)
// ONLY SUPPORTED: Google, Apple, e-Devlet, Email+Password, Phone OTP

type AuthMethod =
  | "EMAIL_PASSWORD"
  | "PHONE_OTP"
  | "OAUTH_GOOGLE"
  | "OAUTH_APPLE"
  | "SSO_SAML"
  | "SSO_OIDC"
  | "MAGIC_LINK"
  | "PASSKEY"

interface AuthConfig {
  method: AuthMethod
  enabled: boolean
  mfaRequired: boolean
  sessionDuration: number
  refreshTokenDuration: number
}

const AUTH_CONFIGS: Record<AuthMethod, Omit<AuthConfig, "method">> = {
  EMAIL_PASSWORD: {
    enabled: true,
    mfaRequired: false,
    sessionDuration: 7 * 24 * 60 * 60,      // 7 days
    refreshTokenDuration: 30 * 24 * 60 * 60  // 30 days
  },
  PHONE_OTP: {
    enabled: true,
    mfaRequired: false,
    sessionDuration: 7 * 24 * 60 * 60,
    refreshTokenDuration: 30 * 24 * 60 * 60
  },
  OAUTH_GOOGLE: {
    enabled: true,
    mfaRequired: false,
    sessionDuration: 7 * 24 * 60 * 60,
    refreshTokenDuration: 30 * 24 * 60 * 60
  },
  OAUTH_APPLE: {
    enabled: true,
    mfaRequired: false,
    sessionDuration: 7 * 24 * 60 * 60,
    refreshTokenDuration: 30 * 24 * 60 * 60
  },
  SSO_SAML: {
    enabled: true,
    mfaRequired: true,
    sessionDuration: 8 * 60 * 60,           // 8 hours (workday)
    refreshTokenDuration: 24 * 60 * 60       // 24 hours
  },
  SSO_OIDC: {
    enabled: true,
    mfaRequired: true,
    sessionDuration: 8 * 60 * 60,
    refreshTokenDuration: 24 * 60 * 60
  },
  MAGIC_LINK: {
    enabled: true,
    mfaRequired: false,
    sessionDuration: 24 * 60 * 60,          // 24 hours
    refreshTokenDuration: 7 * 24 * 60 * 60
  },
  PASSKEY: {
    enabled: true,
    mfaRequired: false,
    sessionDuration: 30 * 24 * 60 * 60,     // 30 days (trusted device)
    refreshTokenDuration: 90 * 24 * 60 * 60
  }
}

export type { AuthMethod, AuthConfig }
export { AUTH_CONFIGS }
```


## Password Requirements

| Requirement | Specification |
|-------------|---------------|
| Minimum length | 10 characters |
| Maximum length | 128 characters |
| Character classes | At least 3 of: uppercase, lowercase, number, symbol |
| Prohibited | Common passwords (top 10,000 list), user's email/name |
| History | Cannot reuse last 5 passwords |
| Expiration | No forced expiration (per NIST guidelines) |
| Breach check | Check against HaveIBeenPwned API on registration |


## Session Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SESSION ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Token Structure:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Access Token (JWT)                                                      │   │
│  │ - Short-lived (15 minutes)                                              │   │
│  │ - Contains: userId, sessionId, orgId (if applicable), permissions       │   │
│  │ - Stored in memory only (not localStorage)                              │   │
│  │ - Sent via Authorization header                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Refresh Token                                                           │   │
│  │ - Long-lived (7-30 days based on auth method)                           │   │
│  │ - Stored in HttpOnly, Secure, SameSite=Strict cookie                    │   │
│  │ - Rotated on each use (refresh token rotation)                          │   │
│  │ - Bound to device fingerprint                                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Session Limits:                                                               │
│  - Maximum concurrent sessions per user: 5                                     │
│  - Maximum sessions per device: 1                                              │
│  - New login on 6th device terminates oldest session                           │
│                                                                                 │
│  [SECURITY] All sessions invalidated on:                                       │
│  - Password change                                                             │
│  - Security breach detection                                                   │
│  - User-initiated "logout all devices"                                         │
│  - Account suspension/ban                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# INDIVIDUAL SUBSCRIPTION TIERS (B2C)
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      INDIVIDUAL SUBSCRIPTION TIERS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FREE                                                        $0/month          │
│  ─────────────────────────────────────────────────────────────                 │
│  - Participate in all public polls/surveys/tests                               │
│  - View results of participated content (PULSE/COMMENTS)                       │
│  - Create polls: 3/day                                                         │
│  - Create personality tests: 3/week                                            │
│  - Private link sharing for polls/tests                                        │
│  - Discover feed (sponsored surveys visible)                                   │
│  - Basic profile badges from tests                                             │
│  - Anonymous participation mode                                                │
│                                                                                 │
│  PLUS                                                        $4.99/month       │
│  ─────────────────────────────────────────────────────────────                 │
│  Everything in Free, plus:                                                     │
│  - ACCESS PULSE/COMMENTS without participating            [KEY FEATURE]        │
│  - Create polls: 10/day                                                        │
│  - Create personality tests: 10/week                                           │
│  - View non-participated content results                                       │
│  - Priority in discover feed                                                   │
│  - Extended profile customization                                              │
│                                                                                 │
│  PREMIUM                                                     $9.99/month       │
│  ─────────────────────────────────────────────────────────────                 │
│  Everything in Plus, plus:                                                     │
│  - TARGET AUDIENCE SELECTION for polls                     [KEY FEATURE]       │
│  - PRE-TEST SCREENING for polls                            [KEY FEATURE]       │
│  - LIVE POLL feature with link-join                        [KEY FEATURE]       │
│  - CUSTOM THEMES for polls/tests                           [KEY FEATURE]       │
│  - Unlimited poll/test creation                                                │
│  - Advanced analytics for own content                                          │
│  - Verified creator badge                                                      │
│  - Priority support                                                            │
│  - Early access to new features                                                │
│  Target: Influencers, content creators, researchers                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Feature Comparison Matrix

| Feature | Free | Plus | Premium |
|---------|------|------|---------|
| Participate in content | Unlimited | Unlimited | Unlimited |
| View participated results (PULSE) | Yes | Yes | Yes |
| View non-participated results | No | Yes | Yes |
| Join discussions without participating | No | YES | Yes |
| Create polls | 3/day | 10/day | Unlimited |
| Create personality tests | 3/week | 10/week | Unlimited |
| Private link sharing | Yes | Yes | Yes |
| Target audience selection | No | No | YES |
| Pre-test screening for polls | No | No | YES |
| Live Poll feature | No | No | YES |
| Custom themes | No | No | YES |
| Profile badges from tests | Basic | Extended | Full |
| Price | $0 | $4.99/mo | $9.99/mo |



# ═══════════════════════════════════════════════════════════════════════════════
# USER PROFILE SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

## Profile Data Structure

```typescript
import { z } from "zod"

const userProfileSchema = z.object({
  id: z.string().uuid(),

  displayName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_\-\s]+$/, "Only letters, numbers, spaces, underscores, hyphens"),

  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only")
    .optional(),

  avatarUrl: z.string().url().nullable(),

  bio: z.string().max(500).nullable(),

  verificationLevel: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),

  // LOCKED DEMOGRAPHICS - IMMUTABLE AFTER REGISTRATION
  // [DECISION P-012] Demographics are locked to prevent gaming survey targeting
  demographics: z.object({
    // IMMUTABLE FIELDS - Cannot be changed after registration
    birthYear: z.number().int().min(1900).max(2010),        // LOCKED
    birthMonth: z.number().int().min(1).max(12),            // LOCKED
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]), // LOCKED
    country: z.string().length(2),                          // LOCKED
    region: z.string().max(100).optional(),                 // LOCKED
    city: z.string().max(100).optional(),                   // LOCKED
    educationLevel: z.enum([
      "PRIMARY", "SECONDARY", "HIGH_SCHOOL", "ASSOCIATE",
      "BACHELOR", "MASTER", "DOCTORATE", "OTHER"
    ]).optional(),

    // MUTABLE FIELDS - Can be updated by user
    maritalStatus: z.enum([
      "SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "PREFER_NOT_TO_SAY"
    ]).optional(),
    profession: z.string().max(100).optional(),
    employmentStatus: z.enum([
      "EMPLOYED_FULL", "EMPLOYED_PART", "SELF_EMPLOYED",
      "UNEMPLOYED", "STUDENT", "RETIRED", "OTHER"
    ]).optional()
  }),

  demographicsLockedAt: z.date(),

  preferences: z.object({
    language: z.string().length(2).default("en"),
    timezone: z.string().default("UTC"),
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    publicProfile: z.boolean().default(true),
    showParticipationHistory: z.boolean().default(false)
  }),

  interests: z.array(z.string()).max(10).default([]),

  stats: z.object({
    contentCreated: z.number().int().default(0),
    participations: z.number().int().default(0),
    discussionPosts: z.number().int().default(0),
    joinedAt: z.date(),
    lastActiveAt: z.date()
  }),

  badges: z.array(z.string()).default([])
})

type UserProfile = z.infer<typeof userProfileSchema>

export { userProfileSchema }
export type { UserProfile }
```


## Locked Demographics System

[DECISION P-012] Demographics are LOCKED after registration to ensure data integrity
and prevent users from gaming survey/poll targeting by changing their demographics.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    LOCKED DEMOGRAPHICS SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  IMMUTABLE FIELDS (Cannot be changed after registration):                       │
│  ─────────────────────────────────────────────────────────                      │
│  - Birth Year & Month     - Age verification, survey targeting                  │
│  - Gender                 - Demographic research integrity                      │
│  - Country                - Geographic research integrity                       │
│  - Region/City            - Location-based survey targeting                     │
│  - Education Level        - Socioeconomic research integrity                    │
│                                                                                 │
│  MUTABLE FIELDS (Can be updated by user):                                       │
│  ─────────────────────────────────────────                                      │
│  - Marital Status         - Life circumstances change                           │
│  - Profession             - Career changes are natural                          │
│  - Employment Status      - Employment situation changes                        │
│                                                                                 │
│  WHY LOCK DEMOGRAPHICS?                                                         │
│  ─────────────────────────                                                      │
│  - Prevents users from changing age to access different surveys                 │
│  - Ensures survey creators get authentic demographic data                       │
│  - Maintains integrity of target audience filtering                             │
│  - Prevents "demographic fraud" for incentivized surveys                        │
│                                                                                 │
│  EXCEPTION PROCESS:                                                             │
│  ─────────────────────                                                          │
│  - User can request demographic correction ONCE                                 │
│  - Requires manual verification by support team                                 │
│  - Supporting documentation may be required (ID verification)                   │
│  - All survey participations flagged for potential data quality review          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Profile Visibility Settings

| Field | Public Profile | Private Profile | Organization View |
|-------|---------------|-----------------|-------------------|
| Display Name | Visible | Visible | Visible |
| Username | Visible | Visible | Visible |
| Avatar | Visible | Visible | Visible |
| Bio | Visible | Hidden | Visible |
| Verification Level | Badge only | Badge only | Full details |
| Demographics | Hidden | Hidden | Aggregated only |
| Participation History | Optional | Hidden | Survey-specific only |
| Trust Score | Hidden | Hidden | Hidden |
| Content Created | Count only | Hidden | Full list |
| Badges | Visible | Visible | Visible |


## User Achievement Badges

```typescript
interface UserBadge {
  id: string
  name: string
  description: string
  icon: string
  category: "PARTICIPATION" | "CREATION" | "ENGAGEMENT" | "SPECIAL"
  criteria: (stats: UserStats) => boolean
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY"
}

const USER_BADGES: UserBadge[] = [
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined during beta period",
    icon: "Star",
    category: "SPECIAL",
    criteria: (stats) => stats.joinedAt < new Date("2026-06-01"),
    rarity: "LEGENDARY"
  },
  {
    id: "first_poll",
    name: "Poll Creator",
    description: "Created your first poll",
    icon: "PlusCircle",
    category: "CREATION",
    criteria: (stats) => stats.pollsCreated >= 1,
    rarity: "COMMON"
  },
  {
    id: "survey_master",
    name: "Survey Master",
    description: "Created 10 surveys with 75+ reliability score",
    icon: "Target",
    category: "CREATION",
    criteria: (stats) => stats.highQualitySurveys >= 10,
    rarity: "EPIC"
  },
  {
    id: "participant_100",
    name: "Century Club",
    description: "Participated in 100 polls/surveys",
    icon: "Award",
    category: "PARTICIPATION",
    criteria: (stats) => stats.participations >= 100,
    rarity: "UNCOMMON"
  },
  {
    id: "streak_30",
    name: "On Fire",
    description: "30-day participation streak",
    icon: "Flame",
    category: "ENGAGEMENT",
    criteria: (stats) => stats.longestStreak >= 30,
    rarity: "RARE"
  },
  {
    id: "discussant",
    name: "Active Voice",
    description: "Posted 50 discussion comments",
    icon: "MessageSquare",
    category: "ENGAGEMENT",
    criteria: (stats) => stats.discussionPosts >= 50,
    rarity: "UNCOMMON"
  },
  {
    id: "verified_identity",
    name: "Identity Verified",
    description: "Completed Level 3+ verification",
    icon: "ShieldCheck",
    category: "SPECIAL",
    criteria: (stats) => stats.verificationLevel >= 3,
    rarity: "RARE"
  }
]

export { USER_BADGES }
export type { UserBadge }
```



# ═══════════════════════════════════════════════════════════════════════════════
# SOCIAL FEATURES
# ═══════════════════════════════════════════════════════════════════════════════

[DECISION P-022 UPDATED] VoxPoll includes comprehensive social features to enable
user interaction beyond content-based discussions.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        VOXPOLL SOCIAL FEATURES                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         FOLLOW SYSTEM                                    │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  - One-way following (like Twitter/Instagram)                           │   │
│  │  - See followed users' public content in Home feed                      │   │
│  │  - Get notified when followed users create new content                  │   │
│  │  - Profile shows followers/following counts                             │   │
│  │  - No approval required for public profiles                             │   │
│  │  - Private profiles require follow request approval                     │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         FRIENDS SYSTEM                                   │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  MUTUAL FOLLOW = FRIENDS                                                │   │
│  │  - When two users follow each other, they become "friends"              │   │
│  │  - Friends badge appears on profile                                     │   │
│  │  - Friends can see each other's friend-only content                     │   │
│  │  - Friends have priority in DM delivery                                 │   │
│  │  - Friends appear in separate "Friends" list in profile                 │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     DIRECT MESSAGING (DM)                                │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  - Send private messages to any user (with limits)                      │   │
│  │  - Text messages only (no media in DMs)                                 │   │
│  │  - Read receipts optional (user preference)                             │   │
│  │  - Block users to prevent messages                                      │   │
│  │  - Report inappropriate messages                                        │   │
│  │  - Message retention: 1 year (auto-delete older)                        │   │
│  │                                                                         │   │
│  │  DM LIMITS BY TIER:                                                     │   │
│  │  ─────────────────                                                      │   │
│  │  - Free: 5 DMs/day to non-friends, unlimited to friends                 │   │
│  │  - Plus: 25 DMs/day to non-friends, unlimited to friends                │   │
│  │  - Premium: Unlimited DMs                                               │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       PROFILE VISITS                                     │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  - Track who visited your profile (Plus/Premium only)                   │   │
│  │  - See list of recent profile visitors                                  │   │
│  │  - Anonymous visit option (Premium only)                                │   │
│  │  - Profile visit counts shown on stats                                  │   │
│  │  - Weekly profile insights email (optional)                             │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```
