# Bible-027: Failure Modes, Edge Cases & Resilience Patterns

> **"Unknown Unknowns" - Systematic documentation of potential failures and mitigations**

## Table of Contents
1. [User Behavior Edge Cases](#1-user-behavior-edge-cases)
2. [Scale & Load Edge Cases](#2-scale--load-edge-cases)
3. [Third-Party Integration Failures](#3-third-party-integration-failures)
4. [Concurrency & Race Conditions](#4-concurrency--race-conditions)
5. [Data Corruption & Integrity](#5-data-corruption--integrity)
6. [Security Attack Vectors](#6-security-attack-vectors)
7. [Network & Offline Scenarios](#7-network--offline-scenarios)
8. [Business Logic Combinations](#8-business-logic-combinations)
9. [Platform-Specific Issues](#9-platform-specific-issues)
10. [Incident Response Playbooks](#10-incident-response-playbooks)

---

## 1. User Behavior Edge Cases

| ID | Scenario | Impact | Mitigation |
|----|----------|--------|------------|
| UB-001 | Vote interruption mid-submit | Vote may/may not record | Optimistic UI + localStorage tracking |
| UB-002 | Multi-device survey completion | Partial responses on both | Server-side session tracking |
| UB-003 | Browser crash during survey | Progress lost | Auto-save every answer to IndexedDB |
| UB-004 | Account deletion with active polls | Orphaned content | Pre-deletion check, transfer flow |
| UB-005 | Rapid subscription cycling | Premium data locked | Grace period, soft-lock not delete |
| UB-006 | Org owner leaves without transfer | Orphaned organization | Enforce ownership transfer |
| UB-007 | Mass content deletion (500+ items) | DB timeout | Async bulk job with progress |
| UB-008 | VPN for geo-restricted polls | Data integrity | Multi-signal location confidence |

---

## 2. Scale & Load Edge Cases

| ID | Scenario | Impact | Mitigation |
|----|----------|--------|------------|
| SC-001 | Viral poll (1M votes/hour) | DB overwhelmed | Vote buffering, batch inserts |
| SC-002 | 10K concurrent live polls | WS memory exhaustion | Sharded real-time, polling fallback |
| SC-003 | 100M row search index | Search timeout | Tiered indices (hot/warm/cold) |
| SC-004 | Notification storm (10K org) | Queue backup | Batched creation, rate limiting |
| SC-005 | Cache stampede | DB connection exhaustion | Distributed locks, stale-while-revalidate |

---

## 3. Third-Party Integration Failures

| ID | Service | Failure Mode | Mitigation |
|----|---------|--------------|------------|
| TP-001 | Clerk Auth | Service down | Session cache, stale fallback |
| TP-002 | Stripe | Webhook missed | Idempotent processing, reconciliation |
| TP-003 | Resend Email | Delivery failure | Multi-provider fallback |
| TP-004 | Cloudinary | Upload timeout | Local queue, background sync |
| TP-005 | e-Devlet | Slow response | Async verification, status polling |
| TP-006 | Firebase FCM | Quota exceeded | Email fallback, prioritization |
| TP-007 | Soketi WS | Server crash | Auto-reconnect, polling fallback |

---

## 4. Concurrency & Race Conditions

| ID | Scenario | Impact | Mitigation |
|----|----------|--------|------------|
| RC-001 | Simultaneous votes same user | Double voting | Idempotency key per user+poll |
| RC-002 | Edit poll while voting active | Inconsistent state | Optimistic locking, version check |
| RC-003 | Delete poll during response submit | Orphan response | Soft delete, grace period |
| RC-004 | Two admins same action | Double execution | Distributed lock on action |
| RC-005 | Concurrent org settings update | Lost update | Last-write-wins with conflict UI |

### RC-001: Simultaneous Votes Prevention
```typescript
const submitVote = async (userId: string, pollId: string, optionId: string) => {
  const idempotencyKey = `vote:${userId}:${pollId}`;

  // Try to acquire lock
  const acquired = await redis.set(idempotencyKey, '1', 'NX', 'EX', 60);

  if (!acquired) {
    // Check if vote already exists
    const existingVote = await db.vote.findFirst({
      where: { odabiId: userId, pollId }
    });

    if (existingVote) {
      return { status: 'already_voted', vote: existingVote };
    }

    // Another request in progress, wait and retry
    await sleep(100);
    return submitVote(userId, pollId, optionId);
  }

  try {
    const vote = await db.vote.create({
      data: { odabiId: userId, pollId, optionId }
    });
    return { status: 'created', vote };
  } finally {
    await redis.del(idempotencyKey);
  }
};
```

### RC-002: Poll Edit During Active Voting
```typescript
const updatePoll = async (pollId: string, updates: PollUpdate, version: number) => {
  const result = await db.poll.updateMany({
    where: {
      id: pollId,
      version, // Optimistic lock
      status: { not: 'closed' }
    },
    data: {
      ...updates,
      version: { increment: 1 }
    }
  });

  if (result.count === 0) {
    const current = await db.poll.findUnique({ where: { id: pollId } });

    if (current?.version !== version) {
      throw new ConflictError('POLL_MODIFIED', {
        message: 'Bu anket başkası tarafından değiştirilmiş',
        currentVersion: current?.version
      });
    }

    throw new ForbiddenError('POLL_CLOSED');
  }

  // Notify active voters of change
  await broadcastPollUpdate(pollId, updates);
};
```

---

## 5. Data Corruption & Integrity

| ID | Scenario | Impact | Mitigation |
|----|----------|--------|------------|
| DI-001 | Invalid JSON in JSONB field | Query crash | Schema validation before save |
| DI-002 | Circular reference in branching | Infinite loop | Cycle detection on save |
| DI-003 | Negative vote counts | Display error | Check constraint, abs() fallback |
| DI-004 | Timezone mismatch | Wrong scheduled time | Store UTC, convert on display |
| DI-005 | Float precision in percentages | Rounding errors | Use Decimal, round on display |
| DI-006 | UTF-8 encoding issues | Display garbage | Normalize on input, validate |

### DI-002: Branching Cycle Detection
```typescript
const validateBranchingLogic = (questions: Question[]): ValidationResult => {
  const graph = new Map<string, string[]>();

  // Build adjacency list
  for (const q of questions) {
    const targets: string[] = [];
    for (const option of q.options) {
      if (option.skipTo) targets.push(option.skipTo);
    }
    graph.set(q.id, targets);
  }

  // DFS cycle detection
  const visited = new Set<string>();
  const recStack = new Set<string>();

  const hasCycle = (node: string): boolean => {
    visited.add(node);
    recStack.add(node);

    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  };

  for (const q of questions) {
    if (!visited.has(q.id) && hasCycle(q.id)) {
      return { valid: false, error: 'CIRCULAR_BRANCHING' };
    }
  }

  return { valid: true };
};
```

---

## 6. Security Attack Vectors

| ID | Attack | Impact | Mitigation |
|----|--------|--------|------------|
| SEC-001 | Vote replay attack | Inflated results | Request signing, nonce |
| SEC-002 | IDOR on poll results | Data leak | Owner/permission check |
| SEC-003 | XSS in poll options | Account takeover | Strict sanitization |
| SEC-004 | Brute force live codes | Unauthorized access | Rate limit, exponential lockout |
| SEC-005 | Email enumeration | Privacy breach | Consistent timing responses |
| SEC-006 | SSRF via image URL | Internal network access | URL allowlist, proxy validation |
| SEC-007 | JWT theft via XSS | Session hijack | HttpOnly cookies, short expiry |

### SEC-001: Vote Replay Prevention
```typescript
const signedVoteRequest = async (vote: VoteData) => {
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const payload = `${vote.pollId}:${vote.optionId}:${nonce}:${timestamp}`;

  // Client signs with session key
  const signature = await crypto.subtle.sign(
    'HMAC',
    sessionKey,
    new TextEncoder().encode(payload)
  );

  return {
    ...vote,
    nonce,
    timestamp,
    signature: btoa(String.fromCharCode(...new Uint8Array(signature)))
  };
};

// Server-side validation
const validateVoteRequest = async (req: SignedVoteRequest) => {
  // 1. Check timestamp freshness (5 min window)
  if (Date.now() - req.timestamp > 5 * 60 * 1000) {
    throw new BadRequestError('REQUEST_EXPIRED');
  }

  // 2. Check nonce uniqueness
  const nonceUsed = await redis.get(`nonce:${req.nonce}`);
  if (nonceUsed) {
    throw new BadRequestError('NONCE_REUSED');
  }

  // 3. Verify signature
  const isValid = await verifySignature(req);
  if (!isValid) {
    throw new BadRequestError('INVALID_SIGNATURE');
  }

  // 4. Mark nonce as used
  await redis.set(`nonce:${req.nonce}`, '1', 'EX', 600);
};
```

### SEC-004: Live Code Brute Force Protection
```typescript
const validateLiveCode = async (code: string, ip: string) => {
  const rateLimitKey = `live_code_attempts:${ip}`;
  const attempts = await redis.incr(rateLimitKey);

  if (attempts === 1) {
    await redis.expire(rateLimitKey, 3600); // 1 hour window
  }

  // Exponential backoff
  if (attempts > 5) {
    const delay = Math.min(Math.pow(2, attempts - 5) * 1000, 60000);
    throw new TooManyRequestsError('RATE_LIMITED', {
      retryAfter: delay / 1000,
      message: `Çok fazla deneme. ${delay / 1000} saniye bekleyin.`
    });
  }

  const poll = await db.livePoll.findFirst({
    where: { code: code.toUpperCase(), status: 'active' }
  });

  if (!poll) {
    // Don't reveal if code exists but expired vs never existed
    throw new NotFoundError('INVALID_CODE');
  }

  // Reset on success
  await redis.del(rateLimitKey);
  return poll;
};
```

---

## 7. Network & Offline Scenarios

| ID | Scenario | Impact | Mitigation |
|----|----------|--------|------------|
| NET-001 | Offline survey completion | Data lost | IndexedDB queue, sync on reconnect |
| NET-002 | Live poll disconnect | Miss updates | Reconnect + state reconciliation |
| NET-003 | Slow image upload | UX frustration | Progressive upload, compression |
| NET-004 | API timeout mid-transaction | Inconsistent state | Idempotent operations, retry |

### NET-001: Offline Survey Queue
```typescript
class OfflineSurveyQueue {
  private db: IDBDatabase;

  async queueResponse(response: SurveyResponse) {
    await this.db.put('pendingResponses', {
      id: crypto.randomUUID(),
      response,
      createdAt: new Date(),
      attempts: 0
    });
  }

  async syncPending() {
    const pending = await this.db.getAll('pendingResponses');

    for (const item of pending) {
      try {
        await api.submitSurveyResponse(item.response);
        await this.db.delete('pendingResponses', item.id);
      } catch (error) {
        if (error.status === 409) {
          // Already submitted, remove from queue
          await this.db.delete('pendingResponses', item.id);
        } else {
          // Increment attempts, retry later
          await this.db.put('pendingResponses', {
            ...item,
            attempts: item.attempts + 1,
            lastError: error.message
          });
        }
      }
    }
  }
}

// Service worker background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'survey-response-sync') {
    event.waitUntil(offlineQueue.syncPending());
  }
});
```

---

## 8. Business Logic Combinations

| ID | Combination | Edge Case | Handling |
|----|-------------|-----------|----------|
| BL-001 | Premium expires + active poll | Poll continues? | Yes, read-only until renewed |
| BL-002 | Org poll + anonymous voting | Who owns data? | Org owns aggregate, no PII |
| BL-003 | Live poll + skip logic | Skip in real-time? | No skip logic in live polls |
| BL-004 | Test mode + PULSE analytics | Track test data? | Separate test analytics |
| BL-005 | Scheduled poll + creator deleted | Orphaned schedule | Cancel or assign to org |
| BL-006 | Multi-language + RTL | Layout breaks | CSS logical properties |

### BL-001: Premium Expiry Handling
```typescript
const handlePremiumExpiry = async (userId: string) => {
  // 1. Get all active premium content
  const premiumContent = await db.poll.findMany({
    where: {
      creatorId: userId,
      OR: [
        { questionCount: { gt: FREE_LIMITS.questionsPerPoll } },
        { hasAdvancedLogic: true },
        { hasBranching: true }
      ],
      status: { in: ['active', 'scheduled'] }
    }
  });

  // 2. Don't stop active polls, but mark as premium-locked
  for (const poll of premiumContent) {
    if (poll.status === 'active') {
      // Active poll continues but can't be edited
      await db.poll.update({
        where: { id: poll.id },
        data: { premiumLocked: true, editLocked: true }
      });
    } else if (poll.status === 'scheduled') {
      // Scheduled poll - notify user
      await notifyUser(userId, 'SCHEDULED_POLL_NEEDS_PREMIUM', { pollId: poll.id });
    }
  }

  // 3. 30-day grace period before archiving
  await scheduleJob('archive_premium_content', {
    userId,
    contentIds: premiumContent.map(p => p.id),
    executeAt: addDays(new Date(), 30)
  });
};
```

---

## 9. Platform-Specific Issues

### Safari/iOS
| Issue | Impact | Mitigation |
|-------|--------|------------|
| IndexedDB in private mode | Storage fails | Detect + fallback to memory |
| PWA limitations | No background sync | Foreground sync on visibility |
| Touch delay | Slow response | touch-action: manipulation |

### Mobile
| Issue | Impact | Mitigation |
|-------|--------|------------|
| Keyboard resize | Layout shift | visualViewport API |
| Fat finger on small buttons | Mis-taps | Min 44px touch targets |
| Data saver mode | Images blocked | Lazy load, low-res fallback |

### Legacy Browsers
| Issue | Impact | Mitigation |
|-------|--------|------------|
| No ES6 support | JS error | Transpile, polyfills |
| No CSS Grid | Layout broken | Flexbox fallback |
| No WebSocket | No real-time | Long polling fallback |

---

## 10. Incident Response Playbooks

### Playbook: Database Connection Exhaustion
```
SYMPTOMS:
- 500 errors spike
- "connection pool exhausted" in logs
- Response times > 30s

IMMEDIATE (0-5 min):
1. Scale up DB connections: ALTER SYSTEM SET max_connections = 500
2. Kill long-running queries: SELECT pg_terminate_backend(pid)
3. Enable emergency rate limiting

INVESTIGATION (5-15 min):
1. Check for connection leaks in recent deploys
2. Review slow query log
3. Check for viral content causing traffic spike

RESOLUTION:
1. Fix connection leak / optimize query
2. Deploy fix with feature flag
3. Gradually restore traffic

POST-MORTEM:
- Add connection pool monitoring alert
- Add query timeout enforcement
- Review connection pool sizing
```

### Playbook: Third-Party Service Outage
```
SYMPTOMS:
- Specific feature failures
- External API timeout errors
- User complaints about specific flow

IMMEDIATE:
1. Check service status page
2. Enable fallback mode if available
3. Update status page with incident

COMMUNICATION:
- In-app banner: "X özelliği geçici olarak kullanılamıyor"
- Twitter/social: Acknowledge issue
- Support macro: Prepared response

RESOLUTION:
1. Monitor service recovery
2. Run reconciliation jobs if needed
3. Clear status banner
```

---

## Cross-Reference Index

| Bible Section | Related Failure Modes |
|---------------|----------------------|
| bible-002 (Data Models) | DI-001, DI-002, DI-003 |
| bible-003 (API Endpoints) | SEC-002, SEC-004, RC-001 |
| bible-005 (Stripe) | TP-002, BL-001 |
| bible-007 (Real-time) | SC-002, TP-007, NET-002 |
| bible-008 (Analytics) | SC-003, BL-004 |
| bible-010 (Notifications) | SC-004, TP-006 |
| bible-012 (Live Polls) | SC-001, SEC-004, NET-002 |
| bible-014 (Organizations) | UB-006, RC-005 |
| bible-016 (Moderation) | SEC-003, UB-007 |
| bible-019 (Search) | SC-003 |
| bible-021 (Caching) | SC-005 |
| bible-023 (Security) | SEC-001 to SEC-007 |
