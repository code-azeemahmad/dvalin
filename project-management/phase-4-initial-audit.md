# WebOS — Phase 4 Initial Project & Guest Environment Audit

**Date:** 2026-11-21  
**Author:** Lead Software Architect & Systems Engineer  
**Status:** Complete  
**Scope:** Architecture inspection, Phase 3 exit verification audit, guest environment deep-dive, and Phase 4 implementation strategy.

---

## 1. Existing Architecture & Repository State

WebOS currently runs on Git commit `aa94fe2` (Phase 3 completion). The architecture maintains a strict, uncompromised separation between the host web platform and the guest x86 virtual machine:

### 1.1 Host Environment
- **Framework:** React 18.3 with TypeScript 5.6, bundled via Vite 5.4 with COOP/COEP isolation headers.
- **Styling:** Tailwind CSS with modern custom tokens (glassmorphism, slate/midnight palettes, Lucide icons).
- **Desktop Shell & Window Manager:** Centralized `WindowContext.tsx` managing viewport-clamped drag, bottom-right resize, minimize, maximize, restore, dynamic z-indexing, and permanent DOM mounting to preserve v86 canvas bindings.
- **Host Applications:**
  - `LinuxDesktopApp.tsx`: Frames the live guest VGA screen with hardware toolbar (resolution badge, mouse lock, fullscreen, hardware reset, shutdown).
  - `TerminalApp.tsx`: Interactive command bridge to Tiny Core Linux with history navigation, clear, help, and serial feedback.
  - `SettingsApp.tsx`: Host wallpaper selection and display scaling persisted to browser `localStorage` via `useSettings.ts`.
  - `AboutApp.tsx`: Architectural specs, emulation parameters, and open-source licenses.
- **Desktop Infrastructure:** `Taskbar.tsx`, `StartMenu.tsx`, `SystemTray.tsx` (live clock, status indicator, fullscreen toggle), `DesktopIcons.tsx`, and `DesktopWallpaper.tsx`.

### 1.2 Guest Virtual Machine Environment
- **Virtual PC Hardware:** `v86` version `0.5.473` compiled to WebAssembly running inside the browser with 128 MB RAM, 8 MB Cirrus VGA BIOS, SeaBIOS rel-1.16.2, and PS/2 keyboard/mouse controllers.
- **Guest Operating System:** Tiny Core Linux 17.1 (i686 architecture, Linux kernel 6.18.35-tinycore, BusyBox 1.36.1 userland).
- **ISO Boot Media:**
  - `Core-17.1.iso` (19.7 MB): Lean CLI environment for direct shell tasks.
  - `TinyCore-17.1.iso` (26.0 MB): Full graphical desktop with Xvesa framebuffer at `1024x768 @ 32bpp`, FLWM window manager, and wbar application dock.

---

## 2. Verified Phase 3 Functionality

The following functionality was verified with recorded test evidence at the conclusion of Phase 3:
1. **Window Management:**
   - Multi-window stacking and focus arbitration via `zIndex`.
   - Window drag with boundary clamping to viewport dimensions.
   - Resize from bottom-right handle respecting `minSize` (480×320).
   - Minimize, maximize, restore, and close transitions.
   - **Zero Canvas Teardown:** `DesktopWindow` employs CSS display toggling (`display: isOpen && !isMinimized ? 'flex' : 'none'`), ensuring the `#v86-screen-container` DOM element is never unmounted, detached, or reconstructed.
2. **Settings Persistence:**
   - Wallpaper choice and display scaling factor saved to `localStorage['webos_host_settings']`.
   - Dynamic real-time preview and scaling transformation on `#root`.
3. **Automated Test Suite:**
   - 19/19 passing tests in Vitest across `EmulatorManager.test.ts` (12), `WindowContext.test.tsx` (4), and `useSettings.test.tsx` (3).
   - Production bundle built cleanly via `npm run build` with zero TypeScript errors.

---

## 3. Unverified Phase 3 Claims & Gap Analysis

