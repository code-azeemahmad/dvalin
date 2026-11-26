import React, { useState } from 'react';
import { useWindowManager } from '@/features/desktop/WindowContext';
import { MySocialsModal } from './MySocialsModal';

export const RetroDesktopIcons: React.FC = () => {
  const { openWindow } = useWindowManager();
  const [isSocialsOpen, setIsSocialsOpen] = useState<boolean>(false);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 select-none z-10 flex justify-between">
      {/* Left Column Icons */}
      <div className="flex flex-col space-y-5 pointer-events-auto">
        {/* ReadMe.txt */}
        <button
          type="button"
          onDoubleClick={() => openWindow('text-editor')}
          onClick={() => openWindow('text-editor')}
          className="group flex flex-col items-center w-20 p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-md" fill="none">
              <rect x="10" y="6" width="28" height="36" rx="2" fill="#fff" stroke="#2d3748" strokeWidth="2" />
              <rect x="10" y="6" width="28" height="10" fill="#edf2f7" />
              <text x="14" y="14" fill="#2b6cb0" fontSize="7" fontWeight="bold" fontFamily="monospace">
                TXT
              </text>
              <line x1="15" y1="22" x2="33" y2="22" stroke="#718096" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="28" x2="33" y2="28" stroke="#718096" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="34" x2="25" y2="34" stroke="#718096" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] tracking-wide mt-1 text-center truncate max-w-full">
            ReadMe.txt
          </span>
        </button>

        {/* Calculator */}
        <button
          type="button"
          onDoubleClick={() => openWindow('calculator')}
          onClick={() => openWindow('calculator')}
          className="group flex flex-col items-center w-20 p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-md" fill="none">
              <rect x="8" y="6" width="32" height="36" rx="3" fill="#2d3748" stroke="#1a202c" strokeWidth="2" />
              <rect x="12" y="10" width="24" height="8" rx="1" fill="#cbd5e0" />
              <text x="14" y="17" fill="#1a202c" fontSize="6" fontFamily="monospace" fontWeight="bold">
                80085
              </text>
              <rect x="12" y="22" width="5" height="4" rx="1" fill="#e2e8f0" />
              <rect x="19" y="22" width="5" height="4" rx="1" fill="#e2e8f0" />
              <rect x="26" y="22" width="5" height="4" rx="1" fill="#dd6b20" />
              <rect x="12" y="28" width="5" height="4" rx="1" fill="#e2e8f0" />
              <rect x="19" y="28" width="5" height="4" rx="1" fill="#e2e8f0" />
              <rect x="26" y="28" width="5" height="4" rx="1" fill="#dd6b20" />
              <rect x="12" y="34" width="12" height="4" rx="1" fill="#3182ce" />
              <rect x="26" y="34" width="5" height="4" rx="1" fill="#38a169" />
            </svg>
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] tracking-wide mt-1 text-center truncate max-w-full">
            Calculator
          </span>
        </button>

        {/* Dash's Journal */}
        <button
          type="button"
          onDoubleClick={() => openWindow('text-editor')}
          onClick={() => openWindow('text-editor')}
          className="group flex flex-col items-center w-20 p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-md" fill="none">
              <path
                d="M10 12 C10 8, 38 8, 38 12 L36 36 C36 40, 8 40, 8 36 Z"
                fill="#f6e05e"
                stroke="#b7791f"
                strokeWidth="2"
              />
              <path d="M14 16 Q24 18 34 16" stroke="#975a16" strokeWidth="1.5" />
              <path d="M14 22 Q24 24 34 22" stroke="#975a16" strokeWidth="1.5" />
              <path d="M14 28 Q24 30 30 28" stroke="#975a16" strokeWidth="1.5" />
              {/* Quill feather */}
              <path
                d="M36 8 C42 4, 44 14, 32 28 L30 26 Z"
                fill="#ecc94b"
                stroke="#744210"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] tracking-wide mt-1 text-center truncate max-w-full">
            Dash's Journal
          </span>
        </button>

        {/* archive */}
        <button
          type="button"
          onDoubleClick={() => openWindow('file-explorer')}
          onClick={() => openWindow('file-explorer')}
          className="group flex flex-col items-center w-20 p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-md" fill="none">
              <path
                d="M6 14 L18 14 L22 18 L42 18 L42 38 L6 38 Z"
                fill="#718096"
                stroke="#2d3748"
                strokeWidth="2"
              />
              {/* Lock icon */}
              <rect x="21" y="24" width="8" height="6" rx="1" fill="#ecc94b" stroke="#744210" strokeWidth="1.5" />
              <path d="M23 24 V21 C23 19, 27 19, 27 21 V24" stroke="#744210" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] tracking-wide mt-1 text-center truncate max-w-full">
            archive
          </span>
        </button>
      </div>

      {/* Right Column Icons */}
      <div className="flex flex-col space-y-5 pointer-events-auto items-end">
        {/* Control Panel */}
        <button
          type="button"
          onDoubleClick={() => openWindow('control-panel')}
          onClick={() => openWindow('control-panel')}
          className="group flex flex-col items-center w-20 p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-md" fill="none">
              {/* Retro Control Panel with sliders and status LEDs */}
              <rect x="6" y="8" width="36" height="32" rx="3" fill="#2d3748" stroke="#1a202c" strokeWidth="2" />
              <rect x="6" y="8" width="36" height="7" rx="2" fill="#4a5568" />
              <circle cx="11" cy="11.5" r="1.5" fill="#e53e3e" />
              <circle cx="16" cy="11.5" r="1.5" fill="#ecc94b" />
              <circle cx="21" cy="11.5" r="1.5" fill="#48bb78" />
              <line x1="12" y1="21" x2="36" y2="21" stroke="#718096" strokeWidth="2" strokeLinecap="round" />
              <rect x="18" y="18" width="6" height="6" rx="1" fill="#4299e1" stroke="#2b6cb0" strokeWidth="1.5" />
              <line x1="12" y1="28" x2="36" y2="28" stroke="#718096" strokeWidth="2" strokeLinecap="round" />
              <rect x="28" y="25" width="6" height="6" rx="1" fill="#48bb78" stroke="#276749" strokeWidth="1.5" />
              <rect x="12" y="33" width="10" height="4" rx="2" fill="#cbd5e0" />
              <circle cx="14" cy="35" r="2" fill="#ed8936" />
              <rect x="26" y="33" width="10" height="4" rx="2" fill="#cbd5e0" />
              <circle cx="34" cy="35" r="2" fill="#4299e1" />
            </svg>
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] tracking-wide mt-1 text-center truncate max-w-full">
            Control Panel
          </span>
        </button>

        {/* My Socials */}
        <button
          type="button"
          onDoubleClick={() => setIsSocialsOpen(true)}
          onClick={() => setIsSocialsOpen(true)}
          className="group flex flex-col items-center w-20 p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-slate-900/80 border-2 border-slate-700 grid grid-cols-2 p-1 gap-1 shadow-lg">
              <div className="bg-black text-[7px] text-white font-bold flex items-center justify-center rounded">X</div>
              <div className="bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-[6px] text-white font-bold flex items-center justify-center rounded">IG</div>
              <div className="bg-red-600 text-[7px] text-white font-bold flex items-center justify-center rounded">YT</div>
              <div className="bg-[#0077b5] text-[7px] text-white font-bold flex items-center justify-center rounded">IN</div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] tracking-wide mt-1 text-center truncate max-w-full">
            My Socials
          </span>
        </button>

        {/* Community */}
        <button
          type="button"
          onDoubleClick={() => openWindow('about')}
          onClick={() => openWindow('about')}
          className="group flex flex-col items-center w-20 p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all cursor-pointer focus:outline-none"
        >
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-md" fill="none">
              <rect x="8" y="10" width="32" height="28" rx="2" fill="#fff" stroke="#c53030" strokeWidth="2" />
              <path d="M16 18 C14 15, 12 17, 14 20 L20 26 L26 20 C28 17, 26 15, 24 18 Z" fill="#e53e3e" />
              <polygon points="34,16 36,20 40,21 37,24 38,28 34,26 30,28 31,24 28,21 32,20" fill="#ecc94b" />
            </svg>
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] tracking-wide mt-1 text-center truncate max-w-full">
            Community
          </span>
        </button>
      </div>

      {/* Floating My Socials Modal Menu */}
      <MySocialsModal
        isOpen={isSocialsOpen}
        onClose={() => setIsSocialsOpen(false)}
      />
    </div>
  );
};
