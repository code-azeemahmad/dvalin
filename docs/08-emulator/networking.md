# Guest Networking — Deferred Feature

## Status
Optional and deferred beyond the first working release.

## Reason
A virtual network interface does not automatically provide internet access. v86 networking requires a supported backend or proxy and guest-side network configuration.

## Requirements before implementation
- Define the educational use case.
- Review v86 networking documentation for the pinned version.
- Select a supported backend/proxy.
- Configure guest interface and DNS.
- Decide whether outbound access is restricted.
- Review privacy and security implications.
- Test behaviour after VM snapshot restore.

## Security defaults
- Networking disabled by default.
- Do not expose local/private network services unintentionally.
- Do not provide broad host network access without a documented need.
- Explain to users when the guest can access external networks.

## Acceptance
A guest networking experiment must prove actual guest connectivity and document its backend, restrictions and restore behaviour.
