# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 14                                    █
# █                  API CONTRACTS (SERVER ACTIONS + ZOD)                      █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 14.1 SERVER ACTION ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 14.1.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SERVER ACTION ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CLIENT (React)                              │   │
│  │  • Form submissions via useActionState                              │   │
│  │  • Mutations via server action calls                                │   │
│  │  • Optimistic updates with useOptimistic                            │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SERVER ACTION LAYER                            │   │
│  │  • "use server" directive                                           │   │
│  │  • Zod input validation                                             │   │
│  │  • Authentication check                                             │   │
│  │  • Authorization check                                              │   │
│  │  • Rate limiting                                                    │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       SERVICE LAYER                                 │   │
│  │  • Business logic execution                                         │   │
│  │  • Database operations (Drizzle)                                    │   │
│  │  • External service calls                                           │   │
│  │  • Event emission                                                   │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      RESPONSE LAYER                                 │   │
│  │  • Standardized ActionResult<T> response                            │   │
│  │  • Error transformation                                             │   │
│  │  • Cache invalidation (revalidatePath/revalidateTag)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 14.1.2 Base Types & Utilities

```typescript
import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// ACTION RESULT TYPE
// ─────────────────────────────────────────────────────────────────────────────

const ActionErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  details: z.record(z.unknown()).optional()
})

const ActionResultSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      data: dataSchema
    }),
    z.object({
      success: z.literal(false),
      error: ActionErrorSchema
    })
  ])

type ActionError = z.infer<typeof ActionErrorSchema>
type ActionResult<T> = { success: true; data: T } | { success: false; error: ActionError }

// ─────────────────────────────────────────────────────────────────────────────
// ERROR CODES
// ─────────────────────────────────────────────────────────────────────────────

const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  CONTENT_EXPIRED: "CONTENT_EXPIRED",
  ALREADY_PARTICIPATED: "ALREADY_PARTICIPATED",
  NOT_ELIGIBLE: "NOT_ELIGIBLE",
  BLOCKED: "BLOCKED",

  // AUTH SECURITY ERROR CODES
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  PASSWORD_REUSED: "PASSWORD_REUSED",
  SESSION_LIMIT_EXCEEDED: "SESSION_LIMIT_EXCEEDED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  DEVICE_NOT_TRUSTED: "DEVICE_NOT_TRUSTED",
  TWO_FACTOR_REQUIRED: "TWO_FACTOR_REQUIRED",
  TWO_FACTOR_INVALID: "TWO_FACTOR_INVALID",

  // XSS/SECURITY ERROR CODES
  INVALID_CONTENT: "INVALID_CONTENT",
  POTENTIALLY_MALICIOUS: "POTENTIALLY_MALICIOUS"
} as const

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function success<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

function failure(code: string, message: string, field?: string): ActionResult<never> {
  return { success: false, error: { code, message, field } }
}

function fromZodError(error: z.ZodError): ActionResult<never> {
  const firstError = error.errors[0]
  return failure(
    ErrorCodes.VALIDATION_ERROR,
    firstError.message,
    firstError.path.join(".")
  )
}

export {
  ActionErrorSchema,
  ActionResultSchema,
  ErrorCodes,
  success,
  failure,
  fromZodError
}
export type { ActionError, ActionResult }
```

## 14.1.3 Action Wrapper

```typescript
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

interface ActionContext {
  userId: string | null
  sessionId: string | null
  ip: string
  userAgent: string
}

async function getActionContext(): Promise<ActionContext> {
  const session = await auth()
  const headersList = await headers()

  return {
    userId: session?.user?.id ?? null,
    sessionId: session?.sessionId ?? null,
    ip: headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown",
    userAgent: headersList.get("user-agent") ?? "unknown"
  }
}

// [SECURITY] Action wrapper with comprehensive authorization checks
// [REFERENCE] BIBLE-015 Section 15.14.7 - Subscription Tier Rules
type SubscriptionTier = "FREE" | "PLUS" | "PREMIUM"

interface SanitizationConfig {
  fields?: Record<string, "PLAIN_TEXT" | "MARKDOWN_TEXT" | "RICH_TEXT" | "URL" | "EMAIL">
  skipSanitization?: string[]                 // Fields to skip (e.g., password)
}

interface ActionOptions {
  requireAuth?: boolean
  requireTier?: SubscriptionTier              // Minimum tier required
  requireOrganization?: boolean               // B2B only actions
  requireOrganizationRole?: string[]          // e.g., ["ADMIN", "MANAGER"]
  rateLimit?: { requests: number; window: number }
  auditLog?: boolean                          // Log action for compliance
  sanitizationConfig?: SanitizationConfig     // Input sanitization rules
}

function createAction<TInput, TOutput>(
  inputSchema: z.ZodSchema<TInput>,
  handler: (input: TInput, ctx: ActionContext) => Promise<ActionResult<TOutput>>,
  options?: ActionOptions
) {
  return async (rawInput: unknown): Promise<ActionResult<TOutput>> => {
    try {
      const ctx = await getActionContext()

      // 1. Authentication check
      if (options?.requireAuth && !ctx.userId) {
        return failure(ErrorCodes.UNAUTHORIZED, "Oturum açmanız gerekiyor")
      }

      // 2. Subscription tier check
      if (options?.requireTier && ctx.userId) {
        const userTier = await getUserSubscriptionTier(ctx.userId)
        const tierHierarchy: Record<SubscriptionTier, number> = {
          FREE: 0,
          PLUS: 1,
          PREMIUM: 2
        }
        if (tierHierarchy[userTier] < tierHierarchy[options.requireTier]) {
          const tierNames: Record<SubscriptionTier, string> = {
            FREE: "Free",
            PLUS: "Plus",
            PREMIUM: "Premium"
          }
          return failure(
            ErrorCodes.FORBIDDEN,
            `Bu özellik için ${tierNames[options.requireTier]} abonelik gereklidir`
          )
        }
      }

      // 3. Organization membership check
      if (options?.requireOrganization && ctx.userId) {
        const orgMembership = await getUserOrganizationMembership(ctx.userId)
        if (!orgMembership) {
          return failure(
            ErrorCodes.FORBIDDEN,
            "Bu işlem için bir organizasyona üye olmanız gerekiyor"
          )
        }

        // 3a. Organization role check
        if (options?.requireOrganizationRole) {
          if (!options.requireOrganizationRole.includes(orgMembership.role)) {
            return failure(
              ErrorCodes.FORBIDDEN,
              "Bu işlem için yeterli organizasyon yetkiniz yok"
            )
          }
        }
      }

      // 4. Rate limiting check
      if (options?.rateLimit) {
        const identifier = ctx.userId ?? ctx.ip
        const isRateLimited = await checkRateLimit(
          identifier,
          options.rateLimit.requests,
          options.rateLimit.window
        )
        if (isRateLimited) {
          return failure(
            ErrorCodes.RATE_LIMITED,
            "Çok fazla istek gönderdiniz. Lütfen bekleyin."
          )
        }
      }

      // 5. Input validation
      const parsed = inputSchema.safeParse(rawInput)
      if (!parsed.success) {
        return fromZodError(parsed.error)
      }

      // 6. Input sanitization
      // [REFERENCE] BIBLE-015 Section 15.11.3 - Input Sanitization Rules
      const sanitized = await sanitizeInput(parsed.data, options?.sanitizationConfig)

      // 6a. Check for malicious content detection
      if (sanitized.blocked) {
        await logSecurityEvent({
          type: "MALICIOUS_INPUT_BLOCKED",
          actorId: ctx.userId,
          ip: ctx.ip,
          pattern: sanitized.blockedPattern
        })
        return failure(
          ErrorCodes.POTENTIALLY_MALICIOUS,
          "Girişte izin verilmeyen içerik tespit edildi"
        )
      }

      // 7. Execute handler with sanitized input
      const result = await handler(sanitized.data, ctx)

      // 7. Audit logging (for compliance-critical actions)
      if (options?.auditLog && ctx.userId) {
        await logAuditEvent({
          actorId: ctx.userId,
          action: handler.name,
          input: parsed.data,
          result: result.success ? "SUCCESS" : "FAILURE",
          ip: ctx.ip,
          userAgent: ctx.userAgent
        })
      }

      return result
    } catch (error) {
      console.error("Action error:", error)
      return failure(ErrorCodes.INTERNAL_ERROR, "Beklenmeyen bir hata oluştu")
    }
  }
}

// Helper functions (implementation in service layer)
async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  // Fetch from UserSubscription table
  return "FREE"
}

async function getUserOrganizationMembership(userId: string): Promise<{ orgId: string; role: string } | null> {
  // Fetch from OrganizationMember table
  return null
}

async function checkRateLimit(identifier: string, requests: number, window: number): Promise<boolean> {
  // Check Redis rate limit
  return false
}

async function logAuditEvent(event: {
  actorId: string
  action: string
  input: unknown
  result: string
  ip: string
  userAgent: string
}): Promise<void> {
  // Write to AuditLog table
}

async function logSecurityEvent(event: {
  type: string
  actorId: string | null
  ip: string
  pattern?: string
}): Promise<void> {
  // Write to security log, alert if threshold exceeded
}

// [REFERENCE] BIBLE-015 Section 15.11.3 - Input Sanitization Rules
interface SanitizationResult<T> {
  data: T
  blocked: boolean
  blockedPattern?: string
  modifications: string[]
}

async function sanitizeInput<T>(
  input: T,
  config?: SanitizationConfig
): Promise<SanitizationResult<T>> {
  // 1. Check for dangerous patterns (XSS, injection)
  // 2. Apply field-specific sanitization based on config
  // 3. Return sanitized data with modification log

  // Default implementation passes through
  // Real implementation uses DOMPurify/sanitize-html
  return {
    data: input,
    blocked: false,
    modifications: []
  }
}

export { getActionContext, createAction, sanitizeInput }
export type { ActionContext, ActionOptions, SanitizationConfig }
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.2 AUTHENTICATION ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.2.1 Register Action

```typescript
"use server"

import { z } from "zod"

// [REFERENCE] Password requirements defined in BIBLE-005 Section 5.2.4
const RegisterInputSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z
    .string()
    .min(10, "Şifre en az 10 karakter olmalı")
    .max(128, "Şifre en fazla 128 karakter olabilir")
    .refine(
      (password) => {
        const classes = [
          /[a-z]/.test(password),
          /[A-Z]/.test(password),
          /[0-9]/.test(password),
          /[^a-zA-Z0-9]/.test(password)
        ].filter(Boolean).length
        return classes >= 3
      },
      "Şifre en az 3 karakter türü içermeli (büyük harf, küçük harf, rakam, sembol)"
    ),
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalı")
    .max(30, "Kullanıcı adı en fazla 30 karakter olabilir")
    .regex(/^[a-zA-Z0-9_]+$/, "Sadece harf, rakam ve alt çizgi kullanılabilir"),
  displayName: z
    .string()
    .min(2, "Görünen ad en az 2 karakter olmalı")
    .max(50, "Görünen ad en fazla 50 karakter olabilir"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Kullanım koşullarını kabul etmelisiniz" })
  }),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: "Gizlilik politikasını kabul etmelisiniz" })
  })
})

const RegisterOutputSchema = z.object({
  userId: z.string(),
  requiresVerification: z.boolean()
})

type RegisterInput = z.infer<typeof RegisterInputSchema>
type RegisterOutput = z.infer<typeof RegisterOutputSchema>

const register = createAction(
  RegisterInputSchema,
  async (input, ctx): Promise<ActionResult<RegisterOutput>> => {
    // Implementation in service layer
    return success({ userId: "", requiresVerification: true })
  },
  { rateLimit: { requests: 5, window: 3600 } }
)

export { RegisterInputSchema, RegisterOutputSchema, register }
export type { RegisterInput, RegisterOutput }
```

## 14.2.2 Login Action

```typescript
"use server"

import { z } from "zod"

const LoginInputSchema = z.object({
  identifier: z.string().min(1, "E-posta veya kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
  rememberMe: z.boolean().default(false),
  deviceFingerprint: z.string().optional()
})

const LoginOutputSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  requiresTwoFactor: z.boolean(),
  isNewDevice: z.boolean(),
  sessionCount: z.number()
})

type LoginInput = z.infer<typeof LoginInputSchema>
type LoginOutput = z.infer<typeof LoginOutputSchema>

// [REFERENCE] Account lockout rules defined in BIBLE-015 Section 15.2.3 ACC_005
const login = createAction(
  LoginInputSchema,
  async (input, ctx): Promise<ActionResult<LoginOutput>> => {
    // Implementation must check:
    // 1. Check if account is locked (lockedUntil > now)
    //    → Return ACCOUNT_LOCKED with remaining time
    // 2. Verify credentials
    //    → On failure: increment failedLoginAttempts, check lockout threshold
    // 3. Check concurrent session limit
    //    → If exceeded: either force logout oldest or return SESSION_LIMIT_EXCEEDED
    // 4. Reset failedLoginAttempts on success
    // 5. Create session with device fingerprint
    // 6. Notify user if new device login
    return success({
      userId: "",
      sessionId: "",
      requiresTwoFactor: false,
      isNewDevice: false,
      sessionCount: 1
    })
  },
  { rateLimit: { requests: 10, window: 900 } }
)

export { LoginInputSchema, LoginOutputSchema, login }
export type { LoginInput, LoginOutput }
```

## 14.2.3 Other Auth Actions

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────

const LogoutInputSchema = z.object({
  allDevices: z.boolean().default(false)
})

const LogoutOutputSchema = z.object({
  loggedOut: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────────────────────────────────────────────

const VerifyEmailInputSchema = z.object({
  token: z.string().min(1)
})

const VerifyEmailOutputSchema = z.object({
  verified: z.boolean(),
  userId: z.string()
})

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST PASSWORD RESET
// ─────────────────────────────────────────────────────────────────────────────

const RequestPasswordResetInputSchema = z.object({
  email: z.string().email()
})

const RequestPasswordResetOutputSchema = z.object({
  sent: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────

// [REFERENCE] Password requirements defined in BIBLE-005 Section 5.2.4
const ResetPasswordInputSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(10, "Şifre en az 10 karakter olmalı")
    .max(128, "Şifre en fazla 128 karakter olabilir")
    .refine(
      (password) => {
        const classes = [
          /[a-z]/.test(password),
          /[A-Z]/.test(password),
          /[0-9]/.test(password),
          /[^a-zA-Z0-9]/.test(password)
        ].filter(Boolean).length
        return classes >= 3
      },
      "Şifre en az 3 karakter türü içermeli"
    )
})

const ResetPasswordOutputSchema = z.object({
  reset: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────────────────────

// [REFERENCE] Password requirements defined in BIBLE-005 Section 5.2.4
// [REFERENCE] Password history rules defined in BIBLE-015 Section 15.2.3 ACC_006
const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(10, "Şifre en az 10 karakter olmalı")
    .max(128, "Şifre en fazla 128 karakter olabilir")
    .refine(
      (password) => {
        const classes = [
          /[a-z]/.test(password),
          /[A-Z]/.test(password),
          /[0-9]/.test(password),
          /[^a-zA-Z0-9]/.test(password)
        ].filter(Boolean).length
        return classes >= 3
      },
      "Şifre en az 3 karakter türü içermeli"
    )
})

const ChangePasswordOutputSchema = z.object({
  changed: z.boolean(),
  passwordHistoryChecked: z.boolean()
})

// Implementation must:
// 1. Verify currentPassword matches
// 2. Check newPassword against passwordHistory (last 5 hashes)
//    → If match found: return PASSWORD_REUSED error
// 3. Hash newPassword and add to passwordHistory (keep last 5)
// 4. Update passwordHash and passwordChangedAt
// 5. Optionally invalidate all other sessions

export {
  LogoutInputSchema,
  LogoutOutputSchema,
  VerifyEmailInputSchema,
  VerifyEmailOutputSchema,
  RequestPasswordResetInputSchema,
  RequestPasswordResetOutputSchema,
  ResetPasswordInputSchema,
  ResetPasswordOutputSchema,
  ChangePasswordInputSchema,
  ChangePasswordOutputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.3 USER ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.3.1 Profile Actions

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────────────────────────────────────────

const GetProfileInputSchema = z.object({
  userId: z.string().cuid2().optional(),
  username: z.string().optional()
}).refine(data => data.userId || data.username, {
  message: "userId veya username gerekli"
})

const PublicProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  isVerified: z.boolean(),
  isPremium: z.boolean(),
  level: z.number(),
  followerCount: z.number(),
  followingCount: z.number(),
  pollCount: z.number(),
  participationCount: z.number(),
  badges: z.array(z.object({
    code: z.string(),
    name: z.string(),
    iconUrl: z.string()
  })),
  joinedAt: z.date(),
  isFollowing: z.boolean(),
  isBlocked: z.boolean()
})

type GetProfileInput = z.infer<typeof GetProfileInputSchema>
type PublicProfile = z.infer<typeof PublicProfileSchema>

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────────────────────────

const UpdateProfileInputSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  country: z.string().length(2).optional(),
  city: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showAge: z.boolean().optional()
})

const UpdateProfileOutputSchema = z.object({
  updated: z.boolean()
})

type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE USERNAME
// ─────────────────────────────────────────────────────────────────────────────

const UpdateUsernameInputSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
})

const UpdateUsernameOutputSchema = z.object({
  updated: z.boolean(),
  nextChangeAllowedAt: z.date()
})

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE DEMOGRAPHICS
// ─────────────────────────────────────────────────────────────────────────────

const UpdateDemographicsInputSchema = z.object({
  birthDate: z.date().optional(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"]).optional(),
  education: z.enum([
    "PRIMARY", "SECONDARY", "HIGH_SCHOOL", "ASSOCIATE",
    "BACHELOR", "MASTER", "DOCTORATE", "OTHER"
  ]).optional(),
  occupation: z.string().max(100).optional(),
  incomeRange: z.enum([
    "RANGE_0_25K", "RANGE_25K_50K", "RANGE_50K_75K",
    "RANGE_75K_100K", "RANGE_100K_150K", "RANGE_150K_PLUS",
    "PREFER_NOT_TO_SAY"
  ]).optional()
})

export {
  GetProfileInputSchema,
  PublicProfileSchema,
  UpdateProfileInputSchema,
  UpdateProfileOutputSchema,
  UpdateUsernameInputSchema,
  UpdateUsernameOutputSchema,
  UpdateDemographicsInputSchema
}
export type { GetProfileInput, PublicProfile, UpdateProfileInput }
```

