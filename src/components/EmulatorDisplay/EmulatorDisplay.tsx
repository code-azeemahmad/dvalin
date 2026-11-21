import React, { useRef, useEffect, useState } from 'react';
import { EmulatorManager } from '@/features/emulator/EmulatorManager';
import { EmulatorStatus } from '@/features/emulator/types';
import { MousePointer, Maximize2 } from 'lucide-react';

interface EmulatorDisplayProps {
  status: EmulatorStatus;
  width?: number;
  height?: number;
}

export const EmulatorDisplay: React.FC<EmulatorDisplayProps> = ({
  status,
  width = 640,
  height = 400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const manager = EmulatorManager.getInstance();

  useEffect(() => {
    if (containerRef.current) {
      manager.setScreenContainer(containerRef.current);
    }
  }, [manager]);

  // Handle escape to release cursor and blur
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocused(false);
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleContainerClick = () => {
    setIsFocused(true);
    if (containerRef.current) {
      containerRef.current.focus();
    }
    if (status === 'running') {
      manager.lockMouse();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full bg-slate-950 p-4 select-none">
      {/* Display frame */}
      <div
        className={`relative flex items-center justify-center bg-black rounded-lg shadow-2xl border transition-all duration-200 overflow-hidden ${
          isFocused ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-slate-800'
        }`}
        style={{
          minWidth: `${Math.min(width, 800)}px`,
          minHeight: `${Math.min(height, 500)}px`,
        }}
        onClick={handleContainerClick}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* v86 Screen target container — Must remain permanent in DOM */}
        <div
          id="v86-screen-container"
          ref={containerRef}
          tabIndex={0}
          className="relative flex items-center justify-center overflow-hidden outline-hidden"
          style={{
            cursor: status === 'running' ? 'crosshair' : 'default',
          }}
        >
          {/* Text mode container (required by v86) */}
          <div
            style={{
              whiteSpace: 'pre',
              font: '14px monospace',
              lineHeight: '14px',
              color: '#f8fafc',
              backgroundColor: '#000000',
            }}
          />
          {/* VGA Canvas (required by v86) */}
          <canvas style={{ display: 'none' }} />
        </div>

        {/* Hover overlay hint */}
        {status === 'running' && !isFocused && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center cursor-pointer pointer-events-none">
            <div className="bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 text-sky-400 text-sm font-medium">
              <MousePointer className="w-4 h-4 animate-bounce" />
              <span>Click to capture keyboard and mouse</span>
            </div>
          </div>
        )}
      </div>

      {/* Helper notes */}
      <div className="mt-3 flex items-center space-x-4 text-xs text-slate-400">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>VGA Display ({width}×{height})</span>
        </span>
        <span>•</span>
        <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Esc</kbd> to release cursor</span>
        <span>•</span>
        <button
          onClick={() => manager.goFullscreen()}
          className="text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fullscreen</span>
        </button>
      </div>
    </div>
  );
};
