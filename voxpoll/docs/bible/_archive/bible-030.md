# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 30                                    █
# █              REMAINING GAPS & EDGE CASE SPECIFICATIONS                     █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████

# Version: 1.0.0
# Created: January 2026
# Purpose: Resolves ALL remaining inconsistencies, security gaps, performance issues
# Status: [AUTHORITATIVE] - These specifications OVERRIDE any conflicting content
# Depends: Bible-029 (builds upon pre-launch specs)




# ══════════════════════════════════════════════════════════════════════════════
# 30.1 REMAINING INCONSISTENCIES
# ══════════════════════════════════════════════════════════════════════════════

## 30.1.1 QUICK_POLL Quality Threshold - CLARIFIED

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-051: QUICK_POLL Quality Scoring Exception                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  APPARENT CONFLICT:                                                             │
│  • Bible-023: QUICK_POLL has qualityThreshold: 0 (fraud-only check)            │
│  • Bible-009/020: All content types have quality scoring                       │
│                                                                                 │
│  AUTHORITATIVE CLARIFICATION:                                                   │
│  This is INTENTIONAL design, not a conflict.                                   │
│                                                                                 │
│  RATIONALE:                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ QUICK_POLL is designed for rapid, low-friction participation.           │   │
│  │ Quality scoring adds latency and friction that defeats the purpose.     │   │
│  │                                                                         │   │
│  │ Instead of quality scoring, QUICK_POLL relies on:                       │   │
│  │ 1. Fraud detection (duplicate prevention, rate limiting)                │   │
│  │ 2. User reliability score (pre-calculated, not per-response)            │   │
│  │ 3. Simple vote counting (no complex analytics needed)                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  CONTENT TYPE QUALITY REQUIREMENTS:                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Content Type    │ Quality Score │ Fraud Check │ Reliability │ Rationale │   │
│  ├─────────────────┼───────────────┼─────────────┼─────────────┼───────────┤   │
│  │ QUICK_POLL      │ Disabled (0)  │ Yes         │ Post-hoc    │ Speed     │   │
│  │ EXTENDED_POLL   │ Enabled (0.6) │ Yes         │ Real-time   │ Accuracy  │   │
│  │ LIVE_POLL       │ Disabled (0)  │ Yes         │ Post-hoc    │ Speed     │   │
│  │ TEST            │ Enabled (0.7) │ Yes         │ Real-time   │ Integrity │   │
│  │ SURVEY          │ Enabled (0.5) │ Yes         │ Real-time   │ Quality   │   │
│  └─────────────────┴───────────────┴─────────────┴─────────────┴───────────┘   │
│                                                                                 │
│  DOCUMENTATION NOTE:                                                            │
│  Update developer documentation to explain this intentional exception.         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.1.2 Response Retention Policy - UNIFIED

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-052: Response Data Lifecycle - AUTHORITATIVE                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  APPARENT CONFLICT:                                                             │
│  • Bible-017 (GDPR): Responses are anonymized, never deleted                   │
│  • Bible-005: Account deletion → 30-day retention then auto-deletion           │
│                                                                                 │
│  AUTHORITATIVE RESOLUTION:                                                      │
│  Both are correct - they apply to DIFFERENT scenarios.                         │
│                                                                                 │
│  DATA LIFECYCLE MATRIX:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Trigger              │ Personal Data    │ Response Data   │ Analytics   │   │
│  ├──────────────────────┼──────────────────┼─────────────────┼─────────────┤   │
│  │ User requests delete │ Deleted (30 days)│ ANONYMIZED      │ Preserved   │   │
│  │ GDPR erasure request │ Deleted (30 days)│ ANONYMIZED      │ Preserved   │   │
│  │ Account inactive 2yr │ Soft-deleted     │ ANONYMIZED      │ Preserved   │   │
│  │ Content deleted      │ N/A              │ ANONYMIZED      │ Preserved   │   │
│  │ Org member removed   │ Org data deleted │ ANONYMIZED      │ Preserved   │   │
│  └──────────────────────┴──────────────────┴─────────────────┴─────────────┘   │
│                                                                                 │
│  ANONYMIZATION PROCESS:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: Generate new random participantHash (not linked to user)        │   │
│  │ Step 2: Remove userId foreign key (set to NULL)                         │   │
│  │ Step 3: Remove IP address, device fingerprint                           │   │
│  │ Step 4: Preserve: responseData, timestamp, contentId                    │   │
│  │ Step 5: Update analytics aggregates (no re-calculation needed)          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  30-DAY GRACE PERIOD BEHAVIOR:                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Day 0: User requests deletion                                           │   │
│  │        → Account marked as "pending_deletion"                           │   │
│  │        → User logged out of all sessions                                │   │
│  │        → Login blocked with message: "Account deletion in progress"     │   │
│  │                                                                         │   │
│  │ Day 1-29: Grace period                                                  │   │
│  │        → User can contact support to cancel deletion                    │   │
│  │        → No new logins allowed                                          │   │
│  │        → Data still exists but inaccessible                             │   │
│  │                                                                         │   │
│  │ Day 30: Final deletion                                                  │   │
│  │        → Personal data permanently deleted                              │   │
│  │        → Responses anonymized (not deleted)                             │   │
│  │        → Email sent: "Your account has been deleted"                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  REACTIVATION DURING GRACE PERIOD:                                              │
│  • User contacts support with identity verification                            │
│  • Support can cancel deletion within 30 days                                  │
│  • After cancellation: Account fully restored, no data loss                    │
│  • User must re-verify email after reactivation                                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.1.3 Live Poll Capacity Threshold - SPECIFIED

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-053: Live Poll Capacity Management                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP IDENTIFIED:                                                                │
│  • Bible-006: Max 10,000 concurrent participants                               │
│  • Bible-029: Spectator mode (1,000 limit)                                     │
│  • UNDEFINED: When to show waiting room, threshold triggers                    │
│                                                                                 │
│  CAPACITY THRESHOLDS:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Participants │ Status      │ UI Indicator          │ System Action      │   │
│  ├──────────────┼─────────────┼───────────────────────┼────────────────────┤   │
│  │ 0 - 7,000    │ Normal      │ None                  │ Normal operation   │   │
│  │ 7,001-9,000  │ Busy        │ "High traffic"        │ Monitor closely    │   │
│  │ 9,001-9,500  │ Near Full   │ "Almost full"         │ Warn new joiners   │   │
│  │ 9,501-10,000 │ Critical    │ "Limited spots left"  │ Queue new joiners  │   │
│  │ 10,001+      │ Full        │ "Session full"        │ Waiting room only  │   │
│  └──────────────┴─────────────┴───────────────────────┴────────────────────┘   │
│                                                                                 │
│  WAITING ROOM SPECIFICATION:                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Feature                  │ Specification                                │   │
│  ├──────────────────────────┼────────────────────────────────────────────────┤   │
│  │ Max waiting room size    │ 1,000 users                                  │   │
│  │ Queue order              │ FIFO (first in, first out)                   │   │
│  │ Position updates         │ Every 5 seconds                              │   │
│  │ Can see live results?    │ Yes (spectator mode)                         │   │
│  │ Can vote from queue?     │ No, must be promoted first                   │   │
│  │ Auto-promotion           │ Yes, when participant leaves                 │   │
│  │ Promotion notification   │ "You can now vote!" + sound                  │   │
│  │ Leave queue option       │ Yes, anytime                                 │   │
│  │ Estimated wait display   │ Based on avg session duration                │   │
│  └──────────────────────────┴────────────────────────────────────────────────┘   │
│                                                                                 │
│  WAITING ROOM UI:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🔴 LIVE  "Which framework do you prefer?"                             │   │
│  │                                                                         │   │
│  │  Session is at capacity                                                 │   │
│  │  Your position in queue: #42                                           │   │
│  │  Estimated wait: ~3 minutes                                            │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────┐       │   │
│  │  │  Live Results (view only)                                   │       │   │
│  │  │  React ████████████████████ 45%                             │       │   │
│  │  │  Vue   ██████████████ 32%                                   │       │   │
│  │  │  Svelte████████ 23%                                         │       │   │
│  │  │                                                             │       │   │
│  │  │  1,247 votes • 10,000 participants                          │       │   │
│  │  └─────────────────────────────────────────────────────────────┘       │   │
│  │                                                                         │   │
│  │  [Leave Queue]                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  BEYOND CAPACITY (>11,000 total):                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Session is at maximum capacity                                         │   │
│  │                                                                         │   │
│  │  Both the session and waiting room are full.                           │   │
│  │  Please try again later or watch the results after it ends.            │   │
│  │                                                                         │   │
│  │  [Get Notified When Results Are Ready]  [Go Back]                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 30.2 PERFORMANCE OPTIMIZATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 30.2.1 Reliability Score - Incremental Calculation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-054: Incremental Reliability Score Calculation                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PROBLEM:                                                                       │
│  • Bible-004 §4.3.1 recalculates ALL factors on every response                 │
│  • At 10K concurrent: 10K score calculations/second = CPU bottleneck           │
│                                                                                 │
│  SOLUTION: Incremental scoring with periodic full recalculation                 │
│                                                                                 │
│  ARCHITECTURE:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐               │   │
│  │  │ New Response│────▶│ Quick Delta │────▶│ Update Cache│               │   │
│  │  └─────────────┘     │ Calculation │     └─────────────┘               │   │
│  │                      └─────────────┘            │                       │   │
│  │                            │                    │                       │   │
│  │                      ~5ms latency          Write to Redis               │   │
│  │                                                 │                       │   │
│  │  ┌─────────────┐                          ┌─────▼─────┐               │   │
│  │  │ Cron Job    │─────────────────────────▶│ Full Recalc│               │   │
│  │  │ (hourly)    │                          │ (async)    │               │   │
│  │  └─────────────┘                          └───────────┘               │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  QUICK DELTA CALCULATION:                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ // Only update the affected component                                   │   │
│  │                                                                         │   │
│  │ On new response:                                                        │   │
│  │   consistency_delta = (new_response_consistency - avg) / total_count   │   │
│  │   new_score = old_score + (consistency_delta * weight)                 │   │
│  │                                                                         │   │
│  │ Weights (pre-calculated, cached):                                       │   │
│  │   response_consistency: 0.25                                           │   │
│  │   time_pattern: 0.20 (updated hourly, not per-response)                │   │
│  │   cross_validation: 0.20 (updated hourly)                              │   │
│  │   completion_rate: 0.15 (updated per-response)                         │   │
│  │   account_age: 0.10 (static after signup)                              │   │
│  │   verification_level: 0.10 (static after verification)                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  CACHING STRATEGY:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Key                        │ TTL      │ Invalidation                   │   │
│  ├────────────────────────────┼──────────┼────────────────────────────────┤   │
│  │ reliability:{userId}       │ 1 hour   │ On full recalc                 │   │
│  │ reliability:{userId}:delta │ 5 min    │ On new response                │   │
│  │ reliability:weights        │ 24 hours │ On config change               │   │
│  │ reliability:avg:{segment}  │ 1 hour   │ On hourly job                  │   │
│  └────────────────────────────┴──────────┴────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// File: src/reliability/incremental-score.ts
// [AUTHORITATIVE] Incremental reliability score calculation

