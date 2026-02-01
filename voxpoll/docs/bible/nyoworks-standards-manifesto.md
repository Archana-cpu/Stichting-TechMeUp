# NYOWORKS UNIFIED SYSTEM

> **Version:** 4.0 (CLI-Integrated Edition)
> **Date:** January 2026
> **Company:** NYOWORKS
> **Type:** Reusable Framework + AI Workflow + Multi-Agent Protocol + CLI Automation
> **Purpose:** Complete development system for SaaS products
> **Target:** AI-driven development with Claude Code + VSCode

---

## TABLE OF CONTENTS

```
PART A: WORKFLOW AND TEAM
    1. Quick Reference
    2. Agent Identity and CLI Setup
    3. AI Team Roles
    4. Development Phases (12-Step Iron Workflow)
    5. Task Management (CLI-Driven)
    6. Audit and Sync Protocol (CLI-Driven)
    7. Cross-Role Communication
    8. Conflict Resolution

PART B: PROJECT ORGANIZATION
    9. The Immutable Stack
    10. The Non-Negotiables
    11. Project Structure
    12. Bible Structure
    13. Code Conventions
    14. Version Control and Commits

PART C: ARCHITECTURE
    15. Core Principles
    16. Clean Code Principles
    17. API-First Design
    18. State Management
    19. Error Handling

PART D: SYSTEMS
    20. Authentication System
    21. Multi-Tenancy
    22. Payment System
    23. Notification System
    24. Feature Flags
    25. Admin Panel

PART E: SERVICES
    26. Persistence (Drizzle)
    27. Caching (Redis)
    28. Observability (OpenTelemetry)
    29. Analytics

PART F: UI AND PRESENTATION
    30. UI Architecture (shadcn/ui)
    31. Responsive Design
    32. Accessibility
    33. Internationalization

PART G: QUALITY AND PERFORMANCE
    34. Testing Strategy
    35. Performance Budgets
    36. Security

PART H: DEPLOYMENT
    37. Environments
    38. CI/CD
    39. Docker

PART I: REFERENCE
    40. NyoCLI Reference
    41. File Templates
    42. Quick Start Checklist
```

---

# PART A: WORKFLOW AND TEAM

---

## 1. QUICK REFERENCE

### Start New Project (CLI)

```
Starting [PROJECT_NAME] using NYOWORKS Unified System v4.0.

Steps:
1. Declare agent identity (e.g., PM)
2. Run: python _tools/nyoworksCLI.py init "Project Name" --code XXX --role PM
3. Create monorepo structure with Turborepo
4. Define project-specific schemas
5. Use CLI for all task and log operations
```

### Resume Project (CLI)

```
Resuming [PROJECT_NAME] using NYOWORKS Unified System v4.0.

Steps:
1. Declare agent identity (e.g., Developer)
2. Run: python _tools/nyoworksCLI.py status
3. Review available tasks
4. Run: python _tools/nyoworksCLI.py task claim TASK-YYYYMMDD-NNN --role Developer
5. Begin work
```

### Role Activation (CLI)

```
Activating [ROLE] for [PROJECT_NAME].

Read in order:
1. This document (full)
2. docs/bible/00-INDEX.md
3. Run: python _tools/nyoworksCLI.py status

Then claim your first task via CLI.
```

---

## 2. AGENT IDENTITY AND CLI SETUP

### Role Names

```
Available Roles:
    PM              - Product Manager
    Developer       - Senior Full Stack Developer
    DataArchitect   - Database Specialist
    QA              - QA Lead
    Debugger        - Systems Debugger
    DevOps          - DevOps Engineer

Multiple agents can have same role.
```

### CLI Setup

```
Requirements:
    - Python 3.8+
    - nyoworksCLI.py in _tools/ folder

Verify installation:
    python _tools/nyoworksCLI.py --help

Available commands:
    init      - Initialize new project
    status    - Show project dashboard
    log       - Add audit log entry
    task      - Manage tasks (list, claim, done, create, block, review)
    bug       - Manage bugs (list, report, fix)
    test-fail - Manage test failures (log, list)
```

### First Message Protocol (CLI)

```
Every agent's first action:

1. Declare: "I am [ROLE] for [PROJECT_NAME]"
2. Read this document fully
3. Read docs/bible/00-INDEX.md
4. Run: python _tools/nyoworksCLI.py status
5. Run: python _tools/nyoworksCLI.py task claim TASK-YYYYMMDD-NNN --role [YOUR-ROLE]
6. Begin work
```

### Session Protocol (CLI)

```
Starting a Session:
    1. Declare identity
    2. Run: python _tools/nyoworksCLI.py status
    3. Review available tasks
    4. Claim task via CLI
    5. Log session start: python _tools/nyoworksCLI.py log "Session start" --role [ROLE] --type SESSION_START

Ending a Session:
    1. Save all work
    2. Update task if not done: python _tools/nyoworksCLI.py task block TASK-XXX --role [ROLE] --reason "WIP: description"
    3. Log session end: python _tools/nyoworksCLI.py log "Session end: [summary]" --role [ROLE] --type SESSION_END

Mid-Session:
    Check status periodically: python _tools/nyoworksCLI.py status
```

### File Ownership Rules

