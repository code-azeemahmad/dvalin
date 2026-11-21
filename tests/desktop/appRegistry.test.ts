import { describe, it, expect } from 'vitest';
import { APP_REGISTRY, WALLPAPER_OPTIONS } from '@/features/desktop/appRegistry';

describe('Application Registry & Wallpaper Configuration', () => {
  it('registers all core applications with required metadata', () => {
    const apps = Object.values(APP_REGISTRY);
    expect(apps.length).toBeGreaterThanOrEqual(7);

    for (const app of apps) {
      expect(app.id).toBeDefined();
      expect(app.title).toBeDefined();
      expect(app.iconName).toBeDefined();
      expect(app.category).toBeDefined();
      expect(app.description).toBeDefined();
      expect(app.defaultSize).toBeDefined();
      expect(app.defaultSize.width).toBeGreaterThan(0);
      expect(app.defaultSize.height).toBeGreaterThan(0);
    }
  });

  it('correctly delineates between host and guest applications', () => {
    const hostApps = Object.values(APP_REGISTRY).filter((a) => a.target === 'host');
    const guestApps = Object.values(APP_REGISTRY).filter((a) => a.target === 'guest');

    expect(hostApps.map((a) => a.id)).toContain('linux-desktop');
    expect(hostApps.map((a) => a.id)).toContain('terminal');
    expect(hostApps.map((a) => a.id)).toContain('settings');
    expect(hostApps.map((a) => a.id)).toContain('about');

    expect(guestApps.map((a) => a.id)).toContain('guest-aterm');
    expect(guestApps.map((a) => a.id)).toContain('guest-editor');
    expect(guestApps.map((a) => a.id)).toContain('guest-cpanel');

    for (const guestApp of guestApps) {
      expect(guestApp.guestCommand).toBeDefined();
      expect(guestApp.guestCommand).toMatch(/^DISPLAY=:0/);
      expect(guestApp.requiresGuestRunning).toBe(true);
    }
  });

  it('provides wallpaper theme options', () => {
    expect(WALLPAPER_OPTIONS.length).toBe(4);
    const ids = WALLPAPER_OPTIONS.map((w) => w.id);
    expect(ids).toContain('slate-mesh');
    expect(ids).toContain('deep-cosmos');
    expect(ids).toContain('cyber-terminal');
    expect(ids).toContain('aurora-borealis');
  });
});
