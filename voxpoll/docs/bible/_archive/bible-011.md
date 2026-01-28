# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 11                                    █
# █                      FEED & DISCOVERY ALGORITHM                            █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 11.1 FEED SYSTEM ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 11.1.1 Feed Types Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEED SYSTEM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        HOME FEED                                    │   │
│  │  Personalized content based on user behavior & preferences          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Sources:                                                           │   │
│  │  • Following users' content (40% weight)                            │   │
│  │  • Interest-matched content (35% weight)                            │   │
│  │  • Trending content (15% weight)                                    │   │
│  │  • Discovery/exploration (10% weight)                               │   │
│  │                                                                     │   │
│  │  Algorithms: Hot Score + Personalization + Diversity Injection      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DISCOVER FEED (Keşfet)                           │   │
│  │  Sponsored corporate surveys + trending content                     │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  [DECISION] Discover feed PRIMARILY shows sponsored corporate       │   │
│  │  surveys from B2B SaaS customers who pay for mainstream visibility  │   │
│  │                                                                     │   │
│  │  Sources:                                                           │   │
│  │  • SPONSORED SURVEYS (40% weight) - Paid B2B placement             │   │
│  │  • Trending polls/tests (30% weight)                                │   │
│  │  • Category-based discovery (20% weight)                            │   │
│  │  • Geographic relevance (10% weight)                                │   │
│  │                                                                     │   │
│  │  Filtering:                                                         │   │
│  │  • ONLY show content user qualifies for (based on demographics)     │   │
│  │  • Hide content already participated in                             │   │
│  │  • Show "Sponsored" label on paid content                          │   │
│  │                                                                     │   │
│  │  Algorithms: Sponsored Boost + Hot Score + Eligibility Match        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      FOLLOWING FEED                                 │   │
│  │  Chronological content from followed users                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Sources:                                                           │   │
│  │  • Content from followed users only                                 │   │
│  │                                                                     │   │
│  │  Algorithms: Reverse chronological (newest first)                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      CATEGORY FEED                                  │   │
│  │  Content filtered by specific category/topic                        │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Sources:                                                           │   │
│  │  • Content tagged with selected category                            │   │
│  │                                                                     │   │
│  │  Algorithms: Hot Score within category                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SEARCH RESULTS                                 │   │
│  │  Query-matched content with relevance ranking                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Sources:                                                           │   │
│  │  • Full-text search on titles, descriptions, questions              │   │
│  │                                                                     │   │
│  │  Algorithms: Text relevance + Hot Score boost                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 11.1.2 Feed Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FEED DATA FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER REQUEST                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    FEED ORCHESTRATOR                             │      │
│  │  • Parse request (feed type, filters, cursor)                    │      │
│  │  • Load user context (preferences, history, blocks)              │      │
│  │  • Route to appropriate feed generator                           │      │
│  └───────────────────────────┬──────────────────────────────────────┘      │
│                              │                                              │
│              ┌───────────────┼───────────────┐                              │
│              ▼               ▼               ▼                              │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                  │
│  │  CANDIDATE     │ │  CANDIDATE     │ │  CANDIDATE     │                  │
│  │  SOURCE 1      │ │  SOURCE 2      │ │  SOURCE N      │                  │
│  │  (Following)   │ │  (Interests)   │ │  (Trending)    │                  │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘                  │
│          │                  │                  │                            │
│          └──────────────────┼──────────────────┘                            │
│                             ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    CANDIDATE POOL                                │      │
│  │  • Merge candidates from all sources                             │      │
│  │  • Remove duplicates                                             │      │
│  │  • Apply hard filters (blocks, seen, expired)                    │      │
│  └───────────────────────────┬──────────────────────────────────────┘      │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    RANKING ENGINE                                │      │
│  │  • Calculate composite score for each candidate                  │      │
│  │  • Apply personalization adjustments                             │      │
│  │  • Sort by final score                                           │      │
│  └───────────────────────────┬──────────────────────────────────────┘      │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    DIVERSITY INJECTION                           │      │
│  │  • Ensure category diversity                                     │      │
│  │  • Prevent creator dominance                                     │      │
│  │  • Mix content types (Poll/Survey/Test)                          │      │
│  └───────────────────────────┬──────────────────────────────────────┘      │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    RESPONSE BUILDER                              │      │
│  │  • Paginate results                                              │      │
│  │  • Hydrate content data                                          │      │
│  │  • Generate next cursor                                          │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                              │                                              │
│                              ▼                                              │
│                        FEED RESPONSE                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 11.1.3 DISCOVER FEED - SPONSORED CORPORATE CONTENT
# ══════════════════════════════════════════════════════════════════════════════

## Discover Feed Purpose

[DECISION] The Discover feed (Keşfet) is where B2B SaaS customers pay to show
their surveys to the mainstream user base. This is a key monetization feature.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    DISCOVER FEED ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PURPOSE:                                                                       │
│  ─────────                                                                      │
│  • Primary channel for B2B SaaS customers to reach target audiences             │
│  • Shows SPONSORED surveys from paying organizations                            │
│  • Users can filter by category to find relevant content                        │
│  • All content is filtered by user's demographic eligibility                    │
│                                                                                 │
│  HOW IT WORKS:                                                                  │
│  ─────────────                                                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  USER OPENS DISCOVER FEED                                               │   │
│  └───────────────────────────────────┬─────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ELIGIBILITY CHECK                                                      │   │
│  │  • Load user's locked demographics                                      │   │
│  │  • Filter content where user qualifies for target audience              │   │
│  │  • Hide content user already participated in                            │   │
│  └───────────────────────────────────┬─────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  CONTENT MIXING                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  40% SPONSORED SURVEYS (B2B SaaS)                [Sponsored] │   │   │
│  │  │  30% TRENDING POLLS/TESTS (User-generated)                      │   │   │
│  │  │  20% CATEGORY DISCOVERY (Based on user interests)               │   │   │
│  │  │  10% GEOGRAPHIC RELEVANCE (Local content)                       │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────────┬─────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  DISPLAY                                                                │   │
│  │  • Sponsored content clearly labeled with "Sponsored" badge             │   │
│  │  • Category filters available (Tech, Entertainment, Politics, etc.)     │   │
│  │  • Search available to find specific content                            │   │
│  │  • Pull-to-refresh for new content                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Sponsored Survey System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SPONSORED CONTENT SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

interface SponsoredCampaign {
  id: string
  organizationId: string
  surveyId: string

  // Campaign settings
  budget: {
    totalBudget: number           // Total campaign budget in cents
    dailyLimit: number | null     // Optional daily spend limit
    spent: number                 // Amount spent so far
    costPerImpression: number     // CPM (cost per 1000 impressions)
    costPerParticipation: number  // CPA (cost per completed survey)
  }

  // Targeting
  targeting: {
    ageRange: { min: number, max: number } | null
    genders: string[] | null
    countries: string[] | null
    regions: string[] | null
    educationLevels: string[] | null
    interests: string[] | null
  }

  // Schedule
  schedule: {
    startDate: Date
    endDate: Date | null
    activeHours: { start: number, end: number }[] | null  // Hours of day (0-23)
    activeDays: number[] | null                           // Days of week (0-6)
  }

  // Metrics
  metrics: {
    impressions: number
    clicks: number
    participations: number
    completions: number
    ctr: number                   // Click-through rate
    conversionRate: number        // Participation/impressions
  }

  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "EXHAUSTED"
  createdAt: Date
  updatedAt: Date
}

// Calculate eligibility for sponsored content
function isUserEligibleForSponsored(
  user: { demographics: UserDemographics },
  campaign: SponsoredCampaign
): boolean {
  const { targeting } = campaign
  const { demographics } = user

  // Age check
  if (targeting.ageRange) {
    const userAge = calculateAge(demographics.birthYear, demographics.birthMonth)
    if (userAge < targeting.ageRange.min || userAge > targeting.ageRange.max) {
      return false
    }
  }

  // Gender check
  if (targeting.genders && !targeting.genders.includes(demographics.gender)) {
    return false
  }

  // Country check
  if (targeting.countries && !targeting.countries.includes(demographics.country)) {
    return false
  }

  // All checks passed
  return true
}

export type { SponsoredCampaign }
export { isUserEligibleForSponsored }
```

## Discover Feed UI

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DISCOVER FEED UI MOCKUP                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Search...]                                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  [All] [Tech] [Entertainment] [Politics] [Sports] [Business] [More ▼]          │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Company Logo]  TechCorp Research              [Sponsored]             │   │
│  │                                                                         │   │
│  │  Help us understand developer preferences in 2025                       │   │
│  │                                                                         │   │
│  │  🎯 Target: Software developers, 25-45                                  │   │
│  │  ⏱️  5-10 min  •  🎁 50 XP reward                                       │   │
│  │                                                                         │   │
│  │  [Take Survey]                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Avatar] @tech_guru                            [Trending]              │   │
│  │                                                                         │   │
│  │  Which AI model will dominate 2025?                                     │   │
│  │                                                                         │   │
│  │  ████████████████░░░░ GPT-5 (45%)                                       │   │
│  │  ██████████░░░░░░░░░░ Claude (30%)                                      │   │
│  │  █████░░░░░░░░░░░░░░░ Gemini (15%)                                      │   │
│  │  ███░░░░░░░░░░░░░░░░░ Other (10%)                                       │   │
│  │                                                                         │   │
│  │  [Vote] [Share] [Voice 💬 234]                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Company Logo]  MarketResearch Inc.            [Sponsored]             │   │
│  │                                                                         │   │
│  │  Consumer spending habits survey                                        │   │
│  │                                                                         │   │
│  │  🎯 Target: Ages 18-35, Turkey                                         │   │
│  │  ⏱️  3-5 min  •  🎁 30 XP reward                                        │   │
│  │                                                                         │   │
│  │  [Take Survey]                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 11.2 HOT SCORE ALGORITHM
# ══════════════════════════════════════════════════════════════════════════════

## 11.2.1 Hot Score Formula

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

  const engagementScore =
    content.participantCount * HOT_SCORE_CONFIG.PARTICIPATION_WEIGHT +
    content.completionCount * HOT_SCORE_CONFIG.COMPLETION_WEIGHT +
    content.shareCount * HOT_SCORE_CONFIG.SHARE_WEIGHT +
    content.commentCount * HOT_SCORE_CONFIG.DISCUSSION_WEIGHT

  const decayedScore = engagementScore * Math.exp(-HOT_SCORE_CONFIG.DECAY_CONSTANT * ageHours)

  let finalScore = decayedScore

  if (content.reliabilityScore >= HOT_SCORE_CONFIG.RELIABILITY_BONUS_THRESHOLD) {
    finalScore *= HOT_SCORE_CONFIG.RELIABILITY_BONUS_MULTIPLIER
  }

  if (content.creatorVerified) {
    finalScore *= HOT_SCORE_CONFIG.VERIFIED_CREATOR_BOOST
  }

  if (content.organizationId) {
    finalScore *= HOT_SCORE_CONFIG.ORG_CONTENT_BOOST
  }

  if (ageHours <= HOT_SCORE_CONFIG.RECENCY_BOOST_HOURS &&
      content.participantCount >= HOT_SCORE_CONFIG.MIN_PARTICIPANTS_FOR_BOOST) {
    finalScore *= HOT_SCORE_CONFIG.RECENCY_BOOST_MULTIPLIER
  }

  return finalScore
}

export {
  HOT_SCORE_CONFIG,
  calculateHotScore
}
```


