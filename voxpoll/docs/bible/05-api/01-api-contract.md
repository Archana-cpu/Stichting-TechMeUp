# API Contract

> VoxPoll REST API v1 - Complete Endpoint Reference
> NyoWorks PHASE A Step 4 (CRITICAL)
> Last Updated: 2026-01-29

---

## Overview

**Base URL**: `/api`
**API Version**: v1
**Protocol**: HTTPS only (TLS 1.3)
**Authentication**: JWT (access token + refresh token rotation)
**Rate Limiting**: Per-endpoint, Redis-backed
**Response Format**: JSON

---

## Authentication

### Token Types

**Access Token:**
- Lifetime: 15 minutes
- Storage: Memory (never localStorage)
- Header: `Authorization: Bearer <token>`

**Refresh Token:**
- Lifetime: 7 days
- Storage: HttpOnly, Secure, SameSite=Strict cookie
- Single-use rotation on refresh
- Endpoint: `POST /auth/refresh`

### Authentication Levels

| Level | Description | Usage |
|-------|-------------|-------|
| Public | No authentication required | Health, public polls, public profiles |
| Optional | Works with or without auth | Poll listing, user profiles (enhanced data if authenticated) |
| Required | Must be authenticated | Poll creation, voting, user settings |
| Role-based | Requires specific role | Moderation (MODERATOR), platform stats (ADMIN) |

---

## Global Headers

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <access_token>  (if authenticated)
X-Device-ID: <uuid>                   (for device fingerprinting - P-057)
```

**Response Headers:**
```http
Content-Type: application/json
X-RateLimit-Limit: <limit>
X-RateLimit-Remaining: <remaining>
X-RateLimit-Reset: <unix_timestamp>
```

---

## Global Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "statusCode": 400
  }
}
```

**Standard Error Codes:**
- `UNAUTHORIZED`: 401 - Missing or invalid token
- `FORBIDDEN`: 403 - Insufficient permissions
- `NOT_FOUND`: 404 - Resource not found
- `VALIDATION_ERROR`: 400 - Input validation failed
- `RATE_LIMIT_EXCEEDED`: 429 - Too many requests (P-058)
- `INTERNAL_ERROR`: 500 - Server error

---

## Rate Limiting (P-058)

| Endpoint Category | Limit | Window | Notes |
|-------------------|-------|--------|-------|
| Global (default) | 100 req | 15 min | General endpoints |
| Poll creation | 3 req | 1 hour | Free: 3/day, Premium: unlimited (P-058) |
| Live poll creation | 5 req | 24 hours | Live session creation |
| Live poll join | 10 req | 1 min | Join with code (P-058) |
| Vote submission | 30 req | 1 hour | Rate limited voting |
| Vote per poll | 1 req | forever | One vote per poll (P-058) |
| Authentication login | Progressive lockout | - | P-058 + P-059 |
| OTP verification | 3 req | 10 min | Exponential backoff (GAP-013) |
| Pretest attempts | 3 req | 24 hours | P-007 compliance (GAP-018) |
| Brute-force sensitive | Exponential backoff | - | Live code guessing, OTP (GAP-021) |

---

# Endpoint Documentation

---

## 1. Authentication (`/auth`)

### 1.1 Register

**Endpoint:** `POST /auth/register`
**Auth:** Public
**Rate Limit:** 5/hour per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecureP@ss123",
  "confirmPassword": "SecureP@ss123"
}
```

**Validation:**
- Email: Valid email format, unique
- Username: 3-30 chars, alphanumeric + underscore, unique
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "emailVerified": false,
    "createdAt": "2026-01-29T10:00:00Z"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 900
  }
}
```

---

### 1.2 Login

