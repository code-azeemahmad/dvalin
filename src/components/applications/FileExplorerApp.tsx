import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Home,
  HardDrive,
  Trash2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Search,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';
import { useWindowManager } from '@/features/desktop/WindowContext';
import { useSettings } from '@/features/settings/useSettings';
import { resolveAssetPath } from '@/utils/assetPath';

interface VirtualFile {
  name: string;
  type: 'file' | 'folder';
  size: string;
  modified: string;
  content?: string;
  ext?: string;
  url?: string;
}

interface DirectoryMap {
  [path: string]: VirtualFile[];
}

const WALLPAPER_FILES: VirtualFile[] = [
  {
    name: 'kame-house-dragon.jpg',
    type: 'file',
    size: '7.7 MB',
    modified: 'Nov 21 21:43',
    ext: 'jpg',
    url: '/wallpapers/kame-house-dragon.jpg',
  },
  {
    name: 'winter-mountain.jpg',
    type: 'file',
    size: '1.4 MB',
    modified: 'Nov 21 21:43',
    ext: 'jpg',
    url: '/wallpapers/winter-mountain.jpg',
  },
  {
    name: 'Bomb Girl (1)(1).jpg',
    type: 'file',
    size: '242 KB',
    modified: 'Nov 21 21:43',
    ext: 'jpg',
    url: '/wallpapers/Bomb%20Girl%20(1)(1).jpg',
  },
  {
    name: 'd0eb505bfddcb621426c26200c269d59.jpg',
    type: 'file',
    size: '60 KB',
    modified: 'Nov 21 21:43',
    ext: 'jpg',
    url: '/wallpapers/d0eb505bfddcb621426c26200c269d59.jpg',
  },
  {
    name: '04005cd9595918388985a8bf1cba433a.jpg',
    type: 'file',
    size: '49 KB',
    modified: 'Nov 21 21:43',
    ext: 'jpg',
    url: '/wallpapers/04005cd9595918388985a8bf1cba433a.jpg',
  },
  {
    name: 'makima.jpg',
    type: 'file',
    size: '32 KB',
    modified: 'Nov 21 21:43',
    ext: 'jpg',
    url: '/wallpapers/makima.jpg',
  },
];

const INITIAL_FS: DirectoryMap = {
  '/home/tc': [
    { name: 'Wallpapers', type: 'folder', size: '9.4 MB', modified: 'Nov 21 21:43' },
    { name: 'Documents', type: 'folder', size: '4 KB', modified: 'Nov 21 18:20' },
    { name: 'Journal', type: 'folder', size: '4 KB', modified: 'Nov 21 19:15' },
    { name: 'ReadMe.txt', type: 'file', size: '1.2 KB', modified: 'Nov 21 20:00', ext: 'txt' },
    { name: '.profile', type: 'file', size: '480 B', modified: 'Nov 21 12:00', ext: 'sh' },
    { name: '.ashrc', type: 'file', size: '256 B', modified: 'Nov 21 12:00', ext: 'sh' },
  ],
  '/home/tc/Wallpapers': WALLPAPER_FILES,
  '/wallpapers': WALLPAPER_FILES,
  '/home/tc/Documents': [
    { name: 'welcome_guide.txt', type: 'file', size: '2.4 KB', modified: 'Nov 21 18:22', ext: 'txt' },
    { name: 'cheatsheet.txt', type: 'file', size: '1.8 KB', modified: 'Nov 21 18:30', ext: 'txt' },
    { name: 'kernel_notes.txt', type: 'file', size: '3.1 KB', modified: 'Nov 21 18:45', ext: 'txt' },
  ],
  '/home/tc/Journal': [
    { name: "Dash's Journal.txt", type: 'file', size: '1.5 KB', modified: 'Nov 21 19:15', ext: 'txt' },
    { name: 'ideas.txt', type: 'file', size: '890 B', modified: 'Nov 21 19:40', ext: 'txt' },
  ],
  '/etc': [
    { name: 'hostname', type: 'file', size: '4 B', modified: 'Nov 21 00:00', ext: 'conf' },
    { name: 'hosts', type: 'file', size: '158 B', modified: 'Nov 21 00:00', ext: 'conf' },
    { name: 'passwd', type: 'file', size: '512 B', modified: 'Nov 21 00:00', ext: 'conf' },
    { name: 'fstab', type: 'file', size: '340 B', modified: 'Nov 21 00:00', ext: 'conf' },
  ],
  '/tmp': [
    { name: 'v86-state.log', type: 'file', size: '4.8 KB', modified: 'Nov 21 20:09', ext: 'log' },
    { name: 'xorg.log', type: 'file', size: '12.4 KB', modified: 'Nov 21 20:09', ext: 'log' },
  ],
  '/trash': [
    { name: 'old_draft.txt', type: 'file', size: '340 B', modified: 'Nov 20 14:10', ext: 'txt' },
  ],
};

