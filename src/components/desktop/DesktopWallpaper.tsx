import React from 'react';
import { WallpaperId } from '@/features/desktop/types';
import { WALLPAPER_OPTIONS } from '@/features/desktop/appRegistry';

interface DesktopWallpaperProps {
  wallpaperId: WallpaperId;
}

export const DesktopWallpaper: React.FC<DesktopWallpaperProps> = ({ wallpaperId }) => {
  const currentWallpaper =
    WALLPAPER_OPTIONS.find((w) => w.id === wallpaperId) || WALLPAPER_OPTIONS[0];

  return (
    <div
      className={`absolute inset-0 z-0 transition-all duration-500 overflow-hidden select-none pointer-events-none ${currentWallpaper.className}`}
    >
      {/* Decorative ambient subtle mesh */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
