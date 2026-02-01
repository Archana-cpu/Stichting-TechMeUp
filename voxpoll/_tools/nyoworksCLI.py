#!/usr/bin/env python3
"""
NyoCLI - Workflow Automation for NYOWORKS AI Development
Version: 1.0.0
Purpose: Reduce AI agent token consumption by automating documentation tasks for SaaS projects

Usage:
    python _tools/nyo.py status
    python _tools/nyo.py log "Message" --role Developer --type TASK_PROGRESS
    python _tools/nyo.py task claim TASK-2026-01-27-001 --role Developer
    python _tools/nyo.py task done TASK-2026-01-27-001 --role Developer
    python _tools/nyo.py init --code VOX --name "VoxPoll"
"""

import argparse
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


# === CONFIGURATION ===

BIBLE_ROOT = Path("docs/bible")
LOGS_DIR = BIBLE_ROOT / "10-logs"
AUDIT_DIR = BIBLE_ROOT / "11-audit"

TASKS_ACTIVE = LOGS_DIR / "tasks-active.md"
TASKS_COMPLETED = LOGS_DIR / "tasks-completed.md"
BUGS_FILE = LOGS_DIR / "bugs-discovered.md"
TEST_FAILURES_FILE = LOGS_DIR / "test-failures.md"
RESEARCH_FILE = LOGS_DIR / "research-findings.md"
INDEX_FILE = BIBLE_ROOT / "00-INDEX.md"

ROLES = [
    "PM",
    "Developer",
    "DataArchitect",
    "QA",
    "Debugger",
    "DevOps"
]

ROLE_TASK_PERMISSIONS = {
    "PM": ["DOCS", "FEATURE"],
    "Developer": ["FEATURE", "FIX", "REFACTOR", "PERFORMANCE", "DOCS"],
    "DataArchitect": ["SCHEMA", "PERFORMANCE", "DOCS"],
    "QA": ["TEST", "DOCS"],
    "Debugger": ["FIX"],
    "DevOps": ["CONFIG", "SECURITY", "DOCS"]
}

ACTION_TYPES = [
    "SESSION_START",
    "SESSION_END",
    "TASK_STARTED",
    "TASK_PROGRESS",
    "TASK_COMPLETED",
    "TASK_BLOCKED",
    "TASK_CREATED",
    "IMPLEMENTATION",
    "TEST_WRITTEN",
    "BUG_FOUND",
    "BUG_FIXED",
    "DECISION",
    "SCHEMA_CHANGE",
    "DEPLOYMENT",
    "CODE_REVIEW",
    "FILE_CREATED"
]

TASK_CATEGORIES = [
    "FEATURE",
    "FIX",
    "REFACTOR",
    "DOCS",
    "TEST",
    "SCHEMA",
    "CONFIG",
    "SECURITY",
    "PERFORMANCE"
]

TASK_STATUSES = [
    "AVAILABLE",
    "IN_PROGRESS",
    "BLOCKED",
    "REVIEW",
    "DONE"
]

PRIORITIES = ["P0", "P1", "P2", "P3"]

TASK_SOURCES = [
    "MANUAL",
    "TEST_FAILURE",
    "BUG_REPORT",
    "RESEARCH",
    "CODE_REVIEW"
]


# === UTILITY FUNCTIONS ===

def get_timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


def get_date() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def get_time() -> str:
    return datetime.now(timezone.utc).strftime("%H:%M:%S UTC")


def ensure_file_exists(filepath: Path, template: str = "") -> None:
    if not filepath.exists():
        filepath.parent.mkdir(parents=True, exist_ok=True)
        filepath.write_text(template, encoding="utf-8")
        print(f"[CREATED] {filepath}")


def append_to_file(filepath: Path, content: str) -> None:
    ensure_file_exists(filepath, "")
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(content)
    print(f"[APPENDED] {filepath}")


def read_file(filepath: Path) -> str:
    if filepath.exists():
        return filepath.read_text(encoding="utf-8")
    return ""


def write_file(filepath: Path, content: str) -> None:
    filepath.parent.mkdir(parents=True, exist_ok=True)
    filepath.write_text(content, encoding="utf-8")
    print(f"[UPDATED] {filepath}")


def get_audit_file(role: str) -> Path:
    date = get_date()
    role_slug = role.lower().replace(" ", "-")
    return AUDIT_DIR / f"{role_slug}-{date}.md"


def get_project_code() -> str:
    content = read_file(INDEX_FILE)
    match = re.search(r"Project Code:\s*(\w+)", content)
    if match:
        return match.group(1)
    return "XXX"


def get_next_task_number() -> str:
    date = get_date()
    content = read_file(TASKS_ACTIVE)
    pattern = rf"TASK-{date.replace('-', '')}-(\d+)"
    matches = re.findall(pattern, content)
    if matches:
        next_num = max(int(m) for m in matches) + 1
    else:
        next_num = 1
    return f"{next_num:03d}"


