import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/features/settings/useSettings';
import { WALLPAPER_OPTIONS } from '@/features/desktop/appRegistry';
import { useEmulator } from '@/features/emulator/useEmulator';
import { resolveAssetPath } from '@/utils/assetPath';
import {
  SnapshotStorage,
  SnapshotMetadata,
  StorageUsage,
} from '@/services/persistence';
import {
  Palette,
  Volume2,
  VolumeX,
  Cpu,
  Archive,
  Power,
  Trash2,
  Maximize2,
} from 'lucide-react';

export const ControlPanelApp: React.FC = () => {
  const { settings, setWallpaper, setDisplayScale } = useSettings();
  const {
    status,
    captureAndSaveSnapshot,
    restoreSnapshotById,
    gracefulShutdown,
    safeRestart,
  } = useEmulator();

  const [activeTab, setActiveTab] = useState<'display' | 'sound' | 'specs' | 'snapshots' | 'power'>('display');
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [snapshots, setSnapshots] = useState<SnapshotMetadata[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [snapshotName, setSnapshotName] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<{ text: string; success: boolean } | null>(null);

  const refreshSnapshots = useCallback(async () => {
    try {
      const storage = SnapshotStorage.getInstance();
      const list = await storage.listSnapshots();
      setSnapshots(list);
      const usage = await storage.getStorageUsage();
      setStorageUsage(usage);
    } catch {
      // Mock / fallback
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'snapshots') {
      refreshSnapshots();
    }
  }, [activeTab, refreshSnapshots]);

  const handleCaptureSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;

    try {
      await captureAndSaveSnapshot(snapshotName.trim(), 'User captured via Control Panel');
      setActionMsg({ text: `Snapshot "${snapshotName}" saved!`, success: true });
      setSnapshotName('');
      refreshSnapshots();
    } catch (err: any) {
      setActionMsg({ text: `Snapshot failed: ${err?.message || err}`, success: false });
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreSnapshotById(id);
      setActionMsg({ text: 'Snapshot restored successfully!', success: true });
    } catch (err: any) {
      setActionMsg({ text: `Restore failed: ${err?.message || err}`, success: false });
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    try {
      const storage = SnapshotStorage.getInstance();
      await storage.deleteSnapshot(id);
      refreshSnapshots();
      setActionMsg({ text: 'Snapshot deleted.', success: true });
    } catch (err: any) {
      setActionMsg({ text: `Delete failed: ${err?.message || err}`, success: false });
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {/* Side Tabs */}
      <div className="w-48 bg-slate-950 border-r border-slate-800 flex flex-col space-y-1 p-2 shrink-0 text-xs">
        <div className="text-[10px] font-bold uppercase text-slate-500 px-3 py-1 mb-1">
          Control Panel
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('display')}
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            activeTab === 'display' ? 'bg-sky-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-850'
          }`}
        >
          <Palette className="w-4 h-4 text-sky-400" />
          <span>Display & Style</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sound')}
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            activeTab === 'sound' ? 'bg-sky-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-850'
          }`}
        >
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>Sound & Audio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            activeTab === 'specs' ? 'bg-sky-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-850'
          }`}
        >
          <Cpu className="w-4 h-4 text-amber-400" />
          <span>System Specs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('snapshots')}
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            activeTab === 'snapshots' ? 'bg-sky-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-850'
          }`}
        >
          <Archive className="w-4 h-4 text-purple-400" />
          <span>Snapshots</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('power')}
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            activeTab === 'power' ? 'bg-sky-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-850'
          }`}
        >
          <Power className="w-4 h-4 text-rose-400" />
          <span>Power & Reset</span>
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-900 text-xs">
        {actionMsg && (
          <div
            className={`p-3 mb-4 rounded-lg flex items-center space-x-2 font-mono text-xs ${
              actionMsg.success
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-800 text-rose-300'
            }`}
          >
            <span>{actionMsg.text}</span>
          </div>
        )}

        {/* 1. Display Tab */}
        {activeTab === 'display' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-sm font-bold text-slate-100 mb-1">Display Scaling</h2>
              <p className="text-slate-400 text-xs mb-3">Adjust host desktop UI zoom ratio.</p>
              <div className="flex items-center space-x-2">
                {[1, 1.1, 1.25].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setDisplayScale(scale)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                      settings.displayScale === scale
                        ? 'bg-sky-600 border-sky-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {Math.round(scale * 100)}%
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h2 className="text-sm font-bold text-slate-100 mb-1">Fullscreen Mode</h2>
              <p className="text-slate-400 text-xs mb-3">Toggle immersive browser fullscreen.</p>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Toggle Fullscreen</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h2 className="text-sm font-bold text-slate-100 mb-1">Desktop Theme & Wallpaper</h2>
              <p className="text-slate-400 text-xs mb-3">Select active background theme.</p>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setWallpaper('slate-mesh')}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    settings.wallpaper === 'slate-mesh'
                      ? 'border-sky-500 bg-sky-950/20 ring-1 ring-sky-500'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200">Sunset Pixel (Default)</div>
                  <div className="text-[11px] text-slate-400">Warm retro pixel skyline</div>
                </div>
                {WALLPAPER_OPTIONS.map((wp) => (
                  <div
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={`p-3 rounded-lg border cursor-pointer ${
                      settings.wallpaper === wp.id
                        ? 'border-sky-500 bg-sky-950/20 ring-1 ring-sky-500'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-200">{wp.name}</div>
                    <div className="text-[11px] text-slate-400">{wp.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h2 className="text-sm font-bold text-slate-100 mb-1">Wallpapers Folder</h2>
              <p className="text-slate-400 text-xs mb-3">Custom wallpapers from your Wallpapers folder.</p>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { name: 'Blue Dragon v3 (Default)', file: 'blue_dragon_wallpaper_1920x1080_v3.png' },
                  { name: 'Dvalin Dragon', file: 'blue_dragon_wallpaper_1920x1080_dvalin_v3.png' },
                  { name: 'Blue Dragon v4', file: 'blue_dragon_wallpaper_1920x1080_v4.png' },
                  { name: 'Kame House', file: 'kame-house-dragon.jpg' },
                  { name: 'Winter Mountain', file: 'winter-mountain.jpg' },
                  { name: 'Bomb Girl', file: 'Bomb Girl (1)(1).jpg' },
                  { name: 'Makima', file: 'makima.jpg' },
                  { name: 'Anime Sky', file: '04005cd9595918388985a8bf1cba433a.jpg' },
                  { name: 'Retro Sunset', file: 'd0eb505bfddcb621426c26200c269d59.jpg' },
                ].map((item) => {
                  const url = `/wallpapers/${encodeURIComponent(item.file)}`;
                  const isSelected =
                    settings.wallpaper === url ||
                    settings.wallpaper.includes(encodeURIComponent(item.file)) ||
                    settings.wallpaper.includes(item.file);
                  return (
                    <div
                      key={item.file}
                      onClick={() => setWallpaper(url)}
                      className={`relative rounded-lg overflow-hidden border cursor-pointer h-20 transition-all ${
                        isSelected
                          ? 'border-sky-400 ring-2 ring-sky-400/50 scale-102'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img src={resolveAssetPath(url)} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs p-1 text-[10px] text-white font-medium text-center truncate">
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. Sound Tab */}
        {activeTab === 'sound' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-sm font-bold text-slate-100 mb-1">Master Audio Volume</h2>
              <p className="text-slate-400 text-xs mb-4">Adjust system and emulation sound levels.</p>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  disabled={isMuted}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1 accent-sky-500"
                />
                <span className="font-mono text-xs w-10 text-right">{isMuted ? '0%' : `${volume}%`}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-400 text-xs space-y-1">
                <div className="font-bold text-slate-300">Sound Hardware:</div>
                <div>Emulated Sound Blaster 16 (SB16) / AC97 audio controller via Web Audio API.</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Specs Tab */}
        {activeTab === 'specs' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-slate-100 mb-1">Virtual Machine Architecture</h2>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block text-[10px]">OPERATING SYSTEM</span>
                <span className="text-white font-bold">Tiny Core Linux 17.1</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block text-[10px]">LINUX KERNEL</span>
                <span className="text-white font-bold">6.18.35-tinycore (i686)</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block text-[10px]">EMULATOR ENGINE</span>
                <span className="text-white font-bold">v86 0.5.473 (WebAssembly)</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block text-[10px]">GUEST RAM</span>
                <span className="text-white font-bold">128 MB RAM</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block text-[10px]">FRAMEBUFFER DISPLAY</span>
                <span className="text-white font-bold">1024×768 @ 32bpp Xvesa</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-500 block text-[10px]">SYSTEM STATUS</span>
                <span className="text-emerald-400 font-bold uppercase">{status}</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Snapshots Tab */}
        {activeTab === 'snapshots' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-slate-100 mb-1">State Snapshots & Recovery</h2>
            <p className="text-slate-400 text-xs">
              Capture complete virtual machine RAM and CPU register state to IndexedDB.
            </p>

            <form onSubmit={handleCaptureSnapshot} className="flex space-x-2">
              <input
                type="text"
                placeholder="Snapshot Name..."
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white outline-none"
              />
              <button
                type="submit"
                disabled={!snapshotName.trim()}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Capture Snapshot
              </button>
            </form>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>Saved Snapshots</span>
                {storageUsage && (
                  <span>
                    Used: {(storageUsage.usedBytes / (1024 * 1024)).toFixed(1)} MB
                  </span>
                )}
              </div>
              {snapshots.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between font-mono"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{s.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {(s.byteLength / (1024 * 1024)).toFixed(1)} MB · {new Date(s.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleRestore(s.id)}
                      className="px-2 py-1 bg-sky-700 hover:bg-sky-600 rounded text-[11px] text-white cursor-pointer"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {snapshots.length === 0 && (
                <div className="p-6 text-center text-slate-500 italic bg-slate-950 rounded-lg border border-slate-800">
                  No snapshots captured yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Power Tab */}
        {activeTab === 'power' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-slate-100 mb-1">Power Management</h2>
            <p className="text-slate-400 text-xs mb-4">
              Control the virtual machine hardware state.
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Reboot Guest Linux</div>
                  <div className="text-[11px] text-slate-400">Issues standard reboot signal to the guest kernel.</div>
                </div>
                <button
                  type="button"
                  onClick={() => safeRestart('guest-reboot')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Restart VM
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Graceful Shutdown</div>
                  <div className="text-[11px] text-slate-400">Syncs guest buffers and halts execution cleanly.</div>
                </div>
                <button
                  type="button"
                  onClick={() => gracefulShutdown()}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Shutdown
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Reload WebOS Shell</div>
                  <div className="text-[11px] text-slate-400">Reloads the browser window to start fresh.</div>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
