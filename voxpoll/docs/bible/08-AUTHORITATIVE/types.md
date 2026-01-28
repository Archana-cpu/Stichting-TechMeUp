# types.md
> Source: bible-030.md
> Status: [AUTHORITATIVE] - These specifications OVERRIDE any conflicting content

# ══════════════════════════════════════════════════════════════════════════════
# UNIFIED TYPE DEFINITIONS
# ══════════════════════════════════════════════════════════════════════════════

## Content Type Quality Requirements

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Content Type    │ Quality Score │ Fraud Check │ Reliability │ Rationale │
├─────────────────┼───────────────┼─────────────┼─────────────┼───────────┤
│ QUICK_POLL      │ Disabled (0)  │ Yes         │ Post-hoc    │ Speed     │
│ EXTENDED_POLL   │ Enabled (0.6) │ Yes         │ Real-time   │ Accuracy  │
│ LIVE_POLL       │ Disabled (0)  │ Yes         │ Post-hoc    │ Speed     │
│ TEST            │ Enabled (0.7) │ Yes         │ Real-time   │ Integrity │
│ SURVEY          │ Enabled (0.5) │ Yes         │ Real-time   │ Quality   │
└─────────────────┴───────────────┴─────────────┴─────────────┴───────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# RESPONSE DATA LIFECYCLE
# ══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Trigger              │ Personal Data    │ Response Data   │ Analytics   │
├──────────────────────┼──────────────────┼─────────────────┼─────────────┤
│ User requests delete │ Deleted (30 days)│ ANONYMIZED      │ Preserved   │
│ GDPR erasure request │ Deleted (30 days)│ ANONYMIZED      │ Preserved   │
│ Account inactive 2yr │ Soft-deleted     │ ANONYMIZED      │ Preserved   │
│ Content deleted      │ N/A              │ ANONYMIZED      │ Preserved   │
│ Org member removed   │ Org data deleted │ ANONYMIZED      │ Preserved   │
└──────────────────────┴──────────────────┴─────────────────┴─────────────┘
```

## Anonymization Process

```
Step 1: Generate new random participantHash (not linked to user)
Step 2: Remove userId foreign key (set to NULL)
Step 3: Remove IP address, device fingerprint
Step 4: Preserve: responseData, timestamp, contentId
Step 5: Update analytics aggregates (no re-calculation needed)
```

## 30-Day Grace Period Behavior

```
Day 0: User requests deletion
       → Account marked as "pending_deletion"
       → User logged out of all sessions
       → Login blocked with message: "Account deletion in progress"

Day 1-29: Grace period
       → User can contact support to cancel deletion
       → No new logins allowed
       → Data still exists but inaccessible

Day 30: Final deletion
       → Personal data permanently deleted
       → Responses anonymized (not deleted)
       → Email sent: "Your account has been deleted"
```


# ══════════════════════════════════════════════════════════════════════════════
# LIVE POLL CAPACITY MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Participants │ Status      │ UI Indicator          │ System Action      │
├──────────────┼─────────────┼───────────────────────┼────────────────────┤
│ 0 - 7,000    │ Normal      │ None                  │ Normal operation   │
│ 7,001-9,000  │ Busy        │ "High traffic"        │ Monitor closely    │
│ 9,001-9,500  │ Near Full   │ "Almost full"         │ Warn new joiners   │
│ 9,501-10,000 │ Critical    │ "Limited spots left"  │ Queue new joiners  │
│ 10,001+      │ Full        │ "Session full"        │ Waiting room only  │
└──────────────┴─────────────┴───────────────────────┴────────────────────┘
```

## Waiting Room Specification

