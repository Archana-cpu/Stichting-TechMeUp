# API Flows Reference
> Source: bible-api-flows.md

---

# ══════════════════════════════════════════════════════════════════════════════
# USER ROLES & PERMISSIONS MATRIX
# ══════════════════════════════════════════════════════════════════════════════

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ROLE HIERARCHY                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐                                                               │
│  │ SUPER_ADMIN │ ← Platform owners, full system access                         │
│  └──────┬──────┘                                                               │
│         │                                                                       │
│  ┌──────▼──────┐                                                               │
│  │    ADMIN    │ ← Platform administrators                                      │
│  └──────┬──────┘                                                               │
│         │                                                                       │
│  ┌──────▼──────┐                                                               │
│  │  MODERATOR  │ ← Content moderation                                          │
│  └──────┬──────┘                                                               │
│         │                                                                       │
│  ┌──────▼──────────────────────────────────────────────┐                       │
│  │                   REGULAR USERS                      │                       │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐       │                       │
│  │  │   FREE    │  │   PLUS    │  │  PREMIUM  │       │                       │
│  │  │   User    │  │   User    │  │   User    │       │                       │
│  │  └───────────┘  └───────────┘  └───────────┘       │                       │
│  └──────────────────────────────────────────────────────┘                       │
│         │                                                                       │
│  ┌──────▼──────────────────────────────────────────────┐                       │
│  │              ORGANIZATION USERS                       │                       │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐       │                       │
│  │  │   OWNER   │  │   ADMIN   │  │  MEMBER   │       │                       │
│  │  └───────────┘  └───────────┘  └───────────┘       │                       │
│  └──────────────────────────────────────────────────────┘                       │
│         │                                                                       │
│  ┌──────▼──────┐                                                               │
│  │    GUEST    │ ← Anonymous users (very limited)                              │
│  └─────────────┘                                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Verification Level × Feature Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│      VERIFICATION LEVEL + SUBSCRIPTION TIER = COMBINED PERMISSIONS              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [!] IMPORTANT: Both systems are INDEPENDENT and ADDITIVE                       │
│                                                                                 │
│  - Verification Level: Trust/identity verification (security)                   │
│  - Subscription Tier: Feature access (monetization)                             │
│                                                                                 │
│  Example Combinations:                                                          │
│  ───────────────────────────────────────────────────────────────────────────    │
│  Level 1 + Free     = Basic polls, limited features                            │
│  Level 1 + Premium  = Extended polls, pre-tests, but no research surveys       │
│  Level 3 + Free     = Research surveys eligible, but limited poll features     │
│  Level 3 + Premium  = Full access to all individual features                   │
│                                                                                 │
│  [RULE] For any action, BOTH requirements must be met:                          │
│  - Minimum verification level (for trust)                                       │
│  - Required subscription tier (for feature access)                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# GUEST USER FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## What Guests Can Do

