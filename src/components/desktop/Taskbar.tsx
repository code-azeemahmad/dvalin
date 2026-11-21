import React, { useState } from 'react';
import { useWindowManager } from '@/features/desktop/WindowContext';
import { SystemTray } from './SystemTray';
import { StartMenu } from './StartMenu';
import {
  Cpu,
  Monitor,
  Terminal,
  Settings,
  Info,
  Layers,
} from 'lucide-react';

interface TaskbarProps {
  onToggleConsole?: () => void;
  isConsoleOpen?: boolean;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  onToggleConsole,
  isConsoleOpen,
}) => {
  const { windows, activeWindowId, focusWindow, minimizeWindow, restoreWindow } =
    useWindowManager();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const getWindowIcon = (name: string) => {
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

  const openWindows = windows.filter((w) => w.isOpen);

  const handleTaskbarItemClick = (winId: string) => {
    const win = windows.find((w) => w.id === winId);
    if (!win) return;

    if (win.isMinimized) {
      restoreWindow(winId);
    } else if (win.id === activeWindowId && win.isFocused) {
      minimizeWindow(winId);
    } else {
      focusWindow(winId);
    }
  };

  return (
    <>
      {/* Start Menu Popup */}
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
      />

      {/* Main Taskbar Container */}
      <footer className="h-12 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 px-3 flex items-center justify-between z-40 select-none shadow-2xl relative">
        {/* Left: Start Menu Button & Running Windows */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar flex-1 mr-4">
          {/* Start Menu Button */}
          <button
            type="button"
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
            className={`px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs font-semibold transition-all cursor-pointer ${
              isStartMenuOpen
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200'
            }`}
          >
            <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center">
              <Cpu className="w-2.5 h-2.5 text-slate-950 fill-current" />
            </div>
            <span>Start</span>
          </button>

          {/* Running Windows */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {openWindows.map((win) => {
              const isActive = win.id === activeWindowId && !win.isMinimized;
              return (
                <button
                  key={win.id}
                  type="button"
                  onClick={() => handleTaskbarItemClick(win.id)}
                  className={`h-8 px-2.5 max-w-44 rounded-lg flex items-center space-x-2 text-xs transition-all cursor-pointer border truncate ${
                    isActive
                      ? 'bg-slate-800 text-white border-slate-700 ring-1 ring-sky-500/30'
                      : win.isMinimized
                      ? 'bg-slate-950/60 text-slate-400 border-slate-850 hover:bg-slate-850'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                  title={win.title}
                >
                  {getWindowIcon(win.iconName)}
                  <span className="truncate text-[11px] font-medium">{win.title}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-sky-400 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: System Tray */}
        <SystemTray
          onToggleConsole={onToggleConsole}
          isConsoleOpen={isConsoleOpen}
        />
      </footer>
    </>
  );
};
