# Gemini / Antigravity Project Guidance

This file is the Gemini-oriented entry point for WebOS. Follow `AGENTS.md` as the shared project contract and `.agents/rules/` for focused persistent rules.

## Required context
Before implementation, inspect:
- `AGENTS.md`
- `README.md`
- `docs/01-product/PRD.md`
- `docs/02-architecture/architecture.md`
- `project-management/roadmap.md`
- The subsystem documentation relevant to the requested task

## Agent behaviour
- Inspect the repository before making changes.
- Work in small, testable increments.
- Keep the host/guest boundary explicit.
- Do not fake Linux functionality in frontend code.
- Do not assume the selected Tiny Core image is compatible until boot-tested.
- Preserve user changes and existing code.
- Ask before changing architecture, adding a backend, enabling guest networking, or introducing a new persistence model.
- Update task and progress records with evidence after implementation.

## Antigravity configuration
Use `.agents/rules/` for durable, focused rules and `.agents/workflows/` for repeatable procedures. Keep this file concise; detailed product and technical truth belongs in `docs/`.
