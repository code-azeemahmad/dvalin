# WebOS — Troubleshooting & Diagnostic Guide

This guide addresses common questions, operating conditions, and potential issues when using or deploying WebOS.

---

## 1. Emulator Startup & Boot Issues

### Issue: "Virtual machine fails to start" or displays "Stopped"
- **Cause:** WebAssembly is disabled or blocked in the browser, or required binary assets failed to download.
- **Resolution:**
  1. Open Developer Tools (F12) -> Console. Look for WebAssembly or network errors.
  2. Verify that `v86.wasm`, `seabios.bin`, `vgabios.bin`, and `Core-17.1.iso` are present in `public/assets/` and served with HTTP 200.
  3. Ensure that your browser supports WebAssembly (`window.WebAssembly !== undefined`).

### Issue: Bootloader stops at "Press ENTER to boot"
- **Cause:** ISOLINUX bootloader is waiting for keyboard confirmation.
- **Resolution:** WebOS automatically sends the enter scancode (`0x1c`) upon menu detection. If running in a custom harness, call `keyboard_send_scancodes([0x1c, 0x9c])`.

### Issue: Display is black or blank
- **Cause:** Linux kernel is uncompressing or configuring the framebuffer during early boot (~30–45s).
- **Resolution:** Allow 45–60 seconds for the initial cold boot. In graphical mode, the display will automatically resize to 1024x768 once Xvesa and FLWM initialize.

---

## 2. Input, Display & Window Issues

### Issue: Keystrokes are not registering in the guest terminal or desktop
- **Cause:** The browser element does not have active input focus.
- **Resolution:** Click directly inside the Terminal window or the Linux Desktop display canvas. When focused, keyboard input is forwarded to the emulated PC.

### Issue: Mouse pointer is trapped inside the Linux Desktop
- **Cause:** Pointer Lock API is active.
- **Resolution:** Press the **Escape** (`Esc`) key at any time to release the mouse pointer back to your host desktop.

### Issue: Display appears blurry or distorted on High-DPI screens
- **Cause:** Device pixel ratio scaling.
- **Resolution:** Open **Settings** -> **Display & Theme** and adjust the Display Scaling setting to "100% (Pixel-Perfect)".

---

## 3. Persistence & Snapshot Issues

### Issue: "Snapshot restore failed: ChecksumMismatchError"
- **Cause:** Snapshot data in IndexedDB was modified, truncated, or corrupted.
- **Resolution:** WebOS strictly rejects corrupted snapshot data to prevent erratic CPU behavior or kernel crashes. Delete the corrupted snapshot record in Settings -> "Sessions & Storage" and save a fresh snapshot.

### Issue: "Snapshot restore failed: HardwareMismatchError"
- **Cause:** Attempting to restore a snapshot taken under a different hardware configuration (e.g., 64 MB RAM vs 128 MB RAM).
- **Resolution:** Snapshots require exact hardware parity. Restore only snapshots matching your current virtual hardware configuration.

### Issue: "QuotaExceededError" when saving snapshot
- **Cause:** Browser storage quota for the domain has been reached.
- **Resolution:**
  1. Open Settings -> "Sessions & Storage" and check the Quota Meter.
  2. Delete older snapshots using the "Delete" button to free storage.
  3. Ensure your browser is not in Private / Incognito mode with restricted storage limits.

---

## 4. OS Lab Issues

### Issue: "Command failed safety validation"
- **Cause:** The command entered contains a prohibited pattern (e.g. `rm -rf /`, `mkfs`, raw block device writes, fork bombs, poweroff).
- **Resolution:** The OS Lab restricts commands that would permanently destabilize the virtual machine. Use standard non-destructive POSIX commands within the lab guidelines.

### Issue: "Virtual machine is not in running state"
- **Cause:** Attempting to execute an experiment step while the VM is stopped or paused.
- **Resolution:** Start the machine from the toolbar or Start Menu before running real-guest experiment steps.

---

## 5. Deployment & Production Server Issues

### Issue: WebAssembly errors with `SharedArrayBuffer` in production
- **Cause:** Missing Cross-Origin Isolation headers (`COOP` and `COEP`).
- **Resolution:** Verify your static server serves:
  ```http
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
  ```
  Refer to `docs/deployment/DEPLOYMENT_GUIDE.md` for platform-specific configurations.