Guests (unauthenticated users) have very limited access:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GUEST USER CAPABILITIES                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ALLOWED                                                                        │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ View public poll questions and options                                       │
│  ✓ View public poll results (after voting or when results are public)          │
│  ✓ View public personality tests                                               │
│  ✓ View user profiles (public portions only)                                   │
│  ✓ Browse feed (read-only)                                                     │
│  ✓ Search content and users                                                    │
│  ✓ Join live polls via code (vote as anonymous)                                │
│                                                                                 │
│  NOT ALLOWED                                                                    │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✗ Vote on polls (except live polls with anonymous allowed)                    │
│  ✗ Participate in surveys                                                      │
│  ✗ Take personality tests (requires account for results)                       │
│  ✗ Comment on any content                                                      │
│  ✗ Follow users                                                                │
│  ✗ Create any content                                                          │
│  ✗ Access discussions                                                          │
│  ✗ Receive notifications                                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Guest → Browse Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GUEST BROWSE FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. GET /feed                                                                   │
│     Response: List of public content (limited, no personalization)             │
│                                                                                 │
│  2. GET /polls/:id                                                              │
│     Response: Poll details, options, total votes                               │
│     [!] Cannot see detailed demographics or breakdowns                         │
│                                                                                 │
│  3. Attempting protected action:                                                │
│     POST /polls/:id/vote                                                        │
│     Response: 401 Unauthorized + login prompt                                  │
│     {                                                                           │
│       "success": false,                                                        │
│       "error": {                                                               │
│         "code": "UNAUTHORIZED",                                                │
│         "message": "Authentication required to vote"                           │
│       }                                                                         │
│     }                                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Guest → Join Live Poll Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       GUEST JOIN LIVE POLL FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Condition: Poll creator has enabled anonymous voting                          │
│                                                                                 │
│  1. POST /live/sessions/:code/join                                              │
│     Body: { "anonymous": true }                                                │
│     Response: {                                                                 │
│       "sessionToken": "temp_token_xyz",                                        │
│       "participantId": "anon_abc123"                                           │
│     }                                                                           │
│                                                                                 │
│  2. WebSocket: Connect with sessionToken                                        │
│     Message: { "type": "join_session", "token": "temp_token_xyz" }             │
│                                                                                 │
│  3. Server → Client: session_state                                              │
│     { "status": "active", "currentQuestion": {...}, "canVote": true }          │
│                                                                                 │
│  4. POST /live/:id/vote                                                         │
│     Headers: { "X-Session-Token": "temp_token_xyz" }                           │
│     Body: { "optionId": "opt_123" }                                            │
│     Response: { "success": true }                                              │
│                                                                                 │
│  [NOTE] Anonymous votes have weight: 0.5x (reduced influence)                  │
│  [NOTE] Device fingerprint tracked to prevent multiple votes                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# UNVERIFIED USER FLOWS (Level 0)
# ══════════════════════════════════════════════════════════════════════════════

## Level 0 User Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     UNVERIFIED USER (Level 0) CAPABILITIES                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  These users have email only (unverified or OAuth without phone)               │
│                                                                                 │
│  ALLOWED                                                                        │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ All guest capabilities                                                      │
│  ✓ Vote on public polls (weight: 0.5x)                                         │
│  ✓ Follow users                                                                │
│  ✓ Vote on comments                                                            │
│  ✓ Report content                                                              │
│  ✓ Basic profile setup                                                         │
│                                                                                 │
│  NOT ALLOWED                                                                    │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✗ Create any content (polls, tests)                                           │
│  ✗ Post comments                                                               │
│  ✗ Participate in surveys                                                      │
│  ✗ Take tests (need Level 1 for results saving)                               │
│  ✗ Access discussions                                                          │
│                                                                                 │
│  [PROMPT] Constantly encouraged to verify phone number                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# BASIC USER FLOWS (Level 1, Free Tier)
# ══════════════════════════════════════════════════════════════════════════════

