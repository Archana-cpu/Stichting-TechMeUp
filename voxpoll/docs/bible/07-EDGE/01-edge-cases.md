# 01-edge-cases.md
> Source: bible-016.md, bible-027.md

# ══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## Registration Edge Cases

```typescript
const REGISTRATION_EDGE_CASES = {
  DUPLICATE_EMAIL_DURING_REGISTRATION: {
    id: "REG_EC_001",
    scenario: "User starts registration, another user registers same email before completion",
    detection: "Unique constraint violation on email",
    handling: "Show error, suggest login or password reset",
    errorCode: "CONF_001"
  },

  EMAIL_CASE_SENSITIVITY: {
    id: "REG_EC_002",
    scenario: "User@Example.com vs user@example.com",
    handling: "Normalize to lowercase before storage and comparison",
    implementation: "email.toLowerCase().trim()"
  },

  UNICODE_USERNAME: {
    id: "REG_EC_003",
    scenario: "Username with unicode lookalikes (е vs e, а vs a)",
    handling: "Normalize unicode, reject confusable characters",
    implementation: "NFKC normalization + confusable detection"
  },

  DISPOSABLE_EMAIL: {
    id: "REG_EC_004",
    scenario: "User tries to register with tempmail.com etc",
    detection: "Check against disposable email domain list",
    handling: "Reject with clear message",
    errorCode: "VAL_006",
    customMessage: "Gecici e-posta adresleri kabul edilmiyor"
  },

  REGISTRATION_TIMEOUT: {
    id: "REG_EC_005",
    scenario: "User starts registration but never completes verification",
    handling: "Delete unverified accounts after 7 days",
    cleanupJob: "daily at 03:00 UTC"
  },

  CONCURRENT_REGISTRATION: {
    id: "REG_EC_006",
    scenario: "Same email submitted simultaneously from different sessions",
    handling: "Use database unique constraint, first wins",
    implementation: "Catch unique violation, return CONF_001"
  },

  WEAK_PASSWORD_VARIANTS: {
    id: "REG_EC_007",
    scenario: "Password is 'Password1!' or 'Qwerty123'",
    detection: "Check against common password list",
    handling: "Reject with specific guidance",
    listSize: 100000
  }
}

export { REGISTRATION_EDGE_CASES }
```

## Login Edge Cases

```typescript
const LOGIN_EDGE_CASES = {
  BRUTE_FORCE_ATTACK: {
    id: "LOGIN_EC_001",
    scenario: "Multiple failed login attempts",
    detection: "Track failed attempts per IP and per account",
    handling: {
      perAccount: { threshold: 5, lockoutMinutes: 15 },
      perIP: { threshold: 20, lockoutMinutes: 60 },
      progressive: "Lockout duration doubles with each subsequent lockout"
    },
    errorCode: "AUTH_010"
  },

  CREDENTIAL_STUFFING: {
    id: "LOGIN_EC_002",
    scenario: "Automated login attempts with leaked credentials",
    detection: "Unusual login patterns, many accounts from same IP",
    handling: "CAPTCHA challenge, IP reputation check",
    mitigation: "Rate limit by IP, require CAPTCHA after 3 failures"
  },

  SESSION_FIXATION: {
    id: "LOGIN_EC_003",
    scenario: "Attacker fixes session ID before user logs in",
    handling: "Regenerate session ID on successful login",
    implementation: "Always create new session token on authentication"
  },

  CONCURRENT_SESSIONS: {
    id: "LOGIN_EC_004",
    scenario: "User logs in from multiple devices",
    handling: "Allow up to 5 concurrent sessions",
    notification: "Notify user of new device login",
    option: "Setting to terminate other sessions on new login"
  },

  ACCOUNT_TAKEOVER_DETECTION: {
    id: "LOGIN_EC_005",
    scenario: "Login from unusual location/device",
    detection: {
      newDevice: true,
      unusualLocation: "Distance > 1000km in < 1 hour",
      unusualTime: "Outside normal activity hours"
    },
    handling: "Email notification, optional 2FA challenge"
  },

  DORMANT_ACCOUNT_LOGIN: {
    id: "LOGIN_EC_006",
    scenario: "User logs into account marked as DORMANT",
    handling: "Reactivate account, show welcome back message",
    stateTransition: "DORMANT -> ACTIVE"
  },

  SUSPENDED_ACCOUNT_LOGIN: {
    id: "LOGIN_EC_007",
    scenario: "Suspended user tries to login",
    handling: "Allow login but show restricted view",
    showInfo: "Suspension reason and end date",
    errorCode: "AUTHZ_003"
  }
}

export { LOGIN_EDGE_CASES }
```

## Session Edge Cases

