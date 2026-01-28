# ██████████████████████████████████████████████████████████████████████████████
# █                                                                            █
# █                         VOXPOLL PROJECT RULES                              █
# █                      Coding Standards & Guidelines                         █
# █                                                                            █
# ██████████████████████████████████████████████████████████████████████████████
#
# Version: 1.0.0
# Last Updated: January 2026
# Status: AUTHORITATIVE
#
# This document defines the coding standards, conventions, and rules that
# MUST be followed throughout the VOXPOLL project. All team members and
# AI assistants must adhere to these rules.
#
# ██████████████████████████████████████████████████████████████████████████████




# ══════════════════════════════════════════════════════════════════════════════
# 1. TECH STACK (January 2026)
# ══════════════════════════════════════════════════════════════════════════════

## 1.1 Core Technologies

┌──────────────────────────────────────────────────────────────────────────────────┐
│                              TECH STACK                                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Category           │ Technology      │ Version  │ Notes                        │
│  ───────────────────┼─────────────────┼──────────┼──────────────────────────────│
│  Web Framework      │ Next.js         │ 16+      │ Server Actions, App Router   │
│  Mobile Framework   │ React Native    │ 0.76+    │ With Expo Router             │
│  Mobile Tooling     │ Expo            │ SDK 52+  │ File-based routing           │
│  Monorepo           │ Turborepo       │ 2.x      │ With pnpm workspaces         │
│  Language           │ TypeScript      │ 5.7+     │ Strict mode enabled          │
│  Package Manager    │ pnpm            │ 9.x      │ Fast, disk-efficient         │
│                                                                                  │
│  ═══════════════════════════════════════════════════════════════════════════    │
│                                                                                  │
│  ORM                │ Drizzle ORM     │ Latest   │ SQL-first, type-safe         │
│  Database           │ PostgreSQL      │ 16+      │ Primary data store           │
│  Cache              │ Redis           │ 7.x      │ With Drizzle cache adapter   │
│                                                                                  │
│  ═══════════════════════════════════════════════════════════════════════════    │
│                                                                                  │
│  Styling            │ Tailwind CSS    │ 4.x      │ Utility-first                │
│  UI Components      │ shadcn/ui       │ Latest   │ Accessible components        │
│  Validation         │ Zod             │ 3.x      │ Schema validation            │
│  Testing            │ Vitest          │ 3.x      │ Unit tests                   │
│  E2E Testing        │ Playwright      │ Latest   │ Cross-browser E2E            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

## 1.2 Why Drizzle ORM (Not Prisma)

┌──────────────────────────────────────────────────────────────────────────────────┐
│                         DRIZZLE vs PRISMA DECISION                               │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Criteria                    │ Drizzle        │ Prisma         │ Winner         │
│  ────────────────────────────┼────────────────┼────────────────┼────────────────│
│  Bundle Size                 │ ~7kb           │ ~6.5MB         │ Drizzle        │
│  Serverless Cold Start       │ ~0ms           │ 300-500ms      │ Drizzle        │
│  Complex Joins               │ 14x faster     │ N+1 issues     │ Drizzle        │
│  Edge Functions              │ Native         │ Limited        │ Drizzle        │
│  SQL Control                 │ Full           │ Abstracted     │ Drizzle        │
│  Type Inference              │ Runtime        │ Code-gen       │ Draw           │
│  Redis Cache                 │ Native         │ Manual         │ Drizzle        │
│  License                     │ Apache 2.0     │ Apache 2.0     │ Draw           │
│                                                                                  │
│  DECISION: Drizzle ORM is the ONLY supported ORM for VOXPOLL.                   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘




# ══════════════════════════════════════════════════════════════════════════════
# 2. CODE STYLE RULES
# ══════════════════════════════════════════════════════════════════════════════

## 2.1 Mandatory Rules

┌──────────────────────────────────────────────────────────────────────────────────┐
│                              CODE STYLE RULES                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Rule                        │ Status │ Example                                  │
│  ────────────────────────────┼────────┼──────────────────────────────────────────│
│  No semicolons               │ ❌     │ const x = 1    (not const x = 1;)        │
│  No comment lines            │ ❌     │ Except Section Dividers                  │
│  No description lines        │ ❌     │ No JSDoc, no inline comments             │
│  Export at end of file       │ ✅     │ RFCE pattern (export default at bottom)  │
│  Code = 100% English         │ ✅     │ Variables, functions, types in English   │
│  Content from /content       │ ✅     │ Zero hardcoded strings                   │
│  Ask before writing code     │ ✅     │ Always confirm with user first           │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

## 2.2 Section Dividers (Only Allowed Comments)

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SECTION NAME
// ══════════════════════════════════════════════════════════════════════════════
```

These are the ONLY comments allowed in code files. They serve as visual separators
between logical sections of code.

## 2.3 Export Pattern (RFCE)

```typescript
// ✅ CORRECT - Export at the end
const MyComponent = () => {
  return <div>Hello</div>
}

