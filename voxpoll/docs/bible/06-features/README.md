# Features Documentation

> **NyoWorks Standard Directory** | Links to VoxPoll-specific features

This directory follows NyoWorks manifesto structure. VoxPoll features are documented in:

**Primary Source:** [03-FEATURES/](../03-FEATURES/)

---

## VoxPoll Feature Set

### Core Features (03-FEATURES/)

1. **[Polls](../03-FEATURES/01-polls.md)** (P-001 to P-010)
   - Single-question polling
   - Multiple choice / Single choice
   - Anonymous voting
   - Pre-test capabilities (P-007, P-030)
   - Time-limited polls

2. **[Surveys](../03-FEATURES/02-surveys.md)** (P-002 to P-005)
   - Multi-question surveys
   - Organization-exclusive feature
   - Logic branching
   - Response analytics

3. **[Tests/Quizzes](../03-FEATURES/03-tests.md)** (P-006)
   - Knowledge assessment
   - Correct answer tracking
   - Score calculation
   - Leaderboards

4. **[Live Polls](../03-FEATURES/04-live-polls.md)** (P-014 to P-018)
   - Real-time WebSocket connection
   - Room-based polling
   - Host controls
   - Waiting room feature

5. **[Pulse Comments](../03-FEATURES/05-pulse-comments.md)** (P-019)
   - Quick sentiment tracking
   - Embed widget for external sites
   - Aggregate analytics

6. **[Social Features](../03-FEATURES/06-social.md)** (P2-001 to P2-004)
   - Follow/unfollow users
   - Block users
   - Direct messaging
   - Profile visits tracking

7. **[Gamification](../03-FEATURES/07-gamification.md)** (P2-008)
   - XP system
   - Badge achievements
   - Leaderboards
   - Verification incentives

8. **[Advanced Analytics](../03-FEATURES/08-analytics.md)** (P2-009)
   - Organization-tier feature
   - Demographics breakdown
   - Reliability scoring visualization
   - Export capabilities

9. **[Admin Dashboard](../03-FEATURES/09-admin.md)** (P2-010)
   - Internal team only
   - User management
   - Content moderation
   - System monitoring

---

## Authentication Features (05-TECH/)

- Email/Password authentication
- Phone OTP (P3-001)
- Magic Link (P3-003)
- Passkey/WebAuthn (P3-004)
- SSO for organizations (P3-005)
- e-Devlet integration (P3-006)

See: [03-user-flows/01-auth-flows.md](../03-user-flows/01-auth-flows.md)

---

## Data Quality Features (04-DATA/)

### Reliability Scoring (P-003, T-009)
- Sample Quality: 35%
- Response Quality: 30%
- Method Quality: 20%
- Verification Level: 15%

See: [04-DATA/03-reliability-scoring.md](../04-DATA/03-reliability-scoring.md)

### Fraud Detection (04-DATA/)
- IP-based detection
- Device fingerprinting
- Behavioral analysis
- Bot detection

See: [04-DATA/04-fraud-detection.md](../04-DATA/04-fraud-detection.md)

---

## User Verification (02-USERS/)

**Verification Levels** (P-004):
- Level 0: Email only
- Level 1: Phone verified
- Level 2: ID document (basic)
- Level 3: ID document (advanced) + selfie
- Level 4: e-Devlet / biometric

See: [02-USERS/04-verification-levels.md](../02-USERS/04-verification-levels.md)

---

## Organization Features (02-USERS/, 03-FEATURES/)

### Tiers
- **Startup**: 1-10 seats
- **Business**: 11-100 seats
- **Enterprise**: 100+ seats, custom pricing

### Organization Roles
- Owner
- Admin
- Manager
- Member

See: [02-USERS/02-organization-roles.md](../02-USERS/02-organization-roles.md)

---

## Technical Implementation

### API Endpoints
See: [05-api/01-api-contract.md](../05-api/01-api-contract.md) (155 endpoints)

### Database Schema
See: [05-TECH/02-database-schema.md](../05-TECH/02-database-schema.md)

### Frontend Implementation
See: [06-UX/05-frontend-architecture.md](../06-UX/05-frontend-architecture.md)

---

## Feature Priority

### P0 (Blocker) - Must Have
- User authentication
- Poll creation (P-001)
- Voting system
- Basic analytics

### P1 (Critical) - Current Phase
- Survey system (P-002)
- Organization management
- Reliability scoring (P-003)
- Gamification basics

### P2 (Important) - Next Release
- Social features (follow, DM, block)
- Advanced analytics (P2-009)
- Admin dashboard (P2-010)
- Badge system (P2-008)

### P3 (Nice to Have) - Future
- Phone OTP (P3-001)
- Magic Link (P3-003)
- Passkey (P3-004)
- SSO (P3-005)
- e-Devlet (P3-006)
- Meilisearch (P3-007)
- Webhooks (P3-008)
- Partykit migration (P3-009)

---

## Feature Flags

Features can be toggled via environment variables:
- `FEATURE_LIVE_POLLS`
- `FEATURE_PULSE_COMMENTS`
- `FEATURE_SOCIAL`
- `FEATURE_GAMIFICATION`

---

*Last updated: 2026-01-29*
*For detailed feature specifications, always refer to 03-FEATURES/ directory*