## 14.3.2 Social Actions

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// FOLLOW USER
// ─────────────────────────────────────────────────────────────────────────────

const FollowUserInputSchema = z.object({
  userId: z.string().cuid2()
})

const FollowUserOutputSchema = z.object({
  status: z.enum(["FOLLOWED", "REQUESTED"]),
  followId: z.string()
})

// ─────────────────────────────────────────────────────────────────────────────
// UNFOLLOW USER
// ─────────────────────────────────────────────────────────────────────────────

const UnfollowUserInputSchema = z.object({
  userId: z.string().cuid2()
})

const UnfollowUserOutputSchema = z.object({
  unfollowed: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE FOLLOW REQUEST
// ─────────────────────────────────────────────────────────────────────────────

const HandleFollowRequestInputSchema = z.object({
  followId: z.string().cuid2(),
  action: z.enum(["ACCEPT", "REJECT"])
})

const HandleFollowRequestOutputSchema = z.object({
  handled: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK USER
// ─────────────────────────────────────────────────────────────────────────────

const BlockUserInputSchema = z.object({
  userId: z.string().cuid2(),
  reason: z.string().max(500).optional()
})

const BlockUserOutputSchema = z.object({
  blocked: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// UNBLOCK USER
// ─────────────────────────────────────────────────────────────────────────────

const UnblockUserInputSchema = z.object({
  userId: z.string().cuid2()
})

const UnblockUserOutputSchema = z.object({
  unblocked: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// GET FOLLOWERS / FOLLOWING
// ─────────────────────────────────────────────────────────────────────────────

const GetFollowListInputSchema = z.object({
  userId: z.string().cuid2(),
  type: z.enum(["FOLLOWERS", "FOLLOWING"]),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20)
})

const FollowListItemSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  isVerified: z.boolean(),
  isFollowing: z.boolean(),
  followedAt: z.date()
})

const GetFollowListOutputSchema = z.object({
  items: z.array(FollowListItemSchema),
  cursor: z.string().nullable(),
  hasMore: z.boolean()
})

export {
  FollowUserInputSchema,
  FollowUserOutputSchema,
  UnfollowUserInputSchema,
  UnfollowUserOutputSchema,
  HandleFollowRequestInputSchema,
  HandleFollowRequestOutputSchema,
  BlockUserInputSchema,
  BlockUserOutputSchema,
  UnblockUserInputSchema,
  UnblockUserOutputSchema,
  GetFollowListInputSchema,
  GetFollowListOutputSchema,
  FollowListItemSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.4 POLL ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.4.1 Create Poll

```typescript
"use server"

import { z } from "zod"

const PollOptionSchema = z.object({
  text: z.string().min(1).max(200),
  imageUrl: z.string().url().optional()
})

const CreatePollInputSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  categoryId: z.string().cuid2().optional(),
  tags: z.array(z.string().max(30)).max(5).default([]),

  question: z.object({
    text: z.string().min(10).max(500),
    options: z.array(PollOptionSchema).min(2).max(10)
  }),

  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("PUBLIC"),
  resultsVisibility: z.enum([
    "ALWAYS_VISIBLE",
    "AFTER_PARTICIPATION",
    "AFTER_END"
  ]).default("AFTER_PARTICIPATION"),

  allowComments: z.boolean().default(true),

  startsAt: z.date().optional(),
  endsAt: z.date(),

  targetAudience: z.object({
    ageGroups: z.array(z.enum([
      "AGE_18_24", "AGE_25_34", "AGE_35_44",
      "AGE_45_54", "AGE_55_64", "AGE_65_PLUS"
    ])).optional(),
    genders: z.array(z.enum([
      "MALE", "FEMALE", "NON_BINARY"
    ])).optional(),
    regions: z.array(z.string()).optional(),
    verifiedOnly: z.boolean().default(false)
  }).optional()
}).refine(data => {
  const now = new Date()
  const minEnd = new Date(now.getTime() + 3600000)
  const maxEnd = new Date(now.getTime() + 30 * 24 * 3600000)
  return data.endsAt >= minEnd && data.endsAt <= maxEnd
}, { message: "Bitiş tarihi 1 saat ile 30 gün arasında olmalı", path: ["endsAt"] })
.refine(data => {
  // [EDGE CASE] startsAt validation
  if (data.startsAt) {
    const now = new Date()
    // startsAt must be in the future
    if (data.startsAt <= now) return false
    // startsAt must be before endsAt
    if (data.startsAt >= data.endsAt) return false
    // startsAt cannot be more than 30 days in the future
    const maxStart = new Date(now.getTime() + 30 * 24 * 3600000)
    if (data.startsAt > maxStart) return false
  }
  return true
}, { message: "Başlangıç tarihi gelecekte ve bitiş tarihinden önce olmalı", path: ["startsAt"] })

const CreatePollOutputSchema = z.object({
  pollId: z.string(),
  slug: z.string(),
  status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE"])
})

type CreatePollInput = z.infer<typeof CreatePollInputSchema>
type CreatePollOutput = z.infer<typeof CreatePollOutputSchema>

export { CreatePollInputSchema, CreatePollOutputSchema, PollOptionSchema }
export type { CreatePollInput, CreatePollOutput }
```

## 14.4.2 Get Poll

```typescript
"use server"

import { z } from "zod"

const GetPollInputSchema = z.object({
  pollId: z.string().cuid2().optional(),
  slug: z.string().optional()
}).refine(data => data.pollId || data.slug, {
  message: "pollId veya slug gerekli"
})

const PollDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),

  creator: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
    isVerified: z.boolean()
  }),

  organization: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    logoUrl: z.string().nullable(),
    isVerified: z.boolean()
  }).nullable(),

  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string()
  }).nullable(),

  tags: z.array(z.string()),

  question: z.object({
    id: z.string(),
    text: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      imageUrl: z.string().nullable()
    }))
  }),

  status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "COMPLETED", "ARCHIVED"]),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
  resultsVisibility: z.enum(["ALWAYS_VISIBLE", "AFTER_PARTICIPATION", "AFTER_END"]),

  participantCount: z.number(),
  viewCount: z.number(),
  commentCount: z.number(),

  reliabilityScore: z.number().nullable(),

  startsAt: z.date().nullable(),
  endsAt: z.date(),
  publishedAt: z.date().nullable(),

  hasParticipated: z.boolean(),
  userVote: z.string().nullable(),

  canViewResults: z.boolean(),
  results: z.object({
    options: z.array(z.object({
      id: z.string(),
      count: z.number(),
      percentage: z.number()
    })),
    demographics: z.record(z.unknown()).optional()
  }).nullable(),

  createdAt: z.date()
})

type GetPollInput = z.infer<typeof GetPollInputSchema>
type PollDetail = z.infer<typeof PollDetailSchema>

export { GetPollInputSchema, PollDetailSchema }
export type { GetPollInput, PollDetail }
```

## 14.4.3 Vote on Poll

```typescript
"use server"

import { z } from "zod"

const VoteOnPollInputSchema = z.object({
  pollId: z.string().cuid2(),
  optionId: z.string().cuid2(),
  deviceFingerprint: z.string().optional()
})

const VoteOnPollOutputSchema = z.object({
  voted: z.boolean(),
  results: z.object({
    options: z.array(z.object({
      id: z.string(),
      count: z.number(),
      percentage: z.number()
    })),
    totalVotes: z.number()
  }).nullable()
})

type VoteOnPollInput = z.infer<typeof VoteOnPollInputSchema>
type VoteOnPollOutput = z.infer<typeof VoteOnPollOutputSchema>

export { VoteOnPollInputSchema, VoteOnPollOutputSchema }
export type { VoteOnPollInput, VoteOnPollOutput }
```

## 14.4.4 List Polls

```typescript
"use server"

import { z } from "zod"

const ListPollsInputSchema = z.object({
  feed: z.enum(["HOME", "EXPLORE", "FOLLOWING", "CATEGORY", "USER", "SEARCH"]).default("HOME"),

  categoryId: z.string().cuid2().optional(),
  userId: z.string().cuid2().optional(),
  query: z.string().max(200).optional(),

  status: z.enum(["ACTIVE", "COMPLETED", "ALL"]).default("ACTIVE"),

  sortBy: z.enum(["HOT", "NEW", "TOP", "ENDING_SOON"]).default("HOT"),
  timeRange: z.enum(["DAY", "WEEK", "MONTH", "ALL"]).optional(),

  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20)
})

const PollListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),

  creator: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
    isVerified: z.boolean()
  }),

  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string()
  }).nullable(),

  optionCount: z.number(),
  participantCount: z.number(),
  commentCount: z.number(),

  status: z.enum(["ACTIVE", "COMPLETED"]),
  endsAt: z.date(),

  hasParticipated: z.boolean(),

  createdAt: z.date()
})

const ListPollsOutputSchema = z.object({
  polls: z.array(PollListItemSchema),
  cursor: z.string().nullable(),
  hasMore: z.boolean()
})

type ListPollsInput = z.infer<typeof ListPollsInputSchema>
type PollListItem = z.infer<typeof PollListItemSchema>
type ListPollsOutput = z.infer<typeof ListPollsOutputSchema>

export { ListPollsInputSchema, PollListItemSchema, ListPollsOutputSchema }
export type { ListPollsInput, PollListItem, ListPollsOutput }
```

## 14.4.5 Poll Management Actions

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE POLL
// ─────────────────────────────────────────────────────────────────────────────

const UpdatePollInputSchema = z.object({
  pollId: z.string().cuid2(),
  title: z.string().min(5).max(200).optional(),
  description: z.string().max(2000).optional(),
  categoryId: z.string().cuid2().nullable().optional(),
  tags: z.array(z.string().max(30)).max(5).optional(),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
  allowComments: z.boolean().optional(),
  endsAt: z.date().optional()
})

// ─────────────────────────────────────────────────────────────────────────────
// PUBLISH POLL
// ─────────────────────────────────────────────────────────────────────────────

const PublishPollInputSchema = z.object({
  pollId: z.string().cuid2()
})

const PublishPollOutputSchema = z.object({
  published: z.boolean(),
  publishedAt: z.date()
})

// ─────────────────────────────────────────────────────────────────────────────
// CLOSE POLL
// ─────────────────────────────────────────────────────────────────────────────

const ClosePollInputSchema = z.object({
  pollId: z.string().cuid2()
})

const ClosePollOutputSchema = z.object({
  closed: z.boolean(),
  finalResults: z.object({
    options: z.array(z.object({
      id: z.string(),
      count: z.number(),
      percentage: z.number()
    })),
    totalVotes: z.number(),
    reliabilityScore: z.number().nullable()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE POLL
// ─────────────────────────────────────────────────────────────────────────────

const DeletePollInputSchema = z.object({
  pollId: z.string().cuid2()
})

const DeletePollOutputSchema = z.object({
  deleted: z.boolean()
})

export {
  UpdatePollInputSchema,
  PublishPollInputSchema,
  PublishPollOutputSchema,
  ClosePollInputSchema,
  ClosePollOutputSchema,
  DeletePollInputSchema,
  DeletePollOutputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.5 SURVEY ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.5.1 Create Survey

```typescript
"use server"

import { z } from "zod"

const SurveyQuestionOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
  value: z.union([z.string(), z.number()]).optional()
})

const SurveyQuestionSchema = z.object({
  type: z.enum([
    "SINGLE_CHOICE", "MULTIPLE_CHOICE", "RANKING", "RATING_SCALE",
    "SLIDER", "MATRIX_SINGLE", "MATRIX_MULTIPLE", "SHORT_TEXT",
    "LONG_TEXT", "NUMBER", "DATE", "TIME", "DATETIME",
    "FILE_UPLOAD", "IMAGE_CHOICE", "YES_NO", "NET_PROMOTER_SCORE"
  ]),
  text: z.string().min(1).max(1000),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  isRequired: z.boolean().default(true),
  options: z.array(SurveyQuestionOptionSchema).optional(),
  validation: z.object({
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(1).optional(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    pattern: z.string().optional(),
    minSelections: z.number().int().min(0).optional(),
    maxSelections: z.number().int().min(1).optional()
  })
  // [EDGE CASE] Validate min <= max constraints
  .refine(v => {
    if (v?.minLength !== undefined && v?.maxLength !== undefined) {
      return v.minLength <= v.maxLength
    }
    return true
  }, { message: "minLength must be <= maxLength" })
  .refine(v => {
    if (v?.minValue !== undefined && v?.maxValue !== undefined) {
      return v.minValue <= v.maxValue
    }
    return true
  }, { message: "minValue must be <= maxValue" })
  .refine(v => {
    if (v?.minSelections !== undefined && v?.maxSelections !== undefined) {
      return v.minSelections <= v.maxSelections
    }
    return true
  }, { message: "minSelections must be <= maxSelections" })
  .optional(),
  displayLogic: z.object({
    conditions: z.array(z.object({
      questionId: z.string(),
      operator: z.enum(["EQUALS", "NOT_EQUALS", "CONTAINS", "GREATER_THAN", "LESS_THAN"]),
      value: z.union([z.string(), z.number(), z.array(z.string())])
    })),
    logic: z.enum(["AND", "OR"]).default("AND")
  }).optional()
})

const SurveySectionSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  isRandomized: z.boolean().default(false),
  questions: z.array(SurveyQuestionSchema).min(1).max(50)
})

const CreateSurveyInputSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  categoryId: z.string().cuid2().optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),

  sections: z.array(SurveySectionSchema).min(1).max(20),

  visibility: z.enum(["ORGANIZATION_ONLY", "PRIVATE"]).default("ORGANIZATION_ONLY"),
  resultsVisibility: z.enum(["CREATOR_ONLY", "AFTER_END"]).default("CREATOR_ONLY"),

  startsAt: z.date().optional(),
  endsAt: z.date(),

  targetResponseCount: z.number().int().min(1).optional(),
  maxResponseCount: z.number().int().min(1).optional(),

  estimatedDuration: z.number().int().min(1).max(120).optional(),

  allowAnonymous: z.boolean().default(true),
  requireVerification: z.boolean().default(false),

  targetAudience: z.object({
    ageGroups: z.array(z.string()).optional(),
    genders: z.array(z.string()).optional(),
    regions: z.array(z.string()).optional(),
    educationLevels: z.array(z.string()).optional(),
    employmentStatuses: z.array(z.string()).optional()
  }).optional(),

  incentive: z.object({
    type: z.enum(["POINTS", "BADGE", "RAFFLE", "DIRECT_PAYMENT"]),
    amount: z.number().optional(),
    description: z.string().max(500).optional()
  }).optional()
})
// [EDGE CASE] Multiple refinements for validation
.refine(data => {
  const totalQuestions = data.sections.reduce((sum, s) => sum + s.questions.length, 0)
  return totalQuestions >= 1 && totalQuestions <= 100
}, { message: "Toplam soru sayısı 1-100 arasında olmalı" })
.refine(data => {
  // [EDGE CASE] startsAt must be before endsAt
  if (data.startsAt && data.endsAt) {
    return data.startsAt < data.endsAt
  }
  return true
}, { message: "Başlangıç tarihi bitiş tarihinden önce olmalı" })
.refine(data => {
  // [EDGE CASE] maxResponseCount must be >= targetResponseCount
  if (data.maxResponseCount && data.targetResponseCount) {
    return data.maxResponseCount >= data.targetResponseCount
  }
  return true
}, { message: "Maksimum yanıt sayısı hedef yanıt sayısından küçük olamaz" })
.refine(data => {
  // [EDGE CASE] Circular dependency check for displayLogic
  // Build a dependency graph and check for cycles
  const allQuestions = data.sections.flatMap((s, sIdx) =>
    s.questions.map((q, qIdx) => ({
      id: `section_${sIdx}_question_${qIdx}`,
      displayLogic: q.displayLogic
    }))
  )

  // Build adjacency list for dependency graph
  const dependsOn: Record<string, string[]> = {}
  allQuestions.forEach((q, idx) => {
    if (q.displayLogic?.conditions) {
      dependsOn[q.id] = q.displayLogic.conditions.map(c => c.questionId)
    }
  })

  // Check for cycles using DFS
  function hasCycle(node: string, visited: Set<string>, recStack: Set<string>): boolean {
    visited.add(node)
    recStack.add(node)

    for (const dep of (dependsOn[node] || [])) {
      if (!visited.has(dep)) {
        if (hasCycle(dep, visited, recStack)) return true
      } else if (recStack.has(dep)) {
        return true // Cycle detected
      }
    }

    recStack.delete(node)
    return false
  }

  const visited = new Set<string>()
  const recStack = new Set<string>()
  for (const q of allQuestions) {
    if (!visited.has(q.id)) {
      if (hasCycle(q.id, visited, recStack)) return false
    }
  }
  return true
}, { message: "Soru görüntüleme mantığında döngüsel bağımlılık tespit edildi" })
.refine(data => {
  // [EDGE CASE] displayLogic must reference valid, earlier questions
  const allQuestionIds = new Set<string>()
  let isValid = true

  data.sections.forEach((section, sIdx) => {
    section.questions.forEach((question, qIdx) => {
      const currentId = `section_${sIdx}_question_${qIdx}`

      if (question.displayLogic?.conditions) {
        for (const condition of question.displayLogic.conditions) {
          // Referenced question must exist and come before current question
          if (!allQuestionIds.has(condition.questionId)) {
            isValid = false
          }
        }
      }

      allQuestionIds.add(currentId)
    })
  })

  return isValid
}, { message: "Görüntüleme mantığı yalnızca daha önceki sorulara referans verebilir" })

const CreateSurveyOutputSchema = z.object({
  surveyId: z.string(),
  slug: z.string(),
  status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE"])
})

type CreateSurveyInput = z.infer<typeof CreateSurveyInputSchema>
type CreateSurveyOutput = z.infer<typeof CreateSurveyOutputSchema>

export {
  SurveyQuestionOptionSchema,
  SurveyQuestionSchema,
  SurveySectionSchema,
  CreateSurveyInputSchema,
  CreateSurveyOutputSchema
}
export type { CreateSurveyInput, CreateSurveyOutput }
```

## 14.5.2 Submit Survey Response

```typescript
"use server"

import { z } from "zod"

const SurveyAnswerSchema = z.object({
  questionId: z.string().cuid2(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.number()),
    z.record(z.string(), z.union([z.string(), z.number()]))
  ])
})

const SubmitSurveyResponseInputSchema = z.object({
  surveyId: z.string().cuid2(),
  invitationToken: z.string().optional(),
  answers: z.array(SurveyAnswerSchema),
  deviceFingerprint: z.string().optional()
})

const SubmitSurveyResponseOutputSchema = z.object({
  submitted: z.boolean(),
  responseId: z.string(),
  incentiveAwarded: z.object({
    type: z.string(),
    amount: z.number().optional(),
    description: z.string().optional()
  }).nullable()
})

// ─────────────────────────────────────────────────────────────────────────────
// SAVE SURVEY PROGRESS
// ─────────────────────────────────────────────────────────────────────────────

const SaveSurveyProgressInputSchema = z.object({
  surveyId: z.string().cuid2(),
  answers: z.array(SurveyAnswerSchema),
  currentSectionIndex: z.number().int().min(0),
  currentQuestionIndex: z.number().int().min(0)
})

const SaveSurveyProgressOutputSchema = z.object({
  saved: z.boolean(),
  lastSavedAt: z.date()
})

export {
  SurveyAnswerSchema,
  SubmitSurveyResponseInputSchema,
  SubmitSurveyResponseOutputSchema,
  SaveSurveyProgressInputSchema,
  SaveSurveyProgressOutputSchema
}
```

## 14.5.3 Survey Result Analysis Actions

[REFERENCE] See BIBLE-019 for academic methodologies, BIBLE-020 for statistical framework

```typescript
"use server"

import { z } from "zod"

// ═══════════════════════════════════════════════════════════════════════════════
// SURVEY RESULT AGGREGATION
// Calculates aggregated results for all question types
// ═══════════════════════════════════════════════════════════════════════════════

const GetSurveyResultsInputSchema = z.object({
  surveyId: z.string().cuid2(),
  includeQualityFiltered: z.boolean().default(true),  // Only include valid responses
  includeStatistics: z.boolean().default(true),
  includeConfidenceIntervals: z.boolean().default(true),
  segmentBy: z.enum(["NONE", "AGE_GROUP", "GENDER", "REGION"]).default("NONE"),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).optional()
})

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION RESULT TYPES
// ─────────────────────────────────────────────────────────────────────────────

const ChoiceResultSchema = z.object({
  questionType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "YES_NO", "IMAGE_CHOICE"]),
  options: z.array(z.object({
    optionId: z.string(),
    optionText: z.string(),
    count: z.number().int(),
    percentage: z.number(),
    confidenceInterval: z.object({
      lower: z.number(),
      upper: z.number()
    }).optional()
  })),
  totalResponses: z.number().int()
})

const LikertResultSchema = z.object({
  questionType: z.enum([
    "LIKERT_AGREEMENT_5", "LIKERT_AGREEMENT_7",
    "LIKERT_SATISFACTION_5", "LIKERT_SATISFACTION_7",
    "LIKERT_FREQUENCY_5", "LIKERT_FREQUENCY_7",
    "LIKERT_IMPORTANCE_5", "LIKERT_LIKELIHOOD_5"
  ]),
  distribution: z.array(z.object({
    value: z.number(),
    label: z.string(),
    count: z.number().int(),
    percentage: z.number()
  })),
  statistics: z.object({
    mean: z.number(),
    median: z.number(),
    mode: z.number(),
    standardDeviation: z.number(),
    topBox: z.number(),                     // % selecting top option
    top2Box: z.number(),                    // % selecting top 2 options
    bottomBox: z.number(),
    bottom2Box: z.number()
  }),
  confidenceInterval: z.object({
    mean: z.number(),
    lower: z.number(),
    upper: z.number(),
    level: z.number()
  }).optional(),
  totalResponses: z.number().int()
})

const RatingResultSchema = z.object({
  questionType: z.enum(["RATING_SCALE", "SLIDER"]),
  distribution: z.array(z.object({
    value: z.number(),
    count: z.number().int(),
    percentage: z.number()
  })),
  statistics: z.object({
    mean: z.number(),
    median: z.number(),
    min: z.number(),
    max: z.number(),
    standardDeviation: z.number()
  }),
  histogram: z.array(z.object({
    bin: z.string(),
    count: z.number().int()
  })),
  totalResponses: z.number().int()
})

const RankingResultSchema = z.object({
  questionType: z.literal("RANKING"),
  items: z.array(z.object({
    itemId: z.string(),
    itemText: z.string(),
    averageRank: z.number(),
    rankDistribution: z.array(z.object({
      rank: z.number().int(),
      count: z.number().int(),
      percentage: z.number()
    })),
    firstPlaceCount: z.number().int(),
    lastPlaceCount: z.number().int()
  })),
  totalResponses: z.number().int()
})

const TextResultSchema = z.object({
  questionType: z.enum(["SHORT_TEXT", "LONG_TEXT"]),
  responseCount: z.number().int(),
  wordCloud: z.array(z.object({
    word: z.string(),
    count: z.number().int(),
    percentage: z.number()
  })).optional(),
  averageLength: z.number(),
  // Responses are NOT included in aggregation for privacy
  sampleResponses: z.array(z.string()).max(5).optional()  // Only if creator requests
})

const QuestionResultSchema = z.discriminatedUnion("questionType", [
  ChoiceResultSchema.extend({ questionType: z.literal("SINGLE_CHOICE") }),
  ChoiceResultSchema.extend({ questionType: z.literal("MULTIPLE_CHOICE") }),
  ChoiceResultSchema.extend({ questionType: z.literal("YES_NO") }),
  LikertResultSchema,
  RatingResultSchema,
  RankingResultSchema,
  TextResultSchema
])

// ─────────────────────────────────────────────────────────────────────────────
// SURVEY RESULTS OUTPUT
// ─────────────────────────────────────────────────────────────────────────────

const GetSurveyResultsOutputSchema = z.object({
  surveyId: z.string(),
  surveyTitle: z.string(),

  // Response summary
  summary: z.object({
    totalResponses: z.number().int(),
    validResponses: z.number().int(),
    excludedResponses: z.number().int(),
    completionRate: z.number(),
    averageDurationSeconds: z.number(),
    responsesByDay: z.array(z.object({
      date: z.string(),
      count: z.number().int()
    }))
  }),

  // Quality metrics
  quality: z.object({
    averageQualityScore: z.number(),
    attentionCheckPassRate: z.number().nullable(),
    qualityDistribution: z.object({
      excellent: z.number().int(),        // 80-100
      good: z.number().int(),             // 60-79
      acceptable: z.number().int(),       // 40-59
      poor: z.number().int()              // 0-39
    })
  }),

  // Statistical validity
  validity: z.object({
    sampleSizeStatus: z.enum(["INSUFFICIENT", "MINIMAL", "ADEQUATE", "ROBUST"]),
    marginOfError: z.number(),
    confidenceLevel: z.number(),
    guidance: z.string()
  }),

  // Per-question results
  questions: z.array(z.object({
    questionId: z.string(),
    questionText: z.string(),
    sectionId: z.string().nullable(),
    result: QuestionResultSchema
  })),

  // Reliability
  reliability: z.object({
    score: z.number(),
    grade: z.enum(["A", "B", "C", "D", "F"]),
    components: z.object({
      sampleQuality: z.number(),
      responseQuality: z.number(),
      methodologyQuality: z.number(),
      creatorTrust: z.number()
    }),
    warnings: z.array(z.string())
  }),

  calculatedAt: z.date()
})

export {
  GetSurveyResultsInputSchema,
  GetSurveyResultsOutputSchema,
  QuestionResultSchema,
  ChoiceResultSchema,
  LikertResultSchema,
  RatingResultSchema,
  RankingResultSchema,
  TextResultSchema
}
```

## 14.5.4 Survey Crosstab Analysis Action

```typescript
"use server"

import { z } from "zod"

// ═══════════════════════════════════════════════════════════════════════════════
// CROSSTAB ANALYSIS
// Compare results across demographic segments
// ═══════════════════════════════════════════════════════════════════════════════

const GetSurveyCrosstabInputSchema = z.object({
  surveyId: z.string().cuid2(),
  questionId: z.string().cuid2(),
  segmentBy: z.enum([
    "AGE_GROUP",
    "GENDER",
    "REGION",
    "EDUCATION",
    "CUSTOM"                              // Based on another question's answer
  ]),
  customSegmentQuestionId: z.string().cuid2().optional(),  // For CUSTOM segment
  includeSignificanceTest: z.boolean().default(true)
})

const CrosstabSegmentSchema = z.object({
  segmentName: z.string(),
  segmentValue: z.string(),
  sampleSize: z.number().int(),
  results: z.array(z.object({
    optionId: z.string(),
    optionText: z.string(),
    count: z.number().int(),
    percentage: z.number()
  })),
  // For Likert/rating questions
  mean: z.number().optional(),
  standardDeviation: z.number().optional()
})

const GetSurveyCrosstabOutputSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  segmentedBy: z.string(),

  segments: z.array(CrosstabSegmentSchema),

  // Overall (unsegmented) for comparison
  overall: z.object({
    sampleSize: z.number().int(),
    results: z.array(z.object({
      optionId: z.string(),
      optionText: z.string(),
      count: z.number().int(),
      percentage: z.number()
    })),
    mean: z.number().optional()
  }),

  // Statistical significance
  significance: z.object({
    testType: z.enum(["CHI_SQUARE", "ANOVA", "T_TEST"]),
    statistic: z.number(),
    pValue: z.number(),
    isSignificant: z.boolean(),
    interpretation: z.string()
  }).optional(),

  calculatedAt: z.date()
})

export {
  GetSurveyCrosstabInputSchema,
  GetSurveyCrosstabOutputSchema,
  CrosstabSegmentSchema
}
```

## 14.5.5 Survey Export Action

```typescript
"use server"

import { z } from "zod"

// ═══════════════════════════════════════════════════════════════════════════════
// SURVEY DATA EXPORT
// Enterprise-grade export for business intelligence
// ═══════════════════════════════════════════════════════════════════════════════

const ExportSurveyDataInputSchema = z.object({
  surveyId: z.string().cuid2(),
  format: z.enum(["CSV", "XLSX", "JSON", "SPSS"]),
  includeOptions: z.object({
    rawResponses: z.boolean().default(true),
    aggregatedResults: z.boolean().default(true),
    qualityMetrics: z.boolean().default(true),
    metadata: z.boolean().default(true),
    confidenceIntervals: z.boolean().default(true)
  }),
  anonymization: z.object({
    removeDirectIdentifiers: z.boolean().default(true),
    hashParticipantIds: z.boolean().default(true),
    removeOpenTextResponses: z.boolean().default(false)
  }),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).optional(),
  qualityFilter: z.object({
    minQualityScore: z.number().min(0).max(100).optional(),
    excludeInvalidResponses: z.boolean().default(true)
  }).optional()
})

const ExportSurveyDataOutputSchema = z.object({
  downloadUrl: z.string().url(),
  expiresAt: z.date(),
  fileSize: z.number(),
  format: z.string(),
  metadata: z.object({
    surveyId: z.string(),
    surveyTitle: z.string(),
    exportedAt: z.date(),
    totalRecords: z.number().int(),
    qualityFilterApplied: z.boolean(),
    anonymizationApplied: z.boolean()
  })
})

export {
  ExportSurveyDataInputSchema,
  ExportSurveyDataOutputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.6 PERSONALITY TEST ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

[REFERENCE] Aligned with BIBLE-006 Section 6.4 - Three test paradigms: AXIS, CHARACTER, SPECTRUM

## 14.6.1 Create Personality Test (Unified Schema)

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const TestSettingsSchema = z.object({
  showProgressBar: z.boolean().default(true),
  showQuestionCount: z.boolean().default(true),
  randomizeQuestions: z.boolean().default(false),
  timeLimitMinutes: z.number().int().min(1).max(120).nullable().default(null),
  allowRetake: z.boolean().default(true),
  retakeCooldownHours: z.number().int().min(0).max(720).default(0),
  shareResultsEnabled: z.boolean().default(true),
  collectEmail: z.boolean().default(false),
  showDetailedBreakdown: z.boolean().default(true),
  allowComparison: z.boolean().default(true)
})

const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color")

// ─────────────────────────────────────────────────────────────────────────────
// AXIS TEST SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const AxisDefinitionSchema = z.object({
  name: z.string().min(2).max(50),
  negativeLabel: z.string().min(2).max(30),
  positiveLabel: z.string().min(2).max(30),
  negativeDescription: z.string().max(200),
  positiveDescription: z.string().max(200),
  negativeColor: ColorSchema,
  positiveColor: ColorSchema,
  negativeIcon: z.string().max(50).optional(),
  positiveIcon: z.string().max(50).optional()
})

const QuadrantDefinitionSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200),
  detailedDescription: z.string().max(1000),
  imageUrl: z.string().url().optional(),
  color: ColorSchema,
  iconName: z.string().max(50).optional(),
  axisConditions: z.array(z.object({
    axisIndex: z.number().int().min(0),
    position: z.enum(["POSITIVE", "NEGATIVE"])
  })),
  traits: z.array(z.string().max(30)).max(10).default([]),
  famousExamples: z.array(z.string().max(100)).max(5).default([])
})

const AxisQuestionSchema = z.object({
  text: z.string().min(10).max(500),
  imageUrl: z.string().url().optional(),
  questionType: z.enum(["STATEMENT_AGREE", "FORCED_CHOICE", "SLIDER"]),
  config: z.union([
    z.object({
      type: z.literal("STATEMENT_AGREE"),
      scale: z.union([z.literal(5), z.literal(7)]),
      labels: z.array(z.string().max(30)),
      axisImpact: z.array(z.object({
        axisIndex: z.number().int().min(0),
        direction: z.enum(["POSITIVE", "NEGATIVE"]),
        weight: z.number().min(0.1).max(3).default(1),
        invertOnDisagree: z.boolean().default(true)
      }))
    }),
    z.object({
      type: z.literal("FORCED_CHOICE"),
      optionA: z.object({
        text: z.string().min(1).max(200),
        axisImpacts: z.array(z.object({
          axisIndex: z.number().int().min(0),
          value: z.number().min(-3).max(3)
        }))
      }),
      optionB: z.object({
        text: z.string().min(1).max(200),
        axisImpacts: z.array(z.object({
          axisIndex: z.number().int().min(0),
          value: z.number().min(-3).max(3)
        }))
      })
    }),
    z.object({
      type: z.literal("SLIDER"),
      leftLabel: z.string().min(1).max(50),
      rightLabel: z.string().min(1).max(50),
      steps: z.number().int().min(3).max(11),
      axisMapping: z.array(z.object({
        axisIndex: z.number().int().min(0),
        leftValue: z.number().min(-3).max(3),
        rightValue: z.number().min(-3).max(3)
      }))
    })
  ])
})

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER TEST SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const CharacterDefinitionSchema = z.object({
  name: z.string().min(2).max(50),
  tagline: z.string().max(100),
  description: z.string().max(500),
  detailedDescription: z.string().max(1000),
  imageUrl: z.string().url(),
  backgroundColor: ColorSchema,
  accentColor: ColorSchema,
  traits: z.array(z.string().max(30)).max(10).default([]),
  strengths: z.array(z.string().max(50)).max(5).default([]),
  weaknesses: z.array(z.string().max(50)).max(5).default([]),
  compatibleWith: z.array(z.string()).max(5).default([]),
  famousQuote: z.string().max(200).optional()
})

const CharacterQuestionSchema = z.object({
  text: z.string().min(10).max(500),
  imageUrl: z.string().url().optional(),
  questionType: z.enum(["SINGLE_CHOICE", "IMAGE_CHOICE", "RANKING", "THIS_OR_THAT"]),
  config: z.union([
    z.object({
      type: z.literal("SINGLE_CHOICE"),
      options: z.array(z.object({
        text: z.string().min(1).max(200),
        imageUrl: z.string().url().optional(),
        characterScores: z.array(z.object({
          characterIndex: z.number().int().min(0),
          points: z.number().int().min(0).max(10)
        }))
      })).min(2).max(6),
      randomizeOptions: z.boolean().default(true)
    }),
    z.object({
      type: z.literal("IMAGE_CHOICE"),
      options: z.array(z.object({
        imageUrl: z.string().url(),
        caption: z.string().max(100).optional(),
        characterScores: z.array(z.object({
          characterIndex: z.number().int().min(0),
          points: z.number().int().min(0).max(10)
        }))
      })).min(2).max(6),
      columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(2)
    }),
    z.object({
      type: z.literal("RANKING"),
      items: z.array(z.object({
        text: z.string().min(1).max(200),
        imageUrl: z.string().url().optional(),
        characterScores: z.array(z.object({
          characterIndex: z.number().int().min(0),
          basePoints: z.number().int().min(0).max(10)
        }))
      })).min(3).max(6),
      maxRankedItems: z.number().int().min(2).max(6),
      pointsDistribution: z.array(z.number()).default([5, 3, 1])
    }),
    z.object({
      type: z.literal("THIS_OR_THAT"),
      optionA: z.object({
        text: z.string().min(1).max(200),
        imageUrl: z.string().url().optional(),
        characterScores: z.array(z.object({
          characterIndex: z.number().int().min(0),
          points: z.number().int().min(0).max(10)
        }))
      }),
      optionB: z.object({
        text: z.string().min(1).max(200),
        imageUrl: z.string().url().optional(),
        characterScores: z.array(z.object({
          characterIndex: z.number().int().min(0),
          points: z.number().int().min(0).max(10)
        }))
      })
    })
  ])
})

// ─────────────────────────────────────────────────────────────────────────────
// SPECTRUM TEST SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const SpectrumDefinitionSchema = z.object({
  name: z.string().min(2).max(50),
  leftLabel: z.string().min(2).max(30),
  rightLabel: z.string().min(2).max(30),
  leftDescription: z.string().max(200),
  rightDescription: z.string().max(200),
  leftColor: ColorSchema,
  rightColor: ColorSchema,
  leftIcon: z.string().max(50).optional(),
  rightIcon: z.string().max(50).optional()
})

const SpectrumSegmentSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200),
  detailedDescription: z.string().max(500),
  minPercentage: z.number().int().min(0).max(100),
  maxPercentage: z.number().int().min(0).max(100),
  traits: z.array(z.string().max(30)).max(5).default([]),
  imageUrl: z.string().url().optional()
}).refine(data => data.minPercentage < data.maxPercentage, {
  message: "minPercentage must be less than maxPercentage"
})

const SpectrumQuestionSchema = z.object({
  text: z.string().min(10).max(500),
  imageUrl: z.string().url().optional(),
  weight: z.number().min(0.1).max(3).default(1),
  questionType: z.enum(["SLIDER", "AGREE_DISAGREE", "BINARY_CHOICE"]),
  config: z.union([
    z.object({
      type: z.literal("SLIDER"),
      leftLabel: z.string().min(1).max(50),
      rightLabel: z.string().min(1).max(50),
      steps: z.number().int().min(3).max(11),
      showLabels: z.boolean().default(true)
    }),
    z.object({
      type: z.literal("AGREE_DISAGREE"),
      statement: z.string().min(10).max(300),
      scale: z.union([z.literal(5), z.literal(7)]),
      labels: z.array(z.string().max(30)),
      direction: z.enum(["LEFT_ON_AGREE", "RIGHT_ON_AGREE"])
    }),
    z.object({
      type: z.literal("BINARY_CHOICE"),
      leftOption: z.object({
        text: z.string().min(1).max(100),
        imageUrl: z.string().url().optional()
      }),
      rightOption: z.object({
        text: z.string().min(1).max(100),
        imageUrl: z.string().url().optional()
      })
    })
  ])
})

// ─────────────────────────────────────────────────────────────────────────────
// CREATE TEST INPUT SCHEMAS (Type-specific)
// ─────────────────────────────────────────────────────────────────────────────

const BaseTestInputSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(500),
  coverImageUrl: z.string().url().optional(),
  categoryId: z.string().cuid2().optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("PUBLIC"),
  settings: TestSettingsSchema.default({})
})

const CreateAxisTestInputSchema = BaseTestInputSchema.extend({
  testType: z.literal("AXIS"),
  axes: z.array(AxisDefinitionSchema).min(2).max(4),
  quadrants: z.array(QuadrantDefinitionSchema).optional(),
  questions: z.array(AxisQuestionSchema).min(5).max(50)
}).refine(data => {
  const maxAxisIndex = data.axes.length - 1
  return data.questions.every(q => {
    if (q.config.type === "STATEMENT_AGREE") {
      return q.config.axisImpact.every(ai => ai.axisIndex <= maxAxisIndex)
    }
    if (q.config.type === "FORCED_CHOICE") {
      return q.config.optionA.axisImpacts.every(ai => ai.axisIndex <= maxAxisIndex) &&
             q.config.optionB.axisImpacts.every(ai => ai.axisIndex <= maxAxisIndex)
    }
    if (q.config.type === "SLIDER") {
      return q.config.axisMapping.every(am => am.axisIndex <= maxAxisIndex)
    }
    return true
  })
}, { message: "Question axis references must be within defined axes range" })
.refine(data => {
  // [EDGE CASE] Quadrant validation for AXIS tests
  // If quadrants are provided, must cover all 2^n combinations where n = number of axes
  if (data.quadrants && data.quadrants.length > 0) {
    const expectedQuadrantCount = Math.pow(2, data.axes.length)
    if (data.quadrants.length !== expectedQuadrantCount) {
      return false
    }

    // Each quadrant must define a unique combination of positive/negative for each axis
    const combinations = new Set<string>()
    for (const quadrant of data.quadrants) {
      // Quadrant should have axisValues array matching axes count
      if (!quadrant.axisValues || quadrant.axisValues.length !== data.axes.length) {
        return false
      }
      // Create a signature for this combination (e.g., "++-" for axes 0+, 1+, 2-)
      const signature = quadrant.axisValues.map(v => v > 0 ? "+" : "-").join("")
      if (combinations.has(signature)) {
        return false // Duplicate quadrant
      }
      combinations.add(signature)
    }
  }
  return true
}, { message: "Quadrants must cover all axis combinations (2^n quadrants for n axes) without duplicates" })
.refine(data => {
  // [EDGE CASE] Each question must affect at least one axis
  return data.questions.every(q => {
    if (q.config.type === "STATEMENT_AGREE") {
      return q.config.axisImpact.length > 0
    }
    if (q.config.type === "FORCED_CHOICE") {
      return q.config.optionA.axisImpacts.length > 0 || q.config.optionB.axisImpacts.length > 0
    }
    if (q.config.type === "SLIDER") {
      return q.config.axisMapping.length > 0
    }
    return true
  })
}, { message: "Her soru en az bir ekseni etkilemelidir" })

const CreateCharacterTestInputSchema = BaseTestInputSchema.extend({
  testType: z.literal("CHARACTER"),
  characters: z.array(CharacterDefinitionSchema).min(2).max(20),
  scoringConfig: z.object({
    scoringMethod: z.enum(["POINTS_SUM", "WEIGHTED_AVERAGE", "TRAIT_MATCHING"]).default("POINTS_SUM"),
    showAllMatches: z.boolean().default(true),
    showMatchPercentages: z.boolean().default(true),
    minimumMatchThreshold: z.number().min(0).max(100).default(0),
    tieBreaker: z.enum(["FIRST_DEFINED", "RANDOM", "SHOW_ALL"]).default("FIRST_DEFINED")
  }).default({}),
  questions: z.array(CharacterQuestionSchema).min(5).max(50)
}).refine(data => {
  const maxCharIndex = data.characters.length - 1
  return data.questions.every(q => {
    if (q.config.type === "SINGLE_CHOICE" || q.config.type === "IMAGE_CHOICE") {
      return q.config.options.every(opt =>
        opt.characterScores.every(cs => cs.characterIndex <= maxCharIndex)
      )
    }
    if (q.config.type === "RANKING") {
      return q.config.items.every(item =>
        item.characterScores.every(cs => cs.characterIndex <= maxCharIndex)
      )
    }
    if (q.config.type === "THIS_OR_THAT") {
      return q.config.optionA.characterScores.every(cs => cs.characterIndex <= maxCharIndex) &&
             q.config.optionB.characterScores.every(cs => cs.characterIndex <= maxCharIndex)
    }
    return true
  })
}, { message: "Question character references must be within defined characters range" })

const CreateSpectrumTestInputSchema = BaseTestInputSchema.extend({
  testType: z.literal("SPECTRUM"),
  spectrum: SpectrumDefinitionSchema,
  segments: z.array(SpectrumSegmentSchema).min(2).max(10),
  questions: z.array(SpectrumQuestionSchema).min(5).max(50)
}).refine(data => {
  const sortedSegments = [...data.segments].sort((a, b) => a.minPercentage - b.minPercentage)
  for (let i = 0; i < sortedSegments.length - 1; i++) {
    if (sortedSegments[i].maxPercentage !== sortedSegments[i + 1].minPercentage) {
      return false
    }
  }
  return sortedSegments[0].minPercentage === 0 &&
         sortedSegments[sortedSegments.length - 1].maxPercentage === 100
}, { message: "Segments must cover 0-100% without gaps or overlaps" })

const CreatePersonalityTestInputSchema = z.discriminatedUnion("testType", [
  CreateAxisTestInputSchema,
  CreateCharacterTestInputSchema,
  CreateSpectrumTestInputSchema
])

// ─────────────────────────────────────────────────────────────────────────────
// CREATE TEST OUTPUT
// ─────────────────────────────────────────────────────────────────────────────

const CreatePersonalityTestOutputSchema = z.object({
  testId: z.string(),
  slug: z.string(),
  testType: z.enum(["AXIS", "CHARACTER", "SPECTRUM"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  shareUrl: z.string().url(),
  balanceValidation: z.object({
    isValid: z.boolean(),
    warnings: z.array(z.object({
      code: z.string(),
      message: z.string(),
      suggestion: z.string().optional()
    })),
    errors: z.array(z.object({
      code: z.string(),
      message: z.string()
    }))
  })
})

export {
  TestSettingsSchema,
  AxisDefinitionSchema,
  QuadrantDefinitionSchema,
  AxisQuestionSchema,
  CharacterDefinitionSchema,
  CharacterQuestionSchema,
  SpectrumDefinitionSchema,
  SpectrumSegmentSchema,
  SpectrumQuestionSchema,
  CreateAxisTestInputSchema,
  CreateCharacterTestInputSchema,
  CreateSpectrumTestInputSchema,
  CreatePersonalityTestInputSchema,
  CreatePersonalityTestOutputSchema
}
```

## 14.6.2 Take Personality Test

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// START PERSONALITY TEST
// ─────────────────────────────────────────────────────────────────────────────

const StartPersonalityTestInputSchema = z.object({
  testId: z.string().cuid2()
})

const StartPersonalityTestOutputSchema = z.object({
  sessionId: z.string(),
  testType: z.enum(["AXIS", "CHARACTER", "SPECTRUM"]),
  title: z.string(),
  description: z.string(),
  totalQuestions: z.number(),
  estimatedMinutes: z.number(),
  settings: z.object({
    showProgressBar: z.boolean(),
    showQuestionCount: z.boolean(),
    timeLimitMinutes: z.number().nullable()
  }),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    imageUrl: z.string().nullable(),
    questionType: z.string(),
    config: z.unknown()
  })),
  startedAt: z.date()
})

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

const SubmitPersonalityResponseInputSchema = z.object({
  sessionId: z.string().cuid2(),
  questionId: z.string().cuid2(),
  response: z.union([
    z.number(),
    z.string(),
    z.array(z.string()),
    z.object({
      optionId: z.string()
    })
  ])
})

const SubmitPersonalityResponseOutputSchema = z.object({
  submitted: z.boolean(),
  questionsRemaining: z.number(),
  progressPercentage: z.number()
})

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE TEST & GET RESULT
// ─────────────────────────────────────────────────────────────────────────────

const CompletePersonalityTestInputSchema = z.object({
  sessionId: z.string().cuid2()
})

const AxisTestResultSchema = z.object({
  testType: z.literal("AXIS"),
  axisScores: z.array(z.object({
    axisId: z.string(),
    axisName: z.string(),
    negativeLabel: z.string(),
    positiveLabel: z.string(),
    normalizedScore: z.number(),
    percentile: z.number(),
    leaning: z.enum(["NEGATIVE", "CENTER", "POSITIVE"]),
    leaningLabel: z.string(),
    leaningStrength: z.enum(["WEAK", "MODERATE", "STRONG"])
  })),
  coordinates: z.object({
    x: z.number(),
    y: z.number()
  }).nullable(),
  quadrant: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    detailedDescription: z.string(),
    imageUrl: z.string().nullable(),
    traits: z.array(z.string()),
    famousExamples: z.array(z.string())
  }).nullable(),
  typeCode: z.string().nullable()
})

const CharacterTestResultSchema = z.object({
  testType: z.literal("CHARACTER"),
  matchedCharacter: z.object({
    id: z.string(),
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    detailedDescription: z.string(),
    imageUrl: z.string(),
    traits: z.array(z.string()),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    famousQuote: z.string().nullable()
  }),
  matchPercentage: z.number(),
  allMatches: z.array(z.object({
    characterId: z.string(),
    characterName: z.string(),
    characterImage: z.string(),
    percentage: z.number(),
    rank: z.number()
  })),
  sharedTraits: z.array(z.string())
})

const SpectrumTestResultSchema = z.object({
  testType: z.literal("SPECTRUM"),
  percentage: z.number(),
  leftLabel: z.string(),
  rightLabel: z.string(),
  leaning: z.enum(["LEFT", "CENTER", "RIGHT"]),
  leaningStrength: z.number(),
  segment: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    detailedDescription: z.string(),
    traits: z.array(z.string()),
    imageUrl: z.string().nullable()
  })
})

const CompletePersonalityTestOutputSchema = z.object({
  resultId: z.string(),
  result: z.discriminatedUnion("testType", [
    AxisTestResultSchema,
    CharacterTestResultSchema,
    SpectrumTestResultSchema
  ]),
  shareableCard: z.object({
    imageUrl: z.string().url(),
    shareUrl: z.string().url()
  }),
  completedAt: z.date(),
  timeSpentSeconds: z.number(),
  xpEarned: z.number()
})

export {
  StartPersonalityTestInputSchema,
  StartPersonalityTestOutputSchema,
  SubmitPersonalityResponseInputSchema,
  SubmitPersonalityResponseOutputSchema,
  CompletePersonalityTestInputSchema,
  AxisTestResultSchema,
  CharacterTestResultSchema,
  SpectrumTestResultSchema,
  CompletePersonalityTestOutputSchema
}
```

## 14.6.3 Test Balance Validation Action

```typescript
"use server"

import { z } from "zod"

const ValidateTestBalanceInputSchema = z.object({
  testId: z.string().cuid2()
})

const ValidateTestBalanceOutputSchema = z.object({
  isValid: z.boolean(),
  warnings: z.array(z.object({
    code: z.string(),
    message: z.string(),
    affectedItems: z.array(z.string()),
    suggestion: z.string()
  })),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    affectedItems: z.array(z.string())
  })),
  statistics: z.object({
    totalPossibleScenarios: z.number(),
    reachableResults: z.number(),
    unreachableResults: z.array(z.string()),
    mostLikelyResult: z.string(),
    leastLikelyResult: z.string(),
    distributionSkew: z.number()
  })
})

export { ValidateTestBalanceInputSchema, ValidateTestBalanceOutputSchema }
```

## 14.6.4 Quiz Test Actions (Knowledge-based)

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ TEST SCHEMAS (Knowledge, Trivia, Educational)
// ─────────────────────────────────────────────────────────────────────────────

const QuizQuestionSchema = z.object({
  type: z.enum([
    "SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE",
    "SHORT_ANSWER", "FILL_BLANK", "MATCHING", "ORDERING"
  ]),
  text: z.string().min(1).max(1000),
  explanation: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  options: z.array(z.object({
    text: z.string().min(1).max(500),
    imageUrl: z.string().url().optional()
  })).optional(),
  correctAnswer: z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
    z.array(z.number())
  ]),
  points: z.number().min(0).max(100).default(1),
  negativePoints: z.number().min(0).max(100).default(0),
  timeLimitSeconds: z.number().int().min(5).max(3600).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM")
})

const CreateQuizTestInputSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  categoryId: z.string().cuid2().optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),

  quizType: z.enum(["KNOWLEDGE", "TRIVIA", "EDUCATIONAL", "SKILL_ASSESSMENT"]),

  questions: z.array(QuizQuestionSchema).min(5).max(50),

  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("PUBLIC"),

  timeLimitMinutes: z.number().int().min(1).max(180).optional(),
  attemptsAllowed: z.number().int().min(1).max(10).default(1),

  passingScore: z.number().min(0).max(100).optional(),
  showCorrectAnswers: z.boolean().default(true),
  showScoreImmediately: z.boolean().default(true),

  randomizeQuestions: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),

  certificateEnabled: z.boolean().default(false)
})

const CreateQuizTestOutputSchema = z.object({
  testId: z.string(),
  slug: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED"])
})

// ─────────────────────────────────────────────────────────────────────────────
// TAKE QUIZ ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

const StartQuizAttemptInputSchema = z.object({
  testId: z.string().cuid2()
})

const StartQuizAttemptOutputSchema = z.object({
  attemptId: z.string(),
  attemptNumber: z.number(),
  questions: z.array(z.object({
    id: z.string(),
    type: z.string(),
    text: z.string(),
    imageUrl: z.string().nullable(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      imageUrl: z.string().nullable()
    })).nullable(),
    timeLimitSeconds: z.number().nullable()
  })),
  timeLimitMinutes: z.number().nullable(),
  startedAt: z.date()
})

const SubmitQuizAnswerInputSchema = z.object({
  attemptId: z.string().cuid2(),
  questionId: z.string().cuid2(),
  answer: z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())])
})

const SubmitQuizAnswerOutputSchema = z.object({
  submitted: z.boolean(),
  isCorrect: z.boolean().optional(),
  correctAnswer: z.unknown().optional(),
  explanation: z.string().optional()
})

const CompleteQuizInputSchema = z.object({
  attemptId: z.string().cuid2()
})

const CompleteQuizOutputSchema = z.object({
  completed: z.boolean(),
  score: z.number(),
  maxScore: z.number(),
  percentageScore: z.number(),
  passed: z.boolean().nullable(),
  badgeAwarded: z.object({
    code: z.string(),
    name: z.string(),
    iconUrl: z.string()
  }).nullable(),
  xpEarned: z.number(),
  answers: z.array(z.object({
    questionId: z.string(),
    userAnswer: z.unknown(),
    correctAnswer: z.unknown(),
    isCorrect: z.boolean(),
    points: z.number(),
    explanation: z.string().nullable()
  })).optional()
})

export {
  QuizQuestionSchema,
  CreateQuizTestInputSchema,
  CreateQuizTestOutputSchema,
  StartQuizAttemptInputSchema,
  StartQuizAttemptOutputSchema,
  SubmitQuizAnswerInputSchema,
  SubmitQuizAnswerOutputSchema,
  CompleteQuizInputSchema,
  CompleteQuizOutputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.7 DISCUSSION & COMMENT ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.7.1 Comment Actions

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// CREATE COMMENT
// ─────────────────────────────────────────────────────────────────────────────

const CreateCommentInputSchema = z.object({
  discussionId: z.string().cuid2(),
  parentId: z.string().cuid2().optional(),
  content: z.string().min(3).max(2000)
})

const CreateCommentOutputSchema = z.object({
  commentId: z.string(),
  comment: z.object({
    id: z.string(),
    content: z.string(),
    author: z.object({
      id: z.string(),
      username: z.string(),
      displayName: z.string(),
      avatarUrl: z.string().nullable(),
      isVerified: z.boolean()
    }),
    parentId: z.string().nullable(),
    depth: z.number(),
    upvotes: z.number(),
    downvotes: z.number(),
    replyCount: z.number(),
    createdAt: z.date()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// EDIT COMMENT
// ─────────────────────────────────────────────────────────────────────────────

const EditCommentInputSchema = z.object({
  commentId: z.string().cuid2(),
  content: z.string().min(3).max(2000)
})

const EditCommentOutputSchema = z.object({
  edited: z.boolean(),
  editedAt: z.date()
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE COMMENT
// ─────────────────────────────────────────────────────────────────────────────

const DeleteCommentInputSchema = z.object({
  commentId: z.string().cuid2()
})

const DeleteCommentOutputSchema = z.object({
  deleted: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// VOTE ON COMMENT
// ─────────────────────────────────────────────────────────────────────────────

const VoteOnCommentInputSchema = z.object({
  commentId: z.string().cuid2(),
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)])
})

const VoteOnCommentOutputSchema = z.object({
  voted: z.boolean(),
  newUpvotes: z.number(),
  newDownvotes: z.number(),
  userVote: z.number()
})

// ─────────────────────────────────────────────────────────────────────────────
// LIST COMMENTS
// ─────────────────────────────────────────────────────────────────────────────

const ListCommentsInputSchema = z.object({
  discussionId: z.string().cuid2(),
  parentId: z.string().cuid2().optional(),
  sortBy: z.enum(["BEST", "TOP", "NEW", "OLD", "CONTROVERSIAL"]).default("BEST"),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20)
})

const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
    isVerified: z.boolean()
  }),
  parentId: z.string().nullable(),
  depth: z.number(),
  upvotes: z.number(),
  downvotes: z.number(),
  wilsonScore: z.number(),
  replyCount: z.number(),
  isEdited: z.boolean(),
  isPinned: z.boolean(),
  userVote: z.number(),
  createdAt: z.date(),
  editedAt: z.date().nullable()
})

const ListCommentsOutputSchema = z.object({
  comments: z.array(CommentSchema),
  cursor: z.string().nullable(),
  hasMore: z.boolean()
})

export {
  CreateCommentInputSchema,
  CreateCommentOutputSchema,
  EditCommentInputSchema,
  EditCommentOutputSchema,
  DeleteCommentInputSchema,
  DeleteCommentOutputSchema,
  VoteOnCommentInputSchema,
  VoteOnCommentOutputSchema,
  ListCommentsInputSchema,
  CommentSchema,
  ListCommentsOutputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.8 NOTIFICATION ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.8.1 Notification Actions

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// GET NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

const GetNotificationsInputSchema = z.object({
  filter: z.enum(["ALL", "UNREAD", "READ"]).default("ALL"),
  category: z.enum(["CONTENT", "SOCIAL", "SYSTEM", "ORGANIZATION", "MODERATION"]).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20)
})

const NotificationItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: z.string(),
  priority: z.string(),
  title: z.string(),
  body: z.string(),
  actor: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable()
  }).nullable(),
  resource: z.object({
    id: z.string(),
    type: z.string(),
    title: z.string().nullable()
  }).nullable(),
  actionUrl: z.string().nullable(),
  aggregatedCount: z.number(),
  aggregatedActors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable()
  })),
  status: z.enum(["UNREAD", "READ", "ARCHIVED"]),
  createdAt: z.date()
})

const GetNotificationsOutputSchema = z.object({
  notifications: z.array(NotificationItemSchema),
  unreadCount: z.number(),
  cursor: z.string().nullable(),
  hasMore: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// MARK NOTIFICATION READ
// ─────────────────────────────────────────────────────────────────────────────

const MarkNotificationReadInputSchema = z.object({
  notificationId: z.string().cuid2()
})

const MarkNotificationReadOutputSchema = z.object({
  marked: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// MARK ALL READ
// ─────────────────────────────────────────────────────────────────────────────

const MarkAllNotificationsReadInputSchema = z.object({
  category: z.enum(["CONTENT", "SOCIAL", "SYSTEM", "ORGANIZATION", "MODERATION"]).optional()
})

const MarkAllNotificationsReadOutputSchema = z.object({
  markedCount: z.number()
})

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE NOTIFICATION PREFERENCES
// ─────────────────────────────────────────────────────────────────────────────

const UpdateNotificationPreferencesInputSchema = z.object({
  globalEnabled: z.boolean().optional(),
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    allowUrgent: z.boolean()
  }).optional(),
  categories: z.record(z.enum(["CONTENT", "SOCIAL", "SYSTEM", "ORGANIZATION", "MODERATION"]), z.object({
    enabled: z.boolean(),
    channels: z.object({
      inApp: z.boolean(),
      push: z.boolean(),
      email: z.boolean()
    })
  })).optional(),
  emailDigest: z.object({
    enabled: z.boolean(),
    frequency: z.enum(["DAILY", "WEEKLY"])
  }).optional()
})

export {
  GetNotificationsInputSchema,
  NotificationItemSchema,
  GetNotificationsOutputSchema,
  MarkNotificationReadInputSchema,
  MarkNotificationReadOutputSchema,
  MarkAllNotificationsReadInputSchema,
  MarkAllNotificationsReadOutputSchema,
  UpdateNotificationPreferencesInputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.9 ORGANIZATION ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.9.1 Organization Management

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// CREATE ORGANIZATION
// ─────────────────────────────────────────────────────────────────────────────

const CreateOrganizationInputSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  type: z.enum(["CORPORATION", "MUNICIPALITY", "GOVERNMENT", "NGO", "EDUCATION", "MEDIA", "RESEARCH", "OTHER"]),
  description: z.string().max(1000).optional(),
  website: z.string().url().optional(),
  country: z.string().length(2),
  city: z.string().max(100).optional(),
  taxId: z.string().max(50).optional()
})

const CreateOrganizationOutputSchema = z.object({
  organizationId: z.string(),
  slug: z.string(),
  status: z.enum(["PENDING", "ACTIVE"])
})

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE ORGANIZATION
// ─────────────────────────────────────────────────────────────────────────────

const UpdateOrganizationInputSchema = z.object({
  organizationId: z.string().cuid2(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  settings: z.record(z.unknown()).optional()
})

// ─────────────────────────────────────────────────────────────────────────────
// INVITE MEMBER
// ─────────────────────────────────────────────────────────────────────────────

// [REFERENCE] Role values defined in BIBLE-013 OrgMemberRole enum
const InviteMemberInputSchema = z.object({
  organizationId: z.string().cuid2(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "ANALYST", "CREATOR", "MEMBER"]).default("MEMBER"),
  permissions: z.array(z.string()).optional()
})

const InviteMemberOutputSchema = z.object({
  invited: z.boolean(),
  invitationId: z.string()
})

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE MEMBER ROLE
// ─────────────────────────────────────────────────────────────────────────────

const UpdateMemberRoleInputSchema = z.object({
  organizationId: z.string().cuid2(),
  userId: z.string().cuid2(),
  role: z.enum(["ADMIN", "MANAGER", "ANALYST", "CREATOR", "MEMBER"])
})

// ─────────────────────────────────────────────────────────────────────────────
// REMOVE MEMBER
// ─────────────────────────────────────────────────────────────────────────────

const RemoveMemberInputSchema = z.object({
  organizationId: z.string().cuid2(),
  userId: z.string().cuid2()
})

export {
  CreateOrganizationInputSchema,
  CreateOrganizationOutputSchema,
  UpdateOrganizationInputSchema,
  InviteMemberInputSchema,
  InviteMemberOutputSchema,
  UpdateMemberRoleInputSchema,
  RemoveMemberInputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.10 REPORT & MODERATION ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.10.1 Report Actions

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// CREATE REPORT
// ─────────────────────────────────────────────────────────────────────────────

const CreateReportInputSchema = z.object({
  targetType: z.enum(["USER", "POLL", "SURVEY", "TEST", "COMMENT", "DISCUSSION"]),
  targetId: z.string().cuid2(),
  reason: z.enum([
    "SPAM", "HARASSMENT", "HATE_SPEECH", "MISINFORMATION",
    "INAPPROPRIATE_CONTENT", "VIOLENCE", "SELF_HARM",
    "ILLEGAL_CONTENT", "COPYRIGHT", "IMPERSONATION", "OTHER"
  ]),
  details: z.string().max(1000).optional()
})

const CreateReportOutputSchema = z.object({
  reportId: z.string(),
  status: z.enum(["PENDING", "IN_REVIEW"])
})

// ─────────────────────────────────────────────────────────────────────────────
// MODERATION ACTIONS (Admin Only)
// ─────────────────────────────────────────────────────────────────────────────

const ResolveReportInputSchema = z.object({
  reportId: z.string().cuid2(),
  resolution: z.enum([
    "NO_VIOLATION", "WARNING_ISSUED", "CONTENT_REMOVED",
    "CONTENT_MODIFIED", "ACCOUNT_SUSPENDED", "ACCOUNT_BANNED",
    "ESCALATED_TO_LEGAL"
  ]),
  notes: z.string().max(1000).optional(),
  actions: z.array(z.object({
    type: z.enum(["REMOVE_CONTENT", "WARN_USER", "SUSPEND_USER", "BAN_USER"]),
    targetId: z.string(),
    duration: z.number().optional()
  })).optional()
})

const ResolveReportOutputSchema = z.object({
  resolved: z.boolean(),
  actionsTaken: z.array(z.string())
})

export {
  CreateReportInputSchema,
  CreateReportOutputSchema,
  ResolveReportInputSchema,
  ResolveReportOutputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.11 SEARCH & FEED ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.11.1 Search Actions

```typescript
"use server"

import { z } from "zod"

const SearchInputSchema = z.object({
  query: z.string().min(2).max(200),
  type: z.enum(["ALL", "POLLS", "SURVEYS", "TESTS", "USERS"]).default("ALL"),
  filters: z.object({
    categoryId: z.string().cuid2().optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "ALL"]).optional(),
    dateRange: z.object({
      from: z.date(),
      to: z.date()
    }).optional()
  }).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20)
})

const SearchResultSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("POLL"),
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    creatorName: z.string(),
    participantCount: z.number(),
    status: z.string(),
    createdAt: z.date()
  }),
  z.object({
    type: z.literal("SURVEY"),
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    organizationName: z.string(),
    responseCount: z.number(),
    status: z.string(),
    createdAt: z.date()
  }),
  z.object({
    type: z.literal("TEST"),
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    creatorName: z.string(),
    participantCount: z.number(),
    createdAt: z.date()
  }),
  z.object({
    type: z.literal("USER"),
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
    isVerified: z.boolean(),
    followerCount: z.number()
  })
])

const SearchOutputSchema = z.object({
  results: z.array(SearchResultSchema),
  counts: z.object({
    polls: z.number(),
    surveys: z.number(),
    tests: z.number(),
    users: z.number()
  }),
  cursor: z.string().nullable(),
  hasMore: z.boolean()
})

export { SearchInputSchema, SearchResultSchema, SearchOutputSchema }
```

## 14.11.2 Trending & Categories

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// GET TRENDING
// ─────────────────────────────────────────────────────────────────────────────

const GetTrendingInputSchema = z.object({
  type: z.enum(["POLLS", "TOPICS", "USERS"]).default("POLLS"),
  categoryId: z.string().cuid2().optional(),
  limit: z.number().int().min(1).max(20).default(10)
})

const TrendingPollSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  participantCount: z.number(),
  velocity: z.number(),
  rank: z.number(),
  previousRank: z.number().nullable()
})

const GetTrendingOutputSchema = z.object({
  items: z.array(TrendingPollSchema),
  updatedAt: z.date()
})

// ─────────────────────────────────────────────────────────────────────────────
// GET CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

const GetCategoriesInputSchema = z.object({
  parentId: z.string().cuid2().optional(),
  includeStats: z.boolean().default(false)
})

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  iconName: z.string().nullable(),
  color: z.string().nullable(),
  parentId: z.string().nullable(),
  pollCount: z.number().optional(),
  children: z.array(z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string()
  })).optional()
})

const GetCategoriesOutputSchema = z.object({
  categories: z.array(CategorySchema)
})

export {
  GetTrendingInputSchema,
  TrendingPollSchema,
  GetTrendingOutputSchema,
  GetCategoriesInputSchema,
  CategorySchema,
  GetCategoriesOutputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.12 FILE UPLOAD ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.12.1 Upload Actions

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// GET PRESIGNED URL
// ─────────────────────────────────────────────────────────────────────────────

const GetPresignedUrlInputSchema = z.object({
  fileName: z.string().max(255),
  fileType: z.string().max(100),
  fileSize: z.number().int().min(1).max(10485760),
  purpose: z.enum(["AVATAR", "POLL_IMAGE", "SURVEY_IMAGE", "TEST_IMAGE", "ATTACHMENT"])
})

const GetPresignedUrlOutputSchema = z.object({
  uploadUrl: z.string(),
  fileUrl: z.string(),
  expiresAt: z.date()
})

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM UPLOAD
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmUploadInputSchema = z.object({
  fileUrl: z.string().url(),
  purpose: z.enum(["AVATAR", "POLL_IMAGE", "SURVEY_IMAGE", "TEST_IMAGE", "ATTACHMENT"])
})

const ConfirmUploadOutputSchema = z.object({
  confirmed: z.boolean(),
  processedUrl: z.string()
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE FILE
// ─────────────────────────────────────────────────────────────────────────────

const DeleteFileInputSchema = z.object({
  fileUrl: z.string().url()
})

const DeleteFileOutputSchema = z.object({
  deleted: z.boolean()
})

export {
  GetPresignedUrlInputSchema,
  GetPresignedUrlOutputSchema,
  ConfirmUploadInputSchema,
  ConfirmUploadOutputSchema,
  DeleteFileInputSchema,
  DeleteFileOutputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.12.5 SCORING & ANALYTICS UTILITY ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

[REFERENCE] Academic methodologies defined in BIBLE-019 Section 19.2-19.8

## 14.12.5.1 NPS Calculation Action

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// NET PROMOTER SCORE (NPS) CALCULATION
// Reference: Reichheld, F. (2003). "The One Number You Need to Grow"
// Scale: 0-10 | Promoters: 9-10 | Passives: 7-8 | Detractors: 0-6
// ─────────────────────────────────────────────────────────────────────────────

const CalculateNPSInputSchema = z.object({
  surveyId: z.string().cuid2(),
  questionId: z.string().cuid2(),
  includeTimeRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).optional(),
  segmentBy: z.enum(["NONE", "DEMOGRAPHIC", "TIME_PERIOD"]).default("NONE")
})

const NPSResultSchema = z.object({
  npsScore: z.number().min(-100).max(100),
  totalResponses: z.number().int().min(0),
  promoters: z.object({
    count: z.number().int(),
    percentage: z.number().min(0).max(100)
  }),
  passives: z.object({
    count: z.number().int(),
    percentage: z.number().min(0).max(100)
  }),
  detractors: z.object({
    count: z.number().int(),
    percentage: z.number().min(0).max(100)
  }),
  interpretation: z.enum([
    "NEEDS_IMPROVEMENT",     // -100 to 0
    "GOOD",                  // 0 to 30
    "GREAT",                 // 30 to 70
    "WORLD_CLASS"            // 70 to 100
  ]),
  confidenceInterval: z.object({
    lower: z.number(),
    upper: z.number(),
    level: z.literal(0.95)
  }).optional(),
  trend: z.object({
    previousNPS: z.number().optional(),
    change: z.number().optional(),
    direction: z.enum(["UP", "DOWN", "STABLE"]).optional()
  }).optional()
})

const CalculateNPSOutputSchema = z.object({
  result: NPSResultSchema,
  calculatedAt: z.date(),
  methodology: z.literal("BAIN_STANDARD")
})

export {
  CalculateNPSInputSchema,
  CalculateNPSOutputSchema,
  NPSResultSchema
}
```

