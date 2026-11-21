# Technology Stack — WebOS

## Selected proposal

| Layer | Proposed technology | Notes |
|---|---|---|
| Guest OS | Tiny Core Linux x86 TinyCore | Version 17.1 candidate; boot compatibility unverified |
| Emulator | v86 | Browser-based x86 PC emulator |
| Execution | WebAssembly | Used by v86 in browser |
| Frontend | React | Host UI |
| Language | TypeScript | Host application |
| Build tool | Vite | Frontend build/dev server |
| Styling | Tailwind CSS | Host UI styling |
| Terminal | Guest's own terminal | Primary terminal must be genuine guest software |
| Optional terminal UI | xterm.js | Only if connected to a real guest serial/terminal interface |
| Persistence | v86 snapshots + IndexedDB or other browser storage | Design and quotas must be validated |
| Hosting | Cloudflare Pages or GitHub Pages | Static HTTPS hosting candidate |

## Selection rules
- Pin exact package versions in the package manifest and lockfile.
- Pin the guest image by version and checksum.
- Pin the v86 release/commit used for verified tests.
- Do not upgrade the emulator or guest image without rerunning boot and regression tests.
- Do not add a backend for the initial release without an approved requirement.

## Compatibility constraint
The upstream v86 project states that 64-bit Linux kernels are not supported. Use a compatible 32-bit x86 guest image. Confirm compatibility against current upstream documentation and a real boot test.

## Optional alternatives
Buildroot may be considered later to create a purpose-built minimal guest image. It is not part of the initial critical path.
