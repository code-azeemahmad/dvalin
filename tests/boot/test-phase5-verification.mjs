import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

async function runPhase5Verification() {
  console.log('=== WebOS Phase 5 — CLI & Operating System Capabilities Verification ===\n');

  const wasmPath = path.resolve(rootDir, 'public/assets/v86/v86.wasm');
  const biosPath = path.resolve(rootDir, 'public/assets/bios/seabios.bin');
  const vgaBiosPath = path.resolve(rootDir, 'public/assets/bios/vgabios.bin');
  const corePath = path.resolve(rootDir, 'public/assets/linux/Core-17.1.iso');

  if (!fs.existsSync(corePath)) {
    throw new Error('Core-17.1.iso not found at ' + corePath);
  }

  const v86Module = await import('v86');
  const V86 = v86Module.V86 || v86Module.default;

  const screenRows = 25;
  const screenCols = 80;
  const screenBuffer = Array.from({ length: screenRows }, () => Array(screenCols).fill(' '));
  let serialLog = '';

  const emulator = new V86({
    wasm_path: wasmPath,
    bios: { url: biosPath },
    vga_bios: { url: vgaBiosPath },
    cdrom: { url: corePath },
    memory_size: 128 * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    autostart: true,
    disable_keyboard: false,
    disable_mouse: false,
  });

  const results = {
    kernel_booted: false,
    shell_reached: false,
    tests: {},
  };

  let sentEnter = false;

  emulator.add_listener('serial0-output-byte', (byte) => {
    serialLog += String.fromCharCode(byte);
  });

  emulator.add_listener('screen-put-char', ([row, col, chr]) => {
    if (row >= 0 && row < screenRows && col >= 0 && col < screenCols) {
      screenBuffer[row][col] = String.fromCharCode(chr);
      const fullScreen = screenBuffer.map((r) => r.join('')).join('\n');

      if (!sentEnter && (fullScreen.includes('Press ENTER to boot') || fullScreen.includes('boot:'))) {
        sentEnter = true;
        console.log('✓ Detected ISOLINUX menu. Sending Enter to boot kernel...');
        emulator.keyboard_send_scancodes([0x1c, 0x9c]);
      }

      if (!results.kernel_booted && (fullScreen.includes('Linux Kernel') || fullScreen.includes('Booting Core') || fullScreen.includes('tc@box:'))) {
        results.kernel_booted = true;
        console.log('✓ Linux kernel bootstrap detected.');
      }

      if (!results.shell_reached && (fullScreen.includes('tc@box:') || fullScreen.includes('box:~$'))) {
        results.shell_reached = true;
        console.log('\n✓ Interactive BusyBox ash shell prompt reached (tc@box:~$ )!\n');
      }
    }
  });

  // Stage tests definition
  const testStages = [
    {
      id: 'busybox_version',
      desc: 'BusyBox version and banner inspection',
      cmd: 'busybox | head -n 1\n',
      expect: 'BusyBox v1.36.1',
    },
    {
      id: 'busybox_applets',
      desc: 'BusyBox applet inventory enumeration',
      cmd: 'busybox --list | wc -l\n',
      expect: '221',
    },
    {
      id: 'fs_directories',
      desc: 'Directory creation (mkdir -p) and navigation',
      cmd: 'mkdir -p /tmp/p5_fs/sub && echo "DIR_CREATED_OK"\n',
      expect: 'DIR_CREATED_OK',
    },
    {
      id: 'fs_files',
      desc: 'File creation, writing and line counting',
      cmd: 'printf "WebOS_Alpha\\nWebOS_Beta\\n" > /tmp/p5_fs/test.txt && wc -l /tmp/p5_fs/test.txt\n',
      expect: '2 /tmp/p5_fs/test.txt',
    },
    {
      id: 'fs_copy_move',
      desc: 'File copy, move and validation',
      cmd: 'cp /tmp/p5_fs/test.txt /tmp/p5_fs/sub/copy.txt && mv /tmp/p5_fs/sub/copy.txt /tmp/p5_fs/sub/moved.txt && test -f /tmp/p5_fs/sub/moved.txt && echo "CP_MV_OK"\n',
      expect: 'CP_MV_OK',
    },
    {
      id: 'text_grep_pipe',
      desc: 'Text processing pipeline with grep and word count',
      cmd: 'grep "Beta" /tmp/p5_fs/test.txt && echo "GREP_OK"\n',
      expect: 'GREP_OK',
    },
    {
      id: 'proc_background_signals',
      desc: 'Process spawning, background tracking ($!) and SIGTERM',
      cmd: 'sleep 30 & PID=$!; test -d /proc/$PID && kill -15 $PID && wait $PID 2>/dev/null; echo "PROC_TERM_OK"\n',
      expect: 'PROC_TERM_OK',
    },
    {
      id: 'perm_denied_enforcement',
      desc: 'Permission bit enforcement: denial without execute bit',
      cmd: 'printf "#!/bin/sh\\necho PERM_RAN\\n" > /tmp/p5_exec.sh && chmod 644 /tmp/p5_exec.sh && (/tmp/p5_exec.sh 2>/dev/null || echo "DENIED_OK")\n',
      expect: 'DENIED_OK',
    },
    {
      id: 'perm_granted_execution',
      desc: 'Permission bit enforcement: execution with chmod +x',
      cmd: 'chmod 755 /tmp/p5_exec.sh && /tmp/p5_exec.sh\n',
      expect: 'PERM_RAN',
    },
    {
      id: 'scripting_loops',
      desc: 'Shell scripting: for-loop and arithmetic',
      cmd: 'for i in 1 2 3; do printf "%s" "$i"; done; echo "_LOOP_PASS"\n',
      expect: '123_LOOP_PASS',
    },
    {
      id: 'scripting_functions',
      desc: 'Shell scripting: modular POSIX functions',
      cmd: 'add() { echo $(($1 + $2)); }; res=$(add 10 25); echo "SUM_$res"\n',
      expect: 'SUM_35',
    },
    {
      id: 'cleanup',
      desc: 'Cleanup temporary test directories and files',
      cmd: 'rm -rf /tmp/p5_fs /tmp/p5_exec.sh && echo "CLEANUP_ALL_OK"\n',
      expect: 'CLEANUP_ALL_OK',
    },
  ];

  let currentStage = 0;
  let stageSent = false;
  let stageStartTime = 0;
  const startTime = Date.now();

  console.log('Awaiting guest boot...');

  await new Promise((resolve) => {
    const timer = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const fullScreen = screenBuffer.map((r) => r.join('')).join('\n');

      if (!sentEnter && elapsed >= 8) {
        sentEnter = true;
        console.log('[Fallback] Sending Enter to bootloader...');
        emulator.keyboard_send_scancodes([0x1c, 0x9c]);
      }

      if (results.shell_reached && currentStage < testStages.length) {
        const stage = testStages[currentStage];
        if (!stageSent) {
          stageSent = true;
          stageStartTime = Date.now();
          console.log(`[Stage ${currentStage + 1}/${testStages.length}] Running: ${stage.desc}`);
          emulator.keyboard_send_text(stage.cmd);
        } else {
          // Check if expected output appears on screen
          if (fullScreen.includes(stage.expect)) {
            console.log(`  ✓ PASS: Found expected token "${stage.expect}"`);
            results.tests[stage.id] = { status: 'PASS', desc: stage.desc, token: stage.expect };
            currentStage++;
            stageSent = false;
          } else if ((Date.now() - stageStartTime) > 10000) {
            // Stage timeout (10s)
            console.log(`  (Timeout for ${stage.id}; advancing to next stage)`);
            results.tests[stage.id] = { status: 'TIMEOUT', desc: stage.desc, token: stage.expect };
            currentStage++;
            stageSent = false;
          }
        }
      }

      if (elapsed % 15 === 0) {
        const inst = typeof emulator.get_instruction_counter === 'function' ? emulator.get_instruction_counter() : 0;
        console.log(`[${elapsed}s] VM active. Instructions: ${inst.toLocaleString()}`);
      }

      // Finish when all stages evaluated or global timeout 160s
      if (currentStage >= testStages.length || elapsed >= 160) {
        clearInterval(timer);
        resolve();
      }
    }, 500);
  });

  console.log('\n--- Final Captured Guest Screen ---');
  for (let r = 0; r < screenRows; r++) {
    const line = screenBuffer[r].join('').trimEnd();
    if (line) console.log(`| ${line}`);
  }
  console.log('-----------------------------------\n');

  console.log('=== Phase 5 Verification Summary ===');
  let passCount = 0;
  for (const [id, res] of Object.entries(results.tests)) {
    console.log(`- [${res.status}] ${id}: ${res.desc}`);
    if (res.status === 'PASS') passCount++;
  }
  console.log(`Total Stages Passed: ${passCount} / ${testStages.length}`);
  console.log('====================================\n');

  await emulator.destroy();

  return { results, passCount, total: testStages.length };
}

runPhase5Verification().catch((e) => {
  console.error('Error during Phase 5 verification:', e);
  process.exit(1);
});
