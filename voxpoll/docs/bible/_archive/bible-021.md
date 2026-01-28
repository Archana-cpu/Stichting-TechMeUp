# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                              SECTION 21                                    █
# █              LINK-BASED PARTICIPATION & SHARING SYSTEM                     █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 21.1 LINK-BASED PARTICIPATION OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## 21.1.1 Link Types & Use Cases

[DECISION P-018] VoxPoll supports multiple link types for different participation
scenarios. This enables live events, private sharing, and flexible access control.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         LINK TYPES OVERVIEW                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  1. PUBLIC LINK                                                         │   │
│  │     voxpoll.com/p/{contentId}                                           │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  • Anyone can access                                                    │   │
│  │  • Appears in public feeds                                              │   │
│  │  • SEO indexed                                                          │   │
│  │  • Auth optional (based on content settings)                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  2. PRIVATE LINK (Share with Friends)                                   │   │
│  │     voxpoll.com/share/{uniqueCode}                                      │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  • Only accessible via direct link                                      │   │
│  │  • NOT in public feeds                                                  │   │
│  │  • NOT SEO indexed (noindex)                                            │   │
│  │  • Can have expiration, use limits                                      │   │
│  │  • Perfect for sharing with friends                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  3. LIVE JOIN LINK (Real-time Events)                                   │   │
│  │     voxpoll.com/live/{joinCode}                                         │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  • Real-time participation (WebSocket)                                  │   │
│  │  • Short 6-character code (e.g., ABC123)                                │   │
│  │  • QR code generation for events                                        │   │
│  │  • NO LOGIN REQUIRED for voting                                         │   │
│  │  • Time-limited (expires when host ends session)                        │   │
│  │  • Perfect for: presentations, classes, events                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  4. EMBED LINK                                                          │   │
│  │     voxpoll.com/embed/{contentId}?theme=light                           │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  • For iframe embedding on external sites                               │   │
│  │  • Minimal UI, customizable theme                                       │   │
│  │  • CORS headers configured                                              │   │
│  │  • Tracks referrer for analytics                                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  5. ORGANIZATION INTERNAL LINK                                          │   │
│  │     {org-subdomain}.voxpoll.com/s/{surveyId}                            │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │  • Requires organization membership                                     │   │
│  │  • SSO authentication enforced                                          │   │
│  │  • Isolated from public VoxPoll                                         │   │
│  │  • For internal employee surveys                                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 21.2 PRIVATE LINK SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

## 21.2.1 Private Link Configuration

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// PRIVATE LINK SCHEMA
// ══════════════════════════════════════════════════════════════════════════════

import { z } from "zod"

const PrivateLinkSchema = z.object({
  id: z.string().cuid(),
  contentId: z.string().cuid(),
  contentType: z.enum(["POLL", "SURVEY", "TEST"]),
  creatorId: z.string().cuid(),

  // Link Configuration
  code: z.string().length(12),          // Random 12-char code
  shortUrl: z.string().url(),            // Full URL: voxpoll.com/share/{code}

  // Access Control
  settings: z.object({
    expiresAt: z.date().nullable(),      // Optional expiration
    maxUses: z.number().int().positive().nullable(),  // Optional use limit
    requireAuth: z.boolean().default(false),  // Require login to access
    allowAnonymous: z.boolean().default(true),  // Allow anonymous participation
    password: z.string().nullable(),      // Optional password protection
  }),

  // Tracking
  stats: z.object({
    totalViews: z.number().int().default(0),
    uniqueViews: z.number().int().default(0),
    participations: z.number().int().default(0),
  }),

  status: z.enum(["ACTIVE", "EXPIRED", "EXHAUSTED", "DISABLED"]),
  createdAt: z.date(),
  updatedAt: z.date()
})

type PrivateLink = z.infer<typeof PrivateLinkSchema>

// Generate unique private link code
// [SECURITY] Uses crypto.getRandomValues for cryptographic security
// [REFERENCE] BIBLE-023 for DEFAULT_CONFIG.livePoll.privateLink.codeLength
function generatePrivateLinkCode(length: number = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  return Array.from(randomValues)
    .map(v => chars.charAt(v % chars.length))
    .join('')
}

// Alternative Node.js implementation
import { randomBytes } from 'crypto'
function generatePrivateLinkCodeNode(length: number = 12): string {
  return randomBytes(Math.ceil(length * 0.75))
    .toString('base64url')
    .substring(0, length)
}

