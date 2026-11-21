# WebOS — Phase 3 Initial Project Audit

**Date:** 2026-11-21  
**Author:** Lead Software Architect & Systems Engineer  
**Status:** Complete  
**Scope:** Architecture inspection, Phase 2 exit verification audit, Phase 3 desktop environment plan.

---

## 1. Existing Architecture & Repository State

WebOS is constructed with a strict two-environment boundary:
1. **Browser Host Environment:**
   - **Framework:** React 18 with TypeScript 5.6, bundled via Vite 5.4.
   - **Styling:** Tailwind CSS with modern design tokens and Lucide React icons.
   - **State & Lifecycles:** Centralized singleton `EmulatorManager.ts` managing the `v86` WebAssembly instance lifecycle, typed status state machine (`idle`, `initializing`, `booting`, `running`, `stopping`, `stopped`, `error`), and event bus subscriptions.
   - **React Integration:** `useEmulator.ts` hook isolating emulator subscriptions from UI component re-renders.
   - **DOM Structure:** `DesktopFrame` maintains `EmulatorDisplay` permanently mounted in the DOM to satisfy v86's canvas attachment contract, while `WelcomeScreen` and `BootScreen` are rendered as overlays.
2. **Guest Virtual Machine Environment:**
   - **PC Hardware Emulation:** `v86` version `0.5.473` running inside browser WebAssembly with 128 MB RAM, SeaBIOS rel-1.16.2, Cirrus VGA BIOS, and PS/2 keyboard/mouse controllers.
   - **Guest Operating System:** Tiny Core Linux 17.1 (32-bit x86/i686, Linux kernel 6.18.35-tinycore, BusyBox userland).
   - **Boot Media:** Dual-edition ISO support:
     - `Core-17.1.iso` (19.7 MB, MD5 `8d5efae4cbf4ba463fa012d29e58918e`): Fast command-line console.
     - `TinyCore-17.1.iso` (26.0 MB, MD5 `42db5663757add090857059c096a6801`): Graphical desktop with FLWM window manager, Xvesa, and wbar dock.

---

## 2. Verified Phase 2 Functionality

The following items have been verified with reproducible test evidence:
- **v86 WebAssembly & BIOS Asset Serving:** Dev server configured with COOP `same-origin` and COEP `credentialless` headers; assets (`v86.wasm`, `seabios.bin`, `vgabios.bin`, ISOs) load cleanly via HTTP 200.
- **Automated Bootloader Prompt Dispatch:** `EmulatorManager.ts` detects the ISOLINUX bootloader menu (`Press ENTER to boot` / `boot:`) and dispatches Enter scancodes, bypassing the 60-second bootloader timeout.
- **Real Linux Shell Execution:** Verified in guest CLI shell (`tc@box:~$ `) with actual output captured:
  - `uname -a` -> `Linux box 6.18.35-tinycore #1 SMP Fri Jun 19 00:05:19 UTC 2026 i686 GNU/Linux`
  - `pwd` -> `/home/tc`
  - `ls -la /etc/os-release` -> `-rw-r--r-- 1 root root 287 Jun 23 13:55 /etc/os-release`
  - `cat /etc/os-release` -> `NAME=TinyCore`, `VERSION="17.1"`, `ID=tinycore`
- **Graphical Framebuffer Activation:** `TinyCore-17.1.iso` boots into genuine Xvesa, executes 3.69 billion instructions, and activates VESA graphics mode at `1024x768 @ 32bpp`.
- **Display & Input Forwarding:** PS/2 keyboard scancodes and text streams are received by the guest; click-to-focus and mouse pointer lock are wired to `v86.lock_mouse()`; <kbd>Esc</kbd> releases pointer lock.
- **Lifecycle & Stability:** 12/12 unit tests passing in `tests/emulator/EmulatorManager.test.ts` verifying singleton enforcement, config validation, double-boot prevention, error recovery, and teardown. Production build succeeds cleanly in 3.4s.

---

## 3. Unverified Phase 2 Claims & Gap Analysis

While Phase 2 successfully verified the hardware resolution switch to `1024x768 @ 32bpp` and execution of CLI shell commands, several end-to-end user experience aspects require explicit verification and engineering in Phase 3:
1. **Interactive Guest GUI App Launch:** Verify launching a guest GUI application (such as `aterm` or `editor` from the FLWM desktop / wbar dock) and confirming mouse/keyboard interaction inside the guest window.
2. **Dedicated Guest Terminal vs Serial Stream:** In Phase 2, terminal verification occurred via VGA screen buffer scraping in the CLI harness and a rudimentary serial drawer. A true, full-featured terminal application connected to the guest (with history, clear, resize, and scrollback) is needed for Phase 3.
3. **Windowed Guest Display:** In Phase 2, the emulator display was centered on the screen. For a true WebOS desktop experience, the guest display must be integrated as an interactive desktop window/workspace within the host window manager without breaking v86's DOM canvas binding.

---

## 4. Existing Components That Can Be Reused

- `EmulatorManager.ts`: Robust singleton lifecycle service, event subscriptions, scancode sender, text sender, mouse lock, and fullscreen.
- `useEmulator.ts`: Reactive React hook providing status, logs, serial output, and dimensions.
- `config.ts`: `DEFAULT_EMULATOR_CONFIG`, `GUEST_EDITIONS`, and `TINYCORE_PROFILE`.
- `EmulatorDisplay.tsx`: Core DOM container for v86 canvas and monospace text buffer.
- `BootScreen.tsx`: Boot progress indicator and diagnostic log overlay.
- `WelcomeScreen.tsx`: Pre-boot guest edition selection and hardware specifications.

---

## 5. Technical Debt and Risks

