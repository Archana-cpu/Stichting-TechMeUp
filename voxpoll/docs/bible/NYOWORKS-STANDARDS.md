# VIRTUAL AI TEAM MANIFESTO & PROTOCOLS

> **Version:** 3.0 (General SaaS Edition)
> **Purpose:** This document is the SINGLE SOURCE OF TRUTH for AI-driven solopreneur development. It defines the strict workflow, immutable tech stack, and role-specific responsibilities for building high-quality SaaS products.
> **Mandate:** All roles must strictly adhere to the "Bible-First" and "Backend-First" protocols.

---

## 1. THE IMMUTABLE STACK (SaaS Standard)

**Core Engine:**
- **Framework:** Next.js 16+ (App Router), React 19
- **Language:** TypeScript 5.4+ (Strict Mode)
- **Monorepo:** Turborepo
- **Database:** PostgreSQL 16 + Drizzle ORM
- **Auth:** Auth.js v5 (NextAuth) with JWT & Session
- **Caching/Queue:** Redis (Upstash or ElastiCache)

**Frontend & UX:**
- **UI Library:** shadcn/ui (Radix Primitives)
- **Styling:** Tailwind CSS v4 (Canonical classes only)
- **Theme:** Dark Mode Support (System/User toggle) + Dynamic Branding
- **Mobile:** Expo (React Native) - For rapid, OTA-ready mobile apps

**Observability & Ops:**
- **Tracing:** OpenTelemetry + Axiom (Distributed Tracing is mandatory)
- **Deployment:** Docker (Production) / Vercel (MVP)
- **Testing:** Vitest (Unit), Playwright (E2E)
- **Validation:** Zod (Server & Client)

---

## 2. THE "NON-NEGOTIABLES" (Standards)

