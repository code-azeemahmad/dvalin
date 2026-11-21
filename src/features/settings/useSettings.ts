import { useState, useEffect, useCallback } from 'react';
import { HostSettings, WallpaperId } from '../desktop/types';

const STORAGE_KEY = 'webos_settings_v1';

const DEFAULT_SETTINGS: HostSettings = {
  wallpaper: 'slate-mesh',
  displayScale: 1,
  theme: 'dark',
  autoCaptureMouse: true,
};

function readStorage(): HostSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Fallback if corrupted
  }
  return DEFAULT_SETTINGS;
}

let activeSettings: HostSettings = readStorage();
type SettingsListener = (settings: HostSettings) => void;
const listeners = new Set<SettingsListener>();

function notify(newSettings: HostSettings) {
  activeSettings = newSettings;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    }
  } catch (e) {
    console.warn('Failed to persist WebOS settings to localStorage:', e);
  }
  listeners.forEach((l) => l(newSettings));
}

// Listen for storage events from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      const updated = readStorage();
      activeSettings = updated;
      listeners.forEach((l) => l(updated));
    }
  });
}

export function useSettings() {
  const [settings, setSettings] = useState<HostSettings>(() => {
    // If localStorage was cleared (e.g. in test beforeEach)
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      activeSettings = DEFAULT_SETTINGS;
    } else {
      activeSettings = readStorage();
    }
    return activeSettings;
  });

  useEffect(() => {
    const handleUpdate: SettingsListener = (updated) => {
      setSettings(updated);
    };
    listeners.add(handleUpdate);
    // Synchronize if activeSettings changed before listener was registered
    if (settings !== activeSettings) {
      setSettings(activeSettings);
    }
    return () => {
      listeners.delete(handleUpdate);
    };
  }, [settings]);

  const setWallpaper = useCallback((wallpaper: WallpaperId) => {
    notify({ ...activeSettings, wallpaper });
  }, []);

  const setDisplayScale = useCallback((scale: number) => {
    notify({ ...activeSettings, displayScale: scale });
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'midnight') => {
    notify({ ...activeSettings, theme });
  }, []);

  const setAutoCaptureMouse = useCallback((autoCaptureMouse: boolean) => {
    notify({ ...activeSettings, autoCaptureMouse });
  }, []);

  const resetSettings = useCallback(() => {
    notify(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    setWallpaper,
    setDisplayScale,
    setTheme,
    setAutoCaptureMouse,
    resetSettings,
  };
}
