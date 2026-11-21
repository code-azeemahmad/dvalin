import React from 'react';
import { EmulatorStatus } from '@/features/emulator/types';
import {
  Play,
  Square,
  RotateCw,
  Terminal,
  Cpu,
  Maximize,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface SystemToolbarProps {
  status: EmulatorStatus;
  onBoot: () => void;
  onStop: () => void;
  onRestart: () => void;
  onFullscreen: () => void;
  onToggleConsole: () => void;
  isConsoleOpen: boolean;
}

export const SystemToolbar: React.FC<SystemToolbarProps> = ({
  status,
  onBoot,
  onStop,
  onRestart,
  onFullscreen,
  onToggleConsole,
  isConsoleOpen,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'idle':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Idle
          </span>
        );
      case 'initializing':
      case 'booting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            {status === 'initializing' ? 'Initializing Hardware...' : 'Booting Linux...'}
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Guest Running
          </span>
        );
      case 'capturing':
      case 'saving':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            Capturing Snapshot...
          </span>
        );
      case 'restoring':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            Restoring Session...
          </span>
        );
      case 'shutting-down':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            Shutting Down...
          </span>
        );
      case 'restarting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            Restarting...
          </span>
        );
      case 'stopping':
      case 'stopped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Stopped
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none">
      {/* Brand & Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>WebOS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-500/20 text-sky-400 rounded">v86 PC</span>
            </h1>
            <p className="text-[11px] text-slate-400">Real Linux x86 Emulation</p>
          </div>
        </div>
        <div className="h-4 w-[1px] bg-slate-800 mx-2" />
        {getStatusBadge()}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2">
        {status === 'idle' || status === 'stopped' || status === 'error' ? (
          <button
            onClick={onBoot}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Linux</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            disabled={status === 'stopping'}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop VM</span>
          </button>
        )}

        <button
          onClick={onRestart}
          disabled={status !== 'running'}
          title="Reboot guest hardware"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={onToggleConsole}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
            isConsoleOpen
              ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
              : 'text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Serial Logs</span>
        </button>

        <button
          onClick={onFullscreen}
          title="Fullscreen display"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
