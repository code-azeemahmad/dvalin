# Security Rules

- Treat guest Linux as an isolated emulated environment, not as a trusted extension of the browser.
- Never execute guest commands on the host or on a backend shell.
- Do not expose host filesystem paths, credentials, cookies, local storage or environment secrets to the guest.
- Keep guest networking disabled until a concrete design, threat review and tests exist.
- Validate file names, sizes, types and quotas for any import/export or shared filesystem feature.
- Do not use `eval`, dynamic code execution, or unsafe HTML injection for terminal behaviour.
- Do not store secrets in source code, public assets or browser-persisted VM snapshots.
- Explain the limits of browser sandboxing and emulator isolation; do not promise perfect isolation.