def generate_task_id() -> str:
    date = get_date().replace("-", "")
    num = get_next_task_number()
    return f"TASK-{date}-{num}"


def get_next_bug_number() -> str:
    date = get_date()
    content = read_file(BUGS_FILE)
    pattern = rf"BUG-{date.replace('-', '')}-(\d+)"
    matches = re.findall(pattern, content)
    if matches:
        next_num = max(int(m) for m in matches) + 1
    else:
        next_num = 1
    return f"{next_num:03d}"


def generate_bug_id() -> str:
    date = get_date().replace("-", "")
    num = get_next_bug_number()
    return f"BUG-{date}-{num}"


def get_next_test_failure_number() -> str:
    date = get_date()
    content = read_file(TEST_FAILURES_FILE)
    pattern = rf"TEST-FAIL-{date.replace('-', '')}-(\d+)"
    matches = re.findall(pattern, content)
    if matches:
        next_num = max(int(m) for m in matches) + 1
    else:
        next_num = 1
    return f"{next_num:03d}"


def generate_test_failure_id() -> str:
    date = get_date().replace("-", "")
    num = get_next_test_failure_number()
    return f"TEST-FAIL-{date}-{num}"


# === LOG COMMAND ===

def cmd_log(args) -> None:
    role = args.role
    action_type = args.type.upper()
    message = args.message
    task = args.task or "N/A"
    files = args.files or []
    
    if role not in ROLES:
        print(f"[ERROR] Invalid role: {role}")
        print(f"[INFO] Valid roles: {', '.join(ROLES)}")
        return
    
    if action_type not in ACTION_TYPES:
        print(f"[WARNING] Unknown action type: {action_type}")
        print(f"[INFO] Valid types: {', '.join(ACTION_TYPES)}")
    
    timestamp = get_time()
    
    audit_entry = f"""
---
## {timestamp} - {action_type}

**Action:** {message}
**Task ID:** {task}
**Files Modified:**
"""
    
    if files:
        for f in files:
            audit_entry += f"- {f}\n"
    else:
        audit_entry += "- None\n"
    
    audit_entry += f"""
**Result:** {args.result or "SUCCESS"}
**Notes:** {args.notes or "N/A"}
"""
    
    audit_file = get_audit_file(role)
    
    if not audit_file.exists():
        header = f"""# {role} Activity Log - {get_date()}

"""
        ensure_file_exists(audit_file, header)
    
    append_to_file(audit_file, audit_entry)
    print(f"[SUCCESS] Logged {action_type} for {role}")


# === TASK COMMAND ===

def cmd_task(args) -> None:
    subcommand = args.task_command
    
    if subcommand == "claim":
        task_claim(args.task_id, args.role)
    elif subcommand == "done":
        task_done(args.task_id, args.role)
    elif subcommand == "block":
        task_block(args.task_id, args.role, args.reason)
    elif subcommand == "create":
        task_create(args)
    elif subcommand == "list":
        task_list(args.role, args.status, args.category)
    elif subcommand == "review":
        task_review(args.task_id, args.role, args.approve)
    else:
        print(f"[ERROR] Unknown task subcommand: {subcommand}")


def task_claim(task_id: str, role: str) -> None:
    content = read_file(TASKS_ACTIVE)
    task_id = task_id.upper()
    timestamp = get_timestamp()
    
    pattern = rf"(---\nid: {task_id}\n.*?)(status: )(\w+)(.*?)(assigned_to: )(null|\w+)(.*?)(---|\Z)"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print(f"[ERROR] Task {task_id} not found in tasks-active.md")
        return
    
    current_status = match.group(3)
    current_assigned = match.group(6)
    
    if current_assigned != "null" and current_assigned != role:
        print(f"[ERROR] Task {task_id} already assigned to {current_assigned}")
        return
    
    if current_status != "AVAILABLE":
        print(f"[WARNING] Task {task_id} has status {current_status}, expected AVAILABLE")
    
    def replace_func(m):
        return (
            m.group(1) +
            m.group(2) + "IN_PROGRESS" +
            m.group(4) +
            m.group(5) + role +
            m.group(7) +
            m.group(8)
        )
    
    new_content = re.sub(pattern, replace_func, content, flags=re.DOTALL)
    
    new_content = re.sub(
        rf"(id: {task_id}\n.*?)(assigned_at: )(.*?\n)",
        rf"\g<1>\g<2>{timestamp}\n",
        new_content,
        flags=re.DOTALL
    )
    
    write_file(TASKS_ACTIVE, new_content)
    
    log_args = argparse.Namespace(
        role=role,
        type="TASK_STARTED",
        message=f"Claimed task {task_id}",
        task=task_id,
        files=[],
        result="IN_PROGRESS",
        notes=None
    )
    cmd_log(log_args)
    
    print(f"[SUCCESS] {role} claimed task {task_id}")


