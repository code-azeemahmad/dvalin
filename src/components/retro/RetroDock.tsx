import React from 'react';
import { useWindowManager } from '@/features/desktop/WindowContext';

export const RetroDock: React.FC = () => {
  const { openWindow, windows } = useWindowManager();

  const isAppRunning = (appId: string) => {
    return windows.some((w) => w.appId === appId && w.isOpen);
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-auto">
      <div className="flex items-end space-x-3 px-4 py-2 bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50">
        {/* 1. File Explorer (Vintage PC) */}
        <button
          type="button"
          onClick={() => openWindow('file-explorer')}
          title="File Explorer (Archive)"
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:scale-115 active:scale-95 focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center drop-shadow-lg">
            <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none">
              {/* Computer monitor */}
              <rect x="8" y="6" width="32" height="26" rx="3" fill="#cbd5e0" stroke="#2d3748" strokeWidth="2" />
              {/* Screen */}
              <rect x="12" y="10" width="24" height="18" rx="1" fill="#2b6cb0" />
              <rect x="14" y="12" width="6" height="4" fill="#63b3ed" />
              <rect x="22" y="12" width="12" height="2" fill="#bee3f8" />
              <rect x="14" y="18" width="20" height="2" fill="#bee3f8" />
              <rect x="14" y="22" width="15" height="2" fill="#bee3f8" />
              {/* Stand */}
              <rect x="20" y="32" width="8" height="4" fill="#a0aec0" stroke="#2d3748" strokeWidth="1.5" />
              <rect x="14" y="36" width="20" height="4" rx="1" fill="#cbd5e0" stroke="#2d3748" strokeWidth="1.5" />
            </svg>
          </div>
          {isAppRunning('file-explorer') && (
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm mt-0.5" />
          )}
        </button>

        {/* 2. Web Browser (Globe WWW) */}
        <button
          type="button"
          onClick={() => openWindow('browser')}
          title="Web Browser"
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:scale-115 active:scale-95 focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center drop-shadow-lg">
            <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none">
              {/* Globe */}
              <circle cx="24" cy="24" r="17" fill="#3182ce" stroke="#1a365d" strokeWidth="2" />
              <ellipse cx="24" cy="24" rx="17" ry="6" stroke="#bee3f8" strokeWidth="1.5" />
              <ellipse cx="24" cy="24" rx="7" ry="17" stroke="#bee3f8" strokeWidth="1.5" />
              <line x1="24" y1="7" x2="24" y2="41" stroke="#bee3f8" strokeWidth="1.5" />
              {/* WWW Banner */}
              <rect x="6" y="20" width="36" height="8" rx="2" fill="#ecc94b" stroke="#744210" strokeWidth="1.5" />
              <text x="24" y="26.5" fill="#744210" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                WWW
              </text>
            </svg>
          </div>
          {isAppRunning('browser') && (
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm mt-0.5" />
          )}
        </button>

        {/* 3. Text Editor (Notebook) */}
        <button
          type="button"
          onClick={() => openWindow('text-editor')}
          title="Text Editor"
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:scale-115 active:scale-95 focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center drop-shadow-lg">
            <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none">
              {/* Notepad sheet with corner fold */}
              <path
                d="M11 7 C11 5.5, 31 5.5, 31 5.5 L37 11.5 L37 41 C37 42.5, 11 42.5, 11 41 Z"
                fill="#fefcbf"
                stroke="#b7791f"
                strokeWidth="2"
              />
              <path d="M31 5.5 L31 11.5 L37 11.5" fill="#ecc94b" stroke="#b7791f" strokeWidth="1.5" />
              {/* Text lines */}
              <line x1="16" y1="16" x2="28" y2="16" stroke="#d69e2e" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="22" x2="32" y2="22" stroke="#d69e2e" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="28" x2="32" y2="28" stroke="#d69e2e" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="34" x2="24" y2="34" stroke="#d69e2e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {isAppRunning('text-editor') && (
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm mt-0.5" />
          )}
        </button>

        {/* 4. Messages (Speech Bubble with red badge '6') */}
        <button
          type="button"
          onClick={() => openWindow('messages')}
          title="Messages (6 Unread)"
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:scale-115 active:scale-95 focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center relative drop-shadow-lg">
            <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none">
              {/* Message speech bubble */}
              <path
                d="M8 12 C8 8, 40 8, 40 12 L40 30 C40 34, 24 34, 20 34 L12 40 L14 34 L8 34 C8 34, 8 16, 8 12 Z"
                fill="#48bb78"
                stroke="#22543d"
                strokeWidth="2"
              />
              <ellipse cx="18" cy="21" rx="2" ry="2" fill="#fff" />
              <ellipse cx="24" cy="21" rx="2" ry="2" fill="#fff" />
              <ellipse cx="30" cy="21" rx="2" ry="2" fill="#fff" />
            </svg>
            {/* Red Badge '6' matching reference */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-md">
              <span className="text-[10px] font-bold text-white font-mono leading-none">6</span>
            </div>
          </div>
          {isAppRunning('messages') && (
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm mt-0.5" />
          )}
        </button>

        {/* 5. Terminal (>_) */}
        <button
          type="button"
          onClick={() => openWindow('terminal')}
          title="Terminal (Real Linux Shell)"
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:scale-115 active:scale-95 focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center drop-shadow-lg">
            <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none">
              {/* Black Terminal Monitor */}
              <rect x="7" y="8" width="34" height="28" rx="3" fill="#1a202c" stroke="#4a5568" strokeWidth="2" />
              <rect x="10" y="11" width="28" height="22" rx="1" fill="#000" />
              {/* Green >_ */}
              <text x="13" y="24" fill="#48bb78" fontSize="11" fontWeight="bold" fontFamily="monospace">
                &gt;_
              </text>
              {/* Stand */}
              <rect x="19" y="36" width="10" height="4" fill="#4a5568" />
              <rect x="14" y="40" width="20" height="2" rx="1" fill="#718096" />
            </svg>
          </div>
          {isAppRunning('terminal') && (
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm mt-0.5" />
          )}
        </button>

        {/* 6. Trash (Metal Mesh Can) */}
        <button
          type="button"
          onClick={() => openWindow('trash')}
          title="Trash"
          className="group relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:scale-115 active:scale-95 focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center drop-shadow-lg">
            <svg viewBox="0 0 48 48" className="w-11 h-11" fill="none">
              {/* Lid */}
              <ellipse cx="24" cy="11" rx="15" ry="3" fill="#cbd5e0" stroke="#4a5568" strokeWidth="1.5" />
              <rect x="21" y="6" width="6" height="3" rx="1" fill="#a0aec0" stroke="#4a5568" strokeWidth="1.5" />
              {/* Can body */}
              <path
                d="M12 11 L15 39 C15 41, 33 41, 33 39 L36 11"
                fill="#e2e8f0"
                stroke="#4a5568"
                strokeWidth="2"
              />
              {/* Vertical ribs */}
              <line x1="18" y1="14" x2="19" y2="38" stroke="#a0aec0" strokeWidth="1.5" />
              <line x1="24" y1="14" x2="24" y2="39" stroke="#a0aec0" strokeWidth="1.5" />
              <line x1="30" y1="14" x2="29" y2="38" stroke="#a0aec0" strokeWidth="1.5" />
            </svg>
          </div>
          {isAppRunning('trash') && (
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm mt-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