While Phase 3 established a robust host desktop shell and framed the guest display, several deeper guest-integration capabilities remain unverified or require implementation in Phase 4:
1. **Guest Application Launch Bridge:** Host application launcher (`StartMenu.tsx` / `DesktopIcons.tsx`) currently only opens host window frames (`linux-desktop`, `terminal`, `settings`, `about`). It cannot yet trigger the launch of specific genuine Linux applications (`aterm`, `editor`, `cpanel`) directly inside the guest X11 display.
2. **FLWM Window Manager Configuration:** The behavior of the guest FLWM window manager (window borders, title bars on left vs top, `.wmx` menu generation, keyboard navigation) has not been documented or tailored for optimal browser interaction.
3. **Structured Guest Command Channel:** While `TerminalApp.tsx` forwards keystrokes to the guest, WebOS lacks a structured diagnostic/execution harness to run multi-command inspection scripts, parse exit codes, and stream stdout/stderr reliably without human typing.
4. **Lab Execution Infrastructure:** Educational operating system labs (process inspection, memory hierarchy, filesystem navigation, permission models) require automated guest shell scripts and structured JSON/text output formats in `guest/scripts/`.
5. **v86 Snapshot Save/Restore Capabilities:** Although `v86` exports `save_state()` and `restore_state()`, their serialization performance, memory overhead, and browser storage feasibility for Phase 6 persistence have not been formally evaluated or verified.

---

## 4. Deep Inspection of Tiny Core Linux 17.1 Guest Environment

Direct inspection of `public/assets/linux/TinyCore-17.1.iso` reveals the exact internal composition of the guest system:

### 4.1 ISO & CDE Package Inventory
The ISO contains `/CDE/OPTIONAL/` with 27 SquashFS extensions (`.tcz`) loaded on boot via `/CDE/ONBOOT.LST`:
- **Core X11 & Graphics:** `Xvesa.tcz`, `Xlibs.tcz`, `libX11.tcz`, `libXext.tcz`, `libXcursor.tcz`, `libXfixes.tcz`, `libXfont.tcz`, `libXmu.tcz`, `libXrender.tcz`, `libXt.tcz`, `libICE.tcz`, `libSM.tcz`, `libxcb.tcz`, `libXau.tcz`, `libXdmcp.tcz`, `libfontenc.tcz`.
- **UI Toolkits & Graphics Libraries:** `fltk-1.3.tcz`, `imlib2.tcz`, `imlib2-bin.tcz`, `libjpeg-turbo.tcz`, `libpng.tcz`, `freetype.tcz`, `bzip2-lib.tcz`.
- **Window Management & Desktop:** `flwm.tcz` (Fast Light Window Manager), `wbar.tcz` (desktop icon launcher dock).
- **Core Applications & Utilities:**
  - `aterm.tcz`: High-performance terminal emulator (`/usr/local/bin/aterm`, symlinked as `xterm`).
  - `Xprogs.tcz`: Tiny Core control utilities (`/usr/local/bin/editor`, `/usr/local/bin/cpanel`, `/usr/local/bin/apps`, `/usr/local/bin/mnttool`, `/usr/local/bin/services`, `/usr/local/bin/flrun`, `/usr/local/bin/exittc`, `/usr/local/bin/wallpaper`, `/usr/local/bin/stats`).

### 4.2 Guest Initialization Sequence
1. **Bootloader:** ISOLINUX loads `vmlinuz` and `core.gz` initramfs.
2. **Kernel Init:** Linux 6.18 boots, mounts rootfs in RAM (tmpfs), executes `/etc/init.d/rcS`.
3. **Extension Mounting:** `tce-load` reads `/cde/onboot.lst` and loop-mounts all `.tcz` packages to `/tmp/tcloop/<ext>/` and symlinks them into `/usr/local/`.
4. **Shell Profile:** `/etc/skel/.profile` is executed for login user `tc`:
   - Sets `export FLWM_TITLEBAR_COLOR="58:7D:AA"`
   - Creates `/run/user/1001` (XDG runtime dir)
   - If running on a virtual console (`tty`), invokes `/usr/local/bin/startx`.
5. **X11 Initialization (`startx` & `setupdesktop`):**
   - Configures `DISPLAY=:0.0` and `.Xauthority`.
   - Reads `/etc/sysconfig/desktop` (`flwm`) and `/etc/sysconfig/icons` (`wbar`).
   - Invokes `flwm_initmenu`, which parses `/usr/local/share/applications/tinycore-*` and builds `/home/tc/.wmx/SystemTools/`.
   - Executes `~/.xsession`.