## 11.2.2 Hot Score Decay Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      HOT SCORE DECAY OVER TIME                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Score                                                                      │
│    │                                                                        │
│  1.0├─●                                                                     │
│    │  ╲                                                                     │
│    │   ╲                                                                    │
│  0.8├    ╲                                                                  │
│    │      ╲                                                                 │
│    │       ╲                                                                │
│  0.6├        ╲                                                              │
│    │          ╲                                                             │
│    │           ╲                                                            │
│  0.5├────────────●─ Half-life at 12 hours                                   │
│    │              ╲                                                         │
│    │               ╲                                                        │
│  0.4├                ╲                                                      │
│    │                  ╲                                                     │
│    │                   ╲                                                    │
│  0.25├──────────────────────●─ 24 hours                                     │
│    │                         ╲                                              │
│    │                          ╲                                             │
│  0.125├────────────────────────────●─ 36 hours                              │
│    │                                ╲                                       │
│    │                                 ╲_____                                 │
│  0.0├────────────────────────────────────────────────────────────────►     │
│    0h        12h        24h        36h        48h        60h    Time       │
│                                                                             │
│  Formula: score(t) = engagement × e^(-0.0578 × t)                           │
│  Half-life: ~12 hours (score drops to 50% after 12 hours)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 11.2.3 Hot Score Update Strategy

```typescript
const HOT_SCORE_UPDATE_CONFIG = {
  REALTIME_UPDATE_EVENTS: [
    "PARTICIPATION_COMPLETED",
    "SHARE_CREATED"
  ],

  // [PERFORMANCE] Increased from 5 to 15 minutes to reduce database load
  // Hot scores don't need minute-level precision for feed ranking
  BATCH_UPDATE_INTERVAL_MINUTES: 15,

  RECALCULATION_THRESHOLD: {
    MIN_ENGAGEMENT_CHANGE: 10,
    MIN_TIME_SINCE_UPDATE_MINUTES: 1
  },

  // [PERFORMANCE] Increased from 60 to 300 seconds (5 min)
  // Reduces Redis/cache pressure while maintaining acceptable freshness
  CACHE_TTL_SECONDS: 300,

  // [PERFORMANCE] New: Batch size limits to prevent memory spikes
  MAX_BATCH_SIZE: 1000,

  // [PERFORMANCE] New: Stale content threshold - skip very old content
  SKIP_OLDER_THAN_DAYS: 30
} as const


interface HotScoreUpdate {
  contentId: string
  previousScore: number
  newScore: number
  trigger: "REALTIME" | "BATCH" | "RECALCULATION"
  updatedAt: Date
}


async function updateHotScoreRealtime(contentId: string): Promise<HotScoreUpdate> {
  const [contentRecord] = await db.select()
    .from(content)
    .where(eq(content.id, contentId))

  if (!contentRecord) {
    throw new Error("Content not found")
  }

  const [participationCount] = await db.select({ count: sql<number>`count(*)` })
    .from(participations)
    .where(eq(participations.contentId, contentId))

  const [shareCount] = await db.select({ count: sql<number>`count(*)` })
    .from(shares)
    .where(eq(shares.contentId, contentId))

  const [stats] = await db.select()
    .from(contentStats)
    .where(eq(contentStats.contentId, contentId))

  const [creator] = await db.select({ isVerified: users.isVerified })
    .from(users)
    .where(eq(users.id, contentRecord.creatorId))

  const previousScore = contentRecord.hotScore

  const newScore = calculateHotScore({
    createdAt: contentRecord.createdAt,
    participantCount: participationCount.count,
    completionCount: stats?.completedResponses ?? 0,
    shareCount: shareCount.count,
    commentCount: stats?.commentCount ?? 0,
    reliabilityScore: contentRecord.reliabilityScore,
    creatorVerified: creator.isVerified,
    organizationId: contentRecord.organizationId
  })

  await db.update(content)
    .set({
      hotScore: newScore,
      hotScoreUpdatedAt: new Date()
    })
    .where(eq(content.id, contentId))

  await invalidateHotScoreCache(contentId)

  return {
    contentId,
    previousScore,
    newScore,
    trigger: "REALTIME",
    updatedAt: new Date()
  }
}


async function batchUpdateHotScores(): Promise<number> {
  const staleContent = await db.select()
    .from(content)
    .where(and(
      eq(content.status, "ACTIVE"),
      or(
        lt(content.hotScoreUpdatedAt, new Date(Date.now() - HOT_SCORE_UPDATE_CONFIG.BATCH_UPDATE_INTERVAL_MINUTES * 60 * 1000)),
        isNull(content.hotScoreUpdatedAt)
      )
    ))
    .limit(1000)

  await db.transaction(async (tx) => {
    for (const contentItem of staleContent) {
      const [participationCount] = await tx.select({ count: sql<number>`count(*)` })
        .from(participations)
        .where(eq(participations.contentId, contentItem.id))

      const [shareCount] = await tx.select({ count: sql<number>`count(*)` })
        .from(shares)
        .where(eq(shares.contentId, contentItem.id))

      const [stats] = await tx.select()
        .from(contentStats)
        .where(eq(contentStats.contentId, contentItem.id))

      const [creator] = await tx.select({ isVerified: users.isVerified })
        .from(users)
        .where(eq(users.id, contentItem.creatorId))

      const newScore = calculateHotScore({
        createdAt: contentItem.createdAt,
        participantCount: participationCount.count,
        completionCount: stats?.completedResponses ?? 0,
        shareCount: shareCount.count,
        commentCount: stats?.commentCount ?? 0,
        reliabilityScore: contentItem.reliabilityScore,
        creatorVerified: creator.isVerified,
        organizationId: contentItem.organizationId
      })

      await tx.update(content)
        .set({
          hotScore: newScore,
          hotScoreUpdatedAt: new Date()
        })
        .where(eq(content.id, contentItem.id))
    }
  })

  return staleContent.length
}


async function invalidateHotScoreCache(contentId: string): Promise<void> {
}

export {
  HOT_SCORE_UPDATE_CONFIG,
  updateHotScoreRealtime,
  batchUpdateHotScores
}
export type {
  HotScoreUpdate
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 11.3 PERSONALIZATION ENGINE
# ══════════════════════════════════════════════════════════════════════════════

## 11.3.1 User Interest Model

```typescript
const InterestCategorySchema = z.enum([
  "POLITICS",
  "TECHNOLOGY",
  "ENTERTAINMENT",
  "SPORTS",
  "BUSINESS",
  "SCIENCE",
  "HEALTH",
  "LIFESTYLE",
  "EDUCATION",
  "TRAVEL",
  "FOOD",
  "GAMING",
  "MUSIC",
  "ART",
  "ENVIRONMENT",
  "SOCIAL_ISSUES",
  "LOCAL",
  "HUMOR",
  "RELATIONSHIPS",
  "CAREER"
])

type InterestCategory = z.infer<typeof InterestCategorySchema>


const UserInterestProfileSchema = z.object({
  userId: z.string().cuid(),

  categoryScores: z.record(InterestCategorySchema, z.number().min(0).max(100)),

  topCategories: z.array(InterestCategorySchema).max(5),

  engagementHistory: z.object({
    totalParticipations: z.number().int().min(0),
    totalShares: z.number().int().min(0),
    totalComments: z.number().int().min(0),
    avgCompletionRate: z.number().min(0).max(1)
  }),

  preferredContentTypes: z.object({
    poll: z.number().min(0).max(1),
    survey: z.number().min(0).max(1),
    test: z.number().min(0).max(1)
  }),

  activeHours: z.array(z.number().int().min(0).max(23)),

  lastUpdatedAt: z.date()
})

type UserInterestProfile = z.infer<typeof UserInterestProfileSchema>


const INTEREST_DECAY_CONFIG = {
  HALF_LIFE_DAYS: 30,
  MIN_SCORE: 0.1,
  MAX_SCORE: 100,
  PARTICIPATION_WEIGHT: 1.0,
  COMPLETION_WEIGHT: 0.5,
  SHARE_WEIGHT: 0.8,
  COMMENT_WEIGHT: 0.3,
  VIEW_WEIGHT: 0.1
} as const


async function updateUserInterests(
  userId: string,
  event: {
    type: "PARTICIPATION" | "COMPLETION" | "SHARE" | "COMMENT" | "VIEW"
    contentId: string
    categories: InterestCategory[]
  }
): Promise<void> {
  const profile = await getUserInterestProfile(userId)

  const weight = {
    PARTICIPATION: INTEREST_DECAY_CONFIG.PARTICIPATION_WEIGHT,
    COMPLETION: INTEREST_DECAY_CONFIG.COMPLETION_WEIGHT,
    SHARE: INTEREST_DECAY_CONFIG.SHARE_WEIGHT,
    COMMENT: INTEREST_DECAY_CONFIG.COMMENT_WEIGHT,
    VIEW: INTEREST_DECAY_CONFIG.VIEW_WEIGHT
  }[event.type]

  for (const category of event.categories) {
    const currentScore = profile.categoryScores[category] ?? 0
    const newScore = Math.min(
      INTEREST_DECAY_CONFIG.MAX_SCORE,
      currentScore + weight * 10
    )
    profile.categoryScores[category] = newScore
  }

  profile.topCategories = Object.entries(profile.categoryScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category as InterestCategory)

  profile.lastUpdatedAt = new Date()

  await saveUserInterestProfile(userId, profile)
}


async function decayUserInterests(): Promise<number> {
  const profiles = await db.select()
    .from(userInterestProfiles)
    .where(lt(userInterestProfiles.lastUpdatedAt, new Date(Date.now() - 24 * 60 * 60 * 1000)))

  const decayFactor = Math.pow(0.5, 1 / INTEREST_DECAY_CONFIG.HALF_LIFE_DAYS)

  for (const profile of profiles) {
    const categoryScores = profile.categoryScores as Record<string, number>

    for (const category of Object.keys(categoryScores)) {
      categoryScores[category] = Math.max(
        INTEREST_DECAY_CONFIG.MIN_SCORE,
        categoryScores[category] * decayFactor
      )
    }

    await db.update(userInterestProfiles)
      .set({
        categoryScores,
        lastUpdatedAt: new Date()
      })
      .where(eq(userInterestProfiles.userId, profile.userId))
  }

  return profiles.length
}


async function getUserInterestProfile(userId: string): Promise<UserInterestProfile> {
  const [profile] = await db.select()
    .from(userInterestProfiles)
    .where(eq(userInterestProfiles.userId, userId))

  if (profile) {
    return profile as unknown as UserInterestProfile
  }

  return {
    userId,
    categoryScores: {} as Record<InterestCategory, number>,
    topCategories: [],
    engagementHistory: {
      totalParticipations: 0,
      totalShares: 0,
      totalComments: 0,
      avgCompletionRate: 0
    },
    preferredContentTypes: {
      poll: 0.33,
      survey: 0.33,
      test: 0.34
    },
    activeHours: [],
    lastUpdatedAt: new Date()
  }
}


async function saveUserInterestProfile(
  userId: string,
  profile: UserInterestProfile
): Promise<void> {
  await db.insert(userInterestProfiles)
    .values({
      userId,
      categoryScores: profile.categoryScores,
      topCategories: profile.topCategories,
      engagementHistory: profile.engagementHistory,
      preferredContentTypes: profile.preferredContentTypes,
      activeHours: profile.activeHours
    })
    .onConflictDoUpdate({
      target: userInterestProfiles.userId,
      set: {
        categoryScores: profile.categoryScores,
        topCategories: profile.topCategories,
        engagementHistory: profile.engagementHistory,
        preferredContentTypes: profile.preferredContentTypes,
        activeHours: profile.activeHours,
        lastUpdatedAt: profile.lastUpdatedAt
      }
    })
}

