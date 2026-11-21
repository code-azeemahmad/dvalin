import { StoredSnapshot, SnapshotMetadata } from './SnapshotTypes';
import { StorageCorruptedError } from './SnapshotErrors';

const DB_NAME = 'webos_persistence_db';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';

/**
 * Low-level IndexedDB database adapter for snapshot storage.
 * Handles database upgrade, connection lifecycle, and transactional record operations.
 */
export class SnapshotDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Resolves the active IDBDatabase connection, upgrading schema if necessary.
   */
  public async getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    if (typeof indexedDB === 'undefined') {
      throw new StorageCorruptedError('IndexedDB is not supported or accessible in this environment.');
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by_timestamp', 'timestamp', { unique: false });
          store.createIndex('by_hardware_hash', 'hardwareConfigHash', { unique: false });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          this.dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        this.dbPromise = null;
        reject(new StorageCorruptedError(request.error?.message || 'Failed to open IndexedDB database'));
      };
    });

    return this.dbPromise;
  }

  /**
   * Stores a complete snapshot record (metadata + ArrayBuffer data).
   */
  public async putRecord(record: StoredSnapshot): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Structure stored in IndexedDB: metadata properties at top-level with 'id' and 'data' ArrayBuffer
      const dbEntry = {
        ...record.metadata,
        id: record.metadata.id,
        data: record.data,
      };

      const request = store.put(dbEntry);

      request.onerror = () => {
        reject(new StorageCorruptedError(request.error?.message || 'Failed to write snapshot record'));
      };

      tx.oncomplete = () => {
        resolve();
      };

      tx.onerror = () => {
        reject(new StorageCorruptedError(tx.error?.message || 'Transaction failed during snapshot write'));
      };

      tx.onabort = () => {
        reject(new StorageCorruptedError('Transaction aborted during snapshot write'));
      };
    });
  }

  /**
   * Retrieves a snapshot record by ID.
   */
  public async getRecord(id: string): Promise<StoredSnapshot | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const entry = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        const { data, ...metadataProps } = entry;
        const metadata: SnapshotMetadata = {
          id: metadataProps.id,
          name: metadataProps.name,
          description: metadataProps.description || '',
          timestamp: metadataProps.timestamp,
          byteLength: metadataProps.byteLength || data?.byteLength || 0,
          sha256Checksum: metadataProps.sha256Checksum,
          hardwareConfigHash: metadataProps.hardwareConfigHash,
          guestOs: metadataProps.guestOs || 'Tiny Core Linux 17.1',
          displayResolution: metadataProps.displayResolution || { width: 1024, height: 768, bpp: 32 },
          isAutomatic: Boolean(metadataProps.isAutomatic),
          tags: Array.isArray(metadataProps.tags) ? metadataProps.tags : [],
        };

        resolve({ metadata, data });
      };

      request.onerror = () => {
        reject(new StorageCorruptedError(request.error?.message || 'Failed to read snapshot from IndexedDB'));
      };
    });
  }

  /**
   * Deletes a snapshot record by ID.
   */
  public async deleteRecord(id: string): Promise<boolean> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => {
        reject(new StorageCorruptedError(request.error?.message || 'Failed to delete snapshot from IndexedDB'));
      };

      tx.oncomplete = () => {
        resolve(true);
      };

      tx.onerror = () => {
        reject(new StorageCorruptedError(tx.error?.message || 'Transaction error during delete'));
      };
    });
  }

  /**
   * Retrieves metadata for all stored snapshots without reading data ArrayBuffers.
   */
  public async getAllMetadataRecords(): Promise<SnapshotMetadata[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      const results: SnapshotMetadata[] = [];

      request.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const val = cursor.value;
          results.push({
            id: val.id,
            name: val.name,
            description: val.description || '',
            timestamp: val.timestamp,
            byteLength: val.byteLength || val.data?.byteLength || 0,
            sha256Checksum: val.sha256Checksum,
            hardwareConfigHash: val.hardwareConfigHash,
            guestOs: val.guestOs || 'Tiny Core Linux 17.1',
            displayResolution: val.displayResolution || { width: 1024, height: 768, bpp: 32 },
            isAutomatic: Boolean(val.isAutomatic),
            tags: Array.isArray(val.tags) ? val.tags : [],
          });
          cursor.continue();
        } else {
          // Sort newest to oldest
          results.sort((a, b) => b.timestamp - a.timestamp);
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(new StorageCorruptedError(request.error?.message || 'Failed to list snapshots from IndexedDB'));
      };
    });
  }

  /**
   * Counts the total number of stored snapshots.
   */
  public async countRecords(): Promise<number> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new StorageCorruptedError('Failed to count snapshot records'));
    });
  }

  /**
   * Clears all snapshot records from the database.
   */
  public async clearStore(): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(new StorageCorruptedError('Failed to clear snapshot store'));
      tx.oncomplete = () => resolve();
    });
  }

  /**
   * Closes the active database connection.
   */
  public close(): void {
    if (this.dbPromise) {
      this.dbPromise.then((db) => {
        try {
          db.close();
        } catch {
          // Ignore
        }
      });
      this.dbPromise = null;
    }
  }
}