1. **v86 Canvas Lifecycle in Window Manager:**
   - *Risk:* If a window containing the `#v86-screen-container` unmounts when closed or minimized, v86's internal canvas reference will be detached or destroyed.
   - *Mitigation:* The emulator screen DOM container must remain permanently mounted in the React DOM tree. Window minimization/closing hides the window frame or preserves the container in an offscreen/portal container while keeping the DOM node intact.
2. **Keyboard Conflict Between Host and Guest:**
   - *Risk:* Host keyboard shortcuts (e.g. window management, search) could collide with guest Linux shortcuts (e.g. `Ctrl+C`, `Ctrl+Z`, terminal shortcuts).
   - *Mitigation:* Strictly scope keyboard capture to when the guest display or guest terminal has explicit focus.
3. **Memory Limits in WebAssembly:**
   - *Risk:* Emulated RAM (128 MB) + WebAssembly heap + host React state can consume 300–400 MB of browser memory.
   - *Mitigation:* Prevent memory leaks by cleaning up window state and avoiding heavy background canvas redraws when not focused.

---

## 6. Proposed Phase 3 Component Architecture

```text
src/
├── components/
│   ├── desktop/
│   │   ├── DesktopShell.tsx          # Main host desktop layout & viewport manager
│   │   ├── DesktopWallpaper.tsx      # Configurable wallpaper & background
│   │   ├── DesktopIcons.tsx          # Desktop shortcuts (Linux VM, Terminal, Settings, About)
│   │   ├── Taskbar.tsx               # Bottom taskbar with Start button, running windows, system tray
│   │   ├── StartMenu.tsx             # Application launcher (Host apps + confirmed Guest apps)
│   │   ├── SystemTray.tsx            # Clock, status indicators, VM status, fullscreen toggle
│   │   ├── WindowManager.tsx         # Host window manager orchestrator
│   │   └── DesktopWindow.tsx         # Draggable, resizable, minimizable, maximizable window frame
│   ├── emulator/
│   │   ├── EmulatorDisplay.tsx       # Permanent DOM container for v86 VGA canvas & text buffer
│   │   └── EmulatorControls.tsx      # Start, Stop, Reset, Edition switch toolbar
│   ├── applications/
│   │   ├── LinuxDesktopApp.tsx       # Window housing the live v86 Tiny Core Linux guest
│   │   ├── TerminalApp.tsx           # Full-featured terminal connected to the Linux guest
│   │   ├── SettingsApp.tsx           # Host appearance, wallpaper, display scaling, edition selection
│   │   └── AboutApp.tsx              # System specs, architecture details, licenses
│   └── system/
│       ├── BootScreen.tsx            # Loading / progress overlay
│       └── WelcomeScreen.tsx         # Pre-boot edition selection & overview
├── features/
│   ├── desktop/
│   │   ├── WindowContext.tsx         # Typed window state manager (open, close, minimize, focus, z-index)
│   │   ├── types.ts                  # WindowState, AppDefinition, ThemeConfig interfaces
│   │   └── appRegistry.ts            # Registry of available host & guest applications
│   ├── settings/
│   │   └── useSettings.ts            # Persistent host preferences (wallpaper, scaling, sound)
│   └── emulator/
│       ├── EmulatorManager.ts        # Existing singleton service
│       ├── useEmulator.ts            # Existing React hook
│       └── config.ts                 # Configuration profiles
```

---

## 7. Implementation Sequence

1. **Step 1: Desktop State & Window Management Foundation**
   - Create typed `WindowContext` supporting `openWindow`, `closeWindow`, `minimizeWindow`, `maximizeWindow`, `focusWindow`, `moveWindow`, `resizeWindow`, and z-index stacking.
   - Implement `DesktopWindow.tsx` with title bar dragging, minimize/maximize/close buttons, and viewport bounds checking.
2. **Step 2: Desktop Shell & System Taskbar**
   - Implement `DesktopShell`, `DesktopWallpaper`, `DesktopIcons`, and `Taskbar`.
   - Implement `StartMenu` with application launcher and `SystemTray` with real local clock, VM state pill, and fullscreen button.
3. **Step 3: Real Linux Guest Window Integration**
   - Integrate `EmulatorDisplay` into `LinuxDesktopApp` window.
   - Maintain permanent DOM attachment so minimizing or moving the window preserves the guest's running state, Xvesa graphics, and input listeners.
4. **Step 4: Interactive Terminal Application**
   - Implement `TerminalApp.tsx` connected to the genuine Linux guest.
   - Support command history (<kbd>↑</kbd>/<kbd>↓</kbd>), command execution, clear screen, and real guest output display.
5. **Step 5: Settings & About Applications**
   - Implement `SettingsApp.tsx` with wallpaper selection, display scaling, edition switching, and local storage persistence.
   - Implement `AboutApp.tsx` with architecture specs, kernel version, and license information.
6. **Step 6: Testing & Quality Assurance**
   - Unit tests for window manager state, application registry, and settings persistence.
   - Component tests for desktop shell, window controls, and terminal interactions.
   - Typecheck and production bundle build verification.
7. **Step 7: Documentation & Roadmap Updates**
   - Create `docs/design/desktop-shell.md`, `docs/design/window-management.md`, `docs/testing/phase-3-verification.md`, and `project-management/phase-3-implementation-report.md`.
   - Update `tasks.md`, `progress.md`, `changelog.md`, and `risks.md`.

---

## 8. Blockers & Dependencies

- None. Both `Core-17.1.iso` (19.7 MB) and `TinyCore-17.1.iso` (26.0 MB), SeaBIOS, and WebAssembly runtime are verified and ready on disk.
- Vite dev server is running and delivering assets with appropriate security headers.
