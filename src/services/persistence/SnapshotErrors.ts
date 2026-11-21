/**
 * Domain error classes for WebOS snapshot and persistence operations.
 */

export class PersistenceServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PersistenceServiceError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SnapshotNotFoundError extends PersistenceServiceError {
  constructor(public readonly snapshotId: string) {
    super(`Snapshot with ID '${snapshotId}' was not found in storage.`);
    this.name = 'SnapshotNotFoundError';
  }
}

export class QuotaExceededError extends PersistenceServiceError {
  constructor(
    public readonly requestedBytes: number,
    public readonly availableBytes?: number
  ) {
    super(
      `Browser storage quota exceeded. Requested: ${requestedBytes} bytes${
        availableBytes !== undefined ? `, Available: ${availableBytes} bytes` : ''
      }.`
    );
    this.name = 'QuotaExceededError';
  }
}

export class ChecksumMismatchError extends PersistenceServiceError {
  constructor(
    public readonly snapshotId: string,
    public readonly expectedChecksum: string,
    public readonly actualChecksum: string
  ) {
    super(
      `Snapshot '${snapshotId}' integrity check failed. Expected SHA-256: ${expectedChecksum}, Actual: ${actualChecksum}.`
    );
    this.name = 'ChecksumMismatchError';
  }
}

export class HardwareMismatchError extends PersistenceServiceError {
  constructor(
    public readonly snapshotId: string,
    public readonly snapshotHash: string,
    public readonly currentHardwareHash: string
  ) {
    super(
      `Snapshot '${snapshotId}' hardware configuration mismatch. Snapshot config hash: ${snapshotHash}, Current machine config hash: ${currentHardwareHash}. Restoring would cause emulator instability.`
    );
    this.name = 'HardwareMismatchError';
  }
}

export class StorageCorruptedError extends PersistenceServiceError {
  constructor(message: string) {
    super(`IndexedDB storage corrupted or unreadable: ${message}`);
    this.name = 'StorageCorruptedError';
  }
}

export class OperationLockedError extends PersistenceServiceError {
  constructor(operation: string, currentLockState: string) {
    super(
      `Cannot perform operation '${operation}': emulator lifecycle is currently locked by '${currentLockState}'.`
    );
    this.name = 'OperationLockedError';
  }
}
