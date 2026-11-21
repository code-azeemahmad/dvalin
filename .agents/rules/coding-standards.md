# Coding Standards

- Use TypeScript for application code and preserve strict typing where configured.
- Prefer small, single-purpose modules and components.
- Keep emulator side effects out of presentational React components.
- Clean up listeners, timers, workers and emulator resources when appropriate.
- Handle loading, booting, running, stopping, stopped and error states explicitly.
- Avoid `any`; if unavoidable, isolate it and explain why.
- Validate external data and emulator event payloads at boundaries.
- Do not add dependencies for functionality already available in the project.
- Follow the repository's formatter, lint rules and naming conventions.
- Never commit generated VM state, private data, secrets or large guest images unless explicitly approved and appropriate for the repository.