export { PrivateLinkSchema, generatePrivateLinkCode }
export type { PrivateLink }
```


## 21.2.2 Private Link Access Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PRIVATE LINK ACCESS FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  User visits: voxpoll.com/share/Ab3Xk9mPq2Yz                                    │
│                      │                                                          │
│                      ▼                                                          │
│  ┌──────────────────────────────────────┐                                       │
│  │ 1. Link Validation                   │                                       │
│  │    • Check link exists               │                                       │
│  │    • Check not expired               │                                       │
│  │    • Check not exhausted (max uses)  │                                       │
│  │    • Check not disabled by creator   │                                       │
│  └──────────────────────────────────────┘                                       │
│           │ Valid                │ Invalid                                      │
│           ▼                      ▼                                              │
│  ┌────────────────────┐  ┌────────────────────┐                                 │
│  │ Password Check?    │  │ Show Error Page    │                                 │
│  │ (if configured)    │  │ • Link expired     │                                 │
│  └────────────────────┘  │ • Link not found   │                                 │
│           │               │ • Max uses reached │                                 │
│           ▼               └────────────────────┘                                 │
│  ┌──────────────────────────────────────┐                                       │
│  │ 2. Auth Check (if requireAuth=true)  │                                       │
│  │    • Redirect to login if not logged │                                       │
│  │    • Return to link after login      │                                       │
│  └──────────────────────────────────────┘                                       │
│           │                                                                     │
│           ▼                                                                     │
│  ┌──────────────────────────────────────┐                                       │
│  │ 3. Pre-Test Check (if enabled)       │                                       │
│  │    • Show pre-test questions         │                                       │
│  │    • Evaluate answers                │                                       │
│  │    • Pass → Continue                 │                                       │
│  │    • Fail → Show rejection message   │                                       │
│  └──────────────────────────────────────┘                                       │
│           │                                                                     │
│           ▼                                                                     │
│  ┌──────────────────────────────────────┐                                       │
│  │ 4. Target Audience Check             │                                       │
│  │    • If logged in: check demographics│                                       │
│  │    • If anonymous: ask screening Q's │                                       │
│  │    • Pass → Continue                 │                                       │
│  │    • Fail → Show "not eligible" msg  │                                       │
│  └──────────────────────────────────────┘                                       │
│           │                                                                     │
│           ▼                                                                     │
│  ┌──────────────────────────────────────┐                                       │
│  │ 5. Participation                     │                                       │
│  │    • Show poll/survey/test           │                                       │
│  │    • Collect response                │                                       │
│  │    • Update link stats               │                                       │
│  └──────────────────────────────────────┘                                       │
│           │                                                                     │
│           ▼                                                                     │
│  ┌──────────────────────────────────────┐                                       │
│  │ 6. Post-Participation                │                                       │
│  │    • Show results (if enabled)       │                                       │
│  │    • COMMENTS access (if participated)│                                       │
│  │    • Share own result card           │                                       │
│  └──────────────────────────────────────┘                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 21.3 LIVE POLL / LIVE JOIN SYSTEM (Real-time Events)
# [UNIFIED TERMINOLOGY] "Live Poll" = creator perspective, "Live Join" = participant perspective
# [REFERENCE] See BIBLE-006 Section 6.2.6 for Live Poll creation flow
# ══════════════════════════════════════════════════════════════════════════════

## 21.3.1 Live Poll / Live Join Overview

[DECISION P-019] Live Poll/Join enables real-time audience participation during
presentations, classes, or events. NO LOGIN REQUIRED for participants.

TERMINOLOGY:
- **Live Poll**: The feature name from creator's perspective (creating a live poll)
- **Live Join**: The action from participant's perspective (joining via code/link)
- Both refer to the same system - real-time voting with WebSocket updates

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         LIVE JOIN SYSTEM                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  USE CASES:                                                                     │
│  ───────────                                                                    │
│  • Conference presenter polls audience in real-time                             │
│  • Teacher quizzes students during class                                        │
│  • Streamer engages viewers with live polls                                     │
│  • Event host collects instant feedback                                         │
│  • Meeting facilitator gauges team opinions                                     │
│                                                                                 │
│  HOW IT WORKS:                                                                  │
│  ─────────────                                                                  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  HOST (Premium User)                 PARTICIPANTS                       │   │
│  │  ─────────────────────              ─────────────────                   │   │
│  │                                                                         │   │
│  │  1. Create live poll                                                    │   │
│  │     ↓                                                                   │   │
│  │  2. Get join code: ABC123                                               │   │
│  │     ↓                                                                   │   │
│  │  3. Display QR code / share code     → Scan QR or visit                 │   │
│  │     ↓                                   voxpoll.com/live/ABC123         │   │
│  │  4. Start the poll                     ↓                                │   │
│  │     ↓                                  No login needed                   │   │
│  │  5. Watch votes come in real-time      ↓                                │   │
│  │     ↓                                  Vote on their device              │   │
│  │  6. End poll when ready                ↓                                │   │
│  │     ↓                                  See real-time results             │   │
│  │  7. COMMENTS discussion opens          ↓                                │   │
│  │                                        Join discussion (if logged in)   │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  REQUIREMENTS:                                                                  │
│  ─────────────                                                                  │
│  • Host: Premium subscription required                                          │
│  • Participants: NO account required (when anonymousVoting=true)                │
│  • Max participants: 10,000 concurrent                                          │
│  • Auto-timeout: 4 hours if not manually ended                                  │
│  • WebSocket connection for real-time updates                                   │
│                                                                                 │
│  [CLARIFICATION] anonymousVoting ONLY affects the Live Poll context:            │
│  • anonymousVoting=true → NO login needed, device fingerprint tracks votes      │
│  • anonymousVoting=false → Login required to vote, but account can be NEW       │
│  • This is SEPARATE from allowAnonymousParticipation (poll-level setting)       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 21.3.2 Live Session Schema

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// LIVE SESSION SCHEMA
// ══════════════════════════════════════════════════════════════════════════════

const LiveSessionSchema = z.object({
  id: z.string().cuid(),
  pollId: z.string().cuid(),
  hostId: z.string().cuid(),

  // Join Information
  joinCode: z.string().length(6),        // e.g., "ABC123"
  joinUrl: z.string().url(),             // voxpoll.com/live/ABC123
  qrCodeUrl: z.string().url(),           // Pre-generated QR code image

  // Session Configuration
  config: z.object({
    maxParticipants: z.number().int().max(10000).default(1000),
    allowLateJoin: z.boolean().default(true),
    showRealTimeResults: z.boolean().default(true),
    anonymousVoting: z.boolean().default(true),
    autoCloseMinutes: z.number().int().min(1).max(240).nullable(),
    hostCanPause: z.boolean().default(true),
  }),

  // Session State
  state: z.object({
    status: z.enum(["WAITING", "ACTIVE", "PAUSED", "ENDED"]),
    currentParticipants: z.number().int().default(0),
    peakParticipants: z.number().int().default(0),
    totalVotes: z.number().int().default(0),
  }),

  // Timestamps
  createdAt: z.date(),
  startedAt: z.date().nullable(),
  pausedAt: z.date().nullable(),
  endedAt: z.date().nullable(),
})

type LiveSession = z.infer<typeof LiveSessionSchema>

export { LiveSessionSchema }
export type { LiveSession }
```


## 21.3.3 Live Join Page (No Auth Required)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      LIVE JOIN PAGE UI                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  URL: voxpoll.com/live/ABC123                                                   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │                    🔴 LIVE                                              │   │
│  │                                                                         │   │
│  │     Which programming language should we learn next?                    │   │
│  │                                                                         │   │
│  │     ┌─────────────────────────────────────────────────────────────┐    │   │
│  │     │  ○ Python                                                   │    │   │
│  │     └─────────────────────────────────────────────────────────────┘    │   │
│  │     ┌─────────────────────────────────────────────────────────────┐    │   │
│  │     │  ○ TypeScript                                               │    │   │
│  │     └─────────────────────────────────────────────────────────────┘    │   │
│  │     ┌─────────────────────────────────────────────────────────────┐    │   │
│  │     │  ○ Rust                                                     │    │   │
│  │     └─────────────────────────────────────────────────────────────┘    │   │
│  │     ┌─────────────────────────────────────────────────────────────┐    │   │
│  │     │  ○ Go                                                       │    │   │
│  │     └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                         │   │
│  │                    [Submit Vote]                                        │   │
│  │                                                                         │   │
│  │     ─────────────────────────────────────────────────────────────      │   │
│  │                                                                         │   │
│  │     👥 247 participants  •  Hosted by @tech_teacher                    │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  AFTER VOTING (Real-time results):                                              │
│  ──────────────────────────────────                                             │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │     ✓ Your vote: TypeScript                                            │   │
│  │                                                                         │   │
│  │     Python      ████████████████████████░░░░░░  42% (104)              │   │
│  │     TypeScript  ██████████████████░░░░░░░░░░░░  32% (79)  ← You       │   │
│  │     Rust        ████████░░░░░░░░░░░░░░░░░░░░░░  15% (37)              │   │
│  │     Go          █████░░░░░░░░░░░░░░░░░░░░░░░░░  11% (27)              │   │
│  │                                                                         │   │
│  │     [Results updating live...]                                          │   │
│  │                                                                         │   │
│  │     ─────────────────────────────────────────────────────────────      │   │
│  │                                                                         │   │
│  │     [Create Account] to join the discussion after the poll ends        │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 21.3.4 WebSocket Events

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// LIVE SESSION WEBSOCKET EVENTS
// ══════════════════════════════════════════════════════════════════════════════