## Level 1 Free User Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    BASIC USER (Level 1, Free) CAPABILITIES                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Phone verified users with Free subscription                                   │
│                                                                                 │
│  FULL ACCESS                                                                    │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ Vote on all public polls (standard weight 1.0x)                             │
│  ✓ Take personality tests                                                      │
│  ✓ Participate in public surveys                                               │
│  ✓ Post comments and replies                                                   │
│  ✓ Access discussions (as participant)                                         │
│  ✓ Create Quick Polls (max 3/day)                                              │
│  ✓ Full profile customization                                                  │
│  ✓ Follow/unfollow users                                                       │
│  ✓ Receive notifications                                                       │
│                                                                                 │
│  LIMITED                                                                        │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ⚠ Quick Polls only (4 options max, no pre-test)                               │
│  ⚠ Limited analytics on own polls                                              │
│  ⚠ Cannot create Extended/Live polls                                           │
│  ⚠ No ad-free experience                                                       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Create Quick Poll Flow (Free User)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     CREATE QUICK POLL FLOW (Free Tier)                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. POST /polls                                                                 │
│     Body: {                                                                     │
│       "type": "QUICK",                                                         │
│       "question": "Which feature should we build next?",                       │
│       "options": [                                                             │
│         { "text": "Dark mode" },                                               │
│         { "text": "Multi-language" },                                          │
│         { "text": "Export to PDF" }                                            │
│       ],                                                                        │
│       "settings": {                                                            │
│         "duration": 1440,                                                      │
│         "visibility": "PUBLIC",                                                │
│         "randomizeOptions": true,                                              │
│         "showResultsAfterVote": true                                           │
│       }                                                                         │
│     }                                                                           │
│                                                                                 │
│  2. Server validates:                                                           │
│     - User verification level >= 1 ✓                                           │
│     - User has poll creation quota remaining ✓                                 │
│     - Poll type matches tier (QUICK for Free) ✓                                │
│     - Options count <= 4 (Free tier limit) ✓                                   │
│                                                                                 │
│  3. Response:                                                                   │
│     {                                                                           │
│       "success": true,                                                         │
│       "data": {                                                                │
│         "id": "poll_xyz123",                                                   │
│         "status": "ACTIVE",                                                    │
│         "publishedAt": "2026-01-23T10:00:00Z",                                │
│         "closesAt": "2026-01-24T10:00:00Z",                                   │
│         "shareUrl": "https://voxpoll.com/p/xyz123"                            │
│       }                                                                         │
│     }                                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# PLUS USER FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## Plus User Additional Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PLUS USER CAPABILITIES                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Everything in Free, plus:                                                      │
│                                                                                 │
│  NEW FEATURES                                                                   │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ View PULSE stats without voting (unique to Plus)                            │
│  ✓ Ad-free experience                                                          │
│  ✓ Extended analytics on own polls                                             │
│  ✓ Priority support                                                            │
│                                                                                 │
│  INCREASED LIMITS                                                               │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ 10 Quick Polls per day (vs 3)                                               │
│  ✓ 6 options per poll (vs 4)                                                   │
│                                                                                 │
│  STILL LOCKED (Premium only)                                                    │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✗ Extended Polls with pre-test                                                │
│  ✗ Live Polls                                                                  │
│  ✗ Target audience selection                                                   │
│  ✗ Create personality tests                                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## View PULSE Without Voting Flow (Plus Only)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   VIEW PULSE WITHOUT VOTING FLOW (Plus)                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  This is a UNIQUE Plus tier feature - see results without participating        │
│                                                                                 │
│  1. GET /polls/:id/results?mode=view-only                                       │
│                                                                                 │
│  2. Server validates:                                                           │
│     - User subscription tier == PLUS or PREMIUM ✓                              │
│     - Poll visibility allows result viewing ✓                                  │
│     - Poll has minimum responses (10) ✓                                        │
│                                                                                 │
│  3. Response:                                                                   │
│     {                                                                           │
│       "success": true,                                                         │
│       "data": {                                                                │
│         "viewMode": "observer",                                                │
│         "canVote": true,                                                       │
│         "results": {                                                           │
│           "options": [                                                         │
│             { "id": "opt_1", "text": "Option A", "percentage": 42.5 },         │
│             { "id": "opt_2", "text": "Option B", "percentage": 57.5 }          │
│           ],                                                                    │
│           "totalVotes": 1247,                                                  │
│           "reliabilityScore": 78                                               │
│         }                                                                       │
│       }                                                                         │
│     }                                                                           │
│                                                                                 │
│  [NOTE] User can still vote after viewing - their view is recorded             │
│  [NOTE] Free users see "Upgrade to Plus to view results without voting"        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# PREMIUM USER FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## Premium User Full Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PREMIUM USER CAPABILITIES                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Everything in Plus, plus:                                                      │
│                                                                                 │
│  PREMIUM-ONLY FEATURES                                                          │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ Extended Polls (multi-option, media, targeting, pre-test)                   │
│  ✓ Live Polls (real-time interactive polling)                                  │
│  ✓ Target audience selection (demographics, interests)                          │
│  ✓ Pre-test screening questions                                                │
│  ✓ Create personality tests                                                    │
│  ✓ Full analytics with demographic breakdowns                                  │
│  ✓ Export data (CSV, XLSX)                                                     │
│  ✓ Priority in feed algorithm                                                  │
│                                                                                 │
│  MAXIMUM LIMITS                                                                 │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ Unlimited polls per day                                                     │
│  ✓ 10 options per poll                                                         │
│  ✓ Unlimited personality tests                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Create Extended Poll with Pre-test Flow (Premium)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                CREATE EXTENDED POLL WITH PRE-TEST (Premium)                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. POST /polls                                                                 │
│     Body: {                                                                     │
│       "type": "EXTENDED",                                                      │
│       "question": "Should remote work be permanent?",                          │
│       "description": "We're gathering opinions on the future of work...",      │
│       "options": [                                                             │
│         { "text": "Yes, fully remote", "imageUrl": "..." },                    │
│         { "text": "Hybrid model", "imageUrl": "..." },                         │
│         { "text": "Return to office", "imageUrl": "..." },                     │
│         { "text": "Depends on role", "imageUrl": "..." }                       │
│       ],                                                                        │
│       "settings": {                                                            │
│         "duration": 10080,                                                     │
│         "visibility": "PUBLIC",                                                │
│         "randomizeOptions": true,                                              │
│         "showResultsAfterVote": true,                                          │
│         "allowRetractVote": false                                              │
│       },                                                                        │
│       "preTest": {                                                             │
│         "enabled": true,                                                       │
│         "questions": [                                                         │
│           {                                                                     │
│             "type": "DEMOGRAPHIC",                                             │
│             "field": "employment_status",                                      │
│             "required": true,                                                  │
│             "options": ["Employed", "Self-employed", "Unemployed", "Student"]  │
│           },                                                                    │
│           {                                                                     │
│             "type": "SCREENING",                                               │
│             "question": "Do you currently work in a knowledge worker role?",  │
│             "options": ["Yes", "No"],                                          │
│             "disqualifyOn": ["No"]                                             │
│           }                                                                     │
│         ]                                                                       │
│       },                                                                        │
│       "targetAudience": {                                                      │
│         "minAge": 18,                                                          │
│         "maxAge": 65,                                                          │
│         "countries": ["TR", "US", "GB", "DE"]                                  │
│       }                                                                         │
│     }                                                                           │
│                                                                                 │
│  2. Server validates:                                                           │
│     - User subscription tier == PREMIUM ✓                                      │
│     - User verification level >= 1 ✓                                           │
│     - Pre-test config valid ✓                                                  │
│     - Target audience valid ✓                                                  │
│                                                                                 │
│  3. Response:                                                                   │
│     {                                                                           │
│       "success": true,                                                         │
│       "data": {                                                                │
│         "id": "poll_premium_123",                                              │
│         "status": "ACTIVE",                                                    │
│         "hasPreTest": true,                                                    │
│         "estimatedAudience": 125000                                            │
│       }                                                                         │
│     }                                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Create Live Poll Flow (Premium)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CREATE LIVE POLL FLOW (Premium)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. POST /polls                                                                 │
│     Body: {                                                                     │
│       "type": "LIVE",                                                          │
│       "question": "Which topic should we discuss next?",                       │
│       "options": [                                                             │
│         { "text": "AI and Jobs" },                                             │
│         { "text": "Climate Policy" },                                          │
│         { "text": "Education Reform" }                                         │
│       ],                                                                        │
│       "liveSettings": {                                                        │
│         "duration": 15,                                                        │
│         "allowAnonymous": true,                                                │
│         "showLiveCount": true,                                                 │
│         "autoClose": true                                                      │
│       }                                                                         │
│     }                                                                           │
│                                                                                 │
│  2. Response: Poll created with joinCode                                        │
│     {                                                                           │
│       "data": {                                                                │
│         "id": "poll_live_789",                                                 │
│         "joinCode": "ABCD1234",                                                │
│         "status": "READY"                                                      │
│       }                                                                         │
│     }                                                                           │
│                                                                                 │
│  3. POST /live/:id/start                                                        │
│     Response: { "websocketUrl": "wss://live.voxpoll.com/poll_live_789" }       │
│                                                                                 │
│  4. WebSocket: Host connects and receives real-time updates                    │
│     Server → Host: vote_update, participant_count every second                 │
│                                                                                 │
│  5. POST /live/:id/end                                                          │
│     Response: Final results with breakdown                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# ORGANIZATION USER FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## Organization Member Capabilities by Role

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION ROLE CAPABILITIES                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  OWNER                                                                          │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ All admin capabilities                                                      │
│  ✓ Delete organization                                                         │
│  ✓ Transfer ownership                                                          │
│  ✓ Manage billing and subscription                                             │
│                                                                                 │
│  ADMIN                                                                          │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ All member capabilities                                                     │
│  ✓ Manage members (invite, remove, change roles)                               │
│  ✓ Configure organization settings                                             │
│  ✓ Configure SSO (Enterprise tier)                                             │
│  ✓ View audit logs                                                             │
│  ✓ Export organization data                                                    │
│                                                                                 │
│  MEMBER                                                                         │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ All viewer capabilities                                                     │
│  ✓ Create surveys on behalf of organization                                    │
│  ✓ Respond to organization surveys                                             │
│  ✓ Access organization analytics                                               │
│                                                                                 │
│  VIEWER                                                                         │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ View organization dashboard                                                 │
│  ✓ View organization surveys                                                   │
│  ✓ Participate in organization surveys                                         │
│  ✗ Cannot create or modify anything                                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Organization Survey Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    ORG ADMIN CREATE SURVEY FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. POST /organizations/:slug/surveys                                           │
│     Headers: { "Authorization": "Bearer <token>" }                             │
│     Body: {                                                                     │
│       "title": "Q1 Employee Satisfaction Survey",                              │
│       "description": "Annual satisfaction measurement",                        │
│       "visibility": "ORGANIZATION",                                            │
│       "settings": {                                                            │
│         "anonymousResponses": true,                                            │
│         "showResultsToRespondents": false,                                     │
│         "requireCompletion": true                                              │
│       },                                                                        │
│       "questions": [                                                           │
│         {                                                                       │
│           "type": "SCALE",                                                     │
│           "question": "How satisfied are you with your role?",                 │
│           "scale": { "min": 1, "max": 5 }                                      │
│         },                                                                       │
│         {                                                                       │
│           "type": "TEXT",                                                      │
│           "question": "What improvements would you suggest?"                   │
│         }                                                                       │
│       ]                                                                         │
│     }                                                                           │
│                                                                                 │
│  2. Server validates:                                                           │
│     - User is org admin or owner ✓                                             │
│     - Organization tier allows surveys ✓                                       │
│     - Survey quota not exceeded ✓                                              │
│                                                                                 │
│  3. Response:                                                                   │
│     {                                                                           │
│       "data": {                                                                │
│         "id": "survey_org_456",                                                │
│         "status": "DRAFT",                                                     │
│         "distributionUrl": "https://voxpoll.com/s/org/abc123"                 │
│       }                                                                         │
│     }                                                                           │
│                                                                                 │
│  4. POST /surveys/:id/publish                                                   │
│     Optionally: POST /surveys/:id/invite { "sendToAllMembers": true }          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# MODERATOR FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## Moderator Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MODERATOR CAPABILITIES                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Platform moderators handle content moderation                                  │
│                                                                                 │
│  CAN DO                                                                         │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ View and action reports                                                     │
│  ✓ Hide/unhide content                                                         │
│  ✓ Remove comments                                                             │
│  ✓ Edit comments (inappropriate content removal)                               │
│  ✓ Issue warnings to users                                                     │
│  ✓ View user report history                                                    │
│                                                                                 │
│  CANNOT DO                                                                      │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✗ Suspend or ban users (Admin only)                                           │
│  ✗ Delete content permanently (Admin only)                                     │
│  ✗ Access user personal data                                                   │
│  ✗ Modify user accounts                                                        │
│  ✗ Access platform analytics                                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Content Moderation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       CONTENT MODERATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. GET /admin/reports?status=pending&type=content                              │
│     Response: List of pending content reports                                  │
│                                                                                 │
│  2. GET /admin/reports/:id                                                      │
│     Response: Full report details with content context                         │
│                                                                                 │
│  3a. If content violates guidelines:                                           │
│      POST /admin/polls/:id/hide                                                │
│      Body: { "reason": "Community guidelines violation: hate speech" }         │
│                                                                                 │
│  3b. If report invalid:                                                        │
│      PUT /admin/reports/:id                                                    │
│      Body: { "status": "dismissed", "note": "No violation found" }             │
│                                                                                 │
│  4. Optionally issue warning:                                                   │
│     POST /admin/users/:id/warn                                                 │
│     Body: {                                                                     │
│       "type": "GUIDELINE_VIOLATION",                                           │
│       "message": "Your poll was hidden due to...",                             │
│       "relatedContentId": "poll_xyz"                                           │
│     }                                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# SUPER ADMIN FLOWS
# ══════════════════════════════════════════════════════════════════════════════

