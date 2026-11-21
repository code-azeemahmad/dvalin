import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  SnapshotStorage,
  computeHardwareConfigHash,
  validateHardwareCompatibility,
  SnapshotNotFoundError,
  ChecksumMismatchError,
} from '../../src/services/persistence';

describe('SnapshotStorage Persistence Service', () => {
  let storage: SnapshotStorage;

  beforeEach(async () => {
    storage = SnapshotStorage.getInstance();
    await storage.clearAllSnapshots();
  });

  afterEach(async () => {
    await storage.clearAllSnapshots();
  });

  it('maintains a strict singleton instance', () => {
    const s1 = SnapshotStorage.getInstance();
    const s2 = SnapshotStorage.getInstance();
    expect(s1).toBe(s2);
  });

  it('computes deterministic canonical hardware configuration hashes', () => {
    const hash1 = computeHardwareConfigHash({
      memorySize: 128 * 1024 * 1024,
      vgaMemorySize: 8 * 1024 * 1024,
      biosUrl: '/bios/seabios.bin',
      vgaBiosUrl: '/bios/vgabios.bin',
    });

    const hash2 = computeHardwareConfigHash({
      memorySize: 128 * 1024 * 1024,
      vgaMemorySize: 8 * 1024 * 1024,
      biosUrl: '/bios/seabios.bin',
      vgaBiosUrl: '/bios/vgabios.bin',
    });

    const hashDifferent = computeHardwareConfigHash({
      memorySize: 64 * 1024 * 1024,
      vgaMemorySize: 8 * 1024 * 1024,
      biosUrl: '/bios/seabios.bin',
      vgaBiosUrl: '/bios/vgabios.bin',
    });

    expect(hash1).toBe(hash2);
    expect(validateHardwareCompatibility(hash1, hash2)).toBe(true);
    expect(validateHardwareCompatibility(hash1, hashDifferent)).toBe(false);
  });

  it('saves and retrieves a snapshot with SHA-256 integrity verification', async () => {
    const samplePayload = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x01, 0x02, 0x03, 0x04]);
    const hardwareHash = computeHardwareConfigHash({ memorySize: 128 * 1024 * 1024 });

    const metadata = await storage.saveSnapshot({
      name: 'Test Desktop Session',
      description: 'Saved during unit test run',
      data: samplePayload.buffer,
      hardwareConfigHash: hardwareHash,
      tags: ['test', 'unit'],
    });

    expect(metadata.id).toBeDefined();
    expect(metadata.name).toBe('Test Desktop Session');
    expect(metadata.byteLength).toBe(samplePayload.byteLength);
    expect(metadata.sha256Checksum).toHaveLength(64);
    expect(metadata.hardwareConfigHash).toBe(hardwareHash);

    // Retrieve snapshot
    const record = await storage.getSnapshot(metadata.id);
    expect(record.metadata.id).toBe(metadata.id);
    expect(new Uint8Array(record.data)).toEqual(samplePayload);
  });

  it('throws ChecksumMismatchError if retrieved snapshot data is corrupted', async () => {
    const samplePayload = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const hardwareHash = computeHardwareConfigHash({});

    const metadata = await storage.saveSnapshot({
      name: 'Integrity Check Session',
      data: samplePayload.buffer,
      hardwareConfigHash: hardwareHash,
    });

    // Manually tamper with record in underlying DB to simulate bit-rot or storage corruption
    const db = (storage as any).db;
    const corruptedPayload = new Uint8Array([9, 9, 9, 9, 5, 6, 7, 8]);
    await db.putRecord({
      metadata: { ...metadata },
      data: corruptedPayload.buffer,
    });

    // Expect getSnapshot with verifyChecksum to reject
    await expect(storage.getSnapshot(metadata.id, { verifyChecksum: true })).rejects.toThrow(
      ChecksumMismatchError
    );
  });

  it('throws SnapshotNotFoundError for non-existent IDs', async () => {
    await expect(storage.getSnapshot('non-existent-id')).rejects.toThrow(
      SnapshotNotFoundError
    );
  });

  it('lists snapshots sorted chronologically with newest first', async () => {
    const hash = computeHardwareConfigHash({});

    const meta1 = await storage.saveSnapshot({
      name: 'First Session',
      data: new Uint8Array([1, 1, 1]).buffer,
      hardwareConfigHash: hash,
    });

    // Small delay to ensure timestamp progression
    await new Promise((r) => setTimeout(r, 10));

    const meta2 = await storage.saveSnapshot({
      name: 'Second Session',
      data: new Uint8Array([2, 2, 2]).buffer,
      hardwareConfigHash: hash,
    });

    const list = await storage.listSnapshots();
    expect(list.length).toBe(2);
    expect(list[0].id).toBe(meta2.id); // Newer
    expect(list[1].id).toBe(meta1.id); // Older
  });

  it('deletes snapshots cleanly', async () => {
    const hash = computeHardwareConfigHash({});
    const meta = await storage.saveSnapshot({
      name: 'Session to Delete',
      data: new Uint8Array([1, 2, 3]).buffer,
      hardwareConfigHash: hash,
    });

    const deleted = await storage.deleteSnapshot(meta.id);
    expect(deleted).toBe(true);

    const afterList = await storage.listSnapshots();
    expect(afterList.length).toBe(0);

    const deleteAgain = await storage.deleteSnapshot(meta.id);
    expect(deleteAgain).toBe(false);
  });

  it('computes storage usage statistics', async () => {
    const hash = computeHardwareConfigHash({});
    await storage.saveSnapshot({
      name: 'Session Alpha',
      data: new Uint8Array(1024 * 1024).buffer, // 1 MB
      hardwareConfigHash: hash,
    });

    const usage = await storage.getStorageUsage();
    expect(usage.snapshotCount).toBe(1);
    expect(usage.usedBytes).toBeGreaterThanOrEqual(1024 * 1024);
  });

  it('exports and imports snapshots via Blob serialization', async () => {
    const originalBytes = new Uint8Array([0xca, 0xfe, 0xba, 0xbe]);
    const hash = computeHardwareConfigHash({});

    const meta = await storage.saveSnapshot({
      name: 'Exportable Session',
      data: originalBytes.buffer,
      hardwareConfigHash: hash,
    });

    const blob = await storage.exportSnapshot(meta.id);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(4);

    const importedMeta = await storage.importSnapshot(blob, 'Imported Session Copy', hash);
    expect(importedMeta.name).toBe('Imported Session Copy');
    expect(importedMeta.byteLength).toBe(4);

    const importedRecord = await storage.getSnapshot(importedMeta.id);
    expect(new Uint8Array(importedRecord.data)).toEqual(originalBytes);
  });

  it('rejects oversized snapshot buffers exceeding MAX_SNAPSHOT_BYTES', async () => {
    const hash = computeHardwareConfigHash({});
    // Create an object claiming oversized byteLength
    const fakeOversizedBuffer = {
      byteLength: 600 * 1024 * 1024, // 600 MB
    } as unknown as ArrayBuffer;

    // Use Object.setPrototypeOf to pass instanceof ArrayBuffer check if needed or mock
    Object.setPrototypeOf(fakeOversizedBuffer, ArrayBuffer.prototype);

    await expect(
      storage.saveSnapshot({
        name: 'Oversized Session',
        data: fakeOversizedBuffer,
        hardwareConfigHash: hash,
      })
    ).rejects.toThrow(/exceeds maximum allowed limit/);
  });

  it('truncates snapshot names to 100 characters max for storage hygiene', async () => {
    const hash = computeHardwareConfigHash({});
    const veryLongName = 'A'.repeat(250);

    const meta = await storage.saveSnapshot({
      name: veryLongName,
      data: new Uint8Array([1, 2, 3]).buffer,
      hardwareConfigHash: hash,
    });

    expect(meta.name.length).toBe(100);
    expect(meta.name).toBe('A'.repeat(100));
  });
});
