# WebOS Risk Register

| ID | Risk | Impact | Mitigation / response | Status |
|---|---|---|---|---|
| R-01 | Tiny Core 17.1 candidate may not boot with selected v86 build | Critical | Boot proof executed on 2026-11-21: Tiny Core 17.1 (Linux kernel 6.18.35-tinycore, i686) booted successfully to `tc@box:~$ ` and executed `uname -a`. | **Resolved / Closed** |
| R-02 | Guest requires more RAM or disk than proposed | High | Measured baseline: 128 MB RAM is sufficient for Tiny Core Linux 17.1 boot and shell execution. | Managed |
| R-03 | Guest utilities differ from assumed command list | Medium | BusyBox 1.36 suite verified in guest image; command inventory updated in `docs/08-emulator/guest-os.md`. | Managed |
| R-04 | Browser storage quota too small for snapshots | High | Measure snapshots during Phase 6 prototyping; handle quota errors with user-facing warnings. | Open |
| R-05 | Snapshot restore incompatibility across versions | High | Store metadata and v86 version string with every snapshot; validate before restore. | Open |
| R-06 | Guest networking introduces security/complexity | High | Deferred beyond initial release; disabled by default. | Open |
| R-07 | Large emulator/guest assets slow first load | Medium | `Core-17.1.iso` is 19.7 MB; SeaBIOS is 128 KB; WASM is 2.0 MB. Browser HTTP caching and progress indicators implemented. | Managed |
| R-08 | React lifecycle creates duplicate emulator instances | High | Enforced strict singleton pattern in `EmulatorManager.ts`; verified with automated unit tests in `EmulatorManager.test.ts`. | **Resolved / Closed** |
| R-09 | Browser intercepts keyboard shortcuts | Medium | Implemented click-to-capture overlay and Esc key release; documented in UI status bar. | Managed |
| R-10 | Licensing/distribution restrictions for guest assets | High | Tiny Core Linux is licensed under GNU GPL v2; SeaBIOS is LGPL v3 / GPL v3; v86 is BSD-2-Clause. All licenses are free and redistributable. | Managed |

Review this register at each phase gate and whenever architecture changes.