## 14.12.5.2 CSAT Calculation Action

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER SATISFACTION SCORE (CSAT) CALCULATION
// Industry Standard: Top-2-Box methodology
// Scale: 1-5 | Satisfied: 4-5 (Top-2-Box)
// ─────────────────────────────────────────────────────────────────────────────

const CalculateCSATInputSchema = z.object({
  surveyId: z.string().cuid2(),
  questionId: z.string().cuid2(),
  scaleType: z.enum(["FIVE_POINT", "SEVEN_POINT", "EMOJI"]).default("FIVE_POINT"),
  includeTimeRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).optional()
})

const CSATResultSchema = z.object({
  csatScore: z.number().min(0).max(100),           // Percentage
  totalResponses: z.number().int().min(0),
  distribution: z.array(z.object({
    value: z.number(),
    label: z.string(),
    count: z.number().int(),
    percentage: z.number()
  })),
  topTwoBox: z.object({
    count: z.number().int(),
    percentage: z.number()
  }),
  bottomTwoBox: z.object({
    count: z.number().int(),
    percentage: z.number()
  }),
  mean: z.number(),
  median: z.number(),
  standardDeviation: z.number(),
  interpretation: z.enum([
    "POOR",                 // 0-50%
    "FAIR",                 // 50-65%
    "GOOD",                 // 65-75%
    "EXCELLENT",            // 75-85%
    "WORLD_CLASS"           // 85-100%
  ])
})

