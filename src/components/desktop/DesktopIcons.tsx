import React, { useState } from 'react';
import { useWindowManager } from '@/features/desktop/WindowContext';
import { APP_REGISTRY } from '@/features/desktop/appRegistry';
import { Monitor, Terminal, Settings, Info, FileText, Sliders } from 'lucide-react';

export const DesktopIcons: React.FC = () => {
  const { openWindow, focusWindow, windows } = useWindowManager();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleLaunch = (appId: string) => {
    const app = APP_REGISTRY[appId];
    if (app?.target === 'guest') {
      openWindow(appId);
      return;
    }
    const existing = windows.find((w) => w.appId === appId && w.isOpen);
    if (existing) {
      focusWindow(existing.id);
    } else {
      openWindow(appId);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Monitor':
        return <Monitor className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />;
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />;
      case 'FileText':
        return <FileText className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />;
      case 'Sliders':
        return <Sliders className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />;
      case 'Settings':
        return <Settings className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />;
      case 'Info':
        return <Info className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />;
      default:
        return <Monitor className="w-6 h-6 text-slate-400" />;
    }
  };

  const apps = Object.values(APP_REGISTRY);

  return (
    <div className="absolute top-4 left-4 z-5 flex flex-col space-y-4 select-none">
      {apps.map((app) => {
        const isSelected = selectedId === app.id;
        return (
          <button
            key={app.id}
            type="button"
            onClick={() => setSelectedId(app.id)}
            onDoubleClick={() => handleLaunch(app.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLaunch(app.id);
            }}
            className={`w-24 p-2.5 flex flex-col items-center rounded-xl transition-all cursor-pointer group text-center ${
              isSelected
                ? 'bg-sky-500/20 ring-1 ring-sky-400/50 backdrop-blur-xs'
                : 'hover:bg-slate-800/40 backdrop-blur-2xs'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg flex items-center justify-center mb-1.5 group-hover:border-slate-500 transition-colors">
              {getIcon(app.iconName)}
            </div>
            <span className="text-[11px] font-medium text-slate-200 tracking-tight leading-tight line-clamp-2 drop-shadow-md">
              {app.title}
            </span>
          </button>
        );
      })}
    </div>
  );
};