**Endpoint:** `POST /auth/login`
**Auth:** Public
**Rate Limit:** Progressive lockout (P-058)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "twoFactorCode": "123456"  // Optional, required if 2FA enabled
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user",
    "verificationLevel": 2,
    "emailVerified": true
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 900
  }
}
```

**Errors:**
- `INVALID_CREDENTIALS`: Email or password incorrect (sanitized per P-059)
- `ACCOUNT_LOCKED`: Account locked due to failed attempts (lockout timing hidden per P-059)
- `TWO_FACTOR_REQUIRED`: 2FA code needed
- `INVALID_2FA_CODE`: 2FA code incorrect

---

### 1.3 Refresh Token

**Endpoint:** `POST /auth/refresh`
**Auth:** Public (requires refresh token cookie)
**Rate Limit:** 10/hour

**Request Body:** None (refresh token from HttpOnly cookie)

**Response:** `200 OK`
```json
{
  "accessToken": "new_jwt_access_token",
  "expiresIn": 900
}
```

**Note:** Old refresh token is invalidated (single-use rotation)

---

### 1.4 Logout

**Endpoint:** `POST /auth/logout`
**Auth:** Required
**Rate Limit:** 10/min

**Request Body:** None

**Response:** `204 No Content`

**Side Effects:**
- Current session invalidated
- Refresh token revoked

---

### 1.5 Logout All Sessions

**Endpoint:** `POST /auth/logout-all`
**Auth:** Required
**Rate Limit:** 5/hour

**Request Body:** None

**Response:** `204 No Content`

**Side Effects:**
- All user sessions invalidated
- All refresh tokens revoked

---

### 1.6 Get Current User

**Endpoint:** `GET /auth/me`
**Auth:** Required
**Rate Limit:** 30/min

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "role": "user",
  "verificationLevel": 2,
  "emailVerified": true,
  "subscriptionTier": "premium",
  "createdAt": "2026-01-29T10:00:00Z"
}
```

---

### 1.7 Email Verification

**Send Verification Code**
**Endpoint:** `POST /auth/verify/send-code`
**Auth:** Required
**Rate Limit:** 3/hour

**Response:** `200 OK`
```json
{
  "message": "Verification code sent to email",
  "expiresIn": 600
}
```

**Confirm Email**
**Endpoint:** `POST /auth/verify/confirm`
**Auth:** Required
**Rate Limit:** 5/hour

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "emailVerified": true,
  "verificationLevel": 2
}
```

---

### 1.8 Password Management

**Forgot Password**
**Endpoint:** `POST /auth/password/forgot`
**Auth:** Public
**Rate Limit:** 3/hour per IP

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "If email exists, password reset link sent"
}
```

**Note:** Generic response to prevent email enumeration (P-059)

**Reset Password**
**Endpoint:** `POST /auth/password/reset`
**Auth:** Public
**Rate Limit:** 5/hour per IP

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecureP@ss123",
  "confirmPassword": "NewSecureP@ss123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

**Change Password (Authenticated)**
**Endpoint:** `POST /auth/password/change`
**Auth:** Required
**Rate Limit:** 5/hour

**Request Body:**
```json
{
  "currentPassword": "OldP@ss123",
  "newPassword": "NewSecureP@ss123",
  "confirmPassword": "NewSecureP@ss123"
}
```

---

### 1.9 Two-Factor Authentication

**Setup 2FA**
**Endpoint:** `POST /auth/2fa/setup`
**Auth:** Required
**Rate Limit:** 3/hour

**Response:** `200 OK`
```json
{
  "secret": "base32_secret",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["code1", "code2", "code3", "code4", "code5"]
}
```

**Enable 2FA**
**Endpoint:** `POST /auth/2fa/verify`
**Auth:** Required
**Rate Limit:** 10/hour

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "twoFactorEnabled": true
}
```

**Disable 2FA**
**Endpoint:** `POST /auth/2fa/disable`
**Auth:** Required
**Rate Limit:** 5/hour

**Request Body:**
```json
{
  "code": "123456"
}
```

---

## 2. Users (`/users`)

### 2.1 Check Username Availability

**Endpoint:** `GET /users/check-username/:username`
**Auth:** Public
**Rate Limit:** 30/min

**Response:** `200 OK`
```json
{
  "available": true
}
```

---

### 2.2 Search Users

**Endpoint:** `GET /users/search?q={query}&limit={limit}`
**Auth:** Public
**Rate Limit:** 30/min

**Query Parameters:**
- `q` (required): Search query (min 2 chars)
- `limit` (optional): Results limit (default: 10, max: 50)

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "johndoe",
      "displayName": "John Doe",
      "avatar": "https://cdn.example.com/avatar.jpg",
      "verificationLevel": 2,
      "followerCount": 1250
    }
  ]
}
```

