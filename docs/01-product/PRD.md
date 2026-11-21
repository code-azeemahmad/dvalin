# Product Requirements Document — WebOS

## 1. Product summary
WebOS is an educational browser-based Linux environment. A user opens a website, starts a virtual machine powered by v86, and interacts with a real Linux guest through its graphical display and input devices.

## 2. Problem and purpose
Students need a convenient way to observe and experiment with operating-system concepts without installing a Linux distribution on their own computer. WebOS aims to make a lightweight Linux lab accessible through a modern desktop browser.

## 3. Target users
- Operating Systems students.
- Instructors demonstrating Linux and OS concepts.
- Learners exploring basic Linux commands and system behaviour.

## 4. Product objectives
- Boot a real Linux kernel in a browser-based emulator.
- Provide a genuine Linux graphical desktop and shell.
- Allow guest filesystem and process operations.
- Expose useful system information from the guest.
- Support save/restore and selected persistent files.
- Provide guided OS experiments.

## 5. Scope

### Essential
- Actual Linux boot in v86.
- Guest graphical desktop and terminal.
- Keyboard and mouse input.
- Guest file and directory operations.
- Process creation and termination.
- System and memory inspection.
- Shell scripts and permissions, subject to guest utilities.
- Host controls for start, stop, reset and fullscreen.

### Important
- Emulator snapshot save/restore.
- Persistence of selected user files across guest boots.
- Guided OS experiments and documentation.

### Optional / later
- Guest networking.
- Additional guest applications.
- File exchange with the host.
- Multiple guest profiles or distributions.
- Custom Linux image built with Buildroot.

## 6. Out of scope
- Writing a new Linux kernel.
- A full cloud VM service.
- A complete Ubuntu-like workstation.
- A simulated terminal that returns canned output.
- Running guest commands on a server or host shell.
- Multi-user accounts or cloud subscriptions for the initial client-side version.

## 7. User experience
1. User opens the WebOS site.
2. Welcome screen explains the guest profile and offers Start Linux.
3. User starts the emulator and sees boot progress.
4. Guest Linux desktop appears in the display area.
5. User interacts using keyboard and mouse.
6. User may open OS experiments and follow instructions in the real guest.
7. User can save state, restore, reset or shut down using clearly labelled controls.

## 8. Product principles
- Authenticity: system operations must occur in Linux.
- Transparency: disclose limitations and boot status.
- Educational value: connect experiments to OS concepts.
- Lightweight: use a small guest image and defer optional features.
- Safety: do not expose host secrets or files to the guest.

## 9. Success criteria
The product is successful when the acceptance criteria in `docs/07-testing/testing.md` pass on documented browser and guest configurations, including a verified Linux boot, working desktop, real shell commands, process operations and tested persistence behaviour.

## 10. Assumptions and open questions
- Tiny Core Linux x86 TinyCore 17.1 is the selected candidate, not yet proven compatible with the selected v86 build.
- Exact guest image, BIOS assets and v86 version must be pinned after the proof of concept.
- Browser storage limits and snapshot sizes must be measured.
- File persistence strategy must be selected after testing snapshot and disk options.
- Guest internet access is not part of the initial milestone.