interface ReliabilityComponents {
  responseConsistency: number  // 0-1
  timePattern: number          // 0-1
  crossValidation: number      // 0-1
  completionRate: number       // 0-1
  accountAge: number           // 0-1
  verificationLevel: number    // 0-1
}

interface CachedReliability {
  score: number
  components: ReliabilityComponents
  responseCount: number
  lastFullRecalc: Date
  lastDeltaUpdate: Date
}

const WEIGHTS = {
  responseConsistency: 0.25,
  timePattern: 0.20,
  crossValidation: 0.20,
  completionRate: 0.15,
  accountAge: 0.10,
  verificationLevel: 0.10
}

async function updateReliabilityOnResponse(
  redis: Redis,
  userId: string,
  responseConsistency: number,
  completedSurvey: boolean
): Promise<number> {
  const cacheKey = `reliability:${userId}`
  const cached = await redis.get(cacheKey)

  if (!cached) {
    // No cache, queue full calculation
    await queueFullRecalculation(userId)
    return 0.5 // Default score while calculating
  }

  const reliability: CachedReliability = JSON.parse(cached)
  const oldCount = reliability.responseCount
  const newCount = oldCount + 1

  // Incremental update for responseConsistency
  const oldConsistency = reliability.components.responseConsistency
  const newConsistency = ((oldConsistency * oldCount) + responseConsistency) / newCount

  // Incremental update for completionRate
  const oldCompletion = reliability.components.completionRate
  const completionDelta = completedSurvey ? 1 : 0
  const newCompletion = ((oldCompletion * oldCount) + completionDelta) / newCount

  // Calculate new score (only updating changed components)
  const consistencyDelta = (newConsistency - oldConsistency) * WEIGHTS.responseConsistency
  const completionDeltaScore = (newCompletion - oldCompletion) * WEIGHTS.completionRate

  const newScore = Math.max(0, Math.min(1,
    reliability.score + consistencyDelta + completionDeltaScore
  ))

  // Update cache
  const updated: CachedReliability = {
    score: newScore,
    components: {
      ...reliability.components,
      responseConsistency: newConsistency,
      completionRate: newCompletion
    },
    responseCount: newCount,
    lastFullRecalc: reliability.lastFullRecalc,
    lastDeltaUpdate: new Date()
  }

  await redis.setex(cacheKey, 3600, JSON.stringify(updated))

  return newScore
}

async function queueFullRecalculation(userId: string): Promise<void> {
  // Add to background job queue
  await jobQueue.add('reliability:full-recalc', { userId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  })
}

// Hourly job for full recalculation
async function fullRecalculationJob(userId: string): Promise<void> {
  const components = await calculateAllComponents(userId)

  const score =
    components.responseConsistency * WEIGHTS.responseConsistency +
    components.timePattern * WEIGHTS.timePattern +
    components.crossValidation * WEIGHTS.crossValidation +
    components.completionRate * WEIGHTS.completionRate +
    components.accountAge * WEIGHTS.accountAge +
    components.verificationLevel * WEIGHTS.verificationLevel

  const reliability: CachedReliability = {
    score,
    components,
    responseCount: await getResponseCount(userId),
    lastFullRecalc: new Date(),
    lastDeltaUpdate: new Date()
  }

  await redis.setex(`reliability:${userId}`, 3600, JSON.stringify(reliability))

  // Also update database (for persistence) - Drizzle-style
  await db.update(users)
    .set({ reliabilityScore: score })
    .where(eq(users.id, userId))
}

