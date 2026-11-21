# WebOS Changelog

Record meaningful project changes. Keep newest entries at the top.

## [0.8.0] — 2026-11-21 — Phase 8: Testing, Security Audit & Production Deployment

### Added
- **Security Hardening & Safety Controls:**
  - `src/features/experiments/services/ExperimentSafety.ts`: Added execution nonces to `wrapCommandForExecution()` ensuring unique marker pairing and immunity to serial log collisions.
  - `src/services/persistence/SnapshotStorage.ts`: Added `MAX_SNAPSHOT_BYTES` ceiling (512 MB) preventing out-of-memory denial of service during snapshot save and import; added 100-character name truncation and 500-character description sanitization.
- **Production Server & Deployment Configurations:**
  - `vite.config.ts`: Added `preview.headers` block configuring `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` on port 4173.
  - `public/_headers`: Security and isolation headers for Cloudflare Pages.
  - `netlify.toml`: Build, headers, MIME types, and SPA rewrite configuration for Netlify.
  - `nginx.conf` & `Dockerfile`: Multi-stage Docker build and Nginx configuration for containerized deployment.
  - `.github/workflows/ci.yml`: GitHub Actions CI pipeline running typechecking, unit tests, production build, and live VM harness.
- **Automated Verification Harnesses:**
  - `tests/e2e/test-production-server.mjs`: Automated preview server test verifying HTTP 200, COOP, COEP, and MIME types for WebAssembly (`v86.wasm`), Linux ISO, SeaBIOS, and VGABIOS.
  - Expanded unit test coverage in `tests/persistence/SnapshotStorage.test.ts` (11 tests) and `tests/experiments/ExperimentSafety.test.ts` (8 tests).
- **Release Documentation Suite:**
  - `docs/release/ARCHITECTURE_AUDIT.md`: Complete repository and architecture audit.
  - `docs/release/REGRESSION_TEST_RESULTS.md`: Empirical regression results across all eight phases.
  - `docs/release/BROWSER_E2E_RESULTS.md`: User journey verification and error resilience report.
  - `docs/security/THREAT_MODEL.md`: Asset mapping, trust boundaries, and threat scenario analysis.
  - `docs/security/SECURITY_AUDIT.md`: In-depth vulnerability audit and security checklist.
  - `docs/release/BROWSER_COMPATIBILITY.md`: Compatibility matrix across Chromium, Gecko, and WebKit.
  - `docs/release/PERFORMANCE_REPORT.md`: Measured baselines and performance budgets.
  - `docs/deployment/DEPLOYMENT_GUIDE.md`: Static hosting walkthroughs for Cloudflare Pages, Netlify, Docker.
  - `docs/deployment/PRODUCTION_VERIFICATION.md`: Production asset and response headers audit.
  - `docs/release/USER_GUIDE.md`: Comprehensive user manual for desktop, terminal, persistence, and OS Lab.
  - `docs/release/TROUBLESHOOTING.md`: Diagnostic guide for common issues and resolutions.
  - `docs/release/RELEASE_NOTES.md`: v0.8.0 release notes.
  - `docs/release/PHASE8_IMPLEMENTATION_REPORT.md`: Comprehensive Phase 8 completion report.
  - `README.md`: Modernized documentation with architecture diagrams, quickstart, and testing guides.

### Verified
- **71/71 Vitest Tests Passed** across 11 test suites.
- **Production Preview Server Verified (100% Pass):** COOP/COEP, MIME types, and asset sizes verified.
- **Live Guest Reload Recovery Verified:** Sub-second resume (969 ms) and file durability verified.
- **Live Guest OS Experiments Verified:** 12/12 stages passed in genuine Linux guest.
- **TypeScript & Production Build:** 0 compiler errors; bundle built in 3.86s.

## [0.7.0] — 2026-11-21 — Phase 7: OS Experiments & Advanced Features