```typescript
const SESSION_EDGE_CASES = {
  TOKEN_REFRESH_RACE: {
    id: "SESS_EC_001",
    scenario: "Multiple tabs refresh token simultaneously",
    handling: "Accept old token for 30 seconds after refresh",
    implementation: "Grace period for recent refresh tokens"
  },

  SESSION_HIJACKING: {
    id: "SESS_EC_002",
    scenario: "Session token stolen and used from different device",
    detection: "Device fingerprint mismatch, IP change",
    handling: "Invalidate session, require re-authentication",
    notification: "Security alert to user"
  },

  SESSION_EXPIRY_MID_ACTION: {
    id: "SESS_EC_003",
    scenario: "Session expires while user is filling long form",
    handling: "Client-side session monitoring, auto-refresh",
    ux: "Save draft before redirecting to login"
  },

  LOGOUT_FROM_ALL_DEVICES: {
    id: "SESS_EC_004",
    scenario: "User requests logout from all devices",
    handling: "Invalidate all refresh tokens, increment token version",
    implementation: "tokenVersion field on User, check on each request"
  },

  REMEMBER_ME_SECURITY: {
    id: "SESS_EC_005",
    scenario: "Long-lived remember me token on shared computer",
    handling: {
      maxAge: "30 days",
      requireReauth: "For sensitive operations",
      deviceBinding: "Bind to device fingerprint"
    }
  }
}

export { SESSION_EDGE_CASES }
```


# ══════════════════════════════════════════════════════════════════════════════
# CONTENT EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## Poll Edge Cases

```typescript
const POLL_EDGE_CASES = {
  POLL_ENDS_DURING_VOTE: {
    id: "POLL_EC_001",
    scenario: "User starts voting, poll ends before submission",
    detection: "Check poll status on vote submission",
    handling: "Reject vote, show poll ended message",
    ux: "Display results instead",
    errorCode: "BIZ_001"
  },

  SIMULTANEOUS_VOTES: {
    id: "POLL_EC_002",
    scenario: "Same user submits vote from multiple tabs/devices",
    detection: "Unique constraint on (pollId, participantHash)",
    handling: "First vote wins, subsequent rejected",
    errorCode: "CONF_004"
  },

  POLL_DELETED_AFTER_VOTE: {
    id: "POLL_EC_003",
    scenario: "Poll deleted while user is viewing results",
    handling: "Soft delete, show 'content no longer available'",
    dataRetention: "Keep responses for 30 days"
  },

  OPTION_OVERFLOW: {
    id: "POLL_EC_004",
    scenario: "Option vote count exceeds INT32_MAX",
    prevention: "Use BigInt for vote counts",
    implementation: "PostgreSQL BIGINT, JavaScript BigInt"
  },

  EMPTY_POLL_RESULTS: {
    id: "POLL_EC_005",
    scenario: "Poll ends with 0 participants",
    handling: "Show 'No participation' message",
    reliabilityScore: null,
    discussion: "Do not open"
  },

  CREATOR_DELETES_ACTIVE_POLL: {
    id: "POLL_EC_006",
    scenario: "Creator tries to delete poll with participants",
    handling: "Soft delete, preserve responses",
    notification: "Notify participants if discussion was active"
  },

  TIMEZONE_EDGE_CASES: {
    id: "POLL_EC_007",
    scenario: "Poll ends at 23:59:59.999 in one timezone",
    handling: "Store all times in UTC, convert for display",
    precision: "Second precision, round up on edge"
  },

  RAPID_OPTION_CHANGES: {
    id: "POLL_EC_008",
    scenario: "Creator modifies options while poll is active",
    handling: "Prevent option changes once poll has votes",
    allowedChanges: ["title", "description", "endsAt (extension only)"]
  }
}

export { POLL_EDGE_CASES }
```

## Survey Edge Cases

```typescript
const SURVEY_EDGE_CASES = {
  SURVEY_TIMEOUT: {
    id: "SURV_EC_001",
    scenario: "User abandons survey mid-completion",
    detection: "No activity for 1 hour",
    handling: "Mark as ABANDONED, save partial responses",
    retention: "Keep partial data for analysis"
  },

  INVITATION_REUSE: {
    id: "SURV_EC_002",
    scenario: "User tries to use invitation token twice",
    detection: "Token already marked as used",
    handling: "Show already completed message",
    errorCode: "CONF_010"
  },

  DISPLAY_LOGIC_LOOP: {
    id: "SURV_EC_003",
    scenario: "Display logic creates infinite loop",
    prevention: "Validate logic graph on survey creation",
    runtime: "Max 100 iterations, then error",
    errorCode: "SRV_001",
    customMessage: "Anket yapilandirma hatasi"
  },

  SKIP_LOGIC_ORPHANS: {
    id: "SURV_EC_004",
    scenario: "Skip logic skips required questions",
    handling: "Skipped required questions treated as answered",
    validation: "Warn creator during setup"
  },

  PIPING_MISSING_DATA: {
    id: "SURV_EC_005",
    scenario: "Piped question references skipped answer",
    handling: "Show placeholder or skip piped content",
    placeholder: "[yanit verilmedi]"
  },

  QUOTA_RACE_CONDITION: {
    id: "SURV_EC_006",
    scenario: "Multiple users complete survey at quota limit",
    handling: "Accept slight overquota, process sequentially",
    tolerance: "Allow up to 5% overquota"
  },

  ATTENTION_CHECK_ALL_FAIL: {
    id: "SURV_EC_007",
    scenario: "User fails all attention checks",
    handling: "Disqualify response, mark as low quality",
    notification: "Inform user of disqualification",
    errorCode: "BIZ_014"
  },

  BROWSER_BACK_BUTTON: {
    id: "SURV_EC_008",
    scenario: "User uses browser back button during survey",
    handling: "Restore previous state, don't duplicate responses",
    implementation: "Track current position server-side"
  },

  FILE_UPLOAD_FAILURE: {
    id: "SURV_EC_009",
    scenario: "File upload fails during survey submission",
    handling: "Allow retry, don't lose other answers",
    fallback: "Save text responses, mark file as pending"
  }
}

export { SURVEY_EDGE_CASES }
```

