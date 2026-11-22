import React from 'react';
import { Cpu, Terminal, ShieldCheck, HardDrive } from 'lucide-react';

export const AboutApp: React.FC = () => {
  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-200 select-none overflow-y-auto space-y-6">
      {/* Brand Header */}
      <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/10">
          <Cpu className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dvalin OS</h1>
          <p className="text-xs text-slate-400">
            Browser-Hosted x86 Linux Operating System & Retro Desktop
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-semibold">
              v1.0.0
            </span>
            <span className="text-[10px] text-sky-300 font-medium">Created by Azeem Ahmad</span>
          </div>
        </div>
      </div>

      {/* Architecture Principles */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Core Engineering Principles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <span>Real Linux Kernel</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Not a JavaScript mock or simulated terminal. The actual Linux kernel 6.18 runs inside v86, managing real processes, memory, and filesystem.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>x86 PC Emulation</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Powered by v86 running in WebAssembly, providing cycle-accurate 32-bit x86 execution, SeaBIOS firmware, and hardware VGA rendering.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Authentic Userland</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Tiny Core Linux userland featuring BusyBox v1.36 ash shell, standard Linux coreutils, and FLWM graphical window manager.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Zero Native Dependencies</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Runs 100% in client-side browser WebAssembly without server-side compute, proxy relays, or cloud backend requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Component Attribution & Licenses */}
      <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Open-Source Attribution & Licenses
        </h2>

        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="font-medium text-slate-200">Creator & Lead Developer</span>
            <span className="text-sky-400 font-medium">Azeem Ahmad</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-850">
            <span className="font-medium text-slate-200">Tiny Core Linux 17.1</span>
            <span className="text-slate-500">GNU GPL v2 (Robert Shingledecker & Team)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-850">
            <span className="font-medium text-slate-200">v86 PC Emulator</span>
            <span className="text-slate-500">BSD 2-Clause (Fabian Hemmer)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-850">
            <span className="font-medium text-slate-200">SeaBIOS rel-1.16.2</span>
            <span className="text-slate-500">GNU LGPL v3 / GPL v3 (Kevin O'Connor)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-850">
            <span className="font-medium text-slate-200">React 18 & Vite 5.4</span>
            <span className="text-slate-500">MIT License</span>
          </div>
        </div>
      </div>
    </div>
  );
};