// Events from server to client
type ServerToClientEvent =
  | { type: "SESSION_STATE"; data: { status: string; participants: number } }
  | { type: "VOTE_UPDATE"; data: { optionId: string; count: number; percentage: number } }
  | { type: "PARTICIPANT_JOINED"; data: { count: number } }
  | { type: "PARTICIPANT_LEFT"; data: { count: number } }
  | { type: "SESSION_STARTED"; data: { startedAt: Date } }
  | { type: "SESSION_PAUSED"; data: { pausedAt: Date } }
  | { type: "SESSION_RESUMED"; data: { resumedAt: Date } }
  | { type: "SESSION_ENDED"; data: { finalResults: PollResults } }
  | { type: "HOST_MESSAGE"; data: { message: string } }
  | { type: "ERROR"; data: { code: string; message: string } }

// Events from client to server
type ClientToServerEvent =
  | { type: "JOIN_SESSION"; data: { joinCode: string; deviceId: string } }
  | { type: "SUBMIT_VOTE"; data: { optionId: string } }
  | { type: "CHANGE_VOTE"; data: { oldOptionId: string; newOptionId: string } }
  | { type: "LEAVE_SESSION"; data: {} }

// Host-only events
type HostToServerEvent =
  | { type: "START_SESSION"; data: {} }
  | { type: "PAUSE_SESSION"; data: {} }
  | { type: "RESUME_SESSION"; data: {} }
  | { type: "END_SESSION"; data: {} }
  | { type: "BROADCAST_MESSAGE"; data: { message: string } }
  | { type: "KICK_PARTICIPANT"; data: { deviceId: string } }

export type { ServerToClientEvent, ClientToServerEvent, HostToServerEvent }
```


## 21.3.5 Live Poll Disconnect & Resilience Handling

### [DECISION P-031] Live Poll Connection Resilience Policy

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
// LIVE POLL DISCONNECT & RESILIENCE HANDLING
// Defines behavior when host or participants lose connection
// ═══════════════════════════════════════════════════════════════════════════════

const LIVE_POLL_RESILIENCE = {
  // ─────────────────────────────────────────────────────────────────────────────
  // HOST DISCONNECT HANDLING
  // ─────────────────────────────────────────────────────────────────────────────
  hostDisconnect: {
    gracePeriodMs: 60000,           // 1 minute grace period before action
    autoEndOnTimeout: true,         // End session if host doesn't return
    participantsCanVote: true,      // Voting continues during grace period
    showHostDisconnectUI: true,     // "Host temporarily disconnected..."

    // Fallback behavior
    onGracePeriodExpire: "END_SESSION",  // END_SESSION | PAUSE_SESSION
    preserveVotes: true,            // All votes cast during disconnect are kept
    notifyParticipants: true        // "Session ended - host connection lost"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PARTICIPANT DISCONNECT HANDLING
  // ─────────────────────────────────────────────────────────────────────────────
  participantDisconnect: {
    votePreserved: true,            // Votes are NEVER lost due to disconnect
    canRejoin: true,                // Can rejoin same session
    rejoinWindow: "SESSION_DURATION", // Can rejoin until session ends

    // Reconnection behavior
    onReconnect: {
      restoreVoteState: true,       // Show "You already voted for X"
      showLiveResults: true,        // Resume showing real-time updates
      incrementParticipantCount: false  // Don't double-count
    },

    // Network glitch handling
    heartbeatTimeoutMs: 30000,      // 30 seconds without heartbeat = disconnect
    reconnectAttempts: 5,           // Try to reconnect 5 times
    reconnectDelayMs: [1000, 2000, 4000, 8000, 16000]  // Exponential backoff
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // NETWORK GLITCH HANDLING
  // ─────────────────────────────────────────────────────────────────────────────
  networkGlitch: {
    // Vote submission during connectivity issues
    voteQueue: {
      enabled: true,                // Queue votes locally if offline
      maxQueueSize: 1,              // Only one pending vote per user
      retryOnReconnect: true,       // Auto-submit when connection restored
      maxRetryAttempts: 3
    },

    // Optimistic UI
    showPendingVote: true,          // Show vote as "pending" during submission
    revertOnFailure: true,          // Clear pending vote if all retries fail
    showRetryButton: true           // Manual retry option
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SESSION RECOVERY
  // ─────────────────────────────────────────────────────────────────────────────
  sessionRecovery: {
    // Host can recover ended session within window
    recoveryWindowMinutes: 5,       // Can "undo" auto-end within 5 minutes
    requireConfirmation: true,      // Host must confirm recovery

    // Data preservation
    preserveAllVotes: true,         // Votes never lost
    preserveParticipantList: true,  // Remember who was in session
    preserveChat: false             // Chat not preserved (if implemented)
  }
}

// WebSocket connection state machine
type ConnectionState =
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "DISCONNECTED"
  | "FAILED"

interface ConnectionStateHandler {
  state: ConnectionState
  lastHeartbeat: Date
  reconnectAttempt: number
  pendingVote: { optionId: string; timestamp: Date } | null
}

// Handle participant reconnection
async function handleParticipantReconnect(
  sessionId: string,
  deviceId: string,
  previousState: ConnectionStateHandler
): Promise<ReconnectResult> {
  const session = await db.liveSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.state.status === "ENDED") {
    return {
      success: false,
      reason: "SESSION_ENDED",
      finalResults: session?.state.totalVotes ? await getFinalResults(sessionId) : null
    }
  }

  // Check if participant already voted
  const existingVote = await db.liveVote.findUnique({
    where: { sessionId_deviceId: { sessionId, deviceId } }
  })

  // Process any pending vote from queue
  if (previousState.pendingVote && !existingVote) {
    await processQueuedVote(sessionId, deviceId, previousState.pendingVote)
  }

  return {
    success: true,
    sessionStatus: session.state.status,
    existingVote: existingVote?.optionId || null,
    currentResults: await getLiveResults(sessionId)
  }
}

interface ReconnectResult {
  success: boolean
  reason?: string
  sessionStatus?: string
  existingVote?: string | null
  currentResults?: object
  finalResults?: object | null
}

export { LIVE_POLL_RESILIENCE, handleParticipantReconnect }
export type { ConnectionState, ConnectionStateHandler, ReconnectResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 21.4 SHARING FLOW (FRIENDS)
# ══════════════════════════════════════════════════════════════════════════════

## 21.4.1 Share with Friends Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      SHARE WITH FRIENDS FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  SCENARIO: User wants to share a poll/test with friends via WhatsApp/Telegram  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  1. User clicks "Share" on content                                      │   │
│  └───────────────────────────────────┬─────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  2. Share Options Modal                                                 │   │
│  │                                                                         │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │   │
│  │  │                                                                   │ │   │
│  │  │  Share "Which AI will dominate 2025?"                            │ │   │
│  │  │                                                                   │ │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │ │   │
│  │  │  │WhatsApp │ │Telegram │ │ Twitter │ │  Copy   │                │ │   │
│  │  │  │   📱    │ │   ✈️    │ │   🐦    │ │  Link   │                │ │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                │ │   │
│  │  │                                                                   │ │   │
│  │  │  ─────────────────────────────────────────────────────────────── │ │   │
│  │  │                                                                   │ │   │
│  │  │  Link settings:                                                   │ │   │
│  │  │  ☑ Create private link (not in public feed)                      │ │   │
│  │  │  ☐ Require login to participate                                  │ │   │
│  │  │  ☐ Set expiration (24 hours)                                     │ │   │
│  │  │  ☐ Limit uses (max 50)                                           │ │   │
│  │  │                                                                   │ │   │
│  │  │  [Generate Link]                                                  │ │   │
│  │  │                                                                   │ │   │
│  │  └───────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                         │   │
│  └───────────────────────────────────┬─────────────────────────────────────┘   │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  3. Link Generated                                                      │   │
│  │                                                                         │   │
│  │  voxpoll.com/share/Ab3Xk9mPq2Yz                                        │   │
│  │                                                                         │   │
│  │  [Copy] [Share to WhatsApp]                                            │   │
│  │                                                                         │   │
│  │  QR Code: [████████]                                                   │   │
│  │           [████████]                                                   │   │
│  │           [████████]                                                   │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  FRIEND'S EXPERIENCE:                                                           │
│  ─────────────────────                                                          │
│  • Receives link via WhatsApp/Telegram                                          │
│  • Opens link → sees poll/test directly                                         │
│  • Can participate without account (if anonymous allowed)                       │
│  • After participating → sees results + prompted to create account              │
│  • If creates account → gets COMMENTS access                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```




