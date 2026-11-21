# WebOS — Phase 5 Initial Audit: CLI & Operating System Capabilities

**Date:** 2026-11-21  
**Author:** Lead Software Architect & Systems Engineer  
**Status:** Complete  
**Base Commit:** `d24366b`  
**Scope:** Repository audit, BusyBox/kernel analysis, gap analysis, and Phase 5 implementation roadmap.

---

## 1. Existing Repository Architecture & State

WebOS is at Git commit `d24366b` with a clean working tree and all 28 automated tests passing in Vitest. The architecture enforces a strict boundary between host web components and the guest x86 virtual machine:

### 1.1 Host Environment
- **Web Platform:** React 18.3, TypeScript 5.6.3, Vite 5.4.21 with COOP/COEP isolation headers.
- **Window Management:** Centralized `WindowContext.tsx` with dynamic z-indexing, dragging, resizing, minimizing, and permanent DOM canvas mounting.
- **Application Registry:** `appRegistry.ts` delineating host applications (`target: 'host'`) from genuine Linux binaries (`target: 'guest'`).
- **Host Applications:** `LinuxDesktopApp` (framing live v86 canvas), `TerminalApp` (interactive command bridge with history), `SettingsApp` (local storage persistence), and `AboutApp`.

### 1.2 Guest Virtual Machine Environment
- **PC Emulation:** `v86` version `0.5.473` in WebAssembly (128 MB RAM, Cirrus VGA BIOS, SeaBIOS rel-1.16.2).
- **Guest OS:** Tiny Core Linux 17.1 (i686 architecture, Linux kernel 6.18.35-tinycore).
- **Core Userland:** BusyBox v1.36.1 (`/bin/busybox`, 530 KB binary), providing 234 symlinked applets and utilities.
- **Shell:** BusyBox `ash` (`/bin/ash` symlinked to `/bin/sh`).
- **Root Filesystem:** In-memory rootfs (`tmpfs`) unpacked from `core.gz` on boot.
- **Boot Media:** `Core-17.1.iso` (19.7 MB, fast CLI console) and `TinyCore-17.1.iso` (26.0 MB, graphical desktop with FLWM and Xvesa).

---

## 2. Verified Functionality from Prior Phases

The following capabilities have been tested and verified with recorded evidence:
1. **Boot Proof & Prompt Dispatch (Phase 1 & 2):**
   - WebAssembly JIT execution, virtual hardware initialization.
   - ISOLINUX bootloader detection and Enter scancode dispatch (`[0x1c, 0x9c]`).
   - Reaching interactive console prompt `tc@box:~$ `.
2. **Baseline Command Verification (Phase 2):**
   - `uname -a` -> `Linux box 6.18.35-tinycore #1 SMP Fri Jun 19 00:05:19 UTC 2026 i686 GNU/Linux`
   - `pwd` -> `/home/tc`
   - `ls -la /etc/os-release` -> confirmed `/etc/os-release` attributes
   - `cat /etc/os-release` -> confirmed `NAME=TinyCore`, `VERSION="17.1"`
3. **Graphical Desktop (Phase 2 & 3):**
   - Xvesa framebuffer initialization at `1024x768 @ 32bpp`.
   - Permanent DOM container preservation preventing v86 VM destruction on window minimize/close.
4. **Guest Application Discovery (Phase 4):**
   - Direct package inspection of `aterm.tcz`, `Xprogs.tcz`, `flwm.tcz`, `wbar.tcz`.
   - Verified paths for `aterm`, `editor`, `cpanel`, `apps`, `mnttool`, `services`.
5. **Snapshot Prototype (Phase 4):**
   - `v86.save_state()` exports complete ~3.31 MB `ArrayBuffer` state.
   - Restoration verified in Node prototype with hardware constructor parity.

---

## 3. Unverified Claims & Phase 5 Gap Analysis

While Phases 1 through 4 proved that Linux boots, executes simple commands, and renders X11, the deeper operating system and CLI capabilities of the guest remain unverified:

1. **BusyBox Applet Inventory:** The full inventory of BusyBox 1.36.1 applets (234 applets) has not been categorized, documented, or cross-referenced against GNU/Linux standards.
2. **Missing Utility Catalog:** While BusyBox provides a broad micro-userland, common utilities like `tree`, `file`, `nano`, `bash`, `htop`, `strace`, `gdb` are missing. Their availability, trade-offs, and installation viability in Tiny Core 17.1 have not been formally documented.
3. **Comprehensive Filesystem Operations:** Real nested directory creation, recursive copying, moving, renaming, file appending, deletion, and inode inspection have not been methodically verified with automated assertions.
4. **Process Management & Signal Handling:** Process control under BusyBox (`ps`, `top`, background jobs `&`, `kill -TERM`, `kill -KILL`, `wait`, child process reaping) requires structured, reproducible verification.
5. **Permission & Ownership Semantics:** `chmod` numeric and symbolic modes, `umask`, `id`, `whoami`, executable script permissions (`chmod +x`), and permission-denied enforcement must be proven on the guest tmpfs.
6. **Shell Scripting Execution:** Complex scripting constructs (variables, environment variables, positional arguments, conditional branches, loops, functions, command substitution, exit codes, and `trap` cleanup) must be verified inside BusyBox `ash`.
7. **Automated Verification Harness:** A dedicated, repeatable test harness that executes these test suites directly inside the guest and captures exact console evidence is required for Phase 5.

