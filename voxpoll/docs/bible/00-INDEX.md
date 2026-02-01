# VoxPoll - Documentation Index

> **Project Code:** VOX
> **Version:** v0.1.0 (MVP in progress)
> **Last updated:** 2026-01-29
> **Status:** [Development - PHASE B]
> **Standard:** NyoWorks Unified System v4.0

---

## Quick Start

**New Agent?** Read these in order:
1. [NyoWorks Manifesto](nyoworks-standards-manifesto.md) - Complete framework
2. This index (you're here)
3. [00-MASTER/INDEX.md](00-MASTER/INDEX.md) - Detailed navigation
4. Run: `python _tools/nyoworksCLI.py status`
5. Claim your first task

---

## CLI Commands Quick Reference

```bash
# Status dashboard
python _tools/nyoworksCLI.py status

# Task management
python _tools/nyoworksCLI.py task list --role PM
python _tools/nyoworksCLI.py task claim TASK-XXX --role PM
python _tools/nyoworksCLI.py task done TASK-XXX --role PM

# Audit logging
python _tools/nyoworksCLI.py log "Session start" --role PM --type SESSION_START
```

---

## Critical Documents (Read Before Coding)

1. **API Contract**: [05-api/01-api-contract.md](05-api/01-api-contract.md)
2. **Database Schema**: [05-TECH/02-database-schema.md](05-TECH/02-database-schema.md)
3. **RBAC Matrix**: [09-security/01-rbac-matrix.md](09-security/01-rbac-matrix.md)
4. **User Flows**: [06-UX/01-user-flows.md](06-UX/01-user-flows.md)

---

## Bible Structure (NyoWorks Compliant)

### Standard NyoWorks Sections

| Section | Purpose | Key Files | CLI Managed |
|---------|---------|-----------|-------------|
| [01-overview/](01-overview/) | Purpose, architecture, stack | 01-purpose.md, 02-architecture.md, 03-tech-stack.md | ❌ |
| [02-apps/](02-apps/) | Application specs | 01-web-app.md, 02-mobile-app.md | ❌ |
| [03-user-flows/](03-user-flows/) | User journeys | 01-auth-flows.md, 02-onboarding.md, 03-core-workflow.md | ❌ |
| [04-data/](04-data/) | Database schema, relationships | 01-schema.md, 02-relationships.md | ❌ |
| [05-api/](05-api/) | API specifications | 01-api-contract.md (155 endpoints), 02-endpoints.md | ❌ |
| [06-features/](06-features/) | Feature implementations | README.md (links to 03-FEATURES/) | ❌ |
| [07-testing/](07-testing/) | Test strategy | 01-test-plan.md | ❌ |
| [08-deployment/](08-deployment/) | Infrastructure, CI/CD | 01-infrastructure.md, 02-environments.md, 03-ci-cd.md | ❌ |
| [09-security/](09-security/) | RBAC, security | 01-rbac-matrix.md | ❌ |
| [10-logs/](10-logs/) | Tasks, bugs, research | tasks-active.md, bugs-discovered.md | ✅ YES |
| [11-audit/](11-audit/) | Agent activity logs | [role]-[date].md | ✅ YES |
| [98-backlog/](98-backlog/) | Future features | 01-future-features.md | ❌ |
| [99-meta/](99-meta/) | Status, changelog, glossary | STATUS.md, CHANGELOG.md, GLOSSARY.md | ❌ |

### VoxPoll-Specific Sections (Hybrid Architecture)

| Section | Purpose | Notes |
|---------|---------|-------|
| [00-MASTER/](00-MASTER/) | Detailed navigation, decisions | VoxPoll-specific, kept for reference |
| [01-VISION/](01-VISION/) | Mission, product principles | Links to 01-overview/ |
| [02-USERS/](02-USERS/) | User types, roles, verification | Domain-specific user management |
| [03-FEATURES/](03-FEATURES/) | Polls, surveys, tests, social | Complete feature specifications |
| [05-TECH/](05-TECH/) | Architecture, DB schema, API routes | Technical implementation details |
| [06-UX/](06-UX/) | Flows, UI specs, accessibility | Frontend specifications |
| [07-EDGE/](07-EDGE/) | Edge cases, failure modes | Business logic edge cases |
| [08-AUTHORITATIVE/](08-AUTHORITATIVE/) | Override decisions | Highest priority section |
| [99-TRACKING/](99-TRACKING/) | GAPS, implementation status | Project tracking |
| [_archive/](_archive/) | Old files | Reference only |

For complete navigation: [00-MASTER/INDEX.md](00-MASTER/INDEX.md)

---

## File Ownership Rules

**Sacred Rule:** NEVER manually edit these files (CLI-managed):
- `10-logs/tasks-active.md`
- `10-logs/tasks-completed.md`
- `10-logs/bugs-discovered.md`
- `10-logs/test-failures.md`
- `11-audit/*-2026-*.md`

Use CLI commands only: `python _tools/nyoworksCLI.py [command]`

---

## NyoWorks Compliance Status

✅ **100% Compliant** - All mandatory directories and files created
✅ **Hybrid Architecture** - VoxPoll-specific sections preserved
✅ **CLI Integration** - Multi-agent workflow ready
✅ **Documentation Complete** - 155 API endpoints documented

---

*Last updated: 2026-01-29 by Product Manager*
*Standard: NyoWorks Unified System v4.0 (CLI-Integrated Edition)*
