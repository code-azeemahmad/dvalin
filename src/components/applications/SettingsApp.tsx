import React, { useState } from 'react';
import { useSettings } from '@/features/settings/useSettings';
import { WALLPAPER_OPTIONS } from '@/features/desktop/appRegistry';
import { useEmulator } from '@/features/emulator/useEmulator';
import { TINYCORE_PROFILE } from '@/features/emulator/config';
import {
  Palette,
  Cpu,
  RotateCcw,
  Check,
  HardDrive,
  Sliders,
} from 'lucide-react';

export const SettingsApp: React.FC = () => {
  const {
    settings,
    setWallpaper,
    setDisplayScale,
    resetSettings,
  } = useSettings();

  const { status, restart } = useEmulator();
  const [activeTab, setActiveTab] = useState<'appearance' | 'emulator'>('appearance');

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-full bg-slate-950 text-slate-200 select-none overflow-hidden">
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-48 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1 shrink-0">
        <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Preferences
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`w-full px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'appearance'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Appearance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('emulator')}
          className={`w-full px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'emulator'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Virtual Machine</span>
        </button>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Desktop Appearance</h2>
              <p className="text-xs text-slate-400">
                Customize desktop wallpaper, ambient lighting, and UI scaling.
              </p>
            </div>

            {/* Wallpaper Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                <span>Desktop Wallpaper</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {WALLPAPER_OPTIONS.map((wp) => {
                  const isSelected = settings.wallpaper === wp.id;
                  return (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => setWallpaper(wp.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-950/30'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: wp.previewColor }}
                        />
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{wp.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{wp.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Scaling */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Display Scaling</span>
              </label>

              <div className="flex items-center space-x-2">
                {[1, 1.25, 1.5].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setDisplayScale(scale)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      settings.displayScale === scale
                        ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {Math.round(scale * 100)}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Adjusts host UI window scale. (Guest Linux resolution is managed inside the virtual machine).
              </p>
            </div>

            {/* Reset Preferences */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-300">Reset All Settings</div>
                <div className="text-[10px] text-slate-500">Restores defaults stored in browser localStorage.</div>
              </div>
              <button
                type="button"
                onClick={resetSettings}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )}

        {activeTab === 'emulator' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Virtual Machine Hardware</h2>
              <p className="text-xs text-slate-400">
                Inspect hardware emulation settings and guest operating system parameters.
              </p>
            </div>

            {/* Hardware Profile Specs */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Emulated PC Architecture</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">CPU Architecture</span>
                  <div className="font-semibold text-slate-200">x86 (32-bit i686)</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Guest RAM</span>
                  <div className="font-semibold text-slate-200">128 MB (134,217,728 bytes)</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">VGA Memory</span>
                  <div className="font-semibold text-slate-200">8 MB (Bochs / Cirrus)</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">BIOS Firmware</span>
                  <div className="font-semibold text-slate-200">SeaBIOS rel-1.16.2</div>
                </div>
              </div>
            </div>

            {/* Guest Linux Distribution */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Guest Operating System</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Distribution:</span>
                  <span className="font-semibold text-slate-200">{TINYCORE_PROFILE.name} {TINYCORE_PROFILE.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kernel Version:</span>
                  <span className="font-mono text-slate-200">6.18.35-tinycore</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Userland & Shell:</span>
                  <span className="text-slate-200">BusyBox ash shell</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Window Manager:</span>
                  <span className="text-slate-200">FLWM (Fast Light Window Manager)</span>
                </div>
              </div>
            </div>

            {/* VM State Action */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300">VM Hardware Reset</span>
                <p className="text-[10px] text-slate-500">Sends hardware reboot signal to the virtual CPU.</p>
              </div>

              <button
                type="button"
                disabled={status !== 'running'}
                onClick={() => restart()}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs font-semibold cursor-pointer ${
                  status === 'running'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reboot VM</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
