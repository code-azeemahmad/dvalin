# WebOS — Security Threat Model

## 1. System Overview & Trust Boundaries

WebOS operates as a browser-hosted x86 PC virtual machine. Emulation executes in WebAssembly (`v86`), while the host application executes in React. The guest operating system is a genuine 32-bit Linux distribution (Tiny Core Linux 17.1).

### Trust Boundaries:
1. **User / Host Machine Boundary:** The physical user and host operating system running the web browser.
2. **Browser Engine / Sandbox Boundary:** The browser tab sandbox (V8 JavaScript engine, DOM, IndexedDB, Web Crypto, WebAssembly runtime).
3. **Host Web Application Boundary:** React components, application state, window manager, and services.
4. **Guest Virtual Machine Boundary:** Emulated x86 CPU, memory framebuffer, SeaBIOS, virtual disks, and guest Linux kernel.
5. **Guest In-OS Boundary:** Unprivileged guest user (`tc`) vs superuser (`root`), and isolated experiment workspaces (`/tmp/webos-experiments/`).

```
+---------------------------------------------------------------------------------+
|                                Host Operating System                            |
|  +---------------------------------------------------------------------------+  |
|  |                          Web Browser Sandbox                              |  |
|  |  +---------------------------------------------------------------------+  |  |
|  |  |                     WebOS React Application                         |  |  |
|  |  |  - Window Manager, Settings, App Registry, Start Menu               |  |  |
|  |  |  - ExperimentRunner, Safety Engine, Resource Monitor               |  |  |
|  |  |  - SnapshotStorage (IndexedDB: webos_persistence_db)                |  |  |
|  |  +----------------------------------+----------------------------------+  |  |
|  |                                     | (WebAssembly & Serial I/O)           |  |
|  |                                     v                                      |  |
|  |  +---------------------------------------------------------------------+  |  |
|  |  |                    v86 Emulator (WebAssembly)                       |  |  |
|  |  |  +---------------------------------------------------------------+  |  |
|  |  |  | Linux Kernel 6.18.35-tinycore (i686)                          |  |  |
|  |  |  | - User Space: BusyBox ash, aterm, editor                      |  |  |
|  |  |  | - Filesystem: rootfs (read-only ISO), tmpfs (/tmp)            |  |  |
|  |  |  | - Workspace Sandbox: /tmp/webos-experiments/<expId>/        |  |  |
|  |  |  +---------------------------------------------------------------+  |  |
|  |  +---------------------------------------------------------------------+  |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 2. Asset Identification

| Asset | Description | Sensitivity | Impact of Compromise |
|---|---|---|---|
| **Host System & Files** | The user's actual computer, files, and credentials | Critical | Host compromise (prevented by browser sandbox) |
| **Guest VM Memory** | 128 MB RAM containing running guest kernel and processes | Medium | Guest crash, data loss within VM |
| **Guest Filesystem** | In-memory files created in `/home/tc/` or `/tmp/` | Low–Medium | Loss of session files |
| **Snapshot Storage** | Serialized VM memory buffers stored in IndexedDB | Medium | Corrupted restore, browser quota exhaustion |
| **Guest Command Channel** | Host-to-guest serial communication mechanism | Medium | Unintended command execution in guest |
| **Experiment Progress** | User progress and quiz scores in `localStorage` | Low | Reset of educational progress |
| **Static Assets** | WASM binary, SeaBIOS, Linux ISO | Medium | Tampering leads to guest boot failure |

---

## 3. Threat Actors & Scenarios

### 3.1 Malicious or Accidental Guest Shell Commands
- **Actor:** Learner or attacker typing commands into the terminal or OS Lab.
- **Threat:** Commands such as `rm -rf /`, `mkfs`, fork bombs, or raw memory writes could brick the virtual machine.
- **Mitigation:**
  - In OS Lab: `ExperimentSafety.validateCommand()` pre-filters commands against dangerous patterns.
  - In Terminal: Normal Linux terminal behavior is preserved; users can experiment freely. If the VM crashes, they can restart or restore a saved snapshot in sub-seconds.
  - Zero Host Escape: The browser WASM sandbox guarantees guest commands cannot touch the host OS or host filesystem.

### 3.2 Malicious Snapshot Import
- **Actor:** Attacker providing a malicious snapshot file to an unsuspecting user.
- **Threat:** Malformed snapshot buffer attempting to trigger memory exhaustion, prototype pollution, or XSS via metadata.
- **Mitigation:**
  - Size safety ceiling: Snapshots exceeding 512 MB are immediately rejected.
  - SHA-256 integrity validation verifies snapshot consistency.
  - Strict hardware configuration hash matching prevents loading snapshots into mismatched architectures.
  - Metadata sanitization: Snapshot names and descriptions are stripped and length-capped.
  - Snapshots are pure binary memory state for v86; they are never executed as host JavaScript.

### 3.3 Cross-Site Scripting (XSS) via Output Rendering
- **Actor:** Attacker crafting terminal output containing malicious HTML/JS payloads.
- **Threat:** Stored XSS executing in the host browser context if terminal output is rendered insecurely.
- **Mitigation:**
  - All terminal and experiment output is rendered as plain text inside `<pre><code>` elements or via canvas rendering.
  - `dangerouslySetInnerHTML` is never used for guest output or user-supplied strings.
  - Output ANSI codes are sanitized using regex in `ExperimentSafety.sanitizeOutput()`.

### 3.4 Cross-Origin & Memory Isolation
- **Actor:** Malicious third-party web pages running in other tabs.
- **Threat:** Spectre/Meltdown-style side-channel attacks on emulated memory.
- **Mitigation:**
  - `Cross-Origin-Opener-Policy: same-origin` isolates the browsing context group.
  - `Cross-Origin-Embedder-Policy: credentialless` prevents unauthorized cross-origin resource loading while enabling high-resolution timers and WebAssembly concurrency.

---

## 4. Residual Risks & Security Posture

1. **Denial of Service within Guest:** An intentional fork bomb in the unrestricted terminal will freeze the guest VM until reset. This is expected operating system behavior and is mitigated by the host restart control.
2. **Local Storage Privacy:** All data (IndexedDB snapshots and progress) remains strictly inside the user's local browser profile. No telemetry or filesystem data is ever transmitted to remote servers.
3. **No External Network Boundary:** Guest networking is disabled by default, completely eliminating external network attack surfaces from within the guest.
