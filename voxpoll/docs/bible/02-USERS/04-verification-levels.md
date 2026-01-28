# ═══════════════════════════════════════════════════════════════════════════════
# USERS - Verification Levels (Level 0-4, e-Devlet)
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-005.md (section 5.3)
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# VERIFICATION LEVEL OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

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
│  - View public content                                                         │
│  - Participate in public polls (responses weighted 0.5x)                       │
│  - Cannot create content                                                       │
│  - Cannot access discussions                                                   │
│                                                                                 │
│  Level 1: BASIC                                                                │
│  ─────────────────────────────────────────────────────────────                 │
│  Requirements: Verified phone number via SMS OTP                               │
│  Trust Score Impact: Baseline (no modifier)                                    │
│  Capabilities:                                                                 │
│  - All Level 0 capabilities                                                    │
│  - Participate in all public content (standard weight)                         │
│  - Create public polls and personality tests                                   │
│  - Access discussions for participated content                                 │
│  - Basic profile customization                                                 │
│                                                                                 │
│  Level 2: VERIFIED                                                             │
│  ─────────────────────────────────────────────────────────────                 │
│  Requirements: Organization SSO OR secondary verification method               │
│  Trust Score Impact: +10 bonus                                                 │
│  Capabilities:                                                                 │
│  - All Level 1 capabilities                                                    │
│  - Participate in private organization surveys                                 │
│  - Create public surveys                                                       │
│  - Eligible for "Verified Creator" badge                                       │
│  - Priority in stratified sampling                                             │
│                                                                                 │
│  Level 3: IDENTITY VERIFIED                                                    │
│  ─────────────────────────────────────────────────────────────                 │
│  Requirements: Government ID verification (e-Devlet, ID.me, etc.)              │
│  Trust Score Impact: +20 bonus                                                 │
│  Capabilities:                                                                 │
│  - All Level 2 capabilities                                                    │
│  - Participate in high-security surveys (government, healthcare)               │
│  - Eligible for research-grade survey participation                            │
│  - Can be organization admin                                                   │
│  - Demographic data verified (age, location)                                   │
│                                                                                 │
│  Level 4: FULLY VERIFIED                                                       │
│  ─────────────────────────────────────────────────────────────                 │
│  Requirements: Level 3 + biometric verification + address verification         │
│  Trust Score Impact: +30 bonus                                                 │
│  Capabilities:                                                                 │
│  - All Level 3 capabilities                                                    │
│  - Participate in premium research panels                                      │
│  - Eligible for paid survey participation                                      │
│  - Can create organization accounts                                            │
│  - Maximum response weight (1.5x)                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# VERIFICATION LEVEL CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
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



# ═══════════════════════════════════════════════════════════════════════════════
# VERIFICATION LEVEL FEATURE ACCESS MATRIX
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const VERIFICATION_FEATURE_MATRIX = {
  // CONTENT PARTICIPATION
  participation: {
    viewPublicPolls: { minLevel: 0, note: "Everyone can view" },
    voteOnPublicPolls: { minLevel: 0, note: "Even unverified can vote" },
    voteOnRestrictedPolls: { minLevel: 1, note: "Phone verified required" },
    participateInSurveys: { minLevel: 1, note: "Surveys require basic verification" },
    participateInPaidSurveys: { minLevel: 4, note: "Payment requires full identity" },
    participateInResearchSurveys: { minLevel: 3, note: "Research-grade requires ID" },
    takeTests: { minLevel: 1, note: "Tests require basic verification" }
  },

  // CONTENT CREATION
  creation: {
    createQuickPolls: { minLevel: 1, note: "Basic creators" },
    createExtendedPolls: { minLevel: 1, note: "With tier upgrade for features" },
    createLivePolls: { minLevel: 2, note: "Requires enhanced trust" },
    createSurveys: { minLevel: 2, note: "B2B feature, higher trust needed" },
    createTests: { minLevel: 2, note: "Educational content creation" },
    createPrivateContent: { minLevel: 1, note: "Private links available to all" }
  },

  // SOCIAL FEATURES
  social: {
    followUsers: { minLevel: 0, note: "Basic social" },
    postComments: { minLevel: 1, note: "Prevent spam from unverified" },
    voteOnComments: { minLevel: 0, note: "Low friction engagement" },
    createDiscussions: { minLevel: 1, note: "Discussion creation" },
    reportContent: { minLevel: 0, note: "Anyone can report" }
  },

  // ORGANIZATION FEATURES
  organization: {
    createOrganization: { minLevel: 4, note: "Full verification for business" },
    joinOrganization: { minLevel: 1, note: "Invitation-based" },
    becomeOrgAdmin: { minLevel: 3, note: "Identity verified for admin" },
    accessEnterpriseFeatures: { minLevel: 2, note: "SSO-verified org members" }
  },

  // RESPONSE WEIGHTING IN ANALYTICS
  responseWeight: {
    0: { multiplier: 0.5, label: "Reduced weight" },
    1: { multiplier: 1.0, label: "Standard weight" },
    2: { multiplier: 1.1, label: "Slight bonus" },
    3: { multiplier: 1.2, label: "Trusted weight" },
    4: { multiplier: 1.5, label: "Premium weight" }
  }
} as const

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

function getResponseWeight(verificationLevel: 0 | 1 | 2 | 3 | 4): number {
  return VERIFICATION_FEATURE_MATRIX.responseWeight[verificationLevel].multiplier
}

