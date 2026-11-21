import React from 'react';
import { GUEST_EDITIONS, TINYCORE_PROFILE } from '@/features/emulator/config';
import { Play, Cpu, ShieldCheck, HardDrive, Terminal, Monitor } from 'lucide-react';

export type GuestEditionKey = 'tinycore' | 'core';

interface WelcomeScreenProps {
  onStart: (edition: GuestEditionKey) => void;
  selectedEdition: GuestEditionKey;
  onSelectEdition: (edition: GuestEditionKey) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  selectedEdition,
  onSelectEdition,
}) => {
  const currentEdition = GUEST_EDITIONS[selectedEdition];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-950 p-6 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>WebAssembly x86 PC Virtual Machine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome to WebOS
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            A genuine Linux operating system environment running directly inside your browser. Linux executes all commands, processes, and memory.
          </p>
        </div>

        {/* Edition Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Guest Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSelectEdition('tinycore')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedEdition === 'tinycore'
                  ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Monitor className={`w-4 h-4 ${selectedEdition === 'tinycore' ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="font-semibold text-xs text-white">Graphical Desktop</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                Xvesa + FLWM desktop (1024×768 @ 32bpp) with genuine GUI window manager.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSelectEdition('core')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedEdition === 'core'
                  ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Terminal className={`w-4 h-4 ${selectedEdition === 'core' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="font-semibold text-xs text-white">Command-Line Console</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                Fast text shell with BusyBox ash, procfs, and direct keyboard interactivity.
              </p>
            </button>
          </div>
        </div>

        {/* Guest Profile Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span>Guest OS</span>
            </div>
            <div className="text-white font-semibold">{TINYCORE_PROFILE.name} {TINYCORE_PROFILE.version}</div>
            <div className="text-slate-500 text-[11px]">{currentEdition.edition} ({TINYCORE_PROFILE.architecture})</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Virtual Hardware</span>
            </div>
            <div className="text-white font-semibold">v86 PC Emulator</div>
            <div className="text-slate-500 text-[11px]">128MB RAM, SeaBIOS, VGA BIOS</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Userland & Shell</span>
            </div>
            <div className="text-white font-semibold">BusyBox & Ash Shell</div>
            <div className="text-slate-500 text-[11px]">Real Linux utilities and procfs</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Host Isolation</span>
            </div>
            <div className="text-white font-semibold">Client-Side Sandbox</div>
            <div className="text-slate-500 text-[11px]">Runs 100% in browser WebAssembly</div>
          </div>
        </div>

        {/* Action */}
        <div className="pt-2 flex flex-col items-center space-y-3">
          <button
            onClick={() => onStart(selectedEdition)}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Virtual Machine ({selectedEdition === 'tinycore' ? 'Graphical GUI' : 'CLI Console'})</span>
          </button>
          <p className="text-[11px] text-slate-500">
            Initial download is ~{currentEdition.sizeMb} MB (cached by browser). Requires WebAssembly support.
          </p>
        </div>
      </div>
    </div>
  );
};