def task_done(task_id: str, role: str) -> None:
    content = read_file(TASKS_ACTIVE)
    task_id = task_id.upper()
    timestamp = get_timestamp()
    
    pattern = rf"(---\nid: {task_id}\n.*?---)"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print(f"[ERROR] Task {task_id} not found in tasks-active.md")
        return
    
    task_block_content = match.group(1)
    
    task_block_content = re.sub(
        r"status: \w+",
        "status: DONE",
        task_block_content
    )
    
    completed_content = read_file(TASKS_COMPLETED)
    completed_content += f"\n{task_block_content}\n"
    write_file(TASKS_COMPLETED, completed_content)
    
    new_content = re.sub(pattern, "", content, flags=re.DOTALL)
    new_content = re.sub(r"\n{3,}", "\n\n", new_content)
    write_file(TASKS_ACTIVE, new_content)
    
    log_args = argparse.Namespace(
        role=role,
        type="TASK_COMPLETED",
        message=f"Completed task {task_id}",
        task=task_id,
        files=[],
        result="DONE",
        notes="Task moved to tasks-completed.md"
    )
    cmd_log(log_args)
    
    print(f"[SUCCESS] Task {task_id} marked as DONE and moved to completed")


def task_block(task_id: str, role: str, reason: str) -> None:
    content = read_file(TASKS_ACTIVE)
    task_id = task_id.upper()
    
    pattern = rf"(---\nid: {task_id}\n.*?)(status: )(\w+)(.*?---)"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print(f"[ERROR] Task {task_id} not found")
        return
    
    new_content = re.sub(
        pattern,
        rf"\g<1>\g<2>BLOCKED\g<4>",
        content,
        flags=re.DOTALL
    )
    
    write_file(TASKS_ACTIVE, new_content)
    
    log_args = argparse.Namespace(
        role=role,
        type="TASK_BLOCKED",
        message=f"Blocked task {task_id}: {reason}",
        task=task_id,
        files=[],
        result="BLOCKED",
        notes=reason
    )
    cmd_log(log_args)
    
    print(f"[SUCCESS] Task {task_id} marked as BLOCKED")


def task_review(task_id: str, role: str, approve: bool) -> None:
    content = read_file(TASKS_ACTIVE)
    task_id = task_id.upper()
    
    if approve:
        task_done(task_id, role)
    else:
        pattern = rf"(---\nid: {task_id}\n.*?)(status: )(\w+)(.*?---)"
        new_content = re.sub(
            pattern,
            rf"\g<1>\g<2>IN_PROGRESS\g<4>",
            content,
            flags=re.DOTALL
        )
        write_file(TASKS_ACTIVE, new_content)
        
        log_args = argparse.Namespace(
            role=role,
            type="CODE_REVIEW",
            message=f"Review rejected for {task_id}, sent back to IN_PROGRESS",
            task=task_id,
            files=[],
            result="NEEDS_WORK",
            notes="Review failed, requires changes"
        )
        cmd_log(log_args)
        
        print(f"[SUCCESS] Task {task_id} review rejected, status set to IN_PROGRESS")


def task_create(args) -> None:
    task_id = generate_task_id()
    timestamp = get_timestamp()
    
    dependencies = args.depends.split(",") if args.depends else []
    deps_str = str(dependencies) if dependencies else "[]"
    
    task_entry = f"""
---
id: {task_id}
created: {timestamp}
category: {args.category.upper()}
priority: {args.priority.upper()}
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: {args.hours or 4}
dependencies: {deps_str}
source: MANUAL
---

## {args.title}

**Description:** {args.description}

**Acceptance Criteria:**
"""
    
    if args.criteria:
        for criterion in args.criteria.split(";"):
            task_entry += f"- [ ] {criterion.strip()}\n"
    else:
        task_entry += "- [ ] TBD\n"
    
    task_entry += f"""
**Context:** Created by {args.role}

**Files Affected:**
"""
    
    if args.output:
        for f in args.output.split(","):
            task_entry += f"- {f.strip()}\n"
    else:
        task_entry += "- TBD\n"
    
    append_to_file(TASKS_ACTIVE, task_entry)
    
    log_args = argparse.Namespace(
        role=args.role,
        type="TASK_CREATED",
        message=f"Created task {task_id}: {args.title}",
        task=task_id,
        files=[],
        result="SUCCESS",
        notes=None
    )
    cmd_log(log_args)
    
    print(f"[SUCCESS] Created task {task_id}")


