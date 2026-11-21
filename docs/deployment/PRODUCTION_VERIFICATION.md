# WebOS — Production Build Verification Report

**Verification Date:** November 21, 2026  
**Auditor:** Antigravity / Deployment Engineer  
**Target:** Static production build (`dist/`) and local preview server (`http://127.0.0.1:4173/`).  
**Status:** **PRODUCTION ASSETS VERIFIED (100% Pass)**

---

## 1. Static Asset Inventory & Verification

The production distribution was built using `npm run build` (`tsc && vite build`) and inspected.

| Asset File | Size (Raw) | Size (gzip) | Content-Type | Integrity / Purpose |
|---|---|---|---|---|
| `dist/index.html` | 0.60 kB | 0.39 kB | `text/html` | SPA entry point, viewport & root container |
| `dist/assets/index-C-6BMjr4.js` | 331.97 kB | 93.27 kB | `application/javascript` | Main WebOS React & TypeScript bundle |
| `dist/assets/libv86-BmNv5VGj.js`| 356.28 kB | 92.58 kB | `application/javascript` | v86 emulator JavaScript bridge |
| `dist/assets/index-DpsOJAQC.css`| 34.70 kB | 6.53 kB | `text/css` | Compiled Tailwind CSS styles |
| `dist/assets/v86/v86.wasm` | 2,007,347 B | ~620 kB | `application/wasm` | v86 x86 CPU & device emulator core |
| `dist/assets/linux/Core-17.1.iso`| 20,658,176 B | 19.7 MB | `application/octet-stream` | Tiny Core Linux 17.1 bootable CD-ROM ISO |
| `dist/assets/bios/seabios.bin` | 131,072 B | ~40 kB | `application/octet-stream` | SeaBIOS x86 BIOS ROM (exact 128 KB) |
| `dist/assets/bios/vgabios.bin` | 36,352 B | ~11 kB | `application/octet-stream` | Cirrus/Bochs VGA BIOS ROM |
| `dist/_headers` | 0.52 kB | N/A | `text/plain` | Cloudflare Pages / Netlify security headers |

---

## 2. Server Response & Security Headers Inspection

Executed using automated harness `tests/e2e/test-production-server.mjs` against `http://127.0.0.1:4173/`:

```text
=== WebOS Phase 8 — Production Preview Server & Asset Verification ===

Starting Vite preview server on http://127.0.0.1:4173...
1. Testing root "/" HTTP response & security headers...
   ✓ PASS: Status 200, COOP: same-origin, COEP: credentialless

2. Testing v86 WebAssembly asset ("/assets/v86/v86.wasm")...
   ✓ PASS: Status 200, Size: 2007347 bytes, Content-Type: application/wasm

3. Testing Linux guest ISO ("/assets/linux/Core-17.1.iso")...
   ✓ PASS: Status 200, Size: 19.7 MB

4. Testing SeaBIOS binary ("/assets/bios/seabios.bin")...
   ✓ PASS: Status 200, Size: 131072 bytes (128 KB)

5. Testing VGA BIOS binary ("/assets/bios/vgabios.bin")...
   ✓ PASS: Status 200, Size: 36352 bytes

--- Production Preview Server Verification Summary ---
✓ [PASS] Root "/" HTML & Security Headers: Status: 200, COOP: same-origin, COEP: credentialless
✓ [PASS] WebAssembly Asset (/assets/v86/v86.wasm): Status: 200, Bytes: 2007347, Content-Type: application/wasm
✓ [PASS] Linux Guest ISO (/assets/linux/Core-17.1.iso): Status: 200, Bytes: 20658176 (19.7 MB)
✓ [PASS] SeaBIOS Binary (/assets/bios/seabios.bin): Status: 200, Bytes: 131072
✓ [PASS] VGA BIOS Binary (/assets/bios/vgabios.bin): Status: 200, Bytes: 36352

=============================================================
=== PRODUCTION SERVER HEADERS & ASSETS VERIFICATION PASSED ===
=============================================================
```

---

## 3. Deployment Readiness Assessment

1. **Self-Contained Bundle:** All dependencies, scripts, stylesheets, and binary emulator assets are present in `dist/`. No external CDN script dependencies exist.
2. **Deterministic Hashing:** All JavaScript and CSS chunks are fingerprinted with content hashes for cache-busting and long-term caching.
3. **Cross-Origin Isolation:** Both development (`server`) and production (`preview`, `_headers`, `netlify.toml`, `nginx.conf`) provide identical COOP and COEP policies.
4. **Conclusion:** **APPROVED FOR STATIC PRODUCTION HOSTING.**
