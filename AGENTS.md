# Shared AI Agent Instructions

## Mission
Build WebOS as a browser-hosted interface to a real Linux guest running in v86. This is not a simulated terminal or a React imitation of an operating system.

## Read before changing code
1. `README.md`
2. `docs/01-product/PRD.md`
3. `docs/02-architecture/architecture.md`
4. `docs/02-architecture/tech-stack.md`
5. The relevant subsystem document(s)
6. `project-management/roadmap.md` and `project-management/tasks.md`

Read only the additional documents relevant to the task, but do not skip applicable requirements.

## Non-negotiable architecture rules
- React owns the host web interface, not guest OS behaviour.
- v86 owns x86 PC emulation.
- The Linux guest executes shell commands and manages guest processes, memory and files.
- Never simulate Linux command output with hard-coded JavaScript responses.
- Never execute guest commands through a host shell, server command endpoint, or `eval`.
- Do not create multiple v86 instances due to React re-renders. Keep lifecycle management in a dedicated service.
- Keep guest display, keyboard and mouse interaction connected to the actual emulator.
- Do not claim Tiny Core Linux 17.1 boots until it has been tested on the selected v86 build.

## Implementation workflow
- Inspect the existing repository before editing.
- Preserve established patterns and avoid unnecessary dependencies.
- Implement one small, verifiable task at a time.
- Do not silently change the selected architecture or scope.
- If a requirement conflicts with upstream emulator capabilities, explain the conflict and propose a documented alternative.
- Add or update tests for changed behaviour.
- Run relevant checks and report exact commands and outcomes.
- Update `project-management/tasks.md` and `project-management/progress.md` after work.
- Update technical docs when implementation decisions or verified behaviour change.

## Truthfulness and evidence
Use these labels in reports and documentation:
- **Proposed**: intended but not implemented.
- **Implemented**: code exists but may not be fully verified.
- **Verified**: tested with recorded evidence.
- **Blocked**: cannot proceed due to a known dependency or limitation.

Never turn a proposal into a completion claim. Record test evidence, browser, guest image/version, emulator version and relevant configuration for boot claims.

## Security
Follow `docs/06-security/security.md`. Treat guest networking and host/guest file exchange as explicit security boundaries. Do not expose host files, secrets, tokens or browser storage to the guest.

## Completion report
For every task, summarize:
1. Files changed.
2. Behaviour implemented.
3. Tests run and their results.
4. Known limitations or unverified assumptions.
5. Documentation and task-board updates.