```
Sacred Rule: CLI Handles All Log Appends

NEVER manually edit:
    - 10-logs/tasks-active.md (use: nyoworksCLI.py task)
    - 10-logs/tasks-completed.md (use: nyoworksCLI.py task done)
    - 10-logs/bugs-discovered.md (use: nyoworksCLI.py bug)
    - 10-logs/test-failures.md (use: nyoworksCLI.py test-fail)
    - 11-audit/* (use: nyoworksCLI.py log)

ONLY create new files for:
    - New documentation (specs, flows, schemas)
    - New code (components, services, APIs)
    - New tests
```

### Central Files (CLI Managed)

| File | Purpose | CLI Command |
|------|---------|-------------|
| docs/bible/10-logs/tasks-active.md | Active task backlog | nyoworksCLI.py task |
| docs/bible/10-logs/tasks-completed.md | Done tasks archive | nyoworksCLI.py task done |
| docs/bible/10-logs/bugs-discovered.md | Bug tracker | nyoworksCLI.py bug |
| docs/bible/10-logs/test-failures.md | Test failure log | nyoworksCLI.py test-fail |
| docs/bible/11-audit/[role]-[date].md | Role activity | nyoworksCLI.py log |

### Content File Ownership

| Content Type | Owner Role | Path |
|--------------|------------|------|
| Purpose, architecture docs | PM | docs/bible/01-overview/ |
| User flows | PM | docs/bible/03-user-flows/ |
| API Contract | PM | docs/bible/05-api/01-api-contract.md |
| Database schema | DataArchitect | docs/bible/04-data/ |
| Feature specs | PM | docs/bible/06-features/ |
| API code | Developer | packages/api/src/ |
| UI code | Developer | apps/*/src/ |
| Tests | Developer, QA | packages/*/tests/, apps/*/tests/ |
| Deployment config | DevOps | docs/bible/08-deployment/ |
| Security docs | DevOps | docs/bible/09-security/ |

---

## 3. AI TEAM ROLES

### Role Overview

| Role | Output | Primary Phase |
|------|--------|---------------|
| Product Manager | Documentation, specs, API contracts | PHASE A |
| Developer | TypeScript code, tests | PHASE B, C |
| Data Architect | Drizzle schemas, migrations | PHASE B |
| QA Lead | Test results, bug reports | All phases |
| Debugger | Root cause analysis, fixes | As needed |
| DevOps | CI/CD, infrastructure | PHASE B, C |

### Product Manager (PM)

```
You are Product Manager for NYOWORKS.

RESPONSIBILITY:
- Project scope and vision
- User flows and journeys
- API contract definition
- Feature specifications
- RBAC matrix design

WORKFLOW (CLI):
1. Declare identity (PM)
2. Run: python _tools/nyoworksCLI.py status
3. Claim task: python _tools/nyoworksCLI.py task claim TASK-XXX --role PM
4. Document BEFORE anything gets coded
5. Complete task: python _tools/nyoworksCLI.py task done TASK-XXX --role PM
6. Log progress: python _tools/nyoworksCLI.py log "message" --role PM --type TASK_PROGRESS

OUTPUT FILES:
- docs/bible/01-overview/*.md
- docs/bible/03-user-flows/*.md
- docs/bible/05-api/01-api-contract.md
- docs/bible/06-features/*.md

CAN CREATE TASKS FOR:
- PM (own subtasks)
- Developer (implementation requests)
- DataArchitect (schema requests)
- QA (test requests)
- DevOps (infrastructure requests)

RULES:
- Never write code
- Define API contract BEFORE backend coding
- All specs in Markdown
- Create Super Admin role in every project
- Flag ambiguities for Developer
```

### Senior Full Stack Developer

```
You are Senior Full Stack Developer for NYOWORKS.

RESPONSIBILITY:
- TypeScript implementation
- Next.js App Router pages
- API route handlers
- Service layer logic
- React components
- Test implementation

STACK:
Next.js 16+, TypeScript 5.4+, Drizzle ORM, Auth.js v5,
shadcn/ui, Tailwind CSS v4, Zod, Vitest, Playwright

WORKFLOW (CLI):
1. Declare identity (Developer)
2. Run: python _tools/nyoworksCLI.py status
3. Claim task: python _tools/nyoworksCLI.py task claim TASK-XXX --role Developer
4. Verify API contract exists before coding
5. Implement according to stack patterns
6. Write tests for new code
7. Complete task: python _tools/nyoworksCLI.py task done TASK-XXX --role Developer
8. Log progress: python _tools/nyoworksCLI.py log "message" --role Developer --type IMPLEMENTATION

OUTPUT FILES:
- apps/*/src/**/*.tsx
- packages/api/src/**/*.ts
- packages/shared/src/**/*.ts
- **/*.test.ts

CAN CREATE TASKS FOR:
- Developer (technical subtasks)
- QA (test requests)

RULES:
- Backend First: API tests must pass before UI
- Zero Hardcoding: Use t() for text, CSS vars for colors
- Follow API contract exactly
- All async via async/await
- No any types
- OpenTelemetry tracing on critical paths
```

### Data Architect

```
You are Data Architect for NYOWORKS.

RESPONSIBILITY:
- Drizzle schema design
- Migration strategy
- Index optimization
- Multi-tenancy (RLS)
- Data integrity

WORKFLOW (CLI):
1. Declare identity (DataArchitect)
2. Run: python _tools/nyoworksCLI.py status
3. Claim task: python _tools/nyoworksCLI.py task claim TASK-XXX --role DataArchitect
4. Design schema per PM specs
5. Write safe migrations
6. Complete task: python _tools/nyoworksCLI.py task done TASK-XXX --role DataArchitect
7. Log progress: python _tools/nyoworksCLI.py log "message" --role DataArchitect --type SCHEMA_CHANGE

OUTPUT FILES:
- packages/db/src/schema/*.ts
- packages/db/drizzle/*.sql
- docs/bible/04-data/*.md

CAN CREATE TASKS FOR:
- DataArchitect (schema subtasks)

RULES:
- Never destructive migrations without backup
- Always add indexes for foreign keys
- RLS for multi-tenant tables
- Document all schema decisions
```

### QA Lead

```
You are QA Lead for NYOWORKS.

RESPONSIBILITY:
- Test case creation
- Bug discovery and documentation
- API contract verification
- E2E test scenarios
- Performance monitoring

WORKFLOW (CLI):
1. Declare identity (QA)
2. Run: python _tools/nyoworksCLI.py status
3. Claim task: python _tools/nyoworksCLI.py task claim TASK-XXX --role QA
4. Create test cases from API contract
5. Execute tests systematically
6. Report bugs: python _tools/nyoworksCLI.py bug report "title" --role QA --severity HIGH
7. Log test failures: python _tools/nyoworksCLI.py test-fail log --file "path" --error "message" --role QA
8. Complete task: python _tools/nyoworksCLI.py task done TASK-XXX --role QA
9. Log progress: python _tools/nyoworksCLI.py log "message" --role QA --type TEST_WRITTEN

OUTPUT FILES:
- docs/bible/07-testing/*.md
- packages/*/tests/**/*.test.ts
- apps/*/tests/**/*.spec.ts

