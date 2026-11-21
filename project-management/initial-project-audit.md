# WebOS — Initial Project Audit & Repository Analysis

**Date:** 2026-11-21  
**Lead Architect & Senior Full-Stack Engineer:** Antigravity  
**Repository Working Directory:** `/home/ubuntu/projects/webos`  
**Current Phase:** Phase 1 — Project Foundation & Boot Proof of Concept  

---

## Executive Summary

WebOS is an educational browser-hosted operating system laboratory that runs a real 32-bit x86 Linux guest inside modern browsers using the `v86` WebAssembly PC emulator.

A thorough audit of the repository reveals that **complete documentation (34 Markdown specifications across `docs/`, `project-management/`, `.agents/`, and the root directory) has been authored**, defining clear architecture, security rules, coding standards, and roadmaps. However, **no application source code, package manifests, build scripts, tests, emulator assets, or operating system images currently exist in the repository**, and the working directory is not yet initialized as a Git repository.

Therefore, the project stands at the very beginning of **Phase 1: Project Foundation & Boot Proof of Concept**. This audit documents the current state, analyzes documentation consistency and technical risks, and outlines the precise sequence required to execute Phase 1 successfully.

---

## A. Project Understanding

### 1. What WebOS Is
WebOS is an in-browser Linux laboratory. Unlike conventional "web desktops" (which render simulated terminals and mock commands via JavaScript), WebOS runs a genuine 32-bit x86 virtual machine directly in the browser tab via WebAssembly (`v86`). Linux—specifically the guest kernel, BusyBox, shell, and userland—executes commands, manages processes, handles memory, and operates the filesystem.

### 2. Main Objectives
- **Authentic Linux Execution:** Provide learners and students with an accessible x86 Linux environment without requiring local VM installations (VirtualBox, VMware, WSL) or dual-boot setups.
- **Strict Host/Guest Separation:** React and TypeScript own the host web frame, system toolbar, emulator lifecycle controls, and guided laboratory instructional content. Linux owns execution, files, and processes.
- **Educational Value:** Offer structured OS laboratory experiments (process management, signals, virtual filesystems, `/proc`, permissions, shell scripting).
- **Client-Side Portability:** Deliver the entire stack as a static HTTPS web application with zero backend server dependencies for the initial single-user release.

### 3. Intended User Experience
1. **Welcome Screen:** Informs the user of the system architecture, resource requirements, and browser compatibility; offers a "Start Linux" action.
2. **Boot Screen:** Displays clean VM initialization states and guest boot output.
3. **Desktop & Terminal Workspace:** The user interacts with the real guest GUI (FLWM / Xvesa if supported) or guest console via keyboard and mouse forwarded by v86.
4. **Host Controls:** Toolbar buttons for Start, Stop, Reset, Fullscreen, and Snapshot Save/Restore.
5. **Interactive OS Labs:** Side panel with step-by-step OS experiments that learners execute in the live guest terminal.

### 4. Core Technical Architecture
```text
Browser Host (Chrome / Edge / Firefox)
 └── React 18+ / TypeScript / Vite / Tailwind CSS
      ├── Host UI (Welcome, Toolbar, Lab Guides, Status Displays)
      ├── EmulatorManager (Singleton Service managing v86 lifecycle)
      └── Storage Adapter (IndexedDB for snapshots & state)
           │
           ▼
 v86 PC Emulator (WebAssembly / Web Workers)
      ├── 32-bit x86 CPU emulation & RAM (64MB - 128MB)
      ├── VGA BIOS / SeaBIOS
      ├── Virtual Storage (CD-ROM / IDE / VirtIO 9p)
      └── Input forwarding (PS/2 keyboard & mouse)
           │
           ▼
 Real Linux Guest (Tiny Core Linux 17.1 Candidate)
      ├── 32-bit Linux Kernel (vmlinuz)
      ├── Root filesystem / Initrd (core.gz)
      ├── BusyBox shell & standard utilities
      └── Graphical desktop environment (Xvesa / FLWM)
```

---

## B. Current Repository Status

