# WebOS Desktop Shell Specification

## Overview

The WebOS Desktop Shell represents the browser-side host workspace framing the real Linux virtual machine. It provides a familiar, modern windowed environment while strictly maintaining the architectural boundary between the host interface (React + TypeScript) and the guest operating system (Tiny Core Linux 17.1).

---

## Architectural Principles

1. **Host Environment Responsibility:** The desktop shell owns wallpaper rendering, host-side window management, the bottom taskbar, application launcher, host preferences, system tray, and viewport containment.
2. **Guest OS Transparency:** The shell does not emulate or mock Linux behavior. The Tiny Core Linux guest runs as a primary application window containing the genuine v86 hardware display.
3. **Permanent DOM Preservation:** Critical emulator DOM nodes (`#v86-screen-container`) remain continuously mounted in the DOM to prevent v86 canvas detachments during window minimize or close transitions.

---

## Shell Component Hierarchy

```text
DesktopShell (Root Workspace)
├── DesktopWallpaper (Configurable visual backdrop)
├── main (Main viewport area)
│   ├── DesktopIcons (Grid of desktop shortcuts)
│   ├── WindowManager (Iterates active WindowState records)
│   │   └── DesktopWindow (Draggable, resizable host window frame)
│   │       ├── LinuxDesktopApp (Houses live v86 VGA canvas)
│   │       ├── TerminalApp (Live guest command shell)
│   │       ├── SettingsApp (Host appearance & VM preferences)
│   │       └── AboutApp (Architecture specifications & licenses)
│   └── Diagnostics Drawer (Off-canvas serial output log)
└── Taskbar (Bottom 48px fixed control bar)
    ├── StartMenu (Popup launcher with search and VM controls)
    ├── Window Tabs (Running window indicators with minimize/restore toggle)
    └── SystemTray (Local clock, VM status badge, fullscreen toggle)
```

---

## Visual Design Tokens

- **Palette:** Slate dark palette (`bg-slate-950` root, `bg-slate-900` window chrome, `bg-slate-800` borders, `sky-500` primary accents, `emerald-400` terminal green).
- **Typography:** Modern monospace for terminal and code views; clean system sans-serif (`font-sans`) for desktop chrome and title bars.
- **Elevation & Shadows:** Soft `shadow-2xl` for floating windows; subtle border rings (`ring-1 ring-sky-500/20`) for focused windows.
- **Responsiveness:** Dynamic viewport calculation subtracting taskbar height (`calc(100vh - 48px)`); display scaling support (100%, 125%, 150%).

---

## Accessibility & Usability

- Semantic HTML buttons and inputs with visible focus rings.
- Keyboard navigation support (<kbd>Esc</kbd> releases pointer lock; <kbd>Enter</kbd> launches selected desktop icons; <kbd>↑</kbd>/<kbd>↓</kbd> navigates terminal command history).
- Respects reduced motion preferences (`prefers-reduced-motion`).
