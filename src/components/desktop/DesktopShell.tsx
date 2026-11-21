import React, { useState } from 'react';
import { WindowProvider, useWindowManager } from '@/features/desktop/WindowContext';
import { useSettings } from '@/features/settings/useSettings';
import { useEmulator } from '@/features/emulator/useEmulator';
import { DesktopWallpaper } from './DesktopWallpaper';
import { DesktopIcons } from './DesktopIcons';
import { DesktopWindow } from './DesktopWindow';
import { Taskbar } from './Taskbar';
import { LinuxDesktopApp } from '@/components/applications/LinuxDesktopApp';
import { TerminalApp } from '@/components/applications/TerminalApp';
import { SettingsApp } from '@/components/applications/SettingsApp';
import { AboutApp } from '@/components/applications/AboutApp';
import { Terminal, X } from 'lucide-react';

const DesktopContent: React.FC = () => {
  const { windows } = useWindowManager();
  const { settings } = useSettings();
  const { serialOutput } = useEmulator();
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const renderAppContent = (appId: string) => {
    switch (appId) {
      case 'linux-desktop':
        return <LinuxDesktopApp />;
      case 'terminal':
        return <TerminalApp />;
      case 'settings':
        return <SettingsApp />;
      case 'about':
        return <AboutApp />;
      default:
        return (
          <div className="p-4 text-xs text-slate-400">
            Unknown application ID: {appId}
          </div>
        );
    }
  };

  return (
    <div
      className="relative flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none"
      style={{
        transform: settings.displayScale !== 1 ? `scale(${settings.displayScale})` : undefined,
        transformOrigin: 'top left',
        width: settings.displayScale !== 1 ? `${100 / settings.displayScale}vw` : '100vw',
        height: settings.displayScale !== 1 ? `${100 / settings.displayScale}vh` : '100vh',
      }}
    >
      {/* Dynamic Desktop Wallpaper */}
      <DesktopWallpaper wallpaperId={settings.wallpaper} />

      {/* Main Desktop Area */}
      <main className="flex-1 relative overflow-hidden flex">
        {/* Desktop Icons */}
        <DesktopIcons />

        {/* Windows Layer */}
        {windows.map((win) => (
          <DesktopWindow key={win.id} windowState={win}>
            {renderAppContent(win.appId)}
          </DesktopWindow>
        ))}

        {/* Diagnostics & Serial Console Drawer */}
        {isConsoleOpen && (
          <aside className="absolute right-0 top-0 bottom-0 w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 flex flex-col shadow-2xl z-45 animate-in slide-in-from-right duration-150">
            <div className="h-10 px-3 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between text-xs font-semibold text-slate-200">
              <div className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Serial Stream & Diagnostics</span>
              </div>
              <button
                type="button"
                onClick={() => setIsConsoleOpen(false)}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 p-3 bg-black font-mono text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap select-text">
              {serialOutput || (
                <span className="text-slate-600 italic">
                  No serial output received yet. Serial console captures guest kernel initialization and shell events.
                </span>
              )}
            </div>
          </aside>
        )}
      </main>

      {/* Taskbar */}
      <Taskbar
        onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
        isConsoleOpen={isConsoleOpen}
      />
    </div>
  );
};

export const DesktopShell: React.FC = () => {
  return (
    <WindowProvider>
      <DesktopContent />
    </WindowProvider>
  );
};
