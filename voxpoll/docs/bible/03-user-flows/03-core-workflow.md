# Core Workflow

> **NyoWorks Standard File** | VoxPoll Daily User Flows

Daily usage flows for individual users and organization members.

---

## Individual User Core Flow

### Home Feed Experience

```
User opens app
    │
    ├─> Feed loads (personalized based on interests)
    │   ├─> Active polls (not yet answered)
    │   ├─> Trending polls
    │   ├─> Followed users' polls
    │   └─> Recommended polls
    │
    ├─> User scrolls feed
    │   ├─> Poll appears
    │   ├─> User reads question
    │   └─> User votes
    │       ├─> Results shown immediately
    │       ├─> XP awarded (+10 XP)
    │       └─> Can comment, share, follow creator
    │
    └─> User creates poll
        └─> See "Poll Creation Flow" below
```

### Poll Creation Flow (P-001: Single Question)

```
User taps "Create Poll"
    │
    ├─> Step 1: Question
    │   ├─> Text input (max 280 chars)
    │   ├─> Optional: Add image (max 5MB)
    │   └─> Optional: Add description (max 500 chars)
    │
    ├─> Step 2: Answer Options
    │   ├─> Min 2, Max 10 options
    │   ├─> Text per option (max 100 chars)
    │   └─> Optional: Images per option
    │
    ├─> Step 3: Settings
    │   ├─> Visibility: Public / Followers / Private
    │   ├─> Duration: 1h / 6h / 24h / 3d / 7d / No limit
    │   ├─> Allow comments: Yes / No
    │   ├─> Multiple choice: Single / Multiple
    │   └─> Anonymous voting: Yes / No
    │
    ├─> Step 4: Pre-Test (P-007, P-030)
    │   ├─> Target audience: Age, gender, location
    │   ├─> Sample size: 10-1000 users
    │   ├─> Wait for pre-test results
    │   └─> Analyze demographics before full release
    │
    └─> Step 5: Publish
        ├─> Poll goes live
        ├─> XP awarded (+100 XP)
        └─> "First Poll" badge (if first)
```

**Decision**: **P-001** - Each poll contains exactly ONE question
- Multi-question surveys → Use Survey feature (P-002)

---

## Organization Member Core Flow

### Organization Dashboard

```
User logs in (organization member)
    │
    ├─> Dashboard loads
    │   ├─> Active surveys (created by org)
    │   ├─> Response analytics
    │   ├─> Team activity
    │   └─> Quota usage (based on tier)
    │
    ├─> Create Survey (if permission)
    │   ├─> Multi-question survey (P-002)
    │   ├─> Target internal audience (employees)
    │   ├─> OR target external audience (public)
    │   └─> Schedule deployment
    │
    ├─> View Analytics (if permission)
    │   ├─> Response rates
    │   ├─> Demographics breakdown
    │   ├─> Reliability scores (P-003)
    │   └─> Export data (CSV/Excel)
    │
    └─> Manage Team (if Admin/Manager)
        ├─> Invite members
        ├─> Assign roles
        └─> Set permissions
```

### Survey Creation Flow (Organizations)

```
Admin creates survey
    │
    ├─> Step 1: Survey Info
    │   ├─> Title (max 200 chars)
    │   ├─> Description (max 1000 chars)
    │   └─> Purpose (internal/external)
    │
    ├─> Step 2: Questions
    │   ├─> Add multiple questions (P-002)
    │   ├─> Question types:
    │   │   ├─> Multiple choice
    │   │   ├─> Single choice
    │   │   ├─> Text input
    │   │   ├─> Rating scale (1-5, 1-10)
    │   │   └─> Yes/No
    │   └─> Logic branching (conditional questions)
    │
    ├─> Step 3: Targeting
    │   ├─> Internal: Select departments/roles
    │   ├─> External: Define demographics
    │   └─> Sample size limits
    │
    ├─> Step 4: Schedule
    │   ├─> Start date/time
    │   ├─> End date/time
    │   └─> Reminder emails
    │
    └─> Step 5: Deploy
        ├─> Survey goes live
        ├─> Invitations sent (if internal)
        └─> Public link generated (if external)
```

---

## Live Poll Flow (P-014)

Real-time polling with WebSocket connection:

```
Creator starts live poll
    │
    ├─> Room created (unique code)
    ├─> Participants join via code/link
    ├─> Poll questions sent one-by-one
    ├─> Results update in real-time
    └─> Creator controls poll progression
```

**Use Cases:**
- Conference presentations
- Classroom engagement
- Town hall meetings
- Webinar Q&A

---

## Pulse Comments Flow (P-019)

Quick sentiment tracking on existing content:

```
User views article/video/post
    │
    └─> "How do you feel?" widget
        ├─> Quick reactions (emoji-based)
        ├─> Aggregate sentiment shown
        └─> Trends over time
```

---

## Gamification Integration

### XP System
- Vote on poll: +10 XP
- Create poll: +100 XP
- Comment: +5 XP
- Follow user: +2 XP
- Poll reaches 100 votes: +50 XP (creator)

### Badge System (P-008)
Badges unlocked through:
- Milestones (100 polls created)
- Quality (high reliability score)
- Engagement (1000 votes received)
- Verification (Level 4 verified)

### Leaderboards
- Weekly top creators
- Most engaged users
- Highest reliability scores

---

## Notification Triggers

Users receive notifications for:
- New follower
- Poll comment
- Mention in comment
- Poll milestone (100/1K/10K votes)
- Badge unlocked
- Survey invitation (organizations)

---

## Search & Discovery

### Discover Tab
- Trending polls
- Category-based browsing
- Creator recommendations
- Hashtag exploration

### Search Features
- Full-text search (Meilisearch)
- Filters: Date, category, creator
- Sort: Recent, trending, most voted

---

## Accessibility Features

- Screen reader support
- Keyboard navigation
- High contrast mode
- Font size adjustment
- Voice input for poll creation

---

*For complete user flows including edge cases, see [06-UX/01-user-flows.md](../06-UX/01-user-flows.md)*
