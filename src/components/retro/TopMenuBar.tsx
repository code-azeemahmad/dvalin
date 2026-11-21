import React, { useState, useEffect } from 'react';
import { BerryLogo } from './BerryLogo';
import { Wifi, BatteryMedium } from 'lucide-react';
import { useWindowManager } from '@/features/desktop/WindowContext';

export const TopMenuBar: React.FC = () => {
  const { openWindow } = useWindowManager();
  const [timeStr, setTimeStr] = useState<string>('20:09');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.top-menu-bar')) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const toggleMenu = (name: string) => {
    setActiveMenu(activeMenu === name ? null : name);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="top-menu-bar h-7 px-3 bg-sky-900/65 backdrop-blur-md border-b border-sky-700/30 text-slate-100 flex items-center justify-between text-xs font-mono select-none z-40 relative shadow-sm">
      {/* Left Menu Items */}
      <div className="flex items-center space-x-3">
        {/* Berry Logo Icon */}
        <button
          type="button"
          onClick={() => toggleMenu('apple')}
          className="p-0.5 hover:bg-white/10 rounded cursor-pointer transition-colors"
        >
          <BerryLogo size={16} />
        </button>

        {/* File Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('file')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer hover:bg-white/15 transition-colors ${
              activeMenu === 'file' ? 'bg-white/20' : ''
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-md shadow-2xl py-1 text-slate-200 z-50">
              <button
                type="button"
                onClick={() => {
                  openWindow('text-editor');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-600 hover:text-white text-xs cursor-pointer"
              >
                New Text File
              </button>
              <button
                type="button"
                onClick={() => {
                  openWindow('terminal');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-600 hover:text-white text-xs cursor-pointer"
              >
                New Terminal Window
              </button>
              <button
                type="button"
                onClick={() => {
                  openWindow('file-explorer');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-600 hover:text-white text-xs cursor-pointer"
              >
                Open File Explorer
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('edit')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer hover:bg-white/15 transition-colors ${
              activeMenu === 'edit' ? 'bg-white/20' : ''
            }`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute left-0 top-full mt-1 w-44 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-md shadow-2xl py-1 text-slate-200 z-50">
              <div className="px-3 py-1 text-[11px] text-slate-400">Cut</div>
              <div className="px-3 py-1 text-[11px] text-slate-400">Copy</div>
              <div className="px-3 py-1 text-[11px] text-slate-400">Paste</div>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('view')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer hover:bg-white/15 transition-colors ${
              activeMenu === 'view' ? 'bg-white/20' : ''
            }`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-md shadow-2xl py-1 text-slate-200 z-50">
              <button
                type="button"
                onClick={() => {
                  toggleFullscreen();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-600 hover:text-white text-xs cursor-pointer"
              >
                Toggle Fullscreen
              </button>
              <button
                type="button"
                onClick={() => {
                  openWindow('control-panel');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-600 hover:text-white text-xs cursor-pointer"
              >
                System Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Status Tray: Wi-Fi, Battery, Clock */}
      <div className="flex items-center space-x-3 text-slate-200 font-mono text-[11px]">
        {/* Wi-Fi Icon */}
        <div title="Network Connected: Virtual Ethernet" className="flex items-center">
          <Wifi className="w-3.5 h-3.5" />
        </div>

        {/* Battery Icon */}
        <div title="Battery: 100% Charged" className="flex items-center">
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>

        {/* Live Clock */}
        <div className="font-semibold text-slate-100 tracking-wider">
          {timeStr}
        </div>
      </div>
    </header>
  );
};
