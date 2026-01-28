# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 16                                    █
# █                    EDGE CASES & ERROR HANDLING                             █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 16.1 ERROR HANDLING ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 16.1.1 Error Classification

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

## 16.1.2 Error Code System

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

## 16.1.3 Error Response Structure

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




# ══════════════════════════════════════════════════════════════════════════════
# 16.2 AUTHENTICATION EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## 16.2.1 Registration Edge Cases

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

## 16.2.2 Login Edge Cases

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

## 16.2.3 Session Edge Cases

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




# ══════════════════════════════════════════════════════════════════════════════
# 16.3 CONTENT EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## 16.3.1 Poll Edge Cases

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

## 16.3.2 Survey Edge Cases

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

## 16.3.3 Test Edge Cases

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




# ══════════════════════════════════════════════════════════════════════════════
# 16.4 SOCIAL INTERACTION EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## 16.4.1 Comment Edge Cases

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

## 16.4.2 Follow Edge Cases

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




# ══════════════════════════════════════════════════════════════════════════════
# 16.5 DATA CONSISTENCY EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## 16.5.1 Race Conditions

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

## 16.5.1.1 Live Poll Critical Edge Cases

```typescript
// [REFERENCE: BIBLE-006 Section 6.4.4, BIBLE-023 Section 23.17.1.1]

const LIVE_POLL_EDGE_CASES = {
  VOTE_DURING_CLOSE: {
    id: "LIVE_001",
    scenario: "User submits vote at exact moment poll closes",
    handling: "Accept vote if serverTimestamp <= closedAt",
    implementation: `
      // In vote processor:
      if (vote.serverTimestamp <= poll.closedAt) {
        acceptVote(vote)
      } else {
        rejectVote(vote, "POLL_CLOSED")
      }
    `,
    graceWindow: "0ms - strict cutoff at closedAt timestamp"
  },

  NETWORK_PARTITION: {
    id: "LIVE_002",
    scenario: "Network split - 50 participants lose connection mid-vote",
    handling: "Reconnection with message replay",
    implementation: `
      // On reconnect:
      1. Client sends last known sequence number
      2. Server replays missed state updates
      3. If pending vote exists locally, retry submission
      4. Server deduplicates by participantId
    `,
    dataConsistency: "Server is authoritative source of truth"
  },

  JOIN_CODE_COLLISION: {
    id: "LIVE_003",
    scenario: "Two simultaneous sessions get same 6-char code",
    probability: "1 in 1 billion (32^6 combinations)",
    prevention: `
      // Generate with uniqueness check:
      async function generateUniqueJoinCode(): Promise<string> {
        for (let i = 0; i < 10; i++) {
          const code = generateJoinCode()
          const exists = await redis.exists(\`live:\${code}\`)
          if (!exists) {
            await redis.set(\`live:\${code}\`, sessionId, 'EX', 86400)
            return code
          }
        }
        throw new Error("JOIN_CODE_GENERATION_EXHAUSTED")
      }
    `
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
    implementation: `
      // Host heartbeat monitoring:
      if (Date.now() - lastHostHeartbeat > 60000) {
        session.status = "PAUSED"
        broadcast({ type: "HOST_DISCONNECTED", pausedAt: Date.now() })
      }
    `,
    recovery: "Host can resume within 10 minutes, else auto-end"
  },

  PERCENTAGE_ROUNDING_INCONSISTENCY: {
    id: "LIVE_006",
    scenario: "3 options: 33.33%, 33.33%, 33.34% - sum > 100 on display",
    handling: "Largest remainder method",
    implementation: `
      // See BIBLE-023 calculatePercentages function
      // Ensures sum always equals exactly 100%
    `,
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

## 16.5.1.2 Multi-Session Survey Edge Cases

```typescript
// [REFERENCE: BIBLE-007 Response Collection, BIBLE-023 Session Config]

const MULTI_SESSION_SURVEY_EDGE_CASES = {
  SURVEY_MODIFIED_DURING_SESSION: {
    id: "MULTI_001",
    scenario: "Admin modifies survey while user has active session",
    handling: "Version lock - session keeps original schema",
    implementation: `
      interface SurveySession {
        sessionId: string
        surveyId: string
        surveyVersionId: string  // Snapshot at session start
        responses: Map<string, Answer>
        startedAt: Date
        expiresAt: Date
      }
      // New questions: Not shown to existing sessions
      // Deleted questions: Responses kept but marked orphaned
      // Modified questions: Original version shown
    `
  },

  CROSS_TIMEZONE_EXPIRY: {
    id: "MULTI_002",
    scenario: "User starts in UTC-5, resumes in UTC+3",
    handling: "Store all timestamps as UTC",
    implementation: `
      // Session creation:
      session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // UTC

      // Resume check:
      if (new Date() > session.expiresAt) {
        return { error: "SESSION_EXPIRED" }
      }
    `,
    display: "Show relative time ('Expires in 2 days') not absolute"
  },

  DST_TRANSITION_DURING_SESSION: {
    id: "MULTI_003",
    scenario: "Daylight Saving Time change during 7-day session",
    handling: "UTC storage immune to DST",
    edgeCase: "User's local time display may 'jump'",
    implementation: "Use Intl.DateTimeFormat for user-local display"
  },

  BROWSER_DATA_CLEARED: {
    id: "MULTI_004",
    scenario: "User clears browser data, loses session reference",
    handling: "Server-side session lookup by userId + surveyId",
    recovery: `
      // On survey page load:
      const existingSession = await findActiveSession(userId, surveyId)
      if (existingSession) {
        showResumePrompt("You have an incomplete session")
      }
    `
  },

  CONCURRENT_SESSIONS_SAME_SURVEY: {
    id: "MULTI_005",
    scenario: "User opens survey in two tabs simultaneously",
    handling: "Last-write-wins with optimistic locking",
    implementation: `
      // Each answer save includes session version:
      async function saveAnswer(sessionId, questionId, answer, clientVersion) {
        const session = await getSession(sessionId)
        if (session.version !== clientVersion) {
          // Another tab updated - return merge conflict
          return { conflict: true, serverVersion: session.version }
        }
        await updateAnswer(sessionId, questionId, answer)
        await incrementVersion(sessionId)
      }
    `,
    uiHandling: "Show warning: 'Session updated in another tab'"
  }
}

export { MULTI_SESSION_SURVEY_EDGE_CASES }
```

## 16.5.1.3 Response Integrity Edge Cases

```typescript
// [REFERENCE: BIBLE-007, BIBLE-009 Fraud Detection]

const RESPONSE_INTEGRITY_EDGE_CASES = {
  CHECKSUM_TAMPERING: {
    id: "RESP_001",
    scenario: "Client attempts to modify response payload",
    prevention: "Server-side checksum generation",
    algorithm: "HMAC-SHA256",
    implementation: `
      function generateResponseChecksum(response: Response): string {
        const payload = JSON.stringify({
          responseId: response.id,
          contentId: response.contentId,
          userId: response.userId,
          answers: response.answers,
          submittedAt: response.submittedAt.toISOString()
        })
        return crypto
          .createHmac('sha256', process.env.RESPONSE_CHECKSUM_SECRET)
          .update(payload)
          .digest('hex')
      }
    `,
    onMismatch: "Flag for review, do not auto-reject (could be bug)"
  },

  DEVICE_FINGERPRINT_COLLISION: {
    id: "RESP_002",
    scenario: "Two different users have identical fingerprint",
    probability: "~1% for canvas + WebGL + timezone combo",
    handling: "Fingerprint is hint, not sole identifier",
    implementation: `
      // Duplicate detection uses multiple signals:
      const isDuplicate =
        (sameFingerprint && sameIP) ||
        (sameFingerprint && sameUserId) ||
        (sameIP && timeDelta < 5000)  // 5 seconds
    `,
    falsePositive: "Shared device legitimate use case",
    mitigation: "Allow appeal via support ticket"
  },

  REPLAY_ATTACK: {
    id: "RESP_003",
    scenario: "Attacker captures and re-submits valid response",
    prevention: "Nonce + timestamp validation",
    implementation: `
      interface ResponseSubmission {
        nonce: string           // UUID generated client-side
        timestamp: number       // Client timestamp
        serverReceived: number  // Server adds on receipt
      }

      // Validation:
      1. Nonce must not exist in Redis (expire after 1 hour)
      2. timestamp within 5 minutes of server time
      3. Store nonce in Redis with 1hr TTL
    `
  },

  ANONYMOUS_IDENTITY_LINKAGE: {
    id: "RESP_004",
    scenario: "Anonymous user later creates account, linking responses",
    handling: "Explicit opt-in for linking",
    implementation: `
      // On account creation, if anonymous responses exist:
      if (await hasAnonymousResponses(deviceFingerprint)) {
        showPrompt("Link your previous responses to this account?")
        // If yes: Update response userId
        // If no: Keep anonymous, clear fingerprint association
      }
    `,
    privacy: "Never auto-link without consent"
  }
}

export { RESPONSE_INTEGRITY_EDGE_CASES }
```

## 16.5.2 Data Integrity Edge Cases

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




# ══════════════════════════════════════════════════════════════════════════════
# 16.6 EXTERNAL SERVICE EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## 16.6.1 Email Service Edge Cases

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

## 16.6.2 Push Notification Edge Cases

```typescript
const PUSH_NOTIFICATION_EDGE_CASES = {
  INVALID_TOKEN: {
    id: "PUSH_EC_001",
    scenario: "Push token expired or invalid",
    detection: "Provider returns error",
    handling: "Remove token, increment failure count",
    cleanup: "Deactivate after 5 consecutive failures"
  },

  PROVIDER_OUTAGE: {
    id: "PUSH_EC_002",
    scenario: "FCM/APNs unavailable",
    handling: "Queue for retry, max 6 hours",
    fallback: "Send email notification if critical"
  },

  PAYLOAD_TOO_LARGE: {
    id: "PUSH_EC_003",
    scenario: "Notification payload exceeds limit",
    limits: { fcm: 4096, apns: 4096 },
    handling: "Truncate message, add 'tap for more'"
  },

  DUPLICATE_DELIVERY: {
    id: "PUSH_EC_004",
    scenario: "Same notification delivered twice",
    prevention: "Idempotency key in payload",
    client: "Dedupe by notification ID"
  }
}

export { PUSH_NOTIFICATION_EDGE_CASES }
```

## 16.6.3 File Storage Edge Cases

```typescript
const FILE_STORAGE_EDGE_CASES = {
  UPLOAD_TIMEOUT: {
    id: "FILE_EC_001",
    scenario: "Large file upload times out",
    handling: "Chunked upload, resume capability",
    maxChunkSize: 5242880,
    resumeWindow: "24 hours"
  },

  STORAGE_QUOTA_EXCEEDED: {
    id: "FILE_EC_002",
    scenario: "Organization storage limit reached",
    handling: "Reject upload, show quota usage",
    errorCode: "BIZ_005"
  },

  PRESIGNED_URL_EXPIRED: {
    id: "FILE_EC_003",
    scenario: "User takes too long to upload",
    expiry: "15 minutes",
    handling: "Client requests new URL"
  },

  MALICIOUS_FILE: {
    id: "FILE_EC_004",
    scenario: "Uploaded file contains malware",
    detection: "Virus scan on upload",
    handling: "Reject, log incident, alert security"
  },

  IMAGE_PROCESSING_FAILURE: {
    id: "FILE_EC_005",
    scenario: "Image resize/compress fails",
    handling: "Queue for retry, use original as fallback",
    notification: "Notify user of processing delay"
  },

  CDN_CACHE_INVALIDATION: {
    id: "FILE_EC_006",
    scenario: "Updated file still shows old version",
    handling: "Cache-busting query param on URL",
    implementation: "?v={timestamp}"
  }
}

export { FILE_STORAGE_EDGE_CASES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 16.7 FRAUD DETECTION EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## 16.7.1 False Positive Handling

```typescript
const FRAUD_FALSE_POSITIVE_CASES = {
  LEGITIMATE_VPN_USER: {
    id: "FRAUD_FP_001",
    scenario: "User in restrictive country uses VPN",
    detection: "VPN detected but user behavior normal",
    handling: {
      softReject: "Allow with reduced weight",
      review: "Flag for manual review if first time",
      whitelist: "Allow after manual verification"
    }
  },

  SHARED_DEVICE: {
    id: "FRAUD_FP_002",
    scenario: "Multiple family members use same device",
    detection: "Same fingerprint, different accounts",
    handling: "Allow if accounts created at different times",
    threshold: "Max 3 accounts per device"
  },

  TRAVELING_USER: {
    id: "FRAUD_FP_003",
    scenario: "User suddenly appears in different country",
    detection: "Impossible travel (1000km in 1 hour)",
    handling: {
      firstTime: "Challenge with 2FA",
      recurring: "Learn user travel patterns"
    }
  },

  CORPORATE_NETWORK: {
    id: "FRAUD_FP_004",
    scenario: "Many users from same corporate IP",
    detection: "High user count per IP",
    handling: "Higher thresholds for known corporate ranges",
    whitelist: "Organization IP ranges"
  },

  NEW_DEVICE_LEGITIMATE: {
    id: "FRAUD_FP_005",
    scenario: "User got new phone",
    handling: "Challenge once, then trust",
    verification: "Email or SMS code"
  }
}

export { FRAUD_FALSE_POSITIVE_CASES }
```

## 16.7.2 Evasion Attempts

```typescript
const FRAUD_EVASION_CASES = {
  FINGERPRINT_SPOOFING: {
    id: "FRAUD_EV_001",
    scenario: "Attacker uses fingerprint spoofing tools",
    detection: "Inconsistent fingerprint components",
    handling: "Flag as suspicious, require additional verification",
    indicators: ["Canvas mismatch", "WebGL inconsistency", "Timezone mismatch"]
  },

  SLOW_DRIP_ATTACK: {
    id: "FRAUD_EV_002",
    scenario: "Attacker submits fake responses slowly",
    detection: "Pattern analysis across time",
    indicators: ["Same response patterns", "Similar timing", "Device rotation"]
  },

  ACCOUNT_AGING: {
    id: "FRAUD_EV_003",
    scenario: "Attacker creates accounts, waits, then uses",
    detection: "Sudden activity spike after dormancy",
    handling: "Weight recent activity higher than account age"
  },

  RESIDENTIAL_PROXY: {
    id: "FRAUD_EV_004",
    scenario: "Attacker uses residential proxy to hide",
    detection: "IP reputation services, behavioral analysis",
    handling: "Focus on behavior, not just IP"
  }
}

export { FRAUD_EVASION_CASES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 16.8 PERFORMANCE EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## 16.8.1 High Load Scenarios

```typescript
const HIGH_LOAD_EDGE_CASES = {
  VIRAL_POLL: {
    id: "LOAD_EC_001",
    scenario: "Poll goes viral, 100k votes/minute",
    handling: {
      writeBuffering: "Buffer votes in Redis, batch write to DB",
      readCaching: "Aggressive result caching (5 second TTL)",
      countApproximation: "Show approximate count",
      queueing: "Process votes asynchronously"
    }
  },

  THUNDERING_HERD: {
    id: "LOAD_EC_002",
    scenario: "Cache expires, all requests hit DB",
    prevention: {
      staggeredExpiry: "Jitter on TTL",
      lockAndRefresh: "Single process refreshes cache",
      staleWhileRevalidate: "Serve stale, refresh in background"
    }
  },

  LARGE_EXPORT: {
    id: "LOAD_EC_003",
    scenario: "Organization exports 1M survey responses",
    handling: {
      background: "Process in background job",
      streaming: "Stream to file storage",
      chunking: "Export in chunks",
      notification: "Email when ready"
    }
  },

  NOTIFICATION_STORM: {
    id: "LOAD_EC_004",
    scenario: "Celebrity poll ends, 1M notifications",
    handling: {
      batching: "Group notifications",
      prioritization: "High engagement users first",
      throttling: "Max 10k notifications/second"
    }
  }
}

export { HIGH_LOAD_EDGE_CASES }
```

## 16.8.2 Timeout Handling

```typescript
const TIMEOUT_EDGE_CASES = {
  DATABASE_TIMEOUT: {
    id: "TIMEOUT_001",
    scenario: "Complex query exceeds timeout",
    defaultTimeout: 30000,
    handling: {
      retry: "Once with exponential backoff",
      fallback: "Return cached data if available",
      logging: "Log slow query for optimization"
    }
  },

  EXTERNAL_API_TIMEOUT: {
    id: "TIMEOUT_002",
    scenario: "Third-party API doesn't respond",
    timeout: 10000,
    handling: {
      circuitBreaker: "Open after 5 failures",
      fallback: "Graceful degradation",
      retry: "With different timeout"
    }
  },

  LONG_RUNNING_JOB: {
    id: "TIMEOUT_003",
    scenario: "Background job exceeds max time",
    maxDuration: 3600000,
    handling: {
      checkpoint: "Save progress periodically",
      resume: "Continue from last checkpoint",
      splitting: "Break into smaller jobs"
    }
  }
}

export { TIMEOUT_EDGE_CASES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 16.9 ERROR RECOVERY STRATEGIES
# ══════════════════════════════════════════════════════════════════════════════

## 16.9.1 Retry Strategies

```typescript
interface RetryConfig {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors: string[]
}

const RETRY_STRATEGIES: Record<string, RetryConfig> = {
  DATABASE: {
    maxAttempts: 3,
    initialDelay: 100,
    maxDelay: 5000,
    backoffMultiplier: 2,
    retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "P1001", "P1008"]
  },

  EXTERNAL_API: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: ["ECONNRESET", "ETIMEDOUT", "5xx"]
  },

  EMAIL: {
    maxAttempts: 3,
    initialDelay: 60000,
    maxDelay: 900000,
    backoffMultiplier: 3,
    retryableErrors: ["RATE_LIMIT", "TIMEOUT", "5xx"]
  },

  PUSH_NOTIFICATION: {
    maxAttempts: 3,
    initialDelay: 5000,
    maxDelay: 300000,
    backoffMultiplier: 2,
    retryableErrors: ["TIMEOUT", "5xx", "UNAVAILABLE"]
  },

  WEBHOOK: {
    maxAttempts: 5,
    initialDelay: 5000,
    maxDelay: 3600000,
    backoffMultiplier: 2,
    retryableErrors: ["TIMEOUT", "5xx", "ECONNREFUSED"]
  }
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error | null = null
  let delay = config.initialDelay

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      const isRetryable = config.retryableErrors.some(e =>
        lastError?.message?.includes(e) || lastError?.name?.includes(e)
      )

      if (!isRetryable || attempt === config.maxAttempts) {
        throw lastError
      }

      await sleep(delay)
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelay)
    }
  }

  throw lastError
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export { RETRY_STRATEGIES, executeWithRetry }
export type { RetryConfig }
```

## 16.9.2 Circuit Breaker

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number
  successThreshold: number
  timeout: number
  halfOpenRequests: number
}

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN"

const CIRCUIT_BREAKER_CONFIGS: Record<string, CircuitBreakerConfig> = {
  EMAIL_SERVICE: {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 60000,
    halfOpenRequests: 1
  },

  PUSH_SERVICE: {
    failureThreshold: 10,
    successThreshold: 5,
    timeout: 30000,
    halfOpenRequests: 2
  },

  PAYMENT_SERVICE: {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 120000,
    halfOpenRequests: 1
  },

  FRAUD_SERVICE: {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 30000,
    halfOpenRequests: 2
  }
}

class CircuitBreaker {
  private state: CircuitState = "CLOSED"
  private failures = 0
  private successes = 0
  private lastFailure: Date | null = null

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.shouldAttemptReset()) {
        this.state = "HALF_OPEN"
      } else {
        throw new Error("Circuit breaker is OPEN")
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successes++
      if (this.successes >= this.config.successThreshold) {
        this.reset()
      }
    }
    this.failures = 0
  }

  private onFailure(): void {
    this.failures++
    this.lastFailure = new Date()

    if (this.failures >= this.config.failureThreshold) {
      this.state = "OPEN"
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailure) return true
    return Date.now() - this.lastFailure.getTime() >= this.config.timeout
  }

  private reset(): void {
    this.state = "CLOSED"
    this.failures = 0
    this.successes = 0
  }
}

export { CIRCUIT_BREAKER_CONFIGS, CircuitBreaker }
export type { CircuitBreakerConfig, CircuitState }
```

