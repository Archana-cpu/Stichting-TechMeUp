# Database Migration Workflow
> VoxPoll Drizzle ORM Migration Guide

---

# ══════════════════════════════════════════════════════════════════════════════
# DRIZZLE ORM SETUP OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| ORM | Drizzle ORM | Latest |
| Driver | postgres (porsager) | Latest |
| CLI | Drizzle Kit | Latest |
| Database | PostgreSQL | 16+ |

## Migration Approach

VoxPoll uses **code-first** migrations with Drizzle:

```
TypeScript Schema → drizzle-kit generate → SQL Migrations → Database
```

---

# ══════════════════════════════════════════════════════════════════════════════
# PROJECT STRUCTURE
# ══════════════════════════════════════════════════════════════════════════════

```
packages/database/
├── drizzle.config.ts          # Drizzle Kit configuration
├── drizzle/
│   └── migrations/            # Generated SQL migrations
│       ├── 0000_*.sql
│       ├── 0001_*.sql
│       └── meta/
│           └── _journal.json  # Migration history
├── src/
│   ├── client.ts              # Database connection
│   ├── migrate.ts             # Migration runner
│   ├── index.ts               # Main exports
│   └── db/
│       └── schema/            # TypeScript schemas
│           ├── index.ts
│           ├── enums.ts
│           ├── users.ts
│           ├── polls.ts
│           ├── surveys.ts
│           ├── tests.ts
│           ├── social.ts
│           ├── organizations.ts
│           ├── notifications.ts
│           ├── moderation.ts
│           ├── analytics.ts
│           ├── payments.ts
│           ├── templates.ts
│           ├── misc.ts
│           └── relations.ts
└── package.json
```

---

# ══════════════════════════════════════════════════════════════════════════════
# DRIZZLE CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

## drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true
})
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional (for different environments)
DATABASE_URL_DEV=postgresql://...
DATABASE_URL_TEST=postgresql://...
DATABASE_URL_PROD=postgresql://...
```

---

# ══════════════════════════════════════════════════════════════════════════════
# AVAILABLE COMMANDS
# ══════════════════════════════════════════════════════════════════════════════

## Package Scripts (packages/database/package.json)

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate SQL migration from schema changes |
| `pnpm db:push` | Push schema directly to DB (dev only) |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:migrate:deploy` | Deploy migrations (production) |
| `pnpm db:seed` | Seed database with test data |
| `pnpm db:studio` | Open Drizzle Studio UI |
| `pnpm db:check` | Check migration consistency |
| `pnpm db:drop` | Drop all tables (dangerous) |

## Direct Drizzle Kit Commands

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Push schema directly (bypasses migrations - dev only)
npx drizzle-kit push

# Open Drizzle Studio
npx drizzle-kit studio

# Introspect existing database to generate schema
npx drizzle-kit introspect

# Check migration consistency
npx drizzle-kit check
```

---

# ══════════════════════════════════════════════════════════════════════════════
# MIGRATION WORKFLOWS
# ══════════════════════════════════════════════════════════════════════════════

## 1. Development Workflow (New Schema Changes)

```bash
# Step 1: Modify TypeScript schema files
# packages/database/src/db/schema/*.ts

# Step 2: Generate migration
cd packages/database
pnpm db:generate

# Step 3: Review generated SQL
# Check: drizzle/migrations/XXXX_*.sql

# Step 4: Apply migration to dev database
pnpm db:migrate

# Step 5: Verify with Drizzle Studio
pnpm db:studio
```

## 2. Quick Development (No Migration)

```bash
# Push schema changes directly (dev only!)
# WARNING: This bypasses migration files
pnpm db:push
```

## 3. Production Deployment

```bash
# Step 1: Ensure migrations are committed to git
git add drizzle/migrations/

# Step 2: Deploy with migration runner
pnpm db:migrate:deploy

# OR use CI/CD pipeline:
# - Migrations run before app starts
# - Use packages/database/src/migrate.ts
```

## 4. Introspection (Existing Database)

```bash
# Generate schema from existing database
npx drizzle-kit introspect

