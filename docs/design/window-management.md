# WebOS Window Management Specification

## Overview

The WebOS Window Manager provides complete host-side window management for floating, overlapping, minimizable, maximizable, resizable, and draggable application windows within the browser viewport.

---

## Window State Model

All window state is managed centrally via `WindowContext.tsx` with strictly typed records:

```typescript
export interface WindowState {
  id: string;               // Unique window instance identifier
  appId: string;            // Application identifier (e.g. 'linux-desktop', 'terminal')
  title: string;            // Window title displayed in chrome and taskbar
  iconName: string;         // Icon identifier rendered in titlebar and taskbar
  isOpen: boolean;          // Whether the window is currently open
  isMinimized: boolean;     // Whether the window is hidden to the taskbar
  isMaximized: boolean;     // Whether the window occupies the full desktop area
  position: WindowPosition; // Current { x, y } coordinates in pixels
  size: WindowSize;         // Current { width, height } in pixels
  minSize: WindowSize;      // Minimum constraints preventing collapse
  zIndex: number;           // Stacking order index
  isFocused: boolean;       // Active keyboard/mouse focus state
  prevPosition?: WindowPosition; // Cached coordinates prior to maximize
  prevSize?: WindowSize;         // Cached dimensions prior to maximize
}
```

---

## Window Management Operations

| Action | Behavior | State Effect |
|---|---|---|
| **Open** | Creates a new window or restores/focuses an existing singleton | `isOpen = true`, `isMinimized = false`, `isFocused = true`, increments `zIndex` |
| **Close** | Hides the window. For singletons (like `linux-desktop`), preserves DOM node | `isOpen = false`, `isFocused = false` |
| **Minimize** | Hides window from view while preserving taskbar indicator and DOM state | `isMinimized = true`, `isFocused = false` |
| **Maximize** | Caches previous bounds; expands to `{ x: 0, y: 0, width: viewportW, height: viewportH - 48 }` | `isMaximized = true`, `isMinimized = false`, `isFocused = true` |
| **Restore** | Returns window to exact cached pre-maximize coordinates and size | `isMaximized = false`, `position = prevPosition`, `size = prevSize` |
| **Focus** | Brings window to the top of the z-index stack on mousedown | Increments `zIndex`, sets `isFocused = true`, unfocuses others |
| **Move** | Interactive dragging via window title bar with viewport boundary clamping | Updates `position.x` and `position.y` |
| **Resize** | Interactive dragging via bottom-right resize corner handle | Updates `size.width` and `size.height` respecting `minSize` |

---

## Permanent DOM Attachment Pattern

WebAssembly PC emulators like `v86` bind to canvas and text buffer DOM elements during construction. If a component unmounts upon window minimization or closure, v86 loses its render target or falls back to headless mode.

To prevent this:
1. `DesktopWindow` conditionally sets `style={{ display: isOpen && !isMinimized ? 'flex' : 'none' }}` instead of unmounting children from the React virtual DOM tree.
2. The virtual machine continues executing uninterrupted in the background.
3. Restoring or re-opening the window displays the live guest desktop instantly without reloading or resetting virtual hardware.

---

## Viewport Clamping & Bounds Protection

To ensure windows never become permanently lost outside the viewport:
- **Top:** Clamped to `y >= 0`.
- **Bottom:** Clamped to `y <= viewportHeight - 40px` (above taskbar).
- **Horizontal:** Clamped to `x >= -200px` and `x <= viewportWidth - 100px`.
