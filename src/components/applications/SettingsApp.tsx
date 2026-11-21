import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/features/settings/useSettings';
import { WALLPAPER_OPTIONS } from '@/features/desktop/appRegistry';
import { useEmulator } from '@/features/emulator/useEmulator';
import { DEFAULT_EMULATOR_CONFIG, TINYCORE_PROFILE } from '@/features/emulator/config';
import {
  SnapshotStorage,
  SnapshotMetadata,
  StorageUsage,
  computeHardwareConfigHash,
  validateHardwareCompatibility,
} from '@/services/persistence';
import {
  Palette,
  Cpu,
  RotateCcw,
  Check,
  HardDrive,
  Sliders,
  Archive,
  Save,
  Download,
  Trash2,
  Power,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const SettingsApp: React.FC = () => {
  const {
    settings,
    setWallpaper,
    setDisplayScale,
    resetSettings,
  } = useSettings();

  const {
    status,
    captureAndSaveSnapshot,
    restoreSnapshotById,
    gracefulShutdown,
    safeRestart,
  } = useEmulator();

  const [activeTab, setActiveTab] = useState<'appearance' | 'emulator' | 'persistence'>('appearance');

  // Persistence tab states
  const [snapshots, setSnapshots] = useState<SnapshotMetadata[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const currentHwHash = computeHardwareConfigHash(DEFAULT_EMULATOR_CONFIG);

  const refreshSnapshots = useCallback(async () => {
    try {
      const storage = SnapshotStorage.getInstance();
      const list = await storage.listSnapshots();
      setSnapshots(list);
      const usage = await storage.getStorageUsage();
      setStorageUsage(usage);
    } catch {
      // Ignore in mock or restricted environments
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'persistence') {
      refreshSnapshots();
    }
  }, [activeTab, refreshSnapshots]);

  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'running') {
      setFeedback({ type: 'error', message: 'Virtual machine must be running to capture a snapshot.' });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);
    try {
      const name = sessionName.trim() || `Session ${new Date().toLocaleTimeString()}`;
      await captureAndSaveSnapshot(name, sessionDesc.trim());
      setSessionName('');
      setSessionDesc('');
      setFeedback({ type: 'success', message: `Snapshot "${name}" saved successfully to IndexedDB.` });
      await refreshSnapshots();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to capture snapshot.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (!window.confirm(`Restore session snapshot "${name}"? Current unsaved guest modifications will be replaced.`)) {
      return;
    }
    setIsProcessing(true);
    setFeedback(null);
    try {
      await restoreSnapshotById(id);
      setFeedback({ type: 'success', message: `Session "${name}" restored successfully.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to restore snapshot.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete snapshot "${name}" from browser IndexedDB?`)) {
      return;
    }
    try {
      const storage = SnapshotStorage.getInstance();
      await storage.deleteSnapshot(id);
      setFeedback({ type: 'success', message: `Snapshot "${name}" deleted.` });
      await refreshSnapshots();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete snapshot.' });
    }
  };

  const handleExport = async (id: string, name: string) => {
    try {
      const storage = SnapshotStorage.getInstance();
      const blob = await storage.exportSnapshot(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.v86`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to export snapshot.' });
    }
  };

  const handleShutdown = async () => {
    if (!window.confirm('Initiate graceful ACPI shutdown (sudo poweroff) for the Linux guest?')) {
      return;
    }
    setIsProcessing(true);
    try {
      await gracefulShutdown();
      setFeedback({ type: 'success', message: 'Guest Linux system safely powered off.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error during shutdown.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestart = async (mode: 'guest-reboot' | 'emulator-reset') => {
    const desc = mode === 'guest-reboot' ? 'Reboot guest OS (sudo reboot)' : 'Reset virtual hardware';
    if (!window.confirm(`Trigger ${desc}?`)) {
      return;
    }
    setIsProcessing(true);
    try {
      await safeRestart(mode);
      setFeedback({ type: 'success', message: `${desc} dispatched.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error during restart.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-full bg-slate-950 text-slate-200 select-none overflow-hidden">
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-52 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1 shrink-0">
        <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Preferences
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`w-full px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'appearance'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Appearance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('emulator')}
          className={`w-full px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'emulator'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Virtual Machine</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('persistence')}
          className={`w-full px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'persistence'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Sessions & Storage</span>
        </button>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {feedback && (
          <div
            className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Desktop Appearance</h2>
              <p className="text-xs text-slate-400">
                Customize desktop wallpaper, ambient lighting, and UI scaling.
              </p>
            </div>

            {/* Wallpaper Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                <span>Desktop Wallpaper</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {WALLPAPER_OPTIONS.map((wp) => {
                  const isSelected = settings.wallpaper === wp.id;
                  return (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => setWallpaper(wp.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-950/30'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: wp.previewColor }}
                        />
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{wp.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{wp.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Scaling */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Display Scaling</span>
              </label>

              <div className="flex items-center space-x-2">
                {[1, 1.25, 1.5].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setDisplayScale(scale)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      settings.displayScale === scale
                        ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {Math.round(scale * 100)}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Adjusts host UI window scale. (Guest Linux resolution is managed inside the virtual machine).
              </p>
            </div>

            {/* Reset Preferences */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-300">Reset All Settings</div>
                <div className="text-[10px] text-slate-500">Restores defaults stored in browser localStorage.</div>
              </div>
              <button
                type="button"
                onClick={resetSettings}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )}

        {activeTab === 'emulator' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Virtual Machine Hardware</h2>
              <p className="text-xs text-slate-400">
                Inspect hardware emulation settings and guest operating system parameters.
              </p>
            </div>

            {/* Hardware Profile Specs */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Emulated PC Architecture</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">CPU Architecture</span>
                  <div className="font-semibold text-slate-200">x86 (32-bit i686)</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Guest RAM</span>
                  <div className="font-semibold text-slate-200">128 MB (134,217,728 bytes)</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">VGA Memory</span>
                  <div className="font-semibold text-slate-200">8 MB (Bochs / Cirrus)</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">BIOS Firmware</span>
                  <div className="font-semibold text-slate-200">SeaBIOS rel-1.16.2</div>
                </div>
              </div>
            </div>

            {/* Guest Linux Distribution */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>Guest Operating System</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Distribution:</span>
                  <span className="font-semibold text-slate-200">{TINYCORE_PROFILE.name} {TINYCORE_PROFILE.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kernel Version:</span>
                  <span className="font-mono text-slate-200">6.18.35-tinycore</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Userland & Shell:</span>
                  <span className="text-slate-200">BusyBox ash shell</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Window Manager:</span>
                  <span className="text-slate-200">FLWM (Fast Light Window Manager)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'persistence' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Session Persistence & Storage</h2>
              <p className="text-xs text-slate-400">
                Save complete virtual machine checkpoints to browser IndexedDB and restore your Linux workspace across browser reloads.
              </p>
            </div>

            {/* Storage Quota Usage */}
            {storageUsage && (
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-sky-400" />
                    Browser IndexedDB Storage Quota
                  </span>
                  <span className="font-mono text-slate-400">
                    {(storageUsage.usedBytes / 1024 / 1024).toFixed(1)} MB used / {(storageUsage.quotaBytes / 1024 / 1024).toFixed(0)} MB quota
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(2, storageUsage.percentage))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{storageUsage.snapshotCount} saved snapshot{storageUsage.snapshotCount === 1 ? '' : 's'}</span>
                  <span>{storageUsage.percentage}% utilized</span>
                </div>
              </div>
            )}

            {/* Save Active Session Form */}
            <form onSubmit={handleSaveSnapshot} className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center space-x-2">
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save Current Virtual Machine Session</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Captures entire RAM state, open terminal windows, files in /home/tc, and running processes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Session Name (e.g. My Coding Workspace)"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  placeholder="Optional description / notes"
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={status !== 'running' || isProcessing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Capture & Save Snapshot</span>
                </button>
              </div>
            </form>

            {/* Saved Snapshots List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Saved Snapshots ({snapshots.length})</span>
                <button
                  type="button"
                  onClick={refreshSnapshots}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {snapshots.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                  No snapshots saved yet. Capture a session above to enable fast restore across browser reloads.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {snapshots.map((snap) => {
                    const isCompatible = validateHardwareCompatibility(snap.hardwareConfigHash, currentHwHash);
                    return (
                      <div
                        key={snap.id}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-white">{snap.name}</span>
                            {isCompatible ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Compatible
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Hardware Mismatch
                              </span>
                            )}
                          </div>
                          {snap.description && (
                            <p className="text-[11px] text-slate-400">{snap.description}</p>
                          )}
                          <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                            <span>{new Date(snap.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span>{(snap.byteLength / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span className="font-mono">SHA: {snap.sha256Checksum.slice(0, 10)}...</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRestore(snap.id, snap.name)}
                            disabled={!isCompatible || isProcessing}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-600/80 hover:bg-sky-600 disabled:opacity-30 text-white text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExport(snap.id, snap.name)}
                            title="Export standalone .v86 binary snapshot"
                            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(snap.id, snap.name)}
                            title="Delete snapshot"
                            className="p-1.5 rounded-lg border border-slate-700 text-rose-400 hover:bg-rose-950/40 hover:border-rose-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* System Power & Management */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="text-xs font-semibold text-white flex items-center space-x-2">
                <Power className="w-4 h-4 text-rose-400" />
                <span>System Management & Power Controls</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Safely manage guest operating system shutdown and hardware reset states.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={status === 'idle' || status === 'stopped' || isProcessing}
                  onClick={handleShutdown}
                  className="px-3 py-1.5 rounded-lg border border-rose-800 bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-40 text-rose-300 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Graceful Shutdown (sudo poweroff)</span>
                </button>

                <button
                  type="button"
                  disabled={status !== 'running' || isProcessing}
                  onClick={() => handleRestart('guest-reboot')}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Guest Reboot (sudo reboot)</span>
                </button>

                <button
                  type="button"
                  disabled={status !== 'running' || isProcessing}
                  onClick={() => handleRestart('emulator-reset')}
                  className="px-3 py-1.5 rounded-lg border border-amber-800 bg-amber-950/40 hover:bg-amber-900/60 disabled:opacity-40 text-amber-300 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Hardware Reset</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
