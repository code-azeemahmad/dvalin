# Product Requirements — WebOS

Requirement labels: **Must**, **Should**, **Could**. Status is initially **Proposed** unless evidence is added.

## Functional requirements

| ID | Priority | Requirement | Acceptance evidence |
|---|---|---|---|
| FR-01 | Must | Show a welcome screen before boot | Browser test shows welcome screen |
| FR-02 | Must | Initialize one v86 instance on user request | Instance lifecycle test |
| FR-03 | Must | Boot the selected 32-bit Linux guest | Guest reaches usable shell; logs/evidence recorded |
| FR-04 | Must | Display actual guest VGA output | Visible guest desktop or console |
| FR-05 | Must | Forward keyboard and mouse input | Input works in guest |
| FR-06 | Must | Provide start, stop, reset controls | Each control has verified behaviour |
| FR-07 | Must | Execute commands in guest Linux | Commands produce guest-backed results |
| FR-08 | Must | Support guest file operations | Create/read/rename/delete verified in guest |
| FR-09 | Must | Support process inspection and termination | Process appears and disappears in guest process list |
| FR-10 | Must | Expose guest system and memory information | Values sourced from guest commands/procfs |
| FR-11 | Should | Support guest shell scripts and permissions | Script and chmod test |
| FR-12 | Should | Save and restore v86 state | State restoration test |
| FR-13 | Should | Preserve selected files across boots | Reboot persistence test |
| FR-14 | Should | Provide guided OS experiments | Each lab has instructions and verification |
| FR-15 | Could | Provide guest networking | Explicit network test and security review |
| FR-16 | Could | Provide host/guest file exchange | Import/export tests and security review |

## Non-functional requirements
- **Reliability:** failed boot or restore must produce a recoverable error state.
- **Performance:** measure cold boot time, memory use and interaction responsiveness; set targets after baseline measurements.
- **Compatibility:** document tested browser versions and operating systems.
- **Accessibility:** host controls must have labels, keyboard access and visible focus.
- **Maintainability:** emulator lifecycle must be isolated from UI components.
- **Security:** no host command execution or unintended host-file exposure.
- **Usability:** boot, running, saving and error states must be understandable.

## Constraints
- v86 upstream documents that 64-bit Linux kernels are not supported; target a compatible 32-bit x86 guest.
- Guest networking requires deliberate configuration.
- Browser storage is quota-limited and may be cleared by the user/browser.
- Tiny Core command availability depends on BusyBox configuration and installed extensions.

## Requirement change process
Record material changes in `docs/02-architecture/decisions.md` and `project-management/changelog.md`. Update acceptance criteria and tests alongside the requirement.
