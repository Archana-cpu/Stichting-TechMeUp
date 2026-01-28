# ═══════════════════════════════════════════════════════════════════════════════
# FEATURES - Live Polls (Real-time Polling)
# ═══════════════════════════════════════════════════════════════════════════════
# Source: bible-006.md (section 6.2.6), bible-021.md
# Last Updated: 2026-01-23
# ═══════════════════════════════════════════════════════════════════════════════



# ═══════════════════════════════════════════════════════════════════════════════
# LIVE POLL OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

[DECISION P-011] Live Polls enable real-time participation for live audiences.
This is a Premium-only feature.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LIVE POLL SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  USE CASES:                                                                     │
│  ─────────────────                                                              │
│  - Twitch/YouTube streamers engaging audience in real-time                      │
│  - Conference speakers polling attendees during presentation                    │
│  - Teachers/Professors getting instant classroom feedback                       │
│  - Event organizers gathering live audience opinions                            │
│  - Podcast hosts involving listeners in discussion topics                       │
│  - Town halls and corporate all-hands meetings                                  │
│                                                                                 │
│  REQUIREMENTS:                                                                  │
│  ─────────────────                                                              │
│  - Premium subscription required for creator                                    │
│  - No auth required for participants (anonymous voting enabled)                 │
│  - Maximum 10,000 concurrent participants per live poll                         │
│  - Auto-close after 4 hours if not manually ended                              │
│  - Results update in real-time via WebSocket connection                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# LIVE POLL FLOW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         LIVE POLL FLOW                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  CREATOR FLOW:                                                                  │
│  ─────────────────                                                              │
│                                                                                 │
│  1. Creator creates Live Poll                                                   │
│     └─> System generates 6-character join code (e.g., "ABC123")                 │
│                                                                                 │
│  2. Creator shares join link/QR code with audience                              │
│     └─> URL: voxpoll.com/live/ABC123                                            │
│     └─> QR Code: Pre-generated, downloadable                                    │
│                                                                                 │
│  3. Creator monitors real-time results dashboard                                │
│     └─> See votes coming in live                                                │
│     └─> See participant count                                                   │
│                                                                                 │
│  4. Creator ends poll (or auto-close after timer)                               │
│     └─> Final results saved                                                     │
│     └─> PULSE + COMMENTS opens                                                  │
│                                                                                 │
│                                                                                 │
│  PARTICIPANT FLOW:                                                              │
│  ─────────────────                                                              │
│                                                                                 │
│  1. Participant scans QR or visits join URL                                     │
│     └─> voxpoll.com/live/ABC123                                                 │
│                                                                                 │
│  2. No login required (anonymous voting enabled by default)                     │
│     └─> Just enter and vote                                                     │
│                                                                                 │
│  3. Vote on poll options                                                        │
│     └─> See results update in real-time                                         │
│                                                                                 │
│  4. Stay and watch or leave                                                     │
│     └─> Can view live chat/reactions                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# JOIN CODE GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

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
  settings: LivePollSessionSettings
}

interface LivePollSessionSettings {
  showRealTimeResults: boolean        // Show results as votes come in
  allowLateJoin: boolean              // Allow joining after poll started
  autoCloseMinutes: number | null     // Auto-close after N minutes
  participantListVisible: boolean     // Show list of participants
  anonymousVoting: boolean            // Allow voting without login
  allowChat: boolean                  // Enable live chat during poll
}

