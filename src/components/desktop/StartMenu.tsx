import React, { useState, useRef, useEffect } from 'react';
import { useWindowManager } from '@/features/desktop/WindowContext';
import { useEmulator } from '@/features/emulator/useEmulator';
import { APP_REGISTRY } from '@/features/desktop/appRegistry';
import {
  Search,
  Monitor,
  Terminal,
  Settings,
  Info,
  Play,
  RotateCcw,
  Maximize2,
  Cpu,
  Layers,
  FileText,
  Sliders,
  Power,
  Save,
  Sparkles,
} from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose }) => {
  const { openWindow, focusWindow, windows } = useWindowManager();
  const {
    status,
    boot,
    goFullscreen,
    captureAndSaveSnapshot,
    gracefulShutdown,
    safeRestart,
  } = useEmulator();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingSession, setIsSavingSession] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLaunch = (appId: string) => {
    const app = APP_REGISTRY[appId];
    if (app?.target === 'guest') {
      openWindow(appId);
      onClose();
      return;
    }
    const existing = windows.find((w) => w.appId === appId && w.isOpen);
    if (existing) {
      focusWindow(existing.id);
    } else {
      openWindow(appId);
    }
    onClose();
  };

  const apps = Object.values(APP_REGISTRY).filter((app) =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Monitor':
        return <Monitor className="w-4 h-4 text-sky-400" />;
      case 'Terminal':
        return <Terminal className="w-4 h-4 text-emerald-400" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'Sliders':
        return <Sliders className="w-4 h-4 text-purple-400" />;
      case 'Settings':
        return <Settings className="w-4 h-4 text-indigo-400" />;
      case 'Info':
        return <Info className="w-4 h-4 text-cyan-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-sky-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute bottom-14 left-3 z-50 w-84 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150 select-none text-slate-100"
    >
      {/* Header Profile */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-xs text-white">WebOS v0.3.0</div>
          <div className="text-[11px] text-slate-400">Tiny Core Linux 17.1 (v86 x86)</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* App List */}
      <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Applications
        </div>

        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => handleLaunch(app.id)}
            className="w-full px-2.5 py-2 rounded-xl flex items-center space-x-3 hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-slate-600">
              {getIcon(app.iconName)}
            </div>
            <div className="truncate flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                {app.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {app.description}
              </div>
            </div>
            {app.target === 'guest' ? (
              <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-850 text-sky-400 font-mono">
                Guest
              </span>
            ) : (
              <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400 font-mono">
                Host
              </span>
            )}
          </button>
        ))}

        {apps.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-500">
            No matching applications found
          </div>
        )}
      </div>

      {/* VM Quick Controls Bar */}
      <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {status !== 'running' ? (
            <button
              type="button"
              onClick={() => {
                boot();
                onClose();
              }}
              title="Start Linux VM"
              className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Start VM</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={async () => {
                  setIsSavingSession(true);
                  try {
                    await captureAndSaveSnapshot(`Session ${new Date().toLocaleTimeString()}`);
                  } catch {
                    // Handled in service
                  } finally {
                    setIsSavingSession(false);
                    onClose();
                  }
                }}
                disabled={isSavingSession}
                title="Save current session to IndexedDB"
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-medium flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  safeRestart('guest-reboot');
                  onClose();
                }}
                title="Reboot guest Linux OS (sudo reboot)"
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  gracefulShutdown();
                  onClose();
                }}
                title="Graceful ACPI Shutdown (sudo poweroff)"
                className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            goFullscreen();
            onClose();
          }}
          title="Fullscreen Mode"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