### 1. File Structure
The repository contains 34 files, all of which are Markdown documentation:
```text
.
├── .agents/
│   ├── rules/
│   │   ├── architecture-rules.md
│   │   ├── coding-standards.md
│   │   └── security-rules.md
│   └── workflows/
│       ├── code-review.md
│       ├── implementation.md
│       └── planning.md
├── AGENTS.md
├── CLAUDE.md
├── GEMINI.md
├── MANIFEST.md
├── README.md
├── docs/
│   ├── 01-product/ (PRD.md, requirements.md)
│   ├── 02-architecture/ (architecture.md, decisions.md, folder-structure.md, tech-stack.md)
│   ├── 03-design/ (design.md)
│   ├── 04-database/ (database.md)
│   ├── 05-api/ (api.md)
│   ├── 06-security/ (security.md)
│   ├── 07-testing/ (testing.md)
│   ├── 08-emulator/ (emulator-integration.md, guest-os.md, networking.md, persistence.md)
│   ├── 09-labs/ (os-experiments.md)
│   └── 10-deployment/ (deployment.md)
└── project-management/
    ├── changelog.md
    ├── demo-plan.md
    ├── implementation-plan.md
    ├── progress.md
    ├── risks.md
    ├── roadmap.md
    └── tasks.md
```

### 2. Discovered Technologies & Environment
- **Host OS:** Linux x86_64 (WSL2 on Ubuntu 24.04).
- **Git Status:** Directory is not yet a Git repository (`fatal: not a git repository`).
- **Node.js / Tooling:** Native Node.js was not installed in `/usr/bin` (Windows Node.js was present on mounted drive but WSL interop was non-functional for interactive commands; Node LTS is being installed to `~/.local`).
- **Source Code:** No `package.json`, `src/`, `public/`, or build configs exist.
- **Assets:** No BIOS images (`seabios.bin`, `vgabios.bin`) or Linux disk images are present.
- **Tests:** No test files or test runner configuration exist.

### 3. Component Status Inventory
| Component | Classification | Notes |
|---|---|---|
| Project Documentation | Verified | 34 specification files authored and verified |
| Frontend Scaffold (React/Vite/TS) | Not Implemented | Needs initialization in Phase 1 / Phase 2 |
| v86 Integration & Lifecycle Manager | Not Implemented | Core task of Phase 1 |
| BIOS / VGA BIOS Assets | Missing | Required for v86 boot |
| Guest OS Image (Tiny Core x86) | Missing / Unverified | Candidate: Tiny Core Linux 17.1 (32-bit) |
| Host UI Screens & Styling | Not Implemented | Scheduled for Phase 2 / Phase 3 |
| Snapshot / Persistence Engine | Not Implemented | Scheduled for Phase 6 |
| Automated Test Suite | Not Implemented | Unit & integration tests to be added |

---

## C. Documentation Consistency

