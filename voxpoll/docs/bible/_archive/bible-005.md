# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 05                                    █
# █                    USER & ORGANIZATION MANAGEMENT                          █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████
#
# [CROSS-REFERENCES]
# → Bible-029 §29.2.2: Permission Caching Strategy (AUTHORITATIVE)
# → Bible-029 §29.3.2: Anonymous to Authenticated Conversion (AUTHORITATIVE)
# → Bible-029 §29.3.3: Subscription Downgrade User Flow (AUTHORITATIVE)
# → Bible-031 §31.4: Rate Limiting Thresholds (AUTHORITATIVE)




# ══════════════════════════════════════════════════════════════════════════════
# 5.1 USER ACCOUNT SYSTEM OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## 5.1.1 Account Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VOXPOLL ACCOUNT TYPES                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  INDIVIDUAL ACCOUNTS                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Personal use for participating in polls/surveys/tests                 │   │
│  │ • Can create public content (polls, personality tests)                  │   │
│  │ • Free tier available with premium upgrades                             │   │
│  │ • Verification levels 0-4 based on identity proof                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ORGANIZATION ACCOUNTS                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Business/institutional use for B2B survey features                    │   │
│  │ • Can create private surveys restricted to members                      │   │
│  │ • SSO integration for employee authentication                           │   │
│  │ • Advanced analytics and export capabilities                            │   │
│  │ • Subscription-based pricing                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.1.2 Account Lifecycle States

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// USER ACCOUNT STATES
// ══════════════════════════════════════════════════════════════════════════════

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




# ══════════════════════════════════════════════════════════════════════════════
# 5.2 REGISTRATION & AUTHENTICATION
# ══════════════════════════════════════════════════════════════════════════════

## 5.2.1 Registration Methods

| Method | Description | Verification Level | Use Case |
|--------|-------------|-------------------|----------|
| Email + Password | Traditional registration | Level 0 | Basic access |
| Phone + OTP | SMS verification required | Level 1 | Enhanced trust |
| OAuth (Google) | Google account linking | Level 0-1 | Quick signup |
| OAuth (Apple) | Apple ID linking | Level 0-1 | iOS users |
| SSO (SAML/OIDC) | Enterprise identity provider | Level 2 | Organization members |
| e-Government | National ID verification | Level 3-4 | High-trust surveys |


## 5.2.2 Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         INDIVIDUAL REGISTRATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Step 1: Initial Signup                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • User selects registration method (email/phone/OAuth)                  │   │
│  │ • Provides basic information: display name, email/phone                 │   │
│  │ • Accepts Terms of Service and Privacy Policy                           │   │
│  │ • [!] Consent checkboxes must be unchecked by default (GDPR)            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                              │                                                 │
│                              ▼                                                 │
│  Step 2: Primary Verification                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Email: Verification link sent (expires in 24 hours)                   │   │
│  │ • Phone: 6-digit OTP sent via SMS (expires in 10 minutes)               │   │
│  │ • OAuth: Redirect to provider, receive tokens                           │   │
│  │ • Max 3 OTP attempts before 1-hour cooldown                             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                              │                                                 │
│                              ▼                                                 │
│  Step 3: Profile Setup (Optional)                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Avatar upload (max 2MB, jpg/png/webp)                                 │   │
│  │ • Bio (max 500 characters)                                              │   │
│  │ • Demographics (for feed personalization, fully optional)               │   │
│  │ • Interest categories selection                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                              │                                                 │
│                              ▼                                                 │
│  Step 4: Account Ready                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Account status: ACTIVE                                                │   │
│  │ • Verification level: 0 (email only) or 1 (phone verified)              │   │
│  │ • User trust score initialized: 50                                      │   │
│  │ • Can immediately participate in public content                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.2.3 Authentication Methods

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════
// [P-049] CRITICAL SECURITY DECISION:
// ❌ Facebook OAuth: NEVER SUPPORTED (privacy concerns, data harvesting)
// ❌ Twitter/X OAuth: NEVER SUPPORTED (API instability, ownership changes)
// ✅ ONLY SUPPORTED: Google, Apple, e-Devlet, Email+Password, Phone OTP
// ══════════════════════════════════════════════════════════════════════════════

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


## 5.2.4 Password Requirements

[MUST] Password policy for email/password authentication:

| Requirement | Specification |
|-------------|---------------|
| Minimum length | 10 characters |
| Maximum length | 128 characters |
| Character classes | At least 3 of: uppercase, lowercase, number, symbol |
| Prohibited | Common passwords (top 10,000 list), user's email/name |
| History | Cannot reuse last 5 passwords |
| Expiration | No forced expiration (per NIST guidelines) |
| Breach check | Check against HaveIBeenPwned API on registration |

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PASSWORD VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const PASSWORD_REQUIREMENTS = {
  minLength: 10,
  maxLength: 128,
  minCharacterClasses: 3,
  historyCount: 5
} as const

const passwordSchema = z
  .string()
  .min(PASSWORD_REQUIREMENTS.minLength, "Password must be at least 10 characters")
  .max(PASSWORD_REQUIREMENTS.maxLength, "Password must be at most 128 characters")
  .refine(
    (password) => {
      const classes = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^a-zA-Z0-9]/.test(password)
      ].filter(Boolean).length
      return classes >= PASSWORD_REQUIREMENTS.minCharacterClasses
    },
    "Password must contain at least 3 character types (uppercase, lowercase, number, symbol)"
  )

export { passwordSchema, PASSWORD_REQUIREMENTS }
```


## 5.2.5 Session Management

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SESSION ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Token Structure:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Access Token (JWT)                                                      │   │
│  │ • Short-lived (15 minutes)                                              │   │
│  │ • Contains: userId, sessionId, orgId (if applicable), permissions       │   │
│  │ • Stored in memory only (not localStorage)                              │   │
│  │ • Sent via Authorization header                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Refresh Token                                                           │   │
│  │ • Long-lived (7-30 days based on auth method)                           │   │
│  │ • Stored in HttpOnly, Secure, SameSite=Strict cookie                    │   │
│  │ • Rotated on each use (refresh token rotation)                          │   │
│  │ • Bound to device fingerprint                                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Session Limits:                                                               │
│  • Maximum concurrent sessions per user: 5                                     │
│  • Maximum sessions per device: 1                                              │
│  • New login on 6th device terminates oldest session                           │
│                                                                                 │
│  [SECURITY] All sessions invalidated on:                                       │
│  • Password change                                                             │
│  • Security breach detection                                                   │
│  • User-initiated "logout all devices"                                         │
│  • Account suspension/ban                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 5.3 USER VERIFICATION LEVELS
# ══════════════════════════════════════════════════════════════════════════════

## 5.3.1 Verification Level Overview

Verification levels determine user trust and access to features.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        VERIFICATION LEVELS (0-4)                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Level 0: UNVERIFIED                                                           │
│  ─────────────────────────────────────────────────────────────                 │
│  Requirements: Email address only (unverified or OAuth without phone)          │
│  Trust Score Impact: -10 penalty                                               │
│  Capabilities:                                                                 │
│  • View public content                                                         │
│  • Participate in public polls (responses weighted 0.5x)                       │
│  • Cannot create content                                                       │
│  • Cannot access discussions                                                   │
│                                                                                 │
│  Level 1: BASIC                                                                │
│  ─────────────────────────────────────────────────────────────                 │
│  Requirements: Verified phone number via SMS OTP                               │
│  Trust Score Impact: Baseline (no modifier)                                    │
│  Capabilities:                                                                 │
│  • All Level 0 capabilities                                                    │
│  • Participate in all public content (standard weight)                         │
│  • Create public polls and personality tests                                   │
│  • Access discussions for participated content                                 │
│  • Basic profile customization                                                 │
│                                                                                 │
│  Level 2: VERIFIED                                                             │
│  ─────────────────────────────────────────────────────────────                 │
│  Requirements: Organization SSO OR secondary verification method               │
│  Trust Score Impact: +10 bonus                                                 │
│  Capabilities:                                                                 │
│  • All Level 1 capabilities                                                    │
│  • Participate in private organization surveys                                 │
│  • Create public surveys                                                       │
│  • Eligible for "Verified Creator" badge                                       │
│  • Priority in stratified sampling                                             │
│                                                                                 │
│  Level 3: IDENTITY VERIFIED                                                    │
│  ─────────────────────────────────────────────────────────────                 │
│  Requirements: Government ID verification (e-Devlet, ID.me, etc.)              │
│  Trust Score Impact: +20 bonus                                                 │
│  Capabilities:                                                                 │
│  • All Level 2 capabilities                                                    │
│  • Participate in high-security surveys (government, healthcare)               │
│  • Eligible for research-grade survey participation                            │
│  • Can be organization admin                                                   │
│  • Demographic data verified (age, location)                                   │
│                                                                                 │
│  Level 4: FULLY VERIFIED                                                       │
│  ─────────────────────────────────────────────────────────────                 │
│  Requirements: Level 3 + biometric verification + address verification         │
│  Trust Score Impact: +30 bonus                                                 │
│  Capabilities:                                                                 │
│  • All Level 3 capabilities                                                    │
│  • Participate in premium research panels                                      │
│  • Eligible for paid survey participation                                      │
│  • Can create organization accounts                                            │
│  • Maximum response weight (1.5x)                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.3.2 Verification Level Constants

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// VERIFICATION LEVEL DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

type VerificationLevel = 0 | 1 | 2 | 3 | 4

interface VerificationLevelConfig {
  level: VerificationLevel
  name: string
  description: string
  requirements: string[]
  trustScoreModifier: number
  responseWeightMultiplier: number
  capabilities: string[]
  icon: string
}

const VERIFICATION_LEVELS: Record<VerificationLevel, VerificationLevelConfig> = {
  0: {
    level: 0,
    name: "Unverified",
    description: "Email only, limited access",
    requirements: ["Email address"],
    trustScoreModifier: -10,
    responseWeightMultiplier: 0.5,
    capabilities: ["view_public", "participate_polls_limited"],
    icon: "CircleDashed"
  },
  1: {
    level: 1,
    name: "Basic",
    description: "Phone verified, standard access",
    requirements: ["Verified phone number"],
    trustScoreModifier: 0,
    responseWeightMultiplier: 1.0,
    capabilities: ["view_public", "participate_all_public", "create_polls", "discussions"],
    icon: "Circle"
  },
  2: {
    level: 2,
    name: "Verified",
    description: "Organization or secondary verification",
    requirements: ["SSO login", "OR secondary method (2FA app + selfie)"],
    trustScoreModifier: 10,
    responseWeightMultiplier: 1.1,
    capabilities: ["participate_private", "create_surveys", "verified_badge"],
    icon: "CheckCircle"
  },
  3: {
    level: 3,
    name: "Identity Verified",
    description: "Government ID verified",
    requirements: ["e-Government verification", "OR ID document + liveness check"],
    trustScoreModifier: 20,
    responseWeightMultiplier: 1.2,
    capabilities: ["high_security_surveys", "research_grade", "org_admin"],
    icon: "BadgeCheck"
  },
  4: {
    level: 4,
    name: "Fully Verified",
    description: "Maximum verification level",
    requirements: ["Level 3", "Biometric verification", "Address verification"],
    trustScoreModifier: 30,
    responseWeightMultiplier: 1.5,
    capabilities: ["premium_panels", "paid_surveys", "create_organization"],
    icon: "ShieldCheck"
  }
}

export type { VerificationLevel, VerificationLevelConfig }
export { VERIFICATION_LEVELS }
```

### Verification Level → Feature Access Matrix

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// VERIFICATION LEVEL TO FEATURE ACCESS MAPPING
// [AUTHORITATIVE] Defines what each verification level can do
// ═══════════════════════════════════════════════════════════════════════════════

