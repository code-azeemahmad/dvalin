# v86 Snapshot Persistence Architecture & Design

**Date:** 2026-11-21  
**Status:** Architecture Design & Verified Prototype (Targeted for Phase 6)  
**Scope:** Memory serialization, IndexedDB storage, fast boot checkpoints, and hardware parity.

---

## 1. Executive Summary & Objective

In WebOS, booting Tiny Core Linux 17.1 cold from an ISO image involves:
1. Downloading the 26.0 MB ISO and 2.0 MB WASM engine.
2. Initializing SeaBIOS and virtual PCI buses (~1s).
3. Executing ISOLINUX bootloader and decompressing the Linux kernel (~4s).
4. Unpacking `core.gz` initramfs into RAM and executing `/etc/init.d/rcS` (~8s).
5. Loop-mounting 27 SquashFS packages from `/cde/optional/` (~5s).
6. Starting Xvesa, FLWM, and wbar (~4s).

Total cold boot time is approximately **20–25 seconds**.

**The Phase 6 Persistence Goal:** Enable instantaneous (< 500 ms) resumption of an already-booted Linux desktop session and preserve user files/workspace state across browser reloads using v86 memory snapshots.

---

## 2. Empirical Verification Findings

During Phase 4 research, the `v86` snapshot mechanism was tested directly against `node_modules/v86/build/libv86.mjs` in Node.js.

### 2.1 Serialization Capabilities
- **API Call:** `await emulator.save_state()`
- **Result:** Resolves to a native JavaScript `ArrayBuffer`.
- **Content:** Serializes the complete x86 CPU register state, EFLAGS, instruction counter, physical RAM pages, Cirrus VGA framebuffer, PIC/APIC interrupt controllers, PIT timers, and PCI bus configuration.
- **Observed Size:** 3,243,796 bytes (~3.24 MB) at initial boot; 3,309,488 bytes (~3.31 MB) during active graphical mode.

### 2.2 Restoration Constraints & Discovery
When calling `emulator.restore_state(state)` or providing `initial_state: { buffer: state }` during VM instantiation:
> **Critical Parity Rule:** The target `V86` constructor must be instantiated with **identical hardware options** (`memory_size`, `vga_memory_size`, `bios`, `vga_bios`) as the instance that produced the snapshot.

If hardware options diverge (for example, omitting `vga_bios`), the PCI device array and BAR (Base Address Register) count differ from the serialized state, causing a `TypeError: Cannot read properties of undefined (reading 'original_bar')` in `libv86.mjs`. When identical options were supplied, restoration succeeded cleanly with full VM resumption.

---

## 3. Phase 6 Storage Architecture

```
+--------------------------------------------------------------------------+
| Browser Storage Layer (IndexedDB: 'webos_snapshots')                     |
|                                                                          |
|  Object Store: 'snapshots'                                               |
|  Key: snapshot_id (e.g. 'golden_master_flwm' or 'user_session_latest')   |
|  Value: {                                                                |
|    id: string,                                                           |
|    name: string,                                                         |
|    timestamp: number,                                                    |
|    uncompressedSize: number,                                             |
|    compressedSize: number,                                               |
|    configHash: string,                                                   |
|    data: Blob / ArrayBuffer                                              |
|  }                                                                       |
+-----------------------------------|--------------------------------------+
                                    |
                         Compression Pipeline
                                    |
+-----------------------------------v--------------------------------------+
| In-Memory WASM Compression (zstd / lz4-wasm)                             |
|  - Compresses sparse RAM pages with > 65% ratio                          |
|  - Typical 128 MB VM footprint compresses to ~18-25 MB                   |
+-----------------------------------|--------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| v86 Virtual Machine Instance                                             |
|  - Instantiated with initial_state: { buffer: decompressedBuffer }       |
|  - Resumes execution within 300 ms without cold boot sequence            |
+--------------------------------------------------------------------------+
```

---

## 4. Checkpoint Strategy

WebOS will support two tiers of snapshots:

### 4.1 "Golden Master" Checkpoint (Pre-Booted Desktop)
- Captured once when Tiny Core Linux reaches the fully initialized FLWM desktop with Xvesa running at `1024x768 @ 32bpp`.
- Bundled as an optional pre-seeded asset (`public/assets/snapshots/flwm-desktop-checkpoint.v86`).
- When available, the browser loads this checkpoint directly instead of cold-booting from the ISO, dropping boot time from 25 seconds to under 1 second.

### 4.2 User Session Snapshots
- Captured when the user clicks "Save Session" in the WebOS toolbar or automatically on page unload (`beforeunload` event).
- Stored locally in the user's browser IndexedDB.
- Enables persistent modification of `/home/tc`, user files, shell history, and running applications without modifying the read-only ISO filesystem.

---

## 5. Security & Isolation Boundaries

1. **Host-Guest Boundary Preservation:** Snapshots represent opaque guest memory buffers. No host browser data (cookies, localStorage, auth tokens) can leak into guest memory unless deliberately injected.
2. **Quota & Storage Eviction:** IndexedDB handles quota negotiation automatically with modern browser engines (typically up to 60% of available disk space).
3. **Integrity Verification:** A SHA-256 checksum and hardware configuration hash will validate snapshot compatibility before restoration. If hardware configuration changes (e.g. user changes allocated RAM from 128 MB to 256 MB), the snapshot is marked invalid and a fresh cold boot is performed.
