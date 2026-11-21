# FLWM Window Manager Configuration & Architecture in WebOS

**Date:** 2026-11-21  
**Status:** Verified & Documented  
**Guest Environment:** Tiny Core Linux 17.1 (i686), FLWM (Fast Light Window Manager)

---

## 1. Overview & Architectural Role

Tiny Core Linux 17.1 utilizes **FLWM (Fast Light Window Manager)** as its default graphical window manager when booted with the `TinyCore-17.1.iso` image. FLWM is built upon the **FLTK 1.3 (Fast Light Toolkit)** graphical widget library and is distributed via the `flwm.tcz` extension loaded automatically during boot from `/cde/optional/`.

FLWM was selected for Tiny Core Linux due to its micro-footprint (~48 KB binary), near-instantaneous startup, low memory overhead (< 2 MB resident RAM), and clean integration with Xvesa and the `wbar` desktop dock.

```
+-------------------------------------------------------------+
| WebOS Host Window: "Tiny Core Linux Desktop" (1060x830)     |
|  +-------------------------------------------------------+  |
|  | Guest Xvesa Framebuffer (1024x768 @ 32bpp)            |  |
|  |                                                       |  |
|  |  +------------------+     +------------------------+  |  |
|  |  | aterm (Terminal) |     | editor (FLTK Notepad)  |  |  |
|  |  | FLWM Left Border |     | FLWM Left Border       |  |  |
|  |  +------------------+     +------------------------+  |  |
|  |                                                       |  |
|  |  +-------------------------------------------------+  |  |
|  |  | wbar dock: [aterm] [editor] [cpanel] [appbrowser]|  |  |
|  |  +-------------------------------------------------+  |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

---

## 2. Window Layout & Visual Design

### 2.1 Title Bar Placement & Orientation
Standard FLWM places window title bars vertically along the **left edge** of every application window rather than horizontally across the top.
- **Title Bar Text:** Rendered vertically from bottom to top using FLTK font routines.
- **Title Bar Buttons:** Located at the top of the left vertical title strip:
  - **Top Button (Close):** Closes the window (equivalent to sending `WM_DELETE_WINDOW` or `Alt+F4`).
  - **Second Button (Maximize/Toggle):** Maximizes window or restores to previous geometry.
  - **Third Button (Minimize/Hide):** Iconifies/hides the window into the FLWM root menu.

### 2.2 Title Bar Color Customization
FLWM's title bar active and inactive colors are controlled by the guest environment variable `FLWM_TITLEBAR_COLOR`. In Tiny Core Linux 17.1, this is initialized inside `/etc/skel/.profile`:
```sh
export FLWM_TITLEBAR_COLOR="58:7D:AA"
```
The value consists of three colon-separated hexadecimal RGB components:
- `58` -> Red (88 / 255)
- `7D` -> Green (125 / 255)
- `AA` -> Blue (170 / 255)
This produces Tiny Core's signature soft slate-blue active title bar color.

---

## 3. Menu Architecture (`.wmx`)

FLWM dynamically generates its root window popup menu from a directory tree located in the user's home directory at `~/.wmx/`.

### 3.1 Menu Structure
```
/home/tc/.wmx/
├── Applications/
│   ├── aterm
│   └── editor
└── SystemTools/
    ├── Control_Panel -> /usr/local/share/applications/tinycore-cpanel.desktop
    ├── Editor -> /usr/local/share/applications/tinycore-editor.desktop
    ├── File_Tool -> /usr/local/share/applications/tinycore-filetool.desktop
    ├── Mount_Tool -> /usr/local/share/applications/tinycore-mnttool.desktop
    ├── Services -> /usr/local/share/applications/tinycore-services.desktop
    └── System_Stats -> /usr/local/share/applications/tinycore-stats.desktop
```

### 3.2 Menu Generation Sequence
1. During `startx`, `/usr/local/bin/setupdesktop` is executed.
2. `setupdesktop` executes `sudo flwm_initmenu`.
3. `flwm_initmenu` sources `/usr/local/bin/flwm_menu_common`, wipes `~/.wmx`, creates `~/.wmx/SystemTools/`, and creates executable shell launchers for all `/usr/local/share/applications/tinycore-*` desktop definitions.
4. When new extensions are loaded via `tce-load`, `desktop.sh` invokes `flwm_makemenu <extension>`, populating `~/.wmx/Applications/`.
5. `flwm_restart` restarts FLWM (`killall -HUP flwm`) to reload the menu tree without terminating active X clients.

### 3.3 Menu Invocation
- **Right-Click** or **Left-Click** anywhere on the unoccupied root desktop wallpaper displays the complete FLWM menu.
- Moving the mouse cursor over a menu category expands its submenus.
- Releasing the mouse button over an item launches that application.

---

## 4. Keyboard Shortcuts & Input Forwarding

FLWM provides built-in keyboard navigation for window operations:

| Shortcut | Action | Handling in WebOS |
|---|---|---|
| <kbd>Alt</kbd> + <kbd>Tab</kbd> | Cycle focus to next window | Captured by guest when mouse pointer is locked |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>Tab</kbd> | Cycle focus to previous window | Captured by guest when mouse pointer is locked |
| <kbd>Alt</kbd> + <kbd>F4</kbd> | Close currently focused window | Captured by guest |
| <kbd>Alt</kbd> + <kbd>Esc</kbd> | Lower current window to bottom of stack | Captured by guest |
| <kbd>Alt</kbd> + <kbd>Enter</kbd> | Maximize / restore current window | Captured by guest |

### Pointer Lock & Host Shortcut Isolation
To prevent the browser or host WebOS desktop from intercepting keybindings (such as <kbd>Alt</kbd>+<kbd>Tab</kbd> or <kbd>Tab</kbd>):
1. Clicking inside the guest canvas calls `EmulatorManager.getInstance().lockMouse()`, which engages the browser Pointer Lock API (`canvas.requestPointerLock()`).
2. When pointer lock is active, all keyboard scancodes are routed exclusively to the v86 PS/2 keyboard controller.
3. Pressing <kbd>Esc</kbd> exits pointer lock and returns control to the WebOS host shell.

---

## 5. Startup & Process Hierarchy

When booting `TinyCore-17.1.iso` in v86:
```
init (PID 1)
 └─ rcS (system initialization)
     └─ ash (login shell on /dev/tty1)
         └─ startx (/usr/local/bin/startx)
             ├─ Xvesa :0.0 -br -screen 1024x768x32 -shadow -2button ... (PID 1120)
             ├─ flwm (PID 1135)
             ├─ wbar (PID 1142)
             └─ aterm (if spawned)
```

FLWM persists as long as the X session remains active. If FLWM is terminated, `~/.xsession` ends, triggering Xvesa shutdown and dropping the user back to the console prompt `tc@box:~$ `.
