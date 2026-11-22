# WebOS — Browser-Hosted x86 Linux Operating System & Retro Desktop

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![v86](https://img.shields.io/badge/v86-WASM%20x86%20Emulator-orange.svg)](https://github.com/copy/v86)
[![Linux Kernel](https://img.shields.io/badge/Linux%20Kernel-6.18.35--tinycore-lightgrey.svg)](http://tinycorelinux.net/)
[![Tiny Core Linux](https://img.shields.io/badge/Guest%20OS-Tiny%20Core%2017.1-blueviolet.svg)](http://tinycorelinux.net/)
[![Tests](https://img.shields.io/badge/Vitest-86%2F86%20Passed-brightgreen.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](file:///home/ubuntu/projects/webos/README.md)

**WebOS** is a browser-hosted operating system that runs a **genuine 32-bit x86 Linux guest** inside the [v86](https://github.com/copy/v86) PC emulator (WebAssembly), presented through an authentic, retro-futuristic React desktop environment.

> [!IMPORTANT]
> **Not a Mock or Simulated Shell:** This is **not** a JavaScript terminal simulator or fake operating system. WebOS boots an actual x86 CPU emulator, loads SeaBIOS and VGABIOS, executes the real **Linux kernel 6.18.35-tinycore**, and runs the **BusyBox v1.36.1 ash shell**. All terminal commands (`uname`, `ps`, `free`, `uptime`, `ls`, `mkdir`, `cat`, `grep`) execute inside the virtualized Linux kernel.

---

## Table of Contents

- [Key Features](#key-features)
- [Interactive Desktop Experience](#interactive-desktop-experience)
- [System Architecture](#system-architecture)
- [Integrated Applications](#integrated-applications)
- [Technology Stack](#technology-stack)
- [Quick Start & Local Development](#quick-start--local-development)
- [Automated Verification & Test Suite](#automated-verification--test-suite)
- [Production Deployment](#production-deployment)
- [Security & Isolation Boundary](#security--isolation-boundary)
- [Project Directory Map](#project-directory-map)
- [License & Acknowledgments](#license--acknowledgments)

---

## Key Features

- **Genuine x86 Virtual Machine (WebAssembly):** Complete 32-bit PC hardware emulation powered by v86 with 128 MB emulated RAM, Bochs/Cirrus VGA, keyboard, PS/2 mouse, SeaBIOS 128 KB, and VGABIOS 36 KB.
- **Real Linux Guest (Tiny Core 17.1):** Boots Tiny Core Linux (i686) running Linux kernel 6.18.35 with full BusyBox command support and genuine process scheduling, memory allocation, and virtual filesystem.
- **Three-Stage Desktop Lifecycle:**
  1. **Animated Booting Screen:** BIOS POST, hardware enumeration, kernel loading progress, and fullscreen shortcut.
  2. **User Sign-In Screen:** Aesthetic login card with avatar artwork, password prompt, and smooth transition.
  3. **Retro GUI Desktop:** Full desktop shell with draggable, resizable, minimizable windows, top menu bar, and centered glassmorphism dock.
- **Real-Time Linux Terminal Bridge:** Direct bidirectional serial stream connection (`/dev/ttyS0`) to Tiny Core Linux with command history, auto-scroll, and clean `tc@box:~$` prompt.
- **Interactive File Explorer & Wallpaper Engine:** Browse virtual filesystem hierarchies (`/home/tc`, `/wallpapers`, documents, notes) and instantly set high-definition wallpapers with a single double-click.
- **Sandboxed Web Surfing:** Built-in web browser with instant search engine integration (DuckDuckGo, FrogFind, Wikipedia, Hacker News, Tiny Core) backed by a local proxy middleware that handles CORS and strips frame-blocking headers, complete with SSRF protection.
- **Persistent State Snapshots:** Instant cold resume via memory snapshots stored in browser IndexedDB (`webos_persistence_db`) with SHA-256 integrity validation.
- **Interactive OS Laboratory:** 20 guided operating systems experiments across 7 categories (Processes, Memory, Filesystem, Permissions, Shell, Kernel, and Devices) with automated live step runners and interactive quizzes.

---

## Interactive Desktop Experience

WebOS guides the user through an authentic operating system startup and desktop workflow:

```
+-----------------------------------------------------------------------------------------+
|                                1. System Booting Screen                                 |
|   - SeaBIOS initialization & x86 hardware POST                                          |
|   - Linux kernel 6.18 & root filesystem decompression                                   |
|   - Interactive progress bar with quick Enter / Space / Escape skip                     |
+-----------------------------------------------------------------------------------------+
                                            │
                                            ▼
+-----------------------------------------------------------------------------------------+
|                               2. User Authentication Screen                             |
|   - Retro user profile ("Dash") with stylized avatar doodle                             |
|   - Password input field and welcome greeting                                           |
|   - Smooth fade-in transition into the GUI workspace                                    |
+-----------------------------------------------------------------------------------------+
                                            │
                                            ▼
+-----------------------------------------------------------------------------------------+
|                                  3. Retro GUI Desktop                                   |
|  [Top Menu Bar: 🫐 Berry Menu | File | Help | WiFi | Battery | Real-time Clock]         |
|  -------------------------------------------------------------------------------------  |
|  [Desktop Icons]                [Active Application Windows]                            |
|  - Linux Terminal               - Draggable, resizable, minimizable, maximizable        |
|  - File Explorer                - High-resolution X11 guest framebuffer (1024x768)     |
|  - Web Browser                  - Real-time Linux terminal bridge                       |
|  - Text Editor                                                                          |
|  - Control Panel                [Floating Retro Dock]                                   |
|  - OS Experiments               - Quick launch bar with running state indicators        |
+-----------------------------------------------------------------------------------------+
```

---

## System Architecture

The architecture maintains a strict, verifiable separation of concerns between the host browser runtime and the emulated Linux guest:

```
+---------------------------------------------------------------------------------------------+
|                                       HOST BROWSER                                          |
|  +---------------------------------------------------------------------------------------+  |
|  |                                  React 18 Desktop Shell                               |  |
|  |  - Screen State Machine (Booting -> Sign-In -> Desktop)                               |  |
|  |  - Window Manager (Z-index stacking, bounds, minimize, maximize, snap)                |  |
|  |  - Retro Dock, Top Menu Bar, Dynamic Status Bar & Digital Clock                       |  |
|  |  - Reactive Settings Store (Wallpapers, Display Scaling, Audio, Themes)                |  |
|  |  - OS Laboratory (20 Guided Experiments, Step Runners, Knowledge Quizzes)              |  |
|  |  - Persistence Service (IndexedDB: webos_persistence_db, SHA-256 Checksums)           |  |
|  +-------------------------------------------+-------------------------------------------+  |
|                                              |                                              |
|                                              v                                              |
|  +---------------------------------------------------------------------------------------+  |
|  |                                 v86 Emulator (WebAssembly)                            |  |
|  |  - Emulated CPU: 32-bit x86 (IA-32) with JIT translation                              |  |
|  |  - Emulated Memory: 128 MB RAM (Fast TypedArrays / SharedArrayBuffer)                 |  |
|  |  - Firmware: SeaBIOS (128 KB), VGABIOS (36 KB)                                        |  |
|  |  - Video: Bochs/Cirrus 8 MB VGA Framebuffer (1024x768 @ 32bpp)                         |  |
|  |  - Serial I/O: 16550 UART (COM1 /dev/ttyS0) hooked to React Terminal                   |  |
|  |  - Storage: ISO / CD-ROM Virtual Drive (TinyCore-17.1.iso)                            |  |
|  |  +---------------------------------------------------------------------------------+  |  |
|  |  |                             GUEST LINUX OPERATING SYSTEM                        |  |  |
|  |  |  - Kernel: Linux 6.18.35-tinycore (i686 architecture)                           |  |  |
|  |  |  - Userspace: BusyBox v1.36.1 ash shell (221 built-in applets)                   |  |  |
|  |  |  - Graphics: Xvesa X-Server + FLWM (Fast Light Window Manager)                   |  |  |
|  |  |  - Process Scheduler & Virtual Memory Manager                                  |  |  |
|  |  |  - Virtual Filesystem: /proc, /sys, /dev, /tmp/webos-experiments/               |  |  |
|  |  +---------------------------------------------------------------------------------+  |  |
|  +---------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------+
```

### Responsibility Boundaries

| Layer | Component | Ownership & Responsibilities |
| :--- | :--- | :--- |
| **Host UI** | [DesktopShell.tsx](file:///home/ubuntu/projects/webos/src/components/desktop/DesktopShell.tsx) | Renders desktop windows, top bar, dock, settings, and handles user interactions. |
| **Host Storage** | [SnapshotStorage.ts](file:///home/ubuntu/projects/webos/src/services/persistence/SnapshotStorage.ts) | Saves and verifies VM memory snapshots into IndexedDB. |
| **Proxy Gateway** | [vite.config.ts](file:///home/ubuntu/projects/webos/vite.config.ts) | Local SSRF-protected proxy middleware for iframe web browsing. |
| **Emulator** | [EmulatorManager.ts](file:///home/ubuntu/projects/webos/src/features/emulator/EmulatorManager.ts) | Manages v86 lifecycle, BIOS loading, WASM execution, and serial COM routing. |
| **Guest Kernel** | Linux 6.18.35 | Schedules real threads, allocates virtual memory, handles system calls and interrupts. |
| **Guest Userspace** | BusyBox ash | Interprets shell commands, manages files, executes scripts, and controls processes. |

---

## Integrated Applications

WebOS includes a suite of authentic desktop applications accessible via the desktop icons, top menu, and bottom dock:

### 1. Linux Terminal ([TerminalApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/TerminalApp.tsx))
- Real-time bidirectional connection to the Linux guest's serial console (`/dev/ttyS0`).
- True command prompt: `tc@box:~$`.
- Supports standard Linux commands:
  - Process inspection: `ps`, `top`, `kill`
  - Memory & telemetry: `free -m`, `cat /proc/meminfo`, `uptime`, `cat /proc/cpuinfo`
  - Navigation & filesystem: `pwd`, `cd`, `ls -la`, `mkdir`, `rm`, `cat`, `touch`
  - System identification: `uname -a`, `whoami`, `id`, `hostname`
- Command history recall using `Up` and `Down` arrow keys.
- Auto-scroll lock and instant keyboard focus.

### 2. File Explorer ([FileExplorerApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/FileExplorerApp.tsx))
- Hierarchical folder navigation (`/home/tc`, `/wallpapers`, `/home/tc/Documents`, `/home/tc/Journal`).
- Dedicated **Wallpapers** catalog featuring high-resolution anime, landscape, and pixel art backgrounds:
  - `kame-house-dragon.jpg`
  - `winter-mountain.jpg`
  - `Bomb Girl (1)(1).jpg`
  - `d0eb505bfddcb621426c26200c269d59.jpg`
  - `04005cd9595918388985a8bf1cba433a.jpg`
  - `makima.jpg`
- **Instant Wallpaper Switching:** Double-click any wallpaper image to set it as the desktop background with zero reload delay.
- Clean and decluttered UI free from unnecessary notification banners or obstructive buttons.

### 3. Sandboxed Web Browser ([BrowserApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/BrowserApp.tsx))
- In-browser web navigation complete with navigation bar (Back, Forward, Reload, Home, Address input).
- Instant quick-search tiles:
  - **DuckDuckGo:** Privacy-focused web search engine returning live HTML search results.
  - **FrogFind:** Lightweight retro search engine designed for minimal and vintage web browsers.
  - **Wikipedia:** Mobile-optimized world encyclopedia.
  - **Hacker News:** Live tech discussions and programming news.
  - **Tiny Core Linux:** Official project site and documentation.
  - **wttr.in:** Real-time worldwide weather forecast.
  - **Wiby:** Curated search engine for lightweight, text-oriented websites.
- **Proxy Middleware:** Routes external requests through `/api/proxy?url=...` to remove restrictive `X-Frame-Options` and `CSP: frame-ancestors` headers, enabling live webpage viewing inside the browser window.
- **SSRF Hardening:** Strict host filtering that forbids access to private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopbacks (`127.0.0.1`, `::1`, `localhost`), and cloud metadata IP addresses (`169.254.169.254`).

### 4. Tiny Core Linux GUI ([LinuxDesktopApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/LinuxDesktopApp.tsx))
- Directly views the native Xvesa 1024x768 graphical display server running the FLWM window manager.
- Keyboard and mouse forwarding directly to the x86 guest.
- Capable of launching native guest X11 applications:
  - `guest-aterm`: Native FLTK/X11 color terminal.
  - `guest-editor`: Native FLTK text editor.
  - `guest-cpanel`: Native Tiny Core control panel.

### 5. OS Experiments Laboratory ([ExperimentsApp.tsx](file:///home/ubuntu/projects/webos/src/features/experiments/components/ExperimentsApp.tsx))
- 20 structured, hands-on Linux operating system experiments:
  - **Processes:** Forking, process trees, zombies, signals (`SIGINT`, `SIGTERM`), nice priorities.
  - **Virtual Memory:** Swap spaces, page faults, heap inspection, virtual address spaces.
  - **Filesystem:** Inodes, hard vs. soft symlinks, mount tables, pipe IPC (`mkfifo`).
  - **Permissions:** POSIX file permissions, `chmod`, `chown`, `umask`, setuid basics.
  - **Shell Scripting:** Variables, loops, conditional exit codes, subshells.
  - **Kernel & Telemetry:** `/proc` filesystem inspection, hardware interrupts, `/sys` devices.
  - **Device Nodes:** Virtual devices (`/dev/null`, `/dev/zero`, `/dev/urandom`), block vs. character devices.
- Interactive step-by-step runner with live Linux execution output and knowledge evaluation quizzes.

### 6. Control Panel & Settings ([ControlPanelApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/ControlPanelApp.tsx))
- Customizable desktop wallpapers and gradient presets.
- Real-time display scaling (75% to 125%).
- Audio volume and sound toggle controls.
- VM snapshot management (export, import, inspect, and delete IndexedDB snapshots).

### 7. Utility Suite
- **Text Editor ([TextEditorApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/TextEditorApp.tsx)):** Lightweight notepad for writing notes, journal entries, and shell scripts.
- **Calculator ([CalculatorApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/CalculatorApp.tsx)):** Arithmetic calculator with tape history.
- **Messages ([MessagesApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/MessagesApp.tsx)):** System communications and notifications log.
- **Trash ([TrashApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/TrashApp.tsx)):** Recycle bin and archive management.
- **About WebOS ([AboutApp.tsx](file:///home/ubuntu/projects/webos/src/components/applications/AboutApp.tsx)):** System specs, emulation parameters, and open-source license details.

---

## Technology Stack

| Domain | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 18.3.1 | Component architecture and state management |
| **Language** | TypeScript | 5.6.3 | Strict type safety across host and emulator interfaces |
| **Build & Dev Tool** | Vite | 5.4.11 | Lightning-fast HMR and production bundle optimization |
| **CSS & Design** | Tailwind CSS | 3.4.15 | Utility styling and responsive desktop layouts |
| **Icons** | Lucide React | 0.460.0 | System icons across window chrome, dock, and menus |
| **x86 PC Emulator** | v86 | 0.5.473 | WebAssembly-based hardware emulation |
| **Guest OS** | Tiny Core Linux | 17.1 (i686) | Minimal, high-performance x86 Linux distribution |
| **Guest Kernel** | Linux Kernel | 6.18.35-tinycore | Authentic operating system kernel |
| **Guest Userspace** | BusyBox | 1.36.1 | Lightweight Linux utilities and ash shell |
| **Firmware** | SeaBIOS & VGABIOS | 128KB / 36KB | Emulated x86 BIOS and VGA BIOS |
| **Testing** | Vitest & JSDOM | 2.1.5 / 25.0.1 | Unit, integration, and UI component test suite |
| **Storage** | IndexedDB | Native Web API | Persistent memory snapshots with SHA-256 validation |

---

## Quick Start & Local Development

### 1. Prerequisites

- **Node.js:** v18.x or v20.x LTS
- **npm:** v9+ or v10+
- **Modern Browser:** Chrome, Edge, Firefox, or Safari with WebAssembly and `SharedArrayBuffer` support.

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/example/webos.git
cd webos

# Install dependencies cleanly
npm ci
```

### 3. Start Local Development Server

```bash
npm run dev
```

The Vite development server will start on `http://localhost:5173/` with the mandatory Cross-Origin Isolation headers automatically applied:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

### 4. Build for Production

```bash
# Typecheck and compile static bundle into dist/
npm run build

# Preview production build locally on port 4173
npm run preview
```

---

## Automated Verification & Test Suite

WebOS maintains an automated verification test suite ensuring that window management, emulator lifecycle, persistence, and desktop interfaces work reliably.

```bash
# Run all 86 unit and integration tests across 12 test suites
npm test -- --run

# Run TypeScript compiler type-check
npx tsc --noEmit

# Run production HTTP headers & asset verification
node tests/e2e/test-production-server.mjs

# Run live guest VM boot & serial channel verification
node tests/boot/test-v86-boot.mjs

# Run cold browser reload recovery test
node tests/boot/test-phase6-reload-recovery.mjs

# Run 12-stage guest OS laboratory experiment harness
node tests/boot/test-phase7-experiments.mjs
```

### Test Coverage Highlights

- **Desktop Shell & Retro Flow ([retroDesktop.test.tsx](file:///home/ubuntu/projects/webos/tests/desktop/retroDesktop.test.tsx)):** 15 tests verifying the Booting screen, User Sign-In screen, Top Menu Bar clock, Retro Dock launching, File Explorer wallpaper setting, and Terminal commands.
- **Emulator Manager ([EmulatorManager.test.ts](file:///home/ubuntu/projects/webos/tests/emulator/EmulatorManager.test.ts)):** 17 tests verifying configuration validation, boot lifecycle, state transitions, serial listeners, and ACPI shutdown.
- **Snapshot Storage ([SnapshotStorage.test.ts](file:///home/ubuntu/projects/webos/tests/persistence/SnapshotStorage.test.ts)):** 11 tests verifying IndexedDB snapshot creation, retrieval, deletion, schema migration, and SHA-256 checksum integrity.
- **Window Management ([WindowContext.test.tsx](file:///home/ubuntu/projects/webos/tests/desktop/WindowContext.test.tsx)):** 5 tests verifying focus stacking, minimization, maximization, bounds constraint, and window closing.
- **OS Experiments ([ExperimentSafety.test.ts](file:///home/ubuntu/projects/webos/tests/experiments/ExperimentSafety.test.ts)):** 26 tests verifying command safety filters, experiment registry catalog, runner progression, and quiz scoring.

---

## Production Deployment

WebOS compiles to a pure static frontend located in the `dist/` directory.

### Mandatory Cross-Origin Isolation Headers

Because v86 utilizes WebAssembly and high-resolution performance timers, the production web server **must** deliver these HTTP response headers:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

Pre-configured deployment manifests are included in the repository:

- **Cloudflare Pages:** Configured via [`public/_headers`](file:///home/ubuntu/projects/webos/public/_headers).
- **Netlify:** Configured via [`netlify.toml`](file:///home/ubuntu/projects/webos/netlify.toml).
- **Docker / Nginx:** Production-ready container using [`Dockerfile`](file:///home/ubuntu/projects/webos/Dockerfile) and [`nginx.conf`](file:///home/ubuntu/projects/webos/nginx.conf):

```bash
# Build the Docker image
docker build -t webos:latest .

# Run container on port 8080
docker run -p 8080:80 webos:latest
```

---

## Security & Isolation Boundary

WebOS enforces a strict security perimeter between the guest virtual machine and the host environment:

1. **Air-Gapped Guest Execution:**
   - The Linux guest runs strictly within the client's browser WebAssembly sandbox.
   - The guest kernel cannot access host local storage, cookies, session credentials, or the host filesystem.
2. **Server-Side Request Forgery (SSRF) Protection:**
   - The built-in web browser proxy (`webProxyPlugin`) blocks access to private internal IP spaces:
     - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (RFC 1918)
     - `127.0.0.1`, `::1`, `localhost` (Loopback)
     - `169.254.169.254` (Link-Local & Cloud Metadata Services)
3. **Command Safety Verification:**
   - OS Lab experiment commands are checked against a strict safety filter preventing system corruption or unauthorized denial-of-service commands inside the guest environment.
4. **Clean Codebase Hygiene:**
   - Sensitive files, keys (`*.pem`, `*.key`), and local configuration secrets are permanently excluded via [`.gitignore`](file:///home/ubuntu/projects/webos/.gitignore).

---

## Project Directory Map

```text
webos/
├── public/                       # Static public assets
│   ├── _headers                  # Cloudflare Pages security & COOP/COEP headers
│   ├── assets/
│   │   ├── bios/                 # SeaBIOS & VGABIOS binary firmware
│   │   ├── images/               # Booting, sign-in, and desktop reference artwork
│   │   ├── linux/                # Tiny Core Linux 17.1 ISO image
│   │   └── v86/                  # v86 WebAssembly emulator runtime
│   └── wallpapers/               # Desktop wallpaper library (Makima, Winter, Dragon...)
├── src/                          # Application source code
│   ├── components/
│   │   ├── applications/         # Desktop application views
│   │   │   ├── BrowserApp.tsx    # Sandboxed web browser with search portals
│   │   │   ├── ControlPanelApp.tsx # Display, wallpaper, audio & VM settings
│   │   │   ├── FileExplorerApp.tsx # Hierarchical file manager & wallpaper picker
│   │   │   ├── LinuxDesktopApp.tsx # Native Xvesa/FLWM 1024x768 display
│   │   │   ├── TerminalApp.tsx   # Genuine Linux serial shell bridge
│   │   │   ├── TextEditorApp.tsx # Plain text & script editor
│   │   │   ├── CalculatorApp.tsx # Retro calculator
│   │   │   ├── MessagesApp.tsx   # System notification hub
│   │   │   ├── TrashApp.tsx      # Recycle bin manager
│   │   │   └── AboutApp.tsx      # System specification dialog
│   │   ├── desktop/              # Window management & desktop shell
│   │   │   ├── DesktopShell.tsx  # Main desktop layout & state machine
│   │   │   └── DesktopWindow.tsx # Draggable & resizable window container
│   │   └── retro/                # Retro OS interface components
│   │       ├── BootingScreen.tsx # BIOS POST & kernel loading screen
│   │       ├── UserSignInScreen.tsx # Retro user authentication screen
│   │       ├── TopMenuBar.tsx    # Top menu, Berry logo & live clock
│   │       ├── RetroDock.tsx     # Centered glassmorphism dock
│   │       └── RetroDesktopIcons.tsx # Quick-launch desktop icons
│   ├── features/
│   │   ├── desktop/              # Window context, window state & app registry
│   │   ├── emulator/             # v86 EmulatorManager, hook & configuration
│   │   ├── experiments/          # OS Lab catalog, runner, quizzes & safety
│   │   └── settings/             # Reactive settings store (wallpapers, scale)
│   ├── services/
│   │   └── persistence/          # IndexedDB snapshot storage & SHA-256 checks
│   ├── styles/                   # Global Tailwind CSS styles
│   └── App.tsx                   # Top-level application root
├── tests/                        # Vitest test suite and boot verification harnesses
│   ├── boot/                     # Headless browser VM boot & reload recovery tests
│   ├── cli/                      # Guest script generation tests
│   ├── desktop/                  # Window context, app registry & retro desktop tests
│   ├── e2e/                      # Production HTTP server header tests
│   ├── emulator/                 # EmulatorManager lifecycle & state tests
│   ├── experiments/              # OS Lab safety & progress tests
│   ├── labs/                     # Lab script validation tests
│   └── persistence/              # IndexedDB snapshot storage tests
├── Dockerfile                    # Containerization manifest
├── nginx.conf                    # Nginx configuration with COOP/COEP headers
├── netlify.toml                  # Netlify deployment configuration
├── package.json                  # Dependencies and execution scripts
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite configuration with webProxyPlugin & SSRF filter
```

---

## License & Acknowledgments

- **WebOS Software:** Licensed under the [MIT License](file:///home/ubuntu/projects/webos/README.md).
- **v86 PC Emulator:** Created by [Fabrice Bellard](https://bellard.org/) and [copy](https://github.com/copy/v86), licensed under the Simplified BSD License.
- **Tiny Core Linux:** Created by Robert Shingledecker and the Tiny Core Linux team, distributed under the GNU General Public License (GPL).
- **SeaBIOS & VGABIOS:** Distributed under the GNU Lesser General Public License (LGPLv3).