## Test Edge Cases

```typescript
const TEST_EDGE_CASES = {
  TIME_LIMIT_EXPIRY: {
    id: "TEST_EC_001",
    scenario: "Test time limit expires during submission",
    handling: "Auto-submit answered questions",
    graceSeconds: 30,
    scoring: "Score only submitted answers"
  },

  TAB_SWITCH_DETECTION: {
    id: "TEST_EC_002",
    scenario: "User switches tabs during proctored test",
    detection: "visibilitychange event",
    handling: "Log warning, flag after 3 occurrences",
    threshold: 3,
    action: "Warn user, optionally auto-submit"
  },

  NETWORK_DISCONNECT: {
    id: "TEST_EC_003",
    scenario: "Network disconnects during test",
    handling: "Local answer caching, sync on reconnect",
    implementation: "IndexedDB for offline storage",
    timeout: "Continue timer, extend grace period"
  },

  SCORE_CALCULATION_EDGE: {
    id: "TEST_EC_004",
    scenario: "All answers wrong or all correct",
    handling: "Valid scores, proper percentage display",
    minScore: 0,
    maxScore: "Sum of all question points"
  },

  PARTIAL_CORRECT_ANSWERS: {
    id: "TEST_EC_005",
    scenario: "Multiple choice with partial correct selections",
    scoring: {
      allCorrect: "Full points",
      partialCorrect: "Proportional points",
      anyWrong: "Zero points (configurable)"
    }
  },

  DUPLICATE_ATTEMPT: {
    id: "TEST_EC_006",
    scenario: "User tries to start new attempt before previous completes",
    handling: "Return existing in-progress attempt",
    errorCode: "CONF_010"
  },

  RESULT_CATEGORY_GAP: {
    id: "TEST_EC_007",
    scenario: "Score falls between defined categories",
    prevention: "Validate categories cover 0-100% on creation",
    fallback: "Assign to nearest category"
  }
}

export { TEST_EDGE_CASES }
```


# ══════════════════════════════════════════════════════════════════════════════
# LIVE POLL CRITICAL EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

