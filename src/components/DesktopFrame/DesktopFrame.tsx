import React, { useState } from 'react';
import { useEmulator } from '@/features/emulator/useEmulator';
import { EmulatorManager } from '@/features/emulator/EmulatorManager';
import { GUEST_EDITIONS } from '@/features/emulator/config';
import { SystemToolbar } from '@/components/SystemToolbar/SystemToolbar';
import { WelcomeScreen, GuestEditionKey } from '@/components/WelcomeScreen/WelcomeScreen';
import { BootScreen } from '@/components/BootScreen/BootScreen';
import { EmulatorDisplay } from '@/components/EmulatorDisplay/EmulatorDisplay';
import { StatusBar } from '@/components/StatusBar/StatusBar';
import { Terminal, X, CornerDownLeft } from 'lucide-react';

export const DesktopFrame: React.FC = () => {
  const {
    status,
    logs,
    progress,
    serialOutput,
    screenDimensions,
    error,
    boot,
    stop,
    restart,
    sendSerialCommand,
    goFullscreen,
  } = useEmulator();

  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>('');
  const [selectedEdition, setSelectedEdition] = useState<GuestEditionKey>('tinycore');

  const handleStart = (edition: GuestEditionKey) => {
    const editionConfig = GUEST_EDITIONS[edition];
    try {
      EmulatorManager.getInstance().configure({
        cdromUrl: editionConfig.cdromUrl,
      });
    } catch {
      // Ignore if already running
    }
    boot();
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || status !== 'running') return;
    sendSerialCommand(commandInput);
    setCommandInput('');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top System Toolbar */}
      <SystemToolbar
        status={status}
        onBoot={() => boot()}
        onStop={() => stop()}
        onRestart={() => restart()}
        onFullscreen={() => goFullscreen()}
        onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
        isConsoleOpen={isConsoleOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-slate-950">
          {/* Emulator Display: ALWAYS mounted so that v86 attaches canvas to DOM container */}
          <EmulatorDisplay
            status={status}
            width={screenDimensions.width}
            height={screenDimensions.height}
          />

          {/* Welcome Screen Overlay: shown when idle */}
          {status === 'idle' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
              <WelcomeScreen
                selectedEdition={selectedEdition}
                onSelectEdition={setSelectedEdition}
                onStart={handleStart}
              />
            </div>
          )}

          {/* Boot Screen Overlay: shown during initializing / initial download */}
          {(status === 'initializing' || (status === 'booting' && progress && progress.percent < 100)) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
              <BootScreen
                progress={progress}
                logs={logs}
                error={error}
                onRetry={() => boot()}
              />
            </div>
          )}
        </div>

        {/* Diagnostics & Serial Console Drawer */}
        {isConsoleOpen && (
          <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-20">
            <div className="h-10 px-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between text-xs font-semibold text-slate-200">
              <div className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Serial Console & Diagnostics</span>
              </div>
              <button
                onClick={() => setIsConsoleOpen(false)}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Serial stream terminal */}
            <div className="flex-1 p-3 bg-black font-mono text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap select-text">
              {serialOutput || (
                <span className="text-slate-600 italic">
                  No serial output received yet. Serial console logs guest kernel boot and shell interactions.
                </span>
              )}
            </div>

            {/* Direct serial command injection */}
            <form
              onSubmit={handleCommandSubmit}
              className="p-2 bg-slate-800/60 border-t border-slate-700/80 flex items-center space-x-1.5"
            >
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder={status === 'running' ? 'Send command (e.g. uname -a)...' : 'VM not running'}
                disabled={status !== 'running'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 font-mono disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status !== 'running' || !commandInput.trim()}
                className="p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded disabled:opacity-40 cursor-pointer"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </form>
          </aside>
        )}
      </main>

      {/* Bottom Status Bar */}
      <StatusBar
        status={status}
        screenDimensions={screenDimensions}
        ramMb={128}
      />
    </div>
  );
};
