# API Endpoints

> **NyoWorks Standard File** | Links to VoxPoll API documentation

This file follows NyoWorks manifesto structure. For complete API endpoint documentation, see:

**Primary Source:** [05-TECH/03-api-routes.md](../05-TECH/03-api-routes.md)

**Related Documents:**
- [API Contract](./01-api-contract.md) - Full OpenAPI 3.1 specification (155 endpoints)
- [API Flows](../05-TECH/04-api-flows.md) - Request/response flows
- [Architecture](../05-TECH/01-architecture.md) - Backend architecture

---

## API Base URL

- **Production**: `https://api.voxpoll.com`
- **Staging**: `https://api-staging.voxpoll.com`
- **Development**: `http://localhost:3001`

---

## Endpoint Categories

### Authentication (10 endpoints)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/verify
```

### Users (15 endpoints)
```
GET    /api/users/me
PATCH  /api/users/me
DELETE /api/users/me
GET    /api/users/:id
GET    /api/users/:id/polls
GET    /api/users/:id/followers
GET    /api/users/:id/following
POST   /api/users/:id/follow
DELETE /api/users/:id/unfollow
POST   /api/users/:id/block
DELETE /api/users/:id/unblock
GET    /api/users/search
POST   /api/users/avatar
DELETE /api/users/avatar
PATCH  /api/users/settings
```

### Polls (20 endpoints)
```
GET    /api/polls
POST   /api/polls
GET    /api/polls/:id
PATCH  /api/polls/:id
DELETE /api/polls/:id
POST   /api/polls/:id/vote
DELETE /api/polls/:id/vote
GET    /api/polls/:id/results
GET    /api/polls/:id/comments
POST   /api/polls/:id/comments
PATCH  /api/polls/:id/comments/:commentId
DELETE /api/polls/:id/comments/:commentId
GET    /api/polls/trending
GET    /api/polls/feed
GET    /api/polls/following
POST   /api/polls/:id/share
POST   /api/polls/:id/report
GET    /api/polls/:id/analytics
POST   /api/polls/:id/pre-test
GET    /api/polls/:id/pre-test/results
```

### Surveys (18 endpoints)
```
GET    /api/surveys
POST   /api/surveys
GET    /api/surveys/:id
PATCH  /api/surveys/:id
DELETE /api/surveys/:id
POST   /api/surveys/:id/questions
PATCH  /api/surveys/:id/questions/:questionId
DELETE /api/surveys/:id/questions/:questionId
POST   /api/surveys/:id/respond
GET    /api/surveys/:id/responses
GET    /api/surveys/:id/analytics
POST   /api/surveys/:id/deploy
POST   /api/surveys/:id/close
GET    /api/surveys/:id/export
POST   /api/surveys/:id/duplicate
GET    /api/surveys/templates
POST   /api/surveys/:id/invitations
GET    /api/surveys/:id/invitations
```

### Organizations (25 endpoints)
```
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:id
PATCH  /api/organizations/:id
DELETE /api/organizations/:id
GET    /api/organizations/:id/members
POST   /api/organizations/:id/members
PATCH  /api/organizations/:id/members/:memberId
DELETE /api/organizations/:id/members/:memberId
GET    /api/organizations/:id/invitations
POST   /api/organizations/:id/invitations
DELETE /api/organizations/:id/invitations/:invitationId
POST   /api/organizations/:id/invitations/:invitationId/resend
POST   /api/organizations/invitations/:token/accept
GET    /api/organizations/:id/surveys
GET    /api/organizations/:id/analytics
GET    /api/organizations/:id/roles
POST   /api/organizations/:id/roles
PATCH  /api/organizations/:id/roles/:roleId
DELETE /api/organizations/:id/roles/:roleId
GET    /api/organizations/:id/subscription
POST   /api/organizations/:id/subscription
PATCH  /api/organizations/:id/subscription
DELETE /api/organizations/:id/subscription
GET    /api/organizations/:id/billing
```

### Live Polls (12 endpoints)
```
POST   /api/live-polls
GET    /api/live-polls/:roomId
DELETE /api/live-polls/:roomId
POST   /api/live-polls/:roomId/join
POST   /api/live-polls/:roomId/leave
POST   /api/live-polls/:roomId/questions
PATCH  /api/live-polls/:roomId/questions/:questionId
POST   /api/live-polls/:roomId/questions/:questionId/activate
POST   /api/live-polls/:roomId/questions/:questionId/vote
GET    /api/live-polls/:roomId/questions/:questionId/results
POST   /api/live-polls/:roomId/close
GET    /api/live-polls/:roomId/export
```

### Notifications (8 endpoints)
```
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
DELETE /api/notifications/clear-all
GET    /api/notifications/unread-count
PATCH  /api/notifications/settings
GET    /api/notifications/settings
```

### Gamification (10 endpoints)
```
GET    /api/gamification/xp
GET    /api/gamification/badges
GET    /api/gamification/badges/:badgeId
GET    /api/gamification/leaderboard
GET    /api/gamification/leaderboard/:category
GET    /api/gamification/achievements
POST   /api/gamification/achievements/:achievementId/claim
GET    /api/gamification/stats
GET    /api/gamification/streaks
GET    /api/gamification/rewards
```

### Direct Messages (8 endpoints)
```
GET    /api/messages/conversations
GET    /api/messages/conversations/:conversationId
POST   /api/messages/conversations
POST   /api/messages/conversations/:conversationId/messages
PATCH  /api/messages/:messageId
DELETE /api/messages/:messageId
PATCH  /api/messages/conversations/:conversationId/read
DELETE /api/messages/conversations/:conversationId
```

### Admin (15 endpoints)
```
GET    /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/users/:id/ban
DELETE /api/admin/users/:id/unban
GET    /api/admin/polls
DELETE /api/admin/polls/:id
GET    /api/admin/reports
PATCH  /api/admin/reports/:id
GET    /api/admin/analytics
GET    /api/admin/system/health
GET    /api/admin/system/metrics
POST   /api/admin/system/maintenance
GET    /api/admin/logs
```

### Miscellaneous (14 endpoints)
```
GET    /api/health
GET    /api/categories
GET    /api/tags
GET    /api/search
POST   /api/upload
DELETE /api/upload/:fileId
GET    /api/analytics/trending
GET    /api/analytics/demographics
POST   /api/webhooks
GET    /api/webhooks
DELETE /api/webhooks/:id
POST   /api/integrations/e-devlet/verify
GET    /api/integrations/stripe/session
POST   /api/integrations/stripe/webhook
```

---

## Total: 155 Endpoints

See [01-api-contract.md](./01-api-contract.md) for complete OpenAPI 3.1 specification.

---

## Authentication

All endpoints (except public ones) require JWT authentication:

```http
Authorization: Bearer <access_token>
```

**Public Endpoints** (no auth required):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/polls/:id` (public polls)
- `GET /api/polls/trending`
- `GET /api/health`

