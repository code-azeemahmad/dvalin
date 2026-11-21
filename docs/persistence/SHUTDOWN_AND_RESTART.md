# Shutdown, Reboot, and Teardown Procedures

**Project:** WebOS — Browser-Hosted x86 Linux Environment  
**Component:** Guest & Emulator Lifecycle Operations  
**Phase:** Phase 6 — Persistence & System Management  
**Date:** 2026-11-21  
**Status:** Completed & Empirically Verified  

---

## 1. Executive Summary

WebOS must manage four distinct types of termination and restart procedures:
1. **Graceful ACPI / Guest Shutdown (`sudo poweroff`):** Safely halts processes and syncs in-guest filesystems.
2. **Guest OS Reboot (`sudo reboot`):** Reboots the Linux kernel inside the running virtual machine.
3. **Emulator Hardware Reset:** Emulates pressing the physical PC reset button.
4. **Host Emulator Teardown (`stop` & `destroy`):** Halts the WebAssembly engine and cleans up host browser resources.

---

## 2. Procedure Details

### 2.1 Graceful ACPI Shutdown (`gracefulShutdown`)
- **Command:** `sudo poweroff` dispatched via keyboard/serial.
- **Behavior:**
  1. BusyBox `init` sends `SIGTERM` to all running processes, followed by `SIGKILL`.
  2. In-memory buffers are flushed to disk/tmpfs via `sync`.
  3. Filesystems are remounted read-only.
  4. The Linux kernel issues an ACPI poweroff or halt instruction (`hlt`).
  5. v86 emits the `emulator-stopped` event.
  6. `EmulatorManager` detects the stop event, invokes `destroy()`, frees WebAssembly memory, and sets status to `'stopped'`.
- **Timeout Safety:** If the guest does not halt within 8 seconds, `EmulatorManager` forces emulator termination.

### 2.2 Guest OS Reboot (`safeRestart('guest-reboot')`)
- **Command:** `sudo reboot` dispatched to guest.
- **Behavior:**
  1. Processes are terminated cleanly.
  2. The kernel invokes a CPU triple-fault or keyboard controller reset pulse (0xFE to port 0x64).
  3. SeaBIOS re-initializes and the ISOLINUX boot menu reappears.
  4. Because tmpfs is in RAM, rebooting from ISO starts with a clean default environment.

### 2.3 Hardware Reset (`safeRestart('emulator-reset')`)
- **Method:** `v86Instance.restart()`
- **Behavior:**
  - Instantly resets CPU registers (EIP = 0xFFF0, CS = 0xF000) and clears memory, exactly like pressing the physical reset switch on an x86 motherboard.

### 2.4 Host Emulator Destroy (`destroy`)
- **Method:** `v86Instance.destroy()`
- **Behavior:**
  - Cancels internal requestAnimationFrame / timer loops.
  - Clears screen container DOM canvas.
  - Releases WebAssembly linear memory instance.
  - Resets all listeners and restores state to `'idle'`.
