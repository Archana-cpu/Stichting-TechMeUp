# ═══════════════════════════════════════════════════════════════════════════════
# FEATURES - Personality Tests
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-006.md (section 6.4)
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# TEST DEFINITION & PURPOSE
# ═══════════════════════════════════════════════════════════════════════════════

Personality Tests are entertaining, shareable content that provides users with
personalized results and badges. They are designed for viral growth.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       PERSONALITY TEST SYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PURPOSE:                                                                       │
│  ─────────                                                                      │
│  - Entertainment and engagement                                                 │
│  - Viral growth through shareable results                                       │
│  - User identity expression via profile badges                                  │
│  - Lead generation for brands                                                   │
│                                                                                 │
│  KEY CHARACTERISTICS:                                                           │
│  ────────────────────                                                           │
│  - 5-50 scored questions                                                        │
│  - 2-10 possible result categories                                              │
│  - Visual shareable result cards                                                │
│  - Badges displayed on user profiles                                            │
│  - Unlimited duration (evergreen content)                                       │
│                                                                                 │
│  CREATOR LIMITS:                                                                │
│  ───────────────                                                                │
│  - Free: 3 tests/week                                                           │
│  - Plus: 10 tests/week                                                          │
│  - Premium: Unlimited                                                           │
│                                                                                 │
│  RESULT TYPES:                                                                  │
│  ─────────────                                                                  │
│  - CATEGORY: "Which character are you?" (1 of N results)                        │
│  - SPECTRUM: "Political compass" (X-Y positioning)                              │
│  - SCORE: "IQ test" (numeric score)                                             │
│  - PROFILE: "MBTI type" (multi-dimensional)                                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# TEST DATA MODEL
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface PersonalityTest {
  id: string
  creatorId: string
  organizationId: string | null

  title: string
  description: string
  coverImageUrl: string

  questions: TestQuestion[]
  results: TestResult[]
  resultType: ResultType

  settings: TestSettings

  status: ContentStatus
  visibility: VisibilityLevel

  stats: {
    totalCompletions: number
    averageTimeSeconds: number
    shareCount: number
  }

  createdAt: Date
  publishedAt: Date | null
}

type ResultType =
  | "CATEGORY"     // Single category result (Which X are you?)
  | "SPECTRUM"     // 2D positioning (Political compass)
  | "SCORE"        // Numeric score (IQ, percentage)
  | "PROFILE"      // Multi-dimensional (MBTI, Big Five)

interface TestQuestion {
  id: string
  testId: string
  question: string
  imageUrl: string | null
  position: number
  options: TestOption[]
}

interface TestOption {
  id: string
  questionId: string
  text: string
  imageUrl: string | null
  position: number
  scores: OptionScore[]
}