### Added
- **OS Experiments Subsystem & Operating Systems Laboratory:**
  - `src/features/experiments/types/ExperimentTypes.ts`: Full domain contracts for `ExperimentDefinition`, `ExperimentStep`, `ExperimentValidationRule`, `ExperimentQuestion`, `StepExecutionResult`, `ExperimentProgressState`, `GuestResourceMetrics`, and `HostResourceMetrics`.
  - `src/features/experiments/services/ExperimentSafety.ts`:
    - Command safety validation blocking destructive operations (`rm -rf /`, `mkfs`, fork bombs, raw device writes, shutdown).
    - Workspace isolation (`/tmp/webos-experiments/<expId>/`) with sanitized path formatting.
    - Delimited marker execution wrapper protocol capturing stdout, stderr, and exit codes (`___START___` / `___END___:<codeNum>`).
    - Scoped cleanup service.
  - `src/features/experiments/data/experiments.ts`: Catalog of 20 fully specified experiments across 7 categories (Processes, Memory, Filesystem, Permissions, Shell, Kernel, Devices).
  - `src/features/experiments/services/ExperimentRegistry.ts`: Singleton indexing experiments by category, difficulty, and keywords with definition validation.
  - `src/features/experiments/services/ExperimentProgressService.ts`: LocalStorage persistence for user completions, active steps, quiz responses, and metrics.
  - `src/features/experiments/services/ExperimentRunner.ts`: Execution engine dispatching commands to `EmulatorManager`, evaluating output validation rules, and handling simulations.
  - `src/features/experiments/services/ResourceMonitoringService.ts`: Bounded 3000ms telemetry service strictly separating in-guest Linux kernel metrics from host browser metrics, with pause/resume support.
  - `src/features/experiments/hooks/useExperiments.ts`: React integration hook.
  - `src/features/experiments/components/`:
    - `ExperimentsApp.tsx`: Tabbed OS Lab desktop application window.
    - `ExperimentCatalog.tsx`: Category filtering, difficulty selector, search input, global lab progress bar, and lab cards.
    - `ExperimentDetail.tsx`: Step runner, validation badges, live output terminal, interactive knowledge check quiz, and lab reset.
    - `ExperimentVisualization.tsx`: High-clarity educational diagrams for 2-level paging, CPU scheduling queues, and the boot pipeline.
    - `ResourceMonitorView.tsx`: Live telemetry dashboard with guest vs host panels and pause/resume button.
- **Host Desktop Integration:**
  - `src/features/desktop/appRegistry.ts`: Registered `os-lab` application.
  - `src/components/desktop/DesktopShell.tsx`: Added window mount for `os-lab`.
  - `Taskbar.tsx`, `StartMenu.tsx`, `DesktopIcons.tsx`: Added `Sparkles` icon launch triggers.
- **Automated Verification Harness:**
  - `tests/boot/test-phase7-experiments.mjs`: Live guest verification runner testing 12 representative experiment stages on real booting Linux VM in 68 seconds.
- **Unit Test Suites (26 new tests):**
  - `tests/experiments/ExperimentRegistry.test.ts` (7 tests).
  - `tests/experiments/ExperimentSafety.test.ts` (8 tests).
  - `tests/experiments/ExperimentProgress.test.ts` (6 tests).
  - `tests/experiments/ExperimentRunner.test.ts` (5 tests).
- **Technical Documentation Suite:**
  - `docs/experiments/EXPERIMENT_ARCHITECTURE.md`: Subsystem architecture, execution modes, security boundaries.
  - `docs/experiments/EXPERIMENT_CATALOG.md`: Complete catalog of 20 experiments with objectives, commands, steps, and quizzes.
  - `docs/experiments/EXPERIMENT_SAFETY.md`: Safety rules, command allowlists, regex validation, workspace isolation.
  - `docs/experiments/RESOURCE_MONITORING.md`: Guest vs host metrics architecture, sampling rates, separation, limitations.
  - `docs/experiments/EXPERIMENT_VERIFICATION_RESULTS.md`: Detailed test harness output and verified live guest behavior.
  - `docs/experiments/PHASE7_IMPLEMENTATION_REPORT.md`: Comprehensive completion report.

### Verified
- **69/69 Vitest Tests Passed** across 11 test suites.
- **Live VM Verification Harness (100% Pass):** 12/12 stages passed in genuine Linux guest.
- **TypeScript & Build:** 0 type errors; production bundle built cleanly in 4.51s.

## [0.6.0] — 2026-11-21 — Phase 6: Persistence & System Management

