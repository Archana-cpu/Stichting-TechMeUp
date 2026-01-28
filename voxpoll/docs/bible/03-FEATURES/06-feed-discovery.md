# ═══════════════════════════════════════════════════════════════════════════════
# FEATURES - Feed & Discovery System
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-011.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# FEED TYPES OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FEED SYSTEM ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        HOME FEED                                        │   │
│  │  Personalized content based on user behavior & preferences              │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  Sources:                                                               │   │
│  │  - Following users' content (40% weight)                                │   │
│  │  - Interest-matched content (35% weight)                                │   │
│  │  - Trending content (15% weight)                                        │   │
│  │  - Discovery/exploration (10% weight)                                   │   │
│  │                                                                         │   │
│  │  Algorithms: Hot Score + Personalization + Diversity Injection          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    DISCOVER FEED (Kesfet)                               │   │
│  │  Sponsored corporate surveys + trending content                         │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  [DECISION] Discover feed PRIMARILY shows sponsored corporate           │   │
│  │  surveys from B2B SaaS customers who pay for mainstream visibility      │   │
│  │                                                                         │   │
│  │  Sources:                                                               │   │
│  │  - SPONSORED SURVEYS (40% weight) - Paid B2B placement                  │   │
│  │  - Trending polls/tests (30% weight)                                    │   │
│  │  - Category-based discovery (20% weight)                                │   │
│  │  - Geographic relevance (10% weight)                                    │   │
│  │                                                                         │   │
│  │  Algorithms: Sponsored Boost + Hot Score + Eligibility Match            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      FOLLOWING FEED                                     │   │
│  │  Chronological content from followed users                              │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  Sources: Content from followed users only                              │   │
│  │  Algorithms: Reverse chronological (newest first)                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      CATEGORY FEED                                      │   │
│  │  Content filtered by specific category/topic                            │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  Sources: Content tagged with selected category                         │   │
│  │  Algorithms: Hot Score within category                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      SEARCH RESULTS                                     │   │
│  │  Query-matched content with relevance ranking                           │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  Sources: Full-text search on titles, descriptions, questions           │   │
│  │  Algorithms: Text relevance + Hot Score boost                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# FEED DATA FLOW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          FEED DATA FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  USER REQUEST                                                                   │
│       │                                                                         │
│       v                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐          │
│  │                    FEED ORCHESTRATOR                             │          │
│  │  - Parse request (feed type, filters, cursor)                    │          │
│  │  - Load user context (preferences, history, blocks)              │          │
│  │  - Route to appropriate feed generator                           │          │
│  └───────────────────────────┬──────────────────────────────────────┘          │
│                              │                                                  │
│              ┌───────────────┼───────────────┐                                  │
│              v               v               v                                  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                      │
│  │  CANDIDATE     │ │  CANDIDATE     │ │  CANDIDATE     │                      │
│  │  SOURCE 1      │ │  SOURCE 2      │ │  SOURCE N      │                      │
│  │  (Following)   │ │  (Interests)   │ │  (Trending)    │                      │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘                      │
│          │                  │                  │                                │
│          └──────────────────┼──────────────────┘                                │
│                             v                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐          │
│  │                    CANDIDATE POOL                                │          │
│  │  - Merge candidates from all sources                             │          │
│  │  - Remove duplicates                                             │          │
│  │  - Apply hard filters (blocks, seen, expired)                    │          │
│  └───────────────────────────┬──────────────────────────────────────┘          │
│                              │                                                  │
│                              v                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐          │
│  │                    RANKING ENGINE                                │          │
│  │  - Calculate composite score for each candidate                  │          │
│  │  - Apply personalization adjustments                             │          │
│  │  - Sort by final score                                           │          │
│  └───────────────────────────┬──────────────────────────────────────┘          │
│                              │                                                  │
│                              v                                                  │
│  ┌──────────────────────────────────────────────────────────────────┐          │
│  │                    DIVERSITY INJECTION                           │          │
│  │  - Ensure category diversity                                     │          │
│  │  - Prevent creator dominance                                     │          │
│  │  - Mix content types (Poll/Survey/Test)                          │          │
│  └───────────────────────────┬──────────────────────────────────────┘          │
│                              │                                                  │
│                              v                                                  │
│                        FEED RESPONSE                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# HOT SCORE ALGORITHM
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const HOT_SCORE_CONFIG = {
  HALF_LIFE_HOURS: 12,
  DECAY_CONSTANT: Math.log(2) / 12,

  PARTICIPATION_WEIGHT: 1.0,
  COMPLETION_WEIGHT: 0.8,
  SHARE_WEIGHT: 0.5,
  DISCUSSION_WEIGHT: 0.3,

  RELIABILITY_BONUS_THRESHOLD: 70,
  RELIABILITY_BONUS_MULTIPLIER: 1.1,

  VERIFIED_CREATOR_BOOST: 1.05,
  ORG_CONTENT_BOOST: 1.02,

  MIN_PARTICIPANTS_FOR_BOOST: 10,

  RECENCY_BOOST_HOURS: 2,
  RECENCY_BOOST_MULTIPLIER: 1.3
} as const