const VERIFICATION_FEATURE_MATRIX = {
  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT PARTICIPATION
  // ─────────────────────────────────────────────────────────────────────────────
  participation: {
    viewPublicPolls: { minLevel: 0, note: "Everyone can view" },
    voteOnPublicPolls: { minLevel: 0, note: "Even unverified can vote" },
    voteOnRestrictedPolls: { minLevel: 1, note: "Phone verified required" },
    participateInSurveys: { minLevel: 1, note: "Surveys require basic verification" },
    participateInPaidSurveys: { minLevel: 4, note: "Payment requires full identity" },
    participateInResearchSurveys: { minLevel: 3, note: "Research-grade requires ID" },
    takeTests: { minLevel: 1, note: "Tests require basic verification" }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT CREATION
  // ─────────────────────────────────────────────────────────────────────────────
  creation: {
    createQuickPolls: { minLevel: 1, note: "Basic creators" },
    createExtendedPolls: { minLevel: 1, note: "With tier upgrade for features" },
    createLivePolls: { minLevel: 2, note: "Requires enhanced trust" },
    createSurveys: { minLevel: 2, note: "B2B feature, higher trust needed" },
    createTests: { minLevel: 2, note: "Educational content creation" },
    createPrivateContent: { minLevel: 1, note: "Private links available to all" }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SOCIAL FEATURES
  // ─────────────────────────────────────────────────────────────────────────────
  social: {
    followUsers: { minLevel: 0, note: "Basic social" },
    postComments: { minLevel: 1, note: "Prevent spam from unverified" },
    voteOnComments: { minLevel: 0, note: "Low friction engagement" },
    createDiscussions: { minLevel: 1, note: "Discussion creation" },
    reportContent: { minLevel: 0, note: "Anyone can report" }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ORGANIZATION FEATURES
  // ─────────────────────────────────────────────────────────────────────────────
  organization: {
    createOrganization: { minLevel: 4, note: "Full verification for business" },
    joinOrganization: { minLevel: 1, note: "Invitation-based" },
    becomeOrgAdmin: { minLevel: 3, note: "Identity verified for admin" },
    accessEnterpriseFeatures: { minLevel: 2, note: "SSO-verified org members" }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RESPONSE WEIGHTING IN ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────────
  responseWeight: {
    0: { multiplier: 0.5, label: "Reduced weight" },
    1: { multiplier: 1.0, label: "Standard weight" },
    2: { multiplier: 1.1, label: "Slight bonus" },
    3: { multiplier: 1.2, label: "Trusted weight" },
    4: { multiplier: 1.5, label: "Premium weight" }
  }
} as const

// Check if user can perform action
function canPerformAction(
  userVerificationLevel: 0 | 1 | 2 | 3 | 4,
  category: keyof typeof VERIFICATION_FEATURE_MATRIX,
  action: string
): boolean {
  const categoryConfig = VERIFICATION_FEATURE_MATRIX[category]
  if (!categoryConfig || !(action in categoryConfig)) {
    return false
  }
  const featureConfig = categoryConfig[action as keyof typeof categoryConfig]
  if ('minLevel' in featureConfig) {
    return userVerificationLevel >= featureConfig.minLevel
  }
  return false
}

// Get response weight multiplier
function getResponseWeight(verificationLevel: 0 | 1 | 2 | 3 | 4): number {
  return VERIFICATION_FEATURE_MATRIX.responseWeight[verificationLevel].multiplier
}

export { VERIFICATION_FEATURE_MATRIX, canPerformAction, getResponseWeight }
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               VERIFICATION LEVEL QUICK REFERENCE TABLE                       │
├───────┬─────────────────────────────────────────────────────────────────────┤
│ Level │ Can Do                                                              │
├───────┼─────────────────────────────────────────────────────────────────────┤
│   0   │ View polls, vote (public), follow users, report content             │
│       │ Weight: 0.5x (reduced influence in analytics)                       │
├───────┼─────────────────────────────────────────────────────────────────────┤
│   1   │ + Create polls, comment, join orgs, participate surveys/tests       │
│       │ Weight: 1.0x (standard)                                             │
├───────┼─────────────────────────────────────────────────────────────────────┤
│   2   │ + Create surveys/tests, live polls, access org enterprise features  │
│       │ Weight: 1.1x (trusted)                                              │
├───────┼─────────────────────────────────────────────────────────────────────┤
│   3   │ + Research-grade surveys, org admin role, high-security content     │
│       │ Weight: 1.2x (identity verified)                                    │
├───────┼─────────────────────────────────────────────────────────────────────┤
│   4   │ + Create organizations, paid surveys, premium panels                │
│       │ Weight: 1.5x (fully verified premium)                               │
└───────┴─────────────────────────────────────────────────────────────────────┘
```

### Verification Level + Subscription Tier Combined Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│      VERIFICATION LEVEL + SUBSCRIPTION TIER = COMBINED PERMISSIONS              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [!] IMPORTANT: Both systems are INDEPENDENT and ADDITIVE                       │
│                                                                                 │
│  • Verification Level: Trust/identity verification (security)                   │
│  • Subscription Tier: Feature access (monetization)                             │
│                                                                                 │
│  Example: A user needs BOTH Level 1 verification AND Premium tier to            │
│           create a Live Poll (Level 2 for creation + Premium for feature)       │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ACTION                     │ MIN LEVEL │ MIN TIER │ NOTES                      │
│  ───────────────────────────┼───────────┼──────────┼──────────────────────────  │
│  View public polls          │     0     │   Free   │ Everyone                   │
│  Vote on public polls       │     0     │   Free   │ Anonymous allowed          │
│  Create Quick Poll          │     1     │   Free   │ 3/day limit (Free tier)    │
│  Create Extended Poll       │     1     │ Premium  │ Full features              │
│  Create Live Poll           │     2     │ Premium  │ Real-time WebSocket        │
│  Create Survey              │     2     │   Org    │ B2B only                   │
│  Create Test                │     2     │   Free   │ 3/week (Free), ∞ (Premium) │
│  View PULSE without voting  │     0     │   Plus   │ Key monetization feature   │
│  Post in COMMENTS           │     1     │   Free   │ Must participate OR Plus   │
│  Use Pre-test for Poll      │     1     │ Premium  │ Screening questions        │
│  Target audience filtering  │     1     │ Premium  │ Demographic targeting      │
│  Create Organization        │     4     │   N/A    │ Full identity required     │
│  Access paid surveys        │     4     │   Free   │ Earn money from surveys    │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  TIER LIMITS QUICK REFERENCE:                                                   │
│  ─────────────────────────────                                                  │
│  Free:    3 polls/day, 3 tests/week, 5 DMs/day (non-friends)                   │
│  Plus:    10 polls/day, 10 tests/week, 25 DMs/day, PULSE/COMMENTS access       │
│  Premium: Unlimited polls & tests, unlimited DMs, all features                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.3.3 Verification Upgrade Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      VERIFICATION UPGRADE PROCESS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Level 0 → Level 1 (Phone Verification)                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 1. User enters phone number                                             │   │
│  │ 2. System sends 6-digit OTP via SMS                                     │   │
│  │ 3. User enters OTP within 10 minutes                                    │   │
│  │ 4. Phone number linked to account                                       │   │
│  │ 5. Level upgraded immediately                                           │   │
│  │                                                                         │   │
│  │ Constraints:                                                            │   │
│  │ • One phone number per account                                          │   │
│  │ • Phone number cannot be used by another account                        │   │
│  │ • 3 OTP attempts, then 1-hour cooldown                                  │   │
│  │ • Phone change requires re-verification + 7-day waiting period          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Level 1 → Level 2 (Secondary Verification)                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Option A: Organization SSO                                              │   │
│  │ • Join organization via invitation link                                 │   │
│  │ • Complete SSO authentication                                           │   │
│  │ • Automatic upgrade upon successful SSO                                 │   │
│  │                                                                         │   │
│  │ Option B: Enhanced Verification                                         │   │
│  │ • Enable 2FA with authenticator app                                     │   │
│  │ • Complete email re-verification                                        │   │
│  │ • Submit selfie for basic liveness check                                │   │
│  │ • Manual review (24-48 hours)                                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Level 2 → Level 3 (Identity Verification)                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Option A: e-Government (Turkey: e-Devlet)                               │   │
│  │ • Redirect to e-Government portal                                       │   │
│  │ • User authenticates with national ID                                   │   │
│  │ • Receive verified: full name, birth date, citizenship                  │   │
│  │ • Automatic upgrade upon successful verification                        │   │
│  │                                                                         │   │
│  │ Option B: ID Document Verification                                      │   │
│  │ • Upload government-issued ID (front + back)                            │   │
│  │ • Complete liveness check (video selfie)                                │   │
│  │ • AI + manual review (24-72 hours)                                      │   │
│  │ • May require additional documentation                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Level 3 → Level 4 (Full Verification)                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Requirements:                                                           │   │
│  │ • Biometric verification (fingerprint or face ID on device)             │   │
│  │ • Address verification (utility bill or bank statement)                 │   │
│  │ • Phone number ownership confirmation (carrier verification)            │   │
│  │ • Account age minimum: 30 days at Level 3                               │   │
│  │                                                                         │   │
│  │ Review Process:                                                         │   │
│  │ • Automated checks + manual review                                      │   │
│  │ • Processing time: 3-5 business days                                    │   │
│  │ • May require video call verification for edge cases                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.3.4 Verification Data Storage

[SECURITY] Verification data is handled with strict security measures:

| Data Type | Storage | Retention | Access |
|-----------|---------|-----------|--------|
| Phone number | Encrypted (AES-256) | Account lifetime | User, Admin |
| ID document images | Not stored after verification | Deleted after 7 days | Verification system only |
| Government ID number | Hashed (SHA-256 + salt) | Account lifetime | Verification system only |
| Biometric data | Not stored (on-device only) | N/A | N/A |
| Verification status | Plain | Account lifetime | Public (level only) |
| Verification history | Encrypted | 2 years | Admin audit only |

[MUST] ID documents and biometric data are NEVER stored permanently.
[MUST] Only verification result (pass/fail) and level are retained.




# ══════════════════════════════════════════════════════════════════════════════
# 5.4 USER PROFILE SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 5.4.1 Profile Data Structure

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// USER PROFILE SCHEMA
// ══════════════════════════════════════════════════════════════════════════════

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
  
  // ══════════════════════════════════════════════════════════════════════════
  // LOCKED DEMOGRAPHICS - IMMUTABLE AFTER REGISTRATION
  // [DECISION P-012] Demographics are locked to prevent gaming survey targeting
  // ══════════════════════════════════════════════════════════════════════════
  demographics: z.object({
    // IMMUTABLE FIELDS - Cannot be changed after registration
    birthYear: z.number().int().min(1900).max(2010),        // LOCKED
    birthMonth: z.number().int().min(1).max(12),            // LOCKED
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]), // LOCKED - matches BIBLE-013
    country: z.string().length(2),                          // LOCKED
    region: z.string().max(100).optional(),                 // LOCKED
    city: z.string().max(100).optional(),                   // LOCKED
    educationLevel: z.enum([                                // LOCKED - matches BIBLE-013 EducationLevel
      "PRIMARY", "SECONDARY", "HIGH_SCHOOL", "ASSOCIATE",
      "BACHELOR", "MASTER", "DOCTORATE", "OTHER"
    ]).optional(),

    // MUTABLE FIELDS - Can be updated by user
    maritalStatus: z.enum([                                 // MUTABLE - UPPERCASE convention
      "SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "PREFER_NOT_TO_SAY"
    ]).optional(),
    profession: z.string().max(100).optional(),             // MUTABLE
    employmentStatus: z.enum([                              // MUTABLE - matches BIBLE-013 EmploymentStatus
      "EMPLOYED_FULL", "EMPLOYED_PART", "SELF_EMPLOYED",
      "UNEMPLOYED", "STUDENT", "RETIRED", "OTHER"
    ]).optional()
  }),

  // Timestamp when demographics were locked
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


## 5.4.2 Locked Demographics System

[DECISION P-012] Demographics are LOCKED after registration to ensure data integrity
and prevent users from gaming survey/poll targeting by changing their demographics.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    LOCKED DEMOGRAPHICS SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  IMMUTABLE FIELDS (Cannot be changed after registration):                       │
│  ─────────────────────────────────────────────────────────                      │
│  • Birth Year & Month     - Age verification, survey targeting                  │
│  • Gender                 - Demographic research integrity                      │
│  • Country                - Geographic research integrity                       │
│  • Region/City            - Location-based survey targeting                     │
│  • Education Level        - Socioeconomic research integrity                    │
│                                                                                 │
│  MUTABLE FIELDS (Can be updated by user):                                       │
│  ─────────────────────────────────────────                                      │
│  • Marital Status         - Life circumstances change                           │
│  • Profession             - Career changes are natural                          │
│  • Employment Status      - Employment situation changes                        │
│                                                                                 │
│  WHY LOCK DEMOGRAPHICS?                                                         │
│  ─────────────────────────                                                      │
│  • Prevents users from changing age to access different surveys                 │
│  • Ensures survey creators get authentic demographic data                       │
│  • Maintains integrity of target audience filtering                             │
│  • Prevents "demographic fraud" for incentivized surveys                        │
│                                                                                 │
│  EXCEPTION PROCESS:                                                             │
│  ─────────────────────                                                          │
│  • User can request demographic correction ONCE                                 │
│  • Requires manual verification by support team                                 │
│  • Supporting documentation may be required (ID verification)                   │
│  • All survey participations flagged for potential data quality review          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DEMOGRAPHIC FIELD MUTABILITY RULES
// ══════════════════════════════════════════════════════════════════════════════

const DEMOGRAPHIC_MUTABILITY = {
  IMMUTABLE: {
    fields: ["birthYear", "birthMonth", "gender", "country", "region", "city", "educationLevel"],
    reason: "Locked to prevent gaming survey targeting",
    changeProcess: "Support ticket with verification required"
  },
  MUTABLE: {
    fields: ["maritalStatus", "profession", "employmentStatus"],
    reason: "Life circumstances naturally change",
    changeProcess: "User can update freely in settings"
  }
} as const

// Check if a demographic field can be updated
function canUpdateDemographic(field: string): boolean {
  return DEMOGRAPHIC_MUTABILITY.MUTABLE.fields.includes(field)
}

// Attempt to update demographic - throws if immutable
async function updateDemographic(
  userId: string,
  field: string,
  value: unknown
): Promise<void> {
  if (!canUpdateDemographic(field)) {
    throw new Error(`DEMOGRAPHIC_LOCKED: ${field} cannot be changed. Contact support for corrections.`)
  }

  await db.userDemographics.update({
    where: { userId },
    data: { [field]: value }
  })
}

export { DEMOGRAPHIC_MUTABILITY, canUpdateDemographic, updateDemographic }
```


## 5.4.3 Profile Visibility Settings

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


## 5.4.3 Profile Display

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER PROFILE VIEW                                  │
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
│  [BarChart3] 23 polls created    [ClipboardCheck] 156 participations          │
│  [MessageSquare] 45 discussions  [Calendar] Member since Jan 2025              │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  Badges:                                                                       │
│  [Star] Early Adopter   [Target] Survey Master   [Flame] 30-Day Streak        │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  Recent Activity:                                                              │
│  • Participated in "Best Coffee Chains 2026" - 2 hours ago                    │
│  • Created "Tech Salary Survey" - 1 day ago                                   │
│  • Commented on "Political Compass Results" - 3 days ago                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.4.4 User Badges (Achievements)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// USER ACHIEVEMENT BADGES
// ══════════════════════════════════════════════════════════════════════════════

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




# ══════════════════════════════════════════════════════════════════════════════
# 5.5 ORGANIZATION MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════

## 5.5.1 Organization Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ORGANIZATION TYPES                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [Building2] CORPORATE                                                         │
│  ─────────────────────────────────────────────────────────────                 │
│  Private companies and businesses                                              │
│  • Employee surveys, internal feedback                                         │
│  • Customer satisfaction, market research                                      │
│  • Full SSO integration, advanced analytics                                    │
│  • White-label options available                                               │
│                                                                                 │
│  [Landmark] GOVERNMENT                                                         │
│  ─────────────────────────────────────────────────────────────                 │
│  Municipalities, government agencies, public institutions                      │
│  • Citizen feedback, public service evaluation                                 │
│  • e-Government integration for verified citizens                              │
│  • Enhanced data residency and compliance                                      │
│  • Public transparency reports                                                 │
│                                                                                 │
│  [GraduationCap] EDUCATIONAL                                                   │
│  ─────────────────────────────────────────────────────────────                 │
│  Universities, schools, research institutions                                  │
│  • Student/faculty surveys, course evaluations                                 │
│  • Academic research data collection                                           │
│  • IRB compliance features                                                     │
│  • Educational pricing                                                         │
│                                                                                 │
│  [HeartPulse] HEALTHCARE                                                       │
│  ─────────────────────────────────────────────────────────────                 │
│  Hospitals, clinics, healthcare providers                                      │
│  • Patient satisfaction, staff feedback                                        │
│  • Enhanced privacy controls                                                   │
│  • HIPAA-aware features (for US expansion)                                     │
│  • Sensitive data handling                                                     │
│                                                                                 │
│  [Users] NON-PROFIT                                                            │
│  ─────────────────────────────────────────────────────────────                 │
│  NGOs, charities, community organizations                                      │
│  • Volunteer/donor feedback                                                    │
│  • Community needs assessment                                                  │
│  • Non-profit pricing (50% discount)                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.5.2 Organization Data Structure

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION SCHEMA
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

// OrganizationType - AUTHORITATIVE DEFINITION in BIBLE-013.md
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


## 5.5.3 Organization Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION CREATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Prerequisites:                                                                │
│  • User must have verification level 4 (Fully Verified)                        │
│  • User must accept Organization Admin Terms                                   │
│                                                                                 │
│  Step 1: Basic Information                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Organization name                                                      │   │
│  │ • Organization type (Corporate/Government/Educational/etc.)              │   │
│  │ • Industry/sector                                                        │   │
│  │ • Organization size                                                      │   │
│  │ • Country of operation                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                              │                                                 │
│                              ▼                                                 │
│  Step 2: Verification (Optional but recommended)                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Options:                                                                │   │
│  │ • Business registration document upload                                 │   │
│  │ • Domain ownership verification (DNS TXT record)                        │   │
│  │ • Official email from corporate domain                                  │   │
│  │                                                                         │   │
│  │ Benefits of verification:                                               │   │
│  │ • [Building2] Organization badge on all content                         │   │
│  │ • Higher reliability score boost for surveys                            │   │
│  │ • Access to government/enterprise features                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                              │                                                 │
│                              ▼                                                 │
│  Step 3: Subscription Selection                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Select subscription plan (Starter/Professional/Enterprise)            │   │
│  │ • 14-day free trial available for all plans                             │   │
│  │ • Payment method setup (credit card or invoice)                         │   │
│  │ • Billing contact information                                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                              │                                                 │
│                              ▼                                                 │
│  Step 4: Initial Setup                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ • Upload organization logo                                              │   │
│  │ • Configure default settings                                           │   │
│  │ • Invite first team members (optional)                                  │   │
│  │ • Configure SSO (optional, Enterprise only)                             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 5.6 ORGANIZATION ROLES & PERMISSIONS
# ══════════════════════════════════════════════════════════════════════════════

## 5.6.1 Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION ROLE HIERARCHY                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                         ┌───────────────┐                                    │
│                         │     OWNER     │                                    │
│                         │  [Crown]      │                                    │
│                         └───────┬───────┘                                    │
│                                 │                                              │
│                         ┌───────┴───────┐                                    │
│                         │     ADMIN     │                                    │
│                         │  [Shield]     │                                    │
│                         └───────┬───────┘                                    │
│                                 │                                              │
│              ┌───────────────────┼───────────────────┐                       │
│              │                   │                   │                       │
│      ┌───────┴───────┐   ┌───────┴───────┐   ┌───────┴───────┐            │
│      │    MANAGER    │   │    ANALYST    │   │    CREATOR    │            │
│      │  [UserCog]    │   │  [LineChart]  │   │  [PenTool]    │            │
│      └───────────────┘   └───────────────┘   └───────────────┘            │
│                                 │                                              │
│                         ┌───────┴───────┐                                    │
│                         │    MEMBER     │                                    │
│                         │  [User]       │                                    │
│                         └───────────────┘                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.6.2 Role Definitions

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION ROLES
// ══════════════════════════════════════════════════════════════════════════════

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


## 5.6.3 Permission Matrix

| Permission | Owner | Admin | Manager | Analyst | Creator | Member |
|------------|-------|-------|---------|---------|---------|--------|
| Delete organization | ✓ | | | | | |
| Manage billing | ✓ | | | | | |
| Transfer ownership | ✓ | | | | | |
| Manage SSO | ✓ | ✓ | | | | |
| Manage admins | ✓ | | | | | |
| Manage members | ✓ | ✓ | ✓ | | | |
| Edit org settings | ✓ | ✓ | | | | |
| View audit logs | ✓ | ✓ | | | | |
| Create surveys | ✓ | ✓ | ✓ | | ✓ | |
| Edit any survey | ✓ | ✓ | ✓ | | | |
| View all results | ✓ | ✓ | ✓ | ✓ | | |
| Export data | ✓ | ✓ | ✓ | ✓ | | |
| View own results | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Participate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |


## 5.6.4 Permission Constants

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION PERMISSIONS
// ══════════════════════════════════════════════════════════════════════════════

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


## 5.6.5 Member Offboarding Policy

### [DECISION P-033] Organization Member Offboarding & Data Handling

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION MEMBER OFFBOARDING POLICY
// Defines what happens when a member is removed or leaves an organization
// ═══════════════════════════════════════════════════════════════════════════════

const ORG_MEMBER_OFFBOARDING = {
  // ─────────────────────────────────────────────────────────────────────────────
  // DATA HANDLING ON REMOVAL
  // ─────────────────────────────────────────────────────────────────────────────
  dataHandling: {
    // Survey responses created by the member
    surveyResponses: "ANONYMIZE",       // Keep data, remove user link
    // Surveys created by the member
    surveysCreated: "TRANSFER",         // Transfer ownership to org admin
    // Analytics/reports generated
    reports: "RETAIN",                  // Keep with org, creator info removed
    // Audit logs involving the member
    auditLogs: "RETAIN_90_DAYS",        // Keep for compliance, then anonymize
    // Comments/discussions
    comments: "ANONYMIZE"               // Keep content, show as "Former member"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PERSONAL DATA (GDPR/KVKK COMPLIANCE)
  // ─────────────────────────────────────────────────────────────────────────────
  personalData: {
    // Personal info stored in org context
    action: "DELETE",                   // Delete personal data from org records
    retentionDays: 30,                  // Grace period before deletion
    exportBeforeDelete: true,           // Offer data export to user

    // What gets deleted
    deletedFields: [
      "memberProfile",
      "accessLogs",
      "deviceHistory",
      "emailPreferences"
    ],

    // What stays (anonymized)
    retainedAnonymized: [
      "responseData",                   // Survey responses (no user link)
      "aggregatedMetrics",              // Contribution to org statistics
      "contentCreated"                  // Surveys/content transferred to admin
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ACCESS REVOCATION
  // ─────────────────────────────────────────────────────────────────────────────
  accessRevocation: {
    immediateRevocation: true,          // Access removed immediately
    invalidateSessions: true,           // All active sessions terminated
    revokeAPIKeys: true,                // Any API keys deactivated
    removeFromTeams: true,              // Remove from all teams/groups
    removeNotifications: true           // Stop all org notifications
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  notifications: {
    notifyMember: true,                 // Email member about removal
    notifyAdmins: true,                 // Notify org admins
    notifyAffectedTeams: false,         // Don't notify team members

    // Email templates
    emailTemplates: {
      voluntary: "org.member.left",
      removed: "org.member.removed",
      admin: "org.member.offboarded"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // OFFBOARDING TYPES
  // ─────────────────────────────────────────────────────────────────────────────
  offboardingTypes: {
    VOLUNTARY: {
      // User leaves on their own
      gracePeroid: 0,                   // Immediate
      canRejoin: true,                  // Can be re-invited
      dataTreatment: "FULL_OFFBOARD"
    },
    REMOVED: {
      // Admin removes user
      gracePeroid: 0,
      canRejoin: true,                  // Admin can re-invite
      dataTreatment: "FULL_OFFBOARD"
    },
    ACCOUNT_DELETED: {
      // User deleted their VoxPoll account
      gracePeroid: 30,                  // 30 day grace for account recovery
      canRejoin: false,
      dataTreatment: "FULL_ANONYMIZATION"
    },
    BANNED: {
      // User banned for policy violation
      gracePeroid: 0,
      canRejoin: false,
      dataTreatment: "FULL_OFFBOARD",
      flagForAudit: true
    }
  }
}

// Offboard member function
async function offboardOrganizationMember(
  organizationId: string,
  userId: string,
  offboardingType: keyof typeof ORG_MEMBER_OFFBOARDING.offboardingTypes,
  performedBy: string
): Promise<OffboardingResult> {
  const config = ORG_MEMBER_OFFBOARDING.offboardingTypes[offboardingType]
  const policy = ORG_MEMBER_OFFBOARDING

  // Step 1: Revoke access immediately
  if (policy.accessRevocation.immediateRevocation) {
    await db.organizationMember.update({
      where: { organizationId_userId: { organizationId, userId } },
      data: { status: "INACTIVE", removedAt: new Date() }
    })

    if (policy.accessRevocation.invalidateSessions) {
      await invalidateUserSessions(userId, organizationId)
    }
  }

  // Step 2: Handle surveys created by member
  if (policy.dataHandling.surveysCreated === "TRANSFER") {
    const orgAdmins = await getOrgAdmins(organizationId)
    await db.survey.updateMany({
      where: { organizationId, createdById: userId },
      data: { createdById: orgAdmins[0].userId }  // Transfer to first admin
    })
  }

  // Step 3: Anonymize survey responses
  if (policy.dataHandling.surveyResponses === "ANONYMIZE") {
    await db.surveyResponse.updateMany({
      where: { survey: { organizationId }, respondentId: userId },
      data: {
        respondentId: null,
        anonymizedAt: new Date(),
        anonymizedReason: offboardingType
      }
    })
  }

  // Step 4: Schedule personal data deletion
  await db.scheduledDeletion.create({
    data: {
      entityType: "ORG_MEMBER_DATA",
      entityId: `${organizationId}:${userId}`,
      scheduledFor: new Date(Date.now() + policy.personalData.retentionDays * 86400000),
      reason: offboardingType
    }
  })

  // Step 5: Create audit log
  await db.auditLog.create({
    data: {
      organizationId,
      action: "MEMBER_OFFBOARDED",
      targetUserId: userId,
      performedById: performedBy,
      details: { offboardingType, config }
    }
  })

  // Step 6: Send notifications
  if (policy.notifications.notifyMember) {
    await sendEmail(userId, policy.notifications.emailTemplates[offboardingType === "VOLUNTARY" ? "voluntary" : "removed"])
  }

  return {
    success: true,
    offboardingType,
    dataAnonymized: true,
    deletionScheduled: new Date(Date.now() + policy.personalData.retentionDays * 86400000)
  }
}

interface OffboardingResult {
  success: boolean
  offboardingType: string
  dataAnonymized: boolean
  deletionScheduled: Date
}

export { ORG_MEMBER_OFFBOARDING, offboardOrganizationMember }
export type { OffboardingResult }
```


## 5.6.6 Member Invitation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       MEMBER INVITATION METHODS                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Method 1: Email Invitation                                                    │
│  ─────────────────────────────────────────────────────────────                 │
│  • Admin enters email address and selects role                                  │
│  • Invitation email sent with unique link                                      │
│  • Link expires in 7 days                                                      │
│  • User creates account or links existing account                              │
│  • Role assigned upon acceptance                                               │
│                                                                                 │
│  Method 2: Domain Auto-Join                                                    │
│  ─────────────────────────────────────────────────────────────                 │
│  • Organization verifies domain ownership                                      │
│  • Users with @domain.com email can auto-join                                  │
│  • Default role: MEMBER (configurable)                                         │
│  • Optional: Admin approval required                                           │
│                                                                                 │
│  Method 3: SSO Auto-Provisioning (Enterprise)                                  │
│  ─────────────────────────────────────────────────────────────                 │
│  • User authenticates via SSO                                                  │
│  • Account automatically created if not exists                                 │
│  • Role determined by IdP groups/attributes                                    │
│  • Verification level: 2 (automatic)                                           │
│                                                                                 │
│  Method 4: Bulk Import (Enterprise)                                            │
│  ─────────────────────────────────────────────────────────────                 │
│  • Upload CSV with email addresses and roles                                   │
│  • System validates and sends batch invitations                                │
│  • Progress tracking and error reporting                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.6.7 Member Invitation UI Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     INVITE MEMBERS UI (/org/:slug/settings/members)              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Üyeler (12)                                          [+ Üye Davet Et]    │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  [Tüm Üyeler] [Adminler (2)] [Bekleyen Davetler (3)]                      │ │
│  │                                                                           │ │
│  │  🔍 Üye ara...                                                            │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  👤 Ahmet Yılmaz               @ahmet_yilmaz           ⭐ Sahip     │  │ │
│  │  │     ahmet@acmecorp.com         Katılım: 1 Ocak 2025                 │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  👤 Zeynep Kaya                @zeynep_kaya            Admin   [···]│  │ │
│  │  │     zeynep@acmecorp.com        Katılım: 15 Ocak 2025                │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  👤 Can Demir                  @can_demir              Creator  [···]│  │ │
│  │  │     can@acmecorp.com           Katılım: 20 Ocak 2025                │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  MEMBER OPTIONS MENU ([···])                                                    │
│  ───────────────────────────                                                    │
│                                                                                 │
│  ┌────────────────────────────────────┐                                         │
│  │ Rolü Değiştir                  ▶   │                                         │
│  │ Aktiviteleri Görüntüle             │                                         │
│  │ ─────────────────────────          │                                         │
│  │ Organizasyondan Çıkar              │                                         │
│  └────────────────────────────────────┘                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.6.8 Invite Member Dialog Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     INVITE MEMBER DIALOG                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STEP 1: Enter Email(s)                                                         │
│  ───────────────────────                                                        │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Üye Davet Et                                                   [✕]       │ │
│  ├────────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                            │ │
│  │  E-posta adresleri                                                         │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐    │ │
│  │  │ mehmet@acmecorp.com, elif@acmecorp.com                             │    │ │
│  │  └────────────────────────────────────────────────────────────────────┘    │ │
│  │  ℹ️ Birden fazla e-posta için virgül kullanın                              │ │
│  │                                                                            │ │
│  │  Rol                                                                       │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐    │ │
│  │  │ Creator                                                        ▼   │    │ │
│  │  └────────────────────────────────────────────────────────────────────┘    │ │
│  │                                                                            │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐    │ │
│  │  │ 📋 ROL AÇIKLAMALARI                                                │    │ │
│  │  │                                                                    │    │ │
│  │  │ Admin     - Tüm ayarları yönetebilir, üye davet edebilir           │    │ │
│  │  │ Manager   - Anketleri yönetebilir, raporlara erişebilir            │    │ │
│  │  │ Analyst   - Sadece raporları görüntüleyebilir                      │    │ │
│  │  │ Creator   - Anket oluşturabilir, kendi anketlerini yönetebilir     │    │ │
│  │  │ Member    - Sadece katılım (çalışan anketi için)                   │    │ │
│  │  └────────────────────────────────────────────────────────────────────┘    │ │
│  │                                                                            │ │
│  │  Kişisel mesaj (opsiyonel)                                                 │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐    │ │
│  │  │ Merhaba, seni VoxPoll organizasyonumuza davet ediyorum.            │    │ │
│  │  └────────────────────────────────────────────────────────────────────┘    │ │
│  │                                                                            │ │
│  │  ─────────────────────────────────────────────────────────────────────    │ │
│  │                                                                            │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐      │ │
│  │  │                     Davet Gönder (2 kişi)                        │      │ │
│  │  └──────────────────────────────────────────────────────────────────┘      │ │
│  │                                                                            │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  STEP 2: Confirmation                                                           │
│  ────────────────────                                                           │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ✅ Davet Gönderildi!                                                      │ │
│  │                                                                            │ │
│  │  2 kişiye davet e-postası gönderildi:                                      │ │
│  │  • mehmet@acmecorp.com                                                     │ │
│  │  • elif@acmecorp.com                                                       │ │
│  │                                                                            │ │
│  │  Davetler 7 gün içinde geçerli olacak.                                     │ │
│  │                                                                            │ │
│  │  ┌──────────────────────┐  ┌──────────────────────────────────────────┐    │ │
│  │  │       Tamam          │  │        Daha Fazla Davet Et               │    │ │
│  │  └──────────────────────┘  └──────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.6.9 Pending Invitations Management

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     PENDING INVITATIONS TAB                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Bekleyen Davetler (3)                                                    │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  ✉️ mehmet@acmecorp.com                              Creator        │  │ │
│  │  │     Gönderildi: 2 gün önce                                          │  │ │
│  │  │     Kalan süre: 5 gün                                               │  │ │
│  │  │                                                                     │  │ │
│  │  │     [Tekrar Gönder]  [İptal Et]                                     │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  ✉️ elif@acmecorp.com                                Analyst        │  │ │
│  │  │     Gönderildi: 5 gün önce                                          │  │ │
│  │  │     ⚠️ Yarın sona erecek                                            │  │ │
│  │  │                                                                     │  │ │
│  │  │     [Tekrar Gönder]  [İptal Et]                                     │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  ✉️ ali@external.com                                 Member         │  │ │
│  │  │     Gönderildi: 1 saat önce                                         │  │ │
│  │  │     Kalan süre: 7 gün                                               │  │ │
│  │  │     ⚠️ Harici e-posta (domain dışı)                                 │  │ │
│  │  │                                                                     │  │ │
│  │  │     [Tekrar Gönder]  [İptal Et]                                     │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  CANCEL INVITATION CONFIRMATION                                                 │
│  ──────────────────────────────                                                 │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │      Daveti İptal Et?                      │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  mehmet@acmecorp.com için gönderilen       │                                 │
│  │  davet iptal edilecek.                     │                                 │
│  │                                            │                                 │
│  │  ┌──────────────┐  ┌──────────────────┐    │                                 │
│  │  │    Hayır     │  │    İptal Et      │    │                                 │
│  │  └──────────────┘  └──────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.6.10 Accept Invitation Flow (Recipient Side)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     INVITATION ACCEPTANCE FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  EMAIL RECEIVED                                                                 │
│  ──────────────                                                                 │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  From: noreply@voxpoll.com                                                │ │
│  │  Subject: ACME Corp sizi VoxPoll'a davet ediyor                           │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Merhaba!                                                                 │ │
│  │                                                                           │ │
│  │  Ahmet Yılmaz (@ahmet_yilmaz) sizi ACME Corp organizasyonuna              │ │
│  │  "Creator" rolüyle davet ediyor.                                          │ │
│  │                                                                           │ │
│  │  Kişisel mesaj:                                                           │ │
│  │  "Merhaba, seni VoxPoll organizasyonumuza davet ediyorum."                │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    Daveti Kabul Et                                 │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  Bu davet 7 gün içinde geçerlidir.                                        │ │
│  │                                                                           │ │
│  │  Daveti kabul etmek istemiyorsanız bu e-postayı görmezden gelebilirsiniz. │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  CASE A: User clicks link, NOT logged in, NO account                            │
│  ───────────────────────────────────────────────────                            │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ACME Corp'a Katıl                                                        │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Ahmet Yılmaz sizi ACME Corp organizasyonuna davet etti.                  │ │
│  │  Rol: Creator                                                             │ │
│  │                                                                           │ │
│  │  Devam etmek için bir hesap oluşturun:                                    │ │
│  │                                                                           │ │
│  │  E-posta: mehmet@acmecorp.com (davet edilen)                              │ │
│  │                                                                           │ │
│  │  Kullanıcı adı                                                            │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ @mehmet_demir                                                      │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  Şifre                                                                    │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ •••••••••••                                                        │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  ☑️ Kullanım Şartları ve Gizlilik Politikasını kabul ediyorum             │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │              Hesap Oluştur ve Katıl                                │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  Zaten hesabınız var mı? [Giriş Yap]                                      │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  CASE B: User clicks link, NOT logged in, HAS account                           │
│  ────────────────────────────────────────────────────                           │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ACME Corp'a Katıl                                                        │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Ahmet Yılmaz sizi ACME Corp organizasyonuna davet etti.                  │ │
│  │  Rol: Creator                                                             │ │
│  │                                                                           │ │
│  │  Bu e-posta ile zaten bir hesabınız var.                                  │ │
│  │  Devam etmek için giriş yapın:                                            │ │
│  │                                                                           │ │
│  │  E-posta: mehmet@acmecorp.com                                             │ │
│  │                                                                           │ │
│  │  Şifre                                                                    │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                                                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                Giriş Yap ve Katıl                                  │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  CASE C: User clicks link, ALREADY logged in                                    │
│  ───────────────────────────────────────────                                    │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ACME Corp'a Katıl                                                        │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Merhaba @mehmet_demir!                                                   │ │
│  │                                                                           │ │
│  │  Ahmet Yılmaz sizi ACME Corp organizasyonuna davet etti.                  │ │
│  │                                                                           │ │
│  │  Organizasyon: ACME Corp                                                  │ │
│  │  Rol: Creator                                                             │ │
│  │  Davet eden: @ahmet_yilmaz                                                │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                      Daveti Kabul Et                               │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  [Reddet]                                                                 │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  SUCCESS STATE                                                                  │
│  ─────────────                                                                  │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │                          🎉                                               │ │
│  │                                                                           │ │
│  │              ACME Corp'a Hoş Geldiniz!                                    │ │
│  │                                                                           │ │
│  │     Artık organizasyonun Creator rolündeki bir üyesisiniz.                │ │
│  │                                                                           │ │
│  │     ┌────────────────────────────────────────────────────────────────┐    │ │
│  │     │              Organizasyon Paneline Git                         │    │ │
│  │     └────────────────────────────────────────────────────────────────┘    │ │
│  │                                                                           │ │
│  │     [Ana Sayfaya Dön]                                                     │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.6.11 Change Member Role Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     CHANGE MEMBER ROLE                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │      Rolü Değiştir                         │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  👤 Can Demir (@can_demir)                 │                                 │
│  │                                            │                                 │
│  │  Mevcut rol: Creator                       │                                 │
│  │                                            │                                 │
│  │  Yeni rol:                                 │                                 │
│  │  ○ Admin                                   │                                 │
│  │  ○ Manager                                 │                                 │
│  │  ○ Analyst                                 │                                 │
│  │  ● Creator (mevcut)                        │                                 │
│  │  ○ Member                                  │                                 │
│  │                                            │                                 │
│  │  ─────────────────────────                 │                                 │
│  │                                            │                                 │
│  │  ⚠️ Rol değişikliği anında geçerli        │                                 │
│  │     olacaktır.                             │                                 │
│  │                                            │                                 │
│  │  ┌──────────────┐  ┌──────────────────┐    │                                 │
│  │  │    İptal     │  │    Değiştir      │    │                                 │
│  │  └──────────────┘  └──────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  ROLE UPGRADE WARNING (Admin or higher)                                         │
│  ──────────────────────────────────────                                         │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  ⚠️ Önemli Değişiklik                      │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  Can Demir'i Admin yapıyorsunuz.           │                                 │
│  │                                            │                                 │
│  │  Admin'ler şunları yapabilir:              │                                 │
│  │  • Tüm organizasyon ayarlarını değiştirme  │                                 │
│  │  • Üye davet etme ve çıkarma              │                                 │
│  │  • Faturalandırma bilgilerini görme        │                                 │
│  │  • Diğer üyelerin rollerini değiştirme     │                                 │
│  │                                            │                                 │
│  │  Emin misiniz?                             │                                 │
│  │                                            │                                 │
│  │  ┌──────────────┐  ┌──────────────────┐    │                                 │
│  │  │    İptal     │  │   Evet, Admin Yap│    │                                 │
│  │  └──────────────┘  └──────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.6.12 Remove Member Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     REMOVE MEMBER FROM ORGANIZATION                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  Üyeyi Organizasyondan Çıkar               │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  👤 Can Demir (@can_demir)                 │                                 │
│  │     Creator · 15 anket oluşturdu           │                                 │
│  │                                            │                                 │
│  │  ⚠️ Bu üye organizasyondan çıkarılacak.   │                                 │
│  │                                            │                                 │
│  │  Çıkarma sonrası:                          │                                 │
│  │  • Organizasyon içeriklerine erişemez      │                                 │
│  │  • Oluşturduğu anketler size transfer      │                                 │
│  │    edilecek                                │                                 │
│  │  • Kişisel verileri 30 gün sonra silinir   │                                 │
│  │                                            │                                 │
│  │  Çıkarma nedeni (opsiyonel):               │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │ Şirketten ayrıldı              ▼   │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  ☐ Üyeye bilgilendirme e-postası gönder    │                                 │
│  │                                            │                                 │
│  │  ┌──────────────┐  ┌──────────────────┐    │                                 │
│  │  │    İptal     │  │   Üyeyi Çıkar    │    │                                 │
│  │  └──────────────┘  └──────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  OWNER CANNOT BE REMOVED                                                        │
│  ───────────────────────                                                        │
│                                                                                 │
│  If trying to remove owner:                                                     │
│  "Organizasyon sahibi çıkarılamaz. Sahipliği başka bir Admin'e                  │
│   transfer ettikten sonra ayrılabilir."                                         │
│  [Sahipliği Transfer Et]                                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.6.13 Organization Invitation Functions

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION INVITATION FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { createSecureToken } from "@/lib/crypto"

const invitationSchema = z.object({
  id: z.string().cuid(),
  organizationId: z.string().cuid(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "ANALYST", "CREATOR", "MEMBER"]),
  invitedById: z.string().cuid(),
  token: z.string(),
  personalMessage: z.string().max(500).nullable(),
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED"]),
  expiresAt: z.date(),
  createdAt: z.date(),
  respondedAt: z.date().nullable()
})

type Invitation = z.infer<typeof invitationSchema>

interface CreateInvitationInput {
  organizationId: string
  emails: string[]
  role: "ADMIN" | "MANAGER" | "ANALYST" | "CREATOR" | "MEMBER"
  invitedById: string
  personalMessage?: string
}

interface InvitationResult {
  success: boolean
  sent: string[]
  failed: { email: string; reason: string }[]
}

async function createInvitations(input: CreateInvitationInput): Promise<InvitationResult> {
  const { organizationId, emails, role, invitedById, personalMessage } = input

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    include: { members: true }
  })

  if (!org) {
    return { success: false, sent: [], failed: emails.map(e => ({ email: e, reason: "ORG_NOT_FOUND" })) }
  }

  const sent: string[] = []
  const failed: { email: string; reason: string }[] = []

  for (const email of emails) {
    const existingMember = org.members.find(m => m.email === email)
    if (existingMember) {
      failed.push({ email, reason: "ALREADY_MEMBER" })
      continue
    }

    const existingInvitation = await db.organizationInvitation.findFirst({
      where: {
        organizationId,
        email,
        status: "PENDING",
        expiresAt: { gt: new Date() }
      }
    })

    if (existingInvitation) {
      failed.push({ email, reason: "ALREADY_INVITED" })
      continue
    }

    const token = createSecureToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await db.organizationInvitation.create({
      data: {
        organizationId,
        email,
        role,
        invitedById,
        token,
        personalMessage,
        status: "PENDING",
        expiresAt
      }
    })

    const inviter = await db.user.findUnique({
      where: { id: invitedById },
      select: { username: true, displayName: true }
    })

    await sendEmail({
      to: email,
      template: "organization-invitation",
      data: {
        organizationName: org.name,
        inviterName: inviter?.displayName || inviter?.username,
        inviterUsername: inviter?.username,
        role,
        personalMessage,
        acceptUrl: `${process.env.NEXT_PUBLIC_URL}/invite/${token}`,
        expiresAt
      }
    })

    sent.push(email)
  }

  return { success: sent.length > 0, sent, failed }
}

async function acceptInvitation(
  token: string,
  userId: string
): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  const invitation = await db.organizationInvitation.findFirst({
    where: {
      token,
      status: "PENDING",
      expiresAt: { gt: new Date() }
    },
    include: { organization: true }
  })

  if (!invitation) {
    return { success: false, error: "INVITATION_NOT_FOUND_OR_EXPIRED" }
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true }
  })

  if (user?.email !== invitation.email) {
    return { success: false, error: "EMAIL_MISMATCH" }
  }

  await db.$transaction([
    db.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", respondedAt: new Date() }
    }),
    db.organizationMember.create({
      data: {
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role,
        invitedById: invitation.invitedById
      }
    }),
    db.organization.update({
      where: { id: invitation.organizationId },
      data: { stats: { update: { memberCount: { increment: 1 } } } }
    })
  ])

  await sendEmail({
    to: invitation.email,
    template: "organization-welcome",
    data: {
      organizationName: invitation.organization.name,
      role: invitation.role
    }
  })

  return { success: true, organizationId: invitation.organizationId }
}

async function cancelInvitation(invitationId: string, cancelledById: string): Promise<boolean> {
  const invitation = await db.organizationInvitation.findUnique({
    where: { id: invitationId }
  })

  if (!invitation || invitation.status !== "PENDING") {
    return false
  }

  await db.organizationInvitation.update({
    where: { id: invitationId },
    data: { status: "CANCELLED" }
  })

  await db.auditLog.create({
    data: {
      organizationId: invitation.organizationId,
      action: "INVITATION_CANCELLED",
      performedById: cancelledById,
      details: { email: invitation.email }
    }
  })

  return true
}

async function resendInvitation(invitationId: string): Promise<boolean> {
  const invitation = await db.organizationInvitation.findUnique({
    where: { id: invitationId },
    include: { organization: true, invitedBy: true }
  })

  if (!invitation || invitation.status !== "PENDING") {
    return false
  }

  const newToken = createSecureToken()
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await db.organizationInvitation.update({
    where: { id: invitationId },
    data: { token: newToken, expiresAt: newExpiresAt }
  })

  await sendEmail({
    to: invitation.email,
    template: "organization-invitation-reminder",
    data: {
      organizationName: invitation.organization.name,
      inviterName: invitation.invitedBy?.displayName || invitation.invitedBy?.username,
      role: invitation.role,
      acceptUrl: `${process.env.NEXT_PUBLIC_URL}/invite/${newToken}`,
      expiresAt: newExpiresAt
    }
  })

  return true
}

export { invitationSchema, createInvitations, acceptInvitation, cancelInvitation, resendInvitation }
export type { Invitation, CreateInvitationInput, InvitationResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 5.7 SSO INTEGRATION
# ══════════════════════════════════════════════════════════════════════════════

## 5.7.1 Supported SSO Protocols

| Protocol | Description | Use Case |
|----------|-------------|----------|
| SAML 2.0 | XML-based, enterprise standard | Large enterprises, government |
| OIDC | OAuth 2.0 based, modern | Modern enterprises, SaaS integrations |


## 5.7.2 SSO Configuration

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SSO CONFIGURATION SCHEMAS
// ══════════════════════════════════════════════════════════════════════════════

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


## 5.7.3 SSO Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SSO AUTHENTICATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User          VOXPOLL           Identity Provider                             │
│   │               │                     │                                      │
│   │── 1. Login ───▶│                     │                                      │
│   │               │                     │                                      │
│   │◀─ 2. Redirect ─│                     │                                      │
│   │               │                     │                                      │
│   │───────── 3. Authenticate ─────────▶│                                      │
│   │               │                     │                                      │
│   │◀───────── 4. SAML/OIDC Response ──│                                      │
│   │               │                     │                                      │
│   │─ 5. Callback ─▶│                     │                                      │
│   │               │                     │                                      │
│   │               │── 6. Validate ─────▶│ (verify signature)                   │
│   │               │                     │                                      │
│   │               │◀─ 7. User Info ─────│                                      │
│   │               │                     │                                      │
│   │◀─ 8. Session ─│                     │                                      │
│   │   Created     │                     │                                      │
│                                                                                 │
│  User provisioning on first SSO login:                                         │
│  • Account created automatically                                               │
│  • Linked to organization                                                      │
│  • Verification level set to 2                                                 │
│  • Role determined by IdP groups (or default MEMBER)                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.7.4 SSO Group-to-Role Mapping

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SSO GROUP MAPPING
// ══════════════════════════════════════════════════════════════════════════════

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




# ══════════════════════════════════════════════════════════════════════════════
# 5.8 SUBSCRIPTION TIERS
# ══════════════════════════════════════════════════════════════════════════════

## 5.8.1 Individual User Tiers

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      INDIVIDUAL SUBSCRIPTION TIERS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FREE                                                        $0/month          │
│  ─────────────────────────────────────────────────────────────                 │
│  • Participate in all public polls/surveys/tests                               │
│  • View results of participated content (PULSE/COMMENTS)                       │
│  • Create polls: 3/day                                                         │
│  • Create personality tests: 3/week                                            │
│  • Private link sharing for polls/tests                                        │
│  • Discover feed (sponsored surveys visible)                                   │
│  • Basic profile badges from tests                                             │
│  • Anonymous participation mode                                                │
│                                                                                 │
│  PLUS                                                        $4.99/month       │
│  ─────────────────────────────────────────────────────────────                 │
│  Everything in Free, plus:                                                     │
│  • ACCESS PULSE/COMMENTS without participating            [KEY FEATURE]        │
│  • Create polls: 10/day                                                        │
│  • Create personality tests: 10/week                                           │
│  • View non-participated content results                                       │
│  • Priority in discover feed                                                   │
│  • Extended profile customization                                              │
│                                                                                 │
│  PREMIUM                                                     $9.99/month       │
│  ─────────────────────────────────────────────────────────────                 │
│  Everything in Plus, plus:                                                     │
│  • TARGET AUDIENCE SELECTION for polls                     [KEY FEATURE]       │
│  • PRE-TEST SCREENING for polls                            [KEY FEATURE]       │
│  • LIVE POLL feature with link-join                        [KEY FEATURE]       │
│  • CUSTOM THEMES for polls/tests                           [KEY FEATURE]       │
│  • Unlimited poll/test creation                                                │
│  • Advanced analytics for own content                                          │
│  • Verified creator badge                                                      │
│  • Priority support                                                            │
│  • Early access to new features                                                │
│  Target: Influencers, content creators, researchers                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

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


## 5.8.2 Organization Subscription Tiers

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION SUBSCRIPTION TIERS                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STARTER                                              $99/month                 │
│  ─────────────────────────────────────────────────────────────                 │
│  • Up to 25 team members                                                       │
│  • 10 active surveys/month                                                     │
│  • 1,000 responses/month                                                       │
│  • Basic analytics                                                             │
│  • Email support                                                               │
│  • CSV export                                                                  │
│                                                                                 │
│  PROFESSIONAL                                         $299/month                │
│  ─────────────────────────────────────────────────────────────                 │
│  • Up to 100 team members                                                      │
│  • 50 active surveys/month                                                     │
│  • 10,000 responses/month                                                      │
│  • Advanced analytics + dashboards                                             │
│  • Priority support                                                            │
│  • API access                                                                  │
│  • Custom branding                                                             │
│  • Domain auto-join                                                            │
│                                                                                 │
│  ENTERPRISE                                           $999/month                │
│  ─────────────────────────────────────────────────────────────                 │
│  • Unlimited team members                                                      │
│  • Unlimited surveys                                                           │
│  • 100,000 responses/month                                                     │
│  • SSO (SAML/OIDC)                                                             │
│  • Dedicated support manager                                                   │
│  • SLA guarantee (99.9%)                                                       │
│  • Advanced security (audit logs, IP allowlist)                                │
│  • Custom integrations                                                         │
│  • White-label option                                                          │
│                                                                                 │
│  CUSTOM                                               Contact Sales             │
│  ─────────────────────────────────────────────────────────────                 │
│  • Everything in Enterprise                                                    │
│  • Unlimited responses                                                         │
│  • On-premise deployment option                                                │
│  • Custom SLA                                                                  │
│  • Dedicated infrastructure                                                    │
│  • Professional services                                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.8.3 Subscription Constants

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION TIER DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

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

function checkPlanLimit(
  plan: SubscriptionPlan,
  limitType: keyof PlanLimits,
  currentValue: number
): { allowed: boolean, limit: number | null, remaining: number | null } {
  const planConfig = SUBSCRIPTION_PLANS[plan]
  const limit = planConfig[limitType]
  
  if (limit === null || !Array.isArray(limit)) {
    return { allowed: true, limit: null, remaining: null }
  }
  
  if (typeof limit === "number") {
    return {
      allowed: currentValue < limit,
      limit,
      remaining: Math.max(0, limit - currentValue)
    }
  }
  
  return { allowed: true, limit: null, remaining: null }
}

export type { SubscriptionPlan, PlanLimits }
export { SUBSCRIPTION_PLANS, checkPlanLimit }
```


## 5.8.4 Subscription Downgrade Policy

### [DECISION P-037] Subscription Downgrade Handling

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION DOWNGRADE POLICY
// Defines behavior when user/org moves to a lower tier
// ═══════════════════════════════════════════════════════════════════════════════

const SUBSCRIPTION_DOWNGRADE_POLICY = {
  // ─────────────────────────────────────────────────────────────────────────────
  // INDIVIDUAL USER DOWNGRADES (Premium → Plus → Free)
  // ─────────────────────────────────────────────────────────────────────────────

  individual: {
    // Existing content handling
    existingPolls: {
      action: "PRESERVE",             // Keep all created polls
      extendedOptions: "KEEP",        // Don't reduce 10→4 options on existing
      targetAudience: "PRESERVE",     // Keep existing targeting
      livePollSessions: "END_ACTIVE"  // End any active live polls
    },

    // Feature access on downgrade
    features: {
      // Premium → Plus downgrade
      premiumToPlus: {
        livePollAccess: false,        // Lose live poll creation
        targetAudienceAccess: false,  // Lose targeting on NEW polls
        preTestAccess: false,         // Lose pre-test on NEW polls
        existingPreTests: "KEEP",     // Keep on existing polls
        customThemes: "REVERT_DEFAULT" // Revert to default themes
      },

      // Plus → Free downgrade
      plusToFree: {
        voiceAccess: "PARTICIPATE_ONLY", // Lose view-without-participate
        pollLimitDaily: 3,            // New daily limit
        existingPollsOverLimit: "KEEP", // Don't delete existing
        newPollOptions: 4             // 4 options max on NEW polls
      }
    },

    // Active subscriptions & content
    activeContent: {
      livePollsInProgress: {
        action: "END_GRACEFULLY",
        graceMinutes: 60,             // Let current session finish
        notifyParticipants: true
      },

      scheduledPolls: {
        action: "PRESERVE",           // Keep scheduled, they'll publish
        beyondNewLimits: "WARN_ONLY"  // Warn but don't cancel
      }
    },

    // Notifications
    notifications: {
      notifyUser: true,
      emailContent: "subscription.downgrade.individual",
      showInAppAlert: true,
      alertDuration: 7                // Show alert for 7 days
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ORGANIZATION DOWNGRADES (Enterprise → Professional → Starter)
  // ─────────────────────────────────────────────────────────────────────────────

  organization: {
    // Survey handling
    surveys: {
      existingSurveys: "PRESERVE",    // Keep all surveys
      activeCollecting: {
        action: "CONTINUE",           // Let active surveys finish
        responsesOverLimit: "ACCEPT", // Accept responses over new limit
        notifyAdmin: true
      },
      draftSurveys: "PRESERVE"
    },

    // Member handling
    members: {
      overMemberLimit: {
        action: "SOFT_LIMIT",         // Allow but warn
        graceperiodDays: 30,          // 30 days to reduce members
        blockNewInvites: true,        // Can't add more members
        existingMemberAccess: "FULL"  // Existing keep full access
      }
    },

    // Feature access
    features: {
      enterpriseToProfessional: {
        ssoAccess: false,             // Lose SSO
        whiteLabel: "REVERT",         // Revert to VoxPoll branding
        apiAccess: "REDUCED",         // Lower rate limits
        customReports: "READ_ONLY",   // Can view but not create new
        existingIntegrations: "PRESERVE_30_DAYS"
      },

      professionalToStarter: {
        advancedAnalytics: false,
        exportFormats: ["CSV"],       // Lose Excel, PDF export
        responseLimit: 1000,          // 1000/month on new surveys
        existingOverLimit: "PRESERVE" // Keep existing data
      }
    },

    // Data & storage
    storage: {
      overStorageLimit: {
        action: "READ_ONLY",          // Can't upload new
        graceperiodDays: 90,          // 90 days to reduce
        notifyAdmins: true
      }
    },

    // Notifications
    notifications: {
      notifyOwner: true,
      notifyAdmins: true,
      notifyMembers: false,           // Don't spam all members
      emailContent: "subscription.downgrade.organization"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DOWNGRADE TIMING
  // ─────────────────────────────────────────────────────────────────────────────

  timing: {
    // When does downgrade take effect?
    effectiveDate: "END_OF_BILLING_PERIOD",

    // Can user re-upgrade?
    reUpgrade: {
      instantAccess: true,            // Features restored immediately
      dataPreserved: true,            // All data kept during downgrade
      preservationPeriod: 365         // Data kept for 1 year after downgrade
    },

    // Grace period before hard limits
    gracePeroid: {
      individual: 0,                  // Immediate for individuals
      organization: 30                // 30 days for orgs to adjust
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CANCELLATION (Full exit)
  // ─────────────────────────────────────────────────────────────────────────────

  cancellation: {
    individual: {
      // Becomes Free tier, not deleted
      action: "DOWNGRADE_TO_FREE",
      dataRetention: 365,             // Keep data for 1 year
      canReactivate: true
    },

    organization: {
      action: "ARCHIVE",              // Archive org, don't delete
      dataRetention: 365,             // Keep data for 1 year
      memberAccess: "REVOKED",        // Members lose access
      ownerAccess: "READ_ONLY",       // Owner can export data
      canReactivate: true,
      reactivationPeriod: 365         // Can reactivate within 1 year
    }
  }
}

// Process subscription downgrade
async function processDowngrade(
  entityId: string,
  entityType: "USER" | "ORGANIZATION",
  fromPlan: string,
  toPlan: string
): Promise<DowngradeResult> {
  const policy = entityType === "USER"
    ? SUBSCRIPTION_DOWNGRADE_POLICY.individual
    : SUBSCRIPTION_DOWNGRADE_POLICY.organization

  // Step 1: End active premium features
  if (entityType === "USER" && fromPlan === "PREMIUM") {
    await endActiveLivePolls(entityId, policy.activeContent.livePollsInProgress)
  }

  // Step 2: Update subscription record
  await db.subscription.update({
    where: { entityId },
    data: {
      plan: toPlan,
      downgradeEffective: SUBSCRIPTION_DOWNGRADE_POLICY.timing.effectiveDate === "END_OF_BILLING_PERIOD"
        ? await getNextBillingDate(entityId)
        : new Date()
    }
  })

  // Step 3: Send notifications
  if (policy.notifications.notifyUser || policy.notifications.notifyOwner) {
    await sendDowngradeNotification(entityId, entityType, fromPlan, toPlan)
  }

  // Step 4: Log for audit
  await db.auditLog.create({
    data: {
      entityType,
      entityId,
      action: "SUBSCRIPTION_DOWNGRADE",
      details: { fromPlan, toPlan }
    }
  })

  return {
    success: true,
    effectiveDate: await getDowngradeEffectiveDate(entityId),
    featuresLost: getFeaturesDiff(fromPlan, toPlan)
  }
}

interface DowngradeResult {
  success: boolean
  effectiveDate: Date
  featuresLost: string[]
}

export { SUBSCRIPTION_DOWNGRADE_POLICY, processDowngrade }
export type { DowngradeResult }

// ═══════════════════════════════════════════════════════════════════════════════
// [DECISION P-041] CONTENT ACCESS AFTER DOWNGRADE - UI BEHAVIOR
// Defines what users see when trying to edit/create content exceeding new limits
// ═══════════════════════════════════════════════════════════════════════════════

const DOWNGRADE_CONTENT_UI_BEHAVIOR = {
  // When user tries to EDIT an existing poll with >4 options (now on Free tier)
  editExceedingLimitContent: {
    allowed: true,                      // CAN edit text/description
    canModifyOptions: false,            // Cannot change option count
    canAddOptions: false,               // Cannot add more options
    canRemoveOptions: true,             // CAN reduce options to <= 4

    // UI messaging
    ui: {
      bannerType: "INFO",
      message: "Bu anket Premium özellikler içeriyor. Seçenek sayısını değiştiremezsiniz.",
      messageEn: "This poll contains Premium features. You cannot modify option count.",
      upgradeButton: { show: true, label: "Premium'a Yükselt / Upgrade to Premium" }
    }
  },

  // When user tries to CREATE new poll with >4 options (on Free tier)
  createExceedingLimitContent: {
    allowed: false,

    // UI messaging
    ui: {
      blockType: "SOFT_BLOCK",          // Show modal, don't prevent UI interaction
      title: "Premium Özellik / Premium Feature",
      message: "5+ seçenekli anket oluşturmak için Premium üyelik gerekiyor.",
      messageEn: "Creating polls with 5+ options requires Premium subscription.",
      options: [
        { type: "UPGRADE", label: "Premium'a Yükselt / Upgrade", primary: true },
        { type: "REDUCE_OPTIONS", label: "4 Seçenekle Devam / Continue with 4", primary: false }
      ]
    }
  },

  // When user tries to access targeting/pre-test on existing poll (downgraded)
  accessRestrictedFeature: {
    premiumFeatures: ["TARGET_AUDIENCE", "PRE_TEST", "LIVE_POLL", "CUSTOM_THEME"],

    // UI for each restricted feature
    ui: {
      TARGET_AUDIENCE: {
        message: "Hedef kitle ayarları görüntülenebilir ama düzenlenemez.",
        messageEn: "Target audience settings can be viewed but not edited.",
        viewOnly: true,
        upgradePrompt: true
      },
      PRE_TEST: {
        message: "Ön test soruları aktif kalır ama düzenlenemez.",
        messageEn: "Pre-test questions remain active but cannot be edited.",
        viewOnly: true,
        upgradePrompt: true
      },
      LIVE_POLL: {
        message: "Canlı anket oluşturmak için Premium gerekli.",
        messageEn: "Creating live polls requires Premium.",
        blocked: true,
        upgradePrompt: true
      },
      CUSTOM_THEME: {
        message: "Özel temalar varsayılana döndürüldü. Premium ile geri yükleyin.",
        messageEn: "Custom themes reverted to default. Restore with Premium.",
        viewOnly: true,
        upgradePrompt: true
      }
    }
  },

  // Dashboard view of downgraded content
  dashboardView: {
    showPremiumBadge: true,             // Mark polls that exceed current tier
    premiumBadgeIcon: "Crown",
    premiumBadgeTooltip: "Bu içerik Premium özellikleri içeriyor / This content has Premium features",

    // Filtering
    filterOptions: [
      { value: "ALL", label: "Tümü / All" },
      { value: "CURRENT_TIER", label: "Mevcut Tier / Current Tier" },
      { value: "PREMIUM_LOCKED", label: "Premium Kilitli / Premium Locked" }
    ]
  }
}

export { DOWNGRADE_CONTENT_UI_BEHAVIOR }
```

### Account Deletion Cascade Handling (P-043)

[DECISION P-043] When a user requests account deletion, data must be handled according
to specific cascade rules. This complements the UI flow in Section 5.12.6.

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNT DELETION CASCADE HANDLING (P-043)
// Specifies exactly what happens to each data type when account is deleted
// ═══════════════════════════════════════════════════════════════════════════════

const ACCOUNT_DELETION_CASCADE_HANDLING = {
  // ─────────────────────────────────────────────────────────────────────────────
  // TIMELINE
  // ─────────────────────────────────────────────────────────────────────────────
  timeline: {
    gracePeriod: 30,                      // Days before permanent deletion
    usernameReservation: 90,              // Days username is reserved after deletion
    immediateActions: [
      "HIDE_PROFILE_FROM_PUBLIC",
      "REVOKE_ALL_SESSIONS",
      "STOP_PUSH_NOTIFICATIONS",
      "MARK_AS_PENDING_DELETION"
    ],
    afterGracePeriod: [
      "ANONYMIZE_CONTENT",
      "DELETE_PERSONAL_DATA",
      "DELETE_PRIVATE_MESSAGES",
      "RELEASE_USERNAME_RESERVATION"      // After 90 days
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT HANDLING
  // ─────────────────────────────────────────────────────────────────────────────
  contentHandling: {
    // User-created polls, surveys, tests
    createdContent: {
      action: "ANONYMIZE",
      newCreatorDisplay: "Silinmiş Kullanıcı",    // "Deleted User"
      preserveContent: true,                       // Content remains accessible
      preserveVotes: true,                         // Existing votes preserved
      preserveResults: true,                       // Results/analytics preserved
      deletedFields: [
        "creatorId",                               // Cleared
        "creatorProfileLink"                       // Removed
      ]
    },

    // Active Live Polls
    activeLivePolls: {
      immediateAction: "TERMINATE_SESSION",
      participantNotification: {
        enabled: true,
        message: "Anket sahibi oturumdan ayrıldı. Oturum sonlandırıldı.",
        autoCloseDelay: 5000                       // 5 seconds
      },
      resultsHandling: {
        saveCurrentResults: true,
        status: "ENDED_HOST_LEFT",
        canBeViewed: true                          // Historical view allowed
      }
    },

    // Pending Survey Responses (user was respondent, not creator)
    pendingSurveyResponses: {
      action: "SUBMIT_AS_COMPLETE_OR_DISCARD",
      rules: {
        ifCompletionAbove50Percent: "SUBMIT_AS_PARTIAL",
        ifCompletionBelow50Percent: "DISCARD",
        anonymizeSurveys: true                     // Responses already anonymous
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SOCIAL DATA
  // ─────────────────────────────────────────────────────────────────────────────
  socialData: {
    // Comments made by user
    comments: {
      action: "ANONYMIZE",
      newAuthorDisplay: "Silinmiş Kullanıcı",
      preserveCommentText: true,
      preserveReplies: true,
      preserveLikes: false,                        // Like associations cleared
      deletedFields: ["authorId", "authorAvatar", "authorProfileLink"]
    },

    // Follow relationships
    followRelationships: {
      action: "DELETE_ALL",
      notifyFollowers: false,                      // Silent removal
      notifyFollowing: false,
      cascadeEffect: {
        followerCountsUpdated: true,               // Decrement counts
        feedsUpdated: true                         // Remove from feeds
      }
    },

    // Friend relationships
    friendRelationships: {
      action: "DELETE_ALL",
      notifyFriends: true,                         // Notify with generic message
      notificationMessage: "Bir arkadaşınız platformdan ayrıldı",
      cascadeEffect: {
        friendListsUpdated: true,
        mutualFriendsRecalculated: true
      }
    },

    // Direct Messages / Conversations
    directMessages: {
      action: "ANONYMIZE_USER_IN_CONVERSATION",
      preserveMessages: true,                      // Message text preserved
      otherPartyExperience: {
        userNameShown: "Silinmiş Kullanıcı",
        avatarShown: "DEFAULT_DELETED_AVATAR",
        profileClickable: false,
        canReply: false,                           // Conversation becomes read-only
        conversationStatus: "ARCHIVED"
      },
      afterGracePeriod: {
        action: "DELETE_USER_MESSAGES",
        otherPartyMessages: "PRESERVED"            // Their messages stay
      }
    },

    // Profile Visits
    profileVisits: {
      userAsVisitor: "DELETE_ALL_RECORDS",
      userAsVisited: "DELETE_ALL_RECORDS"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // GAMIFICATION & ACHIEVEMENTS
  // ─────────────────────────────────────────────────────────────────────────────
  gamification: {
    badges: {
      action: "DELETE",                            // Badges are deleted with account
      leaderboardEffect: "REMOVE_FROM_ALL",
      historicalRecords: {
        preserveInAggregateStats: true,            // Platform stats preserved
        preserveIndividualRecord: false
      }
    },

    streaks: {
      action: "DELETE"
    },

    points: {
      action: "DELETE",
      leaderboardRemoval: "IMMEDIATE"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION & BILLING
  // ─────────────────────────────────────────────────────────────────────────────
  subscription: {
    activePremiumSubscription: {
      action: "CANCEL_AT_PERIOD_END",              // Don't charge again
      refund: {
        policy: "NO_REFUND_FOR_DELETION",
        reason: "User-initiated account deletion"
      },
      billingRecords: {
        preserve: true,                            // For legal/tax purposes
        retentionPeriod: "7_YEARS",                // Financial record requirement
        personalDataRemoved: true                  // Anonymize after grace period
      }
    },

    organizationMembership: {
      action: "REMOVE_FROM_ORG",
      transferOwnership: {
        ifOnlyOwner: "PROMPT_BEFORE_DELETION",
        errorMessage: "Organizasyonunuzun tek yöneticisisiniz. Silmeden önce yetki devredin."
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SESSIONS & AUTHENTICATION
  // ─────────────────────────────────────────────────────────────────────────────
  authentication: {
    activeSessions: {
      action: "TERMINATE_ALL_IMMEDIATELY",
      devices: "ALL_DEVICES",
      tokens: "REVOKE_ALL"
    },

    oauthConnections: {
      action: "REVOKE_ALL",
      providers: ["GOOGLE", "APPLE"]               // As per P-001
    },

    twoFactorAuth: {
      action: "DISABLE",
      backupCodes: "DELETE"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DATA EXPORT
  // ─────────────────────────────────────────────────────────────────────────────
  dataExport: {
    beforeDeletion: {
      promptDownload: true,
      reminderEmails: [7, 3, 1],                   // Days before deletion
      exportAvailable: true                        // During grace period
    },

    exportContents: [
      "profile_data",
      "created_content",
      "votes_and_responses",
      "comments",
      "direct_messages",
      "badge_history",
      "activity_log"
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // REACTIVATION (during grace period)
  // ─────────────────────────────────────────────────────────────────────────────
  reactivation: {
    duringGracePeriod: {
      allowed: true,
      method: "LOGIN_WITH_CREDENTIALS",
      restoredData: [
        "profile",
        "created_content",
        "subscription_if_active",
        "badges",
        "follow_relationships",
        "settings"
      ],
      notRestoredData: [
        "terminated_live_polls",                   // Cannot restore ended sessions
        "sent_notifications"                       // Already sent to followers
      ]
    },

    afterGracePeriod: {
      allowed: false,
      canCreateNewAccount: true,
      usernameAvailableAfter: 90                   // Days
    }
  }
}

// Error handling for edge cases
const DELETION_EDGE_CASES = {
  // User is sole org owner
  soleOrgOwner: {
    blockDeletion: true,
    requiredAction: "TRANSFER_OR_DELETE_ORG",
    ui: {
      showModal: true,
      options: [
        { action: "TRANSFER", label: "Yetkiyi Devret" },
        { action: "DELETE_ORG", label: "Organizasyonu Sil" },
        { action: "CANCEL", label: "Vazgeç" }
      ]
    }
  },

  // User has active live poll
  activeLivePollHost: {
    blockDeletion: false,                          // Don't block
    warningShown: true,
    warningMessage: "Aktif canlı anketiniz sonlandırılacak."
  },

  // User has pending payouts (future feature)
  pendingPayouts: {
    blockDeletion: true,
    requiredAction: "WAIT_FOR_PAYOUT_OR_FORFEIT",
    minimumWaitDays: 14
  }
}

export { ACCOUNT_DELETION_CASCADE_HANDLING, DELETION_EDGE_CASES }
```


## 5.8.5 Usage Tracking

[MUST] Track usage for billing and limit enforcement:

| Metric | Tracking Period | Reset |
|--------|-----------------|-------|
| Surveys created | Monthly | 1st of month |
| Responses received | Monthly | 1st of month |
| Active members | Real-time | N/A |
| API calls | Monthly | 1st of month |
| Storage used | Real-time | N/A |

[MUST] Send warning notifications at 80% and 100% of limits.
[SHOULD] Offer automatic upgrade prompts when limits reached.




# ══════════════════════════════════════════════════════════════════════════════
# 5.9 SOCIAL FEATURES: FOLLOW, FRIENDS, DM, PROFILE VISITS
# ══════════════════════════════════════════════════════════════════════════════

## 5.9.1 Social Features Overview

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


## 5.9.2 Follow System Data Model

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// FOLLOW SYSTEM SCHEMA
// ══════════════════════════════════════════════════════════════════════════════

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


## 5.9.3 Direct Messaging System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DIRECT MESSAGE SCHEMA
// ══════════════════════════════════════════════════════════════════════════════

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


## 5.9.4 Profile Visits Tracking

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PROFILE VISIT TRACKING
// ══════════════════════════════════════════════════════════════════════════════

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


## 5.9.5 Social Privacy Settings

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SOCIAL PRIVACY SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

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


## 5.9.6 User Profile Display with Social Features

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
│  │ 🧠 INTJ-A Architect  │ 🎯 True Neutral  │ 🌊 Ocean Explorer          │    │
│  │ Personality Test      │ Alignment Test   │ Which Sea Quiz             │    │
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


## 5.9.7 Block and Report System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// USER BLOCK AND REPORT SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

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




# ══════════════════════════════════════════════════════════════════════════════
# 5.10 WHITE LABEL SYSTEM (Enterprise Feature)
# ══════════════════════════════════════════════════════════════════════════════

## 5.9.1 White Label Overview

[DECISION] Corporate SaaS customers on Enterprise/Custom plans can deploy VoxPoll
with their own branding for internal surveys and employee engagement.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         WHITE LABEL SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     WHITE LABEL CAPABILITIES                            │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  BRANDING CUSTOMIZATION                                                 │   │
│  │  ─────────────────────                                                  │   │
│  │  • Custom logo (header, favicon, login page)                            │   │
│  │  • Custom color scheme (primary, secondary, accent colors)              │   │
│  │  • Custom fonts (from approved list or upload)                          │   │
│  │  • Custom email templates with company branding                         │   │
│  │  • Custom SMS sender ID (where supported)                               │   │
│  │  • Removal of "Powered by VoxPoll" footer (Enterprise only)             │   │
│  │                                                                         │   │
│  │  DOMAIN CUSTOMIZATION                                                   │   │
│  │  ─────────────────────                                                  │   │
│  │  • Custom subdomain: surveys.acmecorp.com                               │   │
│  │  • Custom domain: feedback.acmecorp.com (Enterprise+)                   │   │
│  │  • SSL certificate management (auto via Let's Encrypt)                  │   │
│  │  • Email from custom domain: noreply@acmecorp.com                       │   │
│  │                                                                         │   │
│  │  CONTENT ISOLATION                                                      │   │
│  │  ─────────────────                                                      │   │
│  │  • Members only see organization content                                │   │
│  │  • Public VoxPoll content hidden                                        │   │
│  │  • Separate user namespace                                              │   │
│  │  • Data residency options (EU, US, custom)                              │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  USE CASES                                                                      │
│  ─────────                                                                      │
│  • Large corporations running internal employee surveys                         │
│  • Universities with student feedback systems                                   │
│  • Healthcare organizations requiring HIPAA-compliant branding                  │
│  • Government agencies with citizen engagement platforms                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.9.2 White Label Configuration

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// WHITE LABEL CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const whiteLabelBrandingSchema = z.object({
  // Logo Configuration
  logoUrl: z.string().url(),
  logoAltText: z.string().max(100),
  faviconUrl: z.string().url(),

  // Color Scheme
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    primaryForeground: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondaryForeground: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    muted: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    border: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
  }),

  // Typography
  fontFamily: z.enum([
    "inter", "roboto", "open-sans", "lato", "poppins", "custom"
  ]).default("inter"),
  customFontUrl: z.string().url().optional(),

  // Footer
  showPoweredBy: z.boolean().default(true),
  customFooterText: z.string().max(200).optional()
})

const whiteLabelDomainSchema = z.object({
  // Subdomain: surveys.{org-slug}.voxpoll.com
  subdomain: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),

  // Custom domain: surveys.acmecorp.com
  customDomain: z.string().optional(),
  customDomainVerified: z.boolean().default(false),
  customDomainSslStatus: z.enum(["pending", "active", "failed"]).default("pending"),

  // Email domain
  emailFromDomain: z.string().optional(),
  emailFromName: z.string().max(100).default("Survey Team")
})

const whiteLabelConfigSchema = z.object({
  organizationId: z.string().cuid(),
  enabled: z.boolean().default(false),

  branding: whiteLabelBrandingSchema,
  domain: whiteLabelDomainSchema,

  // Content Isolation
  contentIsolation: z.object({
    hidePublicContent: z.boolean().default(true),
    membersOnlySurveys: z.boolean().default(true),
    separateUserNamespace: z.boolean().default(false)
  }),

  // Data Residency
  dataResidency: z.enum(["default", "eu", "us", "custom"]).default("default"),

  createdAt: z.date(),
  updatedAt: z.date()
})

type WhiteLabelBranding = z.infer<typeof whiteLabelBrandingSchema>
type WhiteLabelDomain = z.infer<typeof whiteLabelDomainSchema>
type WhiteLabelConfig = z.infer<typeof whiteLabelConfigSchema>

export { whiteLabelBrandingSchema, whiteLabelDomainSchema, whiteLabelConfigSchema }
export type { WhiteLabelBranding, WhiteLabelDomain, WhiteLabelConfig }
```


## 5.9.3 White Label Access Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     WHITE LABEL ACCESS FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User visits: surveys.acmecorp.com                                              │
│                      │                                                          │
│                      ▼                                                          │
│  ┌──────────────────────────────────────┐                                       │
│  │ 1. Domain Resolution                 │                                       │
│  │    • CNAME → wl.voxpoll.com          │                                       │
│  │    • SSL termination                 │                                       │
│  └──────────────────────────────────────┘                                       │
│                      │                                                          │
│                      ▼                                                          │
│  ┌──────────────────────────────────────┐                                       │
│  │ 2. Organization Lookup               │                                       │
│  │    • Find org by custom domain       │                                       │
│  │    • Load white label config         │                                       │
│  └──────────────────────────────────────┘                                       │
│                      │                                                          │
│                      ▼                                                          │
│  ┌──────────────────────────────────────┐                                       │
│  │ 3. Apply Branding                    │                                       │
│  │    • Inject custom CSS variables     │                                       │
│  │    • Replace logos                   │                                       │
│  │    • Apply custom fonts              │                                       │
│  └──────────────────────────────────────┘                                       │
│                      │                                                          │
│                      ▼                                                          │
│  ┌──────────────────────────────────────┐                                       │
│  │ 4. Content Filtering                 │                                       │
│  │    • Only show org surveys           │                                       │
│  │    • Hide public VoxPoll content     │                                       │
│  │    • Enforce member-only access      │                                       │
│  └──────────────────────────────────────┘                                       │
│                      │                                                          │
│                      ▼                                                          │
│  ┌──────────────────────────────────────┐                                       │
│  │ 5. SSO Integration                   │                                       │
│  │    • Redirect to org IdP             │                                       │
│  │    • SAML/OIDC authentication        │                                       │
│  │    • Auto-provision user             │                                       │
│  └──────────────────────────────────────┘                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.9.4 White Label Tier Requirements

| Feature | Professional | Enterprise | Custom |
|---------|-------------|------------|--------|
| Custom subdomain | ✓ | ✓ | ✓ |
| Custom colors | ✓ | ✓ | ✓ |
| Custom logo | ✓ | ✓ | ✓ |
| Custom domain | ─ | ✓ | ✓ |
| Remove "Powered by" | ─ | ✓ | ✓ |
| Custom email domain | ─ | ✓ | ✓ |
| Content isolation | ─ | ✓ | ✓ |
| Data residency options | ─ | ─ | ✓ |
| Custom fonts upload | ─ | ─ | ✓ |




# ══════════════════════════════════════════════════════════════════════════════
# 5.11 SESSION MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════

## 5.11.1 Session Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SESSION MANAGEMENT SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     SESSION TYPES & LIFETIMES                           │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  WEB SESSION (Browser)                                                  │   │
│  │  ─────────────────────                                                  │   │
│  │  • Default lifetime: 7 days                                             │   │
│  │  • "Remember me" lifetime: 30 days                                      │   │
│  │  • Sliding expiration: extends on activity                              │   │
│  │  • HttpOnly, Secure, SameSite=Lax cookies                               │   │
│  │                                                                         │   │
│  │  MOBILE SESSION (App)                                                   │   │
│  │  ────────────────────                                                   │   │
│  │  • Default lifetime: 90 days                                            │   │
│  │  • Biometric refresh: extends indefinitely                              │   │
│  │  • Secure token storage (Keychain/Keystore)                             │   │
│  │  • Background refresh before expiry                                     │   │
│  │                                                                         │   │
│  │  API SESSION (External integrations)                                    │   │
│  │  ─────────────────────────────────                                      │   │
│  │  • JWT access token: 15 minutes                                         │   │
│  │  • Refresh token: 30 days                                               │   │
│  │  • Rate limited per API key                                             │   │
│  │                                                                         │   │
│  │  LIVE POLL SESSION (Temporary)                                          │   │
│  │  ─────────────────────────────                                          │   │
│  │  • Lifetime: Duration of live poll + 5 min grace                        │   │
│  │  • No authentication required                                           │   │
│  │  • Device fingerprint tracking                                          │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.11.2 Session Data Schema

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SESSION DATA SCHEMA
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const sessionTypeEnum = z.enum(["WEB", "MOBILE", "API", "LIVE_POLL"])

const sessionSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid().nullable(),

  type: sessionTypeEnum,

  token: z.string(),
  refreshToken: z.string().nullable(),

  deviceInfo: z.object({
    fingerprint: z.string(),
    userAgent: z.string(),
    browser: z.string().nullable(),
    browserVersion: z.string().nullable(),
    os: z.string().nullable(),
    osVersion: z.string().nullable(),
    deviceType: z.enum(["DESKTOP", "MOBILE", "TABLET"]),
    deviceModel: z.string().nullable()
  }),

  ipAddress: z.string(),
  geoLocation: z.object({
    country: z.string().nullable(),
    city: z.string().nullable(),
    region: z.string().nullable()
  }).nullable(),

  rememberMe: z.boolean().default(false),

  createdAt: z.date(),
  lastActiveAt: z.date(),
  expiresAt: z.date(),

  revokedAt: z.date().nullable(),
  revokedReason: z.enum([
    "USER_LOGOUT",
    "PASSWORD_CHANGE",
    "SECURITY_CONCERN",
    "ADMIN_ACTION",
    "SESSION_LIMIT_EXCEEDED",
    "INACTIVITY_TIMEOUT"
  ]).nullable(),

  isActive: z.boolean().default(true)
})

type Session = z.infer<typeof sessionSchema>

export { sessionSchema, sessionTypeEnum }
export type { Session }
```


## 5.11.3 Multi-Device Session Management

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     MULTI-DEVICE SESSION MANAGEMENT                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SESSION LIMITS BY TIER                                                         │
│  ──────────────────────                                                         │
│                                                                                 │
│  ┌───────────────┬────────────────┬────────────────┬─────────────────────┐     │
│  │ Tier          │ Web Sessions   │ Mobile Sessions│ Total Max Sessions  │     │
│  ├───────────────┼────────────────┼────────────────┼─────────────────────┤     │
│  │ Free          │ 2              │ 1              │ 3                   │     │
│  │ Plus          │ 3              │ 2              │ 5                   │     │
│  │ Premium       │ 5              │ 3              │ 8                   │     │
│  │ Org Member    │ 3              │ 2              │ 5                   │     │
│  │ Org Admin     │ 5              │ 3              │ 8                   │     │
│  │ Platform Admin│ 10             │ 5              │ 15                  │     │
│  └───────────────┴────────────────┴────────────────┴─────────────────────┘     │
│                                                                                 │
│  SESSION LIMIT EXCEEDED BEHAVIOR                                                │
│  ───────────────────────────────                                                │
│                                                                                 │
│  When user tries to create new session above limit:                             │
│                                                                                 │
│  1. Show active sessions list with details:                                     │
│     • Device name/type                                                          │
│     • Browser/App                                                               │
│     • Location (city, country)                                                  │
│     • Last active time                                                          │
│                                                                                 │
│  2. User options:                                                               │
│     a) "Yeni cihazdan devam et" → Terminate oldest inactive session             │
│     b) "Belirli oturumu sonlandır" → Choose specific session to terminate       │
│     c) "Tüm diğer oturumları sonlandır" → Terminate all except current          │
│     d) "İptal" → Cancel new login attempt                                       │
│                                                                                 │
│  3. Automatic behavior (if user doesn't choose):                                │
│     • Terminate session with oldest lastActiveAt                                │
│     • Notify terminated session via push/email                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.11.4 Session Management Functions

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { createSecureToken, hashToken } from "@/lib/crypto"

interface CreateSessionInput {
  userId: string
  type: "WEB" | "MOBILE" | "API"
  deviceInfo: DeviceInfo
  ipAddress: string
  geoLocation?: GeoLocation
  rememberMe?: boolean
}

interface SessionLimits {
  web: number
  mobile: number
  total: number
}

async function getSessionLimits(userId: string): Promise<SessionLimits> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      organizationMemberships: { include: { role: true } }
    }
  })

  if (!user) throw new Error("User not found")

  const isPlatformAdmin = user.role === "PLATFORM_ADMIN"
  if (isPlatformAdmin) return { web: 10, mobile: 5, total: 15 }

  const isOrgAdmin = user.organizationMemberships.some(m =>
    m.role.name === "OWNER" || m.role.name === "ADMIN"
  )
  if (isOrgAdmin) return { web: 5, mobile: 3, total: 8 }

  const isOrgMember = user.organizationMemberships.length > 0
  if (isOrgMember) return { web: 3, mobile: 2, total: 5 }

  const tier = user.subscription?.tier || "FREE"

  switch (tier) {
    case "PREMIUM": return { web: 5, mobile: 3, total: 8 }
    case "PLUS": return { web: 3, mobile: 2, total: 5 }
    default: return { web: 2, mobile: 1, total: 3 }
  }
}

async function getActiveSessions(userId: string): Promise<Session[]> {
  return db.session.findMany({
    where: {
      userId,
      isActive: true,
      expiresAt: { gt: new Date() }
    },
    orderBy: { lastActiveAt: "desc" }
  })
}

async function checkSessionLimit(
  userId: string,
  newSessionType: "WEB" | "MOBILE" | "API"
): Promise<{ allowed: boolean; activeSessions: Session[]; needsTermination: boolean }> {
  const limits = await getSessionLimits(userId)
  const activeSessions = await getActiveSessions(userId)

  const webCount = activeSessions.filter(s => s.type === "WEB").length
  const mobileCount = activeSessions.filter(s => s.type === "MOBILE").length
  const totalCount = activeSessions.length

  let allowed = totalCount < limits.total

  if (allowed) {
    if (newSessionType === "WEB") allowed = webCount < limits.web
    if (newSessionType === "MOBILE") allowed = mobileCount < limits.mobile
  }

  return {
    allowed,
    activeSessions,
    needsTermination: !allowed
  }
}

async function createSession(input: CreateSessionInput): Promise<Session> {
  const { allowed, activeSessions, needsTermination } = await checkSessionLimit(
    input.userId,
    input.type
  )

  if (needsTermination) {
    throw new SessionLimitExceededError({
      activeSessions,
      message: "Maksimum oturum sayısına ulaşıldı. Devam etmek için bir oturumu sonlandırın."
    })
  }

  const token = createSecureToken()
  const refreshToken = input.type !== "WEB" ? createSecureToken() : null

  const expiresAt = calculateExpiry(input.type, input.rememberMe || false)

  const session = await db.session.create({
    data: {
      userId: input.userId,
      type: input.type,
      token: hashToken(token),
      refreshToken: refreshToken ? hashToken(refreshToken) : null,
      deviceInfo: input.deviceInfo,
      ipAddress: input.ipAddress,
      geoLocation: input.geoLocation,
      rememberMe: input.rememberMe || false,
      expiresAt,
      lastActiveAt: new Date()
    }
  })

  await redis.setex(
    `session:${session.id}`,
    Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    JSON.stringify({ userId: input.userId, type: input.type })
  )

  return { ...session, token, refreshToken }
}

function calculateExpiry(type: "WEB" | "MOBILE" | "API", rememberMe: boolean): Date {
  const now = new Date()

  switch (type) {
    case "WEB":
      return rememberMe
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case "MOBILE":
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    case "API":
      return new Date(now.getTime() + 15 * 60 * 1000)
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }
}

async function terminateSession(
  sessionId: string,
  reason: Session["revokedReason"]
): Promise<void> {
  await db.session.update({
    where: { id: sessionId },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedReason: reason
    }
  })

  await redis.del(`session:${sessionId}`)

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true }
  })

  if (session?.user && reason !== "USER_LOGOUT") {
    await sendSessionTerminatedNotification(session.user, session, reason)
  }
}

async function terminateAllOtherSessions(
  userId: string,
  currentSessionId: string
): Promise<number> {
  const sessions = await db.session.findMany({
    where: {
      userId,
      isActive: true,
      id: { not: currentSessionId }
    }
  })

  await db.session.updateMany({
    where: {
      userId,
      isActive: true,
      id: { not: currentSessionId }
    },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedReason: "USER_LOGOUT"
    }
  })

  for (const session of sessions) {
    await redis.del(`session:${session.id}`)
  }

  return sessions.length
}

