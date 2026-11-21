# WebOS Changelog

Record meaningful project changes. Keep newest entries at the top.

## [0.5.0] — 2026-11-21 — Phase 5: CLI & Operating System Capabilities

### Added
- **Command & Utility Inventory:**
  - `docs/cli/command-inventory.md`: Complete catalog of 221 compiled BusyBox applets, 234 symlinks, and 65 standalone rootfs binaries.
  - `docs/cli/utility-availability.md`: Candidate evaluation of `file`, `tree`, `nano`, `bash`, and `curl`, with documented built-in alternatives (`vi`, `ash`, `tree.sh`).
- **Filesystem & Text Operations:**
  - `docs/cli/file-operations.md`: Directory nesting, file creation, append, copy, move, rename, delete, and text processing with `grep`, `sed`, `awk`, `cut`, `sort`, `uniq`.
  - `guest/scripts/filesystem/file-operations.sh` & `tree.sh`: Practical demonstration scripts.
- **Process Management & Signals:**
  - `docs/cli/process-management.md`: Process states in `/proc`, background execution (`&`), signal delivery (`kill -15`), wait status, and process table reaping.
  - `guest/scripts/process/process-lifecycle.sh`: Process lifecycle demonstration script.
- **Permissions & Security:**
  - `docs/cli/permissions.md`: DAC permission bits, umask `022`, kernel execute bit enforcement, and sudo privilege escalation.
  - `guest/scripts/permissions/permission-demo.sh`: Executable permission demonstration script.
- **Shell Scripting Suite:**
  - `docs/cli/shell-scripting.md`: BusyBox `ash` language specification, POSIX standards, and avoided bashisms.
  - `guest/scripts/scripting/`: Modular scripts demonstrating variables, conditions, loops, functions, arguments, and signal traps.
- **Automated Guest Verification Harness:**
  - `tests/boot/test-phase5-verification.mjs`: Automated 12-stage test runner executing genuine commands in the Linux VM.
  - `docs/cli/verification-results.md`: Complete captured screen buffer evidence and metrics (12/12 stages passed).
  - `docs/implementation/phase-5-audit.md` & `phase-5-implementation-report.md`.
- **Security & Unit Tests:**
  - `ALLOWED_GUEST_APPS` allowlist and `launchRegisteredGuestApp()` added to `EmulatorManager.ts`.
  - `tests/cli/guestScripts.test.ts`: 3 unit tests verifying POSIX compliance, no bashisms, and marker delimiters.
  - `tests/emulator/EmulatorManager.test.ts`: Added tests for allowlist and invalid command rejection.
  - Total Vitest tests expanded to 32 passed across 6 test suites.

### Verified
- **12/12 Stages Passed in Real Linux VM:** All CLI, filesystem, process, permission, and scripting capabilities verified inside the guest kernel without simulation.
- **Production Build:** 0 TypeScript compilation errors; production bundle built cleanly in 4.35s.

### Added
- **FLWM Window Manager Configuration:**
  - `docs/emulator/flwm-configuration.md`: Comprehensive documentation on FLWM vertical left title bars, title bar color configuration (`FLWM_TITLEBAR_COLOR="58:7D:AA"`), `.wmx` root menu hierarchy, and keyboard shortcuts.
- **Guest Application Catalog & Inventory:**
  - `docs/emulator/guest-application-inventory.md`: Complete profile of native Tiny Core Linux 17.1 applications unpacked and verified from `TinyCore-17.1.iso` (`aterm`, `editor`, `cpanel`, `apps`, `mnttool`, `services`, `flrun`).
  - Typed application targets: updated `AppDefinition` in `src/features/desktop/types.ts` with `target: 'host' | 'guest'`, `guestCommand`, and `requiresGuestRunning`.
  - Registered genuine guest applications in `src/features/desktop/appRegistry.ts`: `guest-aterm`, `guest-editor`, and `guest-cpanel`.
- **Host-to-Guest Command Channel & Routing:**
  - `EmulatorManager.launchGuestApp(command)`: Dispatches command strings to the active Linux guest environment without host evaluation or simulation.
  - `WindowContext.openWindow(appId)`: Enhanced to surface the `linux-desktop` window and dispatch the launch command when a guest application is triggered.
  - `StartMenu.tsx` & `DesktopIcons.tsx`: Added `Guest` and `Host` badges, plus dedicated `FileText` and `Sliders` application icons.
  - `docs/emulator/guest-command-channel.md`: Technical documentation of dual-channel architecture (PS/2 keyboard vs COM1 serial) and security boundaries.
