# WebOS — Browser Compatibility Matrix & Capabilities Assessment

**Date:** November 21, 2026  
**Evaluator:** Antigravity / Browser Compatibility Specialist  
**Evaluation Scope:** WebAssembly execution, SharedArrayBuffer/Atomics, cross-origin isolation (COOP/COEP), IndexedDB, Web Crypto, canvas rendering, fullscreen, pointer lock, and memory APIs.  

---

## 1. Browser Support Matrix

| Browser Engine | Representative Browsers | Platform | Minimum Tested / Supported Version | Status | Notes |
|---|---|---|---|---|---|
| **Chromium** | Google Chrome, Microsoft Edge, Brave, Opera | Linux, macOS, Windows, Android | Chrome 96+ / Edge 96+ | **Supported** | Full feature set, including `performance.memory` telemetry. |
| **Gecko** | Mozilla Firefox | Linux, macOS, Windows, Android | Firefox 95+ | **Supported** | Requires COOP/COEP for SharedArrayBuffer. `performance.memory` displays "Browser Restricted" gracefully. |
| **WebKit** | Apple Safari | macOS, iOS, iPadOS | Safari 15.4+ | **Supported** | Full support for WebAssembly and IndexedDB. Requires HTTPS in production. |

---

## 2. Browser API Dependency Analysis

### 2.1 WebAssembly & x86 Emulation
- **Requirement:** Standard WebAssembly MVP with 32-bit memory addressing (`WebAssembly.Memory`).
- **Compatibility:** Supported across Chromium 57+, Firefox 52+, Safari 11+.
- **Graceful Failure:** If `window.WebAssembly` is undefined, `EmulatorDisplay` renders an informative error prompt instructing the user to enable WebAssembly.

### 2.2 Cross-Origin Isolation (COOP & COEP)
- **Requirement:**
  ```http
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
  ```
- **Rationale:** Enables high-resolution timers (`performance.now()`) and optional SharedArrayBuffer without breaking third-party credentialless asset loading.
- **Compatibility:** Supported in Chromium 96+, Firefox 95+, Safari 15.4+.
- **Verification:** Verified via `tests/e2e/test-production-server.mjs`.

### 2.3 IndexedDB & Persistent Snapshots
- **Requirement:** `window.indexedDB` and `IDBTransaction`.
- **Compatibility:** Universally supported in all modern browsers.
- **Behavior:** Stores ~86 MB serialized v86 memory snapshots. In private/incognito browsing windows, IndexedDB is memory-backed and will be discarded upon tab closure (documented in user guide).

### 2.4 Web Crypto API
- **Requirement:** `crypto.subtle.digest('SHA-256', buffer)`.
- **Compatibility:** Supported in all modern browsers under secure contexts (HTTPS or localhost).
- **Fallback:** Includes pure TypeScript deterministic hash fallback for non-secure / mock environments.

### 2.5 Canvas Rendering & Display Scaling
- **Requirement:** 2D canvas context (`canvas.getContext('2d')`) for VGA framebuffer.
- **Compatibility:** Universally supported. Supports arbitrary scaling (1024x768 native resolution with CSS scaling and pixel density scaling).

### 2.6 Fullscreen & Pointer Lock APIs
- **Requirement:** `element.requestFullscreen()` and `canvas.requestPointerLock()`.
- **Compatibility:** Supported across desktop Chromium, Firefox, and Safari.
- **User Gesture Requirement:** Browsers require explicit user interaction (click) to enter fullscreen or lock the mouse pointer. Both actions are triggered via dedicated UI buttons with Esc release keys.

### 2.7 Telemetry APIs (`performance.memory`)
- **Compatibility:** Proprietary Chromium API.
- **Graceful Degradation:** When absent (Firefox, Safari), `ResourceMonitoringService` sets `jsHeapUsedMb: 0` and `ResourceMonitorView` renders "Browser Restricted" while guest Linux metrics (`/proc/uptime`, `/proc/meminfo`) continue updating with full precision.

---

## 3. Mobile & Touch Screen Considerations
- **Status:** **Limited / Desktop Recommended**.
- **Reason:** The guest operating system runs Tiny Core Linux with FLWM and BusyBox ash shell, which relies on physical keyboard input and mouse pointer hovering. On mobile devices, an on-screen keyboard can be used for shell commands, but full desktop multitasking is optimized for desktop screen sizes (>= 1024x768).

---

## 4. Environment Limitations
In headless Linux server environments without a desktop display or Chrome remote debugging port, direct browser devtools automation is bypassed in favor of live Node.js guest verification harnesses and automated production server header inspection.
