# Error States

> Source: bible-016.md (Sections 16.1-16.6), bible-022.md (Section 22.10)

This document defines error handling patterns, error messages, UI error states, and recovery flows.


# ═══════════════════════════════════════════════════════════════════════════════
# ERROR HANDLING ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════════════════

## Error Classification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ERROR CLASSIFICATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CLIENT ERRORS (4xx)                                                │   │
│  │  • Validation errors (400)                                          │   │
│  │  • Authentication errors (401)                                      │   │
│  │  • Authorization errors (403)                                       │   │
│  │  • Not found errors (404)                                           │   │
│  │  • Conflict errors (409)                                            │   │
│  │  • Rate limit errors (429)                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SERVER ERRORS (5xx)                                                │   │
│  │  • Internal server errors (500)                                     │   │
│  │  • Service unavailable (503)                                        │   │
│  │  • Gateway timeout (504)                                            │   │
│  │  • Database errors                                                  │   │
│  │  • External service failures                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  BUSINESS LOGIC ERRORS                                              │   │
│  │  • Eligibility failures                                             │   │
│  │  • State transition errors                                          │   │
│  │  • Quota exceeded                                                   │   │
│  │  • Duplicate action attempts                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  RECOVERABLE VS NON-RECOVERABLE                                     │   │
│  │  • Recoverable: Retry possible (network, temporary failures)        │   │
│  │  • Non-recoverable: User action required (validation, auth)         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# ERROR CODE SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const ERROR_CODES = {
  // ─────────────────────────────────────────────────────────────────────────
  // VALIDATION ERRORS (VAL_xxx)
  // ─────────────────────────────────────────────────────────────────────────
  VAL_001: { message: "Geçersiz istek formatı", httpStatus: 400 },
  VAL_002: { message: "Zorunlu alan eksik", httpStatus: 400 },
  VAL_003: { message: "Geçersiz değer", httpStatus: 400 },
  VAL_004: { message: "Değer çok kısa", httpStatus: 400 },
  VAL_005: { message: "Değer çok uzun", httpStatus: 400 },
  VAL_006: { message: "Geçersiz format", httpStatus: 400 },
  VAL_007: { message: "Geçersiz tarih/saat", httpStatus: 400 },
  VAL_008: { message: "Geçersiz dosya türü", httpStatus: 400 },
  VAL_009: { message: "Dosya boyutu çok büyük", httpStatus: 400 },
  VAL_010: { message: "Geçersiz JSON formatı", httpStatus: 400 },

  // ─────────────────────────────────────────────────────────────────────────
  // AUTHENTICATION ERRORS (AUTH_xxx)
  // ─────────────────────────────────────────────────────────────────────────
  AUTH_001: { message: "Oturum açmanız gerekiyor", httpStatus: 401 },
  AUTH_002: { message: "Geçersiz kimlik bilgileri", httpStatus: 401 },
  AUTH_003: { message: "Oturum süresi doldu", httpStatus: 401 },
  AUTH_004: { message: "Token geçersiz", httpStatus: 401 },
  AUTH_005: { message: "Token iptal edilmiş", httpStatus: 401 },
  AUTH_006: { message: "Hesap doğrulanmamış", httpStatus: 401 },
  AUTH_007: { message: "İki faktörlü doğrulama gerekli", httpStatus: 401 },
  AUTH_008: { message: "Geçersiz doğrulama kodu", httpStatus: 401 },
  AUTH_009: { message: "Doğrulama kodu süresi dolmuş", httpStatus: 401 },
  AUTH_010: { message: "Çok fazla başarısız deneme", httpStatus: 401 },

  // ─────────────────────────────────────────────────────────────────────────
  // AUTHORIZATION ERRORS (AUTHZ_xxx)
  // ─────────────────────────────────────────────────────────────────────────
  AUTHZ_001: { message: "Bu işlem için yetkiniz yok", httpStatus: 403 },
  AUTHZ_002: { message: "Bu kaynağa erişiminiz yok", httpStatus: 403 },
  AUTHZ_003: { message: "Hesabınız askıya alınmış", httpStatus: 403 },
  AUTHZ_004: { message: "Hesabınız yasaklanmış", httpStatus: 403 },
  AUTHZ_005: { message: "Premium üyelik gerekli", httpStatus: 403 },
  AUTHZ_006: { message: "Organizasyon üyeliği gerekli", httpStatus: 403 },
  AUTHZ_007: { message: "İçerik sahibi değilsiniz", httpStatus: 403 },
  AUTHZ_008: { message: "Bu kullanıcı tarafından engellendiniz", httpStatus: 403 },
  AUTHZ_009: { message: "IP adresiniz engellenmiş", httpStatus: 403 },
  AUTHZ_010: { message: "Bu özellik bölgenizde kullanılamıyor", httpStatus: 403 },

  // ─────────────────────────────────────────────────────────────────────────
  // NOT FOUND ERRORS (NF_xxx)
  // ─────────────────────────────────────────────────────────────────────────
  NF_001: { message: "Kullanıcı bulunamadı", httpStatus: 404 },
  NF_002: { message: "İçerik bulunamadı", httpStatus: 404 },
  NF_003: { message: "Anket bulunamadı", httpStatus: 404 },
  NF_004: { message: "Araştırma bulunamadı", httpStatus: 404 },
  NF_005: { message: "Test bulunamadı", httpStatus: 404 },
  NF_006: { message: "Yorum bulunamadı", httpStatus: 404 },
  NF_007: { message: "Organizasyon bulunamadı", httpStatus: 404 },
  NF_008: { message: "Davetiye bulunamadı", httpStatus: 404 },
  NF_009: { message: "Bildirim bulunamadı", httpStatus: 404 },
  NF_010: { message: "Kaynak silinmiş", httpStatus: 404 },

  // ─────────────────────────────────────────────────────────────────────────
  // CONFLICT ERRORS (CONF_xxx)
  // ─────────────────────────────────────────────────────────────────────────
  CONF_001: { message: "Bu e-posta adresi zaten kullanılıyor", httpStatus: 409 },
  CONF_002: { message: "Bu kullanıcı adı zaten kullanılıyor", httpStatus: 409 },
  CONF_003: { message: "Bu telefon numarası zaten kullanılıyor", httpStatus: 409 },
  CONF_004: { message: "Bu ankete zaten katıldınız", httpStatus: 409 },
  CONF_005: { message: "Bu kullanıcıyı zaten takip ediyorsunuz", httpStatus: 409 },
  CONF_006: { message: "Zaten oy verdiniz", httpStatus: 409 },
  CONF_007: { message: "Kaynak başka biri tarafından değiştirilmiş", httpStatus: 409 },
  CONF_008: { message: "Slug zaten kullanılıyor", httpStatus: 409 },
  CONF_009: { message: "Davet zaten gönderilmiş", httpStatus: 409 },
  CONF_010: { message: "İşlem zaten tamamlanmış", httpStatus: 409 },

  // ─────────────────────────────────────────────────────────────────────────
  // RATE LIMIT ERRORS (RATE_xxx)
  // ─────────────────────────────────────────────────────────────────────────
  RATE_001: { message: "Çok fazla istek gönderdiniz, lütfen bekleyin", httpStatus: 429 },
  RATE_002: { message: "Günlük istek limitinize ulaştınız", httpStatus: 429 },
  RATE_003: { message: "Çok fazla giriş denemesi yaptınız", httpStatus: 429 },
  RATE_004: { message: "Çok fazla içerik oluşturdunuz", httpStatus: 429 },
  RATE_005: { message: "Çok fazla yorum yazdınız", httpStatus: 429 },

  // ─────────────────────────────────────────────────────────────────────────
  // BUSINESS LOGIC ERRORS (BIZ_xxx)
  // ─────────────────────────────────────────────────────────────────────────
  BIZ_001: { message: "Anket süresi dolmuş", httpStatus: 400 },
  BIZ_002: { message: "Anket henüz başlamamış", httpStatus: 400 },
  BIZ_003: { message: "Anket duraklatılmış", httpStatus: 400 },
  BIZ_004: { message: "Katılım kriterleri karşılanmıyor", httpStatus: 400 },
  BIZ_005: { message: "Kota dolmuş", httpStatus: 400 },
  BIZ_006: { message: "Tartışma kilitli", httpStatus: 400 },
  BIZ_007: { message: "Tartışmaya erişim izniniz yok", httpStatus: 400 },
  BIZ_008: { message: "Düzenleme süresi dolmuş", httpStatus: 400 },
  BIZ_009: { message: "Bu durumda bu işlem yapılamaz", httpStatus: 400 },
  BIZ_010: { message: "Deneme hakkınız kalmadı", httpStatus: 400 },
  BIZ_011: { message: "Minimum soru sayısına ulaşılmadı", httpStatus: 400 },
  BIZ_012: { message: "Maksimum soru sayısı aşıldı", httpStatus: 400 },
  BIZ_013: { message: "Geçersiz hedef kitle tanımı", httpStatus: 400 },
  BIZ_014: { message: "Dikkat kontrolü başarısız", httpStatus: 400 },
  BIZ_015: { message: "Yanıt kalitesi yetersiz", httpStatus: 400 },

  // ─────────────────────────────────────────────────────────────────────────
  // SERVER ERRORS (SRV_xxx)
  // ─────────────────────────────────────────────────────────────────────────
  SRV_001: { message: "Beklenmeyen bir hata oluştu", httpStatus: 500 },
  SRV_002: { message: "Veritabanı hatası", httpStatus: 500 },
  SRV_003: { message: "Harici servis hatası", httpStatus: 500 },
  SRV_004: { message: "Dosya yükleme hatası", httpStatus: 500 },
  SRV_005: { message: "E-posta gönderim hatası", httpStatus: 500 },
  SRV_006: { message: "Bildirim gönderim hatası", httpStatus: 500 },
  SRV_007: { message: "Servis geçici olarak kullanılamıyor", httpStatus: 503 },
  SRV_008: { message: "Bakım modu aktif", httpStatus: 503 },
  SRV_009: { message: "İstek zaman aşımına uğradı", httpStatus: 504 },
  SRV_010: { message: "Kaynak kilitli, lütfen tekrar deneyin", httpStatus: 503 },

  // ─────────────────────────────────────────────────────────────────────────
  // FRAUD/SECURITY ERRORS (SEC_xxx)
  // ─────────────────────────────────────────────────────────────────────────
  SEC_001: { message: "Şüpheli aktivite tespit edildi", httpStatus: 403 },
  SEC_002: { message: "Bot aktivitesi tespit edildi", httpStatus: 403 },
  SEC_003: { message: "VPN/Proxy kullanımı tespit edildi", httpStatus: 403 },
  SEC_004: { message: "Cihaz güvenilir değil", httpStatus: 403 },
  SEC_005: { message: "Coğrafi konum uyumsuzluğu", httpStatus: 403 },
  SEC_006: { message: "CSRF token geçersiz", httpStatus: 403 },
  SEC_007: { message: "İmza doğrulaması başarısız", httpStatus: 403 },
  SEC_008: { message: "Replay saldırısı tespit edildi", httpStatus: 403 }
} as const

