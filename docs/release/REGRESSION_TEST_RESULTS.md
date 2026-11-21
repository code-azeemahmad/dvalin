# WebOS — Comprehensive Regression Test Results

**Date:** November 21, 2026  
**Environment:** Linux 6.8.0-1018-gcp, Node.js v20.x, x86 v86 0.5.473, Tiny Core Linux 17.1 (i686), Linux Kernel 6.18.35-tinycore  
**Scope:** Full regression test across all eight phases of WebOS.  
**Branch:** `phase-8-production-readiness`  
**Overall Result:** **ALL REGRESSION CRITERIA VERIFIED (100% Pass)**

---

## 1. Regression Test Summary

| Test Category | Suite / Harness | Tests / Stages | Result | Evidence File |
|---|---|---|---|---|
| **Unit Tests** | Vitest (`npm test -- --run`) | 71 / 71 | **PASS** | Console log / Vitest runner |
| **Type Integrity** | TypeScript (`npx tsc --noEmit`) | 0 errors | **PASS** | TypeScript compiler |
| **Production Build** | Vite (`npm run build`) | Bundle created | **PASS** | `dist/` bundle assets |
| **Server & Assets** | `tests/e2e/test-production-server.mjs` | 5 / 5 | **PASS** | Console log / HTTP inspection |
| **Phase 1 & 2 Boot** | `tests/boot/test-v86-boot.mjs` | Verified | **PASS** | SeaBIOS, ISOLINUX, kernel bootstrap |
| **Phase 5 CLI** | `tests/boot/test-phase5-verification.mjs` | 12 / 12 | **PASS** | `docs/cli/verification-results.md` |
| **Phase 6 Recovery**| `tests/boot/test-phase6-reload-recovery.mjs`| 6 / 6 | **PASS** | Console log (sub-second resume) |
| **Phase 7 OS Lab** | `tests/boot/test-phase7-experiments.mjs` | 12 / 12 | **PASS** | Console log (12 stages in live VM) |

---

## 2. Unit Test Suite Breakdown (71 Tests Passing)

### 2.1 Experiment Subsystem (26 Tests)
- `tests/experiments/ExperimentRegistry.test.ts` (7 tests): Registry singleton, category filtering, difficulty indexing, search, definition validation.
- `tests/experiments/ExperimentSafety.test.ts` (8 tests): Blocked pattern detection (`rm -rf /`, `mkfs`, fork bomb, raw device writes, poweroff), workspace path resolution, delimited marker wrapping with unique nonces, scoped cleanup commands, ANSI control sequence stripping.
- `tests/experiments/ExperimentProgress.test.ts` (6 tests): LocalStorage progress persistence, step completion tracking, quiz answer tracking, category statistics, experiment resets.
- `tests/experiments/ExperimentRunner.test.ts` (5 tests): Exit code matching, required string matching (`contains`), forbidden string validation (`not-contains`), regex matching, educational simulation handling.

### 2.2 Persistence Subsystem (11 Tests)
- `tests/persistence/SnapshotStorage.test.ts` (11 tests):
  - Singleton guarantee.
  - Canonical hardware configuration hash determinism.
  - Snapshot saving and retrieval with Web Crypto SHA-256 verification.
  - Checksum mismatch corruption detection.
  - Missing ID rejection.
  - Chronological snapshot listing (newest first).
  - Snapshot deletion.
  - Storage quota calculation and usage tracking.
  - Blob export and import serialization.
  - **Oversized snapshot rejection (`MAX_SNAPSHOT_BYTES` ceiling).**
  - **Snapshot name length truncation (100 characters max).**

### 2.3 Emulator Core & Desktop Subsystem (34 Tests)
- `tests/emulator/EmulatorManager.test.ts` (17 tests): State machine transitions, listener notifications, double boot prevention, stop and restart, error recovery, guest application registration, snapshot capturing/restoring locks, graceful shutdown and restart.
- `tests/desktop/WindowContext.test.tsx` (5 tests): Window creation, minimize, maximize, restore, z-index focus stacking.
- `tests/desktop/useSettings.test.tsx` (3 tests): LocalStorage theme persistence, display scaling adjustments.
- `tests/desktop/appRegistry.test.ts` (3 tests): App registration, category filtering, launch resolution.
- `tests/cli/guestScripts.test.ts` (3 tests): CLI script inventory and existence.
- `tests/labs/labScripts.test.ts` (3 tests): Lab definitions and manifest verification.

---

## 3. Real Guest VM Live Harnesses

### 3.1 Phase 6 Reload Recovery Test
- Unique proof token generated: `PHASE6_TOKEN_1795250767549_SURVIVED_RELOAD`.
- Booted Instance 1; reached `tc@box:~$`.
- Wrote proof token to `/home/tc/session_proof.txt`.
- Captured state via `save_state()`: 90,920,536 bytes (86.71 MB) in **497 ms**.
- SHA-256: `b7ac2123c17a2193670204d5dce2cbc661d76d04973ad8fadc6ec659f245521b`.
- Destroyed Instance 1 completely.
- Cold-booted Instance 2 with initial state buffer.
- Instance 2 resumed in **969 ms**.
- Verified exact token presence in restored guest filesystem. Result: **100% PASS.**

### 3.2 Phase 7 Live OS Experiments Test
- 12 / 12 stages verified on live Linux guest:
  1. `uname -a` (Linux kernel `6.18.35-tinycore` and `i686` architecture).
  2. `/proc/cpuinfo` and `/proc/uptime` inspection.
  3. Process inspection via `echo $$` and `ps`.
  4. Parent/child process lifecycle with `sleep 1 &` and `wait $CHILD`.
  5. Signal handling with custom POSIX shell `trap` and `kill -15`.
  6. Memory inspection via `/proc/meminfo` (`MemTotal`) and `free`.
  7. Directory hierarchy creation in `/tmp/webos-experiments/`.
  8. Inode numbers and hard links verification (`ls -i`, `ln`).
  9. File permissions DAC enforcement (`chmod 755`).
  10. Shell scripting iteration loops (`for i in A B C`).
  11. Multi-stage pipelines with sorting and filtering (`sort -n | tr -d '\n'`).
  12. Workspace cleanup safety.
- Result: **100% PASS in 68 seconds.**

---

## 4. Production Asset & HTTP Headers Verification

Executed via `tests/e2e/test-production-server.mjs`:
- `/`: HTTP 200, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: credentialless`.
- `/assets/v86/v86.wasm`: HTTP 200, `application/wasm`, 2,007,347 bytes.
- `/assets/linux/Core-17.1.iso`: HTTP 200, `application/octet-stream`, 20,658,176 bytes (19.7 MB).
- `/assets/bios/seabios.bin`: HTTP 200, 131,072 bytes (exact 128 KB).
- `/assets/bios/vgabios.bin`: HTTP 200, 36,352 bytes.
- Result: **100% PASS.**
