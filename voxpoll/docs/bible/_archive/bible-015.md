# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 15                                    █
# █                        BUSINESS LOGIC RULES                                █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 15.1 RULE ENGINE ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 15.1.1 Business Rule Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS RULE CATEGORIES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  VALIDATION RULES                                                   │   │
│  │  • Input format validation                                          │   │
│  │  • Data integrity constraints                                       │   │
│  │  • Cross-field validation                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AUTHORIZATION RULES                                                │   │
│  │  • Role-based access control                                        │   │
│  │  • Resource ownership                                               │   │
│  │  • Feature gating                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ELIGIBILITY RULES                                                  │   │
│  │  • Participation eligibility                                        │   │
│  │  • Content access rules                                             │   │
│  │  • Feature unlock criteria                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LIMIT RULES                                                        │   │
│  │  • Rate limits                                                      │   │
│  │  • Quota limits                                                     │   │
│  │  • Time-based restrictions                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STATE TRANSITION RULES                                             │   │
│  │  • Content lifecycle states                                         │   │
│  │  • User status transitions                                          │   │
│  │  • Workflow validations                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CALCULATION RULES                                                  │   │
│  │  • Score calculations                                               │   │
│  │  • XP/Level calculations                                            │   │
│  │  • Statistical computations                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 15.1.2 Rule Definition Format

```typescript
interface BusinessRule<TContext, TResult = boolean> {
  id: string
  name: string
  description: string
  category: RuleCategory
  priority: number
  enabled: boolean
  evaluate: (context: TContext) => TResult | Promise<TResult>
  errorCode?: string
  errorMessage?: string
}

type RuleCategory =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "ELIGIBILITY"
  | "LIMIT"
  | "STATE_TRANSITION"
  | "CALCULATION"

interface RuleResult {
  passed: boolean
  ruleId: string
  message?: string
  metadata?: Record<string, unknown>
}

interface RuleEngine {
  evaluate<T>(rules: BusinessRule<T>[], context: T): Promise<RuleResult[]>
  evaluateAll<T>(rules: BusinessRule<T>[], context: T): Promise<{ passed: boolean; results: RuleResult[] }>
  evaluateFirst<T>(rules: BusinessRule<T>[], context: T): Promise<RuleResult | null>
}

export type { BusinessRule, RuleCategory, RuleResult, RuleEngine }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.2 USER BUSINESS RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.2.1 Registration Rules

```typescript
const USER_REGISTRATION_RULES = {
  EMAIL_FORMAT: {
    id: "REG_001",
    rule: "Email must be valid format and not from disposable domain",
    validation: (email: string) => {
      const validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      const disposableDomains = ["tempmail.com", "throwaway.com", "guerrillamail.com"]
      const domain = email.split("@")[1]
      return validFormat && !disposableDomains.includes(domain)
    }
  },

  USERNAME_FORMAT: {
    id: "REG_002",
    rule: "Username must be 3-30 chars, alphanumeric + underscore only",
    validation: (username: string) => /^[a-zA-Z0-9_]{3,30}$/.test(username)
  },

  USERNAME_RESERVED: {
    id: "REG_003",
    rule: "Username cannot be reserved word",
    reservedWords: [
      "admin", "administrator", "moderator", "mod", "system", "voxpoll",
      "support", "help", "info", "contact", "api", "www", "mail", "email",
      "root", "null", "undefined", "anonymous", "guest", "user", "test"
    ]
  },

  // [REFERENCE] Password requirements defined in BIBLE-005 Section 5.2.4
  PASSWORD_STRENGTH: {
    id: "REG_004",
    rule: "Password must meet complexity requirements (at least 3 character types)",
    minLength: 10,
    maxLength: 128,
    minCharacterClasses: 3,
    validation: (password: string) => {
      if (password.length < 10 || password.length > 128) return false
      const classes = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^a-zA-Z0-9]/.test(password)
      ].filter(Boolean).length
      return classes >= 3
    }
  },

  AGE_REQUIREMENT: {
    id: "REG_005",
    rule: "User must be at least 13 years old (18 for some features)",
    minAge: 13,
    adultAge: 18
  },

  SINGLE_ACCOUNT: {
    id: "REG_006",
    rule: "One account per email/phone number",
    errorMessage: "Bu e-posta veya telefon numarası zaten kullanılıyor"
  }
}

export { USER_REGISTRATION_RULES }
```

## 15.2.2 Profile Rules

```typescript
const USER_PROFILE_RULES = {
  DISPLAY_NAME: {
    id: "PROF_001",
    minLength: 2,
    maxLength: 50,
    forbiddenPatterns: [
      /admin/i,
      /moderator/i,
      /voxpoll/i,
      /support/i
    ]
  },

  BIO: {
    id: "PROF_002",
    maxLength: 500,
    allowedMarkdown: false,
    allowLinks: true
  },

  USERNAME_CHANGE: {
    id: "PROF_003",
    rule: "Username can be changed once every 30 days",
    cooldownDays: 30,
    requireVerification: false
  },

  // [REFERENCE] Avatar size defined in BIBLE-005 Section 5.2.2
  AVATAR: {
    id: "PROF_004",
    maxSizeBytes: 2097152,  // 2MB
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    minDimension: 100,
    maxDimension: 2048
  }
}

export { USER_PROFILE_RULES }
```

## 15.2.3 Account Status Rules

```typescript
const ACCOUNT_STATUS_RULES = {
  VERIFICATION_DEADLINE: {
    id: "ACC_001",
    rule: "Email must be verified within 7 days",
    deadlineDays: 7,
    action: "Account marked as inactive, re-verification required"
  },

  INACTIVITY_DORMANT: {
    id: "ACC_002",
    rule: "Account becomes DORMANT after 12 months of inactivity",
    inactivityMonths: 12,
    preserveData: true,
    canReactivate: true
  },

  SUSPENSION_RULES: {
    id: "ACC_003",
    firstOffense: { duration: 24, unit: "hours" },
    secondOffense: { duration: 7, unit: "days" },
    thirdOffense: { duration: 30, unit: "days" },
    permanentBanThreshold: 4
  },

  DELETION_RULES: {
    id: "ACC_004",
    gracePeriodDays: 30,
    dataRetentionDays: 90,
    anonymizeResponses: true,
    deletePersonalData: true
  },

  ACCOUNT_LOCKOUT: {
    id: "ACC_005",
    rule: "Account locked after consecutive failed login attempts",
    maxFailedAttempts: 5,
    lockoutDurations: {
      firstLockout: { minutes: 15 },
      secondLockout: { minutes: 60 },
      thirdLockout: { hours: 24 },
      permanentLockout: 4  // After 4 lockouts, require admin unlock
    },
    resetFailedAttemptsAfter: { hours: 24 },
    notifyUserOnLockout: true,
    notifyUserOnSuspiciousActivity: true,
    exemptFromLockout: ["SUPER_ADMIN"]  // Roles that cannot be locked out
  },

  PASSWORD_HISTORY: {
    id: "ACC_006",
    rule: "Prevent password reuse",
    historyCount: 5,  // Cannot reuse last 5 passwords
    errorMessage: "Bu şifre daha önce kullanılmış. Lütfen farklı bir şifre seçin"
  },

  SESSION_MANAGEMENT: {
    id: "ACC_007",
    rule: "Concurrent session limits by subscription tier",
    limits: {
      FREE: 5,
      PLUS: 10,
      PREMIUM: 10,
      ADMIN: 20
    },
    sessionInactivityTimeout: { hours: 24 },
    absoluteSessionTimeout: { days: 30 },
    forceLogoutOldestOnExceed: true,
    notifyOnNewDeviceLogin: true
  }
}

export { ACCOUNT_STATUS_RULES }
```

## 15.2.4 Social Rules

```typescript
const SOCIAL_RULES = {
  FOLLOW_LIMITS: {
    id: "SOC_001",
    maxFollowing: 5000,
    maxFollowsPerDay: 100,
    maxFollowsPerHour: 30
  },

  BLOCK_RULES: {
    id: "SOC_002",
    maxBlocks: 10000,
    blockEffect: [
      "Cannot see each other's content",
      "Cannot follow each other",
      "Cannot comment on each other's content",
      "Cannot mention each other"
    ]
  },

  MUTE_RULES: {
    id: "SOC_003",
    maxMutes: 10000,
    muteEffect: [
      "Content hidden from feed",
      "Notifications suppressed",
      "User unaware of mute"
    ]
  }
}

