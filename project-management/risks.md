# WebOS Risk Register

| ID | Risk | Impact | Mitigation / response | Status |
|---|---|---|---|---|
| R-01 | Tiny Core 17.1 candidate may not boot with selected v86 build | Critical | Boot proof executed on 2026-11-21: Tiny Core 17.1 (Linux kernel 6.18.35-tinycore, i686) booted successfully to `tc@box:~$ `, executed all commands, and initialized Xvesa @ 1024x768 32bpp. | **Resolved / Closed** |
| R-02 | Guest requires more RAM or disk than proposed | High | Measured baseline: 128 MB RAM is sufficient for both Tiny Core CLI and graphical FLWM/Xvesa desktop. | **Resolved / Closed** |
| R-03 | Guest utilities differ from assumed command list | Medium | BusyBox 1.36 suite verified in guest image; command inventory updated in `docs/08-emulator/guest-os.md`. | Managed |
| R-04 | Browser storage quota too small for snapshots | High | Measured in Phase 6: active graphical VM snapshot is ~90.97 MB; storage quota inspection via `navigator.storage.estimate()` implemented in `SnapshotStorage.ts` with proactive QuotaExceeded defense and UI meter. | **Resolved / Closed** |
| R-05 | Snapshot restore incompatibility across versions or hardware | High | Implemented canonical `computeHardwareConfigHash()` and strict validation in `EmulatorManager.ts`. Incompatible hardware configurations throw `HardwareMismatchError` and are flagged in the UI. | **Resolved / Closed** |
| R-06 | Guest networking introduces security/complexity | High | Deferred beyond initial release; disabled by default. | Open |
| R-07 | Large emulator/guest assets slow first load | Medium | `Core-17.1.iso` (19.7 MB) and `TinyCore-17.1.iso` (26.0 MB) load with browser caching and progress indicators. | Managed |
| R-08 | React lifecycle creates duplicate emulator instances | High | Enforced strict singleton pattern in `EmulatorManager.ts`; verified with 12 automated unit tests in `EmulatorManager.test.ts`. | **Resolved / Closed** |
| R-09 | Browser intercepts keyboard shortcuts | Medium | Implemented click-to-capture overlay and Esc key release; scoped keyboard focus strictly to active window. | **Resolved / Closed** |
| R-10 | Licensing/distribution restrictions for guest assets | High | Tiny Core Linux is licensed under GNU GPL v2; SeaBIOS is LGPL v3 / GPL v3; v86 is BSD-2-Clause. All licenses are free and redistributable. | Managed |
| R-11 | Window minimization or closure unmounts v86 canvas | High | Implemented permanent DOM mounting pattern in `DesktopWindow.tsx`: windows toggle `display: none`, keeping the v86 canvas and WebAssembly runtime active without restarts. | **Resolved / Closed** |

Review this register at each phase gate and whenever architecture changes.
