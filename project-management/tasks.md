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
- [x] P1-08 Verify graphical desktop — Verified (Booted `TinyCore-17.1.iso` into genuine Xvesa + FLWM desktop at 1024x768 @ 32bpp)
- [x] P1-09 Verify keyboard and mouse — Verified (PS/2 keyboard scancodes and text forwarding tested with `uname -a`, `pwd`, `ls`, `cat /etc/os-release`)
- [x] P1-10 Record reproducible configuration and evidence — Verified (Logged in `guest-os.md`, `emulator-integration.md`, `progress.md`)

## Phase 2 — React/emulator integration
- [x] P2-01 Inspect or create React + TypeScript + Vite scaffold — Verified (Created with Tailwind CSS, TypeScript 5.6, Vite 5.4, COOP/COEP headers)
- [x] P2-02 Pin v86 dependency/build — Verified (`v86` pinned at `0.5.473`)
- [x] P2-03 Implement emulator manager — Verified (`EmulatorManager.ts` singleton service implemented with prompt detection & lifecycle management)
- [x] P2-04 Implement typed state/events — Verified (`types.ts` defining all lifecycle states and listener types)
- [x] P2-05 Render guest output — Verified (`EmulatorDisplay.tsx` with v86 canvas, monospace text mode, click-to-focus, and Esc release)
- [x] P2-06 Forward keyboard/mouse — Verified (Click-to-focus, mouse lock, and keyboard forwarding to v86 emulator)
- [x] P2-07 Implement lifecycle controls — Verified (`SystemToolbar.tsx` with Start, Stop, Reset, Console, Fullscreen)
- [x] P2-08 Test cleanup and duplicate-instance prevention — Verified (12 unit tests passing in `EmulatorManager.test.ts`)

## Phase 3 — Host UI & Desktop Environment
- [x] P3-01 Desktop workspace & wallpaper — Verified (`DesktopShell.tsx`, `DesktopWallpaper.tsx`, 4 selectable ambient themes)
- [x] P3-02 Host window manager — Verified (`WindowContext.tsx`, `DesktopWindow.tsx`: drag, resize, minimize, maximize, restore, bounds clamping)
- [x] P3-03 Taskbar & system tray — Verified (`Taskbar.tsx`, `SystemTray.tsx`: Start button, running window tabs, local clock, status badge, fullscreen)
- [x] P3-04 Application launcher — Verified (`StartMenu.tsx`: search filter, categorized apps, quick VM controls)
- [x] P3-05 Real Linux guest window — Verified (`LinuxDesktopApp.tsx`: permanent DOM container preservation, live v86 canvas)
- [x] P3-06 Interactive guest terminal — Verified (`TerminalApp.tsx`: genuine guest command bridge, history navigation, real output)
- [x] P3-07 System settings & persistence — Verified (`SettingsApp.tsx`, `useSettings.ts`: wallpaper, scaling, localStorage persistence)
- [x] P3-08 System overview & licenses — Verified (`AboutApp.tsx`: architecture diagram, kernel specs, license attribution)
- [x] P3-09 Unit & component test coverage — Verified (19/19 tests passing across WindowContext, useSettings, and EmulatorManager)

## Phase 4 — Guest desktop & Application Integration
- [x] P4-01 Verify/configure window manager — Verified (FLWM window manager documented, title bar format, .wmx menu generation, in `docs/emulator/flwm-configuration.md`)
- [x] P4-02 Verify terminal — Verified (`aterm` binary verified in `aterm.tcz`, command channel launch configured)
- [x] P4-03 Verify file manager & system apps — Verified (`cpanel`, `mnttool`, `services` cataloged from `Xprogs.tcz` in `docs/emulator/guest-application-inventory.md`)
- [x] P4-04 Verify text editor — Verified (`editor` FLTK graphical editor verified in `Xprogs.tcz`, registered in `appRegistry.ts`)
- [x] P4-05 Configure shortcuts and desktop defaults — Verified (Host-to-guest command dispatch via `EmulatorManager.launchGuestApp`, dual-channel architecture in `docs/emulator/guest-command-channel.md`)
- [x] P4-06 Educational lab & diagnostic foundations — Verified (`guest/scripts/diagnostics/` and `guest/scripts/labs/` implemented, `labs.json` manifest verified)

## Phase 5 — Guest capabilities
- [x] P5-01 Build verified command inventory — Verified (`uname`, `sh`, BusyBox suite confirmed)
- [ ] P5-02 Test file operations — Ready
- [ ] P5-03 Test process operations — Ready
- [ ] P5-04 Test memory/system inspection — Ready
- [ ] P5-05 Test permissions and shell scripts — Ready

## Phase 6 — Persistence
- [x] P6-01 Prototype v86 snapshot save — Verified Prototype (Verified in Node; `emulator.save_state()` exports ~3.31 MB ArrayBuffer)
- [x] P6-02 Prototype snapshot restore — Verified Prototype (Verified in Node; `initial_state: { buffer }` restores with hardware parity)
- [x] P6-03 Measure snapshot size and storage limits — Verified Prototype (Measured 3.24MB-3.31MB; documented in `docs/architecture/v86-snapshot-persistence-design.md`)
- [ ] P6-04 Evaluate persistent disk/9p/Tiny Core backup — Ready
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
