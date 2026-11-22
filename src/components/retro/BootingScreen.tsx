import React, { useState, useEffect } from 'react';
import { BerryLogo } from './BerryLogo';

interface BootingScreenProps {
  onComplete: () => void;
}

export const BootingScreen: React.FC<BootingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Starting Dvalin OS...');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    // Fast initial boot progress animation (~2.8s total)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8) + 4;
        const bounded = Math.min(next, 100);

        if (bounded < 30) {
          setStatusText('Initializing SeaBIOS & x86 hardware...');
        } else if (bounded < 60) {
          setStatusText('Loading Linux kernel 6.18 & rootfs...');
        } else if (bounded < 85) {
          setStatusText('Mounting filesystems & starting user space...');
        } else if (bounded < 99) {
          setStatusText('Starting display server & desktop...');
        } else {
          setStatusText('Ready!');
        }

        return bounded;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // When progress hits 100, transition after a brief pause
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  // Keyboard shortcut to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white font-mono select-none"
      onClick={() => {
        if (progress > 30) onComplete();
      }}
    >
      <div className="flex flex-col items-center text-center max-w-lg px-6 space-y-6">
        {/* Pixel Berry Logo */}
        <div className="mb-2 transition-transform duration-300 hover:scale-110">
          <BerryLogo size={56} />
        </div>

        {/* System Notice */}
        <div className="space-y-3">
          <div className="text-[11px] tracking-[0.25em] text-slate-400 uppercase font-semibold">
            SYSTEM NOTICE
          </div>
          <p className="text-sm font-medium text-slate-200">
            Dvalin OS has sound. Headphones recommended.
          </p>
          <p className="text-xs text-slate-400">
            Fullscreen puts the browser away<br />
            and leaves only the desktop.
          </p>
        </div>

        {/* Enter Fullscreen Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-none border-2 border-slate-300 hover:bg-slate-200 active:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all cursor-pointer"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Esc leaves fullscreen whenever you want.
        </p>

        {/* Progress Bar Container */}
        <div className="w-80 pt-4 space-y-2">
          <div className="w-full h-2 bg-slate-900 border border-slate-700 rounded-sm overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Percentage */}
          <div className="text-xs font-bold text-slate-300">
            {progress}%
          </div>

          {/* Subtitle status */}
          <div className="text-[11px] text-slate-500 h-4">
            {statusText}
          </div>
        </div>

        {/* Skip hint */}
        <div className="text-[10px] text-slate-600 pt-6">
          Press [Enter] or click anywhere to skip
        </div>
      </div>
    </div>
  );
};