const CalculateCSATOutputSchema = z.object({
  result: CSATResultSchema,
  calculatedAt: z.date(),
  methodology: z.literal("TOP_TWO_BOX")
})

export {
  CalculateCSATInputSchema,
  CalculateCSATOutputSchema,
  CSATResultSchema
}
```

## 14.12.5.3 CES Calculation Action

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER EFFORT SCORE (CES) CALCULATION
// Reference: Dixon, M. et al. (2010). "Stop Trying to Delight Your Customers"
// Gartner Validated Methodology
// Scale: 1-7 Agreement | Lower = Better (less effort)
// ─────────────────────────────────────────────────────────────────────────────

const CalculateCESInputSchema = z.object({
  surveyId: z.string().cuid2(),
  questionId: z.string().cuid2(),
  includeTimeRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).optional()
})

const CESResultSchema = z.object({
  cesScore: z.number().min(1).max(7),              // Mean score
  totalResponses: z.number().int().min(0),
  distribution: z.array(z.object({
    value: z.number(),
    label: z.string(),                              // "Kesinlikle Katılmıyorum" - "Kesinlikle Katılıyorum"
    count: z.number().int(),
    percentage: z.number()
  })),
  lowEffortPercentage: z.number(),                  // Scores 5-7 (agree it was easy)
  highEffortPercentage: z.number(),                 // Scores 1-3 (disagree it was easy)
  interpretation: z.enum([
    "HIGH_EFFORT",          // CES < 3.5
    "MODERATE_EFFORT",      // CES 3.5-5
    "LOW_EFFORT",           // CES 5-6
    "VERY_LOW_EFFORT"       // CES > 6
  ])
})

const CalculateCESOutputSchema = z.object({
  result: CESResultSchema,
  calculatedAt: z.date(),
  methodology: z.literal("GARTNER_STANDARD")
})

export {
  CalculateCESInputSchema,
  CalculateCESOutputSchema,
  CESResultSchema
}
```

