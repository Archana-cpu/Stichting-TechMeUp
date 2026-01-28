# API Routes Reference
> Source: bible-api-routes.md

---

# ══════════════════════════════════════════════════════════════════════════════
# API OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## Base URL

```
Production: https://api.voxpoll.com/v1
Staging:    https://api.staging.voxpoll.com/v1
Local:      http://localhost:3001/v1
```

## Authentication

- JWT Bearer tokens in Authorization header
- Refresh tokens in HttpOnly cookies
- Session management via Redis

## Response Format

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}
```

---

# ══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

```
GET  /health              Basic health check
GET  /health/live         Kubernetes liveness probe
GET  /health/ready        Kubernetes readiness probe
GET  /health/startup      Kubernetes startup probe
GET  /health/deep         Full system health (DB, Redis, services)
```

---

# ══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

## Registration & Login

```
POST /auth/register                 Email/password registration
POST /auth/login                    Email/password login
POST /auth/login/2fa                Two-factor authentication step
POST /auth/logout                   Logout current session
POST /auth/logout-all               Logout all sessions
POST /auth/refresh                  Refresh access token
GET  /auth/me                       Get current user info
```

## Email & Password

```
POST /auth/verify-email             Verify email with token
POST /auth/resend-verification      Resend verification email
POST /auth/forgot-password          Request password reset
POST /auth/reset-password           Reset password with token
POST /auth/change-password          Change password (authenticated)
POST /auth/change-email             Request email change
POST /auth/confirm-email-change     Confirm email change
```

## OAuth

```
GET  /auth/oauth/google/initiate    Start Google OAuth flow
GET  /auth/oauth/google/callback    Google OAuth callback
GET  /auth/oauth/apple/initiate     Start Apple OAuth flow
GET  /auth/oauth/apple/callback     Apple OAuth callback
POST /auth/oauth/link               Link OAuth provider to account
DELETE /auth/oauth/:provider        Unlink OAuth provider
```

## Sessions

```
GET  /auth/sessions                 List all active sessions
DELETE /auth/sessions/:id           Revoke specific session
```

## SSO (Enterprise)

```
GET  /auth/sso/:orgSlug/metadata    Get SAML/OIDC metadata
POST /auth/sso/initiate             Initiate SSO login
POST /auth/sso/callback             SSO callback
```

---

# ══════════════════════════════════════════════════════════════════════════════
# USER ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

## Profile

```
GET    /users/:username             Get public profile
GET    /users/me                    Get own profile (full)
PATCH  /users/me                    Update profile
DELETE /users/me                    Delete account (soft delete)
```

## Demographics & Settings

```
GET    /users/me/demographics       Get demographics
PATCH  /users/me/demographics       Update demographics
GET    /users/me/settings           Get user settings
PATCH  /users/me/settings           Update settings
```

## Content

```
GET    /users/:username/polls       Get user's polls
GET    /users/:username/tests       Get user's tests
GET    /users/:username/badges      Get user's badges
GET    /users/me/polls              Get own polls (full)
GET    /users/me/votes              Get own vote history
GET    /users/me/activity           Get activity feed
```

## Social

```
GET    /users/:username/followers   Get followers
GET    /users/:username/following   Get following
POST   /users/:username/follow      Follow user
DELETE /users/:username/follow      Unfollow user
POST   /users/:username/block       Block user
DELETE /users/:username/block       Unblock user
GET    /users/me/blocked            Get blocked users
```

## Badges

```
GET    /users/me/badges             Get earned badges
PATCH  /users/me/badges/:id         Update badge visibility
POST   /badges/:id/share            Generate shareable badge image
```

## Subscription

```
GET    /users/me/subscription       Get subscription status
POST   /subscriptions/checkout      Create checkout session
POST   /subscriptions/change        Change subscription tier
POST   /subscriptions/cancel        Cancel subscription
POST   /subscriptions/reactivate    Reactivate canceled subscription
```

---

# ══════════════════════════════════════════════════════════════════════════════
# VERIFICATION ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

## Phone Verification

```
POST /verification/phone/send       Send OTP to phone
POST /verification/phone/verify     Verify phone with OTP
```

## Two-Factor Authentication

```
POST /verification/2fa/enable       Enable 2FA (returns secret)
POST /verification/2fa/verify       Verify 2FA code
POST /verification/2fa/disable      Disable 2FA
GET  /verification/2fa/backup-codes Get backup codes
POST /verification/2fa/regenerate-backup  Regenerate backup codes
```

## Identity Verification

```
POST /verification/selfie/upload    Upload selfie for verification
GET  /verification/selfie/status    Check selfie verification status
POST /verification/edevlet/initiate Start e-Devlet verification
GET  /verification/edevlet/callback e-Devlet callback
POST /verification/id/upload        Upload ID document
POST /verification/id/liveness      Submit liveness video
GET  /verification/id/status        Check ID verification status
GET  /verification/status           Get overall verification status
```

---

# ══════════════════════════════════════════════════════════════════════════════
# POLL ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

## CRUD Operations

```
GET    /polls                       List polls (with filters)
POST   /polls                       Create poll
GET    /polls/:id                   Get poll details
PUT    /polls/:id                   Update poll (limited after publish)
DELETE /polls/:id                   Delete poll (soft delete)
```

## Lifecycle

```
POST   /polls/:id/publish           Publish draft poll
POST   /polls/:id/close             Close poll manually
POST   /polls/:id/archive           Archive poll
POST   /polls/:id/unarchive         Unarchive poll
```

## Voting

```
POST   /polls/:id/vote              Cast vote
DELETE /polls/:id/vote              Retract vote (if allowed)
GET    /polls/:id/my-vote           Get own vote
GET    /polls/:id/results           Get results (PULSE)
```

## Comments (Discussion)

```
GET    /polls/:id/comments          Get comments
POST   /polls/:id/comments          Add comment
PUT    /comments/:id                Edit comment
DELETE /comments/:id                Delete comment
POST   /comments/:id/vote           Vote on comment
GET    /comments/:id/replies        Get replies
POST   /comments/:id/replies        Add reply
```

## Analytics & Sharing

```
GET    /polls/:id/analytics         Get poll analytics
GET    /polls/:id/analytics/export  Export analytics
POST   /polls/:id/share             Generate share link
GET    /polls/share/:code           Get poll by share code
```

## Pre-test (Premium)

```
GET    /polls/:id/pretest           Get pre-test questions
POST   /polls/:id/pretest/submit    Submit pre-test answers
```

---

# ══════════════════════════════════════════════════════════════════════════════
# LIVE POLL ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

```
POST   /live/:id/start              Start live poll session
POST   /live/:id/pause              Pause voting
POST   /live/:id/resume             Resume voting
POST   /live/:id/end                End live poll
POST   /live/:id/next-question      Advance to next question
GET    /live/:id/status             Get live poll status
GET    /live/:id/participants       Get participant count
POST   /live/:id/vote               Cast vote in live poll
POST   /live/sessions/:code/join    Join live poll by code
```

## WebSocket Events (Live Poll)

```
Client → Server:
  join_session      { joinCode: string }
  leave_session     { }
  submit_vote       { optionId: string }
  host_control      { action: "pause" | "resume" | "next" | "end" }

