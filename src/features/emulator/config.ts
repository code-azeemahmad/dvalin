import { EmulatorConfig } from './types';
import { resolveAssetPath } from '@/utils/assetPath';

export const DEFAULT_EMULATOR_CONFIG: EmulatorConfig = {
  biosUrl: resolveAssetPath('assets/bios/seabios.bin'),
  vgaBiosUrl: resolveAssetPath('assets/bios/vgabios.bin'),
  cdromUrl: resolveAssetPath('assets/linux/TinyCore-17.1.iso'),
  memorySize: 128 * 1024 * 1024, // 128 MB RAM for Tiny Core
  vgaMemorySize: 8 * 1024 * 1024, // 8 MB VGA RAM
  wasmPath: resolveAssetPath('assets/v86/v86.wasm'),
  autostart: true,
  acpi: false,
};

export const GUEST_EDITIONS = {
  tinycore: {
    id: 'tinycore' as const,
    name: 'TinyCore 17.1 (Graphical Desktop)',
    edition: 'TinyCore (FLWM + Xvesa GUI)',
    description: 'Real FLWM window manager and Xvesa graphical environment running in VESA mode at 1024x768 @ 32bpp.',
    cdromUrl: resolveAssetPath('assets/linux/TinyCore-17.1.iso'),
    sizeMb: 26.0,
  },
  core: {
    id: 'core' as const,
    name: 'Core 17.1 (Command-Line Console)',
    edition: 'Core (CLI + Foundation)',
    description: 'Fast lightweight text terminal with BusyBox ash shell and real Linux kernel 6.18.',
    cdromUrl: resolveAssetPath('assets/linux/Core-17.1.iso'),
    sizeMb: 19.7,
  },
};

export const TINYCORE_PROFILE = {
  name: 'Tiny Core Linux',
  version: '17.1',
  architecture: 'x86 (32-bit)',
  edition: 'TinyCore (FLWM + Xvesa GUI)',
  defaultRamMb: 128,
  description: 'Ultra-lightweight Linux distribution running Linux kernel 6.x, BusyBox, and genuine Xvesa/FLWM graphical desktop on emulated x86 hardware.',
  checksum: {
    type: 'MD5',
    expected: '42db5663757add090857059c096a6801',
  },
};
