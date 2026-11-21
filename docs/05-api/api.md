# Emulator Integration API — WebOS

## Important
The initial WebOS design has no application backend and no public REST API. This document specifies the internal frontend-to-emulator boundary. Exact method names and event types must be confirmed against the pinned v86 version and its TypeScript definitions.

## Proposed service responsibilities
`EmulatorManager` owns one v86 instance and exposes controlled operations to the React application.

Conceptual operations:
- `initialize(configuration)`
- `start()`
- `stop()` / `destroy()`
- `reset()`
- `getStatus()`
- `subscribe(listener)`
- `saveState()`
- `restoreState(snapshot)`

These are conceptual names, not guaranteed v86 method names.

## Event categories
- Emulator initialized
- Guest boot started
- Guest output / display updated
- Emulator paused or resumed, if supported/configured
- Guest error or emulator error
- Snapshot save/restore completed or failed

Map actual upstream events into stable application-level events.

## Configuration
The configuration must identify:
- BIOS and VGA BIOS assets
- Guest boot media (disk, CD-ROM, kernel/initrd as appropriate)
- Memory and hardware settings supported by v86
- Display container
- Optional filesystem configuration
- Autostart policy

Do not copy example configurations blindly; validate each property against the pinned v86 API.

## Guest command interface
Primary command execution happens through the actual guest terminal and emulated keyboard. If a future serial terminal is added, it must be connected to a genuine guest serial console. Do not implement a JavaScript command interpreter pretending to be Linux.

## Error model
Normalize errors for:
- Missing or inaccessible assets
- Unsupported configuration
- Initialization failure
- Guest boot failure or timeout
- Snapshot serialization failure
- Browser storage quota failure
- Restore incompatibility/corruption
- Unexpected emulator termination

Expose safe, actionable messages without leaking internal secrets or sensitive browser data.