- **Educational OS Lab Execution Foundation:**
  - `guest/scripts/diagnostics/`: Production-ready shell probes (`sysinfo.sh`, `procs.sh`, `meminfo.sh`, `fsinfo.sh`) with delimited output markers.
  - `guest/scripts/labs/`: Educational lab scripts (`lab1-process-lifecycle.sh`, `lab2-memory-paging.sh`) for kernel concept demonstrations.
  - `guest/config/labs.json`: Structured manifest defining lab metadata, prerequisites, and milestone validation tokens.
  - `docs/labs/guest-lab-execution-architecture.md`: Architecture guide for the Phase 5 automated lab runner.
- **v86 Snapshot Persistence Research:**
  - Prototype verified in Node.js against `v86` library (`save_state()` and `restore_state()`).
  - Captured ~3.31 MB memory snapshot and established hardware parity restoration rules.
  - Added `saveState()` and `restoreState()` methods to `EmulatorManager.ts`.
  - `docs/architecture/v86-snapshot-persistence-design.md`: Storage architecture, IndexedDB design, and fast-boot checkpoint blueprint for Phase 6.
- **Automated Tests:**
  - `tests/desktop/appRegistry.test.ts`: 3 unit tests verifying app targets, metadata, and wallpaper configurations.
  - `tests/labs/labScripts.test.ts`: 3 tests validating lab manifest structure, script existence, POSIX shebangs, and validation tokens.
  - Added test cases to `tests/emulator/EmulatorManager.test.ts` and `tests/desktop/WindowContext.test.tsx`.
  - Total automated tests expanded to 28 passing tests across 5 test suites.

### Verified
- **Host-to-Guest Launch Routing:** Verified that launching guest apps focuses the `linux-desktop` window and forwards genuine launch commands.
- **Guest Extensions & Executables:** Directly verified all 27 SquashFS packages in `TinyCore-17.1.iso` CDE directory.
- **Snapshot Prototype:** Verified that saving state and restoring with matching hardware parameters succeeds cleanly.
- **Test Suite:** 28/28 tests passing (100% pass rate) in Vitest.
- **Production Build:** 0 TypeScript compilation errors; Vite production bundle built in 3.86s.

### Added
- **Desktop Shell & Workspace:**
  - `DesktopShell.tsx`: Root host workspace with viewport scaling and layout management.
  - `DesktopWallpaper.tsx`: 4 dynamic ambient wallpapers (Deep Slate Mesh, Cosmic Indigo, Emerald Matrix, Cyan Aurora).
  - `DesktopIcons.tsx`: Grid of desktop shortcuts with double-click and Enter key app launch support.
- **Window Management System:**
  - `WindowContext.tsx`: Centralized, typed window state provider managing opening, closing, minimizing, maximizing, restoring, focusing, and bounds clamping.
  - `DesktopWindow.tsx`: Interactive window chrome with title bar dragging, minimize/maximize/close controls, and corner resizing.
  - Permanent DOM mounting pattern: preserves the underlying v86 emulator canvas during window minimization and close via CSS display toggling.
- **Taskbar & Launcher:**
  - `Taskbar.tsx`: 48px bottom bar with Start menu button and running window tabs.
  - `StartMenu.tsx`: Popover application launcher with search filtering, app categories, and quick VM controls.
  - `SystemTray.tsx`: Real-time clock updating every second, VM status pill, and fullscreen toggle button.
- **Applications:**
  - `LinuxDesktopApp.tsx`: Dedicated host window framing the live Tiny Core Linux guest with quick control toolbar.
  - `TerminalApp.tsx`: Live command shell connected to the real guest Linux system with command history (<kbd>↑</kbd>/<kbd>↓</kbd>) and zero simulated output.
  - `SettingsApp.tsx`: Host appearance customization, wallpaper selection, and display scaling with `localStorage` persistence.
  - `AboutApp.tsx`: System architecture overview, kernel specifications, and complete license attribution.
- **Automated Tests & Documentation:**
  - `tests/desktop/WindowContext.test.tsx`: 4 automated unit tests verifying window operations.
  - `tests/desktop/useSettings.test.tsx`: 3 automated unit tests verifying preference persistence.
  - Design documentation: `docs/design/desktop-shell.md` and `docs/design/window-management.md`.
  - Testing documentation: `docs/testing/phase-3-verification.md`.
  - Implementation reports: `project-management/phase-3-initial-audit.md` and `project-management/phase-3-implementation-report.md`.

### Verified
- **Window Operations:** Open, focus, drag, resize, minimize, maximize, and restore verified across multiple concurrent windows.
- **DOM Canvas Persistence:** Confirmed that minimizing and closing windows does not unmount or restart the running v86 emulator.
- **Real Linux Terminal:** Verified live command dispatch to Tiny Core Linux and actual output rendering.
- **Test Suite:** 19/19 tests passing across 3 test suites in Vitest.
- **Compilation & Bundle:** 0 TypeScript compilation errors; production build built in 3.91s.