CAN CREATE TASKS FOR:
- QA (test coverage tasks)
- Developer (bug fix tasks)
- PM (design clarification requests)

RULES:
- Every bug needs: Steps, Expected, Actual, Severity
- Test API contract compliance
- Test all user flows
- Verify RBAC on every endpoint
- Flag blocking bugs immediately
```

### Debugger

```
You are Systems Debugger for NYOWORKS.

RESPONSIBILITY:
- Error log analysis
- Root cause identification
- Code fix implementation
- Trace analysis (OpenTelemetry)

INPUT:
- Error logs
- Stack traces
- OpenTelemetry spans
- User reports

WORKFLOW (CLI):
1. Declare identity (Debugger)
2. Run: python _tools/nyoworksCLI.py status
3. Claim FIX task: python _tools/nyoworksCLI.py task claim TASK-XXX --role Debugger
4. Analyze error context
5. Implement fix
6. Verify fix resolves issue
7. Complete task: python _tools/nyoworksCLI.py task done TASK-XXX --role Debugger

OUTPUT:
- Root cause analysis
- Code fixes
- Prevention recommendations

SPECIALTY:
- Hydration errors
- Auth.js session issues
- Database deadlocks
- API timeout issues
```

### DevOps Engineer

```
You are DevOps Engineer for NYOWORKS.

RESPONSIBILITY:
- CI/CD pipeline setup
- Docker configuration
- Environment management
- OpenTelemetry/Axiom setup
- Security headers

WORKFLOW (CLI):
1. Declare identity (DevOps)
2. Run: python _tools/nyoworksCLI.py status
3. Claim task: python _tools/nyoworksCLI.py task claim TASK-XXX --role DevOps
4. Implement infrastructure changes
5. Complete task: python _tools/nyoworksCLI.py task done TASK-XXX --role DevOps
6. Log progress: python _tools/nyoworksCLI.py log "message" --role DevOps --type DEPLOYMENT

