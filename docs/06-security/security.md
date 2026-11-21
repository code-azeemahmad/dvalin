# Security Requirements — WebOS

## Security objectives
- Keep the guest and host responsibilities separated.
- Prevent accidental exposure of host data to the guest.
- Avoid executing guest commands outside the emulator.
- Make optional networking and file exchange explicit and reviewable.

## Threat considerations
- Malicious or compromised guest image.
- Unsafe guest networking or downloaded content.
- Host/guest shared filesystem misconfiguration.
- Malicious imported snapshot or oversized file.
- Browser storage exhaustion.
- Dependency or supply-chain compromise.
- XSS in host UI or lab content.
- User misunderstanding of what the emulator can access.

## Required controls
1. **No host shell execution:** guest commands must run inside Linux guest only.
2. **No secret exposure:** do not pass environment secrets, cookies, tokens or private host paths to the guest.
3. **Networking off by default:** add guest networking only after threat review and explicit configuration.
4. **File exchange validation:** validate filenames, size, type and destination; enforce limits.
5. **Snapshot handling:** treat imported snapshots as untrusted binary data; validate format/version and handle failures.
6. **Dependency hygiene:** pin dependencies, review updates and use the project's lockfile.
7. **Content safety:** render lab instructions as safe text/Markdown; avoid unsafe HTML injection.
8. **Storage limits:** enforce practical snapshot/file quotas and handle browser quota errors.
9. **User consent:** explain any host/guest file sharing and networking capability before enabling it.

## Security boundaries
The browser sandbox and emulator provide useful isolation boundaries, but the project must not claim perfect isolation. Keep the browser and dependencies updated and avoid loading untrusted guest images.

## Release checklist
- [ ] No server-side shell or host command execution.
- [ ] No secrets in source, public assets or snapshots.
- [ ] Guest networking disabled unless approved and tested.
- [ ] Shared filesystem disabled unless approved and tested.
- [ ] Imported files/snapshots validated and size-limited.
- [ ] Dependency audit reviewed.
- [ ] Security limitations documented for users.
