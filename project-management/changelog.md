# WebOS Changelog

Record meaningful project changes. Keep newest entries at the top.

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
