# Storage Failure Handling & Eviction Mitigation

**Project:** WebOS — Browser-Hosted x86 Linux Environment  
**Component:** Persistence Reliability & Storage Defense  
**Phase:** Phase 6 — Persistence & System Management  
**Date:** 2026-11-21  
**Status:** Completed & Empirically Verified  

---

## 1. Overview & Threat Vectors

IndexedDB persistence in modern web browsers is subject to browser-controlled storage quotas, eviction policies, data corruption, and hardware parity mismatches.

This document details the defense strategies implemented in WebOS Phase 6.

---

## 2. Failure Handling Strategies

### 2.1 Quota Exceeded Defense
- **Risk:** Browser limits storage per origin (typically 60% of available disk space, or tens of gigabytes in modern Chromium/Firefox). If a device has low storage, saving a 3.3 MB snapshot can trigger `QuotaExceededError`.
- **Mitigation:**
  1. Before saving a snapshot, `SnapshotStorage.saveSnapshot()` queries `navigator.storage.estimate()`.
  2. If the snapshot size would exceed available quota, `QuotaExceededError` is thrown early before writing partial records.
  3. The WebOS UI displays a real-time storage quota progress bar in `SettingsApp`.

### 2.2 Storage Eviction Defense
- **Risk:** Browsers may mark an origin's IndexedDB as "best-effort" and evict data under storage pressure.
- **Mitigation:**
  - WebOS supports persistent storage requests via `navigator.storage.persist()`.
  - When granted, the browser will not evict IndexedDB data under routine disk pressure.

### 2.3 Corrupted Buffer / Bit-Rot Defense
- **Risk:** Device power loss during IndexedDB transactions or corrupted storage blocks.
- **Mitigation:**
  1. On every snapshot save, a Web Crypto SHA-256 checksum is calculated and stored in the metadata.
  2. On every snapshot retrieval, `computeSha256(record.data)` recalculates the checksum.
  3. If the checksum does not match, `ChecksumMismatchError` is raised, preventing corrupted bytes from being injected into the v86 emulator.

### 2.4 Hardware Parity Mismatch Defense
- **Risk:** Restoring a snapshot saved with 128 MB RAM into an emulator instance configured with 64 MB RAM causes PCI BAR index crashes in `libv86.mjs`.
- **Mitigation:**
  1. Every snapshot records a canonical `hardwareConfigHash`.
  2. Prior to restoration, `validateHardwareCompatibility(snapshotHash, currentHash)` is enforced.
  3. If incompatible, `HardwareMismatchError` is thrown with descriptive error details.

### 2.5 Snapshot Export & Backup
- **Feature:** Users can export any snapshot as a standalone `.v86` file to their local machine via `exportSnapshot(id)`.
- **Recovery:** Standalone snapshot files can be imported back into WebOS at any time via `importSnapshot(blob)`.
