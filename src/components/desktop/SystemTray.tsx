import React, { useState, useEffect } from 'react';
import { useEmulator } from '@/features/emulator/useEmulator';
import { Maximize2, Terminal } from 'lucide-react';

interface SystemTrayProps {
  onToggleConsole?: () => void;
  isConsoleOpen?: boolean;
}

export const SystemTray: React.FC<SystemTrayProps> = ({
  onToggleConsole,
  isConsoleOpen,
}) => {
  const { status, screenDimensions, goFullscreen } = useEmulator();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>VM Running</span>
          </span>
        );
      case 'booting':
      case 'initializing':
        return (
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>VM Booting</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>VM Error</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>VM Idle</span>
          </span>
        );
    }
  };

  return (
    <div className="flex items-center space-x-2.5 text-xs text-slate-300 select-none">
      {/* Resolution Indicator */}
      {status === 'running' && (
        <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-[10px] font-mono text-slate-400">
          {screenDimensions.width}×{screenDimensions.height}
        </span>
      )}

      {/* VM Status Badge */}
      {getStatusBadge()}

      {/* Toggle Serial Console Button */}
      {onToggleConsole && (
        <button
          type="button"
          onClick={onToggleConsole}
          title="Toggle Diagnostics Console"
          className={`p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ${
            isConsoleOpen ? 'bg-slate-800 text-sky-400' : ''
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Fullscreen Button */}
      <button
        type="button"
        onClick={() => goFullscreen()}
        title="Fullscreen Mode"
        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      {/* Clock and Date */}
      <div
        className="px-2 py-1 flex flex-col items-end leading-tight rounded-md hover:bg-slate-800/60 transition-colors"
        title={dateStr}
      >
        <span className="font-mono text-xs font-semibold text-slate-200">
          {timeStr || '--:--:--'}
        </span>
        <span className="text-[10px] text-slate-400">{dateStr}</span>
      </div>
    </div>
  );
};
