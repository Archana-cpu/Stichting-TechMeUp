# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 28                                    █
# █              IMPLEMENTATION CRITICAL FIXES (PRE-CODE)                      █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████

# Version: 1.0.0
# Created: January 2026
# Purpose: Addresses Tier 1 architectural gaps identified in bible audit
# Status: [AUTHORITATIVE] - These specifications OVERRIDE any conflicting content




# ══════════════════════════════════════════════════════════════════════════════
# 28.1 DEVICE FINGERPRINT PRIVACY ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 28.1.1 Problem Statement

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SECURITY ISSUE: DEANONYMIZATION RISK                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CURRENT STATE (Bible-013):                                                     │
│  • deviceFingerprint stored DIRECTLY in PollResponse, SurveyResponse models    │
│  • This creates a LINKABLE identifier between responses and device identity    │
│  • Violates anonymity guarantee (P-009)                                        │
│                                                                                 │
│  RISK SCENARIO:                                                                 │
│  1. User A votes on Poll X anonymously                                         │
│  2. Response record contains deviceFingerprint="abc123"                        │
│  3. User A later registers with same device                                    │
│  4. Registration creates DeviceFingerprint record with hash="abc123"           │
│  5. JOIN query can now link: User A → Device abc123 → Response on Poll X       │
│  6. Anonymity BROKEN                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 28.1.2 Solution: Decoupled Fingerprint Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              PRIVACY-PRESERVING FINGERPRINT ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PRINCIPLE: Device fingerprint is used ONLY for fraud detection at the         │
│  moment of submission. It is NEVER stored in response records.                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         SUBMISSION FLOW                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Client submits response + fingerprint                                          │
│         │                                                                       │
│         ▼                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  1. FRAUD CHECK (sync, < 100ms)                                          │  │
│  │     • Check fingerprint against blocked list                             │  │
│  │     • Check for duplicate submission (same content + fingerprint hash)   │  │
│  │     • Calculate initial fraud score                                      │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│         │                                                                       │
│         ▼                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  2. STORE RESPONSE (fingerprint NOT included)                            │  │
│  │     • participantHash = HMAC(userId + contentId + salt)                  │  │
│  │     • deviceType = GENERAL classification only (mobile/desktop/tablet)   │  │
│  │     • NO deviceFingerprint field in response record                      │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│         │                                                                       │
│         ▼                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  3. FRAUD DETECTION LOG (separate, unlinkable)                           │  │
│  │     • Store: contentId + fingerprintHash + timestamp + fraudScore        │  │
│  │     • NO responseId stored (one-way, cannot join back to response)       │  │
│  │     • Auto-expire after 30 days (fraud pattern analysis only)            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 28.1.3 Database Schema Updates

```typescript
// Drizzle schema
// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE MODELS - REMOVE deviceFingerprint field
// [OVERRIDE] Bible-013 Section 13.5
// ══════════════════════════════════════════════════════════════════════════════

export const pollResponses = pgTable('poll_responses', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  pollId: text('poll_id').notNull(),

  participantHash: varchar('participant_hash', { length: 64 }).notNull(),
  selectedOptionId: text('selected_option_id').notNull(),

  completedAt: timestamp('completed_at').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  expectedDurationSec: integer('expected_duration_sec'),

  // SECURITY FIX: deviceFingerprint REMOVED
  // Only store general device category (cannot identify specific device)
  deviceCategory        DeviceCategory        @default(UNKNOWN)

  // Quality scores (calculated async, not linked to device)
  fraudScore            Float?
  qualityScore          Float?
  isValid               Boolean               @default(true)

  createdAt             DateTime              @default(now())

  poll                  Poll                  @relation(fields: [pollId], references: [id], onDelete: Cascade)

  @@unique([pollId, participantHash])
  @@index([pollId, selectedOptionId])
  @@index([pollId, isValid, createdAt])
  @@map("poll_responses")
}

model SurveyResponse {
  id                    String                @id @default(cuid())
  surveyId              String

  participantHash       String                @db.VarChar(64)

  // SECURITY FIX: deviceFingerprint REMOVED
  deviceCategory        DeviceCategory        @default(UNKNOWN)

  // ... rest of fields unchanged

  @@map("survey_responses")
}

// New enum for general device classification (non-identifying)
enum DeviceCategory {
  DESKTOP
  MOBILE
  TABLET
  UNKNOWN
}


// ══════════════════════════════════════════════════════════════════════════════
// FRAUD DETECTION LOG - Separate, unlinkable table
// [NEW] Stores fraud signals WITHOUT linking to specific responses
// ══════════════════════════════════════════════════════════════════════════════

model FraudDetectionLog {
  id                    String                @id @default(cuid())

  // Content reference (can query "fraud attempts on this content")
  contentType           ContentType
  contentId             String

  // Fingerprint stored as salted hash (different salt than response participantHash)
  fingerprintHash       String                @db.VarChar(64)

  // Fraud analysis results
  fraudScore            Float
  riskFactors           String[]              @default([])
  decision              FraudDecision

  // Behavioral signals summary (not raw data)
  behaviorSummary       Json?

  // IP info (truncated for privacy)
  ipPrefix              String?               @db.VarChar(16)  // First 3 octets only
  countryCode           String?               @db.VarChar(2)

  // Timing
  checkedAt             DateTime              @default(now())

  // Auto-expire for privacy
  expiresAt             DateTime              @default(dbgenerated("NOW() + INTERVAL '30 days'"))

  // NO responseId field - cannot link back to specific response
  // This is intentional for privacy

  @@index([contentId, contentType, checkedAt])
  @@index([fingerprintHash, checkedAt])
  @@index([fraudScore])
  @@index([expiresAt])
  @@map("fraud_detection_logs")
}
```

## 28.1.4 Implementation Code