export default MyComponent

// ❌ WRONG - Export at the top
export default function MyComponent() {
  return <div>Hello</div>
}
```




# ══════════════════════════════════════════════════════════════════════════════
# 3. ZERO HARDCODE RULE
# ══════════════════════════════════════════════════════════════════════════════

## 3.1 All User-Facing Content

All strings that users see MUST come from the content system:

```
/content
├── /tr                    # Turkish translations
│   ├── common.json
│   ├── auth.json
│   ├── errors.json
│   └── ...
├── /en                    # English translations
│   ├── common.json
│   ├── auth.json
│   ├── errors.json
│   └── ...
└── index.ts               # Content loader
```

## 3.2 All Configuration Values

All configuration values MUST come from environment or config:

```typescript
// ✅ CORRECT
const maxPolls = config.limits.polls.daily.free

// ❌ WRONG
const maxPolls = 3
```

## 3.3 No Magic Numbers

```typescript
// ✅ CORRECT
const delay = ANIMATION_DURATION.fadeIn

// ❌ WRONG
const delay = 300
```




# ══════════════════════════════════════════════════════════════════════════════
# 4. EDUCATIONAL DOCUMENTATION RULE
# ══════════════════════════════════════════════════════════════════════════════

## 4.1 Purpose

Naim is learning while building VOXPOLL. Every piece of documentation and code
must be written as if teaching a student.

## 4.2 Documentation Format

Every schema, function, or significant code block MUST include:

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// USERS TABLE
// ══════════════════════════════════════════════════════════════════════════════

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ WHAT: User accounts table - stores all registered users                     │
// │ WHY:  Central user identity for authentication and authorization            │
// │ SQL:  CREATE TABLE users (id TEXT PRIMARY KEY, ...)                         │
// └─────────────────────────────────────────────────────────────────────────────┘

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow()
})

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ LEARNING NOTES:                                                             │
// │                                                                             │
// │ • pgTable("users", {...})                                                   │
// │   └─ Creates a PostgreSQL table named "users"                               │
// │   └─ SQL: CREATE TABLE users (...)                                          │
// │                                                                             │
// │ • text("id").primaryKey()                                                   │
// │   └─ Creates a TEXT column as primary key                                   │
// │   └─ SQL: id TEXT PRIMARY KEY                                               │
// │                                                                             │
// │ • .$defaultFn(() => createId())                                             │
// │   └─ Generates CUID on insert (client-side)                                 │
// │   └─ CUID = Collision-resistant Unique Identifier                           │
// │   └─ URL-safe, sortable, 25 characters                                      │
// │                                                                             │
// │ • varchar("email", { length: 255 })                                         │
// │   └─ Creates VARCHAR(255) column                                            │
// │   └─ SQL: email VARCHAR(255)                                                │
// │                                                                             │
// │ • .notNull()                                                                │
// │   └─ Adds NOT NULL constraint                                               │
// │   └─ SQL: email VARCHAR(255) NOT NULL                                       │
// │                                                                             │
// │ • .unique()                                                                 │
// │   └─ Adds UNIQUE constraint                                                 │
// │   └─ SQL: email VARCHAR(255) NOT NULL UNIQUE                                │
// │                                                                             │
// │ • timestamp("created_at").defaultNow()                                      │
// │   └─ Creates TIMESTAMP column with default NOW()                            │
// │   └─ SQL: created_at TIMESTAMP DEFAULT NOW()                                │
// └─────────────────────────────────────────────────────────────────────────────┘
```

## 4.3 SQL Equivalents

Every Drizzle schema MUST show the SQL equivalent:

```typescript
// Drizzle
export const polls = pgTable("polls", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  title: varchar("title", { length: 200 }).notNull(),
  status: pollStatusEnum("status").default("DRAFT"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
})

// SQL Equivalent (for learning):
// CREATE TABLE polls (
//   id TEXT PRIMARY KEY,
//   title VARCHAR(200) NOT NULL,
//   status poll_status DEFAULT 'DRAFT',
//   created_at TIMESTAMP DEFAULT NOW(),
//   updated_at TIMESTAMP DEFAULT NOW()
// );
```




# ══════════════════════════════════════════════════════════════════════════════
# 5. BIBLE DOCUMENTATION RULES
# ══════════════════════════════════════════════════════════════════════════════

## 5.1 Update Requirements

Every code change MUST be reflected in the relevant bible document:

| Change Type | Bible Document |
|-------------|----------------|
| Schema change | bible-013.md |
| API endpoint | bible-014.md, bible-api-routes.md |
| User flow | bible-022.md, bible-api-flows.md |
| Business rule | bible-015.md |
| Security | bible-017.md |

## 5.2 Section Markers

Use consistent markers in bible documents:

```
[MUST]     - Mandatory requirement
[SHOULD]   - Strongly recommended
[MAY]      - Optional
[NEVER]    - Explicitly prohibited
[DECISION] - Finalized decision
[SECURITY] - Security-critical
```

