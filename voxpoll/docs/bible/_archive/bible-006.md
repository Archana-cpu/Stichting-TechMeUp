# ██████████████████████████████████████████████████████████████████████████████
# ██                                                                          ██
# ██  ███████╗███████╗ ██████╗████████╗██╗ ██████╗ ███╗   ██╗     ██████╗  ██████╗  ██
# ██  ██╔════╝██╔════╝██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║    ██╔═████╗██╔════╝ ██
# ██  ███████╗█████╗  ██║        ██║   ██║██║   ██║██╔██╗ ██║    ██║██╔██║███████╗ ██
# ██  ╚════██║██╔══╝  ██║        ██║   ██║██║   ██║██║╚██╗██║    ████╔╝██║██╔═══██╗██
# ██  ███████║███████╗╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║    ╚██████╔╝╚██████╔╝██
# ██  ╚══════╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝  ╚═════╝ ██
# ██                                                                          ██
# ██  CONTENT TYPES: POLL / SURVEY / TEST                                     ██
# ██                                                                          ██
# ██████████████████████████████████████████████████████████████████████████████
#
# [CROSS-REFERENCES]
# → Bible-029 §29.1.1: Anonymous Voting Restriction (AUTHORITATIVE)
# → Bible-029 §29.1.2: Poll Option Schema - UNIFIED DEFINITION (AUTHORITATIVE)
# → Bible-030: Content State Machines (AUTHORITATIVE)
# → Bible-031 §31.4: Rate Limiting for Content Creation (AUTHORITATIVE)




# ══════════════════════════════════════════════════════════════════════════════
# 6.1 CONTENT TYPE OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## 6.1.1 Three Pillars: Poll, Survey, Personality Test

VoxPoll supports three distinct content types, each designed for specific use cases:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VOXPOLL CONTENT TYPES                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │                 │  │                 │  │                 │                 │
│  │      POLL       │  │     SURVEY      │  │ PERSONALITY     │                 │
│  │                 │  │                 │  │ TEST            │                 │
│  │  [BarChart3]    │  │  [ClipboardList]│  │  [Brain]        │                 │
│  │                 │  │                 │  │                 │                 │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                 │
│           │                    │                    │                          │
│           ▼                    ▼                    ▼                          │
│                                                                                 │
│  Quick opinion        In-depth data        Fun, shareable                      │
│  gathering            collection           personality insights                │
│                                                                                 │
│  • 1 question         • Multiple pages     • Scored questions                  │
│  • Instant results    • Complex logic      • Category results                  │
│  • High engagement    • Analytics focus    • Visual cards                      │
│  • Social sharing     • Export ready       • Viral potential                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 6.1.2 Feature Comparison Matrix

| Feature | Poll | Survey | Personality Test |
|---------|------|--------|------------------|
| Question count | 1 | 1-100 | 5-50 |
| Question types | Limited | Full | Scored only |
| Branching logic | No | Yes | Limited |
| Pre-test screening | No | Yes | Optional |
| Real-time results | Yes | Optional | After completion |
| Anonymous responses | Yes | Yes | Yes |
| Time limit | Optional | Optional | Optional |
| Result categories | No | No | Yes (2-10) |
| Shareable result card | No | No | Yes |
| Export to CSV | Basic | Full | Basic |
| API access | Yes | Yes | Yes |
| Embed support | Yes | Yes | Yes |
| Mobile optimized | Yes | Yes | Yes |


## 6.1.3 Use Case Guidelines

**When to use POLL:**
- Quick community pulse checks
- Feature voting / prioritization
- Event planning decisions
- Social engagement boosters
- A/B preference testing

**When to use SURVEY:**
- Customer satisfaction research
- Employee feedback collection
- Market research studies
- Academic research
- Product feedback gathering
- Event post-mortems

**When to use PERSONALITY TEST:**
- Brand engagement campaigns
- Team building activities
- Educational assessments
- Entertainment content
- Lead generation funnels




# ══════════════════════════════════════════════════════════════════════════════
# 6.2 POLL SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 6.2.1 Poll Definition & Purpose

Polls are single-question content designed for quick engagement and instant feedback.

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// POLL TYPE DEFINITION
// [AUTHORITATIVE] Formal definition of QUICK, EXTENDED, and LIVE poll types
// ══════════════════════════════════════════════════════════════════════════════

type PollType = "QUICK" | "EXTENDED" | "LIVE"

/**
 * POLL TYPE FORMAL DEFINITIONS
 *
 * The system supports three poll types, each with distinct characteristics:
 */