Server → Client:
  session_state     { status, currentQuestion, participants, timeRemaining }
  vote_update       { optionId, voteCount, percentage }
  question_change   { questionIndex, question, options }
  session_ended     { finalResults }
  participant_count { count }
  error             { code, message }
```

---

# ══════════════════════════════════════════════════════════════════════════════
# SURVEY ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

## CRUD Operations

```
GET    /surveys                     List surveys (org context)
POST   /surveys                     Create survey
GET    /surveys/:id                 Get survey details
PUT    /surveys/:id                 Update survey (while draft)
DELETE /surveys/:id                 Delete survey
```

## Lifecycle

```
GET    /surveys/:id/preview         Preview survey (no recording)
POST   /surveys/:id/publish         Publish survey
POST   /surveys/:id/close           Close survey
```

## Response Collection

```
POST   /surveys/:id/respond         Start/submit response
POST   /surveys/:id/invite          Send survey invitations
POST   /surveys/:id/reminder        Send reminder to non-respondents
```

## Analytics

```
GET    /surveys/:id/stats           Get response statistics
GET    /surveys/:id/results         Get aggregated results
GET    /surveys/:id/results/export  Export results (CSV/XLSX/JSON)
```

---

# ══════════════════════════════════════════════════════════════════════════════
# TEST (PERSONALITY TEST) ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

## CRUD Operations

```
GET    /tests/personality           List personality tests
GET    /tests/personality/:id       Get test details
POST   /tests/personality           Create personality test
PUT    /tests/personality/:id       Update test
DELETE /tests/personality/:id       Delete test
```

## Taking Tests

```
POST   /tests/personality/:id/take      Start taking test
POST   /tests/personality/:id/submit    Submit test answers
GET    /tests/personality/:id/results   Get own results
GET    /tests/personality/:id/my-badge  Get result badge
POST   /tests/personality/:id/retake    Retake test
```

## Quiz Tests

```
GET    /tests/quiz                      List quiz tests
GET    /tests/quiz/:id                  Get quiz details
POST   /tests/quiz/:id/attempt          Start quiz attempt
POST   /tests/quiz/:id/submit           Submit quiz answers
GET    /tests/quiz/:id/my-attempts      Get own attempts
GET    /tests/quiz/:id/leaderboard      Get quiz leaderboard
```

---

# ══════════════════════════════════════════════════════════════════════════════
# ORGANIZATION ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

## Organization CRUD

```
GET    /organizations                   List user's organizations
POST   /organizations                   Create organization
GET    /organizations/:slug             Get organization details
PUT    /organizations/:slug             Update organization
DELETE /organizations/:slug             Delete organization
```

## Members

```
GET    /organizations/:slug/members     List members
POST   /organizations/:slug/members     Add member directly
PATCH  /organizations/:slug/members/:userId  Update member role
DELETE /organizations/:slug/members/:userId  Remove member
```

## Invitations

```
POST   /organizations/:slug/invite              Send invitation
POST   /organizations/:slug/invite/bulk         Bulk invite (Enterprise)
GET    /organizations/:slug/invitations         List pending invitations
DELETE /organizations/:slug/invitations/:id     Cancel invitation
POST   /organizations/:slug/invitations/:id/resend  Resend invitation
GET    /organizations/invite/:code              Get invitation details
POST   /organizations/invite/:code/accept       Accept invitation
POST   /organizations/:slug/join                Request to join (if public)
```

## Organization Surveys

```
GET    /organizations/:slug/surveys     List organization surveys
POST   /organizations/:slug/surveys     Create organization survey
```

## Settings & Billing

```
PUT    /organizations/:slug/settings    Update settings
PUT    /organizations/:slug/sso         Configure SSO (Enterprise)
GET    /organizations/:slug/sso/metadata Get SSO metadata
GET    /organizations/:slug/audit-logs  Get audit logs
POST   /organizations/:slug/transfer    Transfer ownership
GET    /organizations/:slug/billing     Get billing info
PUT    /organizations/:slug/billing     Update billing
GET    /organizations/:slug/invoices    List invoices
GET    /organizations/:slug/invoices/:id Get invoice details
```

---

# ══════════════════════════════════════════════════════════════════════════════
# FEED & DISCOVERY ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

```
GET    /feed                        Personalized feed
GET    /feed/following              Following feed
GET    /feed/for-you                Algorithmic recommendations
GET    /feed/trending               Trending content
GET    /feed/discover               Discovery/explore feed
```

---

# ══════════════════════════════════════════════════════════════════════════════
# SEARCH ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

```
GET    /search                      Global search
GET    /search/polls                Search polls
GET    /search/users                Search users
GET    /search/tags                 Search tags
GET    /search/suggestions          Get search suggestions
```

---

# ══════════════════════════════════════════════════════════════════════════════
# CATEGORY & TAG ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

```
GET    /categories                  List all categories
GET    /categories/:slug            Get category details
GET    /categories/:slug/polls      Get polls in category