def task_list(role: Optional[str], status: Optional[str], category: Optional[str]) -> None:
    content = read_file(TASKS_ACTIVE)
    
    pattern = r"---\nid: (TASK-[\d-]+)\n.*?category: (\w+)\n.*?priority: (\w+)\n.*?status: (\w+)\n.*?assigned_to: (\w+|null)\n.*?## ([^\n]+)"
    matches = re.findall(pattern, content, re.DOTALL)
    
    if not matches:
        print("[INFO] No tasks found")
        return
    
    filtered = []
    for task_id, cat, priority, stat, assigned, title in matches:
        if status and stat.upper() != status.upper():
            continue
        if category and cat.upper() != category.upper():
            continue
        if role and stat == "AVAILABLE":
            allowed_cats = ROLE_TASK_PERMISSIONS.get(role, [])
            if cat.upper() not in allowed_cats:
                continue
        filtered.append((task_id, cat, priority, stat, assigned, title))
    
    if not filtered:
        print("[INFO] No tasks match filters")
        return
    
    print("\n" + "=" * 80)
    print(f"{'ID':<25} {'CAT':<12} {'PRI':<4} {'STATUS':<12} {'ASSIGNED':<15} TITLE")
    print("=" * 80)
    
    for task_id, cat, priority, stat, assigned, title in filtered:
        assigned_display = assigned if assigned != "null" else "-"
        title_short = title[:30] + "..." if len(title) > 30 else title
        print(f"{task_id:<25} {cat:<12} {priority:<4} {stat:<12} {assigned_display:<15} {title_short}")
    
    print("=" * 80 + "\n")


# === BUG COMMAND ===

def cmd_bug(args) -> None:
    subcommand = args.bug_command
    
    if subcommand == "report":
        bug_report(args)
    elif subcommand == "fix":
        bug_fix(args.bug_id, args.role)
    elif subcommand == "list":
        bug_list()
    else:
        print(f"[ERROR] Unknown bug subcommand: {subcommand}")


def bug_report(args) -> None:
    bug_id = generate_bug_id()
    timestamp = get_timestamp()
    
    severity_to_priority = {
        "CRITICAL": "P0",
        "HIGH": "P1",
        "MEDIUM": "P2",
        "LOW": "P3"
    }
    priority = severity_to_priority.get(args.severity.upper(), "P2")
    
    bug_entry = f"""
---
id: {bug_id}
discovered: {timestamp}
severity: {args.severity.upper()}
status: OPEN
reported_by: {args.role}
---

## {args.title}

**Error Message:**
```
{args.error or "N/A"}
```

**Steps to Reproduce:**
{args.steps or "N/A"}

**Expected Behavior:** {args.expected or "N/A"}

**Actual Behavior:** {args.actual or "N/A"}

**Platform:** {args.platform or "All"}

**Files Involved:**
- {args.files or "TBD"}
"""
    
    append_to_file(BUGS_FILE, bug_entry)
    
    task_id = generate_task_id()
    task_entry = f"""
---
id: {task_id}
created: {timestamp}
category: FIX
priority: {priority}
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: {args.hours or 2}
dependencies: []
source: BUG_REPORT
linked_bug: {bug_id}
---

## Fix: {args.title}

**Description:** Bug fix for {bug_id}. {args.title}

**Acceptance Criteria:**
- [ ] Bug is fixed
- [ ] No regression in related functionality
- [ ] Tests pass after fix

**Context:** Discovered by {args.role}. See {bug_id} for details.

**Files Affected:**
- {args.files or "TBD"}
"""
    
    append_to_file(TASKS_ACTIVE, task_entry)
    
    log_args = argparse.Namespace(
        role=args.role,
        type="BUG_FOUND",
        message=f"Reported bug {bug_id}: {args.title}",
        task=task_id,
        files=[],
        result="SUCCESS",
        notes=f"Created fix task {task_id}"
    )
    cmd_log(log_args)
    
    print(f"[SUCCESS] Bug {bug_id} reported, fix task {task_id} created")


def bug_fix(bug_id: str, role: str) -> None:
    content = read_file(BUGS_FILE)
    bug_id = bug_id.upper()
    
    pattern = rf"(---\nid: {bug_id}\n.*?)(status: )(\w+)(.*?---)"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print(f"[ERROR] Bug {bug_id} not found")
        return
    
    new_content = re.sub(
        pattern,
        rf"\g<1>\g<2>FIXED\g<4>",
        content,
        flags=re.DOTALL
    )
    
    write_file(BUGS_FILE, new_content)
    
    log_args = argparse.Namespace(
        role=role,
        type="BUG_FIXED",
        message=f"Fixed bug {bug_id}",
        task="N/A",
        files=[],
        result="FIXED",
        notes=None
    )
    cmd_log(log_args)
    
    print(f"[SUCCESS] Bug {bug_id} marked as FIXED")


