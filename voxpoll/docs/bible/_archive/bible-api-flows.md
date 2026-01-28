# VoxPoll API User Flows & Request Index

> **Version:** 2.0.0
> **Last Updated:** 2026-01-23
> **Base URL:** `/api/v1`
> **Reference:** BIBLE-005, BIBLE-022, BIBLE-030, BIBLE-API-ROUTES

---

## Table of Contents

1. [User Roles & Verification Matrix](#1-user-roles--verification-matrix)
2. [Guest User Flows (No Auth)](#2-guest-user-flows)
3. [Unverified User Flows (Level 0)](#3-unverified-user-flows)
4. [Basic User Flows (Level 1, Free)](#4-basic-user-flows)
5. [Plus User Flows (Level 1, Plus)](#5-plus-user-flows)
6. [Premium User Flows (Level 1-2, Premium)](#6-premium-user-flows)
7. [Organization Member Flows](#7-organization-member-flows)
8. [Organization Admin Flows](#8-organization-admin-flows)
9. [Moderator Flows](#9-moderator-flows)
10. [Super Admin Flows](#10-super-admin-flows)
11. [Authentication Flows](#11-authentication-flows)
12. [Verification Upgrade Flows](#12-verification-upgrade-flows)
13. [Content Lifecycle Flows](#13-content-lifecycle-flows)
14. [Subscription & Payment Flows](#14-subscription--payment-flows)
15. [Complete Endpoint Index by Role](#15-complete-endpoint-index-by-role)

---

## 1. User Roles & Verification Matrix

### Verification Levels

| Level | Name | Requirements | Response Weight | Unlocked Features |
|-------|------|--------------|-----------------|-------------------|
| 0 | Unverified | Email verified | 0.5x | Basic voting |
| 1 | Basic | Phone verified | 1.0x | Create polls, comments, follow |
| 2 | Enhanced | 2FA + Selfie OR Org SSO | 1.5x | Live polls, surveys |
| 3 | Identity | e-Devlet OR ID Document | 2.0x | Org admin roles |
| 4 | Full | Biometric + Address | 2.5x | Create organizations |

### Subscription Tiers

| Tier | Price | Key Features |
|------|-------|--------------|
| Free | $0 | 3 polls/day, vote only PULSE access |
| Plus | $4.99/mo | 10 polls/day, view PULSE without voting |
| Premium | $9.99/mo | Unlimited polls, live polls, pre-tests, targeting |

### Access Control Formula

```
CAN_ACCESS = (userVerificationLevel >= requiredLevel)
           && (userSubscriptionTier >= requiredTier)
           && (hasRequiredPermission)
           && (!isBlocked)
           && (!isSuspended)
```

### Platform Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| USER | Normal user | Standard user permissions |
| MODERATOR | Content moderator | Review reports, hide content, suspend users |
| ADMIN | Platform admin | Ban users, manage config |
| SUPER_ADMIN | Full access | All permissions, system config |

### Organization Roles

| Role | Level | Key Permissions |
|------|-------|-----------------|
| OWNER | 4 | All permissions, billing, transfer, delete |
| ADMIN | 3 | Manage members, SSO, settings |
| MANAGER | 2 | Create surveys, view all results |
| ANALYST | 2 | View/export results only |
| CREATOR | 1 | Create own surveys |
| MEMBER | 1 | Respond to surveys only |

---

## 2. Guest User Flows

> **Auth:** None (🔓)
> **Verification Level:** N/A
> **Subscription:** N/A

### 2.1 Browse Public Content

```
FLOW: View public polls listing
┌─────────────────────────────────────────────────────────────────┐
│ GET /polls?page=1&limit=20&sort=trending                        │
│ Headers: None                                                   │
│ Response: List of public polls                                  │
│ Note: Results hidden if showResultsBeforeVote=false             │
└─────────────────────────────────────────────────────────────────┘

FLOW: View single poll details
┌─────────────────────────────────────────────────────────────────┐
│ GET /polls/:id                                                  │
│ Headers: None                                                   │
│ Response: Poll details (hasVoted=false, userAnswer=null)        │
└─────────────────────────────────────────────────────────────────┘

FLOW: View poll comments (read-only)
┌─────────────────────────────────────────────────────────────────┐
│ GET /polls/:id/comments?page=1&sort=best                        │
│ Response: Comments list (cannot post)                           │
└─────────────────────────────────────────────────────────────────┘

FLOW: View user profile
┌─────────────────────────────────────────────────────────────────┐
│ GET /users/:username                                            │
│ Response: Public profile (isFollowing=false)                    │
│                                                                 │
│ GET /users/:username/polls                                      │
│ Response: User's public polls                                   │
│                                                                 │
│ GET /users/:username/badges                                     │
│ Response: User's public badges                                  │
└─────────────────────────────────────────────────────────────────┘

FLOW: Browse categories & tags
┌─────────────────────────────────────────────────────────────────┐
│ GET /categories                                                 │
│ GET /categories/:slug                                           │
│ GET /categories/:slug/polls                                     │
│ GET /tags                                                       │
│ GET /tags/trending                                              │
│ GET /tags/:name/polls                                           │
└─────────────────────────────────────────────────────────────────┘

FLOW: View tests
┌─────────────────────────────────────────────────────────────────┐
│ GET /tests/personality                                          │
│ GET /tests/personality/:id                                      │
│ GET /tests/quiz                                                 │
│ GET /tests/quiz/:id                                             │
│ GET /tests/quiz/:id/leaderboard                                 │
│ GET /badges                                                     │
│ GET /badges/:id                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Search (Limited)

```
FLOW: Search content
┌─────────────────────────────────────────────────────────────────┐
│ GET /search?q=keyword                                           │
│ Rate Limit: 10/min for guests                                   │
│ Response: Limited results (max 10 items per type)               │
│                                                                 │
│ GET /search/tags?q=keyword                                      │
│ GET /search/suggestions?q=keyword                               │
│ Response: Tag suggestions, autocomplete                         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Join Live Poll (No Auth - P-019)

```
FLOW: Join live poll without authentication
┌─────────────────────────────────────────────────────────────────┐
│ POST /live/sessions/:code/join                                  │
│ Headers: None (optionalAuth)                                    │
│ Body: { participantId }                                         │
│ Response: Session data + participant token                      │
│ Note: Device fingerprint created for duplicate prevention       │
│                                                                 │
│ GET /live/sessions/:code                                        │
│ → Get session status (participants, state, poll data)           │
│                                                                 │
│ WEBSOCKET: ws://api.voxpoll.com/live/{sessionId}                │
│ → Subscribe to real-time updates                                │
│                                                                 │
│ AFTER VOTING:                                                   │
│ → Prompted to create account for history                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Access via Share Links

```
FLOW: Access poll via private share link
┌─────────────────────────────────────────────────────────────────┐
│ GET /polls/share/:code                                          │
│ Response: Poll data (even if UNLISTED visibility)               │
│ Note: Cannot vote without auth                                  │
└─────────────────────────────────────────────────────────────────┘

FLOW: View organization invitation
┌─────────────────────────────────────────────────────────────────┐
│ GET /organizations/invite/:code                                 │
│ Response: Invitation details (org name, role, inviter)          │
│ Note: Must login/register to accept                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Health Checks (System)

```
FLOW: System health monitoring
┌─────────────────────────────────────────────────────────────────┐
│ GET /health           → Basic health                            │
│ GET /health/live      → Kubernetes liveness                     │
│ GET /health/ready     → Kubernetes readiness                    │
│ GET /health/startup   → Kubernetes startup                      │
│ GET /health/deep      → Detailed metrics (public)               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 Cannot Do (Guest Restrictions)

```
❌ POST /polls/:id/vote           → Requires auth
❌ POST /polls                    → Requires auth + Level 1
❌ POST /polls/:id/comments       → Requires auth + Level 1
❌ POST /users/:username/follow   → Requires auth + Level 1
❌ GET /feed                      → Requires auth
❌ GET /notifications             → Requires auth
❌ POST /messages                 → Requires auth + Level 1
❌ POST /reports                  → Requires auth
```

---

## 3. Unverified User Flows

> **Auth:** Required (🔐)
> **Verification Level:** 0 (Email verified only)
> **Subscription:** Free
> **Response Weight:** 0.5x

### 3.1 Account Management

```
FLOW: Registration & Email Verification
┌─────────────────────────────────────────────────────────────────┐
│ POST /auth/register                                             │
│ Body: { email, password, username, displayName? }               │
│ Rate Limit: 3/hour                                              │
│ → Account created, status: PENDING_VERIFICATION                 │
│ → Verification email sent                                       │
│                                                                 │
│ POST /auth/verify/confirm                                       │
│ Body: { code }                                                  │
│ → Email verified, verificationLevel: 0                          │
│                                                                 │
│ POST /auth/verify/send-code                                     │
│ Headers: Authorization: Bearer {token}                          │
│ Rate Limit: 3/hour                                              │
└─────────────────────────────────────────────────────────────────┘

FLOW: Login & Logout
┌─────────────────────────────────────────────────────────────────┐
│ POST /auth/login                                                │
│ Body: { email, password }                                       │
│ Rate Limit: 5/15min                                             │
│ → Returns: { user, session: { token, refreshToken, expiresAt }} │
│                                                                 │
│ POST /auth/logout                                               │
│ Headers: Authorization: Bearer {token}                          │
│ → Current session invalidated                                   │
│                                                                 │
│ POST /auth/logout-all                                           │
│ → ALL sessions invalidated                                      │
└─────────────────────────────────────────────────────────────────┘

FLOW: Get current user
┌─────────────────────────────────────────────────────────────────┐
│ GET /auth/me                                                    │
│ Headers: Authorization: Bearer {token}                          │
│ → Returns: Current user profile with verificationLevel          │
└─────────────────────────────────────────────────────────────────┘

FLOW: Token refresh
┌─────────────────────────────────────────────────────────────────┐
│ POST /auth/refresh                                              │
│ Body: { refreshToken }                                          │
│ Rate Limit: 10/hour                                             │
│ → New tokens issued (refresh token rotated)                     │
└─────────────────────────────────────────────────────────────────┘

FLOW: Password recovery
┌─────────────────────────────────────────────────────────────────┐
│ POST /auth/password/forgot                                      │
│ Body: { email }                                                 │
│ Rate Limit: 3/hour                                              │
│ → Reset email sent (always 200 for security)                    │
│                                                                 │
│ POST /auth/password/reset                                       │
│ Body: { token, newPassword }                                    │
│ → Password changed, all sessions invalidated                    │
└─────────────────────────────────────────────────────────────────┘

FLOW: Session management
┌─────────────────────────────────────────────────────────────────┐
│ GET /auth/sessions                                              │
│ → List all active sessions                                      │
│                                                                 │
│ DELETE /auth/sessions/:id                                       │
│ → Revoke specific session                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Limited Participation

```
FLOW: Vote on public poll (0.5x weight)
┌─────────────────────────────────────────────────────────────────┐
│ GET /polls/:id                                                  │
│ → View poll details (enhanced: shows hasVoted status)           │
│                                                                 │
│ POST /polls/:id/vote                                            │
│ Headers: Authorization: Bearer {token}                          │
│ Body: { optionId }                                              │
│ Rate Limit: 100/hour                                            │
│ → Vote recorded with 0.5x response weight                       │
│                                                                 │
│ GET /polls/:id/results                                          │
│ → View results (only after voting)                              │
│                                                                 │
│ GET /polls/:id/my-vote                                          │
│ → Get own vote details                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Profile (Read Only)

```
FLOW: View own profile
┌─────────────────────────────────────────────────────────────────┐
│ GET /auth/me                                                    │
│ → Current user with all fields                                  │
│                                                                 │
│ GET /users/me/votes                                             │
│ → Vote history                                                  │
│                                                                 │
│ GET /users/me/activity                                          │
│ → Activity feed                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Cannot Do (Level 0 Restrictions)

```
❌ POST /polls                     → Requires Level 1
❌ POST /polls/:id/comments        → Requires Level 1
❌ POST /users/:username/follow    → Requires Level 1
❌ POST /messages                  → Requires Level 1
❌ PATCH /users/me                 → Requires Level 1
❌ GET /polls/:id/results          → Without voting (requires Plus+)
❌ POST /reports                   → Requires Level 1
```

---

## 4. Basic User Flows

> **Auth:** Required (🔐)
> **Verification Level:** 1 (Phone verified)
> **Subscription:** Free
> **Response Weight:** 1.0x

### 4.1 Profile Management

```
FLOW: Update profile
┌─────────────────────────────────────────────────────────────────┐
│ PATCH /users/me                                                 │
│ Body: { displayName?, bio?, avatarUrl?, website?, location? }   │
│ → Update own profile                                            │
│                                                                 │
│ GET /users/me/demographics                                      │
│ → View own demographics                                         │
│                                                                 │
│ PATCH /users/me/demographics                                    │
│ Body: { maritalStatus?, profession?, employmentStatus? }        │
│ → Update MUTABLE demographics only (P-012)                      │
└─────────────────────────────────────────────────────────────────┘

FLOW: Email/Password changes
┌─────────────────────────────────────────────────────────────────┐
│ POST /auth/password/change                                      │
│ Body: { currentPassword, newPassword }                          │
│ Rate Limit: 5/hour                                              │
│                                                                 │
│ POST /auth/password/set                                         │
│ Body: { password }                                              │
│ → Set password for OAuth users without password                 │
│                                                                 │
│ GET /auth/password/status                                       │
│ → Check if user has password set                                │
└─────────────────────────────────────────────────────────────────┘

FLOW: Manage badges
┌─────────────────────────────────────────────────────────────────┐
│ GET /users/me/badges                                            │
│ → List all badges (including hidden)                            │
│                                                                 │
│ PATCH /users/me/badges/:id                                      │
│ Body: { visible: true/false, pinned: true/false }               │
│ → Update badge visibility (max 5 pinned)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Poll Creation (Quick Poll)

```
FLOW: Create quick poll
┌─────────────────────────────────────────────────────────────────┐
│ PRE-CONDITION: verificationLevel >= 1, tier = FREE              │
│ RATE LIMIT: 3 polls/day                                         │
│                                                                 │
│ POST /polls                                                     │
│ Headers: Authorization: Bearer {token}                          │
│ Body: {                                                         │
│   title: "What's your favorite color?",                         │
│   type: "QUICK_POLL",                                           │
│   visibility: "PUBLIC",                                         │
│   options: [                                                    │
│     { text: "Red" },                                            │
│     { text: "Blue" },                                           │
│     { text: "Green" },                                          │
│     { text: "Yellow" }    // Max 4 options for FREE             │
│   ],                                                            │
│   allowMultipleVotes: false,                                    │
│   showResultsBeforeVote: false,                                 │
│   allowDiscussion: true,                                        │
│   endsAt: "2026-02-01T00:00:00Z"  // Optional                   │
│ }                                                               │
│ → Returns: Created poll with id and slug                        │
└─────────────────────────────────────────────────────────────────┘

FLOW: Manage own polls
┌─────────────────────────────────────────────────────────────────┐
│ GET /users/me/polls                                             │
│ → List all own polls (including DRAFT, PRIVATE)                 │
│                                                                 │
│ PATCH /polls/:id                                                │
│ PRE-CONDITION: poll.creatorId === userId                        │
│ Body: { title?, description?, endsAt? }                         │
│ Note: Some fields locked after first vote                       │
│                                                                 │
│ POST /polls/:id/publish                                         │
│ → Publish draft poll                                            │
│                                                                 │
│ POST /polls/:id/close                                           │
│ → Close poll to new votes                                       │
│                                                                 │
│ POST /polls/:id/archive                                         │
│ → Archive poll (hide from feeds)                                │
│                                                                 │
│ DELETE /polls/:id                                               │
│ → Soft delete (30-day retention)                                │
│                                                                 │
│ GET /polls/:id/analytics                                        │
│ → Basic analytics (limited for FREE)                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Participation (1.0x weight)

```
FLOW: Full participation
┌─────────────────────────────────────────────────────────────────┐
│ GET /polls?sort=recent                                          │
│ GET /feed/trending                                              │
│ → Browse polls                                                  │
│                                                                 │
│ POST /polls/:id/vote                                            │
│ Body: { optionId }                                              │
│ → Vote recorded with 1.0x weight                                │
│                                                                 │
│ DELETE /polls/:id/vote                                          │
│ → Retract vote (if poll.allowVoteRetraction=true)               │
│                                                                 │
│ GET /polls/:id/results                                          │
│ → View results (after voting OR if showResultsBeforeVote=true)  │
│                                                                 │
│ POST /polls/:id/comments                                        │
│ PRE-CONDITION: hasVoted === true                                │
│ Body: { content, parentId? }                                    │
│ Rate Limit: 50/hour                                             │
│ → Add comment (only after voting for FREE tier)                 │
│                                                                 │
│ POST /comments/:id/vote                                         │
│ Body: { direction: "up" | "down" }                              │
│ → Upvote/downvote comment                                       │
│                                                                 │
│ PUT /comments/:id                                               │
│ PRE-CONDITION: comment.authorId === userId                      │
│ Body: { content }                                               │
│ → Edit own comment                                              │
│                                                                 │
│ DELETE /comments/:id                                            │
│ PRE-CONDITION: comment.authorId === userId                      │
│ → Delete own comment                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Social Features

```
FLOW: Follow system
┌─────────────────────────────────────────────────────────────────┐
│ GET /users/:username                                            │
│ → View profile with isFollowing flag                            │
│                                                                 │
│ POST /users/:username/follow                                    │
│ → Follow user                                                   │
│                                                                 │
│ DELETE /users/:username/follow                                  │
│ → Unfollow user                                                 │
│                                                                 │
│ GET /users/:username/followers                                  │
│ GET /users/:username/following                                  │
│ → List followers/following                                      │
│                                                                 │
│ GET /feed/following                                             │
│ → Feed from followed users                                      │
└─────────────────────────────────────────────────────────────────┘

FLOW: Block system
┌─────────────────────────────────────────────────────────────────┐
│ POST /users/:username/block                                     │
│ → Block user (hides their content, prevents interaction)        │
│                                                                 │
│ DELETE /users/:username/block                                   │
│ → Unblock user                                                  │
│                                                                 │
│ GET /users/me/blocked                                           │
│ → List blocked users                                            │
└─────────────────────────────────────────────────────────────────┘

FLOW: Direct messages (limited)
┌─────────────────────────────────────────────────────────────────┐
│ GET /messages                                                   │
│ → List conversations                                            │
│                                                                 │
│ GET /messages/:conversationId                                   │
│ → Get conversation messages                                     │
│                                                                 │
│ POST /messages                                                  │
│ Body: { recipientId, content }                                  │
│ Rate Limit: 5/day to non-friends (unlimited to friends)         │
│ → Send message                                                  │
│                                                                 │
│ PUT /messages/:conversationId/read                              │
│ → Mark as read                                                  │
│                                                                 │
│ GET /messages/unread-count                                      │
│ → Get unread count                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Notifications

```
FLOW: Manage notifications
┌─────────────────────────────────────────────────────────────────┐
│ GET /notifications                                              │
│ → List notifications                                            │
│                                                                 │
│ GET /notifications/unread-count                                 │
│ → Get unread count                                              │
│                                                                 │
│ PUT /notifications/:id/read                                     │
│ → Mark as read                                                  │
│                                                                 │
│ PUT /notifications/read-all                                     │
│ → Mark all as read                                              │
│                                                                 │
│ DELETE /notifications/:id                                       │
│ → Delete notification                                           │
│                                                                 │
│ GET /notifications/settings                                     │
│ PUT /notifications/settings                                     │
│ Body: { email: {...}, push: {...}, sms: {...} }                 │
│ → Manage notification preferences                               │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Tests & Badges

```
FLOW: Take personality test
┌─────────────────────────────────────────────────────────────────┐
│ GET /tests/personality                                          │
│ → Browse tests                                                  │
│                                                                 │
│ GET /tests/personality/:id                                      │
│ → Get test details                                              │
│                                                                 │
│ POST /tests/personality/:id/take                                │
│ → Start test session                                            │
│                                                                 │
│ POST /tests/personality/:id/submit                              │
│ Body: { answers: [...] }                                        │
│ → Submit answers, get result + badge                            │
│                                                                 │
│ GET /tests/personality/:id/results                              │
│ → View own results                                              │
│                                                                 │
│ POST /tests/personality/:id/retake                              │
│ PRE-CONDITION: 24h since last attempt (P-050)                   │
│ → Start new attempt (max 3 badges per test)                     │
└─────────────────────────────────────────────────────────────────┘

FLOW: Take quiz
┌─────────────────────────────────────────────────────────────────┐
│ POST /tests/quiz/:id/attempt                                    │
│ → Start quiz attempt                                            │
│                                                                 │
│ POST /tests/quiz/:id/submit                                     │
│ Body: { answers: [...] }                                        │
│ → Submit answers, get score                                     │
│                                                                 │
│ GET /tests/quiz/:id/my-attempts                                 │
│ → View own attempts                                             │
└─────────────────────────────────────────────────────────────────┘

FLOW: Share badge
┌─────────────────────────────────────────────────────────────────┐
│ POST /badges/:id/share                                          │
│ → Generate shareable image URL                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.7 Reporting

```
FLOW: Report content
┌─────────────────────────────────────────────────────────────────┐
│ POST /reports                                                   │
│ Body: {                                                         │
│   targetType: "POLL" | "COMMENT" | "USER" | "MESSAGE",          │
│   targetId: "xxx",                                              │
│   reason: "SPAM" | "HARASSMENT" | "MISINFORMATION" | ...,       │
│   details: "Additional context..."                              │
│ }                                                               │
│ → Submit report                                                 │
│                                                                 │
│ ALTERNATIVE SHORTCUTS:                                          │
│ POST /polls/:id/report                                          │
│ POST /comments/:id/report                                       │
│ POST /users/:username/report                                    │
│                                                                 │
│ GET /reports                                                    │
│ → View own submitted reports and status                         │
│                                                                 │
│ GET /reports/:id                                                │
│ → Get report details                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.8 Search & Feed

```
FLOW: Search content
┌─────────────────────────────────────────────────────────────────┐
│ GET /search?q=keyword&type=all                                  │
│ Rate Limit: 30/min                                              │
│ → Full search results                                           │
│                                                                 │
│ GET /search/polls?q=keyword&category=politics                   │
│ GET /search/users?q=keyword                                     │
│ → Filtered search                                               │
└─────────────────────────────────────────────────────────────────┘

FLOW: Browse feeds
┌─────────────────────────────────────────────────────────────────┐
│ GET /feed                                                       │
│ → Personalized home feed                                        │
│                                                                 │
│ GET /feed/following                                             │
│ → Content from followed users                                   │
│                                                                 │
│ GET /feed/trending                                              │
│ → Trending content                                              │
│                                                                 │
│ GET /feed/for-you                                               │
│ → AI-recommended content                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.9 Account Deletion

```
FLOW: Delete account
┌─────────────────────────────────────────────────────────────────┐
│ DELETE /users/me                                                │
│ PRE-CONDITION: Requires password confirmation                   │
│ → Account marked for deletion                                   │
│ → 30-day grace period for recovery (P-043)                      │
│ → All sessions terminated                                       │
│ → Content anonymized (creator = "Deleted User")                 │
│ → Badges preserved                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 4.10 Cannot Do (Free Tier Restrictions)

```
❌ Create extended polls        → Requires Premium
❌ Create live polls            → Requires Level 2 + Premium
❌ Create surveys               → Requires Organization
❌ View PULSE without voting    → Requires Plus+
❌ Comment without voting       → Requires Plus+
❌ Use pre-test screening       → Requires Premium
❌ Target audience filtering    → Requires Premium
❌ More than 4 poll options     → Requires Premium
❌ Create > 3 polls/day         → Requires Plus/Premium
❌ Export analytics             → Requires Premium
❌ DM > 5 non-friends/day       → Requires Plus+
```

---

## 5. Plus User Flows

> **Auth:** Required (🔐)
> **Verification Level:** 1+
> **Subscription:** Plus ($4.99/mo)
> **Response Weight:** 1.0x (same as Basic)

### 5.1 Key Feature: View Without Participation (P-016)

```
FLOW: View PULSE results without voting (KEY MONETIZATION)
┌─────────────────────────────────────────────────────────────────┐
│ GET /polls/:id/results                                          │
│ Headers: Authorization: Bearer {token}                          │
│ PRE-CONDITION: subscription.tier >= PLUS                        │
│                                                                 │
│ → Can view results WITHOUT voting first                         │
│ → Can see demographic breakdowns                                │
│ → Can see vote distribution over time                           │
│                                                                 │
│ Note: Still CANNOT write comments without voting (P-060)        │
└─────────────────────────────────────────────────────────────────┘

FLOW: Alternative for Free users
┌─────────────────────────────────────────────────────────────────┐
│ POST /polls/:id/access-request                                  │
│ Body: { reason: "100+ character explanation..." }               │
│ → Request PULSE access (requires justification - P-004)         │
│ → Creator approves/denies manually                              │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Enhanced Limits

```
FLOW: Create more polls (10/day)
┌─────────────────────────────────────────────────────────────────┐
│ POST /polls                                                     │
│ Rate Limit: 10 polls/day (vs 3 for Free)                        │
│ Max Options: 4 (same as Free)                                   │
│ Types Allowed: QUICK_POLL only                                  │
└─────────────────────────────────────────────────────────────────┘

FLOW: Enhanced DM (25/day to non-friends)
┌─────────────────────────────────────────────────────────────────┐
│ POST /messages                                                  │
│ Body: { recipientId, content }                                  │
│ Rate Limit: 25/day to non-friends (vs 5 for Free)               │
└─────────────────────────────────────────────────────────────────┘

FLOW: Enhanced search (60/min)
┌─────────────────────────────────────────────────────────────────┐
│ GET /search?q=keyword                                           │
│ Rate Limit: 60/min (vs 30 for Free)                             │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Cannot Do (Plus Restrictions)

```
❌ Create extended polls         → Requires Premium
❌ Create live polls             → Requires Level 2 + Premium
❌ Create surveys                → Requires Organization
❌ Use pre-test screening        → Requires Premium
❌ Target audience filtering     → Requires Premium
❌ More than 4 poll options      → Requires Premium
❌ Export analytics              → Requires Premium
❌ Comment without voting        → Still requires voting (P-060)
```

---

## 6. Premium User Flows

> **Auth:** Required (🔐)
> **Verification Level:** 1+ (2+ for live polls)
> **Subscription:** Premium ($9.99/mo)
> **Response Weight:** 1.0x (base) + verification bonus

### 6.1 Extended Poll Creation

```
FLOW: Create extended poll with advanced features
┌─────────────────────────────────────────────────────────────────┐
│ POST /polls                                                     │
│ Body: {                                                         │
│   title: "Comprehensive survey question",                       │
│   type: "STANDARD",  // or "RANKED_CHOICE", "DEMOGRAPHIC"       │
│   visibility: "PUBLIC",                                         │
│   options: [                                                    │
│     { text: "Option 1", imageUrl: "..." },                      │
│     { text: "Option 2", imageUrl: "..." },                      │
│     // ... up to 10 options                                     │
│   ],                                                            │
│   allowMultipleVotes: true,                                     │
│   maxVotesPerUser: 3,                                           │
│   showResultsBeforeVote: false,                                 │
│   allowDiscussion: true,                                        │
│   endsAt: "2026-02-01T00:00:00Z",                               │
│   categoryId: "cat_xxx",                                        │
│   tags: ["politics", "opinion"],                                │
│                                                                 │
│   // PREMIUM FEATURES:                                          │
│   preTest: {                                                    │
│     questions: [                                                │
│       {                                                         │
│         question: "Are you 18+?",                               │
│         type: "YES_NO",                                         │
│         required: true,                                         │
│         correctAnswer: "yes"                                    │
│       }                                                         │
│     ],                                                          │
│     passThreshold: 1                                            │
│   },                                                            │
│   targetAudience: {                                             │
│     ageRange: { min: 18, max: 35 },                             │
│     gender: ["MALE", "FEMALE"],                                 │
│     locations: ["TR", "US"],                                    │
│     verificationLevel: 1                                        │
│   },                                                            │
│   theme: {                                                      │
│     primaryColor: "#FF5733",                                    │
│     backgroundColor: "#FFFFFF"                                  │
│   }                                                             │
│ }                                                               │
│ Rate Limit: Unlimited polls/day                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Pre-test Flow (P-014, P-030)

```
FLOW: Poll with pre-test screening
┌─────────────────────────────────────────────────────────────────┐
│ VOTER PERSPECTIVE:                                              │
│                                                                 │
│ GET /polls/:id                                                  │
│ → Poll details with hasPreTest: true                            │
│                                                                 │
│ GET /polls/:id/pretest                                          │
│ → Get pre-test questions (shuffled)                             │
│                                                                 │
│ POST /polls/:id/pretest/submit                                  │
│ Body: { answers: [...] }                                        │
│ → If PASS: Can proceed to vote                                  │
│ → If FAIL: "Not qualified" message (polite - P-108)             │
│                                                                 │
│ RETRY POLICY (P-030):                                           │
│ - Max 3 attempts                                                │
│ - Cooldown: 1h → 2h → 24h                                       │
│ - Questions/options shuffled on each attempt                    │
│ - Correct answers NEVER shown                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Live Poll Creation (Requires Level 2)

```
FLOW: Create and manage live poll
┌─────────────────────────────────────────────────────────────────┐
│ PRE-CONDITION: verificationLevel >= 2, tier = PREMIUM           │
│                                                                 │
│ POST /polls                                                     │
│ Body: {                                                         │
│   title: "Live: What should we do next?",                       │
│   type: "LIVE_POLL",                                            │
│   visibility: "PUBLIC",                                         │
│   options: [...],                                               │
│   liveSettings: {                                               │
│     duration: 300,  // 5 minutes                                │
│     showLiveCount: true,                                        │
│     allowLateJoin: true,                                        │
│     maxParticipants: 10000  // P-040                            │
│   }                                                             │
│ }                                                               │
│ → Returns: poll with joinCode (6-char)                          │
│                                                                 │
│ POST /live/:id/start                                            │
│ → Start live session                                            │
│ → WebSocket channel opened                                      │
│                                                                 │
│ POST /live/:id/pause                                            │
│ → Pause (voting continues, no new questions)                    │
│                                                                 │
│ POST /live/:id/resume                                           │
│ → Resume session                                                │
│                                                                 │
│ POST /live/:id/next-question                                    │
│ → Advance to next question (multi-question live poll)           │
│                                                                 │
│ GET /live/:id/participants                                      │
│ → Current participant count/list                                │
│                                                                 │
│ POST /live/:id/end                                              │
│ → End session, final results                                    │
│                                                                 │
│ WEBSOCKET: ws://api.voxpoll.com/live/{sessionId}                │
│ HOST EVENTS:                                                    │
│   ← vote: New vote received                                     │
│   ← participant_count: Count update                             │
│   ← presence: User join/leave                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Advanced Analytics

```
FLOW: View detailed analytics (creator)
┌─────────────────────────────────────────────────────────────────┐
│ GET /analytics/polls/:id                                        │
│ PRE-CONDITION: poll.creatorId === userId, tier = PREMIUM        │
│                                                                 │
│ Response: {                                                     │
│   overview: {                                                   │
│     totalVotes,                                                 │
│     uniqueParticipants,                                         │
│     avgTimeToVote,                                              │
│     completionRate                                              │
│   },                                                            │
│   demographics: {                                               │
│     byAge: [...],                                               │
│     byGender: [...],                                            │
│     byLocation: [...],                                          │
│     byVerificationLevel: [...]                                  │
│   },                                                            │
│   timeline: {                                                   │
│     hourly: [...],                                              │
│     daily: [...]                                                │
│   },                                                            │
│   optionBreakdown: [...]                                        │
│ }                                                               │
│                                                                 │
│ GET /analytics/polls/:id/export                                 │
│ Query: { format: "csv" | "json" | "xlsx" }                      │
│ → Export analytics data                                         │
│                                                                 │
│ GET /analytics/overview                                         │
│ → User dashboard: all polls performance                         │
└─────────────────────────────────────────────────────────────────┘
```

### 6.5 Enhanced Everything

```
FLOW: Premium rate limits
┌─────────────────────────────────────────────────────────────────┐
│ - Unlimited polls/day                                           │
│ - 100 DMs/day to non-friends                                    │
│ - 120 searches/min                                              │
│ - 200 comments/hour                                             │
│ - Up to 10 poll options                                         │
│ - All poll types (STANDARD, RANKED_CHOICE, DEMOGRAPHIC)         │
│ - Custom themes                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Organization Member Flows

> **Auth:** Required (🔐)
> **Verification Level:** 1+ (varies by org settings)
> **Role:** MEMBER in organization

### 7.1 Join Organization

```
FLOW: Join via invitation link
┌─────────────────────────────────────────────────────────────────┐
│ GET /organizations/invite/:code                                 │
│ → View invitation details (org name, role, inviter)             │
│                                                                 │
│ POST /organizations/invite/:code/accept                         │
│ Headers: Authorization: Bearer {token}                          │
│ → Accept invitation, become MEMBER (or assigned role)           │
└─────────────────────────────────────────────────────────────────┘

FLOW: Join via domain (auto-join enabled)
┌─────────────────────────────────────────────────────────────────┐
│ POST /organizations/:slug/join                                  │
│ PRE-CONDITION: user.email ends with org.verifiedDomain          │
│ → Auto-join as MEMBER (or pending approval)                     │
└─────────────────────────────────────────────────────────────────┘

FLOW: Join via SSO
┌─────────────────────────────────────────────────────────────────┐
│ POST /auth/sso/initiate                                         │
│ Body: { organizationSlug, returnUrl }                           │
│ → Redirect to IdP                                               │
│                                                                 │
│ POST /auth/sso/callback                                         │
│ → Process SAML/OIDC response                                    │
│ → Auto-provision user if new                                    │
│ → verificationLevel = 2 automatically                           │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Participate in Surveys

```
FLOW: Respond to organization survey
┌─────────────────────────────────────────────────────────────────┐
│ GET /organizations/:slug/surveys                                │
│ PRE-CONDITION: isMember(org)                                    │
│ → List available surveys                                        │
│                                                                 │
│ GET /surveys/:id                                                │
│ PRE-CONDITION: isMember(survey.organization)                    │
│ → View survey details                                           │
│                                                                 │
│ POST /surveys/:id/respond                                       │
│ Body: {                                                         │
│   answers: [                                                    │
│     { questionId: "q1", value: "answer" },                      │
│     { questionId: "q2", value: 5 },                             │
│     { questionId: "q3", value: ["a", "b"] }                     │
│   ]                                                             │
│ }                                                               │
│ → Submit survey response                                        │
│                                                                 │
│ Note: May be anonymous depending on survey settings             │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 View Organization

```
FLOW: View organization details
┌─────────────────────────────────────────────────────────────────┐
│ GET /organizations                                              │
│ → List organizations user belongs to                            │
│                                                                 │
│ GET /organizations/:slug                                        │
│ PRE-CONDITION: isMember(org)                                    │
│ → View organization details                                     │
│                                                                 │
│ GET /organizations/:slug/members                                │
│ PRE-CONDITION: isMember(org)                                    │
│ → List members (limited view: name, role only)                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Cannot Do (Member Restrictions)

```
❌ POST /organizations/:slug/invite         → Requires ADMIN
❌ PATCH /organizations/:slug/members/:id   → Requires ADMIN
❌ POST /surveys                            → Requires CREATOR+ role
❌ GET /surveys/:id/results                 → Requires ANALYST+ role
❌ PUT /organizations/:slug                 → Requires ADMIN
❌ GET /organizations/:slug/audit-logs      → Requires ADMIN
```

---

## 8. Organization Admin Flows

> **Auth:** Required (🔐)
> **Verification Level:** 3+ (4 for OWNER)
> **Role:** ADMIN/OWNER in organization

### 8.1 Member Management

```
FLOW: Invite members
┌─────────────────────────────────────────────────────────────────┐
│ POST /organizations/:slug/invite                                │
│ PRE-CONDITION: hasPermission('members:manage')                  │
│ Body: {                                                         │
│   email: "user@example.com",                                    │
│   role: "MEMBER" | "CREATOR" | "ANALYST" | "MANAGER",           │
│   message?: "Welcome to our organization!"                      │
│ }                                                               │
│ → Send invitation email                                         │
│                                                                 │
│ POST /organizations/:slug/invite/bulk                           │
│ PRE-CONDITION: plan = ENTERPRISE                                │
│ Body: {                                                         │
│   users: [                                                      │
│     { email: "user1@example.com", role: "MEMBER" },             │
│     { email: "user2@example.com", role: "CREATOR" }             │
│   ]                                                             │
│ }                                                               │
│ → Bulk invite (Enterprise only)                                 │
└─────────────────────────────────────────────────────────────────┘

FLOW: Manage invitations
┌─────────────────────────────────────────────────────────────────┐
│ GET /organizations/:slug/invitations                            │
│ → List pending invitations                                      │
│                                                                 │
│ POST /organizations/:slug/invitations/:id/resend                │
│ → Resend invitation email                                       │
│                                                                 │
│ DELETE /organizations/:slug/invitations/:id                     │
│ → Cancel invitation                                             │
└─────────────────────────────────────────────────────────────────┘

FLOW: Manage member roles
┌─────────────────────────────────────────────────────────────────┐
│ GET /organizations/:slug/members                                │
│ → Full member list with details                                 │
│                                                                 │
│ POST /organizations/:slug/members                               │
│ Body: { userId, role }                                          │
│ → Add existing user directly (if domain verified)               │
│                                                                 │
│ PATCH /organizations/:slug/members/:userId                      │
│ Body: { role: "NEW_ROLE" }                                      │
│ → Change member role (cannot promote to OWNER)                  │
│                                                                 │
│ DELETE /organizations/:slug/members/:userId                     │
│ → Remove member (P-033 offboarding)                             │
│ → Data anonymized, surveys transferred                          │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Survey Management

```
FLOW: Create organization survey
┌─────────────────────────────────────────────────────────────────┐
│ POST /surveys                                                   │
│ OR: POST /organizations/:slug/surveys                           │
│ PRE-CONDITION: hasPermission('surveys:create'), Level >= 2      │
│ Body: {                                                         │
│   title: "Employee Satisfaction Survey",                        │
│   description: "...",                                           │
│   organizationId: "org_xxx",                                    │
│   visibility: "ORGANIZATION",                                   │
│   sections: [                                                   │
│     {                                                           │
│       title: "Work Environment",                                │
│       questions: [                                              │
│         {                                                       │
│           type: "RATING_SCALE",                                 │
│           question: "Rate your workspace",                      │
│           required: true,                                       │
│           options: { min: 1, max: 5 }                           │
│         },                                                      │
│         {                                                       │
│           type: "MULTIPLE_CHOICE",                              │
│           question: "Preferred work style",                     │
│           options: ["Remote", "Hybrid", "Office"]               │
│         },                                                      │
│         {                                                       │
│           type: "TEXT",                                         │
│           question: "Any suggestions?",                         │
│           required: false                                       │
│         }                                                       │
│       ]                                                         │
│     }                                                           │
│   ],                                                            │
│   settings: {                                                   │
│     anonymous: true,                                            │
│     deadline: "2026-02-01T00:00:00Z",                           │
│     reminderDays: [3, 1],                                       │
│     allowPartialSave: true                                      │
│   }                                                             │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘

FLOW: Manage survey
┌─────────────────────────────────────────────────────────────────┐
│ PUT /surveys/:id                                                │
│ → Update survey (before publish)                                │
│                                                                 │
│ GET /surveys/:id/preview                                        │
│ → Preview without recording                                     │
│                                                                 │
│ POST /surveys/:id/publish                                       │
│ → Publish survey                                                │
│                                                                 │
│ POST /surveys/:id/invite                                        │
│ Body: { memberIds: [...] }                                      │
│ → Send invitations to specific members                          │
│                                                                 │
│ POST /surveys/:id/reminder                                      │
│ → Send reminder to non-respondents                              │
│                                                                 │
│ GET /surveys/:id/stats                                          │
│ → Completion statistics                                         │
│                                                                 │
│ POST /surveys/:id/close                                         │
│ → Close survey                                                  │
└─────────────────────────────────────────────────────────────────┘

FLOW: View results (ADMIN/MANAGER/ANALYST)
┌─────────────────────────────────────────────────────────────────┐
│ GET /surveys/:id/results                                        │
│ PRE-CONDITION: hasPermission('results:view')                    │
│ → Full results with breakdowns                                  │
│                                                                 │
│ GET /surveys/:id/results/export                                 │
│ PRE-CONDITION: hasPermission('results:export')                  │
│ Query: { format: "csv" | "xlsx" | "json" }                      │
│ → Export full response data                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Organization Settings

```
FLOW: Update organization settings
┌─────────────────────────────────────────────────────────────────┐
│ PUT /organizations/:slug                                        │
│ PRE-CONDITION: hasPermission('org:settings')                    │
│ Body: {                                                         │
│   name?: "New Name",                                            │
│   description?: "...",                                          │
│   logoUrl?: "..."                                               │
│ }                                                               │
│                                                                 │
│ PUT /organizations/:slug/settings                               │
│ Body: {                                                         │
│   defaultMemberRole: "MEMBER",                                  │
│   requireApproval: true,                                        │
│   allowDomainJoin: true,                                        │
│   verifiedDomain: "company.com"                                 │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘

FLOW: Configure SSO (Enterprise)
┌─────────────────────────────────────────────────────────────────┐
│ PUT /organizations/:slug/sso                                    │
│ PRE-CONDITION: hasPermission('org:sso'), plan = ENTERPRISE      │
│ Body: {                                                         │
│   provider: "SAML" | "OIDC",                                    │
│   config: {                                                     │
│     entityId: "...",                                            │
│     ssoUrl: "...",                                              │
│     certificate: "..."                                          │
│   }                                                             │
│ }                                                               │
│                                                                 │
│ GET /organizations/:slug/sso/metadata                           │
│ → Get SAML metadata for IdP configuration                       │
└─────────────────────────────────────────────────────────────────┘

FLOW: View audit logs
┌─────────────────────────────────────────────────────────────────┐
│ GET /organizations/:slug/audit-logs                             │
│ PRE-CONDITION: hasPermission('org:audit')                       │
│ Query: { page, limit, action?, userId?, from?, to? }            │
│ → List audit events (member changes, survey actions, etc.)      │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 Owner-Only Actions

```
FLOW: Transfer ownership
┌─────────────────────────────────────────────────────────────────┐
│ POST /organizations/:slug/transfer                              │
│ PRE-CONDITION: role = OWNER                                     │
│ Body: { newOwnerId, password }                                  │
│ → Requires password confirmation                                │
│ → Transfers ownership, current owner becomes ADMIN              │
└─────────────────────────────────────────────────────────────────┘

FLOW: Manage billing
┌─────────────────────────────────────────────────────────────────┐
│ GET /organizations/:slug/billing                                │
│ → Current plan, payment method, usage                           │
│                                                                 │
│ PUT /organizations/:slug/billing                                │
│ Body: { plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE" }       │
│ → Upgrade/downgrade plan                                        │
│                                                                 │
│ GET /organizations/:slug/invoices                               │
│ → List invoices                                                 │
│                                                                 │
│ GET /organizations/:slug/invoices/:id                           │
│ → Download invoice PDF                                          │
└─────────────────────────────────────────────────────────────────┘

FLOW: Delete organization
┌─────────────────────────────────────────────────────────────────┐
│ DELETE /organizations/:slug                                     │
│ PRE-CONDITION: role = OWNER                                     │
│ Body: { password, confirmation: "DELETE" }                      │
│ → Requires password + 2FA if enabled                            │
│ → 30-day grace period for recovery                              │
│ → All data anonymized after grace period                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Moderator Flows

> **Auth:** Required (🔐)
> **Platform Role:** MODERATOR
> **Verification Level:** 3+

### 9.1 Review Reports

```
FLOW: View and process reports
┌─────────────────────────────────────────────────────────────────┐
│ GET /admin/reports                                              │
│ PRE-CONDITION: role >= MODERATOR                                │
│ Query: { status, type, priority, page, limit }                  │
│ → List reports (optionally filtered/assigned)                   │
│                                                                 │
│ GET /admin/reports/:id                                          │
│ → View report details with full context                         │
│   - Reported content                                            │
│   - Reporter history                                            │
│   - Target user history                                         │
│   - Similar reports                                             │
│                                                                 │
│ PUT /admin/reports/:id                                          │
│ Body: {                                                         │
│   action: "DISMISS" | "WARN" | "REMOVE_CONTENT" | "SUSPEND",    │
│   reason: "...",                                                │
│   internalNotes?: "...",                                        │
│   duration?: "24h" | "7d" | "30d"  // for suspend               │
│ }                                                               │
│ → Process report                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Content Moderation

```
FLOW: Moderate polls
┌─────────────────────────────────────────────────────────────────┐
│ POST /admin/polls/:id/hide                                      │
│ Body: { reason }                                                │
│ → Hide poll from public view (reversible)                       │
│                                                                 │
│ POST /admin/polls/:id/unhide                                    │
│ Body: { reason }                                                │
│ → Restore poll visibility                                       │
└─────────────────────────────────────────────────────────────────┘

FLOW: Moderate comments
┌─────────────────────────────────────────────────────────────────┐
│ POST /admin/comments/:id/remove                                 │
│ Body: { reason }                                                │
│ → Remove comment                                                │
│                                                                 │
│ POST /admin/comments/:id/edit                                   │
│ Body: { content, reason }                                       │
│ → Edit comment (censorship with audit trail)                    │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 User Moderation

```
FLOW: User actions
┌─────────────────────────────────────────────────────────────────┐
│ POST /admin/users/:id/warn                                      │
│ Body: { reason, expiresAt? }                                    │
│ → Issue warning to user                                         │
│ → User receives notification                                    │
│                                                                 │
│ POST /admin/users/:id/suspend                                   │
│ PRE-CONDITION: role >= MODERATOR                                │
│ Body: {                                                         │
│   reason: "...",                                                │
│   duration: "24h" | "7d" | "30d" | "permanent"                  │
│ }                                                               │
│ → Suspend user account                                          │
│ → All sessions invalidated                                      │
│                                                                 │
│ POST /admin/users/:id/unsuspend                                 │
│ Body: { reason }                                                │
│ → Lift suspension                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 9.4 Cannot Do (Moderator Restrictions)

```
❌ POST /admin/users/:id/ban        → Requires ADMIN
❌ DELETE /admin/polls/:id          → Requires ADMIN (hard delete)
❌ GET /admin/users                  → Requires ADMIN
❌ GET /admin/config                 → Requires SUPER_ADMIN
❌ PUT /admin/config                 → Requires SUPER_ADMIN
❌ GET /admin/analytics/*            → Requires SUPER_ADMIN
```

---

## 10. Super Admin Flows

> **Auth:** Required (🔐)
> **Platform Role:** SUPER_ADMIN
> **Verification Level:** 4

### 10.1 User Management

```
FLOW: Full user management
┌─────────────────────────────────────────────────────────────────┐
│ GET /admin/users                                                │
│ Query: { search, status, verificationLevel, role, tier, page }  │
│ → List all users                                                │
│                                                                 │
│ GET /admin/users/:id                                            │
│ → View full user details including private info                 │
│   - Email, phone                                                │
│   - Verification documents                                      │
│   - Payment history                                             │
│   - All sessions                                                │
│                                                                 │
│ PATCH /admin/users/:id                                          │
│ Body: { role?, status?, verificationLevel?, tier? }             │
│ → Update user (assign roles, change status)                     │
│                                                                 │
│ POST /admin/users/:id/verify                                    │
│ Body: { level, reason }                                         │
│ → Manually set verification level                               │
│                                                                 │
│ POST /admin/users/:id/ban                                       │
│ Body: { reason, permanent: true }                               │
│ → Permanently ban user                                          │
│                                                                 │
│ POST /admin/users/:id/unban                                     │
│ Body: { reason }                                                │
│ → Remove ban                                                    │
│                                                                 │
│ DELETE /admin/users/:id                                         │
│ → Hard delete user (GDPR request)                               │
│ → Irreversible                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Organization Management

```
FLOW: Manage all organizations
┌─────────────────────────────────────────────────────────────────┐
│ GET /admin/organizations                                        │
│ Query: { search, plan, status, page }                           │
│ → List all organizations                                        │
│                                                                 │
│ PATCH /admin/organizations/:id                                  │
│ Body: { plan?, status?, features? }                             │
│ → Update organization settings                                  │
│                                                                 │
│ DELETE /admin/organizations/:id                                 │
│ → Force delete organization (bypass grace period)               │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 Platform Analytics

```
FLOW: View platform analytics
┌─────────────────────────────────────────────────────────────────┐
│ GET /admin/analytics/platform                                   │
│ Query: { from, to, granularity: "hour" | "day" | "week" }       │
│ → Platform-wide metrics                                         │
│   - DAU, WAU, MAU                                               │
│   - Total polls, votes, comments                                │
│   - API usage                                                   │
│                                                                 │
│ GET /admin/analytics/users                                      │
│ → User metrics                                                  │
│   - Growth rate                                                 │
│   - Retention cohorts                                           │
│   - Verification funnel                                         │
│   - Subscription conversions                                    │
│                                                                 │
│ GET /admin/analytics/content                                    │
│ → Content metrics                                               │
│   - Polls created/day                                           │
│   - Engagement rates                                            │
│   - Report rates                                                │
│                                                                 │
│ GET /admin/analytics/revenue                                    │
│ → Revenue metrics                                               │
│   - MRR, ARR                                                    │
│   - Churn rate                                                  │
│   - LTV                                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 10.4 System Configuration

```
FLOW: System configuration
┌─────────────────────────────────────────────────────────────────┐
│ GET /admin/config                                               │
│ → View system configuration                                     │
│                                                                 │
│ PUT /admin/config                                               │
│ Body: { key, value }                                            │
│ → Update system configuration                                   │
│ → Audit logged                                                  │
│                                                                 │
│ GET /admin/feature-flags                                        │
│ → List all feature flags                                        │
│                                                                 │
│ PUT /admin/feature-flags/:flag                                  │
│ Body: { enabled, rolloutPercentage?, userIds? }                 │
│ → Update feature flag (gradual rollout)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Authentication Flows

### 11.1 Email/Password Registration

```
SEQUENCE: Complete registration flow
┌─────────────────────────────────────────────────────────────────┐
│ 1. POST /auth/register                                          │
│    Body: { email, password, username, displayName? }            │
│    Validation:                                                  │
│      - Email: valid format, not taken                           │
│      - Password: 8+ chars, uppercase, lowercase, number         │
│      - Username: 3-30 chars, alphanumeric + underscore          │
│    → Account created, status: PENDING_VERIFICATION              │
│                                                                 │
│ 2. [EMAIL] Verification email sent                              │
│    Link: /auth/verify-email?token=xxx (expires 24h)             │
│                                                                 │
│ 3. POST /auth/verify-email                                      │
│    Body: { token }                                              │
│    → Email verified, status: ACTIVE                             │
│    → verificationLevel: 0                                       │
│                                                                 │
│ 4. POST /auth/login                                             │
│    Body: { email, password }                                    │
│    → Session created                                            │
│    → Returns: { user, session }                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 OAuth Flow (Google/Apple)

```
SEQUENCE: OAuth authentication (P-049: ONLY Google, Apple supported)
┌─────────────────────────────────────────────────────────────────┐
│ 1. GET /auth/oauth/google/initiate                              │
│    Query: { returnUrl }                                         │
│    → Redirect to Google OAuth                                   │
│                                                                 │
│ 2. [EXTERNAL] User authenticates with Google                    │
│                                                                 │
│ 3. GET /auth/oauth/google/callback                              │
│    Query: { code, state }                                       │
│    → Exchange code for tokens                                   │
│    → Create account OR link to existing                         │
│                                                                 │
│ Result:                                                         │
│ - NEW user: verificationLevel 0, prompted for phone             │
│ - EXISTING user (email match): Login, level preserved           │
│ - EXISTING user (link): OAuth added to account                  │
│                                                                 │
│ LINK OAUTH TO EXISTING ACCOUNT:                                 │
│ POST /auth/oauth/link                                           │
│ Body: { provider, authorizationCode }                           │
│ → Link provider to current account                              │
│                                                                 │
│ UNLINK OAUTH:                                                   │
│ DELETE /auth/oauth/google                                       │
│ PRE-CONDITION: Must have password OR another provider           │
│ → Remove Google from account                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Password Reset Flow

```
SEQUENCE: Password reset
┌─────────────────────────────────────────────────────────────────┐
│ 1. POST /auth/forgot-password                                   │
│    Body: { email }                                              │
│    Rate Limit: 3/hour                                           │
│    → Always returns 200 (security: don't reveal if email exists)│
│                                                                 │
│ 2. [EMAIL] Reset link sent (if email exists)                    │
│    Link: /auth/reset-password?token=xxx (expires 1 hour)        │
│                                                                 │
│ 3. POST /auth/reset-password                                    │
│    Body: { token, newPassword }                                 │
│    → Password updated                                           │
│    → ALL sessions invalidated                                   │
│    → User must login again                                      │
│    → Security notification email sent                           │
└─────────────────────────────────────────────────────────────────┘
```

### 11.4 Session Management

```
FLOW: Token lifecycle
┌─────────────────────────────────────────────────────────────────┐
│ Access Token: 15 minutes                                        │
│ Refresh Token: 30 days (single-use, rotated)                    │
│                                                                 │
│ POST /auth/refresh                                              │
│ Body: { refreshToken }                                          │
│ Rate Limit: 10/hour                                             │
│ → New access + refresh tokens                                   │
│ → Old refresh token invalidated                                 │
│                                                                 │
│ IF refresh token reused (stolen):                               │
│ → ALL sessions for user invalidated                             │
│ → Security alert sent                                           │
└─────────────────────────────────────────────────────────────────┘

FLOW: View and manage sessions
┌─────────────────────────────────────────────────────────────────┐
│ GET /auth/sessions                                              │
│ → List all active sessions                                      │
│   - Device, browser, location                                   │
│   - Last active time                                            │
│   - isCurrent flag                                              │
│                                                                 │
│ DELETE /auth/sessions/:id                                       │
│ → Revoke specific session                                       │
│                                                                 │
│ POST /auth/logout-all                                           │
│ → Invalidate ALL sessions                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 11.5 2FA Flow

```
SEQUENCE: 2FA during login
┌─────────────────────────────────────────────────────────────────┐
│ 1. POST /auth/login                                             │
│    Body: { email, password }                                    │
│    IF 2FA enabled:                                              │
│    → Returns: { requires2FA: true, tempToken }                  │
│                                                                 │
│ 2. POST /auth/login/2fa                                         │
│    Body: { tempToken, code }                                    │
│    → Full session created                                       │
│                                                                 │
│ IF backup code used:                                            │
│ POST /auth/login/2fa                                            │
│ Body: { tempToken, backupCode }                                 │
│ → Backup code consumed                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Verification Upgrade Flows

### 12.1 Level 0 → Level 1 (Phone)

```
SEQUENCE: Phone verification
┌─────────────────────────────────────────────────────────────────┐
│ PRE: User logged in, verificationLevel = 0                      │
│                                                                 │
│ 1. POST /verification/phone/send                                │
│    Body: { phoneNumber: "+905551234567" }                       │
│    Rate Limit: 3 attempts, then 1 hour cooldown                 │
│    → OTP sent via SMS                                           │
│                                                                 │
│ 2. POST /verification/phone/verify                              │
│    Body: { phoneNumber, otp }                                   │
│    → Phone linked                                               │
│    → verificationLevel = 1                                      │
│                                                                 │
│ CONSTRAINTS:                                                    │
│ - OTP expires in 10 minutes                                     │
│ - Max 3 attempts per OTP                                        │
│ - One phone per account                                         │
│ - Phone cannot be reused by another account                     │
│ - Phone change = 7-day waiting period                           │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Level 1 → Level 2 (Enhanced)

```
SEQUENCE: Enhanced verification (Option A - 2FA + Selfie)
┌─────────────────────────────────────────────────────────────────┐
│ PRE: verificationLevel = 1                                      │
│                                                                 │
│ 1. ENABLE 2FA:                                                  │
│    POST /verification/2fa/enable                                │
│    → Returns: { secret, qrCode, backupCodes }                   │
│                                                                 │
│    POST /verification/2fa/verify                                │
│    Body: { code }                                               │
│    → 2FA enabled                                                │
│                                                                 │
│ 2. SELFIE VERIFICATION:                                         │
│    POST /verification/selfie/upload                             │
│    Body: FormData with selfie image                             │
│    → Liveness check initiated (AI)                              │
│                                                                 │
│    GET /verification/selfie/status                              │
│    → Check status: PENDING, APPROVED, REJECTED                  │
│                                                                 │
│ 3. [ASYNC] Manual review if AI uncertain (24-48 hours)          │
│                                                                 │
│ 4. [NOTIFICATION] Verification result                           │
│    → verificationLevel = 2 (if approved)                        │
└─────────────────────────────────────────────────────────────────┘

SEQUENCE: Enhanced verification (Option B - Organization SSO)
┌─────────────────────────────────────────────────────────────────┐
│ 1. Accept organization invitation with SSO enabled              │
│                                                                 │
│ 2. POST /auth/sso/initiate                                      │
│    Body: { organizationSlug }                                   │
│    → Redirect to IdP                                            │
│                                                                 │
│ 3. Complete SSO authentication                                  │
│                                                                 │
│ 4. POST /auth/sso/callback                                      │
│    → Account linked to organization                             │
│    → verificationLevel = 2 (automatic)                          │
└─────────────────────────────────────────────────────────────────┘
```

### 12.3 Level 2 → Level 3 (Identity)

```
SEQUENCE: Identity verification via e-Devlet (Turkey)
┌─────────────────────────────────────────────────────────────────┐
│ PRE: verificationLevel = 2                                      │
│                                                                 │
│ 1. POST /verification/edevlet/initiate                          │
│    → Returns: { authUrl }                                       │
│                                                                 │
│ 2. [EXTERNAL] User authenticates on e-Devlet portal             │
│                                                                 │
│ 3. GET /verification/edevlet/callback                           │
│    → Receive: fullName, birthDate, tcKimlikNo                   │
│    → Data stored (tcKimlikNo hashed)                            │
│    → verificationLevel = 3                                      │
└─────────────────────────────────────────────────────────────────┘

SEQUENCE: Identity verification via ID document (International)
┌─────────────────────────────────────────────────────────────────┐
│ 1. POST /verification/id/upload                                 │
│    Body: FormData { frontImage, backImage, documentType }       │
│    documentType: "PASSPORT" | "ID_CARD" | "DRIVERS_LICENSE"     │
│    → Documents uploaded for OCR                                 │
│                                                                 │
│ 2. POST /verification/id/liveness                               │
│    Body: FormData { video }                                     │
│    → Video selfie for liveness check                            │
│                                                                 │
│ 3. GET /verification/id/status                                  │
│    → Status: PENDING, PROCESSING, APPROVED, REJECTED            │
│                                                                 │
│ 4. [ASYNC] AI + Manual review (24-72 hours)                     │
│                                                                 │
│ 5. [NOTIFICATION] Result                                        │
│    → verificationLevel = 3 (if approved)                        │
│    → May request additional documents if failed                 │
└─────────────────────────────────────────────────────────────────┘
```

### 12.4 Level 3 → Level 4 (Full)

```
SEQUENCE: Full verification
┌─────────────────────────────────────────────────────────────────┐
│ PRE: verificationLevel = 3, account age >= 30 days at Level 3   │
│                                                                 │
│ 1. POST /verification/biometric                                 │
│    Body: { biometricData }                                      │
│    → Fingerprint or Face ID verification                        │
│                                                                 │
│ 2. POST /verification/address/upload                            │
│    Body: FormData { document, documentType }                    │
│    documentType: "UTILITY_BILL" | "BANK_STATEMENT"              │
│    → Address verification document (< 3 months old)             │
│                                                                 │
│ 3. POST /verification/phone/carrier                             │
│    → Carrier ownership verification                             │
│                                                                 │
│ 4. GET /verification/status                                     │
│    → Overall verification status with checklist                 │
│                                                                 │
│ 5. [ASYNC] Automated + Manual review (3-5 business days)        │
│                                                                 │
│ 6. [NOTIFICATION] Result                                        │
│    → verificationLevel = 4 (if approved)                        │
│    → May require video call if edge case                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. Content Lifecycle Flows

### 13.1 Poll Lifecycle

```
STATE MACHINE: Poll status transitions
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌───────┐                                                     │
│   │ DRAFT │────────────────────────────────────────┐            │
│   └───┬───┘                                        │            │
│       │ POST /polls/:id/publish                    │            │
│       ▼                                            │            │
│   ┌────────┐                                       │            │
│   │ ACTIVE │◄──────────────────────────────────────┤            │
│   └───┬────┘                                       │            │
│       │                                            │            │
│       ├── POST /polls/:id/close ──────┐            │            │
│       │                               ▼            │            │
│       │                          ┌────────┐        │            │
│       │                          │ CLOSED │        │            │
│       │                          └───┬────┘        │            │
│       │                              │             │            │
│       ├── POST /polls/:id/archive ───┼─────────────┤            │
│       │                              │             │            │
│       ▼                              ▼             │            │
│   ┌──────────┐                 ┌──────────┐        │            │
│   │ ARCHIVED │                 │ ARCHIVED │        │            │
│   └────┬─────┘                 └──────────┘        │            │
│        │                                           │            │
│        │ DELETE /polls/:id                         │            │
│        ▼                                           │            │
│   ┌─────────┐                                      │            │
│   │ DELETED │ (30-day retention)                   │            │
│   └─────────┘                                      │            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

FLOW: Complete poll lifecycle
┌─────────────────────────────────────────────────────────────────┐
│ 1. CREATE                                                       │
│    POST /polls                                                  │
│    → status: ACTIVE (or DRAFT if specified)                     │
│    → publishedAt: now (if ACTIVE)                               │
│                                                                 │
│ 2. PUBLISH (if draft)                                           │
│    POST /polls/:id/publish                                      │
│    → status: ACTIVE, publishedAt set                            │
│    → Appears in feeds                                           │
│                                                                 │
│ 3. ACTIVE PERIOD                                                │
│    - Users vote: POST /polls/:id/vote                           │
│    - Users comment: POST /polls/:id/comments                    │
│    - Creator views: GET /polls/:id/analytics                    │
│    - Creator edits (limited): PUT /polls/:id                    │
│    Note: Options cannot be changed after first vote             │
│                                                                 │
│ 4. AUTO-CLOSE (if endsAt set)                                   │
│    [SYSTEM] When endsAt reached                                 │
│    → status: CLOSED                                             │
│    → No more voting                                             │
│                                                                 │
│ 5. MANUAL CLOSE                                                 │
│    POST /polls/:id/close                                        │
│    → status: CLOSED                                             │
│                                                                 │
│ 6. ARCHIVE                                                      │
│    POST /polls/:id/archive                                      │
│    → status: ARCHIVED                                           │
│    → Hidden from feeds (still accessible via direct link)       │
│                                                                 │
│ 7. UNARCHIVE                                                    │
│    POST /polls/:id/unarchive                                    │
│    → status: CLOSED (not ACTIVE)                                │
│    → Visible again                                              │
│                                                                 │
│ 8. DELETE (soft)                                                │
│    DELETE /polls/:id                                            │
│    → deletedAt set                                              │
│    → Hidden from all                                            │
│    → Data retained 30 days (GDPR)                               │
│                                                                 │
│ 9. PURGE (system)                                               │
│    [SYSTEM] 30 days after delete                                │
│    → Data anonymized                                            │
│    → Aggregate responses kept for analytics                     │
└─────────────────────────────────────────────────────────────────┘
```

### 13.2 Survey Lifecycle

```
FLOW: Organization survey lifecycle
┌─────────────────────────────────────────────────────────────────┐
│ 1. CREATE (Draft)                                               │
│    POST /surveys                                                │
│    → status: DRAFT                                              │
│    → Not visible to members yet                                 │
│                                                                 │
│ 2. EDIT                                                         │
│    PUT /surveys/:id                                             │
│    → Can modify all fields while DRAFT                          │
│                                                                 │
│ 3. PREVIEW                                                      │
│    GET /surveys/:id/preview                                     │
│    → Test survey without recording responses                    │
│                                                                 │
│ 4. PUBLISH                                                      │
│    POST /surveys/:id/publish                                    │
│    → status: ACTIVE                                             │
│    → Invitations sent if configured                             │
│    → Members can respond                                        │
│                                                                 │
│ 5. ACTIVE PERIOD                                                │
│    - Members respond: POST /surveys/:id/respond                 │
│    - Reminders sent: [SYSTEM] at configured intervals           │
│    - Admins view progress: GET /surveys/:id/stats               │
│    - Admins view results: GET /surveys/:id/results              │
│                                                                 │
│ 6. CLOSE                                                        │
│    POST /surveys/:id/close                                      │
│    OR [SYSTEM] deadline reached                                 │
│    → status: CLOSED                                             │
│    → Final results available                                    │
│    → No more responses                                          │
│                                                                 │
│ 7. EXPORT                                                       │
│    GET /surveys/:id/results/export                              │
│    → Download responses in CSV/XLSX/JSON                        │
│                                                                 │
│ 8. DELETE                                                       │
│    DELETE /surveys/:id                                          │
│    → Soft delete with 30-day retention                          │
└─────────────────────────────────────────────────────────────────┘
```

### 13.3 Live Poll Lifecycle

```
FLOW: Live poll session
┌─────────────────────────────────────────────────────────────────┐
│ 1. CREATE                                                       │
│    POST /polls (type: LIVE_POLL)                                │
│    → status: DRAFT                                              │
│    → joinCode generated (6 chars)                               │
│                                                                 │
│ 2. START SESSION                                                │
│    POST /live/:id/start                                         │
│    → status: LIVE                                               │
│    → WebSocket channel opened                                   │
│    → Participants can join via code                             │
│                                                                 │
│ 3. LIVE PERIOD                                                  │
│    - Participants join: POST /live/sessions/:code/join                    │
│    - Participants vote: POST /live/:id/vote                     │
│    - Host advances: POST /live/:id/next-question                │
│    - Real-time updates via WebSocket                            │
│                                                                 │
│ 4. PAUSE (optional)                                             │
│    POST /live/:id/pause                                         │
│    → Voting paused                                              │
│    → Participants still connected                               │
│                                                                 │
│    POST /live/:id/resume                                        │
│    → Voting resumed                                             │
│                                                                 │
│ 5. END                                                          │
│    POST /live/:id/end                                           │
│    OR [SYSTEM] duration exceeded                                │
│    → status: CLOSED                                             │
│    → Final results shown                                        │
│    → WebSocket channel closed                                   │
│                                                                 │
│ DISCONNECT HANDLING (P-031):                                    │
│ - Host disconnect: 1 min grace, voting continues                │
│ - Participant disconnect: votes preserved, can rejoin           │
│ - Network glitch: queue votes locally, retry on reconnect       │
│                                                                 │
│ CAPACITY (P-040):                                               │
│ - Max 10,000 participants                                       │
│ - Waiting room at 90% capacity                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 14. Subscription & Payment Flows

### 14.1 Subscription Upgrade

```
FLOW: Free → Plus upgrade
┌─────────────────────────────────────────────────────────────────┐
│ 1. GET /users/me/subscription                                   │
│    → Current tier: FREE                                         │
│                                                                 │
│ 2. [FRONTEND] Navigate to pricing page                          │
│    → Select Plus tier                                           │
│                                                                 │
│ 3. POST /subscriptions/checkout                                 │
│    Body: { tier: "PLUS", period: "monthly" | "yearly" }         │
│    → Returns: Stripe checkout session URL                       │
│                                                                 │
│ 4. [STRIPE] User completes payment                              │
│                                                                 │
│ 5. [WEBHOOK] Stripe notifies success                            │
│    → subscription.tier = PLUS                                   │
│    → Features unlocked immediately                              │
│                                                                 │
│ 6. GET /users/me/subscription                                   │
│    → Current tier: PLUS                                         │
│    → nextBillingDate, canceledAt, etc.                          │
└─────────────────────────────────────────────────────────────────┘
```

### 14.2 Subscription Downgrade (P-037)

```
FLOW: Premium → Plus downgrade
┌─────────────────────────────────────────────────────────────────┐
│ 1. POST /subscriptions/change                                   │
│    Body: { tier: "PLUS" }                                       │
│    → Downgrade scheduled for end of billing period              │
│                                                                 │
│ 2. UNTIL END OF PERIOD:                                         │
│    → Premium features still work                                │
│    → Active live polls end gracefully (60 min max)              │
│                                                                 │
│ 3. [SYSTEM] At billing period end:                              │
│    → subscription.tier = PLUS                                   │
│    → Existing content preserved (read-only for premium features)│
│    → New content subject to Plus limits                         │
│                                                                 │
│ WHAT HAPPENS TO PREMIUM CONTENT:                                │
│ - Extended polls: Preserved, can view but not edit              │
│ - Live poll history: Preserved                                  │
│ - Analytics: Basic view only                                    │
│ - Pre-tests: Disabled on existing polls                         │
└─────────────────────────────────────────────────────────────────┘
```

### 14.3 Cancellation

```
FLOW: Cancel subscription
┌─────────────────────────────────────────────────────────────────┐
│ 1. POST /subscriptions/cancel                                   │
│    Body: { reason?: "..." }                                     │
│    → Cancellation scheduled for end of billing period           │
│                                                                 │
│ 2. UNTIL END OF PERIOD:                                         │
│    → All features still work                                    │
│    → Can reactivate anytime                                     │
│                                                                 │
│ 3. POST /subscriptions/reactivate                               │
│    → Cancel the cancellation                                    │
│                                                                 │
│ 4. [SYSTEM] At billing period end (if not reactivated):         │
│    → subscription.tier = FREE                                   │
│    → Content preserved with restrictions                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 15. Complete Endpoint Index by Role

### Guest (No Auth) - 🔓

```
Health
├── GET /health
├── GET /health/live
├── GET /health/ready
├── GET /health/startup
└── GET /health/deep

Authentication
├── POST /auth/register
├── POST /auth/login
├── POST /auth/forgot-password
├── POST /auth/reset-password
├── POST /auth/verify-email
├── GET /auth/oauth/google/initiate
├── GET /auth/oauth/google/callback
├── GET /auth/oauth/apple/initiate
└── GET /auth/oauth/apple/callback

Content (Read Only)
├── GET /polls
├── GET /polls/:id
├── GET /polls/:id/comments
├── GET /polls/share/:code
├── GET /users/:username
├── GET /users/:username/polls
├── GET /users/:username/badges
├── GET /users/:username/followers
├── GET /users/:username/following
├── GET /categories
├── GET /categories/:slug
├── GET /categories/:slug/polls
├── GET /tags
├── GET /tags/trending
├── GET /tags/:name/polls
├── GET /tests/personality
├── GET /tests/personality/:id
├── GET /tests/quiz
├── GET /tests/quiz/:id
├── GET /tests/quiz/:id/leaderboard
├── GET /badges
├── GET /badges/:id
├── GET /feed/trending
└── GET /feed/discover

Search (Limited)
├── GET /search (10/min, max 10 results)
├── GET /search/tags
└── GET /search/suggestions

Live Poll (Join Only)
├── POST /live/sessions/:code/join
├── GET /live/:id/status
└── POST /live/:id/vote (with participant token)

Organization (View Only)
└── GET /organizations/invite/:code
```

### Unverified User (Level 0) - 🔐

```
All Guest endpoints PLUS:

Session
├── POST /auth/logout
├── POST /auth/logout-all
├── POST /auth/refresh
├── GET /auth/me
├── GET /auth/sessions
└── DELETE /auth/sessions/:id

Account
├── POST /auth/resend-verification
├── POST /auth/change-password
├── POST /auth/change-email
└── POST /auth/confirm-email-change

Voting (0.5x weight)
├── POST /polls/:id/vote
├── DELETE /polls/:id/vote
├── GET /polls/:id/my-vote
└── GET /polls/:id/results (after voting)

Profile (Read Only)
├── GET /users/me/votes
└── GET /users/me/activity

Verification
└── POST /verification/phone/send
└── POST /verification/phone/verify
```

### Basic User (Level 1, Free) - 🔐

```
All Unverified endpoints PLUS:

Profile Management
├── PATCH /users/me
├── DELETE /users/me
├── GET /users/me/polls
├── GET /users/me/badges
├── PATCH /users/me/badges/:id
├── GET /users/me/demographics
├── PATCH /users/me/demographics
├── GET /users/me/subscription
└── GET /users/me/activity

Poll Creation (3/day, max 4 options)
├── POST /polls (QUICK_POLL only)
├── PUT /polls/:id
├── DELETE /polls/:id
├── POST /polls/:id/publish
├── POST /polls/:id/close
├── POST /polls/:id/archive
├── POST /polls/:id/unarchive
├── POST /polls/:id/share
└── GET /polls/:id/analytics (basic)

Comments (after voting)
├── POST /polls/:id/comments
├── PUT /comments/:id
├── DELETE /comments/:id
├── POST /comments/:id/vote
├── GET /comments/:id/replies
└── POST /comments/:id/replies

Social
├── POST /users/:username/follow
├── DELETE /users/:username/follow
├── POST /users/:username/block
├── DELETE /users/:username/block
└── GET /users/me/blocked

Messaging (5/day to non-friends)
├── GET /messages
├── GET /messages/:conversationId
├── POST /messages
├── DELETE /messages/:id
├── PUT /messages/:conversationId/read
└── GET /messages/unread-count

Notifications
├── GET /notifications
├── GET /notifications/unread-count
├── PUT /notifications/:id/read
├── PUT /notifications/read-all
├── DELETE /notifications/:id
├── GET /notifications/settings
└── PUT /notifications/settings

Tests
├── POST /tests/personality/:id/take
├── POST /tests/personality/:id/submit
├── GET /tests/personality/:id/results
├── GET /tests/personality/:id/my-badge
├── POST /tests/personality/:id/retake
├── POST /tests/quiz/:id/attempt
├── POST /tests/quiz/:id/submit
├── GET /tests/quiz/:id/my-attempts
└── POST /badges/:id/share

Reports
├── POST /reports
├── GET /reports
├── GET /reports/:id
├── POST /polls/:id/report
├── POST /comments/:id/report
└── POST /users/:username/report

Search (30/min)
├── GET /search
├── GET /search/polls
└── GET /search/users

Feed
├── GET /feed
├── GET /feed/following
└── GET /feed/for-you

Verification (upgrade to Level 2)
├── POST /verification/2fa/enable
├── POST /verification/2fa/verify
├── POST /verification/2fa/disable
├── GET /verification/2fa/backup-codes
├── POST /verification/2fa/regenerate-backup
├── POST /verification/selfie/upload
└── GET /verification/selfie/status
```

### Plus User (Level 1+, Plus) - 🔐

```
All Basic endpoints PLUS:

Enhanced Limits
├── POST /polls (10/day)
├── POST /messages (25/day to non-friends)
└── GET /search (60/min)

PULSE Access (P-016)
└── GET /polls/:id/results (without voting)
```

### Premium User (Level 1-2, Premium) - 🔐

```
All Plus endpoints PLUS:

Enhanced Limits
├── POST /polls (unlimited, up to 10 options)
├── POST /messages (100/day to non-friends)
└── GET /search (120/min)

Extended Poll Features
├── POST /polls (STANDARD, RANKED_CHOICE, DEMOGRAPHIC types)
├── Pre-test configuration
├── Target audience filtering
└── Custom themes

Pre-test
├── GET /polls/:id/pretest
└── POST /polls/:id/pretest/submit

Analytics
├── GET /analytics/overview
├── GET /analytics/polls/:id (detailed)
└── GET /analytics/polls/:id/export

Live Polls (Level 2+ required)
├── POST /polls (LIVE_POLL type)
├── POST /live/:id/start
├── POST /live/:id/pause
├── POST /live/:id/resume
├── POST /live/:id/end
├── GET /live/:id/participants
└── POST /live/:id/next-question

Verification (Level 3)
├── POST /verification/edevlet/initiate
├── POST /verification/id/upload
├── POST /verification/id/liveness
└── GET /verification/id/status
```

### Organization Member - 🏢

```
All Basic user endpoints PLUS:

Organization View
├── GET /organizations
├── GET /organizations/:slug
└── GET /organizations/:slug/members (limited)

Survey Participation
├── GET /organizations/:slug/surveys
├── GET /surveys/:id
└── POST /surveys/:id/respond

Invitation
└── POST /organizations/invite/:code/accept
└── POST /organizations/:slug/join
```

### Organization Admin (ADMIN/OWNER) - 🏢

```
All Organization Member endpoints PLUS:

Member Management
├── POST /organizations/:slug/invite
├── POST /organizations/:slug/invite/bulk (Enterprise)
├── GET /organizations/:slug/invitations
├── DELETE /organizations/:slug/invitations/:id
├── POST /organizations/:slug/invitations/:id/resend
├── POST /organizations/:slug/members
├── PATCH /organizations/:slug/members/:userId
└── DELETE /organizations/:slug/members/:userId

Survey Management
├── POST /surveys
├── POST /organizations/:slug/surveys
├── PUT /surveys/:id
├── DELETE /surveys/:id
├── GET /surveys/:id/preview
├── POST /surveys/:id/publish
├── POST /surveys/:id/close
├── POST /surveys/:id/invite
├── POST /surveys/:id/reminder
├── GET /surveys/:id/stats
├── GET /surveys/:id/results
└── GET /surveys/:id/results/export

Organization Settings
├── PUT /organizations/:slug
├── PUT /organizations/:slug/settings
├── GET /organizations/:slug/audit-logs
├── PUT /organizations/:slug/sso (Enterprise)
└── GET /organizations/:slug/sso/metadata
```

### Organization Owner - 🏢

```
All Organization Admin endpoints PLUS:

Owner-Only
├── POST /organizations/:slug/transfer
├── GET /organizations/:slug/billing
├── PUT /organizations/:slug/billing
├── GET /organizations/:slug/invoices
├── GET /organizations/:slug/invoices/:id
└── DELETE /organizations/:slug
```

### Moderator - 🛡️

```
All Basic user endpoints PLUS:

Reports
├── GET /admin/reports
├── GET /admin/reports/:id
└── PUT /admin/reports/:id

Content Moderation
├── POST /admin/polls/:id/hide
├── POST /admin/polls/:id/unhide
├── POST /admin/comments/:id/remove
└── POST /admin/comments/:id/edit

User Moderation
├── POST /admin/users/:id/warn
├── POST /admin/users/:id/suspend
└── POST /admin/users/:id/unsuspend
```

### Admin - 🛡️

```
All Moderator endpoints PLUS:

User Management
├── GET /admin/users
├── GET /admin/users/:id
├── PATCH /admin/users/:id
├── POST /admin/users/:id/ban
├── POST /admin/users/:id/unban
└── POST /admin/users/:id/verify

Content Hard Delete
└── DELETE /admin/polls/:id
```

### Super Admin - 🛡️

```
ALL endpoints PLUS:

Organization Management
├── GET /admin/organizations
├── PATCH /admin/organizations/:id
└── DELETE /admin/organizations/:id

User Management
└── DELETE /admin/users/:id (GDPR hard delete)

Analytics
├── GET /admin/analytics/platform
├── GET /admin/analytics/users
├── GET /admin/analytics/content
└── GET /admin/analytics/revenue

System Configuration
├── GET /admin/config
├── PUT /admin/config
├── GET /admin/feature-flags
└── PUT /admin/feature-flags/:flag
```

---

## HTTP Status Codes Reference

| Flow | Success | Client Error | Server Error |
|------|---------|--------------|--------------|
| Create resource | 201 | 400, 409 | 500 |
| Read resource | 200 | 404 | 500 |
| Update resource | 200 | 400, 403, 404 | 500 |
| Delete resource | 200/204 | 403, 404 | 500 |
| Authentication | 200 | 401, 403 | 500 |
| Insufficient verification | - | 403 (INSUFFICIENT_VERIFICATION) | - |
| Subscription required | - | 403 (SUBSCRIPTION_REQUIRED) | - |
| Rate limited | - | 429 | - |
| Validation error | - | 400 (VALIDATION_ERROR) | - |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-22 | Complete rewrite with all flows, endpoint index |
| 1.0.0 | 2026-01-22 | Initial version |
