import React from 'react';
import { DownloadProgress, EmulatorLogEntry } from '@/features/emulator/types';
import { Loader2, Terminal, AlertTriangle } from 'lucide-react';

interface BootScreenProps {
  progress: DownloadProgress | null;
  logs: EmulatorLogEntry[];
  error: string | null;
  onRetry: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({
  progress,
  logs,
  error,
  onRetry,
}) => {
  const recentLogs = logs.slice(-8);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-950 p-6">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-center">
        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Boot Failure</h2>
              <p className="text-sm text-rose-400 mt-1">{error}</p>
            </div>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-md shadow transition-colors cursor-pointer"
            >
              Retry Initialization
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>

            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Booting Tiny Core Linux
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Loading WebAssembly PC emulation and starting x86 kernel...
              </p>
            </div>

            {/* Asset download progress */}
            {progress && progress.total > 0 && (
              <div className="space-y-1.5 text-left bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-mono truncate max-w-xs">{progress.fileName}</span>
                  <span className="text-sky-400 font-mono font-semibold">{progress.percent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-500 h-1.5 rounded-full transition-all duration-150"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Asset {progress.fileIndex + 1} of {progress.fileCount}</span>
                  <span>{(progress.loaded / 1024 / 1024).toFixed(1)} MB / {(progress.total / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>
            )}

            {/* Live serial / system log output */}
            <div className="text-left bg-black border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 h-32 overflow-y-auto space-y-1">
              <div className="text-slate-500 flex items-center space-x-1.5 pb-1 border-b border-slate-800/60 text-[10px]">
                <Terminal className="w-3 h-3" />
                <span>Diagnostics Log</span>
              </div>
              {recentLogs.map((log) => (
                <div key={log.id} className="leading-tight">
                  <span className="text-slate-500 select-none mr-2">
                    {new Date(log.timestamp).toISOString().substring(14, 19)}
                  </span>
                  <span
                    className={
                      log.level === 'error'
                        ? 'text-rose-400'
                        : log.level === 'warn'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
