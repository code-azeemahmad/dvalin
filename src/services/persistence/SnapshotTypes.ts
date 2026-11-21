/**
 * Type definitions for the WebOS Snapshot and Session Persistence subsystem.
 */

export interface ScreenResolution {
  width: number;
  height: number;
  bpp: number;
}

export interface SnapshotMetadata {
  /** Unique snapshot identifier (UUIDv4 or timestamped ID) */
  id: string;
  /** Human-readable snapshot label */
  name: string;
  /** Detailed optional description or user notes */
  description: string;
  /** Unix timestamp (milliseconds) when snapshot was saved */
  timestamp: number;
  /** Size of the serialized virtual machine state in bytes */
  byteLength: number;
  /** Web Crypto SHA-256 hex digest of the serialized ArrayBuffer */
  sha256Checksum: string;
  /** Deterministic hash of the virtual hardware configuration (RAM, VGA, BIOS) */
  hardwareConfigHash: string;
  /** Emulated guest operating system descriptor */
  guestOs: string;
  /** Active display resolution when the snapshot was captured */
  displayResolution: ScreenResolution;
  /** Whether this snapshot was generated automatically (e.g. on unload) */
  isAutomatic: boolean;
  /** Searchable tags (e.g. ['desktop', 'flwm', 'checkpoint']) */
  tags: string[];
}

export interface StoredSnapshot {
  metadata: SnapshotMetadata;
  data: ArrayBuffer;
}

export interface SaveSnapshotInput {
  name: string;
  description?: string;
  data: ArrayBuffer;
  hardwareConfigHash: string;
  displayResolution?: ScreenResolution;
  isAutomatic?: boolean;
  tags?: string[];
  guestOs?: string;
}

export interface StorageUsage {
  /** Total estimated bytes used by WebOS storage in browser */
  usedBytes: number;
  /** Total quota allocated by browser for this origin (in bytes) */
  quotaBytes: number;
  /** Percentage of quota used (0 - 100) */
  percentage: number;
  /** Total number of saved snapshots stored in IndexedDB */
  snapshotCount: number;
}
