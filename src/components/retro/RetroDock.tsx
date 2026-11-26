import React, { useState } from 'react';
import { useWindowManager } from '@/features/desktop/WindowContext';

interface DockItem {
  id: string;
  name: string;
  renderIcon: () => React.ReactNode;
}

export const RetroDock: React.FC = () => {
  const { openWindow, windows } = useWindowManager();
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const isAppRunning = (appId: string) => {
    return windows.some((w) => w.appId === appId && w.isOpen);
  };

  const dockItems: DockItem[] = [
    {
      id: 'file-explorer',
      name: 'File Explorer',
      renderIcon: () => (
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#e8eee4] border border-black/40 shadow-md flex items-center justify-center transition-shadow group-hover:shadow-2xl">
          <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
            {/* Monitor housing */}
            <rect x="5" y="4" width="26" height="22" rx="3" fill="#e2e8f0" stroke="#1a202c" strokeWidth="1.8" />
            {/* Screen */}
            <rect x="8" y="7" width="20" height="15" rx="1.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.2" />
            {/* Cute face :3 */}
            <rect x="12" y="11" width="2.5" height="2.5" rx="0.5" fill="#0f172a" />
            <rect x="21.5" y="11" width="2.5" height="2.5" rx="0.5" fill="#0f172a" />
            <path d="M14 16.5 C15 18, 16 18, 17.5 16.5 C19 18, 20 18, 21 16.5" stroke="#0f172a" strokeWidth="1.3" strokeLinecap="round" />
            {/* Base */}
            <rect x="14" y="26" width="8" height="3" fill="#94a3b8" stroke="#1a202c" strokeWidth="1.4" />
            <rect x="9" y="29" width="18" height="3" rx="1" fill="#cbd5e1" stroke="#1a202c" strokeWidth="1.4" />
            {/* Power led */}
            <circle cx="23" cy="30.5" r="0.8" fill="#ef4444" />
          </svg>
        </div>
      ),
    },
    {
      id: 'browser',
      name: 'Browser',
      renderIcon: () => (
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#e8eee4] border border-black/40 shadow-md flex items-center justify-center transition-shadow group-hover:shadow-2xl">
          <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
            {/* Globe */}
            <circle cx="18" cy="18" r="13" fill="#22c55e" stroke="#14532d" strokeWidth="1.8" />
            <ellipse cx="18" cy="18" rx="13" ry="5" stroke="#15803d" strokeWidth="1.2" />
            <ellipse cx="18" cy="18" rx="5" ry="13" stroke="#15803d" strokeWidth="1.2" />
            <line x1="18" y1="5" x2="18" y2="31" stroke="#15803d" strokeWidth="1.2" />
            {/* WWW banner */}
            <rect x="4" y="14" width="28" height="8" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <text x="18" y="20" fill="#f8fafc" fontSize="5.5" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">
              WWW
            </text>
          </svg>
        </div>
      ),
    },
    {
      id: 'text-editor',
      name: 'Music',
      renderIcon: () => (
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#22262d] border border-black/50 shadow-md flex items-center justify-center transition-shadow group-hover:shadow-2xl">
          <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
            {/* Eighth notes matching dock reference */}
            <path
              d="M11 23 C9.5 23 8 24.2 8 25.8 C8 27.5 9.5 29 11.5 29 C13.5 29 14.5 27.5 14.5 25.8 L14.5 11 L25 8.5 L25 21 C23.5 21 22 22.2 22 23.8 C22 25.5 23.5 27 25.5 27 C27.5 27 28.5 25.5 28.5 23.8 L28.5 5.5 L11 8.5 Z"
              fill="#9d2f62"
              stroke="#581636"
              strokeWidth="1.3"
            />
          </svg>
        </div>
      ),
    },
    {
      id: 'messages',
      name: 'Messages',
      renderIcon: () => (
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#0066ff] border border-blue-900/50 shadow-md flex items-center justify-center relative transition-shadow group-hover:shadow-2xl">
          <svg viewBox="0 0 36 36" className="w-8.5 h-8.5" fill="none">
            {/* White speech bubble */}
            <path
              d="M7 8 C7 5.5 29 5.5 29 8 L29 20 C29 23 21 23 16 23 L9 28 L10.5 23 L7 23 C7 23 7 10 7 8 Z"
              fill="#ffffff"
              stroke="#1e3a8a"
              strokeWidth="1.6"
            />
          </svg>
          {/* Red Badge '6' matching reference */}
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-md">
            <span className="text-[10px] font-bold text-white font-mono leading-none">6</span>
          </div>
        </div>
      ),
    },
    {
      id: 'terminal',
      name: 'Terminal',
      renderIcon: () => (
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#1f242c] border border-black/60 shadow-md flex items-center justify-center transition-shadow group-hover:shadow-2xl">
          <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
            {/* Pixel Green > */}
            <path
              d="M10 11 L18 17 L10 23"
              stroke="#4ade80"
              strokeWidth="3.2"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            {/* Pixel Green Cursor _ */}
            <rect x="20" y="21" width="7" height="3" fill="#4ade80" />
          </svg>
        </div>
      ),
    },
    {
      id: 'trash',
      name: 'Trash',
      renderIcon: () => (
        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#e8eee4] border border-black/40 shadow-md flex items-center justify-center transition-shadow group-hover:shadow-2xl">
          <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
            {/* Trash Lid */}
            <ellipse cx="18" cy="9.5" rx="10" ry="2.2" fill="#93c5fd" stroke="#1e3a8a" strokeWidth="1.4" />
            <rect x="16" y="5.5" width="4" height="2.5" rx="0.5" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="1.2" />
            {/* Trash Body */}
            <path d="M9.5 9.5 L11.5 28.5 C11.5 30.5 24.5 30.5 24.5 28.5 L26.5 9.5" fill="#bfdbfe" stroke="#1e3a8a" strokeWidth="1.5" />
            {/* Ribs */}
            <line x1="14" y1="12.5" x2="14.5" y2="27.5" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="18" y1="12.5" x2="18" y2="28" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="22" y1="12.5" x2="21.5" y2="27.5" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <nav
      aria-label="Application Dock"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-auto"
    >
      <div className="flex items-end space-x-2.5 sm:space-x-3 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50">
        {dockItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openWindow(item.id)}
            onMouseEnter={() => setHoveredApp(item.id)}
            onMouseLeave={() => setHoveredApp(null)}
            onFocus={() => setHoveredApp(item.id)}
            onBlur={() => setHoveredApp(null)}
            aria-label={item.name}
            className="group relative flex flex-col items-center cursor-pointer transition-all duration-200 ease-out hover:-translate-y-2.5 hover:scale-125 active:scale-95 focus:outline-none z-10 hover:z-30"
          >
            {/* Floating Name Tooltip */}
            <div
              data-testid={`dock-tooltip-${item.id}`}
              role="tooltip"
              className={`absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-0.5 sm:py-1 bg-black/95 backdrop-blur-xs border border-white/25 rounded-md shadow-2xl shadow-black/90 pointer-events-none whitespace-nowrap transition-all duration-150 ease-out z-40 ${
                hoveredApp === item.id
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-90 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
              }`}
            >
              <span className="font-mono text-[10px] sm:text-xs font-bold text-white tracking-wider drop-shadow-md">
                {item.name}
              </span>
            </div>

            {/* Icon Render */}
            {item.renderIcon()}

            {/* Running Indicator Dot */}
            {isAppRunning(item.id) && (
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm mt-1" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