// Generate unique 6-character join code
function generateJoinCode(): string {
  // Excluded: I, O, 0, 1 (for clarity when reading aloud)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# WEBSOCKET EVENTS
# ═══════════════════════════════════════════════════════════════════════════════

```typescript
// Server -> Client events
type LivePollServerEvent =
  | { type: "POLL_DATA", poll: LivePollData }
  | { type: "VOTE_RECEIVED", optionId: string, newCount: number, newPercentage: number }
  | { type: "PARTICIPANT_JOINED", count: number }
  | { type: "PARTICIPANT_LEFT", count: number }
  | { type: "POLL_STARTED" }
  | { type: "POLL_ENDED", finalResults: PollResults }
  | { type: "HOST_MESSAGE", message: string }
  | { type: "CHAT_MESSAGE", message: ChatMessage }
  | { type: "ERROR", code: string, message: string }

// Client -> Server events
type LivePollClientEvent =
  | { type: "JOIN_POLL", joinCode: string, participantId: string | null }
  | { type: "VOTE", optionId: string }
  | { type: "SEND_CHAT", message: string }
  | { type: "LEAVE_POLL" }

// Host -> Server events
type LivePollHostEvent =
  | { type: "START_POLL" }
  | { type: "END_POLL" }
  | { type: "PAUSE_POLL" }
  | { type: "RESUME_POLL" }
  | { type: "RESET_POLL" }
  | { type: "SEND_ANNOUNCEMENT", message: string }
  | { type: "KICK_PARTICIPANT", participantId: string }
```



# ═══════════════════════════════════════════════════════════════════════════════
# CAPACITY HANDLING
# ═══════════════════════════════════════════════════════════════════════════════

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

  // When participant leaves (frees a spot)
  onParticipantLeave: {
    notifyWaitingRoom: true,
    autoAdmitFromQueue: true,
    admissionOrder: "FIFO"               // First in, first out
  },

  // Enterprise tier override
  enterpriseTierLimits: {
    maxParticipantsPerPoll: 100000,     // 100K for Enterprise
    dedicatedInfrastructure: true,
    customCapacityPlanning: true
  }
}
```



# ═══════════════════════════════════════════════════════════════════════════════
# HOST CONTROL PANEL
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        LIVE POLL HOST DASHBOARD                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  LIVE   "Which feature should we build next?"                           │   │
│  │  ●                                                                      │   │
│  │                                                                         │   │
│  │  JOIN CODE: ABC123                                                      │   │
│  │  JOIN URL: voxpoll.com/live/ABC123                                      │   │
│  │                                                                         │   │
│  │  [Copy Link] [Download QR] [Share]                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  PARTICIPANTS: 1,234                    TIME REMAINING: 12:34                   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  REAL-TIME RESULTS:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Dark Mode        █████████████████████████████░░░  42%  (518)          │   │
│  │  Mobile App       ████████████████████░░░░░░░░░░░░  31%  (382)          │   │
│  │  API Improvements ████████████░░░░░░░░░░░░░░░░░░░░  18%  (222)          │   │
│  │  Other            █████░░░░░░░░░░░░░░░░░░░░░░░░░░░   9%  (112)          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  HOST CONTROLS:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  [Pause Poll] [End Poll] [Reset Results] [Send Announcement]            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  LIVE CHAT:                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  @user123: "Dark mode please!"                                          │   │
│  │  @jane_doe: "Mobile app would be amazing"                               │   │
│  │  @anon_456: "API improvements!"                                         │   │
│  │  [Type message...]                               [Send]                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# PARTICIPANT VIEW
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       LIVE POLL PARTICIPANT VIEW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  LIVE   [VoxPoll Logo]                                  1,234 watching  │   │
│  │  ●                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │     Which feature should we build next?                                │   │
│  │                                                                         │   │
│  │     ┌─────────────────────────────────────────────────────────┐        │   │
│  │     │  [Radio] Dark Mode                                      │        │   │
│  │     └─────────────────────────────────────────────────────────┘        │   │
│  │                                                                         │   │
│  │     ┌─────────────────────────────────────────────────────────┐        │   │
│  │     │  [Radio] Mobile App                                     │        │   │
│  │     └─────────────────────────────────────────────────────────┘        │   │
│  │                                                                         │   │
│  │     ┌─────────────────────────────────────────────────────────┐        │   │
│  │     │  [Radio] API Improvements                               │        │   │
│  │     └─────────────────────────────────────────────────────────┘        │   │
│  │                                                                         │   │
│  │     ┌─────────────────────────────────────────────────────────┐        │   │
│  │     │  [Radio] Other                                          │        │   │
│  │     └─────────────────────────────────────────────────────────┘        │   │
│  │                                                                         │   │
│  │                          [VOTE]                                        │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────     │
│  AFTER VOTING:                                                                  │
│  ─────────────────────────────────────────────────────────────────────────     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Your vote: Dark Mode                                 [Change Vote]     │   │
│  │                                                                         │   │
│  │  LIVE RESULTS:                                                          │   │
│  │  Dark Mode        █████████████████████████████░░░  42%                 │   │
│  │  Mobile App       ████████████████████░░░░░░░░░░░░  31%                 │   │
│  │  API Improvements ████████████░░░░░░░░░░░░░░░░░░░░  18%                 │   │
│  │  Other            █████░░░░░░░░░░░░░░░░░░░░░░░░░░░   9%                 │   │
│  │                                                                         │   │
│  │  [Results updating in real-time...]                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```



# ═══════════════════════════════════════════════════════════════════════════════
# TECHNICAL ARCHITECTURE
# ═══════════════════════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     LIVE POLL TECHNICAL ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐                                                           │
│  │    CLIENTS      │                                                           │
│  │  (Participants) │                                                           │
│  └────────┬────────┘                                                           │
│           │ WebSocket                                                          │
│           ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    LOAD BALANCER                                        │   │
│  │              (Sticky sessions by poll)                                  │   │
│  └────────────────────────────┬────────────────────────────────────────────┘   │
│                               │                                                │
│        ┌──────────────────────┼──────────────────────┐                        │
│        ▼                      ▼                      ▼                        │
│  ┌───────────┐          ┌───────────┐          ┌───────────┐                  │
│  │  WS       │          │  WS       │          │  WS       │                  │
│  │  SERVER 1 │◄────────►│  SERVER 2 │◄────────►│  SERVER N │                  │
│  │  (2500)   │ PubSub   │  (2500)   │ PubSub   │  (2500)   │                  │
│  └─────┬─────┘          └─────┬─────┘          └─────┬─────┘                  │
│        │                      │                      │                        │
│        └──────────────────────┼──────────────────────┘                        │
│                               │                                                │
│                               ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         REDIS CLUSTER                                   │   │
│  │   - Real-time vote counts (atomic increments)                           │   │
│  │   - Participant presence tracking                                       │   │
│  │   - Cross-server message broadcasting (Pub/Sub)                         │   │
│  │   - Rate limiting per participant                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                               │                                                │
│                               ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         POSTGRESQL                                      │   │
│  │   - Poll configuration                                                  │   │
│  │   - Final results persistence                                           │   │
│  │   - Audit logs                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  SCALING:                                                                      │
│  - Each WS server handles ~2,500 connections                                   │
│  - Auto-scale based on active connections                                      │
│  - Consistent hashing for poll-to-server assignment                            │
│  - Redis Pub/Sub for cross-server synchronization                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```
