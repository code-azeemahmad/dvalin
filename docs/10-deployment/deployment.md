# Deployment Plan — WebOS

## Initial model
Deploy the React application and required emulator/guest assets as a static HTTPS website. No application backend is required for the initial client-side VM design.

## Candidate hosts
- Cloudflare Pages
- GitHub Pages

Choose one after validating asset size, routing, caching, MIME types, bandwidth and deployment workflow.

## Deployment requirements
- HTTPS origin.
- Correct static asset paths.
- BIOS and guest images served successfully.
- Cross-origin rules configured if assets are hosted separately.
- Large binary assets handled deliberately.
- Browser console free of critical errors.
- No secrets embedded in public assets.
- Guest image and emulator versions recorded.

## Build and release
1. Run formatting, lint and type checks available in the repository.
2. Run unit and integration tests.
3. Run browser smoke tests.
4. Verify a clean boot from the deployed origin.
5. Verify keyboard/mouse, core guest commands and save/restore if included.
6. Record release version and tested configuration.
7. Publish release notes and known limitations.

## Rollback
Keep the previous known-good deployment available. If a release breaks guest boot or asset loading, roll back rather than attempting unverified hot fixes in production.