## 16.9.3 Fallback Strategies

```typescript
const FALLBACK_STRATEGIES = {
  CACHE_FALLBACK: {
    description: "Return stale cached data when fresh data unavailable",
    implementation: "Check cache before throwing error",
    staleness: "Include staleness indicator in response"
  },

  DEFAULT_VALUE: {
    description: "Return sensible default when calculation fails",
    examples: {
      reliabilityScore: null,
      hotScore: 0,
      avatarUrl: "/default-avatar.png"
    }
  },

  GRACEFUL_DEGRADATION: {
    description: "Disable non-critical features",
    examples: {
      notificationsFailed: "Queue for later, don't block action",
      analyticsFailed: "Continue without tracking",
      recommendationsFailed: "Show chronological feed"
    }
  },

  QUEUE_FOR_LATER: {
    description: "Queue failed operation for retry",
    examples: {
      emailFailed: "Add to email retry queue",
      webhookFailed: "Add to webhook retry queue"
    }
  },

  USER_NOTIFICATION: {
    description: "Inform user of degraded experience",
    examples: {
      searchDown: "Arama geçici olarak kullanılamıyor",
      uploadSlow: "Dosya yükleme yavaş olabilir"
    }
  }
}

export { FALLBACK_STRATEGIES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 16.10 LOGGING & MONITORING
# ══════════════════════════════════════════════════════════════════════════════

## 16.10.1 Error Logging Structure

```typescript
interface ErrorLogEntry {
  timestamp: string
  level: "ERROR" | "WARN" | "CRITICAL"
  errorCode: string
  message: string
  stack?: string
  context: {
    userId?: string
    sessionId?: string
    requestId: string
    path: string
    method: string
    ip: string
    userAgent: string
  }
  metadata?: Record<string, unknown>
  fingerprint: string
}

