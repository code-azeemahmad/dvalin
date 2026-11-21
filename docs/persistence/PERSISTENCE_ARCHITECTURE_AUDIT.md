# Persistence Architecture Audit: WebOS & v86 Linux Runtime

**Project:** WebOS — Browser-Hosted x86 Linux Environment  
**Component:** Persistence & System Management Architecture  
**Phase:** Phase 6 — Persistence & System Management  
**Date:** 2026-11-21  
**Status:** Completed & Verified Architecture Audit  

---

## 1. Executive Summary & Audit Mission

WebOS delivers a genuine x86 Linux guest environment (Tiny Core Linux 17.1, Linux kernel 6.18.35-tinycore, i686) running entirely inside client web browsers via the WebAssembly-compiled v86 PC emulator. Unlike toy JavaScript emulators or terminal mocks, WebOS runs a real operating system kernel managing genuine virtual memory, processes, device drivers, and filesystems.

A foundational architectural challenge of running a full Linux OS inside a browser is **session lifecycle and data durability**. When a user refreshes the browser page, closes the browser tab, or experiences a navigation event, all volatile execution state held in JavaScript memory and WebAssembly linear memory is immediately discarded by the browser process. Cold-booting Tiny Core Linux from its ISO image requires 20 to 25 seconds of SeaBIOS initialization, ISOLINUX bootloader decompression, initramfs unpacking, extension mounting, and Xvesa graphical server startup. Furthermore, any files written by the user to `/home/tc`, configuration edits made in `/etc`, or running processes in the guest disappear upon cold boot because Tiny Core's root filesystem is mounted as a volatile in-memory `tmpfs`.

This audit assesses the existing persistence mechanisms across WebOS, identifies the volatility boundaries between host and guest layers, evaluates the native snapshot serialization capabilities of v86, and establishes the formal architectural requirements for Phase 6.

---

## 2. Storage Layers Across WebOS

WebOS operates across five distinct storage layers, each with differing lifecycles, capacities, and persistence guarantees:

```
+-----------------------------------------------------------------------------------------+
|                                    WebOS Storage Hierarchy                             |
+-----------------------------------------------------------------------------------------+
| Layer 1: Host User Preferences                                                          |
|   - Location: Browser localStorage ('webos_settings_v1')                                |
|   - Durability: Permanent across reloads / browser restarts                             |
|   - Content: Wallpaper ID, window scaling, desktop themes, host settings                |
+-----------------------------------------------------------------------------------------+
| Layer 2: IndexedDB Snapshot Storage (Phase 6 Core)                                      |
|   - Location: Browser IndexedDB ('webos_persistence_db' -> 'snapshots')                 |
|   - Durability: Permanent across reloads; quota negotiated with browser engine          |
|   - Content: Serialized v86 VM memory buffers, CPU registers, device state, metadata     |
+-----------------------------------------------------------------------------------------+
| Layer 3: Static Operating System Assets                                                 |
|   - Location: HTTP Web Cache / ServiceWorker Cache Storage                              |
|   - Durability: Reusable across sessions; immutable                                     |
|   - Content: SeaBIOS binary (128 KB), VGA BIOS (36 KB), v86.wasm (2.0 MB), ISO (26.0 MB)   |
+-----------------------------------------------------------------------------------------+
| Layer 4: Active Virtual Machine Execution State                                         |
|   - Location: v86 WebAssembly Linear Memory + JavaScript Heap                           |
|   - Durability: Volatile; destroyed on page reload, navigation, or VM termination       |
|   - Content: 128 MB RAM, CPU registers, EFLAGS, instruction counter, PIC/APIC, PIT     |
+-----------------------------------------------------------------------------------------+
| Layer 5: Guest Linux Operating System Filesystem                                        |
|   - Location: In-Guest tmpfs (RAM-backed rootfs: /, /home/tc, /tmp, /etc)               |
|   - Durability: Purely volatile inside guest RAM; survives snapshot save/restore,      |
|     wiped completely upon guest cold reboot or ISO re-initialization                    |
+-----------------------------------------------------------------------------------------+
```

### 2.1 Layer Details & Characteristics

| Layer | Mechanism | Scope | Latency | Volatility Boundary |
|---|---|---|---|---|
| **Host Preferences** | `localStorage` | Host React UI | < 1 ms | Persists indefinitely unless user clears browser site data. |
| **Snapshot Storage** | `IndexedDB` (`webos_persistence_db`) | Full VM Checkpoints | 15–80 ms read/write | Persists indefinitely across reloads; subject to browser storage quota. |
| **Static Assets** | Browser Cache (`/public/*`) | Immutable Binaries | 5–50 ms | Persists according to HTTP Cache-Control headers. |
| **VM Execution State** | v86 WASM Instance | Virtual x86 Hardware | Nanosecond | **Destroyed upon page refresh or tab close.** |
| **Guest Linux Filesystem**| RAM `tmpfs` | Guest Rootfs & User Files | Nanosecond | **Destroyed on cold boot; preserved inside VM snapshots.** |