The repository documentation has been comprehensively reviewed:
1. **Manifest Alignment:** `MANIFEST.md` lists 34 Markdown files. Exactly 34 Markdown files exist on disk.
2. **Architecture Consistency:**
   - `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `README.md`, and `docs/02-architecture/architecture.md` all enforce identical core rules: React owns the host UI, v86 owns emulation, and Linux owns execution.
   - All documents strictly forbid mocking Linux commands or simulating terminal output.
   - All documents state that `Tiny Core Linux 17.1` is a **candidate** and treat its compatibility as unverified until proven.
3. **No Material Contradictions Found:**
   - Single-instance v86 lifecycle management is consistently mandated across all files.
   - Networking is consistently classified as deferred and disabled by default.
   - Client-side static hosting without a backend server is uniformly specified for initial phases.

---

## D. Technical Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Tiny Core Linux 17.1 Compatibility** | Critical | Tiny Core 17.1 is a modern kernel candidate. Upstream `v86` has known constraints with specific CPU features, instruction sets, and 64-bit kernels. Mitigation: Validate 32-bit x86 kernel boot in a standalone v86 test harness immediately; if kernel panic occurs, isolate whether config (ACPI, APIC, serial console) or an alternative stable release (e.g., Tiny Core 11.x - 14.x or Buildroot x86) is required. |
| **Asset Delivery & MIME Types** | High | v86 loads WebAssembly (`v86.wasm`), BIOS ROMs, and disk/ISO images via HTTP `Range` requests or full fetches. Vite dev server and production static servers must serve correct MIME types (`application/wasm`, `application/octet-stream`) and support byte-range headers. |
| **Browser Memory & Heap Exhaustion** | High | Emulating 64MB - 128MB RAM in WebAssembly requires linear memory allocation. Excessive guest memory allocation causes browser tab crashes on lower-end devices. Mitigation: Default guest memory to 64MB or 128MB max. |
| **React Re-render VM Destruction** | High | In React 18 `StrictMode`, components mount, unmount, and remount immediately. If v86 initialization is tied to component lifecycles without a persistent singleton or ref-counted manager, multiple instances will instantiate and lock canvas/audio/input resources. Mitigation: Implement a dedicated, singleton `EmulatorManager` service decoupled from React render loops. |
| **Keyboard / Mouse Event Capture** | Medium | Browser keyboard shortcuts (Ctrl+W, Ctrl+T, Alt+Tab) can conflict with guest OS desktop controls. Mitigation: Provide explicit capture/release affordances (e.g., click to capture, Esc to release) and document browser-level limitations. |

---

## E. Phase 1 Readiness

### 1. Objectives of Phase 1
According to `roadmap.md` and `implementation-plan.md`:
1. Verify development environment and project tooling.
2. Obtain legally distributable 32-bit x86 Tiny Core candidate image and verify checksum.
3. Obtain required BIOS assets (`seabios.bin`, `vgabios.bin`).
4. Pin and integrate the `v86` emulator package.
5. Build a minimal, reliable local test harness / emulator screen.
6. Verify guest OS boot in v86:
   - Level 1: Emulator code loads.
   - Level 2: Emulator initializes hardware.
   - Level 3: Guest firmware (SeaBIOS) executes.
   - Level 4: Linux kernel starts and logs output.
   - Level 5: Linux reaches a usable shell prompt.
   - Level 6: Real Linux commands execute and return guest output.
7. Document test results, checksums, and update project management logs.

### 2. Immediate Blockers & Dependencies
- **Development Tooling:** Ensure Node.js and npm are functional in the Linux environment.
- **Assets Required:**
  - `v86` library and WebAssembly runtime (`libv86.js`, `v86.wasm`).
  - SeaBIOS (`seabios.bin`) and VGA BIOS (`vgabios.bin`).
  - Candidate 32-bit Tiny Core Linux ISO / kernel + initrd (`Core-current.iso` / `TinyCore-current.iso`).

---

## F. Recommended Implementation Sequence

1. **Step 1: Finalize Tooling & Environment**
   - Verify Node.js LTS and npm installation.
   - Initialize Git repository and create `.gitignore`.
2. **Step 2: Scaffold Project & Tooling**
   - Initialize package manifest with TypeScript, Vite, React, and testing framework (Vitest).
   - Install and pin `v86` dependency.
3. **Step 3: Acquire Emulator Assets**
   - Procure official `seabios.bin` and `vgabios.bin`.
   - Download official 32-bit Tiny Core Linux candidate ISO (`TinyCore-current.iso` or `Core-current.iso`).
   - Compute and document SHA-256 checksums in `docs/08-emulator/guest-os.md`.
4. **Step 4: Build Standalone v86 Test Harness & Emulator Service**
   - Create typed `EmulatorManager` isolating v86 construction, event handling, and teardown.
   - Create minimal HTML/Vite test page with serial log capture and VGA canvas.
5. **Step 5: Execute Boot Proof of Concept**
   - Boot candidate image.
   - Observe SeaBIOS execution and Linux kernel bootstrap.
   - Test serial/terminal input and real command execution (`uname -a`, `ls`, `ps`).
6. **Step 6: Document Evidence & Update Tracking**
   - Record exact boot logs, screenshots/verification records, and resource metrics.
   - Update `project-management/tasks.md`, `progress.md`, and `changelog.md`.