def bug_list() -> None:
    content = read_file(BUGS_FILE)
    
    pattern = r"---\nid: (BUG-[\d-]+)\n.*?severity: (\w+)\n.*?status: (\w+)\n.*?## ([^\n]+)"
    matches = re.findall(pattern, content, re.DOTALL)
    
    if not matches:
        print("[INFO] No bugs found")
        return
    
    print("\n" + "=" * 70)
    print(f"{'ID':<20} {'SEVERITY':<10} {'STATUS':<10} TITLE")
    print("=" * 70)
    
    for bug_id, severity, status, title in matches:
        title_short = title[:35] + "..." if len(title) > 35 else title
        print(f"{bug_id:<20} {severity:<10} {status:<10} {title_short}")
    
    print("=" * 70 + "\n")


# === TEST FAILURE COMMAND ===

def cmd_test_fail(args) -> None:
    subcommand = args.test_command
    
    if subcommand == "log":
        test_fail_log(args)
    elif subcommand == "list":
        test_fail_list()
    else:
        print(f"[ERROR] Unknown test-fail subcommand: {subcommand}")


def test_fail_log(args) -> None:
    fail_id = generate_test_failure_id()
    timestamp = get_timestamp()
    
    fail_entry = f"""
---
id: {fail_id}
discovered: {timestamp}
test_file: {args.file}
test_name: "{args.name or 'Unknown'}"
error: "{args.error}"
severity: {args.severity.upper()}
---

## {args.name or 'Test Failure'}

**Error Message:**
```
{args.error}
```

**Context:** {args.context or "N/A"}

**Suggested Fix:** {args.suggestion or "TBD"}
"""
    
    append_to_file(TEST_FAILURES_FILE, fail_entry)
    
    severity_to_priority = {
        "CRITICAL": "P0",
        "HIGH": "P1",
        "MEDIUM": "P2",
        "LOW": "P3"
    }
    priority = severity_to_priority.get(args.severity.upper(), "P1")
    
    task_id = generate_task_id()
    task_entry = f"""
---
id: {task_id}
created: {timestamp}
category: FIX
priority: {priority}
status: AVAILABLE
assigned_to: null
assigned_at: null
estimated_hours: 2
dependencies: []
source: TEST_FAILURE
linked_test_failure: {fail_id}
---

## Fix Test Failure: {args.name or args.file}

**Description:** Test is failing. Error: {args.error[:100]}...

**Acceptance Criteria:**
- [ ] Test passes after fix
- [ ] No other tests broken by change
- [ ] Error handling is correct

**Context:** Discovered during test suite run. Test file: {args.file}

**Files Affected:**
- {args.file}
"""
    
    append_to_file(TASKS_ACTIVE, task_entry)
    
    log_args = argparse.Namespace(
        role=args.role,
        type="BUG_FOUND",
        message=f"Test failure {fail_id}: {args.error[:50]}",
        task=task_id,
        files=[args.file],
        result="FAIL",
        notes=f"Created fix task {task_id}"
    )
    cmd_log(log_args)
    
    print(f"[SUCCESS] Test failure {fail_id} logged, fix task {task_id} created")


def test_fail_list() -> None:
    content = read_file(TEST_FAILURES_FILE)
    
    pattern = r"---\nid: (TEST-FAIL-[\d-]+)\n.*?test_file: ([^\n]+)\n.*?severity: (\w+)\n"
    matches = re.findall(pattern, content, re.DOTALL)
    
    if not matches:
        print("[INFO] No test failures found")
        return
    
    print("\n" + "=" * 80)
    print(f"{'ID':<25} {'SEVERITY':<10} FILE")
    print("=" * 80)
    
    for fail_id, test_file, severity in matches:
        print(f"{fail_id:<25} {severity:<10} {test_file}")
    
    print("=" * 80 + "\n")


# === STATUS COMMAND ===

