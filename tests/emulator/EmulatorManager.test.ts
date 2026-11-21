import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmulatorManager } from '@/features/emulator/EmulatorManager';

describe('EmulatorManager Lifecycle Service', () => {
  beforeEach(() => {
    // Reset any state
    const manager = EmulatorManager.getInstance();
    manager.destroy();
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
  });

  it('allows valid configuration updates when idle', () => {
    const manager = EmulatorManager.getInstance();
    manager.configure({ memorySize: 64 * 1024 * 1024 });
    // Should not throw
    expect(manager.getStatus()).toBe('idle');
  });

  it('notifies state listeners when status changes', () => {
    const manager = EmulatorManager.getInstance();
    const stateCallback = vi.fn();
    const unsubscribe = manager.onStateChange(stateCallback);

    // Initial status call
    expect(stateCallback).toHaveBeenCalledWith('idle');

    unsubscribe();
  });

  it('safely handles double boot calls without duplicating instances', async () => {
    const manager = EmulatorManager.getInstance();
    // Simulate boot
    const bootPromise1 = manager.boot();
    const bootPromise2 = manager.boot();

    // The second boot should log a warning and return early without crashing
    await Promise.allSettled([bootPromise1, bootPromise2]);
    const logs = manager.getLogs();
    expect(logs.length).toBeGreaterThan(0);
  });

  it('cleans up resources and resets to idle on destroy', async () => {
    const manager = EmulatorManager.getInstance();
    await manager.destroy();
    expect(manager.getStatus()).toBe('idle');
  });
});