---

## 3. Analysis of Existing Prototype & Lifecycle State

### 3.1 Current Emulator Lifecycle (`EmulatorManager.ts`)
The `EmulatorManager` singleton currently coordinates emulator startup, teardown, and basic command execution. In Phase 4, rudimentary `saveState()` and `restoreState()` methods were added to test native v86 serialization:

```typescript
// Prototype in EmulatorManager.ts (Phase 4):
public async saveState(): Promise<ArrayBuffer | null> {
  if (!this.v86Instance || typeof this.v86Instance.save_state !== 'function') return null;
  const state = await this.v86Instance.save_state();
  return state;
}

public async restoreState(state: ArrayBuffer): Promise<boolean> {
  if (!this.v86Instance || typeof this.v86Instance.restore_state !== 'function') return false;
  await this.v86Instance.restore_state(state);
  return true;
}
```

### 3.2 Limitations of the Prototype
1. **Volatile In-Memory Only:** The prototype held the resulting `ArrayBuffer` in JavaScript heap variables. It did not write to IndexedDB, meaning any browser page reload immediately discarded the captured state.
2. **Missing Metadata & Versioning:** The saved state was an untyped binary blob. It did not store creation timestamps, snapshot labels, guest OS identity, or display resolution.
3. **No Hardware Compatibility Verification:** v86 requires exact parity of emulated hardware parameters when restoring states. Restoring a snapshot taken with 128 MB RAM into an instance configured with 64 MB RAM causes unrecoverable memory misalignment and PCI BAR initialization failures in `libv86.mjs`.
4. **No Integrity Checksums:** No SHA-256 hash was generated or verified, creating vulnerability to data corruption during storage or restoration.
5. **No Concurrency / Operation Locks:** Multiple asynchronous operations (e.g. attempting to save while the VM is shutting down or booting) could be invoked simultaneously, corrupting the emulator instance.

---

## 4. Empirical Evaluation of v86 Snapshot Serialization

### 4.1 Native Serialization Mechanism (`save_state`)
Inspection of `node_modules/v86/build/libv86.mjs` reveals how `save_state()` operates:
- The emulator traverses all emulated devices:
  - **CPU:** General-purpose registers (EAX, EBX, ECX, EDX, ESI, EDI, ESP, EBP), segment registers (CS, DS, SS, ES, FS, GS), control registers (CR0, CR2, CR3, CR4), EFLAGS, instruction pointer (EIP), and instruction counter.
  - **Memory:** Scans allocated memory pages. Only non-zero allocated physical pages are serialized, significantly reducing snapshot size relative to total allocated RAM.
  - **Video (Cirrus VGA):** VGA registers, DAC palette, video memory buffer, current mode, text buffer, and cursor coordinates.
  - **Interrupts & Timers:** Programmable Interrupt Controller (PIC 8259), APIC, Programmable Interval Timer (PIT 8254), Real-Time Clock (RTC).
  - **Peripherals:** PCI configuration space, PS/2 keyboard/mouse controllers, floppy controller, IDE/CD-ROM controller, serial port UARTs (COM1/COM2).
- The serialized data is returned as a single contiguous `ArrayBuffer`.
- **Observed Size:** 3,243,796 bytes (~3.24 MB) during initial text-mode boot; 3,309,488 bytes (~3.31 MB) during active Xvesa graphical mode with FLWM desktop.

### 4.2 Native Restoration Mechanism (`restore_state` & `initial_state`)
v86 supports two distinct paths for state restoration:
1. **Live In-Place Restoration (`emulator.restore_state(buffer)`):**
   - Injects the state into an already running emulator instance.
   - Clears existing memory pages, loads the new page map, resets CPU registers, and restores hardware device registers.
2. **Cold Start from State (`new V86({ initial_state: { buffer }, ... })`):**
   - Instantiates a fresh `V86` instance that bypasses the SeaBIOS and bootloader stages entirely.
   - Instantly initializes hardware devices into the saved state and begins execution at the saved EIP.
   - **Boot Time:** Resumes execution in **under 300 ms** compared to 20–25 seconds for cold ISO boot.

### 4.3 Hardware Parity Rule (Crucial Finding)
Through empirical testing in Phase 4 and Phase 5, we confirmed that v86 requires **strict hardware configuration parity** between the snapshot producer and the restoring emulator instance:
```
Producer Configuration  ===  Restoring Configuration
- memory_size (128 MB)       - memory_size (128 MB)
- vga_memory_size (8 MB)     - vga_memory_size (8 MB)
- bios.url                   - bios.url
- vga_bios.url               - vga_bios.url
- wasm_path                  - wasm_path
```
If any hardware parameter diverges, `Jc.set_state` in `libv86.mjs` encounters mismatched PCI bus indexes or array bounds errors (e.g. `TypeError: Cannot read properties of undefined (reading 'original_bar')`).