```typescript
// File: src/fraud/privacy-preserving-check.ts
// [AUTHORITATIVE] Privacy-preserving fraud detection

import { createHmac } from 'crypto'

// Separate salts for different purposes (loaded from env)
const PARTICIPANT_SALT = process.env.PARTICIPANT_HASH_SALT!
const FRAUD_LOG_SALT = process.env.FRAUD_LOG_HASH_SALT!

// These salts MUST be different to prevent cross-correlation
if (PARTICIPANT_SALT === FRAUD_LOG_SALT) {
  throw new Error('SECURITY: PARTICIPANT_SALT and FRAUD_LOG_SALT must be different')
}


interface FraudCheckInput {
  contentType: 'POLL' | 'SURVEY' | 'TEST'
  contentId: string
  userId: string | null  // null for anonymous
  deviceFingerprint: string
  ipAddress: string
  behavioralSignals?: BehavioralSignals
}

interface FraudCheckResult {
  allowed: boolean
  fraudScore: number
  decision: 'ACCEPT' | 'REVIEW' | 'SOFT_REJECT' | 'HARD_REJECT'
  participantHash: string  // For response record
  riskFactors: string[]
}


async function performPrivacyPreservingFraudCheck(
  input: FraudCheckInput
): Promise<FraudCheckResult> {

  // 1. Generate participant hash (for response deduplication)
  //    Uses different salt than fraud log
  const participantHash = generateParticipantHash(
    input.userId || input.deviceFingerprint,
    input.contentId
  )

  // 2. Generate fraud log fingerprint hash (for fraud pattern analysis)
  //    Uses different salt, cannot be correlated with participant hash
  const fraudLogFingerprintHash = generateFraudLogHash(
    input.deviceFingerprint,
    input.contentId
  )

  // 3. Check for duplicate submission
  const isDuplicate = await checkDuplicateParticipation(
    input.contentId,
    participantHash
  )

  if (isDuplicate) {
    return {
      allowed: false,
      fraudScore: 0,
      decision: 'HARD_REJECT',
      participantHash,
      riskFactors: ['DUPLICATE_SUBMISSION']
    }
  }

  // 4. Check if fingerprint is blocked
  const isBlocked = await checkFingerprintBlocked(input.deviceFingerprint)

  if (isBlocked) {
    // Log to fraud detection (async, don't block response)
    queueFraudLog({
      contentType: input.contentType,
      contentId: input.contentId,
      fingerprintHash: fraudLogFingerprintHash,
      fraudScore: 0,
      decision: 'HARD_REJECT',
      riskFactors: ['BLOCKED_DEVICE'],
      ipPrefix: truncateIP(input.ipAddress)
    })

    return {
      allowed: false,
      fraudScore: 0,
      decision: 'HARD_REJECT',
      participantHash,
      riskFactors: ['BLOCKED_DEVICE']
    }
  }

  // 5. Calculate fraud score (quick check only, detailed analysis async)
  const quickFraudScore = await calculateQuickFraudScore(
    input.deviceFingerprint,
    input.ipAddress,
    input.behavioralSignals
  )

  const decision = determineDecision(quickFraudScore, input.contentType)

  // 6. Queue detailed fraud analysis (async, doesn't block response)
  if (decision !== 'HARD_REJECT') {
    queueDetailedFraudAnalysis({
      contentType: input.contentType,
      contentId: input.contentId,
      fingerprintHash: fraudLogFingerprintHash,
      quickScore: quickFraudScore,
      behavioralSignals: input.behavioralSignals,
      ipPrefix: truncateIP(input.ipAddress)
    })
  }

  // 7. Log fraud check result (unlinkable from response)
  queueFraudLog({
    contentType: input.contentType,
    contentId: input.contentId,
    fingerprintHash: fraudLogFingerprintHash,
    fraudScore: quickFraudScore,
    decision,
    riskFactors: [],
    ipPrefix: truncateIP(input.ipAddress)
  })

  return {
    allowed: decision !== 'HARD_REJECT',
    fraudScore: quickFraudScore,
    decision,
    participantHash,
    riskFactors: []
  }
}


// Generate participant hash - for response deduplication
function generateParticipantHash(userIdentifier: string, contentId: string): string {
  return createHmac('sha256', PARTICIPANT_SALT)
    .update(`${userIdentifier}:${contentId}`)
    .digest('hex')
}

// Generate fraud log hash - for fraud pattern analysis (DIFFERENT salt)
function generateFraudLogHash(fingerprint: string, contentId: string): string {
  return createHmac('sha256', FRAUD_LOG_SALT)
    .update(`${fingerprint}:${contentId}`)
    .digest('hex')
}

// Truncate IP for privacy (keep first 3 octets for geo analysis)
function truncateIP(ip: string): string {
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`
  }
  // IPv6: keep first 3 segments
  const v6parts = ip.split(':')
  if (v6parts.length >= 3) {
    return `${v6parts[0]}:${v6parts[1]}:${v6parts[2]}::`
  }
  return 'unknown'
}


