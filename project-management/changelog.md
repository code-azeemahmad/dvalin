# WebOS Changelog

Record meaningful project changes. Keep newest entries at the top.

## [0.1.0] — 2026-11-21 — Phase 1: Boot Proof of Concept & Foundation

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