async function extendSession(sessionId: string): Promise<void> {
  const session = await db.session.findUnique({
    where: { id: sessionId }
  })

  if (!session || !session.isActive) return

  const newExpiry = calculateExpiry(session.type as any, session.rememberMe)

  await db.session.update({
    where: { id: sessionId },
    data: {
      lastActiveAt: new Date(),
      expiresAt: newExpiry
    }
  })

  await redis.expire(
    `session:${sessionId}`,
    Math.floor((newExpiry.getTime() - Date.now()) / 1000)
  )
}

export {
  getSessionLimits,
  getActiveSessions,
  checkSessionLimit,
  createSession,
  terminateSession,
  terminateAllOtherSessions,
  extendSession
}
```


## 5.11.5 Session Timeout & Inactivity

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     SESSION TIMEOUT & INACTIVITY                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  INACTIVITY TIMEOUT RULES                                                       │
│  ────────────────────────                                                       │
│                                                                                 │
│  ┌───────────────────┬──────────────────────────────────────────────────────┐  │
│  │ Scenario          │ Behavior                                             │  │
│  ├───────────────────┼──────────────────────────────────────────────────────┤  │
│  │ Normal browsing   │ Session extends on every API request                 │  │
│  │ Tab in background │ Heartbeat every 5 min, extends session               │  │
│  │ Browser closed    │ Session valid until cookie expiry                    │  │
│  │ 30 min no activity│ Show "Oturumunuz sona ermek üzere" warning           │  │
│  │ 60 min no activity│ Auto-logout, redirect to login                       │  │
│  │ Sensitive action  │ Re-authenticate if last auth > 15 min                │  │
│  └───────────────────┴──────────────────────────────────────────────────────┘  │
│                                                                                 │
│  SENSITIVE ACTIONS REQUIRING RE-AUTH                                            │
│  ────────────────────────────────────                                           │
│  • Password change                                                              │
│  • Email change                                                                 │
│  • 2FA enable/disable                                                           │
│  • Payment method add/change                                                    │
│  • Account deletion request                                                     │
│  • Data export request                                                          │
│  • Organization role changes                                                    │
│  • API key generation                                                           │
│                                                                                 │
│  RE-AUTH FLOW                                                                   │
│  ─────────────                                                                  │
│                                                                                 │
│  1. User attempts sensitive action                                              │
│  2. Check lastAuthAt timestamp                                                  │
│  3. If > 15 minutes ago:                                                        │
│     ┌────────────────────────────────────────────┐                              │
│     │         Güvenlik Doğrulaması               │                              │
│     ├────────────────────────────────────────────┤                              │
│     │                                            │                              │
│     │  Bu işlem için kimliğinizi doğrulamanız    │                              │
│     │  gerekiyor.                                │                              │
│     │                                            │                              │
│     │  ┌────────────────────────────────────┐    │                              │
│     │  │ Şifre                          ••• │    │                              │
│     │  └────────────────────────────────────┘    │                              │
│     │                                            │                              │
│     │  [Şifremi Unuttum]                         │                              │
│     │                                            │                              │
│     │  ┌────────────────────────────────────┐    │                              │
│     │  │         Doğrula ve Devam Et        │    │                              │
│     │  └────────────────────────────────────┘    │                              │
│     │                                            │                              │
│     │  [İptal]                                   │                              │
│     └────────────────────────────────────────────┘                              │
│                                                                                 │
│  4. On success: Update lastAuthAt, proceed with action                          │
│  5. On failure: Show error, allow 3 attempts, then lock 15 min                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.11.6 Active Sessions UI Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     ACTIVE SESSIONS UI (/settings/sessions)                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Aktif Oturumlar                                      [Tümünü Sonlandır]  │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  🖥️  Chrome • Windows                                    BU CİHAZ  │  │ │
│  │  │     İstanbul, Türkiye                                               │  │ │
│  │  │     Son aktif: Şu anda                                              │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  📱  VoxPoll iOS • iPhone 14 Pro                       [Sonlandır]  │  │ │
│  │  │     Ankara, Türkiye                                                 │  │ │
│  │  │     Son aktif: 2 saat önce                                          │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  🌐  Safari • macOS                                    [Sonlandır]  │  │ │
│  │  │     İzmir, Türkiye                                                  │  │ │
│  │  │     Son aktif: 3 gün önce                                           │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │  ⚠️  Tanımadığınız bir cihaz görüyorsanız hemen şifrenizi değiştirin     │ │
│  │     ve "Tümünü Sonlandır" butonuna basın.                                 │ │
│  │                                                                           │ │
│  │  [Şifremi Değiştir]                                                       │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  TERMINATE SESSION CONFIRMATION                                                 │
│  ──────────────────────────────                                                 │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │      Oturumu Sonlandır?                    │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  📱 VoxPoll iOS • iPhone 14 Pro            │                                 │
│  │                                            │                                 │
│  │  Bu cihaz oturumdan çıkarılacak ve         │                                 │
│  │  tekrar giriş yapması gerekecek.           │                                 │
│  │                                            │                                 │
│  │  ┌──────────────┐  ┌──────────────────┐    │                                 │
│  │  │    İptal     │  │    Sonlandır     │    │                                 │
│  │  └──────────────┘  └──────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.11.7 Logout Flows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LOGOUT FLOWS                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STANDARD LOGOUT (User initiated)                                               │
│  ─────────────────────────────────                                              │
│                                                                                 │
│  1. User clicks "Çıkış Yap" in menu                                             │
│  2. Terminate current session                                                   │
│  3. Clear local cookies/tokens                                                  │
│  4. Clear local storage (drafts, preferences cached)                            │
│  5. Redirect to login page with "Başarıyla çıkış yaptınız" toast                │
│                                                                                 │
│  FORCED LOGOUT (System initiated)                                               │
│  ─────────────────────────────────                                              │
│                                                                                 │
│  Triggers:                                                                      │
│  • Password changed on another device                                           │
│  • Account suspended/banned                                                     │
│  • Session terminated by user from another device                               │
│  • Admin action                                                                 │
│  • Security concern detected                                                    │
│                                                                                 │
│  Flow:                                                                          │
│  1. WebSocket message: "session_terminated"                                     │
│  2. Show modal (cannot dismiss):                                                │
│     ┌────────────────────────────────────────────┐                              │
│     │           Oturum Sonlandırıldı             │                              │
│     ├────────────────────────────────────────────┤                              │
│     │                                            │                              │
│     │  Oturumunuz başka bir cihazdan veya        │                              │
│     │  güvenlik nedeniyle sonlandırıldı.         │                              │
│     │                                            │                              │
│     │  Devam etmek için tekrar giriş yapın.      │                              │
│     │                                            │                              │
│     │  ┌────────────────────────────────────┐    │                              │
│     │  │         Giriş Sayfasına Git        │    │                              │
│     │  └────────────────────────────────────┘    │                              │
│     └────────────────────────────────────────────┘                              │
│  3. Clear all local data                                                        │
│  4. Redirect to login with reason parameter                                     │
│                                                                                 │
│  LOGOUT DUE TO INACTIVITY                                                       │
│  ────────────────────────────                                                   │
│                                                                                 │
│  1. 30 min inactivity → Warning toast:                                          │
│     "Hareketsizlik nedeniyle 30 dakika içinde çıkış yapılacak"                  │
│     [Oturumu Uzat]                                                              │
│                                                                                 │
│  2. User clicks "Oturumu Uzat" → Session extended, warning dismissed            │
│                                                                                 │
│  3. User doesn't respond within 30 min → Auto logout                            │
│     • Show brief toast: "Hareketsizlik nedeniyle çıkış yapıldı"                 │
│     • Redirect to login                                                         │
│                                                                                 │
│  LOGOUT ALL DEVICES (Security action)                                           │
│  ───────────────────────────────────                                            │
│                                                                                 │
│  Available from:                                                                │
│  • Settings > Security > "Tüm Cihazlardan Çıkış Yap"                            │
│  • Post password change option                                                  │
│  • Security alert response                                                      │
│                                                                                 │
│  Flow:                                                                          │
│  1. Require re-authentication                                                   │
│  2. Confirm dialog:                                                             │
│     "Tüm cihazlardan çıkış yapılacak. Bu cihaz dahil."                          │
│  3. Terminate all sessions including current                                    │
│  4. Send notification to all devices                                            │
│  5. Redirect to login                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.11.8 Session Security Events

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SESSION SECURITY EVENTS & NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const sessionSecurityEventSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  sessionId: z.string().cuid().nullable(),

  eventType: z.enum([
    "NEW_DEVICE_LOGIN",
    "NEW_LOCATION_LOGIN",
    "SUSPICIOUS_LOGIN_ATTEMPT",
    "SESSION_TERMINATED_BY_USER",
    "SESSION_TERMINATED_BY_SYSTEM",
    "PASSWORD_CHANGED",
    "MULTIPLE_FAILED_LOGINS",
    "CONCURRENT_SESSION_LIMIT",
    "SESSION_HIJACKING_DETECTED"
  ]),

  metadata: z.object({
    deviceInfo: z.any().optional(),
    location: z.any().optional(),
    ipAddress: z.string().optional(),
    reason: z.string().optional(),
    triggeredBy: z.string().optional()
  }),

  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),

  notificationSent: z.boolean().default(false),
  notificationChannels: z.array(z.enum(["EMAIL", "PUSH", "SMS"])),

  createdAt: z.date()
})

type SessionSecurityEvent = z.infer<typeof sessionSecurityEventSchema>

async function handleNewDeviceLogin(
  userId: string,
  session: Session
): Promise<void> {
  const knownDevices = await db.session.findMany({
    where: {
      userId,
      isActive: false,
      deviceInfo: { path: ["fingerprint"] }
    },
    select: { deviceInfo: true },
    distinct: ["deviceInfo"]
  })

  const isKnownDevice = knownDevices.some(
    d => d.deviceInfo?.fingerprint === session.deviceInfo.fingerprint
  )

  if (!isKnownDevice) {
    await db.sessionSecurityEvent.create({
      data: {
        userId,
        sessionId: session.id,
        eventType: "NEW_DEVICE_LOGIN",
        metadata: {
          deviceInfo: session.deviceInfo,
          location: session.geoLocation,
          ipAddress: session.ipAddress
        },
        severity: "MEDIUM",
        notificationChannels: ["EMAIL", "PUSH"]
      }
    })

    await sendSecurityNotification(userId, {
      type: "NEW_DEVICE_LOGIN",
      title: "Yeni Cihazdan Giriş",
      body: `${session.deviceInfo.browser} (${session.deviceInfo.os}) ile ${session.geoLocation?.city || "bilinmeyen konum"}'dan giriş yapıldı.`,
      action: {
        label: "Değilse Şifreni Değiştir",
        url: "/settings/security"
      }
    })
  }
}

