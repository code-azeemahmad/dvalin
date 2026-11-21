import React from 'react';
import { Cpu, HardDrive, ArrowRight, Layers } from 'lucide-react';

interface ExperimentVisualizationProps {
  experimentId: string;
}

export const ExperimentVisualization: React.FC<ExperimentVisualizationProps> = ({ experimentId }) => {
  // Paging Visualization for exp-mem-03
  if (experimentId === 'exp-mem-03') {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-white">
          <HardDrive className="w-4 h-4 text-sky-400" />
          <span>x86 2-Level Paging & Address Translation Model (Educational Diagram)</span>
        </div>
        <p className="text-[11px] text-slate-400">
          The 32-bit linear address is divided into Directory (10 bits), Table (10 bits), and Offset (12 bits = 4 KB page).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">CR3 Register</span>
            <div className="font-semibold text-sky-400 font-mono">Page Directory Base</div>
            <p className="text-[10px] text-slate-400">Physical address in RAM</p>
          </div>

          <div className="flex items-center justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">Page Table (1024 entries)</span>
            <div className="font-semibold text-emerald-400 font-mono">PTE Entry (4 bytes)</div>
            <p className="text-[10px] text-slate-400">Contains Frame Address + Flags (r/w, p)</p>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-mono">Physical RAM Frame</span>
            <div className="font-semibold text-indigo-400 font-mono">4096-Byte Page</div>
            <p className="text-[10px] text-slate-400">Data read/written by virtual CPU</p>
          </div>
        </div>
      </div>
    );
  }

  // CPU Scheduling Visualization for exp-proc-04
  if (experimentId === 'exp-proc-04') {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-white">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Linux Completely Fair Scheduler (CFS) Model (Educational Simulation)</span>
        </div>
        <p className="text-[11px] text-slate-400">
          CFS maintains a red-black tree indexed by virtual runtime (vruntime). Lower nice values accumulate vruntime slower.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3 pt-2 text-xs">
          <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="font-semibold text-purple-300">Ready Queue (CFS Red-Black Tree)</div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300">PID 120 (nice -5)</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">PID 124 (nice 0)</span>
              <span className="px-2 py-0.5 rounded bg-slate-850 text-slate-400">PID 130 (nice 10)</span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="font-semibold text-emerald-400">CPU Core (v86 x86 Execution)</div>
            <p className="text-[11px] text-slate-400">Executing timeslice according to weight allocation.</p>
          </div>
        </div>
      </div>
    );
  }

  // Boot Process Visualization for exp-kern-04
  if (experimentId === 'exp-kern-04') {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-white">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>WebOS Linux Boot Pipeline Architecture</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Milestones from browser WebAssembly startup to genuine Linux FLWM graphical desktop.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2 text-center text-xs">
          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-sky-400 font-semibold">1. WebAssembly</span>
            <div className="font-medium text-white text-[11px] mt-0.5">v86 Core Initialized</div>
          </div>
          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-sky-400 font-semibold">2. SeaBIOS</span>
            <div className="font-medium text-white text-[11px] mt-0.5">POST & PCI Setup</div>
          </div>
          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-sky-400 font-semibold">3. ISOLINUX</span>
            <div className="font-medium text-white text-[11px] mt-0.5">Loads vmlinuz & core.gz</div>
          </div>
          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-sky-400 font-semibold">4. Linux Kernel</span>
            <div className="font-medium text-white text-[11px] mt-0.5">tmpfs Root & Drivers</div>
          </div>
          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] text-emerald-400 font-semibold">5. User Desktop</span>
            <div className="font-medium text-white text-[11px] mt-0.5">Xvesa & FLWM Ready</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