**Architectural Requirement:** Phase 6 must compute a deterministic `hardwareConfigHash` when saving snapshots and strictly validate this hash before attempting restoration.

---

## 5. Volatility Boundaries & Durability Matrix

To answer the core persistence questions with complete technical truthfulness:

| Scenario | Host Preferences | Snapshot Storage | VM Running State | Guest Files (`/home/tc`) |
|---|---|---|---|---|
| **Page Reload (F5 / Navigation)** | Survives | Survives | Lost | **Lost (unless restored from snapshot)** |
| **Guest Shutdown (`sudo poweroff`)** | Survives | Survives | Terminated | **Lost upon next fresh ISO boot** |
| **Guest Reboot (`sudo reboot`)** | Survives | Survives | Reset | **Lost (ISO boot wipes tmpfs)** |
| **Snapshot Save & Restore** | Survives | Survives | **Preserved** | **Preserved (captured in VM RAM)** |
| **Browser Crash / OOM** | Survives | Survives | Lost | **Lost (unless restored from snapshot)** |
| **User Clears Browser Site Data** | Cleared | Cleared | N/A | Cleared |

### Key Architectural Discovery: Guest Filesystem vs RAM Snapshot
Tiny Core Linux runs entirely from RAM (`tmpfs`). Therefore:
1. When a user creates a file in `/home/tc/document.txt` or `/tmp/output.log`, the file's data blocks and inodes exist **in RAM**.
2. Because `save_state()` serializes the active physical RAM pages, **all user files and filesystem modifications are captured completely within the snapshot!**
3. When the snapshot is restored, the guest filesystem returns exactly to the state it was in when saved.
4. However, a "cold reboot" (re-running SeaBIOS and booting `Core-17.1.iso` from scratch) re-creates an empty `tmpfs` from `core.gz`.

---

## 6. Phase 6 Persistence Architecture Blueprint

To achieve robust, production-grade persistence and system management, Phase 6 implements the following vertical architecture:

```
+-----------------------------------------------------------------------------------------+
|                                Host UI (Presentation Layer)                             |
|  - SettingsApp: "Persistence & Sessions" tab (Quota meter, Snapshots list, Save/Restore)|
|  - StartMenu: Power options (Shutdown, Restart, Save Session)                           |
|  - SystemToolbar: Visual status badges ('Capturing...', 'Restoring...', 'Shutting Down')|
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                               Emulator Lifecycle Service                                |
|  - EmulatorManager.ts: Extended state machine & operation concurrency lock              |
|  - State transitions: idle -> initializing -> booting -> running <-> capturing/restoring|
|  - Graceful ACPI shutdown via guest command dispatch ('sudo poweroff')                  |
|  - Safe restart with distinction between guest reboot, cold reset, and snapshot reload   |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                              Snapshot Storage Subsystem                                 |
|  - SnapshotStorage.ts: High-level management API (CRUD, export/import, quota inspection)|
|  - SnapshotDatabase.ts: IndexedDB wrapper ('webos_persistence_db', store 'snapshots')   |
|  - SnapshotValidation.ts: Web Crypto SHA-256 calculation & hardwareConfigHash generator |
|  - SnapshotErrors.ts: Typed domain errors (QuotaExceeded, HardwareMismatch, ChecksumErr)|
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                Browser Storage Engine                                   |
|  - IndexedDB Object Store with transactional commit guarantees                          |
|  - navigator.storage.estimate() for proactive quota monitoring and eviction warnings    |
+-----------------------------------------------------------------------------------------+
```

---

## 7. Acceptance Criteria for Phase 6
1. **Dedicated Storage Service:** Clean, decoupled IndexedDB service in `src/services/persistence/` with zero React dependencies.
2. **Lifecycle State Machine:** Fully typed states (`capturing`, `restoring`, `shutting-down`, `restarting`) and operation locks in `EmulatorManager.ts`.
3. **Data Integrity & Parity:** Web Crypto SHA-256 verification and deterministic hardware config hashing on every snapshot save and restore.
4. **Browser Reload Recovery Verification:** Automated live test harness (`tests/boot/test-phase6-reload-recovery.mjs`) verifying that a guest file written prior to snapshot survives VM destruction and cold restoration.
5. **Session Management UI:** Intuitive, responsive controls in `SettingsApp.tsx` and toolbar for saving, restoring, exporting, and deleting snapshots, with real-time storage quota inspection.
6. **Zero Mockery:** Absolute adherence to genuine guest execution; no faked snapshot saves or simulated Linux filesystems.