export {
  InterestCategorySchema,
  UserInterestProfileSchema,
  INTEREST_DECAY_CONFIG,
  updateUserInterests,
  decayUserInterests,
  getUserInterestProfile
}
export type {
  InterestCategory,
  UserInterestProfile
}
```


## 11.3.2 Personalization Score Calculation

```typescript
const PERSONALIZATION_WEIGHTS = {
  INTEREST_MATCH: 0.40,
  FOLLOWING_BOOST: 0.25,
  CONTENT_TYPE_PREFERENCE: 0.15,
  ENGAGEMENT_HISTORY: 0.10,
  SOCIAL_PROOF: 0.10
} as const


interface PersonalizationFactors {
  interestMatchScore: number
  followingBoost: number
  contentTypePreference: number
  engagementHistoryScore: number
  socialProofScore: number
}


function calculatePersonalizationScore(
  content: {
    categories: InterestCategory[]
    contentType: "POLL" | "SURVEY" | "TEST"
    creatorId: string
    participantCount: number
  },
  userProfile: UserInterestProfile,
  userFollowing: Set<string>,
  userFriendsParticipated: number
): { score: number; factors: PersonalizationFactors } {
  let interestMatchScore = 0
  if (content.categories.length > 0) {
    const categoryScores = content.categories.map(
      cat => userProfile.categoryScores[cat] ?? 0
    )
    interestMatchScore = Math.max(...categoryScores) / 100
  }

  const followingBoost = userFollowing.has(content.creatorId) ? 1.0 : 0

  const contentTypeKey = content.contentType.toLowerCase() as "poll" | "survey" | "test"
  const contentTypePreference = userProfile.preferredContentTypes[contentTypeKey]

  const engagementHistoryScore = Math.min(
    1.0,
    userProfile.engagementHistory.totalParticipations / 100
  ) * userProfile.engagementHistory.avgCompletionRate

  const socialProofScore = Math.min(1.0, userFriendsParticipated / 5)

  const factors: PersonalizationFactors = {
    interestMatchScore,
    followingBoost,
    contentTypePreference,
    engagementHistoryScore,
    socialProofScore
  }

  const score =
    interestMatchScore * PERSONALIZATION_WEIGHTS.INTEREST_MATCH +
    followingBoost * PERSONALIZATION_WEIGHTS.FOLLOWING_BOOST +
    contentTypePreference * PERSONALIZATION_WEIGHTS.CONTENT_TYPE_PREFERENCE +
    engagementHistoryScore * PERSONALIZATION_WEIGHTS.ENGAGEMENT_HISTORY +
    socialProofScore * PERSONALIZATION_WEIGHTS.SOCIAL_PROOF

  return { score, factors }
}

export {
  PERSONALIZATION_WEIGHTS,
  calculatePersonalizationScore
}
export type {
  PersonalizationFactors
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 11.4 FEED GENERATION
# ══════════════════════════════════════════════════════════════════════════════

## 11.4.1 Feed Request Schema

```typescript
const FeedTypeSchema = z.enum([
  "HOME",
  "EXPLORE",
  "FOLLOWING",
  "CATEGORY",
  "SEARCH",
  "CREATOR_PROFILE",
  "ORGANIZATION_PROFILE"
])

const FeedFilterSchema = z.object({
  contentTypes: z.array(z.enum(["POLL", "SURVEY", "TEST"])).optional(),
  categories: z.array(InterestCategorySchema).optional(),
  minReliabilityScore: z.number().min(0).max(100).optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  excludeParticipated: z.boolean().optional(),
  excludeExpired: z.boolean().default(true),
  language: z.string().length(2).optional()
})

const FeedRequestSchema = z.object({
  feedType: FeedTypeSchema,
  filters: FeedFilterSchema.optional(),

  categoryId: z.string().cuid().optional(),
  creatorId: z.string().cuid().optional(),
  organizationId: z.string().cuid().optional(),
  searchQuery: z.string().max(200).optional(),

  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),

  includeMetadata: z.boolean().default(false)
})

type FeedType = z.infer<typeof FeedTypeSchema>
type FeedFilter = z.infer<typeof FeedFilterSchema>
type FeedRequest = z.infer<typeof FeedRequestSchema>

export {
  FeedTypeSchema,
  FeedFilterSchema,
  FeedRequestSchema
}
export type {
  FeedType,
  FeedFilter,
  FeedRequest
}
```


## 11.4.2 Feed Item Schema

```typescript
const FeedItemSchema = z.object({
  id: z.string().cuid(),
  contentId: z.string().cuid(),
  contentType: z.enum(["POLL", "SURVEY", "TEST"]),

  title: z.string(),
  description: z.string().nullable(),
  thumbnailUrl: z.string().url().nullable(),

  creator: z.object({
    id: z.string().cuid(),
    username: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().url().nullable(),
    isVerified: z.boolean()
  }),

  organization: z.object({
    id: z.string().cuid(),
    name: z.string(),
    logoUrl: z.string().url().nullable()
  }).nullable(),

  stats: z.object({
    participantCount: z.number().int().min(0),
    completionCount: z.number().int().min(0),
    commentCount: z.number().int().min(0),
    shareCount: z.number().int().min(0)
  }),

  reliabilityScore: z.number().min(0).max(100),
  categories: z.array(InterestCategorySchema),

  questionCount: z.number().int().min(1),
  estimatedTimeMinutes: z.number().int().min(1),

  status: z.enum(["ACTIVE", "ENDED", "DRAFT"]),
  endsAt: z.date().nullable(),

  userContext: z.object({
    hasParticipated: z.boolean(),
    hasShared: z.boolean(),
    isFollowingCreator: z.boolean(),
    friendsParticipated: z.number().int().min(0)
  }).optional(),

  feedMetadata: z.object({
    hotScore: z.number(),
    personalizationScore: z.number(),
    finalScore: z.number(),
    source: z.enum(["FOLLOWING", "INTEREST", "TRENDING", "DISCOVERY", "SEARCH"])
  }).optional(),

  createdAt: z.date(),
  publishedAt: z.date()
})

const FeedResponseSchema = z.object({
  items: z.array(FeedItemSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  totalCount: z.number().int().min(0).optional()
})

type FeedItem = z.infer<typeof FeedItemSchema>
type FeedResponse = z.infer<typeof FeedResponseSchema>

export {
  FeedItemSchema,
  FeedResponseSchema
}
export type {
  FeedItem,
  FeedResponse
}
```


## 11.4.3 Home Feed Generator

```typescript
const HOME_FEED_CONFIG = {
  CANDIDATE_POOL_SIZE: 500,
  FOLLOWING_WEIGHT: 0.40,
  INTEREST_WEIGHT: 0.35,
  TRENDING_WEIGHT: 0.15,
  DISCOVERY_WEIGHT: 0.10,

  MAX_SAME_CREATOR: 2,
  MAX_SAME_CATEGORY: 3,
  MIN_CATEGORY_DIVERSITY: 3,

  SEEN_CONTENT_PENALTY: 0.5,
  PARTICIPATED_CONTENT_PENALTY: 0.8
} as const


async function generateHomeFeed(
  userId: string,
  request: FeedRequest
): Promise<FeedResponse> {
  const [userProfile, userFollowing, userBlocks, seenContent] = await Promise.all([
    getUserInterestProfile(userId),
    getUserFollowingIds(userId),
    getUserBlockedIds(userId),
    getRecentlySeenContent(userId)
  ])

  const [followingCandidates, interestCandidates, trendingCandidates, discoveryCandidates] =
    await Promise.all([
      getFollowingCandidates(userId, userFollowing, HOME_FEED_CONFIG.CANDIDATE_POOL_SIZE * 0.4),
      getInterestCandidates(userProfile, HOME_FEED_CONFIG.CANDIDATE_POOL_SIZE * 0.35),
      getTrendingCandidates(HOME_FEED_CONFIG.CANDIDATE_POOL_SIZE * 0.15),
      getDiscoveryCandidates(userId, userProfile, HOME_FEED_CONFIG.CANDIDATE_POOL_SIZE * 0.1)
    ])

  const allCandidates = mergeCandidates([
    { items: followingCandidates, source: "FOLLOWING" as const },
    { items: interestCandidates, source: "INTEREST" as const },
    { items: trendingCandidates, source: "TRENDING" as const },
    { items: discoveryCandidates, source: "DISCOVERY" as const }
  ])

  const filteredCandidates = allCandidates.filter(candidate => {
    if (userBlocks.has(candidate.creatorId)) return false

    if (request.filters?.excludeExpired && candidate.endsAt && candidate.endsAt < new Date()) {
      return false
    }

    if (request.filters?.contentTypes && !request.filters.contentTypes.includes(candidate.contentType)) {
      return false
    }

    if (request.filters?.minReliabilityScore && candidate.reliabilityScore < request.filters.minReliabilityScore) {
      return false
    }

    return true
  })

  const rankedCandidates = await rankCandidates(
    filteredCandidates,
    userId,
    userProfile,
    userFollowing,
    seenContent
  )

  const diversifiedCandidates = applyDiversityRules(rankedCandidates)

  const paginatedItems = paginateFeed(diversifiedCandidates, request.cursor, request.limit)

  const hydratedItems = await hydrateFeedItems(paginatedItems.items, userId, request.includeMetadata)

  return {
    items: hydratedItems,
    nextCursor: paginatedItems.nextCursor,
    hasMore: paginatedItems.hasMore
  }
}


async function getFollowingCandidates(
  userId: string,
  followingIds: Set<string>,
  limit: number
): Promise<FeedCandidate[]> {
  if (followingIds.size === 0) return []

  const content = await db.content.findMany({
    where: {
      creatorId: { in: Array.from(followingIds) },
      status: "ACTIVE",
      publishedAt: { not: null }
    },
    orderBy: { publishedAt: "desc" },
    take: Math.ceil(limit),
    select: feedCandidateSelect
  })

  return content.map(c => ({ ...c, source: "FOLLOWING" as const }))
}


async function getInterestCandidates(
  userProfile: UserInterestProfile,
  limit: number
): Promise<FeedCandidate[]> {
  if (userProfile.topCategories.length === 0) return []

  const content = await db.content.findMany({
    where: {
      status: "ACTIVE",
      publishedAt: { not: null },
      categories: { hasSome: userProfile.topCategories }
    },
    orderBy: { hotScore: "desc" },
    take: Math.ceil(limit),
    select: feedCandidateSelect
  })

  return content.map(c => ({ ...c, source: "INTEREST" as const }))
}


async function getTrendingCandidates(limit: number): Promise<FeedCandidate[]> {
  const content = await db.content.findMany({
    where: {
      status: "ACTIVE",
      publishedAt: { not: null },
      publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    orderBy: { hotScore: "desc" },
    take: Math.ceil(limit),
    select: feedCandidateSelect
  })

  return content.map(c => ({ ...c, source: "TRENDING" as const }))
}


async function getDiscoveryCandidates(
  userId: string,
  userProfile: UserInterestProfile,
  limit: number
): Promise<FeedCandidate[]> {
  const excludeCategories = userProfile.topCategories

  const content = await db.content.findMany({
    where: {
      status: "ACTIVE",
      publishedAt: { not: null },
      NOT: {
        categories: { hasSome: excludeCategories }
      },
      reliabilityScore: { gte: 60 }
    },
    orderBy: { hotScore: "desc" },
    take: Math.ceil(limit),
    select: feedCandidateSelect
  })

  return content.map(c => ({ ...c, source: "DISCOVERY" as const }))
}


interface FeedCandidate {
  id: string
  contentType: "POLL" | "SURVEY" | "TEST"
  creatorId: string
  categories: InterestCategory[]
  reliabilityScore: number
  hotScore: number
  endsAt: Date | null
  source: "FOLLOWING" | "INTEREST" | "TRENDING" | "DISCOVERY" | "SEARCH"
}

const feedCandidateSelect = {
  id: true,
  contentType: true,
  creatorId: true,
  categories: true,
  reliabilityScore: true,
  hotScore: true,
  endsAt: true
}


function mergeCandidates(
  sources: Array<{ items: FeedCandidate[]; source: FeedCandidate["source"] }>
): FeedCandidate[] {
  const seen = new Set<string>()
  const merged: FeedCandidate[] = []

  for (const { items } of sources) {
    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        merged.push(item)
      }
    }
  }

  return merged
}


async function rankCandidates(
  candidates: FeedCandidate[],
  userId: string,
  userProfile: UserInterestProfile,
  userFollowing: Set<string>,
  seenContent: Set<string>
): Promise<Array<FeedCandidate & { finalScore: number; personalizationScore: number }>> {
  const friendParticipations = await getFriendParticipations(userId, candidates.map(c => c.id))

  return candidates.map(candidate => {
    const { score: personalizationScore } = calculatePersonalizationScore(
      {
        categories: candidate.categories,
        contentType: candidate.contentType,
        creatorId: candidate.creatorId,
        participantCount: 0
      },
      userProfile,
      userFollowing,
      friendParticipations.get(candidate.id) ?? 0
    )

    let finalScore = candidate.hotScore * (1 + personalizationScore)

    if (seenContent.has(candidate.id)) {
      finalScore *= HOME_FEED_CONFIG.SEEN_CONTENT_PENALTY
    }

    return {
      ...candidate,
      finalScore,
      personalizationScore
    }
  }).sort((a, b) => b.finalScore - a.finalScore)
}


function applyDiversityRules(
  candidates: Array<FeedCandidate & { finalScore: number }>
): Array<FeedCandidate & { finalScore: number }> {
  const result: Array<FeedCandidate & { finalScore: number }> = []
  const creatorCount = new Map<string, number>()
  const categoryCount = new Map<string, number>()

  for (const candidate of candidates) {
    const creatorOccurrences = creatorCount.get(candidate.creatorId) ?? 0
    if (creatorOccurrences >= HOME_FEED_CONFIG.MAX_SAME_CREATOR) {
      continue
    }

    const maxCategoryOccurrences = Math.max(
      ...candidate.categories.map(cat => categoryCount.get(cat) ?? 0)
    )
    if (maxCategoryOccurrences >= HOME_FEED_CONFIG.MAX_SAME_CATEGORY) {
      continue
    }

    result.push(candidate)
    creatorCount.set(candidate.creatorId, creatorOccurrences + 1)
    for (const category of candidate.categories) {
      categoryCount.set(category, (categoryCount.get(category) ?? 0) + 1)
    }
  }

  return result
}


function paginateFeed(
  items: FeedCandidate[],
  cursor: string | undefined,
  limit: number
): { items: FeedCandidate[]; nextCursor: string | null; hasMore: boolean } {
  let startIndex = 0

  if (cursor) {
    const cursorIndex = items.findIndex(item => item.id === cursor)
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1
    }
  }

  const pageItems = items.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < items.length
  const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.id ?? null : null

  return { items: pageItems, nextCursor, hasMore }
}


async function hydrateFeedItems(
  candidates: FeedCandidate[],
  userId: string,
  includeMetadata: boolean
): Promise<FeedItem[]> {
  const contentIds = candidates.map(c => c.id)

  const [contents, userContexts] = await Promise.all([
    db.content.findMany({
      where: { id: { in: contentIds } },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        stats: true
      }
    }),
    getUserContentContexts(userId, contentIds)
  ])

  const contentMap = new Map(contents.map(c => [c.id, c]))

  return candidates.map(candidate => {
    const content = contentMap.get(candidate.id)!
    const userContext = userContexts.get(candidate.id)

    const feedItem: FeedItem = {
      id: candidate.id,
      contentId: candidate.id,
      contentType: candidate.contentType,
      title: content.title,
      description: content.description,
      thumbnailUrl: content.thumbnailUrl,
      creator: content.creator,
      organization: content.organization,
      stats: {
        participantCount: content.stats?.totalResponses ?? 0,
        completionCount: content.stats?.completedResponses ?? 0,
        commentCount: content.stats?.commentCount ?? 0,
        shareCount: content.stats?.shareCount ?? 0
      },
      reliabilityScore: content.reliabilityScore,
      categories: candidate.categories,
      questionCount: content.questionCount,
      estimatedTimeMinutes: content.estimatedTimeMinutes,
      status: content.status as "ACTIVE" | "ENDED" | "DRAFT",
      endsAt: content.endsAt,
      createdAt: content.createdAt,
      publishedAt: content.publishedAt!
    }

    if (userContext) {
      feedItem.userContext = userContext
    }

    if (includeMetadata && "finalScore" in candidate) {
      feedItem.feedMetadata = {
        hotScore: candidate.hotScore,
        personalizationScore: (candidate as any).personalizationScore,
        finalScore: (candidate as any).finalScore,
        source: candidate.source
      }
    }

    return feedItem
  })
}


async function getUserFollowingIds(userId: string): Promise<Set<string>> {
  const follows = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  })
  return new Set(follows.map(f => f.followingId))
}

async function getUserBlockedIds(userId: string): Promise<Set<string>> {
  const blocks = await db.userBlock.findMany({
    where: { blockerId: userId },
    select: { blockedId: true }
  })
  return new Set(blocks.map(b => b.blockedId))
}

async function getRecentlySeenContent(userId: string): Promise<Set<string>> {
  const seen = await db.contentView.findMany({
    where: {
      userId,
      viewedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    },
    select: { contentId: true }
  })
  return new Set(seen.map(s => s.contentId))
}

async function getFriendParticipations(
  userId: string,
  contentIds: string[]
): Promise<Map<string, number>> {
  return new Map()
}

async function getUserContentContexts(
  userId: string,
  contentIds: string[]
): Promise<Map<string, FeedItem["userContext"]>> {
  return new Map()
}

export {
  HOME_FEED_CONFIG,
  generateHomeFeed
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 11.5 EXPLORE & TRENDING
# ══════════════════════════════════════════════════════════════════════════════

## 11.5.1 Explore Feed Generator

```typescript
const EXPLORE_FEED_CONFIG = {
  TRENDING_WEIGHT: 0.50,
  CATEGORY_WEIGHT: 0.30,
  GEO_WEIGHT: 0.20,

  TRENDING_WINDOW_HOURS: 24,
  MIN_PARTICIPANTS_FOR_TRENDING: 50,

  CATEGORY_ROTATION_COUNT: 5
} as const


async function generateExploreFeed(
  userId: string | null,
  request: FeedRequest
): Promise<FeedResponse> {
  const userGeo = userId ? await getUserGeolocation(userId) : null

  const [trendingContent, categoryContent, geoContent] = await Promise.all([
    getGlobalTrending(EXPLORE_FEED_CONFIG.TRENDING_WINDOW_HOURS),
    getCategoryShowcase(request.filters?.categories),
    userGeo ? getGeoRelevantContent(userGeo) : Promise.resolve([])
  ])

  const allCandidates = mergeCandidates([
    { items: trendingContent, source: "TRENDING" as const },
    { items: categoryContent, source: "INTEREST" as const },
    { items: geoContent, source: "DISCOVERY" as const }
  ])

  const filteredCandidates = applyExploreFilters(allCandidates, request.filters)

  const rankedCandidates = rankExploreCandidates(filteredCandidates)

  const diversifiedCandidates = applyDiversityRules(rankedCandidates)

  const paginatedItems = paginateFeed(diversifiedCandidates, request.cursor, request.limit)

  const hydratedItems = await hydrateFeedItems(
    paginatedItems.items,
    userId ?? "",
    request.includeMetadata
  )

  return {
    items: hydratedItems,
    nextCursor: paginatedItems.nextCursor,
    hasMore: paginatedItems.hasMore
  }
}


async function getGlobalTrending(windowHours: number): Promise<FeedCandidate[]> {
  const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000)

  const content = await db.content.findMany({
    where: {
      status: "ACTIVE",
      publishedAt: { gte: windowStart },
      stats: {
        totalResponses: { gte: EXPLORE_FEED_CONFIG.MIN_PARTICIPANTS_FOR_TRENDING }
      }
    },
    orderBy: { hotScore: "desc" },
    take: 100,
    select: feedCandidateSelect
  })

  return content.map(c => ({ ...c, source: "TRENDING" as const }))
}