def cmd_status(args) -> None:
    print("\n" + "=" * 60)
    print("NYOWORKS PROJECT STATUS")
    print("=" * 60)
    
    index_content = read_file(INDEX_FILE)
    code_match = re.search(r"Project Code:\s*(\w+)", index_content)
    name_match = re.search(r"# ([^\n]+)", index_content)
    status_match = re.search(r"Status:\s*\[([^\]]+)\]", index_content)
    
    project_code = code_match.group(1) if code_match else "N/A"
    project_name = name_match.group(1).replace(" - Documentation Index", "") if name_match else "N/A"
    project_status = status_match.group(1) if status_match else "N/A"
    
    print(f"\nProject: {project_name}")
    print(f"Code: {project_code}")
    print(f"Status: {project_status}")
    print(f"Date: {get_date()}")
    
    tasks_content = read_file(TASKS_ACTIVE)
    
    available = len(re.findall(r"status: AVAILABLE", tasks_content))
    in_progress = len(re.findall(r"status: IN_PROGRESS", tasks_content))
    blocked = len(re.findall(r"status: BLOCKED", tasks_content))
    review = len(re.findall(r"status: REVIEW", tasks_content))
    
    completed_content = read_file(TASKS_COMPLETED)
    done = len(re.findall(r"status: DONE", completed_content))
    
    print("\n--- TASK SUMMARY ---")
    print(f"Available:   {available}")
    print(f"In Progress: {in_progress}")
    print(f"Blocked:     {blocked}")
    print(f"In Review:   {review}")
    print(f"Completed:   {done}")
    print(f"Total:       {available + in_progress + blocked + review + done}")
    
    bugs_content = read_file(BUGS_FILE)
    open_bugs = len(re.findall(r"status: OPEN", bugs_content))
    fixed_bugs = len(re.findall(r"status: FIXED", bugs_content))
    
    print("\n--- BUG SUMMARY ---")
    print(f"Open:  {open_bugs}")
    print(f"Fixed: {fixed_bugs}")
    
    print("\n--- AVAILABLE TASKS BY ROLE ---")
    for role in ROLES:
        allowed_cats = ROLE_TASK_PERMISSIONS.get(role, [])
        count = 0
        for cat in allowed_cats:
            pattern = rf"category: {cat}\n.*?status: AVAILABLE"
            count += len(re.findall(pattern, tasks_content, re.DOTALL))
        if count > 0:
            print(f"{role}: {count} task(s)")
    
    print("\n--- P0/P1 TASKS ---")
    p0_tasks = re.findall(r"id: (TASK-[\d-]+)\n.*?priority: P0\n.*?status: (?!DONE)(\w+)", tasks_content, re.DOTALL)
    p1_tasks = re.findall(r"id: (TASK-[\d-]+)\n.*?priority: P1\n.*?status: (?!DONE)(\w+)", tasks_content, re.DOTALL)
    
    if p0_tasks:
        print("P0 (CRITICAL):")
        for task_id, status in p0_tasks:
            print(f"  - {task_id} [{status}]")
    if p1_tasks:
        print("P1 (HIGH):")
        for task_id, status in p1_tasks:
            print(f"  - {task_id} [{status}]")
    if not p0_tasks and not p1_tasks:
        print("No P0/P1 tasks pending")
    
    print("\n" + "=" * 60 + "\n")


# === INIT COMMAND ===

