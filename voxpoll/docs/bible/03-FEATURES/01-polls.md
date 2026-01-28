# ═══════════════════════════════════════════════════════════════════════════════
# FEATURES - Poll System
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-006.md (sections 6.1, 6.2)
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# CONTENT TYPE OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

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
│  - 1 question         - Multiple pages     - Scored questions                  │
│  - Instant results    - Complex logic      - Category results                  │
│  - High engagement    - Analytics focus    - Visual cards                      │
│  - Social sharing     - Export ready       - Viral potential                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Feature Comparison Matrix

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


## When to Use Each Content Type

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



# ═══════════════════════════════════════════════════════════════════════════════
# POLL TYPES: QUICK, EXTENDED, LIVE
# ═══════════════════════════════════════════════════════════════════════════════

Polls are single-question content designed for quick engagement and instant feedback.

```typescript
type PollType = "QUICK" | "EXTENDED" | "LIVE"

const POLL_TYPE_DEFINITIONS = {
  // QUICK POLL - Lightweight, instant engagement
  QUICK: {
    name: "Quick Poll",
    description: "Simple, fast voting for casual engagement",
    tier: "ALL",                          // Available to Free, Plus, Premium
    characteristics: {
      maxOptions: { free: 4, premium: 4 }, // Quick Polls always 4 max
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
      fraudCheck: true,
      qualityCheck: false,
      fraudThreshold: 70,
      reliabilityMaxScore: 60              // Capped reliability (no targeting)
    },
    realTime: false,
    analytics: "BASIC"
  },

  // EXTENDED POLL - Feature-rich polling
  EXTENDED: {
    name: "Extended Poll",
    description: "Full-featured poll with targeting and analysis",
    tier: "PREMIUM",                       // Premium individual or any org tier
    characteristics: {
      maxOptions: { free: 4, premium: 10 },
      minOptions: 2,
      mediaSupport: true,                   // Images, GIFs, videos
      descriptionSupport: true,             // Rich description
      preTestSupport: true,                 // Screening questions
      targetAudienceSupport: true,          // Demographic filtering
      duration: {
        min: 60,                            // Min 1 hour
        max: 30 * 24 * 60,                  // Max 30 days
        default: 7 * 24 * 60                // Default 7 days
      }
    },
    scoring: {
      fraudCheck: true,
      qualityCheck: true,
      fraudThreshold: 50,
      qualityThreshold: 40,
      reliabilityMaxScore: 100
    },
    realTime: false,
    analytics: "FULL"
  },

  // LIVE POLL - Real-time interactive polling
  LIVE: {
    name: "Live Poll",
    description: "Real-time interactive polling with instant results",
    tier: "PREMIUM",
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
      fraudCheck: true,
      qualityCheck: false,
      fraudThreshold: 60,
      reliabilityMaxScore: 50               // Lower reliability (short duration)
    },
    realTime: true,
    connection: "WEBSOCKET",
    maxConcurrentParticipants: 10000,
    analytics: "LIVE_DASHBOARD"
  }
} as const
```


## Quick Poll vs Extended Poll Comparison

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
│  - Text-only question                 - Rich media support                      │
│  - 2-4 options                        - 2-10 options                            │
│  - No description                     - Description allowed                     │
│  - Single choice only                 - Multiple choice option                  │
│  - Results always visible             - Can hide results                        │
│  - 24-72 hour default duration        - Custom duration                         │
│  - No comments                        - Optional comments                       │
│  - Feed-optimized display             - Full-page display                       │
│                                                                                 │
│  Best for:                            Best for:                                 │
│  - Daily engagement                   - Feature prioritization                  │
│  - Quick opinions                     - Event planning                          │
│  - Trending topics                    - Decision making                         │
│                                                                                 │
│  Creator limits:                      Creator limits:                           │
│  - Free: 3/day                        - Premium: Unlimited                      │
│  - Premium: Unlimited                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# POLL DATA MODEL
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
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

  preTest: PreTestConfig | null
  liveSettings: LivePollSettings | null
  targetAudience: TargetAudienceConfig | null
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

  // Anonymity Settings
  allowAnonymousParticipation: boolean
  requireVerificationLevel: 0 | 1 | 2 | 3 | 4 | null
  anonymityRejectionMessage: string | null
}
```


## Poll Question Constraints

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



# ═══════════════════════════════════════════════════════════════════════════════
# POLL RESULT DISPLAY
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
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
```


