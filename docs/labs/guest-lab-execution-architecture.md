# Guest Lab Execution Architecture & Educational Foundation

**Date:** 2026-11-21  
**Status:** Implemented & Documented  
**Scope:** Educational OS lab runner, diagnostic scripts, and execution verification.

---

## 1. Educational Mission & Vision

The core educational purpose of WebOS is to serve as an **interactive operating systems learning environment**. Unlike simulated terminal exercises that mimic Unix shell outputs with regex-based JavaScript strings, WebOS runs a genuine 32-bit x86 Linux kernel (6.18.35-tinycore).

Every lab action:
- Exercises real kernel syscalls (`fork`, `execve`, `mmap`, `brk`, `kill`, `wait4`).
- Alters actual kernel data structures (`task_struct`, page tables, inode entries).
- Reflects genuine Linux behaviour in `/proc`, `/sys`, and virtual memory.

---

## 2. Directory & Component Structure

The guest script suite is organized cleanly in the repository under `guest/`:

```
guest/
├── config/
│   └── labs.json                 # Lab definitions, metadata, and validation tokens
└── scripts/
    ├── diagnostics/              # System inspection and status probes
    │   ├── fsinfo.sh             # Filesystems, df, and loop mount points
    │   ├── meminfo.sh            # Memory hierarchy, buffers, cache, free RAM
    │   ├── procs.sh              # Process tree, states, and top resource usage
    │   └── sysinfo.sh            # Kernel version, CPU, architecture, uptime
    └── labs/                     # Structured educational laboratory exercises
        ├── lab1-process-lifecycle.sh  # Fork, background jobs, SIGTERM, reaping
        └── lab2-memory-paging.sh      # Page sizes, tmpfs allocation, page counts
```

---

## 3. Script Design Standards

To ensure predictable parsing by the host test runner without requiring external dependencies inside the guest:

### 3.1 Strict POSIX / BusyBox Ash Compatibility
Tiny Core Linux uses BusyBox `ash` as its default interactive and scripting shell. All scripts:
- Use `#!/bin/sh` shebang.
- Avoid Bash-specific arrays or non-standard expansions.
- Rely solely on BusyBox standard utilities (`awk`, `cut`, `sed`, `grep`, `ps`, `df`, `stat`, `dd`).

### 3.2 Delimited Marker Blocks
Each diagnostic script and lab exercise outputs machine-parseable marker headers and footers:
```
=== LAB1_START: Process Lifecycle ===
[Step 1] Current Shell PID: 1042
[Step 1] Parent PID: 1020
[Step 2] Spawning background worker: sleep 30 &
[Step 2] Child spawned with PID: 1045
[Step 3] Child /proc/1045 state: S (S=Sleeping)
[Step 4] Sending SIGTERM to PID 1045
[Step 4] Process terminated with wait status: 0
[Step 5] PASS: Process 1045 successfully reaped from process table.
=== LAB1_COMPLETE: Process Lifecycle Verified ===
```

### 3.3 Verification Token Pattern
In `guest/config/labs.json`, each lab defines an array of `expectedTokens`. The host execution runner verifies that all milestone tokens appear sequentially in the captured output stream before awarding a passing grade.

---

## 4. Execution Workflow

```
+--------------------------------------------------------------------------+
| 1. WebOS Host Lab Runner (Phase 5)                                       |
|    - Selects lab (e.g. "lab1-process-lifecycle")                         |
|    - Reads lab script content from guest/scripts/labs/                   |
|    - Encodes script as base64 or dispatches command to guest shell       |
+-----------------------------------|--------------------------------------+
                                    |
                                    v (EmulatorManager.launchGuestApp / sendText)
+-----------------------------------|--------------------------------------+
| 2. Genuine Linux Virtual Machine                                         |
|    - Executes /bin/sh script in guest memory                             |
|    - Evaluates kernel behavior (/proc inspection, process kill, tmpfs)   |
|    - Outputs delimited result tokens to terminal/serial buffer           |
+-----------------------------------|--------------------------------------+
                                    |
                                    v (Captured via screenBuffer / serial0Output)
+-----------------------------------|--------------------------------------+
| 3. Host Output Evaluator                                                 |
|    - Verifies presence of expected milestone tokens                      |
|    - Verifies exit codes and absence of unhandled exceptions             |
|    - Renders interactive step-by-step progress checklist to user         |
+--------------------------------------------------------------------------+
```

---

## 5. Lab Catalog Overview

### 5.1 Lab 1: Process Lifecycle & Process Table
- **Concepts:** Process ID (`PID`), Parent Process ID (`PPID`), process creation (`fork`), process state machine (`R`, `S`, `Z`), signal handling (`SIGTERM`), and process table cleanup.
- **Verification:** Ensures background child PID is tracked, verified in `/proc/<pid>/status`, cleanly killed with signal 15, and reaped so the PID disappears from `/proc`.

### 5.2 Lab 2: Virtual Memory & Page Allocation
- **Concepts:** Architecture page granularity (4096-byte pages on x86), physical vs virtual memory accounting in `/proc/meminfo`, memory-backed filesystems (`tmpfs`), and page deallocation.
- **Verification:** Queries `getconf PAGESIZE` (4096), allocates a 2 MB buffer (512 pages) on `/tmp` (tmpfs), verifies byte allocation, and cleans up.