## 5.3 Cross-References

Always link related sections:

```
[REFERENCE] See Bible-013 §13.2 for User schema
[CROSS-REF] Bible-028 §28.1 overrides this section
```




# ══════════════════════════════════════════════════════════════════════════════
# 6. FILE NAMING CONVENTIONS
# ══════════════════════════════════════════════════════════════════════════════

## 6.1 File Names

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | PollCard.tsx |
| Utilities | camelCase | formatDate.ts |
| Constants | camelCase | limits.ts |
| Types | camelCase | user.types.ts |
| Schema | camelCase | schema.ts |
| Config | camelCase | drizzle.config.ts |

## 6.2 Folder Names

All folder names are lowercase with hyphens:
- `user-profile/`
- `poll-results/`
- `auth-flows/`




# ══════════════════════════════════════════════════════════════════════════════
# 7. GIT COMMIT RULES
# ══════════════════════════════════════════════════════════════════════════════

## 7.1 Commit Message Format

```
<type>: <short description>

<body - what changed and why>

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 7.2 Commit Types

| Type | Description |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation only |
| style | Formatting, no code change |
| refactor | Code restructuring |
| test | Adding tests |
| chore | Maintenance tasks |

## 7.3 Examples

```
feat: add user registration with email verification

- Added registration form with Zod validation
- Implemented email verification flow
- Added rate limiting for registration endpoint
- Updated bible-005.md with new user states

Co-Authored-By: Claude <noreply@anthropic.com>
```




# ══════════════════════════════════════════════════════════════════════════════
# 8. DRIZZLE ORM PATTERNS
# ══════════════════════════════════════════════════════════════════════════════

## 8.1 Schema Definition Pattern

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ══════════════════════════════════════════════════════════════════════════════

import { pgTable, text, varchar, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"

// ══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════════════════════════

export const userStatusEnum = pgEnum("user_status", [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "BANNED",
  "DELETED"
])

// ══════════════════════════════════════════════════════════════════════════════
// TABLES
// ══════════════════════════════════════════════════════════════════════════════

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  status: userStatusEnum("status").default("PENDING_VERIFICATION"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
})

// ══════════════════════════════════════════════════════════════════════════════
// RELATIONS
// ══════════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many, one }) => ({
  polls: many(polls),
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId]
  })
}))
```

## 8.2 Query Patterns

```typescript
// ══════════════════════════════════════════════════════════════════════════════
// SELECT - Find user by email
// ══════════════════════════════════════════════════════════════════════════════

const user = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1)

// SQL: SELECT * FROM users WHERE email = $1 LIMIT 1

// ══════════════════════════════════════════════════════════════════════════════
// INSERT - Create new user
// ══════════════════════════════════════════════════════════════════════════════

const [newUser] = await db
  .insert(users)
  .values({
    email: "user@example.com",
    status: "ACTIVE"
  })
  .returning()

// SQL: INSERT INTO users (id, email, status, created_at, updated_at)
//      VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE - Update user status
// ══════════════════════════════════════════════════════════════════════════════

await db
  .update(users)
  .set({ status: "SUSPENDED" })
  .where(eq(users.id, userId))

// SQL: UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2

// ══════════════════════════════════════════════════════════════════════════════
// DELETE - Soft delete user
// ══════════════════════════════════════════════════════════════════════════════

await db
  .update(users)
  .set({
    status: "DELETED",
    deletedAt: new Date()
  })
  .where(eq(users.id, userId))

// SQL: UPDATE users SET status = 'DELETED', deleted_at = NOW() WHERE id = $1
```

## 8.3 Redis Cache Pattern

```typescript
import { drizzle } from "drizzle-orm/postgres-js"
import { upstashCache } from "drizzle-orm/cache/upstash"

const db = drizzle(client, {
  cache: upstashCache()
})

// Query with cache
const users = await db
  .select()
  .from(usersTable)
  .$withCache()

// Query with custom cache TTL
const users = await db
  .select()
  .from(usersTable)
  .$withCache({ ttl: 60 }) // 60 seconds

// Invalidate cache
await db.$cache?.invalidate({ tables: ["users"] })
```




# ══════════════════════════════════════════════════════════════════════════════
# 9. SUMMARY CHECKLIST
# ══════════════════════════════════════════════════════════════════════════════

Before submitting any code, verify:

□ No semicolons at end of lines
□ No comments except section dividers
□ Export at end of file (RFCE pattern)
□ All code in English
□ All user-facing strings from /content
□ No hardcoded values (use config)
□ Educational notes added (WHAT/WHY/SQL)
□ Related bible document updated
□ Drizzle ORM used (not Prisma)
□ Commit message follows format




# ══════════════════════════════════════════════════════════════════════════════
# END OF PROJECT RULES
# ══════════════════════════════════════════════════════════════════════════════
# Status: AUTHORITATIVE
# This document overrides any conflicting specifications in other bible documents.
# ══════════════════════════════════════════════════════════════════════════════