type ErrorCode = keyof typeof ERROR_CODES

export { ERROR_CODES }
export type { ErrorCode }
```


# ═══════════════════════════════════════════════════════════════════════════════
# ERROR RESPONSE STRUCTURE
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
import { z } from "zod"

const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
    details: z.record(z.unknown()).optional(),
    timestamp: z.string().datetime(),
    requestId: z.string(),
    retryable: z.boolean(),
    retryAfter: z.number().optional()
  })
})

type ErrorResponse = z.infer<typeof ErrorResponseSchema>

function createErrorResponse(
  code: ErrorCode,
  requestId: string,
  options?: {
    field?: string
    details?: Record<string, unknown>
    retryAfter?: number
  }
): ErrorResponse {
  const errorDef = ERROR_CODES[code]
  const retryable = errorDef.httpStatus >= 500 || code.startsWith("RATE_")

  return {
    success: false,
    error: {
      code,
      message: errorDef.message,
      field: options?.field,
      details: options?.details,
      timestamp: new Date().toISOString(),
      requestId,
      retryable,
      retryAfter: options?.retryAfter
    }
  }
}

export { ErrorResponseSchema, createErrorResponse }
export type { ErrorResponse }
```


# ═══════════════════════════════════════════════════════════════════════════════
# UI ERROR STATE PATTERNS
# ═══════════════════════════════════════════════════════════════════════════════