async function getCategoryShowcase(
  selectedCategories?: InterestCategory[]
): Promise<FeedCandidate[]> {
  const categories = selectedCategories ??
    Object.values(InterestCategorySchema.enum).slice(0, EXPLORE_FEED_CONFIG.CATEGORY_ROTATION_COUNT)

  const contentByCategory = await Promise.all(
    categories.map(category =>
      db.content.findMany({
        where: {
          status: "ACTIVE",
          publishedAt: { not: null },
          categories: { has: category }
        },
        orderBy: { hotScore: "desc" },
        take: 10,
        select: feedCandidateSelect
      })
    )
  )

  const allContent = contentByCategory.flat()
  return allContent.map(c => ({ ...c, source: "INTEREST" as const }))
}


async function getGeoRelevantContent(
  geo: { country: string; region?: string; city?: string }
): Promise<FeedCandidate[]> {
  const content = await db.content.findMany({
    where: {
      status: "ACTIVE",
      publishedAt: { not: null },
      OR: [
        { targetCountries: { has: geo.country } },
        { targetRegions: { has: geo.region ?? "" } },
        { categories: { has: "LOCAL" as InterestCategory } }
      ]
    },
    orderBy: { hotScore: "desc" },
    take: 50,
    select: feedCandidateSelect
  })

  return content.map(c => ({ ...c, source: "DISCOVERY" as const }))
}


function applyExploreFilters(
  candidates: FeedCandidate[],
  filters?: FeedFilter
): FeedCandidate[] {
  if (!filters) return candidates

  return candidates.filter(candidate => {
    if (filters.contentTypes && !filters.contentTypes.includes(candidate.contentType)) {
      return false
    }

    if (filters.categories && !candidate.categories.some(cat => filters.categories!.includes(cat))) {
      return false
    }

    if (filters.minReliabilityScore && candidate.reliabilityScore < filters.minReliabilityScore) {
      return false
    }

    if (filters.excludeExpired && candidate.endsAt && candidate.endsAt < new Date()) {
      return false
    }

    return true
  })
}


function rankExploreCandidates(
  candidates: FeedCandidate[]
): Array<FeedCandidate & { finalScore: number }> {
  return candidates.map(candidate => ({
    ...candidate,
    finalScore: candidate.hotScore
  })).sort((a, b) => b.finalScore - a.finalScore)
}


async function getUserGeolocation(userId: string): Promise<{
  country: string
  region?: string
  city?: string
} | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { country: true, region: true, city: true }
  })

  if (!user?.country) return null

  return {
    country: user.country,
    region: user.region ?? undefined,
    city: user.city ?? undefined
  }
}

