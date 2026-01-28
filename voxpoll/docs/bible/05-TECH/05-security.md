# Security & Authentication
> Source: bible-005.md, bible-002.md

---

# ══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## Authentication Methods

| Method | Description | Verification Level | Use Case |
|--------|-------------|-------------------|----------|
| Email + Password | Traditional registration | Level 0 | Basic access |
| Phone + OTP | SMS verification required | Level 1 | Enhanced trust |
| OAuth (Google) | Google account linking | Level 0-1 | Quick signup |
| OAuth (Apple) | Apple ID linking | Level 0-1 | iOS users |
| SSO (SAML/OIDC) | Enterprise identity provider | Level 2 | Organization members |
| e-Government | National ID verification | Level 3-4 | High-trust surveys |
| Magic Link | Email-based passwordless | Level 0 | Quick login |
| Passkey | WebAuthn/FIDO2 | Level 1+ | Secure passwordless |

## Authentication Method Restrictions

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION CONFIGURATION
// [CRITICAL SECURITY DECISION]:
// NEVER SUPPORTED: Facebook OAuth, Twitter/X OAuth (privacy, instability)
// ONLY SUPPORTED: Google, Apple, e-Devlet, Email+Password, Phone OTP
// ═══════════════════════════════════════════════════════════════════════════

type AuthMethod =
  | "EMAIL_PASSWORD"
  | "PHONE_OTP"
  | "OAUTH_GOOGLE"
  | "OAUTH_APPLE"
  | "SSO_SAML"
  | "SSO_OIDC"
  | "MAGIC_LINK"
  | "PASSKEY"

const AUTH_CONFIGS: Record<AuthMethod, AuthConfig> = {
  EMAIL_PASSWORD: {
    enabled: true,
    mfaRequired: false,
    sessionDuration: 7 * 24 * 60 * 60,
    refreshTokenDuration: 30 * 24 * 60 * 60
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
    sessionDuration: 8 * 60 * 60,
    refreshTokenDuration: 24 * 60 * 60
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
    sessionDuration: 24 * 60 * 60,
    refreshTokenDuration: 7 * 24 * 60 * 60
  },
  PASSKEY: {
    enabled: true,
    mfaRequired: false,
    sessionDuration: 30 * 24 * 60 * 60,
    refreshTokenDuration: 90 * 24 * 60 * 60
  }
}
```

---

# ══════════════════════════════════════════════════════════════════════════════
# PASSWORD SECURITY
# ══════════════════════════════════════════════════════════════════════════════

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

## Password Validation Schema

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// PASSWORD VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

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
```

---

# ══════════════════════════════════════════════════════════════════════════════
# SESSION MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════

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

## JWT Token Structure

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// JWT PAYLOAD STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

interface JWTPayload {
  sub: string
  sid: string
  email: string
  username: string
  verificationLevel: 0 | 1 | 2 | 3 | 4
  subscriptionTier: "FREE" | "PLUS" | "PREMIUM"
  role: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN"
  orgId?: string
  orgRole?: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
  iat: number
  exp: number
}
```

---

# ══════════════════════════════════════════════════════════════════════════════
# VERIFICATION LEVELS
# ══════════════════════════════════════════════════════════════════════════════

## Verification Level Definitions

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        VERIFICATION LEVELS (0-4)                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Level 0: UNVERIFIED                                                           │
│  ─────────────────────────────────────────────────────────────────────────      │
│  Requirements: Email address only (unverified or OAuth without phone)          │
│  Trust Score Impact: -10 penalty                                               │
│  Capabilities:                                                                 │
│  - View public content                                                         │
│  - Participate in public polls (responses weighted 0.5x)                       │
│  - Cannot create content                                                       │
│  - Cannot access discussions                                                   │
│                                                                                 │
│  Level 1: BASIC                                                                │
│  ─────────────────────────────────────────────────────────────────────────      │
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
│  ─────────────────────────────────────────────────────────────────────────      │
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
│  ─────────────────────────────────────────────────────────────────────────      │
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
│  ─────────────────────────────────────────────────────────────────────────      │
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

## Response Weight by Verification Level

| Level | Weight Multiplier | Label |
|-------|-------------------|-------|
| 0 | 0.5x | Reduced weight |
| 1 | 1.0x | Standard weight |
| 2 | 1.1x | Slight bonus |
| 3 | 1.2x | Trusted weight |
| 4 | 1.5x | Premium weight |

---

# ══════════════════════════════════════════════════════════════════════════════
# RATE LIMITING
# ══════════════════════════════════════════════════════════════════════════════

## Rate Limits by Tier

| Tier | General API | Search | Content Creation | Auth |
|------|-------------|--------|------------------|------|
| Anonymous | 60/min | 10/min | N/A | 10/hour |
| Free | 120/min | 30/min | 3/day (polls) | 30/hour |
| Plus | 300/min | 60/min | 10/day (polls) | 60/hour |
| Premium | 600/min | 120/min | Unlimited | 120/hour |

## Endpoint-Specific Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/register | 5 | 1 hour |
| POST /auth/login | 10 | 15 min |
| POST /auth/forgot-password | 3 | 1 hour |
| POST /verification/phone/send | 3 | 1 hour |
| POST /polls/:id/vote | 1 | per poll |
| POST /messages (non-friends) | 5-100 | 1 day |

## Rate Limiting Implementation

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING (Token Bucket via Redis)
// ═══════════════════════════════════════════════════════════════════════════

interface RateLimitConfig {
  maxTokens: number
  refillRate: number
  refillInterval: number
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  "api:anonymous": { maxTokens: 60, refillRate: 1, refillInterval: 1000 },
  "api:authenticated": { maxTokens: 120, refillRate: 2, refillInterval: 1000 },
  "api:plus": { maxTokens: 300, refillRate: 5, refillInterval: 1000 },
  "api:premium": { maxTokens: 600, refillRate: 10, refillInterval: 1000 },
  "auth:login": { maxTokens: 10, refillRate: 1, refillInterval: 90000 },
  "auth:register": { maxTokens: 5, refillRate: 1, refillInterval: 720000 },
  "verification:otp": { maxTokens: 3, refillRate: 1, refillInterval: 1200000 },
}
```

