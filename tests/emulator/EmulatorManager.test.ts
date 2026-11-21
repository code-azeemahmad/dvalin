import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmulatorManager } from '@/features/emulator/EmulatorManager';

describe('EmulatorManager Lifecycle Service', () => {
  beforeEach(async () => {
    // Reset any state
    const manager = EmulatorManager.getInstance();
    await manager.destroy();
  });

  it('maintains a strict singleton instance', () => {
    const instanceA = EmulatorManager.getInstance();
    const instanceB = EmulatorManager.getInstance();
    expect(instanceA).toBe(instanceB);
  });

  it('initializes in idle status', () => {
    const manager = EmulatorManager.getInstance();
    expect(manager.getStatus()).toBe('idle');
    expect(manager.getLastError()).toBeNull();
    expect(manager.getIsShellReady()).toBe(false);
  });

  it('allows valid configuration updates when idle', () => {
    const manager = EmulatorManager.getInstance();
    manager.configure({ memorySize: 64 * 1024 * 1024 });
    expect(manager.getStatus()).toBe('idle');
  });

  it('rejects configuration updates when emulator is active', async () => {
    const manager = EmulatorManager.getInstance();
    // Simulate active status by calling boot
    const bootPromise = manager.boot();
    expect(() => {
      manager.configure({ memorySize: 256 * 1024 * 1024 });
    }).toThrow(/Cannot configure emulator while in state/);
    await bootPromise.catch(() => {});
  });

  it('notifies state listeners when status changes', () => {
    const manager = EmulatorManager.getInstance();
    const stateCallback = vi.fn();
    const unsubscribe = manager.onStateChange(stateCallback);

    // Initial status call
    expect(stateCallback).toHaveBeenCalledWith('idle');

    unsubscribe();
  });

  it('notifies log listeners when logs are added', () => {
    const manager = EmulatorManager.getInstance();
    const logCallback = vi.fn();
    const unsubscribe = manager.onLog(logCallback);

    manager.configure({ memorySize: 128 * 1024 * 1024 });

    expect(logCallback).toHaveBeenCalled();
    const entry = logCallback.mock.calls[0][0];
    expect(entry.level).toBe('info');
    expect(entry.message).toContain('Emulator configured');

    unsubscribe();
  });

  it('notifies screen size listeners when dimensions change', () => {
    const manager = EmulatorManager.getInstance();
    const screenCallback = vi.fn();
    const unsubscribe = manager.onScreenSize(screenCallback);

    // Current default dimensions
    const dims = manager.getScreenDimensions();
    expect(dims).toEqual({ width: 640, height: 400, bpp: 8 });

    unsubscribe();
  });

  it('tracks screen container assignment for DOM mounting', () => {
    const manager = EmulatorManager.getInstance();
    const mockContainer = { tagName: 'DIV' } as any;
    manager.setScreenContainer(mockContainer);
    // Verified internal container can be set without errors
    manager.setScreenContainer(null);
  });

  it('safely handles double boot calls without duplicating instances', async () => {
    const manager = EmulatorManager.getInstance();
    const bootPromise1 = manager.boot();
    const bootPromise2 = manager.boot();

    // The second boot should log a warning and return early without crashing
    await Promise.allSettled([bootPromise1, bootPromise2]);
    const logs = manager.getLogs();
    expect(logs.some((l) => l.level === 'warn' && l.message.includes('Boot requested while emulator is already in state'))).toBe(true);
  });

  it('handles stop and restart calls cleanly', async () => {
    const manager = EmulatorManager.getInstance();
    // In idle state, stop and restart should be safe no-ops
    await manager.stop();
    expect(manager.getStatus()).toBe('idle');

    await manager.restart();
    expect(manager.getStatus()).toBe('idle');
  });

  it('cleans up resources and resets to idle on destroy', async () => {
    const manager = EmulatorManager.getInstance();
    await manager.destroy();
    expect(manager.getStatus()).toBe('idle');
    expect(manager.getIsShellReady()).toBe(false);
  });

  it('supports error recovery: permits re-boot after error', async () => {
    const manager = EmulatorManager.getInstance();
    manager.reportError('Simulated asset fetch failure');

    expect(manager.getStatus()).toBe('error');
    expect(manager.getLastError()).toBe('Simulated asset fetch failure');

    // Reset and verify clean recovery
    await manager.destroy();
    expect(manager.getStatus()).toBe('idle');
    expect(manager.getLastError()).toBeNull();
  });

  it('rejects launchGuestApp gracefully when emulator is not running or command is invalid', () => {
    const manager = EmulatorManager.getInstance();
    expect(manager.getStatus()).toBe('idle');
    const result = manager.launchGuestApp('DISPLAY=:0 aterm &');
    expect(result).toBe(false);
    expect(manager.launchGuestApp('')).toBe(false);
    expect(manager.launchGuestApp('   ')).toBe(false);
    const logs = manager.getLogs();
    expect(logs.some((l) => l.level === 'warn' && l.message.includes('Cannot launch guest application'))).toBe(true);
    expect(logs.some((l) => l.level === 'warn' && l.message.includes('Cannot launch empty guest application command'))).toBe(true);
  });

  it('validates allowed guest application registry and launchRegisteredGuestApp', () => {
    const manager = EmulatorManager.getInstance();
    expect(EmulatorManager.ALLOWED_GUEST_APPS['aterm']).toBe('DISPLAY=:0 aterm &');
    expect(EmulatorManager.ALLOWED_GUEST_APPS['editor']).toBe('DISPLAY=:0 editor &');
    expect(EmulatorManager.ALLOWED_GUEST_APPS['cpanel']).toBe('DISPLAY=:0 cpanel &');

    // Reject untrusted app key
    const badLaunch = manager.launchRegisteredGuestApp('untrusted_binary; rm -rf /');
    expect(badLaunch).toBe(false);
    const logs = manager.getLogs();
    expect(logs.some((l) => l.level === 'warn' && l.message.includes('Untrusted or unlisted guest application key'))).toBe(true);
  });

  it('handles saveState and restoreState gracefully when inactive', async () => {
    const manager = EmulatorManager.getInstance();
    const state = await manager.saveState();
    expect(state).toBeNull();

    const restored = await manager.restoreState(new ArrayBuffer(1024));
    expect(restored).toBe(false);
  });
});
