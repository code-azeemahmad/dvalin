# Tiny Core Linux 17.1 Guest Application Inventory

**Date:** 2026-11-21  
**Status:** Verified via direct ISO package inspection  
**Image:** `TinyCore-17.1.iso` (26.0 MB, MD5 `42db5663757add090857059c096a6801`)  
**Architecture:** i686 (32-bit x86 ELF)

---

## 1. Application Inventory Summary

All applications listed below reside natively inside the guest operating system filesystem. They are packed in compressed SquashFS extensions (`.tcz`) in `/cde/optional/` and mounted loopback into `/tmp/tcloop/` during boot.

| Application | Executable Path | Package | Category | GUI Toolkit | Verified Status |
|---|---|---|---|---|---|
| **Terminal (aterm)** | `/usr/local/bin/aterm` | `aterm.tcz` | System / Shell | Xlib / Athena | **Verified** |
| **Text Editor (editor)** | `/usr/local/bin/editor` | `Xprogs.tcz` | Utility / Editor | FLTK 1.3 | **Verified** |
| **Control Panel (cpanel)** | `/usr/local/bin/cpanel` | `Xprogs.tcz` | System / Config | FLTK 1.3 | **Verified** |
| **AppBrowser (apps)** | `/usr/local/bin/apps` | `Xprogs.tcz` | System / Package | FLTK 1.3 | **Verified** (Offline) |
| **Mount Tool (mnttool)** | `/usr/local/bin/mnttool` | `Xprogs.tcz` | System / Storage | FLTK 1.3 | **Verified** |
| **Services Manager (services)** | `/usr/local/bin/services` | `Xprogs.tcz` | System / Daemons | FLTK 1.3 | **Verified** |
| **Run Program (flrun)** | `/usr/local/bin/flrun` | `Xprogs.tcz` | Utility / Launcher | FLTK 1.3 | **Verified** |
| **System Stats (stats)** | `/usr/local/bin/stats` | `Xprogs.tcz` | System / Monitoring | FLTK 1.3 | **Verified** |
| **Process Viewer (top)** | `/usr/bin/top` | BusyBox Core | System / Monitor | Monospace / curses | **Verified** |

---

## 2. Detailed Application Profiles

### 2.1 Terminal (`aterm`)
- **Binary:** `/usr/local/bin/aterm`
- **Symlinks:** `/usr/local/bin/xterm` -> `/usr/local/bin/aterm-xterm`
- **Package:** `aterm.tcz` (52 KB uncompressed)
- **Desktop Entry:** `/usr/local/share/applications/aterm.desktop`
- **Icon:** `/usr/local/share/pixmaps/aterm.png`
- **Description:** A lightweight color terminal emulator based on rxvt, featuring VT102 emulation, pseudo-transparency, and fast font rendering.
- **Launch Command:**
  ```sh
  DISPLAY=:0 aterm &
  ```
- **Key Parameters:**
  - `-fn <font>`: Custom monospace font
  - `-bg <color>` / `-fg <color>`: Background and foreground colors
  - `-e <cmd>`: Execute command within the spawned terminal

### 2.2 Text Editor (`editor`)
- **Binary:** `/usr/local/bin/editor`
- **Package:** `Xprogs.tcz` (148 KB uncompressed)
- **Desktop Entry:** `/usr/local/share/applications/tinycore-editor.desktop`
- **Icon:** `/usr/local/share/pixmaps/editor.png`
- **Description:** An FLTK-based lightweight graphical text editor providing basic document editing, cut/copy/paste, search/replace, line numbering, and syntax styling.
- **Launch Command:**
  ```sh
  DISPLAY=:0 editor &
  # Or open a specific file:
  DISPLAY=:0 editor /home/tc/example.txt &
  ```
- **Dependencies:** `fltk-1.3.tcz`, `Xlibs.tcz`, `libX11.tcz`.

### 2.3 Control Panel (`cpanel`)
- **Binary:** `/usr/local/bin/cpanel`
- **Package:** `Xprogs.tcz`
- **Desktop Entry:** `/usr/local/share/applications/tinycore-cpanel.desktop`
- **Icon:** `/usr/local/share/pixmaps/cpanel.png`
- **Description:** Central graphical administrative panel that aggregates multiple Tiny Core system configuration dialogs into a single tabbed/icon window.
- **Accessible Applets via Control Panel:**
  - Date & Time (`datetool`)
  - Backup & Restore (`filetool.sh`)
  - Mouse Acceleration (`mousetool`)
  - Screen Resolution / Video Mode (`xsetup.sh`)
  - Services & Daemons (`services`)
  - Wallpaper Setter (`wallpaper`)
  - Swap File Configuration (`swapfile`)
- **Launch Command:**
  ```sh
  DISPLAY=:0 cpanel &
  ```

### 2.4 Mount Tool (`mnttool`)
- **Binary:** `/usr/local/bin/mnttool`
- **Package:** `Xprogs.tcz`
- **Desktop Entry:** `/usr/local/share/applications/tinycore-mnttool.desktop`
- **Icon:** `/usr/local/share/pixmaps/mnttool.png`
- **Description:** Graphical storage device manager that displays available storage partitions (`/dev/sr0`, `/dev/sda1`, etc.) with one-click mount/unmount buttons and status indicators.
- **Launch Command:**
  ```sh
  DISPLAY=:0 mnttool &
  ```

### 2.5 Run Program (`flrun`)
- **Binary:** `/usr/local/bin/flrun`
- **Package:** `Xprogs.tcz`
- **Desktop Entry:** `/usr/local/share/applications/tinycore-flrun.desktop`
- **Icon:** `/usr/local/share/pixmaps/flrun.png`
- **Description:** Minimal FLTK "Run..." dialog box allowing keyboard entry of arbitrary command strings to execute under X11.
- **Launch Command:**
  ```sh
  DISPLAY=:0 flrun &
  ```

---

## 3. Host vs Guest Application Demarcation

To prevent confusion in WebOS between host web applications and genuine guest Linux applications:

| WebOS Application ID | Host Window / Implementation | Underlying Target Environment |
|---|---|---|
| `linux-desktop` | React Window framing VGA Canvas | Whole Tiny Core Linux Desktop |
| `terminal` | React Monospace Shell Frame | Guest Serial / Ash Shell Bridge |
| `guest-aterm` | Dispatches `DISPLAY=:0 aterm &` to guest | Native X11 window inside Tiny Core |
| `guest-editor` | Dispatches `DISPLAY=:0 editor &` to guest | Native X11 window inside Tiny Core |
| `guest-cpanel` | Dispatches `DISPLAY=:0 cpanel &` to guest | Native X11 window inside Tiny Core |
| `settings` | React Host Component | Host `localStorage` (Theme/Wallpaper) |
| `about` | React Host Component | Host Emulation Specs & Info |