export {
  performPrivacyPreservingFraudCheck,
  generateParticipantHash,
  generateFraudLogHash,
  truncateIP
}
export type { FraudCheckInput, FraudCheckResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 28.2 LIVE POLL WEBSOCKET SCALING ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 28.2.1 Problem Statement

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              PERFORMANCE ISSUE: WEBSOCKET SCALING UNDEFINED                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CURRENT STATE (Bible-023 Section 23.17.1.1):                                   │
│  • WebSocket protocol defined for single server                                 │
│  • 10,000 participant limit specified (P-011, P-040)                           │
│  • NO horizontal scaling architecture defined                                   │
│                                                                                 │
│  PROBLEM:                                                                       │
│  • Single WebSocket server cannot handle 10K concurrent connections             │
│  • Memory: ~1MB per connection = 10GB RAM minimum                               │
│  • CPU: Broadcasting to 10K clients creates bottleneck                         │
│  • No failover if server crashes                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 28.2.2 Solution: Partykit (Recommended) or Redis Pub/Sub

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              RECOMMENDED: PARTYKIT (Edge-Native WebSocket)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  WHY PARTYKIT:                                                                  │
│  • Edge-native: Runs on Cloudflare Workers (global, low latency)               │
│  • Auto-scaling: No capacity planning needed                                   │
│  • Stateful: Each "party" (room) has persistent state                          │
│  • Simple: Single deployment, no Redis infrastructure needed                   │
│  • Cost: Pay per usage, not per server                                         │
│                                                                                 │
│  ARCHITECTURE:                                                                  │
│                                                                                 │
│       ┌─────────────────────────────────────────────────────────────────┐      │
│       │                    CLOUDFLARE EDGE                               │      │
│       │                                                                  │      │
│       │   ┌────────────┐  ┌────────────┐  ┌────────────┐               │      │
│       │   │  Party     │  │  Party     │  │  Party     │               │      │
│       │   │  ABC123    │  │  DEF456    │  │  GHI789    │               │      │
│       │   │  (Live Poll)│  │  (Live Poll)│  │  (Live Poll)│              │      │
│       │   │            │  │            │  │            │               │      │
│       │   │ State:     │  │ State:     │  │ State:     │               │      │
│       │   │ - votes    │  │ - votes    │  │ - votes    │               │      │
│       │   │ - users    │  │ - users    │  │ - users    │               │      │
│       │   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘               │      │
│       │         │               │               │                       │      │
│       └─────────┼───────────────┼───────────────┼───────────────────────┘      │
│                 │               │               │                              │
│       ┌─────────┼───────────────┼───────────────┼───────────────────────┐      │
│       │   Clients connect to nearest edge location automatically        │      │
│       └─────────────────────────────────────────────────────────────────┘      │
│                                                                                 │
│  BENEFITS:                                                                      │
│  • 10K concurrent users per room = single party handles it                     │
│  • No sticky sessions needed                                                   │
│  • Automatic failover                                                          │
│  • Built-in hibernation for idle rooms                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 28.2.3 Partykit Implementation

```typescript
// File: party/livepoll.ts
// [AUTHORITATIVE] Partykit Live Poll server

import type { Party, PartyKitServer, Connection, ConnectionContext } from "partykit/server"

interface LivePollState {
  pollId: string
  status: 'WAITING' | 'ACTIVE' | 'REVEALING' | 'ENDED'
  currentQuestionId: string | null
  votes: Map<string, string>  // participantId -> optionId
  participants: Set<string>
  hostConnectionId: string | null
  createdAt: number
}

export default class LivePollServer implements PartyKitServer {
  constructor(public party: Party) {}

  // Persistent state (survives hibernation)
  state: LivePollState = {
    pollId: '',
    status: 'WAITING',
    currentQuestionId: null,
    votes: new Map(),
    participants: new Set(),
    hostConnectionId: null,
    createdAt: Date.now()
  }

  // Called when room is created or woken from hibernation
  async onStart() {
    // Restore state from storage if exists
    const stored = await this.party.storage.get<LivePollState>('state')
    if (stored) {
      this.state = {
        ...stored,
        votes: new Map(Object.entries(stored.votes || {})),
        participants: new Set(stored.participants || [])
      }
    }
  }

  // New connection
  async onConnect(conn: Connection, ctx: ConnectionContext) {
    const url = new URL(ctx.request.url)
    const fingerprint = url.searchParams.get('fp') || conn.id
    const isHost = url.searchParams.get('host') === 'true'

    // Check capacity (10K limit)
    if (this.state.participants.size >= 10000) {
      conn.send(JSON.stringify({
        type: 'JOIN_REJECTED',
        reason: 'SESSION_FULL'
      }))
      conn.close()
      return
    }

    // Check for duplicate
    if (this.state.participants.has(fingerprint)) {
      conn.send(JSON.stringify({
        type: 'JOIN_REJECTED',
        reason: 'DUPLICATE'
      }))
      conn.close()
      return
    }

    // Add participant
    this.state.participants.add(fingerprint)
    conn.setState({ fingerprint, isHost })

    if (isHost && !this.state.hostConnectionId) {
      this.state.hostConnectionId = conn.id
    }

    // Send current state
    conn.send(JSON.stringify({
      type: 'JOIN_ACK',
      participantId: conn.id,
      sessionState: this.getPublicState()
    }))

    // Broadcast updated participant count
    this.broadcast({
      type: 'PARTICIPANT_UPDATE',
      count: this.state.participants.size
    })

    // Persist state
    await this.persistState()
  }

  // Message received
  async onMessage(message: string, conn: Connection) {
    const data = JSON.parse(message)
    const connState = conn.state as { fingerprint: string; isHost: boolean }

    switch (data.type) {
      case 'VOTE':
        await this.handleVote(conn, connState.fingerprint, data.optionId)
        break

      case 'NEXT_QUESTION':
        if (connState.isHost) {
          await this.handleNextQuestion(data.questionId)
        }
        break

      case 'END_POLL':
        if (connState.isHost) {
          await this.handleEndPoll()
        }
        break

      case 'HEARTBEAT':
        conn.send(JSON.stringify({ type: 'HEARTBEAT_ACK' }))
        break
    }
  }

  // Connection closed
  async onClose(conn: Connection) {
    const connState = conn.state as { fingerprint: string; isHost: boolean }

    this.state.participants.delete(connState.fingerprint)

    // If host disconnected, notify participants
    if (conn.id === this.state.hostConnectionId) {
      this.broadcast({
        type: 'HOST_DISCONNECTED'
      })
      this.state.hostConnectionId = null
    }

    this.broadcast({
      type: 'PARTICIPANT_UPDATE',
      count: this.state.participants.size
    })

    await this.persistState()
  }

  // Handle vote
  private async handleVote(conn: Connection, participantId: string, optionId: string) {
    // Check if already voted
    if (this.state.votes.has(participantId)) {
      conn.send(JSON.stringify({
        type: 'VOTE_REJECTED',
        reason: 'ALREADY_VOTED'
      }))
      return
    }

    this.state.votes.set(participantId, optionId)

    conn.send(JSON.stringify({
      type: 'VOTE_ACK',
      accepted: true
    }))

    // Broadcast updated results
    this.broadcast({
      type: 'STATE_UPDATE',
      state: this.getPublicState()
    })

    await this.persistState()
  }

  // Handle next question
  private async handleNextQuestion(questionId: string) {
    this.state.currentQuestionId = questionId
    this.state.votes.clear()
    this.state.status = 'ACTIVE'

    this.broadcast({
      type: 'QUESTION_CHANGED',
      questionId,
      state: this.getPublicState()
    })

    await this.persistState()
  }

  // Handle end poll
  private async handleEndPoll() {
    this.state.status = 'ENDED'

    this.broadcast({
      type: 'SESSION_ENDED',
      finalResults: this.calculateResults()
    })

    // Clean up after 5 minutes
    setTimeout(() => {
      this.party.storage.deleteAll()
    }, 5 * 60 * 1000)
  }

  // Get public state (safe to send to clients)
  private getPublicState() {
    return {
      status: this.state.status,
      currentQuestionId: this.state.currentQuestionId,
      participantCount: this.state.participants.size,
      ...this.calculateResults()
    }
  }

  // Calculate vote results
  private calculateResults() {
    const voteCounts: Record<string, number> = {}
    for (const optionId of this.state.votes.values()) {
      voteCounts[optionId] = (voteCounts[optionId] || 0) + 1
    }

    const total = this.state.votes.size
    const percentages: Record<string, number> = {}
    for (const [optionId, count] of Object.entries(voteCounts)) {
      percentages[optionId] = total > 0 ? Math.round((count / total) * 100) : 0
    }

    return { voteCounts, percentages, totalVotes: total }
  }

  // Broadcast to all connections
  private broadcast(message: object) {
    const data = JSON.stringify(message)
    for (const conn of this.party.getConnections()) {
      conn.send(data)
    }
  }

  // Persist state to durable storage
  private async persistState() {
    await this.party.storage.put('state', {
      ...this.state,
      votes: Object.fromEntries(this.state.votes),
      participants: Array.from(this.state.participants)
    })
  }
}
```

```typescript
// File: src/livepoll/client.ts
// Client-side Partykit connection

import PartySocket from "partysocket"

export function connectToLivePoll(
  sessionCode: string,
  fingerprint: string,
  options: { isHost?: boolean; onMessage: (msg: any) => void }
) {
  const socket = new PartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
    room: sessionCode,
    query: {
      fp: fingerprint,
      host: options.isHost ? 'true' : 'false'
    }
  })

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    options.onMessage(data)
  })

  return {
    vote: (optionId: string) => {
      socket.send(JSON.stringify({ type: 'VOTE', optionId }))
    },
    nextQuestion: (questionId: string) => {
      socket.send(JSON.stringify({ type: 'NEXT_QUESTION', questionId }))
    },
    endPoll: () => {
      socket.send(JSON.stringify({ type: 'END_POLL' }))
    },
    close: () => socket.close()
  }
}
```


## 28.2.4 Alternative: Redis Pub/Sub (Self-Hosted)

For self-hosted deployments or cost optimization at very large scale, use Redis Pub/Sub:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              ALTERNATIVE: REDIS PUB/SUB ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                          ┌─────────────────┐                                    │
│                          │   Load Balancer │                                    │
│                          │  (sticky sessions)│                                   │
│                          └────────┬────────┘                                    │
│                                   │                                              │
│            ┌──────────────────────┼──────────────────────┐                      │
│            │                      │                      │                       │
│            ▼                      ▼                      ▼                       │
│    ┌───────────────┐     ┌───────────────┐     ┌───────────────┐               │
│    │  WS Server 1  │     │  WS Server 2  │     │  WS Server N  │               │
│    │  (~3K conns)  │     │  (~3K conns)  │     │  (~3K conns)  │               │
│    └───────┬───────┘     └───────┬───────┘     └───────┬───────┘               │
│            │                      │                      │                       │
│            └──────────────────────┼──────────────────────┘                      │
│                                   │                                              │
│                          ┌────────▼────────┐                                    │
│                          │  Redis Cluster  │                                    │
│                          │   (Pub/Sub)     │                                    │
│                          └────────┬────────┘                                    │
│                                   │                                              │
│            ┌──────────────────────┼──────────────────────┐                      │
│            │                      │                      │                       │
│            ▼                      ▼                      ▼                       │
│    ┌───────────────┐     ┌───────────────┐     ┌───────────────┐               │
│    │ live:ABC123   │     │ live:DEF456   │     │ live:GHI789   │               │
│    │  (session 1)  │     │  (session 2)  │     │  (session 3)  │               │
│    └───────────────┘     └───────────────┘     └───────────────┘               │
│                                                                                 │
│  FLOW:                                                                          │
│  1. Client connects to any WS server (load balanced)                           │
│  2. Server subscribes to Redis channel: live:{sessionCode}                     │
│  3. Vote received → publish to Redis channel                                   │
│  4. All subscribed servers receive → broadcast to their clients                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 28.2.3 Implementation Architecture

```typescript
// File: src/livepoll/scaling/websocket-cluster.ts
// [AUTHORITATIVE] WebSocket horizontal scaling with Redis Pub/Sub

import { Redis } from 'ioredis'
import { WebSocketServer, WebSocket } from 'ws'

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const LIVE_POLL_SCALING_CONFIG = {
  // Per-server limits
  maxConnectionsPerServer: 3500,      // ~3.5K connections per server
  maxSessionsPerServer: 100,          // Max concurrent live poll sessions

  // Redis channels
  channelPrefix: 'livepoll:',
  voteChannel: (sessionCode: string) => `livepoll:${sessionCode}:votes`,
  stateChannel: (sessionCode: string) => `livepoll:${sessionCode}:state`,
  controlChannel: (sessionCode: string) => `livepoll:${sessionCode}:control`,

  // Health check
  healthCheckIntervalMs: 10000,
  serverRegistrationTTLSeconds: 30,

  // Memory management
  connectionMemoryBudgetMB: 3000,     // 3GB per server for connections
  gcThresholdPercent: 80,             // Trigger GC at 80% memory usage

  // Batching for broadcast efficiency
  broadcastBatchIntervalMs: 50,       // Batch broadcasts every 50ms
  maxBatchSize: 100                    // Max messages per batch
}


// ══════════════════════════════════════════════════════════════════════════════
// REDIS PUB/SUB MANAGER
// ══════════════════════════════════════════════════════════════════════════════

class LivePollPubSubManager {
  private publisher: Redis
  private subscriber: Redis
  private subscriptions = new Map<string, Set<(message: string) => void>>()

  constructor(redisUrl: string) {
    this.publisher = new Redis(redisUrl)
    this.subscriber = new Redis(redisUrl)

    this.subscriber.on('message', (channel, message) => {
      const handlers = this.subscriptions.get(channel)
      if (handlers) {
        handlers.forEach(handler => handler(message))
      }
    })
  }

  async subscribeToSession(
    sessionCode: string,
    onVote: (vote: VoteMessage) => void,
    onState: (state: SessionState) => void,
    onControl: (control: ControlMessage) => void
  ): Promise<void> {
    const voteChannel = LIVE_POLL_SCALING_CONFIG.voteChannel(sessionCode)
    const stateChannel = LIVE_POLL_SCALING_CONFIG.stateChannel(sessionCode)
    const controlChannel = LIVE_POLL_SCALING_CONFIG.controlChannel(sessionCode)

    // Subscribe to all session channels
    await this.subscriber.subscribe(voteChannel, stateChannel, controlChannel)

    // Register handlers
    this.registerHandler(voteChannel, (msg) => onVote(JSON.parse(msg)))
    this.registerHandler(stateChannel, (msg) => onState(JSON.parse(msg)))
    this.registerHandler(controlChannel, (msg) => onControl(JSON.parse(msg)))
  }

  async unsubscribeFromSession(sessionCode: string): Promise<void> {
    const voteChannel = LIVE_POLL_SCALING_CONFIG.voteChannel(sessionCode)
    const stateChannel = LIVE_POLL_SCALING_CONFIG.stateChannel(sessionCode)
    const controlChannel = LIVE_POLL_SCALING_CONFIG.controlChannel(sessionCode)

    await this.subscriber.unsubscribe(voteChannel, stateChannel, controlChannel)

    this.subscriptions.delete(voteChannel)
    this.subscriptions.delete(stateChannel)
    this.subscriptions.delete(controlChannel)
  }

  async publishVote(sessionCode: string, vote: VoteMessage): Promise<void> {
    const channel = LIVE_POLL_SCALING_CONFIG.voteChannel(sessionCode)
    await this.publisher.publish(channel, JSON.stringify(vote))
  }

  async publishState(sessionCode: string, state: SessionState): Promise<void> {
    const channel = LIVE_POLL_SCALING_CONFIG.stateChannel(sessionCode)
    await this.publisher.publish(channel, JSON.stringify(state))
  }

  async publishControl(sessionCode: string, control: ControlMessage): Promise<void> {
    const channel = LIVE_POLL_SCALING_CONFIG.controlChannel(sessionCode)
    await this.publisher.publish(channel, JSON.stringify(control))
  }

  private registerHandler(channel: string, handler: (msg: string) => void): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set())
    }
    this.subscriptions.get(channel)!.add(handler)
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// WEBSOCKET SERVER WITH HORIZONTAL SCALING
// ══════════════════════════════════════════════════════════════════════════════

class ScalableLivePollServer {
  private wss: WebSocketServer
  private pubsub: LivePollPubSubManager
  private redis: Redis

  // Session tracking
  private sessions = new Map<string, LivePollSession>()
  private connectionCount = 0
  private serverId: string

  constructor(port: number, redisUrl: string) {
    this.serverId = `ws-${process.env.HOSTNAME || 'local'}-${port}`
    this.wss = new WebSocketServer({ port })
    this.pubsub = new LivePollPubSubManager(redisUrl)
    this.redis = new Redis(redisUrl)

    this.setupHealthCheck()
    this.setupConnectionHandler()
  }

  private setupHealthCheck(): void {
    // Register server in Redis for load balancer health checks
    setInterval(async () => {
      await this.redis.setex(
        `livepoll:servers:${this.serverId}`,
        LIVE_POLL_SCALING_CONFIG.serverRegistrationTTLSeconds,
        JSON.stringify({
          serverId: this.serverId,
          connectionCount: this.connectionCount,
          sessionCount: this.sessions.size,
          memoryUsageMB: process.memoryUsage().heapUsed / 1024 / 1024,
          timestamp: Date.now()
        })
      )
    }, LIVE_POLL_SCALING_CONFIG.healthCheckIntervalMs)
  }

  private setupConnectionHandler(): void {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      // Check capacity
      if (this.connectionCount >= LIVE_POLL_SCALING_CONFIG.maxConnectionsPerServer) {
        ws.close(1013, 'Server at capacity')
        return
      }

      this.connectionCount++

      ws.on('close', () => {
        this.connectionCount--
      })

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString())
          await this.handleMessage(ws, message)
        } catch (error) {
          ws.send(JSON.stringify({ type: 'ERROR', code: 'INVALID_MESSAGE' }))
        }
      })
    })
  }

  private async handleMessage(ws: WebSocket, message: LivePollMessage): Promise<void> {
    switch (message.type) {
      case 'JOIN':
        await this.handleJoin(ws, message.sessionCode, message.fingerprint)
        break

      case 'VOTE':
        await this.handleVote(ws, message.optionId, message.timestamp)
        break

      case 'HEARTBEAT':
        ws.send(JSON.stringify({ type: 'HEARTBEAT_ACK' }))
        break

      case 'LEAVE':
        await this.handleLeave(ws)
        break
    }
  }

  private async handleJoin(
    ws: WebSocket,
    sessionCode: string,
    fingerprint: string
  ): Promise<void> {
    // Get or create session manager for this session
    let session = this.sessions.get(sessionCode)

    if (!session) {
      // First participant on this server for this session
      session = new LivePollSession(sessionCode, this.pubsub, this.redis)
      this.sessions.set(sessionCode, session)

      // Subscribe to Redis channels for cross-server communication
      await this.pubsub.subscribeToSession(
        sessionCode,
        (vote) => session!.handleRemoteVote(vote),
        (state) => session!.handleRemoteState(state),
        (control) => session!.handleRemoteControl(control)
      )
    }

    // Add participant to session
    const result = await session.addParticipant(ws, fingerprint)

    if (result.success) {
      ws.send(JSON.stringify({
        type: 'JOIN_ACK',
        participantId: result.participantId,
        sessionState: result.sessionState
      }))
    } else {
      ws.send(JSON.stringify({
        type: 'JOIN_REJECTED',
        reason: result.reason
      }))
    }
  }

  private async handleVote(ws: WebSocket, optionId: string, timestamp: number): Promise<void> {
    const participant = this.getParticipantByWs(ws)
    if (!participant) return

    const session = this.sessions.get(participant.sessionCode)
    if (!session) return

    // Process vote locally and publish to Redis for other servers
    const result = await session.processVote(participant.id, optionId, timestamp)

    if (result.success) {
      // Publish to Redis so all servers see this vote
      await this.pubsub.publishVote(participant.sessionCode, {
        participantId: participant.id,
        optionId,
        timestamp,
        serverId: this.serverId
      })

      ws.send(JSON.stringify({
        type: 'VOTE_ACK',
        voteId: result.voteId,
        accepted: true
      }))
    }
  }

  private async handleLeave(ws: WebSocket): Promise<void> {
    const participant = this.getParticipantByWs(ws)
    if (!participant) return

    const session = this.sessions.get(participant.sessionCode)
    if (session) {
      await session.removeParticipant(participant.id)

      // Clean up empty sessions
      if (session.participantCount === 0) {
        await this.pubsub.unsubscribeFromSession(participant.sessionCode)
        this.sessions.delete(participant.sessionCode)
      }
    }
  }

  private getParticipantByWs(ws: WebSocket): Participant | null {
    for (const session of this.sessions.values()) {
      const participant = session.getParticipantByWs(ws)
      if (participant) return participant
    }
    return null
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// SESSION MANAGER (handles one live poll session on this server)
// ══════════════════════════════════════════════════════════════════════════════

class LivePollSession {
  private participants = new Map<string, Participant>()
  private wsByParticipantId = new Map<string, WebSocket>()
  private broadcastQueue: StateUpdate[] = []
  private broadcastTimer: NodeJS.Timer | null = null

  constructor(
    public readonly sessionCode: string,
    private pubsub: LivePollPubSubManager,
    private redis: Redis
  ) {
    this.startBroadcastBatching()
  }

  get participantCount(): number {
    return this.participants.size
  }

  async addParticipant(ws: WebSocket, fingerprint: string): Promise<JoinResult> {
    // Get global participant count from Redis
    const globalCount = await this.redis.hincrby(
      `livepoll:${this.sessionCode}:participants`,
      'count',
      0
    )

    // Check capacity (10K limit)
    if (globalCount >= 10000) {
      return { success: false, reason: 'SESSION_FULL' }
    }

    // Check for duplicate (same fingerprint)
    const isDuplicate = await this.redis.sismember(
      `livepoll:${this.sessionCode}:fingerprints`,
      fingerprint
    )

    if (isDuplicate) {
      return { success: false, reason: 'DUPLICATE' }
    }

    // Add participant
    const participantId = `p_${Date.now()}_${Math.random().toString(36).slice(2)}`

    await this.redis.multi()
      .hincrby(`livepoll:${this.sessionCode}:participants`, 'count', 1)
      .sadd(`livepoll:${this.sessionCode}:fingerprints`, fingerprint)
      .exec()

    const participant: Participant = {
      id: participantId,
      sessionCode: this.sessionCode,
      fingerprint,
      joinedAt: Date.now()
    }

    this.participants.set(participantId, participant)
    this.wsByParticipantId.set(participantId, ws)

    // Get current session state
    const sessionState = await this.getSessionState()

    return {
      success: true,
      participantId,
      sessionState
    }
  }

  async removeParticipant(participantId: string): Promise<void> {
    const participant = this.participants.get(participantId)
    if (!participant) return

    await this.redis.multi()
      .hincrby(`livepoll:${this.sessionCode}:participants`, 'count', -1)
      .srem(`livepoll:${this.sessionCode}:fingerprints`, participant.fingerprint)
      .exec()

    this.participants.delete(participantId)
    this.wsByParticipantId.delete(participantId)
  }

  async processVote(
    participantId: string,
    optionId: string,
    timestamp: number
  ): Promise<VoteResult> {
    // Update vote counts in Redis (atomic)
    await this.redis.hincrby(
      `livepoll:${this.sessionCode}:votes`,
      optionId,
      1
    )

    const voteId = `v_${Date.now()}_${participantId.slice(2, 8)}`

    return { success: true, voteId }
  }

  // Called when another server publishes a vote
  handleRemoteVote(vote: VoteMessage): void {
    // Queue state update for broadcast to local clients
    this.queueBroadcast({ type: 'VOTE_UPDATE', vote })
  }

  // Called when another server publishes state
  handleRemoteState(state: SessionState): void {
    this.broadcastToLocalClients({ type: 'STATE_UPDATE', state })
  }

  // Called when host ends poll or changes question
  handleRemoteControl(control: ControlMessage): void {
    this.broadcastToLocalClients(control)
  }

  getParticipantByWs(ws: WebSocket): Participant | null {
    for (const [id, participant] of this.participants) {
      if (this.wsByParticipantId.get(id) === ws) {
        return participant
      }
    }
    return null
  }

  private async getSessionState(): Promise<SessionState> {
    const [votes, metadata] = await Promise.all([
      this.redis.hgetall(`livepoll:${this.sessionCode}:votes`),
      this.redis.hgetall(`livepoll:${this.sessionCode}:metadata`)
    ])

    const voteCounts: Record<string, number> = {}
    let total = 0

    for (const [optionId, count] of Object.entries(votes)) {
      voteCounts[optionId] = parseInt(count, 10)
      total += voteCounts[optionId]
    }

    const percentages: Record<string, number> = {}
    for (const [optionId, count] of Object.entries(voteCounts)) {
      percentages[optionId] = total > 0 ? Math.round((count / total) * 100) : 0
    }

    return {
      currentQuestionId: metadata.currentQuestionId || null,
      questionIndex: parseInt(metadata.questionIndex || '0', 10),
      totalQuestions: parseInt(metadata.totalQuestions || '1', 10),
      participantCount: parseInt(metadata.participantCount || '0', 10),
      voteCounts,
      percentages,
      timeRemainingMs: metadata.timeRemainingMs ? parseInt(metadata.timeRemainingMs, 10) : null,
      status: (metadata.status as SessionState['status']) || 'WAITING'
    }
  }

  private startBroadcastBatching(): void {
    this.broadcastTimer = setInterval(() => {
      if (this.broadcastQueue.length > 0) {
        this.flushBroadcastQueue()
      }
    }, LIVE_POLL_SCALING_CONFIG.broadcastBatchIntervalMs)
  }

  private queueBroadcast(update: StateUpdate): void {
    this.broadcastQueue.push(update)

    if (this.broadcastQueue.length >= LIVE_POLL_SCALING_CONFIG.maxBatchSize) {
      this.flushBroadcastQueue()
    }
  }

  private async flushBroadcastQueue(): Promise<void> {
    if (this.broadcastQueue.length === 0) return

    // Aggregate vote updates into single state update
    const state = await this.getSessionState()
    this.broadcastToLocalClients({ type: 'STATE_UPDATE', state })

    this.broadcastQueue = []
  }

  private broadcastToLocalClients(message: object): void {
    const data = JSON.stringify(message)

    for (const ws of this.wsByParticipantId.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    }
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ══════════════════════════════════════════════════════════════════════════════

interface Participant {
  id: string
  sessionCode: string
  fingerprint: string
  joinedAt: number
}

interface JoinResult {
  success: boolean
  participantId?: string
  sessionState?: SessionState
  reason?: 'SESSION_FULL' | 'SESSION_ENDED' | 'DUPLICATE'
}

interface VoteResult {
  success: boolean
  voteId?: string
}

interface VoteMessage {
  participantId: string
  optionId: string
  timestamp: number
  serverId: string
}

interface ControlMessage {
  type: 'SESSION_ENDED' | 'QUESTION_CHANGED' | 'RESULTS_REVEALED'
  payload?: any
}

interface StateUpdate {
  type: string
  vote?: VoteMessage
  state?: SessionState
}

interface SessionState {
  currentQuestionId: string | null
  questionIndex: number
  totalQuestions: number
  participantCount: number
  voteCounts: Record<string, number>
  percentages: Record<string, number>
  timeRemainingMs: number | null
  status: 'WAITING' | 'ACTIVE' | 'REVEALING' | 'ENDED'
}


export {
  LIVE_POLL_SCALING_CONFIG,
  ScalableLivePollServer,
  LivePollPubSubManager,
  LivePollSession
}
export type {
  Participant,
  JoinResult,
  VoteMessage,
  SessionState
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 28.3 PLUS/PREMIUM FEATURE CLARIFICATION
# ══════════════════════════════════════════════════════════════════════════════

## 28.3.1 Decision Clarification [P-016 AUTHORITATIVE]

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│            P-016 AUTHORITATIVE CLARIFICATION                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  DECISION: Plus tier ($4.99/mo) grants PULSE + COMMENTS access WITHOUT         │
│            requiring participation in the content.                              │
│                                                                                 │
│  WHAT THIS MEANS:                                                               │
│  • Free users: Must participate (vote/complete test) to access PULSE/COMMENTS  │
│  • Plus users: Can view results and read/post comments WITHOUT participating   │
│  • Premium users: Same as Plus, PLUS additional features (live polls, etc.)    │
│                                                                                 │
│  MONETIZATION RATIONALE:                                                        │
│  • Key differentiator between Free and Plus tiers                              │
│  • "Lurker" monetization - users who want to see results without contributing  │
│  • Creates engagement loop: see interesting results → tempted to participate   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 28.3.2 Complete Tier Feature Matrix [AUTHORITATIVE]

```typescript
// File: src/config/subscription-tiers.ts
// [AUTHORITATIVE] Definitive subscription tier features

const SUBSCRIPTION_TIER_FEATURES = {
  FREE: {
    price: 0,

    // Content Creation
    pollsPerDay: 3,
    testsPerWeek: 3,
    canCreateQuickPoll: true,
    canCreateExtendedPoll: false,
    canCreateLivePoll: false,
    canCreateSurvey: false,        // Requires organization
    canUsePreTest: false,
    canUseTargetAudience: false,
    canUseCustomThemes: false,
    maxPollOptions: 4,             // Quick poll limit

    // PULSE + COMMENTS Access
    canViewPulseWithoutParticipation: false,    // KEY LIMITATION
    canPostCommentsWithoutParticipation: false, // KEY LIMITATION
    canViewPulseAfterParticipation: true,
    canPostCommentsAfterParticipation: true,
    canRequestAccessWithoutParticipation: true, // 100+ char request

    // Social Features
    canFollow: true,
    canBeFollowed: true,
    canSendDMs: true,
    canReceiveDMs: true,

    // Badges & Profile
    maxPinnedBadges: 3,
    canHideBadges: true,
    canShareBadges: true
  },

  PLUS: {
    price: 4.99,

    // Content Creation
    pollsPerDay: 10,
    testsPerWeek: 10,
    canCreateQuickPoll: true,
    canCreateExtendedPoll: false,
    canCreateLivePoll: false,
    canCreateSurvey: false,
    canUsePreTest: false,
    canUseTargetAudience: false,
    canUseCustomThemes: false,
    maxPollOptions: 4,

    // PULSE + COMMENTS Access [KEY MONETIZATION FEATURE]
    canViewPulseWithoutParticipation: true,     // ✅ PLUS BENEFIT
    canPostCommentsWithoutParticipation: true,  // ✅ PLUS BENEFIT
    canViewPulseAfterParticipation: true,
    canPostCommentsAfterParticipation: true,
    canRequestAccessWithoutParticipation: true,

    // Social Features
    canFollow: true,
    canBeFollowed: true,
    canSendDMs: true,
    canReceiveDMs: true,

    // Badges & Profile
    maxPinnedBadges: 5,
    canHideBadges: true,
    canShareBadges: true
  },

  PREMIUM: {
    price: 9.99,

    // Content Creation
    pollsPerDay: -1,               // Unlimited
    testsPerWeek: -1,              // Unlimited
    canCreateQuickPoll: true,
    canCreateExtendedPoll: true,   // ✅ PREMIUM ONLY
    canCreateLivePoll: true,       // ✅ PREMIUM ONLY
    canCreateSurvey: false,        // Still requires organization
    canUsePreTest: true,           // ✅ PREMIUM ONLY
    canUseTargetAudience: true,    // ✅ PREMIUM ONLY
    canUseCustomThemes: true,      // ✅ PREMIUM ONLY
    maxPollOptions: 10,            // Extended poll limit

    // PULSE + COMMENTS Access
    canViewPulseWithoutParticipation: true,
    canPostCommentsWithoutParticipation: true,
    canViewPulseAfterParticipation: true,
    canPostCommentsAfterParticipation: true,
    canRequestAccessWithoutParticipation: true,

    // Social Features
    canFollow: true,
    canBeFollowed: true,
    canSendDMs: true,
    canReceiveDMs: true,

    // Badges & Profile
    maxPinnedBadges: 10,
    canHideBadges: true,
    canShareBadges: true,

    // Premium exclusive
    prioritySupport: true,
    earlyAccessFeatures: true
  }
} as const

type SubscriptionTier = keyof typeof SUBSCRIPTION_TIER_FEATURES

// Access check helper
function canAccessPulseComments(
  tier: SubscriptionTier,
  hasParticipated: boolean,
  hasApprovedAccessRequest: boolean
): boolean {
  const features = SUBSCRIPTION_TIER_FEATURES[tier]

  // Plus and Premium can always access
  if (features.canViewPulseWithoutParticipation) {
    return true
  }

  // Free users need participation or approved request
  return hasParticipated || hasApprovedAccessRequest
}

export { SUBSCRIPTION_TIER_FEATURES, canAccessPulseComments }
export type { SubscriptionTier }
```




# ══════════════════════════════════════════════════════════════════════════════
# 28.4 ASYNC FRAUD DETECTION ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════

## 28.4.1 Problem Statement

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              PERFORMANCE ISSUE: SYNCHRONOUS FRAUD DETECTION                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CURRENT STATE (Bible-009):                                                     │
│  • Full fraud detection runs synchronously during response submission          │
│  • Behavioral analysis, pattern detection, network analysis all in request     │
│  • Can take 200-500ms, blocking user experience                               │
│                                                                                 │
│  PROBLEM:                                                                       │
│  • User waits for fraud check before seeing "vote recorded" confirmation       │
│  • High-traffic polls can timeout during complex fraud analysis               │
│  • All-or-nothing: can't accept response and flag for later review            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 28.4.2 Solution: Two-Phase Fraud Detection

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              TWO-PHASE FRAUD DETECTION ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  PHASE 1: QUICK CHECK (Sync, < 50ms)                                           │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  • IP blocklist lookup (Redis)                                                 │
│  • Device blocklist lookup (Redis)                                             │
│  • Duplicate check (participantHash exists?)                                   │
│  • Rate limit check (too many submissions from IP?)                            │
│                                                                                 │
│  Result: ALLOW / HARD_REJECT                                                   │
│  If ALLOW → save response immediately, queue for Phase 2                       │
│  If HARD_REJECT → reject immediately, don't save                               │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  PHASE 2: DEEP ANALYSIS (Async, background job)                                │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  • Behavioral signal analysis (mouse, keyboard, scroll patterns)               │
│  • Response pattern detection (straight-lining, speeding)                      │
│  • Network analysis (cross-account correlation)                                │
│  • ML model scoring (fraud probability)                                        │
│                                                                                 │
│  Result: Update fraudScore and qualityScore on response                        │
│  If score < threshold → flag for moderation                                    │
│  If score very low → auto-invalidate response                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 28.4.3 Implementation

```typescript
// File: src/fraud/two-phase-detection.ts
// [AUTHORITATIVE] Two-phase fraud detection for non-blocking response submission

import { Redis } from 'ioredis'
import { Queue, Worker } from 'bullmq'


// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const FRAUD_DETECTION_CONFIG = {
  // Phase 1 (sync) thresholds
  phase1TimeoutMs: 50,
  ipRateLimitPerMinute: 30,
  deviceRateLimitPerMinute: 20,

  // Phase 2 (async) settings
  queueName: 'fraud-analysis',
  concurrency: 10,
  maxRetries: 3,
  retryDelayMs: 5000,

  // Score thresholds
  autoInvalidateThreshold: 20,    // Below 20 → auto-invalidate
  flagForReviewThreshold: 50,     // Below 50 → flag for moderation

  // Content-type specific
  contentThresholds: {
    QUICK_POLL: { autoInvalidate: 15, review: 40 },
    EXTENDED_POLL: { autoInvalidate: 20, review: 50 },
    SURVEY: { autoInvalidate: 30, review: 60 },
    TEST: { autoInvalidate: 20, review: 50 }
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// PHASE 1: QUICK CHECK (Synchronous)
// ══════════════════════════════════════════════════════════════════════════════

interface QuickCheckInput {
  contentType: 'QUICK_POLL' | 'EXTENDED_POLL' | 'SURVEY' | 'TEST'
  contentId: string
  participantHash: string
  ipAddress: string
  deviceFingerprint: string
}

interface QuickCheckResult {
  allowed: boolean
  reason?: 'BLOCKED_IP' | 'BLOCKED_DEVICE' | 'DUPLICATE' | 'RATE_LIMITED'
  requiresDeepAnalysis: boolean
}

class QuickFraudChecker {
  constructor(private redis: Redis) {}

  async check(input: QuickCheckInput): Promise<QuickCheckResult> {
    const startTime = Date.now()

    try {
      // Run all checks in parallel for speed
      const [
        isIPBlocked,
        isDeviceBlocked,
        isDuplicate,
        isRateLimited
      ] = await Promise.all([
        this.checkIPBlocked(input.ipAddress),
        this.checkDeviceBlocked(input.deviceFingerprint),
        this.checkDuplicate(input.contentId, input.participantHash),
        this.checkRateLimit(input.ipAddress, input.deviceFingerprint)
      ])

      // Hard rejections
      if (isIPBlocked) {
        return { allowed: false, reason: 'BLOCKED_IP', requiresDeepAnalysis: false }
      }

      if (isDeviceBlocked) {
        return { allowed: false, reason: 'BLOCKED_DEVICE', requiresDeepAnalysis: false }
      }

      if (isDuplicate) {
        return { allowed: false, reason: 'DUPLICATE', requiresDeepAnalysis: false }
      }

      if (isRateLimited) {
        return { allowed: false, reason: 'RATE_LIMITED', requiresDeepAnalysis: false }
      }

      // All quick checks passed
      return { allowed: true, requiresDeepAnalysis: true }

    } catch (error) {
      // On error, allow but flag for deep analysis
      console.error('Quick fraud check error:', error)
      return { allowed: true, requiresDeepAnalysis: true }
    } finally {
      const elapsed = Date.now() - startTime
      if (elapsed > FRAUD_DETECTION_CONFIG.phase1TimeoutMs) {
        console.warn(`Quick fraud check exceeded timeout: ${elapsed}ms`)
      }
    }
  }

  private async checkIPBlocked(ip: string): Promise<boolean> {
    return await this.redis.sismember('fraud:blocked:ips', ip) === 1
  }

  private async checkDeviceBlocked(fingerprint: string): Promise<boolean> {
    return await this.redis.sismember('fraud:blocked:devices', fingerprint) === 1
  }

  private async checkDuplicate(contentId: string, participantHash: string): Promise<boolean> {
    const key = `participation:${contentId}:${participantHash}`
    const exists = await this.redis.exists(key)

    if (!exists) {
      // Mark as participating (with 24h expiry for cleanup)
      await this.redis.setex(key, 86400, '1')
    }

    return exists === 1
  }

  private async checkRateLimit(ip: string, fingerprint: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 60000) // Current minute

    const [ipCount, deviceCount] = await Promise.all([
      this.redis.incr(`ratelimit:ip:${ip}:${now}`),
      this.redis.incr(`ratelimit:device:${fingerprint}:${now}`)
    ])

    // Set expiry on first increment
    if (ipCount === 1) {
      await this.redis.expire(`ratelimit:ip:${ip}:${now}`, 120)
    }
    if (deviceCount === 1) {
      await this.redis.expire(`ratelimit:device:${fingerprint}:${now}`, 120)
    }

    return (
      ipCount > FRAUD_DETECTION_CONFIG.ipRateLimitPerMinute ||
      deviceCount > FRAUD_DETECTION_CONFIG.deviceRateLimitPerMinute
    )
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// PHASE 2: DEEP ANALYSIS (Asynchronous)
// ══════════════════════════════════════════════════════════════════════════════

interface DeepAnalysisJob {
  responseId: string
  contentType: 'QUICK_POLL' | 'EXTENDED_POLL' | 'SURVEY' | 'TEST'
  contentId: string
  behavioralSignals?: BehavioralSignals
  ipAddress: string
  deviceFingerprint: string
  responseData: {
    durationSeconds: number
    expectedDurationSeconds: number
    answerPattern?: string[]  // For pattern detection
  }
}

interface DeepAnalysisResult {
  fraudScore: number
  qualityScore: number
  riskFactors: string[]
  action: 'KEEP' | 'FLAG' | 'INVALIDATE'
}

class DeepFraudAnalyzer {
  private queue: Queue
  private worker: Worker

  constructor(private redis: Redis, private db: DrizzleClient) {
    this.queue = new Queue(FRAUD_DETECTION_CONFIG.queueName, {
      connection: redis
    })

    this.worker = new Worker(
      FRAUD_DETECTION_CONFIG.queueName,
      async (job) => this.processJob(job.data),
      {
        connection: redis,
        concurrency: FRAUD_DETECTION_CONFIG.concurrency
      }
    )

    this.worker.on('failed', (job, error) => {
      console.error(`Fraud analysis job ${job?.id} failed:`, error)
    })
  }

  async queueAnalysis(job: DeepAnalysisJob): Promise<void> {
    await this.queue.add('analyze', job, {
      attempts: FRAUD_DETECTION_CONFIG.maxRetries,
      backoff: {
        type: 'exponential',
        delay: FRAUD_DETECTION_CONFIG.retryDelayMs
      }
    })
  }

  private async processJob(job: DeepAnalysisJob): Promise<DeepAnalysisResult> {
    // Run all analysis in parallel
    const [
      behaviorScore,
      patternScore,
      networkScore,
      speedScore
    ] = await Promise.all([
      this.analyzeBehavior(job.behavioralSignals),
      this.analyzeAnswerPatterns(job.responseData.answerPattern),
      this.analyzeNetworkPatterns(job.deviceFingerprint, job.ipAddress),
      this.analyzeSpeed(job.responseData.durationSeconds, job.responseData.expectedDurationSeconds)
    ])

    // Calculate weighted fraud score
    const fraudScore = (
      behaviorScore * 0.30 +
      patternScore * 0.25 +
      networkScore * 0.25 +
      speedScore * 0.20
    )

    // Calculate quality score (different weighting)
    const qualityScore = (
      behaviorScore * 0.20 +
      patternScore * 0.40 +
      speedScore * 0.40
    )

    const riskFactors: string[] = []
    if (behaviorScore < 50) riskFactors.push('SUSPICIOUS_BEHAVIOR')
    if (patternScore < 50) riskFactors.push('PATTERN_DETECTED')
    if (networkScore < 50) riskFactors.push('NETWORK_ANOMALY')
    if (speedScore < 50) riskFactors.push('SPEEDER')

    // Determine action
    const thresholds = FRAUD_DETECTION_CONFIG.contentThresholds[job.contentType]
    let action: 'KEEP' | 'FLAG' | 'INVALIDATE' = 'KEEP'

    if (fraudScore < thresholds.autoInvalidate) {
      action = 'INVALIDATE'
    } else if (fraudScore < thresholds.review) {
      action = 'FLAG'
    }

    // Update response in database
    await this.updateResponseScores(job.responseId, job.contentType, {
      fraudScore,
      qualityScore,
      riskFactors,
      action
    })

    return { fraudScore, qualityScore, riskFactors, action }
  }

  private async analyzeBehavior(signals?: BehavioralSignals): Promise<number> {
    if (!signals) return 70 // Default neutral score

    // Use behavioral analysis from Bible-009
    const result = analyzeBehavioralSignals(signals)
    return result.humanScore
  }

  private async analyzeAnswerPatterns(patterns?: string[]): Promise<number> {
    if (!patterns || patterns.length < 5) return 80

    // Detect straight-lining
    const uniqueAnswers = new Set(patterns)
    const straightLineRatio = 1 - (uniqueAnswers.size / patterns.length)

    if (straightLineRatio > 0.8) return 20  // Heavy straight-lining
    if (straightLineRatio > 0.6) return 40
    if (straightLineRatio > 0.4) return 60

    return 80
  }

  private async analyzeNetworkPatterns(
    fingerprint: string,
    ip: string
  ): Promise<number> {
    // Check for fraud farm indicators
    const [fingerprintCount, ipCount] = await Promise.all([
      this.redis.scard(`fraud:fingerprint:users:${fingerprint}`),
      this.redis.scard(`fraud:ip:users:${ip}`)
    ])

    // Many users from same device = suspicious
    if (fingerprintCount > 5) return 20
    if (fingerprintCount > 3) return 40

    // Many users from same IP = might be shared network
    if (ipCount > 20) return 50
    if (ipCount > 10) return 60

    return 80
  }

  private async analyzeSpeed(
    actualSeconds: number,
    expectedSeconds: number
  ): Promise<number> {
    const ratio = actualSeconds / expectedSeconds

    // Too fast = speeder
    if (ratio < 0.3) return 10
    if (ratio < 0.5) return 30
    if (ratio < 0.7) return 50

    // Too slow = might be distracted or bot
    if (ratio > 5) return 60
    if (ratio > 3) return 70

    return 90
  }

  private async updateResponseScores(
    responseId: string,
    contentType: string,
    result: {
      fraudScore: number
      qualityScore: number
      riskFactors: string[]
      action: 'KEEP' | 'FLAG' | 'INVALIDATE'
    }
  ): Promise<void> {
    const table = contentType === 'SURVEY' ? 'surveyResponse' :
                  contentType === 'TEST' ? 'testResult' : 'pollResponse'

    await this.db[table].update({
      where: { id: responseId },
      data: {
        fraudScore: result.fraudScore,
        qualityScore: result.qualityScore,
        isValid: result.action !== 'INVALIDATE',
        // Store risk factors in metadata or separate table
      }
    })

    // If flagged, create moderation queue entry
    if (result.action === 'FLAG') {
      await this.db.moderationQueue.create({
        data: {
          entityType: 'RESPONSE',
          entityId: responseId,
          reason: 'LOW_FRAUD_SCORE',
          fraudScore: result.fraudScore,
          riskFactors: result.riskFactors,
          status: 'PENDING'
        }
      })
    }
  }
}


// ══════════════════════════════════════════════════════════════════════════════
// RESPONSE SUBMISSION FLOW (Integrated)
// ══════════════════════════════════════════════════════════════════════════════

async function submitResponseWithFraudCheck(
  input: ResponseSubmissionInput,
  quickChecker: QuickFraudChecker,
  deepAnalyzer: DeepFraudAnalyzer,
  db: DrizzleClient
): Promise<ResponseSubmissionResult> {

  // Phase 1: Quick check (sync, < 50ms)
  const quickResult = await quickChecker.check({
    contentType: input.contentType,
    contentId: input.contentId,
    participantHash: input.participantHash,
    ipAddress: input.ipAddress,
    deviceFingerprint: input.deviceFingerprint
  })

  if (!quickResult.allowed) {
    return {
      success: false,
      error: quickResult.reason
    }
  }

  // Save response immediately (don't wait for deep analysis)
  const response = await db.pollResponse.create({
    data: {
      pollId: input.contentId,
      participantHash: input.participantHash,
      selectedOptionId: input.selectedOptionId,
      completedAt: new Date(),
      durationSeconds: input.durationSeconds,
      deviceCategory: input.deviceCategory,
      // fraudScore and qualityScore will be updated by Phase 2
      isValid: true  // Assume valid until proven otherwise
    }
  })

  // Phase 2: Queue deep analysis (async, doesn't block response)
  if (quickResult.requiresDeepAnalysis) {
    await deepAnalyzer.queueAnalysis({
      responseId: response.id,
      contentType: input.contentType,
      contentId: input.contentId,
      behavioralSignals: input.behavioralSignals,
      ipAddress: input.ipAddress,
      deviceFingerprint: input.deviceFingerprint,
      responseData: {
        durationSeconds: input.durationSeconds,
        expectedDurationSeconds: input.expectedDurationSeconds,
        answerPattern: input.answerPattern
      }
    })
  }

  return {
    success: true,
    responseId: response.id
  }
}


export {
  FRAUD_DETECTION_CONFIG,
  QuickFraudChecker,
  DeepFraudAnalyzer,
  submitResponseWithFraudCheck
}
export type {
  QuickCheckInput,
  QuickCheckResult,
  DeepAnalysisJob,
  DeepAnalysisResult
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 28.5 DATABASE INDEX ADDITIONS
# ══════════════════════════════════════════════════════════════════════════════

## 28.5.1 Additional Critical Indexes

```sql
-- ══════════════════════════════════════════════════════════════════════════════
-- FRAUD DETECTION INDEXES
-- [SUPPLEMENT] to Bible-013 Section 13.14
-- ══════════════════════════════════════════════════════════════════════════════

-- Fraud detection log queries
CREATE INDEX CONCURRENTLY idx_fraud_logs_fingerprint
ON fraud_detection_logs (fingerprint_hash, checked_at DESC)
WHERE decision != 'ACCEPT';

-- Quick blocklist lookup
CREATE INDEX CONCURRENTLY idx_fraud_logs_blocked
ON fraud_detection_logs (fingerprint_hash)
WHERE decision = 'HARD_REJECT';

-- Content fraud pattern analysis
CREATE INDEX CONCURRENTLY idx_fraud_logs_content
ON fraud_detection_logs (content_id, content_type, fraud_score)
WHERE fraud_score < 50;

-- Expiring records cleanup
CREATE INDEX CONCURRENTLY idx_fraud_logs_expiry
ON fraud_detection_logs (expires_at)
WHERE expires_at IS NOT NULL;


-- ══════════════════════════════════════════════════════════════════════════════
-- MODERATION QUEUE INDEXES
-- ══════════════════════════════════════════════════════════════════════════════

-- Pending moderation items
CREATE INDEX CONCURRENTLY idx_moderation_pending
ON moderation_queue (status, created_at ASC)
WHERE status = 'PENDING';

-- Moderator workload
CREATE INDEX CONCURRENTLY idx_moderation_assigned
ON moderation_queue (assigned_to, status)
WHERE assigned_to IS NOT NULL;


-- ═════════════════════════════════════════════���════════════════════════════════
-- LIVE POLL INDEXES
-- ══════════════════════════════════════════════════════════════════════════════

-- Active live poll sessions
CREATE INDEX CONCURRENTLY idx_live_polls_active
ON live_poll_sessions (status, created_at DESC)
WHERE status IN ('WAITING', 'ACTIVE');

-- Live poll by join code
CREATE UNIQUE INDEX CONCURRENTLY idx_live_polls_code
ON live_poll_sessions (join_code)
WHERE status IN ('WAITING', 'ACTIVE', 'REVEALING');
```




# ══════════════════════════════════════════════════════════════════════════════
# 28.6 SUMMARY OF FIXES
# ══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    TIER 1 FIXES SUMMARY                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. DEVICE FINGERPRINT PRIVACY [Section 28.1]                                   │
│     ✅ deviceFingerprint removed from response models                           │
│     ✅ Separate FraudDetectionLog with different salt (unlinkable)             │
│     ✅ Only deviceCategory (non-identifying) stored in response                │
│     ✅ Privacy-preserving fraud check implementation                            │
│                                                                                 │
│  2. LIVE POLL WEBSOCKET SCALING [Section 28.2]                                  │
│     ✅ Redis Pub/Sub architecture for cross-server communication               │
│     ✅ Horizontal scaling with ~3.5K connections per server                    │
│     ✅ Session state stored in Redis (shared across servers)                   │
│     ✅ Broadcast batching for efficiency                                        │
│     ✅ Health check and load balancer integration                              │
│                                                                                 │
│  3. P-016 PLUS/PREMIUM CLARIFICATION [Section 28.3]                             │
│     ✅ Authoritative tier feature matrix defined                               │
│     ✅ Clear: Plus tier = PULSE/COMMENTS without participation                 │
│     ✅ Access check helper function provided                                    │
│                                                                                 │
│  4. ASYNC FRAUD DETECTION [Section 28.4]                                        │
│     ✅ Phase 1: Quick check (sync, < 50ms) - blocklist, duplicate, rate limit  │
│     ✅ Phase 2: Deep analysis (async) - behavior, patterns, network            │
│     ✅ Response saved immediately, fraud score updated async                   │
│     ✅ Auto-invalidate or flag for review based on score                       │
│     ✅ BullMQ job queue for reliable processing                                │
│                                                                                 │
│  5. DATABASE INDEX ADDITIONS [Section 28.5]                                     │
│     ✅ Fraud detection log indexes                                             │
│     ✅ Moderation queue indexes                                                 │
│     ✅ Live poll session indexes                                               │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  STATUS: All Tier 1 issues RESOLVED                                             │
│  NEXT: Ready to proceed with implementation                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```
