import React from 'react';
import { EmulatorStatus, ScreenDimensions } from '@/features/emulator/types';
import { Cpu, Monitor, HardDrive } from 'lucide-react';

interface StatusBarProps {
  status: EmulatorStatus;
  screenDimensions: ScreenDimensions;
  ramMb?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status: _status,
  screenDimensions,
  ramMb = 128,
}) => {
  return (
    <footer className="h-7 bg-slate-900/90 border-t border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-400 select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
          <span>RAM: {ramMb} MB</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Monitor className="w-3.5 h-3.5 text-slate-500" />
          <span>VGA: {screenDimensions.width}×{screenDimensions.height} ({screenDimensions.bpp}bpp)</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-500" />
          <span>Arch: x86 (i386)</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-slate-500">
        <span>Click screen to focus keyboard</span>
        <span>•</span>
        <span>Esc to release</span>
      </div>
    </footer>
  );
};