## 14.12.5.4 Likert Scale Analysis Action

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// LIKERT SCALE ANALYSIS
// Reference: Likert, R. (1932). A technique for the measurement of attitudes
// Supports: 5-point, 7-point, and custom scales
// ─────────────────────────────────────────────────────────────────────────────

const AnalyzeLikertScaleInputSchema = z.object({
  surveyId: z.string().cuid2(),
  questionIds: z.array(z.string().cuid2()).min(1).max(50),
  scalePoints: z.union([z.literal(5), z.literal(7)]),
  treatAsInterval: z.boolean().default(true),        // Treat as interval vs ordinal data
  includeReliability: z.boolean().default(true)      // Calculate Cronbach's Alpha
})

const LikertAnalysisResultSchema = z.object({
  perQuestion: z.array(z.object({
    questionId: z.string(),
    questionText: z.string(),
    totalResponses: z.number().int(),
    distribution: z.array(z.object({
      value: z.number(),
      label: z.string(),
      count: z.number().int(),
      percentage: z.number()
    })),
    descriptiveStats: z.object({
      mean: z.number(),
      median: z.number(),
      mode: z.number(),
      standardDeviation: z.number(),
      variance: z.number(),
      skewness: z.number(),
      kurtosis: z.number()
    }),
    topBox: z.number(),                              // % selecting highest option
    bottomBox: z.number()                            // % selecting lowest option
  })),
  aggregate: z.object({
    overallMean: z.number(),
    overallStandardDeviation: z.number(),
    totalResponses: z.number().int()
  }),
  reliability: z.object({
    cronbachsAlpha: z.number().min(0).max(1),
    interpretation: z.enum([
      "UNACCEPTABLE",       // α < 0.50
      "POOR",               // α 0.50-0.60
      "QUESTIONABLE",       // α 0.60-0.70
      "ACCEPTABLE",         // α 0.70-0.80
      "GOOD",               // α 0.80-0.90
      "EXCELLENT"           // α > 0.90
    ]),
    itemTotalCorrelations: z.array(z.object({
      questionId: z.string(),
      correlation: z.number(),
      alphaIfDeleted: z.number()
    }))
  }).optional()
})

const AnalyzeLikertScaleOutputSchema = z.object({
  result: LikertAnalysisResultSchema,
  calculatedAt: z.date(),
  methodology: z.literal("CLASSICAL_TEST_THEORY")
})

export {
  AnalyzeLikertScaleInputSchema,
  AnalyzeLikertScaleOutputSchema,
  LikertAnalysisResultSchema
}
```

## 14.12.5.5 MaxDiff Analysis Action

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// MAXDIFF (BEST-WORST SCALING) ANALYSIS
// Reference: Louviere, J.J. (1991). Best-Worst Scaling
// Academic gold standard for preference prioritization
// ─────────────────────────────────────────────────────────────────────────────

const AnalyzeMaxDiffInputSchema = z.object({
  surveyId: z.string().cuid2(),
  questionId: z.string().cuid2(),
  analysisType: z.enum(["SIMPLE_COUNT", "HIERARCHICAL_BAYES"]).default("SIMPLE_COUNT")
})

const MaxDiffResultSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    itemText: z.string(),
    bestCount: z.number().int(),
    worstCount: z.number().int(),
    netScore: z.number(),                           // (best - worst) / appearances
    rawUtility: z.number(),                         // ln(best/worst) or HB utility
    rescaledUtility: z.number().min(0).max(100),    // 0-100 scale
    rank: z.number().int(),
    standardError: z.number().optional()
  })),
  totalResponses: z.number().int(),
  totalChoiceTasks: z.number().int(),
  modelFit: z.object({
    rootLikelihood: z.number().optional(),
    percentCertainty: z.number().optional()
  }).optional(),
  segmentComparison: z.array(z.object({
    segmentName: z.string(),
    itemRankings: z.array(z.object({
      itemId: z.string(),
      rank: z.number().int(),
      utility: z.number()
    }))
  })).optional()
})

const AnalyzeMaxDiffOutputSchema = z.object({
  result: MaxDiffResultSchema,
  calculatedAt: z.date(),
  methodology: z.enum(["SIMPLE_COUNT", "HIERARCHICAL_BAYES"])
})

export {
  AnalyzeMaxDiffInputSchema,
  AnalyzeMaxDiffOutputSchema,
  MaxDiffResultSchema
}
```

## 14.12.5.6 Personality Test Scoring Action

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// PERSONALITY TEST SCORING
// Supports: Big Five (OCEAN), MBTI-style Dichotomies, Character Matching, Spectrum
// Reference: Costa, P.T. & McCrae, R.R. (1992). NEO-PI-R Professional Manual
// ─────────────────────────────────────────────────────────────────────────────

const CalculatePersonalityScoreInputSchema = z.object({
  testId: z.string().cuid2(),
  responseId: z.string().cuid2(),
  scoringMethod: z.enum([
    "BIG_FIVE",              // OCEAN model
    "MBTI_DICHOTOMY",        // E/I, S/N, T/F, J/P
    "CHARACTER_MATCH",       // Similarity to predefined characters
    "SPECTRUM",              // Single dimension percentage
    "AXIS_QUADRANT"          // Multi-axis with quadrant assignment
  ])
})

// Big Five (OCEAN) Result
const BigFiveResultSchema = z.object({
  type: z.literal("BIG_FIVE"),
  traits: z.object({
    openness: z.object({
      rawScore: z.number(),
      percentile: z.number().min(0).max(100),
      level: z.enum(["LOW", "MODERATE", "HIGH"]),
      facets: z.array(z.object({
        name: z.string(),
        score: z.number()
      })).optional()
    }),
    conscientiousness: z.object({
      rawScore: z.number(),
      percentile: z.number().min(0).max(100),
      level: z.enum(["LOW", "MODERATE", "HIGH"]),
      facets: z.array(z.object({
        name: z.string(),
        score: z.number()
      })).optional()
    }),
    extraversion: z.object({
      rawScore: z.number(),
      percentile: z.number().min(0).max(100),
      level: z.enum(["LOW", "MODERATE", "HIGH"]),
      facets: z.array(z.object({
        name: z.string(),
        score: z.number()
      })).optional()
    }),
    agreeableness: z.object({
      rawScore: z.number(),
      percentile: z.number().min(0).max(100),
      level: z.enum(["LOW", "MODERATE", "HIGH"]),
      facets: z.array(z.object({
        name: z.string(),
        score: z.number()
      })).optional()
    }),
    neuroticism: z.object({
      rawScore: z.number(),
      percentile: z.number().min(0).max(100),
      level: z.enum(["LOW", "MODERATE", "HIGH"]),
      facets: z.array(z.object({
        name: z.string(),
        score: z.number()
      })).optional()
    })
  }),
  reliability: z.object({
    cronbachsAlpha: z.number(),
    interpretation: z.string()
  }).optional()
})

// MBTI-style Dichotomy Result
const MBTIDichotomyResultSchema = z.object({
  type: z.literal("MBTI_DICHOTOMY"),
  typeCode: z.string().regex(/^[EI][SN][TF][JP]$/),  // e.g., "INTJ"
  dichotomies: z.object({
    EI: z.object({
      score: z.number().min(-100).max(100),          // Negative = I, Positive = E
      dominant: z.enum(["E", "I"]),
      clarity: z.enum(["SLIGHT", "MODERATE", "CLEAR", "VERY_CLEAR"])
    }),
    SN: z.object({
      score: z.number().min(-100).max(100),
      dominant: z.enum(["S", "N"]),
      clarity: z.enum(["SLIGHT", "MODERATE", "CLEAR", "VERY_CLEAR"])
    }),
    TF: z.object({
      score: z.number().min(-100).max(100),
      dominant: z.enum(["T", "F"]),
      clarity: z.enum(["SLIGHT", "MODERATE", "CLEAR", "VERY_CLEAR"])
    }),
    JP: z.object({
      score: z.number().min(-100).max(100),
      dominant: z.enum(["J", "P"]),
      clarity: z.enum(["SLIGHT", "MODERATE", "CLEAR", "VERY_CLEAR"])
    })
  }),
  typeDescription: z.object({
    name: z.string(),
    summary: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string())
  })
})