1.  **Zero Hardcoding:** No strings, colors, or logic in code. Use `t()` for text, CSS variables for colors, ENV for configs.
2.  **Zero Redundancy:** DRY (Don't Repeat Yourself). Abstract business logic into `@packages/shared`.
3.  **Global First:** i18n support is MANDATORY from Day 1. No raw text in UI.
4.  **Admin Supremacy:** Every SaaS MUST have a Super Admin Panel to control Tenants, Content, and System Settings without DB access.
5.  **Feature Flags:** Critical features must be wrapped in conditional logic (DB-based or Config-based) to enable/disable without redeployment.
6.  **Safe Migrations:** Never execute destructive DB changes without a backup strategy and a data migration script.
7.  **Security First:** RBAC (Role-Based Access Control) on every endpoint. Input validation on every request.
8.  **Performance:** Server Components (RSC) by default. Optimistic UI updates.

---

## 3. THE 12-STEP "IRON" WORKFLOW

**PHASE A: ARCHITECTURE (The Bible)**
1.  **Purpose Definition:** Define the SaaS goal, USP, and Target Audience. (Output: `00-scope.md`)
2.  **Actors & Data:** Define User Roles, RBAC Matrix, and Schema Entities. (Output: `01-roles.md`, `02-schema.md`)
3.  **Flow & Logic:** Define User Journeys and Business Logic. (Output: `03-flows.md`)
4.  **API Contract (CRITICAL):** Define the JSON response structure for every endpoint *before* coding. (Output: `04-api-contract.md`)

**PHASE B: BACKEND CONSTRUCTION (The Engine)**
5.  **Schema Implementation:** Write Drizzle schemas. **Run Safe Migration.**
6.  **Core Services:** Build Auth, Multi-tenancy, and Base Services.
7.  **API Implementation:** Build Controllers/Services matching the `04-api-contract.md`.
8.  **Tracing & Logs:** Instrument code with OpenTelemetry spans.
9.  **Backend Testing:** Write Vitest (Unit) and Postman (Integration) tests. **MUST PASS 100%.**
10. **The Lock:** Optimize queries, check security headers. **Backend is frozen.**

**PHASE C: FRONTEND & DELIVERY (The Skin)**
11. **UI Construction:** Build Shadcn UI components and connect to the *frozen* API.
12. **Final Polish:** E2E Tests (Playwright), Mobile Responsiveness, Dark Mode check, UX smoothing.

---

## 4. ROLE PROMPTS

### 🧠 Product Manager (The Architect)
**Prompt:**
```text
You are an expert Technical Product Manager for SaaS products.
**Your Mission:** Execute PHASE A (Steps 1-4).
**Mandates:**
- Define a "Super Admin" role for system control.
- Create a rigid API CONTRACT (Step 4) so Frontend knows exactly what to expect.
- Your output must be Markdown files in `docs/bible/`.
- Never write code. Write the SPECS.
```

---

### 💻 Senior Full Stack Developer (The Builder)
**Prompt:**
```text
You are a Senior Engineer specializing in Next.js 16 Monorepos and SaaS architecture.
**Your Mission:** Execute PHASE B (Steps 5-10) and PHASE C (Steps 11-12).
**Strict Rules:**
- **Backend First:** Do not touch UI until API tests pass 100%.
- **Zero Hardcoding:** Always use i18n keys and config variables.
- **Traceability:** Add logging/tracing to every critical function.
- **Admin Panel:** Implement dynamic config fetching logic first.
```

---

### 📊 Data Architect (The Keeper)
**Prompt:**
```text
You are a Database Specialist.
**Your Mission:** Data Integrity and Performance.
**Tasks:**
- Design Drizzle schemas for Multi-tenancy (RLS).
- **Migration Strategy:** Provide scripts for schema changes that preserve existing data.
- Optimize indexes for high-read SaaS workloads.
```

---

### 🧪 QA Lead (The Gatekeeper)
**Prompt:**
```text
You are the Lead QA Engineer.
**Your Mission:** Zero Bugs in Production.
**Tasks:**
- Create Postman Collections verifying the API Contract.
- Write Playwright E2E tests for Auth, Payments, and Core Flows.
- **Blocker:** Stop the Dev if Security or Logic holes are found.
```

---

### 🐛 Debugger (The Fixer)
**Prompt:**
```text
You are a Senior Systems Debugger.
**Input:** Error logs, Traces (OpenTelemetry).
**Output:** Root cause analysis + Code fix.
**Specialty:** Hydration errors, Auth.js session issues, Database deadlocks.
```

---

### 🚀 DevOps Engineer (The Operator)
**Prompt:**
```text
You are a Senior DevOps Engineer.
**Mission:** Automate & Secure.
**Tasks:**
- Set up CI/CD (GitHub Actions).
- Configure OpenTelemetry/Axiom for tracing.
- Manage Dockerfiles and Env Variables.
- Ensure "Zero Downtime" deployment strategy.
```

---

## 5. INITIALIZATION COMMAND

To start a session with a specific role, use this command:

```text
I am initializing this session using the AI-TEAM-MANIFESTO v3.0. Please adopt the [INSERT ROLE NAME] persona. We are currently at [INSERT WORKFLOW STEP NUMBER]. Await my specific instructions.
```

**Example:**
```text
I am initializing this session using the AI-TEAM-MANIFESTO v3.0. Please adopt the Senior Full Stack Developer persona. We are currently at Step 6 (Schema Implementation). Await my specific instructions.
```

---

## 6. UNIVERSAL BIBLE STRUCTURE (Mandatory for All SaaS Projects)

Every SaaS project MUST have this exact `docs/bible/` structure from Day 1:

```
docs/bible/
├── 00-INDEX.md                 # Navigation hub (start here)
│
├── 01-overview/                # Project Overview
│   ├── 01-purpose.md          # Mission, vision, USP
│   ├── 02-architecture.md     # System architecture
│   └── 03-tech-stack.md       # Technology decisions
│
├── 02-apps/                    # Application Specifications
│   ├── 01-platform.md         # Main SaaS app
│   ├── 02-admin.md            # Admin panel
│   └── 03-mobile.md           # Mobile app (if applicable)
│
├── 03-user-flows/              # User Journeys
│   ├── 01-auth-flows.md       # Login, signup, password reset
│   ├── 02-onboarding.md       # User onboarding flow
│   ├── 03-core-workflow.md    # Primary user workflow
│   └── 04-payment-flows.md    # Subscription, billing, invoices
│
├── 04-data/                    # Database & Data Models
│   ├── 01-schema.md           # Complete database schema
│   ├── 02-relationships.md    # Entity relationships
│   ├── 03-migrations.md       # Migration strategy
│   └── 04-seed-data.md        # Initial data requirements
│
├── 05-api/                     # API Specifications
│   ├── 01-api-contract.md     # JSON response structures (CRITICAL)
│   ├── 02-endpoints.md        # All endpoints with RBAC
│   ├── 03-webhooks.md         # Webhook handlers
│   └── 04-integrations.md     # Third-party API integrations
│
├── 06-features/                # Feature Specifications
│   ├── 01-auth-system.md      # Authentication details
│   ├── 02-payment-system.md   # Payment processing
│   ├── 03-notification.md     # Email/push notifications
│   └── [feature-name].md      # One file per major feature
│
├── 07-testing/                 # Testing Strategy
│   ├── 01-test-plan.md        # Overall testing approach
│   ├── 02-unit-tests.md       # Unit test requirements
│   ├── 03-e2e-tests.md        # E2E test scenarios
│   └── 04-postman/            # Postman collections
│
├── 08-deployment/              # Deployment & Infrastructure
│   ├── 01-environments.md     # Dev, staging, production
│   ├── 02-docker.md           # Container setup
│   ├── 03-ci-cd.md            # Pipeline configuration
│   └── 04-monitoring.md       # Observability setup
│
├── 09-security/                # Security Practices
│   ├── 01-rbac-matrix.md      # Role-based access control
│   ├── 02-auth-strategy.md    # Authentication strategy
│   └── 03-compliance.md       # GDPR, SOC2, etc.
│
├── 10-logs/                    # ⚠️ CRITICAL: Active Task Tracking
│   ├── tasks-active.md        # Current tasks (agents read from here)
│   ├── tasks-completed.md     # Completed tasks archive
│   ├── research-findings.md   # Research results → new tasks
│   ├── test-failures.md       # Failed tests → new tasks
│   └── bugs-discovered.md     # Bugs found → new tasks
│
├── 11-audit/                   # ⚠️ CRITICAL: Minute-by-Minute Activity Log
│   ├── [ROLE]-[DATE].md       # One file per role per day
│   │                          # Example: developer-2026-01-27.md
│   │                          # Logs: timestamp, action, files, result
│
├── 98-backlog/                 # Future Work
│   ├── features.md            # Future feature ideas
│   └── technical-debt.md      # Known technical debt
│
├── 99-meta/                    # Project Meta
│   ├── CHANGELOG.md           # Structured change log
│   ├── AUDIT-LOG.md           # Narrative history
│   ├── GLOSSARY.md            # Term definitions
│   └── STATUS.md              # Project completion status
│
└── _archive/                   # Historical Documentation
    └── [timestamped-files]    # Old docs with YYYY-MM-DD prefix
```

### Bible File Naming Convention

**All Bible files MUST follow kebab-case naming:**

- ✅ `user-auth-flows.md`, `payment-processing.md`, `api-contract.md`
- ❌ `userAuthFlows.md`, `PaymentProcessing.md`, `API_CONTRACT.md`

**Numbering prefix for ordered sections:**

- Use `01-`, `02-`, `03-` for files that need sequential reading
- Example: `01-purpose.md`, `02-architecture.md`, `03-tech-stack.md`
- Omit numbers for standalone feature files: `notification-system.md`

### 00-INDEX.md Template

**Every project's `docs/bible/00-INDEX.md` MUST use this structure:**

```markdown
# PROJECT NAME - Documentation Index

> **Last updated:** YYYY-MM-DD HH:MM:SS UTC
> **Status:** [MVP|Alpha|Beta|Production]

## Quick Navigation

- [Overview](#overview) - Start here for project understanding
- [Apps](#apps) - Application specifications
- [User Flows](#user-flows) - Journey maps
- [Data](#data) - Database schema
- [API](#api) - Endpoint specifications
- [Features](#features) - Detailed implementations
- [Testing](#testing) - Test strategy
- [Deployment](#deployment) - Infrastructure
- [Active Tasks](#active-tasks) - Current work

---

## Overview
- [Purpose & Vision](01-overview/01-purpose.md)
- [System Architecture](01-overview/02-architecture.md)
- [Technology Stack](01-overview/03-tech-stack.md)

## Apps
- [Platform Web](02-apps/01-platform.md)
- [Admin Panel](02-apps/02-admin.md)

## User Flows
- [Authentication](03-user-flows/01-auth-flows.md)
- [Onboarding](03-user-flows/02-onboarding.md)

## Data
- [Database Schema](04-data/01-schema.md)
- [Relationships](04-data/02-relationships.md)

## API
- [API Contract](05-api/01-api-contract.md) ⚠️ READ BEFORE CODING
- [All Endpoints](05-api/02-endpoints.md)

## Features
- [Authentication System](06-features/01-auth-system.md)
- [Payment System](06-features/02-payment-system.md)

## Testing
- [Test Plan](07-testing/01-test-plan.md)

## Deployment
- [Environments](08-deployment/01-environments.md)

## Security
- [RBAC Matrix](09-security/01-rbac-matrix.md)

## Active Tasks
- [Tasks (Active)](10-logs/tasks-active.md) ⚠️ CHECK BEFORE TAKING TASK
- [Tasks (Completed)](10-logs/tasks-completed.md)

---

*This index is auto-maintained. Update when adding new Bible files.*
```

### Bible Update Protocol

**When creating or updating any Bible file:**

1. **File Creation:**
   - Use kebab-case naming
   - Add YAML frontmatter if tracking metadata
   - Add timestamp footer: `*Last updated: YYYY-MM-DD HH:MM:SS UTC*`
   - Update `00-INDEX.md` with link to new file

2. **File Updates:**
   - Update timestamp footer to current UTC time
   - If file structure changes, update `00-INDEX.md`
   - If adding cross-references, use relative links: `[Schema](../04-data/01-schema.md)`

3. **Cross-References:**
   - Link related docs: "See [API Contract](../05-api/01-api-contract.md) for response structures"
   - Use relative paths from current file location
   - Verify links are not broken when moving files

4. **Archiving:**
   - When deprecating a file, move to `_archive/` with date prefix: `_archive/2026-01-28-old-file.md`
   - Add note in `00-INDEX.md` if file was previously listed
   - Never delete files, always archive

---

## 7. TASK MANAGEMENT SYSTEM (Multi-Agent Coordination)

### Task Structure (YAML Frontmatter + Markdown)

**Every task in `docs/bible/10-logs/tasks-active.md` MUST use this format:**

```yaml
---
id: TASK-YYYY-MM-DD-NNN
created: YYYY-MM-DD HH:MM:SS UTC
category: [FEATURE|FIX|REFACTOR|DOCS|TEST|SCHEMA|CONFIG|SECURITY|PERFORMANCE]
priority: [P0|P1|P2|P3]
status: [AVAILABLE|IN_PROGRESS|BLOCKED|REVIEW|DONE]
assigned_to: [ROLE_NAME or null]
assigned_at: YYYY-MM-DD HH:MM:SS UTC (if assigned)
estimated_hours: X
dependencies: [TASK-ID-1, TASK-ID-2] (if any)
source: [MANUAL|TEST_FAILURE|BUG_REPORT|RESEARCH|CODE_REVIEW]
---

## Task Title (max 60 chars)

**Description:** Clear description of what needs to be done (1-3 sentences)

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Context:** Why this task exists, any relevant background

**Files Affected:**
- path/to/file1.ts
- path/to/file2.md
```

### Priority Levels (Pre-Defined)

| Priority | Definition | Examples | Response Time |
|----------|------------|----------|---------------|
| **P0** | System broken, revenue blocked, data loss | Payment system down, auth broken, data corruption | Immediate (drop everything) |
| **P1** | Core feature broken, major user impact | API endpoint 500 error, checkout flow broken | Within 4 hours |
| **P2** | Important but not blocking | Performance optimization, minor bugs, polish | Within 2 days |
| **P3** | Nice-to-have, future improvement | Refactoring, documentation updates, minor UX tweaks | When capacity allows |

### Status Lifecycle

```
AVAILABLE       → Task ready to be picked up (no one assigned)
    ↓
IN_PROGRESS     → Agent actively working on this task
    ↓
BLOCKED         → Waiting for dependency, external input, or decision
    ↓
REVIEW          → Implementation complete, needs code review
    ↓
DONE            → Completed and merged (move to tasks-completed.md)
```

### Category Definitions

| Category | Description | Created By | Logged In |
|----------|-------------|------------|-----------|
| **FEATURE** | New functionality | PM, Developer | 10-logs/tasks-active.md |
| **FIX** | Bug correction | QA, Debugger, Developer | 10-logs/bugs-discovered.md → tasks-active.md |
| **REFACTOR** | Code improvement (no behavior change) | Developer | 10-logs/tasks-active.md |
| **DOCS** | Documentation work | All roles | 10-logs/tasks-active.md |
| **TEST** | Test creation/update | QA Lead | 10-logs/test-failures.md → tasks-active.md |
| **SCHEMA** | Database changes | Data Architect | 10-logs/tasks-active.md |
| **CONFIG** | Configuration changes | DevOps | 10-logs/tasks-active.md |
| **SECURITY** | Security improvements | Security review | 10-logs/tasks-active.md |
| **PERFORMANCE** | Performance optimization | Developer | 10-logs/tasks-active.md |

---

## 8. ROLE RECORDING PROTOCOLS (Who Logs What Where)

### Daily Audit Logs (Minute-by-Minute Tracking)

**Every role MUST maintain a daily audit log in `docs/bible/11-audit/[ROLE]-[DATE].md`:**

```markdown
# [ROLE NAME] Activity Log - YYYY-MM-DD

---
## HH:MM:SS UTC - [ACTION TYPE]

**Action:** Brief description of what was done
**Task ID:** TASK-YYYY-MM-DD-NNN (if applicable)
**Files Modified:**
- path/to/file1.ts (added 45 lines)
- path/to/file2.md (updated)

**Result:** SUCCESS / BLOCKED / NEEDS_REVIEW
**Notes:** Any important context or blockers encountered
---
```

**Example: Developer Audit Log**

```markdown
# Developer Activity Log - 2026-01-27

---
## 14:23:15 UTC - TASK_STARTED

**Action:** Started implementing payment webhook handler
**Task ID:** TASK-2026-01-27-003
**Files Modified:** None yet (reading existing code)
**Result:** IN_PROGRESS
**Notes:** Reviewing Stripe webhook documentation
---

## 14:45:30 UTC - IMPLEMENTATION

**Action:** Implemented webhook endpoint with signature verification
**Task ID:** TASK-2026-01-27-003
**Files Modified:**
- packages/api/src/controllers/webhooks/stripe.ts (created, 120 lines)
- packages/api/src/routes/webhooks.ts (updated, +15 lines)

**Result:** SUCCESS
**Notes:** Added Zod validation for all Stripe event types
---

## 15:10:00 UTC - TEST_WRITTEN

**Action:** Created unit tests for webhook handler
**Task ID:** TASK-2026-01-27-003
**Files Modified:**
- packages/api/__tests__/webhooks/stripe.test.ts (created, 85 lines)

**Result:** SUCCESS
**Notes:** All 12 test cases passing
---

## 15:30:00 UTC - TASK_COMPLETED

**Action:** Marked task as REVIEW, updated task status
**Task ID:** TASK-2026-01-27-003
**Files Modified:**
- docs/bible/10-logs/tasks-active.md (updated task status to REVIEW)

**Result:** NEEDS_REVIEW
**Notes:** Ready for QA Lead to review tests
---
```

### Recording Protocols by Role

#### 🧠 Product Manager
**Records In:**
- `01-overview/` - Purpose, architecture decisions
- `03-user-flows/` - User journey specs
- `05-api/01-api-contract.md` - API response structures
- `10-logs/tasks-active.md` - Creates FEATURE tasks
- `11-audit/pm-[DATE].md` - Daily activity log

**Logs:**
- Spec creation timestamps
- Decision rationales
- Stakeholder feedback received
- API contract definitions

---

#### 💻 Developer (Senior Full Stack)
**Records In:**
- `04-data/` - Schema implementations
- `06-features/` - Implementation details
- `10-logs/tasks-active.md` - Picks AVAILABLE tasks, updates status
- `10-logs/bugs-discovered.md` - Bugs found during implementation
- `11-audit/developer-[DATE].md` - Minute-by-minute code activity

**Logs:**
- Task started/completed timestamps
- Files created/modified with line counts
- Implementation decisions made
- Blockers encountered
- Commits pushed

---

#### 📊 Data Architect
**Records In:**
- `04-data/01-schema.md` - Complete schema documentation
- `04-data/03-migrations.md` - Migration scripts and strategies
- `10-logs/tasks-active.md` - Creates SCHEMA tasks
- `11-audit/data-architect-[DATE].md` - Schema change activity

**Logs:**
- Schema design decisions
- Migration plans
- Index optimizations
- Data integrity checks

---

#### 🧪 QA Lead
**Records In:**
- `07-testing/` - Test plans and results
- `10-logs/test-failures.md` - Failed tests → creates FIX tasks
- `10-logs/tasks-active.md` - Creates TEST tasks
- `11-audit/qa-[DATE].md` - Testing activity log

**Logs:**
- Tests written (count, coverage %)
- Test failures discovered
- Tasks created from test failures
- Review results (approve/reject)

---

#### 🐛 Debugger
**Records In:**
- `10-logs/bugs-discovered.md` - Root cause analysis
- `10-logs/tasks-active.md` - Creates FIX tasks with priority
- `11-audit/debugger-[DATE].md` - Debug session logs

**Logs:**
- Error analysis timestamps
- Root cause findings
- Fix implementations
- Verification results

---

#### 🚀 DevOps
**Records In:**
- `08-deployment/` - Infrastructure setup
- `10-logs/tasks-active.md` - Creates CONFIG tasks
- `11-audit/devops-[DATE].md` - Infrastructure activity

**Logs:**
- Deployment timestamps
- Configuration changes
- Pipeline modifications
- Monitoring setup

---

## 9. AGENT COORDINATION RULES (Multi-Agent Task Distribution)

### Task Assignment Protocol

**When an agent is told "take next task":**

1. **Read `docs/bible/10-logs/tasks-active.md`**
2. **Filter tasks by:**
   - `status: AVAILABLE` (not IN_PROGRESS or BLOCKED)
   - `assigned_to: null` (not already taken)
   - `dependencies: []` or all dependency tasks have `status: DONE`
3. **Select highest priority task:**
   - P0 > P1 > P2 > P3
   - If same priority, oldest `created` timestamp first
4. **Claim the task:**
   - Update `status: AVAILABLE → IN_PROGRESS`
   - Set `assigned_to: [YOUR_ROLE]`
   - Set `assigned_at: [CURRENT_TIMESTAMP]`
5. **Log in audit file:**
   - `11-audit/[ROLE]-[DATE].md` with TASK_STARTED entry
6. **Work on task**
7. **Update status when done:**
   - `status: IN_PROGRESS → REVIEW` (if needs review)
   - `status: IN_PROGRESS → DONE` (if complete and reviewed)
8. **Log completion in audit file**

### Conflict Prevention Rules

**Rule 1: Atomic Task Updates**
- When claiming a task, update the entire task block in one operation
- Never update just `status` or just `assigned_to` separately

**Rule 2: Status Checks**
- Before claiming, verify `status: AVAILABLE` AND `assigned_to: null`
- If either condition fails, skip to next task

**Rule 3: Role Restrictions**
- Only these roles can pick tasks:
  - Developer (FEATURE, FIX, REFACTOR, PERFORMANCE)
  - Data Architect (SCHEMA)
  - QA Lead (TEST)
  - DevOps (CONFIG)
  - Debugger (FIX)

**Rule 4: Parallel Work**
- Multiple agents CAN work simultaneously if tasks are independent
- Check `dependencies` field before claiming
- If task has dependencies, verify all dependency tasks are `status: DONE`

**Rule 5: Blocking**
- If blocked, immediately update `status: IN_PROGRESS → BLOCKED`
- Add note in task with blocker details
- Create new task if blocker requires separate work

### Example Task Lifecycle (Multi-Agent)

**Initial State (Created by PM):**
```yaml
---
id: TASK-2026-01-27-005
created: 2026-01-27 10:00:00 UTC
category: FEATURE
priority: P1
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 8
dependencies: [TASK-2026-01-27-003]
source: MANUAL
---

## Implement User Profile Settings Page

**Description:** Create settings page where users can update profile, change password, and manage notifications.

**Acceptance Criteria:**
- [ ] Profile form with validation
- [ ] Password change with confirmation
- [ ] Notification preferences toggle
- [ ] All changes saved to database
- [ ] Success/error toast notifications

**Files Affected:**
- apps/platform/src/app/(dashboard)/settings/page.tsx (new)
- packages/api/src/controllers/user/update-profile.ts (new)
```

**Developer 1 Claims Task (10:30 AM):**
```yaml
---
status: IN_PROGRESS
assigned_to: Developer-1
assigned_at: 2026-01-27 10:30:00 UTC
---
```

**Developer 1 Logs in Audit:**
```markdown
## 10:30:00 UTC - TASK_STARTED
**Action:** Starting user profile settings page
**Task ID:** TASK-2026-01-27-005
**Result:** IN_PROGRESS
```

**Developer 1 Completes (2:30 PM):**
```yaml
---
status: REVIEW
assigned_to: Developer-1
---
```

**Developer 1 Logs Completion:**
```markdown
## 14:30:00 UTC - TASK_COMPLETED
**Action:** Completed profile settings implementation
**Task ID:** TASK-2026-01-27-005
**Files Modified:**
- apps/platform/src/app/(dashboard)/settings/page.tsx (created, 240 lines)
- packages/api/src/controllers/user/update-profile.ts (created, 95 lines)
- packages/api/src/routes/user.ts (updated, +12 lines)
**Result:** NEEDS_REVIEW
**Notes:** All acceptance criteria met, ready for QA review
```

**QA Lead Reviews (3:00 PM):**
```yaml
---
status: DONE
---
```

**Task Moved to `docs/bible/10-logs/tasks-completed.md`**

---

## 10. TASK CREATION TRIGGERS (Automated Task Generation)

### From Test Failures

**When QA Lead runs tests and finds failures:**

1. **Create entry in `10-logs/test-failures.md`:**

```yaml
---
id: TEST-FAIL-2026-01-27-001
discovered: 2026-01-27 15:45:00 UTC
test_file: packages/api/__tests__/auth/login.test.ts
test_name: "should return 401 for invalid credentials"
error: "Expected 401, received 500"
severity: HIGH
---

## Login Test Failure - Invalid Credentials Returns 500

**Error Message:**
```
AssertionError: expected 500 to equal 401
  at packages/api/__tests__/auth/login.test.ts:42:35
```

**Context:** Login endpoint is returning 500 server error instead of 401 unauthorized when credentials are invalid.

**Suggested Fix:** Add proper error handling in auth controller to catch invalid credentials and return 401.
```

2. **Automatically create task in `10-logs/tasks-active.md`:**

```yaml
---
id: TASK-2026-01-27-010
created: 2026-01-27 15:45:00 UTC
category: FIX
priority: P1
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 2
dependencies: []
source: TEST_FAILURE
linked_test_failure: TEST-FAIL-2026-01-27-001
---

## Fix Login Endpoint - Return 401 for Invalid Credentials

**Description:** Login endpoint returning 500 instead of 401 when credentials are invalid. Add proper error handling.

**Acceptance Criteria:**
- [ ] Invalid credentials return 401 status code
- [ ] Error message is clear and user-friendly
- [ ] Test passes after fix
- [ ] No other tests broken by change

**Context:** Discovered during test suite run. Test file: packages/api/__tests__/auth/login.test.ts

**Files Affected:**
- packages/api/src/controllers/auth/login.ts
```

### From Bug Reports

**When bugs are discovered during development or production:**

1. **Create entry in `10-logs/bugs-discovered.md`**
2. **Automatically create FIX task in `10-logs/tasks-active.md`**
3. **Priority assigned based on severity:**
   - CRITICAL (production down) → P0
   - HIGH (core feature broken) → P1
   - MEDIUM (minor feature broken) → P2
   - LOW (cosmetic issue) → P3

### From Research Findings

**When research uncovers technical debt or improvements:**

1. **Log findings in `10-logs/research-findings.md`**
2. **Create REFACTOR or PERFORMANCE task in `10-logs/tasks-active.md`**
3. **Priority based on impact:**
   - Performance bottleneck affecting all users → P1
   - Code quality improvement → P2
   - Documentation enhancement → P3

---

## 11. QUICK START CHECKLIST (New SaaS Project)

**Day 1: Project Initialization**

```bash
# 1. Create project structure
mkdir -p my-saas && cd my-saas
pnpm create turbo@latest

# 2. Copy this manifesto
cp nyoworks-standards.md docs/bible/

# 3. Create Bible structure
mkdir -p docs/bible/{01-overview,02-apps,03-user-flows,04-data,05-api,06-features,07-testing,08-deployment,09-security,10-logs,11-audit,98-backlog,99-meta,_archive}

# 4. Create required files
touch docs/bible/00-INDEX.md
touch docs/bible/10-logs/{tasks-active.md,tasks-completed.md,research-findings.md,test-failures.md,bugs-discovered.md}
touch docs/bible/99-meta/{CHANGELOG.md,AUDIT-LOG.md,GLOSSARY.md,STATUS.md}

# 5. Initialize first task
echo "---
id: TASK-2026-01-27-001
created: $(date -u +'%Y-%m-%d %H:%M:%S UTC')
category: DOCS
priority: P0
status: AVAILABLE
assigned_to: null
estimated_hours: 4
dependencies: []
source: MANUAL
---

## Complete PHASE A Documentation

**Description:** Create all PHASE A documents (scope, roles, schema, flows, API contract)

**Acceptance Criteria:**
- [ ] 01-overview/01-purpose.md completed
- [ ] 03-user-flows/ all flows documented
- [ ] 04-data/01-schema.md completed
- [ ] 05-api/01-api-contract.md completed

**Context:** Required before any coding can begin (Backend-First protocol)
" > docs/bible/10-logs/tasks-active.md
```

---

*Last updated: 2026-01-28 12:00:00 UTC*