const POLL_TYPE_DEFINITIONS = {
  // ─────────────────────────────────────────────────────────────────────────────
  // QUICK POLL - Lightweight, instant engagement
  // ─────────────────────────────────────────────────────────────────────────────
  QUICK: {
    name: "Quick Poll",
    description: "Simple, fast voting for casual engagement",
    tier: "ALL",                          // Available to Free, Plus, Premium
    characteristics: {
      maxOptions: { free: 4, premium: 4 }, // INTENTIONAL: Quick Polls always 4 max [P-027 exception]
      minOptions: 2,
      mediaSupport: false,                 // No images/videos
      descriptionSupport: false,           // Question only
      preTestSupport: false,               // No screening questions
      targetAudienceSupport: false,        // No demographic filtering
      duration: {
        min: null,                         // Can be instant
        max: 7 * 24 * 60,                  // Max 7 days in minutes
        default: 24 * 60                   // Default 24 hours
      }
    },
    scoring: {
      fraudCheck: true,                    // Always check fraud
      qualityCheck: false,                 // No quality assessment
      fraudThreshold: 70,                  // Higher threshold for speed
      reliabilityMaxScore: 60              // Capped reliability (no targeting)
    },
    realTime: false,                       // Results shown after voting
    analytics: "BASIC"                     // Limited analytics
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EXTENDED POLL - Feature-rich polling
  // ─────────────────────────────────────────────────────────────────────────────
  EXTENDED: {
    name: "Extended Poll",
    description: "Full-featured poll with targeting and analysis",
    tier: "PREMIUM",                       // Premium individual or any org tier
    characteristics: {
      maxOptions: { free: 4, premium: 10 }, // Tier-based limits [P-027]
      minOptions: 2,
      mediaSupport: true,                   // Images, GIFs, videos
      descriptionSupport: true,             // Rich description
      preTestSupport: true,                 // Screening questions [P-014]
      targetAudienceSupport: true,          // Demographic filtering
      duration: {
        min: 60,                            // Min 1 hour
        max: 30 * 24 * 60,                  // Max 30 days
        default: 7 * 24 * 60                // Default 7 days
      }
    },
    scoring: {
      fraudCheck: true,
      qualityCheck: true,                   // Quality assessment enabled
      fraudThreshold: 50,
      qualityThreshold: 40,                 // [P-028] Poll quality threshold
      reliabilityMaxScore: 100              // Full reliability scoring
    },
    realTime: false,                        // Results shown after voting
    analytics: "FULL"                       // Complete analytics dashboard
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LIVE POLL - Real-time interactive polling
  // ─────────────────────────────────────────────────────────────────────────────
  LIVE: {
    name: "Live Poll",
    description: "Real-time interactive polling with instant results",
    tier: "PREMIUM",                        // Premium only
    characteristics: {
      maxOptions: { free: 4, premium: 10 },
      minOptions: 2,
      mediaSupport: true,
      descriptionSupport: true,
      preTestSupport: false,                // No pre-test in live (too slow)
      targetAudienceSupport: false,         // Open to all participants
      duration: {
        min: 1,                             // Min 1 minute
        max: 60,                            // Max 60 minutes (1 hour)
        default: 15                         // Default 15 minutes
      }
    },
    scoring: {
      fraudCheck: true,                     // Lightweight fraud check
      qualityCheck: false,                  // No quality (real-time)
      fraudThreshold: 60,                   // Medium threshold
      reliabilityMaxScore: 50               // Lower reliability (short duration)
    },
    realTime: true,                         // Results update in real-time
    connection: "WEBSOCKET",                // WebSocket for real-time
    maxConcurrentParticipants: 10000,       // Per poll limit (10K)
    analytics: "LIVE_DASHBOARD"             // Real-time dashboard
  }
} as const

// ══════════════════════════════════════════════════════════════════════════════
// [DECISION P-040] LIVE POLL CAPACITY OVERFLOW HANDLING
// Defines behavior when participant count approaches or exceeds limit
// ══════════════════════════════════════════════════════════════════════════════

const LIVE_POLL_CAPACITY_HANDLING = {
  // Capacity limits
  limits: {
    maxParticipantsPerPoll: 10000,
    warningThreshold: 0.8,              // 80% = 8,000 participants
    softCapThreshold: 0.9,              // 90% = 9,000 participants
    hardCapThreshold: 1.0               // 100% = 10,000 participants
  },

  // At 80% capacity - WARNING PHASE
  atWarningThreshold: {
    hostNotification: {
      type: "IN_APP_BANNER",
      message: "Anketiniz %80 kapasiteye ulaştı. Katılımcı kabul etmeye devam ediyor.",
      messageEn: "Your poll has reached 80% capacity. Still accepting participants.",
      showUpgradeOption: true,           // For Enterprise tier with higher limits
      dismissable: true
    },
    participantExperience: "NORMAL"      // No change for participants
  },

  // At 90% capacity - SOFT CAP (Waiting Room)
  atSoftCapThreshold: {
    hostNotification: {
      type: "URGENT_BANNER",
      message: "⚠️ %90 kapasite! Yeni katılımcılar bekleme odasına alınacak.",
      messageEn: "⚠️ 90% capacity! New participants will enter waiting room."
    },
    participantExperience: {
      newJoinsAction: "WAITING_ROOM",
      waitingRoom: {
        enabled: true,
        maxWaitingTime: 300,             // 5 minutes max wait
        message: "Anket şu anda yoğun. Sıranız gelince katılabileceksiniz.",
        messageEn: "Poll is currently busy. You'll be able to join when space opens.",
        showPosition: true,              // "Position: 42 in queue"
        showEstimatedWait: true,         // "Estimated wait: ~2 min"
        allowLeaveQueue: true
      }
    }
  },

  // At 100% capacity - HARD CAP
  atHardCapThreshold: {
    hostNotification: {
      type: "ALERT",
      message: "🛑 Maksimum kapasiteye ulaşıldı! 10,000 katılımcı.",
      messageEn: "🛑 Maximum capacity reached! 10,000 participants."
    },
    participantExperience: {
      newJoinsAction: "REJECT_WITH_MESSAGE",
      rejectionMessage: {
        title: "Anket Dolu / Poll Full",
        message: "Bu anket maksimum katılımcı sayısına ulaştı. Sonuçları izleyebilirsiniz.",
        messageEn: "This poll has reached maximum participants. You can view results.",
        options: [
          { type: "VIEW_RESULTS", label: "Sonuçları İzle / View Results" },
          { type: "NOTIFY_WHEN_SPACE", label: "Yer Açılınca Bildir / Notify When Space Opens" },
          { type: "LEAVE", label: "Çık / Leave" }
        ]
      }
    },
    existingParticipants: "NO_CHANGE"    // Don't kick anyone
  },

  // When participant leaves (frees a spot)
  onParticipantLeave: {
    notifyWaitingRoom: true,
    autoAdmitFromQueue: true,
    admissionOrder: "FIFO"               // First in, first out
  },

  // Scaling considerations
  scaling: {
    distributionStrategy: "CONSISTENT_HASH",  // Distribute across servers
    serverCapacity: 2500,                     // Max participants per server
    minServers: 4,                            // For 10K capacity
    autoScaleEnabled: true,
    scaleUpAt: 0.7,                           // Scale when server at 70%
    scaleDownAt: 0.3                          // Scale down when below 30%
  },

  // Enterprise tier override
  enterpriseTierLimits: {
    maxParticipantsPerPoll: 100000,          // 100K for Enterprise
    dedicatedInfrastructure: true,
    customCapacityPlanning: true
  }
}

export { LIVE_POLL_CAPACITY_HANDLING }

// Type guards
function isQuickPoll(poll: Poll): boolean {
  return poll.type === "QUICK"
}

function isExtendedPoll(poll: Poll): boolean {
  return poll.type === "EXTENDED"
}

function isLivePoll(poll: Poll): boolean {
  return poll.type === "LIVE"
}

// Get poll type configuration
function getPollTypeConfig(type: PollType): typeof POLL_TYPE_DEFINITIONS[PollType] {
  return POLL_TYPE_DEFINITIONS[type]
}

// Validate poll type availability for tier
function canCreatePollType(
  type: PollType,
  userTier: "FREE" | "PLUS" | "PREMIUM",
  isOrgMember: boolean
): boolean {
  const config = POLL_TYPE_DEFINITIONS[type]

  if (config.tier === "ALL") return true
  if (config.tier === "PREMIUM") {
    return userTier === "PREMIUM" || isOrgMember
  }
  return false
}

export {
  POLL_TYPE_DEFINITIONS,
  isQuickPoll,
  isExtendedPoll,
  isLivePoll,
  getPollTypeConfig,
  canCreatePollType
}

interface Poll {
  id: string
  type: PollType
  creatorId: string
  organizationId: string | null

  question: string
  description: string | null
  mediaUrl: string | null
  mediaType: "IMAGE" | "VIDEO" | "GIF" | null

  options: PollOption[]
  settings: PollSettings

  // [DECISION P-011] Pre-test support for polls (Premium tier only)
  preTest: PreTestConfig | null

  // [DECISION P-011] Live poll settings (Premium tier only)
  liveSettings: LivePollSettings | null

  // [DECISION] Target audience selection (Premium tier only)
  targetAudience: TargetAudienceConfig | null

  // [DECISION] Private link sharing
  privateLink: PrivateLinkConfig | null

  status: ContentStatus
  visibility: VisibilityLevel

  totalVotes: number
  uniqueVoters: number

  createdAt: Date
  publishedAt: Date | null
  closesAt: Date | null
  closedAt: Date | null
}

// ══════════════════════════════════════════════════════════════════════════════
// LIVE POLL SETTINGS (Premium Feature - P-011)
// ══════════════════════════════════════════════════════════════════════════════
interface LivePollSettings {
  isLive: boolean
  joinCode: string              // 6-character alphanumeric code
  joinUrl: string               // Short URL for live join
  maxParticipants: number | null
  showRealTimeResults: boolean
  autoCloseAfterMinutes: number | null
  hostCanEndManually: boolean
  participantListVisible: boolean
  allowLateJoin: boolean
  allowAnonymousVoting: boolean // [P-039] Default: true
}

// ══════════════════════════════════════════════════════════════════════════════
// [DECISION P-039] ANONYMOUS VOTING RESTRICTION BEHAVIOR
// Defines what happens when anonymousVoting is disabled and unauthenticated user joins
// ══════════════════════════════════════════════════════════════════════════════

const ANONYMOUS_VOTING_RESTRICTION = {
  // When allowAnonymousVoting: false (or allowAnonymousParticipation: false)
  onUnauthenticatedUserJoin: {
    // Step 1: Block immediate voting
    action: "SHOW_LOGIN_WALL",

    // Step 2: User sees this screen
    ui: {
      title: "Giriş Gerekli / Login Required",
      message: "Bu ankete katılmak için giriş yapmanız gerekiyor.",
      messageEn: "You must be logged in to participate in this poll.",

      // Options shown to user
      options: [
        { type: "LOGIN", label: "Giriş Yap / Login", primary: true },
        { type: "REGISTER", label: "Hesap Oluştur / Register", primary: false },
        { type: "CANCEL", label: "Vazgeç / Cancel", primary: false }
      ]
    },

    // Step 3: After successful login
    afterLogin: {
      redirectToPoll: true,           // Return to same poll
      preserveJoinCode: true,         // Keep live poll context
      autoSubmitPendingVote: false    // User must manually vote after login
    }
  },

  // Edge case: User was authenticated but session expired during live poll
  onSessionExpiredDuringPoll: {
    action: "SOFT_PROMPT",
    message: "Oturumunuz sona erdi. Devam etmek için tekrar giriş yapın.",
    messageEn: "Your session has expired. Please log in again to continue.",
    preserveVoteIntent: true,         // Remember which option they selected
    autoSubmitAfterReauth: true       // Submit their saved vote after re-login
  },

  // For Live Polls specifically
  livePollSpecificRules: {
    // Can user JOIN (view) the live poll without auth?
    canJoinWithoutAuth: true,         // Yes, can watch results

    // Can user VOTE without auth?
    canVoteWithoutAuth: false,        // No, if allowAnonymousVoting: false

    // What UI shows for viewers who can't vote?
    viewerOnlyMode: {
      enabled: true,
      showResults: true,              // Can see real-time results
      showVoteButton: false,          // Hide vote button
      showLoginPrompt: true,          // Show "Login to vote" banner
      participantCountInclude: false  // Don't count viewers in participant count
    }
  }
}

export { ANONYMOUS_VOTING_RESTRICTION }

// ══════════════════════════════════════════════════════════════════════════════
// PRE-TEST CONFIG FOR POLLS (Premium Feature)
// ══════════════════════════════════════════════════════════════════════════════
interface PreTestConfig {
  enabled: boolean
  questions: PreTestQuestion[]
  passingScore: number          // 0-100 percentage
  maxAttempts: number
  showFailureReason: boolean
}

interface PreTestQuestion {
  id: string
  question: string
  options: { id: string, text: string, isCorrect: boolean }[]
  weight: number
}

// ══════════════════════════════════════════════════════════════════════════════
// TARGET AUDIENCE CONFIG (Premium Feature)
// ══════════════════════════════════════════════════════════════════════════════
interface TargetAudienceConfig {
  enabled: boolean
  ageRange: { min: number, max: number } | null
  genders: string[] | null
  countries: string[] | null
  regions: string[] | null
  educationLevels: string[] | null
  employmentStatuses: string[] | null
}

// ══════════════════════════════════════════════════════════════════════════════
// PRIVATE LINK SHARING CONFIG
// ══════════════════════════════════════════════════════════════════════════════
interface PrivateLinkConfig {
  enabled: boolean
  linkCode: string              // Unique private link code
  expiresAt: Date | null
  maxUses: number | null
  currentUses: number
  requireAuth: boolean          // Require login to access
}

interface PollOption {
  id: string
  pollId: string
  text: string
  imageUrl: string | null
  position: number
  voteCount: number
  percentage: number
}

interface PollSettings {
  allowMultipleChoice: boolean
  maxSelections: number | null
  showResultsBeforeVote: boolean
  showVoterCount: boolean
  allowChangeVote: boolean
  requireComment: boolean
  randomizeOptions: boolean
  hideResultsUntilClose: boolean
  notifyOnMilestone: boolean
  milestoneThresholds: number[]

  // ══════════════════════════════════════════════════════════════════════════
  // ANONYMITY SETTINGS
  // [DECISION] Creators can REJECT anonymous participation when they need
  // verified respondent data for credibility or compliance reasons
  // ══════════════════════════════════════════════════════════════════════════
  allowAnonymousParticipation: boolean  // Default: true
  requireVerificationLevel: 0 | 1 | 2 | 3 | 4 | null  // Minimum verification level required
  anonymityRejectionMessage: string | null  // Custom message when rejecting anonymous users
}
```


## 6.2.2 Poll Question Configuration

[MUST] Poll question constraints:
- Minimum length: 10 characters
- Maximum length: 500 characters
- No HTML allowed (plain text only)
- Emoji support: Yes
- Mentions (@user, @org): Yes
- Hashtags: Yes

[MUST] Poll option constraints:
- Minimum options: 2
- Maximum options: 10
- Option text: 1-200 characters
- Option image: Optional (max 5MB, jpg/png/gif/webp)


## 6.2.3 Poll Options Configuration

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// POLL OPTION VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const pollOptionSchema = z.object({
  text: z.string()
    .min(1, "Option text required")
    .max(200, "Option text too long"),
  imageUrl: z.string().url().nullable().optional(),
  position: z.number().int().min(0)
})

const pollOptionsSchema = z.array(pollOptionSchema)
  .min(2, "At least 2 options required")
  .max(10, "Maximum 10 options allowed")
  .refine(
    (options) => {
      const texts = options.map(o => o.text.toLowerCase().trim())
      return new Set(texts).size === texts.length
    },
    "Duplicate options not allowed"
  )

const pollSettingsSchema = z.object({
  allowMultipleChoice: z.boolean().default(false),
  maxSelections: z.number().int().min(2).max(10).nullable().default(null),
  showResultsBeforeVote: z.boolean().default(false),
  showVoterCount: z.boolean().default(true),
  allowChangeVote: z.boolean().default(false),
  requireComment: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  hideResultsUntilClose: z.boolean().default(false),
  notifyOnMilestone: z.boolean().default(true),
  milestoneThresholds: z.array(z.number()).default([100, 500, 1000, 5000, 10000]),

  // Anonymity Settings
  allowAnonymousParticipation: z.boolean().default(true),
  requireVerificationLevel: z.union([
    z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.null()
  ]).default(null),
  anonymityRejectionMessage: z.string().max(500).nullable().default(null)
}).refine(
  (data) => !data.allowMultipleChoice || data.maxSelections !== null,
  "maxSelections required when allowMultipleChoice is true"
).refine(
  (data) => data.allowAnonymousParticipation || data.requireVerificationLevel !== null,
  "requireVerificationLevel must be set when anonymous participation is disabled"
)

export { pollOptionSchema, pollOptionsSchema, pollSettingsSchema }
```


## 6.2.4 Quick Poll vs Extended Poll

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      QUICK POLL vs EXTENDED POLL                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  QUICK POLL                           EXTENDED POLL                             │
│  ───────────                          ─────────────                             │
│                                                                                 │
│  Purpose: Instant engagement          Purpose: Deeper insights                  │
│                                                                                 │
│  • Text-only question                 • Rich media support                      │
│  • 2-4 options                        • 2-10 options                            │
│  • No description                     • Description allowed                     │
│  • Single choice only                 • Multiple choice option                  │
│  • Results always visible             • Can hide results                        │
│  • 24-72 hour default duration        • Custom duration                         │
│  • No comments                        • Optional comments                       │
│  • Feed-optimized display             • Full-page display                       │
│                                                                                 │
│  Best for:                            Best for:                                 │
│  • Daily engagement                   • Feature prioritization                  │
│  • Quick opinions                     • Event planning                          │
│  • Trending topics                    • Decision making                         │
│                                                                                 │
│  Creator limits:                      Creator limits:                           │
│  • Free: 3/month                      • Free: included in poll quota            │
│  • Premium: Unlimited                 • Premium: Unlimited                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 6.2.5 Poll Result Display

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// POLL RESULT CALCULATION
// ══════════════════════════════════════════════════════════════════════════════

interface PollResults {
  pollId: string
  totalVotes: number
  uniqueVoters: number
  options: PollOptionResult[]
  leadingOption: string | null
  isTied: boolean
  updatedAt: Date
}

interface PollOptionResult {
  optionId: string
  text: string
  voteCount: number
  percentage: number
  isLeading: boolean
}

function calculatePollResults(poll: Poll): PollResults {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0)
  
  const optionResults: PollOptionResult[] = poll.options.map(opt => ({
    optionId: opt.id,
    text: opt.text,
    voteCount: opt.voteCount,
    percentage: totalVotes > 0 
      ? Math.round((opt.voteCount / totalVotes) * 1000) / 10
      : 0,
    isLeading: false
  }))
  
  const maxVotes = Math.max(...optionResults.map(o => o.voteCount))
  const leadingOptions = optionResults.filter(o => o.voteCount === maxVotes)
  
  leadingOptions.forEach(opt => { opt.isLeading = true })
  
  return {
    pollId: poll.id,
    totalVotes,
    uniqueVoters: poll.uniqueVoters,
    options: optionResults,
    leadingOption: leadingOptions.length === 1 ? leadingOptions[0].optionId : null,
    isTied: leadingOptions.length > 1,
    updatedAt: new Date()
  }
}

export type { PollResults, PollOptionResult }
export { calculatePollResults }
```

**Result Display UI:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Which framework should we adopt for the new project?                           │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐               │
│  │ Next.js                                                     │               │
│  │ ████████████████████████████████████████░░░░░░░░░░  62.3%  │  [Leading]    │
│  │                                                    (1,247)  │               │
│  └─────────────────────────────────────────────────────────────┘               │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐               │
│  │ Remix                                                       │               │
│  │ █████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  24.1%  │               │
│  │                                                      (482)  │               │
│  └─────────────────────────────────────────────────────────────┘               │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐               │
│  │ Nuxt                                                        │               │
│  │ ███████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  13.6%  │               │
│  │                                                      (272)  │               │
│  └─────────────────────────────────────────────────────────────┘               │
│                                                                                 │
│  [Users] 2,001 votes  •  [Clock] Closes in 2 days  •  [Share]                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 6.2.6 LIVE POLL FEATURE (Premium - P-011)

[DECISION P-011] Live Polls enable real-time participation for live audiences (streamers,
speakers, presenters). Participants join via link or code and vote simultaneously.

[REFERENCE] For detailed link-based participation system, QR code generation, and WebSocket
events, see BIBLE-021 (Link-Based Participation & Sharing System).

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LIVE POLL SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  USE CASES:                                                                     │
│  ─────────────────                                                              │
│  • Twitch/YouTube streamers engaging audience in real-time                      │
│  • Conference speakers polling attendees during presentation                    │
│  • Teachers/Professors getting instant classroom feedback                       │
│  • Event organizers gathering live audience opinions                            │
│  • Podcast hosts involving listeners in discussion topics                       │
│                                                                                 │
│  HOW IT WORKS:                                                                  │
│  ─────────────────                                                              │
│                                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐           │
│  │   Creator       │     │   Join Link     │     │   Participants  │           │
│  │   Creates Live  │────▶│   voxpoll.com/  │◀────│   Scan QR or    │           │
│  │   Poll          │     │   live/ABC123   │     │   Enter Code    │           │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘           │
│           │                                              │                      │
│           │              ┌─────────────────┐             │                      │
│           └─────────────▶│  REAL-TIME      │◀────────────┘                      │
│                          │  RESULTS        │                                    │
│                          │  (WebSocket)    │                                    │
│                          └─────────────────┘                                    │
│                                                                                 │
│  LIVE POLL FLOW:                                                                │
│  ─────────────────                                                              │
│  1. Creator starts live poll → System generates 6-char join code               │
│  2. Creator shares link/QR code with audience                                   │
│  3. Participants join via voxpoll.com/live/{code} (no login required)          │
│  4. Results update in real-time via WebSocket connection                        │
│  5. Creator can end poll manually or set auto-close timer                       │
│  6. Final results saved and PULSE + COMMENTS opens                              │
│                                                                                 │
│  REQUIREMENTS:                                                                  │
│  • Premium subscription required for creator                                    │
│  • No auth required for participants (anonymous voting)                         │
│  • Maximum 10,000 concurrent participants per live poll                         │
│  • Auto-close after 4 hours if not manually ended                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// LIVE POLL IMPLEMENTATION
// ══════════════════════════════════════════════════════════════════════════════

interface LivePollSession {
  pollId: string
  joinCode: string                    // "ABC123"
  joinUrl: string                     // "voxpoll.com/live/ABC123"
  qrCodeUrl: string                   // Pre-generated QR code URL
  status: "WAITING" | "ACTIVE" | "ENDED"
  startedAt: Date | null
  endedAt: Date | null
  maxParticipants: number
  currentParticipants: number
  settings: {
    showRealTimeResults: boolean      // Show results as votes come in
    allowLateJoin: boolean            // Allow joining after poll started
    autoCloseMinutes: number | null   // Auto-close after N minutes
    participantListVisible: boolean   // Show list of participants
    anonymousVoting: boolean          // Allow voting without login
  }
}

// Generate unique 6-character join code
function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Excluded I,O,0,1 for clarity
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// WebSocket event types for live poll
type LivePollEvent =
  | { type: "VOTE_RECEIVED", optionId: string, newCount: number, newPercentage: number }
  | { type: "PARTICIPANT_JOINED", count: number }
  | { type: "POLL_ENDED", finalResults: PollResults }
  | { type: "HOST_MESSAGE", message: string }

export type { LivePollSession, LivePollEvent }
export { generateJoinCode }
```


## 6.2.7 POLL PRE-TEST SYSTEM (Premium Feature)

[DECISION P-014] Pre-tests for polls require Premium tier. This allows creators to
filter participants based on knowledge, opinions, or qualifications before voting.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        POLL PRE-TEST SYSTEM                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PURPOSE:                                                                       │
│  • Ensure voters have relevant knowledge to participate meaningfully            │
│  • Filter out uninformed or off-topic voters                                    │
│  • Improve data quality for research-oriented polls                             │
│                                                                                 │
│  EXAMPLE USE CASES:                                                             │
│  ─────────────────────                                                          │
│  • "Best programming framework" → Pre-test: "Have you built a web app?"        │
│  • "Political candidate preference" → Pre-test: "Are you a registered voter?"  │
│  • "Product feature priority" → Pre-test: "Do you use our product regularly?"  │
│                                                                                 │
│  PRE-TEST FLOW:                                                                 │
│  ─────────────────                                                              │
│                                                                                 │
│  User clicks       Pre-test         Pass?      Main Poll      PULSE            │
│  on Poll     ───▶  Questions   ───▶  ✓    ───▶   Vote    ───▶ Results          │
│                        │                                                        │
│                        │                                                        │
│                        ▼ Fail                                                   │
│                   Polite rejection                                              │
│                   "Thank you for your interest..."                              │
│                                                                                 │
│  CONFIGURATION OPTIONS:                                                         │
│  ───────────────────────                                                        │
│  • 1-5 pre-test questions (recommended: 2-3)                                    │
│  • Passing threshold: 50-100% (default: 60%)                                    │
│  • Max attempts: 1-3 (default: 1)                                               │
│  • Show which question failed: Yes/No (default: No)                             │
│  • Custom rejection message: Optional                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### [DECISION P-030] Pre-test Failure Handling Policy

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// PRE-TEST FAILURE HANDLING POLICY
// Defines behavior when user fails pre-test screening questions
// ═══════════════════════════════════════════════════════════════════════════════

const PRETEST_FAILURE_POLICY = {
  // Attempt Limits
  maxAttempts: 3,                   // Maximum retry attempts per user per poll
  cooldownMinutes: 60,              // Wait time between attempts after failure
  cooldownProgressive: true,        // 60min → 120min → 24hr

  // User Experience
  showCorrectAnswers: false,        // Never reveal correct answers (prevents gaming)
  showFailedQuestion: false,        // Don't identify which question failed
  showProgressBar: true,            // Show "Question 1 of 3" during pre-test

  // Rejection Messages (i18n keys)
  rejectionMessages: {
    default: "pretest.rejection.default",
    // "Bu anket için belirlenen kriterleri karşılamıyorsunuz. Katılımınız için teşekkür ederiz."
    custom: "pretest.rejection.custom",     // Creator can customize
    maxAttemptsReached: "pretest.rejection.maxAttempts"
    // "Bu anket için maksimum deneme sayısına ulaştınız."
  },

  // Post-Rejection Behavior
  postRejection: {
    showAlternativePoll: true,      // Suggest similar polls user CAN participate in
    trackForAnalytics: true,        // Record rejection for creator analytics
    notifyCreator: false,           // Don't notify on each rejection
    allowViewResults: false         // Cannot see results if didn't pass
  },

  // Anti-Gaming Measures
  antiGaming: {
    deviceLock: true,               // Same device = same attempt count
    ipTracking: false,              // Don't block by IP (VPN users)
    timeBetweenQuestions: 2000,     // Min 2 seconds per question
    shuffleQuestions: true,         // Randomize question order
    shuffleOptions: true            // Randomize answer order
  }
}

// Pre-test attempt tracking
interface PretestAttempt {
  userId: string | null             // null for anonymous
  deviceFingerprint: string
  pollId: string
  attemptNumber: number             // 1, 2, or 3
  timestamp: Date
  passed: boolean
  score: number                     // Percentage correct (0-100)
  cooldownEndsAt: Date | null       // When user can retry
}

// Calculate cooldown based on attempt number
function calculateCooldown(attemptNumber: number): number {
  if (!PRETEST_FAILURE_POLICY.cooldownProgressive) {
    return PRETEST_FAILURE_POLICY.cooldownMinutes
  }

  switch (attemptNumber) {
    case 1: return 60       // 1 hour after first failure
    case 2: return 120      // 2 hours after second failure
    case 3: return 1440     // 24 hours after third failure (max attempts)
    default: return 1440
  }
}

// Check if user can attempt pre-test
async function canAttemptPretest(
  pollId: string,
  userId: string | null,
  deviceFingerprint: string
): Promise<{ canAttempt: boolean; reason?: string; cooldownEndsAt?: Date }> {
  const attempts = await db.pretestAttempt.findMany({
    where: {
      pollId,
      OR: [
        { userId: userId ?? undefined },
        { deviceFingerprint }
      ]
    },
    orderBy: { timestamp: "desc" }
  })

  // No previous attempts - can proceed
  if (attempts.length === 0) {
    return { canAttempt: true }
  }

  // Check if already passed
  const passedAttempt = attempts.find(a => a.passed)
  if (passedAttempt) {
    return { canAttempt: false, reason: "ALREADY_PASSED" }
  }

  // Check max attempts
  if (attempts.length >= PRETEST_FAILURE_POLICY.maxAttempts) {
    return { canAttempt: false, reason: "MAX_ATTEMPTS_REACHED" }
  }

  // Check cooldown
  const lastAttempt = attempts[0]
  if (lastAttempt.cooldownEndsAt && lastAttempt.cooldownEndsAt > new Date()) {
    return {
      canAttempt: false,
      reason: "COOLDOWN_ACTIVE",
      cooldownEndsAt: lastAttempt.cooldownEndsAt
    }
  }

  return { canAttempt: true }
}

export { PRETEST_FAILURE_POLICY, calculateCooldown, canAttemptPretest }
export type { PretestAttempt }
```

### Pre-Test Complete Lifecycle State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PRE-TEST LIFECYCLE STATE MACHINE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐                                                          │
│  │ NOT_STARTED   │ ◄──────────────────────────────────────────────┐        │
│  │ Initial state │                                                 │        │
│  └───────┬───────┘                                                 │        │
│          │                                                         │        │
│          │ User opens poll with pre-test                           │        │
│          ▼                                                         │        │
│  ┌───────────────┐                                                 │        │
│  │ CHECKING      │ ─────► Check: Can user attempt?                 │        │
│  │ ELIGIBILITY   │        (max attempts, cooldown, device lock)    │        │
│  └───────┬───────┘                                                 │        │
│          │                                                         │        │
│     ┌────┴────┐                                                    │        │
│     ▼         ▼                                                    │        │
│ ┌──────┐  ┌──────────┐                                             │        │
│ │BLOCKED│  │IN_PROGRESS│                                            │        │
│ │       │  │           │                                            │        │
│ └──┬────┘  └─────┬─────┘                                            │        │
│    │             │                                                  │        │
│    │             │ User answers questions                           │        │
│    │             ▼                                                  │        │
│    │     ┌───────────────┐                                          │        │
│    │     │  EVALUATING   │ ─────► Calculate score                   │        │
│    │     │               │        (% correct answers)               │        │
│    │     └───────┬───────┘                                          │        │
│    │             │                                                  │        │
│    │        ┌────┴────┐                                             │        │
│    │        ▼         ▼                                             │        │
│    │    ┌──────┐  ┌──────┐                                          │        │
│    │    │PASSED│  │FAILED│                                          │        │
│    │    │      │  │      │                                          │        │
│    │    └──┬───┘  └──┬───┘                                          │        │
│    │       │         │                                              │        │
│    │       │         │ attempts < max?                              │        │
│    │       │         ├───────── Yes ────► Cooldown ───────────────►─┘        │
│    │       │         │                                                       │
│    │       │         └───────── No ─────┐                                    │
│    │       │                            ▼                                    │
│    │       │                     ┌──────────────┐                            │
│    │       │                     │PERMANENTLY   │                            │
│    │       │                     │BLOCKED       │                            │
│    │       │                     └──────────────┘                            │
│    │       │                            │                                    │
│    │       ▼                            ▼                                    │
│    │  ┌──────────┐               ┌──────────┐                               │
│    │  │CAN_VOTE  │               │CANNOT    │                               │
│    │  │          │               │PARTICIPATE│                              │
│    │  └──────────┘               └──────────┘                               │
│    │                                                                        │
│    │  BLOCKED reasons:                                                      │
│    │  - MAX_ATTEMPTS_REACHED                                                │
│    │  - COOLDOWN_ACTIVE                                                     │
│    │  - ALREADY_PASSED (edge case)                                          │
│    │  - DEVICE_ALREADY_USED                                                 │
│    │                                                                        │
└────┴────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// PRE-TEST LIFECYCLE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

type PretestState =
  | "NOT_STARTED"
  | "CHECKING_ELIGIBILITY"
  | "BLOCKED"
  | "IN_PROGRESS"
  | "EVALUATING"
  | "PASSED"
  | "FAILED"
  | "COOLDOWN"
  | "PERMANENTLY_BLOCKED"

type BlockReason =
  | "MAX_ATTEMPTS_REACHED"
  | "COOLDOWN_ACTIVE"
  | "ALREADY_PASSED"
  | "DEVICE_ALREADY_USED"

interface PretestLifecycleState {
  state: PretestState
  pollId: string
  userId: string | null
  deviceFingerprint: string
  attemptNumber: number
  score: number | null
  blockReason: BlockReason | null
  cooldownEndsAt: Date | null
  canRetry: boolean
  passedAt: Date | null
}

const PRETEST_STATE_TRANSITIONS: Record<PretestState, PretestState[]> = {
  NOT_STARTED: ["CHECKING_ELIGIBILITY"],
  CHECKING_ELIGIBILITY: ["BLOCKED", "IN_PROGRESS"],
  BLOCKED: [],  // Terminal state (but can become NOT_STARTED after cooldown)
  IN_PROGRESS: ["EVALUATING"],
  EVALUATING: ["PASSED", "FAILED"],
  PASSED: [],   // Terminal state - user can vote
  FAILED: ["COOLDOWN", "PERMANENTLY_BLOCKED"],
  COOLDOWN: ["NOT_STARTED"],  // After cooldown expires
  PERMANENTLY_BLOCKED: []     // Terminal state - max attempts reached
}

// Determine current state for a user/poll combination
async function getPretestState(
  pollId: string,
  userId: string | null,
  deviceFingerprint: string
): Promise<PretestLifecycleState> {
  const attempts = await db.pretestAttempt.findMany({
    where: {
      pollId,
      OR: [
        { userId: userId ?? undefined },
        { deviceFingerprint }
      ]
    },
    orderBy: { timestamp: "desc" }
  })

  // No attempts - fresh start
  if (attempts.length === 0) {
    return {
      state: "NOT_STARTED",
      pollId,
      userId,
      deviceFingerprint,
      attemptNumber: 0,
      score: null,
      blockReason: null,
      cooldownEndsAt: null,
      canRetry: true,
      passedAt: null
    }
  }

  const latestAttempt = attempts[0]

  // Already passed
  if (latestAttempt.passed) {
    return {
      state: "PASSED",
      pollId,
      userId,
      deviceFingerprint,
      attemptNumber: latestAttempt.attemptNumber,
      score: latestAttempt.score,
      blockReason: null,
      cooldownEndsAt: null,
      canRetry: false,
      passedAt: latestAttempt.timestamp
    }
  }

  // Max attempts reached
  if (attempts.length >= PRETEST_FAILURE_POLICY.maxAttempts) {
    return {
      state: "PERMANENTLY_BLOCKED",
      pollId,
      userId,
      deviceFingerprint,
      attemptNumber: latestAttempt.attemptNumber,
      score: latestAttempt.score,
      blockReason: "MAX_ATTEMPTS_REACHED",
      cooldownEndsAt: null,
      canRetry: false,
      passedAt: null
    }
  }

  // In cooldown
  if (latestAttempt.cooldownEndsAt && latestAttempt.cooldownEndsAt > new Date()) {
    return {
      state: "COOLDOWN",
      pollId,
      userId,
      deviceFingerprint,
      attemptNumber: latestAttempt.attemptNumber,
      score: latestAttempt.score,
      blockReason: "COOLDOWN_ACTIVE",
      cooldownEndsAt: latestAttempt.cooldownEndsAt,
      canRetry: true,
      passedAt: null
    }
  }

  // Can retry (cooldown expired)
  return {
    state: "NOT_STARTED",
    pollId,
    userId,
    deviceFingerprint,
    attemptNumber: latestAttempt.attemptNumber,
    score: null,
    blockReason: null,
    cooldownEndsAt: null,
    canRetry: true,
    passedAt: null
  }
}

export { getPretestState, PRETEST_STATE_TRANSITIONS }
export type { PretestState, PretestLifecycleState, BlockReason }
```


## 6.2.8 PRIVATE LINK SHARING

[DECISION] All content types support private link sharing, allowing creators to
share polls/surveys/tests with specific people without making content public.

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PRIVATE LINK SHARING
// ══════════════════════════════════════════════════════════════════════════════

interface PrivateLink {
  id: string
  contentId: string
  contentType: "POLL" | "SURVEY" | "TEST"
  code: string                        // Unique 10-character code
  url: string                         // voxpoll.com/p/{code}
  createdBy: string
  settings: {
    expiresAt: Date | null            // Optional expiration
    maxUses: number | null            // Optional usage limit
    requireAuth: boolean              // Require login to access
    trackViews: boolean               // Track who accessed
  }
  stats: {
    views: number
    participations: number
    lastAccessedAt: Date | null
  }
  createdAt: Date
}

function generatePrivateLink(contentId: string, contentType: string): PrivateLink {
  const code = generateSecureCode(10)
  return {
    id: generateCuid(),
    contentId,
    contentType,
    code,
    url: `voxpoll.com/p/${code}`,
    createdBy: getCurrentUserId(),
    settings: {
      expiresAt: null,
      maxUses: null,
      requireAuth: false,
      trackViews: true
    },
    stats: {
      views: 0,
      participations: 0,
      lastAccessedAt: null
    },
    createdAt: new Date()
  }
}

export type { PrivateLink }
export { generatePrivateLink }
```




# ══════════════════════════════════════════════════════════════════════════════
# 6.3 SURVEY SYSTEM (B2B SaaS ONLY)
# ══════════════════════════════════════════════════════════════════════════════

## 6.3.1 Survey Definition & Purpose

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SURVEY = B2B SaaS ONLY                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [DECISION P-015] Surveys are EXCLUSIVELY available to B2B SaaS customers.      │
│  Regular users CANNOT create surveys - only organizations with paid plans.      │
│                                                                                 │
│  WHY SURVEYS ARE B2B ONLY:                                                      │
│  ─────────────────────────                                                      │
│  • Surveys require advanced features (branching, screening, analytics)          │
│  • Data quality requirements need organizational accountability                 │
│  • Complex survey creation needs professional-grade tools                       │
│  • Clear product differentiation: Polls = Users, Surveys = Organizations       │
│  • Revenue model: Surveys are enterprise feature, not consumer feature          │
│                                                                                 │
│  CONTENT TYPE OWNERSHIP:                                                        │
│  ─────────────────────────                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                 │
│  │     POLLS       │  │    SURVEYS      │  │     TESTS       │                 │
│  │  ─────────────  │  │  ─────────────  │  │  ─────────────  │                 │
│  │  Any User       │  │  B2B SaaS ONLY  │  │  Any User       │                 │
│  │  (Free/Premium) │  │  (Organization) │  │  (Free/Premium) │                 │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                 │
│                                                                                 │
│  ORGANIZATION SURVEY TIERS:                                                     │
│  ───────────────────────────                                                    │
│  • Starter ($99/mo): 10 surveys/month, 1,000 responses                         │
│  • Professional ($299/mo): 50 surveys/month, 10,000 responses                  │
│  • Enterprise ($999/mo): Unlimited surveys, 100,000 responses                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

Surveys are multi-question content designed for comprehensive data collection with
advanced logic support. **SURVEYS ARE ONLY AVAILABLE TO B2B SaaS CUSTOMERS.**

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SURVEY TYPE DEFINITION (B2B SaaS Only)
// ══════════════════════════════════════════════════════════════════════════════

interface Survey {
  id: string
  creatorId: string
  organizationId: string                // REQUIRED - not null (B2B only)
  
  title: string
  description: string | null
  coverImageUrl: string | null
  
  pages: SurveyPage[]
  screeningQuestions: ScreeningQuestion[]
  settings: SurveySettings
  
  status: ContentStatus
  visibility: VisibilityLevel
  targetAudience: TargetAudience | null
  
  responseCount: number
  completionRate: number
  averageCompletionTime: number
  
  createdAt: Date
  publishedAt: Date | null
  closesAt: Date | null
  closedAt: Date | null
}

interface SurveyPage {
  id: string
  surveyId: string
  title: string | null
  description: string | null
  position: number
  questions: SurveyQuestion[]
}

interface SurveySettings {
  allowAnonymous: boolean
  requireAuth: boolean
  oneResponsePerUser: boolean
  allowEditResponse: boolean
  showProgressBar: boolean
  showPageNumbers: boolean
  randomizeQuestions: boolean
  randomizeWithinPage: boolean
  timeLimitMinutes: number | null
  showEstimatedTime: boolean
  redirectUrl: string | null
  confirmationMessage: string
  notifyOnResponse: boolean
  notifyOnCompletion: boolean
  showResultsToRespondent: boolean
  collectDeviceInfo: boolean
  collectLocationInfo: boolean

  // ══════════════════════════════════════════════════════════════════════════
  // ANONYMITY & VERIFICATION SETTINGS
  // [DECISION] Some surveys may REQUIRE verified participants for compliance,
  // research validity, or internal policy reasons
  // ══════════════════════════════════════════════════════════════════════════
  allowAnonymousParticipation: boolean  // Default: true (separate from allowAnonymous above)
  requireVerificationLevel: 0 | 1 | 2 | 3 | 4 | null  // Minimum verification level
  anonymityRejectionMessage: string | null  // Custom message for rejected anonymous users

  // Organization-specific settings
  restrictToOrganizationMembers: boolean  // Only org members can participate
  requireSSOAuthentication: boolean       // Must auth via org SSO
}

interface TargetAudience {
  minAge: number | null
  maxAge: number | null
  genders: string[] | null
  locations: string[] | null
  languages: string[] | null
  customCriteria: Record<string, unknown> | null
}
```


## 6.3.2 Survey Question Types

[REFERENCE] Full methodology details in BIBLE-019 Section 19.2-19.7

Surveys support academically-validated question types:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SURVEY QUESTION TYPE TAXONOMY                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  TIER 1: INDUSTRY STANDARD METRICS                                              │
│  ├── NPS (Net Promoter Score) - 0-10 scale, Bain & Company standard             │
│  ├── CSAT (Customer Satisfaction) - 1-5 or 1-7, post-interaction               │
│  └── CES (Customer Effort Score) - 1-7 agreement, Gartner validated            │
│                                                                                 │
│  TIER 2: LIKERT SCALES (Academic Gold Standard)                                 │
│  ├── LIKERT_AGREEMENT_5 - Strongly Disagree to Strongly Agree                  │
│  ├── LIKERT_AGREEMENT_7 - Extended 7-point for precision                       │
│  ├── LIKERT_FREQUENCY - Never to Always                                        │
│  ├── LIKERT_SATISFACTION - Very Dissatisfied to Very Satisfied                 │
│  ├── LIKERT_IMPORTANCE - Not Important to Very Important                       │
│  └── LIKERT_LIKELIHOOD - Very Unlikely to Very Likely                          │
│                                                                                 │
│  TIER 3: ADVANCED CHOICE METHODS                                                │
│  ├── MAXDIFF - Best-Worst Scaling (12-25 items, forced prioritization)         │
│  ├── CONJOINT - Trade-off analysis (4-6 attributes)                            │
│  ├── RANKING - Order by preference (3-7 items max)                             │
│  └── SEMANTIC_DIFFERENTIAL - Bipolar adjective pairs                           │
│                                                                                 │
│  TIER 4: MATRIX & GRID                                                          │
│  ├── MATRIX_SINGLE - Single choice per row (multi-item Likert)                 │
│  ├── MATRIX_MULTIPLE - Multiple choice per row                                 │
│  └── MATRIX_RATING - Star/numeric rating per row                               │
│                                                                                 │
│  TIER 5: BASIC QUESTION TYPES                                                   │
│  ├── SINGLE_CHOICE - One option from list                                      │
│  ├── MULTIPLE_CHOICE - Multiple options from list                              │
│  ├── TEXT_SHORT - Single line text (max 255 chars)                             │
│  ├── TEXT_LONG - Multi-line text (max 5000 chars)                              │
│  ├── DROPDOWN - Single choice from long list                                   │
│  ├── SLIDER - Continuous 0-100 value                                           │
│  └── IMAGE_CHOICE - Visual option selection                                    │
│                                                                                 │
│  TIER 6: SPECIALIZED                                                            │
│  ├── DATE / TIME / DATETIME - Temporal inputs                                  │
│  ├── FILE_UPLOAD - Documents, images                                           │
│  └── YES_NO - Binary choice                                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Question Type Detail Matrix

| Type | Scale | Validation | Use Case | Academic Reference |
|------|-------|------------|----------|-------------------|
| NPS | 0-10 | Integer only | Brand loyalty | Reichheld/Bain 2003 |
| CSAT | 1-5 or 1-7 | Integer only | Interaction satisfaction | Industry standard |
| CES | 1-7 | Integer only | Process friction | Gartner/CEB 2010 |
| LIKERT_AGREEMENT_5 | 1-5 | Integer only | Attitude measurement | Likert 1932 |
| LIKERT_AGREEMENT_7 | 1-7 | Integer only | Precise attitudes | Meta-analysis 2021 |
| MAXDIFF | Best/Worst per set | Required both | Feature prioritization | Louviere 1991 |
| CONJOINT | Profile choice | 1 per task | Trade-off analysis | Green & Rao 1971 |
| RANKING | 1 to N | Unique ranks | Small set priority | N/A |
| SINGLE_CHOICE | 1 selection | Required | Demographics | N/A |
| MULTIPLE_CHOICE | 0+ selections | Min/Max configurable | Multi-select | N/A |
| MATRIX_SINGLE | Per-row single | All rows required | Multi-item scales | N/A |
| SLIDER | 0-100 | Numeric | Probability, intensity | N/A |

### Likert Scale Configuration

```typescript
// [REFERENCE] Full implementation in BIBLE-019 Section 19.2

type LikertScaleType =
  | "AGREEMENT_5"      // 5-point: Kesinlikle Katılmıyorum → Kesinlikle Katılıyorum
  | "AGREEMENT_7"      // 7-point: Extended with "Biraz" options
  | "FREQUENCY_5"      // Hiçbir Zaman → Her Zaman
  | "FREQUENCY_7"      // Extended frequency
  | "SATISFACTION_5"   // Çok Memnuniyetsiz → Çok Memnun
  | "SATISFACTION_7"   // Extended satisfaction
  | "IMPORTANCE_5"     // Hiç Önemli Değil → Çok Önemli
  | "LIKELIHOOD_5"     // Kesinlikle Olmaz → Kesinlikle Olur
  | "QUALITY_5"        // Çok Kötü → Mükemmel

// Scale selection guide:
// - 5-point: Quick surveys, mobile, general population
// - 7-point: Academic research, brand perception, longitudinal studies
// - Avoid even-numbered scales (forces false choice when genuinely neutral)
```

### Industry Metric Formulas

```typescript
// NPS Calculation (Bain & Company Standard)
// Score 9-10 = Promoter, 7-8 = Passive, 0-6 = Detractor
// NPS = % Promoters - % Detractors (range: -100 to +100)
// Interpretation: 70+ World-class, 50-69 Excellent, 30-49 Great, 0-29 Good

// CSAT Calculation
// CSAT % = (Satisfied responses [top 2 box]) / Total responses × 100
// Top 2 box: 4-5 on 5-point, 6-7 on 7-point, 9-10 on 10-point
// Interpretation: 90%+ Exceptional, 80-89% Excellent, 70-79% Good

// CES Calculation (Agreement-based)
// CES = Average score on 1-7 scale (higher = less effort = better)
// Low-effort %: Responses 5-7 / Total × 100
// Interpretation: 6+ Effortless, 5-5.9 Easy, 4-4.9 Moderate, <4 Difficult
```


## 6.3.3 Question Logic & Branching

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SURVEY LOGIC SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

type LogicOperator = 
  | "EQUALS"
  | "NOT_EQUALS"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_EQUAL"
  | "LESS_EQUAL"
  | "IS_EMPTY"
  | "IS_NOT_EMPTY"
  | "IN_LIST"
  | "NOT_IN_LIST"

type LogicAction = 
  | "SHOW_QUESTION"
  | "HIDE_QUESTION"
  | "SKIP_TO_QUESTION"
  | "SKIP_TO_PAGE"
  | "END_SURVEY"
  | "DISQUALIFY"

interface LogicCondition {
  id: string
  questionId: string
  operator: LogicOperator
  value: string | number | string[] | null
  conjunction: "AND" | "OR" | null
}

interface LogicRule {
  id: string
  surveyId: string
  name: string
  conditions: LogicCondition[]
  action: LogicAction
  targetId: string | null
  disqualifyMessage: string | null
  priority: number
  isActive: boolean
}

function evaluateCondition(
  condition: LogicCondition,
  response: unknown
): boolean {
  const { operator, value } = condition
  
  switch (operator) {
    case "EQUALS":
      return response === value
    case "NOT_EQUALS":
      return response !== value
    case "CONTAINS":
      return String(response).toLowerCase().includes(String(value).toLowerCase())
    case "NOT_CONTAINS":
      return !String(response).toLowerCase().includes(String(value).toLowerCase())
    case "GREATER_THAN":
      return Number(response) > Number(value)
    case "LESS_THAN":
      return Number(response) < Number(value)
    case "GREATER_EQUAL":
      return Number(response) >= Number(value)
    case "LESS_EQUAL":
      return Number(response) <= Number(value)
    case "IS_EMPTY":
      return response === null || response === "" || response === undefined
    case "IS_NOT_EMPTY":
      return response !== null && response !== "" && response !== undefined
    case "IN_LIST":
      return Array.isArray(value) && value.includes(response as string)
    case "NOT_IN_LIST":
      return Array.isArray(value) && !value.includes(response as string)
    default:
      return false
  }
}

function evaluateLogicRule(
  rule: LogicRule,
  responses: Map<string, unknown>
): boolean {
  if (!rule.isActive) return false
  
  let result = true
  let currentConjunction: "AND" | "OR" | null = null
  
  for (const condition of rule.conditions) {
    const response = responses.get(condition.questionId)
    const conditionResult = evaluateCondition(condition, response)
    
    if (currentConjunction === null) {
      result = conditionResult
    } else if (currentConjunction === "AND") {
      result = result && conditionResult
    } else {
      result = result || conditionResult
    }
    
    currentConjunction = condition.conjunction
  }
  
  return result
}

export type { LogicOperator, LogicAction, LogicCondition, LogicRule }
export { evaluateCondition, evaluateLogicRule }
```

### Skip Logic Engine

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SKIP LOGIC ENGINE
// ══════════════════════════════════════════════════════════════════════════════
// Determines which question to show next based on rules and responses.
// Supports complex branching, piping, and conditional display.
// ══════════════════════════════════════════════════════════════════════════════

interface SurveyQuestion {
  id: string
  pageId: string
  orderIndex: number
  displayLogic?: LogicRule[]    // Rules that determine if question is shown
  skipLogic?: LogicRule[]       // Rules that determine where to go after answering
  isRequired: boolean
}

interface SurveyPage {
  id: string
  orderIndex: number
  questions: SurveyQuestion[]
  displayLogic?: LogicRule[]    // Rules that determine if entire page is shown
}

interface SkipLogicEngine {
  survey: {
    id: string
    pages: SurveyPage[]
    globalRules: LogicRule[]    // Survey-wide rules (e.g., disqualification)
  }
  responses: Map<string, unknown>
  visitedQuestions: Set<string>
  currentPageIndex: number
  currentQuestionIndex: number
}

// ══════════════════════════════════════════════════════════════════════════════
// NEXT QUESTION ALGORITHM
// ══════════════════════════════════════════════════════════════════════════════

function getNextQuestion(engine: SkipLogicEngine): {
  question: SurveyQuestion | null
  page: SurveyPage | null
  action: 'SHOW_QUESTION' | 'END_SURVEY' | 'DISQUALIFY'
  disqualifyMessage?: string
} {
  const { survey, responses } = engine

  // Step 1: Check global disqualification rules first (highest priority)
  for (const rule of survey.globalRules.filter(r => r.action === 'DISQUALIFY')) {
    if (evaluateLogicRule(rule, responses)) {
      return {
        question: null,
        page: null,
        action: 'DISQUALIFY',
        disqualifyMessage: rule.disqualifyMessage || 'Bu ankete katılım kriterlerini karşılamıyorsunuz.'
      }
    }
  }

  // Step 2: Check skip logic from current question
  const currentQuestion = getCurrentQuestion(engine)
  if (currentQuestion?.skipLogic) {
    // Sort rules by priority (lower number = higher priority)
    const sortedRules = [...currentQuestion.skipLogic].sort((a, b) => a.priority - b.priority)

    for (const rule of sortedRules) {
      if (evaluateLogicRule(rule, responses)) {
        switch (rule.action) {
          case 'SKIP_TO_QUESTION':
            return jumpToQuestion(engine, rule.targetId!)

          case 'SKIP_TO_PAGE':
            return jumpToPage(engine, rule.targetId!)

          case 'END_SURVEY':
            return { question: null, page: null, action: 'END_SURVEY' }

          case 'DISQUALIFY':
            return {
              question: null,
              page: null,
              action: 'DISQUALIFY',
              disqualifyMessage: rule.disqualifyMessage || undefined
            }
        }
      }
    }
  }

  // Step 3: No skip rule matched, find next visible question
  return findNextVisibleQuestion(engine)
}

function findNextVisibleQuestion(engine: SkipLogicEngine): {
  question: SurveyQuestion | null
  page: SurveyPage | null
  action: 'SHOW_QUESTION' | 'END_SURVEY'
} {
  const { survey, responses } = engine
  let pageIndex = engine.currentPageIndex
  let questionIndex = engine.currentQuestionIndex + 1

  while (pageIndex < survey.pages.length) {
    const page = survey.pages[pageIndex]

    // Check if page should be displayed
    if (page.displayLogic) {
      const showPage = page.displayLogic.some(rule =>
        rule.action === 'SHOW_QUESTION' && evaluateLogicRule(rule, responses)
      ) || page.displayLogic.every(rule =>
        rule.action === 'HIDE_QUESTION' && !evaluateLogicRule(rule, responses)
      )

      if (!showPage && page.displayLogic.length > 0) {
        // Skip entire page
        pageIndex++
        questionIndex = 0
        continue
      }
    }

    // Find next visible question on this page
    while (questionIndex < page.questions.length) {
      const question = page.questions[questionIndex]

      // Check if question should be displayed
      if (isQuestionVisible(question, responses)) {
        // Update engine state
        engine.currentPageIndex = pageIndex
        engine.currentQuestionIndex = questionIndex
        engine.visitedQuestions.add(question.id)

        return { question, page, action: 'SHOW_QUESTION' }
      }

      questionIndex++
    }

    // Move to next page
    pageIndex++
    questionIndex = 0
  }

  // No more questions
  return { question: null, page: null, action: 'END_SURVEY' }
}

function isQuestionVisible(
  question: SurveyQuestion,
  responses: Map<string, unknown>
): boolean {
  if (!question.displayLogic || question.displayLogic.length === 0) {
    return true // No display logic = always visible
  }

  // Check display logic rules
  for (const rule of question.displayLogic) {
    if (rule.action === 'SHOW_QUESTION' && evaluateLogicRule(rule, responses)) {
      return true
    }
    if (rule.action === 'HIDE_QUESTION' && evaluateLogicRule(rule, responses)) {
      return false
    }
  }

  // Default: if has SHOW rules and none matched, hide
  const hasShowRules = question.displayLogic.some(r => r.action === 'SHOW_QUESTION')
  return !hasShowRules
}

function jumpToQuestion(
  engine: SkipLogicEngine,
  targetQuestionId: string
): { question: SurveyQuestion | null; page: SurveyPage | null; action: 'SHOW_QUESTION' | 'END_SURVEY' } {
  const { survey, responses } = engine

  for (let pageIndex = 0; pageIndex < survey.pages.length; pageIndex++) {
    const page = survey.pages[pageIndex]

    for (let questionIndex = 0; questionIndex < page.questions.length; questionIndex++) {
      const question = page.questions[questionIndex]

      if (question.id === targetQuestionId) {
        // Check if target question is visible
        if (!isQuestionVisible(question, responses)) {
          // Target is hidden, continue from there
          engine.currentPageIndex = pageIndex
          engine.currentQuestionIndex = questionIndex
          return findNextVisibleQuestion(engine)
        }

        engine.currentPageIndex = pageIndex
        engine.currentQuestionIndex = questionIndex
        engine.visitedQuestions.add(question.id)

        return { question, page, action: 'SHOW_QUESTION' }
      }
    }
  }

  // Target not found, end survey (defensive)
  console.warn(`Skip target question not found: ${targetQuestionId}`)
  return { question: null, page: null, action: 'END_SURVEY' }
}

function jumpToPage(
  engine: SkipLogicEngine,
  targetPageId: string
): { question: SurveyQuestion | null; page: SurveyPage | null; action: 'SHOW_QUESTION' | 'END_SURVEY' } {
  const { survey } = engine

  const pageIndex = survey.pages.findIndex(p => p.id === targetPageId)

  if (pageIndex === -1) {
    console.warn(`Skip target page not found: ${targetPageId}`)
    return { question: null, page: null, action: 'END_SURVEY' }
  }

  // Set to page start (question -1 so findNext will get question 0)
  engine.currentPageIndex = pageIndex
  engine.currentQuestionIndex = -1

  return findNextVisibleQuestion(engine)
}

function getCurrentQuestion(engine: SkipLogicEngine): SurveyQuestion | null {
  const page = engine.survey.pages[engine.currentPageIndex]
  if (!page) return null
  return page.questions[engine.currentQuestionIndex] || null
}

// ══════════════════════════════════════════════════════════════════════════════
// BACK NAVIGATION
// ══════════════════════════════════════════════════════════════════════════════

function getPreviousQuestion(engine: SkipLogicEngine): {
  question: SurveyQuestion | null
  page: SurveyPage | null
} {
  const { survey, responses, visitedQuestions } = engine

  // Convert visited questions to array and reverse
  const visitedArray = Array.from(visitedQuestions)
  const currentQuestionId = getCurrentQuestion(engine)?.id

  // Find current position in visited list
  const currentIndex = visitedArray.indexOf(currentQuestionId || '')

  if (currentIndex <= 0) {
    return { question: null, page: null } // Can't go back
  }

  // Get previous visited question
  const prevQuestionId = visitedArray[currentIndex - 1]

  // Find and return that question
  for (const page of survey.pages) {
    for (const question of page.questions) {
      if (question.id === prevQuestionId) {
        // Check if still visible (conditions might have changed)
        if (isQuestionVisible(question, responses)) {
          return { question, page }
        }
        // If not visible anymore, recursively go further back
        engine.visitedQuestions.delete(prevQuestionId)
        return getPreviousQuestion(engine)
      }
    }
  }

  return { question: null, page: null }
}

// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE PIPING
// ══════════════════════════════════════════════════════════════════════════════

function pipedText(
  template: string,
  responses: Map<string, unknown>
): string {
  // Pattern: {{Q:questionId}} or {{Q:questionId|format}}
  const pipePattern = /\{\{Q:([a-zA-Z0-9_-]+)(?:\|([a-zA-Z0-9_-]+))?\}\}/g

  return template.replace(pipePattern, (match, questionId, format) => {
    const response = responses.get(questionId)

    if (response === undefined || response === null) {
      return '[yanıt bekleniyor]'
    }

    // Format response based on format parameter
    switch (format) {
      case 'upper':
        return String(response).toUpperCase()
      case 'lower':
        return String(response).toLowerCase()
      case 'first':
        return String(response).charAt(0).toUpperCase() + String(response).slice(1)
      default:
        return String(response)
    }
  })
}

// Example usage:
// Template: "{{Q:q1}} seçeneğini tercih ettiniz. Bu tercihinizi {{Q:q2|lower}} ile nasıl ilişkilendirirsiniz?"
// With responses: {q1: "Evet", q2: "İş Hayatı"}
// Output: "Evet seçeneğini tercih ettiniz. Bu tercihinizi iş hayatı ile nasıl ilişkilendirirsiniz?"

export {
  getNextQuestion,
  getPreviousQuestion,
  isQuestionVisible,
  pipedText,
  findNextVisibleQuestion,
}
export type { SkipLogicEngine, SurveyQuestion, SurveyPage }
```

### Skip Logic Visual Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SKIP LOGIC FLOW DIAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│    ┌───────────────┐                                                            │
│    │ User Answers  │                                                            │
│    │   Question    │                                                            │
│    └───────┬───────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│    ┌───────────────┐     Yes    ┌─────────────────┐                             │
│    │  Check Global │──────────▶│   DISQUALIFY    │──▶ Show DQ Message          │
│    │ DQ Rules      │            └─────────────────┘                             │
│    └───────┬───────┘                                                            │
│            │ No                                                                  │
│            ▼                                                                     │
│    ┌───────────────┐     Yes    ┌─────────────────┐                             │
│    │ Check Skip    │──────────▶│  Execute Skip   │                              │
│    │ Logic Rules   │            │  Action         │                              │
│    └───────┬───────┘            └────────┬────────┘                             │
│            │ No                          │                                       │
│            ▼                             │                                       │
│    ┌───────────────┐                     │    ┌────────────────────┐            │
│    │ Get Next      │◀────────────────────┘    │ SKIP_TO_QUESTION   │            │
│    │ Question      │                          │ SKIP_TO_PAGE       │            │
│    └───────┬───────┘                          │ END_SURVEY         │            │
│            │                                  └────────────────────┘            │
│            ▼                                                                     │
│    ┌───────────────┐     No     ┌─────────────────┐                             │
│    │ Is Question   │──────────▶│  Skip Question  │──┐                          │
│    │ Visible?      │            └─────────────────┘  │                          │
│    └───────┬───────┘                                 │                          │
│            │ Yes                                     │                          │
│            ▼                                         │                          │
│    ┌───────────────┐                                 │                          │
│    │ Show Question │◀────────────────────────────────┘                          │
│    └───────────────┘                                                            │
│                                                                                  │
│  ══════════════════════════════════════════════════════════════════════════════ │
│                                                                                  │
│  RULE EVALUATION ORDER:                                                          │
│                                                                                  │
│  1. Global DQ rules (highest priority - survey-wide)                            │
│  2. Question skip rules (sorted by priority field)                              │
│  3. Display logic (determines visibility)                                        │
│  4. Default sequential flow (if no rules match)                                  │
│                                                                                  │
│  CONDITION CONJUNCTION:                                                          │
│                                                                                  │
│  (A AND B) OR (C AND D)                                                          │
│                                                                                  │
│  Evaluated left-to-right with AND having higher precedence:                      │
│  conditions: [                                                                   │
│    { questionId: "A", conjunction: "AND" },                                      │
│    { questionId: "B", conjunction: "OR" },                                       │
│    { questionId: "C", conjunction: "AND" },                                      │
│    { questionId: "D", conjunction: null }                                        │
│  ]                                                                               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 6.3.4 Multi-Page Surveys

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MULTI-PAGE SURVEY STRUCTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Page 1    │───▶│   Page 2    │───▶│   Page 3    │───▶│  Thank You  │      │
│  │  Screening  │    │  Main Q's   │    │  Follow-up  │    │    Page     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘      │
│        │                  │                  │                                  │
│        │                  │                  │                                  │
│        ▼                  ▼                  ▼                                  │
│   ┌─────────┐        ┌─────────┐        ┌─────────┐                            │
│   │ Q1, Q2  │        │ Q3-Q10  │        │ Q11-Q15 │                            │
│   └─────────┘        └─────────┘        └─────────┘                            │
│                           │                                                     │
│                           │ (conditional)                                       │
│                           ▼                                                     │
│                      ┌─────────────┐                                           │
│                      │  Page 2B    │                                           │
│                      │  Branch     │                                           │
│                      └─────────────┘                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

[MUST] Page configuration rules:
- Maximum 20 pages per survey
- Maximum 100 questions per survey
- Maximum 15 questions per page (recommended: 5-7)
- Page titles: Optional, max 100 characters
- Page descriptions: Optional, max 500 characters


## 6.3.5 Pre-Test Screening Questions

Screening questions filter respondents BEFORE they begin the main survey:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SCREENING QUESTION SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

interface ScreeningQuestion {
  id: string
  surveyId: string
  question: string
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "YES_NO" | "AGE_RANGE"
  options: ScreeningOption[]
  isRequired: boolean
  position: number
}

interface ScreeningOption {
  id: string
  text: string
  qualifies: boolean
}

interface ScreeningResult {
  passed: boolean
  failedQuestionId: string | null
  disqualifyMessage: string
}

const DEFAULT_DISQUALIFY_MESSAGES = {
  generic: "Thank you for your interest. Unfortunately, you don't meet the criteria for this survey.",
  age: "This survey is intended for a different age group. Thank you for your interest.",
  location: "This survey is only available in certain regions. Thank you for your interest.",
  experience: "This survey requires specific experience that doesn't match your profile. Thank you for your interest."
} as const

function evaluateScreening(
  questions: ScreeningQuestion[],
  responses: Map<string, string | string[]>
): ScreeningResult {
  for (const question of questions) {
    const response = responses.get(question.id)
    
    if (question.isRequired && !response) {
      return {
        passed: false,
        failedQuestionId: question.id,
        disqualifyMessage: DEFAULT_DISQUALIFY_MESSAGES.generic
      }
    }
    
    const selectedOptions = Array.isArray(response) ? response : [response]
    const qualifyingOptions = question.options.filter(o => o.qualifies)
    const qualifyingIds = qualifyingOptions.map(o => o.id)
    
    const hasQualifyingResponse = selectedOptions.some(r => qualifyingIds.includes(r as string))
    
    if (!hasQualifyingResponse) {
      return {
        passed: false,
        failedQuestionId: question.id,
        disqualifyMessage: DEFAULT_DISQUALIFY_MESSAGES.generic
      }
    }
  }
  
  return {
    passed: true,
    failedQuestionId: null,
    disqualifyMessage: ""
  }
}

export type { ScreeningQuestion, ScreeningOption, ScreeningResult }
export { DEFAULT_DISQUALIFY_MESSAGES, evaluateScreening }
```


## 6.3.6 Survey Completion Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SURVEY COMPLETION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [Start]                                                                        │
│     │                                                                           │
│     ▼                                                                           │
│  ┌──────────────────┐                                                          │
│  │ Auth Required?   │──── Yes ───▶ [Login/Register] ───┐                       │
│  └──────────────────┘                                   │                       │
│     │ No                                                │                       │
│     ▼                                                   ▼                       │
│  ┌──────────────────┐                                                          │
│  │ Screening Q's?   │──── Yes ───▶ [Screening] ───▶ Pass? ──── No ───▶ [End]  │
│  └──────────────────┘                                   │                       │
│     │ No                                               Yes                      │
│     ▼                                                   │                       │
│  ┌──────────────────┐◀──────────────────────────────────┘                       │
│  │ Page 1           │                                                          │
│  │ Questions        │                                                          │
│  └──────────────────┘                                                          │
│     │                                                                           │
│     ▼                                                                           │
│  ┌──────────────────┐                                                          │
│  │ More Pages?      │──── Yes ───▶ [Apply Logic] ───▶ [Next Page]              │
│  └──────────────────┘                                   │                       │
│     │ No                                                │                       │
│     ▼                                                   │                       │
│  ┌──────────────────┐◀──────────────────────────────────┘                       │
│  │ Validate All     │                                                          │
│  │ Required Fields  │                                                          │
│  └──────────────────┘                                                          │
│     │                                                                           │
│     ▼                                                                           │
│  ┌──────────────────┐                                                          │
│  │ Submit Response  │                                                          │
│  └──────────────────┘                                                          │
│     │                                                                           │
│     ▼                                                                           │
│  ┌──────────────────┐                                                          │
│  │ Show Results?    │──── Yes ───▶ [Results Page]                              │
│  └──────────────────┘                                                          │
│     │ No                                                                        │
│     ▼                                                                           │
│  ┌──────────────────┐                                                          │
│  │ Redirect URL?    │──── Yes ───▶ [External Redirect]                         │
│  └──────────────────┘                                                          │
│     │ No                                                                        │
│     ▼                                                                           │
│  [Thank You Page]                                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 6.4 PERSONALITY TEST SYSTEM (COMPREHENSIVE)
# ══════════════════════════════════════════════════════════════════════════════

## 6.4.1 Test Philosophy & Vision

[DECISION] VoxPoll's test system is designed to maximize user engagement, virality, and
app stickiness through scientifically-grounded yet accessible personality assessments.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         TEST SYSTEM PHILOSOPHY                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                        CORE PRINCIPLES                                    │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  1. SCIENTIFIC FOUNDATION                                                │   │
│  │     • Research-backed methodologies where applicable                     │   │
│  │     • Statistical validity for axis-based tests                          │   │
│  │     • Transparent scoring mechanisms                                     │   │
│  │                                                                          │   │
│  │  2. USER ACCESSIBILITY                                                   │   │
│  │     • No-code test creation interface                                    │   │
│  │     • Intuitive question-to-result mapping                               │   │
│  │     • Real-time preview during creation                                  │   │
│  │                                                                          │   │
│  │  3. VIRAL SHAREABILITY                                                   │   │
│  │     • Beautiful, platform-optimized result cards                         │   │
│  │     • Compelling result narratives                                       │   │
│  │     • "Challenge friends" mechanics                                      │   │
│  │                                                                          │   │
│  │  4. CREATOR FLEXIBILITY                                                  │   │
│  │     • Multiple test paradigms (axis, character, spectrum)                │   │
│  │     • Custom scoring logic                                               │   │
│  │     • Branded result experiences                                         │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 6.4.2 Test Type Taxonomy

[MUST] VoxPoll supports THREE distinct test paradigms:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          TEST TYPE TAXONOMY                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │                     │  │                     │  │                     │      │
│  │     AXIS TEST       │  │   CHARACTER TEST    │  │   SPECTRUM TEST     │      │
│  │                     │  │                     │  │                     │      │
│  │   [Compass Icon]    │  │   [Users Icon]      │  │   [Gauge Icon]      │      │
│  │                     │  │                     │  │                     │      │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘      │
│             │                        │                        │                  │
│             ▼                        ▼                        ▼                  │
│                                                                                  │
│  Multi-dimensional           Categorical              Single-dimension           │
│  coordinate system           personality match        percentage scale           │
│                                                                                  │
│  Examples:                   Examples:                Examples:                  │
│  • Political Compass         • "Which character       • "How introverted         │
│  • MBTI-style 4 axes           are you?"                are you?"                │
│  • Values assessment         • "Which manifest        • "Tech adoption           │
│  • Custom 2-4 axis tests       girl are you?"           readiness"               │
│                              • "Which animal          • "Risk tolerance"         │
│                                matches you?"                                     │
│                                                                                  │
│  Result: X,Y coordinates     Result: Best-match       Result: 0-100%             │
│  on defined axes             character + %            on single scale            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST TYPE DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

type TestType = "AXIS" | "CHARACTER" | "SPECTRUM"

interface BaseTest {
  id: string
  type: TestType
  creatorId: string
  organizationId: string | null

  title: string
  description: string
  coverImageUrl: string | null

  questions: TestQuestion[]
  settings: TestSettings

  status: ContentStatus
  visibility: VisibilityLevel

  completionCount: number
  shareCount: number
  averageCompletionTime: number

  createdAt: Date
  publishedAt: Date | null

  // ═══════════════════════════════════════════════════════════════════════════
  // OPTIONAL: Pre-test Screening & Target Audience
  // For tests that require qualified respondents (e.g., B2B brand tests)
  // [REFERENCE] See BIBLE-020 Section 20.9 Quality Control Matrix
  // ═══════════════════════════════════════════════════════════════════════════
  preTestScreening: TestPreTestScreening | null
  targetAudience: TestTargetAudience | null

  // ═══════════════════════════════════════════════════════════════════════════
  // RELIABILITY & QUALITY METRICS
  // Calculated based on response quality and sample characteristics
  // ═══════════════════════════════════════════════════════════════════════════
  reliabilityScore: number | null         // 0-100, null if insufficient data
  reliabilityGrade: "A" | "B" | "C" | "D" | "F" | null
  validResponseCount: number              // Responses passing quality threshold
  excludedResponseCount: number           // Responses filtered out
  averageQualityScore: number | null      // Mean quality across valid responses
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST PRE-TEST SCREENING
// Optional screening to ensure qualified respondents
// ═══════════════════════════════════════════════════════════════════════════════

interface TestPreTestScreening {
  enabled: boolean
  questions: TestScreeningQuestion[]
  failAction: "BLOCK" | "REDIRECT" | "ALLOW_WITH_FLAG"
  failMessage: string                     // Message shown when disqualified
}

interface TestScreeningQuestion {
  id: string
  question: string
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "YES_NO"
  options: Array<{
    id: string
    text: string
    qualifies: boolean                    // Does this answer qualify the user?
  }>
  required: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST TARGET AUDIENCE
// Demographic filtering for test participants
// ═══════════════════════════════════════════════════════════════════════════════

interface TestTargetAudience {
  enabled: boolean

  // Demographics (uses locked user demographics)
  ageRange: { min: number, max: number } | null
  genders: ("MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY")[] | null
  countries: string[] | null
  regions: string[] | null

  // Custom criteria (based on user interests/profile)
  interests: string[] | null
  educationLevels: string[] | null
  employmentStatuses: string[] | null

  // Behavior-based filtering
  requireVerifiedAccount: boolean
  minimumAccountAgeDays: number | null
  minimumParticipationCount: number | null
}

export type { TestPreTestScreening, TestScreeningQuestion, TestTargetAudience }

interface TestSettings {
  showProgressBar: boolean
  showQuestionCount: boolean
  randomizeQuestions: boolean
  timeLimitMinutes: number | null
  allowRetake: boolean
  retakeCooldownHours: number
  shareResultsEnabled: boolean
  collectEmail: boolean
  resultExpiryDays: number | null
  showDetailedBreakdown: boolean
  allowComparison: boolean

  // [DECISION P-017] Badge settings for profile display
  badge: TestBadgeSettings

  // ═══════════════════════════════════════════════════════════════════════════
  // QUALITY CONTROL SETTINGS
  // [REFERENCE] See BIBLE-020 Section 20.2 for unified quality framework
  // ═══════════════════════════════════════════════════════════════════════════
  qualityControl: TestQualityControlSettings
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST QUALITY CONTROL SETTINGS
// Ensures data validity for tests used in research contexts
// ═══════════════════════════════════════════════════════════════════════════════

interface TestQualityControlSettings {
  // ─────────────────────────────────────────────────────────────────────────────
  // Attention Checks (Recommended for 10+ questions)
  // ─────────────────────────────────────────────────────────────────────────────
  enableAttentionChecks: boolean          // Default: true for 10+ questions
  attentionCheckCount: number             // Recommended: 1 per 15 questions
  maxAttentionCheckFailures: number       // Default: 1 (stricter than surveys)
  attentionCheckAction: "FLAG" | "EXCLUDE" | "REVIEW"  // Default: FLAG

  // ─────────────────────────────────────────────────────────────────────────────
  // Straight-lining Detection
  // Detects when user selects same answer repeatedly
  // ─────────────────────────────────────────────────────────────────────────────
  enableStraightLiningDetection: boolean  // Default: true
  straightLiningThreshold: number         // Default: 0.7 (stricter for tests)
  straightLiningAction: "FLAG" | "EXCLUDE" | "REVIEW"  // Default: FLAG

  // ─────────────────────────────────────────────────────────────────────────────
  // Speeding Detection
  // ─────────────────────────────────────────────────────────────────────────────
  enableSpeedingDetection: boolean        // Default: true
  speedingThreshold: number               // Default: 0.4 (40% of expected time)
  minimumTimePerQuestion: number          // Default: 3 seconds
  speedingAction: "FLAG" | "EXCLUDE" | "REVIEW"  // Default: FLAG

  // ─────────────────────────────────────────────────────────────────────────────
  // Behavioral Monitoring
  // ─────────────────────────────────────────────────────────────────────────────
  enableTabSwitchDetection: boolean       // Default: true
  maxTabSwitches: number                  // Default: 5
  tabSwitchAction: "WARN" | "FLAG" | "EXCLUDE"  // Default: FLAG
  disableCopyPaste: boolean               // Default: true

  // ─────────────────────────────────────────────────────────────────────────────
  // Quality Threshold
  // ─────────────────────────────────────────────────────────────────────────────
  minimumQualityScore: number             // Default: 40 (out of 100)
  enableQualityFiltering: boolean         // Default: false (opt-in for tests)
}

// Default quality control settings for tests
const DEFAULT_TEST_QUALITY_SETTINGS: TestQualityControlSettings = {
  enableAttentionChecks: false,           // Opt-in by default
  attentionCheckCount: 1,
  maxAttentionCheckFailures: 1,
  attentionCheckAction: "FLAG",

  enableStraightLiningDetection: true,
  straightLiningThreshold: 0.7,
  straightLiningAction: "FLAG",

  enableSpeedingDetection: true,
  speedingThreshold: 0.4,
  minimumTimePerQuestion: 3,
  speedingAction: "FLAG",

  enableTabSwitchDetection: true,
  maxTabSwitches: 5,
  tabSwitchAction: "FLAG",
  disableCopyPaste: true,

  minimumQualityScore: 40,
  enableQualityFiltering: false
}

export { DEFAULT_TEST_QUALITY_SETTINGS }
export type { TestQualityControlSettings }

// ══════════════════════════════════════════════════════════════════════════════
// TEST BADGE SYSTEM - Profile Display
// [DECISION P-017] Test results create profile BADGES displayed on user profile
// ══════════════════════════════════════════════════════════════════════════════

interface TestBadgeSettings {
  enabled: boolean                    // Whether this test awards badges
  displayOnProfile: boolean           // Default display setting for users
  badgeStyle: "MINIMAL" | "STANDARD" | "DETAILED"
  customBadgeImage: string | null     // Custom badge image URL (optional)
}

interface TestResultBadge {
  id: string
  testId: string
  userId: string

  // Result info
  resultType: TestType
  resultTitle: string                 // e.g., "ENTP - The Debater"
  resultSubtitle: string | null       // e.g., "Only 4.3% got this result"
  resultImageUrl: string              // Badge/result image

  // For AXIS tests
  axisScores: { axisId: string, label: string, score: number }[] | null

  // For CHARACTER tests
  characterName: string | null
  matchPercentage: number | null

  // For SPECTRUM tests
  spectrumScore: number | null
  spectrumLabel: string | null

  // Display settings
  displayOnProfile: boolean           // User can toggle
  pinnedPosition: number | null       // User can pin badges (1-5)
  earnedAt: Date
}

// User profile badge display
interface ProfileBadgeDisplay {
  userId: string
  badges: TestResultBadge[]
  pinnedBadges: TestResultBadge[]     // Max 5 pinned badges
  totalBadges: number
  displaySettings: {
    showBadgeCount: boolean
    badgeLayout: "GRID" | "LIST" | "CAROUSEL"
    maxVisibleBadges: number          // Before "see all" link
  }
}

export type { TestType, BaseTest, TestSettings, TestBadgeSettings, TestResultBadge, ProfileBadgeDisplay }
```


## 6.4.2a TEST BADGE SYSTEM FOR USER PROFILES

[DECISION P-017] Test results automatically create badges that users can display
on their profile. This encourages viral sharing and return visits.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        TEST BADGE SYSTEM                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PURPOSE:                                                                       │
│  ─────────                                                                      │
│  • Display test results as collectible badges on user profiles                  │
│  • Encourage users to take more tests to complete their "badge collection"      │
│  • Enable viral sharing through profile display                                 │
│  • Create identity expression through test results                              │
│                                                                                 │
│  HOW IT WORKS:                                                                  │
│  ─────────────                                                                  │
│                                                                                 │
│  User takes test ───▶ Result calculated ───▶ Badge created ───▶ Profile display│
│                                                                                 │
│  BADGE TYPES BY TEST TYPE:                                                      │
│  ─────────────────────────                                                      │
│                                                                                 │
│  AXIS TEST BADGE:                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐           │
│  │  ┌─────────────────────────────────────────────────────────┐   │           │
│  │  │      [POLITICAL COMPASS]                                │   │           │
│  │  │                                                         │   │           │
│  │  │             🟢 Your Position                            │   │           │
│  │  │          ────┼────                                      │   │           │
│  │  │              │                                          │   │           │
│  │  │                                                         │   │           │
│  │  │      Libertarian Left (-2.3, -4.1)                     │   │           │
│  │  │      Top 12% of users                                   │   │           │
│  │  └─────────────────────────────────────────────────────────┘   │           │
│  └─────────────────────────────────────────────────────────────────┘           │
│                                                                                 │
│  CHARACTER TEST BADGE:                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐           │
│  │  ┌─────────────────────────────────────────────────────────┐   │           │
│  │  │      [Which Office Character Are You?]                  │   │           │
│  │  │                                                         │   │           │
│  │  │           [Character Image]                             │   │           │
│  │  │                                                         │   │           │
│  │  │           JIM HALPERT                                   │   │           │
│  │  │           89% Match                                     │   │           │
│  │  │                                                         │   │           │
│  │  └─────────────────────────────────────────────────────────┘   │           │
│  └─────────────────────────────────────────────────────────────────┘           │
│                                                                                 │
│  SPECTRUM TEST BADGE:                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐           │
│  │  ┌─────────────────────────────────────────────────────────┐   │           │
│  │  │      [Introvert ←→ Extrovert Scale]                     │   │           │
│  │  │                                                         │   │           │
│  │  │      ████████████████████░░░░░░░░░░ 72%                 │   │           │
│  │  │                                                         │   │           │
│  │  │           AMBIVERT                                      │   │           │
│  │  │      "Balanced between both worlds"                     │   │           │
│  │  │                                                         │   │           │
│  │  └─────────────────────────────────────────────────────────┘   │           │
│  └─────────────────────────────────────────────────────────────────┘           │
│                                                                                 │
│  PROFILE DISPLAY:                                                               │
│  ─────────────────                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Avatar] @username                                                     │   │
│  │  Bio: "Test enthusiast 🎯"                                              │   │
│  │                                                                         │   │
│  │  📊 Stats: 23 polls | 156 participations | 12 badges                   │   │
│  │                                                                         │   │
│  │  🏆 PINNED BADGES (Top 5):                                             │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                              │   │
│  │  │ENTP │ │Lib- │ │Jim  │ │72%  │ │Tech │                              │   │
│  │  │     │ │Left │ │     │ │Ambv │ │Geek │                              │   │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                              │   │
│  │                                                                         │   │
│  │  [View all 12 badges]                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  USER CONTROLS:                                                                 │
│  ───────────────                                                                │
│  • Toggle each badge's visibility (public/private)                             │
│  • Pin up to 5 badges to profile header                                         │
│  • Choose badge display style (minimal/standard/detailed)                       │
│  • Share individual badges to social media                                      │
│  • Retake test to update badge (if test allows)                                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### [DECISION P-034] Badge Lifecycle Policy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BADGE LIFECYCLE STATE MACHINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐                                                          │
│  │  TEST_TAKEN   │  ◄─── User completes a test                              │
│  │               │                                                          │
│  └───────┬───────┘                                                          │
│          │                                                                  │
│          │ Pass criteria met                                                │
│          ▼                                                                  │
│  ┌───────────────┐                                                          │
│  │ BADGE_EARNED  │ ◄─── Badge created with result                           │
│  │   (ACTIVE)    │      state: ACTIVE, visible: true                        │
│  └───────┬───────┘                                                          │
│          │                                                                  │
│     ┌────┴────────────────────────────────────────────┐                     │
│     │                     │                           │                     │
│     ▼                     ▼                           ▼                     │
│ ┌────────┐         ┌────────────┐              ┌──────────┐                 │
│ │ HIDDEN │         │  REPLACED  │              │ DELETED  │                 │
│ │        │         │            │              │          │                 │
│ └────┬───┘         └──────┬─────┘              └──────────┘                 │
│      │                    │                         │                       │
│      │ User toggles       │ User retakes            │ User deletes          │
│      │ visibility         │ test, chooses           │ from profile          │
│      │                    │ to replace              │                       │
│      ▼                    │                         │                       │
│ ┌────────┐                │                         │                       │
│ │UNHIDDEN│◄───────────────┘                         │                       │
│ │(ACTIVE)│                                          │                       │
│ └────────┘                                          │                       │
│                                                     │                       │
├─────────────────────────────────────────────────────┴───────────────────────┤
│                                                                             │
│  EXTERNAL EVENTS (Test/Creator changes)                                     │
│                                                                             │
│  ┌──────────────┐                                                           │
│  │ ACTIVE BADGE │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                   │
│    ┌────┴────────────────┬────────────────────────┐                         │
│    ▼                     ▼                        ▼                         │
│ ┌────────────┐    ┌──────────────┐         ┌──────────────┐                 │
│ │TEST_DELETED│    │TEST_UPDATED  │         │CREATOR_GONE  │                 │
│ │            │    │ (major)      │         │              │                 │
│ └──────┬─────┘    └──────┬───────┘         └──────┬───────┘                 │
│        │                 │                        │                         │
│        ▼                 ▼                        ▼                         │
│ ┌────────────┐    ┌──────────────┐         ┌──────────────┐                 │
│ │BADGE_STAYS │    │BADGE_STAYS   │         │BADGE_STAYS   │                 │
│ │testLink:off│    │canRetake:true│         │creator:anon  │                 │
│ └────────────┘    └──────────────┘         └──────────────┘                 │
│                                                                             │
│  NOTE: Badges are ALWAYS preserved. The badge itself never changes state    │
│        based on external events - only metadata/links are updated.          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// BADGE LIFECYCLE POLICY
// [AUTHORITATIVE] Defines what happens to badges when tests are deleted, updated, or modified
// ═══════════════════════════════════════════════════════════════════════════════