GET    /tags                        List popular tags
GET    /tags/trending               Get trending tags
GET    /tags/:name/polls            Get polls with tag
```

---

# ══════════════════════════════════════════════════════════════════════════════
# NOTIFICATION ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

```
GET    /notifications               List notifications
GET    /notifications/unread-count  Get unread count
PUT    /notifications/:id/read      Mark as read
PUT    /notifications/read-all      Mark all as read
DELETE /notifications/:id           Delete notification
GET    /notifications/settings      Get notification preferences
PUT    /notifications/settings      Update preferences
```

---

# ══════════════════════════════════════════════════════════════════════════════
# MESSAGING ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

```
GET    /messages                        List conversations
GET    /messages/:conversationId        Get conversation messages
POST   /messages                        Send message
DELETE /messages/:id                    Delete message
PUT    /messages/:conversationId/read   Mark conversation as read
GET    /messages/unread-count           Get unread message count
```

---

# ══════════════════════════════════════════════════════════════════════════════
# REPORT ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

```
POST   /reports                     Submit general report
GET    /reports                     Get own reports
GET    /reports/:id                 Get report details
POST   /polls/:id/report            Report poll
POST   /comments/:id/report         Report comment
POST   /users/:username/report      Report user
```

---

# ══════════════════════════════════════════════════════════════════════════════
# BADGE ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

```
GET    /badges                      List all available badges
GET    /badges/:id                  Get badge details
```

---

# ══════════════════════════════════════════════════════════════════════════════
# ADMIN ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

## Report Management (Moderator+)

```
GET    /admin/reports               List all reports
GET    /admin/reports/:id           Get report details
PUT    /admin/reports/:id           Update report status
```

## Content Moderation (Moderator+)

```
POST   /admin/polls/:id/hide        Hide poll
POST   /admin/polls/:id/unhide      Unhide poll
DELETE /admin/polls/:id             Hard delete poll (Admin+)
POST   /admin/comments/:id/remove   Remove comment
POST   /admin/comments/:id/edit     Edit comment
```

## User Management (Admin+)

```
GET    /admin/users                 List users
GET    /admin/users/:id             Get user details
PATCH  /admin/users/:id             Update user
POST   /admin/users/:id/warn        Send warning
POST   /admin/users/:id/suspend     Suspend user
POST   /admin/users/:id/unsuspend   Unsuspend user
POST   /admin/users/:id/ban         Ban user
POST   /admin/users/:id/unban       Unban user
POST   /admin/users/:id/verify      Manual verification
DELETE /admin/users/:id             GDPR hard delete (SuperAdmin)
```

## Organization Management (SuperAdmin)

```
GET    /admin/organizations         List organizations
PATCH  /admin/organizations/:id     Update organization
DELETE /admin/organizations/:id     Delete organization
```

## Platform Analytics (SuperAdmin)

```
GET    /admin/analytics/platform    Platform-wide analytics
GET    /admin/analytics/users       User analytics
GET    /admin/analytics/content     Content analytics
GET    /admin/analytics/revenue     Revenue analytics
```

## System Configuration (SuperAdmin)

```
GET    /admin/config                Get system config
PUT    /admin/config                Update system config
GET    /admin/feature-flags         List feature flags
PUT    /admin/feature-flags/:flag   Update feature flag
```

---

# ══════════════════════════════════════════════════════════════════════════════
# RATE LIMITING
# ══════════════════════════════════════════════════════════════════════════════

## Rate Limits by Tier

| Tier | General API | Search | Content Creation | Auth |
|------|-------------|--------|------------------|------|
| Anonymous | 60/min | 10/min | N/A | 10/hour |
| Free | 120/min | 30/min | 3/day (polls) | 30/hour |
| Plus | 300/min | 60/min | 10/day (polls) | 60/hour |
| Premium | 600/min | 120/min | Unlimited | 120/hour |

## Specific Endpoint Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/register | 5 | 1 hour |
| POST /auth/login | 10 | 15 min |
| POST /auth/forgot-password | 3 | 1 hour |
| POST /verification/phone/send | 3 | 1 hour |
| POST /polls/:id/vote | 1 | per poll |
| POST /messages (non-friends) | 5-100 | 1 day |

---

# ══════════════════════════════════════════════════════════════════════════════
# ERROR CODES
# ══════════════════════════════════════════════════════════════════════════════

| Code | HTTP | Description |
|------|------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| INSUFFICIENT_VERIFICATION | 403 | Higher verification level needed |
| SUBSCRIPTION_REQUIRED | 403 | Feature requires subscription |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

*Source: bible-api-routes.md*