# ══════════════════════════════════════════════════════════════════════════════
# 21.5 ANONYMOUS LINK PARTICIPATION
# ══════════════════════════════════════════════════════════════════════════════

## 21.5.1 Anonymous vs Authenticated Link Access

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                  ANONYMOUS vs AUTHENTICATED ACCESS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ANONYMOUS ACCESS (Default for most links):                                     │
│  ──────────────────────────────────────────                                     │
│  ✓ No login required                                                            │
│  ✓ Device fingerprint used for duplicate prevention                             │
│  ✓ Response stored with anonymous token                                         │
│  ✗ Cannot join COMMENTS discussions                                             │
│  ✗ No profile, no badges                                                        │
│  ✗ Limited analytics for creator                                                │
│                                                                                 │
│  AUTHENTICATED ACCESS (When content requires it):                               │
│  ────────────────────────────────────────────────                               │
│  ✓ Full user profile linked to response                                         │
│  ✓ COMMENTS access after participation                                          │
│  ✓ Badges earned count toward profile                                           │
│  ✓ Rich analytics for creator (demographics)                                    │
│  ✗ Requires account creation/login                                              │
│                                                                                 │
│  CONTENT CREATOR CONTROLS:                                                      │
│  ─────────────────────────                                                      │
│  • allowAnonymousParticipation: true/false                                      │
│  • requireVerificationLevel: 0-4 or null                                        │
│  • If anonymous=false, users MUST login                                         │
│  • If verificationLevel set, users must meet that level                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```


## 21.5.2 Anonymous Participation Tracking

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// ANONYMOUS PARTICIPATION TRACKING
// ══════════════════════════════════════════════════════════════════════════════

interface AnonymousParticipant {
  // Unique identifier (NOT linked to any user)
  anonymousToken: string              // Random token for this session

  // Device fingerprinting (for duplicate prevention only)
  deviceFingerprint: string           // Hash of device characteristics
  ipHash: string                      // Hashed IP (not stored raw)

  // Minimal metadata
  participatedAt: Date
  contentId: string
  contentType: "POLL" | "SURVEY" | "TEST"

  // Optional: if they later create account
  convertedToUserId: string | null    // Filled if they sign up after
  convertedAt: Date | null
}

// Prevent duplicate votes from same device
async function checkDuplicateAnonymousVote(
  contentId: string,
  deviceFingerprint: string
): Promise<boolean> {
  const existing = await db.anonymousParticipation.findFirst({
    where: {
      contentId,
      deviceFingerprint
    }
  })
  return !!existing
}

// ═══════════════════════════════════════════════════════════════════════════════
// [DECISION P-029] ANONYMOUS TO USER CONVERSION POLICY
// Defines what happens when an anonymous participant creates an account
// ═══════════════════════════════════════════════════════════════════════════════

const ANONYMOUS_CONVERSION_POLICY = {
  // Data Migration
  migrateResponses: true,           // Link previous responses to new account
  migrateQualityScores: true,       // Preserve quality history for trust scoring
  migrateBadges: false,             // Badges require authenticated participation
  migrateXP: false,                 // XP requires authenticated actions

  // History Display
  showInHistory: true,              // Show converted participations in profile
  historyMarker: "CONVERTED",       // Mark as "Participated before signup"

  // Limitations
  maxConversionAge: 30,             // Days - only convert participations within 30 days
  requireDeviceMatch: true,         // Device fingerprint must match

  // Privacy
  anonymizeAfterConversion: false,  // Keep original anonymous record for audit
  deleteAnonymousToken: false       // Retain for duplicate prevention
}

// Convert anonymous participation to user account
async function convertAnonymousToUser(
  anonymousToken: string,
  userId: string,
  deviceFingerprint: string
): Promise<ConversionResult> {
  // Step 1: Verify device fingerprint matches
  const anonymousRecords = await db.anonymousParticipation.findMany({
    where: { anonymousToken }
  })

  if (anonymousRecords.length === 0) {
    return { success: false, error: "NO_ANONYMOUS_RECORDS" }
  }

  // Step 2: Check device match if required
  if (ANONYMOUS_CONVERSION_POLICY.requireDeviceMatch) {
    const deviceMatches = anonymousRecords.some(
      r => r.deviceFingerprint === deviceFingerprint
    )
    if (!deviceMatches) {
      return { success: false, error: "DEVICE_MISMATCH" }
    }
  }

  // Step 3: Filter by age
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - ANONYMOUS_CONVERSION_POLICY.maxConversionAge)

  const eligibleRecords = anonymousRecords.filter(
    r => r.participatedAt >= cutoffDate
  )

  // Step 4: Update anonymous participation records
  await db.anonymousParticipation.updateMany({
    where: {
      anonymousToken,
      participatedAt: { gte: cutoffDate }
    },
    data: {
      convertedToUserId: userId,
      convertedAt: new Date()
    }
  })

  // Step 5: Link responses to new user
  if (ANONYMOUS_CONVERSION_POLICY.migrateResponses) {
    await db.response.updateMany({
      where: { anonymousToken },
      data: {
        userId,
        conversionMarker: ANONYMOUS_CONVERSION_POLICY.historyMarker
      }
    })
  }

  // Step 6: Migrate quality scores if enabled
  if (ANONYMOUS_CONVERSION_POLICY.migrateQualityScores) {
    await db.userQualityHistory.createMany({
      data: eligibleRecords.map(r => ({
        userId,
        contentId: r.contentId,
        qualityScore: r.qualityScore || 50,
        source: "ANONYMOUS_CONVERSION"
      }))
    })
  }

  return {
    success: true,
    convertedCount: eligibleRecords.length,
    skippedCount: anonymousRecords.length - eligibleRecords.length
  }
}

interface ConversionResult {
  success: boolean
  error?: string
  convertedCount?: number
  skippedCount?: number
}

export { ANONYMOUS_CONVERSION_POLICY, convertAnonymousToUser }
export type { AnonymousParticipant, ConversionResult }
```