const logError = (error: Error, context: ErrorLogEntry["context"], metadata?: Record<string, unknown>): void => {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    level: determineSeverity(error),
    errorCode: extractErrorCode(error),
    message: error.message,
    stack: error.stack,
    context,
    metadata,
    fingerprint: generateFingerprint(error)
  }

  console.error(JSON.stringify(entry))
}

function determineSeverity(error: Error): ErrorLogEntry["level"] {
  if (error.message.includes("database") || error.message.includes("critical")) {
    return "CRITICAL"
  }
  if (error.name === "ValidationError") {
    return "WARN"
  }
  return "ERROR"
}

function extractErrorCode(error: Error): string {
  return (error as any).code || "SRV_001"
}

function generateFingerprint(error: Error): string {
  const key = `${error.name}:${error.message.slice(0, 100)}`
  return Buffer.from(key).toString("base64").slice(0, 32)
}

export { logError }
export type { ErrorLogEntry }
```

## 16.10.2 Alerting Rules

```typescript
const ALERTING_RULES = {
  ERROR_RATE: {
    metric: "error_rate_5m",
    threshold: 0.05,
    severity: "WARNING",
    action: "Notify on-call"
  },

  CRITICAL_ERROR: {
    metric: "critical_error_count",
    threshold: 1,
    severity: "CRITICAL",
    action: "Page on-call immediately"
  },

  DATABASE_LATENCY: {
    metric: "db_query_p99_latency",
    threshold: 1000,
    severity: "WARNING",
    action: "Investigate slow queries"
  },

  AUTHENTICATION_FAILURES: {
    metric: "auth_failure_rate_1m",
    threshold: 0.1,
    severity: "CRITICAL",
    action: "Possible attack, investigate"
  },

  EXTERNAL_SERVICE_DOWN: {
    metric: "circuit_breaker_open",
    threshold: 1,
    severity: "WARNING",
    action: "Check external service status"
  },

  QUEUE_DEPTH: {
    metric: "job_queue_depth",
    threshold: 10000,
    severity: "WARNING",
    action: "Scale workers or investigate"
  },

  FRAUD_SPIKE: {
    metric: "fraud_rejection_rate_1h",
    threshold: 0.2,
    severity: "WARNING",
    action: "Review fraud rules"
  }
}

export { ALERTING_RULES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 16.11 CLIENT-SIDE ERROR HANDLING
# ══════════════════════════════════════════════════════════════════════════════

## 16.11.1 Error Display Mapping

```typescript
const ERROR_DISPLAY_MAP = {
  VAL_: {
    style: "inline",
    icon: "exclamation-circle",
    color: "red",
    dismissible: false
  },
  AUTH_: {
    style: "toast",
    icon: "lock",
    color: "orange",
    dismissible: true,
    action: "Giriş Yap"
  },
  AUTHZ_: {
    style: "modal",
    icon: "shield-exclamation",
    color: "red",
    dismissible: true
  },
  NF_: {
    style: "page",
    icon: "search-x",
    color: "gray",
    dismissible: false
  },
  RATE_: {
    style: "toast",
    icon: "clock",
    color: "yellow",
    dismissible: true,
    showRetryAfter: true
  },
  BIZ_: {
    style: "toast",
    icon: "info-circle",
    color: "blue",
    dismissible: true
  },
  SRV_: {
    style: "toast",
    icon: "server",
    color: "red",
    dismissible: true,
    showRetry: true
  },
  SEC_: {
    style: "modal",
    icon: "shield-alert",
    color: "red",
    dismissible: false
  }
}

function getErrorDisplay(code: string) {
  const prefix = code.split("_").slice(0, -1).join("_") + "_"
  return ERROR_DISPLAY_MAP[prefix] || ERROR_DISPLAY_MAP["SRV_"]
}

export { ERROR_DISPLAY_MAP, getErrorDisplay }
```

## 16.11.2 Offline Handling

```typescript
const OFFLINE_HANDLING = {
  DETECTION: {
    method: "navigator.onLine + fetch heartbeat",
    heartbeatInterval: 30000,
    heartbeatEndpoint: "/api/health"
  },

  CACHED_ACTIONS: [
    "View cached content",
    "Browse previously loaded feeds",
    "Read saved drafts",
    "View profile (cached)"
  ],

  QUEUED_ACTIONS: [
    "Vote on poll",
    "Submit comment",
    "Like/unlike"
  ],

  BLOCKED_ACTIONS: [
    "Create new content",
    "Edit profile",
    "Change settings",
    "File upload"
  ],

  UI_FEEDBACK: {
    banner: "Çevrimdışı moddasınız. Bazı özellikler kısıtlı.",
    queuedActionFeedback: "İşlem internet bağlantısı gelince gönderilecek",
    blockedActionFeedback: "Bu işlem için internet bağlantısı gerekli"
  },

  SYNC_ON_RECONNECT: {
    order: ["queued_votes", "queued_comments", "queued_likes"],
    conflictResolution: "server_wins",
    notification: "Bekleyen işlemleriniz gönderildi"
  }
}

export { OFFLINE_HANDLING }
```




# ══════════════════════════════════════════════════════════════════════════════
# 16.12 DEVICE FINGERPRINTING SPECIFICATION
# ══════════════════════════════════════════════════════════════════════════════

## 16.12.1 Fingerprint Components

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DEVICE FINGERPRINT ALGORITHM
// ══════════════════════════════════════════════════════════════════════════════
// Purpose: Identify unique devices for duplicate detection while respecting privacy.
// NOT used as sole identifier - always combined with other signals.
// ══════════════════════════════════════════════════════════════════════════════

interface FingerprintComponents {
  // Tier 1: High entropy, stable
  canvasHash: string           // Canvas rendering fingerprint
  webglHash: string            // WebGL renderer + vendor hash
  audioContextHash: string     // AudioContext fingerprint

  // Tier 2: Medium entropy, moderately stable
  screenResolution: string     // width x height x colorDepth
  timezone: string             // Intl.DateTimeFormat timezone
  language: string             // navigator.language
  platform: string             // navigator.platform
  hardwareConcurrency: number  // navigator.hardwareConcurrency

  // Tier 3: Low entropy, variable
  installedFonts: string[]     // Detected system fonts (sampled)
  touchSupport: boolean        // navigator.maxTouchPoints > 0
  cookieEnabled: boolean       // navigator.cookieEnabled
}

const FINGERPRINT_CONFIG = {
  // Component weights for similarity scoring
  COMPONENT_WEIGHTS: {
    canvasHash: 0.25,
    webglHash: 0.20,
    audioContextHash: 0.15,
    screenResolution: 0.10,
    timezone: 0.08,
    language: 0.05,
    platform: 0.05,
    hardwareConcurrency: 0.05,
    installedFonts: 0.04,
    touchSupport: 0.02,
    cookieEnabled: 0.01,
  },

  // Minimum similarity threshold for "same device" classification
  SIMILARITY_THRESHOLD: 0.85,

  // Fingerprint version for migration handling
  CURRENT_VERSION: 2,

  // Max age before requiring refresh (browser updates may change fingerprint)
  MAX_AGE_DAYS: 90,

  // Font sampling config (full font enumeration is privacy-invasive)
  FONT_SAMPLE_SIZE: 50,
  FONT_PROBE_LIST: [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Trebuchet MS', 'Courier New', 'Monaco', 'Comic Sans MS', 'Impact',
    'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    'Source Sans Pro', 'PT Sans', 'Noto Sans', 'Ubuntu', 'Fira Sans',
    // Turkish-specific fonts
    'Tahoma', 'Calibri', 'Cambria', 'Consolas', 'Lucida Console'
  ]
}

// ══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT GENERATION
// ══════════════════════════════════════════════════════════════════════════════

async function generateDeviceFingerprint(): Promise<{
  hash: string
  components: FingerprintComponents
  version: number
  confidence: number
}> {
  const components: FingerprintComponents = {
    canvasHash: await getCanvasFingerprint(),
    webglHash: await getWebGLFingerprint(),
    audioContextHash: await getAudioContextFingerprint(),
    screenResolution: getScreenResolution(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    installedFonts: await detectFonts(FINGERPRINT_CONFIG.FONT_PROBE_LIST),
    touchSupport: navigator.maxTouchPoints > 0,
    cookieEnabled: navigator.cookieEnabled,
  }

  // Calculate confidence based on component availability
  const confidence = calculateConfidence(components)

  // Generate stable hash from components
  const hash = await hashComponents(components)

  return {
    hash,
    components,
    version: FINGERPRINT_CONFIG.CURRENT_VERSION,
    confidence
  }
}

async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'canvas_unsupported'

    canvas.width = 200
    canvas.height = 50

    // Draw text with specific settings
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('VoxPoll Fingerprint', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('VoxPoll Fingerprint', 4, 17)

    // Add geometric shapes for more entropy
    ctx.beginPath()
    ctx.arc(50, 25, 20, 0, Math.PI * 2)
    ctx.stroke()

    const dataUrl = canvas.toDataURL()
    return await sha256(dataUrl)
  } catch {
    return 'canvas_error'
  }
}

async function getWebGLFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'webgl_unsupported'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR)
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER)

    return await sha256(`${vendor}|${renderer}`)
  } catch {
    return 'webgl_error'
  }
}