export { VERIFICATION_FEATURE_MATRIX, canPerformAction, getResponseWeight }
```


## Quick Reference Table

```
┌───────┬─────────────────────────────────────────────────────────────────────┐
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


## Verification + Subscription Combined Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│      VERIFICATION LEVEL + SUBSCRIPTION TIER = COMBINED PERMISSIONS              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [!] IMPORTANT: Both systems are INDEPENDENT and ADDITIVE                       │
│                                                                                 │
│  - Verification Level: Trust/identity verification (security)                   │
│  - Subscription Tier: Feature access (monetization)                             │
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
│  Create Test                │     2     │   Free   │ 3/week (Free), Inf(Premium)│
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



# ═══════════════════════════════════════════════════════════════════════════════
# VERIFICATION UPGRADE PROCESS
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      VERIFICATION UPGRADE PROCESS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Level 0 -> Level 1 (Phone Verification)                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 1. User enters phone number                                             │   │
│  │ 2. System sends 6-digit OTP via SMS                                     │   │
│  │ 3. User enters OTP within 10 minutes                                    │   │
│  │ 4. Phone number linked to account                                       │   │
│  │ 5. Level upgraded immediately                                           │   │
│  │                                                                         │   │
│  │ Constraints:                                                            │   │
│  │ - One phone number per account                                          │   │
│  │ - Phone number cannot be used by another account                        │   │
│  │ - 3 OTP attempts, then 1-hour cooldown                                  │   │
│  │ - Phone change requires re-verification + 7-day waiting period          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Level 1 -> Level 2 (Secondary Verification)                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Option A: Organization SSO                                              │   │
│  │ - Join organization via invitation link                                 │   │
│  │ - Complete SSO authentication                                           │   │
│  │ - Automatic upgrade upon successful SSO                                 │   │
│  │                                                                         │   │
│  │ Option B: Enhanced Verification                                         │   │
│  │ - Enable 2FA with authenticator app                                     │   │
│  │ - Complete email re-verification                                        │   │
│  │ - Submit selfie for basic liveness check                                │   │
│  │ - Manual review (24-48 hours)                                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Level 2 -> Level 3 (Identity Verification)                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Option A: e-Government (Turkey: e-Devlet)                               │   │
│  │ - Redirect to e-Government portal                                       │   │
│  │ - User authenticates with national ID                                   │   │
│  │ - Receive verified: full name, birth date, citizenship                  │   │
│  │ - Automatic upgrade upon successful verification                        │   │
│  │                                                                         │   │
│  │ Option B: ID Document Verification                                      │   │
│  │ - Upload government-issued ID (front + back)                            │   │
│  │ - Complete liveness check (video selfie)                                │   │
│  │ - AI + manual review (24-72 hours)                                      │   │
│  │ - May require additional documentation                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Level 3 -> Level 4 (Full Verification)                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Requirements:                                                           │   │
│  │ - Biometric verification (fingerprint or face ID on device)             │   │
│  │ - Address verification (utility bill or bank statement)                 │   │
│  │ - Phone number ownership confirmation (carrier verification)            │   │
│  │ - Account age minimum: 30 days at Level 3                               │   │
│  │                                                                         │   │
│  │ Review Process:                                                         │   │
│  │ - Automated checks + manual review                                      │   │
│  │ - Processing time: 3-5 business days                                    │   │
│  │ - May require video call verification for edge cases                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# e-DEVLET INTEGRATION (TURKEY)
# ═══════════════════════════════════════════════════════════════════════════════

e-Devlet (e-Government) is Turkey's national digital government platform that
provides verified identity information for citizens.

## Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       e-DEVLET VERIFICATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User              VoxPoll              e-Devlet                               │
│   |                   |                    |                                   │
│   |-- 1. Request ---->|                    |                                   │
│   |   Level 3         |                    |                                   │
│   |                   |                    |                                   │
│   |<- 2. Redirect ----|                    |                                   │
│   |   to e-Devlet     |                    |                                   │
│   |                   |                    |                                   │
│   |-------------- 3. Authenticate ------->|                                   │
│   |                   |                    |                                   │
│   |<------------- 4. Consent Screen ------|                                   │
│   |                   |                    |                                   │
│   |-------------- 5. Approve Sharing ---->|                                   │
│   |                   |                    |                                   │
│   |<------------- 6. Redirect + Token ----|                                   │
│   |                   |                    |                                   │
│   |-- 7. Callback --->|                    |                                   │
│   |                   |                    |                                   │
│   |                   |-- 8. Fetch Data -->|                                   │
│   |                   |                    |                                   │
│   |                   |<-- 9. User Info ---|                                   │
│   |                   |                    |                                   │
│   |<- 10. Verified ---|                    |                                   │
│   |   Level 3         |                    |                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Received from e-Devlet

| Field | Description | Stored |
|-------|-------------|--------|
| TC Kimlik No | National ID number | Hashed only |
| Ad Soyad | Full name | Yes (encrypted) |
| Dogum Tarihi | Birth date | Yes |
| Cinsiyet | Gender | Yes |
| Vatandaslik | Citizenship | Yes |
| Il/Ilce | Province/District | Yes |

[MUST] National ID number is NEVER stored in plain text.
[MUST] Only a salted hash is stored for duplicate detection.



# ═══════════════════════════════════════════════════════════════════════════════
# VERIFICATION DATA STORAGE
# ═══════════════════════════════════════════════════════════════════════════════

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