export { updateReliabilityOnResponse, queueFullRecalculation, fullRecalculationJob }
```


## 30.2.2 Analytics Query Optimization

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-055: Analytics Query Optimization                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PROBLEM:                                                                       │
│  • Bible-008: calculateVotesPerMinute() filters entire votes array in memory   │
│  • At 100K responses: Loads all responses into memory per query                │
│                                                                                 │
│  SOLUTION: Time-bucketed aggregation with materialized views                    │
│                                                                                 │
│  DATABASE SCHEMA ADDITION:                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Table: analytics_time_bucket                                            │   │
│  │ ├── id: CUID                                                            │   │
│  │ ├── contentId: String (FK → Content)                                    │   │
│  │ ├── bucketStart: DateTime (minute precision)                            │   │
│  │ ├── bucketEnd: DateTime                                                 │   │
│  │ ├── voteCount: Int                                                      │   │
│  │ ├── uniqueVoters: Int                                                   │   │
│  │ ├── optionBreakdown: Json ({ optionId: count })                         │   │
│  │ └── createdAt: DateTime                                                 │   │
│  │                                                                         │   │
│  │ Index: (contentId, bucketStart) UNIQUE                                  │   │
│  │ Index: (bucketStart) for time-range queries                             │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  AGGREGATION STRATEGY:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Time Range        │ Bucket Size │ Storage Duration │ Query Pattern      │   │
│  ├───────────────────┼─────────────┼──────────────────┼────────────────────┤   │
│  │ Last 1 hour       │ 1 minute    │ 24 hours         │ Real-time charts   │   │
│  │ Last 24 hours     │ 15 minutes  │ 7 days           │ Daily trends       │   │
│  │ Last 7 days       │ 1 hour      │ 30 days          │ Weekly reports     │   │
│  │ Last 30 days      │ 1 day       │ 1 year           │ Monthly reports    │   │
│  │ Older than 30 days│ 1 week      │ Forever          │ Historical         │   │
│  └───────────────────┴─────────────┴──────────────────┴────────────────────┘   │
│                                                                                 │
│  REAL-TIME AGGREGATION:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ On each vote:                                                           │   │
│  │ 1. Increment Redis counter: analytics:{contentId}:{minute}              │   │
│  │ 2. Every 60 seconds: Flush Redis to analytics_time_bucket table         │   │
│  │ 3. Query reads from both Redis (current minute) and DB (past minutes)   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// File: src/analytics/time-bucket.ts
// [AUTHORITATIVE] Time-bucketed analytics aggregation

interface TimeBucket {
  bucketStart: Date
  voteCount: number
  uniqueVoters: number
  optionBreakdown: Record<string, number>
}

// Increment vote count in Redis (real-time)
async function recordVote(
  redis: Redis,
  contentId: string,
  optionId: string,
  participantHash: string
): Promise<void> {
  const minute = Math.floor(Date.now() / 60000) * 60000
  const bucketKey = `analytics:${contentId}:${minute}`

  // Increment total count
  await redis.hincrby(bucketKey, 'total', 1)

  // Increment option count
  await redis.hincrby(bucketKey, `opt:${optionId}`, 1)

  // Track unique voters with HyperLogLog
  await redis.pfadd(`${bucketKey}:unique`, participantHash)

  // Set expiry (2 hours to allow for flush delays)
  await redis.expire(bucketKey, 7200)
  await redis.expire(`${bucketKey}:unique`, 7200)
}

// Flush Redis buckets to database (runs every 60 seconds)
async function flushBucketsToDatabase(
  redis: Redis,
  db: DrizzleClient
): Promise<void> {
  const now = Date.now()
  const currentMinute = Math.floor(now / 60000) * 60000
  const flushBefore = currentMinute - 60000 // Flush completed minutes only

  // Find all bucket keys
  const keys = await redis.keys('analytics:*')

  for (const key of keys) {
    const [, contentId, timestamp] = key.split(':')
    const bucketTime = parseInt(timestamp)

    // Skip current minute (still accumulating)
    if (bucketTime >= flushBefore) continue

    // Get bucket data
    const data = await redis.hgetall(key)
    const uniqueCount = await redis.pfcount(`${key}:unique`)

    if (!data.total) continue

    // Build option breakdown
    const optionBreakdown: Record<string, number> = {}
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith('opt:')) {
        optionBreakdown[k.slice(4)] = parseInt(v)
      }
    }

    // Upsert to database (Drizzle-style)
    await db.insert(analyticsTimeBuckets).values({
      contentId,
      bucketStart: new Date(bucketTime),
      bucketEnd: new Date(bucketTime + 60000),
      voteCount: parseInt(data.total),
      uniqueVoters: uniqueCount,
      optionBreakdown
    }).onConflictDoUpdate({
      target: [analyticsTimeBuckets.contentId, analyticsTimeBuckets.bucketStart],
      set: {
        voteCount: parseInt(data.total),
        uniqueVoters: uniqueCount,
        optionBreakdown
      }
    })

    // Delete flushed bucket from Redis
    await redis.del(key)
    await redis.del(`${key}:unique`)
  }
}

// Query votes per minute (optimized)
async function getVotesPerMinute(
  db: DrizzleClient,
  redis: Redis,
  contentId: string,
  startTime: Date,
  endTime: Date
): Promise<TimeBucket[]> {
  // Get from database (Drizzle-style)
  const dbBuckets = await db.select().from(analyticsTimeBuckets)
    .where(and(
      eq(analyticsTimeBuckets.contentId, contentId),
      gte(analyticsTimeBuckets.bucketStart, startTime),
      lte(analyticsTimeBuckets.bucketStart, endTime)
    ))
    .orderBy(asc(analyticsTimeBuckets.bucketStart))

  // Get current minute from Redis (not yet flushed)
  const currentMinute = Math.floor(Date.now() / 60000) * 60000
  const currentKey = `analytics:${contentId}:${currentMinute}`
  const currentData = await redis.hgetall(currentKey)

  const results: TimeBucket[] = dbBuckets.map(b => ({
    bucketStart: b.bucketStart,
    voteCount: b.voteCount,
    uniqueVoters: b.uniqueVoters,
    optionBreakdown: b.optionBreakdown as Record<string, number>
  }))

  // Add current minute if within range
  if (currentData.total && new Date(currentMinute) >= startTime) {
    const optionBreakdown: Record<string, number> = {}
    for (const [k, v] of Object.entries(currentData)) {
      if (k.startsWith('opt:')) {
        optionBreakdown[k.slice(4)] = parseInt(v)
      }
    }

    results.push({
      bucketStart: new Date(currentMinute),
      voteCount: parseInt(currentData.total),
      uniqueVoters: await redis.pfcount(`${currentKey}:unique`),
      optionBreakdown
    })
  }

  return results
}

export { recordVote, flushBucketsToDatabase, getVotesPerMinute }
```


