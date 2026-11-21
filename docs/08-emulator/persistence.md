# Emulator and Guest Persistence

## Requirements
WebOS distinguishes three persistence levels:

1. **Session:** guest changes remain while the VM continues running.
2. **Snapshot:** v86 runtime state can be saved and restored.
3. **Persistent files:** selected guest files survive a guest reboot.

Do not treat these as equivalent.

## Snapshot approach
Use the save/restore APIs supported by the pinned v86 version. Store the resulting state in browser storage only after measuring size, serialization cost and browser quota behaviour.

## Persistent file approaches to evaluate
- A writable virtual disk configured for the guest.
- v86's virtio 9p filesystem support, with the guest mounting the shared filesystem.
- Tiny Core backup/restore mechanisms for selected guest files.

Each option must be prototyped and tested. The best approach may depend on the guest kernel configuration and image.

## Failure cases
- Insufficient browser storage.
- Interrupted save.
- Corrupted snapshot.
- Snapshot created by incompatible app/emulator version.
- Guest networking device state issues after restore, if networking is later enabled.
- User clears browser data.

## User experience
- Show save/restore progress and errors.
- Show snapshot name, date, size and guest profile.
- Confirm destructive deletion.
- Explain that browser-local data is not cloud-synced.
- Consider export/import for backup, with strict validation and size limits.

## Acceptance
Snapshot restoration must return the guest to a usable state. File persistence must be tested separately by creating a file, shutting down/rebooting the guest, and confirming the file remains.