## Common Error States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ERROR & EMPTY STATES                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  404 - NOT FOUND                                                                │
│  ════════════════                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          (Search Icon)                                   │   │
│  │                                                                          │   │
│  │                   Page Not Found                                         │   │
│  │                                                                          │   │
│  │     The content you're looking for doesn't exist or                      │   │
│  │     has been removed.                                                    │   │
│  │                                                                          │   │
│  │     [Go to Feed]    [Explore Content]                                    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  POLL ENDED                                                                     │
│  ══════════                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          (Clock Icon)                                    │   │
│  │                                                                          │   │
│  │                   Poll Has Ended                                         │   │
│  │                                                                          │   │
│  │     This poll closed on January 15, 2026.                                │   │
│  │     View the final results below.                                        │   │
│  │                                                                          │   │
│  │     [View Results]                                                       │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  NO INTERNET                                                                    │
│  ═══════════                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          (Wifi Icon)                                     │   │
│  │                                                                          │   │
│  │                   No Internet Connection                                 │   │
│  │                                                                          │   │
│  │     Check your connection and try again.                                 │   │
│  │                                                                          │   │
│  │     [Retry]                                                              │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  EMPTY FEED                                                                     │
│  ══════════                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          (Empty Inbox Icon)                              │   │
│  │                                                                          │   │
│  │                   Your Feed is Empty                                     │   │
│  │                                                                          │   │
│  │     Follow some creators or explore trending                             │   │
│  │     content to get started.                                              │   │
│  │                                                                          │   │
│  │     [Explore]    [Find People to Follow]                                 │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  RATE LIMITED                                                                   │
│  ════════════                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          (Hourglass Icon)                                │   │
│  │                                                                          │   │
│  │                   Too Many Requests                                      │   │
│  │                                                                          │   │
│  │     You've reached your daily limit.                                     │   │
│  │     Upgrade to create more content.                                      │   │
│  │                                                                          │   │
│  │     [Upgrade to Plus]    [Learn More]                                    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  PRE-TEST FAILED                                                                │
│  ════════════════                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                          (Target Icon)                                   │   │
│  │                                                                          │   │
│  │              Thanks for Your Interest!                                   │   │
│  │                                                                          │   │
│  │     This survey is looking for a specific audience that                  │   │
│  │     doesn't match your profile.                                          │   │
│  │                                                                          │   │
│  │     Don't worry - there are many other polls and tests                   │   │
│  │     waiting for you!                                                     │   │
│  │                                                                          │   │
│  │     [Explore More Content]                                               │   │
│  │                                                                          │   │
│  │     NOTE: Pre-test failure messages are POLITE                           │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION EDGE CASES
# ═══════════════════════════════════════════════════════════════════════════════