## 30.2.3 Trending Algorithm Optimization

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-056: Trending Content Algorithm                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PROBLEM:                                                                       │
│  • Bible-002 §2.4.3: 30-second cache with full recalculation                   │
│  • At 1M content items: 2,880 calculations/day = massive CPU usage             │
│                                                                                 │
│  SOLUTION: Count-Min Sketch + Decay-based scoring                               │
│                                                                                 │
│  ALGORITHM:                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Trending Score = (recent_activity * recency_weight) + (velocity * 0.3)  │   │
│  │                                                                         │   │
│  │ Where:                                                                  │   │
│  │ - recent_activity = Count-Min Sketch estimate for last hour            │   │
│  │ - recency_weight = e^(-0.1 * hours_since_publish)                      │   │
│  │ - velocity = (current_hour_count - prev_hour_count) / prev_hour_count  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  COUNT-MIN SKETCH CONFIG:                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Parameter    │ Value    │ Rationale                                    │   │
│  ├──────────────┼──────────┼──────────────────────────────────────────────┤   │
│  │ Width        │ 10,000   │ Handles 1M items with <1% error              │   │
│  │ Depth        │ 7        │ 7 hash functions for accuracy                │   │
│  │ Window       │ 1 hour   │ Rolling window for "trending"                │   │
│  │ Decay rate   │ 0.9/hour │ Older activity counts less                   │   │
│  └──────────────┴──────────┴──────────────────────────────────────────────┘   │
│                                                                                 │
│  CACHE LAYERS:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Layer              │ TTL      │ Content                                 │   │
│  ├────────────────────┼──────────┼─────────────────────────────────────────┤   │
│  │ Hot cache (Redis)  │ 30 sec   │ Top 100 trending content IDs            │   │
│  │ Warm cache (Redis) │ 5 min    │ Top 1000 trending with scores           │   │
│  │ Count-Min Sketch   │ 1 hour   │ Activity counts for all content         │   │
│  │ Background job     │ 5 min    │ Full recalculation of top 1000          │   │
│  └────────────────────┴──────────┴─────────────────────────────────────────┘   │
│                                                                                 │
│  MIGRATION STRATEGY:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Content Count │ Algorithm                                               │   │
│  ├───────────────┼─────────────────────────────────────────────────────────┤   │
│  │ < 10,000      │ Full recalculation (original algorithm)                 │   │
│  │ 10,000-100,000│ Hybrid (full recalc + CMS for hot detection)            │   │
│  │ > 100,000     │ Count-Min Sketch only                                   │   │
│  └───────────────┴─────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.2.4 Database Connection Pool Guidelines

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-057: Database Connection Pool Configuration                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: Bible-023 has pool config but no guidance on tuning                       │
│                                                                                 │
│  CONNECTION POOL SETTINGS BY SCALE:                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Daily Active Users │ min_pool │ max_pool │ connection_timeout │ idle    │   │
│  ├────────────────────┼──────────┼──────────┼────────────────────┼─────────┤   │
│  │ < 1,000 (Dev)      │ 2        │ 10       │ 5 seconds          │ 60 sec  │   │
│  │ 1,000 - 10,000     │ 5        │ 20       │ 5 seconds          │ 120 sec │   │
│  │ 10,000 - 100,000   │ 10       │ 50       │ 3 seconds          │ 180 sec │   │
│  │ > 100,000          │ 20       │ 100      │ 3 seconds          │ 300 sec │   │
│  └────────────────────┴──────────┴──────────┴────────────────────┴─────────┘   │
│                                                                                 │
│  DRIZZLE CONFIGURATION:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ // drizzle.config.ts                                                    │   │
│  │ export default defineConfig({                                           │   │
│  │   dialect: "postgresql",                                                │   │
│  │   dbCredentials: { url: process.env.DATABASE_URL }                      │   │
│  │ })                                                                      │   │
│  │                                                                         │   │
│  │ // Connection string with pool params:                                  │   │
│  │ // postgresql://user:pass@host/db?connection_limit=50&pool_timeout=3    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  MONITORING THRESHOLDS:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Metric                    │ Warning    │ Critical   │ Action            │   │
│  ├───────────────────────────┼────────────┼────────────┼───────────────────┤   │
│  │ Pool utilization          │ 70%        │ 90%        │ Increase max_pool │   │
│  │ Connection wait time      │ 100ms      │ 500ms      │ Increase pool     │   │
│  │ Idle connections          │ 50%        │ 70%        │ Decrease min_pool │   │
│  │ Connection errors/min     │ 5          │ 20         │ Check DB health   │   │
│  │ Query time p95            │ 100ms      │ 500ms      │ Query optimization│   │
│  └───────────────────────────┴────────────┴────────────┴───────────────────┘   │
│                                                                                 │
│  SERVERLESS CONSIDERATIONS (Vercel):                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Problem: Serverless functions can exhaust connection pool               │   │
│  │                                                                         │   │
│  │ Solution: Use PgBouncer or Neon/Supabase pooler                         │   │
│  │ - PgBouncer: Self-hosted, transaction mode                              │   │
│  │ - Neon/Supabase: Managed serverless pooling                             │   │
│  │                                                                         │   │
│  │ Config for serverless:                                                  │   │
│  │ - connection_limit=1 per function instance                              │   │
│  │ - Use external pooler for actual pooling                                │   │
│  │ - Set pool_timeout=10 (longer for cold starts)                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.2.5 Cascade Delete Safety

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-058: Cascade Delete Protection                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  RISK: Bible-013 has 41 onDelete: Cascade relationships                         │
│        Delete org → cascades to all surveys → all responses                     │
│                                                                                 │
│  PROTECTION STRATEGY:                                                           │
│                                                                                 │
│  1. SOFT DELETE FOR HIGH-VALUE ENTITIES:                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Entity           │ Delete Type │ Recovery Window │ Hard Delete After    │   │
│  ├──────────────────┼─────────────┼─────────────────┼──────────────────────┤   │
│  │ User             │ Soft        │ 30 days         │ 30 days              │   │
│  │ Organization     │ Soft        │ 30 days         │ 30 days              │   │
│  │ Poll/Test/Survey │ Soft        │ 7 days          │ 90 days              │   │
│  │ Response         │ Anonymize   │ N/A             │ Never (anonymized)   │   │
│  │ Comment          │ Soft        │ 24 hours        │ 30 days              │   │
│  │ Badge            │ Preserve    │ N/A             │ Never                │   │
│  └──────────────────┴─────────────┴─────────────────┴──────────────────────┘   │
│                                                                                 │
│  2. CASCADE PREVENTION MIDDLEWARE:                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ // Drizzle wrapper to intercept dangerous deletes                       │   │
│  │                                                                         │   │
│  │ async function safeDelete<T extends PgTable>(                           │   │
│  │   table: T,                                                             │   │
│  │   condition: SQL                                                        │   │
│  │ ) {                                                                     │   │
│  │   const tableName = getTableConfig(table).name                          │   │
│  │                                                                         │   │
│  │   // Entities requiring soft delete                                     │   │
│  │   if (['users', 'organizations', 'content'].includes(tableName)) {      │   │
│  │     // Convert to soft delete                                           │   │
│  │     return db.update(table)                                             │   │
│  │       .set({ deletedAt: new Date(), status: 'DELETED' })                │   │
│  │       .where(condition)                                                 │   │
│  │   }                                                                     │   │
│  │   return db.delete(table).where(condition)                              │   │
│  │ }                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  3. HARD DELETE PROCESS (Admin only):                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: Verify soft-delete age > recovery window                        │   │
│  │ Step 2: Create backup snapshot                                          │   │
│  │ Step 3: Anonymize all responses (don't delete)                          │   │
│  │ Step 4: Delete in order: Comments → Responses → Content → User/Org      │   │
│  │ Step 5: Log deletion with admin ID, reason, timestamp                   │   │
│  │ Step 6: Retain audit log for 7 years                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  4. RECOVERY PROCESS:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ User requests recovery within window:                                   │   │
│  │ 1. Verify identity (email + last password)                              │   │
│  │ 2. Clear deletedAt flag                                                 │   │
│  │ 3. Restore status to ACTIVE                                             │   │
│  │ 4. Re-link any orphaned content                                         │   │
│  │ 5. Send confirmation email                                              │   │
│  │                                                                         │   │
│  │ Admin recovery (after window):                                          │   │
│  │ 1. Requires support ticket                                              │   │
│  │ 2. Check if hard delete occurred                                        │   │
│  │ 3. If not hard deleted: Standard recovery                               │   │
│  │ 4. If hard deleted: Restore from backup (if available)                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.2.6 Fraud Detection Async Processing

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-059: Async Fraud Detection Pipeline                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PROBLEM:                                                                       │
│  • Bible-009: Fraud scoring on every response (synchronous)                    │
│  • At 10K responses/sec: Fraud detection becomes bottleneck                    │
│                                                                                 │
│  SOLUTION: Two-phase detection (fast sync + thorough async)                     │
│                                                                                 │
│  PHASE 1: SYNCHRONOUS (< 10ms)                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Check                        │ Action on Fail        │ Latency          │   │
│  ├──────────────────────────────┼───────────────────────┼──────────────────┤   │
│  │ Rate limit (Redis)           │ Block immediately     │ ~1ms             │   │
│  │ IP blocklist (Redis)         │ Block immediately     │ ~1ms             │   │
│  │ Device blocklist (Redis)     │ Block immediately     │ ~1ms             │   │
│  │ Duplicate check (Bloom)      │ Block immediately     │ ~2ms             │   │
│  │ Basic velocity (Redis)       │ Flag for Phase 2      │ ~2ms             │   │
│  └──────────────────────────────┴───────────────────────┴──────────────────┘   │
│                                                                                 │
│  PHASE 2: ASYNCHRONOUS (queued)                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Check                        │ Action on Fail        │ Processing Time  │   │
│  ├──────────────────────────────┼───────────────────────┼──────────────────┤   │
│  │ Response pattern analysis    │ Flag response         │ ~50ms            │   │
│  │ Cross-content correlation    │ Flag user             │ ~100ms           │   │
│  │ Device fingerprint deep      │ Flag device           │ ~50ms            │   │
│  │ ML anomaly detection         │ Score adjustment      │ ~200ms           │   │
│  │ Geographic consistency       │ Flag if mismatch      │ ~30ms            │   │
│  └──────────────────────────────┴───────────────────────┴──────────────────┘   │
│                                                                                 │
│  ARCHITECTURE:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  Request → [Phase 1] → Response Accepted/Rejected                       │   │
│  │               │                                                         │   │
│  │               ▼                                                         │   │
│  │         [Job Queue] ────────────────────────────┐                       │   │
│  │               │                                 │                       │   │
│  │               ▼                                 ▼                       │   │
│  │         [Phase 2 Worker]               [Phase 2 Worker]                 │   │
│  │               │                                 │                       │   │
│  │               ▼                                 ▼                       │   │
│  │         [Fraud Score Update]           [Fraud Score Update]             │   │
│  │               │                                 │                       │   │
│  │               └────────────┬────────────────────┘                       │   │
│  │                            ▼                                            │   │
│  │                    [If fraud detected]                                  │   │
│  │                            │                                            │   │
│  │               ┌────────────┼────────────┐                               │   │
│  │               ▼            ▼            ▼                               │   │
│  │         [Invalidate]  [Notify]    [Update Blocklist]                    │   │
│  │         [Response]    [Admin]                                           │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  RESPONSE INVALIDATION:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ If Phase 2 detects fraud after response was accepted:                   │   │
│  │ 1. Mark response as fraudulent (soft delete)                            │   │
│  │ 2. Recalculate content analytics (exclude fraudulent)                   │   │
│  │ 3. Update user fraud score                                              │   │
│  │ 4. If repeated: Add to blocklist                                        │   │
│  │ 5. Notify content creator (optional setting)                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.2.7 WebSocket Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-060: WebSocket Scaling Guidelines                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: No guidance on when to switch from single-server to Redis Pub/Sub         │
│                                                                                 │
│  SCALING TIERS:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Concurrent WS │ Architecture           │ Technology                     │   │
│  ├───────────────┼────────────────────────┼────────────────────────────────┤   │
│  │ < 1,000       │ Single server          │ ws + in-memory                 │   │
│  │ 1,000-10,000  │ Single server + Redis  │ ws + Redis Pub/Sub             │   │
│  │ 10,000-50,000 │ Multi-server + Redis   │ ws + Redis Cluster             │   │
│  │ > 50,000      │ Dedicated WS service   │ PartyKit or Socket.io Cluster  │   │
│  └───────────────┴────────────────────────┴────────────────────────────────┘   │
│                                                                                 │
│  PARTYKIT VS REDIS DECISION:                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Factor              │ PartyKit              │ Redis Pub/Sub             │   │
│  ├─────────────────────┼───────────────────────┼───────────────────────────┤   │
│  │ Setup complexity    │ Low (managed)         │ Medium (self-managed)     │   │
│  │ Cost at scale       │ Higher                │ Lower                     │   │
│  │ Geographic          │ Built-in edge         │ Manual configuration      │   │
│  │ State management    │ Built-in              │ Manual                    │   │
│  │ Vendor lock-in      │ Yes                   │ No                        │   │
│  └─────────────────────┴───────────────────────┴───────────────────────────┘   │
│                                                                                 │
│  RECOMMENDATION:                                                                 │
│  • Start with: ws + Redis Pub/Sub (flexible, cost-effective)                   │
│  • Migrate to PartyKit when: Geographic distribution becomes critical          │
│  • Keep option open: Abstract WebSocket layer for easy switching               │
│                                                                                 │
│  IMPLEMENTATION ABSTRACTION:                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ interface WebSocketProvider {                                           │   │
│  │   broadcast(room: string, message: any): Promise<void>                  │   │
│  │   sendToUser(userId: string, message: any): Promise<void>               │   │
│  │   getRoomMembers(room: string): Promise<string[]>                       │   │
│  │   onMessage(handler: MessageHandler): void                              │   │
│  │ }                                                                       │   │
│  │                                                                         │   │
│  │ // Implementations                                                      │   │
│  │ class RedisWebSocketProvider implements WebSocketProvider { ... }       │   │
│  │ class PartyKitWebSocketProvider implements WebSocketProvider { ... }    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 30.3 SECURITY SPECIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 30.3.1 HMAC Salt Rotation Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-061: HMAC Salt Lifecycle Management                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: Bible-010 specifies salt but lifecycle/rotation unclear                   │
│                                                                                 │
│  SALT CONFIGURATION:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Salt Type              │ Rotation    │ Storage        │ Compromise Plan │   │
│  ├────────────────────────┼─────────────┼────────────────┼─────────────────┤   │
│  │ participantHash salt   │ Never*      │ Env variable   │ Gradual migrate │   │
│  │ Session signing salt   │ 90 days     │ Secrets manager│ Immediate rotate│   │
│  │ API key derivation     │ On demand   │ Secrets manager│ Immediate rotate│   │
│  │ Webhook signing        │ 180 days    │ Per-integration│ Notify + rotate │   │
│  └────────────────────────┴─────────────┴────────────────┴─────────────────┘   │
│                                                                                 │
│  *participantHash salt: Cannot rotate without breaking anonymity links         │
│                                                                                 │
│  ROTATION PROCESS:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Generate new salt (32 bytes, crypto.randomBytes)                     │   │
│  │ 2. Store new salt with version number (v2, v3, etc.)                    │   │
│  │ 3. Update application to use new salt for NEW operations                │   │
│  │ 4. Keep old salt active for verification (dual-read period)             │   │
│  │ 5. After 30 days: Deprecate old salt (log warnings)                     │   │
│  │ 6. After 90 days: Remove old salt                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  COMPROMISE RESPONSE:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Session salt compromised:                                               │   │
│  │ 1. Generate new salt immediately                                        │   │
│  │ 2. Invalidate all existing sessions                                     │   │
│  │ 3. Force re-login for all users                                         │   │
│  │                                                                         │   │
│  │ participantHash salt compromised:                                       │   │
│  │ 1. Generate new salt                                                    │   │
│  │ 2. Re-hash all participantHashes (background job)                       │   │
│  │ 3. This WILL break anonymous-to-user linking (acceptable trade-off)     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.3.2 OAuth Provider Contingency

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-062: Authentication Provider Redundancy                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: No contingency plan if Google/Apple OAuth becomes unavailable             │
│                                                                                 │
│  SUPPORTED PROVIDERS (Via Clerk):                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Provider     │ Priority │ User Base Est. │ Backup                       │   │
│  ├──────────────┼──────────┼────────────────┼──────────────────────────────┤   │
│  │ Email/Pass   │ Primary  │ 40%            │ N/A (owned)                  │   │
│  │ Google       │ Primary  │ 35%            │ Email magic link             │   │
│  │ Apple        │ Primary  │ 20%            │ Email magic link             │   │
│  │ Phone (SMS)  │ Secondary│ 5%             │ Email/Pass                   │   │
│  └──────────────┴──────────┴────────────────┴──────────────────────────────┘   │
│                                                                                 │
│  PROVIDER OUTAGE RESPONSE:                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Show banner: "Google login temporarily unavailable"                  │   │
│  │ 2. Offer alternatives: "Try Email or Apple login"                       │   │
│  │ 3. For existing OAuth-only users: Send magic link to email on file     │   │
│  │ 4. Post-incident: Prompt users to add backup login method               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  BACKUP METHOD ENFORCEMENT:                                                     │
│  After 3 logins with OAuth-only, prompt user to add email/phone backup.        │
│  "Remind Me Later" available 3 times, then becomes required.                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.3.3 Rate Limiting Key Management

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-063: Rate Limit Redis Key Lifecycle                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: Rate limit key TTL and cleanup not specified                              │
│                                                                                 │
│  KEY STRUCTURE AND TTL:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Key Pattern                      │ TTL        │ Size Est                │   │
│  ├──────────────────────────────────┼────────────┼─────────────────────────┤   │
│  │ ratelimit:api:{userId}:{endpoint}│ 60 sec     │ ~100 B                  │   │
│  │ ratelimit:ip:{ip}:{endpoint}     │ 60 sec     │ ~100 B                  │   │
│  │ ratelimit:auth:{ip}              │ 15 min     │ ~100 B                  │   │
│  │ ratelimit:vote:{contentId}:{fp}  │ 24 hours   │ ~150 B                  │   │
│  └──────────────────────────────────┴────────────┴─────────────────────────┘   │
│                                                                                 │
│  MEMORY ESTIMATION (100K DAU):                                                  │
│  - API rate limit keys: ~1GB                                                   │
│  - Vote dedup keys: ~75MB                                                      │
│  - Recommendation: Dedicated Redis instance for rate limiting                  │
│                                                                                 │
│  ABUSE PREVENTION:                                                              │
│  - Max key count per IP: 1000                                                  │
│  - If exceeded: Block IP for 1 hour                                            │
│  - Redis config: maxmemory-policy volatile-lru                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.3.4 Anonymity Security Audit Plan

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-064: Formal Anonymity Verification                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: Bible-001 claims "cryptographic impossibility" but no formal audit        │
│                                                                                 │
│  THREAT MODEL:                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Adversary           │ Goal                    │ Mitigation              │   │
│  ├─────────────────────┼─────────────────────────┼─────────────────────────┤   │
│  │ External attacker   │ Link response to user   │ No userId in responses  │   │
│  │ Malicious admin     │ De-anonymize responses  │ participantHash is HMAC │   │
│  │ Content creator     │ Identify specific voter │ Only see aggregates     │   │
│  │ Law enforcement     │ User identification     │ Cannot be provided      │   │
│  └─────────────────────┴─────────────────────────┴─────────────────────────┘   │
│                                                                                 │
│  AUDIT SCHEDULE:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Phase          │ Timeline        │ Scope                                │   │
│  ├────────────────┼─────────────────┼──────────────────────────────────────┤   │
│  │ Internal audit │ Before launch   │ Code review, schema verification     │   │
│  │ Penetration    │ Month 1         │ Attack simulation by external firm   │   │
│  │ Third-party    │ Month 3         │ Full security audit                  │   │
│  │ Annual review  │ Yearly          │ Changes since last audit             │   │
│  └────────────────┴─────────────────┴──────────────────────────────────────┘   │
│                                                                                 │
│  INTERNAL AUDIT CHECKLIST:                                                      │
│  □ Response table has no userId column                                         │
│  □ participantHash uses HMAC-SHA256 with secret salt                           │
│  □ Salt not accessible from application code (env only)                        │
│  □ No logs contain userId + responseId in same entry                           │
│  □ API never returns userId with response data                                 │
│  □ Analytics queries cannot filter by user                                     │
│  □ Database backups encrypted at rest                                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.3.5 Device Fingerprint GDPR Compliance

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-065: Device Fingerprint Privacy Compliance                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: Bible-009 doesn't specify fingerprint retention or erasure                │
│                                                                                 │
│  DATA CLASSIFICATION:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Component           │ GDPR Category     │ Retention   │ Erasure          │   │
│  ├─────────────────────┼───────────────────┼─────────────┼──────────────────┤   │
│  │ Raw fingerprint     │ Personal data     │ 0 (never)   │ Never stored     │   │
│  │ Fingerprint hash    │ Pseudonymous      │ 90 days     │ Auto-delete      │   │
│  │ IP address          │ Personal data     │ 7 days      │ Auto-delete      │   │
│  └─────────────────────┴───────────────────┴─────────────┴──────────────────┘   │
│                                                                                 │
│  FINGERPRINTING PROCESS:                                                        │
│  1. Collect browser attributes client-side                                     │
│  2. Generate hash locally (SHA-256)                                            │
│  3. Send ONLY the hash to server (never raw attributes)                        │
│  4. Delete hashes older than 90 days (cron job)                                │
│                                                                                 │
│  CONSENT UI (First visit):                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  "We use device fingerprinting to prevent fraud.                        │   │
│  │   We only store a hash, automatically deleted after 90 days.            │   │
│  │                                                                         │   │
│  │   [Accept]  [Learn More]  [Decline*]"                                   │   │
│  │                                                                         │   │
│  │  *Decline: Limited functionality (no voting on protected content)       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  RIGHT TO ERASURE:                                                              │
│  User requests via Settings > Privacy > Delete My Data                         │
│  → Delete all fingerprint hashes linked to user within 24 hours                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 30.4 UNDEFINED USER FLOWS - COMPLETE SPECIFICATIONS
# ══════════════════════════════════════════════════════════════════════════════

## 30.4.1 Pre-test Failure Cooldown UX

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-066: Pre-test Failure Handling                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: P-030 mentions cooldown but UX details missing                            │
│                                                                                 │
│  COOLDOWN PROGRESSION:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Failure # │ Cooldown    │ Message                                       │   │
│  ├───────────┼─────────────┼───────────────────────────────────────────────┤   │
│  │ 1st       │ 1 hour      │ "Try again in 58 minutes"                     │   │
│  │ 2nd       │ 2 hours     │ "Try again in 1h 55m"                         │   │
│  │ 3rd       │ 24 hours    │ "Try again tomorrow"                          │   │
│  │ 4th+      │ 24 hours    │ "Try again tomorrow" (cap at 24h)             │   │
│  └───────────┴─────────────┴───────────────────────────────────────────────┘   │
│                                                                                 │
│  FAILED ATTEMPT COUNTING:                                                       │
│  - Failed attempts DO count toward monthly test limit                          │
│  - Rationale: Prevents spam attempts to pass pre-test                          │
│  - Display: "2 of 10 tests this month (1 incomplete)"                          │
│                                                                                 │
│  BYPASS OPTIONS:                                                                │
│  - Premium users: Can bypass pre-test entirely (creator setting)               │
│  - No "pay to skip cooldown" option (prevents unfair advantage)                │
│                                                                                 │
│  COOLDOWN UI:                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Pre-test not passed                                                    │   │
│  │                                                                         │   │
│  │  You can try again in: 58 minutes                                       │   │
│  │                                                                         │   │
│  │  While you wait:                                                        │   │
│  │  • Review the pre-test requirements                                     │   │
│  │  • Explore other content                                                │   │
│  │                                                                         │   │
│  │  [Set Reminder]  [Explore Other Tests]                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  RESET CONDITIONS:                                                              │
│  - Cooldown resets after 7 days of no attempts                                 │
│  - Successful pre-test resets cooldown for that specific test                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.4.2 Badge Lifecycle After Test Deletion

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-067: Badge Preservation When Test Deleted                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: P-034 says badges preserved but display behavior undefined                │
│                                                                                 │
│  BADGE DATA PRESERVATION:                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Data Element       │ Preserved? │ Notes                                 │   │
│  ├────────────────────┼────────────┼───────────────────────────────────────┤   │
│  │ Badge image        │ Yes        │ Stored independently from test        │   │
│  │ Badge title        │ Yes        │ "Explorer", "Leader", etc.            │   │
│  │ Test title         │ Yes        │ Snapshot at time of completion        │   │
│  │ Completion date    │ Yes        │ Timestamp preserved                   │   │
│  │ Test link          │ No         │ Link becomes inactive                 │   │
│  │ Test description   │ No         │ Not stored with badge                 │   │
│  └────────────────────┴────────────┴───────────────────────────────────────┘   │
│                                                                                 │
│  BADGE DISPLAY AFTER TEST DELETION:                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Badge Image]                                                          │   │
│  │  🏆 Explorer                                                            │   │
│  │  "What Type of Learner Are You?"                                        │   │
│  │  Completed: Jan 15, 2026                                                │   │
│  │                                                                         │   │
│  │  ⚠️ This test is no longer available                                    │   │
│  │                                                                         │   │
│  │  [Hide Badge]  [Share Anyway]                                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  SHARING DELETED TEST BADGE:                                                    │
│  - Share link works but shows: "This test is no longer available"              │
│  - Badge image and result still visible                                        │
│  - "Take Test" button hidden                                                   │
│                                                                                 │
│  USER OPTIONS:                                                                  │
│  - Keep badge visible (default)                                                │
│  - Hide badge from profile                                                     │
│  - Cannot delete badge (permanent record of achievement)                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.4.3 Notification Aggregation Windows

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-068: Notification Batching & Aggregation                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: P-046 mentions aggregation but intervals undefined                        │
│                                                                                 │
│  AGGREGATION WINDOWS BY TYPE:                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Notification Type    │ Window     │ Max Batch │ Example                  │   │
│  ├──────────────────────┼────────────┼───────────┼──────────────────────────┤   │
│  │ New comment          │ 15 min     │ 10        │ "10 new comments"        │   │
│  │ Comment reply        │ 5 min      │ 5         │ "5 replies to you"       │   │
│  │ New follower         │ 1 hour     │ 20        │ "20 new followers"       │   │
│  │ Poll results         │ Immediate  │ 1         │ Not aggregated           │   │
│  │ Live poll starting   │ Immediate  │ 1         │ Not aggregated           │   │
│  │ Badge earned         │ Immediate  │ 1         │ Not aggregated           │   │
│  │ Vote milestone       │ 1 hour     │ 5         │ "5 polls hit 100 votes"  │   │
│  └──────────────────────┴────────────┴───────────┴──────────────────────────┘   │
│                                                                                 │
│  BURST HANDLING (100+ in 1 minute):                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ If > 10 notifications of same type in 1 minute:                         │   │
│  │ 1. Send 1 immediate notification: "Your poll is getting attention!"     │   │
│  │ 2. Aggregate rest into single notification after window                 │   │
│  │ 3. In-app badge shows total count                                       │   │
│  │                                                                         │   │
│  │ Example: 100 comments in 1 minute                                       │   │
│  │ - Push 1: "Your poll is getting lots of comments!"                      │   │
│  │ - Push 2 (after 15 min): "97 more comments on your poll"                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  NOTIFICATION PREFERENCE LEVELS:                                                │
│  - All: Every notification (no aggregation)                                    │
│  - Normal: Standard aggregation (default)                                      │
│  - Minimal: Daily digest only                                                  │
│  - Off: No push notifications (in-app only)                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.4.4 Account Deletion Grace Period Behavior

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-069: Account Deletion Grace Period                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: P-043 mentions 30-day grace but behavior during period undefined          │
│                                                                                 │
│  DELETION REQUEST FLOW:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Step 1: User clicks "Delete Account"                                    │   │
│  │ Step 2: Confirm with password                                           │   │
│  │ Step 3: Select reason (optional)                                        │   │
│  │ Step 4: Final confirmation: "Delete my account"                         │   │
│  │ Step 5: Immediate logout from all devices                               │   │
│  │ Step 6: Email confirmation sent                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  DURING GRACE PERIOD (Day 1-30):                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Action              │ Allowed? │ Notes                                  │   │
│  ├─────────────────────┼──────────┼────────────────────────────────────────┤   │
│  │ Login               │ No       │ "Account deletion in progress"         │   │
│  │ Cancel deletion     │ Yes      │ Via email link or support              │   │
│  │ View profile        │ No       │ Profile shows "User deleted account"   │   │
│  │ Past content        │ Visible  │ Shows "[deleted]" as author            │   │
│  │ Past votes          │ Counted  │ Still included in poll results         │   │
│  │ Comments            │ Hidden   │ Hidden during grace, restored if cancel│   │
│  └─────────────────────┴──────────┴────────────────────────────────────────┘   │
│                                                                                 │
│  CANCELLATION PROCESS:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Option 1: Email link (valid for 30 days)                                │   │
│  │   "Changed your mind? Click here to restore your account"               │   │
│  │                                                                         │   │
│  │ Option 2: Contact support                                               │   │
│  │   Verify identity with email + last known activity                      │   │
│  │                                                                         │   │
│  │ After cancellation:                                                     │   │
│  │ - Account fully restored                                                │   │
│  │ - Must re-verify email                                                  │   │
│  │ - Comments un-hidden                                                    │   │
│  │ - Followers/following intact                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  COUNTDOWN UI (in email reminders):                                             │
│  - Day 7: "Your account will be deleted in 23 days"                            │
│  - Day 14: "Your account will be deleted in 16 days"                           │
│  - Day 25: "Final warning: Account deletion in 5 days"                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.4.5 Redis Failure Degradation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-070: Redis Failure Graceful Degradation                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: P-042 mentions circuit breaker but degraded feature list undefined        │
│                                                                                 │
│  CIRCUIT BREAKER CONFIG:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Parameter           │ Value      │ Notes                                │   │
│  ├─────────────────────┼────────────┼──────────────────────────────────────┤   │
│  │ Failure threshold   │ 3          │ 3 consecutive failures = open        │   │
│  │ Recovery timeout    │ 30 seconds │ Time before half-open state          │   │
│  │ Half-open requests  │ 1          │ Test requests before closing         │   │
│  │ Success to close    │ 2          │ Successful tests to close breaker    │   │
│  └─────────────────────┴────────────┴──────────────────────────────────────┘   │
│                                                                                 │
│  FEATURE DEGRADATION MATRIX:                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Feature                    │ Degraded Behavior                          │   │
│  ├────────────────────────────┼────────────────────────────────────────────┤   │
│  │ Rate limiting              │ Allow all (fail open)                      │   │
│  │ Session cache              │ Query database directly                    │   │
│  │ Permission cache           │ Query database directly                    │   │
│  │ Live poll state            │ DISABLED - show maintenance message        │   │
│  │ Real-time analytics        │ Show stale data with timestamp             │   │
│  │ Trending feed              │ Show cached version (may be hours old)     │   │
│  │ Duplicate vote prevention  │ Database-based check (slower)              │   │
│  │ Notification queue         │ Direct send (may have duplicates)          │   │
│  └────────────────────────────┴────────────────────────────────────────────┘   │
│                                                                                 │
│  USER-FACING MESSAGES:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Live Poll:                                                              │   │
│  │ "Live polls are temporarily unavailable. Please try again shortly."     │   │
│  │                                                                         │   │
│  │ Real-time Analytics:                                                    │   │
│  │ "⚠️ Data last updated 5 minutes ago"                                    │   │
│  │                                                                         │   │
│  │ General Slowdown:                                                       │   │
│  │ (No message - just slower response times)                               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  RECOVERY:                                                                      │
│  - Automatic when Redis returns                                                │
│  - No manual intervention required                                             │
│  - Log alert for ops team                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.4.6 Cross-Browser Fingerprint Handling

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-071: Cross-Browser Fingerprint Matching                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: Bible-009 undefined for same device, different browser scenario           │
│                                                                                 │
│  FINGERPRINT COMPONENTS:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Component           │ Cross-Browser? │ Weight │ Notes                   │   │
│  ├─────────────────────┼────────────────┼────────┼─────────────────────────┤   │
│  │ Screen resolution   │ Yes            │ 15%    │ Same across browsers    │   │
│  │ Timezone            │ Yes            │ 10%    │ Same across browsers    │   │
│  │ Language            │ Yes            │ 10%    │ Same across browsers    │   │
│  │ Canvas fingerprint  │ Partial        │ 25%    │ May differ by browser   │   │
│  │ WebGL renderer      │ Partial        │ 20%    │ May differ by browser   │   │
│  │ Browser/UA          │ No             │ 10%    │ Different per browser   │   │
│  │ Installed fonts     │ Partial        │ 10%    │ May differ by browser   │   │
│  └─────────────────────┴────────────────┴────────┴─────────────────────────┘   │
│                                                                                 │
│  CROSS-BROWSER DETECTION:                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Same device, different browser:                                         │   │
│  │ - Expected similarity: 35-60% (stable components only)                  │   │
│  │ - Threshold for "same device": 50%                                      │   │
│  │ - Below 50%: Treat as different device                                  │   │
│  │                                                                         │   │
│  │ Decision: ALLOW voting from different browser on same device            │   │
│  │ Rationale: Cannot reliably detect, prefer user experience               │   │
│  │ Mitigation: User-level duplicate check (if authenticated)               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  DUPLICATE PREVENTION HIERARCHY:                                                │
│  1. User ID (if authenticated) - strictest                                     │
│  2. Device fingerprint (same browser)                                          │
│  3. IP + basic attributes (fallback for cross-browser)                         │
│                                                                                 │
│  ANONYMOUS USER SCENARIO:                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Safari vote → Chrome vote (same device, anonymous):                     │   │
│  │ - System cannot reliably detect as same user                            │   │
│  │ - Both votes accepted (this is acceptable for anonymous polls)          │   │
│  │ - For high-stakes content: Require authentication                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.4.7 Poll Option Count Validation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-072: Dynamic Option Limit Enforcement                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: P-027 defines limits but real-time validation during edit undefined       │
│                                                                                 │
│  OPTION LIMITS BY TIER:                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Poll Type      │ Free      │ Plus      │ Premium                        │   │
│  ├────────────────┼───────────┼───────────┼────────────────────────────────┤   │
│  │ QUICK_POLL     │ 2-4       │ 2-4       │ 2-4                            │   │
│  │ EXTENDED_POLL  │ N/A       │ 2-6       │ 2-10                           │   │
│  │ LIVE_POLL      │ N/A       │ N/A       │ 2-8                            │   │
│  └────────────────┴───────────┴───────────┴────────────────────────────────┘   │
│                                                                                 │
│  REAL-TIME VALIDATION:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ User adds 5th option to Quick Poll:                                     │   │
│  │                                                                         │   │
│  │ Free user:                                                              │   │
│  │ - "Add Option" button disabled at 4 options                             │   │
│  │ - Tooltip: "Quick polls support up to 4 options"                        │   │
│  │ - Upsell: "Need more? Try Extended Poll with Plus"                      │   │
│  │                                                                         │   │
│  │ Plus user adding 7th option to Extended Poll:                           │   │
│  │ - Button disabled at 6 options                                          │   │
│  │ - Tooltip: "Plus tier supports up to 6 options"                         │   │
│  │ - Upsell: "Upgrade to Premium for up to 10 options"                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  DOWNGRADE SCENARIO:                                                            │
│  User has 8-option poll, downgrades from Premium to Plus:                      │
│  - Existing poll preserved (read-only for editing options)                     │
│  - Can edit text of existing options                                           │
│  - Cannot add new options                                                      │
│  - Cannot delete then re-add (lock at downgrade moment)                        │
│  - Message: "This poll exceeds your current plan's limits"                     │
│                                                                                 │
│  UI INDICATOR:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Options (3 of 4)                                              [+ Add]  │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │   │
│  │  │ Option A                                                     [×] │  │   │
│  │  │ Option B                                                     [×] │  │   │
│  │  │ Option C                                                     [×] │  │   │
│  │  └──────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                         │   │
│  │  Need more options? [Upgrade to Plus →]                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.4.8 Comment Access Revocation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-073: Comment Access Request & Revocation Flow                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: P-004 defines request but revocation flow undefined                       │
│                                                                                 │
│  ACCESS REQUEST FLOW:                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Non-participant clicks "Request Access"                              │   │
│  │ 2. Must write 100+ character justification                              │   │
│  │ 3. Request sent to content creator                                      │   │
│  │ 4. Creator receives notification                                        │   │
│  │ 5. Creator approves or denies                                           │   │
│  │ 6. Requester notified of decision                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  REQUEST LIMITS:                                                                │
│  - Max 1 request per content per user                                          │
│  - If denied: Can re-request after 7 days                                      │
│  - Max 3 total requests per content (then permanently blocked)                 │
│  - Requests expire after 30 days if no response                                │
│                                                                                 │
│  REVOCATION SCENARIOS:                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Scenario                    │ Comments Posted    │ Future Access        │   │
│  ├─────────────────────────────┼────────────────────┼──────────────────────┤   │
│  │ Creator revokes access      │ HIDDEN (not deleted│ Blocked              │   │
│  │ User reported for spam      │ DELETED            │ Blocked permanently  │   │
│  │ User subscription expires   │ PRESERVED          │ Must re-request      │   │
│  │ Content made private        │ PRESERVED          │ Lost until public    │   │
│  └─────────────────────────────┴────────────────────┴──────────────────────┘   │
│                                                                                 │
│  REVOCATION UI (Creator side):                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Manage Access                                                          │   │
│  │                                                                         │   │
│  │  Users with approved access:                                            │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │   │
│  │  │ @john_doe     Approved Jan 15    2 comments    [Revoke Access]   │  │   │
│  │  │ @jane_smith   Approved Jan 10    5 comments    [Revoke Access]   │  │   │
│  │  └──────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                         │   │
│  │  Pending requests: 3                                                    │   │
│  │  [Review Requests]                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  REVOCATION NOTIFICATION:                                                       │
│  "Your comment access to [Poll Title] has been revoked by the creator.         │
│   Your existing comments have been hidden."                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.4.9 Test Result Comparison Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-074: Test Result Comparison Feature                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: Bible-010 mentions comparison but specific flow undefined                 │
│                                                                                 │
│  COMPARISON TYPES:                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Type                │ How It Works                                      │   │
│  ├─────────────────────┼───────────────────────────────────────────────────┤   │
│  │ Direct comparison   │ User shares link, friend takes test, compare     │   │
│  │ Retroactive         │ Both took test, connect via friend request       │   │
│  │ Group comparison    │ Compare with all friends who took same test      │   │
│  └─────────────────────┴───────────────────────────────────────────────────┘   │
│                                                                                 │
│  SHARE WITHOUT SPOILING:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Share link format: voxpoll.com/test/abc123?compare=xyz789              │   │
│  │                                                                         │   │
│  │ When friend opens link:                                                 │   │
│  │ 1. Shows test description (no results visible)                          │   │
│  │ 2. "John invited you to compare results"                                │   │
│  │ 3. Friend takes test normally                                           │   │
│  │ 4. After completion: Side-by-side comparison shown                      │   │
│  │                                                                         │   │
│  │ Friend's view before taking test:                                       │   │
│  │ ┌──────────────────────────────────────────────────────────────────┐   │   │
│  │ │  What Type of Learner Are You?                                   │   │   │
│  │ │                                                                  │   │   │
│  │ │  @john_doe wants to compare results with you!                    │   │   │
│  │ │  Take the test to see how you match up.                          │   │   │
│  │ │                                                                  │   │   │
│  │ │  [Take Test]  [Not Now]                                          │   │   │
│  │ └──────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  COMPARISON DISPLAY:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Results Comparison                                                     │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐    ┌─────────────────┐                            │   │
│  │  │ You             │    │ @john_doe       │                            │   │
│  │  │ 🏆 Explorer     │ vs │ 🏆 Innovator    │                            │   │
│  │  │ Visual Learner  │    │ Kinesthetic     │                            │   │
│  │  └─────────────────┘    └─────────────────┘                            │   │
│  │                                                                         │   │
│  │  You both answered 3 questions the same way!                           │   │
│  │                                                                         │   │
│  │  [Share Comparison]  [Take Another Test Together]                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  PRIVACY:                                                                       │
│  - Comparison only visible to both parties                                     │
│  - Either party can hide from comparison                                       │
│  - Detailed answers never shown (only result type)                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 30.4.10 Search Spam Prevention

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              P-075: Search Quality & Spam Prevention                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  GAP: Bible-011 search boost but spam prevention undefined                      │
│                                                                                 │
│  SEARCH RANKING FACTORS:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Factor                    │ Weight │ Notes                              │   │
│  ├───────────────────────────┼────────┼────────────────────────────────────┤   │
│  │ Text relevance            │ 40%    │ Title, description, options        │   │
│  │ User language match       │ 20%    │ 50% boost if same language         │   │
│  │ Creator reliability       │ 15%    │ Based on creator's score           │   │
│  │ Engagement rate           │ 15%    │ Votes/views ratio                  │   │
│  │ Recency                   │ 10%    │ Newer content slightly boosted     │   │
│  └───────────────────────────┴────────┴────────────────────────────────────┘   │
│                                                                                 │
│  SPAM SIGNALS (Negative ranking):                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Signal                    │ Penalty  │ Detection                        │   │
│  ├───────────────────────────┼──────────┼──────────────────────────────────┤   │
│  │ Keyword stuffing          │ -50%     │ >3 repeats of same word          │   │
│  │ Misleading title          │ -100%    │ High bounce rate from search     │   │
│  │ Low creator reliability   │ -30%     │ Score < 0.3                      │   │
│  │ Reported as spam          │ -80%     │ 3+ spam reports                  │   │
│  │ Hidden/invisible keywords │ -100%    │ Text color = background          │   │
│  └───────────────────────────┴──────────┴──────────────────────────────────┘   │
│                                                                                 │
│  MANUAL REVIEW TRIGGERS:                                                        │
│  - 5+ reports on content                                                       │
│  - Unusual traffic pattern (bot-like)                                          │
│  - Sudden ranking jump (manipulation suspected)                                │
│                                                                                 │
│  CREATOR PENALTIES:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Offense                   │ 1st       │ 2nd       │ 3rd                 │   │
│  ├───────────────────────────┼───────────┼───────────┼─────────────────────┤   │
│  │ Keyword stuffing          │ Warning   │ -50% rank │ Content hidden      │   │
│  │ Fake engagement           │ -50% rank │ Hidden    │ Account suspend     │   │
│  │ Misleading content        │ Warning   │ Hidden    │ Account review      │   │
│  └───────────────────────────┴───────────┴───────────┴─────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 30.5 SUMMARY & DECISION INDEX
# ══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    BIBLE-030 COMPLETE SUMMARY                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  INCONSISTENCIES RESOLVED (Section 30.1):                                        │
│  ✅ P-051: QUICK_POLL quality threshold exception clarified                     │
│  ✅ P-052: Response retention vs deletion policy unified                        │
│  ✅ P-053: Live Poll capacity thresholds & waiting room specified               │
│                                                                                 │
│  PERFORMANCE OPTIMIZATIONS (Section 30.2):                                       │
│  ✅ P-054: Incremental reliability score calculation                            │
│  ✅ P-055: Time-bucketed analytics aggregation                                  │
│  ✅ P-056: Count-Min Sketch trending algorithm                                  │
│  ✅ P-057: Database connection pool guidelines by scale                         │
│  ✅ P-058: Cascade delete protection with soft delete                           │
│  ✅ P-059: Two-phase async fraud detection pipeline                             │
│  ✅ P-060: WebSocket scaling tiers and provider abstraction                     │
│                                                                                 │
│  SECURITY SPECIFICATIONS (Section 30.3):                                         │
│  ✅ P-061: HMAC salt rotation and compromise response plan                      │
│  ✅ P-062: OAuth provider redundancy and backup methods                         │
│  ✅ P-063: Rate limiting Redis key lifecycle and TTL                            │
│  ✅ P-064: Formal anonymity audit plan and threat model                         │
│  ✅ P-065: Device fingerprint GDPR compliance and erasure                       │
│                                                                                 │
│  USER FLOWS DEFINED (Section 30.4):                                              │
│  ✅ P-066: Pre-test failure cooldown UX and limits                              │
│  ✅ P-067: Badge preservation after test deletion                               │
│  ✅ P-068: Notification aggregation windows by type                             │
│  ✅ P-069: Account deletion grace period behavior                               │
│  ✅ P-070: Redis failure graceful degradation matrix                            │
│  ✅ P-071: Cross-browser fingerprint detection limits                           │
│  ✅ P-072: Dynamic poll option limit enforcement                                │
│  ✅ P-073: Comment access request and revocation flow                           │
│  ✅ P-074: Test result comparison without spoiling                              │
│  ✅ P-075: Search ranking and spam prevention                                   │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  TOTAL NEW DECISIONS: 25 (P-051 through P-075)                                   │
│  COMBINED WITH BIBLE-029: 75+ decisions total                                    │
│  STATUS: All identified gaps RESOLVED                                            │
│  NEXT: Ready for implementation                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## Decision Index (P-051 to P-075)

| ID | Decision | Category | Section |
|----|----------|----------|---------|
| P-051 | QUICK_POLL quality scoring exception | Inconsistency | 30.1.1 |
| P-052 | Response data lifecycle policy | Inconsistency | 30.1.2 |
| P-053 | Live Poll capacity management | Inconsistency | 30.1.3 |
| P-054 | Incremental reliability scoring | Performance | 30.2.1 |
| P-055 | Analytics time-bucket aggregation | Performance | 30.2.2 |
| P-056 | Trending algorithm optimization | Performance | 30.2.3 |
| P-057 | Database connection pool config | Performance | 30.2.4 |
| P-058 | Cascade delete protection | Performance | 30.2.5 |
| P-059 | Async fraud detection pipeline | Performance | 30.2.6 |
| P-060 | WebSocket scaling strategy | Performance | 30.2.7 |
| P-061 | HMAC salt rotation strategy | Security | 30.3.1 |
| P-062 | OAuth provider contingency | Security | 30.3.2 |
| P-063 | Rate limiting key management | Security | 30.3.3 |
| P-064 | Anonymity security audit plan | Security | 30.3.4 |
| P-065 | Device fingerprint GDPR compliance | Security | 30.3.5 |
| P-066 | Pre-test failure cooldown UX | User Flow | 30.4.1 |
| P-067 | Badge lifecycle after test deletion | User Flow | 30.4.2 |
| P-068 | Notification aggregation windows | User Flow | 30.4.3 |
| P-069 | Account deletion grace period | User Flow | 30.4.4 |
| P-070 | Redis failure degradation | User Flow | 30.4.5 |
| P-071 | Cross-browser fingerprint handling | User Flow | 30.4.6 |
| P-072 | Poll option count validation | User Flow | 30.4.7 |
| P-073 | Comment access revocation | User Flow | 30.4.8 |
| P-074 | Test result comparison flow | User Flow | 30.4.9 |
| P-075 | Search spam prevention | User Flow | 30.4.10 |




# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 30
# ══════════════════════════════════════════════════════════════════════════════
