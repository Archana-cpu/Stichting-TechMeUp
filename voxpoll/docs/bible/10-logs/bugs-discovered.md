# Bugs Discovered

> NYOWORKS Task Management System v4.0
> Project: VoxPoll
> Project Code: VOX
> Last Updated: 2026-01-29 18:05:00 UTC

---

## Overview

This document tracks bugs discovered during development, testing, or production monitoring. Each bug automatically generates a task in tasks-active.md.

**Workflow:**
1. Bug discovered → Log here with `python _tools/nyo.py bug report`
2. CLI assigns priority based on impact
3. CLI creates corresponding TASK-YYYYMMDD-NNN in tasks-active.md
4. Developer claims task with `python _tools/nyo.py task claim <task-id>`
5. Developer fixes and marks done with `python _tools/nyo.py bug fix <bug-id> <task-id>`

---

## Format

```markdown
## [BUG-YYYYMMDD-NNN] Short Bug Description

**Date**: YYYY-MM-DD HH:MM:SS UTC
**Priority**: P0/P1/P2/P3
**Status**: OPEN / INVESTIGATING / IN_PROGRESS / FIXED
**Reported By**: Agent role
**Related Task**: TASK-YYYYMMDD-NNN
**Bible Refs**: [P-XXX, T-XXX] (if applicable)

### Impact

- **Severity**: Critical / High / Medium / Low
- **Affected Users**: All / Premium / Specific role / etc.
- **Workaround Available**: Yes / No

### Reproduction Steps

1. Step 1
2. Step 2
3. Step 3

### Expected Behavior

What should happen

### Actual Behavior

What actually happens

### Environment

- OS:
- Browser/Client:
- Version:
- Database:

### Root Cause

Analysis of why this bug exists (filled during investigation)

### Resolution

- **Fixed By**: TASK-YYYYMMDD-NNN
- **Fix Description**: What was changed
- **Fixed At**: YYYY-MM-DD HH:MM:SS UTC
- **Deployed**: YYYY-MM-DD (production deployment date)
```

---

## Critical Bugs (P0)

<!-- No critical bugs -->

---

## High Priority Bugs (P1)

<!-- No high priority bugs -->

---

## Medium Priority Bugs (P2)

<!-- No medium priority bugs -->

---

## Low Priority Bugs (P3)

<!-- No low priority bugs -->

---

## Fixed Bugs

<!-- Fixed bugs will be archived here -->

---

*NYOWORKS Task Management System v4.0 - VoxPoll Project*
*Use CLI: python _tools/nyo.py bug [report|list|fix]*
*Last migrated: 2026-01-29 18:05:00 UTC by Developer (NYOWORKS compliance)*
