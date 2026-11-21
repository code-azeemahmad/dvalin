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

## Phase 5 — CLI and OS capabilities
- Verify BusyBox command inventory.
- Add/test utilities as appropriate.
- Test file operations.
- Test process management.
- Test permissions and shell scripting.

**Deliverable:** verified guest CLI capabilities.

## Phase 6 — Persistence and system management
- Implement snapshots.
- Implement restore.
- Evaluate persistent disk or 9p.
- Add safe shutdown/restart.
- Test browser refresh and guest reboot behaviour.

**Deliverable:** recoverable session and separately verified file persistence if achieved.

## Phase 7 — OS experiments and advanced features
- Build guided experiments.
- Add OS documentation.
- Add process/memory demonstrations.
- Evaluate optional networking.
- Test package management where configured.

**Deliverable:** educational OS laboratory.

## Phase 8 — Testing and deployment
- Clean browser startup.
- Core command tests.
- GUI/input tests.
- Persistence tests.
- Browser compatibility.
- Deployment.
- Instructor demonstration preparation.

**Deliverable:** deployed WebOS release.

## Priority rule
Do not begin extensive UI polish before Phase 1 proves the selected guest can boot in v86.