function calculateHotScore(
  content: {
    createdAt: Date
    participantCount: number
    completionCount: number
    shareCount: number
    commentCount: number
    reliabilityScore: number
    creatorVerified: boolean
    organizationId: string | null
  },
  nowMs: number = Date.now()
): number {
  const ageHours = (nowMs - content.createdAt.getTime()) / (1000 * 60 * 60)

  // Time decay factor
  const decayFactor = Math.exp(-HOT_SCORE_CONFIG.DECAY_CONSTANT * ageHours)

  // Engagement score
  const engagementScore =
    content.participantCount * HOT_SCORE_CONFIG.PARTICIPATION_WEIGHT +
    content.completionCount * HOT_SCORE_CONFIG.COMPLETION_WEIGHT +
    content.shareCount * HOT_SCORE_CONFIG.SHARE_WEIGHT +
    content.commentCount * HOT_SCORE_CONFIG.DISCUSSION_WEIGHT

  // Base hot score
  let hotScore = Math.log10(Math.max(engagementScore, 1)) * decayFactor

  // Reliability bonus
  if (content.reliabilityScore >= HOT_SCORE_CONFIG.RELIABILITY_BONUS_THRESHOLD) {
    hotScore *= HOT_SCORE_CONFIG.RELIABILITY_BONUS_MULTIPLIER
  }

  // Verified creator boost
  if (content.creatorVerified) {
    hotScore *= HOT_SCORE_CONFIG.VERIFIED_CREATOR_BOOST
  }

  // Organization content boost
  if (content.organizationId) {
    hotScore *= HOT_SCORE_CONFIG.ORG_CONTENT_BOOST
  }

  // Recency boost for very new content
  if (ageHours < HOT_SCORE_CONFIG.RECENCY_BOOST_HOURS) {
    hotScore *= HOT_SCORE_CONFIG.RECENCY_BOOST_MULTIPLIER
  }

  return hotScore
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# DISCOVER FEED - SPONSORED CONTENT
# ═══════════════════════════════════════════════════════════════════════════════

The Discover feed (Kesfet) is where B2B SaaS customers pay to show their surveys
to the mainstream user base. This is a key monetization feature.

```typescript
interface SponsoredCampaign {
  id: string
  organizationId: string
  surveyId: string

  budget: {
    totalBudget: number           // Total campaign budget in cents
    dailyLimit: number | null     // Optional daily spend limit
    spent: number                 // Amount spent so far
    costPerImpression: number     // CPM (cost per 1000 impressions)
    costPerParticipation: number  // CPA (cost per completed survey)
  }

  targeting: {
    ageRange: { min: number, max: number } | null
    genders: string[] | null
    countries: string[] | null
    regions: string[] | null
    educationLevels: string[] | null
    interests: string[] | null
  }

  schedule: {
    startDate: Date
    endDate: Date | null
    activeHours: { start: number, end: number }[] | null
    activeDays: number[] | null
  }

  metrics: {
    impressions: number
    clicks: number
    participations: number
    completions: number
    ctr: number                   // Click-through rate
    conversionRate: number        // Participation/impressions
  }

  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXHAUSTED"
}
```


## Discover Feed UI

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DISCOVER FEED UI                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [Search...]                                                                    │
│                                                                                 │
│  [All] [Tech] [Entertainment] [Politics] [Sports] [Business] [More]            │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Company Logo]  TechCorp Research              [Sponsored]             │   │
│  │                                                                         │   │
│  │  Help us understand developer preferences in 2025                       │   │
│  │                                                                         │   │
│  │  Target: Software developers, 25-45                                     │   │
│  │  5-10 min  -  50 XP reward                                              │   │
│  │                                                                         │   │
│  │  [Take Survey]                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Avatar] @tech_guru                            [Trending]              │   │
│  │                                                                         │   │
│  │  Which AI model will dominate 2025?                                     │   │
│  │                                                                         │   │
│  │  GPT-5 (45%)                                                            │   │
│  │  Claude (30%)                                                           │   │
│  │  Gemini (15%)                                                           │   │
│  │  Other (10%)                                                            │   │
│  │                                                                         │   │
│  │  [Vote] [Share] [COMMENTS 234]                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# CONTENT CATEGORIES
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
const CONTENT_CATEGORIES = [
  { id: "tech", name: "Technology", icon: "Cpu" },
  { id: "politics", name: "Politics", icon: "Landmark" },
  { id: "entertainment", name: "Entertainment", icon: "Film" },
  { id: "sports", name: "Sports", icon: "Trophy" },
  { id: "business", name: "Business", icon: "Briefcase" },
  { id: "science", name: "Science", icon: "Atom" },
  { id: "health", name: "Health", icon: "Heart" },
  { id: "education", name: "Education", icon: "GraduationCap" },
  { id: "lifestyle", name: "Lifestyle", icon: "Leaf" },
  { id: "gaming", name: "Gaming", icon: "Gamepad2" },
  { id: "music", name: "Music", icon: "Music" },
  { id: "food", name: "Food & Drink", icon: "UtensilsCrossed" },
  { id: "travel", name: "Travel", icon: "Plane" },
  { id: "fashion", name: "Fashion", icon: "Shirt" },
  { id: "news", name: "News", icon: "Newspaper" },
  { id: "other", name: "Other", icon: "MoreHorizontal" }
] as const
```



# ═══════════════════════════════════════════════════════════════════════════════
# PERSONALIZATION SIGNALS
# ═══════════════════════════════════════════════════════════════════════════════

| Signal | Weight | Description |
|--------|--------|-------------|
| Category interests | 0.25 | Categories user frequently engages with |
| Following activity | 0.20 | Content from followed users |
| Participation history | 0.15 | Similar content to past participations |
| Time-of-day | 0.10 | Content popular at similar times |
| Location relevance | 0.10 | Geographic relevance |
| Creator engagement | 0.10 | Creators user has interacted with |
| Fresh content | 0.10 | Diversity of new content |


## Diversity Rules

| Rule | Description |
|------|-------------|
| Max same creator | Max 2 items from same creator per page |
| Category diversity | At least 3 different categories per page |
| Content type mix | Mix of polls/tests/surveys (if available) |
| Age diversity | Mix of new and trending content |
| Sponsored limit | Max 2 sponsored items per page |