# This creates schema files from your DB
# Useful for:
# - Migrating from Prisma/other ORM
# - Verifying schema matches DB
# - Starting with existing production DB
```

---

# ══════════════════════════════════════════════════════════════════════════════
# PRISMA TO DRIZZLE MIGRATION
# ══════════════════════════════════════════════════════════════════════════════

## Migration Steps (Completed for VoxPoll)

### Step 1: Keep Database Intact
- Drizzle works with existing PostgreSQL databases
- No need to recreate or migrate data

### Step 2: Introspect Existing Schema
```bash
npx drizzle-kit introspect
```
This generates TypeScript schema from existing database.

### Step 3: Refine Generated Schema
- Add proper TypeScript types
- Add relations with `relations()` helper
- Organize into domain-specific files

### Step 4: Remove Prisma Dependencies
```bash
pnpm remove @prisma/client prisma
rm -rf prisma/
```

### Step 5: Setup Drizzle Client
```typescript
// packages/database/src/client.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './db/schema'

const client = postgres(process.env.DATABASE_URL!, { max: 20 })
export const db = drizzle(client, { schema })
```

### Step 6: Update Queries
```typescript
// Prisma
const user = await prisma.user.findUnique({ where: { id } })

// Drizzle
const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
```

---

# ══════════════════════════════════════════════════════════════════════════════
# BEST PRACTICES
# ══════════════════════════════════════════════════════════════════════════════

## Schema Organization

1. **One file per domain**: users.ts, polls.ts, surveys.ts
2. **Separate enums**: All enums in enums.ts
3. **Relations in dedicated file**: relations.ts
4. **Export everything from index.ts**

## Migration Safety

1. **Never edit migration files after deployment**
2. **Always review generated SQL before applying**
3. **Test migrations on staging first**
4. **Keep migration files in version control**
5. **Use `db:check` to verify consistency**

## Naming Conventions

```typescript
// Tables: lowercase, snake_case
export const users = pgTable('users', { ... })
export const poll_options = pgTable('poll_options', { ... })

// Columns: camelCase in TypeScript, snake_case in SQL
id: text('id').primaryKey()
createdAt: timestamp('created_at').defaultNow()

// Enums: PascalCase values
export const statusEnum = pgEnum('status', ['ACTIVE', 'INACTIVE', 'DELETED'])
```

## Type Safety

```typescript
// Infer types from schema
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

type User = InferSelectModel<typeof users>
type NewUser = InferInsertModel<typeof users>
```

---

# ══════════════════════════════════════════════════════════════════════════════
# TROUBLESHOOTING
# ══════════════════════════════════════════════════════════════════════════════

## Common Issues

### Migration out of sync
```bash
# Check migration status
pnpm db:check

# If needed, regenerate from current state
npx drizzle-kit introspect
```

### Schema doesn't match database
```bash
# Compare schema with DB
npx drizzle-kit check

# Force push (dev only!)
pnpm db:push --force
```

### Cannot connect to database
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
pnpm db:studio
```

---

# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL MIGRATION STATUS
# ══════════════════════════════════════════════════════════════════════════════

## Completed Migrations

| ID | Name | Date | Description |
|----|------|------|-------------|
| 0000 | graceful_titanium_man | 2026-01 | Full schema creation |
| 0001 | add_content_approval_system | 2026-01 | Content moderation tables |

## Migration Verification (2026-01-27)

### Source Analysis

| Source | Details |
|--------|---------|
| Bible Archive Prisma Models | ~60 models (docs/bible/_archive/bible-006,007,008,009,010,011,012,017,020,028.md) |
| Current Drizzle Tables | 84 tables (packages/database/src/db/schema/*.ts) |
| Git History | No schema.prisma ever committed |

### Key Finding

Proje git geçmişinde hiçbir zaman gerçek `schema.prisma` dosyası olmamış.
Bible arşivindeki Prisma modelleri sadece **dokümantasyon referansı** olarak yazılmış.
Gerçek implementasyon başından beri Drizzle ORM ile yapılmış.

### Verification Checklist

- [x] Bible arşivindeki Prisma modelleri Drizzle'a dönüştürülmüş
- [x] Drizzle şeması Bible spesifikasyonlarından daha kapsamlı (ek: quiz, gamification, content approval)
- [x] Tüm ilişkiler (relations) doğru tanımlanmış
- [x] Query performansı için indexler oluşturulmuş
- [x] Enum değerleri iş gereksinimlerine uygun
- [x] Codebase'de Prisma artifact yok (sadece node_modules/Sentry)
- [x] Migration dosyaları mevcut ve çalışır durumda

---

# ══════════════════════════════════════════════════════════════════════════════
# REFERENCES
# ══════════════════════════════════════════════════════════════════════════════

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs/overview)
- [Prisma to Drizzle Migration Guide](https://orm.drizzle.team/docs/guides/migrate-from-prisma)
- [postgres.js Driver](https://github.com/porsager/postgres)

---
