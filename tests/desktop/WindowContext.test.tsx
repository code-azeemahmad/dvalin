import { act } from 'react';
import { describe, it, expect } from 'vitest';
import { WindowProvider, useWindowManager } from '@/features/desktop/WindowContext';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('WindowContext State Manager', () => {
  it('initializes with pre-seeded linux-desktop singleton window', () => {
    let result: any;
    function Consumer() {
      result = useWindowManager();
      return null;
    }
    // Simple render
    const container = document.createElement('div');
    const { createRoot } = require('react-dom/client');
    const root = createRoot(container);
    act(() => {
      root.render(
        <WindowProvider>
          <Consumer />
        </WindowProvider>
      );
    });

    expect(result.windows.length).toBeGreaterThanOrEqual(1);
    const linuxWin = result.windows.find((w: any) => w.appId === 'linux-desktop');
    expect(linuxWin).toBeDefined();
    expect(linuxWin.isOpen).toBe(true);
  });

  it('opens a new window and manages focus and z-index', () => {
    let result: any;
    function Consumer() {
      result = useWindowManager();
      return null;
    }
    const container = document.createElement('div');
    const { createRoot } = require('react-dom/client');
    const root = createRoot(container);
    act(() => {
      root.render(
        <WindowProvider>
          <Consumer />
        </WindowProvider>
      );
    });

    let termId: string = '';
    act(() => {
      termId = result.openWindow('terminal');
    });

    expect(termId).toContain('win-terminal');
    const termWin = result.windows.find((w: any) => w.id === termId);
    expect(termWin).toBeDefined();
    expect(termWin.isOpen).toBe(true);
    expect(termWin.isFocused).toBe(true);
    expect(result.activeWindowId).toBe(termId);
  });

  it('minimizes, restores, and maximizes windows', () => {
    let result: any;
    function Consumer() {
      result = useWindowManager();
      return null;
    }
    const container = document.createElement('div');
    const { createRoot } = require('react-dom/client');
    const root = createRoot(container);
    act(() => {
      root.render(
        <WindowProvider>
          <Consumer />
        </WindowProvider>
      );
    });

    const linuxWin = result.windows.find((w: any) => w.appId === 'linux-desktop');

    // Minimize
    act(() => {
      result.minimizeWindow(linuxWin.id);
    });
    let updated = result.windows.find((w: any) => w.id === linuxWin.id);
    expect(updated.isMinimized).toBe(true);

    // Maximize
    act(() => {
      result.maximizeWindow(linuxWin.id);
    });
    updated = result.windows.find((w: any) => w.id === linuxWin.id);
    expect(updated.isMaximized).toBe(true);
    expect(updated.isMinimized).toBe(false);
    expect(updated.position).toEqual({ x: 0, y: 0 });

    // Restore
    act(() => {
      result.restoreWindow(linuxWin.id);
    });
    updated = result.windows.find((w: any) => w.id === linuxWin.id);
    expect(updated.isMaximized).toBe(false);
  });

  it('moves and resizes windows with bounds clamping', () => {
    let result: any;
    function Consumer() {
      result = useWindowManager();
      return null;
    }
    const container = document.createElement('div');
    const { createRoot } = require('react-dom/client');
    const root = createRoot(container);
    act(() => {
      root.render(
        <WindowProvider>
          <Consumer />
        </WindowProvider>
      );
    });

    const linuxWin = result.windows.find((w: any) => w.appId === 'linux-desktop');

    // Move
    act(() => {
      result.moveWindow(linuxWin.id, 150, 200);
    });
    let updated = result.windows.find((w: any) => w.id === linuxWin.id);
    expect(updated.position.x).toBe(150);
    expect(updated.position.y).toBe(200);

    // Resize
    act(() => {
      result.resizeWindow(linuxWin.id, 900, 700);
    });
    updated = result.windows.find((w: any) => w.id === linuxWin.id);
    expect(updated.size.width).toBe(900);
    expect(updated.size.height).toBe(700);
  });

  it('routes guest application launch to linux-desktop window and dispatches guest command', () => {
    let result: any;
    function Consumer() {
      result = useWindowManager();
      return null;
    }
    const container = document.createElement('div');
    const { createRoot } = require('react-dom/client');
    const root = createRoot(container);
    act(() => {
      root.render(
        <WindowProvider>
          <Consumer />
        </WindowProvider>
      );
    });

    const linuxWin = result.windows.find((w: any) => w.appId === 'linux-desktop');

    // Minimize linux-desktop first
    act(() => {
      result.minimizeWindow(linuxWin.id);
    });
    let updated = result.windows.find((w: any) => w.id === linuxWin.id);
    expect(updated.isMinimized).toBe(true);

    // Launch a guest application (guest-aterm)
    act(() => {
      const targetId = result.openWindow('guest-aterm');
      expect(targetId).toBe(linuxWin.id);
    });

    // linux-desktop should now be restored and focused
    updated = result.windows.find((w: any) => w.id === linuxWin.id);
    expect(updated.isOpen).toBe(true);
    expect(updated.isMinimized).toBe(false);
    expect(updated.isFocused).toBe(true);
  });
});