```
┌──────────────────────────┬────────────────────────────────────────────────┐
│ Feature                  │ Specification                                  │
├──────────────────────────┼────────────────────────────────────────────────┤
│ Max waiting room size    │ 1,000 users                                    │
│ Queue order              │ FIFO (first in, first out)                     │
│ Position updates         │ Every 5 seconds                                │
│ Can see live results?    │ Yes (spectator mode)                           │
│ Can vote from queue?     │ No, must be promoted first                     │
│ Auto-promotion           │ Yes, when participant leaves                   │
│ Promotion notification   │ "You can now vote!" + sound                    │
│ Leave queue option       │ Yes, anytime                                   │
│ Estimated wait display   │ Based on avg session duration                  │
└──────────────────────────┴────────────────────────────────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# RELIABILITY SCORE COMPONENTS
# ══════════════════════════════════════════════════════════════════════════════

```typescript
interface ReliabilityComponents {
  responseConsistency: number
  timePattern: number
  crossValidation: number
  completionRate: number
  accountAge: number
  verificationLevel: number
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
```


# ══════════════════════════════════════════════════════════════════════════════
# ANALYTICS TIME BUCKET
# ══════════════════════════════════════════════════════════════════════════════

```typescript
interface TimeBucket {
  bucketStart: Date
  voteCount: number
  uniqueVoters: number
  optionBreakdown: Record<string, number>
}
```

## Aggregation Strategy

```
┌───────────────────┬─────────────┬──────────────────┬────────────────────┐
│ Time Range        │ Bucket Size │ Storage Duration │ Query Pattern      │
├───────────────────┼─────────────┼──────────────────┼────────────────────┤
│ Last 1 hour       │ 1 minute    │ 24 hours         │ Real-time charts   │
│ Last 24 hours     │ 15 minutes  │ 7 days           │ Daily trends       │
│ Last 7 days       │ 1 hour      │ 30 days          │ Weekly reports     │
│ Last 30 days      │ 1 day       │ 1 year           │ Monthly reports    │
│ Older than 30 days│ 1 week      │ Forever          │ Historical         │
└───────────────────┴─────────────┴──────────────────┴────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# DATABASE CONNECTION POOL GUIDELINES
# ══════════════════════════════════════════════════════════════════════════════

```
┌────────────────────┬──────────┬──────────┬────────────────────┬─────────┐
│ Daily Active Users │ min_pool │ max_pool │ connection_timeout │ idle    │
├────────────────────┼──────────┼──────────┼────────────────────┼─────────┤
│ < 1,000 (Dev)      │ 2        │ 10       │ 5 seconds          │ 60 sec  │
│ 1,000 - 10,000     │ 5        │ 20       │ 5 seconds          │ 120 sec │
│ 10,000 - 100,000   │ 10       │ 50       │ 3 seconds          │ 180 sec │
│ > 100,000          │ 20       │ 100      │ 3 seconds          │ 300 sec │
└────────────────────┴──────────┴──────────┴────────────────────┴─────────┘
```

## Monitoring Thresholds

```
┌───────────────────────────┬────────────┬────────────┬───────────────────┐
│ Metric                    │ Warning    │ Critical   │ Action            │
├───────────────────────────┼────────────┼────────────┼───────────────────┤
│ Pool utilization          │ 70%        │ 90%        │ Increase max_pool │
│ Connection wait time      │ 100ms      │ 500ms      │ Increase pool     │
│ Idle connections          │ 50%        │ 70%        │ Decrease min_pool │
│ Connection errors/min     │ 5          │ 20         │ Check DB health   │
│ Query time p95            │ 100ms      │ 500ms      │ Query optimization│
└───────────────────────────┴────────────┴────────────┴───────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# CASCADE DELETE PROTECTION
# ══════════════════════════════════════════════════════════════════════════════

```
┌──────────────────┬─────────────┬─────────────────┬──────────────────────┐
│ Entity           │ Delete Type │ Recovery Window │ Hard Delete After    │
├──────────────────┼─────────────┼─────────────────┼──────────────────────┤
│ User             │ Soft        │ 30 days         │ 30 days              │
│ Organization     │ Soft        │ 30 days         │ 30 days              │
│ Poll/Test/Survey │ Soft        │ 7 days          │ 90 days              │
│ Response         │ Anonymize   │ N/A             │ Never (anonymized)   │
│ Comment          │ Soft        │ 24 hours        │ 30 days              │
│ Badge            │ Preserve    │ N/A             │ Never                │
└──────────────────┴─────────────┴─────────────────┴──────────────────────┘
```


# ══════════════════════════════════════════════════════════════════════════════
# FRAUD DETECTION PHASES
# ══════════════════════════════════════════════════════════════════════════════

## Phase 1: Synchronous (< 10ms)

```
┌──────────────────────────────┬───────────────────────┬──────────────────┐
│ Check                        │ Action on Fail        │ Latency          │
├──────────────────────────────┼───────────────────────┼──────────────────┤
│ Rate limit (Redis)           │ Block immediately     │ ~1ms             │
│ IP blocklist (Redis)         │ Block immediately     │ ~1ms             │
│ Device blocklist (Redis)     │ Block immediately     │ ~1ms             │
│ Duplicate check (Bloom)      │ Block immediately     │ ~2ms             │
│ Basic velocity (Redis)       │ Flag for Phase 2      │ ~2ms             │
└──────────────────────────────┴───────────────────────┴──────────────────┘
```

## Phase 2: Asynchronous (queued)

- Full device fingerprint analysis
- Cross-content pattern detection
- Behavioral analysis
- IP reputation check
- Machine learning scoring


# ══════════════════════════════════════════════════════════════════════════════
# DEVICE CATEGORY ENUM
# ══════════════════════════════════════════════════════════════════════════════

```typescript
enum DeviceCategory {
  DESKTOP
  MOBILE
  TABLET
  UNKNOWN
}
```


# ══════════════════════════════════════════════════════════════════════════════
# FRAUD DECISION ENUM
# ══════════════════════════════════════════════════════════════════════════════

```typescript
enum FraudDecision {
  ACCEPT
  REVIEW
  SOFT_REJECT
  HARD_REJECT
}
```


# ══════════════════════════════════════════════════════════════════════════════
# CONTENT TYPE ENUM
# ══════════════════════════════════════════════════════════════════════════════

```typescript
enum ContentType {
  POLL
  QUICK_POLL
  EXTENDED_POLL
  LIVE_POLL
  SURVEY
  TEST
}
```


# ══════════════════════════════════════════════════════════════════════════════
# CIRCUIT STATE ENUM
# ══════════════════════════════════════════════════════════════════════════════

```typescript
type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN"
```


# ══════════════════════════════════════════════════════════════════════════════
# RULE CATEGORY ENUM
# ══════════════════════════════════════════════════════════════════════════════

```typescript
type RuleCategory =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "ELIGIBILITY"
  | "LIMIT"
  | "STATE_TRANSITION"
  | "CALCULATION"
```


# ══════════════════════════════════════════════════════════════════════════════
# BUSINESS RULE INTERFACE
# ══════════════════════════════════════════════════════════════════════════════

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

interface RuleResult {
  passed: boolean
  ruleId: string
  message?: string
  metadata?: Record<string, unknown>
}
```


# ══════════════════════════════════════════════════════════════════════════════
# RETRY CONFIG INTERFACE
# ══════════════════════════════════════════════════════════════════════════════

```typescript
interface RetryConfig {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors: string[]
}
```


# ══════════════════════════════════════════════════════════════════════════════
# CIRCUIT BREAKER CONFIG INTERFACE
# ══════════════════════════════════════════════════════════════════════════════

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number
  successThreshold: number
  timeout: number
  halfOpenRequests: number
}
```

---
*Last Updated: 2026-01-23*