async function handleSuspiciousLogin(
  userId: string,
  session: Session,
  reason: string
): Promise<void> {
  await db.sessionSecurityEvent.create({
    data: {
      userId,
      sessionId: session.id,
      eventType: "SUSPICIOUS_LOGIN_ATTEMPT",
      metadata: {
        deviceInfo: session.deviceInfo,
        location: session.geoLocation,
        ipAddress: session.ipAddress,
        reason
      },
      severity: "HIGH",
      notificationChannels: ["EMAIL", "PUSH", "SMS"]
    }
  })

  await sendSecurityNotification(userId, {
    type: "SUSPICIOUS_LOGIN",
    title: "Şüpheli Giriş Denemesi",
    body: `Hesabınıza şüpheli bir giriş tespit edildi. ${reason}`,
    action: {
      label: "Hesabımı Güvene Al",
      url: "/settings/security"
    },
    urgent: true
  })
}

async function detectSessionHijacking(session: Session): Promise<boolean> {
  const recentActivities = await redis.lrange(
    `session:${session.id}:ips`,
    0,
    10
  )

  if (recentActivities.length < 2) return false

  const uniqueIPs = new Set(recentActivities)
  const uniqueCountries = new Set(
    await Promise.all(
      Array.from(uniqueIPs).map(ip => getCountryFromIP(ip))
    )
  )

  if (uniqueCountries.size > 1) {
    const timeDiff = calculateTimeBetweenRequests(recentActivities)

    if (timeDiff < 60 * 1000) {
      await handleSessionHijacking(session)
      return true
    }
  }

  return false
}