---

# ══════════════════════════════════════════════════════════════════════════════
# API SECURITY
# ══════════════════════════════════════════════════════════════════════════════

## Security Headers

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// SECURITY HEADERS (Hono secureHeaders)
// ═══════════════════════════════════════════════════════════════════════════

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'self'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

## CORS Configuration

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// CORS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CORS_CONFIG = {
  origin: [
    "https://voxpoll.com",
    "https://www.voxpoll.com",
    "https://app.voxpoll.com",
    process.env.NODE_ENV === "development" && "http://localhost:3000"
  ].filter(Boolean),
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  maxAge: 86400
}
```

## Input Validation

Every endpoint validates input with Zod schemas:

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// INPUT VALIDATION PATTERN
// ═══════════════════════════════════════════════════════════════════════════

import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const createPollSchema = z.object({
  question: z.string().min(10).max(500),
  options: z.array(z.object({
    text: z.string().min(1).max(200)
  })).min(2).max(10),
  settings: z.object({
    duration: z.number().min(1).max(43200),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"])
  })
})

app.post("/polls",
  authMiddleware,
  zValidator("json", createPollSchema),
  async (c) => {
    const data = c.req.valid("json")
  }
)
```

---

# ══════════════════════════════════════════════════════════════════════════════
# DATA PROTECTION
# ══════════════════════════════════════════════════════════════════════════════

## Encryption Standards

| Data Type | Encryption | Standard |
|-----------|------------|----------|
| Passwords | Hash | Argon2id (@node-rs/argon2) - T-006 |
| PII at rest | Encrypt | AES-256-GCM |
| Data in transit | Encrypt | TLS 1.3 |
| Sensitive tokens | Hash | SHA-256 |
| Refresh tokens | Sign | HMAC-SHA256 |

## GDPR Compliance

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GDPR COMPLIANCE                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Data Subject Rights:                                                          │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ Right to Access: GET /users/me/data-export                                  │
│  ✓ Right to Rectification: PATCH /users/me                                     │
│  ✓ Right to Erasure: DELETE /users/me (soft delete + anonymization)            │
│  ✓ Right to Portability: GET /users/me/data-export?format=json                 │
│  ✓ Right to Restrict Processing: PATCH /users/me/settings                      │
│  ✓ Right to Object: Opt-out mechanisms in settings                             │
│                                                                                 │
│  Data Retention:                                                               │
│  ─────────────────────────────────────────────────────────────────────────      │
│  - Active user data: Retained while account active                             │
│  - Deleted accounts: Anonymized after 30 days, purged after 90 days           │
│  - Audit logs: Retained for 7 years (legal requirement)                        │
│  - Session data: Purged 30 days after last activity                           │
│                                                                                 │
│  Consent Management:                                                           │
│  ─────────────────────────────────────────────────────────────────────────      │
│  - Explicit consent required for data processing                               │
│  - Consent checkboxes unchecked by default                                     │
│  - Granular consent options                                                    │
│  - Easy consent withdrawal                                                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Data Anonymization

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// DATA ANONYMIZATION ON ACCOUNT DELETION
// ═══════════════════════════════════════════════════════════════════════════

async function anonymizeUser(userId: string) {
  const anonymousId = `deleted_${createHash('sha256').update(userId).digest('hex').slice(0, 12)}`

  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({
        email: `${anonymousId}@deleted.voxpoll.com`,
        username: anonymousId,
        displayName: "Deleted User",
        avatarUrl: null,
        bio: null,
        phone: null,
        passwordHash: null,
        status: "DELETED",
        deletedAt: new Date()
      })
      .where(eq(users.id, userId))

    await tx.delete(sessions).where(eq(sessions.userId, userId))
    await tx.delete(accounts).where(eq(accounts.userId, userId))

    await tx.update(comments)
      .set({ body: "[Comment deleted]", isDeleted: true })
      .where(eq(comments.authorId, userId))
  })
}
```

---

# ══════════════════════════════════════════════════════════════════════════════
# AUDIT LOGGING
# ══════════════════════════════════════════════════════════════════════════════

## Audit Log Events

| Category | Events |
|----------|--------|
| Auth | login, logout, password_change, 2fa_enable, 2fa_disable |
| User | profile_update, settings_change, account_delete |
| Content | create, update, delete, publish, close |
| Moderation | hide, unhide, warn, suspend, ban |
| Organization | member_add, member_remove, role_change |
| Admin | config_change, feature_flag_change |

## Audit Log Structure

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOG ENTRY
// ═══════════════════════════════════════════════════════════════════════════

interface AuditLogEntry {
  id: string
  timestamp: Date
  actorId: string | null
  actorType: "USER" | "SYSTEM" | "ADMIN"
  action: string
  resourceType: string
  resourceId: string | null
  changes: Record<string, { old: unknown; new: unknown }> | null
  metadata: {
    ipAddress: string
    userAgent: string
    requestId: string
    sessionId: string | null
  }
}
```

---

*Source: bible-005.md, bible-002.md*
