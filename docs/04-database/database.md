# Data and Persistence Design — WebOS

## Scope
The initial product is client-side and does not require a server database. This document describes browser-side persistence concepts; it is not a finalized schema.

## Data categories
1. Emulator snapshot: serialized runtime state produced by the v86 API.
2. User files: files that must survive guest reboot, using a tested guest disk or shared filesystem strategy.
3. Host preferences: UI settings such as selected profile or display preferences.
4. Lab progress: optional local completion markers, if implemented.

## Proposed browser storage
IndexedDB is a candidate for storing large binary snapshots and metadata. Browser quotas vary, so storage availability must be checked and failures handled.

Suggested logical records:

### Snapshot
- `id`: unique identifier
- `name`: user-facing label
- `createdAt`: timestamp
- `guestProfile`: guest image identifier/version
- `emulatorVersion`: v86 version/commit
- `formatVersion`: application snapshot metadata version
- `payload`: binary state data (storage representation to be chosen)
- `sizeBytes`: payload size
- `notes`: optional description

### Preference
- `key`
- `value`
- `updatedAt`

### LabProgress (optional)
- `experimentId`
- `status`
- `updatedAt`

## Persistence distinctions
- Session persistence: changes remain while the VM is running.
- Snapshot persistence: save and restore the complete emulator runtime state.
- Guest file persistence: preserve selected files across guest reboot.
These are separate behaviours and require separate acceptance tests.

## Open technical questions
- What is the actual output format and memory footprint of v86 `save_state()`?
- Which browser storage quotas apply in target browsers?
- Should snapshots be exportable/importable as files?
- Is a persistent virtual disk or v86 9p filesystem the better user-file solution?
- How will incompatible snapshot versions be detected?
- How will the app handle interrupted writes and corrupted snapshots?

## Rules
- Never store credentials or secrets in snapshots.
- Show storage usage where practical.
- Handle quota errors and allow users to delete snapshots.
- Do not claim guest files persist across reboot until a reboot test proves it.