## Result Display UI Example

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
│  [Users] 2,001 votes  -  [Clock] Closes in 2 days  -  [Share]                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# LIVE POLL FEATURE (Premium)
# ═══════════════════════════════════════════════════════════════════════════════

[DECISION P-011] Live Polls enable real-time participation for live audiences (streamers,
speakers, presenters). Participants join via link or code and vote simultaneously.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LIVE POLL SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  USE CASES:                                                                     │
│  - Twitch/YouTube streamers engaging audience in real-time                      │
│  - Conference speakers polling attendees during presentation                    │
│  - Teachers/Professors getting instant classroom feedback                       │
│  - Event organizers gathering live audience opinions                            │
│  - Podcast hosts involving listeners in discussion topics                       │
│                                                                                 │
│  HOW IT WORKS:                                                                  │
│                                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐           │
│  │   Creator       │     │   Join Link     │     │   Participants  │           │
│  │   Creates Live  │────>│   voxpoll.com/  │<────│   Scan QR or    │           │
│  │   Poll          │     │   live/ABC123   │     │   Enter Code    │           │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘           │
│           │                                              │                      │
│           │              ┌─────────────────┐             │                      │
│           └─────────────>│  REAL-TIME      │<────────────┘                      │
│                          │  RESULTS        │                                    │
│                          │  (WebSocket)    │                                    │
│                          └─────────────────┘                                    │
│                                                                                 │
│  LIVE POLL FLOW:                                                                │
│  1. Creator starts live poll -> System generates 6-char join code               │
│  2. Creator shares link/QR code with audience                                   │
│  3. Participants join via voxpoll.com/live/{code} (no login required)          │
│  4. Results update in real-time via WebSocket connection                        │
│  5. Creator can end poll manually or set auto-close timer                       │
│  6. Final results saved and PULSE + COMMENTS opens                              │
│                                                                                 │
│  REQUIREMENTS:                                                                  │
│  - Premium subscription required for creator                                    │
│  - No auth required for participants (anonymous voting)                         │
│  - Maximum 10,000 concurrent participants per live poll                         │
│  - Auto-close after 4 hours if not manually ended                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Live Poll Session Structure

```typescript
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

interface LivePollSettings {
  isLive: boolean
  joinCode: string
  joinUrl: string
  maxParticipants: number | null
  showRealTimeResults: boolean
  autoCloseAfterMinutes: number | null
  hostCanEndManually: boolean
  participantListVisible: boolean
  allowLateJoin: boolean
  allowAnonymousVoting: boolean       // Default: true
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
```


## Live Poll Capacity Handling

[DECISION P-040] Defines behavior when participant count approaches or exceeds limit.

```typescript
const LIVE_POLL_CAPACITY_HANDLING = {
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
      message: "Your poll has reached 80% capacity. Still accepting participants.",
      showUpgradeOption: true,
      dismissable: true
    },
    participantExperience: "NORMAL"
  },

  // At 90% capacity - SOFT CAP (Waiting Room)
  atSoftCapThreshold: {
    hostNotification: {
      type: "URGENT_BANNER",
      message: "90% capacity! New participants will enter waiting room."
    },
    participantExperience: {
      newJoinsAction: "WAITING_ROOM",
      waitingRoom: {
        enabled: true,
        maxWaitingTime: 300,             // 5 minutes max wait
        showPosition: true,
        showEstimatedWait: true,
        allowLeaveQueue: true
      }
    }
  },

  // At 100% capacity - HARD CAP
  atHardCapThreshold: {
    hostNotification: {
      type: "ALERT",
      message: "Maximum capacity reached! 10,000 participants."
    },
    participantExperience: {
      newJoinsAction: "REJECT_WITH_MESSAGE",
      rejectionMessage: {
        title: "Poll Full",
        message: "This poll has reached maximum participants. You can view results.",
        options: [
          { type: "VIEW_RESULTS", label: "View Results" },
          { type: "NOTIFY_WHEN_SPACE", label: "Notify When Space Opens" },
          { type: "LEAVE", label: "Leave" }
        ]
      }
    },
    existingParticipants: "NO_CHANGE"
  },

  // Enterprise tier override
  enterpriseTierLimits: {
    maxParticipantsPerPoll: 100000,     // 100K for Enterprise
    dedicatedInfrastructure: true
  }
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# POLL PRE-TEST SYSTEM (Premium Feature)
# ═══════════════════════════════════════════════════════════════════════════════

[DECISION P-014] Pre-tests for polls require Premium tier. This allows creators to
filter participants based on knowledge, opinions, or qualifications before voting.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        POLL PRE-TEST SYSTEM                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PURPOSE:                                                                       │
│  - Ensure voters have relevant knowledge to participate meaningfully            │
│  - Filter out uninformed or off-topic voters                                    │
│  - Improve data quality for research-oriented polls                             │
│                                                                                 │
│  EXAMPLE USE CASES:                                                             │
│  - "Best programming framework" -> Pre-test: "Have you built a web app?"        │
│  - "Political candidate preference" -> Pre-test: "Are you a registered voter?"  │
│  - "Product feature priority" -> Pre-test: "Do you use our product regularly?"  │
│                                                                                 │
│  PRE-TEST FLOW:                                                                 │
│                                                                                 │
│  User clicks       Pre-test         Pass?      Main Poll      PULSE            │
│  on Poll     ---->  Questions   ---->  Y    ---->   Vote    ----> Results       │
│                        │                                                        │
│                        │                                                        │
│                        v Fail                                                   │
│                   Polite rejection                                              │
│                   "Thank you for your interest..."                              │
│                                                                                 │
│  CONFIGURATION OPTIONS:                                                         │
│  - 1-5 pre-test questions (recommended: 2-3)                                    │
│  - Passing threshold: 50-100% (default: 60%)                                    │
│  - Max attempts: 1-3 (default: 1)                                               │
│  - Show which question failed: Yes/No (default: No)                             │
│  - Custom rejection message: Optional                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Pre-test Configuration

```typescript
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

