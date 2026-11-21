import React, { useRef } from 'react';
import { WindowState } from '@/features/desktop/types';
import { useWindowManager } from '@/features/desktop/WindowContext';
import {
  Minus,
  Square,
  Copy,
  X,
  Monitor,
  Terminal,
  Settings,
  Info,
  Layers,
} from 'lucide-react';

interface DesktopWindowProps {
  windowState: WindowState;
  children: React.ReactNode;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  windowState,
  children,
}) => {
  const {
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    closeWindow,
    moveWindow,
    resizeWindow,
  } = useWindowManager();

  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });

  const isResizingRef = useRef(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const windowStartSize = useRef({ width: 0, height: 0 });

  // Handle Dragging
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    if ((e.target as HTMLElement).closest('button')) return;

    focusWindow(windowState.id);
    isDraggingRef.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartPos.current = { ...windowState.position };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartPos.current.x;
      const dy = moveEvent.clientY - dragStartPos.current.y;
      moveWindow(
        windowState.id,
        windowStartPos.current.x + dx,
        windowStartPos.current.y + dy
      );
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    e.stopPropagation();
    e.preventDefault();

    focusWindow(windowState.id);
    isResizingRef.current = true;
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartSize.current = { ...windowState.size };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const dw = moveEvent.clientX - resizeStartPos.current.x;
      const dh = moveEvent.clientY - resizeStartPos.current.y;
      resizeWindow(
        windowState.id,
        windowStartSize.current.width + dw,
        windowStartSize.current.height + dh
      );
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Monitor':
        return <Monitor className="w-3.5 h-3.5 text-sky-400" />;
      case 'Terminal':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Settings':
        return <Settings className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Info':
        return <Info className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  // Permanent DOM mounting pattern: hide via CSS display when closed or minimized
  const isVisible = windowState.isOpen && !windowState.isMinimized;

  return (
    <div
      id={`window-${windowState.id}`}
      style={{
        display: isVisible ? 'flex' : 'none',
        position: 'absolute',
        left: `${windowState.position.x}px`,
        top: `${windowState.position.y}px`,
        width: `${windowState.size.width}px`,
        height: `${windowState.size.height}px`,
        zIndex: windowState.zIndex,
      }}
      className={`flex flex-col bg-slate-900 rounded-xl shadow-2xl overflow-hidden border transition-shadow duration-150 select-none ${
        windowState.isFocused
          ? 'border-slate-700/80 ring-1 ring-sky-500/20 shadow-sky-950/40'
          : 'border-slate-800 shadow-black/60 opacity-95'
      }`}
      onMouseDown={() => focusWindow(windowState.id)}
    >
      {/* Title Bar */}
      <div
        className={`h-9 px-3 flex items-center justify-between border-b cursor-move shrink-0 ${
          windowState.isFocused
            ? 'bg-gradient-to-r from-slate-800/90 via-slate-800 to-slate-850 border-slate-700 text-slate-100'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}
        onMouseDown={handleTitleBarMouseDown}
        onDoubleClick={() => {
          if (windowState.isMaximized) {
            restoreWindow(windowState.id);
          } else {
            maximizeWindow(windowState.id);
          }
        }}
      >
        <div className="flex items-center space-x-2 truncate pointer-events-none">
          {renderIcon(windowState.iconName)}
          <span className="text-xs font-semibold tracking-wide truncate">
            {windowState.title}
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            title="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(windowState.id);
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-700/70 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            title={windowState.isMaximized ? 'Restore' : 'Maximize'}
            onClick={(e) => {
              e.stopPropagation();
              if (windowState.isMaximized) {
                restoreWindow(windowState.id);
              } else {
                maximizeWindow(windowState.id);
              }
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-700/70 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {windowState.isMaximized ? (
              <Copy className="w-3 h-3" />
            ) : (
              <Square className="w-3 h-3" />
            )}
          </button>

          <button
            type="button"
            title="Close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(windowState.id);
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose-600/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col">
        {children}
      </div>

      {/* Resize Handle (bottom-right) */}
      {!windowState.isMaximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-20 group"
          title="Resize window"
        >
          <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-600 group-hover:border-sky-400" />
        </div>
      )}
    </div>
  );
};