---

### 2.3 Get User Profile

**Endpoint:** `GET /users/:username`
**Auth:** Optional (enhanced data if authenticated)
**Rate Limit:** 60/min

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "username": "johndoe",
  "displayName": "John Doe",
  "bio": "UX Designer & Poll Creator",
  "avatar": "https://cdn.example.com/avatar.jpg",
  "verificationLevel": 3,
  "subscriptionTier": "premium",
  "stats": {
    "pollCount": 45,
    "followerCount": 1250,
    "followingCount": 320,
    "totalVotes": 15000
  },
  "isFollowing": false,  // Only if authenticated
  "isBlocked": false,    // Only if authenticated
  "createdAt": "2025-06-15T10:00:00Z"
}
```

---

### 2.4 Update Current User Profile

**Endpoint:** `PATCH /users/me`
**Auth:** Required
**Rate Limit:** 10/hour

**Request Body:**
```json
{
  "displayName": "John Doe Jr.",
  "bio": "Updated bio text",
  "avatar": "https://cdn.example.com/new-avatar.jpg"
}
```

**Response:** `200 OK` (returns updated user object)

---

### 2.5 User Settings

**Get Settings**
**Endpoint:** `GET /users/me/settings`
**Auth:** Required
**Rate Limit:** 30/min

**Response:** `200 OK`
```json
{
  "privacy": {
    "profileVisibility": "public",
    "showEmail": false,
    "showFollowers": true
  },
  "notifications": {
    "email": true,
    "push": true,
    "pollUpdates": true,
    "newFollowers": true
  }
}
```

**Update Settings**
**Endpoint:** `PATCH /users/me/settings`
**Auth:** Required
**Rate Limit:** 10/hour

---

### 2.6 Follow Management

**Follow User**
**Endpoint:** `POST /users/:username/follow`
**Auth:** Required
**Rate Limit:** 30/hour

**Response:** `200 OK`
```json
{
  "isFollowing": true
}
```

**Unfollow User**
**Endpoint:** `DELETE /users/:username/follow`
**Auth:** Required
**Rate Limit:** 30/hour

---

### 2.7 Block Management

**Block User**
**Endpoint:** `POST /users/:username/block`
**Auth:** Required
**Rate Limit:** 10/hour

**Response:** `200 OK`
```json
{
  "isBlocked": true
}
```

**Unblock User**
**Endpoint:** `DELETE /users/:username/block`
**Auth:** Required
**Rate Limit:** 10/hour

**Get Blocked Users**
**Endpoint:** `GET /users/me/blocked?page={page}&limit={limit}`
**Auth:** Required
**Rate Limit:** 30/min

---

### 2.8 GDPR Compliance

**Export User Data**
**Endpoint:** `GET /users/me/data-export`
**Auth:** Required
**Rate Limit:** 1/day

**Response:** `200 OK`
```json
{
  "exportUrl": "https://cdn.example.com/exports/user-data-uuid.zip",
  "expiresAt": "2026-01-30T10:00:00Z"
}
```

**Request Account Deletion**
**Endpoint:** `DELETE /users/me`
**Auth:** Required
**Rate Limit:** 1/day

**Response:** `200 OK`
```json
{
  "scheduledDeletionAt": "2026-02-28T10:00:00Z",
  "gracePeriodDays": 30
}
```

**Cancel Account Deletion**
**Endpoint:** `POST /users/me/cancel-deletion`
**Auth:** Required
**Rate Limit:** 5/day

---

## 3. Polls (`/polls`)

### 3.1 List Polls

**Endpoint:** `GET /polls?sort={sort}&category={category}&page={page}&limit={limit}`
**Auth:** Optional
**Rate Limit:** 60/min

**Query Parameters:**
- `sort`: `trending` | `new` | `popular` | `ending_soon` (default: `trending`)
- `category`: Category slug (optional)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Response:** `200 OK`
```json
{
  "polls": [
    {
      "id": "uuid",
      "title": "What's your favorite programming language?",
      "slug": "favorite-programming-language",
      "creator": {
        "username": "johndoe",
        "displayName": "John Doe",
        "avatar": "https://cdn.example.com/avatar.jpg"
      },
      "voteCount": 1250,
      "commentCount": 45,
      "endsAt": "2026-02-15T23:59:59Z",
      "createdAt": "2026-01-20T10:00:00Z",
      "hasVoted": false  // Only if authenticated
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

---

### 3.2 Get Single Poll

**Endpoint:** `GET /polls/:id`
**Auth:** Optional
**Rate Limit:** 60/min

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "What's your favorite programming language?",
  "description": "Help us understand developer preferences",
  "slug": "favorite-programming-language",
  "type": "single_choice",
  "creator": {
    "id": "uuid",
    "username": "johndoe",
    "displayName": "John Doe",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "verificationLevel": 2
  },
  "options": [
    {
      "id": "uuid",
      "text": "JavaScript",
      "voteCount": 450,
      "percentage": 36.0
    },
    {
      "id": "uuid",
      "text": "Python",
      "voteCount": 400,
      "percentage": 32.0
    },
    {
      "id": "uuid",
      "text": "Rust",
      "voteCount": 250,
      "percentage": 20.0
    },
    {
      "id": "uuid",
      "text": "Other",
      "voteCount": 150,
      "percentage": 12.0
    }
  ],
  "voteCount": 1250,
  "commentCount": 45,
  "status": "active",
  "endsAt": "2026-02-15T23:59:59Z",
  "createdAt": "2026-01-20T10:00:00Z",
  "hasVoted": true,      // Only if authenticated
  "myVote": {            // Only if authenticated and voted
    "optionId": "uuid",
    "votedAt": "2026-01-21T14:30:00Z"
  }
}
```

---

### 3.3 Create Poll

**Endpoint:** `POST /polls`
**Auth:** Required
**Rate Limit:** 3/day (free), unlimited (premium) - P-058

**Request Body:**
```json
{
  "title": "What's your favorite programming language?",
  "description": "Help us understand developer preferences",
  "type": "single_choice",
  "options": [
    {"text": "JavaScript"},
    {"text": "Python"},
    {"text": "Rust"},
    {"text": "Other"}
  ],
  "endsAt": "2026-02-15T23:59:59Z",
  "categoryId": "uuid",
  "tags": ["programming", "technology"],
  "requireAuth": false,
  "requireVerification": false,
  "allowComments": true,
  "showLiveResults": true
}
```

**Validation:**
- Title: 10-200 chars
- Options: 2-10 options, each 1-100 chars
- endsAt: Optional, max 365 days from now

**Response:** `201 Created` (returns created poll object)

---

### 3.4 Vote on Poll

**Endpoint:** `POST /polls/:id/vote`
**Auth:** Required
**Rate Limit:** 30/hour, 1/min per poll, 1/forever per poll (P-058)

**Request Body (Single Choice):**
```json
{
  "optionId": "uuid"
}
```

**Request Body (Multiple Choice):**
```json
{
  "optionIds": ["uuid1", "uuid2"]
}
```

**Response:** `200 OK`
```json
{
  "vote": {
    "id": "uuid",
    "optionId": "uuid",
    "votedAt": "2026-01-29T10:00:00Z"
  },
  "updatedResults": {
    "voteCount": 1251,
    "options": [
      {
        "id": "uuid",
        "voteCount": 451,
        "percentage": 36.05
      }
    ]
  }
}
```

**Errors:**
- `ALREADY_VOTED`: User already voted on this poll (P-058)
- `POLL_ENDED`: Poll has ended
- `INVALID_OPTION`: Option ID not valid for this poll

---

### 3.5 Get Poll Results

**Endpoint:** `GET /polls/:id/results`
**Auth:** Optional
**Rate Limit:** 60/min

**Response:** `200 OK`
```json
{
  "pollId": "uuid",
  "totalVotes": 1250,
  "options": [
    {
      "id": "uuid",
      "text": "JavaScript",
      "voteCount": 450,
      "percentage": 36.0
    }
  ],
  "demographics": {  // Only for creator
    "byAge": {...},
    "byGender": {...},
    "byLocation": {...}
  }
}
```

---

### 3.6 Poll Analytics (Creator Only)

**Endpoint:** `GET /polls/:id/analytics`
**Auth:** Required (creator only)
**Rate Limit:** 30/min

**Response:** `200 OK`
```json
{
  "pollId": "uuid",
  "views": 5000,
  "uniqueVoters": 1250,
  "conversionRate": 25.0,
  "timeline": [
    {
      "timestamp": "2026-01-20T00:00:00Z",
      "votes": 150
    }
  ],
  "demographics": {
    "age": {"18-24": 450, "25-34": 500, "35-44": 200, "45+": 100},
    "gender": {"male": 600, "female": 550, "other": 100},
    "location": {"US": 500, "UK": 200, "CA": 150}
  },
  "deviceBreakdown": {
    "mobile": 750,
    "desktop": 400,
    "tablet": 100
  }
}
```

---

## 4. Surveys (`/surveys`)

### 4.1 Create Survey

**Endpoint:** `POST /surveys`
**Auth:** Required
**Rate Limit:** 5/day (free), unlimited (premium)

**Request Body:**
```json
{
  "title": "Product Feedback Survey",
  "description": "Help us improve our product",
  "sections": [
    {
      "title": "General Information",
      "questions": [
        {
          "type": "text",
          "text": "What is your occupation?",
          "required": true
        },
        {
          "type": "single_choice",
          "text": "How often do you use our product?",
          "options": ["Daily", "Weekly", "Monthly", "Rarely"],
          "required": true
        }
      ]
    }
  ],
  "endsAt": "2026-03-01T23:59:59Z"
}
```

**Response:** `201 Created`

---

### 4.2 Submit Survey Response

**Endpoint:** `POST /surveys/:id/respond`
**Auth:** Required
**Rate Limit:** 10/hour

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": "uuid",
      "answer": "Software Engineer"
    },
    {
      "questionId": "uuid",
      "selectedOptionId": "uuid"
    }
  ]
}
```

**Response:** `201 Created`

---

## 5. Tests (`/tests`)

### 5.1 Create Quiz

**Endpoint:** `POST /tests/quiz`
**Auth:** Required
**Rate Limit:** 5/day

**Request Body:**
```json
{
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your JavaScript knowledge",
  "questions": [
    {
      "text": "What is a closure?",
      "options": [
        {"text": "A function inside a function", "isCorrect": false},
        {"text": "A function with access to parent scope", "isCorrect": true}
      ],
      "points": 10
    }
  ],
  "passingScore": 70,
  "timeLimit": 1800
}
```

**Response:** `201 Created`

---

### 5.2 Submit Quiz Attempt

**Endpoint:** `POST /tests/:id/submit/quiz`
**Auth:** Required
**Rate Limit:** 10/day per test

**Request Body:**
```json
{
  "attemptId": "uuid",
  "answers": [
    {
      "questionId": "uuid",
      "selectedOptionId": "uuid"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "score": 85,
  "passed": true,
  "correctAnswers": 17,
  "totalQuestions": 20,
  "leaderboardRank": 42
}
```

---

## 6. Live Polls (`/live`)

### 6.1 Create Live Session

**Endpoint:** `POST /live/sessions`
**Auth:** Required
**Rate Limit:** 5/24h (P-058)

**Request Body:**
```json
{
  "pollId": "uuid",
  "allowAnonymous": true
}
```

**Response:** `201 Created`
```json
{
  "sessionId": "uuid",
  "code": "ABC123",
  "joinUrl": "https://voxpoll.com/live/ABC123",
  "expiresAt": "2026-01-29T11:00:00Z"
}
```

---

### 6.2 Join Live Session

**Endpoint:** `POST /live/sessions/:code/join`
**Auth:** Optional (anonymous allowed)
**Rate Limit:** 10/min (P-058) + Exponential backoff for code guessing (GAP-021)

**Request Body:**
```json
{
  "displayName": "Anonymous User"  // Required if not authenticated
}
```

**Response:** `200 OK`
```json
{
  "sessionId": "uuid",
  "participant": {
    "id": "uuid",
    "displayName": "Anonymous User",
    "isAnonymous": true
  },
  "poll": {
    "id": "uuid",
    "title": "Live Poll Question",
    "options": [...]
  }
}
```

**Errors:**
- `INVALID_CODE`: Session code not found (sanitized per P-059 + exponential backoff)
- `SESSION_ENDED`: Session has ended
- `SESSION_FULL`: Max participants reached

---

## 7. Payments (`/payments`)

### 7.1 Get Subscription Plans

**Endpoint:** `GET /payments/plans`
**Auth:** Public
**Rate Limit:** 30/min

**Response:** `200 OK`
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": {
        "pollsPerDay": 3,
        "maxOptions": 5,
        "analytics": false
      }
    },
    {
      "id": "premium",
      "name": "Premium",
      "price": 9.99,
      "interval": "month",
      "features": {
        "pollsPerDay": -1,
        "maxOptions": 20,
        "analytics": true,
        "prioritySupport": true
      }
    }
  ]
}
```

---

### 7.2 Create Checkout Session

**Endpoint:** `POST /payments/checkout`
**Auth:** Required
**Rate Limit:** 10/hour

**Request Body:**
```json
{
  "planId": "premium",
  "interval": "month"
}
```

**Response:** `200 OK`
```json
{
  "checkoutUrl": "https://stripe.com/checkout/session_xxx",
  "sessionId": "session_xxx"
}
```

---

## 8. Analytics (`/analytics`)

### 8.1 User Dashboard Analytics

**Endpoint:** `GET /analytics/me`
**Auth:** Required
**Rate Limit:** 30/min

**Response:** `200 OK`
```json
{
  "totalPolls": 45,
  "totalVotes": 15000,
  "totalViews": 75000,
  "averageVotesPerPoll": 333,
  "topPoll": {
    "id": "uuid",
    "title": "Best Pizza Topping",
    "voteCount": 5000
  },
  "growth": {
    "last7Days": {
      "polls": 5,
      "votes": 2000,
      "views": 10000
    }
  }
}
```

---

### 8.2 Poll Demographics

**Endpoint:** `GET /analytics/polls/:id/demographics`
**Auth:** Required (creator only)
**Rate Limit:** 30/min

**Response:** `200 OK`
```json
{
  "age": {
    "18-24": 450,
    "25-34": 500,
    "35-44": 200,
    "45+": 100
  },
  "gender": {
    "male": 600,
    "female": 550,
    "other": 100
  },
  "location": {
    "US": 500,
    "UK": 200,
    "CA": 150
  },
  "verificationLevel": {
    "0": 200,
    "1": 400,
    "2": 450,
    "3": 150,
    "4": 50
  }
}
```

---

## 9. Moderation (`/moderation`)

### 9.1 Create Report

**Endpoint:** `POST /moderation/reports`
**Auth:** Required
**Rate Limit:** 10/hour

**Request Body:**
```json
{
  "contentType": "poll",
  "contentId": "uuid",
  "reason": "spam",
  "description": "This poll is promotional spam"
}
```

**Response:** `201 Created`

---

### 9.2 Get Moderation Queue

**Endpoint:** `GET /moderation/queue?status={status}&page={page}`
**Auth:** Required (MODERATOR role)
**Rate Limit:** 60/min

**Query Parameters:**
- `status`: `pending` | `assigned` | `resolved` (default: `pending`)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 50)

**Response:** `200 OK`
```json
{
  "queue": [
    {
      "id": "uuid",
      "contentType": "poll",
      "contentId": "uuid",
      "reason": "spam",
      "status": "pending",
      "assignedTo": null,
      "createdAt": "2026-01-29T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### 9.3 Suspend User

**Endpoint:** `POST /moderation/users/:id/suspend`
**Auth:** Required (MODERATOR role)
**Rate Limit:** 20/hour

**Request Body:**
```json
{
  "reason": "Repeated spam violations",
  "duration": 7,
  "durationUnit": "days"
}
```

**Response:** `200 OK`

---

## 10. Organizations (`/organizations`)

### 10.1 Create Organization

**Endpoint:** `POST /organizations`
**Auth:** Required
**Rate Limit:** 5/day

**Request Body:**
```json
{
  "name": "Tech Corp",
  "slug": "tech-corp",
  "description": "Technology company",
  "website": "https://techcorp.com"
}
```

**Response:** `201 Created`

---

### 10.2 Invite Member

**Endpoint:** `POST /organizations/:id/invitations`
**Auth:** Required (ADMIN role in org)
**Rate Limit:** 20/hour

**Request Body:**
```json
{
  "email": "member@example.com",
  "role": "member"
}
```

**Response:** `201 Created`
```json
{
  "invitationId": "uuid",
  "invitationUrl": "https://voxpoll.com/invite/token_xxx",
  "expiresAt": "2026-02-05T10:00:00Z"
}
```

---

## Additional Routes Summary

### Health
- `GET /health` - Health check (public)

### Categories
- `GET /categories` - List all categories (public)

### Stats
- `GET /stats/platform` - Platform statistics (public)

### Uploads
- `POST /uploads/image` - Upload image (authenticated)

### Search
- `GET /search?q={query}&type={type}` - Global search (public)

### Feed
- `GET /feed` - Personalized feed (authenticated)

### Content Approval
- `GET /content-approval/queue` - Content approval queue (MODERATOR)

### Appeals
- `POST /appeals` - Submit appeal (authenticated)

### Audit Logs
- `GET /audit-logs` - View audit logs (ADMIN)

### Share
- `POST /polls/:id/share` - Generate share link (authenticated)

### Templates
- `GET /templates` - List poll templates (public)

### Notifications
- `GET /notifications` - Get user notifications (authenticated)
- `PATCH /notifications/:id/read` - Mark as read (authenticated)

### Gamification
- `GET /gamification/badges` - Get user badges (authenticated)
- `GET /gamification/leaderboard` - Global leaderboard (public)

### Comments
- `POST /polls/:id/comments` - Add comment (authenticated)
- `GET /polls/:id/comments` - Get comments (optional auth)

### Exports
- `GET /exports/polls/:id` - Export poll data (creator only)

---

## WebSocket API (Live Updates)

**Endpoint:** `wss://api.voxpoll.com/ws`
**Auth:** Required (via query param: `?token=<access_token>`)

**Events:**

**Server → Client:**
```json
{
  "event": "poll:vote",
  "data": {
    "pollId": "uuid",
    "optionId": "uuid",
    "voteCount": 1251
  }
}
```

**Client → Server:**
```json
{
  "event": "poll:subscribe",
  "pollId": "uuid"
}
```

**Supported Events:**
- `poll:vote` - New vote on poll
- `poll:comment` - New comment
- `live:join` - User joined live session
- `live:vote` - Live poll vote
- `notification:new` - New notification

---

## Bible Compliance References

**Security & Privacy:**
- P-057: Device fingerprinting (X-Device-ID header, fraud detection)
- P-058: Rate limiting (all limits documented above)
- P-059: Error sanitization (generic error messages, no timing leaks)

**Features:**
- P-001: Single question per poll
- P-003: Reliability scoring (T-009)
- P-004: Verification levels (0-4)
- P-007: Pre-test flow (3 attempts per 24h)

**Technical:**
- T-006: Argon2id for password hashing
- T-009: Reliability scoring formula

---

## Changelog

**2026-01-29**: Initial API Contract created (NyoWorks PHASE A Step 4)
- 155 endpoints documented
- Full authentication flow
- Rate limiting specifications (P-058)
- Bible compliance references

---

*VoxPoll API Contract v1 - NyoWorks Compliant*
