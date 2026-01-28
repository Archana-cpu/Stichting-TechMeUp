# 03-business-rules.md
> Source: bible-015.md

# ══════════════════════════════════════════════════════════════════════════════
# RULE ENGINE ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## Business Rule Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS RULE CATEGORIES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  VALIDATION RULES                                                   │   │
│  │  - Input format validation                                          │   │
│  │  - Data integrity constraints                                       │   │
│  │  - Cross-field validation                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  AUTHORIZATION RULES                                                │   │
│  │  - Role-based access control                                        │   │
│  │  - Resource ownership                                               │   │
│  │  - Feature gating                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ELIGIBILITY RULES                                                  │   │
│  │  - Participation eligibility                                        │   │
│  │  - Content access rules                                             │   │
│  │  - Feature unlock criteria                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LIMIT RULES                                                        │   │
│  │  - Rate limits                                                      │   │
│  │  - Quota limits                                                     │   │
│  │  - Time-based restrictions                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STATE TRANSITION RULES                                             │   │
│  │  - Content lifecycle states                                         │   │
│  │  - User status transitions                                          │   │
│  │  - Workflow validations                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CALCULATION RULES                                                  │   │
│  │  - Score calculations                                               │   │
│  │  - XP/Level calculations                                            │   │
│  │  - Statistical computations                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Rule Definition Format

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
# USER BUSINESS RULES
# ══════════════════════════════════════════════════════════════════════════════

## Registration Rules

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
    errorMessage: "Bu e-posta veya telefon numarasi zaten kullaniliyor"
  }
}

export { USER_REGISTRATION_RULES }
```

## Profile Rules

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

  AVATAR: {
    id: "PROF_004",
    maxSizeBytes: 2097152,
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
    minDimension: 100,
    maxDimension: 2048
  }
}

export { USER_PROFILE_RULES }
```

## Account Status Rules

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
      permanentLockout: 4
    },
    resetFailedAttemptsAfter: { hours: 24 },
    notifyUserOnLockout: true,
    notifyUserOnSuspiciousActivity: true,
    exemptFromLockout: ["SUPER_ADMIN"]
  },

  PASSWORD_HISTORY: {
    id: "ACC_006",
    rule: "Prevent password reuse",
    historyCount: 5,
    errorMessage: "Bu sifre daha once kullanilmis. Lutfen farkli bir sifre secin"
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

## Social Rules

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
# CONTENT CREATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## Poll Creation Rules

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

## Survey Creation Rules

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

## Test Creation Rules

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

## Content Moderation Rules

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
# PARTICIPATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## Poll Participation Rules

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

## Survey Participation Rules

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

## Test Participation Rules

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
    maxTabSwitches: 5,
    maxTabSwitchAction: "FLAG",
    fullscreenRequired: false,
    copyPasteDisabled: true
  },

  QUALITY_THRESHOLD: {
    id: "TEST_PART_005",
    minQualityScore: 40,
    enableQualityFiltering: false,
    qualityFilterAction: "FLAG"
  },

  SPEEDING_DETECTION: {
    id: "TEST_PART_006",
    enabled: true,
    speedingThreshold: 0.4,
    minimumTimePerQuestion: 3,
    action: "FLAG"
  },

  STRAIGHT_LINING_DETECTION: {
    id: "TEST_PART_007",
    enabled: true,
    straightLiningThreshold: 0.7,
    minimumQuestionsForDetection: 5,
    action: "FLAG"
  },

  ATTENTION_CHECKS: {
    id: "TEST_PART_008",
    enabled: false,
    recommendedRatio: 0.067,
    maxFailures: 1,
    action: "FLAG"
  }
}

export { TEST_PARTICIPATION_RULES }
```


# ══════════════════════════════════════════════════════════════════════════════
# COMMENT & DISCUSSION RULES
# ══════════════════════════════════════════════════════════════════════════════

## Comment Rules

```typescript
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
    deepReplyBehavior: "FLATTEN_TO_PARENT"
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

  WILSON_SCORE: {
    id: "CMT_008",
    confidenceLevel: 0.95,
    zScore: 1.96,

    cache: {
      enabled: true,
      ttlSeconds: 300,
      invalidateOnVote: true,
      staleTtlSeconds: 60,
      keyPattern: "wilson:{commentId}",
      batchUpdateInterval: 60
    },

    recalculation: {
      onEveryVote: false,
      batchInterval: 60,
      minVotesDelta: 5,
      maxStalenessSeconds: 300
    },

    timeDecay: {
      enabled: false,
      halfLifeHours: 24,
      minScoreMultiplier: 0.1
    }
  }
}

export { COMMENT_RULES }
```

## Discussion Rules

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
# GAMIFICATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## XP Rules

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

## Level Rules

```typescript
const LEVEL_RULES = {
  FORMULA: {
    id: "LVL_001",
    description: "XP required for level N = 100 * N^1.5",
    calculate: (level: number) => Math.floor(100 * Math.pow(level, 1.5))
  },

  THRESHOLDS: {
    id: "LVL_002",
    levels: [
      { level: 1, xpRequired: 0, title: "Yeni Baslayan" },
      { level: 2, xpRequired: 283, title: "Merakli" },
      { level: 3, xpRequired: 520, title: "Katilimci" },
      { level: 5, xpRequired: 1118, title: "Aktif Uye" },
      { level: 10, xpRequired: 3162, title: "Deneyimli" },
      { level: 20, xpRequired: 8944, title: "Uzman" },
      { level: 30, xpRequired: 16432, title: "Usta" },
      { level: 50, xpRequired: 35355, title: "Efsane" },
      { level: 100, xpRequired: 100000, title: "VoxPoll Elite" }
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

## Badge Rules

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

## Streak Rules

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
# NOTIFICATION RULES
# ══════════════════════════════════════════════════════════════════════════════

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
# ORGANIZATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## Organization Management Rules

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

  TRANSFER: {
    id: "ORG_004",
    ownershipTransfer: {
      requiresCurrentOwnerApproval: true,
      cooldownDays: 30,
      notifyAllAdmins: true
    }
  },

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


# ══════════════════════════════════════════════════════════════════════════════
# CONTENT STATE MACHINE
# ══════════════════════════════════════════════════════════════════════════════

## Poll State Machine

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

## Survey State Machine

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

## User State Machine

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


# ══════════════════════════════════════════════════════════════════════════════
# RATE LIMITING RULES
# ══════════════════════════════════════════════════════════════════════════════

## API Rate Limits

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
    read: { requests: 300, window: 60 },
    write: { requests: 60, window: 60 },
    search: { requests: 30, window: 60 }
  },

  BY_ACTION: {
    id: "RATE_003",
    actions: {
      register: { requests: 5, window: 3600 },
      login: { requests: 10, window: 900 },
      logout: { requests: 20, window: 60 },
      passwordReset: { requests: 3, window: 3600 },
      createPoll: { requests: 10, window: 3600 },
      vote: { requests: 60, window: 60 },
      comment: { requests: 30, window: 60 },
      follow: { requests: 100, window: 3600 },
      exportData: { requests: 5, window: 86400 }
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


# ══════════════════════════════════════════════════════════════════════════════
# DATA RETENTION RULES
# ══════════════════════════════════════════════════════════════════════════════

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

---
*Last Updated: 2026-01-23*