# ══════════════════════════════════════════════════════════════════════════════
# 21.6 QR CODE GENERATION
# ══════════════════════════════════════════════════════════════════════════════

## 21.6.1 QR Code System

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// QR CODE GENERATION
// ══════════════════════════════════════════════════════════════════════════════

interface QRCodeOptions {
  url: string
  size: number              // Pixels (100-1000)
  format: "png" | "svg"
  errorCorrection: "L" | "M" | "Q" | "H"  // Low to High
  color: string             // Foreground color (hex)
  backgroundColor: string   // Background color (hex)
  logo: {
    url: string | null      // Center logo image
    size: number            // Logo size as percentage of QR
  } | null
}

// Default QR settings for different use cases
const QR_PRESETS = {
  LIVE_EVENT: {
    size: 500,
    format: "png" as const,
    errorCorrection: "H" as const,  // High for logo support
    color: "#000000",
    backgroundColor: "#FFFFFF",
    logo: null
  },
  SHARE_CARD: {
    size: 200,
    format: "png" as const,
    errorCorrection: "M" as const,
    color: "#6366F1",  // Brand purple
    backgroundColor: "#FFFFFF",
    logo: null
  },
  PRINT: {
    size: 1000,
    format: "svg" as const,
    errorCorrection: "H" as const,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    logo: null
  }
} as const

// Generate QR code for content
async function generateContentQR(
  contentId: string,
  contentType: "POLL" | "SURVEY" | "TEST" | "LIVE",
  preset: keyof typeof QR_PRESETS = "SHARE_CARD"
): Promise<string> {
  const baseUrl = process.env.APP_URL || "https://voxpoll.com"

  let url: string
  switch (contentType) {
    case "LIVE":
      url = `${baseUrl}/live/${contentId}`
      break
    default:
      url = `${baseUrl}/p/${contentId}`
  }

  const options = {
    ...QR_PRESETS[preset],
    url
  }

  // Generate and upload to CDN
  const qrBuffer = await generateQRBuffer(options)
  const cdnUrl = await uploadToCDN(qrBuffer, `qr/${contentId}.${options.format}`)

  return cdnUrl
}

export { QR_PRESETS, generateContentQR }
export type { QRCodeOptions }
```




# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 21.9 MOBILE DEEP LINKING                                                    │
# └─────────────────────────────────────────────────────────────────────────────┘

## 21.9.1 Deep Link Strategy

```typescript
const DEEP_LINK_CONFIG = {
  // Custom URL scheme (legacy, fallback)
  customScheme: {
    ios: "voxpoll://",
    android: "voxpoll://"
  },

  // Universal Links (iOS) / App Links (Android)
  universalLinks: {
    domain: "voxpoll.com",
    subdomains: ["app.voxpoll.com", "link.voxpoll.com"],
    paths: [
      "/p/*",      // Polls
      "/s/*",      // Surveys
      "/t/*",      // Tests
      "/u/*",      // User profiles
      "/invite/*", // Invitations
      "/share/*"   // Shared content
    ]
  },

  // Deferred deep links (via Branch.io or similar)
  deferredDeepLinks: {
    enabled: true,
    provider: "branch",
    linkDomain: "voxpoll.app.link",
    fallbackUrl: "https://voxpoll.com/download"
  }
} as const
```

## 21.9.2 URL Route Mapping

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// DEEP LINK ROUTES
// ═══════════════════════════════════════════════════════════════════════════

const DEEP_LINK_ROUTES = {
  // ─────────────────────────────────────────────────────────────────────────
  // CONTENT ROUTES
  // ─────────────────────────────────────────────────────────────────────────
  poll: {
    pattern: "/p/:pollId",
    screen: "PollDetailScreen",
    params: ["pollId"],
    examples: [
      "voxpoll://p/abc123",
      "https://voxpoll.com/p/abc123"
    ]
  },

  pollResults: {
    pattern: "/p/:pollId/results",
    screen: "PollResultsScreen",
    params: ["pollId"],
    requiresAuth: false  // Results are public after participation
  },

  livePoll: {
    pattern: "/p/:pollId/live",
    screen: "LivePollScreen",
    params: ["pollId"],
    requiresAuth: true
  },

  survey: {
    pattern: "/s/:surveyId",
    screen: "SurveyDetailScreen",
    params: ["surveyId"]
  },

  surveyResponse: {
    pattern: "/s/:surveyId/respond",
    screen: "SurveyResponseScreen",
    params: ["surveyId"],
    requiresAuth: true
  },

  test: {
    pattern: "/t/:testId",
    screen: "TestDetailScreen",
    params: ["testId"]
  },

  testResult: {
    pattern: "/t/:testId/result/:resultId",
    screen: "TestResultScreen",
    params: ["testId", "resultId"],
    requiresAuth: true
  },

  // ─────────────────────────────────────────────────────────────────────────
  // USER ROUTES
  // ─────────────────────────────────────────────────────────────────────────
  userProfile: {
    pattern: "/u/:username",
    screen: "UserProfileScreen",
    params: ["username"]
  },

  myProfile: {
    pattern: "/profile",
    screen: "MyProfileScreen",
    requiresAuth: true
  },

  settings: {
    pattern: "/settings",
    screen: "SettingsScreen",
    requiresAuth: true
  },

  settingsSection: {
    pattern: "/settings/:section",
    screen: "SettingsSectionScreen",
    params: ["section"],
    validSections: ["account", "privacy", "notifications", "appearance"],
    requiresAuth: true
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SOCIAL ROUTES
  // ─────────────────────────────────────────────────────────────────────────
  comments: {
    pattern: "/:contentType/:contentId/comments",
    screen: "CommentsScreen",
    params: ["contentType", "contentId"]
  },

  comment: {
    pattern: "/:contentType/:contentId/comments/:commentId",
    screen: "CommentDetailScreen",
    params: ["contentType", "contentId", "commentId"],
    scrollTo: "commentId"
  },

  conversation: {
    pattern: "/dm/:conversationId",
    screen: "DMConversationScreen",
    params: ["conversationId"],
    requiresAuth: true
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACTION ROUTES
  // ─────────────────────────────────────────────────────────────────────────
  invite: {
    pattern: "/invite/:inviteCode",
    screen: "InviteScreen",
    params: ["inviteCode"],
    action: "handleInvite"
  },

  share: {
    pattern: "/share/:shareId",
    screen: "SharedContentScreen",
    params: ["shareId"],
    trackAttribution: true
  },

  notification: {
    pattern: "/notification/:notificationId",
    screen: "NotificationTargetScreen",
    params: ["notificationId"],
    action: "navigateToTarget"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FEED & DISCOVERY ROUTES
  // ─────────────────────────────────────────────────────────────────────────
  home: {
    pattern: "/",
    screen: "HomeScreen"
  },

  explore: {
    pattern: "/explore",
    screen: "ExploreScreen"
  },

  trending: {
    pattern: "/trending",
    screen: "TrendingScreen"
  },

  search: {
    pattern: "/search",
    screen: "SearchScreen",
    queryParams: ["q", "type", "filter"]
  },

  category: {
    pattern: "/category/:categorySlug",
    screen: "CategoryScreen",
    params: ["categorySlug"]
  }
} as const
```