async function getAudioContextFingerprint(): Promise<string> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const analyser = audioContext.createAnalyser()
    const gain = audioContext.createGain()
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)

    gain.gain.value = 0 // Mute output
    oscillator.type = 'triangle'
    oscillator.connect(analyser)
    analyser.connect(scriptProcessor)
    scriptProcessor.connect(gain)
    gain.connect(audioContext.destination)

    oscillator.start(0)

    const fingerprint = await new Promise<string>((resolve) => {
      scriptProcessor.onaudioprocess = (event) => {
        const data = event.inputBuffer.getChannelData(0)
        const sum = data.reduce((acc, val) => acc + Math.abs(val), 0)
        oscillator.disconnect()
        audioContext.close()
        resolve(sum.toString())
      }
    })

    return await sha256(fingerprint)
  } catch {
    return 'audio_error'
  }
}

function getScreenResolution(): string {
  return `${screen.width}x${screen.height}x${screen.colorDepth}`
}

async function detectFonts(fontList: string[]): Promise<string[]> {
  const baseFonts = ['monospace', 'sans-serif', 'serif']
  const testString = 'mmmmmmmmmmlli'
  const testSize = '72px'

  const span = document.createElement('span')
  span.style.position = 'absolute'
  span.style.left = '-9999px'
  span.style.fontSize = testSize
  span.innerHTML = testString
  document.body.appendChild(span)

  const baseSizes = baseFonts.map(font => {
    span.style.fontFamily = font
    return { width: span.offsetWidth, height: span.offsetHeight }
  })

  const detectedFonts: string[] = []

  for (const font of fontList) {
    for (let i = 0; i < baseFonts.length; i++) {
      span.style.fontFamily = `'${font}', ${baseFonts[i]}`
      if (span.offsetWidth !== baseSizes[i].width || span.offsetHeight !== baseSizes[i].height) {
        detectedFonts.push(font)
        break
      }
    }
  }

  document.body.removeChild(span)
  return detectedFonts
}

async function hashComponents(components: FingerprintComponents): Promise<string> {
  const stable = JSON.stringify({
    canvas: components.canvasHash,
    webgl: components.webglHash,
    audio: components.audioContextHash,
    screen: components.screenResolution,
    tz: components.timezone,
    lang: components.language,
    platform: components.platform,
    cores: components.hardwareConcurrency,
    fonts: components.installedFonts.sort().join(','),
    touch: components.touchSupport,
    cookie: components.cookieEnabled,
  })

  return await sha256(stable)
}

