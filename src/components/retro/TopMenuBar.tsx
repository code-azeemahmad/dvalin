import React, { useState, useEffect } from 'react';
import { BerryLogo } from './BerryLogo';
import { Wifi } from 'lucide-react';
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
    <header className="top-menu-bar h-10 px-4 bg-sky-900/70 backdrop-blur-md border-b border-sky-600/30 text-slate-100 flex items-center justify-between select-none z-40 relative shadow-sm">
      {/* Left Menu Items */}
      <div className="flex items-center space-x-5">
        {/* Dvalin Logo Icon */}
        <div className="relative">
          <button
            type="button"
            aria-label="Dvalin Menu"
            onClick={() => toggleMenu('dvalin')}
            className="p-1 hover:bg-white/15 rounded-md cursor-pointer transition-colors flex items-center justify-center"
          >
            <BerryLogo size={26} />
          </button>
          {activeMenu === 'dvalin' && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg shadow-2xl py-1.5 text-slate-200 z-50">
              <button
                type="button"
                onClick={() => {
                  openWindow('about');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white text-[13px] font-mono cursor-pointer"
              >
                About Dvalin OS
              </button>
              <div className="my-1 border-t border-slate-700/60" />
              <button
                type="button"
                onClick={() => {
                  openWindow('control-panel');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white text-[13px] font-mono cursor-pointer"
              >
                System Settings
              </button>
            </div>
          )}
        </div>

        {/* File Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('file')}
            className={`px-2.5 py-1 rounded-md text-[13px] font-mono font-bold tracking-wide cursor-pointer hover:bg-white/15 transition-colors ${
              activeMenu === 'file' ? 'bg-white/20' : ''
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg shadow-2xl py-1.5 text-slate-200 z-50">
              <button
                type="button"
                onClick={() => {
                  openWindow('text-editor');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white text-[13px] font-mono cursor-pointer"
              >
                New Text File
              </button>
              <button
                type="button"
                onClick={() => {
                  openWindow('terminal');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white text-[13px] font-mono cursor-pointer"
              >
                New Terminal Window
              </button>
              <button
                type="button"
                onClick={() => {
                  openWindow('file-explorer');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white text-[13px] font-mono cursor-pointer"
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
            className={`px-2.5 py-1 rounded-md text-[13px] font-mono font-bold tracking-wide cursor-pointer hover:bg-white/15 transition-colors ${
              activeMenu === 'edit' ? 'bg-white/20' : ''
            }`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute left-0 top-full mt-1.5 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg shadow-2xl py-1.5 text-slate-200 z-50">
              <div className="px-3.5 py-1.5 text-xs text-slate-400 font-mono">Cut</div>
              <div className="px-3.5 py-1.5 text-xs text-slate-400 font-mono">Copy</div>
              <div className="px-3.5 py-1.5 text-xs text-slate-400 font-mono">Paste</div>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleMenu('view')}
            className={`px-2.5 py-1 rounded-md text-[13px] font-mono font-bold tracking-wide cursor-pointer hover:bg-white/15 transition-colors ${
              activeMenu === 'view' ? 'bg-white/20' : ''
            }`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-lg shadow-2xl py-1.5 text-slate-200 z-50">
              <button
                type="button"
                onClick={() => {
                  toggleFullscreen();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white text-[13px] font-mono cursor-pointer"
              >
                Toggle Fullscreen
              </button>
              <button
                type="button"
                onClick={() => {
                  openWindow('control-panel');
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-600 hover:text-white text-[13px] font-mono cursor-pointer"
              >
                System Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Status Tray: Wi-Fi, Battery, Clock */}
      <div className="flex items-center space-x-4 text-slate-100 font-mono">
        {/* Wi-Fi Icon */}
        <div title="Network Connected: Virtual Ethernet" className="flex items-center">
          <Wifi className="w-[18px] h-[18px] text-slate-100" strokeWidth={2.2} />
        </div>

        {/* Battery Icon with Green Fill */}
        <div title="Battery: 100% Charged" className="flex items-center">
          <div className="relative w-6 h-3.5 border-1.5 border-slate-100 rounded-[3px] p-[1.5px] flex items-center">
            <div className="h-full w-full bg-emerald-400 rounded-[1px]" />
            <div className="absolute -right-[3.5px] top-1/2 -translate-y-1/2 w-[2px] h-[6px] bg-slate-100 rounded-r-[1px]" />
          </div>
        </div>

        {/* Live Clock */}
        <div className="font-mono font-bold text-[13px] text-slate-100 tracking-wider">
          {timeStr}
        </div>
      </div>
    </header>
  );
};