## 21.9.3 iOS Universal Links Configuration

```typescript
// apple-app-site-association (hosted at /.well-known/)
const APPLE_APP_SITE_ASSOCIATION = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "TEAMID.com.voxpoll.app",
        paths: [
          "/p/*",
          "/s/*",
          "/t/*",
          "/u/*",
          "/invite/*",
          "/share/*",
          "/dm/*",
          "/explore",
          "/trending",
          "/search",
          "/category/*",
          "/settings/*",
          "/notification/*"
        ]
      }
    ]
  },
  webcredentials: {
    apps: ["TEAMID.com.voxpoll.app"]
  }
}

// iOS Entitlements (Xcode)
const IOS_ENTITLEMENTS = {
  "com.apple.developer.associated-domains": [
    "applinks:voxpoll.com",
    "applinks:app.voxpoll.com",
    "applinks:link.voxpoll.com",
    "webcredentials:voxpoll.com"
  ]
}
```

## 21.9.4 Android App Links Configuration

```xml
<!-- AndroidManifest.xml -->
<manifest>
  <application>
    <activity android:name=".MainActivity">

      <!-- App Links (verified) -->
      <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="voxpoll.com" />
        <data android:scheme="https" android:host="app.voxpoll.com" />
        <data android:scheme="https" android:host="link.voxpoll.com" />
      </intent-filter>

      <!-- Custom scheme (fallback) -->
      <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="voxpoll" />
      </intent-filter>

    </activity>
  </application>
</manifest>
```

```typescript
// assetlinks.json (hosted at /.well-known/)
const ANDROID_ASSET_LINKS = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.voxpoll.app",
      sha256_cert_fingerprints: [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
```

## 21.9.5 Deep Link Handler

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// REACT NATIVE DEEP LINK HANDLER
// ═══════════════════════════════════════════════════════════════════════════

import { Linking } from 'react-native'
import { NavigationContainerRef } from '@react-navigation/native'

interface DeepLinkResult {
  handled: boolean
  screen?: string
  params?: Record<string, string>
  requiresAuth: boolean
  error?: string
}

class DeepLinkHandler {
  private navigation: NavigationContainerRef<any> | null = null
  private pendingDeepLink: string | null = null
  private isAuthenticated: boolean = false

  setNavigation(nav: NavigationContainerRef<any>) {
    this.navigation = nav
    // Process any pending deep link
    if (this.pendingDeepLink) {
      this.handleDeepLink(this.pendingDeepLink)
      this.pendingDeepLink = null
    }
  }

  setAuthState(isAuth: boolean) {
    this.isAuthenticated = isAuth
  }

  async handleDeepLink(url: string): Promise<DeepLinkResult> {
    const parsed = this.parseUrl(url)
    if (!parsed) {
      return { handled: false, requiresAuth: false, error: "Invalid URL" }
    }

    const route = this.matchRoute(parsed.path)
    if (!route) {
      return { handled: false, requiresAuth: false, error: "No matching route" }
    }

    // Check auth requirement
    if (route.requiresAuth && !this.isAuthenticated) {
      // Store for after login
      this.pendingDeepLink = url
      // Navigate to login with redirect
      this.navigation?.navigate("Auth", {
        screen: "Login",
        params: { redirectUrl: url }
      })
      return { handled: true, requiresAuth: true }
    }

    // Extract params
    const params = this.extractParams(parsed.path, route.pattern)

    // Navigate
    this.navigation?.navigate(route.screen, {
      ...params,
      ...parsed.queryParams
    })

    // Track deep link analytics
    this.trackDeepLink(url, route.screen)

    return {
      handled: true,
      screen: route.screen,
      params,
      requiresAuth: route.requiresAuth || false
    }
  }

  private parseUrl(url: string): { path: string; queryParams: Record<string, string> } | null {
    try {
      // Handle custom scheme
      if (url.startsWith("voxpoll://")) {
        url = url.replace("voxpoll://", "https://voxpoll.com/")
      }

      const parsed = new URL(url)
      const queryParams: Record<string, string> = {}
      parsed.searchParams.forEach((value, key) => {
        queryParams[key] = value
      })

      return { path: parsed.pathname, queryParams }
    } catch {
      return null
    }
  }

  private matchRoute(path: string): typeof DEEP_LINK_ROUTES[keyof typeof DEEP_LINK_ROUTES] | null {
    for (const route of Object.values(DEEP_LINK_ROUTES)) {
      const regex = this.patternToRegex(route.pattern)
      if (regex.test(path)) {
        return route
      }
    }
    return null
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/:[a-zA-Z]+/g, "([^/]+)")
      .replace(/\//g, "\\/")
    return new RegExp(`^${escaped}$`)
  }

  private extractParams(path: string, pattern: string): Record<string, string> {
    const params: Record<string, string> = {}
    const patternParts = pattern.split("/")
    const pathParts = path.split("/")

    patternParts.forEach((part, i) => {
      if (part.startsWith(":")) {
        const paramName = part.slice(1)
        params[paramName] = pathParts[i]
      }
    })

    return params
  }

  private trackDeepLink(url: string, screen: string) {
    // Analytics tracking
    analytics.track("deep_link_opened", {
      url,
      screen,
      source: this.detectSource(url)
    })
  }

  private detectSource(url: string): string {
    if (url.includes("utm_source=")) {
      const match = url.match(/utm_source=([^&]+)/)
      return match?.[1] || "unknown"
    }
    if (url.includes("voxpoll.app.link")) return "branch"
    if (url.includes("voxpoll://")) return "custom_scheme"
    return "universal_link"
  }
}

export const deepLinkHandler = new DeepLinkHandler()