function calculateConfidence(components: FingerprintComponents): number {
  let confidence = 1.0

  // Reduce confidence for fallback/error values
  if (components.canvasHash.includes('error') || components.canvasHash.includes('unsupported')) {
    confidence -= 0.25
  }
  if (components.webglHash.includes('error') || components.webglHash.includes('unsupported')) {
    confidence -= 0.20
  }
  if (components.audioContextHash.includes('error')) {
    confidence -= 0.15
  }
  if (components.hardwareConcurrency === 0) {
    confidence -= 0.05
  }
  if (components.installedFonts.length < 5) {
    confidence -= 0.04
  }

  return Math.max(0, confidence)
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export { generateDeviceFingerprint, FINGERPRINT_CONFIG }
export type { FingerprintComponents }
```

## 16.12.2 Collision Handling

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT COLLISION STRATEGY
// ══════════════════════════════════════════════════════════════════════════════

const COLLISION_HANDLING = {
  // Shared device detection (e.g., library computers, internet cafes)
  SHARED_DEVICE_SIGNALS: {
    multipleUsersPattern: {
      description: 'Multiple distinct user sessions from same fingerprint',
      threshold: 3, // Different accounts within 24 hours
      action: 'MARK_SHARED_DEVICE',
    },
    rapidSessionSwitching: {
      description: 'Quick logout/login cycles',
      threshold: 5, // Session switches within 1 hour
      action: 'REQUIRE_ADDITIONAL_VERIFICATION',
    },
  },

  // Legitimate collision scenarios
  LEGITIMATE_COLLISIONS: [
    {
      scenario: 'Corporate environment with identical machines',
      detection: 'Same fingerprint + same IP range + different accounts',
      handling: 'Weight IP more heavily, allow different users',
    },
    {
      scenario: 'Virtual machine with default settings',
      detection: 'Generic webgl renderer (e.g., "ANGLE", "SwiftShader")',
      handling: 'Reduce fingerprint weight, rely on other signals',
    },
    {
      scenario: 'Privacy browser (Tor, Brave shields)',
      detection: 'Canvas blocked or randomized',
      handling: 'Fall back to session-based tracking only',
    },
  ],

  // Multi-signal duplicate detection
  DUPLICATE_DETECTION_MATRIX: {
    // [fingerprint_match, ip_match, timing_match] -> action
    'FFF': 'ALLOW',              // Different everything
    'FFT': 'ALLOW',              // Only timing similar
    'FTF': 'ALLOW',              // Only same IP
    'FTT': 'REVIEW',             // Same IP + timing
    'TFF': 'ALLOW',              // Only same fingerprint
    'TFT': 'REVIEW',             // Same fingerprint + timing
    'TTF': 'REVIEW',             // Same fingerprint + IP
    'TTT': 'BLOCK_DUPLICATE',    // All match - likely duplicate
  },

  // Actions
  ACTIONS: {
    ALLOW: {
      action: 'Accept response',
      flag: false,
    },
    REVIEW: {
      action: 'Accept but flag for manual review',
      flag: true,
      reviewQueue: 'duplicate_suspect',
    },
    BLOCK_DUPLICATE: {
      action: 'Reject response, show error',
      errorCode: 'DUP_001',
      message: 'Bu cihazdan zaten yanıt gönderilmiş',
    },
  },
}

function detectDuplicateVote(
  currentFingerprint: string,
  currentIP: string,
  currentTime: Date,
  existingVotes: Array<{ fingerprint: string; ip: string; createdAt: Date }>
): 'ALLOW' | 'REVIEW' | 'BLOCK_DUPLICATE' {
  const TIMING_THRESHOLD_MS = 60 * 1000 // 1 minute

  for (const vote of existingVotes) {
    const fingerprintMatch = vote.fingerprint === currentFingerprint
    const ipMatch = vote.ip === currentIP
    const timingMatch = Math.abs(currentTime.getTime() - vote.createdAt.getTime()) < TIMING_THRESHOLD_MS

    const key = `${fingerprintMatch ? 'T' : 'F'}${ipMatch ? 'T' : 'F'}${timingMatch ? 'T' : 'F'}` as keyof typeof COLLISION_HANDLING.DUPLICATE_DETECTION_MATRIX

    const action = COLLISION_HANDLING.DUPLICATE_DETECTION_MATRIX[key]

    if (action === 'BLOCK_DUPLICATE') {
      return 'BLOCK_DUPLICATE'
    }
    if (action === 'REVIEW') {
      return 'REVIEW' // Continue checking, might find a block case
    }
  }

  return 'ALLOW'
}

export { COLLISION_HANDLING, detectDuplicateVote }
```

## 16.12.3 GDPR & Privacy Compliance

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT PRIVACY COMPLIANCE
// ══════════════════════════════════════════════════════════════════════════════
// Device fingerprinting falls under GDPR Article 5(1)(c) - Data Minimization
// and requires explicit consent under ePrivacy Directive.
// ══════════════════════════════════════════════════════════════════════════════

const FINGERPRINT_PRIVACY_POLICY = {
  // Legal basis
  LEGAL_BASIS: {
    gdpr: 'Legitimate Interest (fraud prevention) OR Consent',
    ePrivacy: 'Consent required for fingerprinting',
    kvkk: 'Açık rıza (explicit consent) required',
  },

  // Consent requirements
  CONSENT: {
    required: true,
    granularity: 'Fingerprinting separate from general analytics consent',
    withdrawable: true,
    withdrawalMethod: 'Settings > Privacy > Device Fingerprinting toggle',
  },

  // What we tell users
  TRANSPARENCY: {
    purpose: 'Çoklu oy kullanımını ve dolandırıcılığı önlemek için',
    what: 'Cihazınızın teknik özelliklerinden oluşan benzersiz bir tanımlayıcı',
    notIncluded: 'Kişisel bilgileriniz, konum verileriniz veya tarama geçmişiniz',
    retention: '90 gün sonra otomatik silme',
    sharing: 'Üçüncü taraflarla paylaşılmaz',
  },

  // Data minimization
  MINIMIZATION: {
    // Only collect what's needed
    collectedComponents: [
      'canvas_hash',      // Needed for reliable identification
      'webgl_hash',       // Needed for reliable identification
      'audio_hash',       // Needed for reliable identification
      'screen_resolution',// Low-sensitivity, useful signal
      'timezone',         // Low-sensitivity, useful signal
    ],

    // NOT collected (too invasive)
    excludedComponents: [
      'installed_plugins', // Privacy-invasive, declining relevance
      'battery_status',    // Privacy-invasive
      'device_memory',     // Privacy-invasive
      'full_font_list',    // We use sampling instead
      'webrtc_local_ip',   // Privacy-invasive
    ],
  },

  // Storage
  STORAGE: {
    location: 'Hashed fingerprint stored server-side only',
    clientSide: 'No fingerprint stored in cookies or localStorage',
    encryption: 'SHA-256 hashed, original components not stored',
    retention: 90, // days
    deletion: 'Automatic via scheduled job',
  },

  // User rights implementation
  USER_RIGHTS: {
    access: {
      endpoint: 'GET /api/privacy/fingerprint-data',
      returns: 'Hash, collection date, usage count',
      notReturned: 'Raw component values (not stored)',
    },

    deletion: {
      endpoint: 'DELETE /api/privacy/fingerprint-data',
      effect: 'Removes fingerprint hash, clears vote associations',
      consequence: 'May allow duplicate voting until new fingerprint collected',
    },

    portability: {
      included: false,
      reason: 'Fingerprint is device-specific, not user-specific',
    },

    objection: {
      endpoint: 'PUT /api/privacy/fingerprint-opt-out',
      effect: 'Disables fingerprinting for this account',
      alternative: 'Session-based duplicate detection (less effective)',
    },
  },

  // Fallback when consent denied
  CONSENT_DENIED_FALLBACK: {
    duplicateDetection: 'Session-based only',
    effectiveness: 'Reduced (easy to circumvent)',
    userExperience: 'May see more CAPTCHAs',
    storedData: 'Session ID only, no device identifiers',
  },
}

// Consent flow implementation
async function requestFingerprintConsent(userId: string): Promise<boolean> {
  // Show consent dialog with clear explanation
  const consent = await showConsentDialog({
    title: 'Cihaz Tanımlama İzni',
    description: FINGERPRINT_PRIVACY_POLICY.TRANSPARENCY.purpose,
    details: [
      `Toplanan: ${FINGERPRINT_PRIVACY_POLICY.TRANSPARENCY.what}`,
      `Dahil olmayan: ${FINGERPRINT_PRIVACY_POLICY.TRANSPARENCY.notIncluded}`,
      `Saklama süresi: ${FINGERPRINT_PRIVACY_POLICY.TRANSPARENCY.retention}`,
    ],
    acceptText: 'İzin Ver',
    declineText: 'Reddet',
    learnMoreLink: '/privacy/fingerprinting',
  })

  // Record consent decision
  await recordConsent({
    userId,
    consentType: 'DEVICE_FINGERPRINTING',
    granted: consent,
    timestamp: new Date(),
    version: FINGERPRINT_CONFIG.CURRENT_VERSION,
  })

  return consent
}

export { FINGERPRINT_PRIVACY_POLICY, requestFingerprintConsent }
```

## 16.12.4 Fingerprint Update Strategy

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT VERSION MIGRATION
// ══════════════════════════════════════════════════════════════════════════════
// Browser updates can change fingerprint components. This handles graceful migration.
// ══════════════════════════════════════════════════════════════════════════════

const FINGERPRINT_MIGRATION = {
  // Version history and changes
  VERSION_HISTORY: {
    1: {
      releasedAt: '2024-01-01',
      components: ['canvas', 'webgl', 'screen', 'timezone'],
      hashAlgorithm: 'SHA-256',
    },
    2: {
      releasedAt: '2025-06-01',
      components: ['canvas', 'webgl', 'audio', 'screen', 'timezone', 'fonts'],
      hashAlgorithm: 'SHA-256',
      changes: 'Added audio fingerprint, font sampling',
    },
  },

  // Migration handling
  MIGRATION_STRATEGY: {
    // When fingerprint version changes
    onVersionMismatch: {
      action: 'GENERATE_NEW_AND_LINK',
      steps: [
        '1. Generate new fingerprint with current version',
        '2. Calculate similarity with old fingerprint',
        '3. If similarity > 0.7, link as same device',
        '4. If similarity < 0.7, treat as new device (migration lost entropy)',
      ],
    },

    // Gradual rollout
    rollout: {
      strategy: 'PERCENTAGE_BASED',
      phases: [
        { percentage: 5, duration: '1 week', metrics: ['collision_rate', 'false_positive_rate'] },
        { percentage: 25, duration: '1 week' },
        { percentage: 100, duration: 'permanent' },
      ],
    },
  },

  // Browser update handling
  BROWSER_UPDATE_DETECTION: {
    signals: [
      'User-Agent change',
      'Canvas hash change > 10% of users in 24h',
      'WebGL renderer string change',
    ],
    response: 'Increase similarity threshold temporarily',
    notification: 'Alert engineering team for investigation',
  },
}

async function handleFingerprintMigration(
  userId: string,
  oldFingerprint: { hash: string; version: number },
  newFingerprint: { hash: string; components: FingerprintComponents; version: number }
): Promise<'LINKED' | 'NEW_DEVICE'> {
  // Same version, same hash - no migration needed
  if (oldFingerprint.version === newFingerprint.version && oldFingerprint.hash === newFingerprint.hash) {
    return 'LINKED'
  }

  // Version upgrade - check similarity
  if (oldFingerprint.version < newFingerprint.version) {
    // For version upgrades, we use a lower threshold since components changed
    const MIGRATION_SIMILARITY_THRESHOLD = 0.70

    // We can't calculate true similarity without old components (not stored for privacy)
    // Instead, we use behavioral signals
    const behavioralSimilarity = await calculateBehavioralSimilarity(userId)

    if (behavioralSimilarity > MIGRATION_SIMILARITY_THRESHOLD) {
      // Link fingerprints
      await linkFingerprints(userId, oldFingerprint.hash, newFingerprint.hash)
      return 'LINKED'
    }
  }

  return 'NEW_DEVICE'
}

async function calculateBehavioralSimilarity(userId: string): Promise<number> {
  // Use non-fingerprint signals to establish device continuity
  const signals = await getUserBehavioralSignals(userId)

  let similarity = 0

  // Same IP in last 7 days
  if (signals.sameIPRecently) similarity += 0.3

  // Similar access patterns (time of day, day of week)
  if (signals.similarAccessPattern) similarity += 0.2

  // Same browser family (Chrome, Firefox, etc.)
  if (signals.sameBrowserFamily) similarity += 0.2

  // Similar screen resolution (within 10%)
  if (signals.similarScreenResolution) similarity += 0.15

  // Same timezone
  if (signals.sameTimezone) similarity += 0.15

  return similarity
}

export { FINGERPRINT_MIGRATION, handleFingerprintMigration }
```




# ══════════════════════════════════════════════════════════════════════════════
# 16.13 HMAC SALT STRATEGY
# ══════════════════════════════════════════════════════════════════════════════

## 16.13.1 Salt Architecture

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// HMAC SALT SPECIFICATION
// ══════════════════════════════════════════════════════════════════════════════
// Used for: Participant hash generation, anonymous identity tokens
// Requirements: Cryptographically secure, rotatable, recoverable
// ══════════════════════════════════════════════════════════════════════════════

interface SaltConfig {
  // Salt for participant hash: HMAC-SHA256(userId + contentId, salt)
  participantHashSalt: {
    type: 'SYSTEM_WIDE'           // Same salt for all participant hashes
    length: 32                     // 256 bits
    storage: 'ENVIRONMENT_VARIABLE'// Not in database or code
    rotation: 'YEARLY'             // Rotate annually with migration
    backup: 'ENCRYPTED_VAULT'      // HashiCorp Vault / AWS Secrets Manager
  }

  // Salt for device fingerprint anonymization
  fingerprintSalt: {
    type: 'PER_CONTENT'           // Different salt per poll/survey
    length: 16                     // 128 bits (sufficient for this use case)
    storage: 'DATABASE'            // Stored with content record
    rotation: 'NEVER'              // Fixed per content lifetime
  }

  // Salt for session tokens
  sessionSalt: {
    type: 'PER_SESSION'           // Unique per session
    length: 32                     // 256 bits
    storage: 'REDIS'               // With session data
    rotation: 'PER_SESSION'        // New salt each session
  }
}

const SALT_CONFIGURATION = {
  // ══════════════════════════════════════════════════════════════════════════
  // PARTICIPANT HASH SALT
  // ══════════════════════════════════════════════════════════════════════════
  PARTICIPANT_HASH: {
    // Environment variable name
    envVar: 'VOXPOLL_PARTICIPANT_SALT',

    // Generation
    generation: {
      algorithm: 'crypto.randomBytes(32)',
      encoding: 'base64',
      example: 'K7gNU3sdo+OL0wNhqoVWhr3g6s1xYv72ol/pe/Unols=',
    },

    // Rotation policy
    rotation: {
      frequency: 'YEARLY',
      gracePeriod: '30 days', // Both old and new salt accepted
      migrationStrategy: 'LAZY', // Re-hash on next access
      notification: '60 days before rotation',
    },

    // Backup requirements
    backup: {
      required: true,
      method: 'Encrypted secrets manager',
      recovery: 'Document recovery procedure in runbook',
      testRecovery: 'Quarterly',
    },

    // What happens if lost
    lossImpact: {
      severity: 'HIGH',
      effect: 'All participant hashes become invalid',
      recovery: 'Generate new salt, all users get new participant IDs',
      dataLoss: 'Historical response linkage lost',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CONTENT-SPECIFIC FINGERPRINT SALT
  // ══════════════════════════════════════════════════════════════════════════
  FINGERPRINT: {
    // Stored in content record
    storage: {
      field: 'fingerprintSalt',
      type: 'String @db.VarChar(32)',
      nullable: false,
      default: 'Generated on content creation',
    },

    // Generation
    generation: {
      timing: 'On content creation',
      algorithm: 'crypto.randomBytes(16).toString("hex")',
    },

    // Purpose: Prevents cross-content fingerprint correlation
    purpose: `
      Without per-content salt, same device fingerprint would be identical
      across all polls. This allows tracking users across content.

      With per-content salt:
      - Poll A fingerprint: hash(device + saltA) = "abc123"
      - Poll B fingerprint: hash(device + saltB) = "xyz789"

      Same device, different hashes. No cross-content correlation.
    `,

    // Rotation
    rotation: {
      frequency: 'NEVER',
      reason: 'Changing salt invalidates duplicate detection for that content',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SESSION SALT
  // ══════════════════════════════════════════════════════════════════════════
  SESSION: {
    // Per-session salt for CSRF and other session-bound operations
    generation: {
      timing: 'On session creation',
      algorithm: 'crypto.randomBytes(32).toString("hex")',
    },

    storage: {
      location: 'Redis session store',
      field: 'sessionSalt',
      ttl: 'Same as session TTL',
    },

    usage: [
      'CSRF token generation: HMAC(action + timestamp, sessionSalt)',
      'Form submission verification',
      'API request signing for sensitive operations',
    ],
  },
}
```

## 16.13.2 Salt Generation & Storage

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SALT GENERATION UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

import crypto from 'crypto'

// System-wide participant salt (from environment)
function getParticipantSalt(): Buffer {
  const salt = process.env.VOXPOLL_PARTICIPANT_SALT
  if (!salt) {
    throw new Error('CRITICAL: VOXPOLL_PARTICIPANT_SALT environment variable not set')
  }
  return Buffer.from(salt, 'base64')
}

// Generate salt for new content
function generateContentSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

// Generate salt for new session
function generateSessionSalt(): string {
  return crypto.randomBytes(32).toString('hex')
}

// ══════════════════════════════════════════════════════════════════════════════
// PARTICIPANT HASH GENERATION
// ══════════════════════════════════════════════════════════════════════════════

function generateParticipantHash(userId: string, contentId: string): string {
  const salt = getParticipantSalt()
  const data = `${userId}:${contentId}`

  return crypto
    .createHmac('sha256', salt)
    .update(data)
    .digest('hex')
}

// For anonymous participants (no userId)
function generateAnonymousParticipantHash(
  sessionId: string,
  contentId: string,
  deviceFingerprint: string
): string {
  const salt = getParticipantSalt()
  const data = `anon:${sessionId}:${contentId}:${deviceFingerprint}`

  return crypto
    .createHmac('sha256', salt)
    .update(data)
    .digest('hex')
}

// ══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT HASHING (WITH CONTENT-SPECIFIC SALT)
// ══════════════════════════════════════════════════════════════════════════════

function hashFingerprintForContent(
  deviceFingerprint: string,
  contentSalt: string
): string {
  return crypto
    .createHmac('sha256', contentSalt)
    .update(deviceFingerprint)
    .digest('hex')
}

// ══════════════════════════════════════════════════════════════════════════════
// SALT ROTATION
// ══════════════════════════════════════════════════════════════════════════════

interface SaltRotationConfig {
  oldSalt: string
  newSalt: string
  gracePeriodEnd: Date
}

// During grace period, accept both old and new salt
function verifyParticipantHashDuringRotation(
  userId: string,
  contentId: string,
  providedHash: string,
  rotation: SaltRotationConfig
): boolean {
  // Try new salt first
  const newHash = crypto
    .createHmac('sha256', Buffer.from(rotation.newSalt, 'base64'))
    .update(`${userId}:${contentId}`)
    .digest('hex')

  if (providedHash === newHash) return true

  // If within grace period, also accept old salt
  if (new Date() < rotation.gracePeriodEnd) {
    const oldHash = crypto
      .createHmac('sha256', Buffer.from(rotation.oldSalt, 'base64'))
      .update(`${userId}:${contentId}`)
      .digest('hex')

    if (providedHash === oldHash) {
      // Trigger lazy migration
      scheduleParticipantHashMigration(userId, contentId)
      return true
    }
  }

  return false
}

// Lazy migration: re-hash with new salt on next access
async function scheduleParticipantHashMigration(userId: string, contentId: string): Promise<void> {
  await jobQueue.add('migrate-participant-hash', {
    userId,
    contentId,
    scheduledAt: new Date(),
  })
}

export {
  getParticipantSalt,
  generateContentSalt,
  generateSessionSalt,
  generateParticipantHash,
  generateAnonymousParticipantHash,
  hashFingerprintForContent,
  verifyParticipantHashDuringRotation,
}
```

## 16.13.3 Salt Security Checklist

```typescript
const SALT_SECURITY_CHECKLIST = {
  GENERATION: {
    ✓: [
      'Use crypto.randomBytes(), never Math.random()',
      'Minimum 128 bits (16 bytes) for content salts',
      'Minimum 256 bits (32 bytes) for system salts',
      'Generate in secure environment (not client-side)',
    ],
    ✗: [
      'Never use predictable values (timestamps, counters)',
      'Never derive from user input',
      'Never use same salt for different purposes',
      'Never log salt values',
    ],
  },

  STORAGE: {
    ✓: [
      'System salt in environment variable or secrets manager',
      'Content salt in database (acceptable - per-content scope)',
      'Session salt in Redis (acceptable - short-lived)',
      'Encrypt at rest if possible',
    ],
    ✗: [
      'Never commit salts to source control',
      'Never store in client-accessible storage',
      'Never include in API responses',
      'Never store alongside the data it protects',
    ],
  },

  ROTATION: {
    ✓: [
      'Plan rotation schedule before launch',
      'Implement grace period for smooth transition',
      'Test rotation procedure in staging',
      'Document recovery procedure',
    ],
    ✗: [
      'Never rotate without grace period',
      'Never delete old salt before migration complete',
      'Never rotate all salts simultaneously',
    ],
  },

  RECOVERY: {
    ✓: [
      'Backup salts in separate secure location',
      'Test recovery procedure quarterly',
      'Document impact of salt loss',
      'Have incident response plan ready',
    ],
    ✗: [
      'Never have single point of failure for salt storage',
      'Never assume salt loss won\'t happen',
    ],
  },
}

export { SALT_SECURITY_CHECKLIST }
```


# ══════════════════════════════════════════════════════════════════════════════
# 16.14 ERROR HANDLING UX FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 16.14.1 Toast Notification System

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     TOAST NOTIFICATION SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  TOAST TYPES                                                                    │
│  ───────────                                                                    │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ✅ SUCCESS TOAST                                                         │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │  Background: green-50, Border: green-500                                  │ │
│  │  Duration: 3 seconds (auto-dismiss)                                       │ │
│  │  Position: Top-right (desktop), Top-center (mobile)                       │ │
│  │                                                                           │ │
│  │  Examples:                                                                │ │
│  │  • "Anket başarıyla oluşturuldu"                                          │ │
│  │  • "Şifreniz değiştirildi"                                                │ │
│  │  • "Yorum gönderildi"                                                     │ │
│  │  • "Ayarlar kaydedildi"                                                   │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ❌ ERROR TOAST                                                           │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │  Background: red-50, Border: red-500                                      │ │
│  │  Duration: 5 seconds (can dismiss manually)                               │ │
│  │  Action button: "Tekrar Dene" (if retryable)                              │ │
│  │                                                                           │ │
│  │  Examples:                                                                │ │
│  │  • "Bir hata oluştu. Lütfen tekrar deneyin."                              │ │
│  │  • "Bağlantı hatası. İnternet bağlantınızı kontrol edin."                 │ │
│  │  • "Oturum süreniz doldu. Lütfen tekrar giriş yapın."                     │ │
│  │  • "Bu işlem için yetkiniz yok."                                          │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ⚠️ WARNING TOAST                                                         │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │  Background: yellow-50, Border: yellow-500                                │ │
│  │  Duration: 4 seconds                                                      │ │
│  │                                                                           │ │
│  │  Examples:                                                                │ │
│  │  • "Günlük limitinize yaklaştınız (4/5)"                                  │ │
│  │  • "Oturumunuz 5 dakika içinde sona erecek"                               │ │
│  │  • "Bu içerik daha önce raporlanmış"                                      │ │
│  │  • "Kaydedilmemiş değişiklikleriniz var"                                  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ℹ️ INFO TOAST                                                            │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │  Background: blue-50, Border: blue-500                                    │ │
│  │  Duration: 3 seconds                                                      │ │
│  │                                                                           │ │
│  │  Examples:                                                                │ │
│  │  • "Bağlantı kopyalandı"                                                  │ │
│  │  • "Taslak otomatik kaydedildi"                                           │ │
│  │  • "Yeni mesajınız var"                                                   │ │
│  │  • "Güncelleme mevcut. Sayfayı yenileyin."                                │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  TOAST VISUAL LAYOUT                                                            │
│  ───────────────────                                                            │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐                │
│  │ [Icon] Message text here                           [✕] [Action] │           │
│  └─────────────────────────────────────────────────────────────┘                │
│                                                                                 │
│  • Max width: 400px (desktop), 100% - 32px (mobile)                             │
│  • Stack limit: 3 toasts max, oldest dismissed when new arrives                 │
│  • Animation: Slide in from right (desktop), top (mobile)                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 16.14.2 Inline Error Messages

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     INLINE ERROR MESSAGES                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FORM FIELD ERRORS                                                              │
│  ─────────────────                                                              │
│                                                                                 │
│  E-posta                                                                        │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ gecersiz-email                                                    ❌      │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│  ⚠️ Geçerli bir e-posta adresi girin                                            │
│                                                                                 │
│  Şifre                                                                          │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ ••••                                                              ❌      │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│  ⚠️ Şifre en az 10 karakter olmalıdır                                           │
│                                                                                 │
│  ERROR MESSAGE PATTERNS                                                         │
│  ──────────────────────                                                         │
│                                                                                 │
│  1. Field-specific errors: Show directly below the field                        │
│  2. Form-level errors: Show at top of form in alert box                         │
│  3. Real-time validation: Show as user types (debounced 300ms)                  │
│  4. Submit validation: Show all errors on form submit                           │
│                                                                                 │
│  FORM-LEVEL ERROR ALERT                                                         │
│  ──────────────────────                                                         │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ❌ Lütfen aşağıdaki hataları düzeltin:                                   │ │
│  │                                                                           │ │
│  │  • E-posta adresi geçersiz                                                │ │
│  │  • Şifre gereksinimleri karşılanmıyor                                     │ │
│  │  • Kullanıcı adı zaten kullanılıyor                                       │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ACCESSIBILITY                                                                  │
│  ─────────────                                                                  │
│                                                                                 │
│  • aria-invalid="true" on error fields                                          │
│  • aria-describedby linking field to error message                              │
│  • role="alert" on error messages for screen readers                            │
│  • Focus moves to first error field on submit                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 16.14.3 Retry Flow Patterns

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     RETRY FLOW PATTERNS                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  AUTOMATIC RETRY (Background)                                                   │
│  ────────────────────────────                                                   │
│                                                                                 │
│  For transient errors (network glitches, 5xx errors):                           │
│                                                                                 │
│  Retry config:                                                                  │
│  • Max retries: 3                                                               │
│  • Backoff: Exponential (1s, 2s, 4s)                                            │
│  • Jitter: ±500ms random                                                        │
│                                                                                 │
│  User sees nothing if retry succeeds within ~7s total                           │
│                                                                                 │
│  MANUAL RETRY (User Action Required)                                            │
│  ────────────────────────────────────                                           │
│                                                                                 │
│  After auto-retry exhausted:                                                    │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ❌ İşlem başarısız oldu                                                  │ │
│  │  ─────────────────────────────────────────────────────────────────────────│ │
│  │                                                                           │ │
│  │  Sunucuya bağlanırken bir sorun oluştu.                                   │ │
│  │  Lütfen internet bağlantınızı kontrol edip tekrar deneyin.                │ │
│  │                                                                           │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐   │ │
│  │  │                      Tekrar Dene                                   │   │ │
│  │  └────────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                           │ │
│  │  [Sorunu Bildir]                                                          │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  RETRY BUTTON STATES                                                            │
│  ───────────────────                                                            │
│                                                                                 │
│  1. Idle: "Tekrar Dene"                                                         │
│  2. Loading: [Spinner] "Deneniyor..."                                           │
│  3. Success: ✅ "Başarılı!" (then dismiss)                                      │
│  4. Failed again: "Tekrar Dene" (counter: "3. deneme")                          │
│                                                                                 │
│  SPECIFIC RETRY SCENARIOS                                                       │
│  ────────────────────────                                                       │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ SCENARIO: Vote submission failed                                        │   │
│  │                                                                         │   │
│  │ ┌───────────────────────────────────────────────────────────────────┐   │   │
│  │ │  ⚠️ Oyunuz kaydedilemedi                                          │   │   │
│  │ │                                                                   │   │   │
│  │ │  [Tekrar Dene]  [İptal]                                           │   │   │
│  │ └───────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │ • Keep selection state, don't reset form                                │   │
│  │ • Disable other options while retrying                                  │   │
│  │ • On success: proceed to results                                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ SCENARIO: Image upload failed                                           │   │
│  │                                                                         │   │
│  │ ┌───────────────────────────────────────────────────────────────────┐   │   │
│  │ │  📷 ┃████████░░░░░░░░░░░░░░░░░┃ 35%                                │   │   │
│  │ │                                                                   │   │   │
│  │ │  ❌ Yükleme başarısız oldu                                        │   │   │
│  │ │                                                                   │   │   │
│  │ │  [Tekrar Dene]  [Farklı Dosya Seç]  [İptal]                       │   │   │
│  │ └───────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │ • Show progress before failure                                          │   │
│  │ • Resume upload if possible (chunked upload)                            │   │
│  │ • Offer alternative: choose different file                              │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ SCENARIO: Payment processing failed                                     │   │
│  │                                                                         │   │
│  │ ┌───────────────────────────────────────────────────────────────────┐   │   │
│  │ │  ❌ Ödeme işlemi başarısız                                        │   │   │
│  │ │                                                                   │   │   │
│  │ │  Kartınızdan ödeme alınamadı. Lütfen kart bilgilerinizi           │   │   │
│  │ │  kontrol edin veya farklı bir ödeme yöntemi deneyin.              │   │   │
│  │ │                                                                   │   │   │
│  │ │  Hata kodu: card_declined                                         │   │   │
│  │ │                                                                   │   │   │
│  │ │  [Tekrar Dene]  [Farklı Kart Kullan]                              │   │   │
│  │ └───────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │ • Show specific error reason when available                             │   │
│  │ • Don't auto-retry payment (user must confirm)                          │   │
│  │ • Offer alternative payment method                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 16.14.4 Offline State Handling

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     OFFLINE STATE HANDLING                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  OFFLINE DETECTION                                                              │
│  ─────────────────                                                              │
│                                                                                 │
│  Methods:                                                                       │
│  1. navigator.onLine API                                                        │
│  2. Periodic health check ping (every 30s when idle)                            │
│  3. Failed request detection                                                    │
│                                                                                 │
│  OFFLINE BANNER (Persistent)                                                    │
│  ───────────────────────────                                                    │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ⚠️ Çevrimdışısınız. Bazı özellikler kullanılamayabilir.         [✕]     │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  • Position: Fixed at top of viewport                                           │
│  • Background: yellow-100                                                       │
│  • Dismissible but reappears on new action                                      │
│                                                                                 │
│  BACK ONLINE BANNER                                                             │
│  ──────────────────                                                             │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ✅ Tekrar çevrimiçisiniz                                                 │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  • Auto-dismiss after 3 seconds                                                 │
│  • Trigger pending sync operations                                              │
│                                                                                 │
│  FEATURE AVAILABILITY WHEN OFFLINE                                              │
│  ─────────────────────────────────                                              │
│                                                                                 │
│  ┌───────────────────────────────────┬───────────────────────────────────────┐ │
│  │ Feature                          │ Offline Behavior                      │ │
│  ├───────────────────────────────────┼───────────────────────────────────────┤ │
│  │ View cached content              │ ✅ Available                          │ │
│  │ Read cached messages             │ ✅ Available                          │ │
│  │ Browse feed (cached)             │ ✅ Available (stale indicator)        │ │
│  │ Write comment (draft)            │ ⚠️ Queued, syncs when online         │ │
│  │ Vote on poll                     │ ⚠️ Queued, syncs when online         │ │
│  │ Submit survey                    │ ⚠️ Queued, syncs when online         │ │
│  │ Send message                     │ ⚠️ Queued, syncs when online         │ │
│  │ Create new content               │ ⚠️ Draft only, no publish           │ │
│  │ Login                            │ ❌ Not available                      │ │
│  │ Register                         │ ❌ Not available                      │ │
│  │ Payment                          │ ❌ Not available                      │ │
│  │ Real-time features               │ ❌ Not available                      │ │
│  └───────────────────────────────────┴───────────────────────────────────────┘ │
│                                                                                 │
│  OFFLINE ACTION QUEUE UI                                                        │
│  ───────────────────────                                                        │
│                                                                                 │
│  When user performs action while offline:                                       │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ⏳ Oyunuz kaydedilecek                                                   │ │
│  │                                                                           │ │
│  │  Şu anda çevrimdışısınız. İnternet bağlantınız                            │ │
│  │  sağlandığında oyunuz otomatik olarak gönderilecek.                       │ │
│  │                                                                           │ │
│  │  Bekleyen işlemler: 1                                                     │ │
│  │                                                                           │ │
│  │  [Tamam]                                                                  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  PENDING SYNC INDICATOR                                                         │
│  ──────────────────────                                                         │
│                                                                                 │
│  Small badge in header when pending actions exist:                              │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]    Feed   Keşfet   Profil   [🔄2]                                │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  Clicking [🔄2] shows pending queue:                                            │
│                                                                                 │
│  ┌────────────────────────────────────────────┐                                 │
│  │  Bekleyen İşlemler (2)                     │                                 │
│  ├────────────────────────────────────────────┤                                 │
│  │                                            │                                 │
│  │  ⏳ Yorum: "Harika anket!"                 │                                 │
│  │     15 dakika önce                         │                                 │
│  │                                            │                                 │
│  │  ⏳ Oy: "Favori kahvaltılık" anketi        │                                 │
│  │     20 dakika önce                         │                                 │
│  │                                            │                                 │
│  │  ─────────────────────────────────         │                                 │
│  │                                            │                                 │
│  │  [Tümünü İptal Et]                         │                                 │
│  └────────────────────────────────────────────┘                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 16.14.5 Loading States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     LOADING STATES                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SKELETON LOADING (Content)                                                     │
│  ──────────────────────────                                                     │
│                                                                                 │
│  Poll Card Skeleton:                                                            │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ┌────┐  ░░░░░░░░░░░░░░░░                                                 │ │
│  │  └────┘  ░░░░░░░░                                                         │ │
│  │                                                                           │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                                     │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░                                               │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                           │ │
│  │  ░░░░░░░░░░               ░░░░░░░░                                        │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  • Skeleton animates with shimmer effect (CSS animation)                        │
│  • Matches actual content dimensions                                            │
│  • Used for: Feed, profiles, content pages                                      │
│                                                                                 │
│  SPINNER LOADING (Actions)                                                      │
│  ─────────────────────────                                                      │
│                                                                                 │
│  Button with spinner:                                                           │
│  ┌────────────────────────────────────────┐                                     │
│  │  [⟳] Gönderiliyor...                   │                                     │
│  └────────────────────────────────────────┘                                     │
│                                                                                 │
│  • Button disabled during loading                                               │
│  • Spinner replaces icon or appears before text                                 │
│  • Used for: Form submissions, votes, actions                                   │
│                                                                                 │
│  PROGRESS BAR (Long operations)                                                 │
│  ──────────────────────────────                                                 │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Dosya yükleniyor...                                                      │ │
│  │  ┃████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃ 42%         │ │
│  │  2.4 MB / 5.8 MB                                                          │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  • Show estimated time remaining for uploads > 10s                              │
│  • Used for: File uploads, data exports, bulk operations                        │
│                                                                                 │
│  FULL PAGE LOADING                                                              │
│  ─────────────────                                                              │
│                                                                                 │
│  For initial app load / route transitions:                                      │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │                                                                           │ │
│  │                                                                           │ │
│  │                          [VoxPoll Logo]                                   │ │
│  │                              ⟳                                            │ │
│  │                                                                           │ │
│  │                                                                           │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  • Centered logo with spinner below                                             │
│  • Appears only for cold start (> 500ms load)                                   │
│  • Route transitions use top progress bar instead                               │
│                                                                                 │
│  TOP PROGRESS BAR (Navigation)                                                  │
│  ─────────────────────────────                                                  │
│                                                                                 │
│  ┌────────────────────████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░────┐│
│  │  [Logo]    Feed   Keşfet   Profil                                         ││
│  └───────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  • Thin bar at top of viewport (3px height)                                     │
│  • Animates during route changes                                                │
│  • nprogress-style implementation                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 16.14.6 Empty States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     EMPTY STATES                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  EMPTY STATE PATTERN                                                            │
│  ───────────────────                                                            │
│                                                                                 │
│  All empty states follow this structure:                                        │
│  1. Illustration (optional, 120x120 max)                                        │
│  2. Title (what's empty)                                                        │
│  3. Description (why / what to do)                                              │
│  4. Primary action (optional)                                                   │
│                                                                                 │
│  EMPTY FEED                                                                     │
│  ──────────                                                                     │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │                          📭                                               │ │
│  │                                                                           │ │
│  │                  Feed'iniz henüz boş                                      │ │
│  │                                                                           │ │
│  │     Takip ettiğiniz kişilerin içerikleri burada görünecek.                │ │
│  │     Başlamak için ilginizi çeken konulardaki kişileri takip edin.         │ │
│  │                                                                           │ │
│  │              ┌────────────────────────────────────┐                       │ │
│  │              │       Keşfet'e Git                 │                       │ │
│  │              └────────────────────────────────────┘                       │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  EMPTY SEARCH RESULTS                                                           │
│  ────────────────────                                                           │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │                          🔍                                               │ │
│  │                                                                           │ │
│  │              "xyz" için sonuç bulunamadı                                  │ │
│  │                                                                           │ │
│  │     Farklı anahtar kelimeler deneyin veya filtreleri değiştirin.          │ │
│  │                                                                           │ │
│  │     Öneriler:                                                             │ │
│  │     • Yazım hatası olup olmadığını kontrol edin                           │ │
│  │     • Daha genel terimler kullanın                                        │ │
│  │     • Filtreleri temizleyin                                               │ │
│  │                                                                           │ │
│  │              ┌────────────────────────────────────┐                       │ │
│  │              │      Filtreleri Temizle            │                       │ │
│  │              └────────────────────────────────────┘                       │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  EMPTY NOTIFICATIONS                                                            │
│  ───────────────────                                                            │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │                          🔔                                               │ │
│  │                                                                           │ │
│  │                 Henüz bildiriminiz yok                                    │ │
│  │                                                                           │ │
│  │     Yeni etkileşimler, yorumlar ve güncellemeler                          │ │
│  │     burada görünecek.                                                     │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  EMPTY MESSAGES                                                                 │
│  ──────────────                                                                 │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │                          💬                                               │ │
│  │                                                                           │ │
│  │                  Henüz mesajınız yok                                      │ │
│  │                                                                           │ │
│  │     Takip ettiğiniz kişilere mesaj göndererek sohbete başlayın.           │ │
│  │                                                                           │ │
│  │              ┌────────────────────────────────────┐                       │ │
│  │              │       Yeni Mesaj Gönder            │                       │ │
│  │              └────────────────────────────────────┘                       │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  EMPTY MY POLLS                                                                 │
│  ──────────────                                                                 │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │                          📊                                               │ │
│  │                                                                           │ │
│  │             Henüz anket oluşturmadınız                                    │ │
│  │                                                                           │ │
│  │     İlk anketinizi oluşturun ve topluluğun fikrini öğrenin!               │ │
│  │                                                                           │ │
│  │              ┌────────────────────────────────────┐                       │ │
│  │              │       İlk Anketimi Oluştur         │                       │ │
│  │              └────────────────────────────────────┘                       │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  EMPTY COMMENTS                                                                 │
│  ──────────────                                                                 │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │                          💭                                               │ │
│  │                                                                           │ │
│  │                  Henüz yorum yok                                          │ │
│  │                                                                           │ │
│  │     İlk yorumu siz yapın!                                                 │ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 16.14.7 Error Handling TypeScript Implementation

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING UX IMPLEMENTATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

type ToastType = "success" | "error" | "warning" | "info"

interface ToastOptions {
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
}

const TOAST_DEFAULTS = {
  success: { duration: 3000, dismissible: true },
  error: { duration: 5000, dismissible: true },
  warning: { duration: 4000, dismissible: true },
  info: { duration: 3000, dismissible: true }
}

const TOAST_MESSAGES = {
  tr: {
    NETWORK_ERROR: "Bağlantı hatası. İnternet bağlantınızı kontrol edin.",
    SESSION_EXPIRED: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.",
    PERMISSION_DENIED: "Bu işlem için yetkiniz yok.",
    NOT_FOUND: "Aradığınız içerik bulunamadı.",
    RATE_LIMITED: "Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.",
    VALIDATION_ERROR: "Lütfen girdiğiniz bilgileri kontrol edin.",
    SERVER_ERROR: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    OFFLINE: "Çevrimdışısınız. Bazı özellikler kullanılamayabilir.",
    BACK_ONLINE: "Tekrar çevrimiçisiniz",
    SAVE_SUCCESS: "Kaydedildi",
    DELETE_SUCCESS: "Silindi",
    COPY_SUCCESS: "Kopyalandı",
    SEND_SUCCESS: "Gönderildi",
    UPLOAD_SUCCESS: "Yüklendi",
    UPLOAD_FAILED: "Yükleme başarısız oldu",
    DRAFT_SAVED: "Taslak otomatik kaydedildi",
    PENDING_SYNC: "Değişiklikler senkronize edilecek"
  },
  en: {
    NETWORK_ERROR: "Connection error. Please check your internet connection.",
    SESSION_EXPIRED: "Your session has expired. Please log in again.",
    PERMISSION_DENIED: "You don't have permission for this action.",
    NOT_FOUND: "The content you're looking for was not found.",
    RATE_LIMITED: "Too many requests. Please wait a moment.",
    VALIDATION_ERROR: "Please check the information you entered.",
    SERVER_ERROR: "An error occurred. Please try again later.",
    OFFLINE: "You're offline. Some features may be unavailable.",
    BACK_ONLINE: "You're back online",
    SAVE_SUCCESS: "Saved",
    DELETE_SUCCESS: "Deleted",
    COPY_SUCCESS: "Copied",
    SEND_SUCCESS: "Sent",
    UPLOAD_SUCCESS: "Uploaded",
    UPLOAD_FAILED: "Upload failed",
    DRAFT_SAVED: "Draft saved automatically",
    PENDING_SYNC: "Changes will be synced"
  }
}

function showToast(options: ToastOptions): void {
  const defaults = TOAST_DEFAULTS[options.type]
  const toast = {
    ...defaults,
    ...options
  }

  toastStore.add(toast)

  if (toast.duration && toast.duration > 0) {
    setTimeout(() => {
      toastStore.remove(toast.id)
    }, toast.duration)
  }
}

function showError(error: unknown, options?: Partial<ToastOptions>): void {
  const message = getErrorMessage(error)
  const isRetryable = isRetryableError(error)

  showToast({
    type: "error",
    title: message,
    action: isRetryable ? {
      label: "Tekrar Dene",
      onClick: () => options?.action?.onClick?.()
    } : undefined,
    ...options
  })
}

function getErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return TOAST_MESSAGES.tr.NETWORK_ERROR
  }
  if (error instanceof SessionExpiredError) {
    return TOAST_MESSAGES.tr.SESSION_EXPIRED
  }
  if (error instanceof PermissionError) {
    return TOAST_MESSAGES.tr.PERMISSION_DENIED
  }
  if (error instanceof NotFoundError) {
    return TOAST_MESSAGES.tr.NOT_FOUND
  }
  if (error instanceof RateLimitError) {
    return TOAST_MESSAGES.tr.RATE_LIMITED
  }
  if (error instanceof ValidationError) {
    return TOAST_MESSAGES.tr.VALIDATION_ERROR
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return TOAST_MESSAGES.tr.SERVER_ERROR
}

function isRetryableError(error: unknown): boolean {
  return (
    error instanceof NetworkError ||
    error instanceof ServerError ||
    (error instanceof Error && error.message.includes("timeout"))
  )
}

interface RetryConfig {
  maxRetries: number
  backoffMs: number
  backoffMultiplier: number
  jitterMs: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
  jitterMs: 500
}

async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, backoffMs, backoffMultiplier, jitterMs } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config
  }

  let lastError: Error | null = null
  let currentBackoff = backoffMs

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error
      }

      const jitter = Math.random() * jitterMs - jitterMs / 2
      await sleep(currentBackoff + jitter)
      currentBackoff *= backoffMultiplier
    }
  }

  throw lastError
}

