import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { WindowState } from './types';
import { APP_REGISTRY } from './appRegistry';

interface WindowContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  openWindow: (appId: string) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  isWindowOpen: (appId: string) => boolean;
}

const WindowContext = createContext<WindowContextType | null>(null);

const TASKBAR_HEIGHT = 48;

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-seed linux-desktop window so its DOM container is permanently mounted
  const [windows, setWindows] = useState<WindowState[]>(() => {
    const desktopApp = APP_REGISTRY['linux-desktop'];
    return [
      {
        id: 'win-linux-desktop',
        appId: 'linux-desktop',
        title: desktopApp.title,
        iconName: desktopApp.iconName,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: desktopApp.defaultPosition || { x: 30, y: 20 },
        size: desktopApp.defaultSize,
        minSize: { width: 640, height: 480 },
        zIndex: 10,
        isFocused: true,
      },
    ];
  });

  const [activeWindowId, setActiveWindowId] = useState<string | null>('win-linux-desktop');
  const zIndexCounter = useRef<number>(20);

  const focusWindow = useCallback((id: string) => {
    zIndexCounter.current += 1;
    const newZIndex = zIndexCounter.current;

    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          return {
            ...win,
            isFocused: true,
            isMinimized: false,
            zIndex: newZIndex,
          };
        }
        return win.isFocused ? { ...win, isFocused: false } : win;
      })
    );
    setActiveWindowId(id);
  }, []);

  const openWindow = useCallback(
    (appId: string): string => {
      const app = APP_REGISTRY[appId];
      if (!app) {
        console.warn(`App ID "${appId}" not found in APP_REGISTRY`);
        return '';
      }

      // Check if singleton app already has a window
      const existing = windows.find((w) => w.appId === appId);
      if (existing) {
        setWindows((prev) =>
          prev.map((win) => {
            if (win.id === existing.id) {
              return {
                ...win,
                isOpen: true,
                isMinimized: false,
                isFocused: true,
                zIndex: ++zIndexCounter.current,
              };
            }
            return win.isFocused ? { ...win, isFocused: false } : win;
          })
        );
        setActiveWindowId(existing.id);
        return existing.id;
      }

      // Create new window
      const newId = `win-${appId}-${Date.now().toString(36)}`;
      const newZ = ++zIndexCounter.current;

      // Stagger position
      const offset = (windows.length % 6) * 24;
      const posX = (app.defaultPosition?.x || 100) + offset;
      const posY = (app.defaultPosition?.y || 60) + offset;

      const newWindow: WindowState = {
        id: newId,
        appId,
        title: app.title,
        iconName: app.iconName,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: { x: posX, y: posY },
        size: app.defaultSize,
        minSize: { width: 400, height: 300 },
        zIndex: newZ,
        isFocused: true,
      };

      setWindows((prev) =>
        prev
          .map((w) => (w.isFocused ? { ...w, isFocused: false } : w))
          .concat(newWindow)
      );
      setActiveWindowId(newId);
      return newId;
    },
    [windows]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          // Keep linux-desktop in list but closed so its DOM node persists
          return { ...win, isOpen: false, isFocused: false };
        }
        return win;
      })
    );
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          return { ...win, isMinimized: true, isFocused: false };
        }
        return win;
      })
    );
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    const vpW = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vpH = typeof window !== 'undefined' ? window.innerHeight - TASKBAR_HEIGHT : 720;

    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          return {
            ...win,
            isMaximized: true,
            isMinimized: false,
            isFocused: true,
            zIndex: ++zIndexCounter.current,
            prevPosition: { ...win.position },
            prevSize: { ...win.size },
            position: { x: 0, y: 0 },
            size: { width: vpW, height: vpH },
          };
        }
        return win.isFocused ? { ...win, isFocused: false } : win;
      })
    );
    setActiveWindowId(id);
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id) {
          const restoredPos = win.prevPosition || { x: 80, y: 60 };
          const restoredSize = win.prevSize || { width: 800, height: 600 };
          return {
            ...win,
            isMaximized: false,
            isMinimized: false,
            isFocused: true,
            zIndex: ++zIndexCounter.current,
            position: restoredPos,
            size: restoredSize,
          };
        }
        return win.isFocused ? { ...win, isFocused: false } : win;
      })
    );
    setActiveWindowId(id);
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    const vpW = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vpH = typeof window !== 'undefined' ? window.innerHeight - TASKBAR_HEIGHT : 720;

    // Viewport clamping
    const clampedY = Math.max(0, Math.min(y, vpH - 40));
    const clampedX = Math.max(-200, Math.min(x, vpW - 100));

    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id && !win.isMaximized) {
          return { ...win, position: { x: clampedX, y: clampedY } };
        }
        return win;
      })
    );
  }, []);

  const resizeWindow = useCallback((id: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id && !win.isMaximized) {
          const clampedW = Math.max(win.minSize.width, width);
          const clampedH = Math.max(win.minSize.height, height);
          return { ...win, size: { width: clampedW, height: clampedH } };
        }
        return win;
      })
    );
  }, []);

  const isWindowOpen = useCallback(
    (appId: string): boolean => {
      const win = windows.find((w) => w.appId === appId);
      return win ? win.isOpen && !win.isMinimized : false;
    },
    [windows]
  );

  return (
    <WindowContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        focusWindow,
        moveWindow,
        resizeWindow,
        isWindowOpen,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export function useWindowManager(): WindowContextType {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowProvider');
  }
  return context;
}