// App.tsx initialization
useEffect(() => {
  // Handle app opened via deep link
  Linking.getInitialURL().then(url => {
    if (url) deepLinkHandler.handleDeepLink(url)
  })

  // Handle deep links while app is running
  const subscription = Linking.addEventListener("url", ({ url }) => {
    deepLinkHandler.handleDeepLink(url)
  })

  return () => subscription.remove()
}, [])
```

## 21.9.6 Deferred Deep Links (Branch.io)

```typescript
const BRANCH_CONFIG = {
  // Branch key
  branchKey: {
    live: "key_live_xxxxxx",
    test: "key_test_xxxxxx"
  },

  // Link domains
  linkDomains: [
    "voxpoll.app.link",
    "voxpoll-alternate.app.link",
    "voxpoll.test-app.link"
  ],

  // Default link data
  defaultLinkData: {
    $desktop_url: "https://voxpoll.com",
    $ios_url: "https://apps.apple.com/app/voxpoll/id123456789",
    $android_url: "https://play.google.com/store/apps/details?id=com.voxpoll.app",
    $fallback_url: "https://voxpoll.com/download"
  },

  // Attribution window
  attributionWindow: {
    clickToInstall: 7,  // days
    impressionToInstall: 1  // days
  }
}

// Create shareable deep link
async function createShareLink(
  contentType: string,
  contentId: string,
  options?: {
    title?: string
    description?: string
    imageUrl?: string
    campaign?: string
  }
): Promise<string> {
  const linkData = {
    ...BRANCH_CONFIG.defaultLinkData,
    $canonical_identifier: `${contentType}/${contentId}`,
    $og_title: options?.title,
    $og_description: options?.description,
    $og_image_url: options?.imageUrl,
    campaign: options?.campaign,
    content_type: contentType,
    content_id: contentId
  }

  const shortUrl = await branch.createBranchUniversalObject(linkData).generateShortUrl()
  return shortUrl
}
```



# ══════════════════════════════════════════════════════════════════════════════
# 21.10 OFFLINE BEHAVIOR SPECIFICATION
# ══════════════════════════════════════════════════════════════════════════════

## 21.10.1 Offline Detection & State Management

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// OFFLINE BEHAVIOR SYSTEM (P-048)
// Defines how the app behaves when network connectivity is lost
// ══════════════════════════════════════════════════════════════════════════════

const OFFLINE_CONFIG = {
  // ────────────────────────────────────────────────────────────────────────────
  // CONNECTIVITY DETECTION
  // ────────────────────────────────────────────────────────────────────────────
  detection: {
    // Use Navigator.onLine API
    useNavigatorOnline: true,

    // Heartbeat ping to verify actual connectivity
    heartbeatEnabled: true,
    heartbeatUrl: "/api/health/ping",
    heartbeatIntervalMs: 30000,  // 30 seconds

    // Consider offline after N consecutive failed requests
    failedRequestThreshold: 3,

    // Debounce online/offline state changes
    stateChangeDebounceMs: 2000
  },

  // ────────────────────────────────────────────────────────────────────────────
  // OFFLINE CAPABILITIES BY FEATURE
  // ────────────────────────────────────────────────────────────────────────────
  capabilities: {
    // READ operations (cached content)
    read: {
      feedBrowsing: "CACHED_ONLY",        // Show cached feed items
      pollViewing: "CACHED_ONLY",         // Show cached poll details
      testTaking: "FULL_OFFLINE",         // Can take cached tests
      profileViewing: "CACHED_ONLY",      // Show cached profiles
      settingsViewing: "FULL_OFFLINE",    // Local settings always available
      notificationsViewing: "CACHED_ONLY" // Show cached notifications
    },

    // WRITE operations (queued for sync)
    write: {
      pollVoting: "QUEUE_FOR_SYNC",       // Queue vote, sync when online
      testSubmission: "QUEUE_FOR_SYNC",   // Queue results, sync when online
      commentWriting: "QUEUE_FOR_SYNC",   // Queue comment
      profileEditing: "QUEUE_FOR_SYNC",   // Queue changes
      draftSaving: "LOCAL_ONLY"           // Save to localStorage only
    },

    // REAL-TIME features
    realTime: {
      livePoll: "DISABLED",               // Cannot participate offline
      liveChat: "DISABLED",               // Cannot chat offline
      notifications: "DISABLED"           // No new notifications
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CACHE STRATEGY
  // ────────────────────────────────────────────────────────────────────────────
  caching: {
    // Service Worker cache
    serviceWorkerEnabled: true,

    // Cache-first resources (static assets)
    cacheFirst: [
      "/static/**",
      "/fonts/**",
      "/icons/**"
    ],

    // Network-first resources (API data)
    networkFirst: [
      "/api/feed/**",
      "/api/polls/**",
      "/api/users/**"
    ],

    // Stale-while-revalidate
    staleWhileRevalidate: [
      "/api/content/**",
      "/api/profiles/**"
    ],

    // Maximum cache age per content type
    maxAge: {
      feed: 15 * 60 * 1000,        // 15 minutes
      poll: 60 * 60 * 1000,        // 1 hour
      test: 24 * 60 * 60 * 1000,   // 24 hours (for offline taking)
      profile: 60 * 60 * 1000,     // 1 hour
      static: 7 * 24 * 60 * 60 * 1000  // 7 days
    },

    // Maximum cache size (MB)
    maxCacheSizeMB: 50
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// OFFLINE STATE MACHINE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Network State Machine
 *
 *  ┌─────────────┐
 *  │   ONLINE    │ ←──────────────────────────────────┐
 *  └──────┬──────┘                                    │
 *         │ network_error / navigator.onLine=false   │
 *         ▼                                          │
 *  ┌─────────────┐                                   │
 *  │  DEGRADED   │ ←─── intermittent connectivity   │
 *  └──────┬──────┘                                   │
 *         │ heartbeat_failed x 3                     │
 *         ▼                                          │
 *  ┌─────────────┐                                   │
 *  │   OFFLINE   │ ────── connectivity_restored ────┘
 *  └─────────────┘
 */

type NetworkState = "ONLINE" | "DEGRADED" | "OFFLINE"

interface OfflineStateContext {
  state: NetworkState
  lastOnlineAt: Date | null
  pendingSyncCount: number
  cachedItemsCount: number
  queuedActionsCount: number
}

// ══════════════════════════════════════════════════════════════════════════════
// OFFLINE QUEUE SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

interface QueuedAction {
  id: string
  type: "VOTE" | "COMMENT" | "PROFILE_UPDATE" | "TEST_SUBMISSION"
  payload: Record<string, unknown>
  createdAt: Date
  retryCount: number
  maxRetries: number
  priority: "HIGH" | "MEDIUM" | "LOW"
}

const OFFLINE_QUEUE_CONFIG = {
  // Maximum actions in queue
  maxQueueSize: 100,

  // Priority order for sync
  syncPriority: ["TEST_SUBMISSION", "VOTE", "COMMENT", "PROFILE_UPDATE"],

  // Retry configuration
  retryConfig: {
    maxRetries: 5,
    backoffMs: [1000, 2000, 5000, 10000, 30000]  // Exponential backoff
  },

  // Conflict resolution
  conflictResolution: {
    VOTE: "LAST_WINS",          // Latest vote wins
    COMMENT: "APPEND",          // Add all comments
    PROFILE_UPDATE: "MERGE",    // Merge non-conflicting fields
    TEST_SUBMISSION: "FIRST_WINS"  // First submission counts
  }
}

class OfflineQueueManager {
  private queue: QueuedAction[] = []
  private syncInProgress = false

  // Add action to queue
  enqueue(action: Omit<QueuedAction, "id" | "createdAt" | "retryCount">): void {
    const queuedAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      retryCount: 0
    }

    this.queue.push(queuedAction)
    this.persistQueue()
  }

  // Sync all queued actions when online
  async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) return { success: 0, failed: 0 }

    this.syncInProgress = true
    let success = 0
    let failed = 0

    // Sort by priority
    const sorted = [...this.queue].sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    for (const action of sorted) {
      try {
        await this.syncAction(action)
        this.removeFromQueue(action.id)
        success++
      } catch (error) {
        action.retryCount++
        if (action.retryCount >= action.maxRetries) {
          this.removeFromQueue(action.id)
          // Notify user of permanent failure
        }
        failed++
      }
    }

    this.syncInProgress = false
    return { success, failed }
  }

  private async syncAction(action: QueuedAction): Promise<void> {
    // Implementation per action type
  }

  private persistQueue(): void {
    localStorage.setItem("voxpoll:offline_queue", JSON.stringify(this.queue))
  }

  private removeFromQueue(id: string): void {
    this.queue = this.queue.filter(a => a.id !== id)
    this.persistQueue()
  }
}

export { OfflineQueueManager, OFFLINE_CONFIG, OFFLINE_QUEUE_CONFIG }
export type { NetworkState, OfflineStateContext, QueuedAction }
```