export { SOCIAL_RULES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.3 CONTENT CREATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.3.1 Poll Creation Rules

```typescript
const POLL_CREATION_RULES = {
  TITLE: {
    id: "POLL_001",
    minLength: 5,
    maxLength: 200,
    forbiddenContent: ["http://", "https://", "@", "#"]
  },

  DESCRIPTION: {
    id: "POLL_002",
    maxLength: 2000,
    allowMarkdown: true,
    allowLinks: true
  },

  OPTIONS: {
    id: "POLL_003",
    minOptions: 2,
    maxOptions: 10,
    minOptionLength: 1,
    maxOptionLength: 200,
    allowImages: true,
    imageMaxSize: 5242880
  },

  DURATION: {
    id: "POLL_004",
    minDurationHours: 1,
    maxDurationDays: 30,
    canExtend: true,
    maxExtensions: 3,
    extensionMaxDays: 7
  },

  DAILY_LIMIT: {
    id: "POLL_005",
    freeUser: 3,
    premiumUser: 10,
    organization: 50,
    resetTime: "00:00 UTC"
  },

  CONCURRENT_LIMIT: {
    id: "POLL_006",
    freeUser: 5,
    premiumUser: 20,
    organization: 100
  },

  TARGET_AUDIENCE: {
    id: "POLL_007",
    rule: "Target audience must have at least 100 potential participants",
    minPotentialParticipants: 100
  }
}

export { POLL_CREATION_RULES }
```

## 15.3.2 Survey Creation Rules

```typescript
const SURVEY_CREATION_RULES = {
  ORGANIZATION_REQUIRED: {
    id: "SURV_001",
    rule: "Only organizations can create surveys",
    exception: "Academic researchers with verified institution"
  },

  TITLE: {
    id: "SURV_002",
    minLength: 5,
    maxLength: 200
  },

  QUESTIONS: {
    id: "SURV_003",
    minQuestions: 1,
    maxQuestions: 100,
    minQuestionLength: 5,
    maxQuestionLength: 1000
  },

  SECTIONS: {
    id: "SURV_004",
    maxSections: 20,
    maxQuestionsPerSection: 50
  },

  DURATION: {
    id: "SURV_005",
    minDurationDays: 1,
    maxDurationDays: 90,
    canExtend: true
  },

  RESPONSE_LIMITS: {
    id: "SURV_006",
    starterTier: 1000,
    professionalTier: 10000,
    enterpriseTier: "unlimited"
  },

  INCENTIVES: {
    id: "SURV_007",
    maxPointsPerSurvey: 500,
    minEstimatedDuration: 1,
    pointsPerMinute: 10
  },

  ATTENTION_CHECKS: {
    id: "SURV_008",
    rule: "Surveys with 20+ questions must include at least 1 attention check",
    threshold: 20,
    minChecks: 1,
    maxChecks: 5,
    recommendedRatio: 0.05
  }
}

export { SURVEY_CREATION_RULES }
```

## 15.3.3 Test Creation Rules

```typescript
const TEST_CREATION_RULES = {
  TITLE: {
    id: "TEST_001",
    minLength: 5,
    maxLength: 200
  },

  QUESTIONS: {
    id: "TEST_002",
    minQuestions: 5,
    maxQuestions: 50,
    minQuestionLength: 5,
    maxQuestionLength: 1000
  },

  RESULT_CATEGORIES: {
    id: "TEST_003",
    minCategories: 2,
    maxCategories: 20,
    mustCoverFullRange: true
  },

  TIME_LIMIT: {
    id: "TEST_004",
    minMinutes: 1,
    maxMinutes: 180,
    perQuestionMin: 5,
    perQuestionMax: 300
  },

  ATTEMPTS: {
    id: "TEST_005",
    minAttempts: 1,
    maxAttempts: 10,
    cooldownBetweenAttempts: 0
  },

  DAILY_LIMIT: {
    id: "TEST_006",
    freeUser: 2,
    premiumUser: 5,
    organization: 20
  }
}

export { TEST_CREATION_RULES }
```

## 15.3.4 Content Moderation Rules

```typescript
const CONTENT_MODERATION_RULES = {
  PROHIBITED_CONTENT: {
    id: "MOD_001",
    categories: [
      "HATE_SPEECH",
      "HARASSMENT",
      "VIOLENCE",
      "SELF_HARM",
      "SEXUAL_CONTENT",
      "ILLEGAL_ACTIVITY",
      "SPAM",
      "MISINFORMATION",
      "IMPERSONATION",
      "COPYRIGHT_VIOLATION"
    ]
  },

  AUTO_FLAG_THRESHOLDS: {
    id: "MOD_002",
    reportCount: 5,
    reportVelocity: { count: 3, windowMinutes: 60 },
    lowTrustScoreThreshold: 30
  },

  AUTO_HIDE_THRESHOLDS: {
    id: "MOD_003",
    reportCount: 10,
    negativeVoteRatio: 0.8,
    minVotes: 20
  },

  PROFANITY_FILTER: {
    id: "MOD_004",
    enabled: true,
    action: "WARN",
    languages: ["tr", "en"],
    customBlocklist: []
  },

  LINK_RULES: {
    id: "MOD_005",
    allowInPolls: false,
    allowInSurveys: true,
    allowInComments: true,
    blockedDomains: [],
    requireHttps: true
  },

  PII_DETECTION: {
    id: "MOD_006",
    detectPhoneNumbers: true,
    detectEmails: true,
    detectAddresses: false,
    detectIdNumbers: true,
    action: "BLOCK_AND_NOTIFY"
  }
}

export { CONTENT_MODERATION_RULES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.4 PARTICIPATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.4.1 Poll Participation Rules

```typescript
const POLL_PARTICIPATION_RULES = {
  SINGLE_VOTE: {
    id: "PART_001",
    rule: "Each user can vote only once per poll",
    enforcement: "Deterministic hash prevents duplicate votes",
    allowChange: false
  },

  ELIGIBILITY: {
    id: "PART_002",
    requirements: [
      "Account must be verified (email or phone)",
      "Account must not be suspended",
      "Must meet target audience criteria if specified",
      "Must not be blocked by creator"
    ]
  },

  TIMING: {
    id: "PART_003",
    rule: "Can only participate while poll is ACTIVE",
    canParticipateAfterEnd: false
  },

  FRAUD_CHECK: {
    id: "PART_004",
    rule: "Response rejected if fraud score > 70",
    fraudScoreThreshold: 70,
    reviewThreshold: 50
  },

  RATE_LIMIT: {
    id: "PART_005",
    maxParticipationsPerMinute: 10,
    maxParticipationsPerHour: 100
  }
}

export { POLL_PARTICIPATION_RULES }
```

## 15.4.2 Survey Participation Rules

```typescript
const SURVEY_PARTICIPATION_RULES = {
  INVITATION_REQUIRED: {
    id: "SURV_PART_001",
    rule: "Private surveys require invitation token",
    tokenExpiry: 7,
    tokenUnit: "days"
  },

  COMPLETION_RULES: {
    id: "SURV_PART_002",
    minCompletionPercentage: 80,
    requiredQuestionsAllRequired: true,
    allowSkipOptional: true
  },

  TIME_RULES: {
    id: "SURV_PART_003",
    minTimePerQuestion: 2,
    maxTimePerResponse: 86400,
    abandonmentTimeout: 3600
  },

  SAVE_PROGRESS: {
    id: "SURV_PART_004",
    autoSaveInterval: 30,
    maxSavedDuration: 7,
    unit: "days"
  },

  ATTENTION_CHECK_FAILURE: {
    id: "SURV_PART_005",
    maxFailures: 2,
    action: "DISQUALIFY",
    notifyRespondent: true
  },

  QUALITY_THRESHOLD: {
    id: "SURV_PART_006",
    minQualityScore: 60,
    straightLiningThreshold: 0.8,
    speedingThreshold: 0.5
  }
}

export { SURVEY_PARTICIPATION_RULES }
```

## 15.4.3 Test Participation Rules

```typescript
const TEST_PARTICIPATION_RULES = {
  ATTEMPT_RULES: {
    id: "TEST_PART_001",
    respectAttemptLimit: true,
    cooldownBetweenAttempts: 0,
    bestScoreTracking: true
  },

  TIME_ENFORCEMENT: {
    id: "TEST_PART_002",
    strictTimeLimit: true,
    gracePeriodSeconds: 30,
    autoSubmitOnTimeout: true
  },

  NAVIGATION: {
    id: "TEST_PART_003",
    allowBacktrack: true,
    allowSkip: true,
    showProgress: true
  },

  CHEATING_PREVENTION: {
    id: "TEST_PART_004",
    tabSwitchDetection: true,
    maxTabSwitches: 5,                    // Increased from 3 (less strict than exams)
    maxTabSwitchAction: "FLAG",           // FLAG, WARN, or EXCLUDE
    fullscreenRequired: false,
    copyPasteDisabled: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // QUALITY CONTROL (NEW)
  // [REFERENCE] See BIBLE-020 Section 20.2 for unified quality framework
  // ═══════════════════════════════════════════════════════════════════════════
  QUALITY_THRESHOLD: {
    id: "TEST_PART_005",
    minQualityScore: 40,                  // Lower than surveys (40 vs 60)
    enableQualityFiltering: false,        // Opt-in by default for tests
    qualityFilterAction: "FLAG"           // FLAG, REVIEW, or EXCLUDE
  },

  SPEEDING_DETECTION: {
    id: "TEST_PART_006",
    enabled: true,
    speedingThreshold: 0.4,               // 40% of expected time
    minimumTimePerQuestion: 3,            // Seconds
    action: "FLAG"                        // FLAG, WARN, or EXCLUDE
  },

  STRAIGHT_LINING_DETECTION: {
    id: "TEST_PART_007",
    enabled: true,
    straightLiningThreshold: 0.7,         // 70% identical answers (stricter than surveys)
    minimumQuestionsForDetection: 5,
    action: "FLAG"                        // FLAG, WARN, or EXCLUDE
  },

  ATTENTION_CHECKS: {
    id: "TEST_PART_008",
    enabled: false,                       // Opt-in for tests
    recommendedRatio: 0.067,              // 1 per 15 questions
    maxFailures: 1,                       // Stricter than surveys (1 vs 2)
    action: "FLAG"                        // FLAG, REVIEW, or EXCLUDE
  }
}

export { TEST_PARTICIPATION_RULES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.5 COMMENT & DISCUSSION RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.5.1 Comment Rules

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// COMMENT DEPTH CONSTANT - REFERENCED THROUGHOUT APPLICATION
// ─────────────────────────────────────────────────────────────────────────────
const MAX_COMMENT_DEPTH = 3 as const
const COMMENT_COLLAPSE_DEPTH = 2 as const

export { MAX_COMMENT_DEPTH, COMMENT_COLLAPSE_DEPTH }

const COMMENT_RULES = {
  ACCESS: {
    id: "CMT_001",
    rule: "Must participate in content to comment",
    exception: "Content creator can always comment"
  },

  CONTENT: {
    id: "CMT_002",
    minLength: 3,
    maxLength: 2000,
    allowMarkdown: true,
    allowMentions: true,
    maxMentionsPerComment: 5
  },

  THREADING: {
    id: "CMT_003",
    maxDepth: MAX_COMMENT_DEPTH,
    collapseDepth: COMMENT_COLLAPSE_DEPTH,
    deepReplyBehavior: "FLATTEN_TO_PARENT"  // Replies at max depth flatten to parent
  },

  EDITING: {
    id: "CMT_004",
    editWindowMinutes: 15,
    showEditHistory: true,
    maxEdits: 10
  },

  DELETION: {
    id: "CMT_005",
    softDelete: true,
    showDeletedPlaceholder: true,
    preserveReplies: true
  },

  RATE_LIMITS: {
    id: "CMT_006",
    maxCommentsPerMinute: 5,
    maxCommentsPerHour: 30,
    maxCommentsPerDay: 100,
    spamCooldownMinutes: 5
  },

  VOTING: {
    id: "CMT_007",
    allowSelfVote: false,
    voteChangeAllowed: true,
    voteRemovalAllowed: true
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WILSON SCORE CONFIGURATION
  // [REFERENCE] Wilson score interval for Reddit-style ranking
  // Formula: (p + z²/2n - z√(p(1-p)/n + z²/4n²)) / (1 + z²/n)
  // ─────────────────────────────────────────────────────────────────────────────
  WILSON_SCORE: {
    id: "CMT_008",
    confidenceLevel: 0.95,        // 95% confidence interval
    zScore: 1.96,                 // z-score for 95% CI

    // Cache configuration
    cache: {
      enabled: true,
      ttlSeconds: 300,            // 5 minutes cache TTL
      invalidateOnVote: true,     // Invalidate cache when vote is cast
      staleTtlSeconds: 60,        // Serve stale for 1 minute during recomputation
      keyPattern: "wilson:{commentId}",
      batchUpdateInterval: 60     // Batch update scores every 60 seconds
    },

    // Recalculation triggers
    recalculation: {
      onEveryVote: false,         // Too expensive for hot comments
      batchInterval: 60,          // Recalculate every 60 seconds
      minVotesDelta: 5,           // Or when 5+ new votes accumulated
      maxStalenessSeconds: 300    // Force recalc if older than 5 minutes
    },

    // Score decay for time-based ranking (optional)
    timeDecay: {
      enabled: false,             // Disabled by default (pure Wilson)
      halfLifeHours: 24,          // Score halves every 24 hours if enabled
      minScoreMultiplier: 0.1     // Never decay below 10% of base score
    }
  }
}

export { COMMENT_RULES }
```

## 15.5.2 Discussion Rules

```typescript
const DISCUSSION_RULES = {
  AUTO_OPEN: {
    id: "DISC_001",
    rule: "Discussion opens when content ends or reaches threshold",
    pollThreshold: 100,
    surveyThreshold: 50
  },

  AUTO_LOCK: {
    id: "DISC_002",
    inactivityDays: 30,
    maxComments: 10000
  },

  PINNING: {
    id: "DISC_003",
    maxPinnedComments: 3,
    onlyCreatorCanPin: true
  },

  ACCESS_REQUEST: {
    id: "DISC_004",
    rule: "Non-participants can request access",
    minReasonLength: 100,
    maxPendingRequests: 3,
    requestExpiryDays: 7
  }
}

export { DISCUSSION_RULES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.6 GAMIFICATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.6.1 XP Rules

```typescript
const XP_RULES = {
  EARNING: {
    id: "XP_001",
    actions: {
      POLL_CREATED: 20,
      POLL_PARTICIPATED: 5,
      POLL_REACHED_100: 50,
      POLL_REACHED_1000: 200,
      SURVEY_COMPLETED: 10,
      TEST_COMPLETED: 15,
      TEST_PASSED: 25,
      COMMENT_WRITTEN: 2,
      COMMENT_UPVOTED: 1,
      DAILY_LOGIN: 5,
      STREAK_7_DAYS: 50,
      STREAK_30_DAYS: 200,
      BADGE_EARNED: "varies",
      REFERRAL_SIGNUP: 100,
      PROFILE_COMPLETED: 30,
      VERIFIED_ACCOUNT: 100
    }
  },

  DAILY_CAP: {
    id: "XP_002",
    maxXpPerDay: 500,
    excludeFromCap: ["BADGE_EARNED", "VERIFIED_ACCOUNT", "REFERRAL_SIGNUP"]
  },

  PENALTIES: {
    id: "XP_003",
    contentRemoved: -50,
    warningReceived: -100,
    suspensionReceived: -500
  }
}

export { XP_RULES }
```

## 15.6.2 Level Rules

```typescript
const LEVEL_RULES = {
  FORMULA: {
    id: "LVL_001",
    description: "XP required for level N = 100 * N^1.5",
    calculate: (level: number) => Math.floor(100 * Math.pow(level, 1.5))
  },

  // [EDGE CASE] XP values calculated with formula: 100 * N^1.5
  // Level 1: 100, Level 2: 283, Level 3: 520, Level 5: 1118, Level 10: 3162, etc.
  THRESHOLDS: {
    id: "LVL_002",
    levels: [
      { level: 1, xpRequired: 0, title: "Yeni Başlayan" },
      { level: 2, xpRequired: 283, title: "Meraklı" },        // 100 * 2^1.5
      { level: 3, xpRequired: 520, title: "Katılımcı" },       // 100 * 3^1.5
      { level: 5, xpRequired: 1118, title: "Aktif Üye" },      // 100 * 5^1.5
      { level: 10, xpRequired: 3162, title: "Deneyimli" },     // 100 * 10^1.5
      { level: 20, xpRequired: 8944, title: "Uzman" },         // 100 * 20^1.5
      { level: 30, xpRequired: 16432, title: "Usta" },         // 100 * 30^1.5
      { level: 50, xpRequired: 35355, title: "Efsane" },       // 100 * 50^1.5
      { level: 100, xpRequired: 100000, title: "VoxPoll Elite" } // 100 * 100^1.5
    ]
  },

  MAX_LEVEL: {
    id: "LVL_003",
    value: 100
  },

  BENEFITS: {
    id: "LVL_004",
    perks: {
      5: ["Custom profile theme"],
      10: ["Priority support"],
      20: ["Extended poll duration (45 days)"],
      30: ["Featured creator badge"],
      50: ["Early access to features"],
      100: ["Lifetime premium benefits"]
    }
  }
}

export { LEVEL_RULES }
```

## 15.6.3 Badge Rules

```typescript
const BADGE_RULES = {
  EARNING_CRITERIA: {
    id: "BADGE_001",
    badges: {
      FIRST_POLL: { condition: "Create first poll" },
      FIRST_VOTE: { condition: "Cast first vote" },
      POLL_MASTER_10: { condition: "Create 10 polls" },
      POLL_MASTER_50: { condition: "Create 50 polls" },
      POLL_MASTER_100: { condition: "Create 100 polls" },
      PARTICIPANT_100: { condition: "Participate in 100 polls" },
      PARTICIPANT_500: { condition: "Participate in 500 polls" },
      PARTICIPANT_1000: { condition: "Participate in 1000 polls" },
      STREAK_7: { condition: "7-day activity streak" },
      STREAK_30: { condition: "30-day activity streak" },
      STREAK_100: { condition: "100-day activity streak" },
      STREAK_365: { condition: "365-day activity streak" },
      VERIFIED: { condition: "Complete identity verification" },
      POPULAR_POLL: { condition: "Poll reaches 1000 participants" },
      VIRAL_POLL: { condition: "Poll reaches 10000 participants" },
      TOP_COMMENTER: { condition: "100 comments with positive score" },
      HELPFUL: { condition: "Receive 100 upvotes on comments" },
      EARLY_ADOPTER: { condition: "Join within first 6 months" },
      QUALITY_RESPONDENT: { condition: "Complete 50 surveys with quality score > 80" }
    }
  },

  DISPLAY: {
    id: "BADGE_002",
    maxDisplayedBadges: 5,
    showRarity: true,
    showEarnDate: true
  },

  REVOCATION: {
    id: "BADGE_003",
    canRevoke: true,
    revokeConditions: ["Account suspension", "Fraud detection", "Rule violation"]
  }
}

export { BADGE_RULES }
```

## 15.6.4 Streak Rules

```typescript
const STREAK_RULES = {
  DEFINITION: {
    id: "STREAK_001",
    activityTypes: [
      "POLL_CREATED",
      "POLL_PARTICIPATED",
      "SURVEY_COMPLETED",
      "TEST_COMPLETED",
      "COMMENT_WRITTEN"
    ],
    minActionsPerDay: 1,
    resetTime: "00:00",
    timezone: "user_local"
  },

  GRACE_PERIOD: {
    id: "STREAK_002",
    enabled: true,
    hours: 12,
    maxUsesPerMonth: 2
  },

  FREEZE: {
    id: "STREAK_003",
    premiumOnly: true,
    maxFreezeDays: 7,
    freezesPerMonth: 2
  },

  MILESTONES: {
    id: "STREAK_004",
    values: [7, 14, 30, 60, 100, 180, 365],
    rewards: {
      7: { xp: 50, badge: "STREAK_7" },
      30: { xp: 200, badge: "STREAK_30" },
      100: { xp: 500, badge: "STREAK_100" },
      365: { xp: 2000, badge: "STREAK_365" }
    }
  }
}

export { STREAK_RULES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.7 RELIABILITY SCORE RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.7.1 Score Calculation Rules

```typescript
const RELIABILITY_SCORE_RULES = {
  COMPONENTS: {
    id: "REL_001",
    weights: {
      sampleQuality: 0.35,
      responseQuality: 0.30,
      methodologyQuality: 0.20,
      creatorTrust: 0.15
    }
  },

  SAMPLE_QUALITY: {
    id: "REL_002",
    factors: {
      sampleSize: {
        weight: 0.15,
        thresholds: [
          { min: 0, max: 29, score: 20 },
          { min: 30, max: 99, score: 40 },
          { min: 100, max: 299, score: 60 },
          { min: 300, max: 999, score: 80 },
          { min: 1000, max: Infinity, score: 100 }
        ]
      },
      responseRate: {
        weight: 0.10,
        appliesTo: "SURVEY_ONLY"
      },
      demographicCoverage: {
        weight: 0.10
      }
    }
  },

  RESPONSE_QUALITY: {
    id: "REL_003",
    factors: {
      completionRate: { weight: 0.10 },
      responseTimeValidity: { weight: 0.10 },
      patternDetection: { weight: 0.10 }
    }
  },

  MINIMUM_DISPLAY_THRESHOLD: {
    id: "REL_004",
    minResponses: 10,
    displayMessage: "Güvenilirlik skoru için yeterli katılım yok"
  },

  RECALCULATION: {
    id: "REL_005",
    triggerEvents: ["NEW_RESPONSE", "RESPONSE_INVALIDATED", "CONTENT_ENDED"],
    debounceSeconds: 60,
    batchSize: 100
  }
}

export { RELIABILITY_SCORE_RULES }
```

## 15.7.2 Trust Score Rules

```typescript
const TRUST_SCORE_RULES = {
  COMPONENTS: {
    id: "TRUST_001",
    weights: {
      accountAge: 0.15,
      verificationLevel: 0.25,
      activityConsistency: 0.20,
      responseQuality: 0.25,
      socialTrust: 0.15
    }
  },

  ACCOUNT_AGE: {
    id: "TRUST_002",
    scoring: [
      { minDays: 0, maxDays: 7, score: 20 },
      { minDays: 7, maxDays: 30, score: 40 },
      { minDays: 30, maxDays: 90, score: 60 },
      { minDays: 90, maxDays: 365, score: 80 },
      { minDays: 365, maxDays: Infinity, score: 100 }
    ]
  },

  VERIFICATION_LEVEL: {
    id: "TRUST_003",
    scoring: {
      NONE: 0,
      EMAIL: 40,
      PHONE: 60,
      GOVERNMENT_ID: 100,
      ORGANIZATION: 90
    }
  },

  PENALTIES: {
    id: "TRUST_004",
    reportReceived: -5,
    warningIssued: -20,
    contentRemoved: -15,
    suspensionReceived: -50
  },

  RECOVERY: {
    id: "TRUST_005",
    dailyRecoveryPoints: 0.5,
    maxRecoveryPerMonth: 10,
    cleanRecordBonus: 5
  }
}

export { TRUST_SCORE_RULES }
```

## 15.7.3 Fraud Score Rules

[REFERENCE] See BIBLE-020 Section 20.3 for full fraud detection implementation

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// FRAUD SCORE ALGORITHM
// Multi-signal approach to detect bots, duplicate accounts, and manipulation
// Score: 0-100 (0 = definitely fraud, 100 = definitely legitimate)
// ═══════════════════════════════════════════════════════════════════════════════

const FRAUD_SCORE_RULES = {
  // ─────────────────────────────────────────────────────────────────────────────
  // THRESHOLDS
  // ─────────────────────────────────────────────────────────────────────────────
  THRESHOLDS: {
    id: "FRAUD_001",
    blockThreshold: 30,                   // Score < 30 = auto-block
    highRiskThreshold: 50,                // Score < 50 = high risk, may review
    mediumRiskThreshold: 70,              // Score < 70 = medium risk
    lowRiskThreshold: 100                 // Score >= 70 = low risk, allow
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // IP REPUTATION SIGNALS
  // ─────────────────────────────────────────────────────────────────────────────
  IP_REPUTATION: {
    id: "FRAUD_002",
    signals: {
      knownBadIP: { penalty: 50, severity: "CRITICAL" },
      vpnDetected: { penalty: 20, severity: "MEDIUM" },
      torExitNode: { penalty: 40, severity: "HIGH" },
      datacenterIP: { penalty: 25, severity: "MEDIUM" },
      proxyDetected: { penalty: 15, severity: "LOW" }
    },
    // External service integration (MaxMind, IPQualityScore, etc.)
    externalServiceRequired: true
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DEVICE FINGERPRINT SIGNALS
  // ─────────────────────────────────────────────────────────────────────────────
  DEVICE_FINGERPRINT: {
    id: "FRAUD_003",
    signals: {
      duplicateFingerprint: { penalty: 30, severity: "HIGH" },
      suspiciousFingerprint: { penalty: 15, severity: "MEDIUM" },
      incognitoMode: { penalty: 10, severity: "LOW" },
      headlessBrowser: { penalty: 40, severity: "HIGH" },
      automationDetected: { penalty: 50, severity: "CRITICAL" }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BEHAVIORAL SIGNALS
  // ─────────────────────────────────────────────────────────────────────────────
  BEHAVIORAL: {
    id: "FRAUD_004",
    signals: {
      noMouseMovement: { penalty: 20, severity: "MEDIUM" },
      noScrollPatterns: { penalty: 15, severity: "LOW" },
      unnaturalClickTiming: { penalty: 15, severity: "MEDIUM" },
      impossibleSpeed: { penalty: 30, severity: "HIGH" },
      roboticBehavior: { penalty: 25, severity: "HIGH" }
    },
    // Click timing variance threshold
    clickTimingVarianceMin: 50            // Milliseconds variance expected
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ACCOUNT SIGNALS
  // ─────────────────────────────────────────────────────────────────────────────
  ACCOUNT: {
    id: "FRAUD_005",
    signals: {
      newAccountUnder1Hour: { penalty: 25, severity: "HIGH" },
      newAccountUnder24Hours: { penalty: 15, severity: "MEDIUM" },
      unverifiedPhone: { penalty: 10, severity: "LOW" },
      disposableEmail: { penalty: 20, severity: "MEDIUM" },
      previousFraudFlags: { penaltyPerFlag: 15, maxPenalty: 45 }
    },
    disposableEmailDomains: [
      "tempmail.com", "throwaway.email", "guerrillamail.com",
      "10minutemail.com", "mailinator.com", "yopmail.com",
      "fakeinbox.com", "trashmail.com", "sharklasers.com"
      // ... extensive list in implementation
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIONS BY RISK LEVEL
  // ─────────────────────────────────────────────────────────────────────────────
  ACTIONS: {
    id: "FRAUD_006",
    byRiskLevel: {
      CRITICAL: {
        action: "BLOCK",
        logLevel: "ERROR",
        notifyAdmin: true,
        saveForAnalysis: true
      },
      HIGH: {
        action: "BLOCK",
        logLevel: "WARN",
        notifyAdmin: false,
        saveForAnalysis: true
      },
      MEDIUM: {
        action: "FLAG_FOR_REVIEW",
        logLevel: "INFO",
        notifyAdmin: false,
        saveForAnalysis: true
      },
      LOW: {
        action: "ALLOW",
        logLevel: "DEBUG",
        notifyAdmin: false,
        saveForAnalysis: false
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CALCULATION FORMULA
  // ─────────────────────────────────────────────────────────────────────────────
  CALCULATION: {
    id: "FRAUD_007",
    description: "Start at 100, subtract penalties for each detected signal",
    formula: `
      fraudScore = 100
      for each signal detected:
        fraudScore -= signal.penalty
      fraudScore = max(0, min(100, fraudScore))
      return fraudScore
    `,
    // Penalty caps to prevent over-penalization
    maxPenaltyPerCategory: {
      IP_REPUTATION: 50,
      DEVICE_FINGERPRINT: 50,
      BEHAVIORAL: 40,
      ACCOUNT: 45
    }
  }
}

export { FRAUD_SCORE_RULES }
```

## 15.7.4 Unified Quality Score Rules

[REFERENCE] See BIBLE-020 Section 20.2 for complete quality framework

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED QUALITY SCORE ALGORITHM
// Applies to ALL content types with type-specific weights
// Score: 0-100 (higher = better quality)
// ═══════════════════════════════════════════════════════════════════════════════

const QUALITY_SCORE_RULES = {
  // ─────────────────────────────────────────────────────────────────────────────
  // THRESHOLDS BY CONTENT TYPE
  // ─────────────────────────────────────────────────────────────────────────────
  THRESHOLDS: {
    id: "QUAL_001",
    byContentType: {
      POLL: {
        minScore: 0,                      // Fraud score is primary for polls
        includeThreshold: 40,
        reviewThreshold: 20,
        excludeThreshold: 0
      },
      SURVEY: {
        minScore: 60,                     // Strict for enterprise research
        includeThreshold: 70,
        reviewThreshold: 50,
        excludeThreshold: 40
      },
      TEST: {
        minScore: 40,                     // Moderate for engagement content
        includeThreshold: 60,
        reviewThreshold: 30,
        excludeThreshold: 20
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPONENT WEIGHTS BY CONTENT TYPE
  // ─────────────────────────────────────────────────────────────────────────────
  WEIGHTS: {
    id: "QUAL_002",
    byContentType: {
      POLL: {
        timing: 0.15,
        pattern: 0.10,                    // Less relevant for single question
        attention: 0.00,                  // No attention checks in polls
        behavior: 0.25,
        fraud: 0.50                       // Fraud is primary concern
      },
      SURVEY: {
        timing: 0.20,
        pattern: 0.25,
        attention: 0.25,
        behavior: 0.15,
        fraud: 0.15
      },
      TEST: {
        timing: 0.20,
        pattern: 0.30,                    // Important for personality validity
        attention: 0.15,                  // Optional but weighted if present
        behavior: 0.20,
        fraud: 0.15
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TIMING SCORE CALCULATION
  // ─────────────────────────────────────────────────────────────────────────────
  TIMING: {
    id: "QUAL_003",
    speedingThresholds: [
      { speedRatio: 0.0, maxSpeedRatio: 0.3, score: 0, flag: "SPEEDING_CRITICAL" },
      { speedRatio: 0.3, maxSpeedRatio: 0.5, score: 30, flag: "SPEEDING_HIGH" },
      { speedRatio: 0.5, maxSpeedRatio: 0.7, score: 60, flag: "SPEEDING_MEDIUM" },
      { speedRatio: 0.7, maxSpeedRatio: 1.5, score: 100, flag: null },
      { speedRatio: 1.5, maxSpeedRatio: 5.0, score: 90, flag: null },
      { speedRatio: 5.0, maxSpeedRatio: Infinity, score: 70, flag: "SLOWPOKE" }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PATTERN SCORE CALCULATION (Straight-lining)
  // ─────────────────────────────────────────────────────────────────────────────
  PATTERN: {
    id: "QUAL_004",
    straightLiningThresholds: [
      { ratio: 0.0, maxRatio: 0.6, score: 100, flag: null },
      { ratio: 0.6, maxRatio: 0.7, score: 70, flag: "STRAIGHT_LINING_LOW" },
      { ratio: 0.7, maxRatio: 0.8, score: 50, flag: "STRAIGHT_LINING_MEDIUM" },
      { ratio: 0.8, maxRatio: 0.9, score: 20, flag: "STRAIGHT_LINING_HIGH" },
      { ratio: 0.9, maxRatio: 1.0, score: 0, flag: "STRAIGHT_LINING_CRITICAL" }
    ],
    // Also check for alternating patterns (1,2,1,2...)
    alternatingPatternThreshold: 0.7,
    alternatingPatternPenalty: 25
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ATTENTION CHECK SCORE
  // ─────────────────────────────────────────────────────────────────────────────
  ATTENTION: {
    id: "QUAL_005",
    scoring: {
      allPassed: 100,
      oneFailedOutOfMany: 70,             // 1 failed, 2+ passed
      oneFailedOutOfTwo: 50,              // 1 failed, 1 passed
      twoFailed: 20,                      // Automatic disqualification threshold
      moreThanTwoFailed: 0
    },
    noAttentionChecksScore: 100           // If no checks, assume good
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BEHAVIOR SCORE
  // ─────────────────────────────────────────────────────────────────────────────
  BEHAVIOR: {
    id: "QUAL_006",
    penalties: {
      tabSwitches: {
        threshold5: 15,                   // 5-10 switches
        threshold10: 30                   // 10+ switches
      },
      copyPasteAttempts: {
        perAttempt: 10,
        max: 30
      },
      newAccount: {
        under1Day: 20,
        under7Days: 10
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RECOMMENDATIONS BY SCORE
  // ─────────────────────────────────────────────────────────────────────────────
  RECOMMENDATIONS: {
    id: "QUAL_007",
    byScore: [
      { minScore: 70, maxScore: 100, recommendation: "INCLUDE" },
      { minScore: 40, maxScore: 69, recommendation: "REVIEW" },
      { minScore: 0, maxScore: 39, recommendation: "EXCLUDE" }
    ],
    criticalFlagOverride: true            // Critical flags force EXCLUDE
  }
}

export { QUALITY_SCORE_RULES }
```

## 15.7.7 K-Anonymity Protection Rules

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// K-ANONYMITY PROTECTION RULES
// [REFERENCE] BIBLE-007 Section 7.3.1 for anonymity architecture
// Purpose: Prevent re-identification through demographic + fingerprint combinations
// ═══════════════════════════════════════════════════════════════════════════════

const K_ANONYMITY_RULES = {
  // ─────────────────────────────────────────────────────────────────────────────
  // MINIMUM K VALUES BY CONTEXT
  // ─────────────────────────────────────────────────────────────────────────────
  MIN_K_VALUES: {
    id: "KANON_001",
    rule: "Minimum k-anonymity thresholds for demographic cross-tabulation",
    thresholds: {
      publicResults: 5,           // Min 5 respondents per demographic cell
      organizationResults: 3,     // Min 3 for internal org research
      enterpriseResults: 2,       // Min 2 with explicit data agreement
      rawDataExport: 10           // Min 10 before allowing raw export
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // QUASI-IDENTIFIER FIELDS
  // ─────────────────────────────────────────────────────────────────────────────
  QUASI_IDENTIFIERS: {
    id: "KANON_002",
    rule: "Fields that can be combined for re-identification",
    fields: [
      "ageGroup",
      "gender",
      "region",
      "educationLevel",
      "employmentStatus",
      "incomeLevel"
    ],
    maxCombinationDepth: 3,       // Max 3 fields combined in cross-tab
    warningAtDepth: 2             // Warn when combining 2+ fields
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SUPPRESSION RULES
  // ─────────────────────────────────────────────────────────────────────────────
  SUPPRESSION: {
    id: "KANON_003",
    rule: "How to handle cells with insufficient k",
    method: "SUPPRESS",           // Options: SUPPRESS, GENERALIZE, COMBINE
    suppressionDisplay: "< k",    // What to show instead of actual count
    minimumCellDisplay: 5,        // Don't show any count below this
    generalizeOrder: [            // Order to generalize if using GENERALIZE
      { field: "region", to: "country" },
      { field: "ageGroup", to: "ageBand" },  // e.g., "18-34" instead of "18-24"
      { field: "incomeLevel", to: "incomeBand" }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DEVICE FINGERPRINT + DEMOGRAPHIC COMBINATION RISK
  // ─────────────────────────────────────────────────────────────────────────────
  COMBINATION_RISK: {
    id: "KANON_004",
    rule: "Prevent re-identification through fingerprint + demographics",
    neverCombine: [
      { field1: "deviceFingerprint", field2: "exactLocation" },
      { field1: "deviceFingerprint", field2: "ipAddress" },
      { field1: "participantHash", field2: "fullDemographics" }
    ],
    fingerprintIsolation: {
      enabled: true,
      hashWithContentSalt: true,
      truncateToLength: 16,       // Only first 16 chars of hash
      neverExposeRaw: true
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // AUDIT LOGGING FOR ANONYMITY BREACHES
  // ─────────────────────────────────────────────────────────────────────────────
  AUDIT: {
    id: "KANON_005",
    rule: "Log all queries that approach k-anonymity thresholds",
    logWhenKBelow: 10,
    alertWhenKBelow: 5,
    blockWhenKBelow: 3,
    requiredLogFields: [
      "userId",
      "queryTimestamp",
      "filtersApplied",
      "resultingK",
      "dataAccessed"
    ]
  }
}

export { K_ANONYMITY_RULES }
```

## 15.7.8 Hash Salt Configuration

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// HASH SALT CONFIGURATION
// [REFERENCE] BIBLE-007 Section 7.3.2 for device fingerprinting strategy
// Purpose: Secure salt management for participant hash generation
// ═══════════════════════════════════════════════════════════════════════════════

const HASH_SALT_CONFIG = {
  // ─────────────────────────────────────────────────────────────────────────────
  // SALT TYPES
  // ─────────────────────────────────────────────────────────────────────────────
  SALT_TYPES: {
    id: "SALT_001",
    types: {
      GLOBAL: {
        purpose: "Global application salt from environment",
        source: "env:PARTICIPATION_SALT",
        rotationPeriod: "never",   // Changed only in security incident
        minLength: 32
      },
      CONTENT: {
        purpose: "Per-content unique salt for participant hashing",
        source: "database:content.participantSalt",
        generation: "randomBytes(32)",
        rotationPeriod: "never",   // Fixed per content
        minLength: 64              // 32 bytes = 64 hex chars
      },
      SESSION: {
        purpose: "Per-session salt for additional entropy",
        source: "runtime",
        generation: "randomBytes(16)",
        rotationPeriod: "per-session"
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // HASHING ALGORITHM
  // ─────────────────────────────────────────────────────────────────────────────
  ALGORITHM: {
    id: "SALT_002",
    participantHash: {
      algorithm: "HMAC-SHA256",
      inputFormat: "userId",
      keyFormat: "contentSalt",
      outputTruncation: 16,        // First 16 hex chars
      encoding: "hex"
    },
    deviceFingerprint: {
      algorithm: "SHA-256",
      saltPrefix: "contentSalt",
      components: [
        "screenResolution",
        "colorDepth",
        "timezone",
        "language",
        "platform",
        "hardwareConcurrency",
        "canvasFingerprint"
      ],
      outputTruncation: 32
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SALT STORAGE SECURITY
  // ─────────────────────────────────────────────────────────────────────────────
  STORAGE: {
    id: "SALT_003",
    rules: {
      globalSalt: {
        storage: "environment",
        encryption: "none (managed by infrastructure)",
        backup: "secure vault"
      },
      contentSalt: {
        storage: "database",
        encryption: "at-rest via database encryption",
        neverLog: true,
        neverExpose: true,
        excludeFromBackupLogs: true
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // COLLISION HANDLING
  // ─────────────────────────────────────────────────────────────────────────────
  COLLISION: {
    id: "SALT_004",
    rule: "Handle hash collisions for participantHash",
    probability: "1 in 2^64 for 16-char truncation",
    detection: "Unique constraint violation",
    resolution: "Append counter suffix if collision detected",
    maxRetries: 3
  }
}

export { HASH_SALT_CONFIG }
```

## 15.7.9 Anonymous Participation Hash Specification

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// ANONYMOUS PARTICIPATION HASH SPECIFICATION
// [AUTHORITATIVE] Complete specification for generating participant hashes
// Purpose: Enable duplicate detection while preserving anonymity
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PARTICIPANT HASH SYSTEM OVERVIEW
 *
 * The participant hash uniquely identifies a user within a specific content
 * (poll/survey/test) WITHOUT revealing the user's actual identity.
 *
 * Properties:
 * 1. UNIQUE per user per content (same user = different hash in different polls)
 * 2. CONSISTENT for same user in same content (enables duplicate detection)
 * 3. ONE-WAY (cannot derive userId from hash)
 * 4. ISOLATED (hash in Poll A tells nothing about user's hash in Poll B)
 */

const ANONYMOUS_PARTICIPATION_SPEC = {
  // ─────────────────────────────────────────────────────────────────────────────
  // HASH GENERATION FOR AUTHENTICATED USERS
  // ─────────────────────────────────────────────────────────────────────────────
  authenticatedUser: {
    /**
     * Formula: HMAC-SHA256(contentSalt, globalSalt + userId)
     *
     * Input:
     *   - userId: User's CUID from database
     *   - contentSalt: Per-content 64-char hex salt (generated at content creation)
     *   - globalSalt: Environment variable PARTICIPATION_SALT
     *
     * Output:
     *   - 16-character lowercase hex string
     *   - Stored in Response.participantHash
     */
    algorithm: "HMAC-SHA256",
    keyDerivation: (contentSalt: string, globalSalt: string, userId: string) => {
      return hmacSHA256(contentSalt, `${globalSalt}${userId}`).substring(0, 16)
    },
    outputLength: 16,
    encoding: "hex",
    uniquePerContent: true,

    example: {
      userId: "clj1234567890abcdef",
      contentSalt: "a1b2c3d4e5f6...64chars",
      globalSalt: "env_secret_salt_32chars",
      result: "7f3a9b2e1c4d5e6f"  // 16 char hash
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // HASH GENERATION FOR ANONYMOUS USERS
  // ─────────────────────────────────────────────────────────────────────────────
  anonymousUser: {
    /**
     * Formula: SHA-256(contentSalt + deviceFingerprint + sessionId)
     *
     * Note: Anonymous users don't have userId, so we use:
     *   - deviceFingerprint: Browser/device characteristics
     *   - sessionId: Current anonymous session (valid for 24h)
     *
     * This allows duplicate detection within same content
     * but provides no cross-content tracking.
     */
    algorithm: "SHA-256",
    keyDerivation: (contentSalt: string, fingerprint: string, sessionId: string) => {
      return sha256(`${contentSalt}${fingerprint}${sessionId}`).substring(0, 16)
    },
    outputLength: 16,
    encoding: "hex",

    // Device fingerprint components (ordered)
    fingerprintComponents: [
      "screenWidth",           // e.g., "1920"
      "screenHeight",          // e.g., "1080"
      "colorDepth",            // e.g., "24"
      "timezoneOffset",        // e.g., "-180" (minutes)
      "language",              // e.g., "tr-TR"
      "platform",              // e.g., "Win32"
      "hardwareConcurrency",   // e.g., "8"
      "canvasHash"             // Canvas fingerprint (optional, if enabled)
    ],

    sessionIdSpec: {
      generation: "randomBytes(16)",
      storage: "localStorage (anonymous_session_id)",
      expiry: 24 * 60 * 60 * 1000,  // 24 hours
      renewOnActivity: false         // Fixed expiry, no sliding
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DUPLICATE DETECTION RULES
  // ─────────────────────────────────────────────────────────────────────────────
  duplicateDetection: {
    // Primary check: participantHash unique per content
    primaryCheck: {
      field: "participantHash",
      scope: "content",
      constraint: "UNIQUE_INDEX(contentId, participantHash)"
    },

    // Secondary check: deviceFingerprint for anonymous (fraud prevention)
    secondaryCheck: {
      field: "deviceFingerprint",
      scope: "content",
      action: "FLAG_FOR_REVIEW",  // Don't block, just flag
      threshold: 3                 // 3+ responses from same device = flag
    },

    // Response to duplicate attempt
    onDuplicateAttempt: {
      authenticated: {
        action: "BLOCK",
        message: "Bu ankete zaten katıldınız.",
        showPreviousResponse: true
      },
      anonymous: {
        action: "BLOCK",
        message: "Bu ankete bu cihazdan zaten katılım yapılmış.",
        allowAfterCooldown: false
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVACY GUARANTEES
  // ─────────────────────────────────────────────────────────────────────────────
  privacyGuarantees: {
    // What CAN be determined from participantHash
    possible: [
      "Same hash in same content = same participant",
      "Total unique participants per content"
    ],

    // What CANNOT be determined from participantHash
    impossible: [
      "User's actual identity",
      "User's email or username",
      "Whether two hashes in different content are same user",
      "User's participation in other content",
      "Reversal of hash to userId"
    ],

    // Formal security properties
    securityProperties: {
      preimageResistance: true,      // Cannot find input from output
      secondPreimageResistance: true, // Cannot find different input with same output
      collisionResistance: true,      // Hard to find two inputs with same output
      unlinkability: true             // Cannot link hashes across content
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // IMPLEMENTATION EXAMPLE
  // ─────────────────────────────────────────────────────────────────────────────
  implementation: `
    import { createHmac, createHash, randomBytes } from 'crypto'

    // Generate content salt (at content creation time)
    function generateContentSalt(): string {
      return randomBytes(32).toString('hex')  // 64 chars
    }

    // Generate participant hash for authenticated user
    function generateAuthenticatedHash(
      userId: string,
      contentSalt: string,
      globalSalt: string = process.env.PARTICIPATION_SALT!
    ): string {
      return createHmac('sha256', contentSalt)
        .update(globalSalt + userId)
        .digest('hex')
        .substring(0, 16)
    }

    // Generate participant hash for anonymous user
    function generateAnonymousHash(
      deviceFingerprint: string,
      sessionId: string,
      contentSalt: string
    ): string {
      return createHash('sha256')
        .update(contentSalt + deviceFingerprint + sessionId)
        .digest('hex')
        .substring(0, 16)
    }

    // Verify participation uniqueness
    async function checkDuplicateParticipation(
      contentId: string,
      participantHash: string
    ): Promise<{ isDuplicate: boolean; existingResponseId?: string }> {
      const existing = await db.response.findFirst({
        where: { contentId, participantHash }
      })

      return {
        isDuplicate: !!existing,
        existingResponseId: existing?.id
      }
    }
  `
}

export { ANONYMOUS_PARTICIPATION_SPEC }
```


# ══════════════════════════════════════════════════════════════════════════════
# 15.8 NOTIFICATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.8.1 Notification Delivery Rules

```typescript
const NOTIFICATION_DELIVERY_RULES = {
  CHANNELS: {
    id: "NOTIF_001",
    inApp: { always: true },
    push: { requiresOptIn: false, defaultEnabled: true },
    email: { requiresOptIn: true, defaultEnabled: false },
    sms: { criticalOnly: true, requiresVerifiedPhone: true }
  },

  RATE_LIMITS: {
    id: "NOTIF_002",
    push: {
      maxPerHour: 10,
      maxPerDay: 30
    },
    email: {
      maxPerHour: 5,
      maxPerDay: 20
    },
    sms: {
      maxPerDay: 5
    }
  },

  AGGREGATION: {
    id: "NOTIF_003",
    enabledTypes: [
      "NEW_FOLLOWER",
      "COMMENT_ON_YOUR_CONTENT",
      "COMMENT_UPVOTED",
      "CONTENT_SHARED"
    ],
    windowMinutes: 60,
    maxAggregation: 50
  },

  QUIET_HOURS: {
    id: "NOTIF_004",
    defaultStart: "22:00",
    defaultEnd: "08:00",
    respectUserTimezone: true,
    bypassForUrgent: true
  },

  EXPIRATION: {
    id: "NOTIF_005",
    defaultExpiryDays: 30,
    urgentExpiryDays: 7,
    socialExpiryDays: 14
  }
}

export { NOTIFICATION_DELIVERY_RULES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.9 ORGANIZATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.9.1 Organization Management Rules

```typescript
const ORGANIZATION_RULES = {
  CREATION: {
    id: "ORG_001",
    requiresVerification: true,
    verificationDocuments: ["Business registration", "Tax ID", "Authorization letter"],
    approvalTime: "2-5 business days"
  },

  MEMBERSHIP: {
    id: "ORG_002",
    maxMembers: {
      STARTER: 5,
      PROFESSIONAL: 25,
      ENTERPRISE: "unlimited"
    },
    maxAdmins: {
      STARTER: 2,
      PROFESSIONAL: 5,
      ENTERPRISE: "unlimited"
    }
  },

  ROLES: {
    id: "ORG_003",
    hierarchy: ["OWNER", "ADMIN", "MANAGER", "ANALYST", "CREATOR", "MEMBER"],
    permissions: {
      OWNER: ["*"],
      ADMIN: ["manage_members", "manage_content", "view_analytics", "manage_settings"],
      MANAGER: ["manage_content", "view_analytics", "invite_members"],
      ANALYST: ["view_analytics", "export_data"],
      CREATOR: ["create_content", "view_own_analytics"],
      MEMBER: ["view_content"]
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPLETE PERMISSION MATRIX
  // ─────────────────────────────────────────────────────────────────────────────
  PERMISSION_MATRIX: {
    id: "ORG_003B",
    actions: {
      // Organization Management
      "org.settings.view":        { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "org.settings.edit":        { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "org.billing.view":         { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "org.billing.manage":       { OWNER: true, ADMIN: false, MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "org.delete":               { OWNER: true, ADMIN: false, MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "org.transfer":             { OWNER: true, ADMIN: false, MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },

      // Member Management
      "member.list":              { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: false, CREATOR: false, MEMBER: false },
      "member.invite":            { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: false, CREATOR: false, MEMBER: false },
      "member.remove":            { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "member.role.change":       { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "member.permissions.edit":  { OWNER: true, ADMIN: false, MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },

      // Content Management
      "content.create.survey":    { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: false, CREATOR: true,  MEMBER: false },
      "content.create.poll":      { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: false, CREATOR: true,  MEMBER: false },
      "content.edit.own":         { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: false, CREATOR: true,  MEMBER: false },
      "content.edit.any":         { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: false, CREATOR: false, MEMBER: false },
      "content.delete.own":       { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: false, CREATOR: true,  MEMBER: false },
      "content.delete.any":       { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "content.publish":          { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: false, CREATOR: false, MEMBER: false },
      "content.archive":          { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: false, CREATOR: false, MEMBER: false },

      // Analytics & Reporting
      "analytics.view.own":       { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: true,  CREATOR: true,  MEMBER: false },
      "analytics.view.all":       { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: true,  CREATOR: false, MEMBER: false },
      "analytics.export":         { OWNER: true, ADMIN: true,  MANAGER: true,  ANALYST: true,  CREATOR: false, MEMBER: false },
      "analytics.raw_data":       { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: true,  CREATOR: false, MEMBER: false },
      "analytics.cross_tab":      { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: true,  CREATOR: false, MEMBER: false },

      // API & Integrations
      "api.keys.view":            { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "api.keys.create":          { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "api.keys.revoke":          { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "webhook.manage":           { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },

      // Audit & Compliance
      "audit.log.view":           { OWNER: true, ADMIN: true,  MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false },
      "audit.log.export":         { OWNER: true, ADMIN: false, MANAGER: false, ANALYST: false, CREATOR: false, MEMBER: false }
    }
  },

  TRANSFER: {
    id: "ORG_004",
    ownershipTransfer: {
      requiresCurrentOwnerApproval: true,
      cooldownDays: 30,
      notifyAllAdmins: true
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // AUDIT TRAIL REQUIREMENTS
  // ─────────────────────────────────────────────────────────────────────────────
  AUDIT_TRAIL: {
    id: "ORG_005",
    rule: "All significant organization actions must be logged",
    requiredFields: [
      "timestamp",
      "actorId",
      "actorRole",
      "action",
      "resourceType",
      "resourceId",
      "previousValue",
      "newValue",
      "ipAddress",
      "userAgent"
    ],
    retentionPeriod: {
      STARTER: "90 days",
      PROFESSIONAL: "1 year",
      ENTERPRISE: "7 years"
    },
    mandatoryActions: [
      "member.invite",
      "member.remove",
      "member.role.change",
      "content.publish",
      "content.delete.any",
      "org.settings.edit",
      "org.billing.manage",
      "api.keys.create",
      "api.keys.revoke",
      "audit.log.export"
    ],
    sensitiveActions: [
      "org.delete",
      "org.transfer",
      "analytics.raw_data",
      "member.permissions.edit"
    ],
    alertOnSensitiveActions: true,
    immutableLog: true,
    exportFormats: ["JSON", "CSV", "PDF"]
  }
}

export { ORGANIZATION_RULES }
```

## 15.9.2 Subscription Rules

```typescript
const SUBSCRIPTION_RULES = {
  TIERS: {
    id: "SUB_001",
    tiers: {
      FREE: {
        price: 0,
        features: ["3 polls/day", "Basic analytics", "Public visibility only"]
      },
      STARTER: {
        price: 99,
        currency: "USD",
        billing: "monthly",
        features: ["1000 survey responses", "5 team members", "Basic targeting"]
      },
      PROFESSIONAL: {
        price: 299,
        currency: "USD",
        billing: "monthly",
        features: ["10000 survey responses", "25 team members", "Advanced targeting", "API access"]
      },
      ENTERPRISE: {
        price: 999,
        currency: "USD",
        billing: "monthly",
        features: ["Unlimited responses", "Unlimited members", "Custom branding", "SLA"]
      }
    }
  },

  UPGRADE: {
    id: "SUB_002",
    proratedBilling: true,
    immediateAccess: true
  },

  DOWNGRADE: {
    id: "SUB_003",
    effectiveAt: "billing_cycle_end",
    dataRetention: "30_days",
    gracePeriod: "7_days"
  },

  CANCELLATION: {
    id: "SUB_004",
    noticePeriod: 0,
    refundPolicy: "prorated_for_annual",
    dataExportWindow: "30_days"
  }
}

export { SUBSCRIPTION_RULES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.10 CONTENT STATE MACHINE
# ══════════════════════════════════════════════════════════════════════════════

## 15.10.1 Poll State Machine

```typescript
const POLL_STATE_MACHINE = {
  states: ["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED", "DELETED"],

  transitions: {
    DRAFT: {
      PUBLISH: { to: "ACTIVE", conditions: ["hasQuestion", "hasOptions", "validDuration"] },
      SCHEDULE: { to: "SCHEDULED", conditions: ["hasQuestion", "hasOptions", "futureStartDate"] },
      DELETE: { to: "DELETED", conditions: [] }
    },
    SCHEDULED: {
      START: { to: "ACTIVE", conditions: ["startTimeReached"], trigger: "automatic" },
      CANCEL: { to: "DRAFT", conditions: [] },
      DELETE: { to: "DELETED", conditions: [] }
    },
    ACTIVE: {
      PAUSE: { to: "PAUSED", conditions: ["isCreatorOrAdmin"] },
      END: { to: "COMPLETED", conditions: [], trigger: "automatic_or_manual" },
      DELETE: { to: "DELETED", conditions: ["isAdmin"] }
    },
    PAUSED: {
      RESUME: { to: "ACTIVE", conditions: ["notExpired"] },
      END: { to: "COMPLETED", conditions: [] },
      DELETE: { to: "DELETED", conditions: ["isAdmin"] }
    },
    COMPLETED: {
      ARCHIVE: { to: "ARCHIVED", conditions: ["ageGreaterThan30Days"] },
      DELETE: { to: "DELETED", conditions: ["isAdmin"] }
    },
    ARCHIVED: {
      RESTORE: { to: "COMPLETED", conditions: ["isAdmin"] },
      DELETE: { to: "DELETED", conditions: ["isAdmin"] }
    },
    DELETED: {}
  },

  sideEffects: {
    "DRAFT->ACTIVE": ["calculateReliabilityScore", "notifyFollowers", "updateHotScore"],
    "ACTIVE->COMPLETED": ["finalizeResults", "openDiscussion", "sendCompletionNotifications"],
    "COMPLETED->ARCHIVED": ["reduceStoragePriority"],
    "*->DELETED": ["softDelete", "removeFromFeeds", "cancelNotifications"]
  }
}

export { POLL_STATE_MACHINE }
```

## 15.10.2 Survey State Machine

```typescript
const SURVEY_STATE_MACHINE = {
  states: ["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED", "DELETED"],

  transitions: {
    DRAFT: {
      PUBLISH: { to: "ACTIVE", conditions: ["hasSections", "hasQuestions", "validDuration", "orgVerified"] },
      SCHEDULE: { to: "SCHEDULED", conditions: ["hasSections", "hasQuestions", "futureStartDate"] },
      DELETE: { to: "DELETED", conditions: [] }
    },
    SCHEDULED: {
      START: { to: "ACTIVE", conditions: ["startTimeReached"], trigger: "automatic" },
      CANCEL: { to: "DRAFT", conditions: [] },
      DELETE: { to: "DELETED", conditions: [] }
    },
    ACTIVE: {
      PAUSE: { to: "PAUSED", conditions: ["isOrgAdmin"] },
      END: { to: "COMPLETED", conditions: [], trigger: "automatic_or_manual_or_quota" },
      DELETE: { to: "DELETED", conditions: ["isOrgOwner"] }
    },
    PAUSED: {
      RESUME: { to: "ACTIVE", conditions: ["notExpired"] },
      END: { to: "COMPLETED", conditions: [] },
      DELETE: { to: "DELETED", conditions: ["isOrgOwner"] }
    },
    COMPLETED: {
      ARCHIVE: { to: "ARCHIVED", conditions: [] },
      REOPEN: { to: "ACTIVE", conditions: ["isOrgAdmin", "withinReopenWindow"] }
    },
    ARCHIVED: {
      DELETE: { to: "DELETED", conditions: ["isOrgOwner", "dataRetentionExpired"] }
    },
    DELETED: {}
  },

  sideEffects: {
    "DRAFT->ACTIVE": ["sendInvitations", "startReminders"],
    "ACTIVE->COMPLETED": ["calculateFinalStats", "generateReport", "sendCompletionNotifications"],
    "ACTIVE->PAUSED": ["pauseReminders", "notifyPendingRespondents"]
  }
}

export { SURVEY_STATE_MACHINE }
```

## 15.10.3 User State Machine

```typescript
const USER_STATE_MACHINE = {
  states: ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "BANNED", "DELETED", "DORMANT"],

  transitions: {
    PENDING_VERIFICATION: {
      VERIFY: { to: "ACTIVE", conditions: ["emailOrPhoneVerified"] },
      EXPIRE: { to: "DELETED", conditions: ["verificationDeadlineExceeded"], trigger: "automatic" }
    },
    ACTIVE: {
      SUSPEND: { to: "SUSPENDED", conditions: ["violationDetected", "adminAction"] },
      BAN: { to: "BANNED", conditions: ["severeViolation", "adminAction"] },
      DELETE: { to: "DELETED", conditions: ["userRequest", "gracePeriodComplete"] },
      DORMANT: { to: "DORMANT", conditions: ["inactivityThresholdMet"], trigger: "automatic" }
    },
    SUSPENDED: {
      UNSUSPEND: { to: "ACTIVE", conditions: ["suspensionExpired", "adminAction"] },
      BAN: { to: "BANNED", conditions: ["repeatOffense", "adminAction"] }
    },
    BANNED: {
      UNBAN: { to: "ACTIVE", conditions: ["appealApproved", "adminAction"] },
      DELETE: { to: "DELETED", conditions: ["userRequest"] }
    },
    DORMANT: {
      REACTIVATE: { to: "ACTIVE", conditions: ["userLogin"] }
    },
    DELETED: {}
  },

  sideEffects: {
    "ACTIVE->SUSPENDED": ["revokeActiveSessions", "hideContent", "sendNotification"],
    "ACTIVE->BANNED": ["revokeAllSessions", "hideAllContent", "sendNotification"],
    "*->DELETED": ["anonymizeResponses", "deletePersonalData", "revokeAllSessions"],
    "ACTIVE->DORMANT": ["sendReactivationEmail"]
  }
}

export { USER_STATE_MACHINE }
```


## 15.10.4 Content Deletion Retention Policy

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT DELETION RETENTION POLICY
// [AUTHORITATIVE] Defines how long deleted content is retained before hard delete
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * DELETION TYPES:
 *
 * 1. SOFT DELETE: Content marked as deleted but data preserved
 *    - Immediately hidden from all feeds and search
 *    - Can be restored within grace period
 *    - Data retained for compliance/audit
 *
 * 2. HARD DELETE: Data permanently removed
 *    - Occurs after retention period expires
 *    - Irreversible
 *    - Only metadata may be kept for audit
 */

const CONTENT_DELETION_RETENTION = {
  // ─────────────────────────────────────────────────────────────────────────────
  // POLL DELETION
  // ─────────────────────────────────────────────────────────────────────────────
  POLL: {
    softDeleteEnabled: true,
    gracePeriodDays: 7,           // Creator can restore within 7 days
    retentionDays: 30,            // Data kept for 30 days after soft delete
    hardDeleteAfter: 30,          // Hard delete 30 days after soft delete

    onSoftDelete: {
      hideFromFeeds: true,
      hideFromSearch: true,
      hideFromProfile: true,
      preserveResponses: true,    // Keep response data
      preserveAnalytics: true,    // Keep analytics snapshots
      notifyCreator: true
    },

    onHardDelete: {
      deleteResponses: true,      // Anonymous aggregates may be kept
      deleteAnalytics: false,     // Keep aggregated analytics
      deleteMedia: true,          // Delete associated images/videos
      auditLogRetention: 365      // Keep deletion audit log for 1 year
    },

    exceptions: {
      premiumContent: {
        retentionDays: 90         // Premium creators get longer retention
      },
      disputedContent: {
        retentionDays: 180,       // Reported content kept longer for review
        requireManualApproval: true
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SURVEY DELETION (B2B - More strict retention)
  // ─────────────────────────────────────────────────────────────────────────────
  SURVEY: {
    softDeleteEnabled: true,
    gracePeriodDays: 30,          // 30 days to restore (business decision)
    retentionDays: 90,            // Keep for 90 days after soft delete
    hardDeleteAfter: 90,

    onSoftDelete: {
      hideFromOrgDashboard: true,
      preserveResponses: true,
      preserveAnalytics: true,
      preserveExports: true,      // Keep generated reports
      notifyOrgAdmins: true
    },

    onHardDelete: {
      deleteResponses: true,
      deleteAnalytics: false,     // Aggregates kept for org reporting
      deleteExports: true,
      auditLogRetention: 2555     // 7 years for compliance
    },

    complianceOverride: {
      // Some industries require longer retention
      healthcare: { retentionDays: 2555 },   // 7 years HIPAA
      financial: { retentionDays: 2555 },    // 7 years SOX
      gdprRequest: { hardDeleteAfter: 30 }   // GDPR requires faster deletion
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST DELETION
  // ─────────────────────────────────────────────────────────────────────────────
  TEST: {
    softDeleteEnabled: true,
    gracePeriodDays: 14,
    retentionDays: 60,
    hardDeleteAfter: 60,

    onSoftDelete: {
      hideFromFeeds: true,
      preserveResults: true,      // Test results preserved
      preserveBadges: true,       // Earned badges ALWAYS preserved [P-034]
      updateBadgeLinks: true      // Disable "Take this test" links
    },

    onHardDelete: {
      deleteResults: true,
      deleteBadges: false,        // NEVER delete earned badges
      deleteMedia: true,
      auditLogRetention: 365
    },

    // Badge preservation rule (immutable)
    badgePolicy: {
      neverDelete: true,
      updateMetadata: true,       // Mark as "test no longer available"
      preserveScore: true         // Keep user's result
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // USER ACCOUNT DELETION
  // ─────────────────────────────────────────────────────────────────────────────
  USER: {
    softDeleteEnabled: true,
    gracePeriodDays: 30,          // GDPR: 30 days to reactivate
    retentionDays: 30,            // After grace, hard delete
    hardDeleteAfter: 30,

    onSoftDelete: {
      revokeAllSessions: true,
      hideProfile: true,
      hideContent: true,          // User's polls/tests hidden
      anonymizeResponses: true,   // Replace userId with hash
      notifyUser: true,
      sendConfirmationEmail: true
    },

    onHardDelete: {
      deletePersonalData: true,
      deleteAvatar: true,
      deleteDMs: true,            // Delete sent messages
      preserveAnonymizedResponses: true,
      auditLogRetention: 365
    },

    // Content handling on user deletion
    userContentPolicy: {
      polls: "PRESERVE_ANONYMOUS",   // Polls stay, creator = "Deleted User"
      surveys: "TRANSFER_TO_ORG",    // Org surveys stay with org
      tests: "PRESERVE_ANONYMOUS",   // Tests stay, badges preserved
      comments: "ANONYMIZE"          // Comments stay, author = "Deleted User"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // COMMENT DELETION
  // ─────────────────────────────────────────────────────────────────────────────
  COMMENT: {
    softDeleteEnabled: true,
    gracePeriodDays: 0,           // No restore (immediate hide)
    retentionDays: 7,             // Keep for moderation review
    hardDeleteAfter: 7,

    onSoftDelete: {
      showPlaceholder: true,      // "[Comment deleted]"
      preserveReplies: true,      // Keep reply chain
      preserveVotes: false        // Remove vote counts
    },

    onHardDelete: {
      deleteText: true,
      orphanReplies: false        // Replies stay, point to deleted comment
    }
  }
} as const

// Scheduled job: Process content for hard deletion
async function processScheduledDeletions(): Promise<DeletionReport> {
  const now = new Date()
  const report: DeletionReport = {
    processedAt: now,
    deletedCounts: { polls: 0, surveys: 0, tests: 0, users: 0, comments: 0 }
  }

  // Find all soft-deleted content past retention period
  for (const contentType of ["POLL", "SURVEY", "TEST", "USER", "COMMENT"] as const) {
    const config = CONTENT_DELETION_RETENTION[contentType]
    const cutoffDate = new Date(now.getTime() - config.hardDeleteAfter * 86400000)

    const toDelete = await db[contentType.toLowerCase()].findMany({
      where: {
        deletedAt: { not: null, lt: cutoffDate },
        hardDeletedAt: null
      }
    })

    for (const item of toDelete) {
      await performHardDelete(contentType, item.id, config.onHardDelete)
      report.deletedCounts[contentType.toLowerCase() as keyof typeof report.deletedCounts]++
    }
  }

  return report
}

interface DeletionReport {
  processedAt: Date
  deletedCounts: {
    polls: number
    surveys: number
    tests: number
    users: number
    comments: number
  }
}

export { CONTENT_DELETION_RETENTION, processScheduledDeletions }
export type { DeletionReport }
```


# ══════════════════════════════════════════════════════════════════════════════
# 15.11 RATE LIMITING RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.11.1 API Rate Limits

```typescript
const API_RATE_LIMITS = {
  GLOBAL: {
    id: "RATE_001",
    authenticated: {
      requests: 1000,
      window: 60,
      unit: "seconds"
    },
    anonymous: {
      requests: 100,
      window: 60,
      unit: "seconds"
    }
  },

  BY_ENDPOINT_TYPE: {
    id: "RATE_002",
    read: {
      requests: 300,
      window: 60
    },
    write: {
      requests: 60,
      window: 60
    },
    search: {
      requests: 30,
      window: 60
    }
  },

  BY_ACTION: {
    id: "RATE_003",
    actions: {
      // AUTH MUTATIONS
      register: { requests: 5, window: 3600 },
      login: { requests: 10, window: 900 },
      logout: { requests: 20, window: 60 },
      passwordReset: { requests: 3, window: 3600 },
      passwordChange: { requests: 5, window: 3600 },
      verifyEmail: { requests: 10, window: 3600 },

      // USER MUTATIONS
      updateProfile: { requests: 10, window: 3600 },
      uploadAvatar: { requests: 5, window: 3600 },
      deleteAccount: { requests: 1, window: 86400 },

      // CONTENT MUTATIONS
      createPoll: { requests: 10, window: 3600 },
      updatePoll: { requests: 30, window: 3600 },
      deletePoll: { requests: 10, window: 3600 },
      createSurvey: { requests: 5, window: 3600 },
      updateSurvey: { requests: 20, window: 3600 },
      deleteSurvey: { requests: 5, window: 3600 },
      createTest: { requests: 5, window: 3600 },
      updateTest: { requests: 20, window: 3600 },
      deleteTest: { requests: 5, window: 3600 },

      // PARTICIPATION MUTATIONS
      vote: { requests: 60, window: 60 },
      submitSurveyResponse: { requests: 30, window: 3600 },
      submitTestResponse: { requests: 20, window: 3600 },

      // SOCIAL MUTATIONS
      comment: { requests: 30, window: 60 },
      updateComment: { requests: 30, window: 60 },
      deleteComment: { requests: 30, window: 60 },
      voteOnComment: { requests: 120, window: 60 },
      follow: { requests: 100, window: 3600 },
      unfollow: { requests: 100, window: 3600 },
      block: { requests: 50, window: 3600 },
      unblock: { requests: 50, window: 3600 },
      report: { requests: 10, window: 3600 },

      // ORGANIZATION MUTATIONS
      createOrganization: { requests: 3, window: 86400 },
      updateOrganization: { requests: 20, window: 3600 },
      inviteMember: { requests: 50, window: 3600 },
      removeMember: { requests: 20, window: 3600 },
      changeMemberRole: { requests: 20, window: 3600 },

      // NOTIFICATION MUTATIONS
      markNotificationRead: { requests: 100, window: 60 },
      updateNotificationPreferences: { requests: 10, window: 3600 },

      // SENSITIVE MUTATIONS (extra strict)
      exportData: { requests: 5, window: 86400 },
      downloadResponses: { requests: 10, window: 3600 },
      apiKeyCreate: { requests: 5, window: 86400 },
      apiKeyRevoke: { requests: 10, window: 3600 },
      webhookCreate: { requests: 10, window: 3600 }
    }
  },

  PREMIUM_MULTIPLIER: {
    id: "RATE_004",
    multiplier: 2.0
  },

  ORGANIZATION_MULTIPLIER: {
    id: "RATE_005",
    STARTER: 2.0,
    PROFESSIONAL: 5.0,
    ENTERPRISE: 10.0
  }
}

export { API_RATE_LIMITS }
```

## 15.11.2 Abuse Prevention

```typescript
const ABUSE_PREVENTION_RULES = {
  VELOCITY_CHECKS: {
    id: "ABUSE_001",
    rules: [
      { action: "account_creation", limit: 3, window: 3600, per: "ip" },
      { action: "poll_creation", limit: 20, window: 86400, per: "user" },
      { action: "comments", limit: 100, window: 86400, per: "user" },
      { action: "votes", limit: 500, window: 86400, per: "user" },
      { action: "follows", limit: 200, window: 86400, per: "user" }
    ]
  },

  CAPTCHA: {
    id: "ABUSE_002",
    triggerConditions: [
      "Failed login attempts > 3",
      "Rapid form submissions",
      "Suspicious IP reputation",
      "Bot-like behavior detected"
    ],
    provider: "turnstile"
  },

  IP_BLOCKING: {
    id: "ABUSE_003",
    autoBlockThreshold: 10,
    autoBlockDuration: 3600,
    manualBlockDuration: "permanent"
  }
}

export { ABUSE_PREVENTION_RULES }
```

## 15.11.3 Input Sanitization Requirements

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// INPUT SANITIZATION RULES
// [REFERENCE] BIBLE-017 Section 17.4.2 for XSS prevention
// Purpose: Ensure all user input is sanitized before storage/rendering
// ═══════════════════════════════════════════════════════════════════════════════

const INPUT_SANITIZATION_RULES = {
  // ─────────────────────────────────────────────────────────────────────────────
  // FIELD TYPE SANITIZATION
  // ─────────────────────────────────────────────────────────────────────────────
  BY_FIELD_TYPE: {
    id: "SANIT_001",
    types: {
      PLAIN_TEXT: {
        description: "No HTML, no special characters",
        operations: [
          "stripHtml",
          "escapeHtmlEntities",
          "normalizeWhitespace",
          "trimEdges"
        ],
        fields: [
          "username",
          "displayName",
          "pollTitle",
          "surveyTitle",
          "testTitle",
          "optionText",
          "categoryName"
        ]
      },
      MARKDOWN_TEXT: {
        description: "Limited markdown allowed",
        operations: [
          "sanitizeMarkdown",
          "removeDisallowedTags",
          "sanitizeUrls",
          "escapeCodeBlocks"
        ],
        allowedTags: ["strong", "em", "code", "pre", "a", "ul", "ol", "li", "blockquote", "p", "br"],
        fields: [
          "description",
          "bio",
          "commentContent",
          "questionText",
          "surveyDescription"
        ]
      },
      RICH_TEXT: {
        description: "Extended HTML allowed (premium/org only)",
        operations: [
          "sanitizeHtml",
          "removeScripts",
          "sanitizeStyles",
          "validateUrls"
        ],
        fields: [
          "surveyInstructions",
          "testResultDescription",
          "orgDescription"
        ]
      },
      URL: {
        description: "Validated URL",
        operations: [
          "validateUrl",
          "enforceHttps",
          "blockJavascript",
          "blockDataUri"
        ],
        fields: [
          "avatarUrl",
          "website",
          "imageUrl",
          "bannerUrl"
        ]
      },
      EMAIL: {
        description: "Validated email",
        operations: [
          "validateEmailFormat",
          "normalizeCase",
          "checkDisposable"
        ],
        fields: ["email"]
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DANGEROUS PATTERNS TO BLOCK
  // ─────────────────────────────────────────────────────────────────────────────
  BLOCKED_PATTERNS: {
    id: "SANIT_002",
    patterns: [
      { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi, name: "script_tags" },
      { pattern: /javascript:/gi, name: "javascript_protocol" },
      { pattern: /data:/gi, name: "data_protocol" },
      { pattern: /vbscript:/gi, name: "vbscript_protocol" },
      { pattern: /on\w+\s*=/gi, name: "event_handlers" },
      { pattern: /expression\s*\(/gi, name: "css_expression" },
      { pattern: /url\s*\(\s*['"]?\s*javascript/gi, name: "css_javascript" },
      { pattern: /<iframe[\s\S]*?>/gi, name: "iframe_tags" },
      { pattern: /<object[\s\S]*?>/gi, name: "object_tags" },
      { pattern: /<embed[\s\S]*?>/gi, name: "embed_tags" },
      { pattern: /<link[\s\S]*?>/gi, name: "link_tags" },
      { pattern: /<meta[\s\S]*?>/gi, name: "meta_tags" }
    ],
    onMatch: "REJECT_WITH_ERROR",
    logViolation: true,
    alertThreshold: 10  // Alert if same user triggers 10+ times
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SANITIZATION LIBRARY CONFIG
  // ─────────────────────────────────────────────────────────────────────────────
  LIBRARY_CONFIG: {
    id: "SANIT_003",
    library: "dompurify",  // Server-side: use isomorphic-dompurify
    globalConfig: {
      ALLOWED_TAGS: [],   // Override per field type
      ALLOWED_ATTR: [],   // Override per field type
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      SANITIZE_DOM: true,
      WHOLE_DOCUMENT: false
    },
    hooks: {
      uponSanitizeElement: "log_removed_elements",
      afterSanitizeElements: "validate_output"
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SERVER ACTION INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────
  ACTION_INTEGRATION: {
    id: "SANIT_004",
    rule: "All server actions MUST sanitize inputs before processing",
    middleware: "sanitizeInputMiddleware",
    order: ["validate_zod", "sanitize_strings", "process_action"],
    failureAction: "REJECT_REQUEST",
    bypassRoles: []  // No bypass - even admins get sanitized
  }
}

export { INPUT_SANITIZATION_RULES }
```


# ══════════════════════════════════════════════════════════════════════════════
# 15.12 DATA RETENTION RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.12.1 Retention Periods

```typescript
const DATA_RETENTION_RULES = {
  USER_DATA: {
    id: "RET_001",
    activeAccount: "indefinite",
    deletedAccount: "90_days",
    dormantAccount: "24_months"
  },

  CONTENT_DATA: {
    id: "RET_002",
    activePoll: "indefinite",
    completedPoll: "indefinite",
    archivedPoll: "24_months",
    deletedPoll: "30_days"
  },

  RESPONSE_DATA: {
    id: "RET_003",
    pollResponses: "indefinite",
    surveyResponses: "36_months",
    testAttempts: "24_months"
  },

  ANALYTICS_DATA: {
    id: "RET_004",
    rawEvents: "90_days",
    aggregatedMetrics: "indefinite",
    userBehavior: "12_months"
  },

  LOGS: {
    id: "RET_005",
    auditLogs: "7_years",
    accessLogs: "90_days",
    errorLogs: "30_days",
    securityLogs: "3_years"
  },

  NOTIFICATIONS: {
    id: "RET_006",
    inApp: "90_days",
    deliveryLogs: "30_days"
  }
}

export { DATA_RETENTION_RULES }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.13 RULE VALIDATION FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 15.13.1 Content Validation

```typescript
interface ContentValidationResult {
  valid: boolean
  errors: Array<{ field: string; rule: string; message: string }>
  warnings: Array<{ field: string; rule: string; message: string }>
}

async function validatePollCreation(
  poll: CreatePollInput,
  userId: string
): Promise<ContentValidationResult> {
  const errors: ContentValidationResult["errors"] = []
  const warnings: ContentValidationResult["warnings"] = []

  if (poll.title.length < POLL_CREATION_RULES.TITLE.minLength) {
    errors.push({
      field: "title",
      rule: "POLL_001",
      message: `Başlık en az ${POLL_CREATION_RULES.TITLE.minLength} karakter olmalı`
    })
  }

  if (poll.question.options.length < POLL_CREATION_RULES.OPTIONS.minOptions) {
    errors.push({
      field: "options",
      rule: "POLL_003",
      message: `En az ${POLL_CREATION_RULES.OPTIONS.minOptions} seçenek gerekli`
    })
  }

  const now = new Date()
  const minEnd = new Date(now.getTime() + POLL_CREATION_RULES.DURATION.minDurationHours * 3600000)
  const maxEnd = new Date(now.getTime() + POLL_CREATION_RULES.DURATION.maxDurationDays * 86400000)

  if (poll.endsAt < minEnd || poll.endsAt > maxEnd) {
    errors.push({
      field: "endsAt",
      rule: "POLL_004",
      message: `Süre ${POLL_CREATION_RULES.DURATION.minDurationHours} saat ile ${POLL_CREATION_RULES.DURATION.maxDurationDays} gün arasında olmalı`
    })
  }

  return { valid: errors.length === 0, errors, warnings }
}

export { validatePollCreation }
export type { ContentValidationResult }
```

## 15.13.2 Eligibility Checks

```typescript
interface EligibilityResult {
  eligible: boolean
  reason?: string
  ruleId?: string
}

async function checkParticipationEligibility(
  userId: string,
  contentId: string,
  contentType: "POLL" | "SURVEY" | "TEST"
): Promise<EligibilityResult> {
  return { eligible: true }
}

async function checkCommentEligibility(
  userId: string,
  discussionId: string
): Promise<EligibilityResult> {
  return { eligible: true }
}

async function checkContentCreationEligibility(
  userId: string,
  contentType: "POLL" | "SURVEY" | "TEST"
): Promise<EligibilityResult> {
  return { eligible: true }
}

export {
  checkParticipationEligibility,
  checkCommentEligibility,
  checkContentCreationEligibility
}
export type { EligibilityResult }
```

## 15.13.3 State Transition Validation

```typescript
interface TransitionResult {
  allowed: boolean
  reason?: string
  sideEffects?: string[]
}

function validateStateTransition(
  entityType: "POLL" | "SURVEY" | "TEST" | "USER",
  currentState: string,
  targetState: string,
  context: Record<string, unknown>
): TransitionResult {
  // [DECISION] Test uses similar state machine to Poll (both are user-created content)
  // See BIBLE-006 for content type differences
  const stateMachine = {
    POLL: POLL_STATE_MACHINE,
    SURVEY: SURVEY_STATE_MACHINE,
    TEST: POLL_STATE_MACHINE,  // Tests follow poll lifecycle
    USER: USER_STATE_MACHINE
  }[entityType]

  const transitions = stateMachine.transitions[currentState]
  if (!transitions) {
    return { allowed: false, reason: "Invalid current state" }
  }

  const transition = Object.entries(transitions).find(([_, t]) => t.to === targetState)
  if (!transition) {
    return { allowed: false, reason: `Transition from ${currentState} to ${targetState} not allowed` }
  }

  const [action, config] = transition

  const sideEffects = stateMachine.sideEffects[`${currentState}->${targetState}`] ||
                      stateMachine.sideEffects[`*->${targetState}`] ||
                      []

  return { allowed: true, sideEffects }
}

export { validateStateTransition }
export type { TransitionResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.14 VERSION 3.0 NEW BUSINESS RULES
# ══════════════════════════════════════════════════════════════════════════════

## 15.14.1 Locked Demographics Rules (P-012)

[REFERENCE] BIBLE-005 Section 5.2.3 - Locked Demographics System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// LOCKED DEMOGRAPHICS BUSINESS RULES
// [DECISION P-012] Demographics are LOCKED after registration
// ══════════════════════════════════════════════════════════════════════════════

const DEMOGRAPHIC_FIELD_RULES = {
  IMMUTABLE: {
    fields: ["birthYear", "birthMonth", "gender", "country", "region", "city", "educationLevel"],
    changeProcess: "SUPPORT_TICKET_REQUIRED",
    verificationRequired: true,
    cooldownDays: 365,
    maxChangesPerYear: 1
  },
  MUTABLE: {
    fields: ["maritalStatus", "profession", "employmentStatus"],
    changeProcess: "USER_SELF_SERVICE",
    verificationRequired: false,
    cooldownDays: 0,
    maxChangesPerYear: null
  }
} as const

function canUpdateDemographicField(fieldName: string): { allowed: boolean, process: string } {
  if (DEMOGRAPHIC_FIELD_RULES.MUTABLE.fields.includes(fieldName as any)) {
    return { allowed: true, process: "USER_SELF_SERVICE" }
  }
  if (DEMOGRAPHIC_FIELD_RULES.IMMUTABLE.fields.includes(fieldName as any)) {
    return { allowed: false, process: "SUPPORT_TICKET_REQUIRED" }
  }
  return { allowed: false, process: "INVALID" }
}

export { DEMOGRAPHIC_FIELD_RULES, canUpdateDemographicField }
```

## 15.14.2 PULSE + COMMENTS Access Rules (P-016)

[REFERENCE] BIBLE-010 Section 10.1.2 - Discussion Access Rules

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PULSE + COMMENTS ACCESS BUSINESS RULES
// [DECISION P-016] Plus tier grants PULSE/COMMENTS access without participation
// ══════════════════════════════════════════════════════════════════════════════

const PULSE_COMMENTS_ACCESS_RULES = {
  accessPriority: ["ADMIN", "CONTENT_CREATOR", "PARTICIPATED", "PREMIUM_SUBSCRIBER", "PLUS_SUBSCRIBER"],
  permissions: {
    ADMIN: { canComment: true, canVote: true, canViewPulse: true },
    CONTENT_CREATOR: { canComment: true, canVote: true, canViewPulse: true },
    PARTICIPATED: { canComment: true, canVote: true, canViewPulse: true },
    PREMIUM_SUBSCRIBER: { canComment: true, canVote: true, canViewPulse: true },
    PLUS_SUBSCRIBER: { canComment: true, canVote: true, canViewPulse: true },
    NO_ACCESS: { canComment: false, canVote: false, canViewPulse: false }
  },
  subscriptionAccess: ["PLUS", "PREMIUM"]
} as const

export { PULSE_COMMENTS_ACCESS_RULES }
```

## 15.14.3 Live Poll Rules (P-011)

[REFERENCE] BIBLE-006 Section 6.2.6 - Live Poll Feature

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// LIVE POLL BUSINESS RULES
// [DECISION P-011] Live Polls require Premium subscription
// ══════════════════════════════════════════════════════════════════════════════

const LIVE_POLL_RULES = {
  creatorRequirements: { minimumTier: "PREMIUM" },
  sessionLimits: {
    maxParticipants: 10000,
    maxDurationMinutes: 240,
    maxConcurrentSessions: 3
  },
  joinCode: {
    length: 6,
    charset: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  },
  participantRules: {
    requireAuth: false,
    allowAnonymous: true,
    allowLateJoin: true,
    allowVoteChange: false
  }
} as const

function canCreateLivePoll(tier: string | null): boolean {
  return tier === "PREMIUM"
}

export { LIVE_POLL_RULES, canCreateLivePoll }
```

## 15.14.4 Pre-Test Rules (P-014)

[REFERENCE] BIBLE-006 Section 6.2.7 - Poll Pre-Test System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PRE-TEST BUSINESS RULES
// [DECISION P-014] Pre-tests for polls require Premium tier
// ══════════════════════════════════════════════════════════════════════════════

const PRE_TEST_RULES = {
  creationRules: {
    POLL: { minimumTier: "PREMIUM" },
    SURVEY: { minimumTier: null }
  },
  questionLimits: { min: 1, max: 5, recommended: 3 },
  scoringRules: { defaultPassing: 60, min: 0, max: 100 },
  attemptRules: { defaultMax: 1, min: 1, max: 3 }
} as const

function canCreatePreTest(contentType: "POLL" | "SURVEY", tier: string | null): boolean {
  if (contentType === "SURVEY") return true
  return tier === "PREMIUM"
}

export { PRE_TEST_RULES, canCreatePreTest }
```

## 15.14.5 Survey B2B Rules (P-015)

[REFERENCE] BIBLE-006 Section 6.3.1 - Survey = B2B SaaS ONLY

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SURVEY B2B BUSINESS RULES
// [DECISION P-015] Surveys are EXCLUSIVELY B2B SaaS (organizations only)
// ══════════════════════════════════════════════════════════════════════════════

const SURVEY_B2B_RULES = {
  creationRules: {
    requiresOrganization: true,
    requiresPaidPlan: true,
    allowIndividualCreation: false
  },
  organizationTiers: {
    STARTER: { price: 99, surveysPerMonth: 10, responsesPerSurvey: 1000 },
    PROFESSIONAL: { price: 299, surveysPerMonth: 50, responsesPerSurvey: 10000 },
    ENTERPRISE: { price: 999, surveysPerMonth: null, responsesPerSurvey: 100000 }
  },
  contentOwnership: {
    POLL: { requiresOrg: false },
    SURVEY: { requiresOrg: true },
    TEST: { requiresOrg: false }
  }
} as const

function canCreateSurvey(organizationId: string | null): boolean {
  return organizationId !== null
}

export { SURVEY_B2B_RULES, canCreateSurvey }
```

## 15.14.6 Test Badge Rules (P-017)

[REFERENCE] BIBLE-006 Section 6.4.2a - Test Badge System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST BADGE BUSINESS RULES
// [DECISION P-017] Test results create profile BADGES
// ══════════════════════════════════════════════════════════════════════════════

const TEST_BADGE_RULES = {
  badgeCreation: { autoCreateOnCompletion: true },
  profileDisplay: {
    maxPinnedBadges: 5,
    maxVisibleInGrid: 12,
    defaultDisplayOnProfile: true
  },
  sharing: {
    platforms: ["TWITTER", "FACEBOOK", "INSTAGRAM", "LINKEDIN", "COPY_LINK"],
    generateShareImage: true
  }
} as const

function canPinBadge(currentPinnedCount: number): boolean {
  return currentPinnedCount < TEST_BADGE_RULES.profileDisplay.maxPinnedBadges
}

export { TEST_BADGE_RULES, canPinBadge }
```

## 15.14.7 Subscription Tier Rules

[REFERENCE] BIBLE-005 Section 5.3 - Subscription Tiers

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION TIER BUSINESS RULES
// ══════════════════════════════════════════════════════════════════════════════

const SUBSCRIPTION_TIER_RULES = {
  FREE: {
    price: { monthly: 0, yearly: 0 },
    features: {
      pollsPerDay: 3,
      testsPerWeek: 3,
      voiceAccessWithoutParticipation: false,
      targetAudienceSelection: false,
      preTestForPolls: false,
      livePollCreation: false,
      customThemes: false,
      adsEnabled: true
    }
  },
  PLUS: {
    price: { monthly: 4.99, yearly: 49.99 },
    features: {
      pollsPerDay: 10,
      testsPerWeek: 10,
      voiceAccessWithoutParticipation: true,
      targetAudienceSelection: false,
      preTestForPolls: false,
      livePollCreation: false,
      customThemes: false,
      adsEnabled: false
    }
  },
  PREMIUM: {
    price: { monthly: 9.99, yearly: 99.99 },
    features: {
      pollsPerDay: null,
      testsPerWeek: null,
      voiceAccessWithoutParticipation: true,
      targetAudienceSelection: true,
      preTestForPolls: true,
      livePollCreation: true,
      customThemes: true,
      adsEnabled: false
    }
  }
} as const

type SubscriptionTier = keyof typeof SUBSCRIPTION_TIER_RULES

function checkFeatureAccess(tier: SubscriptionTier, feature: string): boolean {
  const features = SUBSCRIPTION_TIER_RULES[tier].features as Record<string, any>
  const value = features[feature]
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value > 0
  if (value === null) return true
  return false
}

export { SUBSCRIPTION_TIER_RULES, checkFeatureAccess }
export type { SubscriptionTier }
```




# ══════════════════════════════════════════════════════════════════════════════
# 15.12 PERMISSION CACHING STRATEGY
# ══════════════════════════════════════════════════════════════════════════════

## 15.12.1 Permission Cache Architecture

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// REDIS-BASED PERMISSION CACHING
// Reduces database load for frequently checked permissions
// ══════════════════════════════════════════════════════════════════════════════

const PERMISSION_CACHE_CONFIG = {
  // Cache key prefixes
  KEYS: {
    USER_PERMISSIONS: "perm:user:",           // perm:user:{userId}
    CONTENT_ACCESS: "perm:access:",           // perm:access:{userId}:{contentId}
    ORG_MEMBERSHIP: "perm:org:",              // perm:org:{userId}:{orgId}
    SUBSCRIPTION_TIER: "perm:sub:",           // perm:sub:{userId}
    FEATURE_FLAGS: "perm:flags:",             // perm:flags:{userId}
    RATE_LIMITS: "perm:rate:",                // perm:rate:{userId}:{action}
  },

  // TTL values (in seconds)
  TTL: {
    USER_PERMISSIONS: 300,          // 5 minutes - general permissions
    CONTENT_ACCESS: 60,             // 1 minute - content-specific (changes frequently)
    ORG_MEMBERSHIP: 600,            // 10 minutes - org roles rarely change
    SUBSCRIPTION_TIER: 3600,        // 1 hour - subscription changes are infrequent
    FEATURE_FLAGS: 1800,            // 30 minutes - feature flags
    RATE_LIMITS: 60                 // 1 minute - rate limit windows
  },

  // Cache warm-up settings
  WARMUP: {
    ENABLED: true,
    ON_LOGIN: true,                 // Pre-cache on user login
    ON_SUBSCRIPTION_CHANGE: true,   // Refresh on tier change
    BATCH_SIZE: 100                 // Users to warm up per batch
  },

  // Invalidation settings
  INVALIDATION: {
    CASCADE_ON_ROLE_CHANGE: true,
    CASCADE_ON_SUBSCRIPTION: true,
    BROADCAST_CHANNEL: "permission:invalidate"
  }
} as const


// ══════════════════════════════════════════════════════════════════════════════
// [DECISION P-042] REDIS FAILURE FALLBACK STRATEGY
// Defines behavior when Redis is unavailable for permission caching
// ══════════════════════════════════════════════════════════════════════════════

const REDIS_FAILURE_FALLBACK = {
  // Circuit breaker configuration
  circuitBreaker: {
    enabled: true,
    failureThreshold: 3,              // Open circuit after 3 consecutive failures
    successThreshold: 2,              // Close circuit after 2 consecutive successes
    timeout: 30000,                   // 30 seconds before trying Redis again

    states: {
      CLOSED: "Normal operation, using Redis",
      OPEN: "Redis unavailable, using fallback",
      HALF_OPEN: "Testing if Redis is back"
    }
  },

  // Fallback strategy when circuit is OPEN
  fallbackStrategy: {
    // Primary fallback: In-memory LRU cache
    primary: {
      type: "IN_MEMORY_LRU",
      maxSize: 10000,                 // Max 10K entries
      ttl: 60,                        // 1 minute TTL (shorter than Redis)
      evictionPolicy: "LRU"           // Least Recently Used
    },

    // Secondary fallback: Direct database query
    secondary: {
      type: "DATABASE_DIRECT",
      cacheResults: true,             // Cache in memory after DB query
      maxConcurrentQueries: 100,      // Limit concurrent DB queries
      timeout: 5000                   // 5 second timeout per query
    },

    // Last resort: Default restrictive permissions
    lastResort: {
      type: "DEFAULT_RESTRICTIVE",
      permissions: {
        canCreatePolls: true,         // Allow basic creation
        canCreateTests: false,
        canCreateSurveys: false,
        canAccessVoiceWithoutParticipation: false,
        canUseLivePolls: false,
        canUsePreTests: false,
        canUseTargetAudience: false,
        maxPollsPerDay: 1,            // Very limited
        maxPollOptions: 4             // Basic only
      },
      message: "Sistem geçici olarak sınırlı modda çalışıyor.",
      messageEn: "System is temporarily operating in limited mode."
    }
  },

  // Monitoring and alerting
  monitoring: {
    alertOnCircuitOpen: true,
    alertChannel: "PAGERDUTY",        // High priority alert
    metricsToTrack: [
      "redis.connection.failures",
      "redis.latency.p99",
      "cache.fallback.rate",
      "cache.hit.rate",
      "database.direct.queries"
    ],
    healthCheck: {
      interval: 10000,                // Check every 10 seconds
      endpoint: "/health/redis"
    }
  },

  // Recovery behavior
  recovery: {
    onRedisRestore: {
      warmupCache: true,              // Pre-populate from DB
      warmupPriority: "ACTIVE_USERS", // Start with currently active
      gradualMigration: true,         // Don't flood Redis
      migrationBatchSize: 100
    },

    // Metrics to confirm recovery
    recoveryConfirmation: {
      minSuccessRate: 0.95,           // 95% success rate required
      minSampleSize: 100,             // Over 100 operations
      confirmationPeriod: 60000       // 1 minute observation
    }
  },

  // Graceful degradation modes
  degradationModes: {
    FULL: {
      description: "All features available, using fallback cache",
      cacheAvailable: true,
      rateLimiting: true,
      realTimeFeatures: true
    },
    REDUCED: {
      description: "Core features only, some features disabled",
      cacheAvailable: true,
      rateLimiting: false,            // Disable rate limiting (allow more traffic)
      realTimeFeatures: false         // Disable live polls
    },
    MINIMAL: {
      description: "Emergency mode - read-only for most users",
      cacheAvailable: false,
      rateLimiting: false,
      realTimeFeatures: false,
      writeOperations: "CREATOR_ONLY" // Only creators can modify their content
    }
  }
}

// Implement circuit breaker pattern
class RedisCircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED"
  private failures: number = 0
  private successes: number = 0
  private lastFailure: Date | null = null

  async execute<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      // Check if timeout has passed
      if (this.lastFailure &&
          Date.now() - this.lastFailure.getTime() > REDIS_FAILURE_FALLBACK.circuitBreaker.timeout) {
        this.state = "HALF_OPEN"
      } else {
        return fallback()
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      return fallback()
    }
  }

  private onSuccess(): void {
    this.failures = 0
    if (this.state === "HALF_OPEN") {
      this.successes++
      if (this.successes >= REDIS_FAILURE_FALLBACK.circuitBreaker.successThreshold) {
        this.state = "CLOSED"
        this.successes = 0
      }
    }
  }

  private onFailure(): void {
    this.failures++
    this.lastFailure = new Date()
    this.successes = 0

    if (this.failures >= REDIS_FAILURE_FALLBACK.circuitBreaker.failureThreshold) {
      this.state = "OPEN"
      // Trigger alert
      alertOnCircuitOpen()
    }
  }
}

export { REDIS_FAILURE_FALLBACK, RedisCircuitBreaker }


// ══════════════════════════════════════════════════════════════════════════════
// CACHED PERMISSION DATA STRUCTURES
// ══════════════════════════════════════════════════════════════════════════════

interface CachedUserPermissions {
  userId: string
  tier: "FREE" | "PLUS" | "PREMIUM"
  organizationRoles: Array<{
    orgId: string
    role: "MEMBER" | "ADMIN" | "OWNER"
  }>
  globalPermissions: {
    canCreatePolls: boolean
    canCreateTests: boolean
    canCreateSurveys: boolean       // Only org admins
    canAccessVoiceWithoutParticipation: boolean
    canUseLivePolls: boolean
    canUsePreTests: boolean
    canUseTargetAudience: boolean
    canUseCustomThemes: boolean
    maxPollsPerDay: number
    maxTestsPerWeek: number
    maxPollOptions: number
  }
  featureFlags: Record<string, boolean>
  cachedAt: number                  // Unix timestamp
  expiresAt: number                 // Unix timestamp
}

interface CachedContentAccess {
  userId: string
  contentId: string
  contentType: "POLL" | "SURVEY" | "TEST"
  access: {
    canView: boolean
    canViewResults: boolean
    canParticipate: boolean
    canAccessVoice: boolean
    canWriteComments: boolean
    canModerate: boolean
    isCreator: boolean
    hasParticipated: boolean
  }
  reason?: string                   // Why access was granted/denied
  cachedAt: number
  expiresAt: number
}


// ══════════════════════════════════════════════════════════════════════════════
// PERMISSION CACHE SERVICE
// ══════════════════════════════════════════════════════════════════════════════

class PermissionCacheService {
  private redis: Redis

  constructor(redis: Redis) {
    this.redis = redis
    this.subscribeToInvalidation()
  }

  // Get user's cached permissions (or compute and cache)
  async getUserPermissions(userId: string): Promise<CachedUserPermissions> {
    const cacheKey = `${PERMISSION_CACHE_CONFIG.KEYS.USER_PERMISSIONS}${userId}`

    // Try cache first
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      const parsed = JSON.parse(cached) as CachedUserPermissions
      if (parsed.expiresAt > Date.now()) {
        return parsed
      }
    }

    // Cache miss - compute permissions
    const permissions = await this.computeUserPermissions(userId)

    // Store in cache
    await this.redis.setex(
      cacheKey,
      PERMISSION_CACHE_CONFIG.TTL.USER_PERMISSIONS,
      JSON.stringify(permissions)
    )

    return permissions
  }

  // Get content-specific access (or compute and cache)
  async getContentAccess(userId: string, contentId: string): Promise<CachedContentAccess> {
    const cacheKey = `${PERMISSION_CACHE_CONFIG.KEYS.CONTENT_ACCESS}${userId}:${contentId}`

    const cached = await this.redis.get(cacheKey)
    if (cached) {
      const parsed = JSON.parse(cached) as CachedContentAccess
      if (parsed.expiresAt > Date.now()) {
        return parsed
      }
    }

    // Cache miss - compute access
    const access = await this.computeContentAccess(userId, contentId)

    await this.redis.setex(
      cacheKey,
      PERMISSION_CACHE_CONFIG.TTL.CONTENT_ACCESS,
      JSON.stringify(access)
    )

    return access
  }

  // Compute user permissions from database
  private async computeUserPermissions(userId: string): Promise<CachedUserPermissions> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        subscription: true,
        organizationMembers: {
          with: { organization: true }
        }
      }
    })

    if (!user) throw new Error("User not found")

    const tier = user.subscription?.tier ?? "FREE"
    const tierRules = SUBSCRIPTION_TIER_RULES[tier as keyof typeof SUBSCRIPTION_TIER_RULES]

    const now = Date.now()

    return {
      userId,
      tier: tier as CachedUserPermissions["tier"],
      organizationRoles: user.organizationMembers.map(m => ({
        orgId: m.organizationId,
        role: m.role as "MEMBER" | "ADMIN" | "OWNER"
      })),
      globalPermissions: {
        canCreatePolls: true,
        canCreateTests: true,
        canCreateSurveys: user.organizationMembers.some(m => m.role !== "MEMBER"),
        canAccessVoiceWithoutParticipation: tierRules.features.voiceAccessWithoutParticipation,
        canUseLivePolls: tierRules.features.livePolls,
        canUsePreTests: tierRules.features.preTestFiltering,
        canUseTargetAudience: tierRules.features.targetAudience,
        canUseCustomThemes: tierRules.features.customThemes,
        maxPollsPerDay: tierRules.limits.pollsPerDay,
        maxTestsPerWeek: tierRules.limits.testsPerWeek,
        maxPollOptions: tierRules.limits.pollOptions
      },
      featureFlags: await this.getFeatureFlags(userId),
      cachedAt: now,
      expiresAt: now + PERMISSION_CACHE_CONFIG.TTL.USER_PERMISSIONS * 1000
    }
  }

  // Compute content access from database
  private async computeContentAccess(userId: string, contentId: string): Promise<CachedContentAccess> {
    const [content, userPerms, participation] = await Promise.all([
      db.select({
        id: polls.id,
        contentType: polls.contentType,
        creatorId: polls.creatorId,
        visibility: polls.visibility,
        organizationId: polls.organizationId,
        status: polls.status
      }).from(polls).where(eq(polls.id, contentId)).then(r => r[0]),
      this.getUserPermissions(userId),
      db.select().from(participations)
        .where(and(eq(participations.contentId, contentId), eq(participations.userId, userId)))
        .then(r => r[0])
    ])

    if (!content) {
      return this.createDeniedAccess(userId, contentId, "Content not found")
    }

    const isCreator = content.creatorId === userId
    const hasParticipated = !!participation

    // Determine access based on visibility, participation, and tier
    let canView = false
    let canViewResults = false
    let canAccessVoice = false
    let canWriteComments = false

    // Public content
    if (content.visibility === "PUBLIC") {
      canView = true

      if (hasParticipated || isCreator) {
        canViewResults = true
        canAccessVoice = true
        canWriteComments = true
      } else if (userPerms.globalPermissions.canAccessVoiceWithoutParticipation) {
        // Plus/Premium without participation
        canViewResults = true
        canAccessVoice = true
        canWriteComments = true
      }
    }

    // Organization content
    if (content.organizationId) {
      const isOrgMember = userPerms.organizationRoles.some(
        r => r.orgId === content.organizationId
      )
      if (isOrgMember) {
        canView = true
        canViewResults = hasParticipated || isCreator
        canAccessVoice = hasParticipated || isCreator
        canWriteComments = hasParticipated || isCreator
      }
    }

    const now = Date.now()

    return {
      userId,
      contentId,
      contentType: content.contentType,
      access: {
        canView,
        canViewResults,
        canParticipate: content.status === "PUBLISHED" && !hasParticipated,
        canAccessVoice,
        canWriteComments,
        canModerate: isCreator,
        isCreator,
        hasParticipated
      },
      cachedAt: now,
      expiresAt: now + PERMISSION_CACHE_CONFIG.TTL.CONTENT_ACCESS * 1000
    }
  }

  private createDeniedAccess(userId: string, contentId: string, reason: string): CachedContentAccess {
    const now = Date.now()
    return {
      userId,
      contentId,
      contentType: "POLL",
      access: {
        canView: false,
        canViewResults: false,
        canParticipate: false,
        canAccessVoice: false,
        canWriteComments: false,
        canModerate: false,
        isCreator: false,
        hasParticipated: false
      },
      reason,
      cachedAt: now,
      expiresAt: now + PERMISSION_CACHE_CONFIG.TTL.CONTENT_ACCESS * 1000
    }
  }

  // Invalidate user's cached permissions
  async invalidateUser(userId: string): Promise<void> {
    const keys = [
      `${PERMISSION_CACHE_CONFIG.KEYS.USER_PERMISSIONS}${userId}`,
      `${PERMISSION_CACHE_CONFIG.KEYS.SUBSCRIPTION_TIER}${userId}`,
      `${PERMISSION_CACHE_CONFIG.KEYS.FEATURE_FLAGS}${userId}`
    ]

    // Find all content access keys for this user
    const contentKeys = await this.redis.keys(
      `${PERMISSION_CACHE_CONFIG.KEYS.CONTENT_ACCESS}${userId}:*`
    )
    keys.push(...contentKeys)

    if (keys.length > 0) {
      await this.redis.del(...keys)
    }

    // Broadcast invalidation to other instances
    await this.redis.publish(
      PERMISSION_CACHE_CONFIG.INVALIDATION.BROADCAST_CHANNEL,
      JSON.stringify({ type: "USER", userId })
    )
  }

  // Invalidate content access for all users
  async invalidateContent(contentId: string): Promise<void> {
    const keys = await this.redis.keys(
      `${PERMISSION_CACHE_CONFIG.KEYS.CONTENT_ACCESS}*:${contentId}`
    )

    if (keys.length > 0) {
      await this.redis.del(...keys)
    }

    await this.redis.publish(
      PERMISSION_CACHE_CONFIG.INVALIDATION.BROADCAST_CHANNEL,
      JSON.stringify({ type: "CONTENT", contentId })
    )
  }

  // Pre-warm cache on user login
  async warmupOnLogin(userId: string): Promise<void> {
    if (!PERMISSION_CACHE_CONFIG.WARMUP.ON_LOGIN) return

    // Pre-cache user permissions
    await this.getUserPermissions(userId)

    // Pre-cache recent content access
    const recentParticipations = await db.select({ contentId: participations.contentId })
      .from(participations)
      .where(eq(participations.userId, userId))
      .orderBy(desc(participations.createdAt))
      .limit(10)

    await Promise.all(
      recentParticipations.map(p => this.getContentAccess(userId, p.contentId))
    )
  }

  // Subscribe to invalidation broadcasts
  private subscribeToInvalidation(): void {
    const subscriber = this.redis.duplicate()
    subscriber.subscribe(PERMISSION_CACHE_CONFIG.INVALIDATION.BROADCAST_CHANNEL)

    subscriber.on("message", async (channel, message) => {
      const { type, userId, contentId } = JSON.parse(message)

      if (type === "USER" && userId) {
        // Local invalidation (already done by sender, this is for other instances)
        console.log(`[PermissionCache] Invalidated user: ${userId}`)
      } else if (type === "CONTENT" && contentId) {
        console.log(`[PermissionCache] Invalidated content: ${contentId}`)
      }
    })
  }

  // Get feature flags for user
  private async getFeatureFlags(userId: string): Promise<Record<string, boolean>> {
    // Integration with feature flag service (LaunchDarkly, etc.)
    return {
      newVoiceUI: true,
      betaFeatures: false,
      experimentalAnalytics: false
    }
  }
}

export { PERMISSION_CACHE_CONFIG, PermissionCacheService }
export type { CachedUserPermissions, CachedContentAccess }
```


## 15.12.2 Permission Check Middleware

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PERMISSION CHECK WITH CACHING
// Use in API routes and Server Actions
// ══════════════════════════════════════════════════════════════════════════════

import { permissionCache } from "@/lib/services/permission-cache"

// Check if user can perform action on content
async function checkContentPermission(
  userId: string,
  contentId: string,
  action: "view" | "viewResults" | "participate" | "accessVoice" | "writeComments" | "moderate"
): Promise<{ allowed: boolean; reason?: string }> {
  const access = await permissionCache.getContentAccess(userId, contentId)

  const actionMap = {
    view: access.access.canView,
    viewResults: access.access.canViewResults,
    participate: access.access.canParticipate,
    accessVoice: access.access.canAccessVoice,
    writeComments: access.access.canWriteComments,
    moderate: access.access.canModerate
  }

  const allowed = actionMap[action]

  return {
    allowed,
    reason: allowed ? undefined : access.reason ?? `No ${action} permission`
  }
}

// Check if user has feature access
async function checkFeaturePermission(
  userId: string,
  feature: keyof CachedUserPermissions["globalPermissions"]
): Promise<boolean> {
  const perms = await permissionCache.getUserPermissions(userId)
  return perms.globalPermissions[feature] as boolean
}

// Middleware for API routes
async function withPermissionCheck(
  request: Request,
  required: {
    contentId?: string
    action?: string
    feature?: string
  }
): Promise<{ allowed: boolean; userId: string | null; reason?: string }> {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return { allowed: false, userId: null, reason: "Not authenticated" }
  }

  const userId = session.user.id

  if (required.contentId && required.action) {
    const result = await checkContentPermission(
      userId,
      required.contentId,
      required.action as any
    )
    return { ...result, userId }
  }

  if (required.feature) {
    const allowed = await checkFeaturePermission(userId, required.feature as any)
    return { allowed, userId, reason: allowed ? undefined : `Feature ${required.feature} not available` }
  }

  return { allowed: true, userId }
}

export { checkContentPermission, checkFeaturePermission, withPermissionCheck }
```



# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 15 - BUSINESS LOGIC RULES
# ══════════════════════════════════════════════════════════════════════════════
# Status: COMPLETE
# Last Updated: January 2026
# Dependencies: SECTION 05 (User Management), SECTION 06 (Content Types)
#
# Business Logic Summary:
# - 15.1-15.11: Core business rules (content, voting, quality, etc.)
# - 15.12: Permission Caching Strategy (NEW)
# ══════════════════════════════════════════════════════════════════════════════
