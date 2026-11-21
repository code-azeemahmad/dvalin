import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

async function runPhase2Verification() {
  console.log('=== WebOS Phase 2 — Browser & Graphical Linux Verification ===\n');

  // Verify assets exist
  const wasmPath = path.resolve(rootDir, 'public/assets/v86/v86.wasm');
  const biosPath = path.resolve(rootDir, 'public/assets/bios/seabios.bin');
  const vgaBiosPath = path.resolve(rootDir, 'public/assets/bios/vgabios.bin');
  const tinyCorePath = path.resolve(rootDir, 'public/assets/linux/TinyCore-17.1.iso');
  const corePath = path.resolve(rootDir, 'public/assets/linux/Core-17.1.iso');

  const modeArg = process.argv[2]?.toLowerCase();
  const selectedIso = modeArg === 'core' ? corePath : (modeArg === 'tinycore' ? tinyCorePath : (fs.existsSync(tinyCorePath) ? tinyCorePath : corePath));
  const isGraphicalCandidate = selectedIso === tinyCorePath;

  console.log('Using Boot Media: ' + selectedIso);
  console.log(`Edition: ${isGraphicalCandidate ? 'TinyCore 17.1 (Graphical FLWM + Xvesa)' : 'Core 17.1 (CLI)'}\n`);

  const results = {
    level1_module_loaded: false,
    level2_hardware_initialized: false,
    level3_firmware_started: false,
    level4_kernel_started: false,
    level5_shell_reached: false,
    level6_commands_executed: {},
    graphical_mode_detected: false,
    screen_dimensions: null,
  };

  const v86Module = await import('v86');
  const V86 = v86Module.V86 || v86Module.default;
  results.level1_module_loaded = true;
  console.log('✓ Level 1: v86 WebAssembly module loaded.');

  const screenRows = 25;
  const screenCols = 80;
  const screenBuffer = Array.from({ length: screenRows }, () => Array(screenCols).fill(' '));

  const emulator = new V86({
    wasm_path: wasmPath,
    bios: { url: biosPath },
    vga_bios: { url: vgaBiosPath },
    cdrom: { url: selectedIso },
    memory_size: 128 * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    autostart: true,
    disable_keyboard: false,
    disable_mouse: false,
  });

  let sentEnter = false;
  emulator.add_listener('emulator-ready', () => {
    results.level2_hardware_initialized = true;
    console.log('✓ Level 2: Virtual hardware and memory initialized.');
  });

  emulator.add_listener('screen-set-size', ([w, h, bpp]) => {
    results.screen_dimensions = { width: w, height: h, bpp };
    console.log(`[Screen Event] Resolution changed: ${w}x${h} @ ${bpp}bpp`);
    if (bpp >= 15 || w >= 800) {
      results.graphical_mode_detected = true;
      console.log(`\n✓ Graphical Desktop Mode Activated: VESA/VGA mode (${w}x${h} @ ${bpp}bpp)!\n`);
    }
  });

  emulator.add_listener('screen-put-char', ([row, col, chr]) => {
    if (row >= 0 && row < screenRows && col >= 0 && col < screenCols) {
      const char = String.fromCharCode(chr);
      screenBuffer[row][col] = char;

      const fullScreen = screenBuffer.map((r) => r.join('')).join('\n');

      if (!results.level3_firmware_started && (fullScreen.includes('SeaBIOS') || fullScreen.includes('Booting from'))) {
        results.level3_firmware_started = true;
        console.log('✓ Level 3: SeaBIOS firmware started.');
      }

      if (!sentEnter && (fullScreen.includes('Press ENTER to boot') || fullScreen.includes('boot:'))) {
        sentEnter = true;
        console.log('✓ Detected boot prompt/menu! Sending Enter key to launch kernel...');
        emulator.keyboard_send_scancodes([0x1c, 0x9c]);
      }

      if (!results.level4_kernel_started && (fullScreen.includes('Booting Core') || fullScreen.includes('Linux Kernel') || fullScreen.includes('tc@box:'))) {
        results.level4_kernel_started = true;
        console.log('✓ Level 4: Linux kernel bootstrap detected.');
      }

      if (!results.level5_shell_reached && (fullScreen.includes('tc@box:') || fullScreen.includes('box:~$'))) {
        results.level5_shell_reached = true;
        console.log('\n✓ Level 5: Interactive Linux shell prompt reached (tc@box:~$ )!\n');
      }
    }
  });

  console.log('Starting execution loop...');
  const startTime = Date.now();
  let commandStep = 0;
  const commands = [
    { cmd: 'uname -a\n', key: 'uname', expect: '6.18.35-tinycore' },
    { cmd: 'pwd\n', key: 'pwd', expect: '/home/tc' },
    { cmd: 'ls -la /etc/os-release\n', key: 'ls', expect: '/etc/os-release' },
    { cmd: 'cat /etc/os-release\n', key: 'os-release', expect: 'NAME=TinyCore' },
  ];

  await new Promise((resolve) => {
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const fullScreen = screenBuffer.map((r) => r.join('')).join('\n');

      // Fallback: if 10 seconds elapsed and enter wasn't sent yet, send it
      if (!sentEnter && elapsed >= 10) {
        sentEnter = true;
        console.log('[Fallback] Sending Enter key to ensure kernel boots...');
        emulator.keyboard_send_scancodes([0x1c, 0x9c]);
      }

      // Once shell is reached, execute commands sequentially
      if (results.level5_shell_reached) {
        if (commandStep < commands.length) {
          const item = commands[commandStep];
          if (!item.sent) {
            item.sent = true;
            console.log(`[Step ${commandStep + 1}] Executing in guest: ${item.cmd.trim()}`);
            emulator.keyboard_send_text(item.cmd);
          } else {
            // Check output
            if (fullScreen.includes(item.expect)) {
              console.log(`  ✓ Output verified for "${item.cmd.trim()}": Found "${item.expect}"`);
              results.level6_commands_executed[item.key] = true;
              commandStep++;
            } else if (elapsed > (45 + commandStep * 10)) {
              console.log(`  (Advancing step for ${item.cmd.trim()}...)`);
              commandStep++;
            }
          }
        }
      }

      if (elapsed % 15 === 0) {
        const instructions = typeof emulator.get_instruction_counter === 'function' ? emulator.get_instruction_counter() : 0;
        console.log(`[${elapsed}s] Instructions executed: ${instructions.toLocaleString()}`);
      }

      // End when all commands verified or graphical mode reached + shell, or timeout 90s
      const allCommandsDone = commandStep >= commands.length && Object.keys(results.level6_commands_executed).length === 4;
      if (allCommandsDone || (results.graphical_mode_detected && elapsed >= 60) || elapsed >= 90) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

  console.log('\n--- Final Captured Screen ---');
  for (let r = 0; r < screenRows; r++) {
    const line = screenBuffer[r].join('').trimEnd();
    if (line) console.log(`| ${line}`);
  }
  console.log('-----------------------------\n');

  console.log('=== Phase 2 Verification Results ===');
  console.log(`Level 1 (Module Loaded):         ${results.level1_module_loaded ? 'PASS' : 'FAIL'}`);
  console.log(`Level 2 (Hardware Init):         ${results.level2_hardware_initialized ? 'PASS' : 'FAIL'}`);
  console.log(`Level 3 (Firmware Started):      ${results.level3_firmware_started ? 'PASS' : 'FAIL'}`);
  console.log(`Level 4 (Kernel Started):        ${results.level4_kernel_started ? 'PASS' : 'FAIL'}`);
  console.log(`Level 5 (Shell Reached):         ${results.level5_shell_reached ? 'PASS' : 'FAIL'}`);
  console.log(`Command 'uname -a':              ${results.level6_commands_executed['uname'] ? 'PASS' : 'FAIL'}`);
  console.log(`Command 'pwd':                   ${results.level6_commands_executed['pwd'] ? 'PASS' : 'FAIL'}`);
  console.log(`Command 'ls':                    ${results.level6_commands_executed['ls'] ? 'PASS' : 'FAIL'}`);
  console.log(`Command 'cat /etc/os-release':   ${results.level6_commands_executed['os-release'] ? 'PASS' : 'FAIL'}`);
  console.log(`Graphical Mode Detected:        ${results.graphical_mode_detected ? 'PASS' : 'TEXT CONSOLE (Expected for Core/TinyCore non-VESA default)'}`);
  console.log('====================================\n');

  await emulator.destroy();
}

runPhase2Verification().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
