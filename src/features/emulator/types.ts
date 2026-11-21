export type EmulatorStatus =
  | 'idle'
  | 'initializing'
  | 'booting'
  | 'running'
  | 'saving'
  | 'restoring'
  | 'stopping'
  | 'stopped'
  | 'error';

export interface EmulatorConfig {
  biosUrl: string;
  vgaBiosUrl: string;
  cdromUrl?: string;
  hdaUrl?: string;
  fdaUrl?: string;
  memorySize: number; // In bytes
  vgaMemorySize: number; // In bytes
  wasmPath: string;
  autostart?: boolean;
  acpi?: boolean;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'serial';

export interface EmulatorLogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
}

export interface DownloadProgress {
  fileName: string;
  fileIndex: number;
  fileCount: number;
  loaded: number;
  total: number;
  percent: number;
}

export interface ScreenDimensions {
  width: number;
  height: number;
  bpp: number;
}

export type StateChangeListener = (status: EmulatorStatus) => void;
export type LogListener = (log: EmulatorLogEntry) => void;
export type ProgressListener = (progress: DownloadProgress) => void;
export type SerialListener = (char: string) => void;
export type ScreenSizeListener = (dims: ScreenDimensions) => void;