6. **Session Startup (`~/.xsession`):**
   - Starts Xvesa: `Xvesa -br -screen 1024x768x32 -shadow -2button -mouse /dev/input/mice,5 -nolisten tcp -I >/dev/null 2>&1 &`
   - Awaits X server readiness (`waitforX`).
   - Starts window manager: `flwm 2>/tmp/wm_errors &`
   - Starts background setter: `~/.setbackground`
   - Starts application dock: `wbar.sh &`
   - Executes user startup scripts in `/usr/local/etc/X.d/` and `~/.X.d/`.

---

## 5. Phase 4 Workstreams & Implementation Plan

### Workstream A: FLWM Window Manager Configuration
- **Objective:** Document and optimize FLWM interaction inside the WebOS guest display.
- **Deliverables:**
  - Document FLWM window operations (placement, focus, minimize/maximize buttons, title bar color, shortcuts) in `docs/emulator/flwm-configuration.md`.
  - Verify mouse pointer interaction and keyboard window management shortcuts.

### Workstream B: Guest Application Discovery & Inventory
- **Objective:** Establish a formal catalog of genuine Linux applications embedded within the guest image.
- **Deliverables:**
  - Catalog `aterm`, `editor`, `cpanel`, `apps`, `mnttool`, `services`, `flrun` in `docs/emulator/guest-application-inventory.md`.
  - Detail executable paths, desktop files, package origins, CLI parameters, and dependencies for each.

### Workstream C: Host-Guest Application Launching & Shortcut Architecture
- **Objective:** Allow WebOS host desktop UI (Start Menu, Desktop Icons) to trigger confirmed guest applications inside the guest X11 display.
- **Deliverables:**
  - Create a safe guest command dispatch mechanism in `EmulatorManager` (`launchGuestApp(command: string)`).
  - Update `appRegistry.ts` with typed guest application entries (`aterm`, `editor`, `cpanel`) with launch commands (`DISPLAY=:0 aterm &`, `DISPLAY=:0 editor &`, `DISPLAY=:0 cpanel &`).
  - Wire host Start Menu and Desktop Icons so clicking a guest application brings the Linux Desktop window to focus and dispatches the execution command to the guest.
  - Document in `docs/emulator/guest-command-channel.md`.

### Workstream D: Educational OS Lab Execution Foundation
- **Objective:** Lay the ground structure for modular, automated operating system inspection and lab exercises.
- **Deliverables:**
  - Create `guest/scripts/diagnostics/` and `guest/scripts/labs/`.
  - Implement reusable guest inspection scripts:
    - `sysinfo.sh`: Hardware, kernel, architecture, and uptime inspection.
    - `procs.sh`: Process tree, PID status, and resource consumption.
    - `meminfo.sh`: Virtual memory breakdown, buffers, cache, and swap.
    - `fsinfo.sh`: Mounted filesystems, loop mounts, inode usage, and storage.
  - Document the lab execution architecture in `docs/labs/guest-lab-execution-architecture.md`.

### Workstream E: v86 Snapshot Persistence Research
- **Objective:** Investigate `v86`'s snapshot save/restore mechanism for Phase 6 storage persistence.
- **Deliverables:**
  - Inspect `save_state()` and `restore_state()` in `node_modules/v86/build/libv86.mjs`.
  - Implement a verification test harness to record serialization size, time, and restoration viability.
  - Document architectural findings, compression recommendations (zstd / lz4), and IndexedDB storage strategy in `docs/architecture/v86-snapshot-persistence-design.md`.

---

## 6. Success Criteria & Verification Evidence

1. **Clean Baseline:** Zero test regressions; existing 19 tests continue to pass.
2. **Genuine Application Integration:** Host registry recognizes guest applications (`aterm`, `editor`, `cpanel`) with real Linux launch commands, cleanly demarcated from host React applications.
3. **Documented Engineering Truth:** All five new technical documents authored with explicit verified/unverified labeling.
4. **Lab Script Suite:** Production-ready diagnostic shell scripts with structured output formats ready for Phase 5 curriculum integration.
5. **Snapshot Prototype:** Working Node/v86 snapshot test demonstrating VM state serialization.
