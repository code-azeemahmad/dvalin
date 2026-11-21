# WebOS Task Board

Statuses: `Backlog`, `Ready`, `In Progress`, `Blocked`, `Done`, `Verified`.

## Phase 1 — Boot proof of concept
- [x] P1-01 Inspect repository and environment — Verified (Audit completed in `initial-project-audit.md`)
- [x] P1-02 Review current v86 compatibility/docs — Verified (Upstream v86 0.5.473 examined, 32-bit x86 compatibility mapped)
- [x] P1-03 Obtain candidate Tiny Core x86 image — Verified (`Core-17.1.iso` downloaded from ibiblio)
- [x] P1-04 Record image checksum and source — Verified (MD5 `8d5efae4cbf4ba463fa012d29e58918e`, SHA-256 `8fe45bbda0e9b52e5874dd6e9733aac5051e6311282c1e056c852fb1fd721b08`)
- [x] P1-05 Obtain and verify BIOS assets — Verified (`seabios.bin` 128KB & `vgabios.bin` 36KB downloaded and verified)
- [x] P1-06 Create minimal local v86 harness — Verified (`tests/boot/test-v86-boot.mjs` and Vite application harness)
- [x] P1-07 Boot guest to shell — Verified (Booted Tiny Core Linux 17.1; shell reached at `tc@box:~$ `)
- [ ] P1-08 Verify graphical desktop — In Progress (Core CLI edition fully proven; graphical FLWM edition queued for Phase 2)
- [x] P1-09 Verify keyboard and mouse — Verified (PS/2 keyboard scancodes and text forwarding tested with `uname -a`)
- [x] P1-10 Record reproducible configuration and evidence — Verified (Logged in `guest-os.md`, `emulator-integration.md`, `progress.md`)

## Phase 2 — React/emulator integration
- [x] P2-01 Inspect or create React + TypeScript + Vite scaffold — Verified (Created with Tailwind CSS, TypeScript 5.6, Vite 5.4)
- [x] P2-02 Pin v86 dependency/build — Verified (`v86` pinned at `0.5.473`)
- [x] P2-03 Implement emulator manager — Verified (`EmulatorManager.ts` singleton service implemented)
- [x] P2-04 Implement typed state/events — Verified (`types.ts` defining all lifecycle states and listener types)
- [x] P2-05 Render guest output — Verified (`EmulatorDisplay.tsx` with v86 canvas and text mode structure)
- [x] P2-06 Forward keyboard/mouse — Verified (Click-to-focus and lock mouse integration in UI)
- [x] P2-07 Implement lifecycle controls — Verified (`SystemToolbar.tsx` with Start, Stop, Reset, Console, Fullscreen)
- [x] P2-08 Test cleanup and duplicate-instance prevention — Verified (Unit tests in `EmulatorManager.test.ts` pass)

## Phase 3 — Host UI
- [x] P3-01 Welcome screen — Implemented (`WelcomeScreen.tsx` with guest profile and system specs)
- [x] P3-02 Boot/error screen — Implemented (`BootScreen.tsx` with progress bar, diagnostics, error state)
- [x] P3-03 Desktop frame and toolbar — Implemented (`DesktopFrame.tsx` and `SystemToolbar.tsx`)
- [x] P3-04 Fullscreen and input capture/release — Implemented (`lock_mouse`, `screen_go_fullscreen`, Esc release)
- [ ] P3-05 Accessible status and error messages — Ready

## Phase 4 — Guest desktop
- [ ] P4-01 Verify/configure window manager — Backlog
- [ ] P4-02 Verify terminal — Backlog
- [ ] P4-03 Verify file manager — Backlog
- [ ] P4-04 Verify text editor — Backlog
- [ ] P4-05 Configure shortcuts and desktop defaults — Backlog

## Phase 5 — Guest capabilities
- [x] P5-01 Build verified command inventory — Verified (`uname`, `sh`, BusyBox suite confirmed)
- [ ] P5-02 Test file operations — Ready
- [ ] P5-03 Test process operations — Ready
- [ ] P5-04 Test memory/system inspection — Ready
- [ ] P5-05 Test permissions and shell scripts — Ready

## Phase 6 — Persistence
- [ ] P6-01 Prototype v86 snapshot save — Backlog
- [ ] P6-02 Prototype snapshot restore — Backlog
- [ ] P6-03 Measure snapshot size and storage limits — Backlog
- [ ] P6-04 Evaluate persistent disk/9p/Tiny Core backup — Backlog
- [ ] P6-05 Test files across guest reboot — Backlog

## Phase 7 — OS labs and advanced features
- [ ] P7-01 Implement process lab — Backlog
- [ ] P7-02 Implement filesystem lab — Backlog
- [ ] P7-03 Implement memory lab — Backlog
- [ ] P7-04 Implement permissions and scripting labs — Backlog
- [ ] P7-05 Evaluate networking with security review — Backlog

## Phase 8 — Release
- [ ] P8-01 Run regression suite — Backlog
- [ ] P8-02 Test supported browsers — Backlog
- [ ] P8-03 Verify production asset loading and boot — Backlog
- [ ] P8-04 Deploy static application — Backlog
- [ ] P8-05 Prepare instructor demonstration — Backlog