## Registration Edge Cases

```typescript
const REGISTRATION_EDGE_CASES = {
  DUPLICATE_EMAIL_DURING_REGISTRATION: {
    id: "REG_EC_001",
    scenario: "User starts registration, another user registers same email before completion",
    detection: "Unique constraint violation on email",
    handling: "Show error, suggest login or password reset",
    errorCode: "CONF_001"
  },

  EMAIL_CASE_SENSITIVITY: {
    id: "REG_EC_002",
    scenario: "User@Example.com vs user@example.com",
    handling: "Normalize to lowercase before storage and comparison",
    implementation: "email.toLowerCase().trim()"
  },

  UNICODE_USERNAME: {
    id: "REG_EC_003",
    scenario: "Username with unicode lookalikes (е vs e, а vs a)",
    handling: "Normalize unicode, reject confusable characters",
    implementation: "NFKC normalization + confusable detection"
  },

  DISPOSABLE_EMAIL: {
    id: "REG_EC_004",
    scenario: "User tries to register with tempmail.com etc",
    detection: "Check against disposable email domain list",
    handling: "Reject with clear message",
    errorCode: "VAL_006",
    customMessage: "Geçici e-posta adresleri kabul edilmiyor"
  },

  REGISTRATION_TIMEOUT: {
    id: "REG_EC_005",
    scenario: "User starts registration but never completes verification",
    handling: "Delete unverified accounts after 7 days",
    cleanupJob: "daily at 03:00 UTC"
  },

  CONCURRENT_REGISTRATION: {
    id: "REG_EC_006",
    scenario: "Same email submitted simultaneously from different sessions",
    handling: "Use database unique constraint, first wins",
    implementation: "Catch unique violation, return CONF_001"
  },

  WEAK_PASSWORD_VARIANTS: {
    id: "REG_EC_007",
    scenario: "Password is 'Password1!' or 'Qwerty123'",
    detection: "Check against common password list",
    handling: "Reject with specific guidance",
    listSize: 100000
  }
}

export { REGISTRATION_EDGE_CASES }
```


## Login Edge Cases

```typescript
const LOGIN_EDGE_CASES = {
  BRUTE_FORCE_ATTACK: {
    id: "LOGIN_EC_001",
    scenario: "Multiple failed login attempts",
    detection: "Track failed attempts per IP and per account",
    handling: {
      perAccount: { threshold: 5, lockoutMinutes: 15 },
      perIP: { threshold: 20, lockoutMinutes: 60 },
      progressive: "Lockout duration doubles with each subsequent lockout"
    },
    errorCode: "AUTH_010"
  },

  CREDENTIAL_STUFFING: {
    id: "LOGIN_EC_002",
    scenario: "Automated login attempts with leaked credentials",
    detection: "Unusual login patterns, many accounts from same IP",
    handling: "CAPTCHA challenge, IP reputation check",
    mitigation: "Rate limit by IP, require CAPTCHA after 3 failures"
  },

  SESSION_FIXATION: {
    id: "LOGIN_EC_003",
    scenario: "Attacker fixes session ID before user logs in",
    handling: "Regenerate session ID on successful login",
    implementation: "Always create new session token on authentication"
  },

  CONCURRENT_SESSIONS: {
    id: "LOGIN_EC_004",
    scenario: "User logs in from multiple devices",
    handling: "Allow up to 5 concurrent sessions",
    notification: "Notify user of new device login",
    option: "Setting to terminate other sessions on new login"
  },

  ACCOUNT_TAKEOVER_DETECTION: {
    id: "LOGIN_EC_005",
    scenario: "Login from unusual location/device",
    detection: {
      newDevice: true,
      unusualLocation: "Distance > 1000km in < 1 hour",
      unusualTime: "Outside normal activity hours"
    },
    handling: "Email notification, optional 2FA challenge"
  },

  DORMANT_ACCOUNT_LOGIN: {
    id: "LOGIN_EC_006",
    scenario: "User logs into account marked as DORMANT",
    handling: "Reactivate account, show welcome back message",
    stateTransition: "DORMANT -> ACTIVE"
  },

  SUSPENDED_ACCOUNT_LOGIN: {
    id: "LOGIN_EC_007",
    scenario: "Suspended user tries to login",
    handling: "Allow login but show restricted view",
    showInfo: "Suspension reason and end date",
    errorCode: "AUTHZ_003"
  }
}

export { LOGIN_EDGE_CASES }
```