interface OptionScore {
  resultId: string
  score: number
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# TEST RESULT TYPES
# ═══════════════════════════════════════════════════════════════════════════════

## Category Result (Most Common)

```typescript
interface CategoryResult {
  id: string
  testId: string
  title: string                    // "Gryffindor"
  description: string              // "Brave and daring..."
  imageUrl: string                 // Result card image
  minScore: number                 // Minimum score to get this result
  maxScore: number | null          // Maximum score (null = no upper limit)
  position: number                 // Display order
}
```

Example: "Which Hogwarts House Are You?"
- Gryffindor: Score 25-35
- Hufflepuff: Score 15-24
- Ravenclaw: Score 5-14
- Slytherin: Score 0-4


## Spectrum Result (2D Positioning)

```typescript
interface SpectrumResult {
  id: string
  testId: string

  xAxis: {
    label: string                 // "Economic"
    leftLabel: string             // "Left"
    rightLabel: string            // "Right"
  }

  yAxis: {
    label: string                 // "Social"
    topLabel: string              // "Libertarian"
    bottomLabel: string           // "Authoritarian"
  }

  quadrants: {
    topLeft: { title: string, description: string, imageUrl: string }
    topRight: { title: string, description: string, imageUrl: string }
    bottomLeft: { title: string, description: string, imageUrl: string }
    bottomRight: { title: string, description: string, imageUrl: string }
  }
}
```

Example: "Political Compass Test"
- X-axis: Economic (Left <-> Right)
- Y-axis: Social (Libertarian <-> Authoritarian)


## Score Result (Numeric)

```typescript
interface ScoreResult {
  id: string
  testId: string

  minScore: number
  maxScore: number
  scoreLabel: string              // "IQ Score", "Compatibility %"

  ranges: {
    min: number
    max: number
    title: string
    description: string
    imageUrl: string
  }[]
}
```

Example: "IQ Test"
- 130+: Genius
- 115-129: Above Average
- 85-114: Average
- Below 85: Below Average


## Profile Result (Multi-dimensional)

```typescript
interface ProfileResult {
  id: string
  testId: string

  dimensions: {
    id: string
    label: string                 // "Introvert/Extrovert"
    leftOption: string            // "I"
    rightOption: string           // "E"
  }[]

  profiles: {
    code: string                  // "INTJ"
    title: string                 // "The Architect"
    description: string
    imageUrl: string
  }[]
}
```

Example: "MBTI Personality Test"
- Dimensions: I/E, N/S, T/F, J/P
- Profiles: INTJ, ENTP, etc. (16 combinations)



# ═══════════════════════════════════════════════════════════════════════════════
# TEST SETTINGS
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
interface TestSettings {
  showProgressBar: boolean
  showQuestionNumbers: boolean
  randomizeQuestions: boolean
  randomizeOptions: boolean
  allowRetake: boolean
  retakeCooldownHours: number | null
  showResultComparison: boolean
  showAggregateStats: boolean
  enableBadge: boolean
  badgeDisplayName: string | null
  shareCardTemplate: ShareCardTemplate
}

type ShareCardTemplate =
  | "MINIMAL"          // Just result title
  | "DETAILED"         // Result + description
  | "VISUAL"           // Full image card
  | "COMPARISON"       // Shows user vs average
```



# ═══════════════════════════════════════════════════════════════════════════════
# TEST RESULT SCREEN
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       TEST RESULT SCREEN                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │     [Animated reveal of result image]                                   │   │
│  │                                                                         │   │
│  │              Your Result:                                               │   │
│  │                                                                         │   │
│  │           ╔═══════════════════════╗                                     │   │
│  │           ║     GRYFFINDOR        ║                                     │   │
│  │           ║  [Lion crest image]   ║                                     │   │
│  │           ╚═══════════════════════╝                                     │   │
│  │                                                                         │   │
│  │     "Brave and daring, you belong in Gryffindor                        │   │
│  │      where courage and chivalry rule."                                  │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  HOW YOU COMPARE:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Gryffindor ████████████████████████████░░░░░░░  38%  <-- You!          │   │
│  │  Ravenclaw  ████████████████████░░░░░░░░░░░░░░░  28%                    │   │
│  │  Hufflepuff █████████████░░░░░░░░░░░░░░░░░░░░░░  19%                    │   │
│  │  Slytherin  ██████████░░░░░░░░░░░░░░░░░░░░░░░░░  15%                    │   │
│  │                                                                         │   │
│  │  Based on 12,453 test-takers                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  [Badge Icon] BADGE EARNED!                                                    │
│  "Gryffindor" has been added to your profile                                   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  [Share to Twitter] [Share to Instagram] [Copy Link] [Download Card]           │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  COMMENTS (234 comments)                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  @hermione_fan: "I got Ravenclaw! Anyone else?"                         │   │
│  │  @potter_head: "Gryffindor gang! Let's go!"                             │   │
│  │  @slytherin_pride: "Slytherin here, not surprised lol"                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# TEST BADGES
# ═══════════════════════════════════════════════════════════════════════════════

[DECISION P-017] Test results create profile BADGES displayed on user profile.

```typescript
interface TestBadge {
  id: string
  userId: string
  testId: string
  resultId: string
  resultTitle: string           // "Gryffindor", "INTJ"
  testTitle: string             // "Hogwarts House Test"
  imageUrl: string
  earnedAt: Date
  isDisplayed: boolean          // User can hide/show
  displayPosition: number | null
}
```

## Badge Display on Profile

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         USER PROFILE                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [Avatar]  @johndoe                                                             │
│            John Doe                                                             │
│            "Tech enthusiast and coffee addict"                                  │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  BADGES:                                                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │[Lion]   │ │[INTJ]   │ │[Politics│ │[Coffee] │ │[Dog]    │                   │
│  │Gryff-   │ │The      │ │compass] │ │Addict   │ │Person   │                   │
│  │indor    │ │Architect│ │Lib-Left │ │         │ │         │                   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘                   │
│                                                                                 │
│  [+ See all 12 badges]                                                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Badge Rules

| Rule | Description |
|------|-------------|
| Max displayed | 10 badges shown on profile |
| User control | User can choose which to display |
| Retake handling | New badge replaces old (same test) |
| Privacy | Can hide all badges if desired |
| Fun badges | Can include non-serious/joke badges |



# ═══════════════════════════════════════════════════════════════════════════════
# SHAREABLE RESULT CARDS
# ═══════════════════════════════════════════════════════════════════════════════

Result cards are pre-generated images optimized for social media sharing.

```typescript
interface ShareCard {
  testId: string
  resultId: string
  userId: string | null

  imageUrl: string              // Pre-generated image URL
  dimensions: {
    width: number               // 1200px default
    height: number              // 630px for Twitter/Facebook, 1080x1920 for Stories
  }

  metadata: {
    ogTitle: string
    ogDescription: string
    ogImage: string
    twitterCard: "summary_large_image"
  }

  shareUrls: {
    twitter: string             // Pre-populated tweet URL
    facebook: string
    whatsapp: string
    telegram: string
    copyLink: string
  }
}
```


## Card Generation Templates

| Template | Description | Best For |
|----------|-------------|----------|
| MINIMAL | Result title only, clean design | Professional tests |
| DETAILED | Title + description + stats | Educational tests |
| VISUAL | Large result image, minimal text | Fun/viral tests |
| COMPARISON | User result vs population | Competitive tests |
| STORY | 1080x1920 for Instagram Stories | Mobile-first tests |