export const FileExplorerApp: React.FC = () => {
  const { openWindow } = useWindowManager();
  const { setWallpaper } = useSettings();
  const [currentPath, setCurrentPath] = useState<string>('/home/tc');
  const [history, setHistory] = useState<string[]>(['/home/tc']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const navigateTo = (path: string) => {
    if (path === currentPath) return;
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(path);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
      setSelectedFile(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
      setSelectedFile(null);
    }
  };

  const handleItemClick = (item: VirtualFile) => {
    setSelectedFile(item);
  };

  const handleApplyWallpaper = (item: VirtualFile) => {
    const targetUrl = item.url || `/wallpapers/${encodeURIComponent(item.name)}`;
    setWallpaper(targetUrl);
  };

  const handleItemDoubleClick = (item: VirtualFile) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      if (INITIAL_FS[newPath]) {
        navigateTo(newPath);
      }
    } else if (
      item.ext === 'jpg' ||
      item.ext === 'png' ||
      item.ext === 'jpeg' ||
      item.ext === 'webp'
    ) {
      // Double click to change desktop wallpaper
      handleApplyWallpaper(item);
    } else {
      // Open in text editor
      openWindow('text-editor');
    }
  };

  const currentItems = (INITIAL_FS[currentPath] || []).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-10 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 space-x-2">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Path Breadcrumbs */}
        <div className="flex-1 flex items-center px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-300 overflow-x-auto">
          <span className="text-slate-500 mr-1.5">Path:</span>
          {currentPath
            .split('/')
            .filter(Boolean)
            .map((part, idx, arr) => (
              <React.Fragment key={idx}>
                <span
                  onClick={() => {
                    const target = '/' + arr.slice(0, idx + 1).join('/');
                    if (INITIAL_FS[target]) navigateTo(target);
                  }}
                  className="hover:underline cursor-pointer text-sky-400 font-medium"
                >
                  {part}
                </span>
                {idx < arr.length - 1 && (
                  <ChevronRight className="w-3 h-3 mx-0.5 text-slate-600 inline" />
                )}
              </React.Fragment>
            ))}
        </div>

        {/* Search */}
        <div className="flex items-center px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 w-44">
          <Search className="w-3 h-3 text-slate-500 mr-1.5 shrink-0" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-xs font-sans text-slate-200"
          />
        </div>
      </div>

      {/* Main Area: Sidebar + Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-44 py-3 bg-slate-950/80 border-r border-slate-800 flex flex-col space-y-1 px-2 shrink-0 text-xs">
          <div className="text-[10px] font-bold uppercase text-slate-500 px-2 mb-1">
            Places
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/home/tc')}
            className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer ${
              currentPath === '/home/tc'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/home/tc/Wallpapers')}
            className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer ${
              currentPath === '/home/tc/Wallpapers'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-850'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Wallpapers</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/home/tc/Documents')}
            className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer ${
              currentPath === '/home/tc/Documents'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-sky-400" />
            <span>Documents</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/home/tc/Journal')}
            className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer ${
              currentPath === '/home/tc/Journal'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Journal</span>
          </button>

          <div className="text-[10px] font-bold uppercase text-slate-500 px-2 mt-4 mb-1">
            System
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/etc')}
            className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer ${
              currentPath === '/etc'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-850'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>/etc</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/tmp')}
            className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer ${
              currentPath === '/tmp'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-850'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span>/tmp</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/trash')}
            className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer ${
              currentPath === '/trash'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Trash</span>
          </button>
        </div>

        {/* Grid of Files */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-900 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 content-start">
          {currentItems.map((item) => (
            <div
              key={item.name}
              onClick={() => handleItemClick(item)}
              onDoubleClick={() => handleItemDoubleClick(item)}
              className={`group flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors text-center ${
                selectedFile?.name === item.name
                  ? 'bg-sky-600/30 border border-sky-500/50 text-white'
                  : 'hover:bg-slate-800/60 text-slate-200'
              }`}
            >
              <div className="w-14 h-14 flex items-center justify-center mb-1 relative pointer-events-none select-none">
                {item.type === 'folder' ? (
                  <Folder className="w-12 h-12 text-amber-400 drop-shadow" />
                ) : item.ext === 'jpg' || item.ext === 'png' || item.ext === 'jpeg' ? (
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center shadow-md relative group-hover:border-sky-400 transition-all pointer-events-none select-none">
                    <img
                      src={resolveAssetPath(item.url || `/wallpapers/${encodeURIComponent(item.name)}`)}
                      alt={item.name}
                      draggable={false}
                      className="w-full h-full object-cover pointer-events-none select-none"
                      loading="lazy"
                    />
                  </div>
                ) : item.ext === 'sh' ? (
                  <FileCode className="w-10 h-10 text-emerald-400 drop-shadow" />
                ) : (
                  <FileText className="w-10 h-10 text-sky-300 drop-shadow" />
                )}
              </div>
              <span className="text-xs font-mono font-medium truncate max-w-full pointer-events-none select-none">
                {item.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 pointer-events-none select-none">
                {item.size}
              </span>
            </div>
          ))}
          {currentItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-500 italic">
              Folder is empty
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 px-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <span>{currentItems.length} items</span>
        <span>Ready</span>
      </div>
    </div>
  );
};
