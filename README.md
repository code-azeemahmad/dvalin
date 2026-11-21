# WebOS — Browser-Hosted x86 Linux Operating System

WebOS is a browser-hosted operating system environment running a genuine 32-bit x86 Linux guest (Tiny Core Linux 17.1, Linux kernel 6.18.35-tinycore) inside the v86 PC emulator, wrapped in a React desktop environment.

This is not a mock terminal or simulated JavaScript shell: Linux executes all guest commands, manages virtual memory, operates the filesystem, and schedules real guest processes.

---

## Key Features

- **Genuine x86 Linux Guest:** Runs Tiny Core Linux 17.1 (i686) with BusyBox v1.36.1 and Linux kernel 6.18.35 via WebAssembly.
- **Windowed React Desktop:** Full desktop shell with draggable, resizable, minimizable, and maximizable windows, bottom taskbar, start menu, desktop icons, and customizable ambient wallpapers.
- **Persistent State Snapshots:** Captures complete VM memory snapshots into browser IndexedDB with SHA-256 integrity verification, enabling cold session recovery in **under 1 second**.
- **Interactive OS Laboratory:** 20 structured, hands-on operating systems experiments across 7 categories (Processes, Memory, Filesystem, Permissions, Shell, Kernel, Devices) with live step runners and knowledge-check quizzes.
- **Real-Time Telemetry:** Bounded 3000ms resource monitoring strictly separating guest Linux kernel metrics (`/proc/uptime`, `/proc/meminfo`, process count) from host browser metrics.
- **Dual Display Modes:** Integrated text-mode monospace terminal and high-resolution graphical framebuffer (1024×768 @ 32bpp) running FLWM and Xvesa.
- **Graceful ACPI Power Management:** Clean guest shutdown (`sudo poweroff`), reboot (`sudo reboot`), and hardware reset.

---

## Architecture & Technology Stack

```
+---------------------------------------------------------------------------------+
|                                Host Web Browser                                 |
|  +---------------------------------------------------------------------------+  |
|  |                          React Desktop Shell                              |  |
|  |  - Window Manager, Taskbar, Start Menu, Settings, About                   |  |
|  |  - OS Lab App (Catalog, Step Runner, Visualizations, Quizzes)             |  |
|  |  - Persistence Service (IndexedDB: webos_persistence_db, SHA-256)         |  |
|  |  - Resource Monitoring (3000ms bounded guest vs host telemetry)           |  |
|  +-------------------------------------+-------------------------------------+  |
|                                        | (WebAssembly & Serial Stream)          |
|                                        v                                        |
|  +---------------------------------------------------------------------------+  |
|  |                       v86 x86 PC Emulator (WASM)                          |  |
|  |  - Virtual Hardware: 32-bit x86 CPU, 128 MB RAM, 8 MB Cirrus/Bochs VGA    |  |
|  |  - Firmware: SeaBIOS 128 KB, VGABIOS 36 KB                                |  |
|  |  +---------------------------------------------------------------------+  |  |
|  |  | Tiny Core Linux 17.1 Guest                                          |  |  |
|  |  | - Kernel: Linux 6.18.35-tinycore (i686)                             |  |  |
|  |  | - Shell & Userspace: BusyBox v1.36.1 ash shell (221 applets)        |  |  |
|  |  | - GUI: Xvesa 1024x768 framebuffer + FLWM window manager             |  |  |
|  |  | - Workspace Sandbox: /tmp/webos-experiments/<expId>/                 |  |  |
|  |  +---------------------------------------------------------------------+  |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

### Technology Versions:
- **Host Application:** React 18.3, TypeScript 5.6, Tailwind CSS 3.4, Vite 5.4, Lucide React
- **Emulator:** v86 0.5.473 (WebAssembly)
- **Guest OS:** Tiny Core Linux 17.1 (i686)
- **Guest Kernel:** Linux 6.18.35-tinycore
- **Test Framework:** Vitest 2.1 (71 unit tests passing)

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js v18.x or v20.x LTS
- npm v9+ or v10+

### 2. Install & Run
```bash
# Clone the repository
git clone https://github.com/example/webos.git
cd webos

# Install dependencies
npm ci

# Start local development server with COOP/COEP headers
npm run dev
```
Open `http://localhost:5173/` in Google Chrome, Microsoft Edge, or Mozilla Firefox.

### 3. Production Build & Preview
```bash
# Typecheck and build production static bundle
npm run build

# Preview production build locally on port 4173
npm run preview
```

---

## Running Automated Verification Tests

WebOS includes comprehensive unit tests and automated live guest VM verification harnesses:

```bash
# Run all 71 unit tests
npm test -- --run

# Run TypeScript compiler check
npx tsc --noEmit

# Run production HTTP headers & asset verification
node tests/e2e/test-production-server.mjs

# Run live guest browser reload recovery test
node tests/boot/test-phase6-reload-recovery.mjs

# Run live guest 12-stage OS experiments test
node tests/boot/test-phase7-experiments.mjs
```

---

## Deployment

WebOS compiles to a pure static frontend in `dist/`. Because it utilizes WebAssembly and high-resolution timers, the production server must deliver Cross-Origin Isolation headers:
```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

Ready-to-use deployment configurations are included:
- **Cloudflare Pages:** `public/_headers`
- **Netlify:** `netlify.toml`
- **Docker / Nginx:** `Dockerfile` and `nginx.conf`

See [Deployment Guide](file:///home/ubuntu/projects/webos/docs/deployment/DEPLOYMENT_GUIDE.md) for detailed platform walkthroughs.

---

## Documentation Directory Map

- [Architecture & Repository Audit](file:///home/ubuntu/projects/webos/docs/release/ARCHITECTURE_AUDIT.md)
- [Comprehensive Regression Results](file:///home/ubuntu/projects/webos/docs/release/REGRESSION_TEST_RESULTS.md)
- [Browser End-to-End Testing](file:///home/ubuntu/projects/webos/docs/release/BROWSER_E2E_RESULTS.md)
- [Security Threat Model](file:///home/ubuntu/projects/webos/docs/security/THREAT_MODEL.md)
- [Security Audit & Vulnerability Assessment](file:///home/ubuntu/projects/webos/docs/security/SECURITY_AUDIT.md)
- [Browser Compatibility Matrix](file:///home/ubuntu/projects/webos/docs/release/BROWSER_COMPATIBILITY.md)
- [Performance & Reliability Report](file:///home/ubuntu/projects/webos/docs/release/PERFORMANCE_REPORT.md)
- [Production Deployment Guide](file:///home/ubuntu/projects/webos/docs/deployment/DEPLOYMENT_GUIDE.md)
- [Production Verification Report](file:///home/ubuntu/projects/webos/docs/deployment/PRODUCTION_VERIFICATION.md)
- [User Guide & Operating Manual](file:///home/ubuntu/projects/webos/docs/release/USER_GUIDE.md)
- [Troubleshooting & Diagnostics](file:///home/ubuntu/projects/webos/docs/release/TROUBLESHOOTING.md)
- [Release Notes (v0.8.0)](file:///home/ubuntu/projects/webos/docs/release/RELEASE_NOTES.md)
- [Phase 8 Implementation Report](file:///home/ubuntu/projects/webos/docs/release/PHASE8_IMPLEMENTATION_REPORT.md)

---

## License

This project is licensed under the MIT License. Linux guest assets are subject to the GPL and Tiny Core Linux distribution terms.