def cmd_init(args) -> None:
    project_name = args.name
    project_code = args.code.upper()
    role = args.role
    timestamp = get_timestamp()
    date = get_date()
    
    print(f"\n[INIT] Initializing NYOWORKS project: {project_name} ({project_code})")
    
    dirs = [
        BIBLE_ROOT / "01-overview",
        BIBLE_ROOT / "02-apps",
        BIBLE_ROOT / "03-user-flows",
        BIBLE_ROOT / "04-data",
        BIBLE_ROOT / "05-api",
        BIBLE_ROOT / "06-features",
        BIBLE_ROOT / "07-testing",
        BIBLE_ROOT / "08-deployment",
        BIBLE_ROOT / "09-security",
        LOGS_DIR,
        AUDIT_DIR,
        BIBLE_ROOT / "98-backlog",
        BIBLE_ROOT / "99-meta",
        BIBLE_ROOT / "_archive"
    ]
    
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
        print(f"[CREATED] {d}")
    
    index_template = f"""# {project_name} - Documentation Index

> **Project Code:** {project_code}
> **Last updated:** {timestamp}
> **Status:** [MVP]

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
- [Core Workflow](03-user-flows/03-core-workflow.md)

## Data
- [Database Schema](04-data/01-schema.md) ⚠️ READ BEFORE CODING
- [Relationships](04-data/02-relationships.md)
- [Migrations](04-data/03-migrations.md)

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
- [CI/CD](08-deployment/03-ci-cd.md)

## Security
- [RBAC Matrix](09-security/01-rbac-matrix.md)

## Active Tasks
- [Tasks (Active)](10-logs/tasks-active.md) ⚠️ CHECK BEFORE TAKING TASK
- [Tasks (Completed)](10-logs/tasks-completed.md)
- [Bugs](10-logs/bugs-discovered.md)

---

*This index is auto-maintained. Update when adding new Bible files.*

*Last updated: {timestamp}*
"""
    ensure_file_exists(INDEX_FILE, index_template)
    
    tasks_template = f"""# Active Tasks

Project: {project_name}
Project Code: {project_code}
Last Updated: {timestamp}

## Priority Legend
- P0: Blocker - drop everything
- P1: Critical - complete this phase
- P2: Important - complete this release
- P3: Nice to have - if time permits

## Status Legend
- AVAILABLE: Ready, anyone can claim
- IN_PROGRESS: Actively being worked on
- BLOCKED: Stuck, needs help
- REVIEW: Done, needs verification
- DONE: Complete, move to tasks-completed.md

---

---
id: TASK-{date.replace('-', '')}-001
created: {timestamp}
category: DOCS
priority: P0
status: AVAILABLE
assigned_to: null
assigned_at: null
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

**Files Affected:**
- docs/bible/01-overview/*
- docs/bible/03-user-flows/*
- docs/bible/04-data/*
- docs/bible/05-api/*
"""
    ensure_file_exists(TASKS_ACTIVE, tasks_template)
    
    ensure_file_exists(TASKS_COMPLETED, f"""# Completed Tasks

Project: {project_name}
Project Code: {project_code}

Tasks are moved here from tasks-active.md when status: DONE.
Do not delete entries. This is the permanent record.

---
""")
    
    ensure_file_exists(BUGS_FILE, f"""# Bug Tracker

Project: {project_name}
Project Code: {project_code}

## Severity Legend
- CRITICAL: System broken, revenue blocked
- HIGH: Core feature broken
- MEDIUM: Minor feature broken
- LOW: Cosmetic issue

## Status Legend
- OPEN: Reported, not yet investigated
- INVESTIGATING: Looking into cause
- IN_PROGRESS: Fix being developed
- FIXED: Fix complete and verified

---
""")
    
    ensure_file_exists(TEST_FAILURES_FILE, f"""# Test Failures

Project: {project_name}
Project Code: {project_code}

Test failures are logged here and automatically create FIX tasks.

---
""")
    
    ensure_file_exists(RESEARCH_FILE, f"""# Research Findings

Project: {project_name}
Project Code: {project_code}

Research findings that may lead to new tasks or improvements.

---
""")
    
    ensure_file_exists(BIBLE_ROOT / "99-meta" / "CHANGELOG.md", f"""# Changelog

Project: {project_name}

All notable changes to this project will be documented here.

---

## [{date}] - Project Initialized

### Added
- Initial project structure
- Bible documentation framework
- NyoCLI integration

---
""")
    
    ensure_file_exists(BIBLE_ROOT / "99-meta" / "GLOSSARY.md", f"""# Glossary

Project: {project_name}

## Terms

| Term | Definition |
|------|------------|
| Bible | Single source of truth documentation |
| RBAC | Role-Based Access Control |
| RSC | React Server Components |

---

*Last updated: {timestamp}*
""")
    
    audit_file = get_audit_file(role)
    audit_template = f"""# {role} Activity Log - {date}

---
## {get_time()} - SESSION_START

**Action:** Project initialized with NyoCLI
**Task ID:** N/A
**Files Modified:**
- docs/bible/* (created structure)

**Result:** SUCCESS
**Notes:** Project {project_name} ({project_code}) ready for development
"""
    ensure_file_exists(audit_file, audit_template)
    
    print(f"\n[SUCCESS] Project '{project_name}' ({project_code}) initialized!")
    print(f"\nNext steps:")
    print(f"  1. Run: python _tools/nyo.py status")
    print(f"  2. Run: python _tools/nyo.py task claim TASK-{date.replace('-', '')}-001 --role PM")
    print(f"  3. Complete PHASE A documentation")


# === MAIN PARSER ===

