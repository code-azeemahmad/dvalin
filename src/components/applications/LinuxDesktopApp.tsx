import React from 'react';
import { useEmulator } from '@/features/emulator/useEmulator';
import { EmulatorDisplay } from '@/components/EmulatorDisplay/EmulatorDisplay';
import { WelcomeScreen, GuestEditionKey } from '@/components/WelcomeScreen/WelcomeScreen';
import { BootScreen } from '@/components/BootScreen/BootScreen';
import { GUEST_EDITIONS } from '@/features/emulator/config';
import { EmulatorManager } from '@/features/emulator/EmulatorManager';
import {
  MousePointer,
  Maximize2,
  RotateCcw,
  Square,
  Play,
  Monitor,
  ShieldAlert,
} from 'lucide-react';

export const LinuxDesktopApp: React.FC = () => {
  const {
    status,
    logs,
    progress,
    screenDimensions,
    error,
    boot,
    stop,
    restart,
    goFullscreen,
  } = useEmulator();

  const [selectedEdition, setSelectedEdition] = React.useState<GuestEditionKey>('tinycore');

  const handleStart = (edition: GuestEditionKey) => {
    const editionConfig = GUEST_EDITIONS[edition];
    try {
      EmulatorManager.getInstance().configure({
        cdromUrl: editionConfig.cdromUrl,
      });
    } catch {
      // Ignore if active
    }
    boot();
  };

  const handleLockMouse = () => {
    if (status === 'running') {
      EmulatorManager.getInstance().lockMouse();
    }
  };

  const activeConfig = GUEST_EDITIONS[selectedEdition];

  return (
    <div className="flex-1 relative flex flex-col w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Top Application Control Toolbar */}
      <div className="h-9 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 text-xs">
        {/* Left: Edition & Resolution Info */}
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 text-[11px] font-medium text-slate-300">
            <Monitor className="w-3 h-3 text-sky-400" />
            <span>{activeConfig.name}</span>
          </span>

          {status === 'running' && (
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-slate-800/80 font-mono text-[10px] text-slate-400">
              {screenDimensions.width}×{screenDimensions.height} @ {screenDimensions.bpp}bpp
            </span>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-1.5">
          {status === 'running' && (
            <>
              <button
                type="button"
                onClick={handleLockMouse}
                title="Lock mouse cursor inside guest (Press Esc to release)"
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 text-[11px] cursor-pointer"
              >
                <MousePointer className="w-3 h-3 text-sky-400" />
                <span className="hidden sm:inline">Lock Mouse</span>
              </button>

              <button
                type="button"
                onClick={() => goFullscreen()}
                title="Fullscreen"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => restart()}
                title="Reset Guest Hardware"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => stop()}
                title="Stop Virtual Machine"
                className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 flex items-center space-x-1 text-[11px] cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            </>
          )}

          {status !== 'running' && status !== 'booting' && status !== 'initializing' && (
            <button
              type="button"
              onClick={() => handleStart(selectedEdition)}
              className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center space-x-1 text-[11px] cursor-pointer shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Boot Linux</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {/* Emulator Display: ALWAYS mounted so that v86 canvas remains permanently attached */}
        <EmulatorDisplay
          status={status}
          width={screenDimensions.width}
          height={screenDimensions.height}
        />

        {/* Welcome Screen Overlay: shown when idle */}
        {status === 'idle' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/95 overflow-y-auto p-4">
            <WelcomeScreen
              selectedEdition={selectedEdition}
              onSelectEdition={setSelectedEdition}
              onStart={handleStart}
            />
          </div>
        )}

        {/* Boot Screen Overlay: shown during initializing / download */}
        {(status === 'initializing' || (status === 'booting' && progress && progress.percent < 100)) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
            <BootScreen
              progress={progress}
              logs={logs}
              error={error}
              onRetry={() => handleStart(selectedEdition)}
            />
          </div>
        )}

        {/* Error Screen Overlay: shown on fatal boot error */}
        {status === 'error' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Virtual Machine Error</h3>
              <p className="text-xs text-rose-300/90 max-w-md font-mono bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
                {error || 'An unexpected emulator error occurred.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleStart(selectedEdition)}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer shadow-md"
            >
              Retry Virtual Machine
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
