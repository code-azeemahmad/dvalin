# Architecture Rules

- Maintain two explicit environments: browser host and emulated Linux guest.
- Host UI: React + TypeScript. Hardware emulation: v86/WebAssembly. OS behaviour: guest Linux.
- Never reimplement kernel responsibilities in React.
- Never present a host-side mock terminal as the guest's real shell.
- Centralize v86 instance creation, lifecycle, events and teardown.
- Define and type the boundary between UI components and emulator services.
- Do not add a backend unless a documented requirement makes it necessary.
- Document and review changes to guest image, emulator, persistence, networking or host/guest integration.
