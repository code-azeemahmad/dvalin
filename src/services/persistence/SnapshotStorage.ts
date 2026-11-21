import {
  SnapshotMetadata,
  StoredSnapshot,
  SaveSnapshotInput,
  StorageUsage,
} from './SnapshotTypes';
import {
  SnapshotNotFoundError,
  QuotaExceededError,
  ChecksumMismatchError,
  PersistenceServiceError,
} from './SnapshotErrors';
import {
  computeSha256,
  generateSnapshotId,
} from './SnapshotValidation';
import { SnapshotDatabase } from './SnapshotDatabase';

/**
 * Public service managing WebOS snapshot persistence in browser IndexedDB.
 * Enforces integrity verification, quota tracking, metadata indexing, and export/import.
 */
export class SnapshotStorage {
  private static instance: SnapshotStorage | null = null;
  private db: SnapshotDatabase;

  private constructor() {
    this.db = new SnapshotDatabase();
  }

  public static getInstance(): SnapshotStorage {
    if (!SnapshotStorage.instance) {
      SnapshotStorage.instance = new SnapshotStorage();
    }
    return SnapshotStorage.instance;
  }

  /**
   * Saves a virtual machine snapshot to IndexedDB with automatic SHA-256 calculation.
   */
  public async saveSnapshot(input: SaveSnapshotInput): Promise<SnapshotMetadata> {
    if (!input.data || !(input.data instanceof ArrayBuffer) || input.data.byteLength === 0) {
      throw new PersistenceServiceError('Invalid snapshot data: expected non-empty ArrayBuffer.');
    }

    // Verify storage quota if supported
    if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.estimate === 'function') {
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        if (quota > 0 && usage + input.data.byteLength > quota) {
          throw new QuotaExceededError(input.data.byteLength, Math.max(0, quota - usage));
        }
      } catch (e) {
        if (e instanceof QuotaExceededError) throw e;
        // Quota estimation error can be ignored if browser restricts it
      }
    }

    const id = generateSnapshotId();
    const sha256Checksum = await computeSha256(input.data);
    const timestamp = Date.now();

    const metadata: SnapshotMetadata = {
      id,
      name: input.name.trim() || `Session ${new Date(timestamp).toLocaleTimeString()}`,
      description: input.description?.trim() || '',
      timestamp,
      byteLength: input.data.byteLength,
      sha256Checksum,
      hardwareConfigHash: input.hardwareConfigHash,
      guestOs: input.guestOs || 'Tiny Core Linux 17.1 (i686)',
      displayResolution: input.displayResolution || { width: 1024, height: 768, bpp: 32 },
      isAutomatic: Boolean(input.isAutomatic),
      tags: input.tags || ['session', 'flwm'],
    };

    const record: StoredSnapshot = {
      metadata,
      data: input.data,
    };

    await this.db.putRecord(record);
    return metadata;
  }

  /**
   * Retrieves a stored snapshot by ID, verifying SHA-256 checksum integrity.
   */
  public async getSnapshot(
    id: string,
    options: { verifyChecksum?: boolean } = { verifyChecksum: true }
  ): Promise<StoredSnapshot> {
    const record = await this.db.getRecord(id);
    if (!record) {
      throw new SnapshotNotFoundError(id);
    }

    if (options.verifyChecksum) {
      const calculatedChecksum = await computeSha256(record.data);
      if (calculatedChecksum !== record.metadata.sha256Checksum) {
        throw new ChecksumMismatchError(
          id,
          record.metadata.sha256Checksum,
          calculatedChecksum
        );
      }
    }

    return record;
  }

  /**
   * Retrieves metadata for a specific snapshot by ID.
   */
  public async getSnapshotMetadata(id: string): Promise<SnapshotMetadata | null> {
    const record = await this.db.getRecord(id);
    return record ? record.metadata : null;
  }

  /**
   * Lists all saved snapshot metadata sorted chronologically (newest first).
   */
  public async listSnapshots(): Promise<SnapshotMetadata[]> {
    return this.db.getAllMetadataRecords();
  }

  /**
   * Deletes a stored snapshot by ID.
   */
  public async deleteSnapshot(id: string): Promise<boolean> {
    const existing = await this.db.getRecord(id);
    if (!existing) {
      return false;
    }
    return this.db.deleteRecord(id);
  }

  /**
   * Retrieves the most recently saved snapshot, or null if storage is empty.
   */
  public async getLatestSnapshot(): Promise<SnapshotMetadata | null> {
    const list = await this.listSnapshots();
    return list.length > 0 ? list[0] : null;
  }

  /**
   * Computes storage usage metrics across WebOS.
   */
  public async getStorageUsage(): Promise<StorageUsage> {
    let usedBytes = 0;
    let quotaBytes = 0;
    let percentage = 0;

    if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.estimate === 'function') {
      try {
        const estimate = await navigator.storage.estimate();
        usedBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || 0;
        if (quotaBytes > 0) {
          percentage = Math.round((usedBytes / quotaBytes) * 100);
        }
      } catch {
        // Fallback below
      }
    }

    const count = await this.db.countRecords();

    // If navigator.storage was unavailable, sum known snapshot sizes
    if (usedBytes === 0) {
      const allMetadata = await this.db.getAllMetadataRecords();
      usedBytes = allMetadata.reduce((acc, m) => acc + (m.byteLength || 0), 0);
      quotaBytes = 1024 * 1024 * 1024; // 1GB assumed quota
      percentage = Math.round((usedBytes / quotaBytes) * 100);
    }

    return {
      usedBytes,
      quotaBytes,
      percentage,
      snapshotCount: count,
    };
  }

  /**
   * Exports a snapshot as a downloadable binary Blob.
   */
  public async exportSnapshot(id: string): Promise<Blob> {
    const record = await this.getSnapshot(id);
    return new Blob([record.data], { type: 'application/octet-stream' });
  }

  /**
   * Imports a snapshot from an external Blob or ArrayBuffer.
   */
  public async importSnapshot(
    data: Blob | ArrayBuffer,
    name: string = 'Imported Snapshot',
    hardwareConfigHash: string = ''
  ): Promise<SnapshotMetadata> {
    let buffer: ArrayBuffer;
    if (data instanceof ArrayBuffer) {
      buffer = data;
    } else if (typeof data.arrayBuffer === 'function') {
      buffer = await data.arrayBuffer();
    } else if (typeof FileReader !== 'undefined') {
      buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
        reader.readAsArrayBuffer(data);
      });
    } else {
      throw new PersistenceServiceError('Cannot convert Blob to ArrayBuffer in this environment.');
    }

    return this.saveSnapshot({
      name,
      description: 'Imported from external file',
      data: buffer,
      hardwareConfigHash,
      tags: ['imported'],
    });
  }

  /**
   * Clears all snapshot records from IndexedDB storage.
   */
  public async clearAllSnapshots(): Promise<void> {
    await this.db.clearStore();
  }
}