const PRETEST_FAILURE_POLICY = {
  maxAttempts: 3,
  cooldownMinutes: 60,
  cooldownProgressive: true,        // 60min -> 120min -> 24hr

  showCorrectAnswers: false,        // Never reveal correct answers
  showFailedQuestion: false,        // Don't identify which question failed
  showProgressBar: true,

  postRejection: {
    showAlternativePoll: true,
    trackForAnalytics: true,
    notifyCreator: false,
    allowViewResults: false
  },

  antiGaming: {
    deviceLock: true,
    ipTracking: false,
    timeBetweenQuestions: 2000,     // Min 2 seconds per question
    shuffleQuestions: true,
    shuffleOptions: true
  }
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# TARGET AUDIENCE & PRIVATE LINKS
# ═══════════════════════════════════════════════════════════════════════════════

## Target Audience Configuration (Premium Feature)

```typescript
interface TargetAudienceConfig {
  enabled: boolean
  ageRange: { min: number, max: number } | null
  genders: string[] | null
  countries: string[] | null
  regions: string[] | null
  educationLevels: string[] | null
  employmentStatuses: string[] | null
}
```

## Private Link Sharing Configuration

```typescript
interface PrivateLinkConfig {
  enabled: boolean
  linkCode: string              // Unique private link code
  expiresAt: Date | null
  maxUses: number | null
  currentUses: number
  requireAuth: boolean          // Require login to access
}
```


## Anonymous Voting Restriction

[DECISION P-039] Defines what happens when anonymousVoting is disabled and
unauthenticated user joins.

```typescript
const ANONYMOUS_VOTING_RESTRICTION = {
  onUnauthenticatedUserJoin: {
    action: "SHOW_LOGIN_WALL",

    ui: {
      title: "Login Required",
      message: "You must be logged in to participate in this poll.",
      options: [
        { type: "LOGIN", label: "Login", primary: true },
        { type: "REGISTER", label: "Register", primary: false },
        { type: "CANCEL", label: "Cancel", primary: false }
      ]
    },

    afterLogin: {
      redirectToPoll: true,
      preserveJoinCode: true,
      autoSubmitPendingVote: false
    }
  },

  onSessionExpiredDuringPoll: {
    action: "SOFT_PROMPT",
    message: "Your session has expired. Please log in again to continue.",
    preserveVoteIntent: true,
    autoSubmitAfterReauth: true
  },

  livePollSpecificRules: {
    canJoinWithoutAuth: true,         // Yes, can watch results
    canVoteWithoutAuth: false,        // No, if allowAnonymousVoting: false
    viewerOnlyMode: {
      enabled: true,
      showResults: true,
      showVoteButton: false,
      showLoginPrompt: true,
      participantCountInclude: false
    }
  }
}
```
