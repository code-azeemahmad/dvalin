# Testing Strategy and Acceptance Criteria — WebOS

## Testing principle
A visual web page is not proof of a working operating system. Tests must prove that operations occur inside the Linux guest.

## Test layers
- Unit: state transitions, configuration validation, storage metadata and UI logic.
- Integration: emulator service lifecycle, event mapping and persistence adapter.
- Browser end-to-end: welcome screen, boot flow, input, controls and error paths.
- Manual guest validation: Linux commands, GUI, process and filesystem behaviour.

## Critical proof-of-concept tests
- [ ] Selected v86 build initializes in a supported desktop browser.
- [ ] Selected Tiny Core Linux x86 image boots to a usable shell.
- [ ] Graphical environment starts and is visible, if using TinyCore edition.
- [ ] Keyboard and mouse input reach the guest.
- [ ] Boot image, BIOS assets and checksums are recorded.

## Functional acceptance tests

| ID | Test | Expected result |
|---|---|---|
| T-01 | Load website | Welcome screen appears |
| T-02 | Start Linux | One v86 instance initializes |
| T-03 | Boot guest | Real Linux guest reaches usable state |
| T-04 | Display | Guest output is visible |
| T-05 | Keyboard | Input works in guest |
| T-06 | Mouse | Pointer interaction works in guest GUI |
| T-07 | `uname -a` | Guest kernel information is returned |
| T-08 | File create/read/delete | Changes are visible in guest filesystem |
| T-09 | Process test | `sleep 300 &` appears in `ps`; `kill PID` terminates it |
| T-10 | Memory inspection | `free` and `/proc/meminfo` reflect guest environment |
| T-11 | Shell script | A script executes in guest shell |
| T-12 | Snapshot | State saves and restores successfully |
| T-13 | File persistence | Selected file survives guest reboot, if feature implemented |
| T-14 | Error handling | Missing asset or failed boot produces useful error |
| T-15 | Cleanup | Stop/unmount releases listeners and resources |

## Test evidence record
For each manual test record:
- Date/time
- Browser and version
- Host OS
- v86 release/commit
- Guest image name, version and checksum
- Emulator configuration
- Steps and commands
- Expected and actual result
- Screenshot/log reference
- Pass/fail/block status

## Performance measurements
Do not set arbitrary performance promises before baseline measurements. Record cold boot duration, memory footprint, snapshot size/save time, restore time and interaction responsiveness. Define targets after observing representative hardware.

## Regression gate
After changing v86, guest image, BIOS assets, storage format or input/display integration, rerun all critical boot and guest interaction tests.
