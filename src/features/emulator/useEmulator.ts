import { useState, useEffect, useCallback } from 'react';
import { EmulatorManager } from './EmulatorManager';
import {
  EmulatorStatus,
  EmulatorLogEntry,
  DownloadProgress,
  ScreenDimensions,
} from './types';

export function useEmulator() {
  const manager = EmulatorManager.getInstance();
  const [status, setStatus] = useState<EmulatorStatus>(manager.getStatus());
  const [logs, setLogs] = useState<EmulatorLogEntry[]>(manager.getLogs());
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [serialOutput, setSerialOutput] = useState<string>(manager.getSerialOutput());
  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>(
    manager.getScreenDimensions()
  );
  const [error, setError] = useState<string | null>(manager.getLastError());

  useEffect(() => {
    const unsubState = manager.onStateChange((newStatus) => {
      setStatus(newStatus);
      setError(manager.getLastError());
    });

    const unsubLog = manager.onLog((newLog) => {
      setLogs((prev) => [...prev.slice(-200), newLog]);
    });

    const unsubProgress = manager.onProgress((newProgress) => {
      setProgress(newProgress);
    });

    const unsubSerial = manager.onSerial(() => {
      setSerialOutput(manager.getSerialOutput());
    });

    const unsubScreen = manager.onScreenSize((dims) => {
      setScreenDimensions(dims);
    });

    return () => {
      unsubState();
      unsubLog();
      unsubProgress();
      unsubSerial();
      unsubScreen();
    };
  }, [manager]);

  const boot = useCallback(
    (screenContainer?: HTMLElement | null) => manager.boot(screenContainer),
    [manager]
  );
  const bootWithSnapshotFastResume = useCallback(
    (screenContainer?: HTMLElement | null) =>
      manager.bootWithSnapshotFastResume(screenContainer),
    [manager]
  );
  const stop = useCallback(() => manager.stop(), [manager]);
  const restart = useCallback(() => manager.restart(), [manager]);
  const destroy = useCallback(() => manager.destroy(), [manager]);
  const sendSerialCommand = useCallback(
    (cmd: string) => manager.sendSerialCommand(cmd),
    [manager]
  );
  const sendText = useCallback((text: string) => manager.sendText(text), [manager]);
  const lockMouse = useCallback(() => manager.lockMouse(), [manager]);
  const goFullscreen = useCallback(() => manager.goFullscreen(), [manager]);

  const captureAndSaveSnapshot = useCallback(
    (name: string, description?: string, tags?: string[]) =>
      manager.captureAndSaveSnapshot(name, description, tags),
    [manager]
  );
  const restoreSnapshotById = useCallback(
    (id: string) => manager.restoreSnapshotById(id),
    [manager]
  );
  const gracefulShutdown = useCallback(
    (timeoutMs?: number) => manager.gracefulShutdown(timeoutMs),
    [manager]
  );
  const safeRestart = useCallback(
    (mode?: 'guest-reboot' | 'emulator-reset') => manager.safeRestart(mode),
    [manager]
  );

  return {
    status,
    logs,
    progress,
    serialOutput,
    screenDimensions,
    error,
    isOperationLocked: manager.getIsOperationLocked(),
    activeOperation: manager.getActiveOperation(),
    boot,
    bootWithSnapshotFastResume,
    stop,
    restart,
    destroy,
    sendSerialCommand,
    sendText,
    lockMouse,
    goFullscreen,
    captureAndSaveSnapshot,
    restoreSnapshotById,
    gracefulShutdown,
    safeRestart,
  };
}
