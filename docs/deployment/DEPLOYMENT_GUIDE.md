# WebOS — Production Deployment Guide

This guide details how to build and deploy WebOS to production static hosting platforms, cloud content delivery networks (CDNs), or container environments.

---

## 1. Production Build Requirements

### 1.1 Prerequisites
- **Node.js:** v18.x or v20.x LTS
- **Package Manager:** `npm` v9+ or v10+

### 1.2 Build Procedure
Execute the standard production build command:
```bash
npm run build
```
This runs `tsc` to verify zero type errors, followed by `vite build` which bundles the frontend into the `dist/` directory.

### 1.3 Verifying Build Output
Ensure that `dist/` contains:
```
dist/
├── assets/
│   ├── index-[hash].js        # Main React application bundle (~330 kB / ~93 kB gzip)
│   ├── index-[hash].css       # Tailwind CSS styles (~34 kB / ~6.5 kB gzip)
│   └── libv86-[hash].js       # v86 WebAssembly loader
├── assets/v86/v86.wasm        # v86 WebAssembly binary (~2.0 MB)
├── assets/linux/Core-17.1.iso # Tiny Core Linux 17.1 ISO image (~19.7 MB)
├── assets/bios/seabios.bin    # SeaBIOS binary (128 KB)
├── assets/bios/vgabios.bin    # VGA BIOS binary (36 KB)
├── _headers                   # Security and isolation headers for Cloudflare / Netlify
└── index.html                 # Entry point
```

---

## 2. Mandatory HTTP Response Headers

Because WebOS executes x86 emulation via WebAssembly and requires high-resolution timers and memory isolation, the production server **must** deliver the following HTTP headers:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
```

### MIME Types Required:
- `.wasm`: `application/wasm`
- `.iso`: `application/octet-stream`
- `.bin`: `application/octet-stream`

---

## 3. Platform Deployment Guides

### Option A: Cloudflare Pages (Recommended)
1. Link your GitHub repository to Cloudflare Pages.
2. Build Settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
3. The included `public/_headers` file will automatically be deployed by Cloudflare Pages to configure COOP/COEP headers and cache rules.

### Option B: Netlify
1. Link your GitHub repository to Netlify.
2. Netlify will automatically detect `netlify.toml` in the repository root.
3. The build configuration in `netlify.toml` automatically applies:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - COOP/COEP headers on `/*`
   - MIME types and cache headers on `/assets/*`
   - SPA routing redirect (`/* -> /index.html 200`)

### Option C: Docker & Nginx
To run WebOS in a self-hosted Docker container:
```bash
# Build the production Docker image
docker build -t webos:latest .

# Run the container on port 80
docker run -d -p 8080:80 --name webos-app webos:latest
```
Access the application at `http://localhost:8080`. The included `nginx.conf` handles MIME types, SPA fallbacks, and security headers automatically.

### Option D: Local Production Preview
To verify the production build locally before deploying:
```bash
npm run preview
```
Open `http://localhost:4173/` in your browser. The Vite preview server is configured with identical COOP and COEP headers.

---

## 4. Verification Checklist Post-Deployment

After deploying, verify the following in your production environment:
1. Open Developer Tools -> Network tab.
2. Inspect the response headers of `index.html`:
   - `cross-origin-opener-policy: same-origin` is present.
   - `cross-origin-embedder-policy: credentialless` is present.
3. Click "Start Machine" or open "Linux Desktop".
4. Confirm `v86.wasm` loads with HTTP 200 and Content-Type `application/wasm`.
5. Confirm SeaBIOS, ISOLINUX menu, and Linux kernel boot successfully.
