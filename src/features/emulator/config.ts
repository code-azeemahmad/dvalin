import { EmulatorConfig } from './types';

export const DEFAULT_EMULATOR_CONFIG: EmulatorConfig = {
  biosUrl: '/assets/bios/seabios.bin',
  vgaBiosUrl: '/assets/bios/vgabios.bin',
  cdromUrl: '/assets/linux/Core-17.1.iso',
  memorySize: 128 * 1024 * 1024, // 128 MB RAM for Tiny Core
  vgaMemorySize: 8 * 1024 * 1024, // 8 MB VGA RAM
  wasmPath: '/assets/v86/v86.wasm',
  autostart: true,
  acpi: false,
};

export const TINYCORE_PROFILE = {
  name: 'Tiny Core Linux',
  version: '17.1',
  architecture: 'x86 (32-bit)',
  edition: 'Core (CLI + Foundation)',
  defaultRamMb: 128,
  description: 'Ultra-lightweight Linux distribution running Linux kernel 6.x and BusyBox on emulated x86 hardware.',
  checksum: {
    type: 'MD5',
    expected: '8d5efae4cbf4ba463fa012d29e58918e',
  },
};