export {
  EXPLORE_FEED_CONFIG,
  generateExploreFeed,
  getGlobalTrending,
  getCategoryShowcase
}
```


## 11.5.2 Trending Calculation

```typescript
const TRENDING_CONFIG = {
  VELOCITY_WINDOW_HOURS: 6,
  MIN_VELOCITY_FOR_TRENDING: 10,
  VELOCITY_DECAY_HOURS: 2,

  ENGAGEMENT_WEIGHTS: {
    participation: 1.0,
    share: 2.0,
    comment: 0.5
  },

  UPDATE_INTERVAL_MINUTES: 15,

  TRENDING_SLOTS: 20,
  CATEGORY_TRENDING_SLOTS: 5
} as const


interface TrendingScore {
  contentId: string
  velocity: number
  accelerationRate: number
  currentEngagement: number
  previousEngagement: number
  trendingScore: number
  calculatedAt: Date
}


async function calculateTrendingScores(): Promise<TrendingScore[]> {
  const windowStart = new Date(Date.now() - TRENDING_CONFIG.VELOCITY_WINDOW_HOURS * 60 * 60 * 1000)
  const midPoint = new Date(Date.now() - (TRENDING_CONFIG.VELOCITY_WINDOW_HOURS / 2) * 60 * 60 * 1000)

  const activeContent = await db.content.findMany({
    where: {
      status: "ACTIVE",
      publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    select: {
      id: true,
      publishedAt: true
    }
  })

  const trendingScores: TrendingScore[] = []

  for (const content of activeContent) {
    const [recentEngagement, previousEngagement] = await Promise.all([
      getEngagementInWindow(content.id, midPoint, new Date()),
      getEngagementInWindow(content.id, windowStart, midPoint)
    ])

    const currentEngagement =
      recentEngagement.participations * TRENDING_CONFIG.ENGAGEMENT_WEIGHTS.participation +
      recentEngagement.shares * TRENDING_CONFIG.ENGAGEMENT_WEIGHTS.share +
      recentEngagement.comments * TRENDING_CONFIG.ENGAGEMENT_WEIGHTS.comment

    const prevEngagement =
      previousEngagement.participations * TRENDING_CONFIG.ENGAGEMENT_WEIGHTS.participation +
      previousEngagement.shares * TRENDING_CONFIG.ENGAGEMENT_WEIGHTS.share +
      previousEngagement.comments * TRENDING_CONFIG.ENGAGEMENT_WEIGHTS.comment

    const velocity = currentEngagement / (TRENDING_CONFIG.VELOCITY_WINDOW_HOURS / 2)

    const accelerationRate = prevEngagement > 0
      ? (currentEngagement - prevEngagement) / prevEngagement
      : currentEngagement > 0 ? 1 : 0

    const trendingScore = velocity * (1 + Math.max(0, accelerationRate))

    if (velocity >= TRENDING_CONFIG.MIN_VELOCITY_FOR_TRENDING) {
      trendingScores.push({
        contentId: content.id,
        velocity,
        accelerationRate,
        currentEngagement,
        previousEngagement: prevEngagement,
        trendingScore,
        calculatedAt: new Date()
      })
    }
  }

  return trendingScores.sort((a, b) => b.trendingScore - a.trendingScore)
}


async function getEngagementInWindow(
  contentId: string,
  start: Date,
  end: Date
): Promise<{ participations: number; shares: number; comments: number }> {
  const [participations, shares, comments] = await Promise.all([
    db.participation.count({
      where: {
        contentId,
        createdAt: { gte: start, lt: end }
      }
    }),
    db.shareEvent.count({
      where: {
        contentId,
        createdAt: { gte: start, lt: end }
      }
    }),
    db.comment.count({
      where: {
        discussion: { contentId },
        createdAt: { gte: start, lt: end }
      }
    })
  ])

  return { participations, shares, comments }
}


async function updateTrendingCache(): Promise<void> {
  const trendingScores = await calculateTrendingScores()

  const globalTrending = trendingScores.slice(0, TRENDING_CONFIG.TRENDING_SLOTS)

  await db.trendingContent.deleteMany({})
  await db.trendingContent.createMany({
    data: globalTrending.map((score, index) => ({
      contentId: score.contentId,
      rank: index + 1,
      velocity: score.velocity,
      trendingScore: score.trendingScore,
      category: null,
      calculatedAt: score.calculatedAt
    }))
  })

  const contentWithCategories = await db.content.findMany({
    where: {
      id: { in: trendingScores.map(s => s.contentId) }
    },
    select: { id: true, categories: true }
  })

  const categoryMap = new Map(contentWithCategories.map(c => [c.id, c.categories]))

  const categoryTrending = new Map<InterestCategory, TrendingScore[]>()

  for (const score of trendingScores) {
    const categories = categoryMap.get(score.contentId) ?? []
    for (const category of categories) {
      const existing = categoryTrending.get(category as InterestCategory) ?? []
      if (existing.length < TRENDING_CONFIG.CATEGORY_TRENDING_SLOTS) {
        existing.push(score)
        categoryTrending.set(category as InterestCategory, existing)
      }
    }
  }

  for (const [category, scores] of categoryTrending) {
    await db.trendingContent.createMany({
      data: scores.map((score, index) => ({
        contentId: score.contentId,
        rank: index + 1,
        velocity: score.velocity,
        trendingScore: score.trendingScore,
        category,
        calculatedAt: score.calculatedAt
      }))
    })
  }
}

export {
  TRENDING_CONFIG,
  calculateTrendingScores,
  updateTrendingCache
}
export type {
  TrendingScore
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 11.6 SEARCH SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 11.6.1 Search Configuration

```typescript
const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 200,

  TITLE_WEIGHT: 3.0,
  DESCRIPTION_WEIGHT: 2.0,
  QUESTION_WEIGHT: 1.5,
  TAG_WEIGHT: 2.5,
  CREATOR_NAME_WEIGHT: 1.0,

  HOT_SCORE_BOOST_WEIGHT: 0.3,

  FUZZY_THRESHOLD: 0.7,
  MAX_RESULTS: 100,

  RECENT_SEARCH_LIMIT: 10,
  POPULAR_SEARCH_LIMIT: 20
} as const


const SearchSortSchema = z.enum([
  "RELEVANCE",
  "HOT",
  "RECENT",
  "PARTICIPANTS",
  "RELIABILITY"
])

type SearchSort = z.infer<typeof SearchSortSchema>


const SearchRequestSchema = z.object({
  query: z.string().min(SEARCH_CONFIG.MIN_QUERY_LENGTH).max(SEARCH_CONFIG.MAX_QUERY_LENGTH),
  filters: FeedFilterSchema.optional(),
  sort: SearchSortSchema.default("RELEVANCE"),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20)
})

type SearchRequest = z.infer<typeof SearchRequestSchema>

export {
  SEARCH_CONFIG,
  SearchSortSchema,
  SearchRequestSchema
}
export type {
  SearchSort,
  SearchRequest
}
```


## 11.6.2 Search Engine Implementation

```typescript
interface SearchResult {
  contentId: string
  relevanceScore: number
  matchedFields: string[]
  highlights: Record<string, string[]>
}


async function searchContent(
  userId: string | null,
  request: SearchRequest
): Promise<FeedResponse> {
  const normalizedQuery = normalizeSearchQuery(request.query)

  const searchResults = await executeSearch(normalizedQuery, request.filters)

  const sortedResults = sortSearchResults(searchResults, request.sort)

  const paginatedResults = paginateSearchResults(sortedResults, request.cursor, request.limit)

  const hydratedItems = await hydrateFeedItems(
    paginatedResults.items.map(r => ({
      id: r.contentId,
      contentType: "POLL" as const,
      creatorId: "",
      categories: [],
      reliabilityScore: 0,
      hotScore: 0,
      endsAt: null,
      source: "SEARCH" as const
    })),
    userId ?? "",
    false
  )

  if (userId) {
    await trackSearchQuery(userId, request.query)
  }

  return {
    items: hydratedItems,
    nextCursor: paginatedResults.nextCursor,
    hasMore: paginatedResults.hasMore,
    totalCount: searchResults.length
  }
}


function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\u00C0-\u017F-]/g, "")
}


async function executeSearch(
  query: string,
  filters?: FeedFilter
): Promise<SearchResult[]> {
  const terms = query.split(" ").filter(t => t.length >= 2)

  if (terms.length === 0) {
    return []
  }

  const searchConditions = terms.map(term => ({
    OR: [
      { title: { contains: term, mode: "insensitive" as const } },
      { description: { contains: term, mode: "insensitive" as const } },
      { questions: { some: { text: { contains: term, mode: "insensitive" as const } } } },
      { tags: { has: term } },
      { creator: { displayName: { contains: term, mode: "insensitive" as const } } }
    ]
  }))

  let whereClause: any = {
    AND: [
      { status: "ACTIVE" },
      { publishedAt: { not: null } },
      ...searchConditions
    ]
  }

  if (filters) {
    if (filters.contentTypes) {
      whereClause.contentType = { in: filters.contentTypes }
    }
    if (filters.categories) {
      whereClause.categories = { hasSome: filters.categories }
    }
    if (filters.minReliabilityScore) {
      whereClause.reliabilityScore = { gte: filters.minReliabilityScore }
    }
    if (filters.excludeExpired) {
      whereClause.OR = [
        { endsAt: null },
        { endsAt: { gt: new Date() } }
      ]
    }
  }

  const results = await db.content.findMany({
    where: whereClause,
    take: SEARCH_CONFIG.MAX_RESULTS,
    select: {
      id: true,
      title: true,
      description: true,
      hotScore: true,
      tags: true
    }
  })

  return results.map(content => {
    const relevanceScore = calculateRelevanceScore(content, terms)
    const matchedFields = findMatchedFields(content, terms)
    const highlights = generateHighlights(content, terms)

    return {
      contentId: content.id,
      relevanceScore,
      matchedFields,
      highlights
    }
  })
}


function calculateRelevanceScore(
  content: { title: string; description: string | null; hotScore: number; tags: string[] },
  terms: string[]
): number {
  let score = 0

  const titleLower = content.title.toLowerCase()
  const descLower = (content.description ?? "").toLowerCase()

  for (const term of terms) {
    if (titleLower.includes(term)) {
      score += SEARCH_CONFIG.TITLE_WEIGHT
    }
    if (descLower.includes(term)) {
      score += SEARCH_CONFIG.DESCRIPTION_WEIGHT
    }
    if (content.tags.some(tag => tag.toLowerCase().includes(term))) {
      score += SEARCH_CONFIG.TAG_WEIGHT
    }
  }

  score += content.hotScore * SEARCH_CONFIG.HOT_SCORE_BOOST_WEIGHT

  return score
}


function findMatchedFields(
  content: { title: string; description: string | null; tags: string[] },
  terms: string[]
): string[] {
  const matched: string[] = []

  const titleLower = content.title.toLowerCase()
  const descLower = (content.description ?? "").toLowerCase()

  for (const term of terms) {
    if (titleLower.includes(term)) matched.push("title")
    if (descLower.includes(term)) matched.push("description")
    if (content.tags.some(tag => tag.toLowerCase().includes(term))) matched.push("tags")
  }

  return [...new Set(matched)]
}


function generateHighlights(
  content: { title: string; description: string | null },
  terms: string[]
): Record<string, string[]> {
  const highlights: Record<string, string[]> = {}

  for (const term of terms) {
    const titleRegex = new RegExp(`(.{0,30})(${term})(.{0,30})`, "gi")
    const titleMatch = content.title.match(titleRegex)
    if (titleMatch) {
      highlights.title = titleMatch.map(m => m.replace(
        new RegExp(`(${term})`, "gi"),
        "<mark>$1</mark>"
      ))
    }
  }

  return highlights
}


function sortSearchResults(
  results: SearchResult[],
  sort: SearchSort
): SearchResult[] {
  switch (sort) {
    case "RELEVANCE":
      return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
    default:
      return results
  }
}


function paginateSearchResults(
  results: SearchResult[],
  cursor: string | undefined,
  limit: number
): { items: SearchResult[]; nextCursor: string | null; hasMore: boolean } {
  let startIndex = 0

  if (cursor) {
    const cursorIndex = results.findIndex(r => r.contentId === cursor)
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1
    }
  }

  const items = results.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < results.length
  const nextCursor = hasMore ? items[items.length - 1]?.contentId ?? null : null

  return { items, nextCursor, hasMore }
}


async function trackSearchQuery(userId: string, query: string): Promise<void> {
  await db.searchHistory.create({
    data: {
      userId,
      query: query.substring(0, 200),
      searchedAt: new Date()
    }
  })
}


async function getRecentSearches(userId: string): Promise<string[]> {
  const searches = await db.searchHistory.findMany({
    where: { userId },
    orderBy: { searchedAt: "desc" },
    take: SEARCH_CONFIG.RECENT_SEARCH_LIMIT,
    distinct: ["query"],
    select: { query: true }
  })

  return searches.map(s => s.query)
}


async function getPopularSearches(): Promise<Array<{ query: string; count: number }>> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const popularSearches = await db.searchHistory.groupBy({
    by: ["query"],
    where: {
      searchedAt: { gte: oneWeekAgo }
    },
    _count: { query: true },
    orderBy: {
      _count: { query: "desc" }
    },
    take: SEARCH_CONFIG.POPULAR_SEARCH_LIMIT
  })

  return popularSearches.map(s => ({
    query: s.query,
    count: s._count.query
  }))
}

export {
  searchContent,
  getRecentSearches,
  getPopularSearches
}
export type {
  SearchResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 11.7 FEED DATA MODELS
# ══════════════════════════════════════════════════════════════════════════════

## 11.7.1 Drizzle Feed Models

```typescript
// Drizzle schema
model UserInterestProfile {
  id                    String              @id @default(cuid())
  userId                String              @unique

  categoryScores        Json
  topCategories         String[]

  engagementHistory     Json
  preferredContentTypes Json
  activeHours           Int[]

  lastUpdatedAt         DateTime            @default(now())

  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}


model ContentView {
  id                    String              @id @default(cuid())
  userId                String
  contentId             String

  viewDurationMs        Int?
  scrollDepth           Float?

  viewedAt              DateTime            @default(now())

  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  content               Content             @relation(fields: [contentId], references: [id], onDelete: Cascade)

  @@index([userId, viewedAt])
  @@index([contentId])
}


model TrendingContent {
  id                    String              @id @default(cuid())
  contentId             String

  rank                  Int                 @db.SmallInt
  velocity              Float
  trendingScore         Float

  category              String?             @db.VarChar(50)

  calculatedAt          DateTime

  createdAt             DateTime            @default(now())

  content               Content             @relation(fields: [contentId], references: [id], onDelete: Cascade)

  @@index([category, rank])
  @@index([calculatedAt])
}


model SearchHistory {
  id                    String              @id @default(cuid())
  userId                String
  query                 String              @db.VarChar(200)
  searchedAt            DateTime            @default(now())

  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, searchedAt])
  @@index([query])
}


