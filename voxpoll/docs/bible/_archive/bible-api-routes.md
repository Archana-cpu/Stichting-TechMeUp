# VoxPoll API Route Map

> **Version:** 2.0.0
> **Last Updated:** 2026-01-22
> **Base URL:** `/api/v1`
> **Reference:** BIBLE-014, BIBLE-022, BIBLE-030

---

## Table of Contents

1. [Health & Status](#1-health--status)
2. [Authentication](#2-authentication)
3. [Session Management](#3-session-management)
4. [Verification](#4-verification)
5. [Users](#5-users)
6. [Social & Messaging](#6-social--messaging)
7. [Polls](#7-polls)
8. [Live Polls](#8-live-polls)
9. [Surveys](#9-surveys)
10. [Tests (Personality & Quiz)](#10-tests-personality--quiz)
11. [Comments & Discussions](#11-comments--discussions)
12. [Categories & Tags](#12-categories--tags)
13. [Feed & Discovery](#13-feed--discovery)
14. [Search](#14-search)
15. [Notifications](#15-notifications)
16. [Reports](#16-reports)
17. [Organizations](#17-organizations)
18. [Analytics](#18-analytics)
19. [Admin & Moderation](#19-admin--moderation)
20. [WebSocket Events](#20-websocket-events)

---

## Conventions

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100, "hasMore": true }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

### Authentication Symbols

- 🔓 Public - No authentication required
- 🔐 Auth Required - Bearer token in `Authorization` header
- 👤 Optional Auth - Enhanced response if authenticated
- 🛡️ Admin - Requires MODERATOR/ADMIN/SUPER_ADMIN role
- 🏢 Org - Requires organization membership

### Verification Level Requirements

| Level | Name | Requirements |
|-------|------|--------------|
| 0 | Unverified | Email verified only |
| 1 | Basic | Phone verified |
| 2 | Enhanced | 2FA + Selfie OR Organization SSO |
| 3 | Identity | e-Devlet OR ID Document verified |
| 4 | Full | Biometric + Address + Carrier verification |

### Rate Limits (P-058)

| Category | Anonymous | Authenticated | Plus | Premium |
|----------|-----------|---------------|------|---------|
| General API | 100/min | 300/min | 500/min | 1000/min |
| Login | 5/15min | - | - | - |
| Register | 3/hour | - | - | - |
| Create Poll | - | 3/day | 10/day | Unlimited |
| Vote | - | 100/hour | 100/hour | 100/hour |
| Search | 10/min | 30/min | 60/min | 120/min |
| Comments | - | 50/hour | 100/hour | 200/hour |
| DM (non-friends) | - | 5/day | 25/day | 100/day |

---

## 1. Health & Status

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | 🔓 | Basic health check |
| GET | `/health/live` | 🔓 | Kubernetes liveness probe |
| GET | `/health/ready` | 🔓 | Kubernetes readiness probe (checks DB, Redis) |
| GET | `/health/startup` | 🔓 | Kubernetes startup probe |
| GET | `/health/deep` | 🔓 | Detailed health with metrics |

### Implementation Status
- ✅ All implemented

---

## 2. Authentication

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/auth/register` | 🔓 | 3/hour | Create new account |
| POST | `/auth/login` | 🔓 | 5/15min | Login with email/password |
| POST | `/auth/logout` | 🔐 | - | Invalidate current session |
| POST | `/auth/logout-all` | 🔐 | - | Invalidate ALL sessions |
| GET | `/auth/me` | 🔐 | - | Get current user |
| POST | `/auth/refresh` | 🔓 | 10/hour | Refresh access token |
| POST | `/auth/forgot-password` | 🔓 | 3/hour | Request password reset |
| POST | `/auth/reset-password` | 🔓 | 3/hour | Reset password with token |
| POST | `/auth/verify-email` | 🔓 | 5/hour | Verify email address |
| POST | `/auth/resend-verification` | 🔐 | 3/hour | Resend verification email |
| POST | `/auth/change-password` | 🔐 | 3/hour | Change password (requires current) |
| POST | `/auth/change-email` | 🔐 | 1/day | Request email change |
| POST | `/auth/confirm-email-change` | 🔓 | - | Confirm email change with token |

### OAuth Endpoints (P-049: ONLY Google, Apple, e-Devlet)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/auth/oauth/google/initiate` | 🔓 | 10/hour | Start Google OAuth flow |
| GET | `/auth/oauth/google/callback` | 🔓 | - | Google OAuth callback |
| GET | `/auth/oauth/apple/initiate` | 🔓 | 10/hour | Start Apple OAuth flow |
| GET | `/auth/oauth/apple/callback` | 🔓 | - | Apple OAuth callback |
| POST | `/auth/oauth/link` | 🔐 | 3/hour | Link OAuth provider to account |
| DELETE | `/auth/oauth/:provider` | 🔐 | - | Unlink OAuth provider |

### SSO Endpoints (Organizations)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/sso/initiate` | 🔓 | Start SSO flow for organization |
| POST | `/auth/sso/callback` | 🔓 | SSO callback (SAML/OIDC) |

### Implementation Status
- ✅ `POST /auth/register` - Implemented
- ✅ `POST /auth/login` - Implemented
- ✅ `POST /auth/logout` - Implemented
- ✅ `GET /auth/me` - Implemented
- ⏳ Others - Planned

---

## 3. Session Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/auth/sessions` | 🔐 | List all active sessions |
| GET | `/auth/sessions/:id` | 🔐 | Get session details |
| DELETE | `/auth/sessions/:id` | 🔐 | Revoke specific session |

### Session Response Fields
```json
{
  "id": "sess_xxx",
  "device": "Chrome on Windows",
  "ipAddress": "192.168.1.1",
  "location": "Istanbul, Turkey",
  "lastActiveAt": "2026-01-22T10:00:00Z",
  "createdAt": "2026-01-20T08:00:00Z",
  "isCurrent": true
}
```

### Implementation Status
- ⏳ All - Planned

---

## 4. Verification

### Phone Verification (Level 0 → 1)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/verification/phone/send` | 🔐 | 3/hour | Send OTP to phone |
| POST | `/verification/phone/verify` | 🔐 | 5/hour | Verify OTP |
| POST | `/verification/phone/change` | 🔐 | 1/month | Request phone change |

### 2FA Setup (Required for Level 2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/verification/2fa/enable` | 🔐 | Generate 2FA secret & QR |
| POST | `/verification/2fa/verify` | 🔐 | Verify and enable 2FA |
| POST | `/verification/2fa/disable` | 🔐 | Disable 2FA (requires password) |
| GET | `/verification/2fa/backup-codes` | 🔐 | Get backup codes |
| POST | `/verification/2fa/regenerate-backup` | 🔐 | Regenerate backup codes |

### Enhanced Verification (Level 2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/verification/selfie/upload` | 🔐 | Upload selfie for liveness check |
| GET | `/verification/selfie/status` | 🔐 | Check selfie verification status |

### Identity Verification (Level 3)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/verification/edevlet/initiate` | 🔐 | Start e-Devlet verification |
| GET | `/verification/edevlet/callback` | 🔓 | e-Devlet callback |
| POST | `/verification/id/upload` | 🔐 | Upload ID document (front/back) |
| POST | `/verification/id/liveness` | 🔐 | Upload video selfie |
| GET | `/verification/id/status` | 🔐 | Check ID verification status |

### Full Verification (Level 4)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/verification/biometric` | 🔐 | Submit biometric data |
| POST | `/verification/address/upload` | 🔐 | Upload address proof document |
| POST | `/verification/phone/carrier` | 🔐 | Carrier ownership verification |
| GET | `/verification/status` | 🔐 | Get overall verification status |

### Implementation Status
- ⏳ All - Planned (Phase 2-3)

---

## 5. Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/search` | 🔓 | Search users |
| GET | `/users/check-username/:username` | 🔓 | Check username availability |
| GET | `/users/:username` | 👤 | Get user public profile |
| GET | `/users/:username/polls` | 👤 | List user's public polls |
| GET | `/users/:username/badges` | 👤 | List user's public badges |
| GET | `/users/:username/followers` | 👤 | List followers |
| GET | `/users/:username/following` | 👤 | List following |
| PATCH | `/users/me` | 🔐 | Update own profile |
| DELETE | `/users/me` | 🔐 | Delete account (30-day grace) |
| GET | `/users/me/polls` | 🔐 | List own polls (including private) |
| GET | `/users/me/saved` | 🔐 | List saved polls |
| POST | `/users/me/saved/:pollId` | 🔐 | Save poll |
| DELETE | `/users/me/saved/:pollId` | 🔐 | Unsave poll |
| GET | `/users/me/votes` | 🔐 | List own vote history |
| GET | `/users/me/badges` | 🔐 | List own badges (including hidden) |
| PATCH | `/users/me/badges/:id` | 🔐 | Update badge visibility |
| GET | `/users/me/settings` | 🔐 | Get user settings |
| PATCH | `/users/me/settings` | 🔐 | Update user settings |
| GET | `/users/me/blocked` | 🔐 | List blocked users |
| GET | `/users/me/demographics` | 🔐 | Get own demographics |
| PATCH | `/users/me/demographics` | 🔐 | Update mutable demographics |
| GET | `/users/me/subscription` | 🔐 | Get subscription details |
| GET | `/users/me/activity` | 🔐 | Get activity feed |

### Demographics Update Rules (P-012)
```json
// MUTABLE (can change)
{ "maritalStatus", "profession", "employmentStatus" }

// IMMUTABLE (locked after registration)
{ "birthYear", "gender", "country", "education" }
// Exception: Support ticket with ID verification
```

### Implementation Status
- ✅ `GET /users/:username` - Implemented
- ✅ `GET /users/:username/polls` - Implemented
- ✅ `GET /users/:username/badges` - Implemented
- ✅ `GET /users/:username/followers` - Implemented
- ✅ `GET /users/:username/following` - Implemented
- ✅ `PATCH /users/me` - Implemented
- ✅ `GET /users/me/polls` - Implemented
- ✅ `GET /users/me/badges` - Implemented
- ✅ `GET /users/me/settings` - Implemented
- ✅ `PATCH /users/me/settings` - Implemented
- ✅ `GET /users/check-username/:username` - Implemented
- ⏳ Others - Planned

---

## 6. Social & Messaging

### Follow System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/:username/follow` | 🔐 | Follow user |
| DELETE | `/users/:username/follow` | 🔐 | Unfollow user |

### Block System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/:username/block` | 🔐 | Block user |
| DELETE | `/users/:username/block` | 🔐 | Unblock user |
| GET | `/users/me/blocked` | 🔐 | List blocked users |

### Direct Messages (P-022)

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/messages` | 🔐 | - | List conversations |
| GET | `/messages/:conversationId` | 🔐 | - | Get conversation messages |
| POST | `/messages` | 🔐 | 5-100/day* | Send new message |
| DELETE | `/messages/:id` | 🔐 | - | Delete message (own only) |
| PUT | `/messages/:conversationId/read` | 🔐 | - | Mark conversation as read |
| GET | `/messages/unread-count` | 🔐 | - | Get unread message count |

*Rate limit varies by tier and friendship status

### Implementation Status
- ✅ `POST /users/:username/follow` - Implemented
- ✅ `DELETE /users/:username/follow` - Implemented
- ⏳ Others - Planned

---

## 7. Polls

### CRUD Operations

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/polls` | 👤 | - | List public polls |
| GET | `/polls/:id` | 👤 | - | Get poll details |
| GET | `/polls/slug/:slug` | 👤 | - | Get poll by slug |
| POST | `/polls` | 🔐 | Tier-based | Create poll |
| PUT | `/polls/:id` | 🔐 | - | Update poll (creator, limited) |
| DELETE | `/polls/:id` | 🔐 | - | Soft delete poll (creator) |

### Poll Lifecycle

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/polls/:id/publish` | 🔐 | Publish draft poll |
| POST | `/polls/:id/close` | 🔐 | Close poll to new votes |
| POST | `/polls/:id/archive` | 🔐 | Archive poll (hide from feeds) |
| POST | `/polls/:id/unarchive` | 🔐 | Restore archived poll |

### Voting

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/polls/:id/vote` | 🔐 | 100/hour | Vote on poll |
| DELETE | `/polls/:id/vote` | 🔐 | - | Retract vote (if poll allows) |
| GET | `/polls/:id/my-vote` | 🔐 | - | Get own vote on poll |

### Results & Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/polls/:id/results` | 👤 | Get poll results (rules apply) |
| GET | `/polls/:id/analytics` | 🔐 | Detailed analytics (creator only) |
| GET | `/polls/:id/analytics/export` | 🔐 | Export analytics (Premium) |

### Sharing & Access

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/polls/:id/share` | 🔐 | Generate share link |
| GET | `/polls/share/:code` | 👤 | Access poll via share code |
| POST | `/polls/:id/access-request` | 🔐 | Request PULSE access (P-004) |

### Pre-test (Premium Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/polls/:id/pretest` | 🔐 | Get pre-test questions |
| POST | `/polls/:id/pretest/submit` | 🔐 | Submit pre-test answers |

### Query Parameters (GET /polls)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 50) |
| sort | string | recent | Sort: recent, popular, trending, hot |
| category | string | - | Filter by category slug |
| type | string | - | QUICK_POLL, STANDARD, RANKED_CHOICE, DEMOGRAPHIC |
| creator | string | - | Filter by creator username |
| tag | string | - | Filter by tag |
| status | string | ACTIVE | DRAFT, ACTIVE, CLOSED, ARCHIVED |
| visibility | string | PUBLIC | PUBLIC, UNLISTED, PRIVATE, FOLLOWERS_ONLY |

### Implementation Status
- ✅ `GET /polls` - Implemented
- ✅ `GET /polls/:id` - Implemented
- ✅ `GET /polls/slug/:slug` - Implemented
- ✅ `POST /polls` - Implemented
- ✅ `PUT /polls/:id` - Implemented
- ✅ `DELETE /polls/:id` - Implemented
- ✅ `POST /polls/:id/vote` - Implemented
- ✅ `DELETE /polls/:id/vote` - Implemented
- ✅ `GET /polls/:id/my-vote` - Implemented
- ✅ `POST /polls/:id/publish` - Implemented
- ✅ `POST /polls/:id/close` - Implemented
- ✅ `POST /polls/:id/archive` - Implemented
- ✅ `POST /polls/:id/unarchive` - Implemented
- ✅ `POST /polls/:id/share` - Implemented
- ✅ `GET /polls/share/:code` - Implemented
- ✅ `GET /polls/:id/comments` - Implemented
- ✅ `POST /polls/:id/comments` - Implemented
- ✅ `GET /polls/:id/results` - Implemented
- ✅ `GET /polls/:id/analytics` - Implemented
- ⏳ Others - Planned

---

## 8. Live Polls

> Requires: Level 2+ verification, Premium subscription (P-011)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/polls` | 🔐 | Create live poll (type: LIVE_POLL) |
| POST | `/live/:id/start` | 🔐 | Start live session |
| POST | `/live/:id/pause` | 🔐 | Pause live session |
| POST | `/live/:id/resume` | 🔐 | Resume live session |
| POST | `/live/:id/end` | 🔐 | End live session |
| GET | `/live/:id/status` | 👤 | Get live session status |
| GET | `/live/:id/participants` | 🔐 | Get participant count/list |
| POST | `/live/:id/next-question` | 🔐 | Advance to next question |
| GET | `/live/join/:code` | 🔓 | Join live poll (6-char code) |
| POST | `/live/:id/vote` | 👤 | Vote in live poll (no auth for join) |

### Live Poll Join (No Auth - P-019)
```
GET /live/join/ABC123
→ Returns poll data, creates device fingerprint
→ User can vote without authentication
→ Prompted to create account after participation
```

### WebSocket for Live Polls
```
ws://api.voxpoll.com/live/{sessionId}
Events: vote, count, question, end, pause, resume
```

### Implementation Status
- ⏳ All - Planned (Phase 3)

---

## 9. Surveys

> Surveys are B2B ONLY - require organization context (P-015)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/surveys` | 🏢 | List organization surveys |
| GET | `/surveys/:id` | 🏢 | Get survey details |
| POST | `/surveys` | 🏢 | Create survey (Level 2+) |
| PUT | `/surveys/:id` | 🏢 | Update survey |
| DELETE | `/surveys/:id` | 🏢 | Delete survey |
| POST | `/surveys/:id/publish` | 🏢 | Publish survey |
| POST | `/surveys/:id/close` | 🏢 | Close survey |
| GET | `/surveys/:id/preview` | 🏢 | Preview survey (no recording) |
| POST | `/surveys/:id/respond` | 🏢 | Submit survey response |
| GET | `/surveys/:id/results` | 🏢 | Get results (permissions apply) |
| GET | `/surveys/:id/results/export` | 🏢 | Export results |
| POST | `/surveys/:id/invite` | 🏢 | Send invitation emails |
| GET | `/surveys/:id/stats` | 🏢 | Get completion statistics |
| POST | `/surveys/:id/reminder` | 🏢 | Send reminder to non-respondents |

### Implementation Status
- ⏳ All - Planned (Phase 3)

---

## 10. Tests (Personality & Quiz)

### Personality Tests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tests/personality` | 👤 | List personality tests |
| GET | `/tests/personality/:id` | 👤 | Get test details |
| POST | `/tests/personality` | 🔐 | Create test (Level 1+) |
| PUT | `/tests/personality/:id` | 🔐 | Update test (creator) |
| DELETE | `/tests/personality/:id` | 🔐 | Delete test (creator) |
| POST | `/tests/personality/:id/take` | 🔐 | Start taking test |
| POST | `/tests/personality/:id/submit` | 🔐 | Submit test answers |
| GET | `/tests/personality/:id/results` | 🔐 | Get own test results |
| GET | `/tests/personality/:id/my-badge` | 🔐 | Get badge from test |
| POST | `/tests/personality/:id/retake` | 🔐 | Retake test (24h cooldown) |

### Quiz Tests

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tests/quiz` | 👤 | List quiz tests |
| GET | `/tests/quiz/:id` | 👤 | Get quiz details |
| POST | `/tests/quiz` | 🔐 | Create quiz |
| POST | `/tests/quiz/:id/attempt` | 🔐 | Start quiz attempt |
| POST | `/tests/quiz/:id/submit` | 🔐 | Submit quiz answers |
| GET | `/tests/quiz/:id/leaderboard` | 👤 | Get quiz leaderboard |
| GET | `/tests/quiz/:id/my-attempts` | 🔐 | Get own attempts |

### Badges (P-017)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/badges` | 👤 | List all badge types |
| GET | `/badges/:id` | 👤 | Get badge details |
| POST | `/badges/:id/share` | 🔐 | Generate shareable badge image |

### Implementation Status
- ⏳ All - Planned (Phase 3-4)

---

## 11. Comments & Discussions

### Poll Comments (COMMENTS Feature - P-013)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/polls/:id/comments` | 👤 | List poll comments |
| POST | `/polls/:id/comments` | 🔐 | Add comment (participation rules) |
| PUT | `/comments/:id` | 🔐 | Edit own comment |
| DELETE | `/comments/:id` | 🔐 | Delete own comment |
| POST | `/comments/:id/vote` | 🔐 | Upvote/downvote comment |
| POST | `/comments/:id/report` | 🔐 | Report comment |
| GET | `/comments/:id/replies` | 👤 | Get comment replies |
| POST | `/comments/:id/replies` | 🔐 | Reply to comment |

### Query Parameters (GET comments)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| sort | string | best | best, newest, oldest, controversial |
| parentId | string | null | Filter by parent (top-level if null) |

### Comment Access Rules (P-003, P-016, P-060)

| User Type | Can Read | Can Write |
|-----------|----------|-----------|
| Guest | ✅ | ❌ |
| Free (not voted) | ✅ | ❌ |
| Free (voted) | ✅ | ✅ |
| Plus (not voted) | ✅ | ❌ |
| Plus (voted) | ✅ | ✅ |
| Premium | ✅ | ✅ (if voted) |

### Implementation Status
- ⏳ All - Planned (Phase 2)

---

## 12. Categories & Tags

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | 🔓 | List all categories |
| GET | `/categories/:slug` | 🔓 | Get category details |
| GET | `/categories/:slug/polls` | 👤 | List polls in category |
| GET | `/tags` | 🔓 | List popular tags |
| GET | `/tags/trending` | 🔓 | List trending tags |
| GET | `/tags/:name` | 🔓 | Get tag details |
| GET | `/tags/:name/polls` | 👤 | List polls with tag |

### Implementation Status
- ⏳ All - Planned (Phase 2)

---

## 13. Feed & Discovery

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/feed` | 🔐 | Personalized home feed |
| GET | `/feed/following` | 🔐 | Feed from followed users |
| GET | `/feed/trending` | 👤 | Trending content feed |
| GET | `/feed/discover` | 👤 | Discovery feed (sponsored) |
| GET | `/feed/for-you` | 🔐 | AI-recommended content |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| type | string | all | polls, tests, discussions |

### Implementation Status
- ⏳ All - Planned (Phase 2)

---

## 14. Search

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/search` | 👤 | 10-120/min* | Global search |
| GET | `/search/polls` | 👤 | 10-120/min* | Search polls only |
| GET | `/search/users` | 👤 | 10-120/min* | Search users only |
| GET | `/search/tags` | 🔓 | 30/min | Search tags |
| GET | `/search/suggestions` | 🔓 | 60/min | Autocomplete suggestions |

*Rate limit varies by authentication status and tier

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | ✅ | Search query (min 2 chars) |
| type | string | - | Filter: polls, users, tests, all |
| category | string | - | Filter by category |
| page | number | - | Page number |
| limit | number | - | Items per page (max 50) |

### Implementation Status
- ⏳ All - Planned (Phase 2)

---

## 15. Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | 🔐 | List notifications |
| GET | `/notifications/unread-count` | 🔐 | Get unread count |
| PUT | `/notifications/:id/read` | 🔐 | Mark as read |
| PUT | `/notifications/read-all` | 🔐 | Mark all as read |
| DELETE | `/notifications/:id` | 🔐 | Delete notification |
| GET | `/notifications/settings` | 🔐 | Get notification settings |
| PUT | `/notifications/settings` | 🔐 | Update notification settings |

### Notification Types (P-036)

| Type | Default Channel | Can Disable |
|------|-----------------|-------------|
| NEW_FOLLOWER | push, email | ✅ |
| COMMENT_REPLY | push | ✅ |
| POLL_MILESTONE | push, email | ✅ |
| POLL_ENDED | push, email | ✅ |
| DM_RECEIVED | push | ✅ |
| ACCOUNT_SECURITY | push, email, sms | ❌ (CRITICAL) |
| SYSTEM_ALERT | push, email | ❌ (CRITICAL) |

### Implementation Status
- ⏳ All - Planned (Phase 2)

---

## 16. Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reports` | 🔐 | Submit report |
| GET | `/reports` | 🔐 | List own reports |
| GET | `/reports/:id` | 🔐 | Get report status |

### Report Types

| Target | Endpoint Alternative | Reason Types |
|--------|---------------------|--------------|
| Poll | `POST /polls/:id/report` | SPAM, HARASSMENT, MISINFORMATION, VIOLENCE, NSFW, OTHER |
| Comment | `POST /comments/:id/report` | SPAM, HARASSMENT, HATE_SPEECH, VIOLENCE, OTHER |
| User | `POST /users/:username/report` | SPAM, HARASSMENT, IMPERSONATION, FRAUD, OTHER |

### Implementation Status
- ⏳ All - Planned (Phase 2)

---

## 17. Organizations

### Organization CRUD

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/organizations` | 🔐 | List user's organizations |
| GET | `/organizations/:slug` | 🏢 | Get organization details |
| POST | `/organizations` | 🔐 | Create organization (Level 4) |
| PUT | `/organizations/:slug` | 🏢 | Update organization |
| DELETE | `/organizations/:slug` | 🏢 | Delete organization (Owner only) |

### Member Management

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| GET | `/organizations/:slug/members` | 🏢 | - | List members |
| POST | `/organizations/:slug/members` | 🏢 | members:manage | Add member directly |
| PATCH | `/organizations/:slug/members/:id` | 🏢 | members:manage | Change member role |
| DELETE | `/organizations/:slug/members/:id` | 🏢 | members:manage | Remove member |

### Invitations

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| POST | `/organizations/:slug/invite` | 🏢 | members:manage | Send invitation |
| POST | `/organizations/:slug/invite/bulk` | 🏢 | members:manage | Bulk invite (Enterprise) |
| GET | `/organizations/:slug/invitations` | 🏢 | members:manage | List pending invitations |
| DELETE | `/organizations/:slug/invitations/:id` | 🏢 | members:manage | Cancel invitation |
| POST | `/organizations/:slug/invitations/:id/resend` | 🏢 | members:manage | Resend invitation |
| GET | `/organizations/invite/:code` | 🔓 | - | View invitation details |
| POST | `/organizations/invite/:code/accept` | 🔐 | - | Accept invitation |
| POST | `/organizations/:slug/join` | 🔐 | - | Auto-join (domain match) |

### Organization Surveys

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/organizations/:slug/surveys` | 🏢 | List organization surveys |
| POST | `/organizations/:slug/surveys` | 🏢 | Create survey for org |

### Organization Settings

| Method | Endpoint | Auth | Permission | Description |
|--------|----------|------|------------|-------------|
| PUT | `/organizations/:slug/settings` | 🏢 | org:settings | Update settings |
| GET | `/organizations/:slug/audit-logs` | 🏢 | org:audit | View audit logs |
| PUT | `/organizations/:slug/sso` | 🏢 | org:sso | Configure SSO |
| GET | `/organizations/:slug/sso/metadata` | 🏢 | org:sso | Get SAML metadata |

### Organization Billing (Owner Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/organizations/:slug/billing` | 🏢 | Get billing info |
| PUT | `/organizations/:slug/billing` | 🏢 | Update billing/plan |
| GET | `/organizations/:slug/invoices` | 🏢 | List invoices |
| GET | `/organizations/:slug/invoices/:id` | 🏢 | Download invoice |

### Organization Transfer (Owner Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/organizations/:slug/transfer` | 🏢 | Transfer ownership |

### Organization Roles (P-033)

| Role | Level | Permissions |
|------|-------|-------------|
| OWNER | 4 | All permissions |
| ADMIN | 3 | All except billing, delete, transfer |
| MANAGER | 2 | surveys:*, results:*, members:view |
| ANALYST | 2 | results:view, results:export |
| CREATOR | 1 | surveys:create, surveys:edit_own |
| MEMBER | 1 | surveys:respond |

### Implementation Status
- ⏳ All - Planned (Phase 3)

---

## 18. Analytics

### User Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/overview` | 🔐 | User dashboard analytics |
| GET | `/analytics/polls/:id` | 🔐 | Poll analytics (creator) |
| GET | `/analytics/polls/:id/export` | 🔐 | Export analytics (Premium) |

### Admin Analytics (SUPER_ADMIN only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/analytics/platform` | 🛡️ | Platform-wide analytics |
| GET | `/admin/analytics/users` | 🛡️ | User growth stats |
| GET | `/admin/analytics/content` | 🛡️ | Content engagement stats |
| GET | `/admin/analytics/revenue` | 🛡️ | Revenue metrics |

### Implementation Status
- ⏳ All - Planned (Phase 3-4)

---

## 19. Admin & Moderation

### Report Management (MODERATOR+)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/reports` | 🛡️ | List all reports |
| GET | `/admin/reports/:id` | 🛡️ | Get report details |
| PUT | `/admin/reports/:id` | 🛡️ | Process report |

### Content Moderation (MODERATOR+)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/admin/polls/:id/hide` | 🛡️ | Hide poll from public |
| POST | `/admin/polls/:id/unhide` | 🛡️ | Restore poll visibility |
| DELETE | `/admin/polls/:id` | 🛡️ | Hard delete poll (ADMIN+) |
| POST | `/admin/comments/:id/remove` | 🛡️ | Remove comment |
| POST | `/admin/comments/:id/edit` | 🛡️ | Edit comment (censorship) |

### User Moderation (MODERATOR+)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/admin/users/:id/warn` | 🛡️ | MODERATOR | Issue warning |
| POST | `/admin/users/:id/suspend` | 🛡️ | MODERATOR | Suspend user |
| POST | `/admin/users/:id/unsuspend` | 🛡️ | MODERATOR | Lift suspension |
| POST | `/admin/users/:id/ban` | 🛡️ | ADMIN | Permanently ban user |
| POST | `/admin/users/:id/unban` | 🛡️ | ADMIN | Remove ban |

### User Management (ADMIN+)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | 🛡️ | List all users |
| GET | `/admin/users/:id` | 🛡️ | Get user details |
| PATCH | `/admin/users/:id` | 🛡️ | Update user |
| DELETE | `/admin/users/:id` | 🛡️ | Hard delete (GDPR) |
| POST | `/admin/users/:id/verify` | 🛡️ | Manually verify user |

### Organization Management (SUPER_ADMIN)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/organizations` | 🛡️ | List all organizations |
| PATCH | `/admin/organizations/:id` | 🛡️ | Update organization |
| DELETE | `/admin/organizations/:id` | 🛡️ | Force delete organization |

### System Configuration (SUPER_ADMIN)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/config` | 🛡️ | View system config |
| PUT | `/admin/config` | 🛡️ | Update system config |
| GET | `/admin/feature-flags` | 🛡️ | List feature flags |
| PUT | `/admin/feature-flags/:flag` | 🛡️ | Update feature flag |

### Implementation Status
- ⏳ All - Planned (Phase 4)

---

## 20. WebSocket Events

### Connection

```
wss://api.voxpoll.com/ws?token={accessToken}
```

### Channels

| Channel | Description | Auth |
|---------|-------------|------|
| `poll:{id}` | Real-time poll updates | 👤 |
| `live:{sessionId}` | Live poll session | 🔓 |
| `user:{id}` | User notifications | 🔐 |
| `org:{slug}` | Organization updates | 🏢 |

### Events

| Event | Direction | Channel | Payload |
|-------|-----------|---------|---------|
| `vote` | S→C | poll, live | `{ optionId, count }` |
| `comment` | S→C | poll | `{ comment }` |
| `participant_count` | S→C | live | `{ count }` |
| `question_change` | S→C | live | `{ questionIndex }` |
| `poll_ended` | S→C | poll, live | `{ results }` |
| `notification` | S→C | user | `{ notification }` |
| `presence` | Bidirectional | live | `{ userId, status }` |

### Implementation Status
- ⏳ All - Planned (Phase 3)

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `BAD_REQUEST` | 400 | Invalid request format |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `TOKEN_EXPIRED` | 401 | Token has expired |
| `FORBIDDEN` | 403 | Not authorized for action |
| `INSUFFICIENT_VERIFICATION` | 403 | Higher verification level required |
| `SUBSCRIPTION_REQUIRED` | 403 | Higher subscription tier required |
| `NOT_FOUND` | 404 | Resource not found |
| `METHOD_NOT_ALLOWED` | 405 | HTTP method not supported |
| `CONFLICT` | 409 | Resource already exists |
| `GONE` | 410 | Resource deleted |
| `PAYLOAD_TOO_LARGE` | 413 | Request body too large |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down |

---

## Implementation Priority

### Phase 1 (MVP) ✅
- Health checks
- Authentication (register, login, logout, me)
- Users (profile, follow/unfollow)
- Polls (CRUD, vote)

### Phase 2 (Core Features)
- Password reset flow
- Email verification
- Phone verification (Level 1)
- Categories & tags
- Comments
- Search (basic)
- Notifications
- Feed
- Reports

### Phase 3 (Advanced)
- OAuth providers (Google, Apple)
- 2FA & enhanced verification
- e-Devlet integration
- Surveys (B2B)
- Personality tests
- Organizations (basic)
- Live polls
- Analytics
- Messages/DM
- Real-time (WebSocket)

### Phase 4 (Enterprise)
- Quiz tests
- Full verification (Level 4)
- Organization SSO
- Organization billing
- Advanced analytics
- Admin dashboard
- Moderation tools
- API rate tiers

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.1.0 | 2026-01-23 | Added slug endpoint, saved polls, check-username; Updated implementation status |
| 2.0.0 | 2026-01-22 | Complete rewrite with all endpoints |
| 1.0.0 | 2026-01-22 | Initial version |
