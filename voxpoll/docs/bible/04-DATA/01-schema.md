# Database Schema

> **NyoWorks Standard File** | Links to VoxPoll schema documentation

This file follows NyoWorks manifesto structure. For complete database schema, see:

**Primary Source:** [05-TECH/02-database-schema.md](../05-TECH/02-database-schema.md)

**Related Documents:**
- [Database Migration Workflow](../05-TECH/03-database-migration-workflow.md)
- [Migration Deployment Guide](./03-migration-deployment-guide.md)
- [Relationships](./02-relationships.md)

---

## Schema Overview

VoxPoll uses **PostgreSQL** with **Drizzle ORM**.

### Core Tables

#### Users & Authentication
- `users` - User accounts
- `sessions` - Active sessions
- `verification_tokens` - Email/phone verification
- `password_reset_tokens` - Password recovery

#### Content
- `polls` - Single-question polls (P-001)
- `poll_options` - Answer choices
- `responses` - User votes
- `surveys` - Multi-question surveys (P-002)
- `survey_questions` - Survey questions
- `survey_responses` - Survey answers

#### Organizations (B2B)
- `organizations` - Company/institution accounts
- `organization_members` - User-organization relationships
- `organization_roles` - Permission definitions
- `organization_invitations` - Pending invites

#### Social & Engagement
- `follows` - User following relationships
- `blocks` - Blocked users
- `comments` - Poll/survey comments
- `direct_messages` - User-to-user messaging
- `profile_visits` - Visit tracking

#### Gamification
- `user_xp` - Experience points
- `badges` - Achievement definitions
- `user_badges` - Unlocked badges
- `leaderboards` - Rankings

#### Data Quality
- `reliability_scores` - Poll reliability (P-003, T-009)
- `fraud_reports` - Detected suspicious activity
- `verification_documents` - ID verification uploads

#### Real-time Features
- `live_poll_rooms` - Live poll sessions (P-014)
- `live_poll_participants` - Room attendees
- `pulse_widgets` - Embeddable sentiment trackers (P-019)

---

## Naming Conventions

- **Tables**: Plural, snake_case (`users`, `poll_options`)
- **Columns**: snake_case (`created_at`, `user_id`)
- **Primary Keys**: `id` (UUID v7)
- **Foreign Keys**: `[table]_id` (`user_id`, `poll_id`)
- **Timestamps**: `created_at`, `updated_at`, `deleted_at`

---

## Soft Deletes

Most tables use soft deletes:
- `deleted_at` column (nullable timestamp)
- Records never physically deleted (GDPR compliance)
- Queries filter `WHERE deleted_at IS NULL`

**Partial indexes for performance:**
```sql
CREATE INDEX idx_users_active ON users (id) WHERE deleted_at IS NULL;
```

---

## Constraints & Indexes

### Unique Constraints
- `users.email` - UNIQUE
- `users.username` - UNIQUE
- `organizations.slug` - UNIQUE

### Indexes
- Primary keys: Automatic B-tree index
- Foreign keys: Indexed for JOIN performance
- Search columns: GIN indexes for full-text search
- Composite indexes: Multi-column queries

Example:
```sql
CREATE INDEX idx_responses_poll_user ON responses (poll_id, user_id);
CREATE INDEX idx_poll_options_poll ON poll_options (poll_id);
```

---

## Relationships

See [02-relationships.md](./02-relationships.md) for complete relationship diagram.

Key relationships:
- User `1:N` Polls (creator)
- Poll `1:N` Responses
- User `1:N` Responses (voter)
- Organization `1:N` OrganizationMembers
- User `N:M` Organizations (via OrganizationMembers)

---

## Migrations

Drizzle migrations stored in:
```
packages/database/drizzle/
├── 0000_init.sql
├── 0001_add_organizations.sql
├── 0002_add_verification_levels.sql
└── ...
```

**Migration Workflow:**
1. Update schema in `packages/database/src/schema/`
2. Generate migration: `pnpm db:generate`
3. Review SQL in `drizzle/` directory
4. Apply migration: `pnpm db:migrate`

See: [05-TECH/03-database-migration-workflow.md](../05-TECH/03-database-migration-workflow.md)

---

## Database Config

**Connection Pool:**
- Min connections: 5
- Max connections: 20
- Idle timeout: 30s
- Connection timeout: 5s

**Query Timeout:** 5 seconds

**SSL Mode:** Required in production

---

## Backup Strategy

- **Daily**: Full database backup (retained 30 days)
- **Hourly**: Incremental backup (retained 7 days)
- **Point-in-time recovery**: Enabled (AWS RDS)

---

*For complete schema definitions, see [05-TECH/02-database-schema.md](../05-TECH/02-database-schema.md)*