OUTPUT FILES:
- .github/workflows/*.yml
- Dockerfile, docker-compose.yml
- docs/bible/08-deployment/*.md

CAN CREATE TASKS FOR:
- DevOps (infra subtasks)

RULES:
- Zero downtime deployments
- All secrets in ENV, never in code
- Staging before production
- Automated health checks
```

---

## 4. DEVELOPMENT PHASES (12-STEP IRON WORKFLOW)

### PHASE A: ARCHITECTURE (The Bible)

```
Goal: Define everything before coding.
Owner: PM (Primary)

Step 1: Purpose Definition
    Output: docs/bible/01-overview/01-purpose.md
    Content: Mission, vision, USP, target audience

Step 2: Actors & Data
    Output: docs/bible/09-security/01-rbac-matrix.md
    Output: docs/bible/04-data/01-schema.md
    Content: User roles, permissions, entity definitions

Step 3: Flow & Logic
    Output: docs/bible/03-user-flows/*.md
    Content: User journeys, business logic

Step 4: API Contract (CRITICAL)
    Output: docs/bible/05-api/01-api-contract.md
    Content: Every endpoint's JSON response structure

Exit Criteria:
- All PHASE A documents complete
- API contract reviewed and approved
- Schema design approved
```

### PHASE B: BACKEND CONSTRUCTION (The Engine)

```
Goal: Build and test API before any UI.
Owner: Developer, DataArchitect

Step 5: Schema Implementation
    Run safe migrations via Drizzle
    Test: Schema matches design doc

Step 6: Core Services
    Auth.js v5 setup
    Multi-tenancy foundation
    Base service patterns

Step 7: API Implementation
    Build controllers matching API contract
    Zod validation on all inputs
    RBAC on all endpoints

Step 8: Tracing & Logs
    OpenTelemetry spans on critical paths
    Error logging with context
    Axiom integration

Step 9: Backend Testing
    Vitest unit tests
    API integration tests
    Coverage: 100% critical paths

Step 10: The Lock
    Optimize queries
    Security headers check
    BACKEND IS FROZEN

Exit Criteria:
- All API tests pass (100%)
- No P0/P1 bugs
- Performance within budget
- API matches contract exactly
```

### PHASE C: FRONTEND & DELIVERY (The Skin)

```
Goal: Build UI against frozen API.
Owner: Developer

Step 11: UI Construction
    shadcn/ui components
    Connect to frozen API
    Optimistic UI updates
    Server Components by default

Step 12: Final Polish
    Playwright E2E tests
    Mobile responsiveness
    Dark mode verification
    Accessibility check
    i18n verification

Exit Criteria:
- All E2E tests pass
- Lighthouse score > 90
- WCAG 2.1 AA compliant
- All user flows work
```

---

## 5. TASK MANAGEMENT (CLI-DRIVEN)

### Task States

```
AVAILABLE → IN_PROGRESS → REVIEW → DONE
                ↓
             BLOCKED → AVAILABLE (reassignable)

AVAILABLE:    Ready, anyone can claim
IN_PROGRESS:  Agent actively working
BLOCKED:      Waiting for dependency
REVIEW:       Needs code review/verification
DONE:         Complete, moved to completed file
```

### Task ID Format

```
Format: TASK-YYYYMMDD-NNN

YYYYMMDD: Date created (no dashes)
NNN: Sequential number that day

Examples: TASK-20260127-001, TASK-20260127-042
```

### Priority Definitions

| Priority | Meaning | Response |
|----------|---------|----------|
| P0 | System broken, revenue blocked | Immediate |
| P1 | Core feature broken | Within 4 hours |
| P2 | Important but not blocking | Within 2 days |
| P3 | Nice to have | When capacity allows |

### Category Definitions

| Category | Description | Assignable To |
|----------|-------------|---------------|
| FEATURE | New functionality | Developer, PM |
| FIX | Bug correction | Developer, Debugger |
| REFACTOR | Code improvement | Developer |
| DOCS | Documentation | All roles |
| TEST | Test creation | QA, Developer |
| SCHEMA | Database changes | DataArchitect |
| CONFIG | Configuration | DevOps |
| SECURITY | Security improvements | DevOps |
| PERFORMANCE | Optimization | Developer, DataArchitect |

### CLI Task Commands

```bash
# List all tasks
python _tools/nyoworksCLI.py task list

# List tasks by role permissions
python _tools/nyoworksCLI.py task list --role Developer

# List tasks by status
python _tools/nyoworksCLI.py task list --status AVAILABLE

# List tasks by category
python _tools/nyoworksCLI.py task list --category FEATURE

# Claim a task
python _tools/nyoworksCLI.py task claim TASK-20260127-001 --role Developer

# Mark task done (auto-moves to completed)
python _tools/nyoworksCLI.py task done TASK-20260127-001 --role Developer

# Block a task
python _tools/nyoworksCLI.py task block TASK-20260127-001 --role Developer --reason "Waiting for API contract"

# Review a task (approve)
python _tools/nyoworksCLI.py task review TASK-20260127-001 --role QA --approve

# Review a task (reject)
python _tools/nyoworksCLI.py task review TASK-20260127-001 --role QA

# Create new task
python _tools/nyoworksCLI.py task create "Implement Login API" \
    --role PM \
    --category FEATURE \
    --priority P1 \
    --description "Build login endpoint per API contract" \
    --criteria "Returns JWT;Validates credentials;Rate limited" \
    --output "packages/api/src/controllers/auth/login.ts"
```

### Task Claiming Protocol (CLI)

```
1. Run: python _tools/nyoworksCLI.py status
2. Identify highest priority AVAILABLE task for your role
3. Run: python _tools/nyoworksCLI.py task claim TASK-XXX --role [YOUR-ROLE]
4. CLI automatically:
   - Updates status to IN_PROGRESS
   - Sets assigned_to to your role
   - Logs to audit file
```

### Task Completion Protocol (CLI)

```
1. Verify all acceptance criteria met
2. Run: python _tools/nyoworksCLI.py task done TASK-XXX --role [YOUR-ROLE]
3. CLI automatically:
   - Updates status to DONE
   - Moves task to tasks-completed.md
   - Logs to audit file
```

### Task Source Tracking

```
Every task has a source field:

MANUAL:       Created directly by a role
TEST_FAILURE: Auto-created from failed test
BUG_REPORT:   Auto-created from bug report
RESEARCH:     Created from research findings
CODE_REVIEW:  Created from code review feedback

Linked references:
    linked_bug: BUG-YYYYMMDD-NNN
    linked_test_failure: TEST-FAIL-YYYYMMDD-NNN
```

---

## 6. AUDIT AND SYNC PROTOCOL (CLI-DRIVEN)

### CLI Log Command

```bash
python _tools/nyoworksCLI.py log "Implemented login endpoint" \
    --role Developer \
    --type IMPLEMENTATION \
    --task TASK-20260127-001 \
    --files packages/api/src/controllers/auth/login.ts \
    --result SUCCESS \
    --notes "All tests passing"
```

### Action Types

| Action | When | Auto-Created |
|--------|------|--------------|
| SESSION_START | Beginning work session | No |
| SESSION_END | Ending work session | No |
| TASK_STARTED | Claiming task | Yes (on claim) |
| TASK_PROGRESS | Significant progress | No |
| TASK_COMPLETED | Finishing task | Yes (on done) |
| TASK_BLOCKED | Cannot proceed | Yes (on block) |
| TASK_CREATED | Created new task | Yes (on create) |
| IMPLEMENTATION | Code written | No |
| TEST_WRITTEN | Tests added | No |
| BUG_FOUND | Discovered issue | Yes (on bug report) |
| BUG_FIXED | Resolved issue | Yes (on bug fix) |
| DECISION | Made design/tech choice | No |
| SCHEMA_CHANGE | Database modified | No |
| DEPLOYMENT | Deployed to environment | No |
| CODE_REVIEW | Reviewed code | No |
| FILE_CREATED | New file created | No |

### Audit File Structure

```
docs/bible/11-audit/[role]-[date].md

Example: developer-2026-01-27.md

Contains minute-by-minute activity log:
- Timestamp
- Action type
- Task ID
- Files modified
- Result
- Notes
```

### Status Command

```bash
python _tools/nyoworksCLI.py status
```

Output includes:
- Project code and status
- Task summary by status
- Bug summary
- Available tasks by role
- P0/P1 tasks pending

---

## 7. CROSS-ROLE COMMUNICATION

### Request Protocol (CLI)

```
When one role needs something from another:

1. Create task for target role:
   python _tools/nyoworksCLI.py task create "Request Title" \
       --role [YOUR-ROLE] \
       --category [CATEGORY] \
       --description "What you need"

2. Task appears in target role's available list
3. Continue other work while waiting
4. Check status periodically
```

### Handoff Protocol

```
PM creates spec doc
    ↓ Creates SCHEMA task for DataArchitect
    
DataArchitect implements schema
    ↓ Creates FEATURE task for Developer
    
Developer implements API
    ↓ Creates TEST task for QA
    
QA tests
    ↓ Creates FIX task if bugs found
    
Debugger fixes
    ↓ Task done, back to QA for verification
```

### Blocking Protocol (CLI)

```
When blocked by another role:

1. Run: python _tools/nyoworksCLI.py task block TASK-XXX \
       --role [YOUR-ROLE] \
       --reason "Waiting for API contract from PM"

2. CLI automatically:
   - Updates task status to BLOCKED
   - Logs to audit file

3. Move to another available task
4. Check status periodically for resolution
```

---

## 8. CONFLICT RESOLUTION

### Same Task Claimed by Multiple Agents

```
Rule: First timestamp wins.

If conflict detected:
1. Compare assigned_at timestamps
2. Agent with later timestamp releases task
3. Later agent claims different task
```

### Disagreement Between Roles

```
Authority hierarchy:
    Product decisions → PM final say
    Technical decisions → Developer final say
    Data decisions → DataArchitect final say
    Quality standards → QA raises, PM/Developer resolves
    Infrastructure → DevOps final say

Resolution process:
1. Dissenting agent logs concern
2. Authority role responds
3. Decision is final
4. All agents follow decision
```

---

# PART B: PROJECT ORGANIZATION

---

## 9. THE IMMUTABLE STACK

### Core Engine

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 16+ |
| UI Library | React | 19 |
| Language | TypeScript (Strict Mode) | 5.4+ |
| Monorepo | Turborepo | Latest |
| Database | PostgreSQL | 16 |
| ORM | Drizzle | Latest |
| Auth | Auth.js (NextAuth) | v5 |
| Caching | Redis (Upstash) | Latest |

### Frontend & UX

| Component | Technology |
|-----------|------------|
| UI Library | shadcn/ui (Radix) |
| Styling | Tailwind CSS v4 |
| Theme | Dark Mode + Dynamic Branding |
| Mobile | Expo (React Native) |

### Observability & Ops

| Component | Technology |
|-----------|------------|
| Tracing | OpenTelemetry + Axiom |
| Deployment | Docker / Vercel |
| Unit Testing | Vitest |
| E2E Testing | Playwright |
| Validation | Zod |

---

## 10. THE NON-NEGOTIABLES

```
1. Zero Hardcoding
   No strings, colors, or logic in code.
   Use t() for text, CSS variables for colors, ENV for configs.

2. Zero Redundancy
   DRY (Don't Repeat Yourself).
   Abstract business logic into @packages/shared.

3. Global First
   i18n support is MANDATORY from Day 1.
   No raw text in UI.

4. Admin Supremacy
   Every SaaS MUST have a Super Admin Panel.
   Control Tenants, Content, Settings without DB access.

5. Feature Flags
   Critical features wrapped in conditional logic.
   Enable/disable without redeployment.

6. Safe Migrations
   Never destructive DB changes without backup.
   Always have rollback strategy.

7. Security First
   RBAC on every endpoint.
   Input validation on every request.
   Zod schemas for all data.

8. Backend First
   API tests must pass 100% before UI work.
   UI connects to FROZEN API.

9. Server Components Default
   RSC by default in Next.js.
   Client components only when necessary.

10. Optimistic UI
    Update UI before server confirms.
    Rollback on error.
```

---

## 11. PROJECT STRUCTURE

```
project-root/
├── apps/
│   ├── platform/                 # Main SaaS app
│   │   ├── src/
│   │   │   ├── app/             # Next.js App Router
│   │   │   ├── components/      # UI components
│   │   │   └── lib/             # App utilities
│   │   └── tests/               # E2E tests
│   │
│   ├── admin/                    # Admin panel
│   │   └── src/
│   │
│   └── mobile/                   # Expo app (if applicable)
│       └── src/
│
├── packages/
│   ├── api/                      # API layer
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── routes/
│   │   └── tests/
│   │
│   ├── db/                       # Database layer
│   │   ├── src/
│   │   │   ├── schema/          # Drizzle schemas
│   │   │   └── migrations/
│   │   └── drizzle/
│   │
│   ├── shared/                   # Shared utilities
│   │   └── src/
│   │       ├── types/
│   │       ├── utils/
│   │       └── constants/
│   │
│   └── ui/                       # Shared UI components
│       └── src/
│
├── _tools/
│   └── nyoworksCLI.py                    # CLI automation
│
├── docs/
│   └── bible/
│       └── [See Section 12]
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── Dockerfile
├── turbo.json
├── package.json
└── tsconfig.json
```

---

## 12. BIBLE STRUCTURE

```
docs/bible/
├── 00-INDEX.md                   # Navigation hub
│
├── 01-overview/
│   ├── 01-purpose.md            # Mission, vision, USP
│   ├── 02-architecture.md       # System architecture
│   └── 03-tech-stack.md         # Technology decisions
│
├── 02-apps/
│   ├── 01-platform.md           # Main SaaS app
│   ├── 02-admin.md              # Admin panel
│   └── 03-mobile.md             # Mobile app
│
├── 03-user-flows/
│   ├── 01-auth-flows.md         # Login, signup, reset
│   ├── 02-onboarding.md         # User onboarding
│   ├── 03-core-workflow.md      # Primary workflow
│   └── 04-payment-flows.md      # Billing, invoices
│
├── 04-data/
│   ├── 01-schema.md             # Complete schema
│   ├── 02-relationships.md      # Entity relationships
│   ├── 03-migrations.md         # Migration strategy
│   └── 04-seed-data.md          # Initial data
│
├── 05-api/
│   ├── 01-api-contract.md       # JSON structures (CRITICAL)
│   ├── 02-endpoints.md          # All endpoints with RBAC
│   ├── 03-webhooks.md           # Webhook handlers
│   └── 04-integrations.md       # Third-party APIs
│
├── 06-features/
│   ├── 01-auth-system.md        # Authentication
│   ├── 02-payment-system.md     # Payments
│   ├── 03-notification.md       # Notifications
│   └── [feature-name].md        # Per feature
│
├── 07-testing/
│   ├── 01-test-plan.md          # Overall strategy
│   ├── 02-unit-tests.md         # Unit test requirements
│   └── 03-e2e-tests.md          # E2E scenarios
│
├── 08-deployment/
│   ├── 01-environments.md       # Dev, staging, prod
│   ├── 02-docker.md             # Container setup
│   ├── 03-ci-cd.md              # Pipeline config
│   └── 04-monitoring.md         # Observability
│
├── 09-security/
│   ├── 01-rbac-matrix.md        # Role permissions
│   ├── 02-auth-strategy.md      # Auth approach
│   └── 03-compliance.md         # GDPR, SOC2
│
├── 10-logs/                      # CLI MANAGED
│   ├── tasks-active.md          # Current tasks
│   ├── tasks-completed.md       # Done tasks
│   ├── bugs-discovered.md       # Bug reports
│   ├── test-failures.md         # Failed tests
│   └── research-findings.md     # Research notes
│
├── 11-audit/                     # CLI MANAGED
│   └── [role]-[date].md         # Daily activity logs
│
├── 98-backlog/
│   ├── features.md              # Future ideas
│   └── technical-debt.md        # Known debt
│
├── 99-meta/
│   ├── CHANGELOG.md             # Change log
│   ├── GLOSSARY.md              # Term definitions
│   └── STATUS.md                # Project status
│
└── _archive/                     # Old docs
    └── [YYYY-MM-DD]-[file].md
```

---

## 13. CODE CONVENTIONS

### Naming

| Element | Convention | Example |
|---------|------------|---------|
| Files (components) | PascalCase | LoginForm.tsx |
| Files (utils) | camelCase | formatDate.ts |
| Directories | kebab-case | user-profile/ |
| React components | PascalCase | UserCard |
| Functions | camelCase | getUserById |
| Constants | UPPER_SNAKE | MAX_RETRY_COUNT |
| Types/Interfaces | PascalCase | UserProfile |
| Zod schemas | camelCase + Schema | userSchema |
| API routes | kebab-case | /api/user-profile |
| Database tables | snake_case | user_profiles |
| Environment vars | UPPER_SNAKE | DATABASE_URL |

### Rules

```
- No abbreviations (userProfile not usrProf)
- No comments except section separators
- Section separator format: // === SECTION NAME ===
- Explicit types always (no implicit any)
- All player-visible text via t() function
- All async via async/await
- Zod validation on all inputs
- Error boundaries on all pages
```

### File Organization

```
Component files:
    1. Imports
    2. Types
    3. Constants
    4. Component function
    5. Export

Service files:
    1. Imports
    2. Types
    3. // === DEPENDENCIES ===
    4. // === PUBLIC METHODS ===
    5. // === PRIVATE METHODS ===
    6. Export
```

### Export Pattern

```typescript
// RFCE Standard - Export at end

function UserCard({ user }: UserCardProps) {
  return (
    <div>
      {user.name}
    </div>
  )
}

export { UserCard }
```

---

## 14. VERSION CONTROL AND COMMITS

### Conventional Commits

```
Format: <type>(<scope>): <description>

Types:
    feat     - New feature
    fix      - Bug fix
    docs     - Documentation
    style    - Formatting
    refactor - Code restructure
    perf     - Performance
    test     - Tests
    build    - Build system
    ci       - CI/CD
    chore    - Maintenance

Examples:
    feat(auth): add password reset flow
    fix(api): resolve 500 on invalid credentials
    docs(readme): update installation steps
    test(user): add unit tests for profile service
```

### Branch Naming

```
feature/TASK-YYYYMMDD-NNN-short-description
bugfix/BUG-YYYYMMDD-NNN-short-description
hotfix/critical-issue-description
release/v1.2.0
```

### Pre-Commit Checklist

```
Before committing:
[ ] Code compiles (tsc --noEmit)
[ ] All tests pass (pnpm test)
[ ] Linting passes (pnpm lint)
[ ] No console.log statements
[ ] Commit message follows convention
[ ] Changes match task scope
```

---

# PART C: ARCHITECTURE

---

## 15. CORE PRINCIPLES

### Server Components First

```
Default to RSC in Next.js App Router.
Use Client Components only when:
- useState/useEffect needed
- Browser APIs needed
- Event handlers needed
- Third-party client libraries

Mark client components with 'use client' directive.
```

### API Contract Driven

```
1. PM defines JSON response structure
2. Developer implements to match exactly
3. QA verifies contract compliance
4. Frontend consumes frozen API

API contract is the single source of truth.
```

### Separation of Concerns

```
packages/api     → HTTP handling, validation
packages/db      → Data access, queries
packages/shared  → Business logic, utils
apps/platform    → UI, routing
```

---

## 16. CLEAN CODE PRINCIPLES

```
DRY - Don't Repeat Yourself
    Every piece of logic has single location.
    Extract to packages/shared if used in 2+ places.

KISS - Keep It Simple
    Prefer simple over clever.
    Code readable without explanation.

YAGNI - You Aren't Gonna Need It
    Don't implement until needed.
    Remove unused code immediately.

SRP - Single Responsibility
    Each function does one thing.
    Each file has one purpose.
```

---

## 17. API-FIRST DESIGN

### Endpoint Structure

```
/api/v1/[resource]/[action]

Examples:
    GET    /api/v1/users
    GET    /api/v1/users/:id
    POST   /api/v1/users
    PATCH  /api/v1/users/:id
    DELETE /api/v1/users/:id
    POST   /api/v1/auth/login
    POST   /api/v1/auth/logout
```

### Response Format

```typescript
// Success
{
  success: true,
  data: T,
  meta?: {
    page: number,
    limit: number,
    total: number
  }
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: Record<string, string[]>
  }
}
```

---

## 18. STATE MANAGEMENT

```
Server State: React Query / SWR
    - API data
    - Caching
    - Revalidation

Client State: Zustand (minimal)
    - UI state only
    - No server data

URL State: Next.js searchParams
    - Filters
    - Pagination
    - Sort order
```

---

## 19. ERROR HANDLING

```typescript
// API Errors
class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: Record<string, string[]>
  ) {
    super(message)
  }
}

// Usage
throw new ApiError(
  'INVALID_CREDENTIALS',
  'Email or password is incorrect',
  401
)

// Global handler catches and formats response
```

---

# PART I: REFERENCE

---

## 40. NYOCLI REFERENCE

### All Commands

```bash
# Initialize project
python _tools/nyoworksCLI.py init "Project Name" --code XXX --role PM

# View status dashboard
python _tools/nyoworksCLI.py status

# Task management
python _tools/nyoworksCLI.py task list [--role ROLE] [--status STATUS] [--category CAT]
python _tools/nyoworksCLI.py task claim TASK-ID --role ROLE
python _tools/nyoworksCLI.py task done TASK-ID --role ROLE
python _tools/nyoworksCLI.py task block TASK-ID --role ROLE --reason "reason"
python _tools/nyoworksCLI.py task review TASK-ID --role ROLE [--approve]
python _tools/nyoworksCLI.py task create "Title" --role ROLE --category CAT --priority P1 \
    --description "desc" [--criteria "c1;c2"] [--depends "TASK-1,TASK-2"] \
    [--output "file1,file2"] [--hours N]

# Audit logging
python _tools/nyoworksCLI.py log "Message" --role ROLE --type ACTION_TYPE \
    [--task TASK-ID] [--files file1 file2] [--result RESULT] [--notes "notes"]

# Bug management
python _tools/nyoworksCLI.py bug list
python _tools/nyoworksCLI.py bug report "Title" --role ROLE --severity HIGH \
    [--error "msg"] [--steps "steps"] [--expected "exp"] [--actual "act"] \
    [--platform "web"] [--files "path"] [--hours N]
python _tools/nyoworksCLI.py bug fix BUG-ID --role ROLE

# Test failure tracking
python _tools/nyoworksCLI.py test-fail list
python _tools/nyoworksCLI.py test-fail log --file "path" --error "message" \
    [--name "test name"] [--severity HIGH] [--context "ctx"] \
    [--suggestion "fix"] [--role QA]
```

### Roles

```
PM, Developer, DataArchitect, QA, Debugger, DevOps
```

### Action Types

```
SESSION_START, SESSION_END, TASK_STARTED, TASK_PROGRESS,
TASK_COMPLETED, TASK_BLOCKED, TASK_CREATED, IMPLEMENTATION,
TEST_WRITTEN, BUG_FOUND, BUG_FIXED, DECISION, SCHEMA_CHANGE,
DEPLOYMENT, CODE_REVIEW, FILE_CREATED
```

### Task Categories

```
FEATURE, FIX, REFACTOR, DOCS, TEST, SCHEMA, CONFIG, SECURITY, PERFORMANCE
```

### Priorities

```
P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
```

### Severities (Bugs/Tests)

```
CRITICAL, HIGH, MEDIUM, LOW
```

---

## 41. FILE TEMPLATES

### Task Template (YAML Frontmatter)

```yaml
---
id: TASK-YYYYMMDD-NNN
created: YYYY-MM-DD HH:MM:SS UTC
category: FEATURE
priority: P1
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 4
dependencies: []
source: MANUAL
---

## Task Title

**Description:** What needs to be done.

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Context:** Why this task exists.

**Files Affected:**
- path/to/file.ts
```

### Bug Template

```yaml
---
id: BUG-YYYYMMDD-NNN
discovered: YYYY-MM-DD HH:MM:SS UTC
severity: HIGH
status: OPEN
reported_by: QA
---

## Bug Title

**Error Message:**
```
Error details here
```

**Steps to Reproduce:**
1. Step one
2. Step two

**Expected Behavior:** What should happen.

**Actual Behavior:** What happens instead.

**Platform:** Web / iOS / Android

**Files Involved:**
- path/to/file.ts
```

### Audit Log Entry Template

```markdown
---
## HH:MM:SS UTC - ACTION_TYPE

**Action:** Brief description
**Task ID:** TASK-YYYYMMDD-NNN
**Files Modified:**
- path/to/file.ts (added X lines)

**Result:** SUCCESS / BLOCKED / NEEDS_REVIEW
**Notes:** Additional context
```

---

## 42. QUICK START CHECKLIST

### Day 1: Project Initialization

```bash
# 1. Create monorepo
pnpm create turbo@latest my-saas
cd my-saas

# 2. Setup CLI
mkdir -p _tools
# Copy nyoworksCLI.py to _tools/

# 3. Initialize project
python _tools/nyoworksCLI.py init "My SaaS" --code MSS --role PM

# 4. Verify setup
python _tools/nyoworksCLI.py status

# 5. Claim first task
python _tools/nyoworksCLI.py task claim TASK-YYYYMMDD-001 --role PM

# 6. Complete PHASE A documentation
```

### Daily Workflow

```bash
# Start of day
python _tools/nyoworksCLI.py status
python _tools/nyoworksCLI.py log "Session start" --role [ROLE] --type SESSION_START

# Claim and work
python _tools/nyoworksCLI.py task claim TASK-XXX --role [ROLE]
# ... do work ...
python _tools/nyoworksCLI.py log "Progress update" --role [ROLE] --type TASK_PROGRESS

# End of day
python _tools/nyoworksCLI.py task done TASK-XXX --role [ROLE]
# OR
python _tools/nyoworksCLI.py task block TASK-XXX --role [ROLE] --reason "WIP: description"
python _tools/nyoworksCLI.py log "Session end" --role [ROLE] --type SESSION_END
```

---

## AGENT QUICK REFERENCE

### Always Do (CLI)

```
✓ Declare your role first message
✓ Run: python _tools/nyoworksCLI.py status
✓ Claim task via CLI before working
✓ Log progress via CLI
✓ Complete task via CLI when done
✓ Update docs when changing API contract
```

### Never Do

```
✗ Manually edit log/audit/task files (use CLI)
✗ Work on unclaimed tasks
✗ Edit another role's audit file
✗ Start UI before API tests pass
✗ Skip API contract definition
✗ Hardcode strings in code
✗ Use any type
✗ Write code as PM
```

### Quick Status Check

```bash
python _tools/nyoworksCLI.py status
```

### File Location Cheat Sheet

```
Task to claim?        → python _tools/nyoworksCLI.py task list
Task done?            → python _tools/nyoworksCLI.py task done TASK-XXX
Bug to report?        → python _tools/nyoworksCLI.py bug report "title"
Test failed?          → python _tools/nyoworksCLI.py test-fail log --file X --error Y
My activity log?      → python _tools/nyoworksCLI.py log "message"
Project status?       → docs/bible/00-INDEX.md
API contract?         → docs/bible/05-api/01-api-contract.md
Schema?               → docs/bible/04-data/01-schema.md
Code?                 → packages/api/src/, apps/*/src/
```

---

## END OF DOCUMENT

```
NYOWORKS Unified System v4.0

This document governs all NYOWORKS SaaS development.
All AI agents must read fully before any work begins.

Single source of truth for:
    - Framework architecture
    - Multi-agent workflow
    - CLI automation
    - Task management
    - Audit protocol
    - Clean code principles
    - API-first design
    - 12-Step Iron Workflow

Project-specific content goes in docs/bible/.

CLI Tool: _tools/nyoworksCLI.py
    - Automates documentation workflow
    - Reduces token consumption
    - Maintains consistency
```

*Last updated: 2026-01-29*