---

## 4. Phase 5 Implementation Strategy

### Workstream A: BusyBox Command Inventory
- Catalog all 234 BusyBox applets and 65 standalone executables.
- Classify into 9 core functional categories (Filesystem, File Inspection, Text Processing, System Information, Process Management, Permissions, Shell Utilities, Archival/Compression, Storage/Networking).
- Document in `docs/cli/command-inventory.md`.

### Workstream B: Utility Availability & Installation
- Evaluate candidate missing utilities (`file`, `tree`, `nano`, `bash`, `curl`, `less`, `which`).
- Document BusyBox built-in alternatives (e.g. `vi` for `nano`, `ash` for `bash`, `find` for `tree`, BusyBox `wget` for `curl`).
- Evaluate Tiny Core extension repository impact and document in `docs/cli/utility-availability.md`.

### Workstream C: File Operations
- Test directories (`mkdir -p`, `cd`, `pwd`, `rmdir`).
- Test files (`touch`, `echo`, `printf`, `cat`, `head`, `tail`, `cp`, `mv`, `rm`, `wc`).
- Test text processing (`grep`, `sed`, `awk`, `cut`, `sort`, `uniq`, `tr`).
- Inspect filesystem boundaries (`mount`, `df -h`, tmpfs in RAM).
- Document in `docs/cli/file-operations.md`.

### Workstream D: Process Management
- Test process creation (foreground, background jobs with `&`, `jobs`).
- Test process inspection (`ps`, `ps -o`, `/proc/<pid>/status`).
- Test process signaling (`kill -TERM`, `kill -KILL`, `wait`).
- Document in `docs/cli/process-management.md`.

### Workstream E: Permissions & Ownership
- Test `id`, `whoami`, `umask`.
- Test `chmod` (numeric e.g. 755, 600, 644; symbolic e.g. `+x`).
- Verify permission-denied enforcement when execute bit is missing.
- Document in `docs/cli/permissions.md`.

### Workstream F: Shell Scripting Suite
- Organize guest scripts cleanly under `guest/scripts/`:
  - `guest/scripts/system/` (system information & diagnostics)
  - `guest/scripts/filesystem/file-operations.sh`
  - `guest/scripts/process/process-lifecycle.sh`
  - `guest/scripts/permissions/permission-demo.sh`
  - `guest/scripts/scripting/` (variables, conditions, loops, functions, arguments, traps)
- Document BusyBox ash scripting syntax and constraints in `docs/cli/shell-scripting.md`.

### Workstream G: Guest Command Execution Reliability
- Review `EmulatorManager.launchGuestApp()` and `sendText()`.
- Implement safe application allowlisting and command string sanitization.
- Ensure strict separation between trusted guest application launching and interactive terminal execution.

### Workstream H: Verification Harness
- Create `tests/boot/test-phase5-verification.mjs`.
- Boot guest into console shell and execute automated multi-stage tests:
  - Stage 1: BusyBox inspection and version discovery.
  - Stage 2: Filesystem & directory operations.
  - Stage 3: Text processing pipeline.
  - Stage 4: Process spawning, signaling, and reaping.
  - Stage 5: Permissions and script execution.
  - Stage 6: Shell scripting constructs and error handling.
  - Stage 7: Cleanup verification.
- Output results to `docs/cli/verification-results.md`.

---

## 5. Risks & Mitigation Plan

| Risk | Impact | Mitigation |
|---|---|---|
| BusyBox ash syntax differences from Bash | Medium | Restrict all guest scripts to strict POSIX / ash syntax; avoid Bash arrays, `[[ ]]`, and process substitution. |
| Console typing / buffer truncation | Medium | Use line-by-line scancode text dispatch with prompt/marker synchronization in the test harness. |
| Filesystem persistence assumption | High | Explicitly document that all files created in `/tmp` and `/home/tc` exist in RAM tmpfs and are reset upon VM reboot until Phase 6 persistence. |
| Uncontrolled background test processes | Low | Harness includes guaranteed signal cleanup traps and process table reap assertions. |