// Character Match Result
const CharacterMatchResultSchema = z.object({
  type: z.literal("CHARACTER_MATCH"),
  matchedCharacter: z.object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string().url().optional(),
    description: z.string()
  }),
  matchPercentage: z.number().min(0).max(100),
  allMatches: z.array(z.object({
    characterId: z.string(),
    characterName: z.string(),
    similarity: z.number().min(0).max(100),
    rank: z.number().int()
  })),
  matchingTraits: z.array(z.string())
})

// Axis/Quadrant Result
const AxisQuadrantResultSchema = z.object({
  type: z.literal("AXIS_QUADRANT"),
  axes: z.array(z.object({
    axisId: z.string(),
    axisName: z.string(),
    negativeLabel: z.string(),
    positiveLabel: z.string(),
    score: z.number().min(-100).max(100),
    percentage: z.number().min(0).max(100)
  })),
  coordinates: z.object({
    x: z.number(),
    y: z.number()
  }),
  quadrant: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string()
  })
})

const PersonalityScoreResultSchema = z.discriminatedUnion("type", [
  BigFiveResultSchema,
  MBTIDichotomyResultSchema,
  CharacterMatchResultSchema,
  AxisQuadrantResultSchema
])

const CalculatePersonalityScoreOutputSchema = z.object({
  result: PersonalityScoreResultSchema,
  responseId: z.string(),
  completedAt: z.date(),
  shareableCardUrl: z.string().url().optional()
})

export {
  CalculatePersonalityScoreInputSchema,
  CalculatePersonalityScoreOutputSchema,
  PersonalityScoreResultSchema,
  BigFiveResultSchema,
  MBTIDichotomyResultSchema,
  CharacterMatchResultSchema,
  AxisQuadrantResultSchema
}
```

## 14.12.5.7 Poll Results Calculation Action

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// POLL RESULTS CALCULATION
// Supports: Single Choice, Multiple Choice, Ranked Choice (IRV), Approval Voting
// ─────────────────────────────────────────────────────────────────────────────

const CalculatePollResultsInputSchema = z.object({
  pollId: z.string().cuid2(),
  votingMethod: z.enum([
    "PLURALITY",             // Single choice - highest count wins
    "MAJORITY",              // Single choice - must exceed 50%
    "APPROVAL",              // Multiple choice - most approvals wins
    "RANKED_CHOICE_IRV",     // Instant Runoff Voting
    "BORDA_COUNT",           // Ranked - points by position
    "CONDORCET"              // Pairwise comparison winner
  ]).default("PLURALITY"),
  includeConfidenceInterval: z.boolean().default(false),
  applyWeighting: z.boolean().default(false)
})

// Plurality/Majority Result
const PluralityResultSchema = z.object({
  method: z.literal("PLURALITY"),
  options: z.array(z.object({
    optionId: z.string(),
    optionText: z.string(),
    voteCount: z.number().int(),
    percentage: z.number().min(0).max(100),
    rank: z.number().int(),
    isWinner: z.boolean()
  })),
  totalVotes: z.number().int(),
  winner: z.object({
    optionId: z.string(),
    optionText: z.string(),
    voteCount: z.number().int(),
    percentage: z.number()
  }),
  marginOfVictory: z.number()
})

// Ranked Choice (IRV) Result
const RankedChoiceResultSchema = z.object({
  method: z.literal("RANKED_CHOICE_IRV"),
  rounds: z.array(z.object({
    roundNumber: z.number().int(),
    standings: z.array(z.object({
      optionId: z.string(),
      optionText: z.string(),
      voteCount: z.number().int(),
      percentage: z.number()
    })),
    eliminatedOption: z.object({
      optionId: z.string(),
      optionText: z.string()
    }).nullable(),
    redistributedVotes: z.number().int()
  })),
  finalWinner: z.object({
    optionId: z.string(),
    optionText: z.string(),
    finalVoteCount: z.number().int(),
    finalPercentage: z.number()
  }),
  totalBallots: z.number().int(),
  exhaustedBallots: z.number().int()
})

// Approval Voting Result
const ApprovalResultSchema = z.object({
  method: z.literal("APPROVAL"),
  options: z.array(z.object({
    optionId: z.string(),
    optionText: z.string(),
    approvalCount: z.number().int(),
    approvalRate: z.number().min(0).max(100),     // % of voters who approved
    rank: z.number().int()
  })),
  totalVoters: z.number().int(),
  averageApprovalsPerVoter: z.number(),
  winner: z.object({
    optionId: z.string(),
    optionText: z.string(),
    approvalCount: z.number().int(),
    approvalRate: z.number()
  })
})

const PollResultSchema = z.discriminatedUnion("method", [
  PluralityResultSchema,
  RankedChoiceResultSchema,
  ApprovalResultSchema
])

const CalculatePollResultsOutputSchema = z.object({
  result: PollResultSchema,
  calculatedAt: z.date(),
  participationStats: z.object({
    totalEligible: z.number().int().optional(),
    totalParticipated: z.number().int(),
    participationRate: z.number().optional()
  }),
  confidenceInterval: z.object({
    marginOfError: z.number(),
    confidenceLevel: z.number(),
    sampleSize: z.number().int()
  }).optional()
})

export {
  CalculatePollResultsInputSchema,
  CalculatePollResultsOutputSchema,
  PollResultSchema,
  PluralityResultSchema,
  RankedChoiceResultSchema,
  ApprovalResultSchema
}
```

## 14.12.5.8 Statistical Utilities Action

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// STATISTICAL ANALYSIS UTILITIES
// General-purpose statistics for survey/poll data
// ─────────────────────────────────────────────────────────────────────────────

const CalculateStatisticsInputSchema = z.object({
  data: z.array(z.number()),
  operations: z.array(z.enum([
    "DESCRIPTIVE",           // Mean, median, mode, std dev
    "DISTRIBUTION",          // Histogram, frequency table
    "CONFIDENCE_INTERVAL",   // CI for mean
    "CORRELATION",           // Requires paired data
    "SIGNIFICANCE_TEST"      // T-test, chi-square
  ])),
  confidenceLevel: z.number().min(0.8).max(0.99).default(0.95),
  pairedData: z.array(z.number()).optional()        // For correlation
})

const DescriptiveStatsSchema = z.object({
  count: z.number().int(),
  sum: z.number(),
  mean: z.number(),
  median: z.number(),
  mode: z.array(z.number()),
  min: z.number(),
  max: z.number(),
  range: z.number(),
  standardDeviation: z.number(),
  variance: z.number(),
  standardError: z.number(),
  skewness: z.number(),
  kurtosis: z.number(),
  quartiles: z.object({
    q1: z.number(),
    q2: z.number(),
    q3: z.number()
  }),
  iqr: z.number()
})

const ConfidenceIntervalSchema = z.object({
  mean: z.number(),
  lower: z.number(),
  upper: z.number(),
  confidenceLevel: z.number(),
  marginOfError: z.number()
})

const CorrelationSchema = z.object({
  pearsonR: z.number().min(-1).max(1),
  spearmanRho: z.number().min(-1).max(1),
  pValue: z.number(),
  interpretation: z.enum([
    "STRONG_NEGATIVE",       // r < -0.7
    "MODERATE_NEGATIVE",     // r -0.7 to -0.3
    "WEAK_NEGATIVE",         // r -0.3 to -0.1
    "NEGLIGIBLE",            // r -0.1 to 0.1
    "WEAK_POSITIVE",         // r 0.1 to 0.3
    "MODERATE_POSITIVE",     // r 0.3 to 0.7
    "STRONG_POSITIVE"        // r > 0.7
  ])
})

const CalculateStatisticsOutputSchema = z.object({
  descriptive: DescriptiveStatsSchema.optional(),
  distribution: z.array(z.object({
    bin: z.string(),
    count: z.number().int(),
    percentage: z.number()
  })).optional(),
  confidenceInterval: ConfidenceIntervalSchema.optional(),
  correlation: CorrelationSchema.optional(),
  calculatedAt: z.date()
})

export {
  CalculateStatisticsInputSchema,
  CalculateStatisticsOutputSchema,
  DescriptiveStatsSchema,
  ConfidenceIntervalSchema,
  CorrelationSchema
}
```

## 14.12.5.9 Data Quality Scoring Action

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// DATA QUALITY SCORING
// Validates survey responses for quality and attention
// ─────────────────────────────────────────────────────────────────────────────

const CalculateDataQualityInputSchema = z.object({
  responseId: z.string().cuid2(),
  checks: z.array(z.enum([
    "ATTENTION_CHECK",       // Did they pass trap questions?
    "SPEEDSTER",             // Completed too fast?
    "STRAIGHTLINER",         // Same answer for all questions?
    "INCONSISTENCY",         // Contradictory answers?
    "OPEN_END_QUALITY",      // Quality of text responses
    "PATTERN_DETECTION"      // Suspicious patterns (e.g., alternating)
  ])).default([
    "ATTENTION_CHECK",
    "SPEEDSTER",
    "STRAIGHTLINER",
    "INCONSISTENCY"
  ])
})

const DataQualityResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  isValid: z.boolean(),
  flags: z.array(z.object({
    type: z.enum([
      "ATTENTION_CHECK_FAILED",
      "SPEEDSTER",
      "STRAIGHTLINER",
      "INCONSISTENT_RESPONSES",
      "LOW_QUALITY_OPEN_END",
      "SUSPICIOUS_PATTERN"
    ]),
    severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
    details: z.string()
  })),
  metrics: z.object({
    completionTimeSeconds: z.number(),
    expectedTimeSeconds: z.number(),
    speedRatio: z.number(),                         // actual/expected
    attentionChecksPassed: z.number().int(),
    attentionChecksFailed: z.number().int(),
    straightlineScore: z.number().min(0).max(1),   // 1 = all same answers
    consistencyScore: z.number().min(0).max(1)     // 1 = fully consistent
  }),
  recommendation: z.enum([
    "INCLUDE",               // High quality - use in analysis
    "REVIEW",                // Medium quality - manual review
    "EXCLUDE"                // Low quality - exclude from analysis
  ])
})

const CalculateDataQualityOutputSchema = z.object({
  result: DataQualityResultSchema,
  calculatedAt: z.date()
})

export {
  CalculateDataQualityInputSchema,
  CalculateDataQualityOutputSchema,
  DataQualityResultSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.13 ACTION CONVENTIONS & BEST PRACTICES
# ══════════════════════════════════════════════════════════════════════════════

## 14.13.1 File Structure

```
app/
├── actions/
│   ├── auth/
│   │   ├── register.ts
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   └── index.ts
│   ├── user/
│   │   ├── profile.ts
│   │   ├── social.ts
│   │   └── index.ts
│   ├── poll/
│   │   ├── create.ts
│   │   ├── vote.ts
│   │   ├── list.ts
│   │   └── index.ts
│   ├── survey/
│   │   ├── create.ts
│   │   ├── respond.ts
│   │   └── index.ts
│   ├── test/
│   │   ├── create.ts
│   │   ├── attempt.ts
│   │   └── index.ts
│   ├── comment/
│   │   └── index.ts
│   ├── notification/
│   │   └── index.ts
│   ├── organization/
│   │   └── index.ts
│   ├── report/
│   │   └── index.ts
│   ├── search/
│   │   └── index.ts
│   └── upload/
│       └── index.ts
└── lib/
    ├── actions/
    │   ├── utils.ts
    │   ├── errors.ts
    │   └── middleware.ts
    └── schemas/
        ├── common.ts
        └── index.ts
```

## 14.13.2 Naming Conventions

```typescript
const ACTION_NAMING = {
  mutations: {
    create: "create{Entity}",
    update: "update{Entity}",
    delete: "delete{Entity}",
    action: "{verb}{Entity}"
  },

  queries: {
    single: "get{Entity}",
    list: "list{Entities}",
    search: "search{Entities}"
  },

  schemas: {
    input: "{ActionName}InputSchema",
    output: "{ActionName}OutputSchema"
  },

  examples: {
    createPoll: "createPoll",
    updatePoll: "updatePoll",
    deletePoll: "deletePoll",
    publishPoll: "publishPoll",
    getPoll: "getPoll",
    listPolls: "listPolls",
    searchPolls: "searchPolls",
    voteOnPoll: "voteOnPoll"
  }
}

export { ACTION_NAMING }
```

## 14.13.3 Error Handling Pattern

```typescript
const ERROR_HANDLING_PATTERN = `
async function exampleAction(input: Input): Promise<ActionResult<Output>> {
  try {
    // 1. Validate input (already done by createAction wrapper)

    // 2. Check authorization
    if (!hasPermission(ctx.userId, "action.resource")) {
      return failure(ErrorCodes.FORBIDDEN, "Bu işlem için yetkiniz yok")
    }

    // 3. Check business rules
    const entity = await db.entity.findUnique({ where: { id: input.id } })
    if (!entity) {
      return failure(ErrorCodes.NOT_FOUND, "Kaynak bulunamadı")
    }

    // 4. Execute operation
    const result = await db.entity.update({
      where: { id: input.id },
      data: { ... }
    })

    // 5. Trigger side effects
    await emitEvent("entity.updated", { entityId: result.id })

    // 6. Invalidate caches
    revalidateTag("entity-" + result.id)

    // 7. Return success
    return success({ ... })

  } catch (error) {
    // Log error for monitoring
    console.error("Action failed:", error)

    // Return generic error to client
    return failure(ErrorCodes.INTERNAL_ERROR, "Beklenmeyen bir hata oluştu")
  }
}
`

export { ERROR_HANDLING_PATTERN }
```




# ══════════════════════════════════════════════════════════════════════════════
# 14.14 VERSION 3.0 NEW ACTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 14.14.1 Live Poll Actions (P-011)

[REFERENCE] BIBLE-006 Section 6.2.6 - Live Poll Feature
[REFERENCE] BIBLE-013 Section 13.10.5.1 - LivePollSession Model

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// START LIVE POLL SESSION
// Requirement: Creator must have Premium subscription
// ─────────────────────────────────────────────────────────────────────────────

const StartLivePollInputSchema = z.object({
  pollId: z.string().cuid2(),
  settings: z.object({
    maxParticipants: z.number().int().min(10).max(10000).default(10000),
    showRealTimeResults: z.boolean().default(true),
    allowLateJoin: z.boolean().default(true),
    anonymousVoting: z.boolean().default(true),
    participantListVisible: z.boolean().default(false),
    autoCloseMinutes: z.number().int().min(1).max(240).nullable().default(null)
  }).optional()
})

const StartLivePollOutputSchema = z.object({
  sessionId: z.string(),
  joinCode: z.string().length(6),
  joinUrl: z.string().url(),
  qrCodeUrl: z.string().url(),
  status: z.literal("WAITING")
})

// ─────────────────────────────────────────────────────────────────────────────
// JOIN LIVE POLL
// No authentication required - participants can join anonymously
// ─────────────────────────────────────────────────────────────────────────────

const JoinLivePollInputSchema = z.object({
  joinCode: z.string().length(6).regex(/^[A-Z0-9]+$/),
  displayName: z.string().min(1).max(50).optional()
})

const JoinLivePollOutputSchema = z.object({
  sessionId: z.string(),
  pollId: z.string(),
  pollQuestion: z.string(),
  pollOptions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    imageUrl: z.string().nullable()
  })),
  participantToken: z.string(),
  currentResults: z.object({
    totalVotes: z.number(),
    options: z.array(z.object({
      optionId: z.string(),
      voteCount: z.number(),
      percentage: z.number()
    }))
  }).optional(),
  settings: z.object({
    showRealTimeResults: z.boolean(),
    allowMultipleChoice: z.boolean(),
    maxSelections: z.number().nullable()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// VOTE IN LIVE POLL
// ─────────────────────────────────────────────────────────────────────────────

const VoteLivePollInputSchema = z.object({
  sessionId: z.string().cuid2(),
  participantToken: z.string(),
  optionIds: z.array(z.string()).min(1).max(10)
})

const VoteLivePollOutputSchema = z.object({
  voted: z.boolean(),
  updatedResults: z.object({
    totalVotes: z.number(),
    options: z.array(z.object({
      optionId: z.string(),
      voteCount: z.number(),
      percentage: z.number()
    }))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// END LIVE POLL SESSION
// ─────────────────────────────────────────────────────────────────────────────

const EndLivePollInputSchema = z.object({
  sessionId: z.string().cuid2()
})

const EndLivePollOutputSchema = z.object({
  ended: z.boolean(),
  finalResults: z.object({
    totalVotes: z.number(),
    uniqueParticipants: z.number(),
    options: z.array(z.object({
      optionId: z.string(),
      optionText: z.string(),
      voteCount: z.number(),
      percentage: z.number(),
      isWinner: z.boolean()
    })),
    duration: z.number()
  }),
  voiceUrl: z.string().url()
})

export {
  StartLivePollInputSchema,
  StartLivePollOutputSchema,
  JoinLivePollInputSchema,
  JoinLivePollOutputSchema,
  VoteLivePollInputSchema,
  VoteLivePollOutputSchema,
  EndLivePollInputSchema,
  EndLivePollOutputSchema
}
```


