# Claude Code Project Guidance

Follow `AGENTS.md` as the shared engineering contract.

## Before coding
Read `README.md`, `docs/01-product/PRD.md`, `docs/02-architecture/architecture.md`, `docs/02-architecture/tech-stack.md`, and the relevant subsystem docs. Check `project-management/tasks.md` for current priorities.

## Rules
- WebOS must run a genuine Linux guest in v86; do not build a fake terminal.
- Keep React responsible for the host UI and v86 responsible for emulation.
- Guest Linux executes commands and owns guest files/processes.
- Keep one managed emulator instance and isolate its lifecycle in a service.
- Treat Tiny Core Linux 17.1 as a candidate until a real boot test proves compatibility.
- Do not invent package versions, APIs, command availability, test results or completed work.
- Inspect existing files before modifying them and avoid unrelated refactors.
- Add tests and update documentation/task tracking for meaningful changes.

## Reporting
State changed files, tests run, actual results, limitations and remaining work. Mark work Proposed, Implemented, Verified or Blocked as appropriate.