## [0.2.0] — 2026-11-21 — Phase 2: Browser Integration & Graphical Linux Implementation

### Added
- Genuine graphical Linux desktop support: acquired and verified `TinyCore-17.1.iso` (26.0 MB) containing Xvesa and FLWM window manager.
- Guest Edition selection in `WelcomeScreen.tsx`: users can select between "Graphical Desktop (FLWM + Xvesa)" and "Command-Line Console (Fast Shell)".
- Prompt-aware bootloader Enter key dispatcher in `EmulatorManager.ts`: detects ISOLINUX boot menu immediately and launches default kernel without timer delays.
- Full display interaction in `EmulatorDisplay.tsx`:
  - VGA canvas rendering inside React DOM.
  - Display resolution listener dynamically tracking resolution changes up to 1024×768 @ 32bpp.
  - Click-to-focus overlay and mouse pointer lock integration.
  - Esc key capture release (`document.exitPointerLock`).
  - Fullscreen toggle via `screen_go_fullscreen`.
- Comprehensive lifecycle and stability test suite (`tests/emulator/EmulatorManager.test.ts`): expanded from 6 to 12 tests covering state notifications, config protection, restart, stop, error reporting/recovery, and clean teardown.
- Multi-command test harness in `tests/boot/test-v86-boot.mjs` verifying sequential command execution and screen capture.

### Verified
- **Graphical Linux Desktop:** `TinyCore-17.1.iso` bootstraps Linux kernel 6.18.35, loads FLWM/Xvesa, executes 3.69 billion x86 instructions, and activates VESA mode at 1024×768 @ 32bpp.
- **Interactive Linux Commands:** Executed real commands in guest shell:
  - `uname -a` -> Verified Linux 6.18.35-tinycore i686.
  - `pwd` -> Verified `/home/tc`.
  - `ls -la /etc/os-release` -> Verified `-rw-r--r-- 1 root root 287 /etc/os-release`.
  - `cat /etc/os-release` -> Verified `NAME=TinyCore`, `VERSION="17.1"`, `ID=tinycore`.
- **Browser HTTP Delivery:** Verified HTTP 200 responses with COOP (`same-origin`) and COEP (`credentialless`) headers.
- **Test Suite:** 12/12 unit tests passing in Vitest.
- **Typecheck & Build:** 0 TypeScript errors; production build completed in 3.42s.

### Added
- Comprehensive initial repository audit report (`project-management/initial-project-audit.md`).
- Project scaffold with React 18, TypeScript 5.6, Vite 5.4, Tailwind CSS, and Vitest.
- Pinned `v86` PC emulator package (`v86` @ `0.5.473`).
- Verified BIOS assets: `seabios.bin` (128 KB, SeaBIOS rel-1.16.2) and `vgabios.bin` (36 KB).
- Verified guest OS asset: `Core-17.1.iso` (Tiny Core Linux 17.1, 32-bit x86/i686, MD5 `8d5efae4cbf4ba463fa012d29e58918e`).
- Pinned WebAssembly runtime assets (`v86.wasm`, `v86-fallback.wasm`).
- Core emulator service: `EmulatorManager.ts` providing singleton lifecycle, typed status transitions, and decoupled event handling.
- Host React UI components:
  - `DesktopFrame`: Main application frame and layout.
  - `SystemToolbar`: Controls for Start, Stop, Reset, Serial Console, and Fullscreen.
  - `WelcomeScreen`: Pre-boot informational screen detailing guest architecture and specs.
  - `BootScreen`: Loading progress, animated indicator, and diagnostics log.
  - `EmulatorDisplay`: Structured v86 VGA canvas and monospace text container with mouse-capture cues.
  - `StatusBar`: System metrics, RAM allocation, and resolution indicators.
- Automated tests:
  - `tests/emulator/EmulatorManager.test.ts`: Unit test suite verifying singleton integrity, state changes, double-boot prevention, and teardown.
  - `tests/boot/test-v86-boot.mjs`: Complete 6-level boot verification harness.

### Verified
- **Level 1:** v86 WebAssembly emulator module loaded.
- **Level 2:** Virtual hardware initialized with 128 MB RAM.
- **Level 3:** SeaBIOS firmware started.
- **Level 4:** Linux kernel 6.18.35-tinycore bootstrapped.
- **Level 5:** Shell prompt reached (`tc@box:~$ `).
- **Level 6:** Real Linux command (`uname -a`) executed via keyboard controller, producing genuine kernel output: `Linux box 6.18.35-tinycore #1 SMP Fri Jun 19 00:05:19 UTC 2026 i686 GNU/Linux`.