## Super Admin Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       SUPER ADMIN CAPABILITIES                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Platform owners with full system access                                        │
│                                                                                 │
│  EXCLUSIVE CAPABILITIES                                                         │
│  ─────────────────────────────────────────────────────────────────────────      │
│  ✓ All Admin and Moderator capabilities                                        │
│  ✓ GDPR hard delete (permanent data removal)                                   │
│  ✓ Manage admin accounts                                                       │
│  ✓ Configure system settings                                                   │
│  ✓ Manage feature flags                                                        │
│  ✓ Access platform-wide analytics                                              │
│  ✓ Revenue and financial reporting                                             │
│  ✓ Manage organizations directly                                               │
│  ✓ Override any permission or limit                                            │
│                                                                                 │
│  [AUDIT] All Super Admin actions are logged with full context                  │
│  [2FA] Super Admin accounts REQUIRE 2FA                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# ══════════════════════════════════════════════════════════════════════════════
# COMMON AUTHORIZATION PATTERNS
# ══════════════════════════════════════════════════════════════════════════════

## Authorization Check Order

```typescript
// ═══════════════════════════════════════════════════════════════════════════
// AUTHORIZATION CHECK ORDER
// ═══════════════════════════════════════════════════════════════════════════

async function authorizeRequest(ctx, requirements) {
  // 1. Authentication (is user logged in?)
  const user = await getAuthenticatedUser(ctx)
  if (!user && requirements.requiresAuth) {
    throw new UnauthorizedError("Authentication required")
  }

  // 2. Account Status (is account active?)
  if (user && user.status !== "ACTIVE") {
    throw new ForbiddenError(`Account is ${user.status.toLowerCase()}`)
  }

  // 3. Verification Level (does user have required trust level?)
  if (user && requirements.minVerificationLevel) {
    if (user.verificationLevel < requirements.minVerificationLevel) {
      throw new InsufficientVerificationError(
        `Requires verification level ${requirements.minVerificationLevel}`
      )
    }
  }

  // 4. Subscription Tier (does user have required features?)
  if (user && requirements.minSubscriptionTier) {
    if (!hasRequiredTier(user.subscriptionTier, requirements.minSubscriptionTier)) {
      throw new SubscriptionRequiredError(
        `Requires ${requirements.minSubscriptionTier} subscription`
      )
    }
  }

  // 5. Organization Role (does user have org permissions?)
  if (requirements.orgSlug && requirements.minOrgRole) {
    const member = await getOrgMembership(user.id, requirements.orgSlug)
    if (!member || !hasOrgRole(member.role, requirements.minOrgRole)) {
      throw new ForbiddenError("Insufficient organization permissions")
    }
  }

  // 6. Resource Ownership (does user own the resource?)
  if (requirements.resourceOwnership) {
    const resource = await getResource(requirements.resourceType, requirements.resourceId)
    if (resource.creatorId !== user.id) {
      throw new ForbiddenError("You don't own this resource")
    }
  }

  // 7. Rate Limiting (has user exceeded limits?)
  const rateLimitKey = getRateLimitKey(user, requirements.action)
  if (await isRateLimited(rateLimitKey)) {
    throw new RateLimitedError("Too many requests")
  }
}
```

---

*Source: bible-api-flows.md*