interface OfflineQueueItem {
  id: string
  action: string
  payload: unknown
  createdAt: Date
  retryCount: number
}

const offlineQueue = {
  items: [] as OfflineQueueItem[],

  add(action: string, payload: unknown): string {
    const item: OfflineQueueItem = {
      id: generateId(),
      action,
      payload,
      createdAt: new Date(),
      retryCount: 0
    }
    this.items.push(item)
    this.persist()
    return item.id
  },

  remove(id: string): void {
    this.items = this.items.filter(item => item.id !== id)
    this.persist()
  },

  async processQueue(): Promise<void> {
    if (!navigator.onLine) return

    for (const item of this.items) {
      try {
        await processOfflineAction(item)
        this.remove(item.id)
        showToast({
          type: "success",
          title: "Bekleyen işlem tamamlandı",
          message: getActionDescription(item.action)
        })
      } catch (error) {
        item.retryCount++
        if (item.retryCount >= 3) {
          this.remove(item.id)
          showToast({
            type: "error",
            title: "İşlem başarısız oldu",
            message: getActionDescription(item.action)
          })
        }
      }
    }
    this.persist()
  },

  persist(): void {
    localStorage.setItem("offlineQueue", JSON.stringify(this.items))
  },

  restore(): void {
    const stored = localStorage.getItem("offlineQueue")
    if (stored) {
      this.items = JSON.parse(stored)
    }
  }
}

window.addEventListener("online", () => {
  showToast({ type: "info", title: TOAST_MESSAGES.tr.BACK_ONLINE })
  offlineQueue.processQueue()
})

window.addEventListener("offline", () => {
  showToast({ type: "warning", title: TOAST_MESSAGES.tr.OFFLINE })
})

export {
  showToast,
  showError,
  getErrorMessage,
  isRetryableError,
  withRetry,
  offlineQueue,
  TOAST_MESSAGES,
  TOAST_DEFAULTS
}
export type { ToastType, ToastOptions, RetryConfig, OfflineQueueItem }
```


# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 16 - EDGE CASES & ERROR HANDLING
# ══════════════════════════════════════════════════════════════════════════════
