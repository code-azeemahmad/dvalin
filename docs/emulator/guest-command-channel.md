# Host-to-Guest Command Channel & Application Launch Architecture

**Date:** 2026-11-21  
**Status:** Implemented & Verified  
**Scope:** Host desktop integration, guest command dispatch, and security isolation.

---

## 1. Architectural Mission

WebOS is designed strictly as a browser-hosted interface to an actual Linux guest running in `v86`. A core requirement of WebOS is:
> **Zero Simulation:** Never simulate Linux command output with hard-coded JavaScript responses, and never execute guest commands through a host shell, server command endpoint, or `eval`.

To enable host UI elements (such as the WebOS Start Menu, desktop icons, or automated test runners) to launch confirmed guest applications and execute diagnostics inside Tiny Core Linux, WebOS establishes a secure, explicit **Host-to-Guest Command Channel**.

```
+-------------------------------------------------------------------------+
| WebOS Host Desktop (React 18 / TypeScript 5.6)                          |
|                                                                         |
|  [Start Menu] ---> [openWindow('guest-aterm')]                          |
|       |                                                                 |
|       v                                                                 |
|  [WindowContext] --(ensure open/focused)--> [Tiny Core Linux Desktop]   |
|       |                                                                 |
|       v                                                                 |
|  [EmulatorManager.launchGuestApp("DISPLAY=:0 aterm &")]                 |
|       |                                                                 |
|       +-------------------+--------------------+                        |
|                           |                    |                        |
+---------------------------|--------------------|------------------------+
                            |                    |
             v86 Emulator WASM Boundary          |
                            |                    |
+---------------------------v--------------------v------------------------+
| Tiny Core Linux Guest Virtual Machine (x86 i686)                        |
|                                                                         |
|  PS/2 Keyboard Buffer               COM1 Serial Interface               |
|  (/dev/tty1 / Xvesa input)          (/dev/ttyS0 kernel console)         |
|           |                                                             |
|           v                                                             |
|  [Xvesa Display :0]                                                     |
|           |                                                             |
|           +---> Spawns genuine FLWM client: /usr/local/bin/aterm        |
|                                                                         |
+-------------------------------------------------------------------------+
```

---

## 2. Dual-Channel Architecture

WebOS provides two distinct, hardware-level channels into the guest virtual machine:

### 2.1 The Foreground PS/2 Keystroke Channel
- **Mechanism:** `EmulatorManager.sendText(text)` and `EmulatorManager.launchGuestApp(cmd)`.
- **Underlying v86 API:** `v86.keyboard_send_text(str)` and `v86.keyboard_send_scancodes(scancodes)`.
- **Target in Guest:** Whichever virtual console or X11 window currently holds focus. When Xvesa is active with FLWM, commands launched via this channel execute in the active desktop context (`DISPLAY=:0.0`).
- **Use Cases:**
  - Launching genuine guest GUI applications (`aterm`, `editor`, `cpanel`).
  - Automated bootloader prompts (sending <kbd>Enter</kbd> scancodes `[0x1c, 0x9c]` to ISOLINUX).
  - User typing forwarded from the browser canvas.

### 2.2 The COM1 Serial Interface Channel
- **Mechanism:** `EmulatorManager.sendSerialCommand(cmd)` and `onSerial(listener)`.
- **Underlying v86 API:** `v86.serial0_send(cmd)` and `v86.add_listener("serial0-output-byte", handler)`.
- **Target in Guest:** Linux `/dev/ttyS0`. Tiny Core kernel output is mirrored to the serial port when configured, providing an unbuffered diagnostic stream.
- **Use Cases:**
  - Diagnostic inspection and serial console logs (`serialOutputBuffer`).
  - Real-time kernel boot logging displayed in the host diagnostics drawer.

---

## 3. Application Registry & Launch Protocol

### 3.1 Registry Configuration
In `src/features/desktop/appRegistry.ts`, every application is assigned an explicit `target`:
- `target: 'host'`: A React application rendered in a host window (e.g. `linux-desktop`, `terminal`, `settings`, `about`).
- `target: 'guest'`: A genuine Linux binary executing inside the Tiny Core guest (e.g. `guest-aterm`, `guest-editor`, `guest-cpanel`).

```typescript
export interface AppDefinition {
  id: string;
  title: string;
  iconName: string;
  category: AppCategory;
  description: string;
  defaultSize: WindowSize;
  defaultPosition?: WindowPosition;
  isSingleton?: boolean;
  target?: 'host' | 'guest';
  guestCommand?: string;
  requiresGuestRunning?: boolean;
}
```

### 3.2 Launch Flow
When a user launches a guest application from the Start Menu or double-clicks a desktop icon:
1. `WindowContext.openWindow(appId)` inspects `app.target`.
2. Because `app.target === 'guest'`:
   - It identifies the `linux-desktop` host window.
   - It ensures the `linux-desktop` window is open, unminimized, and brought to the highest `zIndex`.
   - It forwards the command to `EmulatorManager.getInstance().launchGuestApp(app.guestCommand)`.
3. If the virtual machine is running, `launchGuestApp` appends a newline and sends the keystroke buffer to the guest.
4. Inside the guest, the ash shell receives `DISPLAY=:0 aterm &` and invokes the binary through Xvesa, displaying the application inside FLWM.
5. If the VM is stopped, `launchGuestApp` logs a warning and leaves the `linux-desktop` window open with the boot button ready.

---

## 4. Security & Isolation Guarantees

1. **No Host Access:** The guest has no access to host filesystem, cookies, localStorage, or environment variables.
2. **Unprivileged Guest Execution:** All guest commands run as the standard Tiny Core user `tc` (UID 1001), not `root`.
3. **No Eval / No Host Shell:** Host TypeScript code never evaluates strings with `eval()` or executes host OS shell processes. All operations take place strictly within the x86 WebAssembly emulator memory space.
