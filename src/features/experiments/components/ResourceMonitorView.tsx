import React, { useState, useEffect } from 'react';
import { ResourceMonitoringService } from '../services/ResourceMonitoringService';
import { GuestResourceMetrics, HostResourceMetrics } from '../types/ExperimentTypes';
import { Activity, Play, Pause, Monitor, ShieldAlert } from 'lucide-react';

export const ResourceMonitorView: React.FC = () => {
  const service = ResourceMonitoringService.getInstance();
  const [guestMetrics, setGuestMetrics] = useState<GuestResourceMetrics | null>(null);
  const [hostMetrics, setHostMetrics] = useState<HostResourceMetrics | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(service.getIsPaused());

  useEffect(() => {
    service.start(3000);
    const unsub = service.subscribe((guest, host) => {
      setGuestMetrics(guest);
      setHostMetrics(host);
      setIsPaused(service.getIsPaused());
    });

    return () => {
      unsub();
    };
  }, [service]);

  const togglePause = () => {
    if (isPaused) {
      service.resume();
      setIsPaused(false);
    } else {
      service.pause();
      setIsPaused(true);
    }
  };

  return (
    <div className="flex-1 p-5 bg-slate-950 text-slate-100 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Real-Time OS Resource Monitor</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bounded periodic telemetry strictly separating in-guest Linux kernel metrics from host browser metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={togglePause}
          className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs font-semibold cursor-pointer transition-colors ${
            isPaused
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isPaused ? 'Resume Monitoring' : 'Pause Telemetry'}</span>
        </button>
      </div>

      {/* Guest Linux Kernel Telemetry */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Guest Operating System Metrics (Source: Linux Kernel 6.18)</span>
          </span>
          {guestMetrics && (
            <span className="text-[10px] text-slate-500 font-mono">
              Last sampled: {new Date(guestMetrics.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>

        {guestMetrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Guest Uptime</span>
              <div className="text-sm font-bold text-white font-mono">{guestMetrics.uptimeSeconds}s</div>
              <p className="text-[10px] text-slate-400">Seconds elapsed since SeaBIOS boot</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Allocated RAM</span>
              <div className="text-sm font-bold text-white font-mono">
                {Math.round(guestMetrics.memTotalKb / 1024)} MB Total
              </div>
              <p className="text-[10px] text-slate-400">Physical x86 guest RAM limit</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Available Free Memory</span>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {Math.round(guestMetrics.memFreeKb / 1024)} MB Free
              </div>
              <p className="text-[10px] text-slate-400">Unused physical memory pages</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Kernel Release</span>
              <div className="text-sm font-bold text-white font-mono">{guestMetrics.kernelRelease}</div>
              <p className="text-[10px] text-slate-400">{guestMetrics.cpuModel}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Virtual machine is inactive. Boot Linux from the Start Menu to observe real guest metrics.</span>
          </div>
        )}
      </div>

      {/* Host Browser Telemetry */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-semibold text-sky-400 flex items-center space-x-1.5">
          <Monitor className="w-3.5 h-3.5" />
          <span>Host Web Application Metrics (Source: Browser Engine & JavaScript Heap)</span>
        </span>

        {hostMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Host JS Heap</span>
              <div className="text-sm font-bold text-sky-400 font-mono">
                {hostMetrics.jsHeapUsedMb > 0 ? `${hostMetrics.jsHeapUsedMb} MB` : 'Browser Restricted'}
              </div>
              <p className="text-[10px] text-slate-400">Memory consumed by WebOS React host</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Virtual Display Res</span>
              <div className="text-sm font-bold text-white font-mono">{hostMetrics.screenResolution}</div>
              <p className="text-[10px] text-slate-400">VGA framebuffer dimensions</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Telemetry Polling Rate</span>
              <div className="text-sm font-bold text-white font-mono">3000 ms</div>
              <p className="text-[10px] text-slate-400">Bounded sampling rate (zero host lag)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
