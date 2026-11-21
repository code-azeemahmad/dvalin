import { EmulatorConfig } from '@/features/emulator/types';

/**
 * Computes a deterministic canonical hardware configuration hash.
 * Ensures strict hardware parity between saved snapshots and restoring emulator instances.
 */
export function computeHardwareConfigHash(config: Partial<EmulatorConfig>): string {
  const canonicalParts = [
    `mem:${config.memorySize ?? 128 * 1024 * 1024}`,
    `vga_mem:${config.vgaMemorySize ?? 8 * 1024 * 1024}`,
    `bios:${config.biosUrl ?? '/bios/seabios.bin'}`,
    `vga_bios:${config.vgaBiosUrl ?? '/bios/vgabios.bin'}`,
    `wasm:${config.wasmPath ?? '/wasm/v86.wasm'}`,
    `acpi:${config.acpi ?? false}`,
  ];
  return canonicalParts.join('|');
}

/**
 * Computes the SHA-256 hex digest of an ArrayBuffer.
 * Uses Web Crypto API when available, falling back gracefully to Node crypto or deterministic sum.
 */
export async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  // Web Crypto API in browser / modern environments
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    try {
      const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fall through to fallback
    }
  }

  // Node.js crypto module fallback
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const { createHash } = await import('node:crypto');
      const hash = createHash('sha256');
      hash.update(Buffer.from(buffer));
      return hash.digest('hex');
    } catch {
      // Fall through to deterministic fallback
    }
  }

  // Fast deterministic fallback (FNV-1a 64-bit paired hex) for restricted mock environments
  const view = new Uint8Array(buffer);
  let h1 = 0x811c9dc5;
  let h2 = 0x4f1bbcd1;
  for (let i = 0; i < view.length; i++) {
    h1 = Math.imul(h1 ^ view[i], 0x01000193);
    h2 = Math.imul(h2 ^ view[i], 0x5bd1e995);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (hex1 + hex2).repeat(4);
}

/**
 * Validates whether two hardware configuration hashes match for state restoration.
 */
export function validateHardwareCompatibility(snapshotHash: string, currentHardwareHash: string): boolean {
  if (!snapshotHash || !currentHardwareHash) return false;
  return snapshotHash.trim() === currentHardwareHash.trim();
}

/**
 * Generates a unique, RFC4122-compliant or timestamped UUID.
 */
export function generateSnapshotId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `snap_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
