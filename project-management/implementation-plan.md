# Implementation Plan — WebOS

## Working method
Implement one phase and one small vertical slice at a time. Each task must have a clear result and a test.

## Phase 1 detailed plan
1. Inspect current repository and development environment.
2. Read current v86 compatibility and setup documentation.
3. Obtain a legally distributable 32-bit x86 Tiny Core candidate.
4. Verify architecture and checksum.
5. Obtain required BIOS assets from an appropriate source.
6. Create a minimal local test harness.
7. Serve assets over HTTP.
8. Initialize v86 with the candidate image.
9. Capture boot output and errors.
10. Verify guest shell.
11. Verify graphical desktop.
12. Verify keyboard and mouse.
13. Record configuration and results.
14. If incompatible, evaluate a compatible guest image or custom Buildroot image and document the decision.

## Phase 2 implementation sequence
1. Scaffold React + TypeScript + Vite only if not already present.
2. Pin v86 dependency/version.
3. Implement typed emulator configuration.
4. Implement single-instance manager.
5. Implement lifecycle state model.
6. Connect guest display.
7. Connect keyboard and mouse.
8. Implement start/stop/reset.
9. Add tests for repeated start, failure and cleanup.

## Later phases
Use `docs/02-architecture/architecture.md`, `docs/08-emulator/`, `docs/09-labs/` and `docs/10-deployment/` as subsystem specifications.

## Definition of done
- Acceptance criteria met.
- Tests run and results recorded.
- No fake guest functionality.
- Error and cleanup paths handled.
- Relevant docs updated.
- Task board and progress log updated.