## Session Edge Cases

```typescript
const SESSION_EDGE_CASES = {
  TOKEN_REFRESH_RACE: {
    id: "SESS_EC_001",
    scenario: "Multiple tabs refresh token simultaneously",
    handling: "Accept old token for 30 seconds after refresh",
    implementation: "Grace period for recent refresh tokens"
  },

  SESSION_HIJACKING: {
    id: "SESS_EC_002",
    scenario: "Session token stolen and used from different device",
    detection: "Device fingerprint mismatch, IP change",
    handling: "Invalidate session, require re-authentication",
    notification: "Security alert to user"
  },

  SESSION_EXPIRY_MID_ACTION: {
    id: "SESS_EC_003",
    scenario: "Session expires while user is filling long form",
    handling: "Client-side session monitoring, auto-refresh",
    ux: "Save draft before redirecting to login"
  },

  LOGOUT_FROM_ALL_DEVICES: {
    id: "SESS_EC_004",
    scenario: "User requests logout from all devices",
    handling: "Invalidate all refresh tokens, increment token version",
    implementation: "tokenVersion field on User, check on each request"
  },

  REMEMBER_ME_SECURITY: {
    id: "SESS_EC_005",
    scenario: "Long-lived remember me token on shared computer",
    handling: {
      maxAge: "30 days",
      requireReauth: "For sensitive operations",
      deviceBinding: "Bind to device fingerprint"
    }
  }
}

export { SESSION_EDGE_CASES }
```


# ═══════════════════════════════════════════════════════════════════════════════
# CONTENT EDGE CASES
# ═══════════════════════════════════════════════════════════════════════════════

## Poll Edge Cases

```typescript
const POLL_EDGE_CASES = {
  POLL_ENDS_DURING_VOTE: {
    id: "POLL_EC_001",
    scenario: "User starts voting, poll ends before submission",
    detection: "Check poll status on vote submission",
    handling: "Reject vote, show poll ended message",
    ux: "Display results instead",
    errorCode: "BIZ_001"
  },

  SIMULTANEOUS_VOTES: {
    id: "POLL_EC_002",
    scenario: "Same user submits vote from multiple tabs/devices",
    detection: "Unique constraint on (pollId, participantHash)",
    handling: "First vote wins, subsequent rejected",
    errorCode: "CONF_004"
  },

  POLL_DELETED_AFTER_VOTE: {
    id: "POLL_EC_003",
    scenario: "Poll deleted while user is viewing results",
    handling: "Soft delete, show 'content no longer available'",
    dataRetention: "Keep responses for 30 days"
  },

  OPTION_OVERFLOW: {
    id: "POLL_EC_004",
    scenario: "Option vote count exceeds INT32_MAX",
    prevention: "Use BigInt for vote counts",
    implementation: "PostgreSQL BIGINT, JavaScript BigInt"
  },

  EMPTY_POLL_RESULTS: {
    id: "POLL_EC_005",
    scenario: "Poll ends with 0 participants",
    handling: "Show 'No participation' message",
    reliabilityScore: null,
    discussion: "Do not open"
  },

  CREATOR_DELETES_ACTIVE_POLL: {
    id: "POLL_EC_006",
    scenario: "Creator tries to delete poll with participants",
    handling: "Soft delete, preserve responses",
    notification: "Notify participants if discussion was active"
  },

  TIMEZONE_EDGE_CASES: {
    id: "POLL_EC_007",
    scenario: "Poll ends at 23:59:59.999 in one timezone",
    handling: "Store all times in UTC, convert for display",
    precision: "Second precision, round up on edge"
  },

  RAPID_OPTION_CHANGES: {
    id: "POLL_EC_008",
    scenario: "Creator modifies options while poll is active",
    handling: "Prevent option changes once poll has votes",
    allowedChanges: ["title", "description", "endsAt (extension only)"]
  }
}

export { POLL_EDGE_CASES }
```


## Survey Edge Cases

