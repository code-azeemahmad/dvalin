import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Phase 7 Automated Live Guest Verification Harness:
 * Real Guest OS Experiments & Linux Subsystem Execution
 *
 * Verifies:
 * 1. Live guest boots to real Tiny Core Linux 17.1 shell.
 * 2. Kernel & System experiments (uname -a, /proc/uptime, /proc/cpuinfo).
 * 3. Process Management experiments ($$, ps, background child & wait, trap & SIGTERM).
 * 4. Memory Management experiments (free, /proc/meminfo MemTotal).
 * 5. Filesystem & Metadata experiments (mkdir -p, inodes, hard links).
 * 6. File Permissions experiments (chmod 755, DAC verification).
 * 7. Shell Scripting & Pipelines (for loops, sort/tr pipeline).
 * 8. Workspace isolation and cleanup in /tmp/webos-experiments/.
 */
async function runPhase7ExperimentsVerification() {
  console.log('=== WebOS Phase 7 — Live Guest OS Experiments Verification ===\n');

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

  // Stage tests matching real guest OS experiments
  const testStages = [
    {
      id: 'exp_kernel_uname',
      desc: 'Kernel info & architecture verification (exp-kern-01)',
      cmd: 'uname -a && echo "UNAME_STAGE_OK"\n',
      expect: '6.18.35-tinycore',
    },
    {
      id: 'exp_kernel_proc',
      desc: 'Virtual /proc filesystem inspection (exp-kern-02)',
      cmd: 'grep -m 1 "model name" /proc/cpuinfo && echo "CPUINFO_STAGE_OK"\n',
      expect: 'CPUINFO_STAGE_OK',
    },
    {
      id: 'exp_proc_inspect',
      desc: 'Process inspection with PID and ps (exp-proc-01)',
      cmd: 'echo "PID_$$" && ps | grep -v grep | grep -q init && echo "INIT_FOUND_OK"\n',
      expect: 'INIT_FOUND_OK',
    },
    {
      id: 'exp_proc_lifecycle',
      desc: 'Parent/child process lifecycle & wait (exp-proc-02)',
      cmd: 'sleep 1 & CHILD=$!; wait $CHILD; echo "CHILD_EXIT_CODE_$?"\n',
      expect: 'CHILD_EXIT_CODE_0',
    },
    {
      id: 'exp_proc_signals',
      desc: 'Signal handling, traps and SIGTERM (exp-proc-03)',
      cmd: 'sh -c \'trap "echo CAUGHT_TERM; exit 0" TERM; while true; do sleep 1; done\' & PID=$!; sleep 1; kill -15 $PID; wait $PID; echo "SIG_TRAP_OK"\n',
      expect: 'CAUGHT_TERM',
    },
    {
      id: 'exp_mem_inspect',
      desc: 'Memory inspection via /proc/meminfo & free (exp-mem-01)',
      cmd: 'grep "MemTotal" /proc/meminfo && free && echo "MEM_INSPECT_OK"\n',
      expect: 'MEM_INSPECT_OK',
    },
    {
      id: 'exp_fs_dirs',
      desc: 'Isolated workspace directory hierarchy (exp-fs-01)',
      cmd: 'mkdir -p /tmp/webos-experiments/harness/sub && touch /tmp/webos-experiments/harness/sub/f1.txt && echo "FS_DIR_OK"\n',
      expect: 'FS_DIR_OK',
    },
    {
      id: 'exp_fs_inodes',
      desc: 'Inodes and hard links verification (exp-fs-02)',
      cmd: 'ln /tmp/webos-experiments/harness/sub/f1.txt /tmp/webos-experiments/harness/sub/hl.txt && ls -l /tmp/webos-experiments/harness/sub && echo "INODE_LINK_OK"\n',
      expect: 'INODE_LINK_OK',
    },
    {
      id: 'exp_fs_dac',
      desc: 'File permissions DAC enforcement (exp-fs-04)',
      cmd: 'chmod 755 /tmp/webos-experiments/harness/sub/f1.txt && test -x /tmp/webos-experiments/harness/sub/f1.txt && echo "CHMOD_755_OK"\n',
      expect: 'CHMOD_755_OK',
    },
    {
      id: 'exp_sh_loops',
      desc: 'Shell scripting loops and evaluation (exp-sh-02)',
      cmd: 'for i in A B C; do printf "%s" "$i"; done; echo "_LOOP_DONE"\n',
      expect: 'ABC_LOOP_DONE',
    },
    {
      id: 'exp_sh_pipes',
      desc: 'Pipelines and text sorting/transformation (exp-sh-04)',
      cmd: 'printf "3\\n1\\n2\\n" | sort -n | tr -d "\\n" && echo "_PIPE_SORT_OK"\n',
      expect: '123_PIPE_SORT_OK',
    },
    {
      id: 'exp_cleanup',
      desc: 'Workspace isolation safety & cleanup verification',
      cmd: 'rm -rf /tmp/webos-experiments/harness && test ! -d /tmp/webos-experiments/harness && echo "CLEANUP_SUCCESS_OK"\n',
      expect: 'CLEANUP_SUCCESS_OK',
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
          } else if ((Date.now() - stageStartTime) > 12000) {
            // Stage timeout (12s)
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

      // Finish when all stages evaluated or global timeout 180s
      if (currentStage >= testStages.length || elapsed >= 180) {
        clearInterval(timer);
        resolve(true);
      }
    }, 250);
  });

  const totalElapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\nVerification loop completed in ${totalElapsed}s.`);

  // Cleanup emulator
  await emulator.destroy();

  console.log('\n--- Final Verification Summary ---');
  console.log('Kernel Booted:', results.kernel_booted ? 'YES' : 'NO');
  console.log('Shell Reached:', results.shell_reached ? 'YES' : 'NO');

  let passCount = 0;
  for (const [id, r] of Object.entries(results.tests)) {
    const symbol = r.status === 'PASS' ? '✓' : '✗';
    console.log(` ${symbol} [${r.status}] ${id}: ${r.desc}`);
    if (r.status === 'PASS') passCount++;
  }

  console.log(`\nPassed ${passCount} / ${testStages.length} experiment stages.`);

  const allPassed =
    results.kernel_booted &&
    results.shell_reached &&
    passCount === testStages.length;

  if (allPassed) {
    console.log('\n=============================================================');
    console.log('=== ALL PHASE 7 EXPERIMENT VERIFICATIONS PASSED IN GUEST ===');
    console.log('=============================================================\n');
    return { passed: true, totalElapsed, results };
  } else {
    console.error('\nOne or more experiment verifications failed or timed out.');
    return { passed: false, totalElapsed, results };
  }
}

runPhase7ExperimentsVerification()
  .then((res) => {
    if (res.passed) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Test harness exception:', err);
    process.exit(1);
  });
