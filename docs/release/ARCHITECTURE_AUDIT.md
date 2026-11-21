# WebOS — Architecture & Repository Audit

**Date:** November 21, 2026  
**Auditor:** Antigravity / Lead Software Architect  
**Scope:** Full codebase audit covering repository structure, Git state, dependencies, emulator lifecycle, guest interaction, snapshot persistence, experiment engine, desktop management, and production readiness.  
**Branch:** `phase-8-production-readiness`  
**Starting Commit:** `eaddd3b`  

---

## 1. Executive Summary

WebOS provides a browser-hosted x86 PC emulation environment running Tiny Core Linux 17.1 (i686) powered by v86 and WebAssembly, wrapped in a React desktop environment. This audit evaluates the production readiness of all architectural layers from Phase 1 through Phase 7.

The architecture strictly honors the core project principle: **React owns the host web interface; the Linux guest executes shell commands and manages processes, memory, and files.** Hardcoded simulations and fake command outputs are forbidden.

---

## 2. Repository & Git Audit

### 2.1 Git State
- **Branch:** `phase-8-production-readiness` (branched from `master` at `eaddd3b`).
- **Clean Working Tree:** Verified prior to Phase 8 work.
- **Commit Lineage:**
  - `3aa9acc`: Phase 2 (Browser integration & v86 lifecycle)
  - `aa94fe2`: Phase 3 (Host desktop, window manager, terminal)
  - `d24366b`: Phase 4 (Guest desktop FLWM integration, command channel)
  - `e19e16f`: Phase 5 (CLI and OS capabilities, command inventory)
  - `255363c`: Phase 6 (Persistence, IndexedDB storage, ACPI shutdown)
  - `eaddd3b`: Phase 7 (OS experiments, OS Lab app, 20 interactive labs)

### 2.2 Directory Structure
```
├── .agents/                    # Agent rules, workflows, system contract
├── docs/
│   ├── 01-product/             # PRD, requirements
│   ├── 02-architecture/        # System design, tech stack
│   ├── 03-emulator/            # v86 integration, FLWM config, command channel
│   ├── cli/                    # Command inventory, file & process operations
│   ├── persistence/            # Snapshot lifecycle, IndexedDB storage, recovery
│   ├── experiments/            # OS Lab architecture, 20 labs catalog, safety
│   ├── security/               # Threat model, security audit
│   ├── deployment/             # Static deployment, production verification
│   └── release/                # Release notes, user guide, audit reports
├── guest/                      # Guest scripts (diagnostics, labs)
├── public/                     # Static binary assets (WASM, BIOS, Linux ISO)
├── src/
│   ├── components/             # React desktop UI (DesktopShell, Taskbar, Window)
│   ├── features/               # Domain subsystems (emulator, desktop, experiments)
│   └── services/               # Infrastructure services (persistence)
├── tests/
│   ├── boot/                   # Real guest VM verification harnesses
│   ├── cli/                    # CLI unit tests
│   ├── desktop/                # Window and settings unit tests
│   ├── emulator/               # EmulatorManager lifecycle unit tests
│   ├── experiments/            # OS Lab runner and safety unit tests
│   └── persistence/            # SnapshotStorage IndexedDB unit tests
```

---

## 3. Subsystem Architecture Analysis

### 3.1 Emulator Lifecycle (`EmulatorManager.ts`)
- **Pattern:** Strict singleton service maintaining a single v86 instance across React re-renders.
- **State Machine:** Explicit states: `idle`, `booting`, `running`, `paused`, `capturing`, `restoring`, `shutting-down`, `restarting`, `error`.
- **Operation Locks (`isOperationLocked`):** Prevents race conditions during asynchronous snapshot capture, snapshot restoration, or system shutdown.
- **Permanent Canvas DOM Preservation:** The container `#v86-screen-container` is permanently mounted in `DesktopShell.tsx`, ensuring that minimizing or closing windows does not destroy the WebAssembly graphics context.