```typescript
const SURVEY_EDGE_CASES = {
  SURVEY_TIMEOUT: {
    id: "SURV_EC_001",
    scenario: "User abandons survey mid-completion",
    detection: "No activity for 1 hour",
    handling: "Mark as ABANDONED, save partial responses",
    retention: "Keep partial data for analysis"
  },

  INVITATION_REUSE: {
    id: "SURV_EC_002",
    scenario: "User tries to use invitation token twice",
    detection: "Token already marked as used",
    handling: "Show already completed message",
    errorCode: "CONF_010"
  },

  DISPLAY_LOGIC_LOOP: {
    id: "SURV_EC_003",
    scenario: "Display logic creates infinite loop",
    prevention: "Validate logic graph on survey creation",
    runtime: "Max 100 iterations, then error",
    errorCode: "SRV_001",
    customMessage: "Anket yapılandırma hatası"
  },

  SKIP_LOGIC_ORPHANS: {
    id: "SURV_EC_004",
    scenario: "Skip logic skips required questions",
    handling: "Skipped required questions treated as answered",
    validation: "Warn creator during setup"
  },

  PIPING_MISSING_DATA: {
    id: "SURV_EC_005",
    scenario: "Piped question references skipped answer",
    handling: "Show placeholder or skip piped content",
    placeholder: "[yanıt verilmedi]"
  },

  QUOTA_RACE_CONDITION: {
    id: "SURV_EC_006",
    scenario: "Multiple users complete survey at quota limit",
    handling: "Accept slight overquota, process sequentially",
    tolerance: "Allow up to 5% overquota"
  },

  ATTENTION_CHECK_ALL_FAIL: {
    id: "SURV_EC_007",
    scenario: "User fails all attention checks",
    handling: "Disqualify response, mark as low quality",
    notification: "Inform user of disqualification",
    errorCode: "BIZ_014"
  },

  BROWSER_BACK_BUTTON: {
    id: "SURV_EC_008",
    scenario: "User uses browser back button during survey",
    handling: "Restore previous state, don't duplicate responses",
    implementation: "Track current position server-side"
  },

  FILE_UPLOAD_FAILURE: {
    id: "SURV_EC_009",
    scenario: "File upload fails during survey submission",
    handling: "Allow retry, don't lose other answers",
    fallback: "Save text responses, mark file as pending"
  }
}

export { SURVEY_EDGE_CASES }
```


## Test Edge Cases

```typescript
const TEST_EDGE_CASES = {
  TIME_LIMIT_EXPIRY: {
    id: "TEST_EC_001",
    scenario: "Test time limit expires during submission",
    handling: "Auto-submit answered questions",
    graceSeconds: 30,
    scoring: "Score only submitted answers"
  },

  TAB_SWITCH_DETECTION: {
    id: "TEST_EC_002",
    scenario: "User switches tabs during proctored test",
    detection: "visibilitychange event",
    handling: "Log warning, flag after 3 occurrences",
    threshold: 3,
    action: "Warn user, optionally auto-submit"
  },

  NETWORK_DISCONNECT: {
    id: "TEST_EC_003",
    scenario: "Network disconnects during test",
    handling: "Local answer caching, sync on reconnect",
    implementation: "IndexedDB for offline storage",
    timeout: "Continue timer, extend grace period"
  },

  SCORE_CALCULATION_EDGE: {
    id: "TEST_EC_004",
    scenario: "All answers wrong or all correct",
    handling: "Valid scores, proper percentage display",
    minScore: 0,
    maxScore: "Sum of all question points"
  },

  PARTIAL_CORRECT_ANSWERS: {
    id: "TEST_EC_005",
    scenario: "Multiple choice with partial correct selections",
    scoring: {
      allCorrect: "Full points",
      partialCorrect: "Proportional points",
      anyWrong: "Zero points (configurable)"
    }
  },

  DUPLICATE_ATTEMPT: {
    id: "TEST_EC_006",
    scenario: "User tries to start new attempt before previous completes",
    handling: "Return existing in-progress attempt",
    errorCode: "CONF_010"
  },

  RESULT_CATEGORY_GAP: {
    id: "TEST_EC_007",
    scenario: "Score falls between defined categories",
    prevention: "Validate categories cover 0-100% on creation",
    fallback: "Assign to nearest category"
  }
}

export { TEST_EDGE_CASES }
```


# ═══════════════════════════════════════════════════════════════════════════════
# SOCIAL INTERACTION EDGE CASES
# ═══════════════════════════════════════════════════════════════════════════════

## Comment Edge Cases