async function handleSessionHijacking(session: Session): Promise<void> {
  await terminateSession(session.id, "SECURITY_CONCERN")

  await db.sessionSecurityEvent.create({
    data: {
      userId: session.userId!,
      sessionId: session.id,
      eventType: "SESSION_HIJACKING_DETECTED",
      metadata: {
        reason: "Multiple countries detected in short timeframe"
      },
      severity: "CRITICAL",
      notificationChannels: ["EMAIL", "PUSH", "SMS"]
    }
  })

  await sendSecurityNotification(session.userId!, {
    type: "SESSION_HIJACKING",
    title: "🚨 Güvenlik Uyarısı",
    body: "Oturumunuzda şüpheli aktivite tespit edildi ve güvenliğiniz için sonlandırıldı. Lütfen şifrenizi değiştirin.",
    action: {
      label: "Şifremi Değiştir",
      url: "/settings/security/change-password"
    },
    urgent: true
  })
}

export {
  sessionSecurityEventSchema,
  handleNewDeviceLogin,
  handleSuspiciousLogin,
  detectSessionHijacking
}
export type { SessionSecurityEvent }
```


## 5.11.9 Remember Me & Persistent Login

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     REMEMBER ME & PERSISTENT LOGIN                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  LOGIN FORM WITH REMEMBER ME                                                    │
│  ───────────────────────────                                                    │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │              Giriş Yap                     │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  E-posta                                   │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │ ornek@email.com                    │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  Şifre                                     │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │ •••••••••••                    👁️  │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  ☑️ Beni hatırla (30 gün)                  │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │           Giriş Yap                │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  [Şifremi Unuttum]                         │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  REMEMBER ME BEHAVIOR                                                           │
│  ────────────────────                                                           │
│                                                                                 │
│  ┌──────────────────┬──────────────────────────────────────────────────────┐   │
│  │ Checkbox State   │ Session Behavior                                     │   │
│  ├──────────────────┼──────────────────────────────────────────────────────┤   │
│  │ ☐ Unchecked      │ • 7-day session                                      │   │
│  │                  │ • Expires on browser close (session cookie)          │   │
│  │                  │ • Sliding expiration on activity                     │   │
│  ├──────────────────┼──────────────────────────────────────────────────────┤   │
│  │ ☑️ Checked        │ • 30-day session                                     │   │
│  │                  │ • Persistent cookie survives browser close           │   │
│  │                  │ • Sliding expiration on activity                     │   │
│  │                  │ • Requires re-auth for sensitive actions             │   │
│  └──────────────────┴──────────────────────────────────────────────────────┘   │
│                                                                                 │
│  SECURITY CONSIDERATIONS                                                        │
│  ───────────────────────                                                        │
│                                                                                 │
│  • "Remember me" sessions still require password for:                           │
│    - Password change                                                            │
│    - Email change                                                               │
│    - Payment method changes                                                     │
│    - Account deletion                                                           │
│                                                                                 │
│  • On public/shared computers:                                                  │
│    - Show warning when "Remember me" checked                                    │
│    - "Paylaşılan bir bilgisayar kullanıyorsanız bu seçeneği işaretlemeyin"     │
│                                                                                 │
│  • Auto-logout on security events regardless of "Remember me":                  │
│    - Password changed on another device                                         │
│    - Account suspended                                                          │
│    - Suspicious activity detected                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.11.10 Session Recovery

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SESSION RECOVERY FLOWS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  EXPIRED SESSION RECOVERY                                                       │
│  ────────────────────────                                                       │
│                                                                                 │
│  User returns after session expired:                                            │
│                                                                                 │
│  1. API returns 401 Unauthorized                                                │
│  2. Check if refresh token exists (mobile/API)                                  │
│     a) Yes → Attempt silent refresh                                             │
│        • Success → Continue seamlessly                                          │
│        • Failure → Show login modal                                             │
│     b) No → Show login modal                                                    │
│                                                                                 │
│  Login Modal (In-page, not redirect):                                           │
│  ┌────────────────────────────────────────────┐                                 │
│  │        Oturumunuz Sona Erdi                │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  Devam etmek için tekrar giriş yapın.      │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │ Şifre                          ••• │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │           Giriş Yap                │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  [Farklı Hesapla Giriş Yap]                │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  3. On successful re-login:                                                     │
│     • Restore user's position (same page, scroll position)                      │
│     • Recover unsaved form data if any (from localStorage)                      │
│     • Show toast: "Tekrar hoş geldiniz!"                                        │
│                                                                                 │
│                                                                                 │
│  MOBILE APP SESSION RECOVERY                                                    │
│  ───────────────────────────                                                    │
│                                                                                 │
│  Background token refresh:                                                      │
│  • Check token expiry on app launch                                             │
│  • If < 7 days remaining → Refresh silently                                     │
│  • If expired → Attempt refresh token                                           │
│    • Success → New access token, continue                                       │
│    • Failure → Biometric prompt or login screen                                 │
│                                                                                 │
│  Biometric re-auth (if enabled):                                                │
│  ┌────────────────────────────────────────────┐                                 │
│  │                                            │                                 │
│  │              🔐                            │                                 │
│  │                                            │                                 │
│  │     Devam etmek için doğrulayın            │                                 │
│  │                                            │                                 │
│  │     Face ID / Touch ID / Parmak İzi        │                                 │
│  │                                            │                                 │
│  │     [Şifre ile Giriş Yap]                  │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│                                                                                 │
│  UNSAVED DATA RECOVERY                                                          │
│  ─────────────────────                                                          │
│                                                                                 │
│  For content creation forms (poll, test, survey):                               │
│                                                                                 │
│  1. Auto-save to localStorage every 30 seconds                                  │
│  2. On session expiry during creation:                                          │
│     • Show warning: "Değişiklikleriniz kaydedildi. Giriş yapınca devam edin."   │
│  3. On re-login:                                                                │
│     • Check for draft in localStorage                                           │
│     • Show recovery prompt:                                                     │
│       ┌────────────────────────────────────────┐                                │
│       │   Kaydedilmemiş Taslak Bulundu        │                                │
│       │                                        │                                │
│       │   "Yeni Anket" taslağınız var.        │                                │
│       │   Son düzenleme: 2 saat önce          │                                │
│       │                                        │                                │
│       │   [Devam Et]  [Yeni Başla]            │                                │
│       └────────────────────────────────────────┘                                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# 5.12 ACCOUNT SETTINGS & SECURITY
# ══════════════════════════════════════════════════════════════════════════════

## 5.12.1 Settings Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     SETTINGS PAGE (/settings)                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────┐  ┌────────────────────────────────────────────────┐  │
│  │  AYARLAR             │  │  Hesap Bilgileri                               │  │
│  │  ─────────────────── │  │  ──────────────────────────────────────────── │  │
│  │                      │  │                                                │  │
│  │  ▶ Hesap Bilgileri   │  │  Profil Fotoğrafı                             │  │
│  │    Güvenlik          │  │  ┌──────┐                                      │  │
│  │    Gizlilik          │  │  │  📷  │  [Değiştir] [Kaldır]                 │  │
│  │    Bildirimler       │  │  └──────┘                                      │  │
│  │    Oturumlar         │  │                                                │  │
│  │    Abonelik          │  │  Görünen Ad                                    │  │
│  │    Veri ve Gizlilik  │  │  ┌────────────────────────────────────────┐    │  │
│  │    Engellemeler      │  │  │ Ahmet Yılmaz                           │    │  │
│  │                      │  │  └────────────────────────────────────────┘    │  │
│  │                      │  │                                                │  │
│  │                      │  │  Kullanıcı Adı                                │  │
│  │                      │  │  ┌────────────────────────────────────────┐    │  │
│  │                      │  │  │ @ahmet_yilmaz                          │    │  │
│  │                      │  │  └────────────────────────────────────────┘    │  │
│  │                      │  │  ℹ️ 30 günde bir değiştirilebilir              │  │
│  │                      │  │                                                │  │
│  │                      │  │  E-posta                                       │  │
│  │                      │  │  ┌────────────────────────────────────────┐    │  │
│  │                      │  │  │ ahmet@example.com            [Değiştir]│    │  │
│  │                      │  │  └────────────────────────────────────────┘    │  │
│  │                      │  │  ✅ Doğrulanmış                                │  │
│  │                      │  │                                                │  │
│  │                      │  │  Biyografi                                     │  │
│  │                      │  │  ┌────────────────────────────────────────┐    │  │
│  │                      │  │  │ Anketlere bayılırım 📊                 │    │  │
│  │                      │  │  └────────────────────────────────────────┘    │  │
│  │                      │  │  0/200 karakter                                │  │
│  │                      │  │                                                │  │
│  │                      │  │  ┌────────────────────────────────────────┐    │  │
│  │                      │  │  │          Değişiklikleri Kaydet         │    │  │
│  │                      │  │  └────────────────────────────────────────┘    │  │
│  │                      │  │                                                │  │
│  └──────────────────────┘  └────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.12.2 Change Password Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     CHANGE PASSWORD (/settings/security)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Şifre Değiştir                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Mevcut Şifre                                                             │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ •••••••••••                                                    👁️  │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  Yeni Şifre                                                               │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                                                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  Şifre Gereksinimleri:                                                    │ │
│  │  ☐ En az 10 karakter                                                      │ │
│  │  ☐ Büyük harf (A-Z)                                                       │ │
│  │  ☐ Küçük harf (a-z)                                                       │ │
│  │  ☐ Rakam (0-9)                                                            │ │
│  │  ☐ Özel karakter (!@#$%...)                                               │ │
│  │  ℹ️ En az 3 farklı karakter sınıfı gerekli                                │ │
│  │                                                                           │ │
│  │  Yeni Şifre (Tekrar)                                                      │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                                                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  ☐ Diğer tüm cihazlardan çıkış yap                                        │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                     Şifreyi Değiştir                               │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  SUCCESS STATE                                                                  │
│  ─────────────                                                                  │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  ✅ Şifreniz Değiştirildi                  │                                 │
│  │                                            │                                 │
│  │  Yeni şifreniz aktif edildi.               │                                 │
│  │                                            │                                 │
│  │  ☑️ 3 diğer cihazdan çıkış yapıldı         │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │            Tamam                   │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.12.3 Two-Factor Authentication (2FA) Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     TWO-FACTOR AUTHENTICATION                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  2FA DISABLED STATE                                                             │
│  ──────────────────                                                             │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  İki Faktörlü Doğrulama                                                   │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ⚠️ İki faktörlü doğrulama kapalı                                         │ │
│  │                                                                           │ │
│  │  Hesabınızı daha güvenli hale getirmek için iki faktörlü doğrulamayı      │ │
│  │  etkinleştirin. Her girişte telefonunuzdaki bir uygulama ile doğrulama    │ │
│  │  kodu girmeniz gerekecek.                                                 │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │              2FA'yı Etkinleştir                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ENABLE 2FA - STEP 1: Password Confirmation                                     │
│  ───────────────────────────────────────────                                    │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  Güvenlik Doğrulaması                      │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  Devam etmek için şifrenizi girin.         │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │ Şifre                          ••• │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │            Devam Et                │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  ENABLE 2FA - STEP 2: QR Code Setup                                             │
│  ──────────────────────────────────                                             │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  2FA Kurulumu - Adım 1/3                                                  │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  1. Google Authenticator, Authy veya benzer bir uygulama indirin          │ │
│  │  2. Uygulamada "QR kod tara" seçeneğini kullanın                          │ │
│  │  3. Aşağıdaki QR kodu tarayın:                                            │ │
│  │                                                                           │ │
│  │                  ┌─────────────────┐                                      │ │
│  │                  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │                                      │ │
│  │                  │  ▓▓░░░░▓░░░░▓▓  │                                      │ │
│  │                  │  ▓▓░▓▓░▓░▓▓░▓▓  │  ← QR Code                           │ │
│  │                  │  ▓▓░░░░▓░░░░▓▓  │                                      │ │
│  │                  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓  │                                      │ │
│  │                  └─────────────────┘                                      │ │
│  │                                                                           │ │
│  │  QR kodu tarayamıyor musunuz? [Manuel Kod Göster]                         │ │
│  │                                                                           │ │
│  │  Manuel Kod: JBSWY3DPEHPK3PXP                                             │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                        Devam Et                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ENABLE 2FA - STEP 3: Verify Code                                               │
│  ────────────────────────────────                                               │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  2FA Kurulumu - Adım 2/3                                                  │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Uygulamada görünen 6 haneli kodu girin:                                  │ │
│  │                                                                           │ │
│  │            ┌───┐ ┌───┐ ┌───┐   ┌───┐ ┌───┐ ┌───┐                          │ │
│  │            │ 1 │ │ 2 │ │ 3 │   │ 4 │ │ 5 │ │ 6 │                          │ │
│  │            └───┘ └───┘ └───┘   └───┘ └───┘ └───┘                          │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                       Doğrula                                      │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ENABLE 2FA - STEP 4: Backup Codes                                              │
│  ─────────────────────────────────                                              │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  2FA Kurulumu - Adım 3/3                                                  │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ⚠️ YEDEK KODLARINIZI KAYDEDIN                                            │ │
│  │                                                                           │ │
│  │  Telefonunuza erişemezseniz bu kodları kullanarak giriş yapabilirsiniz.   │ │
│  │  Her kod sadece bir kez kullanılabilir.                                   │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                                                                    │   │ │
│  │  │     1. ABCD-EFGH-IJKL        6. MNOP-QRST-UVWX                     │   │ │
│  │  │     2. YZAB-CDEF-GHIJ        7. KLMN-OPQR-STUV                     │   │ │
│  │  │     3. WXYZ-1234-5678        8. 9012-3456-7890                     │   │ │
│  │  │     4. ABCD-1234-EFGH        9. IJKL-5678-MNOP                     │   │ │
│  │  │     5. QRST-9012-UVWX       10. YZAB-3456-CDEF                     │   │ │
│  │  │                                                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  [📋 Kopyala]  [⬇️ İndir (.txt)]                                          │ │
│  │                                                                           │ │
│  │  ☑️ Bu kodları güvenli bir yere kaydettim                                 │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    2FA'yı Etkinleştir                              │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  2FA ENABLED STATE                                                              │
│  ─────────────────                                                              │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  İki Faktörlü Doğrulama                                                   │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ✅ İki faktörlü doğrulama etkin                                          │ │
│  │                                                                           │ │
│  │  Etkinleştirme tarihi: 15 Ocak 2026                                       │ │
│  │  Kalan yedek kod: 8/10                                                    │ │
│  │                                                                           │ │
│  │  [Yedek Kodları Görüntüle]  [Yeni Kodlar Oluştur]                         │ │
│  │                                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────    │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │              2FA'yı Devre Dışı Bırak                               │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.12.4 Change Email Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     CHANGE EMAIL FLOW                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STEP 1: Initiate Change                                                        │
│  ───────────────────────                                                        │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  E-posta Adresini Değiştir                 │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  Mevcut e-posta:                           │                                 │
│  │  ahmet@example.com                         │                                 │
│  │                                            │                                 │
│  │  Yeni e-posta:                             │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │ yeni@example.com                   │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  Şifre (doğrulama için):                   │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │ •••••••••••                        │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │        Doğrulama Kodu Gönder       │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  STEP 2: Verify New Email                                                       │
│  ────────────────────────                                                       │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  E-postanı Doğrula                         │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  yeni@example.com adresine 6 haneli bir    │                                 │
│  │  doğrulama kodu gönderdik.                 │                                 │
│  │                                            │                                 │
│  │            ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                               │
│  │            │   │ │   │ │   │ │   │ │   │ │   │                               │
│  │            └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                               │
│  │                                            │                                 │
│  │  Kod 10 dakika içinde geçerli.             │                                 │
│  │                                            │                                 │
│  │  [Kodu Tekrar Gönder]                      │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │         E-postayı Değiştir         │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  SUCCESS STATE                                                                  │
│  ─────────────                                                                  │
│                                                                                 │
│  ✅ E-posta adresiniz yeni@example.com olarak değiştirildi.                     │
│                                                                                 │
│  ℹ️ Eski e-posta adresinize bilgilendirme gönderildi.                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.12.5 Data Export Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     DATA EXPORT (GDPR/KVKK) (/settings/privacy)                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Verilerinizi İndirin                                                     │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  KVKK ve GDPR kapsamında, VoxPoll'da sakladığımız tüm kişisel             │ │
│  │  verilerinizin bir kopyasını talep edebilirsiniz.                         │ │
│  │                                                                           │ │
│  │  İndirme dosyası şunları içerir:                                          │ │
│  │  ✓ Profil bilgileriniz                                                    │ │
│  │  ✓ Demografik verileriniz                                                 │ │
│  │  ✓ Oluşturduğunuz içerikler                                               │ │
│  │  ✓ Verdiğiniz yanıtlar                                                    │ │
│  │  ✓ Yorum ve etkileşimleriniz                                              │ │
│  │  ✓ Kazandığınız rozetler                                                  │ │
│  │  ✓ Takip listeniz                                                         │ │
│  │  ✓ Bildirim ayarlarınız                                                   │ │
│  │                                                                           │ │
│  │  Format: JSON (makine okunabilir)                                         │ │
│  │                                                                           │ │
│  │  ⚠️ Veri dışa aktarma isteği işlenmesi 24 saate kadar sürebilir.          │ │
│  │     Hazır olduğunda e-posta ile bilgilendirileceksiniz.                   │ │
│  │                                                                           │ │
│  │  Son talep: Henüz talep yok                                               │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                   Veri Dışa Aktarma Talep Et                       │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  REQUEST CONFIRMATION                                                           │
│  ────────────────────                                                           │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  Veri Talebi Onayı                         │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  Güvenliğiniz için şifrenizi girin:        │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │ •••••••••••                        │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  │                                            │                                 │
│  │  ┌────────────────────────────────────┐    │                                 │
│  │  │         Talebi Onayla              │    │                                 │
│  │  └────────────────────────────────────┘    │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
│  PENDING STATE                                                                  │
│  ─────────────                                                                  │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ⏳ Veri dışa aktarma talebiniz işleniyor                                  │ │
│  │                                                                           │ │
│  │  Talep tarihi: 22 Ocak 2026, 14:30                                        │ │
│  │  Tahmini tamamlanma: 24 saat içinde                                       │ │
│  │                                                                           │ │
│  │  Hazır olduğunda ahmet@example.com adresine e-posta göndereceğiz.         │ │
│  │                                                                           │ │
│  │  [Talebi İptal Et]                                                        │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  READY STATE                                                                    │
│  ───────────                                                                    │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ✅ Verileriniz hazır!                                                    │ │
│  │                                                                           │ │
│  │  Dosya boyutu: 2.4 MB                                                     │ │
│  │  Oluşturulma: 23 Ocak 2026, 10:15                                         │ │
│  │                                                                           │ │
│  │  ⚠️ İndirme linki 7 gün geçerlidir.                                       │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    ⬇️ Verileri İndir (.zip)                        │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.12.6 Account Deletion Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     ACCOUNT DELETION (/settings/privacy)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Hesabı Sil                                                               │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ⚠️ DİKKAT: Bu işlem geri alınamaz!                                       │ │
│  │                                                                           │ │
│  │  Hesabınızı sildiğinizde:                                                 │ │
│  │  • Profiliniz ve tüm verileriniz kalıcı olarak silinir                    │ │
│  │  • Oluşturduğunuz içerikler anonim hale getirilir                         │ │
│  │  • Takipçileriniz ve takip ettikleriniz kaybolur                          │ │
│  │  • Kazandığınız rozetler silinir                                          │ │
│  │  • Bu kullanıcı adı 90 gün boyunca başkası tarafından alınamaz            │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                    Hesabımı Sil                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  STEP 1: Reason Selection                                                       │
│  ────────────────────────                                                       │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Hesap Silme - Adım 1/3                                                   │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Ayrılma nedeninizi öğrenebilir miyiz?                                    │ │
│  │                                                                           │ │
│  │  ○ Artık kullanmıyorum                                                    │ │
│  │  ○ Gizlilik endişelerim var                                               │ │
│  │  ○ Çok fazla bildirim alıyorum                                            │ │
│  │  ○ Başka bir platform kullanacağım                                        │ │
│  │  ○ Geçici olarak ara veriyorum                                            │ │
│  │  ○ Diğer                                                                  │ │
│  │                                                                           │ │
│  │  Ek görüş (opsiyonel):                                                    │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                                                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                        Devam Et                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  STEP 2: Alternatives Offered                                                   │
│  ────────────────────────────                                                   │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Hesap Silme - Adım 2/3                                                   │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Hesabınızı silmeden önce bu seçenekleri değerlendirdiniz mi?             │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  🔔 Bildirim Ayarları                                              │   │ │
│  │  │     Rahatsız edici bildirimleri kapatabilirsiniz.                  │   │ │
│  │  │     [Ayarlara Git]                                                 │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  😴 Hesabı Dondur                                                  │   │ │
│  │  │     Hesabınızı geçici olarak gizleyebilirsiniz.                    │   │ │
│  │  │     Verileriniz korunur, istediğiniz zaman dönebilirsiniz.         │   │ │
│  │  │     [Hesabı Dondur]                                                │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  📥 Verileri İndir                                                 │   │ │
│  │  │     Silmeden önce verilerinizin yedeğini alın.                     │   │ │
│  │  │     [Verileri İndir]                                               │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │          Yine de Hesabımı Silmek İstiyorum                         │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  STEP 3: Final Confirmation                                                     │
│  ──────────────────────────                                                     │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Hesap Silme - Adım 3/3                                                   │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  ⚠️ SON ONAY                                                              │ │
│  │                                                                           │ │
│  │  Hesabınız kalıcı olarak silinecek.                                       │ │
│  │  Bu işlem GERİ ALINAMAZ.                                                  │ │
│  │                                                                           │ │
│  │  Onaylamak için şifrenizi girin:                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │ •••••••••••                                                        │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  Onaylamak için "HESABİMİ SİL" yazın:                                     │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                                                                    │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  ┌──────────────────────┐  ┌────────────────────────────────────────┐     │ │
│  │  │       İptal          │  │    Hesabımı Kalıcı Olarak Sil          │     │ │
│  │  └──────────────────────┘  └────────────────────────────────────────┘     │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  30-DAY GRACE PERIOD                                                            │
│  ───────────────────                                                            │
│                                                                                 │
│  After deletion request:                                                        │
│  • Account immediately hidden from public                                       │
│  • 30-day grace period before permanent deletion                                │
│  • User can cancel by logging back in                                           │
│  • Email sent: "Hesabınız 30 gün içinde silinecek. İptal etmek için giriş yapın"│
│                                                                                 │
│  REACTIVATION PROMPT (if user logs in during grace period):                     │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Hesabınız Silinmek Üzere                                                 │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Hesabınız 23 gün içinde kalıcı olarak silinecek.                         │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │              Silmeyi İptal Et ve Hesabı Kurtar                     │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  [Silme İşlemine Devam Et]                                                │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 5.12.7 Account Settings Functions

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ACCOUNT SETTINGS FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"
import { db } from "@/lib/db"
import { hash, verify } from "@/lib/crypto"
import { sendEmail } from "@/lib/email"
import { generateTOTPSecret, verifyTOTP, generateBackupCodes } from "@/lib/totp"

interface ChangePasswordInput {
  userId: string
  currentPassword: string
  newPassword: string
  logoutOtherSessions: boolean
}

async function changePassword(input: ChangePasswordInput): Promise<{
  success: boolean
  error?: string
  sessionsTerminated?: number
}> {
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { passwordHash: true }
  })

  if (!user) return { success: false, error: "USER_NOT_FOUND" }

  const isValid = await verify(input.currentPassword, user.passwordHash)
  if (!isValid) return { success: false, error: "INVALID_PASSWORD" }

  const newPasswordHash = await hash(input.newPassword)

  await db.user.update({
    where: { id: input.userId },
    data: {
      passwordHash: newPasswordHash,
      passwordChangedAt: new Date()
    }
  })

  let sessionsTerminated = 0
  if (input.logoutOtherSessions) {
    const result = await db.session.updateMany({
      where: {
        userId: input.userId,
        isActive: true
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: "PASSWORD_CHANGE"
      }
    })
    sessionsTerminated = result.count
  }

  await sendEmail({
    to: user.email,
    template: "password-changed",
    data: { timestamp: new Date() }
  })

  return { success: true, sessionsTerminated }
}

interface Enable2FAResult {
  success: boolean
  secret?: string
  qrCodeUrl?: string
  error?: string
}

async function initiate2FASetup(userId: string, password: string): Promise<Enable2FAResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, passwordHash: true, twoFactorEnabled: true }
  })

  if (!user) return { success: false, error: "USER_NOT_FOUND" }
  if (user.twoFactorEnabled) return { success: false, error: "2FA_ALREADY_ENABLED" }

  const isValid = await verify(password, user.passwordHash)
  if (!isValid) return { success: false, error: "INVALID_PASSWORD" }

  const secret = generateTOTPSecret()
  const qrCodeUrl = `otpauth://totp/VoxPoll:${user.email}?secret=${secret}&issuer=VoxPoll`

  await db.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret }
  })

  return { success: true, secret, qrCodeUrl }
}

