# Database Relationships

> **NyoWorks Standard File** | VoxPoll Entity Relationships

Entity relationship diagram and cardinality documentation.

---

## Core Entity Relationships

### User-Centric Relationships

```
users
  ├─> 1:N polls (as creator)
  ├─> 1:N responses (as voter)
  ├─> 1:N surveys (as creator)
  ├─> 1:N survey_responses (as respondent)
  ├─> 1:N comments (as author)
  ├─> 1:1 user_xp (gamification)
  ├─> 1:N user_badges (achievements)
  ├─> N:M follows (as follower/followee)
  ├─> N:M blocks (as blocker/blockee)
  ├─> 1:N direct_messages (as sender)
  ├─> 1:N profile_visits (as visitor/visited)
  ├─> 1:N verification_documents
  └─> N:M organizations (via organization_members)
```

### Poll Relationships

```
polls
  ├─> N:1 users (creator)
  ├─> 1:N poll_options (choices)
  ├─> 1:N responses (votes)
  ├─> 1:N comments
  ├─> 1:1 reliability_scores (data quality)
  └─> 1:N fraud_reports (if flagged)
```

### Survey Relationships

```
surveys
  ├─> N:1 users (creator)
  ├─> N:1 organizations (B2B surveys)
  ├─> 1:N survey_questions
  └─> 1:N survey_responses

survey_questions
  ├─> N:1 surveys
  ├─> 1:N survey_question_options (if multiple choice)
  └─> 1:N survey_question_responses

survey_responses
  ├─> N:1 surveys
  ├─> N:1 users (respondent)
  └─> 1:N survey_question_responses
```

### Organization Relationships

```
organizations
  ├─> 1:N organization_members (employees)
  ├─> 1:N organization_invitations
  ├─> 1:N surveys (organization-created)
  └─> 1:1 organization_subscription (billing)

organization_members
  ├─> N:1 users
  ├─> N:1 organizations
  └─> N:1 organization_roles (permissions)
```

---

## Relationship Types

### One-to-One (1:1)
- `users` ↔ `user_xp`
- `polls` ↔ `reliability_scores`
- `organizations` ↔ `organization_subscription`

**Implementation**: Foreign key on one side

### One-to-Many (1:N)
- `users` → `polls`
- `polls` → `poll_options`
- `polls` → `responses`
- `organizations` → `organization_members`

**Implementation**: Foreign key on "many" side

### Many-to-Many (N:M)
- `users` ↔ `users` (follows)
- `users` ↔ `organizations` (via `organization_members`)
- `users` ↔ `badges` (via `user_badges`)

**Implementation**: Junction table with composite keys

---

## Foreign Key Constraints

### Cascading Behavior

**ON DELETE CASCADE:**
- `poll_options.poll_id` → `polls.id`
- `responses.poll_id` → `polls.id`
- `comments.poll_id` → `polls.id`

*Rationale:* If poll deleted, all related data should be removed

**ON DELETE SET NULL:**
- `polls.creator_id` → `users.id`
- `responses.user_id` → `users.id`

*Rationale:* Preserve content even if user account deleted (anonymize)

**ON DELETE RESTRICT:**
- `organization_members.organization_id` → `organizations.id`

*Rationale:* Cannot delete organization with active members

---

## Referential Integrity

All foreign keys have indexes for performance:

```sql
-- Example: Poll responses
CREATE INDEX idx_responses_poll_id ON responses (poll_id);
CREATE INDEX idx_responses_user_id ON responses (user_id);

-- Composite index for uniqueness
CREATE UNIQUE INDEX idx_responses_poll_user ON responses (poll_id, user_id)
WHERE deleted_at IS NULL;
```

---

## Self-Referential Relationships

### Follows (User to User)

```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES users(id),
  followee_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (follower_id != followee_id)
);

-- Prevent duplicate follows
CREATE UNIQUE INDEX idx_follows_unique
ON follows (follower_id, followee_id);
```

### Blocks (User to User)

```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES users(id),
  blocked_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (blocker_id != blocked_id)
);
```

---

## Relationship Queries

### Get User's Polls with Response Count

```typescript
const polls = await db.query.polls.findMany({
  where: eq(polls.creatorId, userId),
  with: {
    responses: true,
    _count: {
      select: { responses: true }
    }
  }
})
```

### Get Organization Members with Roles

```typescript
const members = await db.query.organizationMembers.findMany({
  where: eq(organizationMembers.organizationId, orgId),
  with: {
    user: true,
    role: true
  }
})
```

### Get Mutual Follows

```sql
SELECT f1.followee_id AS mutual_friend_id
FROM follows f1
JOIN follows f2 ON f1.followee_id = f2.follower_id
WHERE f1.follower_id = :userId
  AND f2.followee_id = :userId;
```

---

## Circular Dependency Prevention

**Problem**: Organizations can create surveys, surveys belong to organizations

**Solution**:
- `surveys.organization_id` nullable
- Individual users can create surveys without organization
- Organization surveys have `organization_id` set

---

## Soft Delete Relationships

When soft-deleting entities, related records behavior:

### User Soft Delete
- `polls.creator_id` → Keep (SET NULL behavior)
- `responses.user_id` → Keep (anonymize)
- `follows` → Soft delete (cascade)
- `blocks` → Soft delete (cascade)
- `organization_members` → Soft delete (cascade)

### Poll Soft Delete
- `poll_options` → Soft delete (cascade)
- `responses` → Soft delete (cascade)
- `comments` → Soft delete (cascade)

---

## Relationship Validation

### Business Rules
- User cannot follow themselves: `CHECK (follower_id != followee_id)`
- User cannot block themselves: `CHECK (blocker_id != blocked_id)`
- Poll must have 2-10 options: Application-level validation
- Organization must have at least 1 owner: Trigger-enforced

---

## Performance Considerations

### Query Optimization
- Foreign key indexes for all relationships
- Composite indexes for frequent JOIN patterns
- Partial indexes for soft-deleted records

### Denormalization
- `polls.response_count` - Cached count (updated via trigger)
- `users.follower_count` - Cached count (updated via trigger)
- `organizations.member_count` - Cached count (updated via trigger)

**Rationale**: Avoid COUNT(*) queries on large tables

---

*For schema implementation, see [01-schema.md](./01-schema.md)*
*For Drizzle definitions, see [05-TECH/02-database-schema.md](../05-TECH/02-database-schema.md)*
