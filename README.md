# WebOS — Browser-Based Linux Operating System

WebOS is an educational, browser-based environment intended to boot and run a real Linux guest inside a browser using the v86 x86 emulator and WebAssembly.

The browser application provides the user interface and emulator controls. Linux—not JavaScript—executes guest commands, manages guest processes, and operates the guest filesystem.

## Project status

This repository's documentation describes the **proposed project scope and implementation plan**. Unless a task is explicitly marked complete and supported by test evidence, treat it as planned or unverified.

**First technical gate:** boot the selected 32-bit x86 Tiny Core Linux image in v86 and verify both a working shell and graphical desktop. Tiny Core Linux 17.1 is the selected candidate, not a verified compatible image yet.

## Proposed stack

- Guest OS: Tiny Core Linux x86 TinyCore edition (candidate)
- Emulator: v86
- Execution: WebAssembly in a modern browser
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Optional terminal component: xterm.js only if a real guest serial/terminal connection is implemented
- Persistence: v86 state APIs plus browser storage; persistent guest files require a separately verified strategy
- Hosting: static HTTPS hosting (Cloudflare Pages or GitHub Pages)

## Documentation map

- `AGENTS.md`: shared agent instructions
- `GEMINI.md`: Gemini / Antigravity-specific entry instructions
- `CLAUDE.md`: Claude Code-specific entry instructions
- `docs/`: product, architecture, design, emulator, storage, security and test specifications
- `project-management/`: roadmap, implementation plan, tasks, progress and change history
- `.agents/rules/`: focused Antigravity agent rules
- `.agents/workflows/`: reusable development workflows

## Development principle

Build and prove the Linux guest first. Do not spend time polishing the surrounding web interface before the emulator can boot the selected guest image and expose a usable terminal and desktop.

## Local setup

The exact package scripts and dependency versions must be determined from the actual repository and lockfile. Do not invent commands or versions. Once the application scaffold exists:

1. Install dependencies using the package manager indicated by the lockfile.
2. Start the development server using the script defined in `package.json`.
3. Serve emulator BIOS and disk assets over HTTP(S); do not assume `file://` loading works.
4. Test in a current desktop browser, initially Chrome or Edge.

## Technical references

- [v86 repository and compatibility notes](https://github.com/copy/v86)
- [v86 filesystem documentation](https://github.com/copy/v86/blob/master/docs/filesystem.md)
- [v86 networking documentation](https://github.com/copy/v86/blob/master/docs/networking.md)
- [Tiny Core Linux downloads](https://distro.ibiblio.org/tinycorelinux/downloads.html)
- [Buildroot documentation](https://buildroot.org/docs.html)

Always re-check upstream documentation when implementing against v86 APIs because APIs and compatibility details can change.