## 14.14.2 Pre-Test Actions (P-014)

[REFERENCE] BIBLE-006 Section 6.2.7 - Poll Pre-Test System
[REFERENCE] BIBLE-013 Section 13.10.5.2 - PreTestResult Model

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// GET PRE-TEST QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────

const GetPreTestQuestionsInputSchema = z.object({
  contentType: z.enum(["POLL", "SURVEY"]),
  contentId: z.string().cuid2()
})

const GetPreTestQuestionsOutputSchema = z.object({
  hasPreTest: z.boolean(),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string()
    })),
    weight: z.number()
  })),
  settings: z.object({
    passingScore: z.number(),
    maxAttempts: z.number(),
    showFailureReason: z.boolean()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT PRE-TEST ANSWERS
// ─────────────────────────────────────────────────────────────────────────────

const SubmitPreTestInputSchema = z.object({
  contentType: z.enum(["POLL", "SURVEY"]),
  contentId: z.string().cuid2(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionId: z.string()
  }))
})

const SubmitPreTestOutputSchema = z.object({
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  attemptNumber: z.number(),
  canRetry: z.boolean(),
  failureReason: z.string().optional(),
  accessToken: z.string().optional()
})

export {
  GetPreTestQuestionsInputSchema,
  GetPreTestQuestionsOutputSchema,
  SubmitPreTestInputSchema,
  SubmitPreTestOutputSchema
}
```


## 14.14.3 Private Link Actions

[REFERENCE] BIBLE-006 Section 6.2.8 - Private Link Sharing
[REFERENCE] BIBLE-013 Section 13.10.5.3 - PrivateLink Model

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// CREATE PRIVATE LINK
// ─────────────────────────────────────────────────────────────────────────────

const CreatePrivateLinkInputSchema = z.object({
  contentType: z.enum(["POLL", "SURVEY", "TEST"]),
  contentId: z.string().cuid2(),
  settings: z.object({
    expiresAt: z.date().optional(),
    maxUses: z.number().int().min(1).max(10000).optional(),
    requireAuth: z.boolean().default(false),
    trackViews: z.boolean().default(true)
  }).optional()
})

const CreatePrivateLinkOutputSchema = z.object({
  linkId: z.string(),
  code: z.string().length(10),
  url: z.string().url(),
  qrCodeUrl: z.string().url()
})

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS VIA PRIVATE LINK
// ─────────────────────────────────────────────────────────────────────────────

const AccessPrivateLinkInputSchema = z.object({
  code: z.string().length(10)
})

const AccessPrivateLinkOutputSchema = z.object({
  valid: z.boolean(),
  contentType: z.enum(["POLL", "SURVEY", "TEST"]),
  contentId: z.string(),
  requiresAuth: z.boolean(),
  accessToken: z.string().optional()
})

// ─────────────────────────────────────────────────────────────────────────────
// GET PRIVATE LINK STATS
// ─────────────────────────────────────────────────────────────────────────────

const GetPrivateLinkStatsInputSchema = z.object({
  linkId: z.string().cuid2()
})

const GetPrivateLinkStatsOutputSchema = z.object({
  views: z.number(),
  participations: z.number(),
  lastAccessedAt: z.date().nullable(),
  remainingUses: z.number().nullable(),
  expiresAt: z.date().nullable(),
  isActive: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// REVOKE PRIVATE LINK
// ─────────────────────────────────────────────────────────────────────────────

const RevokePrivateLinkInputSchema = z.object({
  linkId: z.string().cuid2()
})

const RevokePrivateLinkOutputSchema = z.object({
  revoked: z.boolean()
})

export {
  CreatePrivateLinkInputSchema,
  CreatePrivateLinkOutputSchema,
  AccessPrivateLinkInputSchema,
  AccessPrivateLinkOutputSchema,
  GetPrivateLinkStatsInputSchema,
  GetPrivateLinkStatsOutputSchema,
  RevokePrivateLinkInputSchema,
  RevokePrivateLinkOutputSchema
}
```


## 14.14.4 Sponsored Campaign Actions (B2B SaaS)

[REFERENCE] BIBLE-011 Section 11.5 - Sponsored Content System
[REFERENCE] BIBLE-013 Section 13.10.5.4 - SponsoredCampaign Model

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// CREATE SPONSORED CAMPAIGN
// Requirement: Organization with paid plan
// ─────────────────────────────────────────────────────────────────────────────

const CreateSponsoredCampaignInputSchema = z.object({
  organizationId: z.string().cuid2(),
  name: z.string().min(2).max(200),
  contentType: z.enum(["POLL", "SURVEY"]),
  contentId: z.string().cuid2(),
  budget: z.number().positive().min(100),
  dailyBudgetLimit: z.number().positive().optional(),
  targeting: z.object({
    ageRange: z.object({
      min: z.number().int().min(13).max(100),
      max: z.number().int().min(13).max(100)
    }).optional(),
    genders: z.array(z.string()).optional(),
    countries: z.array(z.string()).optional(),
    regions: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional()
  }).optional(),
  schedule: z.object({
    startsAt: z.date(),
    endsAt: z.date()
  })
})

const CreateSponsoredCampaignOutputSchema = z.object({
  campaignId: z.string(),
  status: z.enum(["DRAFT", "PENDING_APPROVAL"]),
  estimatedReach: z.number(),
  estimatedCost: z.object({
    perImpression: z.number(),
    perParticipation: z.number()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GET CAMPAIGN ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

const GetCampaignAnalyticsInputSchema = z.object({
  campaignId: z.string().cuid2()
})

const GetCampaignAnalyticsOutputSchema = z.object({
  campaignId: z.string(),
  status: z.string(),
  budget: z.number(),
  spentAmount: z.number(),
  remainingBudget: z.number(),
  metrics: z.object({
    impressions: z.number(),
    clicks: z.number(),
    participations: z.number(),
    ctr: z.number(),
    participationRate: z.number(),
    costPerImpression: z.number(),
    costPerClick: z.number(),
    costPerParticipation: z.number()
  }),
  dailyBreakdown: z.array(z.object({
    date: z.date(),
    impressions: z.number(),
    clicks: z.number(),
    participations: z.number(),
    spent: z.number()
  })),
  demographicBreakdown: z.object({
    byAge: z.array(z.object({
      range: z.string(),
      percentage: z.number()
    })),
    byGender: z.array(z.object({
      gender: z.string(),
      percentage: z.number()
    })),
    byCountry: z.array(z.object({
      country: z.string(),
      percentage: z.number()
    }))
  }).optional()
})

// ─────────────────────────────────────────────────────────────────────────────
// PAUSE/RESUME CAMPAIGN
// ─────────────────────────────────────────────────────────────────────────────

const UpdateCampaignStatusInputSchema = z.object({
  campaignId: z.string().cuid2(),
  action: z.enum(["PAUSE", "RESUME", "CANCEL"])
})

const UpdateCampaignStatusOutputSchema = z.object({
  updated: z.boolean(),
  newStatus: z.string()
})

export {
  CreateSponsoredCampaignInputSchema,
  CreateSponsoredCampaignOutputSchema,
  GetCampaignAnalyticsInputSchema,
  GetCampaignAnalyticsOutputSchema,
  UpdateCampaignStatusInputSchema,
  UpdateCampaignStatusOutputSchema
}
```


## 14.14.5 Test Badge Actions (P-017)

[REFERENCE] BIBLE-006 Section 6.4.2a - Test Badge System
[REFERENCE] BIBLE-013 Section 13.10.5.5 - TestResultBadge Model

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// GET USER BADGES
// ─────────────────────────────────────────────────────────────────────────────

const GetUserBadgesInputSchema = z.object({
  userId: z.string().cuid2(),
  includeHidden: z.boolean().default(false)
})

const BadgeSchema = z.object({
  id: z.string(),
  testId: z.string(),
  testTitle: z.string(),
  resultType: z.enum(["AXIS", "CHARACTER", "SPECTRUM"]),
  resultTitle: z.string(),
  resultSubtitle: z.string().nullable(),
  resultImageUrl: z.string().url(),
  axisScores: z.array(z.object({
    axisId: z.string(),
    label: z.string(),
    score: z.number()
  })).nullable(),
  characterName: z.string().nullable(),
  matchPercentage: z.number().nullable(),
  spectrumScore: z.number().nullable(),
  spectrumLabel: z.string().nullable(),
  displayOnProfile: z.boolean(),
  pinnedPosition: z.number().nullable(),
  earnedAt: z.date()
})

const GetUserBadgesOutputSchema = z.object({
  badges: z.array(BadgeSchema),
  pinnedBadges: z.array(BadgeSchema),
  totalCount: z.number()
})

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE BADGE SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

const UpdateBadgeSettingsInputSchema = z.object({
  badgeId: z.string().cuid2(),
  displayOnProfile: z.boolean().optional(),
  pinnedPosition: z.number().int().min(1).max(5).nullable().optional()
})

const UpdateBadgeSettingsOutputSchema = z.object({
  updated: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// SHARE BADGE
// ─────────────────────────────────────────────────────────────────────────────

const ShareBadgeInputSchema = z.object({
  badgeId: z.string().cuid2(),
  platform: z.enum(["TWITTER", "FACEBOOK", "INSTAGRAM", "LINKEDIN", "COPY_LINK"])
})

const ShareBadgeOutputSchema = z.object({
  shareUrl: z.string().url(),
  imageUrl: z.string().url(),
  shareText: z.string()
})

export {
  GetUserBadgesInputSchema,
  BadgeSchema,
  GetUserBadgesOutputSchema,
  UpdateBadgeSettingsInputSchema,
  UpdateBadgeSettingsOutputSchema,
  ShareBadgeInputSchema,
  ShareBadgeOutputSchema
}
```


## 14.14.6 Comments Access Actions (P-016)

[REFERENCE] BIBLE-010 Section 10.1.2 - Discussion Access Rules
[REFERENCE] BIBLE-013 Section 13.10.5.6 - CommentsAccessRequest Model

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// CHECK COMMENTS ACCESS
// [DECISION P-016] Plus tier grants PULSE/COMMENTS access without participation
// ─────────────────────────────────────────────────────────────────────────────

const CheckCommentsAccessInputSchema = z.object({
  discussionId: z.string().cuid2()
})

const CheckCommentsAccessOutputSchema = z.object({
  hasAccess: z.boolean(),
  accessType: z.enum([
    "PARTICIPATED",
    "PLUS_SUBSCRIBER",
    "PREMIUM_SUBSCRIBER",
    "CONTENT_CREATOR",
    "NO_ACCESS"
  ]),
  canRequestAccess: z.boolean(),
  viewOnly: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST COMMENTS ACCESS
// ─────────────────────────────────────────────────────────────────────────────

const RequestCommentsAccessInputSchema = z.object({
  discussionId: z.string().cuid2(),
  reason: z.string().min(10).max(500)
})

const RequestCommentsAccessOutputSchema = z.object({
  requestId: z.string(),
  status: z.enum(["PENDING", "APPROVED", "DENIED"])
})

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW COMMENTS ACCESS REQUEST (Content Creator Only)
// ─────────────────────────────────────────────────────────────────────────────

const ReviewCommentsAccessInputSchema = z.object({
  requestId: z.string().cuid2(),
  action: z.enum(["APPROVE", "DENY"]),
  rejectionReason: z.string().max(200).optional()
})

const ReviewCommentsAccessOutputSchema = z.object({
  reviewed: z.boolean(),
  newStatus: z.enum(["APPROVED", "DENIED"])
})

export {
  CheckVoiceAccessInputSchema,
  CheckVoiceAccessOutputSchema,
  RequestVoiceAccessInputSchema,
  RequestVoiceAccessOutputSchema,
  ReviewVoiceAccessInputSchema,
  ReviewVoiceAccessOutputSchema
}
```


## 14.14.7 User Subscription Actions

[REFERENCE] BIBLE-005 Section 5.3 - Subscription Tiers
[REFERENCE] BIBLE-013 Section 13.10.5.7 - UserSubscription Model

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// GET SUBSCRIPTION STATUS
// ─────────────────────────────────────────────────────────────────────────────

const GetSubscriptionStatusInputSchema = z.object({})

const GetSubscriptionStatusOutputSchema = z.object({
  tier: z.enum(["FREE", "PLUS", "PREMIUM"]),
  status: z.enum(["ACTIVE", "PAST_DUE", "CANCELED", "INCOMPLETE", "TRIALING"]),
  currentPeriodEnd: z.date().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  features: z.object({
    pollsPerDay: z.number(),
    testsPerWeek: z.number(),
    voiceAccessWithoutParticipation: z.boolean(),
    targetAudienceSelection: z.boolean(),
    preTestForPolls: z.boolean(),
    livePollCreation: z.boolean(),
    customThemes: z.boolean(),
    prioritySupport: z.boolean()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CREATE CHECKOUT SESSION
// ─────────────────────────────────────────────────────────────────────────────

const CreateCheckoutSessionInputSchema = z.object({
  tier: z.enum(["PLUS", "PREMIUM"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY")
})

const CreateCheckoutSessionOutputSchema = z.object({
  checkoutUrl: z.string().url(),
  sessionId: z.string()
})

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL SUBSCRIPTION
// ─────────────────────────────────────────────────────────────────────────────

const CancelSubscriptionInputSchema = z.object({
  reason: z.string().max(500).optional(),
  cancelImmediately: z.boolean().default(false)
})

const CancelSubscriptionOutputSchema = z.object({
  canceled: z.boolean(),
  effectiveDate: z.date(),
  message: z.string()
})

// ─────────────────────────────────────────────────────────────────────────────
// GET BILLING PORTAL URL
// ─────────────────────────────────────────────────────────────────────────────

const GetBillingPortalUrlInputSchema = z.object({})

const GetBillingPortalUrlOutputSchema = z.object({
  portalUrl: z.string().url()
})

export {
  GetSubscriptionStatusInputSchema,
  GetSubscriptionStatusOutputSchema,
  CreateCheckoutSessionInputSchema,
  CreateCheckoutSessionOutputSchema,
  CancelSubscriptionInputSchema,
  CancelSubscriptionOutputSchema,
  GetBillingPortalUrlInputSchema,
  GetBillingPortalUrlOutputSchema
}
```


## 14.14.8 Locked Demographics Actions (P-012)

[REFERENCE] BIBLE-005 Section 5.2.3 - Locked Demographics System

```typescript
"use server"

import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE MUTABLE DEMOGRAPHICS
// [DECISION P-012] Only marital status and profession are mutable
// ─────────────────────────────────────────────────────────────────────────────

const UpdateMutableDemographicsInputSchema = z.object({
  maritalStatus: z.enum([
    "SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "PARTNERED", "OTHER"
  ]).optional(),
  profession: z.string().max(100).optional(),
  employmentStatus: z.enum([
    "EMPLOYED_FULL", "EMPLOYED_PART", "SELF_EMPLOYED",
    "UNEMPLOYED", "STUDENT", "RETIRED", "HOMEMAKER", "OTHER"
  ]).optional()
})

const UpdateMutableDemographicsOutputSchema = z.object({
  updated: z.boolean()
})

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST IMMUTABLE DEMOGRAPHIC CHANGE
// Requires support ticket with verification
// ─────────────────────────────────────────────────────────────────────────────

const RequestDemographicChangeInputSchema = z.object({
  field: z.enum([
    "birthYear", "birthMonth", "gender",
    "country", "region", "city", "educationLevel"
  ]),
  currentValue: z.string(),
  requestedValue: z.string(),
  reason: z.string().min(20).max(1000),
  supportingDocuments: z.array(z.string().url()).optional()
})

const RequestDemographicChangeOutputSchema = z.object({
  ticketId: z.string(),
  status: z.enum(["SUBMITTED", "PENDING_VERIFICATION"]),
  estimatedReviewTime: z.string()
})

export {
  UpdateMutableDemographicsInputSchema,
  UpdateMutableDemographicsOutputSchema,
  RequestDemographicChangeInputSchema,
  RequestDemographicChangeOutputSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 14 - API CONTRACTS (SERVER ACTIONS + ZOD)
# ══════════════════════════════════════════════════════════════════════════════
