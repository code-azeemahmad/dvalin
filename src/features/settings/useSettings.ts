import { useState, useEffect, useCallback } from 'react';
import { HostSettings, WallpaperId } from '../desktop/types';

const STORAGE_KEY = 'webos_settings_v1';

const DEFAULT_SETTINGS: HostSettings = {
  wallpaper: 'slate-mesh',
  displayScale: 1,
  theme: 'dark',
  autoCaptureMouse: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<HostSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Use fallback if corrupted
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to persist WebOS settings to localStorage:', e);
    }
  }, [settings]);

  const setWallpaper = useCallback((wallpaper: WallpaperId) => {
    setSettings((prev) => ({ ...prev, wallpaper }));
  }, []);

  const setDisplayScale = useCallback((scale: number) => {
    setSettings((prev) => ({ ...prev, displayScale: scale }));
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'midnight') => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setAutoCaptureMouse = useCallback((autoCaptureMouse: boolean) => {
    setSettings((prev) => ({ ...prev, autoCaptureMouse }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
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