```typescript
const COMMENT_EDGE_CASES = {
  PARENT_DELETED_BEFORE_REPLY: {
    id: "CMT_EC_001",
    scenario: "Parent comment deleted while user writes reply",
    detection: "Check parent exists on submission",
    handling: "Convert to root comment or reject",
    preference: "Reject with message",
    errorCode: "NF_006"
  },

  DISCUSSION_LOCKED_WHILE_TYPING: {
    id: "CMT_EC_002",
    scenario: "Discussion locked while user composing comment",
    detection: "Check discussion status on submission",
    handling: "Reject, show locked message",
    errorCode: "BIZ_006"
  },

  EDIT_WINDOW_RACE: {
    id: "CMT_EC_003",
    scenario: "User starts edit, window expires before save",
    detection: "Check edit window on save",
    handling: "Reject with window expired message",
    errorCode: "BIZ_008"
  },

  SELF_REPLY: {
    id: "CMT_EC_004",
    scenario: "User replies to their own comment",
    handling: "Allow, but no notification to self"
  },

  MENTION_BLOCKED_USER: {
    id: "CMT_EC_005",
    scenario: "User mentions someone who blocked them",
    handling: "Allow mention, but no notification sent",
    visibility: "Mentioned user won't see it"
  },

  MAX_DEPTH_REPLY: {
    id: "CMT_EC_006",
    scenario: "Reply to comment at max depth",
    handling: "Attach reply to parent of max-depth comment",
    maxDepth: 3
  },

  RAPID_COMMENTING: {
    id: "CMT_EC_007",
    scenario: "User posts many comments quickly",
    detection: "Rate limit check",
    handling: "Cooldown period, show timer",
    errorCode: "RATE_005"
  },

  COMMENT_WITH_ONLY_MENTIONS: {
    id: "CMT_EC_008",
    scenario: "Comment contains only @mentions",
    handling: "Reject as spam-like behavior",
    errorCode: "VAL_003",
    customMessage: "Yorum sadece bahsetmelerden oluşamaz"
  },

  ORPHANED_VOTES: {
    id: "CMT_EC_009",
    scenario: "Comment deleted after receiving votes",
    handling: "Soft delete preserves vote count for author stats",
    display: "[silindi]"
  }
}

export { COMMENT_EDGE_CASES }
```


## Follow Edge Cases

```typescript
const FOLLOW_EDGE_CASES = {
  FOLLOW_LIMIT_REACHED: {
    id: "FOLLOW_EC_001",
    scenario: "User at max following limit tries to follow",
    handling: "Reject with limit message",
    errorCode: "BIZ_005",
    customMessage: "Maksimum takip limitine ulaştınız (5000)"
  },

  MUTUAL_BLOCK_FOLLOW: {
    id: "FOLLOW_EC_002",
    scenario: "User tries to follow someone they blocked",
    handling: "Require unblock first",
    errorCode: "BIZ_009"
  },

  FOLLOW_DELETED_USER: {
    id: "FOLLOW_EC_003",
    scenario: "User tries to follow deleted account",
    handling: "Return not found",
    errorCode: "NF_001"
  },

  PRIVATE_ACCOUNT_FOLLOW: {
    id: "FOLLOW_EC_004",
    scenario: "Follow request to private account",
    handling: "Create pending follow request",
    notification: "Notify account owner"
  },

  FOLLOW_REQUEST_SPAM: {
    id: "FOLLOW_EC_005",
    scenario: "User sends many follow requests rapidly",
    handling: "Rate limit: 100/hour",
    errorCode: "RATE_001"
  },

  UNFOLLOW_PENDING_REQUEST: {
    id: "FOLLOW_EC_006",
    scenario: "User cancels pending follow request",
    handling: "Delete pending request",
    notification: "No notification to target"
  }
}

export { FOLLOW_EDGE_CASES }
```


# ═══════════════════════════════════════════════════════════════════════════════
# DATA CONSISTENCY EDGE CASES
# ═══════════════════════════════════════════════════════════════════════════════

## Race Conditions

```typescript
const RACE_CONDITION_CASES = {
  COUNTER_UPDATE_RACE: {
    id: "RACE_001",
    scenario: "Multiple users update same counter simultaneously",
    example: "participantCount, voteCount, commentCount",
    handling: "Use atomic increment operations",
    implementation: "UPDATE ... SET count = count + 1"
  },

  OPTIMISTIC_LOCKING_FAILURE: {
    id: "RACE_002",
    scenario: "Two users edit same resource",
    detection: "Version/updatedAt mismatch",
    handling: "Reject second update, show conflict",
    errorCode: "CONF_007"
  },

  HOT_SCORE_CALCULATION_RACE: {
    id: "RACE_003",
    scenario: "Multiple processes recalculate hot score",
    handling: "Use distributed lock or last-write-wins",
    implementation: "Redis SETNX for lock"
  },

  DOUBLE_SUBMISSION: {
    id: "RACE_004",
    scenario: "Form submitted twice (double click)",
    prevention: {
      client: "Disable button on submit",
      server: "Idempotency key check"
    },
    implementation: "Store idempotency key in Redis for 1 hour"
  },

  CASCADING_DELETE_RACE: {
    id: "RACE_005",
    scenario: "Related data created during soft delete",
    handling: "Transaction isolation level SERIALIZABLE",
    alternative: "Check deleted_at on all writes"
  }
}

export { RACE_CONDITION_CASES }
```


## Data Integrity Cases