model FeedEvent {
  id                    String              @id @default(cuid())
  userId                String
  contentId             String

  eventType             FeedEventType
  feedType              String              @db.VarChar(20)
  position              Int?                @db.SmallInt

  metadata              Json?

  occurredAt            DateTime            @default(now())

  @@index([userId, occurredAt])
  @@index([contentId])
  @@index([eventType])
}


enum FeedEventType {
  IMPRESSION
  CLICK
  PARTICIPATION_START
  PARTICIPATION_COMPLETE
  SHARE
  SKIP
  HIDE
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 11.8 PERFORMANCE & CACHING
# ══════════════════════════════════════════════════════════════════════════════

## 11.8.1 Feed Caching Strategy

```typescript
const FEED_CACHE_CONFIG = {
  HOME_FEED: {
    prefix: "feed:home:",
    // [PERFORMANCE] Increased from 60s to 120s - user-specific feeds change slowly
    ttlSeconds: 120,
    maxItems: 100,
    // [PERFORMANCE] Invalidation events that should clear this cache
    invalidateOn: ["FOLLOW_CREATED", "FOLLOW_DELETED", "INTEREST_UPDATED"]
  },

  EXPLORE_FEED: {
    prefix: "feed:explore:",
    ttlSeconds: 300,
    maxItems: 200,
    // [PERFORMANCE] Explore is shared across users - higher cache hit rate
    sharedCache: true
  },

  TRENDING: {
    prefix: "feed:trending:",
    // [PERFORMANCE] Increased from 900s to 1800s (30 min) - trending doesn't need real-time
    ttlSeconds: 1800,
    maxItems: 50,
    sharedCache: true,
    // [PERFORMANCE] Precompute in background job
    precomputeEnabled: true,
    precomputeIntervalSeconds: 900
  },

  USER_INTERESTS: {
    prefix: "user:interests:",
    ttlSeconds: 3600,
    maxItems: 1
  },

  HOT_SCORES: {
    prefix: "content:hot:",
    // [PERFORMANCE] Aligned with HOT_SCORE_UPDATE_CONFIG.CACHE_TTL_SECONDS
    ttlSeconds: 300,
    maxItems: 10000
  },

  SEARCH_RESULTS: {
    prefix: "search:",
    ttlSeconds: 300,
    maxItems: 1000,
    // [PERFORMANCE] Use LRU eviction for search cache
    evictionPolicy: "LRU"
  }
} as const


const FEED_INDEX_DEFINITIONS = {
  CONTENT_HOT_SCORE: {
    table: "Content",
    columns: ["status", "hotScore"],
    type: "BTREE"
  },

  CONTENT_PUBLISHED: {
    table: "Content",
    columns: ["status", "publishedAt"],
    type: "BTREE"
  },

  CONTENT_CREATOR_PUBLISHED: {
    table: "Content",
    columns: ["creatorId", "publishedAt"],
    type: "BTREE"
  },

  CONTENT_CATEGORIES: {
    table: "Content",
    columns: ["categories"],
    type: "GIN"
  },

  CONTENT_FULLTEXT: {
    table: "Content",
    columns: ["title", "description"],
    type: "GIN",
    using: "gin_trgm_ops"
  },

  TRENDING_CATEGORY_RANK: {
    table: "TrendingContent",
    columns: ["category", "rank"],
    type: "BTREE"
  },

  USER_INTEREST_PROFILE: {
    table: "UserInterestProfile",
    columns: ["userId"],
    type: "BTREE",
    unique: true
  },

  CONTENT_VIEW_USER: {
    table: "ContentView",
    columns: ["userId", "viewedAt"],
    type: "BTREE"
  }
} as const

export {
  FEED_CACHE_CONFIG,
  FEED_INDEX_DEFINITIONS
}
```


## 11.8.2 Feed Performance Metrics

```typescript
const FEED_PERFORMANCE_TARGETS = {
  HOME_FEED_LATENCY_P50_MS: 100,
  HOME_FEED_LATENCY_P95_MS: 300,
  HOME_FEED_LATENCY_P99_MS: 500,

  EXPLORE_FEED_LATENCY_P50_MS: 150,
  EXPLORE_FEED_LATENCY_P95_MS: 400,
  EXPLORE_FEED_LATENCY_P99_MS: 800,

  SEARCH_LATENCY_P50_MS: 200,
  SEARCH_LATENCY_P95_MS: 500,
  SEARCH_LATENCY_P99_MS: 1000,

  HOT_SCORE_UPDATE_LATENCY_MS: 50,
  TRENDING_UPDATE_LATENCY_MS: 5000,

  CACHE_HIT_RATE_TARGET: 0.85
} as const


interface FeedMetrics {
  feedType: FeedType
  latencyMs: number
  candidateCount: number
  resultCount: number
  cacheHit: boolean
  personalizationApplied: boolean
  timestamp: Date
}


async function trackFeedMetrics(metrics: FeedMetrics): Promise<void> {
  await db.feedMetrics.create({
    data: {
      feedType: metrics.feedType,
      latencyMs: metrics.latencyMs,
      candidateCount: metrics.candidateCount,
      resultCount: metrics.resultCount,
      cacheHit: metrics.cacheHit,
      personalizationApplied: metrics.personalizationApplied,
      timestamp: metrics.timestamp
    }
  })
}

export {
  FEED_PERFORMANCE_TARGETS,
  trackFeedMetrics
}
export type {
  FeedMetrics
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 11.9 SEARCH & FILTERING UI FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 11.9.1 Search Bar Component

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SEARCH BAR UI STATES                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  DEFAULT STATE:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🔍  Anket, test veya kullanıcı ara...                           [⚙️]   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  FOCUSED STATE (Empty):                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🔍  |                                                            [✕]   │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  📜 Son Aramalar                                            [Temizle]   │   │
│  │  ├─ teknoloji anketleri                                                 │   │
│  │  ├─ yapay zeka                                                          │   │
│  │  └─ @techguru                                                           │   │
│  │                                                                         │   │
│  │  🔥 Popüler Aramalar                                                    │   │
│  │  ├─ #seçim2026                                                          │   │
│  │  ├─ en iyi dizi                                                         │   │
│  │  └─ spor tahminleri                                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  TYPING STATE (Autocomplete):                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🔍  tekno|                                                       [✕]   │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  💡 Öneriler                                                            │   │
│  │  ├─ 🔍 teknoloji                           (1,234 sonuç)               │   │
│  │  ├─ 🔍 teknoloji anketleri                 (456 sonuç)                 │   │
│  │  ├─ 🏷️ #teknoloji                         (892 etiketli)              │   │
│  │  └─ 👤 @teknoloji_haberleri               Doğrulanmış ✓               │   │
│  │                                                                         │   │
│  │  📊 Kategoriler                                                         │   │
│  │  └─ Teknoloji kategorisinde ara                                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  VOICE SEARCH STATE:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🎤  Dinleniyor...                                               [✕]   │   │
│  │  ════════════════════════════════════════════════════════════════════   │   │
│  │                     ▂ ▃ ▅ ▆ █ ▆ ▅ ▃ ▂                                   │   │
│  │                     (ses dalgası animasyonu)                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 11.9.2 Advanced Filter Panel

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FILTER PANEL UI                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        ARAMA FİLTRELERİ                          [✕]    │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  📋 İçerik Türü                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  [✓] Anket    [✓] Araştırma    [✓] Test                        │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  📁 Kategoriler                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  [✓] Teknoloji    [ ] Politika    [✓] Eğlence                  │   │   │
│  │  │  [ ] Spor         [ ] Bilim       [ ] Sağlık                   │   │   │
│  │  │  [ ] İş           [ ] Eğitim      [ ] Yaşam Tarzı              │   │   │
│  │  │                                           [Daha Fazla ▼]       │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  📅 Tarih Aralığı                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  ( ) Tüm Zamanlar                                               │   │   │
│  │  │  (•) Son 24 Saat                                                │   │   │
│  │  │  ( ) Son 7 Gün                                                  │   │   │
│  │  │  ( ) Son 30 Gün                                                 │   │   │
│  │  │  ( ) Özel Aralık: [____/____/____] - [____/____/____]          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ⭐ Güvenilirlik Puanı                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Min: [60]  ────●────────────────────  Max: [100]              │   │   │
│  │  │              ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔                       │   │   │
│  │  │              60%                        100%                    │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  👥 Katılımcı Sayısı                                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  ( ) Herhangi                                                   │   │   │
│  │  │  ( ) 10+ katılımcı                                              │   │   │
│  │  │  (•) 100+ katılımcı                                             │   │   │
│  │  │  ( ) 1000+ katılımcı                                            │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ✓ Doğrulanmış İçerik Oluşturucular                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  [✓] Sadece doğrulanmış kullanıcılardan içerik göster          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  🏢 Kuruluş Filtreleri                                [Premium 💎]      │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  [ ] Sadece kurumsal içerik                                     │   │   │
│  │  │  [ ] Sponsorlu içerikleri hariç tut                            │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  📊 Durum                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  [✓] Aktif    [ ] Sona Ermiş    [ ] Katıldıklarım              │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────     │   │
│  │                                                                         │   │
│  │  [Filtreleri Temizle]              [Bu Aramayı Kaydet]  [Uygula]       │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 11.9.3 Search Results Page

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SEARCH RESULTS PAGE                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🔍  teknoloji anketleri                                   [✕]  [⚙️]   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Tümü] [Anketler] [Araştırmalar] [Testler] [Kullanıcılar] [Etiketler] │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌────────────────────────────────────┐  ┌──────────────────────────────┐     │
│  │  "teknoloji anketleri" için        │  │  Sırala: [Alakalılık    ▼]  │     │
│  │  1,234 sonuç bulundu               │  │                              │     │
│  └────────────────────────────────────┘  └──────────────────────────────┘     │
│                                                                                 │
│  Aktif Filtreler: [Teknoloji ✕] [Son 7 Gün ✕] [100+ Katılımcı ✕] [Temizle]   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Avatar] @tech_expert                                    ✓ Doğrulanmış │   │
│  │                                                                         │   │
│  │  En İyi <mark>Teknoloji</mark> Trendleri 2026                          │   │
│  │  <mark>Anket</mark>: Sizce 2026'nın en önemli <mark>teknoloji</mark>   │   │
│  │  trendi hangisi olacak?                                                 │   │
│  │                                                                         │   │
│  │  📊 2,456 katılımcı  •  ⭐ 92%  •  🏷️ Teknoloji, AI                    │   │
│  │                                                                         │   │
│  │  [Katıl]                                            2 saat önce        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Logo] TechCorp Research                                  [Sponsorlu] │   │
│  │                                                                         │   │
│  │  Yazılımcıların <mark>Teknoloji</mark> Tercihleri Araştırması          │   │
│  │  <mark>Teknoloji</mark> sektöründeki profesyonellerin tercihlerini     │   │
│  │  anlamamıza yardımcı olun.                                             │   │
│  │                                                                         │   │
│  │  📊 5,123 katılımcı  •  ⭐ 88%  •  🏷️ Teknoloji, Kariyer              │   │
│  │  🎁 100 XP ödül                                                        │   │
│  │                                                                         │   │
│  │  [Araştırmayı Başlat]                                   1 gün önce    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Avatar] @quiz_master                                                  │   │
│  │                                                                         │   │
│  │  <mark>Teknoloji</mark> Bilgi Yarışması                                │   │
│  │  <mark>Teknoloji</mark> dünyası hakkında ne kadar bilgilisiniz?        │   │
│  │  10 soruluk teste katılın!                                             │   │
│  │                                                                         │   │
│  │  📊 892 katılımcı  •  ⭐ 95%  •  🏷️ Teknoloji, Eğitim                  │   │
│  │  ⏱️ ~5 dakika                                                          │   │
│  │                                                                         │   │
│  │  [Teste Başla]                                          3 gün önce    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  [Daha Fazla Yükle...]                                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 11.9.4 Sort Options

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SORT OPTIONS DROPDOWN                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Sırala: [Alakalılık ▼]                                                        │
│          ┌───────────────────────────────────┐                                 │
│          │  (•) Alakalılık                   │  ← Default for search           │
│          │  ( ) En Popüler                   │  ← By hot score                 │
│          │  ( ) En Yeni                      │  ← Most recent first            │
│          │  ( ) En Çok Katılımcı             │  ← By participant count         │
│          │  ( ) En Yüksek Güvenilirlik       │  ← By reliability score         │
│          │  ( ) Yakında Sona Erecek          │  ← Ending soon                  │
│          └───────────────────────────────────┘                                 │
│                                                                                 │
│  SORT BEHAVIOR BY TAB:                                                          │
│  ─────────────────────────────────────────────────────────────────────────     │
│  • Tümü (All):        Default to Alakalılık                                    │
│  • Anketler (Polls):  Default to En Popüler                                    │
│  • Araştırmalar:      Default to Alakalılık                                    │
│  • Testler:           Default to En Çok Katılımcı                              │
│  • Kullanıcılar:      Default to Alakalılık                                    │
│  • Etiketler:         Default to En Popüler                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 11.9.5 Saved Searches

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SAVED SEARCHES UI                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SAVE SEARCH MODAL:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       ARAMAYI KAYDET                              [✕]   │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  Arama Adı:                                                             │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  Teknoloji Anketleri                                            │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  Arama Sorgusu: "teknoloji anketleri"                                  │   │
│  │                                                                         │   │
│  │  Aktif Filtreler:                                                       │   │
│  │  • Kategori: Teknoloji                                                  │   │
│  │  • Tarih: Son 7 Gün                                                     │   │
│  │  • Min. Katılımcı: 100                                                  │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  [✓] Yeni sonuçlar için bildirim gönder                        │   │   │
│  │  │      Sıklık: [Günlük ▼]                                        │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │                                            [İptal]  [Kaydet]           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  SAVED SEARCHES LIST (Settings → Kayıtlı Aramalar):                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      KAYITLI ARAMALARIM                                 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  🔍 Teknoloji Anketleri                                         │   │   │
│  │  │     "teknoloji anketleri" • 3 filtre                            │   │   │
│  │  │     🔔 Günlük bildirim açık                                     │   │   │
│  │  │     Son çalıştırma: 2 saat önce • 12 yeni sonuç                 │   │   │
│  │  │                                                                 │   │   │
│  │  │     [Ara]  [Düzenle]  [Bildirimleri Kapat]  [Sil 🗑️]           │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  🔍 Spor Tahminleri                                             │   │   │
│  │  │     "spor tahmin" • 2 filtre                                    │   │   │
│  │  │     🔕 Bildirim kapalı                                          │   │   │
│  │  │     Son çalıştırma: 1 gün önce                                  │   │   │
│  │  │                                                                 │   │   │
│  │  │     [Ara]  [Düzenle]  [Bildirimleri Aç]  [Sil 🗑️]              │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  Kayıtlı Arama: 2/10 (Free tier limiti)                                │   │
│  │  [Plus'a yükselterek sınırsız arama kaydedin 💎]                       │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 11.9.6 Search & Filter TypeScript Implementation

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SEARCH & FILTERING UI TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface SearchBarState {
  query: string
  isFocused: boolean
  isLoading: boolean
  isVoiceActive: boolean
}

interface AutocompleteSuggestion {
  type: "QUERY" | "TAG" | "USER" | "CATEGORY"
  value: string
  displayText: string
  resultCount?: number
  metadata?: {
    isVerified?: boolean
    avatarUrl?: string
  }
}

interface SearchFilters {
  contentTypes: ("POLL" | "SURVEY" | "TEST")[]
  categories: string[]
  dateRange: {
    type: "ALL" | "24H" | "7D" | "30D" | "CUSTOM"
    customStart?: Date
    customEnd?: Date
  }
  reliabilityScore: {
    min: number
    max: number
  }
  participantCount: "ANY" | "10+" | "100+" | "1000+"
  verifiedOnly: boolean
  organizationFilters: {
    corporateOnly: boolean
    excludeSponsored: boolean
  }
  status: ("ACTIVE" | "ENDED" | "PARTICIPATED")[]
}

interface SavedSearch {
  id: string
  userId: string
  name: string
  query: string
  filters: SearchFilters
  notificationsEnabled: boolean
  notificationFrequency: "REALTIME" | "DAILY" | "WEEKLY"
  lastExecutedAt: Date | null
  newResultCount: number
  createdAt: Date
  updatedAt: Date
}

// ══════════════════════════════════════════════════════════════════════════════
// SAVED SEARCH LIMITS BY TIER
// ══════════════════════════════════════════════════════════════════════════════

const SAVED_SEARCH_LIMITS = {
  FREE: {
    maxSavedSearches: 10,
    notificationFrequencies: ["DAILY", "WEEKLY"] as const,
    canUseRealtimeNotifications: false
  },
  PLUS: {
    maxSavedSearches: 50,
    notificationFrequencies: ["REALTIME", "DAILY", "WEEKLY"] as const,
    canUseRealtimeNotifications: true
  },
  PREMIUM: {
    maxSavedSearches: Infinity,
    notificationFrequencies: ["REALTIME", "DAILY", "WEEKLY"] as const,
    canUseRealtimeNotifications: true
  },
  ORGANIZATION: {
    maxSavedSearches: Infinity,
    notificationFrequencies: ["REALTIME", "DAILY", "WEEKLY"] as const,
    canUseRealtimeNotifications: true
  }
} as const

// ══════════════════════════════════════════════════════════════════════════════
// AUTOCOMPLETE SERVICE
// ══════════════════════════════════════════════════════════════════════════════

const AUTOCOMPLETE_CONFIG = {
  minQueryLength: 2,
  maxSuggestions: 8,
  debounceMs: 150,
  cacheTimeMs: 60000
} as const

async function getAutocompleteSuggestions(
  query: string,
  userId?: string
): Promise<AutocompleteSuggestion[]> {
  if (query.length < AUTOCOMPLETE_CONFIG.minQueryLength) {
    return []
  }

  const normalizedQuery = query.toLowerCase().trim()
  const suggestions: AutocompleteSuggestion[] = []

  // Check if query starts with @ (user search)
  if (normalizedQuery.startsWith("@")) {
    const username = normalizedQuery.slice(1)
    const users = await db.user.findMany({
      where: {
        OR: [
          { username: { startsWith: username, mode: "insensitive" } },
          { displayName: { contains: username, mode: "insensitive" } }
        ]
      },
      take: 5,
      select: {
        username: true,
        displayName: true,
        isVerified: true,
        avatarUrl: true
      }
    })

    return users.map(user => ({
      type: "USER" as const,
      value: `@${user.username}`,
      displayText: `@${user.username}`,
      metadata: {
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl ?? undefined
      }
    }))
  }

  // Check if query starts with # (tag search)
  if (normalizedQuery.startsWith("#")) {
    const tag = normalizedQuery.slice(1)
    const tags = await db.content.groupBy({
      by: ["tags"],
      where: {
        tags: { has: tag }
      },
      _count: true,
      take: 5
    })

    return tags.map(t => ({
      type: "TAG" as const,
      value: `#${t.tags[0]}`,
      displayText: `#${t.tags[0]}`,
      resultCount: t._count
    }))
  }

  // Regular query suggestions
  const [querySuggestions, categorySuggestions] = await Promise.all([
    getQuerySuggestions(normalizedQuery),
    getCategorySuggestions(normalizedQuery)
  ])

  suggestions.push(...querySuggestions)
  suggestions.push(...categorySuggestions)

  return suggestions.slice(0, AUTOCOMPLETE_CONFIG.maxSuggestions)
}

