# WebOS v0.8.0 Release Notes — Production Release

**Release Version:** `0.8.0`  
**Release Date:** November 21, 2026  
**Git Branch:** `phase-8-production-readiness`  
**Target Architecture:** x86 32-bit (i686) in WebAssembly (v86 `0.5.473`)  
**Guest Operating System:** Tiny Core Linux 17.1 (Linux kernel `6.18.35-tinycore`)  
**Desktop Environment:** WebOS React 18 Desktop + Guest FLWM / Xvesa  

---

## 1. Overview & Release Highlights

WebOS v0.8.0 marks the completion of the 8-phase implementation roadmap. WebOS delivers a complete, browser-hosted x86 PC environment running genuine Tiny Core Linux, featuring a polished windowed desktop environment, persistent state snapshots, sub-second recovery, and an interactive 20-lab Operating Systems Laboratory.

### Key Capabilities:
- **Genuine x86 Linux Guest:** Runs Tiny Core Linux 17.1 with BusyBox v1.36.1 and Linux kernel 6.18.35. Zero faked commands; all shell operations execute in the real guest kernel.
- **React Desktop Shell:** Window manager supporting draggable, resizable, minimizable, and maximizable windows with z-index stacking and ambient theme personalization.
- **Session Persistence:** Captures serialized v86 memory snapshots (~86 MB) into IndexedDB with SHA-256 integrity validation and hardware configuration parity checks, enabling cold reload recovery in **under 1 second**.
- **Interactive OS Laboratory:** 20 structured experiments across 7 core operating system categories (Processes, Memory, Filesystem, Permissions, Shell, Kernel, Devices) with step runners, real terminal output, and knowledge-check quizzes.
- **Real-Time Telemetry:** Bounded 3000ms resource monitoring strictly separating guest Linux kernel metrics from host browser application metrics.
- **Security Hardened:** Pre-execution safety validation, isolated experiment workspaces (`/tmp/webos-experiments/`), unique delimited marker nonces, and production-tested COOP/COEP cross-origin isolation.

---

## 2. Completed Roadmap Phases

| Phase | Title | Description | Status |
|---|---|---|---|
| **Phase 1** | Boot Proof of Concept | Verified SeaBIOS, ISOLINUX, and Tiny Core 17.1 boot in v86. | **Verified** |
| **Phase 2** | React & Emulator Integration | Singleton `EmulatorManager`, display canvas, lifecycle state machine. | **Verified** |
| **Phase 3** | WebOS Host Desktop | Window manager, taskbar, start menu, desktop icons, settings, about. | **Verified** |
| **Phase 4** | Guest Desktop Integration | FLWM configuration, guest applications (`aterm`, `editor`, `cpanel`). | **Verified** |
| **Phase 5** | CLI & OS Capabilities | BusyBox command inventory, POSIX shell scripting, permissions. | **Verified** |
| **Phase 6** | Persistence & Management | IndexedDB storage service, reload recovery proof, ACPI shutdown. | **Verified** |
| **Phase 7** | OS Experiments (OS Lab) | 20 structured labs, safety engine, step runner, quizzes. | **Verified** |
| **Phase 8** | Testing & Deployment | 71 unit tests, production server verification, security audit, guides. | **Verified** |

---

## 3. Verified System Specifications

- **Emulation Engine:** v86 `0.5.473` (WebAssembly)
- **Virtual CPU:** 32-bit x86 (QEMU Virtual CPU model)
- **Virtual Memory:** 128 MB RAM
- **Virtual Video:** Cirrus/Bochs VGA with 8 MB VRAM (1024x768 @ 32bpp)
- **Guest Kernel:** Linux `6.18.35-tinycore` (i686)
- **Guest Init:** BusyBox v1.36.1 ash shell
- **Host Stack:** React 18.3, TypeScript 5.6, Tailwind CSS 3.4, Vite 5.4, Vitest 2.1

---

## 4. Test & Verification Evidence

- **Unit Tests:** 71 passing tests across 11 test suites (`npm test -- --run`).
- **TypeScript:** 0 compiler errors (`npx tsc --noEmit`).
- **Production Build:** Clean bundle generated in 3.86s (`npm run build`).
- **Production Preview Server:** 5/5 HTTP and asset tests passing (`tests/e2e/test-production-server.mjs`).
- **Live Guest Reload Recovery:** Proof token verified across total VM destruction in 969 ms (`tests/boot/test-phase6-reload-recovery.mjs`).
- **Live Guest OS Experiments:** 12/12 stages passing on real booting Linux VM in 68 seconds (`tests/boot/test-phase7-experiments.mjs`).

---

## 5. Deployment Options

- **Cloudflare Pages:** Configured via `public/_headers`.
- **Netlify:** Configured via `netlify.toml`.
- **Docker / Nginx:** Containerized via `Dockerfile` and `nginx.conf`.
- **Local Preview:** `npm run preview` on `http://localhost:4173/`.

---

## 6. Release Recommendation

**APPROVED FOR PRODUCTION RELEASE.**