### 3.2 Guest Command Execution & Marker Protocol
- **Channel:** Dual-channel interaction:
  - **Human Interaction:** Keyboard scancodes and text forwarded directly via `keyboard_send_text` in `TerminalApp`.
  - **Programmatic IPC:** Serial and keyboard execution wrapped with delimited boundaries (`___START___` / `___END___:<exitCode>`).
- **Hardening:** Added randomized execution nonces to prevent marker collisions across sequential runs or stale terminal buffers.

### 3.3 Persistence & IndexedDB Subsystem (`src/services/persistence/`)
- **Layering:** Clear separation between low-level database operations (`SnapshotDatabase.ts`), cryptographic validation (`SnapshotValidation.ts`), typed errors (`SnapshotErrors.ts`), and public API (`SnapshotStorage.ts`).
- **Hardware Configuration Hashing:** Generates deterministic canonical hashes (`mem`, `vga_mem`, `bios`, `vga_bios`, `wasm`, `acpi`) to prevent restoring snapshots into incompatible emulator configurations.
- **Integrity Validation:** Computes Web Crypto SHA-256 digests on write and verifies them before state restoration.
- **Safety Ceiling:** Enforced 512 MB maximum snapshot size limit and 100-character name sanitization to prevent memory exhaustion and storage abuse.

### 3.4 OS Lab Subsystem (`src/features/experiments/`)
- **Decoupled Architecture:** `ExperimentRegistry` (catalog metadata), `ExperimentSafety` (boundary validation), `ExperimentRunner` (execution and marker parsing), `ExperimentProgressService` (progress persistence), and `ResourceMonitoringService` (real-time telemetry).
- **Execution Modes:** Clear distinction between `real-guest` (live VM execution), `hybrid` (live commands + visual models), and `educational-simulation` (theoretical diagrams).
- **Safety Enforcement:** Blocks dangerous commands (`rm -rf /`, `mkfs`, raw device writes, fork bombs, poweroff) and isolates disk operations to `/tmp/webos-experiments/<expId>/`.

---

## 4. Dependency Audit

### 4.1 Production Dependencies
| Package | Version | Purpose | Vulnerabilities |
|---|---|---|---|
| `react` | 18.3.1 | Core UI library | None |
| `react-dom` | 18.3.1 | DOM renderer | None |
| `v86` | 0.5.473 | x86 PC emulator core | None |
| `lucide-react` | 0.460.0 | System icons | None |
| `clsx` | 2.1.1 | Class utility | None |
| `tailwind-merge` | 2.5.4 | Utility style merging | None |

### 4.2 Development Dependencies
- `typescript` (5.6.3), `vite` (5.4.11), `vitest` (2.1.5), `tailwindcss` (3.4.15).
- Audit findings: Several dev-only vulnerabilities in build tooling (`esbuild`, `tinypool`, `vitest`). These do not affect client-side bundle security, as dev tools are excluded from the static production output. No breaking major upgrades are recommended for the release branch.

---

## 5. Architectural Findings & Remediation

| Issue Identified | Severity | Status | Remediation Applied |
|---|---|---|---|
| Preview server lacked COOP/COEP headers | Medium | **Fixed** | Added `preview.headers` block in `vite.config.ts`. |
| Marker protocol vulnerable to repeated step token collisions | Low | **Fixed** | Added execution nonce to `wrapCommandForExecution` in `ExperimentSafety.ts`. |
| Snapshot import lacked memory upper ceiling | Medium | **Fixed** | Added `MAX_SNAPSHOT_BYTES` (512 MB) check in `SnapshotStorage.ts`. |
| Snapshot name lacked length truncation | Low | **Fixed** | Added 100-character sanitization in `SnapshotStorage.ts`. |
| Missing static hosting configurations for CDN / PaaS | Medium | **Fixed** | Created `public/_headers`, `netlify.toml`, `nginx.conf`, and `Dockerfile`. |
| Missing repeatable CI workflow | Medium | **Fixed** | Created `.github/workflows/ci.yml`. |

---

## 6. Audit Conclusion

The WebOS architecture is robust, strictly modular, and faithful to its core mission. All identified architectural enhancements have been implemented and verified without breaking changes.
