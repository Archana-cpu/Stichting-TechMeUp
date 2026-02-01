# Test Failures

> NYOWORKS Task Management System v4.0
> Project: VoxPoll
> Project Code: VOX
> Last Updated: 2026-01-29 18:05:00 UTC

---

## Overview

This document tracks test failures that require investigation and bug fixes. Each test failure automatically generates a task in tasks-active.md.

**Workflow:**
1. Test fails → Log here with `python _tools/nyo.py test-fail log`
2. CLI creates corresponding TASK-YYYYMMDD-NNN in tasks-active.md
3. Developer claims task with `python _tools/nyo.py task claim <task-id>`
4. Developer fixes root cause and marks resolved
5. Update with resolution details

---

## Format

```markdown
## [TESTFAIL-YYYYMMDD-NNN] Test Suite Name - Test Case Name

**Date**: YYYY-MM-DD HH:MM:SS UTC
**Priority**: P0/P1/P2/P3
**Status**: OPEN / INVESTIGATING / RESOLVED
**Test File**: path/to/test.test.ts:line
**Related Task**: TASK-YYYYMMDD-NNN

### Failure Details

- **Error Message**: Full error output
- **Expected**: What should happen
- **Actual**: What actually happened
- **Reproducibility**: Always / Intermittent / Rare

### Stack Trace

```
Full stack trace
```

### Investigation Notes

- YYYY-MM-DD HH:MM UTC: Investigation finding 1
- YYYY-MM-DD HH:MM UTC: Investigation finding 2

### Resolution

- **Fixed By**: TASK-YYYYMMDD-NNN
- **Fix Description**: What was changed
- **Resolved At**: YYYY-MM-DD HH:MM:SS UTC
```

---

## Active Test Failures

<!-- No active test failures -->

---

## Resolved Test Failures

<!-- Resolved failures will be archived here -->

---

*NYOWORKS Task Management System v4.0 - VoxPoll Project*
*Use CLI: python _tools/nyo.py test-fail [log|list]*
*Last migrated: 2026-01-29 18:05:00 UTC by Developer (NYOWORKS compliance)*
