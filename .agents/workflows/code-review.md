# Workflow: Review WebOS Changes

Review for:
- Correct separation of host UI, emulator and guest OS.
- No fake Linux command execution or fabricated system metrics.
- Correct single-instance emulator lifecycle and cleanup.
- Keyboard, mouse and display handling.
- Failure handling for missing assets, unsupported image, boot timeout and browser limitations.
- Persistence size, corruption, quota and restore failure handling.
- Host/guest data exposure and networking risks.
- Accessibility and responsive layout of the host UI.
- Tests and documentation updated.

Report findings by severity, with file references and reproducible steps. Do not approve based only on visual appearance.