type BadgeState =
  | "ACTIVE"              // Normal visible badge
  | "HIDDEN"              // User chose to hide
  | "REPLACED"            // User retook test and chose to replace
  | "DELETED"             // User deleted from profile

type BadgeTestStatus =
  | "AVAILABLE"           // Test can still be taken
  | "ARCHIVED"            // Test deleted but badge preserved
  | "UPDATED"             // Test updated, user can retake

const BADGE_STATE_TRANSITIONS: Record<BadgeState, BadgeState[]> = {
  ACTIVE: ["HIDDEN", "REPLACED", "DELETED"],
  HIDDEN: ["ACTIVE", "DELETED"],
  REPLACED: [],           // Terminal (old badge replaced)
  DELETED: []             // Terminal (badge gone)
}

const BADGE_LIFECYCLE = {
  // ─────────────────────────────────────────────────────────────────────────────
  // TEST DELETION HANDLING
  // ─────────────────────────────────────────────────────────────────────────────
  onTestDelete: {
    badgeAction: "PRESERVE",          // PRESERVE | ARCHIVE | DELETE
    // Badges stay on user profiles even if test is deleted

    // Display modifications for deleted test badges
    showDeletedMarker: false,         // Don't show "Test no longer available"
    linkToTest: false,                // Disable "Take this test" link
    showCreatorInfo: true,            // Keep showing who created the test

    // Badge description update
    updateDescription: true,
    deletedTestDescription: "Bu test artık mevcut değil, ancak sonucunuz korunmuştur."
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST UPDATE HANDLING
  // ─────────────────────────────────────────────────────────────────────────────
  onTestUpdate: {
    // Major update = question changes affecting results
    majorUpdate: {
      existingBadges: "PRESERVE",     // Keep old badges
      markAsOutdated: false,          // Don't mark as "old version"
      allowRetake: true,              // User can retake for new badge
      keepBothVersions: true          // User has both old and new badge
    },

    // Minor update = wording, images, description only
    minorUpdate: {
      existingBadges: "PRESERVE",
      updateBadgeMetadata: false      // Don't sync name/description changes
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATOR ACCOUNT DELETION
  // ─────────────────────────────────────────────────────────────────────────────
  onCreatorDelete: {
    badges: "PRESERVE",               // Badges stay
    showCreator: "ANONYMOUS",         // Show as "Deleted User"
    testStatus: "ARCHIVE",            // Test archived, no new participants
    existingResults: "PRESERVE"       // All existing badges preserved
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BADGE HOLDER ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  holderActions: {
    canDelete: true,                  // User can delete their own badge
    canHide: true,                    // User can make badge private
    canRetake: true,                  // User can retake test (if test allows)
    retakePolicy: {
      replaceOldBadge: false,         // Keep old badge by default
      userChoice: true,               // User can choose to replace
      maxBadgesPerTest: 3,            // Max 3 badges from same test
      cooldownHours: 24               // Wait 24h between retakes
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BADGE DISPLAY WHEN TEST UNAVAILABLE
  // ─────────────────────────────────────────────────────────────────────────────
  unavailableTestDisplay: {
    // When test is deleted/archived/private
    showBadge: true,                  // Always show earned badge
    showResult: true,                 // Show result details
    showDate: true,                   // Show when earned
    showTestLink: false,              // No "Take this test" button

    // UI elements
    grayscale: false,                 // Don't gray out badge
    addIcon: null,                    // No special icon
    tooltip: null                     // No hover message
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BADGE EXPIRATION (Future feature)
  // ─────────────────────────────────────────────────────────────────────────────
  expiration: {
    enabled: false,                   // Badges never expire by default
    // Future: Some tests might have time-limited badges
    creatorCanSetExpiry: false,       // Not in MVP
    defaultExpiryDays: null           // No expiry
  }
}

// Handle badge when test is deleted
async function handleTestDeletion(testId: string): Promise<void> {
  const policy = BADGE_LIFECYCLE.onTestDelete

  if (policy.badgeAction === "PRESERVE") {
    // Update all badges to show test is unavailable
    await db.testResultBadge.updateMany({
      where: { testId },
      data: {
        testAvailable: false,
        testDeletedAt: new Date(),
        updatedDescription: policy.updateDescription
          ? BADGE_LIFECYCLE.unavailableTestDisplay.tooltip
          : undefined
      }
    })

    // Archive the test (soft delete)
    await db.test.update({
      where: { id: testId },
      data: {
        status: "ARCHIVED",
        deletedAt: new Date()
      }
    })
  }
}

// Check if user can retake test
function canRetakeTest(
  userId: string,
  testId: string,
  existingBadges: { createdAt: Date }[]
): { canRetake: boolean; reason?: string; waitUntil?: Date } {
  const policy = BADGE_LIFECYCLE.holderActions.retakePolicy

  // Check max badges per test
  if (existingBadges.length >= policy.maxBadgesPerTest) {
    return {
      canRetake: false,
      reason: "MAX_BADGES_REACHED"
    }
  }

  // Check cooldown
  const lastBadge = existingBadges.sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  )[0]

  if (lastBadge) {
    const cooldownEnd = new Date(
      lastBadge.createdAt.getTime() + policy.cooldownHours * 3600000
    )
    if (cooldownEnd > new Date()) {
      return {
        canRetake: false,
        reason: "COOLDOWN_ACTIVE",
        waitUntil: cooldownEnd
      }
    }
  }

  return { canRetake: true }
}

export { BADGE_LIFECYCLE, handleTestDeletion, canRetakeTest }
```


## 6.4.3 AXIS TEST - Multi-Dimensional Personality Mapping

[REFERENCE] Inspired by Political Compass, MBTI, and academic personality models.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AXIS TEST SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  An axis test places respondents on a coordinate system defined by 2-4 axes.    │
│  Each axis represents a bipolar dimension (e.g., Liberal ←→ Conservative).      │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │                        AXIS CONFIGURATION                               │    │
│  │                                                                         │    │
│  │  2-Axis (Quadrant):     4-Axis (MBTI-style):                           │    │
│  │                                                                         │    │
│  │         Axis Y+                  Axis 1: E ←──────→ I                  │    │
│  │           │                      Axis 2: S ←──────→ N                  │    │
│  │           │                      Axis 3: T ←──────→ F                  │    │
│  │   Axis X- ┼─────── Axis X+       Axis 4: J ←──────→ P                  │    │
│  │           │                                                             │    │
│  │           │                      Result: ENTP, ISFJ, etc.              │    │
│  │         Axis Y-                                                         │    │
│  │                                                                         │    │
│  │  Result: (X: -0.3, Y: 0.7)                                             │    │
│  │  Quadrant: "Libertarian Left"                                          │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// AXIS TEST TYPE DEFINITION
// ══════════════════════════════════════════════════════════════════════════════

interface AxisTest extends BaseTest {
  type: "AXIS"
  axes: AxisDefinition[]
  quadrants: QuadrantDefinition[] | null
  scoringConfig: AxisScoringConfig
}

interface AxisDefinition {
  id: string
  testId: string
  position: number

  name: string
  negativeLabel: string
  positiveLabel: string
  negativeDescription: string
  positiveDescription: string

  negativeColor: string
  positiveColor: string
  negativeIcon: string | null
  positiveIcon: string | null
}

interface QuadrantDefinition {
  id: string
  testId: string

  name: string
  slug: string
  description: string
  detailedDescription: string
  imageUrl: string | null
  color: string
  iconName: string | null

  axisConditions: {
    axisId: string
    position: "POSITIVE" | "NEGATIVE"
  }[]

  traits: string[]
  famousExamples: string[]
}

interface AxisScoringConfig {
  normalizationMethod: "LINEAR" | "Z_SCORE" | "PERCENTILE"
  centerValue: number
  scaleRange: { min: number, max: number }
}

// ══════════════════════════════════════════════════════════════════════════════
// AXIS TEST QUESTION STRUCTURE
// ══════════════════════════════════════════════════════════════════════════════

interface AxisTestQuestion {
  id: string
  testId: string
  position: number

  text: string
  imageUrl: string | null

  questionType: "STATEMENT_AGREE" | "FORCED_CHOICE" | "SLIDER"
  config: AxisStatementConfig | AxisForcedChoiceConfig | AxisSliderConfig
}

interface AxisStatementConfig {
  type: "STATEMENT_AGREE"
  statement: string
  scale: 5 | 7
  labels: string[]

  axisImpact: {
    axisId: string
    direction: "POSITIVE" | "NEGATIVE"
    weight: number
    invertOnDisagree: boolean
  }[]
}

interface AxisForcedChoiceConfig {
  type: "FORCED_CHOICE"
  optionA: {
    text: string
    axisImpacts: { axisId: string, value: number }[]
  }
  optionB: {
    text: string
    axisImpacts: { axisId: string, value: number }[]
  }
}

interface AxisSliderConfig {
  type: "SLIDER"
  leftLabel: string
  rightLabel: string
  steps: number

  axisMapping: {
    axisId: string
    leftValue: number
    rightValue: number
  }[]
}

// ══════════════════════════════════════════════════════════════════════════════
// AXIS TEST RESULT CALCULATION
// ══════════════════════════════════════════════════════════════════════════════

interface AxisTestResult {
  testId: string
  userId: string | null

  axisScores: {
    axisId: string
    axisName: string
    score: number
    normalizedScore: number
    percentile: number
    leaning: "NEGATIVE" | "CENTER" | "POSITIVE"
    leaningLabel: string
    leaningStrength: "WEAK" | "MODERATE" | "STRONG"
  }[]

  coordinates: { x: number, y: number } | null
  quadrant: QuadrantDefinition | null
  typeCode: string | null

  completedAt: Date
  shareableCardUrl: string | null
}

function calculateAxisResult(
  test: AxisTest,
  responses: Map<string, unknown>
): AxisTestResult {
  const axisScores = new Map<string, number>()
  const axisMaxScores = new Map<string, number>()

  test.axes.forEach(axis => {
    axisScores.set(axis.id, 0)
    axisMaxScores.set(axis.id, 0)
  })

  test.questions.forEach(question => {
    const response = responses.get(question.id)
    if (response === undefined) return

    if (question.config.type === "STATEMENT_AGREE") {
      const config = question.config as AxisStatementConfig
      const responseValue = response as number
      const midpoint = Math.ceil(config.scale / 2)
      const deviation = responseValue - midpoint

      config.axisImpact.forEach(impact => {
        let score = deviation * impact.weight
        if (impact.direction === "NEGATIVE") score *= -1
        if (impact.invertOnDisagree && deviation < 0) score *= -1

        const current = axisScores.get(impact.axisId) || 0
        axisScores.set(impact.axisId, current + score)

        const maxPossible = Math.abs(midpoint - 1) * impact.weight
        const currentMax = axisMaxScores.get(impact.axisId) || 0
        axisMaxScores.set(impact.axisId, currentMax + maxPossible)
      })
    }

    if (question.config.type === "FORCED_CHOICE") {
      const config = question.config as AxisForcedChoiceConfig
      const selectedOption = response === "A" ? config.optionA : config.optionB

      selectedOption.axisImpacts.forEach(impact => {
        const current = axisScores.get(impact.axisId) || 0
        axisScores.set(impact.axisId, current + impact.value)
      })
    }

    if (question.config.type === "SLIDER") {
      const config = question.config as AxisSliderConfig
      const sliderValue = response as number
      const normalizedPosition = sliderValue / (config.steps - 1)

      config.axisMapping.forEach(mapping => {
        const score = mapping.leftValue +
          (mapping.rightValue - mapping.leftValue) * normalizedPosition
        const current = axisScores.get(mapping.axisId) || 0
        axisScores.set(mapping.axisId, current + score)
      })
    }
  })

  const normalizedScores = test.axes.map(axis => {
    const rawScore = axisScores.get(axis.id) || 0
    const maxScore = axisMaxScores.get(axis.id) || 1
    const normalized = maxScore > 0 ? rawScore / maxScore : 0
    const clamped = Math.max(-1, Math.min(1, normalized))

    const leaningStrength: "WEAK" | "MODERATE" | "STRONG" =
      Math.abs(clamped) < 0.33 ? "WEAK" :
      Math.abs(clamped) < 0.67 ? "MODERATE" : "STRONG"

    const leaning: "NEGATIVE" | "CENTER" | "POSITIVE" =
      clamped < -0.1 ? "NEGATIVE" :
      clamped > 0.1 ? "POSITIVE" : "CENTER"

    return {
      axisId: axis.id,
      axisName: axis.name,
      score: rawScore,
      normalizedScore: clamped,
      percentile: Math.round((clamped + 1) * 50),
      leaning,
      leaningLabel: leaning === "NEGATIVE" ? axis.negativeLabel :
                    leaning === "POSITIVE" ? axis.positiveLabel : "Balanced",
      leaningStrength
    }
  })

  let quadrant: QuadrantDefinition | null = null
  let coordinates: { x: number, y: number } | null = null
  let typeCode: string | null = null

  if (test.axes.length === 2) {
    coordinates = {
      x: normalizedScores[0].normalizedScore,
      y: normalizedScores[1].normalizedScore
    }

    if (test.quadrants) {
      quadrant = test.quadrants.find(q => {
        return q.axisConditions.every(cond => {
          const axisScore = normalizedScores.find(s => s.axisId === cond.axisId)
          if (!axisScore) return false
          return cond.position === "POSITIVE"
            ? axisScore.normalizedScore > 0
            : axisScore.normalizedScore <= 0
        })
      }) || null
    }
  }

  if (test.axes.length === 4) {
    typeCode = normalizedScores.map(score => {
      const axis = test.axes.find(a => a.id === score.axisId)!
      return score.normalizedScore > 0
        ? axis.positiveLabel.charAt(0)
        : axis.negativeLabel.charAt(0)
    }).join("")
  }

  return {
    testId: test.id,
    userId: null,
    axisScores: normalizedScores,
    coordinates,
    quadrant,
    typeCode,
    completedAt: new Date(),
    shareableCardUrl: null
  }
}

export type { AxisTest, AxisDefinition, QuadrantDefinition, AxisTestResult }
export type { AxisTestQuestion, AxisStatementConfig, AxisForcedChoiceConfig, AxisSliderConfig }
export { calculateAxisResult }
```

**Axis Test Result Visualization:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      YOUR POLITICAL COMPASS RESULT                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                              Authoritarian                                       │
│                                   │                                              │
│                                   │                                              │
│         Authoritarian     ┌───────┼───────┐     Authoritarian                   │
│         Left              │       │       │     Right                           │
│                           │       │       │                                      │
│                    ───────┼───────┼───────┼───────                              │
│         Economic          │       │   ●   │           Economic                  │
│         Left              │       │ YOU   │           Right                     │
│                           │       │       │                                      │
│         Libertarian       └───────┼───────┘     Libertarian                     │
│         Left                      │             Right                            │
│                                   │                                              │
│                              Libertarian                                         │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Your Position: Economic: +2.3 (Center-Right), Social: +1.8 (Lib-leaning) │ │
│  │  Quadrant: LIBERTARIAN RIGHT                                               │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  You value individual liberty and free markets. You tend to favor              │
│  limited government intervention in both economic and personal matters.         │
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                          │
│  │ [Share]      │  │ [Compare]    │  │ [Retake]     │                          │
│  │ Share Result │  │ vs Friends   │  │ Take Again   │                          │
│  └──────────────┘  └──────────────┘  └──────────────┘                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 6.4.4 CHARACTER TEST - Personality Match System

[REFERENCE] The most engaging test type for viral sharing - "Which X are you?"

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CHARACTER TEST SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Character tests match respondents to predefined personas/characters based      │
│  on accumulated trait scores. Perfect for entertainment and brand engagement.   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │                      HOW CHARACTER MATCHING WORKS                       │    │
│  │                                                                         │    │
│  │  1. Creator defines CHARACTERS (2-20)                                  │    │
│  │     Each character has: name, image, description, traits               │    │
│  │                                                                         │    │
│  │  2. Creator creates QUESTIONS (5-50)                                   │    │
│  │     Each answer option awards points to specific characters            │    │
│  │                                                                         │    │
│  │  3. System calculates MATCH PERCENTAGES                                │    │
│  │     User sees: "You are 87% Rachel, 62% Monica, 45% Phoebe"           │    │
│  │                                                                         │    │
│  │  4. Result shows TOP MATCH with detailed description                   │    │
│  │     Plus: comparison chart, shareable card, friend challenge           │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  POPULAR USE CASES:                                                              │
│  • "Which Friends character are you?"                                           │
│  • "Which manifest girl matches your energy?"                                   │
│  • "Which historical figure are you?"                                           │
│  • "Which product from our brand suits you?"                                    │
│  • "Which team member are you most like?"                                       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CHARACTER TEST TYPE DEFINITION
// ══════════════════════════════════════════════════════════════════════════════

interface CharacterTest extends BaseTest {
  type: "CHARACTER"
  characters: CharacterDefinition[]
  scoringConfig: CharacterScoringConfig
}

interface CharacterDefinition {
  id: string
  testId: string
  position: number

  name: string
  slug: string
  tagline: string
  description: string
  detailedDescription: string

  imageUrl: string
  thumbnailUrl: string
  backgroundColor: string
  accentColor: string

  traits: string[]
  strengths: string[]
  weaknesses: string[]

  compatibleWith: string[]
  famousQuote: string | null

  metadata: Record<string, unknown>
}

interface CharacterScoringConfig {
  scoringMethod: "POINTS_SUM" | "WEIGHTED_AVERAGE" | "TRAIT_MATCHING"
  showAllMatches: boolean
  showMatchPercentages: boolean
  minimumMatchThreshold: number
  tieBreaker: "FIRST_DEFINED" | "RANDOM" | "SHOW_ALL"
}

// ══════════════════════════════════════════════════════════════════════════════
// CHARACTER TEST QUESTION STRUCTURE
// ══════════════════════════════════════════════════════════════════════════════

interface CharacterTestQuestion {
  id: string
  testId: string
  position: number

  text: string
  imageUrl: string | null

  questionType: "SINGLE_CHOICE" | "IMAGE_CHOICE" | "RANKING" | "THIS_OR_THAT"
  config: CharacterSingleChoiceConfig | CharacterImageChoiceConfig |
          CharacterRankingConfig | CharacterThisOrThatConfig
}

interface CharacterSingleChoiceConfig {
  type: "SINGLE_CHOICE"
  options: {
    id: string
    text: string
    imageUrl: string | null
    characterScores: { characterId: string, points: number }[]
  }[]
  randomizeOptions: boolean
}

interface CharacterImageChoiceConfig {
  type: "IMAGE_CHOICE"
  options: {
    id: string
    imageUrl: string
    caption: string | null
    characterScores: { characterId: string, points: number }[]
  }[]
  columns: 2 | 3 | 4
}

interface CharacterRankingConfig {
  type: "RANKING"
  items: {
    id: string
    text: string
    imageUrl: string | null
    characterScores: { characterId: string, basePoints: number }[]
  }[]
  maxRankedItems: number
  pointsDistribution: number[]
}

interface CharacterThisOrThatConfig {
  type: "THIS_OR_THAT"
  optionA: {
    text: string
    imageUrl: string | null
    characterScores: { characterId: string, points: number }[]
  }
  optionB: {
    text: string
    imageUrl: string | null
    characterScores: { characterId: string, points: number }[]
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CHARACTER TEST RESULT CALCULATION
// ══════════════════════════════════════════════════════════════════════════════

interface CharacterTestResult {
  testId: string
  userId: string | null

  matchedCharacter: CharacterDefinition
  matchPercentage: number

  allMatches: {
    character: CharacterDefinition
    points: number
    percentage: number
    rank: number
  }[]

  sharedTraits: string[]

  completedAt: Date
  shareableCardUrl: string | null
}

function calculateCharacterResult(
  test: CharacterTest,
  responses: Map<string, unknown>
): CharacterTestResult {
  const characterScores = new Map<string, number>()

  test.characters.forEach(char => {
    characterScores.set(char.id, 0)
  })

  test.questions.forEach(question => {
    const response = responses.get(question.id)
    if (response === undefined) return

    if (question.config.type === "SINGLE_CHOICE" ||
        question.config.type === "IMAGE_CHOICE") {
      const config = question.config as CharacterSingleChoiceConfig
      const selectedOptionId = response as string
      const option = config.options.find(o => o.id === selectedOptionId)

      if (option) {
        option.characterScores.forEach(cs => {
          const current = characterScores.get(cs.characterId) || 0
          characterScores.set(cs.characterId, current + cs.points)
        })
      }
    }

    if (question.config.type === "RANKING") {
      const config = question.config as CharacterRankingConfig
      const rankedIds = response as string[]

      rankedIds.forEach((itemId, index) => {
        const item = config.items.find(i => i.id === itemId)
        if (!item) return

        const multiplier = config.pointsDistribution[index] || 1
        item.characterScores.forEach(cs => {
          const current = characterScores.get(cs.characterId) || 0
          characterScores.set(cs.characterId, current + cs.basePoints * multiplier)
        })
      })
    }

    if (question.config.type === "THIS_OR_THAT") {
      const config = question.config as CharacterThisOrThatConfig
      const selected = response === "A" ? config.optionA : config.optionB

      selected.characterScores.forEach(cs => {
        const current = characterScores.get(cs.characterId) || 0
        characterScores.set(cs.characterId, current + cs.points)
      })
    }
  })

  const totalPoints = Array.from(characterScores.values()).reduce((a, b) => a + b, 0)

  const allMatches = test.characters.map(char => ({
    character: char,
    points: characterScores.get(char.id) || 0,
    percentage: totalPoints > 0
      ? Math.round(((characterScores.get(char.id) || 0) / totalPoints) * 100)
      : 0,
    rank: 0
  }))
  .sort((a, b) => b.points - a.points)
  .map((match, index) => ({ ...match, rank: index + 1 }))

  const topMatch = allMatches[0]

  return {
    testId: test.id,
    userId: null,
    matchedCharacter: topMatch.character,
    matchPercentage: topMatch.percentage,
    allMatches,
    sharedTraits: topMatch.character.traits.slice(0, 4),
    completedAt: new Date(),
    shareableCardUrl: null
  }
}

export type { CharacterTest, CharacterDefinition, CharacterTestResult }
export type { CharacterTestQuestion, CharacterSingleChoiceConfig, CharacterImageChoiceConfig }
export { calculateCharacterResult }
```

**Character Test Result Visualization:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      WHICH FRIENDS CHARACTER ARE YOU?                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                            You are...                                            │
│                                                                                  │
│              ┌─────────────────────────────────────┐                            │
│              │                                     │                            │
│              │         [Rachel Image]              │                            │
│              │                                     │                            │
│              │           RACHEL GREEN              │                            │
│              │                                     │                            │
│              │    "It's like all my life everyone │                            │
│              │     told me, 'You're a shoe!'"     │                            │
│              │                                     │                            │
│              │          87% MATCH                  │                            │
│              │                                     │                            │
│              └─────────────────────────────────────┘                            │
│                                                                                  │
│  Your Shared Traits:                                                             │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌─────────────┐                     │
│  │ Stylish  │ │ Ambitious │ │ Optimistic │ │ Growth-minded│                    │
│  └──────────┘ └───────────┘ └────────────┘ └─────────────┘                     │
│                                                                                  │
│  Your Full Match Breakdown:                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐           │
│  │ Rachel     ████████████████████████████████████████░░░  87%    │           │
│  │ Monica     ████████████████████████░░░░░░░░░░░░░░░░░░  62%    │           │
│  │ Phoebe     ██████████████████░░░░░░░░░░░░░░░░░░░░░░░░  45%    │           │
│  │ Ross       ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  32%    │           │
│  │ Chandler   ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  28%    │           │
│  │ Joey       █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  18%    │           │
│  └─────────────────────────────────────────────────────────────────┘           │
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                          │
│  │ [Share]      │  │ [Challenge]  │  │ [More Tests] │                          │
│  │ Share Result │  │ vs Friends   │  │ Explore      │                          │
│  └──────────────┘  └──────────────┘  └──────────────┘                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 6.4.5 SPECTRUM TEST - Single-Dimension Percentage Scale

[REFERENCE] Simple yet effective for measuring single traits or preferences.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SPECTRUM TEST SYSTEM                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Spectrum tests measure where respondents fall on a single bipolar dimension.   │
│  Result is a percentage showing position between two extremes.                   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │                    SPECTRUM VISUALIZATION                               │    │
│  │                                                                         │    │
│  │     0%                       50%                       100%             │    │
│  │     │                         │                         │               │    │
│  │     ▼                         ▼                         ▼               │    │
│  │     ┌─────────────────────────┼───────────●─────────────┐               │    │
│  │     │░░░░░░░░░░░░░░░░░░░░░░░░░│███████████│             │               │    │
│  │     └─────────────────────────┴───────────┴─────────────┘               │    │
│  │                                                                         │    │
│  │     Introvert                                        Extrovert          │    │
│  │                                                                         │    │
│  │     Result: You are 68% Extrovert                                      │    │
│  │     "You're a social butterfly who also values alone time"             │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  POPULAR USE CASES:                                                              │
│  • "How introverted/extroverted are you?"                                       │
│  • "What's your risk tolerance level?"                                          │
│  • "How tech-savvy are you?"                                                    │
│  • "Cat person or dog person?"                                                  │
│  • "Morning person or night owl?"                                               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SPECTRUM TEST TYPE DEFINITION
// ══════════════════════════════════════════════════════════════════════════════

interface SpectrumTest extends BaseTest {
  type: "SPECTRUM"
  spectrum: SpectrumDefinition
  segments: SpectrumSegment[]
  scoringConfig: SpectrumScoringConfig
}

interface SpectrumDefinition {
  id: string
  testId: string

  name: string
  leftLabel: string
  rightLabel: string
  leftDescription: string
  rightDescription: string

  leftColor: string
  rightColor: string
  leftIcon: string | null
  rightIcon: string | null

  gradientColors: string[]
}

interface SpectrumSegment {
  id: string
  testId: string
  position: number

  name: string
  description: string
  minPercentage: number
  maxPercentage: number

  detailedDescription: string
  traits: string[]
  imageUrl: string | null
}

interface SpectrumScoringConfig {
  questionWeight: "EQUAL" | "CUSTOM"
  normalizationMethod: "LINEAR" | "CURVED"
  showExactPercentage: boolean
  showSegmentName: boolean
}

// ══════════════════════════════════════════════════════════════════════════════
// SPECTRUM TEST QUESTION STRUCTURE
// ══════════════════════════════════════════════════════════════════════════════

interface SpectrumTestQuestion {
  id: string
  testId: string
  position: number

  text: string
  imageUrl: string | null
  weight: number

  questionType: "SLIDER" | "AGREE_DISAGREE" | "BINARY_CHOICE"
  config: SpectrumSliderConfig | SpectrumAgreeDisagreeConfig | SpectrumBinaryConfig
}

interface SpectrumSliderConfig {
  type: "SLIDER"
  leftLabel: string
  rightLabel: string
  steps: number
  showLabels: boolean
}

interface SpectrumAgreeDisagreeConfig {
  type: "AGREE_DISAGREE"
  statement: string
  scale: 5 | 7
  labels: string[]
  direction: "LEFT_ON_AGREE" | "RIGHT_ON_AGREE"
}

interface SpectrumBinaryConfig {
  type: "BINARY_CHOICE"
  leftOption: { text: string, imageUrl: string | null }
  rightOption: { text: string, imageUrl: string | null }
}

// ══════════════════════════════════════════════════════════════════════════════
// SPECTRUM TEST RESULT CALCULATION
// ══════════════════════════════════════════════════════════════════════════════

interface SpectrumTestResult {
  testId: string
  userId: string | null

  percentage: number
  segment: SpectrumSegment

  leftLabel: string
  rightLabel: string
  leaning: "LEFT" | "CENTER" | "RIGHT"
  leaningStrength: number

  description: string

  completedAt: Date
  shareableCardUrl: string | null
}

function calculateSpectrumResult(
  test: SpectrumTest,
  responses: Map<string, unknown>
): SpectrumTestResult {
  let totalScore = 0
  let totalWeight = 0

  test.questions.forEach(question => {
    const response = responses.get(question.id)
    if (response === undefined) return

    let normalizedScore = 0

    if (question.config.type === "SLIDER") {
      const config = question.config as SpectrumSliderConfig
      const sliderValue = response as number
      normalizedScore = sliderValue / (config.steps - 1)
    }

    if (question.config.type === "AGREE_DISAGREE") {
      const config = question.config as SpectrumAgreeDisagreeConfig
      const responseValue = response as number
      normalizedScore = responseValue / (config.scale - 1)
      if (config.direction === "LEFT_ON_AGREE") {
        normalizedScore = 1 - normalizedScore
      }
    }

    if (question.config.type === "BINARY_CHOICE") {
      normalizedScore = response === "LEFT" ? 0 : 1
    }

    totalScore += normalizedScore * question.weight
    totalWeight += question.weight
  })

  const percentage = totalWeight > 0
    ? Math.round((totalScore / totalWeight) * 100)
    : 50

  const segment = test.segments.find(
    s => percentage >= s.minPercentage && percentage <= s.maxPercentage
  ) || test.segments[Math.floor(test.segments.length / 2)]

  const leaning: "LEFT" | "CENTER" | "RIGHT" =
    percentage < 40 ? "LEFT" :
    percentage > 60 ? "RIGHT" : "CENTER"

  return {
    testId: test.id,
    userId: null,
    percentage,
    segment,
    leftLabel: test.spectrum.leftLabel,
    rightLabel: test.spectrum.rightLabel,
    leaning,
    leaningStrength: Math.abs(percentage - 50) * 2,
    description: segment.detailedDescription,
    completedAt: new Date(),
    shareableCardUrl: null
  }
}

export type { SpectrumTest, SpectrumDefinition, SpectrumSegment, SpectrumTestResult }
export type { SpectrumTestQuestion, SpectrumSliderConfig, SpectrumAgreeDisagreeConfig }
export { calculateSpectrumResult }
```


## 6.4.6 Test Creation UX - No-Code Builder

[DECISION] Test creation must be accessible to non-technical users while maintaining scientific validity.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      TEST CREATION WIZARD                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  STEP 1: Choose Test Type                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │   │
│  │  │   [Compass]  │  │   [Users]    │  │   [Gauge]    │                   │   │
│  │  │              │  │              │  │              │                   │   │
│  │  │  AXIS TEST   │  │  CHARACTER   │  │  SPECTRUM    │                   │   │
│  │  │              │  │  MATCH       │  │  TEST        │                   │   │
│  │  │  "Where do   │  │  "Which X    │  │  "How X      │                   │   │
│  │  │  you stand?" │  │  are you?"   │  │  are you?"   │                   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                   │   │
│  │                                                                          │   │
│  │  Examples:          Examples:          Examples:                         │   │
│  │  • Political        • Friends          • Introvert/                      │   │
│  │    Compass            character          Extrovert                       │   │
│  │  • MBTI-style       • Harry Potter     • Risk                           │   │
│  │    4-axis             house              tolerance                       │   │
│  │  • Custom axes      • Which brand      • Tech savvy                     │   │
│  │                       product                                            │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Define Results (Varies by Test Type)                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  FOR AXIS TEST:                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  Define Your Axes (2-4):                                                │   │
│  │                                                                          │   │
│  │  Axis 1: ┌─────────────┐  ←────────────→  ┌─────────────┐               │   │
│  │          │ Traditional │                   │   Modern    │               │   │
│  │          └─────────────┘                   └─────────────┘               │   │
│  │          Description:                      Description:                  │   │
│  │          "Values established..."           "Embraces change..."          │   │
│  │                                                                          │   │
│  │  Axis 2: ┌─────────────┐  ←────────────→  ┌─────────────┐               │   │
│  │          │ Cat Person  │                   │ Dog Person  │               │   │
│  │          └─────────────┘                   └─────────────┘               │   │
│  │                                                                          │   │
│  │  [+ Add Another Axis]                                                   │   │
│  │                                                                          │   │
│  │  Optional: Define Quadrants                                             │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │  ☑ Auto-generate quadrant names based on axis labels           │    │   │
│  │  │  ☐ Custom quadrant definitions                                  │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  FOR CHARACTER TEST:                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  Define Your Characters (2-20):                                         │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │  [Upload]    Name: Luna Lovegood                                │    │   │
│  │  │  [Image]     Tagline: "The Dreamy Visionary"                   │    │   │
│  │  │              Description: You see the world differently...      │    │   │
│  │  │              Traits: [Creative] [Intuitive] [Unconventional]   │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │  [Upload]    Name: Hermione Granger                             │    │   │
│  │  │  [Image]     Tagline: "The Brilliant Achiever"                 │    │   │
│  │  │              Description: Knowledge is your superpower...       │    │   │
│  │  │              Traits: [Intelligent] [Driven] [Loyal]            │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  [+ Add Another Character]                                              │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  FOR SPECTRUM TEST:                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  Define Your Spectrum:                                                  │   │
│  │                                                                          │   │
│  │  Left End:              Right End:                                      │   │
│  │  ┌─────────────┐        ┌─────────────┐                                │   │
│  │  │  Introvert  │ ←───→  │  Extrovert  │                                │   │
│  │  └─────────────┘        └─────────────┘                                │   │
│  │                                                                          │   │
│  │  Define Segments (Optional - for detailed descriptions):                │   │
│  │                                                                          │   │
│  │  0-20%:   "Deep Introvert" - You recharge best in solitude            │   │
│  │  21-40%:  "Quiet Soul" - You prefer small gatherings                   │   │
│  │  41-60%:  "Ambivert" - You're balanced between both worlds            │   │
│  │  61-80%:  "Social Butterfly" - You thrive in company                   │   │
│  │  81-100%: "True Extrovert" - Energy comes from others                  │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Create Questions with Visual Scoring Interface                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  FOR AXIS TEST QUESTIONS:                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  Question: "I prefer planning everything in advance"                    │   │
│  │                                                                          │   │
│  │  Type: [Statement Agree/Disagree ▼]                                     │   │
│  │                                                                          │   │
│  │  This question affects:                                                 │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │  Traditional ←────────────────→ Modern                          │    │   │
│  │  │                                                                  │    │   │
│  │  │  When user AGREES:    [────────●] Push toward TRADITIONAL       │    │   │
│  │  │  Strength: [███░░] Medium                                       │    │   │
│  │  │                                                                  │    │   │
│  │  │  ☑ Invert when user disagrees                                  │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │  Cat Person ←────────────────→ Dog Person                       │    │   │
│  │  │                                                                  │    │   │
│  │  │  ☐ This question does NOT affect this axis                     │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  FOR CHARACTER TEST QUESTIONS:                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │  Question: "At a party, you would most likely..."                      │   │
│  │                                                                          │   │
│  │  Type: [Single Choice ▼]                                                │   │
│  │                                                                          │   │
│  │  Option A: "Be the center of attention"                                 │   │
│  │  Points to characters:                                                  │   │
│  │  [Luna: ░░░░░] [Hermione: ██░░░] [Harry: █████] [Ron: ███░░]          │   │
│  │     0 pts         2 pts           5 pts        3 pts                   │   │
│  │                                                                          │   │
│  │  Option B: "Find a quiet corner with one friend"                        │   │
│  │  Points to characters:                                                  │   │
│  │  [Luna: █████] [Hermione: ███░░] [Harry: ██░░░] [Ron: ░░░░░]          │   │
│  │     5 pts         3 pts           2 pts        0 pts                   │   │
│  │                                                                          │   │
│  │  Option C: "Help the host with preparations"                            │   │
│  │  Points to characters:                                                  │   │
│  │  [Luna: ██░░░] [Hermione: █████] [Harry: ███░░] [Ron: ██░░░]          │   │
│  │     2 pts         5 pts           3 pts        2 pts                   │   │
│  │                                                                          │   │
│  │  [+ Add Option]                                                         │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  LIVE PREVIEW:                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  If someone answers A, B, C, A, B...                                    │   │
│  │                                                                          │   │
│  │  Current projection:                                                    │   │
│  │  Harry: 45% | Hermione: 30% | Luna: 15% | Ron: 10%                     │   │
│  │                                                                          │   │
│  │  [Run Full Simulation] [Balance Check]                                 │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST CREATION VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const TEST_CONSTRAINTS = {
  TITLE: { minLength: 5, maxLength: 100 },
  DESCRIPTION: { minLength: 10, maxLength: 500 },
  QUESTIONS: { min: 5, max: 50 },
  QUESTION_TEXT: { minLength: 10, maxLength: 500 },

  AXIS: {
    min: 2,
    max: 4,
    labelMinLength: 2,
    labelMaxLength: 30,
    descriptionMaxLength: 200
  },

  CHARACTER: {
    min: 2,
    max: 20,
    nameMinLength: 2,
    nameMaxLength: 50,
    taglineMaxLength: 100,
    descriptionMaxLength: 500,
    traitsMax: 10
  },

  SPECTRUM: {
    segmentsMin: 2,
    segmentsMax: 10,
    labelMinLength: 2,
    labelMaxLength: 30
  }
} as const

const baseTestSchema = z.object({
  title: z.string()
    .min(TEST_CONSTRAINTS.TITLE.minLength)
    .max(TEST_CONSTRAINTS.TITLE.maxLength),
  description: z.string()
    .min(TEST_CONSTRAINTS.DESCRIPTION.minLength)
    .max(TEST_CONSTRAINTS.DESCRIPTION.maxLength),
  coverImageUrl: z.string().url().nullable(),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
  settings: z.object({
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
})

const axisDefinitionSchema = z.object({
  name: z.string().min(2).max(50),
  negativeLabel: z.string()
    .min(TEST_CONSTRAINTS.AXIS.labelMinLength)
    .max(TEST_CONSTRAINTS.AXIS.labelMaxLength),
  positiveLabel: z.string()
    .min(TEST_CONSTRAINTS.AXIS.labelMinLength)
    .max(TEST_CONSTRAINTS.AXIS.labelMaxLength),
  negativeDescription: z.string().max(TEST_CONSTRAINTS.AXIS.descriptionMaxLength),
  positiveDescription: z.string().max(TEST_CONSTRAINTS.AXIS.descriptionMaxLength),
  negativeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  positiveColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
})

const characterDefinitionSchema = z.object({
  name: z.string()
    .min(TEST_CONSTRAINTS.CHARACTER.nameMinLength)
    .max(TEST_CONSTRAINTS.CHARACTER.nameMaxLength),
  tagline: z.string().max(TEST_CONSTRAINTS.CHARACTER.taglineMaxLength),
  description: z.string().max(TEST_CONSTRAINTS.CHARACTER.descriptionMaxLength),
  detailedDescription: z.string().max(1000),
  imageUrl: z.string().url(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  traits: z.array(z.string().max(30)).max(TEST_CONSTRAINTS.CHARACTER.traitsMax)
})

const createAxisTestSchema = baseTestSchema.extend({
  type: z.literal("AXIS"),
  axes: z.array(axisDefinitionSchema)
    .min(TEST_CONSTRAINTS.AXIS.min)
    .max(TEST_CONSTRAINTS.AXIS.max),
  questions: z.array(z.any())
    .min(TEST_CONSTRAINTS.QUESTIONS.min)
    .max(TEST_CONSTRAINTS.QUESTIONS.max)
})

const createCharacterTestSchema = baseTestSchema.extend({
  type: z.literal("CHARACTER"),
  characters: z.array(characterDefinitionSchema)
    .min(TEST_CONSTRAINTS.CHARACTER.min)
    .max(TEST_CONSTRAINTS.CHARACTER.max),
  questions: z.array(z.any())
    .min(TEST_CONSTRAINTS.QUESTIONS.min)
    .max(TEST_CONSTRAINTS.QUESTIONS.max)
})

const createSpectrumTestSchema = baseTestSchema.extend({
  type: z.literal("SPECTRUM"),
  spectrum: z.object({
    leftLabel: z.string().min(2).max(30),
    rightLabel: z.string().min(2).max(30),
    leftDescription: z.string().max(200),
    rightDescription: z.string().max(200),
    leftColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    rightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
  }),
  segments: z.array(z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(200),
    minPercentage: z.number().int().min(0).max(100),
    maxPercentage: z.number().int().min(0).max(100)
  })).min(TEST_CONSTRAINTS.SPECTRUM.segmentsMin).max(TEST_CONSTRAINTS.SPECTRUM.segmentsMax),
  questions: z.array(z.any())
    .min(TEST_CONSTRAINTS.QUESTIONS.min)
    .max(TEST_CONSTRAINTS.QUESTIONS.max)
})

export { TEST_CONSTRAINTS }
export { baseTestSchema, createAxisTestSchema, createCharacterTestSchema, createSpectrumTestSchema }
```


## 6.4.7 Test Balance Validation

[MUST] System must validate that tests are balanced and all results are achievable.

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST BALANCE VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

interface BalanceValidationResult {
  isValid: boolean
  warnings: BalanceWarning[]
  errors: BalanceError[]
  statistics: BalanceStatistics
}

interface BalanceWarning {
  code: string
  message: string
  affectedItems: string[]
  suggestion: string
}

interface BalanceError {
  code: string
  message: string
  affectedItems: string[]
}

interface BalanceStatistics {
  totalPossibleScenarios: number
  reachableResults: number
  unreachableResults: string[]
  mostLikelyResult: string
  leastLikelyResult: string
  distributionSkew: number
}

function validateCharacterTestBalance(test: CharacterTest): BalanceValidationResult {
  const characterMaxScores = new Map<string, number>()
  const characterMinScores = new Map<string, number>()

  test.characters.forEach(char => {
    characterMaxScores.set(char.id, 0)
    characterMinScores.set(char.id, 0)
  })

  test.questions.forEach(question => {
    if (question.config.type === "SINGLE_CHOICE") {
      const config = question.config as CharacterSingleChoiceConfig

      test.characters.forEach(char => {
        const scoresForChar = config.options.map(opt => {
          const cs = opt.characterScores.find(s => s.characterId === char.id)
          return cs?.points || 0
        })

        const maxForQuestion = Math.max(...scoresForChar)
        const minForQuestion = Math.min(...scoresForChar)

        characterMaxScores.set(
          char.id,
          (characterMaxScores.get(char.id) || 0) + maxForQuestion
        )
        characterMinScores.set(
          char.id,
          (characterMinScores.get(char.id) || 0) + minForQuestion
        )
      })
    }
  })

  const warnings: BalanceWarning[] = []
  const errors: BalanceError[] = []

  const unreachableCharacters: string[] = []
  test.characters.forEach(char => {
    const maxScore = characterMaxScores.get(char.id) || 0
    const otherCharsMinMax = test.characters
      .filter(c => c.id !== char.id)
      .map(c => characterMinScores.get(c.id) || 0)

    const canWin = otherCharsMinMax.every(otherMin => maxScore > otherMin)

    if (!canWin) {
      unreachableCharacters.push(char.name)
      errors.push({
        code: "UNREACHABLE_CHARACTER",
        message: `"${char.name}" can never be the top result`,
        affectedItems: [char.id]
      })
    }
  })

  const maxPossible = Math.max(...Array.from(characterMaxScores.values()))
  const minPossible = Math.min(...Array.from(characterMaxScores.values()))
  const range = maxPossible - minPossible
  const avgMax = Array.from(characterMaxScores.values()).reduce((a, b) => a + b, 0) /
                 characterMaxScores.size

  test.characters.forEach(char => {
    const charMax = characterMaxScores.get(char.id) || 0
    if (charMax < avgMax * 0.5) {
      warnings.push({
        code: "LOW_SCORE_POTENTIAL",
        message: `"${char.name}" has significantly lower maximum score potential`,
        affectedItems: [char.id],
        suggestion: "Add more questions that favor this character or increase point values"
      })
    }
  })

  const skew = range > 0 ? (maxPossible - avgMax) / range : 0

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    statistics: {
      totalPossibleScenarios: Math.pow(4, test.questions.length),
      reachableResults: test.characters.length - unreachableCharacters.length,
      unreachableResults: unreachableCharacters,
      mostLikelyResult: test.characters.reduce((max, char) =>
        (characterMaxScores.get(char.id) || 0) > (characterMaxScores.get(max.id) || 0)
          ? char : max
      ).name,
      leastLikelyResult: test.characters.reduce((min, char) =>
        (characterMaxScores.get(char.id) || 0) < (characterMaxScores.get(min.id) || 0)
          ? char : min
      ).name,
      distributionSkew: Math.round(skew * 100) / 100
    }
  }
}

function validateAxisTestBalance(test: AxisTest): BalanceValidationResult {
  const axisQuestionCounts = new Map<string, number>()

  test.axes.forEach(axis => {
    axisQuestionCounts.set(axis.id, 0)
  })

  test.questions.forEach(question => {
    if (question.config.type === "STATEMENT_AGREE") {
      const config = question.config as AxisStatementConfig
      config.axisImpact.forEach(impact => {
        const current = axisQuestionCounts.get(impact.axisId) || 0
        axisQuestionCounts.set(impact.axisId, current + 1)
      })
    }
  })

  const warnings: BalanceWarning[] = []
  const errors: BalanceError[] = []

  const avgQuestions = test.questions.length / test.axes.length

  test.axes.forEach(axis => {
    const count = axisQuestionCounts.get(axis.id) || 0

    if (count === 0) {
      errors.push({
        code: "NO_QUESTIONS_FOR_AXIS",
        message: `No questions affect the "${axis.name}" axis`,
        affectedItems: [axis.id]
      })
    } else if (count < avgQuestions * 0.5) {
      warnings.push({
        code: "FEW_QUESTIONS_FOR_AXIS",
        message: `"${axis.name}" axis has fewer questions than average`,
        affectedItems: [axis.id],
        suggestion: `Add ${Math.ceil(avgQuestions - count)} more questions for this axis`
      })
    }
  })

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    statistics: {
      totalPossibleScenarios: Math.pow(5, test.questions.length),
      reachableResults: test.quadrants?.length || Math.pow(2, test.axes.length),
      unreachableResults: [],
      mostLikelyResult: "Center",
      leastLikelyResult: "Extreme corners",
      distributionSkew: 0
    }
  }
}

export type { BalanceValidationResult, BalanceWarning, BalanceError, BalanceStatistics }
export { validateCharacterTestBalance, validateAxisTestBalance }
```


## 6.4.8 Shareable Result Cards

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SHAREABLE RESULT CARD GENERATION
// ══════════════════════════════════════════════════════════════════════════════

interface ShareableCard {
  id: string
  testResultId: string
  imageUrl: string
  shareUrl: string
  expiresAt: Date | null
  viewCount: number
  shareCount: number
}

interface CardGenerationConfig {
  width: number
  height: number
  backgroundColor: string
  includeTestTitle: boolean
  includePercentages: boolean
  includeTraits: boolean
  includeWatermark: boolean
  format: "PNG" | "JPEG" | "WEBP"
}

const DEFAULT_CARD_CONFIG: CardGenerationConfig = {
  width: 1200,
  height: 630,
  backgroundColor: "#FFFFFF",
  includeTestTitle: true,
  includePercentages: true,
  includeTraits: true,
  includeWatermark: true,
  format: "PNG"
}

const SHARE_PLATFORMS = [
  {
    name: "Twitter/X",
    icon: "Twitter",
    urlTemplate: "https://twitter.com/intent/tweet?text={text}&url={url}"
  },
  {
    name: "Facebook",
    icon: "Facebook",
    urlTemplate: "https://www.facebook.com/sharer/sharer.php?u={url}"
  },
  {
    name: "LinkedIn",
    icon: "Linkedin",
    urlTemplate: "https://www.linkedin.com/sharing/share-offsite/?url={url}"
  },
  {
    name: "WhatsApp",
    icon: "MessageCircle",
    urlTemplate: "https://wa.me/?text={text}%20{url}"
  },
  {
    name: "Copy Link",
    icon: "Link",
    urlTemplate: null
  }
] as const

function generateShareText(
  testTitle: string,
  resultName: string,
  shareUrl: string
): string {
  return `I just took "${testTitle}" and got ${resultName}! Take the test and find out your result: ${shareUrl}`
}

export type { ShareableCard, CardGenerationConfig }
export { DEFAULT_CARD_CONFIG, SHARE_PLATFORMS, generateShareText }
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PERSONALITY TEST TYPE DEFINITION
// ══════════════════════════════════════════════════════════════════════════════

interface PersonalityTest {
  id: string
  creatorId: string
  organizationId: string | null
  
  title: string
  description: string
  coverImageUrl: string | null
  
  questions: TestQuestion[]
  resultCategories: ResultCategory[]
  scoringMethod: ScoringMethod
  settings: TestSettings
  
  status: ContentStatus
  visibility: VisibilityLevel
  
  completionCount: number
  shareCount: number
  averageCompletionTime: number
  
  createdAt: Date
  publishedAt: Date | null
}

type ScoringMethod = 
  | "CATEGORY_POINTS"
  | "WEIGHTED_AVERAGE"
  | "HIGHEST_CATEGORY"
  | "PERCENTAGE_MATCH"

interface TestSettings {
  showProgressBar: boolean
  showQuestionCount: boolean
  randomizeQuestions: boolean
  timeLimitMinutes: number | null
  allowRetake: boolean
  retakeCooldownHours: number
  showCorrectAnswers: boolean
  shareResultsEnabled: boolean
  collectEmail: boolean
  resultExpiryDays: number | null
}
```


## 6.4.2 Result Category System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESULT CATEGORY SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

interface ResultCategory {
  id: string
  testId: string
  name: string
  slug: string
  description: string
  detailedDescription: string
  imageUrl: string | null
  color: string
  iconName: string | null
  traits: string[]
  minScore: number | null
  maxScore: number | null
  percentageRange: { min: number, max: number } | null
  position: number
}

interface TestQuestion {
  id: string
  testId: string
  question: string
  imageUrl: string | null
  options: TestOption[]
  position: number
  weight: number
}

interface TestOption {
  id: string
  questionId: string
  text: string
  imageUrl: string | null
  categoryScores: CategoryScore[]
  position: number
}

interface CategoryScore {
  categoryId: string
  points: number
}

// ══════════════════════════════════════════════════════════════════════════════
// EXAMPLE: "What Type of Developer Are You?"
// ══════════════════════════════════════════════════════════════════════════════

const EXAMPLE_RESULT_CATEGORIES: ResultCategory[] = [
  {
    id: "cat_frontend",
    testId: "test_dev_type",
    name: "Frontend Enthusiast",
    slug: "frontend-enthusiast",
    description: "You love crafting beautiful user experiences",
    detailedDescription: "You're passionate about user interfaces, animations, and creating delightful experiences. You care deeply about accessibility and design systems.",
    imageUrl: "/results/frontend.png",
    color: "#3B82F6",
    iconName: "Palette",
    traits: ["Creative", "Detail-oriented", "User-focused", "Visual thinker"],
    minScore: null,
    maxScore: null,
    percentageRange: null,
    position: 0
  },
  {
    id: "cat_backend",
    testId: "test_dev_type",
    name: "Backend Architect",
    slug: "backend-architect",
    description: "You build robust systems that power applications",
    detailedDescription: "You thrive on designing scalable architectures, optimizing databases, and building APIs. Performance and reliability are your top priorities.",
    imageUrl: "/results/backend.png",
    color: "#10B981",
    iconName: "Server",
    traits: ["Logical", "Systematic", "Performance-driven", "Problem solver"],
    minScore: null,
    maxScore: null,
    percentageRange: null,
    position: 1
  },
  {
    id: "cat_fullstack",
    testId: "test_dev_type",
    name: "Fullstack Unicorn",
    slug: "fullstack-unicorn",
    description: "You seamlessly bridge frontend and backend worlds",
    detailedDescription: "You're comfortable across the entire stack and love seeing projects through from database design to pixel-perfect UIs. Versatility is your superpower.",
    imageUrl: "/results/fullstack.png",
    color: "#8B5CF6",
    iconName: "Layers",
    traits: ["Versatile", "Adaptable", "Big-picture thinker", "Jack of all trades"],
    minScore: null,
    maxScore: null,
    percentageRange: null,
    position: 2
  },
  {
    id: "cat_devops",
    testId: "test_dev_type",
    name: "DevOps Guardian",
    slug: "devops-guardian",
    description: "You keep systems running smoothly at scale",
    detailedDescription: "You're passionate about automation, CI/CD pipelines, and infrastructure as code. Uptime and deployment efficiency are your obsessions.",
    imageUrl: "/results/devops.png",
    color: "#F59E0B",
    iconName: "Cloud",
    traits: ["Automation-focused", "Reliability-driven", "Process-oriented", "Firefighter"],
    minScore: null,
    maxScore: null,
    percentageRange: null,
    position: 3
  }
]

export type { ResultCategory, TestQuestion, TestOption, CategoryScore }
export { EXAMPLE_RESULT_CATEGORIES }
```


## 6.4.3 Scoring Algorithms

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST SCORING ALGORITHMS
// ══════════════════════════════════════════════════════════════════════════════

interface TestResponse {
  testId: string
  answers: Map<string, string>
}

interface ScoringResult {
  categoryScores: Map<string, number>
  percentages: Map<string, number>
  winningCategory: ResultCategory
  allCategories: ResultCategory[]
  totalPoints: number
}

function scoreByCategoryPoints(
  test: PersonalityTest,
  response: TestResponse
): ScoringResult {
  const categoryScores = new Map<string, number>()
  
  test.resultCategories.forEach(cat => {
    categoryScores.set(cat.id, 0)
  })
  
  test.questions.forEach(question => {
    const selectedOptionId = response.answers.get(question.id)
    if (!selectedOptionId) return
    
    const option = question.options.find(o => o.id === selectedOptionId)
    if (!option) return
    
    option.categoryScores.forEach(cs => {
      const current = categoryScores.get(cs.categoryId) || 0
      categoryScores.set(cs.categoryId, current + (cs.points * question.weight))
    })
  })
  
  const totalPoints = Array.from(categoryScores.values()).reduce((a, b) => a + b, 0)
  
  const percentages = new Map<string, number>()
  categoryScores.forEach((score, catId) => {
    percentages.set(catId, totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0)
  })
  
  let maxScore = -Infinity
  let winningCategoryId = ""
  categoryScores.forEach((score, catId) => {
    if (score > maxScore) {
      maxScore = score
      winningCategoryId = catId
    }
  })
  
  const winningCategory = test.resultCategories.find(c => c.id === winningCategoryId)!
  
  return {
    categoryScores,
    percentages,
    winningCategory,
    allCategories: test.resultCategories.sort((a, b) => {
      const scoreA = categoryScores.get(a.id) || 0
      const scoreB = categoryScores.get(b.id) || 0
      return scoreB - scoreA
    }),
    totalPoints
  }
}

function scoreByPercentageMatch(
  test: PersonalityTest,
  response: TestResponse
): ScoringResult {
  const baseResult = scoreByCategoryPoints(test, response)
  
  const percentages = baseResult.percentages
  let matchedCategory: ResultCategory | null = null
  
  for (const category of test.resultCategories) {
    if (!category.percentageRange) continue
    
    const percentage = percentages.get(category.id) || 0
    if (percentage >= category.percentageRange.min && percentage <= category.percentageRange.max) {
      matchedCategory = category
      break
    }
  }
  
  return {
    ...baseResult,
    winningCategory: matchedCategory || baseResult.winningCategory
  }
}

function calculateTestResult(
  test: PersonalityTest,
  response: TestResponse
): ScoringResult {
  switch (test.scoringMethod) {
    case "CATEGORY_POINTS":
    case "HIGHEST_CATEGORY":
    case "WEIGHTED_AVERAGE":
      return scoreByCategoryPoints(test, response)
    case "PERCENTAGE_MATCH":
      return scoreByPercentageMatch(test, response)
    default:
      return scoreByCategoryPoints(test, response)
  }
}

export type { TestResponse, ScoringResult }
export { scoreByCategoryPoints, scoreByPercentageMatch, calculateTestResult }
```


## 6.4.4 Result Presentation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         TEST RESULT SCREEN                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                        You are a...                                             │
│                                                                                 │
│              ┌─────────────────────────────────┐                               │
│              │                                 │                               │
│              │      [Palette Icon]             │                               │
│              │                                 │                               │
│              │   FRONTEND ENTHUSIAST           │                               │
│              │                                 │                               │
│              │   "You love crafting beautiful  │                               │
│              │    user experiences"            │                               │
│              │                                 │                               │
│              └─────────────────────────────────┘                               │
│                                                                                 │
│  Your Traits:                                                                   │
│  ┌──────────┐ ┌────────────────┐ ┌─────────────┐ ┌───────────────┐            │
│  │ Creative │ │ Detail-oriented│ │ User-focused│ │ Visual thinker│            │
│  └──────────┘ └────────────────┘ └─────────────┘ └───────────────┘            │
│                                                                                 │
│  Category Breakdown:                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐           │
│  │ Frontend     ████████████████████████████████████░░░░  72%     │           │
│  │ Fullstack    ███████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  18%     │           │
│  │ Backend      ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   7%     │           │
│  │ DevOps       █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   3%     │           │
│  └─────────────────────────────────────────────────────────────────┘           │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                          │
│  │ [Share]      │  │ [Retake]     │  │ [Explore]    │                          │
│  │ Share Result │  │ Take Again   │  │ More Tests   │                          │
│  └──────────────┘  └──────────────┘  └──────────────┘                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 6.4.5 Shareable Result Cards

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SHAREABLE RESULT CARD GENERATION
// ══════════════════════════════════════════════════════════════════════════════

interface ShareableCard {
  id: string
  testResultId: string
  imageUrl: string
  shareUrl: string
  expiresAt: Date | null
  viewCount: number
  shareCount: number
}

interface CardGenerationConfig {
  width: number
  height: number
  backgroundColor: string
  includeTestTitle: boolean
  includePercentages: boolean
  includeTraits: boolean
  includeWatermark: boolean
  format: "PNG" | "JPEG" | "WEBP"
}

const DEFAULT_CARD_CONFIG: CardGenerationConfig = {
  width: 1200,
  height: 630,
  backgroundColor: "#FFFFFF",
  includeTestTitle: true,
  includePercentages: true,
  includeTraits: true,
  includeWatermark: true,
  format: "PNG"
}

const SHARE_PLATFORMS = [
  {
    name: "Twitter/X",
    icon: "Twitter",
    urlTemplate: "https://twitter.com/intent/tweet?text={text}&url={url}"
  },
  {
    name: "Facebook",
    icon: "Facebook",
    urlTemplate: "https://www.facebook.com/sharer/sharer.php?u={url}"
  },
  {
    name: "LinkedIn",
    icon: "Linkedin",
    urlTemplate: "https://www.linkedin.com/sharing/share-offsite/?url={url}"
  },
  {
    name: "WhatsApp",
    icon: "MessageCircle",
    urlTemplate: "https://wa.me/?text={text}%20{url}"
  },
  {
    name: "Copy Link",
    icon: "Link",
    urlTemplate: null
  }
] as const

function generateShareText(
  testTitle: string,
  resultName: string,
  shareUrl: string
): string {
  return `I just took "${testTitle}" and got ${resultName}! Take the test and find out your result: ${shareUrl}`
}

export type { ShareableCard, CardGenerationConfig }
export { DEFAULT_CARD_CONFIG, SHARE_PLATFORMS, generateShareText }
```


## 6.4.9 TEST METHODOLOGY - Scientific & UX Foundations

[REFERENCE] Based on psychometric research, CAT (Computerized Adaptive Testing), and 2025-2026 engagement trends.

### 6.4.9.1 Psychometric Principles

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PSYCHOMETRIC FOUNDATION FOR VOXPOLL TESTS                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  [REFERENCE] Based on: PMC4205511, PMC2927808, Nunnally 1978                    │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                      VALIDITY & RELIABILITY                               │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  VALIDITY: Does the test measure what it claims to measure?             │   │
│  │  ─────────────────────────────────────────────────────────              │   │
│  │  • Content Validity: Questions cover the intended domain                │   │
│  │  • Construct Validity: Measures the theoretical construct               │   │
│  │  • Face Validity: Appears relevant to test-takers (UX critical!)        │   │
│  │                                                                          │   │
│  │  RELIABILITY: Does the test produce consistent results?                 │   │
│  │  ─────────────────────────────────────────────────────────              │   │
│  │  • Internal Consistency: Cronbach's α ≥ 0.70 (acceptable)               │   │
│  │  • Test-Retest: Same person, similar results over time                  │   │
│  │                                                                          │   │
│  │  [DECISION] VoxPoll targets α ≥ 0.70 for serious tests,                │   │
│  │             entertainment tests may prioritize engagement over alpha    │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                      SCALE DESIGN PRINCIPLES                             │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  LIKERT SCALE RECOMMENDATIONS (Research-backed):                        │   │
│  │  ───────────────────────────────────────────────                        │   │
│  │  • 5-point: Simpler, faster, good for large samples (N>100)            │   │
│  │  • 7-point: More discriminative power, better distribution             │   │
│  │  • Beyond 11 points: Diminishing returns                                │   │
│  │                                                                          │   │
│  │  [DECISION] VoxPoll default: 5-point for quick tests, 7-point option   │   │
│  │                                                                          │   │
│  │  SCALE LABELS (Balanced):                                               │   │
│  │  ───────────────────────                                                │   │
│  │  5-point: Strongly Disagree | Disagree | Neutral | Agree | Strongly    │   │
│  │  7-point: + "Somewhat Disagree" and "Somewhat Agree"                    │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PSYCHOMETRIC CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const PSYCHOMETRIC_CONFIG = {
  RELIABILITY: {
    targetCronbachAlpha: 0.70,
    minimumAcceptable: 0.60,
    excellentThreshold: 0.85,
    warningIfAbove: 0.95
  },

  SCALE: {
    defaultPoints: 5,
    recommendedRange: { min: 5, max: 7 },
    labels: {
      5: ["Kesinlikle Katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle Katılıyorum"],
      7: ["Kesinlikle Katılmıyorum", "Katılmıyorum", "Biraz Katılmıyorum", "Kararsızım", "Biraz Katılıyorum", "Katılıyorum", "Kesinlikle Katılıyorum"]
    }
  },

  QUESTION_COUNT: {
    minimum: 5,
    optimalRange: { min: 10, max: 25 },
    maximum: 50,
    perDimensionMinimum: 3
  },

  BALANCE: {
    reverseCodedRatio: 0.25,
    maxConsecutiveSameDirection: 3
  }
} as const

export { PSYCHOMETRIC_CONFIG }
```

### 6.4.9.2 Adaptive Test Engine (CAT-Inspired)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     ADAPTIVE TESTING ENGINE                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  [REFERENCE] Computerized Adaptive Testing reduces test length by 50%+          │
│              while maintaining equivalent measurement precision                  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │                    ADAPTIVE QUESTION SELECTION                           │   │
│  │                                                                          │   │
│  │    Start with                                                            │   │
│  │    medium-difficulty ──→ Answer ──→ Update estimate ──→ Select next     │   │
│  │    question                              │                question       │   │
│  │                                          │                    │          │   │
│  │                                          ▼                    │          │   │
│  │                              ┌──────────────────┐             │          │   │
│  │                              │   θ estimate     │◄────────────┘          │   │
│  │                              │   (trait level)  │                        │   │
│  │                              └──────────────────┘                        │   │
│  │                                          │                               │   │
│  │                                          ▼                               │   │
│  │                              Stopping rule met?                          │   │
│  │                              (precision or count)                        │   │
│  │                                    │    │                                │   │
│  │                                Yes │    │ No                             │   │
│  │                                    ▼    ▼                                │   │
│  │                               Finalize  Continue                         │   │
│  │                               Result                                     │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  [DECISION] VoxPoll implements "lite CAT" - optional adaptive mode for          │
│             creator-defined question pools with difficulty ratings              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ADAPTIVE ENGINE (OPTIONAL)
// ══════════════════════════════════════════════════════════════════════════════

interface AdaptiveConfig {
  enabled: boolean
  questionPool: AdaptiveQuestion[]
  stoppingCriteria: StoppingCriteria
  estimationMethod: "MLE" | "EAP" | "MAP"
}

interface AdaptiveQuestion {
  id: string
  difficulty: number
  discrimination: number
  dimensionId: string
  content: TestQuestionContent
}

interface StoppingCriteria {
  maxQuestions: number
  minQuestions: number
  precisionThreshold: number
  maxTimeMinutes: number | null
}

interface TraitEstimate {
  value: number
  standardError: number
  confidence95: { lower: number, upper: number }
}

function selectNextQuestion(
  pool: AdaptiveQuestion[],
  currentEstimate: TraitEstimate,
  answeredIds: Set<string>
): AdaptiveQuestion | null {
  const available = pool.filter(q => !answeredIds.has(q.id))
  if (available.length === 0) return null

  return available.reduce((best, q) => {
    const information = calculateFisherInformation(q, currentEstimate.value)
    const bestInfo = calculateFisherInformation(best, currentEstimate.value)
    return information > bestInfo ? q : best
  })
}

function calculateFisherInformation(
  question: AdaptiveQuestion,
  theta: number
): number {
  const p = probability(question, theta)
  const q = 1 - p
  return Math.pow(question.discrimination, 2) * p * q
}

function probability(question: AdaptiveQuestion, theta: number): number {
  const exponent = question.discrimination * (theta - question.difficulty)
  return 1 / (1 + Math.exp(-exponent))
}

function shouldStop(
  estimate: TraitEstimate,
  questionsAnswered: number,
  criteria: StoppingCriteria
): boolean {
  if (questionsAnswered >= criteria.maxQuestions) return true
  if (questionsAnswered < criteria.minQuestions) return false
  return estimate.standardError <= criteria.precisionThreshold
}

export type { AdaptiveConfig, AdaptiveQuestion, TraitEstimate, StoppingCriteria }
export { selectNextQuestion, shouldStop, calculateFisherInformation }
```

### 6.4.9.3 Test Creation Workflow (Scientific + UX)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    TEST CREATION PIPELINE                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PHASE 1: DESIGN                                                                │
│  ════════════════                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  1. Choose Test Type                                                    │   │
│  │     ├── AXIS (coordinates): "Where do you stand?"                      │   │
│  │     ├── CHARACTER (match): "Which X are you?"                          │   │
│  │     └── SPECTRUM (scale): "How X are you?"                             │   │
│  │                                                                         │   │
│  │  2. Define Outcome Structure                                            │   │
│  │     • AXIS: Define 2-4 bipolar dimensions                              │   │
│  │     • CHARACTER: Define 2-20 characters with traits                    │   │
│  │     • SPECTRUM: Define single dimension with segments                   │   │
│  │                                                                         │   │
│  │  3. Draft Questions (min 5, recommended 10-25)                         │   │
│  │     • Each question maps to outcomes via scoring config                │   │
│  │     • Include ~25% reverse-coded items for balance                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  PHASE 2: CONFIGURE SCORING                                                     │
│  ══════════════════════════                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Visual Scoring Interface:                                              │   │
│  │                                                                         │   │
│  │  "Soru: Sosyal ortamlarda enerjik hissederim"                          │   │
│  │                                                                         │   │
│  │  Bu cevap şunları etkiler:                                             │   │
│  │                                                                         │   │
│  │  [Character: Monica]  ████████░░  8 puan                               │   │
│  │  [Character: Phoebe]  ██████░░░░  6 puan                               │   │
│  │  [Character: Rachel]  ████░░░░░░  4 puan                               │   │
│  │  [Character: Ross]    ░░░░░░░░░░  0 puan                               │   │
│  │                                                                         │   │
│  │  Slider/stepper ile görsel puan ayarlama                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  PHASE 3: VALIDATE                                                              │
│  ════════════════                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Automatic Checks:                                                      │   │
│  │  ✓ All outcomes reachable (no impossible results)                      │   │
│  │  ✓ Score distribution balanced (no >70% skew)                          │   │
│  │  ✓ Minimum questions per dimension (≥3)                                │   │
│  │  ✓ Question coverage adequate                                          │   │
│  │                                                                         │   │
│  │  Simulation Report:                                                     │   │
│  │  • Run 1000 random answer combinations                                 │   │
│  │  • Show result distribution histogram                                  │   │
│  │  • Flag under-represented outcomes                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  PHASE 4: PREVIEW & PUBLISH                                                     │
│  ══════════════════════════                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  • Full test preview as user would see it                              │   │
│  │  • Generate sample result cards for each outcome                       │   │
│  │  • Set visibility (Public / Unlisted / Private)                        │   │
│  │  • Enable/disable retakes, time limits                                 │   │
│  │  • Publish → Generate shareable link                                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST VALIDATION ENGINE
// ══════════════════════════════════════════════════════════════════════════════

interface ValidationReport {
  isValid: boolean
  score: number
  checks: ValidationCheck[]
  simulation: SimulationReport | null
  recommendations: string[]
}

interface ValidationCheck {
  id: string
  name: string
  passed: boolean
  severity: "ERROR" | "WARNING" | "INFO"
  message: string
  details?: unknown
}

interface SimulationReport {
  iterations: number
  resultDistribution: Map<string, number>
  unreachableOutcomes: string[]
  overrepresentedOutcome: string | null
  skewPercentage: number
  balanceScore: number
}

const VALIDATION_CHECKS = {
  MIN_QUESTIONS: {
    id: "min_questions",
    name: "Minimum Soru Sayısı",
    check: (test: BaseTest) => test.questions.length >= 5,
    severity: "ERROR" as const,
    message: "En az 5 soru gerekli"
  },

  ALL_OUTCOMES_REACHABLE: {
    id: "outcomes_reachable",
    name: "Tüm Sonuçlar Ulaşılabilir",
    check: (test: BaseTest, sim: SimulationReport) =>
      sim.unreachableOutcomes.length === 0,
    severity: "ERROR" as const,
    message: "Bazı sonuçlara hiçbir kombinasyonla ulaşılamıyor"
  },

  BALANCED_DISTRIBUTION: {
    id: "balanced_dist",
    name: "Dengeli Dağılım",
    check: (_test: BaseTest, sim: SimulationReport) =>
      sim.skewPercentage <= 70,
    severity: "WARNING" as const,
    message: "Sonuç dağılımı çok eğik, bazı sonuçlar çok baskın"
  },

  DIMENSION_COVERAGE: {
    id: "dim_coverage",
    name: "Boyut Kapsama",
    check: (test: AxisTest) => {
      const questionCounts = new Map<string, number>()
      test.axes.forEach(a => questionCounts.set(a.id, 0))
      test.questions.forEach(q => {
        if (q.config.type === "STATEMENT_AGREE") {
          q.config.axisImpact.forEach(ai => {
            const count = questionCounts.get(ai.axisId) || 0
            questionCounts.set(ai.axisId, count + 1)
          })
        }
      })
      return Array.from(questionCounts.values()).every(c => c >= 3)
    },
    severity: "WARNING" as const,
    message: "Her boyut için en az 3 soru önerilir"
  }
} as const

function runSimulation(test: BaseTest, iterations: number = 1000): SimulationReport {
  const resultCounts = new Map<string, number>()

  for (let i = 0; i < iterations; i++) {
    const randomResponses = generateRandomResponses(test)
    const result = calculateResult(test, randomResponses)
    const key = getResultKey(result)
    resultCounts.set(key, (resultCounts.get(key) || 0) + 1)
  }

  const allOutcomeIds = getOutcomeIds(test)
  const unreachable = allOutcomeIds.filter(id => !resultCounts.has(id))

  const maxCount = Math.max(...Array.from(resultCounts.values()))
  const skew = (maxCount / iterations) * 100

  const overrepresented = Array.from(resultCounts.entries())
    .find(([_, count]) => count === maxCount)?.[0] || null

  const expectedDistribution = iterations / allOutcomeIds.length
  const variance = Array.from(resultCounts.values())
    .reduce((sum, count) => sum + Math.pow(count - expectedDistribution, 2), 0)
  const balanceScore = Math.max(0, 100 - (Math.sqrt(variance) / expectedDistribution * 10))

  return {
    iterations,
    resultDistribution: resultCounts,
    unreachableOutcomes: unreachable,
    overrepresentedOutcome: skew > 50 ? overrepresented : null,
    skewPercentage: skew,
    balanceScore: Math.round(balanceScore)
  }
}

export type { ValidationReport, ValidationCheck, SimulationReport }
export { VALIDATION_CHECKS, runSimulation }
```

### 6.4.9.4 Test-Taking Experience (Engagement Optimized)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    TEST-TAKING UX PRINCIPLES                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  [REFERENCE] 2025-2026 engagement trends: Gamification, mobile-first,          │
│              TikTok engagement +45% YoY, Instagram shares +12%                  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                      ENGAGEMENT DESIGN PRINCIPLES                        │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  1. PROGRESS VISIBILITY                                                 │   │
│  │     • Progress bar with percentage                                      │   │
│  │     • "Soru 7/15" indicator                                            │   │
│  │     • Estimated time remaining (optional)                               │   │
│  │                                                                          │   │
│  │  2. MOMENTUM & FLOW                                                     │   │
│  │     • One question per screen (mobile-optimized)                        │   │
│  │     • Swipe gestures for navigation                                     │   │
│  │     • Smooth transitions between questions                              │   │
│  │     • Auto-advance option after selection                               │   │
│  │                                                                          │   │
│  │  3. VISUAL ENGAGEMENT                                                   │   │
│  │     • Image-based questions when possible                               │   │
│  │     • Colorful, branded UI elements                                     │   │
│  │     • Micro-animations on interactions                                  │   │
│  │     • Haptic feedback on mobile                                         │   │
│  │                                                                          │   │
│  │  4. COMPLETION INCENTIVES                                               │   │
│  │     • "Almost done!" encouragement at 80%                              │   │
│  │     • XP/badge preview for completion                                   │   │
│  │     • Social proof: "5,234 people took this test"                      │   │
│  │                                                                          │   │
│  │  5. ABANDON PREVENTION                                                  │   │
│  │     • Save progress automatically                                       │   │
│  │     • "Continue where you left off" for returning users                │   │
│  │     • Exit intent modal: "You're 70% done!"                            │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                      QUESTION PRESENTATION                               │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                                                                 │    │   │
│  │  │  ████████████████████████████░░░░░░░░░░░░░░░  62%              │    │   │
│  │  │                                                                 │    │   │
│  │  │                    [Question Image]                             │    │   │
│  │  │                                                                 │    │   │
│  │  │  "Yeni bir şehre taşındığınızda ilk ne yaparsınız?"            │    │   │
│  │  │                                                                 │    │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │    │   │
│  │  │  │  🗺️  Şehri keşfe çıkarım                                │   │    │   │
│  │  │  └─────────────────────────────────────────────────────────┘   │    │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │    │   │
│  │  │  │  🏠  Önce evimi düzenlerim                              │   │    │   │
│  │  │  └─────────────────────────────────────────────────────────┘   │    │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │    │   │
│  │  │  │  👋  Komşularla tanışırım                               │   │    │   │
│  │  │  └─────────────────────────────────────────────────────────┘   │    │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │    │   │
│  │  │  │  📱  Online araştırma yaparım                           │   │    │   │
│  │  │  └─────────────────────────────────────────────────────────┘   │    │   │
│  │  │                                                                 │    │   │
│  │  │                    [← Geri]    [İleri →]                       │    │   │
│  │  │                                                                 │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST SESSION MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

interface TestSession {
  id: string
  testId: string
  userId: string | null
  deviceFingerprint: string

  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED"

  currentQuestionIndex: number
  responses: Map<string, unknown>

  startedAt: Date
  lastActivityAt: Date
  completedAt: Date | null

  questionOrder: string[]
  timePerQuestion: Map<string, number>
}

interface EngagementMetrics {
  completionRate: number
  averageTimePerQuestion: number
  dropOffPoints: { questionIndex: number, dropOffRate: number }[]
  retakeRate: number
  shareRate: number
}

const ENGAGEMENT_CONFIG = {
  PROGRESS: {
    showProgressBar: true,
    showQuestionCounter: true,
    showEstimatedTime: true,
    encouragementAt: 0.80
  },

  NAVIGATION: {
    allowBackNavigation: true,
    autoAdvanceDelay: 500,
    swipeEnabled: true
  },

  PERSISTENCE: {
    autoSaveInterval: 5000,
    sessionExpiry: 7 * 24 * 60 * 60 * 1000,
    showContinuePrompt: true
  },

  ABANDON_PREVENTION: {
    exitIntentEnabled: true,
    showProgressOnExit: true,
    reminderNotification: true,
    reminderDelayHours: 24
  }
} as const

function calculateEstimatedTime(
  totalQuestions: number,
  avgSecondsPerQuestion: number = 15
): number {
  return Math.ceil((totalQuestions * avgSecondsPerQuestion) / 60)
}

function shouldShowEncouragement(progress: number): boolean {
  return progress >= ENGAGEMENT_CONFIG.PROGRESS.encouragementAt
}

export type { TestSession, EngagementMetrics }
export { ENGAGEMENT_CONFIG, calculateEstimatedTime, shouldShowEncouragement }
```

### 6.4.9.5 Result Calculation & Statistical Validity

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    RESULT CALCULATION PIPELINE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                          │   │
│  │   Raw Responses  ──→  Score Aggregation  ──→  Normalization  ──→  Result │   │
│  │                              │                      │                    │   │
│  │                              ▼                      ▼                    │   │
│  │                       Weight Applied         Compare to norms           │   │
│  │                       Reverse-code           (if available)             │   │
│  │                       handled                                           │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  SCORING METHODS BY TEST TYPE:                                                  │
│  ════════════════════════════                                                   │
│                                                                                  │
│  AXIS TEST:                                                                     │
│  ───────────                                                                    │
│  • Each response contributes to axis scores based on question config           │
│  • Normalize to -1.0 to +1.0 range per axis                                    │
│  • Determine quadrant by sign of each axis score                               │
│  • Calculate confidence based on consistency of responses                       │
│                                                                                  │
│  CHARACTER TEST:                                                                │
│  ─────────────────                                                              │
│  • Sum points for each character across all questions                          │
│  • Calculate percentage match: char_points / total_points * 100                │
│  • Rank characters by score                                                    │
│  • Primary result = highest scoring character                                  │
│                                                                                  │
│  SPECTRUM TEST:                                                                 │
│  ───────────────                                                                │
│  • Map each response to 0-1 scale based on question config                     │
│  • Apply question weights                                                      │
│  • Calculate weighted average                                                  │
│  • Convert to percentage (0-100%)                                              │
│  • Map to appropriate segment                                                  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESULT CALCULATION WITH CONFIDENCE METRICS
// ══════════════════════════════════════════════════════════════════════════════

interface ResultWithConfidence<T> {
  result: T
  confidence: ConfidenceMetrics
  metadata: ResultMetadata
}

interface ConfidenceMetrics {
  overallConfidence: number
  responseConsistency: number
  answeredQuestions: number
  totalQuestions: number
  timeQualityScore: number
}

interface ResultMetadata {
  calculatedAt: Date
  algorithmVersion: string
  questionWeightsApplied: boolean
  normalizationMethod: string
}

function calculateResponseConsistency(
  responses: Map<string, unknown>,
  questions: TestQuestion[]
): number {
  const timePerQuestion = new Map<string, number>()
  let tooFastCount = 0
  let tooSlowCount = 0

  timePerQuestion.forEach((time, _questionId) => {
    if (time < 2000) tooFastCount++
    if (time > 60000) tooSlowCount++
  })

  const totalAnswered = responses.size
  const problematicResponses = tooFastCount + tooSlowCount
  const consistency = 1 - (problematicResponses / totalAnswered)

  return Math.max(0, Math.min(1, consistency))
}

function calculateTimeQualityScore(
  timePerQuestion: Map<string, number>
): number {
  const times = Array.from(timePerQuestion.values())
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  const variance = times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / times.length
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / avgTime

  if (cv > 2) return 0.3
  if (cv > 1.5) return 0.5
  if (cv > 1) return 0.7
  if (cv > 0.5) return 0.9
  return 1.0
}

function calculateOverallConfidence(metrics: Omit<ConfidenceMetrics, "overallConfidence">): number {
  const completionWeight = 0.3
  const consistencyWeight = 0.4
  const timeQualityWeight = 0.3

  const completionScore = metrics.answeredQuestions / metrics.totalQuestions

  return (
    completionScore * completionWeight +
    metrics.responseConsistency * consistencyWeight +
    metrics.timeQualityScore * timeQualityWeight
  )
}

export type { ResultWithConfidence, ConfidenceMetrics, ResultMetadata }
export { calculateResponseConsistency, calculateTimeQualityScore, calculateOverallConfidence }
```

### 6.4.9.6 Result Presentation & Viral Shareability

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    RESULT PRESENTATION STRATEGY                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  [REFERENCE] TikTok shares +45% YoY, identity validation drives engagement     │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                      RESULT SCREEN HIERARCHY                             │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  1. HERO MOMENT (Immediate emotional impact)                            │   │
│  │     ┌─────────────────────────────────────────────────────────────┐     │   │
│  │     │                                                             │     │   │
│  │     │              ✨ Sonucun Hazır! ✨                           │     │   │
│  │     │                                                             │     │   │
│  │     │                 [Character Image]                           │     │   │
│  │     │                                                             │     │   │
│  │     │                    RACHEL GREEN                             │     │   │
│  │     │                      %87 Eşleşme                            │     │   │
│  │     │                                                             │     │   │
│  │     │         "Modayı ve hayatı kendi kurallarına                │     │   │
│  │     │          göre yaşayan birisin"                              │     │   │
│  │     │                                                             │     │   │
│  │     └─────────────────────────────────────────────────────────────┘     │   │
│  │                                                                          │   │
│  │  2. TRAIT VALIDATION (Identity confirmation)                            │   │
│  │     ┌─────────────────────────────────────────────────────────────┐     │   │
│  │     │  Ortak Özellikleriniz:                                      │     │   │
│  │     │  [Şık] [Hırslı] [Optimist] [Gelişime Açık]                 │     │   │
│  │     └─────────────────────────────────────────────────────────────┘     │   │
│  │                                                                          │   │
│  │  3. DETAILED BREAKDOWN (For engaged users)                              │   │
│  │     ┌─────────────────────────────────────────────────────────────┐     │   │
│  │     │  Tüm Eşleşmelerin:                                          │     │   │
│  │     │  Rachel     ████████████████████░░░░  87%                   │     │   │
│  │     │  Monica     ████████████░░░░░░░░░░░░  62%                   │     │   │
│  │     │  Phoebe     ████████░░░░░░░░░░░░░░░░  45%                   │     │   │
│  │     └─────────────────────────────────────────────────────────────┘     │   │
│  │                                                                          │   │
│  │  4. SOCIAL ACTIONS (Viral mechanics)                                    │   │
│  │     ┌─────────────────────────────────────────────────────────────┐     │   │
│  │     │  [📤 Paylaş]  [🔗 Link Kopyala]  [👥 Arkadaşlarına Gönder] │     │   │
│  │     │                                                             │     │   │
│  │     │  [🔄 Tekrar Çöz]  [🧪 Diğer Testler]                       │     │   │
│  │     └─────────────────────────────────────────────────────────────┘     │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                      SHAREABLE CARD DESIGN                               │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  Dimensions: 1200x630 (OG standard), 1080x1080 (Instagram)              │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │  ┌───────────────┐                                             │    │   │
│  │  │  │               │    "[Test Title]" sonucum:                  │    │   │
│  │  │  │   [Result     │                                             │    │   │
│  │  │  │    Image]     │    RACHEL GREEN                             │    │   │
│  │  │  │               │    %87 Eşleşme                              │    │   │
│  │  │  │               │                                             │    │   │
│  │  │  └───────────────┘    [Trait] [Trait] [Trait]                  │    │   │
│  │  │                                                                │    │   │
│  │  │  ────────────────────────────────────────────────────────────  │    │   │
│  │  │  Sen de çöz: voxpoll.app/t/xyz123      [VoxPoll Logo]         │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                          │   │
│  │  Key Elements:                                                          │   │
│  │  • High contrast, readable on small screens                             │   │
│  │  • Result name prominently displayed                                    │   │
│  │  • Clear CTA with short link                                           │   │
│  │  • Brand watermark (non-intrusive)                                     │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SHAREABLE CARD GENERATION CONFIG
// ══════════════════════════════════════════════════════════════════════════════

const SHARE_CARD_CONFIG = {
  DIMENSIONS: {
    og: { width: 1200, height: 630 },
    instagram: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
    twitter: { width: 1200, height: 675 }
  },

  DESIGN: {
    maxTitleLength: 50,
    maxResultNameLength: 30,
    maxTraitsShown: 4,
    fontSizes: {
      title: 32,
      resultName: 48,
      percentage: 36,
      traits: 24,
      cta: 20
    }
  },

  BRANDING: {
    logoPosition: "bottom-right",
    logoOpacity: 0.8,
    watermarkText: "voxpoll.app",
    includeQRCode: false
  }
} as const

interface ShareableCardData {
  testTitle: string
  resultName: string
  resultImage: string
  matchPercentage: number | null
  traits: string[]
  shareUrl: string
  backgroundColor: string
  accentColor: string
}

function generateShareText(data: ShareableCardData, platform: string): string {
  const templates = {
    twitter: `"${data.testTitle}" testinde ${data.resultName} çıktım! ${data.matchPercentage ? `%${data.matchPercentage} eşleşme ` : ""}Sen de dene: ${data.shareUrl}`,
    instagram: `${data.resultName} ✨\n\n"${data.testTitle}" testini çözdüm!\n\nSen de merak ediyorsan link bio'da 👆`,
    whatsapp: `Hey! "${data.testTitle}" testinde ${data.resultName} çıktım 😄 Sen de çöz bakalım ne çıkacak: ${data.shareUrl}`,
    generic: `"${data.testTitle}" sonucum: ${data.resultName}! ${data.shareUrl}`
  }

  return templates[platform as keyof typeof templates] || templates.generic
}

const SHARE_PLATFORMS = [
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: "Twitter",
    color: "#000000",
    shareEndpoint: "https://twitter.com/intent/tweet",
    params: { text: "{text}", url: "{url}" }
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "MessageCircle",
    color: "#25D366",
    shareEndpoint: "https://wa.me/",
    params: { text: "{text} {url}" }
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "Send",
    color: "#0088cc",
    shareEndpoint: "https://t.me/share/url",
    params: { url: "{url}", text: "{text}" }
  },
  {
    id: "copy",
    name: "Linki Kopyala",
    icon: "Link",
    color: "#6B7280",
    action: "clipboard"
  }
] as const

export { SHARE_CARD_CONFIG, SHARE_PLATFORMS, generateShareText }
export type { ShareableCardData }
```

### 6.4.9.7 Analytics & Insights Dashboard

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST ANALYTICS SCHEMA
// ══════════════════════════════════════════════════════════════════════════════

interface TestAnalytics {
  testId: string
  period: "day" | "week" | "month" | "all_time"

  overview: {
    totalCompletions: number
    uniqueUsers: number
    completionRate: number
    averageTimeSeconds: number
    shareRate: number
  }

  funnel: {
    started: number
    reachedMidpoint: number
    completed: number
    shared: number
  }

  resultDistribution: {
    outcomeId: string
    outcomeName: string
    count: number
    percentage: number
  }[]

  questionAnalysis: {
    questionId: string
    questionText: string
    averageTimeSeconds: number
    dropOffRate: number
    responseDistribution: Map<string, number>
  }[]

  demographics: {
    byAge: Map<string, number>
    byGender: Map<string, number>
    byCountry: Map<string, number>
  } | null

  virality: {
    directViews: number
    sharedViews: number
    viralCoefficient: number
    topReferrers: { source: string, count: number }[]
  }
}

interface CreatorInsights {
  testPerformanceRank: number
  topPerformingOutcome: string
  suggestedImprovements: {
    type: "balance" | "engagement" | "viral"
    message: string
    priority: "low" | "medium" | "high"
  }[]
}

export type { TestAnalytics, CreatorInsights }
```




# ══════════════════════════════════════════════════════════════════════════════
# 6.5 QUESTION TYPE LIBRARY
# ══════════════════════════════════════════════════════════════════════════════

## 6.5.1 Universal Question Types

Available across all content types:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// UNIVERSAL QUESTION TYPES
// ══════════════════════════════════════════════════════════════════════════════

type UniversalQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "IMAGE_CHOICE"

interface SingleChoiceConfig {
  type: "SINGLE_CHOICE"
  options: { id: string, text: string, imageUrl: string | null }[]
  allowOther: boolean
  otherLabel: string
  randomizeOptions: boolean
  displayStyle: "RADIO" | "BUTTONS" | "DROPDOWN"
}

interface MultipleChoiceConfig {
  type: "MULTIPLE_CHOICE"
  options: { id: string, text: string, imageUrl: string | null }[]
  minSelections: number
  maxSelections: number | null
  allowOther: boolean
  otherLabel: string
  randomizeOptions: boolean
  displayStyle: "CHECKBOX" | "BUTTONS"
}

interface ImageChoiceConfig {
  type: "IMAGE_CHOICE"
  options: { id: string, imageUrl: string, caption: string | null }[]
  columns: 2 | 3 | 4
  allowMultiple: boolean
  maxSelections: number | null
  imageSize: "SMALL" | "MEDIUM" | "LARGE"
}

export type { UniversalQuestionType, SingleChoiceConfig, MultipleChoiceConfig, ImageChoiceConfig }
```


## 6.5.2 Survey-Only Question Types

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SURVEY-ONLY QUESTION TYPES
// ══════════════════════════════════════════════════════════════════════════════

type SurveyQuestionType =
  | UniversalQuestionType
  | "TEXT_SHORT"
  | "TEXT_LONG"
  | "RATING_SCALE"
  | "LIKERT"
  | "MATRIX_SINGLE"
  | "MATRIX_MULTIPLE"
  | "RANKING"
  | "SLIDER"
  | "DATE"
  | "TIME"
  | "DATETIME"
  | "FILE_UPLOAD"
  | "NET_PROMOTER"
  | "DROPDOWN"

interface TextShortConfig {
  type: "TEXT_SHORT"
  placeholder: string | null
  maxLength: number
  validationPattern: string | null
  validationMessage: string | null
}

interface TextLongConfig {
  type: "TEXT_LONG"
  placeholder: string | null
  maxLength: number
  minLength: number
  rows: number
  richTextEnabled: boolean
}

interface RatingScaleConfig {
  type: "RATING_SCALE"
  minValue: number
  maxValue: number
  minLabel: string | null
  maxLabel: string | null
  showNumbers: boolean
  displayStyle: "STARS" | "NUMBERS" | "HEARTS" | "THUMBS"
}

interface LikertConfig {
  type: "LIKERT"
  scale: 5 | 7
  labels: string[]
  showNeutral: boolean
}

interface MatrixSingleConfig {
  type: "MATRIX_SINGLE"
  rows: { id: string, text: string }[]
  columns: { id: string, text: string }[]
  randomizeRows: boolean
}

interface MatrixMultipleConfig {
  type: "MATRIX_MULTIPLE"
  rows: { id: string, text: string }[]
  columns: { id: string, text: string }[]
  maxSelectionsPerRow: number | null
  randomizeRows: boolean
}

interface RankingConfig {
  type: "RANKING"
  items: { id: string, text: string, imageUrl: string | null }[]
  maxRankedItems: number | null
  dragEnabled: boolean
}

interface SliderConfig {
  type: "SLIDER"
  minValue: number
  maxValue: number
  step: number
  defaultValue: number | null
  showValue: boolean
  minLabel: string | null
  maxLabel: string | null
  unit: string | null
}

interface DateConfig {
  type: "DATE"
  minDate: string | null
  maxDate: string | null
  disablePast: boolean
  disableFuture: boolean
  format: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY"
}

interface TimeConfig {
  type: "TIME"
  format: "12h" | "24h"
  minuteStep: 1 | 5 | 10 | 15 | 30
}

interface DateTimeConfig {
  type: "DATETIME"
  dateConfig: Omit<DateConfig, "type">
  timeConfig: Omit<TimeConfig, "type">
}

interface FileUploadConfig {
  type: "FILE_UPLOAD"
  acceptedTypes: string[]
  maxFileSizeMB: number
  maxFiles: number
  allowedExtensions: string[]
}

interface NetPromoterConfig {
  type: "NET_PROMOTER"
  lowLabel: string
  highLabel: string
  followUpQuestion: string | null
  followUpThreshold: number
}

interface DropdownConfig {
  type: "DROPDOWN"
  options: { id: string, text: string, group: string | null }[]
  placeholder: string
  searchable: boolean
  allowClear: boolean
}

export type { SurveyQuestionType }
export type {
  TextShortConfig, TextLongConfig, RatingScaleConfig, LikertConfig,
  MatrixSingleConfig, MatrixMultipleConfig, RankingConfig, SliderConfig,
  DateConfig, TimeConfig, DateTimeConfig, FileUploadConfig,
  NetPromoterConfig, DropdownConfig
}
```


## 6.5.3 Test-Only Question Types

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// TEST-ONLY QUESTION TYPES
// ══════════════════════════════════════════════════════════════════════════════

type TestQuestionType =
  | "SINGLE_CHOICE"
  | "IMAGE_CHOICE"
  | "SCALE"
  | "STATEMENT_AGREE"

interface TestSingleChoiceConfig {
  type: "SINGLE_CHOICE"
  options: {
    id: string
    text: string
    imageUrl: string | null
    categoryScores: { categoryId: string, points: number }[]
  }[]
  randomizeOptions: boolean
}

interface TestImageChoiceConfig {
  type: "IMAGE_CHOICE"
  options: {
    id: string
    imageUrl: string
    caption: string | null
    categoryScores: { categoryId: string, points: number }[]
  }[]
  columns: 2 | 3 | 4
}

interface TestScaleConfig {
  type: "SCALE"
  minValue: number
  maxValue: number
  minLabel: string
  maxLabel: string
  categoryMapping: {
    categoryId: string
    ranges: { min: number, max: number, points: number }[]
  }[]
}

interface StatementAgreeConfig {
  type: "STATEMENT_AGREE"
  statement: string
  scale: 5 | 7
  labels: string[]
  categoryMapping: {
    categoryId: string
    scoreMultiplier: number
    invertScore: boolean
  }[]
}

export type { TestQuestionType }
export type { TestSingleChoiceConfig, TestImageChoiceConfig, TestScaleConfig, StatementAgreeConfig }
```


## 6.5.4 Question Validation Rules

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// QUESTION VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const baseQuestionSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(5).max(1000),
  description: z.string().max(500).nullable(),
  imageUrl: z.string().url().nullable(),
  isRequired: z.boolean().default(true),
  position: z.number().int().min(0)
})

const singleChoiceSchema = baseQuestionSchema.extend({
  type: z.literal("SINGLE_CHOICE"),
  config: z.object({
    options: z.array(z.object({
      id: z.string(),
      text: z.string().min(1).max(200)
    })).min(2).max(20),
    allowOther: z.boolean().default(false),
    randomizeOptions: z.boolean().default(false)
  })
})

const textShortSchema = baseQuestionSchema.extend({
  type: z.literal("TEXT_SHORT"),
  config: z.object({
    maxLength: z.number().int().min(1).max(1000).default(200),
    validationPattern: z.string().nullable().default(null)
  })
})

const ratingScaleSchema = baseQuestionSchema.extend({
  type: z.literal("RATING_SCALE"),
  config: z.object({
    minValue: z.number().int().min(0).max(1),
    maxValue: z.number().int().min(3).max(10),
    displayStyle: z.enum(["STARS", "NUMBERS", "HEARTS", "THUMBS"]).default("STARS")
  }).refine(
    (data) => data.maxValue > data.minValue,
    "maxValue must be greater than minValue"
  )
})

const netPromoterSchema = baseQuestionSchema.extend({
  type: z.literal("NET_PROMOTER"),
  config: z.object({
    lowLabel: z.string().default("Not at all likely"),
    highLabel: z.string().default("Extremely likely"),
    followUpQuestion: z.string().max(500).nullable().default(null)
  })
})

const fileUploadSchema = baseQuestionSchema.extend({
  type: z.literal("FILE_UPLOAD"),
  config: z.object({
    acceptedTypes: z.array(z.string()).min(1),
    maxFileSizeMB: z.number().min(1).max(100).default(10),
    maxFiles: z.number().int().min(1).max(10).default(1)
  })
})

export {
  baseQuestionSchema,
  singleChoiceSchema,
  textShortSchema,
  ratingScaleSchema,
  netPromoterSchema,
  fileUploadSchema
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 6.6 CONTENT LIFECYCLE
# ══════════════════════════════════════════════════════════════════════════════

## 6.6.1 Status States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CONTENT STATUS LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│    ┌─────────┐                                                                 │
│    │  DRAFT  │ ────────────────────────────────────────────┐                   │
│    └────┬────┘                                             │                   │
│         │                                                  │                   │
│         │ [Publish]                                        │ [Delete]          │
│         ▼                                                  │                   │
│    ┌─────────┐      ┌───────────┐      ┌─────────┐        │                   │
│    │SCHEDULED│─────▶│  ACTIVE   │─────▶│ CLOSED  │────────┼──▶ [DELETED]      │
│    └─────────┘      └─────┬─────┘      └────┬────┘        │                   │
│         ▲                 │                 │             │                   │
│         │                 │ [Pause]         │ [Archive]   │                   │
│         │                 ▼                 ▼             │                   │
│         │           ┌─────────┐      ┌──────────┐         │                   │
│         └───────────│ PAUSED  │      │ ARCHIVED │─────────┘                   │
│           [Resume]  └─────────┘      └──────────┘                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CONTENT STATUS MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

type ContentStatus = 
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "ARCHIVED"

const STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ["SCHEDULED", "ACTIVE"],
  SCHEDULED: ["DRAFT", "ACTIVE"],
  ACTIVE: ["PAUSED", "CLOSED"],
  PAUSED: ["ACTIVE", "CLOSED"],
  CLOSED: ["ARCHIVED"],
  ARCHIVED: []
}

function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to)
}

interface StatusChange {
  id: string
  contentType: "POLL" | "SURVEY" | "TEST"
  contentId: string
  fromStatus: ContentStatus
  toStatus: ContentStatus
  changedBy: string
  reason: string | null
  changedAt: Date
}

export type { ContentStatus, StatusChange }
export { STATUS_TRANSITIONS, canTransition }
```


## 6.6.2 Scheduling System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// CONTENT SCHEDULING
// ══════════════════════════════════════════════════════════════════════════════

interface ScheduleConfig {
  publishAt: Date
  closeAt: Date | null
  timezone: string
  notifyBeforeClose: boolean
  notifyBeforeCloseMinutes: number
}

const scheduleConfigSchema = z.object({
  publishAt: z.date().refine(
    (date) => date > new Date(),
    "Publish date must be in the future"
  ),
  closeAt: z.date().nullable().refine(
    (date, ctx) => {
      if (date === null) return true
      return date > ctx.parent.publishAt
    },
    "Close date must be after publish date"
  ),
  timezone: z.string().default("UTC"),
  notifyBeforeClose: z.boolean().default(true),
  notifyBeforeCloseMinutes: z.number().int().min(5).max(1440).default(60)
})

const SCHEDULE_PRESETS = {
  "1_HOUR": { hours: 1 },
  "4_HOURS": { hours: 4 },
  "12_HOURS": { hours: 12 },
  "24_HOURS": { hours: 24 },
  "3_DAYS": { days: 3 },
  "1_WEEK": { days: 7 },
  "2_WEEKS": { days: 14 },
  "1_MONTH": { days: 30 },
  "INDEFINITE": null
} as const

export type { ScheduleConfig }
export { scheduleConfigSchema, SCHEDULE_PRESETS }
```


## 6.6.3 Auto-Close Triggers

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// AUTO-CLOSE TRIGGER SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

type AutoCloseTrigger =
  | "SCHEDULED_TIME"
  | "RESPONSE_LIMIT"
  | "VOTE_LIMIT"
  | "MANUAL"

interface AutoCloseConfig {
  triggers: AutoCloseTrigger[]
  scheduledCloseAt: Date | null
  maxResponses: number | null
  maxVotes: number | null
  closeOnFirstTrigger: boolean
}

const autoCloseConfigSchema = z.object({
  triggers: z.array(z.enum(["SCHEDULED_TIME", "RESPONSE_LIMIT", "VOTE_LIMIT", "MANUAL"])),
  scheduledCloseAt: z.date().nullable(),
  maxResponses: z.number().int().min(1).nullable(),
  maxVotes: z.number().int().min(1).nullable(),
  closeOnFirstTrigger: z.boolean().default(true)
}).refine(
  (data) => {
    if (data.triggers.includes("SCHEDULED_TIME") && !data.scheduledCloseAt) {
      return false
    }
    if (data.triggers.includes("RESPONSE_LIMIT") && !data.maxResponses) {
      return false
    }
    if (data.triggers.includes("VOTE_LIMIT") && !data.maxVotes) {
      return false
    }
    return true
  },
  "Trigger configuration incomplete"
)

function checkAutoClose(
  config: AutoCloseConfig,
  currentResponses: number,
  currentVotes: number,
  currentTime: Date
): { shouldClose: boolean, trigger: AutoCloseTrigger | null } {
  for (const trigger of config.triggers) {
    switch (trigger) {
      case "SCHEDULED_TIME":
        if (config.scheduledCloseAt && currentTime >= config.scheduledCloseAt) {
          return { shouldClose: true, trigger: "SCHEDULED_TIME" }
        }
        break
      case "RESPONSE_LIMIT":
        if (config.maxResponses && currentResponses >= config.maxResponses) {
          return { shouldClose: true, trigger: "RESPONSE_LIMIT" }
        }
        break
      case "VOTE_LIMIT":
        if (config.maxVotes && currentVotes >= config.maxVotes) {
          return { shouldClose: true, trigger: "VOTE_LIMIT" }
        }
        break
    }
  }
  
  return { shouldClose: false, trigger: null }
}

export type { AutoCloseTrigger, AutoCloseConfig }
export { autoCloseConfigSchema, checkAutoClose }
```


## 6.6.4 Content Modification Rules

[MUST] Modification rules by status:

| Field | DRAFT | SCHEDULED | ACTIVE | PAUSED | CLOSED |
|-------|-------|-----------|--------|--------|--------|
| Title/Question | Yes | Yes | No | No | No |
| Description | Yes | Yes | Yes | Yes | No |
| Options/Choices | Yes | Yes | No | No | No |
| Add Questions | Yes | Yes | No | No | No |
| Remove Questions | Yes | Yes | No | No | No |
| Reorder Questions | Yes | Yes | No | No | No |
| Logic Rules | Yes | Yes | Limited | Limited | No |
| Settings | Yes | Yes | Limited | Limited | No |
| Schedule | Yes | Yes | N/A | N/A | N/A |
| Visibility | Yes | Yes | Yes | Yes | No |
| Cover Image | Yes | Yes | Yes | Yes | No |

[EDGE CASE] If active content has 0 responses, full editing is allowed.
[EDGE CASE] Typo corrections in questions allowed via support request.




# ══════════════════════════════════════════════════════════════════════════════
# 6.7 PRIVACY & DISTRIBUTION
# ══════════════════════════════════════════════════════════════════════════════

## 6.7.1 Visibility Levels

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// VISIBILITY LEVEL SYSTEM
// [AUTHORITATIVE] Formal definition of content visibility levels
// ══════════════════════════════════════════════════════════════════════════════

type VisibilityLevel =
  | "PUBLIC"
  | "UNLISTED"
  | "ORGANIZATION"
  | "TEAM"
  | "PRIVATE"

/**
 * CONTENT VISIBILITY LEVELS - FORMAL DEFINITIONS
 *
 * Controls who can discover and access content (polls, surveys, tests)
 */
const VISIBILITY_LEVEL_DEFINITIONS = {
  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC - Maximum reach
  // ─────────────────────────────────────────────────────────────────────────────
  PUBLIC: {
    name: "Public",
    icon: "Globe",
    description: "Anyone can find and participate",
    characteristics: {
      discoverable: true,           // Appears in feed, search, explore
      requiresAuth: false,          // Anonymous participation allowed
      shareable: true,              // Can be shared on social media
      indexable: true,              // Indexed by search engines (if opted)
      embedable: true               // Can be embedded in external sites
    },
    availableTo: ["FREE", "PLUS", "PREMIUM", "ORG"],
    accessCheck: {
      rule: "ALLOW_ALL",
      exceptions: [
        "Blocked users",
        "Content has age restriction and user age unknown"
      ]
    },
    useCase: "General public engagement, viral polls, broad research"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // UNLISTED - Link-only access
  // ─────────────────────────────────────────────────────────────────────────────
  UNLISTED: {
    name: "Unlisted",
    icon: "Link",
    description: "Only people with the link can participate",
    characteristics: {
      discoverable: false,          // Does NOT appear in feed/search
      requiresAuth: false,          // Anonymous allowed if has link
      shareable: true,              // Link can be shared
      indexable: false,             // NOT indexed by search engines
      embedable: true               // Can embed, but need link
    },
    availableTo: ["FREE", "PLUS", "PREMIUM", "ORG"],
    accessCheck: {
      rule: "HAS_LINK",
      exceptions: [
        "Blocked users"
      ]
    },
    useCase: "Targeted sharing, soft-launch testing, limited audience"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ORGANIZATION - Org members only
  // ─────────────────────────────────────────────────────────────────────────────
  ORGANIZATION: {
    name: "Organization",
    icon: "Building",
    description: "Only organization members can participate",
    characteristics: {
      discoverable: true,           // Visible in org feed only
      requiresAuth: true,           // Must be logged in
      shareable: false,             // Cannot share outside org
      indexable: false,             // Never indexed
      embedable: false              // Cannot embed externally
    },
    availableTo: ["ORG"],           // Organization tier only
    accessCheck: {
      rule: "SAME_ORGANIZATION",
      exceptions: [
        "Org admins from parent org (if multi-org setup)"
      ]
    },
    useCase: "Internal employee surveys, company-wide polls, org feedback"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEAM - Specific team members
  // ─────────────────────────────────────────────────────────────────────────────
  TEAM: {
    name: "Team",
    icon: "Users",
    description: "Only specific team members can participate",
    characteristics: {
      discoverable: true,           // Visible in team dashboard
      requiresAuth: true,           // Must be logged in
      shareable: false,             // Cannot share outside team
      indexable: false,             // Never indexed
      embedable: false              // Cannot embed
    },
    availableTo: ["ORG"],           // Organization tier only
    accessCheck: {
      rule: "MEMBER_OF_SPECIFIED_TEAMS",
      multiTeam: true               // Can specify multiple teams
    },
    useCase: "Department surveys, team-specific feedback, project polls"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE - Invitation only
  // ─────────────────────────────────────────────────────────────────────────────
  PRIVATE: {
    name: "Private",
    icon: "Lock",
    description: "Only invited users can participate",
    characteristics: {
      discoverable: false,          // Never appears anywhere
      requiresAuth: true,           // Must be logged in
      shareable: false,             // Cannot share
      indexable: false,             // Never indexed
      embedable: false              // Cannot embed
    },
    availableTo: ["PLUS", "PREMIUM", "ORG"],  // Not available to Free
    accessCheck: {
      rule: "EXPLICIT_INVITATION",
      invitationMethods: [
        "Direct user ID",
        "Email address",
        "Email domain whitelist"
      ]
    },
    useCase: "Confidential surveys, invite-only research, exclusive content"
  }
} as const

// Helper: Check visibility availability for tier
function isVisibilityAvailable(
  visibility: VisibilityLevel,
  userTier: "FREE" | "PLUS" | "PREMIUM",
  isOrgMember: boolean
): boolean {
  const config = VISIBILITY_LEVEL_DEFINITIONS[visibility]
  if (isOrgMember) return config.availableTo.includes("ORG")
  return config.availableTo.includes(userTier)
}

export { VISIBILITY_LEVEL_DEFINITIONS, isVisibilityAvailable }

interface VisibilityConfig {
  level: VisibilityLevel
  organizationId: string | null
  teamIds: string[] | null
  allowedUserIds: string[] | null
  allowedDomains: string[] | null
  requireAuth: boolean
  passwordProtected: boolean
  passwordHash: string | null
}

const VISIBILITY_DESCRIPTIONS: Record<VisibilityLevel, string> = {
  PUBLIC: "Anyone can find and participate",
  UNLISTED: "Only people with the link can participate",
  ORGANIZATION: "Only organization members can participate",
  TEAM: "Only specific team members can participate",
  PRIVATE: "Only invited users can participate"
}

const VISIBILITY_DISCOVERY: Record<VisibilityLevel, boolean> = {
  PUBLIC: true,
  UNLISTED: false,
  ORGANIZATION: false,
  TEAM: false,
  PRIVATE: false
}

function canAccess(
  config: VisibilityConfig,
  userId: string | null,
  userOrganizationId: string | null,
  userTeamIds: string[],
  userEmail: string | null
): { allowed: boolean, reason: string | null } {
  
  if (config.level === "PUBLIC") {
    if (config.requireAuth && !userId) {
      return { allowed: false, reason: "Authentication required" }
    }
    return { allowed: true, reason: null }
  }
  
  if (config.level === "UNLISTED") {
    if (config.requireAuth && !userId) {
      return { allowed: false, reason: "Authentication required" }
    }
    return { allowed: true, reason: null }
  }
  
  if (config.level === "ORGANIZATION") {
    if (!userId) {
      return { allowed: false, reason: "Authentication required" }
    }
    if (userOrganizationId !== config.organizationId) {
      return { allowed: false, reason: "Organization membership required" }
    }
    return { allowed: true, reason: null }
  }
  
  if (config.level === "TEAM") {
    if (!userId) {
      return { allowed: false, reason: "Authentication required" }
    }
    const hasTeamAccess = config.teamIds?.some(id => userTeamIds.includes(id))
    if (!hasTeamAccess) {
      return { allowed: false, reason: "Team membership required" }
    }
    return { allowed: true, reason: null }
  }
  
  if (config.level === "PRIVATE") {
    if (!userId) {
      return { allowed: false, reason: "Authentication required" }
    }
    
    if (config.allowedUserIds?.includes(userId)) {
      return { allowed: true, reason: null }
    }
    
    if (userEmail && config.allowedDomains) {
      const domain = userEmail.split("@")[1]
      if (config.allowedDomains.includes(domain)) {
        return { allowed: true, reason: null }
      }
    }
    
    return { allowed: false, reason: "Invitation required" }
  }
  
  return { allowed: false, reason: "Unknown visibility level" }
}

export type { VisibilityLevel, VisibilityConfig }
export { VISIBILITY_DESCRIPTIONS, VISIBILITY_DISCOVERY, canAccess }
```


## 6.7.2 Invitation System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// INVITATION SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

// ContentInvitationStatus - for Poll/Survey/Test invitations (different from OrgInvitationStatus in BIBLE-013)
type ContentInvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED"
type InvitationMethod = "EMAIL" | "LINK" | "BULK_IMPORT"

interface Invitation {
  id: string
  contentType: "POLL" | "SURVEY" | "TEST"
  contentId: string
  invitedBy: string
  
  email: string | null
  inviteCode: string
  
  method: InvitationMethod
  status: ContentInvitationStatus
  
  sentAt: Date
  expiresAt: Date
  respondedAt: Date | null
  
  reminderCount: number
  lastReminderAt: Date | null
}

interface BulkInviteConfig {
  emails: string[]
  personalizeMessage: boolean
  messageTemplate: string
  sendImmediately: boolean
  scheduleAt: Date | null
  enableReminders: boolean
  reminderDays: number[]
}

const INVITATION_DEFAULTS = {
  expirationDays: 14,
  maxReminders: 3,
  reminderIntervalDays: 3
} as const

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export type { ContentInvitationStatus, InvitationMethod, Invitation, BulkInviteConfig }
export { INVITATION_DEFAULTS, generateInviteCode }
```


## 6.7.3 Link Sharing & Embed Codes

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SHARING & EMBEDDING
// ══════════════════════════════════════════════════════════════════════════════

interface ShareLink {
  id: string
  contentType: "POLL" | "SURVEY" | "TEST"
  contentId: string
  
  shortCode: string
  fullUrl: string
  
  isActive: boolean
  expiresAt: Date | null
  maxUses: number | null
  useCount: number
  
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  
  createdAt: Date
}

interface EmbedConfig {
  width: string
  height: string
  showBranding: boolean
  theme: "LIGHT" | "DARK" | "AUTO"
  borderRadius: number
  backgroundColor: string | null
}

function generateEmbedCode(
  contentType: string,
  contentId: string,
  config: EmbedConfig
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const src = `${baseUrl}/embed/${contentType.toLowerCase()}/${contentId}`
  
  const params = new URLSearchParams()
  if (!config.showBranding) params.set("branding", "false")
  if (config.theme !== "AUTO") params.set("theme", config.theme.toLowerCase())
  if (config.backgroundColor) params.set("bg", config.backgroundColor.replace("#", ""))
  
  const queryString = params.toString()
  const finalSrc = queryString ? `${src}?${queryString}` : src
  
  return `<iframe
  src="${finalSrc}"
  width="${config.width}"
  height="${config.height}"
  frameborder="0"
  style="border-radius: ${config.borderRadius}px"
  allow="clipboard-write"
></iframe>`
}

const DEFAULT_EMBED_CONFIG: EmbedConfig = {
  width: "100%",
  height: "500px",
  showBranding: true,
  theme: "AUTO",
  borderRadius: 8,
  backgroundColor: null
}

export type { ShareLink, EmbedConfig }
export { generateEmbedCode, DEFAULT_EMBED_CONFIG }
```


## 6.7.4 Response Limit Controls

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE LIMIT CONTROLS
// ══════════════════════════════════════════════════════════════════════════════

interface ResponseLimits {
  maxTotalResponses: number | null
  maxResponsesPerUser: number
  maxResponsesPerIP: number | null
  maxResponsesPerDevice: number | null
  cooldownMinutes: number | null
  enforceUniqueEmail: boolean
  enforceUniquePhone: boolean
  geoRestrictions: GeoRestriction | null
}

interface GeoRestriction {
  mode: "ALLOW" | "BLOCK"
  countries: string[]
  regions: string[] | null
}

interface RateLimitCheck {
  allowed: boolean
  reason: string | null
  retryAfter: Date | null
  remaining: number | null
}

function checkResponseLimits(
  limits: ResponseLimits,
  context: {
    userId: string | null
    ipAddress: string
    deviceFingerprint: string | null
    email: string | null
    countryCode: string | null
    existingResponses: {
      byUser: number
      byIP: number
      byDevice: number
      byEmail: number
      total: number
      lastResponseAt: Date | null
    }
  }
): RateLimitCheck {
  const { existingResponses } = context
  
  if (limits.maxTotalResponses && existingResponses.total >= limits.maxTotalResponses) {
    return {
      allowed: false,
      reason: "Maximum responses reached",
      retryAfter: null,
      remaining: 0
    }
  }
  
  if (context.userId && existingResponses.byUser >= limits.maxResponsesPerUser) {
    return {
      allowed: false,
      reason: "You have already responded",
      retryAfter: null,
      remaining: 0
    }
  }
  
  if (limits.maxResponsesPerIP && existingResponses.byIP >= limits.maxResponsesPerIP) {
    return {
      allowed: false,
      reason: "Response limit reached from this location",
      retryAfter: null,
      remaining: 0
    }
  }
  
  if (limits.cooldownMinutes && existingResponses.lastResponseAt) {
    const cooldownEnd = new Date(
      existingResponses.lastResponseAt.getTime() + limits.cooldownMinutes * 60 * 1000
    )
    if (new Date() < cooldownEnd) {
      return {
        allowed: false,
        reason: "Please wait before responding again",
        retryAfter: cooldownEnd,
        remaining: null
      }
    }
  }
  
  if (limits.geoRestrictions && context.countryCode) {
    const { mode, countries } = limits.geoRestrictions
    const isInList = countries.includes(context.countryCode)
    
    if ((mode === "ALLOW" && !isInList) || (mode === "BLOCK" && isInList)) {
      return {
        allowed: false,
        reason: "This content is not available in your region",
        retryAfter: null,
        remaining: null
      }
    }
  }
  
  return {
    allowed: true,
    reason: null,
    retryAfter: null,
    remaining: limits.maxTotalResponses 
      ? limits.maxTotalResponses - existingResponses.total 
      : null
  }
}

export type { ResponseLimits, GeoRestriction, RateLimitCheck }
export { checkResponseLimits }
```




# ══════════════════════════════════════════════════════════════════════════════
# 6.8 CONTENT DATA MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 6.8.1 Base Content Schema

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// BASE CONTENT SCHEMA (Drizzle-style)
// ══════════════════════════════════════════════════════════════════════════════

/*
model BaseContent {
  id              String          @id @default(cuid())
  type            ContentType
  creatorId       String
  organizationId  String?
  
  status          ContentStatus   @default(DRAFT)
  visibility      VisibilityLevel @default(PUBLIC)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  publishedAt     DateTime?
  closedAt        DateTime?
  archivedAt      DateTime?
  
  creator         User            @relation(fields: [creatorId], references: [id])
  organization    Organization?   @relation(fields: [organizationId], references: [id])
  
  @@index([creatorId])
  @@index([organizationId])
  @@index([status])
  @@index([visibility])
  @@index([createdAt])
}

enum ContentType {
  POLL
  SURVEY
  TEST
}

// [DECISION] Standardized with BIBLE-013 Database Schema
enum ContentStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED    // Renamed from CLOSED for consistency
  ARCHIVED
  DELETED      // Soft delete state
}

// [DECISION] Standardized with BIBLE-013 Database Schema
enum ContentVisibility {
  PUBLIC
  UNLISTED
  PRIVATE
  ORGANIZATION_ONLY  // Renamed from ORGANIZATION/TEAM for clarity
}
*/
```


## 6.8.2 Poll Schema

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// POLL SCHEMA (Drizzle-style)
// ══════════════════════════════════════════════════════════════════════════════

/*
model Poll {
  id              String          @id @default(cuid())
  type            PollType        @default(QUICK)
  creatorId       String
  organizationId  String?
  
  question        String          @db.VarChar(500)
  description     String?         @db.VarChar(1000)
  mediaUrl        String?
  mediaType       MediaType?
  
  status          ContentStatus   @default(DRAFT)
  visibility      VisibilityLevel @default(PUBLIC)
  
  totalVotes      Int             @default(0)
  uniqueVoters    Int             @default(0)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  publishedAt     DateTime?
  closesAt        DateTime?
  closedAt        DateTime?
  
  options         PollOption[]
  settings        PollSettings?
  votes           PollVote[]
  
  creator         User            @relation(fields: [creatorId], references: [id])
  organization    Organization?   @relation(fields: [organizationId], references: [id])
  
  @@index([creatorId])
  @@index([organizationId])
  @@index([status, visibility])
  @@index([createdAt])
}

model PollOption {
  id          String      @id @default(cuid())
  pollId      String
  text        String      @db.VarChar(200)
  imageUrl    String?
  position    Int
  voteCount   Int         @default(0)
  
  poll        Poll        @relation(fields: [pollId], references: [id], onDelete: Cascade)
  votes       PollVote[]
  
  @@index([pollId])
}

model PollSettings {
  id                    String    @id @default(cuid())
  pollId                String    @unique
  allowMultipleChoice   Boolean   @default(false)
  maxSelections         Int?
  showResultsBeforeVote Boolean   @default(false)
  showVoterCount        Boolean   @default(true)
  allowChangeVote       Boolean   @default(false)
  requireComment        Boolean   @default(false)
  randomizeOptions      Boolean   @default(false)
  hideResultsUntilClose Boolean   @default(false)
  
  poll                  Poll      @relation(fields: [pollId], references: [id], onDelete: Cascade)
}

model PollVote {
  id          String      @id @default(cuid())
  pollId      String
  optionId    String
  userId      String?
  sessionId   String?
  comment     String?     @db.VarChar(500)
  
  ipHash      String
  userAgent   String?
  
  createdAt   DateTime    @default(now())
  
  poll        Poll        @relation(fields: [pollId], references: [id], onDelete: Cascade)
  option      PollOption  @relation(fields: [optionId], references: [id], onDelete: Cascade)
  user        User?       @relation(fields: [userId], references: [id])
  
  @@unique([pollId, userId])
  @@index([pollId])
  @@index([optionId])
  @@index([userId])
}

enum PollType {
  QUICK
  EXTENDED
}

enum MediaType {
  IMAGE
  VIDEO
  GIF
}
*/
```


## 6.8.3 Survey Schema

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SURVEY SCHEMA (Drizzle-style)
// ══════════════════════════════════════════════════════════════════════════════

/*
model Survey {
  id                    String          @id @default(cuid())
  creatorId             String
  organizationId        String?
  
  title                 String          @db.VarChar(200)
  description           String?         @db.VarChar(2000)
  coverImageUrl         String?
  
  status                ContentStatus   @default(DRAFT)
  visibility            VisibilityLevel @default(PUBLIC)
  
  responseCount         Int             @default(0)
  completionRate        Float           @default(0)
  averageCompletionTime Int             @default(0)
  
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  publishedAt           DateTime?
  closesAt              DateTime?
  closedAt              DateTime?
  
  pages                 SurveyPage[]
  screeningQuestions    ScreeningQuestion[]
  settings              SurveySettings?
  responses             SurveyResponse[]
  logicRules            LogicRule[]
  
  creator               User            @relation(fields: [creatorId], references: [id])
  organization          Organization?   @relation(fields: [organizationId], references: [id])
  
  @@index([creatorId])
  @@index([organizationId])
  @@index([status, visibility])
}

model SurveyPage {
  id          String            @id @default(cuid())
  surveyId    String
  title       String?           @db.VarChar(100)
  description String?           @db.VarChar(500)
  position    Int
  
  questions   SurveyQuestion[]
  survey      Survey            @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  
  @@index([surveyId])
}

model SurveyQuestion {
  id            String          @id @default(cuid())
  pageId        String
  type          QuestionType
  question      String          @db.VarChar(1000)
  description   String?         @db.VarChar(500)
  imageUrl      String?
  isRequired    Boolean         @default(true)
  position      Int
  config        Json
  
  page          SurveyPage      @relation(fields: [pageId], references: [id], onDelete: Cascade)
  answers       SurveyAnswer[]
  
  @@index([pageId])
}

model SurveySettings {
  id                      String    @id @default(cuid())
  surveyId                String    @unique
  allowAnonymous          Boolean   @default(true)
  requireAuth             Boolean   @default(false)
  oneResponsePerUser      Boolean   @default(true)
  allowEditResponse       Boolean   @default(false)
  showProgressBar         Boolean   @default(true)
  showPageNumbers         Boolean   @default(true)
  randomizeQuestions      Boolean   @default(false)
  randomizeWithinPage     Boolean   @default(false)
  timeLimitMinutes        Int?
  showEstimatedTime       Boolean   @default(true)
  redirectUrl             String?
  confirmationMessage     String    @default("Thank you for your response!")
  notifyOnResponse        Boolean   @default(false)
  showResultsToRespondent Boolean   @default(false)
  
  survey                  Survey    @relation(fields: [surveyId], references: [id], onDelete: Cascade)
}

model SurveyResponse {
  id              String          @id @default(cuid())
  surveyId        String
  userId          String?
  sessionId       String?
  
  status          ResponseStatus  @default(IN_PROGRESS)
  currentPage     Int             @default(0)
  completionTime  Int?
  
  ipHash          String
  userAgent       String?
  deviceType      String?
  
  startedAt       DateTime        @default(now())
  completedAt     DateTime?
  
  answers         SurveyAnswer[]
  survey          Survey          @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  user            User?           @relation(fields: [userId], references: [id])
  
  @@index([surveyId])
  @@index([userId])
  @@index([status])
}

model SurveyAnswer {
  id          String          @id @default(cuid())
  responseId  String
  questionId  String
  value       Json
  
  response    SurveyResponse  @relation(fields: [responseId], references: [id], onDelete: Cascade)
  question    SurveyQuestion  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@unique([responseId, questionId])
  @@index([responseId])
  @@index([questionId])
}

// ResponseStatus enum - AUTHORITATIVE DEFINITION in BIBLE-013.md
// Full values: SCREENING, IN_PROGRESS, PAUSED, SUBMITTED, VALIDATED,
//              COMPLETED, ABANDONED, DISQUALIFIED, TIMEOUT, QUOTA_FULL
enum ResponseStatus {
  SCREENING         // In pre-qualification
  IN_PROGRESS       // Currently answering
  PAUSED            // Can resume within session
  SUBMITTED         // Awaiting validation
  VALIDATED         // Passed quality checks
  COMPLETED         // Successfully finished
  ABANDONED         // User left
  DISQUALIFIED      // Failed checks
  TIMEOUT           // Session expired
  QUOTA_FULL        // Quota reached
}
*/
```


## 6.8.4 Test Schema

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PERSONALITY TEST SCHEMA (Drizzle-style)
// ══════════════════════════════════════════════════════════════════════════════

/*
model PersonalityTest {
  id                    String          @id @default(cuid())
  creatorId             String
  organizationId        String?
  
  title                 String          @db.VarChar(200)
  description           String          @db.VarChar(2000)
  coverImageUrl         String?
  
  scoringMethod         ScoringMethod   @default(CATEGORY_POINTS)
  
  status                ContentStatus   @default(DRAFT)
  visibility            VisibilityLevel @default(PUBLIC)
  
  completionCount       Int             @default(0)
  shareCount            Int             @default(0)
  averageCompletionTime Int             @default(0)
  
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
  publishedAt           DateTime?
  
  questions             TestQuestion[]
  resultCategories      ResultCategory[]
  settings              TestSettings?
  results               TestResult[]
  
  creator               User            @relation(fields: [creatorId], references: [id])
  organization          Organization?   @relation(fields: [organizationId], references: [id])
  
  @@index([creatorId])
  @@index([organizationId])
  @@index([status, visibility])
}

model ResultCategory {
  id                  String          @id @default(cuid())
  testId              String
  name                String          @db.VarChar(100)
  slug                String
  description         String          @db.VarChar(500)
  detailedDescription String          @db.VarChar(2000)
  imageUrl            String?
  color               String          @db.VarChar(7)
  iconName            String?
  traits              String[]
  minScore            Int?
  maxScore            Int?
  position            Int
  
  test                PersonalityTest @relation(fields: [testId], references: [id], onDelete: Cascade)
  testResults         TestResult[]
  
  @@unique([testId, slug])
  @@index([testId])
}

model TestQuestion {
  id          String        @id @default(cuid())
  testId      String
  question    String        @db.VarChar(500)
  imageUrl    String?
  position    Int
  weight      Float         @default(1)
  
  options     TestOption[]
  test        PersonalityTest @relation(fields: [testId], references: [id], onDelete: Cascade)
  
  @@index([testId])
}

model TestOption {
  id              String          @id @default(cuid())
  questionId      String
  text            String          @db.VarChar(200)
  imageUrl        String?
  position        Int
  categoryScores  Json
  
  question        TestQuestion    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@index([questionId])
}

model TestSettings {
  id                  String          @id @default(cuid())
  testId              String          @unique
  showProgressBar     Boolean         @default(true)
  showQuestionCount   Boolean         @default(true)
  randomizeQuestions  Boolean         @default(false)
  timeLimitMinutes    Int?
  allowRetake         Boolean         @default(true)
  retakeCooldownHours Int             @default(0)
  shareResultsEnabled Boolean         @default(true)
  collectEmail        Boolean         @default(false)
  resultExpiryDays    Int?
  
  test                PersonalityTest @relation(fields: [testId], references: [id], onDelete: Cascade)
}

model TestResult {
  id              String          @id @default(cuid())
  testId          String
  userId          String?
  sessionId       String?
  categoryId      String
  
  categoryScores  Json
  percentages     Json
  completionTime  Int
  
  shareCode       String?         @unique
  shareCount      Int             @default(0)
  
  createdAt       DateTime        @default(now())
  expiresAt       DateTime?
  
  test            PersonalityTest @relation(fields: [testId], references: [id], onDelete: Cascade)
  category        ResultCategory  @relation(fields: [categoryId], references: [id])
  user            User?           @relation(fields: [userId], references: [id])
  
  @@index([testId])
  @@index([userId])
  @@index([categoryId])
  @@index([shareCode])
}

enum ScoringMethod {
  CATEGORY_POINTS
  WEIGHTED_AVERAGE
  HIGHEST_CATEGORY
  PERCENTAGE_MATCH
}
*/
```


## 6.8.5 Question Schema

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// QUESTION TYPE ENUM
// ══════════════════════════════════════════════════════════════════════════════

/*
enum QuestionType {
  // Universal
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  IMAGE_CHOICE
  
  // Survey Only
  TEXT_SHORT
  TEXT_LONG
  RATING_SCALE
  LIKERT
  MATRIX_SINGLE
  MATRIX_MULTIPLE
  RANKING
  SLIDER
  DATE
  TIME
  DATETIME
  FILE_UPLOAD
  NET_PROMOTER
  DROPDOWN
  
  // Test Only
  SCALE
  STATEMENT_AGREE
}
*/

const QUESTION_TYPE_CATEGORIES = {
  UNIVERSAL: [
    "SINGLE_CHOICE",
    "MULTIPLE_CHOICE",
    "IMAGE_CHOICE"
  ],
  SURVEY_ONLY: [
    "TEXT_SHORT",
    "TEXT_LONG",
    "RATING_SCALE",
    "LIKERT",
    "MATRIX_SINGLE",
    "MATRIX_MULTIPLE",
    "RANKING",
    "SLIDER",
    "DATE",
    "TIME",
    "DATETIME",
    "FILE_UPLOAD",
    "NET_PROMOTER",
    "DROPDOWN"
  ],
  TEST_ONLY: [
    "SCALE",
    "STATEMENT_AGREE"
  ]
} as const

function getAvailableQuestionTypes(contentType: "POLL" | "SURVEY" | "TEST"): string[] {
  switch (contentType) {
    case "POLL":
      return ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "IMAGE_CHOICE"]
    case "SURVEY":
      return [...QUESTION_TYPE_CATEGORIES.UNIVERSAL, ...QUESTION_TYPE_CATEGORIES.SURVEY_ONLY]
    case "TEST":
      return [...QUESTION_TYPE_CATEGORIES.UNIVERSAL, ...QUESTION_TYPE_CATEGORIES.TEST_ONLY]
    default:
      return []
  }
}

export { QUESTION_TYPE_CATEGORIES, getAvailableQuestionTypes }
```




# ══════════════════════════════════════════════════════════════════════════════
# 6.9 DRAFT AUTO-SAVE SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 6.9.1 Auto-Save Configuration

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DRAFT AUTO-SAVE SYSTEM (P-045)
// ══════════════════════════════════════════════════════════════════════════════

const DRAFT_AUTO_SAVE_CONFIG = {
  // ────────────────────────────────────────────────────────────────────────────
  // TIMING CONFIGURATION
  // ────────────────────────────────────────────────────────────────────────────
  timing: {
    // Debounce delay before saving after user stops typing
    debounceMs: 2000,  // 2 seconds

    // Maximum interval between saves (even if user keeps typing)
    maxIntervalMs: 30000,  // 30 seconds

    // Minimum interval between saves (rate limiting)
    minIntervalMs: 5000,  // 5 seconds

    // Idle timeout before forcing save
    idleTimeoutMs: 60000  // 1 minute
  },

  // ────────────────────────────────────────────────────────────────────────────
  // STORAGE CONFIGURATION
  // ────────────────────────────────────────────────────────────────────────────
  storage: {
    // Primary: Server-side storage (source of truth)
    primary: "SERVER",

    // Secondary: localStorage backup (offline resilience)
    secondary: "LOCAL_STORAGE",

    // localStorage key pattern
    localStorageKeyPattern: "voxpoll:draft:{contentType}:{contentId}",

    // Maximum localStorage usage per draft
    maxLocalStorageSizeKB: 512,

    // Draft expiration (server-side)
    serverExpirationDays: 30,

    // Draft expiration (localStorage)
    localExpirationDays: 7
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CONFLICT RESOLUTION
  // ────────────────────────────────────────────────────────────────────────────
  conflictResolution: {
    // When server and local drafts differ
    strategy: "COMPARE_TIMESTAMPS",

    // If timestamps are equal (within tolerance)
    timestampToleranceMs: 1000,

    // User prompt for conflicts
    promptOnConflict: true,

    // Auto-merge strategy for non-conflicting fields
    autoMergeFields: ["lastEditedAt", "version"]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CONTENT TYPE SPECIFIC LIMITS
  // ────────────────────────────────────────────────────────────────────────────
  limits: {
    POLL: {
      maxDrafts: 10,      // Free users
      maxDraftsPremium: 50
    },
    SURVEY: {
      maxDrafts: 20,      // Organization quota
      maxDraftsEnterprise: 100
    },
    TEST: {
      maxDrafts: 10,
      maxDraftsPremium: 50
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTO-SAVE STATE MACHINE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Draft Auto-Save State Machine
 *
 *  ┌─────────────┐
 *  │    IDLE     │ ←──────────────────────────────────────┐
 *  └──────┬──────┘                                        │
 *         │ user_input                                    │
 *         ▼                                               │
 *  ┌─────────────┐                                        │
 *  │  DEBOUNCING │ ←─── user_input (reset timer)         │
 *  └──────┬──────┘                                        │
 *         │ debounce_expired OR max_interval              │
 *         ▼                                               │
 *  ┌─────────────┐                                        │
 *  │   SAVING    │                                        │
 *  └──────┬──────┘                                        │
 *         │                                               │
 *    ┌────┴────┐                                          │
 *    │         │                                          │
 *    ▼         ▼                                          │
 * success   failure                                       │
 *    │         │                                          │
 *    │    ┌────┴────┐                                     │
 *    │    │ RETRYING │ ──── max_retries ───► ERROR ──────►│
 *    │    └────┬────┘                          │          │
 *    │         │ retry_success                 │          │
 *    │         │                               │          │
 *    └─────────┴───────────────────────────────┴──────────┘
 */

type DraftAutoSaveState = "IDLE" | "DEBOUNCING" | "SAVING" | "RETRYING" | "ERROR"

interface DraftAutoSaveContext {
  state: DraftAutoSaveState
  lastSavedAt: Date | null
  lastEditedAt: Date
  pendingChanges: boolean
  retryCount: number
  errorMessage: string | null
  conflictDetected: boolean
}

const DRAFT_STATE_TRANSITIONS = {
  IDLE: {
    USER_INPUT: "DEBOUNCING"
  },
  DEBOUNCING: {
    USER_INPUT: "DEBOUNCING",  // Reset debounce timer
    DEBOUNCE_EXPIRED: "SAVING",
    MAX_INTERVAL_REACHED: "SAVING"
  },
  SAVING: {
    SAVE_SUCCESS: "IDLE",
    SAVE_FAILURE: "RETRYING",
    CONFLICT_DETECTED: "IDLE"  // Show conflict UI
  },
  RETRYING: {
    RETRY_SUCCESS: "IDLE",
    RETRY_FAILURE: "RETRYING",
    MAX_RETRIES: "ERROR"
  },
  ERROR: {
    USER_RETRY: "SAVING",
    USER_DISMISS: "IDLE"
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTO-SAVE IMPLEMENTATION
// ══════════════════════════════════════════════════════════════════════════════

interface DraftData {
  contentType: "POLL" | "SURVEY" | "TEST"
  contentId: string | null  // null for new drafts
  version: number
  data: Record<string, unknown>
  lastEditedAt: Date
  createdAt: Date
}

class DraftAutoSaveManager {
  private state: DraftAutoSaveContext
  private debounceTimer: NodeJS.Timeout | null = null
  private maxIntervalTimer: NodeJS.Timeout | null = null
  private currentDraft: DraftData | null = null

  constructor() {
    this.state = {
      state: "IDLE",
      lastSavedAt: null,
      lastEditedAt: new Date(),
      pendingChanges: false,
      retryCount: 0,
      errorMessage: null,
      conflictDetected: false
    }
  }

  // Called on every user input
  onUserInput(data: Partial<DraftData["data"]>): void {
    this.state.lastEditedAt = new Date()
    this.state.pendingChanges = true

    // Update current draft
    if (this.currentDraft) {
      this.currentDraft.data = { ...this.currentDraft.data, ...data }
      this.currentDraft.lastEditedAt = new Date()
      this.currentDraft.version++
    }

    // Reset debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // Start debounce timer
    this.debounceTimer = setTimeout(() => {
      this.triggerSave()
    }, DRAFT_AUTO_SAVE_CONFIG.timing.debounceMs)

    // Start max interval timer if not running
    if (!this.maxIntervalTimer) {
      this.maxIntervalTimer = setTimeout(() => {
        this.triggerSave()
      }, DRAFT_AUTO_SAVE_CONFIG.timing.maxIntervalMs)
    }

    // Save to localStorage immediately (backup)
    this.saveToLocalStorage()
  }

  private async triggerSave(): Promise<void> {
    if (!this.state.pendingChanges || !this.currentDraft) return

    // Clear timers
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    if (this.maxIntervalTimer) clearTimeout(this.maxIntervalTimer)
    this.debounceTimer = null
    this.maxIntervalTimer = null

    this.state.state = "SAVING"

    try {
      await this.saveToServer()
      this.state.state = "IDLE"
      this.state.lastSavedAt = new Date()
      this.state.pendingChanges = false
      this.state.retryCount = 0
      this.state.errorMessage = null
    } catch (error) {
      await this.handleSaveError(error as Error)
    }
  }

  private async saveToServer(): Promise<void> {
    const response = await fetch("/api/drafts", {
      method: this.currentDraft?.contentId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.currentDraft)
    })

    if (!response.ok) {
      if (response.status === 409) {
        // Conflict detected
        this.state.conflictDetected = true
        throw new Error("CONFLICT")
      }
      throw new Error(`Save failed: ${response.status}`)
    }

    const result = await response.json()
    if (this.currentDraft && !this.currentDraft.contentId) {
      this.currentDraft.contentId = result.id
    }
  }

  private saveToLocalStorage(): void {
    if (!this.currentDraft) return

    const key = DRAFT_AUTO_SAVE_CONFIG.storage.localStorageKeyPattern
      .replace("{contentType}", this.currentDraft.contentType)
      .replace("{contentId}", this.currentDraft.contentId || "new")

    const dataToStore = {
      ...this.currentDraft,
      savedAt: new Date().toISOString()
    }

    // Check size limit
    const dataString = JSON.stringify(dataToStore)
    if (dataString.length > DRAFT_AUTO_SAVE_CONFIG.storage.maxLocalStorageSizeKB * 1024) {
      console.warn("Draft too large for localStorage backup")
      return
    }

    try {
      localStorage.setItem(key, dataString)
    } catch (e) {
      console.warn("localStorage save failed:", e)
    }
  }

  private async handleSaveError(error: Error): Promise<void> {
    if (error.message === "CONFLICT") {
      // Show conflict resolution UI
      this.state.state = "IDLE"
      return
    }

    this.state.retryCount++
    if (this.state.retryCount >= 3) {
      this.state.state = "ERROR"
      this.state.errorMessage = "Auto-save failed. Your changes are saved locally."
    } else {
      this.state.state = "RETRYING"
      // Exponential backoff
      const delay = Math.pow(2, this.state.retryCount) * 1000
      setTimeout(() => this.triggerSave(), delay)
    }
  }

  // Restore from localStorage on page load
  async restoreFromLocalStorage(): Promise<DraftData | null> {
    // Implementation for draft restoration
    return null
  }

  // Get current save status for UI
  getSaveStatus(): { status: string; lastSaved: Date | null; error: string | null } {
    return {
      status: this.state.state,
      lastSaved: this.state.lastSavedAt,
      error: this.state.errorMessage
    }
  }
}

export { DraftAutoSaveManager, DRAFT_AUTO_SAVE_CONFIG, DRAFT_STATE_TRANSITIONS }
export type { DraftData, DraftAutoSaveState, DraftAutoSaveContext }
```

## 6.9.2 Draft Auto-Save UI Indicators

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// AUTO-SAVE UI COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const DRAFT_SAVE_STATUS_UI = {
  IDLE: {
    icon: "check",
    text: "Saved",
    color: "green",
    showTimestamp: true
  },
  DEBOUNCING: {
    icon: "edit",
    text: "Editing...",
    color: "gray",
    showTimestamp: false
  },
  SAVING: {
    icon: "spinner",
    text: "Saving...",
    color: "blue",
    showTimestamp: false
  },
  RETRYING: {
    icon: "spinner",
    text: "Retrying...",
    color: "orange",
    showTimestamp: false
  },
  ERROR: {
    icon: "warning",
    text: "Save failed",
    color: "red",
    showTimestamp: true,
    action: "Retry"
  }
}

/**
 * Draft Save Status Bar UI
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │ IDLE:      ✓ Saved • 2 minutes ago                      │
 * │ DEBOUNCING: ✏️ Editing...                                │
 * │ SAVING:    ⟳ Saving...                                  │
 * │ ERROR:     ⚠️ Save failed • [Retry] • Saved locally     │
 * └──────────────────────────────────────────────────────────┘
 */

const DRAFT_CONFLICT_RESOLUTION_UI = {
  title: "Draft Conflict Detected",
  message: "This draft was modified on another device. Choose which version to keep:",
  options: [
    {
      id: "LOCAL",
      label: "Keep my version",
      description: "Use the version you're currently editing"
    },
    {
      id: "SERVER",
      label: "Use server version",
      description: "Discard local changes and use the saved version"
    },
    {
      id: "MERGE",
      label: "Review differences",
      description: "Compare both versions and choose what to keep"
    }
  ]
}
```

## 6.9.3 Draft Restoration Flow

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// DRAFT RESTORATION ON PAGE LOAD
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Draft Restoration Flow
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │                         PAGE LOAD                                           │
 * └────────────────────────────────┬────────────────────────────────────────────┘
 *                                  │
 *                                  ▼
 *                    ┌─────────────────────────┐
 *                    │ Check localStorage      │
 *                    │ for local draft         │
 *                    └────────────┬────────────┘
 *                                 │
 *                    ┌────────────┴────────────┐
 *                    │                         │
 *                    ▼                         ▼
 *             Local found              No local draft
 *                    │                         │
 *                    ▼                         ▼
 *           ┌───────────────┐         ┌───────────────┐
 *           │ Fetch server  │         │ Fetch server  │
 *           │ draft         │         │ draft         │
 *           └───────┬───────┘         └───────┬───────┘
 *                   │                         │
 *          ┌───────┴───────┐                 │
 *          ▼               ▼                 ▼
 *     Server found    No server         Use server
 *          │               │            or start fresh
 *          ▼               ▼
 *   ┌─────────────┐  ┌─────────────┐
 *   │ Compare     │  │ Use local   │
 *   │ timestamps  │  │ draft       │
 *   └──────┬──────┘  └─────────────┘
 *          │
 *     ┌────┴────┐
 *     ▼         ▼
 *  Same      Different
 *     │         │
 *     ▼         ▼
 *  Use any   Show conflict
 *             resolution UI
 */

const DRAFT_RESTORATION_CONFIG = {
  // Check for unsaved local drafts on page load
  checkOnLoad: true,

  // Show notification if local draft found
  notifyOnRestore: true,

  // Auto-restore if server draft is older
  autoRestoreIfNewer: true,

  // Prompt timeout (ms) before auto-selecting
  promptTimeoutMs: 30000,

  // Default selection if user doesn't respond
  defaultSelection: "LOCAL"  // Keep local changes by default
}
```


# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 06
# ══════════════════════════════════════════════════════════════════════════════
# Status: COMPLETE
# Last Updated: January 2026
# Next Section: SECTION 07 - RESPONSE & DATA COLLECTION
# ══════════════════════════════════════════════════════════════════════════════