## 21.10.2 Offline UI Indicators

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// OFFLINE UI COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const OFFLINE_UI_CONFIG = {
  // ────────────────────────────────────────────────────────────────────────────
  // STATUS BAR
  // ────────────────────────────────────────────────────────────────────────────
  statusBar: {
    ONLINE: {
      show: false  // Don't show when online
    },
    DEGRADED: {
      show: true,
      color: "orange",
      icon: "wifi-low",
      text: "Bağlantı zayıf",
      dismissable: true
    },
    OFFLINE: {
      show: true,
      color: "red",
      icon: "wifi-off",
      text: "Çevrimdışı - Değişiklikler kaydedildi",
      dismissable: false,
      showPendingCount: true
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // FEATURE-SPECIFIC OFFLINE MESSAGES
  // ────────────────────────────────────────────────────────────────────────────
  messages: {
    feedRefresh: {
      text: "Çevrimdışısınız. Son görüntülenen içerikler gösteriliyor.",
      action: null
    },
    voteSubmit: {
      text: "Oyunuz kaydedildi. Bağlantı kurulunca gönderilecek.",
      action: null
    },
    commentSubmit: {
      text: "Yorumunuz sıraya alındı. Bağlantı kurulunca gönderilecek.",
      action: null
    },
    livePollJoin: {
      text: "Canlı anketlere katılmak için internet bağlantısı gerekiyor.",
      action: { label: "Tekrar Dene", handler: "retryConnection" }
    },
    testStart: {
      text: "Bu test çevrimdışı çözülebilir. Sonuçlar bağlantı kurulunca gönderilecek.",
      action: { label: "Başla", handler: "startOfflineTest" }
    },
    dmSend: {
      text: "Mesajlar çevrimdışı gönderilemez.",
      action: null
    }
  },

  // ────────────────────────────────────────────────────────────────────────────
  // SYNC NOTIFICATION
  // ────────────────────────────────────────────────────────────────────────────
  syncNotification: {
    onSyncStart: {
      text: "Değişiklikler senkronize ediliyor...",
      showProgress: true
    },
    onSyncComplete: {
      text: "{count} değişiklik başarıyla senkronize edildi",
      duration: 3000
    },
    onSyncFailed: {
      text: "{count} değişiklik gönderilemedi. Tekrar denenecek.",
      action: { label: "Detaylar", handler: "showSyncDetails" }
    }
  }
}

/**
 * Offline Banner UI
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ 📴 Çevrimdışısınız • 3 bekleyen değişiklik                                 │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ 📶 Bağlantı zayıf • Bazı özellikler gecikmeli çalışabilir           [✕]    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ ✓ Bağlantı kuruldu • 5 değişiklik senkronize edildi                        │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
```

## 21.10.3 Service Worker Configuration

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SERVICE WORKER OFFLINE SUPPORT
// ══════════════════════════════════════════════════════════════════════════════

const SERVICE_WORKER_CONFIG = {
  // Cache names with version
  cacheNames: {
    static: "voxpoll-static-v1",
    api: "voxpoll-api-v1",
    images: "voxpoll-images-v1"
  },

  // Precache essential routes
  precache: [
    "/",
    "/offline",
    "/feed",
    "/profile",
    "/settings"
  ],

  // Runtime caching rules
  runtimeCaching: [
    {
      urlPattern: /\/api\/feed/,
      handler: "NetworkFirst",
      options: {
        cacheName: "voxpoll-api-v1",
        expiration: { maxAgeSeconds: 900 }  // 15 min
      }
    },
    {
      urlPattern: /\/api\/polls\/[^/]+$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "voxpoll-api-v1",
        expiration: { maxAgeSeconds: 3600 }  // 1 hour
      }
    },
    {
      urlPattern: /\/api\/tests\/[^/]+$/,
      handler: "CacheFirst",  // Tests cached for offline
      options: {
        cacheName: "voxpoll-api-v1",
        expiration: { maxAgeSeconds: 86400 }  // 24 hours
      }
    }
  ],

  // Offline fallback page
  offlineFallback: "/offline"
}

// Offline fallback page content
const OFFLINE_PAGE_CONTENT = {
  title: "Çevrimdışısınız",
  message: "İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin.",
  features: [
    "Daha önce görüntülediğiniz içerikleri okuyabilirsiniz",
    "Kaydedilmiş testleri çözebilirsiniz",
    "Oylarınız ve yorumlarınız bağlantı kurulunca gönderilecek"
  ],
  actions: [
    { label: "Tekrar Dene", handler: "window.location.reload()" },
    { label: "Önbelleğe Alınmış İçerik", href: "/cached" }
  ]
}
```


# ══════════════════════════════════════════════════════════════════════════════
# END OF SECTION 21
# ══════════════════════════════════════════════════════════════════════════════
# Status: COMPLETE
# Last Updated: January 2026
# Changes: Added Section 21.10 - Offline Behavior Specification
# Dependencies: SECTION 06 (Content Types), SECTION 07 (Responses)
# ══════════════════════════════════════════════════════════════════════════════
