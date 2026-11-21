# v86 Emulator Integration

## Purpose
v86 provides the emulated x86 PC hardware and runs in the browser using WebAssembly. It is the execution foundation for the real Linux guest.

## Verified Configuration
- **Package:** `v86` @ `0.5.473`
- **Execution Target:** WebAssembly (`v86.wasm` / fallback `v86-fallback.wasm`)
- **Firmware:** SeaBIOS (`seabios.bin`), Cirrus / Bochs VGA BIOS (`vgabios.bin`)
- **Emulated CPU:** x86 32-bit (i686) with SSE3, FPU
- **Memory Allocated:** 128 MB guest RAM (`128 * 1024 * 1024`), 8 MB VGA RAM (`8 * 1024 * 1024`)
- **Boot Media:** CD-ROM ISO (`Core-17.1.iso` / `TinyCore-17.1.iso`)
- **Display Output:** VGA canvas (graphics mode) and monospace text container (text mode)
- **Input:** PS/2 keyboard and mouse forwarding

## Architectural Layering
All emulator interaction is encapsulated within `EmulatorManager.ts`:
1. **Singleton Lifecycle:** Strictly enforces a single emulator instance, preventing duplicate WebAssembly instances during React re-renders or StrictMode lifecycles.
2. **State Machine:** Governs transitions between `idle`, `initializing`, `booting`, `running`, `stopping`, `stopped`, and `error`.
3. **Event Subscriptions:** Decouples emulator-internal events (`emulator-ready`, `screen-set-size`, `download-progress`, `serial0-output-byte`) from React UI components.
4. **Typed Contract:** Adheres directly to `v86.d.ts` types from the official upstream package.

## Verification Evidence (Phase 1)
Boot proof of concept test executed on 2026-11-21 (`tests/boot/test-v86-boot.mjs`):
- **Level 1 (Module Loading):** PASS — `v86` WebAssembly module and JIT loaded.
- **Level 2 (Hardware Initialization):** PASS — 128 MB RAM, CPU, PIC, PIT, and SeaBIOS initialized.
- **Level 3 (Firmware Execution):** PASS — SeaBIOS rel-1.16.2 executed and located boot media.
- **Level 4 (Kernel Bootstrap):** PASS — ISOLINUX loaded `vmlinuz` and `core.gz`. Linux kernel 6.18.35-tinycore initialized udev.
- **Level 5 (Shell Prompt):** PASS — Guest reached usable user shell: `tc@box:~$ `.
- **Level 6 (Command Execution):** PASS — Command `uname -a` executed in guest, returning `Linux box 6.18.35-tinycore #1 SMP Fri Jun 19 00:05:19 UTC 2026 i686 GNU/Linux`.

## References
- https://github.com/copy/v86
- https://copy.sh/v86/
- https://distro.ibiblio.org/tinycorelinux/
