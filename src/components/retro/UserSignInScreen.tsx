import React, { useState } from 'react';
import { resolveAssetPath } from '@/utils/assetPath';

interface UserSignInScreenProps {
  onSignIn: () => void;
}

export const UserSignInScreen: React.FC<UserSignInScreenProps> = ({ onSignIn }) => {
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden">
      {/* Background with blurred sunset pixel wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md scale-105"
        style={{ backgroundImage: `url('${resolveAssetPath('assets/images/desktop_screen.png')}')` }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" />

      {/* Sign-in Card */}
      <div className="relative z-10 flex flex-col items-center">
        {/* User Avatar Doodle */}
        <div className="w-20 h-20 rounded-full bg-white border-2 border-slate-900 shadow-xl overflow-hidden flex items-center justify-center mb-3">
          <svg
            viewBox="0 0 100 100"
            className="w-16 h-16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Doodle character with hat/glasses matching reference */}
            {/* Hat */}
            <path
              d="M20 40 C20 20, 60 15, 80 35 C70 38, 50 35, 20 40 Z"
              fill="#5c4033"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Head circle */}
            <circle cx="50" cy="55" r="26" fill="#fff" stroke="#000" strokeWidth="3" />
            {/* Sunglasses */}
            <rect x="36" y="47" width="12" height="9" rx="2" fill="#000" />
            <rect x="52" y="47" width="12" height="9" rx="2" fill="#000" />
            <line x1="48" y1="51" x2="52" y2="51" stroke="#000" strokeWidth="3" />
            {/* Smile */}
            <path
              d="M44 65 Q50 71 56 65"
              fill="none"
              stroke="#000"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Headphones */}
            <path
              d="M26 50 C23 45, 23 60, 27 63"
              stroke="#000"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M74 50 C77 45, 77 60, 73 63"
              stroke="#000"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Username */}
        <h2 className="text-xl font-bold text-white tracking-wide drop-shadow-md mb-4 font-sans">
          Dash
        </h2>

        {/* Password input & Speech bubble */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-56 px-5 py-2.5 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/60 text-center text-xs tracking-wider focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/25 backdrop-blur-md shadow-lg transition-all"
            />
          </div>

          {/* Comic speech bubble: "It's open. Just press Enter." */}
          <div
            onClick={onSignIn}
            className="relative bg-white text-slate-900 border-2 border-black rounded-sm px-3 py-1.5 font-mono text-[11px] font-bold shadow-[3px_3px_0px_rgba(0,0,0,0.8)] cursor-pointer hover:bg-slate-100 transition-transform active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap"
          >
            {/* Pointer arrow pointing left */}
            <div
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-black"
            />
            <div
              className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-white"
            />
            <div>It's open.</div>
            <div>Just press Enter.</div>
          </div>
        </form>
      </div>
    </div>
  );
};