async function getQuerySuggestions(query: string): Promise<AutocompleteSuggestion[]> {
  // Get popular searches matching the query
  const popularSearches = await db.searchHistory.groupBy({
    by: ["query"],
    where: {
      query: { startsWith: query, mode: "insensitive" },
      searchedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    _count: true,
    orderBy: { _count: { query: "desc" } },
    take: 5
  })

  // Get content title matches
  const contentMatches = await db.content.findMany({
    where: {
      status: "ACTIVE",
      title: { contains: query, mode: "insensitive" }
    },
    take: 3,
    select: { title: true }
  })

  const suggestions: AutocompleteSuggestion[] = []

  for (const search of popularSearches) {
    suggestions.push({
      type: "QUERY",
      value: search.query,
      displayText: search.query,
      resultCount: search._count
    })
  }

  for (const content of contentMatches) {
    if (!suggestions.some(s => s.value === content.title)) {
      suggestions.push({
        type: "QUERY",
        value: content.title,
        displayText: content.title
      })
    }
  }

  return suggestions
}

async function getCategorySuggestions(query: string): Promise<AutocompleteSuggestion[]> {
  const CATEGORY_LABELS: Record<string, string> = {
    TECHNOLOGY: "Teknoloji",
    POLITICS: "Politika",
    ENTERTAINMENT: "Eğlence",
    SPORTS: "Spor",
    SCIENCE: "Bilim",
    HEALTH: "Sağlık",
    BUSINESS: "İş",
    EDUCATION: "Eğitim",
    LIFESTYLE: "Yaşam Tarzı"
  }

  const matchingCategories = Object.entries(CATEGORY_LABELS)
    .filter(([, label]) => label.toLowerCase().includes(query))
    .map(([key, label]) => ({
      type: "CATEGORY" as const,
      value: key,
      displayText: `${label} kategorisinde ara`
    }))

  return matchingCategories.slice(0, 2)
}

// ══════════════════════════════════════════════════════════════════════════════
// SAVED SEARCH SERVICE
// ══════════════════════════════════════════════════════════════════════════════

async function createSavedSearch(
  userId: string,
  data: {
    name: string
    query: string
    filters: SearchFilters
    notificationsEnabled: boolean
    notificationFrequency: "REALTIME" | "DAILY" | "WEEKLY"
  }
): Promise<SavedSearch> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  })

  const tier = user?.subscriptionTier ?? "FREE"
  const limits = SAVED_SEARCH_LIMITS[tier as keyof typeof SAVED_SEARCH_LIMITS]

  // Check saved search count
  const existingCount = await db.savedSearch.count({
    where: { userId }
  })

  if (existingCount >= limits.maxSavedSearches) {
    throw new Error(
      `Kayıtlı arama limitine ulaştınız (${limits.maxSavedSearches}). ` +
      `Daha fazla arama kaydetmek için planınızı yükseltin.`
    )
  }

  // Validate notification frequency for tier
  if (
    data.notificationFrequency === "REALTIME" &&
    !limits.canUseRealtimeNotifications
  ) {
    throw new Error(
      "Anlık bildirimler Plus ve üzeri planlarda kullanılabilir."
    )
  }

  const savedSearch = await db.savedSearch.create({
    data: {
      userId,
      name: data.name,
      query: data.query,
      filters: data.filters as any,
      notificationsEnabled: data.notificationsEnabled,
      notificationFrequency: data.notificationFrequency,
      newResultCount: 0
    }
  })

  return savedSearch as unknown as SavedSearch
}