async function verify2FASetup(
  userId: string,
  code: string
): Promise<{ success: boolean; backupCodes?: string[]; error?: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true, twoFactorEnabled: true }
  })

  if (!user || !user.twoFactorSecret) return { success: false, error: "SETUP_NOT_INITIATED" }
  if (user.twoFactorEnabled) return { success: false, error: "2FA_ALREADY_ENABLED" }

  const isValid = verifyTOTP(code, user.twoFactorSecret)
  if (!isValid) return { success: false, error: "INVALID_CODE" }

  const backupCodes = generateBackupCodes(10)
  const hashedBackupCodes = await Promise.all(backupCodes.map(c => hash(c)))

  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorBackupCodes: hashedBackupCodes
    }
  })

  return { success: true, backupCodes }
}

async function disable2FA(
  userId: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, twoFactorEnabled: true }
  })

  if (!user) return { success: false, error: "USER_NOT_FOUND" }
  if (!user.twoFactorEnabled) return { success: false, error: "2FA_NOT_ENABLED" }

  const isValid = await verify(password, user.passwordHash)
  if (!isValid) return { success: false, error: "INVALID_PASSWORD" }

  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: []
    }
  })

  return { success: true }
}

async function requestDataExport(userId: string): Promise<{
  success: boolean
  requestId?: string
  error?: string
}> {
  const existingRequest = await db.dataExportRequest.findFirst({
    where: {
      userId,
      status: "PENDING"
    }
  })

  if (existingRequest) {
    return { success: false, error: "REQUEST_ALREADY_PENDING" }
  }

  const request = await db.dataExportRequest.create({
    data: {
      userId,
      status: "PENDING",
      requestedAt: new Date()
    }
  })

  return { success: true, requestId: request.id }
}