def main() -> None:
    parser = argparse.ArgumentParser(
        description="NyoCLI - Workflow Automation for NYOWORKS SaaS Development",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python _tools/nyo.py init "VoxPoll" --code VOX --role PM
  python _tools/nyo.py status
  python _tools/nyo.py task list --role Developer --status AVAILABLE
  python _tools/nyo.py task claim TASK-20260127-001 --role Developer
  python _tools/nyo.py log "Implemented auth" --role Developer --type IMPLEMENTATION --task TASK-20260127-002
  python _tools/nyo.py task done TASK-20260127-001 --role Developer
  python _tools/nyo.py bug report "Login 500 error" --role QA --severity HIGH
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    init_parser = subparsers.add_parser("init", help="Initialize new project")
    init_parser.add_argument("name", help="Project name")
    init_parser.add_argument("--code", required=True, help="3-letter project code")
    init_parser.add_argument("--role", default="PM", help="Initializing role")
    
    status_parser = subparsers.add_parser("status", help="Show project status summary")
    
    log_parser = subparsers.add_parser("log", help="Add audit log entry")
    log_parser.add_argument("message", help="Log message")
    log_parser.add_argument("--role", required=True, choices=ROLES, help="Role name")
    log_parser.add_argument("--type", required=True, help="Action type")
    log_parser.add_argument("--task", help="Related task ID")
    log_parser.add_argument("--files", nargs="*", help="Files changed")
    log_parser.add_argument("--result", help="Result status")
    log_parser.add_argument("--notes", help="Additional notes")
    
    task_parser = subparsers.add_parser("task", help="Manage tasks")
    task_subparsers = task_parser.add_subparsers(dest="task_command")
    
    task_list_parser = task_subparsers.add_parser("list", help="List tasks")
    task_list_parser.add_argument("--role", help="Filter by role permissions")
    task_list_parser.add_argument("--status", help="Filter by status")
    task_list_parser.add_argument("--category", help="Filter by category")
    
    task_claim_parser = task_subparsers.add_parser("claim", help="Claim a task")
    task_claim_parser.add_argument("task_id", help="Task ID to claim")
    task_claim_parser.add_argument("--role", required=True, choices=ROLES, help="Role claiming")
    
    task_done_parser = task_subparsers.add_parser("done", help="Complete a task")
    task_done_parser.add_argument("task_id", help="Task ID to complete")
    task_done_parser.add_argument("--role", required=True, choices=ROLES, help="Role completing")
    
    task_block_parser = task_subparsers.add_parser("block", help="Block a task")
    task_block_parser.add_argument("task_id", help="Task ID to block")
    task_block_parser.add_argument("--role", required=True, choices=ROLES, help="Role blocking")
    task_block_parser.add_argument("--reason", required=True, help="Block reason")
    
    task_review_parser = task_subparsers.add_parser("review", help="Review a task")
    task_review_parser.add_argument("task_id", help="Task ID to review")
    task_review_parser.add_argument("--role", required=True, choices=ROLES, help="Role reviewing")
    task_review_parser.add_argument("--approve", action="store_true", help="Approve the task")
    
    task_create_parser = task_subparsers.add_parser("create", help="Create new task")
    task_create_parser.add_argument("title", help="Task title")
    task_create_parser.add_argument("--role", required=True, choices=ROLES, help="Creator role")
    task_create_parser.add_argument("--category", required=True, choices=TASK_CATEGORIES, help="Task category")
    task_create_parser.add_argument("--priority", default="P2", choices=PRIORITIES, help="Priority")
    task_create_parser.add_argument("--description", required=True, help="Task description")
    task_create_parser.add_argument("--criteria", help="Acceptance criteria (semicolon separated)")
    task_create_parser.add_argument("--depends", help="Dependencies (comma separated)")
    task_create_parser.add_argument("--output", help="Expected output files (comma separated)")
    task_create_parser.add_argument("--hours", type=int, help="Estimated hours")
    
    bug_parser = subparsers.add_parser("bug", help="Manage bugs")
    bug_subparsers = bug_parser.add_subparsers(dest="bug_command")
    
    bug_list_parser = bug_subparsers.add_parser("list", help="List bugs")
    
    bug_report_parser = bug_subparsers.add_parser("report", help="Report a bug")
    bug_report_parser.add_argument("title", help="Bug title")
    bug_report_parser.add_argument("--role", required=True, choices=ROLES, help="Reporter role")
    bug_report_parser.add_argument("--severity", required=True, choices=["CRITICAL", "HIGH", "MEDIUM", "LOW"], help="Severity")
    bug_report_parser.add_argument("--error", help="Error message")
    bug_report_parser.add_argument("--steps", help="Reproduction steps")
    bug_report_parser.add_argument("--expected", help="Expected behavior")
    bug_report_parser.add_argument("--actual", help="Actual behavior")
    bug_report_parser.add_argument("--platform", help="Platform")
    bug_report_parser.add_argument("--files", help="Files involved")
    bug_report_parser.add_argument("--hours", type=int, help="Estimated fix hours")
    
    bug_fix_parser = bug_subparsers.add_parser("fix", help="Mark bug as fixed")
    bug_fix_parser.add_argument("bug_id", help="Bug ID")
    bug_fix_parser.add_argument("--role", required=True, choices=ROLES, help="Fixer role")
    
    test_parser = subparsers.add_parser("test-fail", help="Manage test failures")
    test_subparsers = test_parser.add_subparsers(dest="test_command")
    
    test_log_parser = test_subparsers.add_parser("log", help="Log a test failure")
    test_log_parser.add_argument("--file", required=True, help="Test file path")
    test_log_parser.add_argument("--name", help="Test name")
    test_log_parser.add_argument("--error", required=True, help="Error message")
    test_log_parser.add_argument("--severity", default="HIGH", choices=["CRITICAL", "HIGH", "MEDIUM", "LOW"], help="Severity")
    test_log_parser.add_argument("--context", help="Additional context")
    test_log_parser.add_argument("--suggestion", help="Suggested fix")
    test_log_parser.add_argument("--role", default="QA", choices=ROLES, help="Reporter role")
    
    test_list_parser = test_subparsers.add_parser("list", help="List test failures")
    
    args = parser.parse_args()
    
    if args.command == "init":
        cmd_init(args)
    elif args.command == "status":
        cmd_status(args)
    elif args.command == "log":
        cmd_log(args)
    elif args.command == "task":
        if args.task_command:
            cmd_task(args)
        else:
            task_parser.print_help()
    elif args.command == "bug":
        if args.bug_command:
            cmd_bug(args)
        else:
            bug_parser.print_help()
    elif args.command == "test-fail":
        if args.test_command:
            cmd_test_fail(args)
        else:
            test_parser.print_help()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()