### Added
- **Dedicated IndexedDB Snapshot Storage Subsystem:**
  - `src/services/persistence/SnapshotTypes.ts`: Full interfaces for `SnapshotMetadata`, `StoredSnapshot`, `SaveSnapshotInput`, and `StorageUsage`.
  - `src/services/persistence/SnapshotErrors.ts`: Typed domain errors (`SnapshotNotFoundError`, `QuotaExceededError`, `ChecksumMismatchError`, `HardwareMismatchError`, `StorageCorruptedError`, `OperationLockedError`).
  - `src/services/persistence/SnapshotValidation.ts`: Web Crypto SHA-256 calculation, deterministic `hardwareConfigHash` generator, and compatibility validator.
  - `src/services/persistence/SnapshotDatabase.ts`: IndexedDB database adapter (`webos_persistence_db`, store `snapshots`).
  - `src/services/persistence/SnapshotStorage.ts`: High-level persistence API (save, restore, list, delete, export, import, quota estimation).
  - `tests/persistence/SnapshotStorage.test.ts`: 9 automated Vitest tests.
- **Extended Emulator Lifecycle & Concurrency Locking:**
  - `src/features/emulator/types.ts`: Added lifecycle states: `capturing`, `restoring`, `shutting-down`, `restarting`.
  - `src/features/emulator/EmulatorManager.ts`:
    - Operation concurrency locking (`isOperationLocked`) to prevent conflicting async operations.
    - `captureAndSaveSnapshot(name, desc)`: Serializes VM state, computes SHA-256 and config hash, and stores in IndexedDB.
    - `restoreSnapshotById(id)`: Verifies hardware parity and SHA-256 checksum before restoring in-place or cold-booting.
    - `boot(screenContainer, initialStateBuffer)`: Instant cold boot from snapshot buffer.
    - `gracefulShutdown(timeoutMs)`: Dispatches `sudo poweroff` with automatic safety timeout.
    - `safeRestart(mode)`: Dispatches `sudo reboot` or hardware reset.
  - `src/features/emulator/useEmulator.ts`: Exposed new lifecycle and snapshot actions to React components.
- **Live VM Reload Recovery Verification:**
  - `tests/boot/test-phase6-reload-recovery.mjs`: Live test runner verifying guest file writing, snapshot serialization (90.97 MB in 274 ms), total VM destruction, and instant recovery (< 3s) with 100% token preservation.
  - `docs/persistence/BROWSER_RELOAD_RECOVERY_TEST.md`: Full verification report with recorded evidence.
- **Persistence Documentation Suite:**
  - `docs/persistence/PERSISTENCE_ARCHITECTURE_AUDIT.md`: 5-layer storage hierarchy and volatility boundaries.
  - `docs/persistence/GUEST_FILESYSTEM_PERSISTENCE.md`: Detailed analysis of Tiny Core RAM tmpfs, snapshot preservation, and `filetool.sh`.
  - `docs/persistence/SNAPSHOT_LIFECYCLE.md`: State machine diagrams and transition specifications.
  - `docs/persistence/SHUTDOWN_AND_RESTART.md`: ACPI poweroff, reboot, and teardown specifications.
  - `docs/persistence/STORAGE_FAILURE_HANDLING.md`: Storage quota defense, eviction prevention, and corruption handling.
  - `docs/persistence/PHASE6_VERIFICATION_RESULTS.md` & `PHASE6_IMPLEMENTATION_REPORT.md`.
- **Host UI Session & Power Controls:**
  - `src/components/applications/SettingsApp.tsx`: Added "Sessions & Storage" tab with IndexedDB quota meter, save session form, saved sessions list with hardware compatibility badges, restore, export, and delete actions, and power controls.
  - `src/components/desktop/StartMenu.tsx`: Integrated quick Save Session, Shutdown (`sudo poweroff`), and Reboot (`sudo reboot`) actions.
  - `src/components/SystemToolbar/SystemToolbar.tsx`: Added status badges for `capturing`, `restoring`, `shutting-down`, and `restarting`.

### Verified
- **43/43 Vitest Tests Passed** across 7 test suites.
- **Live VM Reload Recovery Verified (100% Pass):** Guest proof token survived VM destroy and cold restoration.
- **TypeScript & Build:** 0 errors; production bundle built cleanly in 3.75s.

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