async function executeSavedSearch(
  savedSearchId: string,
  userId: string
): Promise<{ results: FeedResponse; newCount: number }> {
  const savedSearch = await db.savedSearch.findUnique({
    where: { id: savedSearchId }
  })

  if (!savedSearch || savedSearch.userId !== userId) {
    throw new Error("Kayıtlı arama bulunamadı")
  }

  const filters = savedSearch.filters as unknown as SearchFilters

  // Execute the search
  const searchRequest: SearchRequest = {
    query: savedSearch.query,
    filters: convertToFeedFilter(filters),
    sort: "RELEVANCE",
    limit: 20
  }

  const results = await searchContent(userId, searchRequest)

  // Calculate new results since last execution
  let newCount = 0
  if (savedSearch.lastExecutedAt) {
    newCount = await db.content.count({
      where: {
        status: "ACTIVE",
        publishedAt: { gt: savedSearch.lastExecutedAt },
        OR: [
          { title: { contains: savedSearch.query, mode: "insensitive" } },
          { description: { contains: savedSearch.query, mode: "insensitive" } }
        ]
      }
    })
  }

  // Update last executed time
  await db.savedSearch.update({
    where: { id: savedSearchId },
    data: {
      lastExecutedAt: new Date(),
      newResultCount: 0
    }
  })

  return { results, newCount }
}

async function deleteSavedSearch(
  savedSearchId: string,
  userId: string
): Promise<void> {
  const savedSearch = await db.savedSearch.findUnique({
    where: { id: savedSearchId }
  })

  if (!savedSearch || savedSearch.userId !== userId) {
    throw new Error("Kayıtlı arama bulunamadı")
  }

  await db.savedSearch.delete({
    where: { id: savedSearchId }
  })
}

async function updateSavedSearchNotifications(
  savedSearchId: string,
  userId: string,
  enabled: boolean,
  frequency?: "REALTIME" | "DAILY" | "WEEKLY"
): Promise<void> {
  const savedSearch = await db.savedSearch.findUnique({
    where: { id: savedSearchId }
  })

  if (!savedSearch || savedSearch.userId !== userId) {
    throw new Error("Kayıtlı arama bulunamadı")
  }

  if (enabled && frequency === "REALTIME") {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true }
    })

    const tier = user?.subscriptionTier ?? "FREE"
    const limits = SAVED_SEARCH_LIMITS[tier as keyof typeof SAVED_SEARCH_LIMITS]

    if (!limits.canUseRealtimeNotifications) {
      throw new Error(
        "Anlık bildirimler Plus ve üzeri planlarda kullanılabilir."
      )
    }
  }

  await db.savedSearch.update({
    where: { id: savedSearchId },
    data: {
      notificationsEnabled: enabled,
      ...(frequency && { notificationFrequency: frequency })
    }
  })
}

function convertToFeedFilter(filters: SearchFilters): FeedFilter {
  return {
    contentTypes: filters.contentTypes,
    categories: filters.categories as InterestCategory[],
    minReliabilityScore: filters.reliabilityScore.min,
    createdAfter: filters.dateRange.type === "CUSTOM"
      ? filters.dateRange.customStart
      : getDateFromRange(filters.dateRange.type),
    createdBefore: filters.dateRange.type === "CUSTOM"
      ? filters.dateRange.customEnd
      : undefined,
    excludeExpired: !filters.status.includes("ENDED")
  }
}

function getDateFromRange(type: string): Date | undefined {
  const now = Date.now()
  switch (type) {
    case "24H": return new Date(now - 24 * 60 * 60 * 1000)
    case "7D": return new Date(now - 7 * 24 * 60 * 60 * 1000)
    case "30D": return new Date(now - 30 * 24 * 60 * 60 * 1000)
    default: return undefined
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// RECENT & POPULAR SEARCHES
// ══════════════════════════════════════════════════════════════════════════════

async function getSearchSuggestionsForEmptyState(
  userId?: string
): Promise<{
  recentSearches: string[]
  popularSearches: Array<{ query: string; count: number }>
}> {
  const [recentSearches, popularSearches] = await Promise.all([
    userId ? getRecentSearches(userId) : Promise.resolve([]),
    getPopularSearches()
  ])

  return {
    recentSearches,
    popularSearches
  }
}

async function clearRecentSearches(userId: string): Promise<void> {
  await db.searchHistory.deleteMany({
    where: { userId }
  })
}

async function removeRecentSearch(
  userId: string,
  query: string
): Promise<void> {
  await db.searchHistory.deleteMany({
    where: { userId, query }
  })
}

export {
  SAVED_SEARCH_LIMITS,
  AUTOCOMPLETE_CONFIG,
  getAutocompleteSuggestions,
  createSavedSearch,
  executeSavedSearch,
  deleteSavedSearch,
  updateSavedSearchNotifications,
  getSearchSuggestionsForEmptyState,
  clearRecentSearches,
  removeRecentSearch
}

export type {
  SearchBarState,
  AutocompleteSuggestion,
  SearchFilters,
  SavedSearch
}
```


## 11.9.7 Saved Search Drizzle Model

```typescript
// Drizzle schema
model SavedSearch {
  id                      String                  @id @default(cuid())
  userId                  String

  name                    String                  @db.VarChar(100)
  query                   String                  @db.VarChar(200)
  filters                 Json

  notificationsEnabled    Boolean                 @default(false)
  notificationFrequency   SavedSearchNotifyFreq   @default(DAILY)

  lastExecutedAt          DateTime?
  newResultCount          Int                     @default(0)

  createdAt               DateTime                @default(now())
  updatedAt               DateTime                @updatedAt

  user                    User                    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([notificationsEnabled, notificationFrequency])
}

enum SavedSearchNotifyFreq {
  REALTIME
  DAILY
  WEEKLY
}
```


## 11.9.8 No Results State

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         NO RESULTS STATE                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │                         🔍                                              │   │
│  │                                                                         │   │
│  │              "xyz123abc" için sonuç bulunamadı                          │   │
│  │                                                                         │   │
│  │  Öneriler:                                                              │   │
│  │  • Farklı anahtar kelimeler deneyin                                    │   │
│  │  • Daha genel bir arama yapın                                          │   │
│  │  • Yazım hatası olup olmadığını kontrol edin                           │   │
│  │  • Filtreleri azaltmayı deneyin                                        │   │
│  │                                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────     │   │
│  │                                                                         │   │
│  │  Popüler Aramalar:                                                      │   │
│  │  [#teknoloji] [#seçim2026] [#spor] [#müzik]                            │   │
│  │                                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────     │   │
│  │                                                                         │   │
│  │  Ya da kendi içeriğinizi oluşturun:                                    │   │
│  │                                                                         │   │
│  │         [+ Yeni Anket]  [+ Yeni Araştırma]  [+ Yeni Test]              │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 11.9.9 Mobile Filter Bottom Sheet

```
┌───────────────────────────────────┐
│      MOBILE FILTER BOTTOM SHEET   │
├───────────────────────────────────┤
│                                   │
│  ┌───────────────────────────────┐│
│  │  ━━━━━━━                      ││ ← Drag handle
│  │                               ││
│  │  FİLTRELER              [✕]  ││
│  │                               ││
│  │  ──────────────────────────  ││
│  │                               ││
│  │  İçerik Türü                  ││
│  │  [Anket ✓] [Araştırma] [Test]││
│  │                               ││
│  │  ──────────────────────────  ││
│  │                               ││
│  │  Kategori              [▼]   ││
│  │  Seçilen: Teknoloji, Eğlence ││
│  │                               ││
│  │  ──────────────────────────  ││
│  │                               ││
│  │  Tarih                        ││
│  │  (•) Son 24 Saat             ││
│  │  ( ) Son 7 Gün               ││
│  │  ( ) Son 30 Gün              ││
│  │  ( ) Özel...                 ││
│  │                               ││
│  │  ──────────────────────────  ││
│  │                               ││
│  │  Güvenilirlik: 60% - 100%    ││
│  │  ○────────────●              ││
│  │                               ││
│  │  ──────────────────────────  ││
│  │                               ││
│  │  [✓] Sadece doğrulanmış      ││
│  │  [ ] Sponsorluları hariç tut ││
│  │                               ││
│  │  ══════════════════════════  ││
│  │                               ││
│  │  [Temizle]     [1234 Sonuç]  ││
│  │                [Uygula ▶]    ││
│  │                               ││
│  └───────────────────────────────┘│
│                                   │
└───────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 11
# ══════════════════════════════════════════════════════════════════════════════