---

## Rate Limiting

Default rate limits:
- **Anonymous**: 100 requests/15 minutes per IP
- **Authenticated**: 1000 requests/15 minutes per user
- **API Key**: 10,000 requests/15 minutes per key

Endpoints with stricter limits:
- `POST /api/auth/login`: 5 requests/15 minutes per IP
- `POST /api/auth/register`: 3 requests/hour per IP
- `POST /api/polls`: 20 requests/hour per user

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## Pagination

Endpoints returning lists support pagination:

```http
GET /api/polls?page=1&pageSize=20&sort=createdAt&order=desc
```

**Default**: `page=1`, `pageSize=20`
**Max page size**: 100

---

## Filtering & Sorting

Common query parameters:
- `category`: Filter by category
- `tags`: Comma-separated tags
- `status`: Filter by status (active, closed, etc.)
- `sort`: Sort field (createdAt, voteCount, etc.)
- `order`: Sort order (asc, desc)
- `search`: Full-text search query

---

## WebSocket Endpoints

Real-time features use WebSocket:

```
wss://api.voxpoll.com/ws
```

**Channels:**
- `/ws/live-polls/:roomId` - Live poll updates
- `/ws/notifications` - Real-time notifications
- `/ws/messages` - Direct message updates

---

## API Documentation

Interactive API documentation available at:
- **Scalar UI**: `https://api.voxpoll.com/docs`
- **OpenAPI JSON**: `https://api.voxpoll.com/openapi.json`

---

*For detailed endpoint specifications, see [01-api-contract.md](./01-api-contract.md)*
*For implementation details, see [05-TECH/03-api-routes.md](../05-TECH/03-api-routes.md)*
