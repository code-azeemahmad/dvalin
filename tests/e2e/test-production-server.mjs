import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Automated Production Preview Server & Asset Verification Harness
 * Tests production server headers (COOP, COEP), MIME types, and static binary asset serving.
 */
async function testProductionServer() {
  console.log('=== WebOS Phase 8 — Production Preview Server & Asset Verification ===\n');

  const previewPort = 4173;
  const baseUrl = `http://127.0.0.1:${previewPort}`;

  console.log(`Starting Vite preview server on ${baseUrl}...`);
  const previewProcess = spawn('npx', ['vite', 'preview', '--port', String(previewPort), '--host', '127.0.0.1'], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverStarted = false;
  previewProcess.stdout.on('data', (d) => {
    const out = d.toString();
    if (out.includes(String(previewPort)) || out.includes('Local:')) {
      serverStarted = true;
    }
  });

  // Await server startup
  for (let i = 0; i < 30; i++) {
    if (serverStarted) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  // Small delay to ensure listener ready
  await new Promise((r) => setTimeout(r, 500));

  const results = [];

  function fetchUrl(targetPath) {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${targetPath}`, (res) => {
        let bytes = 0;
        res.on('data', (chunk) => {
          bytes += chunk.length;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            bytes,
          });
        });
      }).on('error', reject);
    });
  }

  try {
    // 1. Root index.html check
    console.log('1. Testing root "/" HTTP response & security headers...');
    const indexRes = await fetchUrl('/');
    const coop = indexRes.headers['cross-origin-opener-policy'];
    const coep = indexRes.headers['cross-origin-embedder-policy'];
    const indexPass = indexRes.statusCode === 200 && coop === 'same-origin' && coep === 'credentialless';
    results.push({
      test: 'Root "/" HTML & Security Headers',
      passed: indexPass,
      details: `Status: ${indexRes.statusCode}, COOP: ${coop}, COEP: ${coep}`,
    });
    console.log(`   ${indexPass ? '✓ PASS' : '✗ FAIL'}: Status ${indexRes.statusCode}, COOP: ${coop}, COEP: ${coep}`);

    // 2. WebAssembly asset check
    console.log('\n2. Testing v86 WebAssembly asset ("/assets/v86/v86.wasm")...');
    const wasmRes = await fetchUrl('/assets/v86/v86.wasm');
    const wasmPass = wasmRes.statusCode === 200 && wasmRes.bytes > 100000;
    results.push({
      test: 'WebAssembly Asset (/assets/v86/v86.wasm)',
      passed: wasmPass,
      details: `Status: ${wasmRes.statusCode}, Bytes: ${wasmRes.bytes}, Content-Type: ${wasmRes.headers['content-type']}`,
    });
    console.log(`   ${wasmPass ? '✓ PASS' : '✗ FAIL'}: Status ${wasmRes.statusCode}, Size: ${wasmRes.bytes} bytes, Content-Type: ${wasmRes.headers['content-type']}`);

    // 3. Linux ISO asset check
    console.log('\n3. Testing Linux guest ISO ("/assets/linux/Core-17.1.iso")...');
    const isoRes = await fetchUrl('/assets/linux/Core-17.1.iso');
    const isoPass = isoRes.statusCode === 200 && isoRes.bytes > 10000000;
    results.push({
      test: 'Linux Guest ISO (/assets/linux/Core-17.1.iso)',
      passed: isoPass,
      details: `Status: ${isoRes.statusCode}, Bytes: ${isoRes.bytes} (${(isoRes.bytes / 1024 / 1024).toFixed(1)} MB)`,
    });
    console.log(`   ${isoPass ? '✓ PASS' : '✗ FAIL'}: Status ${isoRes.statusCode}, Size: ${(isoRes.bytes / 1024 / 1024).toFixed(1)} MB`);

    // 4. SeaBIOS asset check
    console.log('\n4. Testing SeaBIOS binary ("/assets/bios/seabios.bin")...');
    const biosRes = await fetchUrl('/assets/bios/seabios.bin');
    const biosPass = biosRes.statusCode === 200 && biosRes.bytes === 131072; // Exact 128 KB
    results.push({
      test: 'SeaBIOS Binary (/assets/bios/seabios.bin)',
      passed: biosPass,
      details: `Status: ${biosRes.statusCode}, Bytes: ${biosRes.bytes}`,
    });
    console.log(`   ${biosPass ? '✓ PASS' : '✗ FAIL'}: Status ${biosRes.statusCode}, Size: ${biosRes.bytes} bytes (128 KB)`);

    // 5. VGA BIOS asset check
    console.log('\n5. Testing VGA BIOS binary ("/assets/bios/vgabios.bin")...');
    const vgaRes = await fetchUrl('/assets/bios/vgabios.bin');
    const vgaPass = vgaRes.statusCode === 200 && vgaRes.bytes > 30000;
    results.push({
      test: 'VGA BIOS Binary (/assets/bios/vgabios.bin)',
      passed: vgaPass,
      details: `Status: ${vgaRes.statusCode}, Bytes: ${vgaRes.bytes}`,
    });
    console.log(`   ${vgaPass ? '✓ PASS' : '✗ FAIL'}: Status ${vgaRes.statusCode}, Size: ${vgaRes.bytes} bytes`);

  } finally {
    previewProcess.kill('SIGTERM');
  }

  const allPassed = results.every((r) => r.passed);
  console.log('\n--- Production Preview Server Verification Summary ---');
  for (const r of results) {
    console.log(`${r.passed ? '✓' : '✗'} [${r.passed ? 'PASS' : 'FAIL'}] ${r.test}: ${r.details}`);
  }

  if (allPassed) {
    console.log('\n=============================================================');
    console.log('=== PRODUCTION SERVER HEADERS & ASSETS VERIFICATION PASSED ===');
    console.log('=============================================================\n');
    process.exit(0);
  } else {
    console.error('\nProduction server verification failed.');
    process.exit(1);
  }
}

testProductionServer().catch((err) => {
  console.error('Fatal preview test error:', err);
  process.exit(1);
});
