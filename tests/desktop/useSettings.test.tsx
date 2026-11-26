import { describe, it, expect, beforeEach } from 'vitest';
import { useSettings } from '@/features/settings/useSettings';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('useSettings Hook and Persistence', () => {
  beforeEach(() => {
    (typeof window !== 'undefined' ? window.localStorage : localStorage)?.clear();
  });

  it('provides default settings when no storage exists', () => {
    let hookValue: any;
    function Consumer() {
      hookValue = useSettings();
      return null;
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => {
      root.render(<Consumer />);
    });

    expect(hookValue.settings.wallpaper).toBe('/wallpapers/blue_dragon_wallpaper_1920x1080_v3.webp');
    expect(hookValue.settings.displayScale).toBe(1.2);
    expect(hookValue.settings.theme).toBe('dark');
  });

  it('updates wallpaper and persists to localStorage', () => {
    let hookValue: any;
    function Consumer() {
      hookValue = useSettings();
      return null;
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => {
      root.render(<Consumer />);
    });

    act(() => {
      hookValue.setWallpaper('cyber-terminal');
    });

    expect(hookValue.settings.wallpaper).toBe('cyber-terminal');
    const stored = JSON.parse(localStorage.getItem('webos_settings_v1') || '{}');
    expect(stored.wallpaper).toBe('cyber-terminal');
  });

  it('resets settings to default values', () => {
    let hookValue: any;
    function Consumer() {
      hookValue = useSettings();
      return null;
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => {
      root.render(<Consumer />);
    });

    act(() => {
      hookValue.setWallpaper('aurora-borealis');
      hookValue.setDisplayScale(1.25);
    });
    expect(hookValue.settings.wallpaper).toBe('aurora-borealis');

    act(() => {
      hookValue.resetSettings();
    });
    expect(hookValue.settings.wallpaper).toBe('/wallpapers/blue_dragon_wallpaper_1920x1080_v3.webp');
    expect(hookValue.settings.displayScale).toBe(1.2);
  });
});
