import React, { useState, useEffect } from 'react';
import { WindowProvider, useWindowManager } from '@/features/desktop/WindowContext';
import { useSettings } from '@/features/settings/useSettings';
import { useEmulator } from '@/features/emulator/useEmulator';
import { DesktopWindow } from './DesktopWindow';
import { BootingScreen } from '@/components/retro/BootingScreen';
import { UserSignInScreen } from '@/components/retro/UserSignInScreen';
import { TopMenuBar } from '@/components/retro/TopMenuBar';
import { RetroDesktopIcons } from '@/components/retro/RetroDesktopIcons';
import { RetroDock } from '@/components/retro/RetroDock';
import { EmulatorDisplay } from '@/components/EmulatorDisplay/EmulatorDisplay';

// Applications
import { TerminalApp } from '@/components/applications/TerminalApp';
import { TextEditorApp } from '@/components/applications/TextEditorApp';
import { FileExplorerApp } from '@/components/applications/FileExplorerApp';
import { CalculatorApp } from '@/components/applications/CalculatorApp';
import { ControlPanelApp } from '@/components/applications/ControlPanelApp';
import { MessagesApp } from '@/components/applications/MessagesApp';
import { BrowserApp } from '@/components/applications/BrowserApp';
import { TrashApp } from '@/components/applications/TrashApp';
import { AboutApp } from '@/components/applications/AboutApp';
import { ExperimentsApp } from '@/features/experiments/components/ExperimentsApp';
import { LinuxDesktopApp } from '@/components/applications/LinuxDesktopApp';

const DesktopContent: React.FC = () => {
  const { windows } = useWindowManager();
  const { settings } = useSettings();
  const { status, boot } = useEmulator();

  // Screen state machine: booting -> signin -> desktop
  const [screenState, setScreenState] = useState<'booting' | 'signin' | 'desktop'>('booting');

  // Trigger emulator boot during booting screen so guest Linux is warmed up and ready
  useEffect(() => {
    if (status === 'idle') {
      try {
        boot();
      } catch (err) {
        console.warn('Initial background boot dispatch error:', err);
      }
    }
  }, [status, boot]);

  const renderAppContent = (appId: string) => {
    switch (appId) {
      case 'terminal':
        return <TerminalApp />;
      case 'text-editor':
        return <TextEditorApp />;
      case 'file-explorer':
        return <FileExplorerApp />;
      case 'calculator':
        return <CalculatorApp />;
      case 'control-panel':
      case 'settings':
        return <ControlPanelApp />;
      case 'messages':
        return <MessagesApp />;
      case 'browser':
        return <BrowserApp />;
      case 'trash':
        return <TrashApp />;
      case 'about':
        return <AboutApp />;
      case 'os-lab':
        return <ExperimentsApp />;
      case 'linux-desktop':
        return <LinuxDesktopApp />;
      default:
        return (
          <div className="p-4 text-xs text-slate-400 font-mono">
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
      {/* 1. Booting Screen */}
      {screenState === 'booting' && (
        <BootingScreen onComplete={() => setScreenState('signin')} />
      )}

      {/* 2. User Sign-in Screen */}
      {screenState === 'signin' && (
        <UserSignInScreen onSignIn={() => setScreenState('desktop')} />
      )}

      {/* 3. GUI Desktop Screen */}
      {screenState === 'desktop' && (
        <div
          className="relative flex-1 flex flex-col h-full w-full bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url('/assets/images/desktop_screen.png')` }}
        >
          {/* Top Menu Bar */}
          <TopMenuBar />

          {/* Desktop Area */}
          <main className="flex-1 relative overflow-hidden">
            {/* Desktop Icons (Left & Right) */}
            <RetroDesktopIcons />

            {/* Application Windows Layer */}
            {windows
              .filter((win) => win.appId !== 'linux-desktop' && win.isOpen)
              .map((win) => (
                <DesktopWindow key={win.id} windowState={win}>
                  {renderAppContent(win.appId)}
                </DesktopWindow>
              ))}
          </main>

          {/* Centered Floating Bottom Dock */}
          <RetroDock />
        </div>
      )}

      {/* Permanent hidden v86 screen container: ensures WebAssembly VM stays mounted without interrupting emulator lifecycle */}
      <div
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -100,
        }}
        aria-hidden="true"
      >
        <EmulatorDisplay status={status} width={640} height={400} />
      </div>
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