```typescript
const LIVE_POLL_EDGE_CASES = {
  VOTE_DURING_CLOSE: {
    id: "LIVE_001",
    scenario: "User submits vote at exact moment poll closes",
    handling: "Accept vote if serverTimestamp <= closedAt",
    implementation: `
      // In vote processor:
      if (vote.serverTimestamp <= poll.closedAt) {
        acceptVote(vote)
      } else {
        rejectVote(vote, "POLL_CLOSED")
      }
    `,
    graceWindow: "0ms - strict cutoff at closedAt timestamp"
  },

  NETWORK_PARTITION: {
    id: "LIVE_002",
    scenario: "Network split - 50 participants lose connection mid-vote",
    handling: "Reconnection with message replay",
    implementation: `
      // On reconnect:
      1. Client sends last known sequence number
      2. Server replays missed state updates
      3. If pending vote exists locally, retry submission
      4. Server deduplicates by participantId
    `,
    dataConsistency: "Server is authoritative source of truth"
  },

  JOIN_CODE_COLLISION: {
    id: "LIVE_003",
    scenario: "Two simultaneous sessions get same 6-char code",
    probability: "1 in 1 billion (32^6 combinations)",
    prevention: `
      // Generate with uniqueness check:
      async function generateUniqueJoinCode(): Promise<string> {
        for (let i = 0; i < 10; i++) {
          const code = generateJoinCode()
          const exists = await redis.exists(\`live:\${code}\`)
          if (!exists) {
            await redis.set(\`live:\${code}\`, sessionId, 'EX', 86400)
            return code
          }
        }
        throw new Error("JOIN_CODE_GENERATION_EXHAUSTED")
      }
    `
  },

  WAITING_ROOM_STARVATION: {
    id: "LIVE_004",
    scenario: "Early joiners never leave, waiting room users time out",
    handling: "Fair queue with position tracking",
    maxWaitTime: "5 minutes (300000ms)",
    onTimeout: "Notify user, offer to rejoin queue or explore other content"
  },

  HOST_DISCONNECTS_MID_SESSION: {
    id: "LIVE_005",
    scenario: "Poll creator loses connection during active session",
    handling: "Auto-pause after 60s host disconnect",
    implementation: `
      // Host heartbeat monitoring:
      if (Date.now() - lastHostHeartbeat > 60000) {
        session.status = "PAUSED"
        broadcast({ type: "HOST_DISCONNECTED", pausedAt: Date.now() })
      }
    `,
    recovery: "Host can resume within 10 minutes, else auto-end"
  },

  PERCENTAGE_ROUNDING_INCONSISTENCY: {
    id: "LIVE_006",
    scenario: "3 options: 33.33%, 33.33%, 33.34% - sum > 100 on display",
    handling: "Largest remainder method",
    implementation: `
      // See BIBLE-023 calculatePercentages function
      // Ensures sum always equals exactly 100%
    `,
    display: "Show floor() values, adjust highest remainder"
  },

  RAPID_VOTE_CHANGE: {
    id: "LIVE_007",
    scenario: "User rapidly changes vote multiple times",
    handling: "Allow vote change within 2-second grace period only",
    rateLimit: "Max 1 vote change per 2 seconds",
    finalVote: "Last vote within grace period is counted"
  }
}

export { LIVE_POLL_EDGE_CASES }
```


# ══════════════════════════════════════════════════════════════════════════════
# MULTI-SESSION SURVEY EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

```typescript
const MULTI_SESSION_SURVEY_EDGE_CASES = {
  SURVEY_MODIFIED_DURING_SESSION: {
    id: "MULTI_001",
    scenario: "Admin modifies survey while user has active session",
    handling: "Version lock - session keeps original schema",
    implementation: `
      interface SurveySession {
        sessionId: string
        surveyId: string
        surveyVersionId: string  // Snapshot at session start
        responses: Map<string, Answer>
        startedAt: Date
        expiresAt: Date
      }
      // New questions: Not shown to existing sessions
      // Deleted questions: Responses kept but marked orphaned
      // Modified questions: Original version shown
    `
  },

  CROSS_TIMEZONE_EXPIRY: {
    id: "MULTI_002",
    scenario: "User starts in UTC-5, resumes in UTC+3",
    handling: "Store all timestamps as UTC",
    implementation: `
      // Session creation:
      session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // UTC

      // Resume check:
      if (new Date() > session.expiresAt) {
        return { error: "SESSION_EXPIRED" }
      }
    `,
    display: "Show relative time ('Expires in 2 days') not absolute"
  },

  DST_TRANSITION_DURING_SESSION: {
    id: "MULTI_003",
    scenario: "Daylight Saving Time change during 7-day session",
    handling: "UTC storage immune to DST",
    edgeCase: "User's local time display may 'jump'",
    implementation: "Use Intl.DateTimeFormat for user-local display"
  },

  BROWSER_DATA_CLEARED: {
    id: "MULTI_004",
    scenario: "User clears browser data, loses session reference",
    handling: "Server-side session lookup by userId + surveyId",
    recovery: `
      // On survey page load:
      const existingSession = await findActiveSession(userId, surveyId)
      if (existingSession) {
        showResumePrompt("You have an incomplete session")
      }
    `
  },

  CONCURRENT_SESSIONS_SAME_SURVEY: {
    id: "MULTI_005",
    scenario: "User opens survey in two tabs simultaneously",
    handling: "Last-write-wins with optimistic locking",
    implementation: `
      // Each answer save includes session version:
      async function saveAnswer(sessionId, questionId, answer, clientVersion) {
        const session = await getSession(sessionId)
        if (session.version !== clientVersion) {
          // Another tab updated - return merge conflict
          return { conflict: true, serverVersion: session.version }
        }
        await updateAnswer(sessionId, questionId, answer)
        await incrementVersion(sessionId)
      }
    `,
    uiHandling: "Show warning: 'Session updated in another tab'"
  }
}

export { MULTI_SESSION_SURVEY_EDGE_CASES }
```


# ══════════════════════════════════════════════════════════════════════════════
# SOCIAL INTERACTION EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## Comment Edge Cases

```typescript
const COMMENT_EDGE_CASES = {
  PARENT_DELETED_BEFORE_REPLY: {
    id: "CMT_EC_001",
    scenario: "Parent comment deleted while user writes reply",
    detection: "Check parent exists on submission",
    handling: "Convert to root comment or reject",
    preference: "Reject with message",
    errorCode: "NF_006"
  },

  DISCUSSION_LOCKED_WHILE_TYPING: {
    id: "CMT_EC_002",
    scenario: "Discussion locked while user composing comment",
    detection: "Check discussion status on submission",
    handling: "Reject, show locked message",
    errorCode: "BIZ_006"
  },

  EDIT_WINDOW_RACE: {
    id: "CMT_EC_003",
    scenario: "User starts edit, window expires before save",
    detection: "Check edit window on save",
    handling: "Reject with window expired message",
    errorCode: "BIZ_008"
  },

  SELF_REPLY: {
    id: "CMT_EC_004",
    scenario: "User replies to their own comment",
    handling: "Allow, but no notification to self"
  },

  MENTION_BLOCKED_USER: {
    id: "CMT_EC_005",
    scenario: "User mentions someone who blocked them",
    handling: "Allow mention, but no notification sent",
    visibility: "Mentioned user won't see it"
  },

  MAX_DEPTH_REPLY: {
    id: "CMT_EC_006",
    scenario: "Reply to comment at max depth",
    handling: "Attach reply to parent of max-depth comment",
    maxDepth: 3
  },

  RAPID_COMMENTING: {
    id: "CMT_EC_007",
    scenario: "User posts many comments quickly",
    detection: "Rate limit check",
    handling: "Cooldown period, show timer",
    errorCode: "RATE_005"
  },

  COMMENT_WITH_ONLY_MENTIONS: {
    id: "CMT_EC_008",
    scenario: "Comment contains only @mentions",
    handling: "Reject as spam-like behavior",
    errorCode: "VAL_003",
    customMessage: "Yorum sadece bahsetmelerden olusamaz"
  },

  ORPHANED_VOTES: {
    id: "CMT_EC_009",
    scenario: "Comment deleted after receiving votes",
    handling: "Soft delete preserves vote count for author stats",
    display: "[silindi]"
  }
}

export { COMMENT_EDGE_CASES }
```

## Follow Edge Cases

```typescript
const FOLLOW_EDGE_CASES = {
  FOLLOW_LIMIT_REACHED: {
    id: "FOLLOW_EC_001",
    scenario: "User at max following limit tries to follow",
    handling: "Reject with limit message",
    errorCode: "BIZ_005",
    customMessage: "Maksimum takip limitine ulastiniz (5000)"
  },

  MUTUAL_BLOCK_FOLLOW: {
    id: "FOLLOW_EC_002",
    scenario: "User tries to follow someone they blocked",
    handling: "Require unblock first",
    errorCode: "BIZ_009"
  },

  FOLLOW_DELETED_USER: {
    id: "FOLLOW_EC_003",
    scenario: "User tries to follow deleted account",
    handling: "Return not found",
    errorCode: "NF_001"
  },

  PRIVATE_ACCOUNT_FOLLOW: {
    id: "FOLLOW_EC_004",
    scenario: "Follow request to private account",
    handling: "Create pending follow request",
    notification: "Notify account owner"
  },

  FOLLOW_REQUEST_SPAM: {
    id: "FOLLOW_EC_005",
    scenario: "User sends many follow requests rapidly",
    handling: "Rate limit: 100/hour",
    errorCode: "RATE_001"
  },

  UNFOLLOW_PENDING_REQUEST: {
    id: "FOLLOW_EC_006",
    scenario: "User cancels pending follow request",
    handling: "Delete pending request",
    notification: "No notification to target"
  }
}

export { FOLLOW_EDGE_CASES }
```


# ══════════════════════════════════════════════════════════════════════════════
# DATA CONSISTENCY EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## Race Conditions

```typescript
const RACE_CONDITION_CASES = {
  COUNTER_UPDATE_RACE: {
    id: "RACE_001",
    scenario: "Multiple users update same counter simultaneously",
    example: "participantCount, voteCount, commentCount",
    handling: "Use atomic increment operations",
    implementation: "UPDATE ... SET count = count + 1"
  },

  OPTIMISTIC_LOCKING_FAILURE: {
    id: "RACE_002",
    scenario: "Two users edit same resource",
    detection: "Version/updatedAt mismatch",
    handling: "Reject second update, show conflict",
    errorCode: "CONF_007"
  },

  HOT_SCORE_CALCULATION_RACE: {
    id: "RACE_003",
    scenario: "Multiple processes recalculate hot score",
    handling: "Use distributed lock or last-write-wins",
    implementation: "Redis SETNX for lock"
  },

  DOUBLE_SUBMISSION: {
    id: "RACE_004",
    scenario: "Form submitted twice (double click)",
    prevention: {
      client: "Disable button on submit",
      server: "Idempotency key check"
    },
    implementation: "Store idempotency key in Redis for 1 hour"
  },

  CASCADING_DELETE_RACE: {
    id: "RACE_005",
    scenario: "Related data created during soft delete",
    handling: "Transaction isolation level SERIALIZABLE",
    alternative: "Check deleted_at on all writes"
  }
}

export { RACE_CONDITION_CASES }
```

## Response Integrity Edge Cases

```typescript
const RESPONSE_INTEGRITY_EDGE_CASES = {
  CHECKSUM_TAMPERING: {
    id: "RESP_001",
    scenario: "Client attempts to modify response payload",
    prevention: "Server-side checksum generation",
    algorithm: "HMAC-SHA256",
    implementation: `
      function generateResponseChecksum(response: Response): string {
        const payload = JSON.stringify({
          responseId: response.id,
          contentId: response.contentId,
          userId: response.userId,
          answers: response.answers,
          submittedAt: response.submittedAt.toISOString()
        })
        return crypto
          .createHmac('sha256', process.env.RESPONSE_CHECKSUM_SECRET)
          .update(payload)
          .digest('hex')
      }
    `,
    onMismatch: "Flag for review, do not auto-reject (could be bug)"
  },

  DEVICE_FINGERPRINT_COLLISION: {
    id: "RESP_002",
    scenario: "Two different users have identical fingerprint",
    probability: "~1% for canvas + WebGL + timezone combo",
    handling: "Fingerprint is hint, not sole identifier",
    implementation: `
      // Duplicate detection uses multiple signals:
      const isDuplicate =
        (sameFingerprint && sameIP) ||
        (sameFingerprint && sameUserId) ||
        (sameIP && timeDelta < 5000)  // 5 seconds
    `,
    falsePositive: "Shared device legitimate use case",
    mitigation: "Allow appeal via support ticket"
  },

  REPLAY_ATTACK: {
    id: "RESP_003",
    scenario: "Attacker captures and re-submits valid response",
    prevention: "Nonce + timestamp validation",
    implementation: `
      interface ResponseSubmission {
        nonce: string           // UUID generated client-side
        timestamp: number       // Client timestamp
        serverReceived: number  // Server adds on receipt
      }

      // Validation:
      1. Nonce must not exist in Redis (expire after 1 hour)
      2. timestamp within 5 minutes of server time
      3. Store nonce in Redis with 1hr TTL
    `
  },

  ANONYMOUS_IDENTITY_LINKAGE: {
    id: "RESP_004",
    scenario: "Anonymous user later creates account, linking responses",
    handling: "Explicit opt-in for linking",
    implementation: `
      // On account creation, if anonymous responses exist:
      if (await hasAnonymousResponses(deviceFingerprint)) {
        showPrompt("Link your previous responses to this account?")
        // If yes: Update response userId
        // If no: Keep anonymous, clear fingerprint association
      }
    `,
    privacy: "Never auto-link without consent"
  }
}

export { RESPONSE_INTEGRITY_EDGE_CASES }
```

## Data Integrity Cases

```typescript
const DATA_INTEGRITY_CASES = {
  ORPHANED_RESPONSES: {
    id: "INT_001",
    scenario: "Poll deleted but responses exist",
    prevention: "Soft delete only, cascade soft delete to responses",
    cleanup: "Background job marks orphaned responses"
  },

  CIRCULAR_REFERENCE: {
    id: "INT_002",
    scenario: "Category parent references child",
    prevention: "Validate hierarchy on update",
    implementation: "Recursive CTE to check cycles"
  },

  NULL_FOREIGN_KEY: {
    id: "INT_003",
    scenario: "Referenced user deleted",
    handling: "SET NULL on delete for non-critical FKs",
    display: "Show [silinen kullanici]"
  },

  AGGREGATE_DRIFT: {
    id: "INT_004",
    scenario: "Cached counts drift from actual",
    example: "participantCount != actual response count",
    handling: "Periodic reconciliation job",
    schedule: "Daily at 04:00 UTC"
  },

  HASH_COLLISION: {
    id: "INT_005",
    scenario: "Two users get same participant hash",
    probability: "Negligible with SHA-256",
    handling: "Add contentId to make hash unique per content",
    implementation: "HMAC-SHA256(userId + contentId, salt)"
  },

  TIMEZONE_DATA_MISMATCH: {
    id: "INT_006",
    scenario: "Client sends local time, server expects UTC",
    handling: "Always transmit ISO 8601 with timezone",
    storage: "Store as UTC, convert on display"
  }
}

export { DATA_INTEGRITY_CASES }
```


# ══════════════════════════════════════════════════════════════════════════════
# EXTERNAL SERVICE EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## Email Service Edge Cases

```typescript
const EMAIL_SERVICE_EDGE_CASES = {
  SMTP_TIMEOUT: {
    id: "EMAIL_EC_001",
    scenario: "Email provider times out",
    handling: "Queue for retry, max 3 attempts",
    retryDelays: [60, 300, 900],
    fallback: "Log and alert, don't block user action"
  },

  BOUNCE_HANDLING: {
    id: "EMAIL_EC_002",
    scenario: "Email bounces (invalid address)",
    handling: {
      softBounce: "Retry 3 times over 24 hours",
      hardBounce: "Mark email as invalid, notify user"
    }
  },

  SPAM_CLASSIFICATION: {
    id: "EMAIL_EC_003",
    scenario: "Emails going to spam",
    prevention: {
      dkim: true,
      spf: true,
      dmarc: true,
      warmup: "Gradual volume increase"
    }
  },

  RATE_LIMIT_EXCEEDED: {
    id: "EMAIL_EC_004",
    scenario: "Email provider rate limit hit",
    handling: "Queue overflow to secondary provider",
    monitoring: "Alert on queue depth"
  }
}

export { EMAIL_SERVICE_EDGE_CASES }
```

## Push Notification Edge Cases

```typescript
const PUSH_NOTIFICATION_EDGE_CASES = {
  INVALID_TOKEN: {
    id: "PUSH_EC_001",
    scenario: "Push token expired or invalid",
    detection: "Provider returns error",
    handling: "Remove token, increment failure count",
    cleanup: "Deactivate after 5 consecutive failures"
  },

  PROVIDER_OUTAGE: {
    id: "PUSH_EC_002",
    scenario: "FCM/APNs unavailable",
    handling: "Queue for retry, max 6 hours",
    fallback: "Send email notification if critical"
  },

  PAYLOAD_TOO_LARGE: {
    id: "PUSH_EC_003",
    scenario: "Notification payload exceeds limit",
    limits: { fcm: 4096, apns: 4096 },
    handling: "Truncate message, add 'tap for more'"
  },

  DUPLICATE_DELIVERY: {
    id: "PUSH_EC_004",
    scenario: "Same notification delivered twice",
    prevention: "Idempotency key in payload",
    client: "Dedupe by notification ID"
  }
}

export { PUSH_NOTIFICATION_EDGE_CASES }
```

## File Storage Edge Cases

```typescript
const FILE_STORAGE_EDGE_CASES = {
  UPLOAD_TIMEOUT: {
    id: "FILE_EC_001",
    scenario: "Large file upload times out",
    handling: "Chunked upload, resume capability",
    maxChunkSize: 5242880,
    resumeWindow: "24 hours"
  },

  STORAGE_QUOTA_EXCEEDED: {
    id: "FILE_EC_002",
    scenario: "Organization storage limit reached",
    handling: "Reject upload, show quota usage",
    errorCode: "BIZ_005"
  },

  PRESIGNED_URL_EXPIRED: {
    id: "FILE_EC_003",
    scenario: "User takes too long to upload",
    expiry: "15 minutes",
    handling: "Client requests new URL"
  },

  MALICIOUS_FILE: {
    id: "FILE_EC_004",
    scenario: "Uploaded file contains malware",
    detection: "Virus scan on upload",
    handling: "Reject, log incident, alert security"
  },

  IMAGE_PROCESSING_FAILURE: {
    id: "FILE_EC_005",
    scenario: "Image resize/compress fails",
    handling: "Queue for retry, use original as fallback",
    notification: "Notify user of processing delay"
  },

  CDN_CACHE_INVALIDATION: {
    id: "FILE_EC_006",
    scenario: "Updated file still shows old version",
    handling: "Cache-busting query param on URL",
    implementation: "?v={timestamp}"
  }
}

export { FILE_STORAGE_EDGE_CASES }
```


# ══════════════════════════════════════════════════════════════════════════════
# FRAUD DETECTION EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## False Positive Handling

```typescript
const FRAUD_FALSE_POSITIVE_CASES = {
  LEGITIMATE_VPN_USER: {
    id: "FRAUD_FP_001",
    scenario: "User in restrictive country uses VPN",
    detection: "VPN detected but user behavior normal",
    handling: {
      softReject: "Allow with reduced weight",
      review: "Flag for manual review if first time",
      whitelist: "Allow after manual verification"
    }
  },

  SHARED_DEVICE: {
    id: "FRAUD_FP_002",
    scenario: "Multiple family members use same device",
    detection: "Same fingerprint, different accounts",
    handling: "Allow if accounts created at different times",
    threshold: "Max 3 accounts per device"
  },

  TRAVELING_USER: {
    id: "FRAUD_FP_003",
    scenario: "User suddenly appears in different country",
    detection: "Impossible travel (1000km in 1 hour)",
    handling: {
      firstTime: "Challenge with 2FA",
      recurring: "Learn user travel patterns"
    }
  },

  CORPORATE_NETWORK: {
    id: "FRAUD_FP_004",
    scenario: "Many users from same corporate IP",
    detection: "High user count per IP",
    handling: "Higher thresholds for known corporate ranges",
    whitelist: "Organization IP ranges"
  },

  NEW_DEVICE_LEGITIMATE: {
    id: "FRAUD_FP_005",
    scenario: "User got new phone",
    handling: "Challenge once, then trust",
    verification: "Email or SMS code"
  }
}

export { FRAUD_FALSE_POSITIVE_CASES }
```

## Evasion Attempts

```typescript
const FRAUD_EVASION_CASES = {
  FINGERPRINT_SPOOFING: {
    id: "FRAUD_EV_001",
    scenario: "Attacker uses fingerprint spoofing tools",
    detection: "Inconsistent fingerprint components",
    handling: "Flag as suspicious, require additional verification",
    indicators: ["Canvas mismatch", "WebGL inconsistency", "Timezone mismatch"]
  },

  SLOW_DRIP_ATTACK: {
    id: "FRAUD_EV_002",
    scenario: "Attacker submits fake responses slowly",
    detection: "Pattern analysis across time",
    indicators: ["Same response patterns", "Similar timing", "Device rotation"]
  },

  ACCOUNT_AGING: {
    id: "FRAUD_EV_003",
    scenario: "Attacker creates accounts, waits, then uses",
    detection: "Sudden activity spike after dormancy",
    handling: "Weight recent activity higher than account age"
  },

  RESIDENTIAL_PROXY: {
    id: "FRAUD_EV_004",
    scenario: "Attacker uses residential proxy to hide",
    detection: "IP reputation services, behavioral analysis",
    handling: "Focus on behavior, not just IP"
  }
}

export { FRAUD_EVASION_CASES }
```


# ══════════════════════════════════════════════════════════════════════════════
# PERFORMANCE EDGE CASES
# ══════════════════════════════════════════════════════════════════════════════

## High Load Scenarios

```typescript
const HIGH_LOAD_EDGE_CASES = {
  VIRAL_POLL: {
    id: "LOAD_EC_001",
    scenario: "Poll goes viral, 100k votes/minute",
    handling: {
      writeBuffering: "Buffer votes in Redis, batch write to DB",
      readCaching: "Aggressive result caching (5 second TTL)",
      countApproximation: "Show approximate count",
      queueing: "Process votes asynchronously"
    }
  },

  THUNDERING_HERD: {
    id: "LOAD_EC_002",
    scenario: "Cache expires, all requests hit DB",
    prevention: {
      staggeredExpiry: "Jitter on TTL",
      lockAndRefresh: "Single process refreshes cache",
      staleWhileRevalidate: "Serve stale, refresh in background"
    }
  },

  LARGE_EXPORT: {
    id: "LOAD_EC_003",
    scenario: "Organization exports 1M survey responses",
    handling: {
      background: "Process in background job",
      streaming: "Stream to file storage",
      chunking: "Export in chunks",
      notification: "Email when ready"
    }
  },

  NOTIFICATION_STORM: {
    id: "LOAD_EC_004",
    scenario: "Celebrity poll ends, 1M notifications",
    handling: {
      batching: "Group notifications",
      prioritization: "High engagement users first",
      throttling: "Max 10k notifications/second"
    }
  }
}

export { HIGH_LOAD_EDGE_CASES }
```

## Timeout Handling

```typescript
const TIMEOUT_EDGE_CASES = {
  DATABASE_TIMEOUT: {
    id: "TIMEOUT_001",
    scenario: "Complex query exceeds timeout",
    defaultTimeout: 30000,
    handling: {
      retry: "Once with exponential backoff",
      fallback: "Return cached data if available",
      logging: "Log slow query for optimization"
    }
  },

  EXTERNAL_API_TIMEOUT: {
    id: "TIMEOUT_002",
    scenario: "Third-party API doesn't respond",
    timeout: 10000,
    handling: {
      circuitBreaker: "Open after 5 failures",
      fallback: "Graceful degradation",
      retry: "With different timeout"
    }
  },

  LONG_RUNNING_JOB: {
    id: "TIMEOUT_003",
    scenario: "Background job exceeds max time",
    maxDuration: 3600000,
    handling: {
      checkpoint: "Save progress periodically",
      resume: "Continue from last checkpoint",
      splitting: "Break into smaller jobs"
    }
  }
}

export { TIMEOUT_EDGE_CASES }
```


# ══════════════════════════════════════════════════════════════════════════════
# CLIENT-SIDE ERROR HANDLING
# ══════════════════════════════════════════════════════════════════════════════

## Error Display Mapping

```typescript
const ERROR_DISPLAY_MAP = {
  VAL_: {
    style: "inline",
    icon: "exclamation-circle",
    color: "red",
    dismissible: false
  },
  AUTH_: {
    style: "toast",
    icon: "lock",
    color: "orange",
    dismissible: true,
    action: "Giris Yap"
  },
  AUTHZ_: {
    style: "modal",
    icon: "shield-exclamation",
    color: "red",
    dismissible: true
  },
  NF_: {
    style: "page",
    icon: "search-x",
    color: "gray",
    dismissible: false
  },
  RATE_: {
    style: "toast",
    icon: "clock",
    color: "yellow",
    dismissible: true,
    showRetryAfter: true
  },
  BIZ_: {
    style: "toast",
    icon: "info-circle",
    color: "blue",
    dismissible: true
  },
  SRV_: {
    style: "toast",
    icon: "server",
    color: "red",
    dismissible: true,
    showRetry: true
  },
  SEC_: {
    style: "modal",
    icon: "shield-alert",
    color: "red",
    dismissible: false
  }
}

function getErrorDisplay(code: string) {
  const prefix = code.split("_").slice(0, -1).join("_") + "_"
  return ERROR_DISPLAY_MAP[prefix] || ERROR_DISPLAY_MAP["SRV_"]
}

export { ERROR_DISPLAY_MAP, getErrorDisplay }
```

## Offline Handling

```typescript
const OFFLINE_HANDLING = {
  DETECTION: {
    method: "navigator.onLine + fetch heartbeat",
    heartbeatInterval: 30000,
    heartbeatEndpoint: "/api/health"
  },

  CACHED_ACTIONS: [
    "View cached content",
    "Browse previously loaded feeds",
    "Read saved drafts",
    "View profile (cached)"
  ],

  QUEUED_ACTIONS: [
    "Vote on poll",
    "Submit comment",
    "Like/unlike"
  ],

  BLOCKED_ACTIONS: [
    "Create new content",
    "Edit profile",
    "Change settings",
    "File upload"
  ],

  UI_FEEDBACK: {
    banner: "Cevrimdisi moddasiniz. Bazi ozellikler kisitli.",
    queuedActionFeedback: "Islem internet baglantisi gelince gonderilecek",
    blockedActionFeedback: "Bu islem icin internet baglantisi gerekli"
  },

  SYNC_ON_RECONNECT: {
    order: ["queued_votes", "queued_comments", "queued_likes"],
    conflictResolution: "server_wins",
    notification: "Bekleyen islemleriniz gonderildi"
  }
}

export { OFFLINE_HANDLING }
```


# ══════════════════════════════════════════════════════════════════════════════
# DEVICE FINGERPRINTING SPECIFICATION
# ══════════════════════════════════════════════════════════════════════════════

```typescript
interface FingerprintComponents {
  canvasHash: string
  webglHash: string
  audioContextHash: string
  screenResolution: string
  timezone: string
  language: string
  platform: string
  hardwareConcurrency: number
  installedFonts: string[]
  touchSupport: boolean
  cookieEnabled: boolean
}

const FINGERPRINT_CONFIG = {
  COMPONENT_WEIGHTS: {
    canvasHash: 0.25,
    webglHash: 0.20,
    audioContextHash: 0.15,
    screenResolution: 0.10,
    timezone: 0.08,
    language: 0.05,
    platform: 0.05,
    hardwareConcurrency: 0.05,
    installedFonts: 0.04,
    touchSupport: 0.02,
    cookieEnabled: 0.01,
  },

  SIMILARITY_THRESHOLD: 0.85,
  CURRENT_VERSION: 2,
  MAX_AGE_DAYS: 90,
  FONT_SAMPLE_SIZE: 50,
  FONT_PROBE_LIST: [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Trebuchet MS', 'Courier New', 'Monaco', 'Comic Sans MS', 'Impact',
    'Segoe UI', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    'Source Sans Pro', 'PT Sans', 'Noto Sans', 'Ubuntu', 'Fira Sans',
    'Tahoma', 'Calibri', 'Cambria', 'Consolas', 'Lucida Console'
  ]
}

export { FINGERPRINT_CONFIG }
export type { FingerprintComponents }
```

---
*Last Updated: 2026-01-23*