```typescript
const DATA_INTEGRITY_CASES = {
  ORPHANED_RESPONSES: {
    id: "INT_001",
    scenario: "Poll deleted but responses exist",
    prevention: "Soft delete only, cascade soft delete to responses",
    cleanup: "Background job marks orphaned responses"
  },

  CIRCULAR_REFERENCE: {
    id: "INT_002",
    scenario: "Category parent references child",
    prevention: "Validate hierarchy on update",
    implementation: "Recursive CTE to check cycles"
  },

  NULL_FOREIGN_KEY: {
    id: "INT_003",
    scenario: "Referenced user deleted",
    handling: "SET NULL on delete for non-critical FKs",
    display: "Show [silinen kullanıcı]"
  },

  AGGREGATE_DRIFT: {
    id: "INT_004",
    scenario: "Cached counts drift from actual",
    example: "participantCount != actual response count",
    handling: "Periodic reconciliation job",
    schedule: "Daily at 04:00 UTC"
  },

  HASH_COLLISION: {
    id: "INT_005",
    scenario: "Two users get same participant hash",
    probability: "Negligible with SHA-256",
    handling: "Add contentId to make hash unique per content",
    implementation: "HMAC-SHA256(userId + contentId, salt)"
  },

  TIMEZONE_DATA_MISMATCH: {
    id: "INT_006",
    scenario: "Client sends local time, server expects UTC",
    handling: "Always transmit ISO 8601 with timezone",
    storage: "Store as UTC, convert on display"
  }
}

export { DATA_INTEGRITY_CASES }
```


# ═══════════════════════════════════════════════════════════════════════════════
# EXTERNAL SERVICE EDGE CASES
# ═══════════════════════════════════════════════════════════════════════════════

## Email Service Edge Cases

```typescript
const EMAIL_SERVICE_EDGE_CASES = {
  SMTP_TIMEOUT: {
    id: "EMAIL_EC_001",
    scenario: "Email provider times out",
    handling: "Queue for retry, max 3 attempts",
    retryDelays: [60, 300, 900],
    fallback: "Log and alert, don't block user action"
  },

  BOUNCE_HANDLING: {
    id: "EMAIL_EC_002",
    scenario: "Email bounces (invalid address)",
    handling: {
      softBounce: "Retry 3 times over 24 hours",
      hardBounce: "Mark email as invalid, notify user"
    }
  },

  SPAM_CLASSIFICATION: {
    id: "EMAIL_EC_003",
    scenario: "Emails going to spam",
    prevention: {
      dkim: true,
      spf: true,
      dmarc: true,
      warmup: "Gradual volume increase"
    }
  },

  RATE_LIMIT_EXCEEDED: {
    id: "EMAIL_EC_004",
    scenario: "Email provider rate limit hit",
    handling: "Queue overflow to secondary provider",
    monitoring: "Alert on queue depth"
  }
}

export { EMAIL_SERVICE_EDGE_CASES }
```


## Live Poll Edge Cases

```typescript
const LIVE_POLL_EDGE_CASES = {
  VOTE_DURING_CLOSE: {
    id: "LIVE_001",
    scenario: "User submits vote at exact moment poll closes",
    handling: "Accept vote if serverTimestamp <= closedAt",
    graceWindow: "0ms - strict cutoff at closedAt timestamp"
  },

  NETWORK_PARTITION: {
    id: "LIVE_002",
    scenario: "Network split - 50 participants lose connection mid-vote",
    handling: "Reconnection with message replay",
    dataConsistency: "Server is authoritative source of truth"
  },

  JOIN_CODE_COLLISION: {
    id: "LIVE_003",
    scenario: "Two simultaneous sessions get same 6-char code",
    probability: "1 in 1 billion (32^6 combinations)",
    prevention: "Generate with uniqueness check, max 10 retries"
  },

  WAITING_ROOM_STARVATION: {
    id: "LIVE_004",
    scenario: "Early joiners never leave, waiting room users time out",
    handling: "Fair queue with position tracking",
    maxWaitTime: "5 minutes (300000ms)",
    onTimeout: "Notify user, offer to rejoin queue or explore other content"
  },

  HOST_DISCONNECTS_MID_SESSION: {
    id: "LIVE_005",
    scenario: "Poll creator loses connection during active session",
    handling: "Auto-pause after 60s host disconnect",
    recovery: "Host can resume within 10 minutes, else auto-end"
  },

  PERCENTAGE_ROUNDING_INCONSISTENCY: {
    id: "LIVE_006",
    scenario: "3 options: 33.33%, 33.33%, 33.34% - sum > 100 on display",
    handling: "Largest remainder method",
    display: "Show floor() values, adjust highest remainder"
  },

  RAPID_VOTE_CHANGE: {
    id: "LIVE_007",
    scenario: "User rapidly changes vote multiple times",
    handling: "Allow vote change within 2-second grace period only",
    rateLimit: "Max 1 vote change per 2 seconds",
    finalVote: "Last vote within grace period is counted"
  }
}

export { LIVE_POLL_EDGE_CASES }
```
