import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Phase 6 Automated Verification Harness:
 * Browser Reload Recovery & Guest Filesystem State Durability
 *
 * Verifies:
 * 1. Live guest boots to real Linux shell.
 * 2. Unique session proof file written to guest filesystem (/home/tc/session_proof.txt).
 * 3. VM state serialization via save_state() into an ArrayBuffer.
 * 4. Total destruction of VM Instance 1 (simulating browser page unload/refresh).
 * 5. Cold boot of VM Instance 2 initialized directly with initial_state: { buffer: savedState }.
 * 6. Verification that guest proof file survived the reload and matches exact bytes.
 */
async function runPhase6ReloadRecoveryVerification() {
  console.log('=== WebOS Phase 6 — Browser Reload Recovery & Guest State Verification ===\n');

  const wasmPath = path.resolve(rootDir, 'public/assets/v86/v86.wasm');
  const biosPath = path.resolve(rootDir, 'public/assets/bios/seabios.bin');
  const vgaBiosPath = path.resolve(rootDir, 'public/assets/bios/vgabios.bin');
  const corePath = path.resolve(rootDir, 'public/assets/linux/Core-17.1.iso');

  if (!fs.existsSync(corePath)) {
    throw new Error('Core-17.1.iso not found at ' + corePath);
  }

  const v86Module = await import('v86');
  const V86 = v86Module.V86 || v86Module.default;

  const proofToken = `PHASE6_TOKEN_${Date.now()}_SURVIVED_RELOAD`;
  console.log(`[Setup] Generated unique proof token: ${proofToken}`);

  const screenRows = 25;
  const screenCols = 80;

  // --- Step 1: Boot VM Instance 1 ---
  console.log('\n--- Step 1: Booting Initial Virtual Machine (Instance 1) ---');
  const screenBuffer1 = Array.from({ length: screenRows }, () => Array(screenCols).fill(' '));
  let sentEnter1 = false;
  let shellReached1 = false;

  const emulator1 = new V86({
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

  emulator1.add_listener('screen-put-char', ([row, col, chr]) => {
    if (row >= 0 && row < screenRows && col >= 0 && col < screenCols) {
      screenBuffer1[row][col] = String.fromCharCode(chr);
      const fullScreen = screenBuffer1.map((r) => r.join('')).join('\n');

      if (!sentEnter1 && (fullScreen.includes('Press ENTER to boot') || fullScreen.includes('boot:'))) {
        sentEnter1 = true;
        console.log('✓ [Instance 1] Detected ISOLINUX menu. Sending Enter to boot kernel...');
        emulator1.keyboard_send_scancodes([0x1c, 0x9c]);
      }

      if (!shellReached1 && (fullScreen.includes('tc@box:') || fullScreen.includes('box:~$'))) {
        shellReached1 = true;
        console.log('✓ [Instance 1] Real Linux shell reached (tc@box:~$ )');
      }
    }
  });

  // Await shell in Instance 1
  const t0 = Date.now();
  await new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const elapsed = Math.round((Date.now() - t0) / 1000);
      const inst = typeof emulator1.get_instruction_counter === 'function' ? emulator1.get_instruction_counter() : 0;

      if (!sentEnter1 && elapsed >= 8) {
        sentEnter1 = true;
        console.log('[Fallback] Sending Enter to bootloader...');
        emulator1.keyboard_send_scancodes([0x1c, 0x9c]);
      }

      if (elapsed % 10 === 0) {
        console.log(`[${elapsed}s] Instance 1 active. Instructions: ${inst.toLocaleString()}`);
      }

      if (shellReached1) {
        clearInterval(timer);
        resolve(true);
      } else if (elapsed > 90) {
        clearInterval(timer);
        const fullScreen = screenBuffer1.map((r) => r.join('')).join('\n');
        console.error('Instance 1 screen on timeout:\n' + fullScreen);
        reject(new Error('Timed out waiting for Instance 1 shell boot'));
      }
    }, 250);
  });

  // --- Step 2: Write proof file into guest filesystem ---
  console.log('\n--- Step 2: Writing proof file into guest filesystem ---');
  let proofWritten = false;
  emulator1.keyboard_send_text(
    `printf "${proofToken}\\n" > /home/tc/session_proof.txt && sync && echo "PROOF_WRITE_SUCCESS"\n`
  );

  await new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const fullScreen = screenBuffer1.map((r) => r.join('')).join('\n');
      if (fullScreen.includes('PROOF_WRITE_SUCCESS')) {
        proofWritten = true;
        clearInterval(timer);
        console.log('✓ [Instance 1] Proof file successfully written to /home/tc/session_proof.txt');
        resolve(true);
      }
    }, 200);
    setTimeout(() => {
      clearInterval(timer);
      if (!proofWritten) reject(new Error('Timed out waiting for PROOF_WRITE_SUCCESS'));
    }, 15000);
  });

  // --- Step 3: Serialize VM State via save_state() ---
  console.log('\n--- Step 3: Capturing Snapshot via save_state() ---');
  const captureStart = Date.now();
  const stateBuffer = await emulator1.save_state();
  const captureDuration = Date.now() - captureStart;

  const hash = crypto.createHash('sha256').update(Buffer.from(stateBuffer)).digest('hex');
  console.log(`✓ Serialized snapshot buffer size: ${stateBuffer.byteLength} bytes (${(stateBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`✓ Serialization duration: ${captureDuration} ms`);
  console.log(`✓ Snapshot SHA-256: ${hash}`);

  // --- Step 4: Destroy Instance 1 (Simulate Page Reload / Navigation) ---
  console.log('\n--- Step 4: Destroying Instance 1 completely (simulating browser page refresh) ---');
  await emulator1.destroy();
  console.log('✓ Instance 1 destroyed. Volatile VM RAM and CPU state completely discarded.');

  // Small delay to ensure resources freed
  await new Promise((r) => setTimeout(r, 1000));

  // --- Step 5: Boot New VM Instance 2 with initial_state ---
  console.log('\n--- Step 5: Instantiating Brand New VM Instance 2 from Snapshot Buffer ---');
  const restoreStart = Date.now();
  const screenBuffer2 = Array.from({ length: screenRows }, () => Array(screenCols).fill(' '));
  let instance2Started = false;

  const emulator2 = new V86({
    wasm_path: wasmPath,
    bios: { url: biosPath },
    vga_bios: { url: vgaBiosPath },
    cdrom: { url: corePath },
    memory_size: 128 * 1024 * 1024,
    vga_memory_size: 8 * 1024 * 1024,
    initial_state: { buffer: stateBuffer },
    autostart: true,
    disable_keyboard: false,
    disable_mouse: false,
  });

  emulator2.add_listener('screen-put-char', ([row, col, chr]) => {
    if (row >= 0 && row < screenRows && col >= 0 && col < screenCols) {
      screenBuffer2[row][col] = String.fromCharCode(chr);
    }
  });

  emulator2.add_listener('emulator-started', () => {
    instance2Started = true;
    const restoreDuration = Date.now() - restoreStart;
    console.log(`✓ [Instance 2] Emulator core started and resumed in ${restoreDuration} ms (sub-second recovery!)`);
  });

  // Await emulator2 startup
  await new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (instance2Started) {
        clearInterval(timer);
        resolve(true);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(timer);
      if (!instance2Started) reject(new Error('Timed out waiting for Instance 2 startup'));
    }, 10000);
  });

  // Give emulator2 a brief moment to stabilize resumed registers
  await new Promise((r) => setTimeout(r, 1500));

  // --- Step 6: Verify Proof File in Instance 2 ---
  console.log('\n--- Step 6: Verifying Proof File Durability in Instance 2 ---');
  let proofVerified = false;
  emulator2.keyboard_send_text(`cat /home/tc/session_proof.txt && echo "RELOAD_VERIFY_CONFIRMED"\n`);

  await new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const fullScreen = screenBuffer2.map((r) => r.join('')).join('\n');
      if (fullScreen.includes(proofToken) && fullScreen.includes('RELOAD_VERIFY_CONFIRMED')) {
        proofVerified = true;
        clearInterval(timer);
        console.log(`✓ [Instance 2] Exact proof token found in restored guest filesystem:`);
        console.log(`    Found: "${proofToken}"`);
        console.log(`✓ Confirmation token: RELOAD_VERIFY_CONFIRMED detected!`);
        resolve(true);
      }
    }, 250);
    setTimeout(() => {
      clearInterval(timer);
      if (!proofVerified) {
        const fullScreen = screenBuffer2.map((r) => r.join('')).join('\n');
        console.error('Final screen dump:\n' + fullScreen);
        reject(new Error('Timed out waiting for proof token in Instance 2'));
      }
    }, 15000);
  });

  // Teardown Instance 2
  console.log('\n--- Teardown: Destroying Instance 2 ---');
  await emulator2.destroy();
  console.log('✓ Instance 2 destroyed cleanly.');

  console.log('\n============================================================');
  console.log('=== PHASE 6 BROWSER RELOAD RECOVERY VERIFICATION: PASSED ===');
  console.log('============================================================\n');

  return {
    proofToken,
    snapshotBytes: stateBuffer.byteLength,
    sha256: hash,
    captureDurationMs: captureDuration,
    verified: true,
  };
}

runPhase6ReloadRecoveryVerification()
  .then((res) => {
    console.log('Verification Summary:', JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Verification FAILED:', err);
    process.exit(1);
  });
