# Test Failures

> NyoWorks Test Failure Tracking
> Last Updated: 2026-01-29

---

## Overview

This document tracks test failures that require investigation and bug fixes. Each test failure automatically generates a task in `tasks-active.md`.

**Workflow:**
1. Test fails → Log here with full details
2. Create corresponding TASK-XXX in tasks-active.md
3. Developer claims task and fixes root cause
4. Mark failure as RESOLVED with fix reference

---

## Format

```markdown
## [TEST-FAIL-XXX] Test Suite Name - Test Case Name

**Date**: YYYY-MM-DD HH:MM
**Priority**: P0/P1/P2/P3
**Status**: OPEN / INVESTIGATING / RESOLVED
**Test File**: path/to/test.test.ts:line
**Related Task**: TASK-XXX

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

- YYYY-MM-DD: Investigation finding 1
- YYYY-MM-DD: Investigation finding 2

### Resolution

- **Fixed By**: TASK-XXX
- **Fix Description**: What was changed
- **Resolved At**: YYYY-MM-DD HH:MM
```

---

## Active Test Failures

<!-- No active test failures yet -->

---

## Resolved Test Failures

<!-- Resolved failures will be archived here -->

---

*Created as part of NyoWorks Bible standardization on 2026-01-29*