async function requestAccountDeletion(
  userId: string,
  password: string,
  reason: string,
  feedback?: string
): Promise<{ success: boolean; deletionDate?: Date; error?: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, email: true }
  })

  if (!user) return { success: false, error: "USER_NOT_FOUND" }

  const isValid = await verify(password, user.passwordHash)
  if (!isValid) return { success: false, error: "INVALID_PASSWORD" }

  const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        status: "PENDING_DELETION",
        deletionRequestedAt: new Date(),
        scheduledDeletionAt: deletionDate
      }
    }),
    db.accountDeletionRequest.create({
      data: {
        userId,
        reason,
        feedback,
        requestedAt: new Date(),
        scheduledDeletionAt: deletionDate
      }
    }),
    db.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date(), revokedReason: "ACCOUNT_DELETION" }
    })
  ])

  await sendEmail({
    to: user.email,
    template: "account-deletion-scheduled",
    data: {
      deletionDate,
      cancelUrl: `${process.env.NEXT_PUBLIC_URL}/reactivate`
    }
  })

  return { success: true, deletionDate }
}

async function cancelAccountDeletion(userId: string): Promise<{ success: boolean }> {
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        deletionRequestedAt: null,
        scheduledDeletionAt: null
      }
    }),
    db.accountDeletionRequest.updateMany({
      where: { userId, status: "PENDING" },
      data: { status: "CANCELLED", cancelledAt: new Date() }
    })
  ])

  return { success: true }
}

export {
  changePassword,
  initiate2FASetup,
  verify2FASetup,
  disable2FA,
  requestDataExport,
  requestAccountDeletion,
  cancelAccountDeletion
}
```


# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 05
# ══════════════════════════════════════════════════════════════════════════════
# Status: COMPLETE
# Last Updated: January 2026
# Changes: Added Section 5.9 - Social Features (Follow, Friends, DM, Profile Visits)
#          Renumbered White Label to 5.10
#          Added Section 5.11 - Session Management (multi-device, timeout, logout)
#          Added Section 5.12 - Account Settings & Security (2FA, data export, deletion)
#          Added Section 5.6.7-5.6.13 - Organization Invitation flows
# Next Section: SECTION 06 - CONTENT TYPES (POLL / SURVEY / TEST)
# ══════════════════════════════════════════════════════════════════════════════