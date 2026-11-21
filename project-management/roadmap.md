# WebOS Development Roadmap

The project is divided into eight phases. Each phase must produce a testable deliverable.

## Phase 1 — Linux boot proof of concept
- Obtain Tiny Core Linux x86 candidate image.
- Set up v86 and required BIOS assets.
- Boot locally.
- Verify kernel startup and usable shell.
- Verify graphical desktop and input.
- Record exact versions, checksums and configuration.

**Exit gate:** actual guest shell and intended GUI work in v86. This is the critical technical gate.

## Phase 2 — React and emulator integration
- Set up React, TypeScript and Vite.
- Integrate pinned v86 package/build.
- Display guest output.
- Implement start, stop and reset.
- Forward keyboard and mouse.

**Deliverable:** Linux boots from the website.

## Phase 3 — WebOS host interface
- Welcome screen.
- Boot interface.
- Desktop frame.
- System toolbar.
- Fullscreen.
- Emulator status and error states.

**Deliverable:** usable, polished host experience around the real guest.

## Phase 4 — Linux desktop customization
- Customize Tiny Core guest.
- Configure window manager.
- Verify terminal.
- Add/verify file manager and text editor.
- Configure desktop shortcuts.

**Deliverable:** usable guest desktop.

## Phase 5 — CLI and OS capabilities [COMPLETE & VERIFIED]
- Verify BusyBox command inventory (221 compiled applets, 234 symlinks).
- Add/test utilities as appropriate (tree.sh, vi, less, which, unzip).
- Test file operations (creation, append, copy, move, rename, delete, text pipelines).
- Test process management (background jobs &, ps, signals, wait, reaping).
- Test permissions and shell scripting (chmod, umask, execute bit enforcement, ash language constructs).
- Automated guest verification harness (12/12 stages passed in real VM).

**Deliverable:** verified guest CLI capabilities (documented in `docs/cli/`).

## Phase 6 — Persistence and system management [COMPLETE & VERIFIED]
- Implement snapshots (v86 `save_state()` serialized memory capture).
- Implement restore (`initial_state: { buffer }` and in-place `restore_state()`).
- Evaluate persistent disk, tmpfs, and Tiny Core `filetool.sh` backup (`docs/persistence/GUEST_FILESYSTEM_PERSISTENCE.md`).
- Add safe shutdown/restart (graceful ACPI shutdown via `sudo poweroff`, guest reboot via `sudo reboot`, and hardware reset).
- Test browser refresh and guest reload recovery (`tests/boot/test-phase6-reload-recovery.mjs` passed 100%).
- Dedicated IndexedDB snapshot storage service with SHA-256 integrity verification (`src/services/persistence/`).
- Host UI session management dialog, quota meter, and Start Menu power options (`SettingsApp.tsx`, `StartMenu.tsx`, `SystemToolbar.tsx`).

**Deliverable:** recoverable session and empirically verified guest file persistence across browser reload (documented in `docs/persistence/`).

## Phase 7 — OS experiments and advanced features [COMPLETE & VERIFIED]
- Build guided experiments (20 structured labs across Processes, Memory, Filesystem, Permissions, Shell, Kernel, and Devices).
- Educational OS laboratory desktop application (`OS Lab` / `ExperimentsApp`).
- Add process, memory, and boot sequence visualizers (`ExperimentVisualization.tsx`).
- Workspace isolation and command safety verification (`ExperimentSafety.ts` with blocked patterns and delimited markers).
- Real-time bounded resource monitoring separating guest Linux metrics from host browser metrics (`ResourceMonitoringService.ts`).
- 26 unit tests passing in `tests/experiments/` (69 total unit tests passing).
- Live guest verification harness passing 12/12 stages in real VM (`tests/boot/test-phase7-experiments.mjs`).

**Deliverable:** educational OS laboratory (documented in `docs/experiments/`).

## Phase 8 — Testing and deployment [COMPLETE & PRODUCTION READY]
- Clean browser startup and asset loading verified.
- Core command and Linux CLI regression verified.
- GUI/input tests and permanent canvas DOM mounting verified.
- Persistence, snapshot storage, and reload recovery verified (sub-second cold restore).
- Browser compatibility matrix (Chromium, Gecko, WebKit) and API assessments.
- Production static build and deployment configurations (Cloudflare Pages, Netlify, Docker/Nginx).
- Security audit, threat model, nonce marker protocol, and snapshot size boundaries verified.
- User guide, troubleshooting, release notes, and instructor demonstration documentation complete.

**Deliverable:** production-ready WebOS release (v0.8.0).

## Priority rule
Do not begin extensive UI polish before Phase 1 proves the selected guest can boot in v86.
