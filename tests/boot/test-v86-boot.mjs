import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

async function runBootProof() {
  console.log('=== WebOS Phase 1 — Linux Boot Proof of Concept ===\n');

  // Verify assets exist
  const wasmPath = path.resolve(rootDir, 'public/assets/v86/v86.wasm');
  const biosPath = path.resolve(rootDir, 'public/assets/bios/seabios.bin');
  const vgaBiosPath = path.resolve(rootDir, 'public/assets/bios/vgabios.bin');
  const cdromPath = path.resolve(rootDir, 'public/assets/linux/Core-17.1.iso');

  console.log('Checking required boot assets:');
  console.log(`- WASM: ${wasmPath} (exists: ${fs.existsSync(wasmPath)})`);
  console.log(`- SeaBIOS: ${biosPath} (exists: ${fs.existsSync(biosPath)})`);
  console.log(`- VGA BIOS: ${vgaBiosPath} (exists: ${fs.existsSync(vgaBiosPath)})`);
  console.log(`- CD-ROM: ${cdromPath} (exists: ${fs.existsSync(cdromPath)})\n`);

  // Verification levels tracker
  const levels = {
    level1_module_loaded: false,
    level2_hardware_initialized: false,
    level3_firmware_started: false,
    level4_kernel_started: false,
    level5_shell_reached: false,
    level6_command_executed: false,
    boot_pressed: false,
    command_sent: false,
  };

  console.log('Level 1: Loading v86 WebAssembly emulator module...');
  const v86Module = await import('v86');
  const V86 = v86Module.V86 || v86Module.default;
  levels.level1_module_loaded = true;
  console.log('✓ Level 1 Verified: v86 module loaded.\n');

  console.log('Level 2: Initializing virtual hardware and CPU...');

  const screenRows = 25;
  const screenCols = 80;
  const screenBuffer = Array.from({ length: screenRows }, () => Array(screenCols).fill(' '));

  const emulator = new V86({
    wasm_path: wasmPath,
    bios: { url: biosPath },
    vga_bios: { url: vgaBiosPath },
    cdrom: { url: cdromPath },
    memory_size: 128 * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    autostart: true,
    disable_keyboard: false,
    disable_mouse: true,
  });

  emulator.add_listener('emulator-ready', () => {
    levels.level2_hardware_initialized = true;
    console.log('✓ Level 2 Verified: Hardware and memory initialized by v86.');
  });

  emulator.add_listener('screen-put-char', ([row, col, chr]) => {
    if (row >= 0 && row < screenRows && col >= 0 && col < screenCols) {
      const char = String.fromCharCode(chr);
      screenBuffer[row][col] = char;

      const fullScreen = screenBuffer.map((r) => r.join('')).join('\n');

      // Level 3: SeaBIOS
      if (!levels.level3_firmware_started) {
        if (fullScreen.includes('SeaBIOS') || fullScreen.includes('i386') || fullScreen.includes('Booting from')) {
          levels.level3_firmware_started = true;
          console.log('\n✓ Level 3 Verified: SeaBIOS guest firmware started.');
        }
      }

      // Level 4: ISOLINUX / Kernel
      if (!levels.level4_kernel_started) {
        if (
          fullScreen.includes('ISOLINUX') ||
          fullScreen.includes('Booting Core') ||
          fullScreen.includes('Running Linux Kernel')
        ) {
          levels.level4_kernel_started = true;
          console.log('✓ Level 4 Verified: Linux boot loader / kernel started.');
        }
      }

      // Level 5: Shell prompt
      if (!levels.level5_shell_reached) {
        if (fullScreen.includes('tc@box:') || fullScreen.includes('box:~$')) {
          levels.level5_shell_reached = true;
          console.log('\n✓ Level 5 Verified: Real Linux shell prompt reached (tc@box:~$ )!');
        }
      }

      // Level 6: Real Linux command output
      if (levels.command_sent && !levels.level6_command_executed) {
        if (fullScreen.includes('6.18.35-tinycore') && fullScreen.includes('i686')) {
          levels.level6_command_executed = true;
          console.log('✓ Level 6 Verified: Real Linux command executed successfully in guest!\n');
        }
      }
    }
  });

  console.log('Waiting for guest execution (up to 75 seconds)...');

  const startTime = Date.now();
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const instructions = typeof emulator.get_instruction_counter === 'function' ? emulator.get_instruction_counter() : 0;
      const fullScreen = screenBuffer.map((r) => r.join('')).join('\n');

      if (elapsed % 10 === 0) {
        console.log(`[${elapsed}s] Instructions executed: ${instructions.toLocaleString()}`);
      }

      // Step A: Send Enter at ISOLINUX prompt
      if (fullScreen.includes('boot:') && !levels.boot_pressed) {
        levels.boot_pressed = true;
        console.log('Detected ISOLINUX boot prompt! Sending Enter to launch Tiny Core Linux kernel...');
        emulator.keyboard_send_scancodes([0x1c, 0x9c]); // Press & release Enter
      }

      // Step B: Send test command once shell is reached
      if (levels.level5_shell_reached && !levels.command_sent) {
        levels.command_sent = true;
        console.log('Sending real Linux command: "uname -a" to guest shell via emulated keyboard...');
        // Send uname -a followed by Enter
        emulator.keyboard_send_text('uname -a\n');
      }

      // If Level 6 passed or timeout reached
      if (levels.level6_command_executed || elapsed >= 70) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

  console.log('\n--- Final Captured Screen Output ---');
  for (let r = 0; r < screenRows; r++) {
    const line = screenBuffer[r].join('').trimEnd();
    if (line) {
      console.log(`| ${line}`);
    }
  }
  console.log('------------------------------------\n');

  console.log('=== Final Verification Summary ===');
  console.log(`Level 1 (Emulator Module Loaded):   ${levels.level1_module_loaded ? 'PASS' : 'FAIL'}`);
  console.log(`Level 2 (Hardware Initialized):      ${levels.level2_hardware_initialized ? 'PASS' : 'FAIL'}`);
  console.log(`Level 3 (Firmware Started):         ${levels.level3_firmware_started ? 'PASS' : 'FAIL'}`);
  console.log(`Level 4 (Kernel Started):           ${levels.level4_kernel_started ? 'PASS' : 'FAIL'}`);
  console.log(`Level 5 (Shell Prompt Reached):     ${levels.level5_shell_reached ? 'PASS' : 'FAIL'}`);
  console.log(`Level 6 (Actual Command Executed):  ${levels.level6_command_executed ? 'PASS' : 'FAIL'}`);
  console.log('===================================\n');

  await emulator.destroy();
  console.log('Emulator instance destroyed cleanly.');
}

runBootProof().catch((err) => {
  console.error('Fatal error during boot proof:', err);
  process.exit(1);
});
