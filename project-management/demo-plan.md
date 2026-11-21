# Instructor Demonstration Plan

## Target duration
Approximately 5–7 minutes, subject to boot time and the final verified feature set.

## Demonstration sequence
1. Open the deployed WebOS site and explain that Linux runs in the browser using v86.
2. Start the VM and show actual guest boot output.
3. Show the guest graphical desktop and open its terminal.
4. Run `uname -a` and inspect `/proc/meminfo`.
5. Create a directory and text file in the guest.
6. Start a background process with `sleep 300 &`, find it with `ps`, and terminate it with `kill PID`.
7. Use the guest file manager to locate the created file, if available.
8. Demonstrate snapshot save/restore only if that feature has passed its acceptance tests.

## Presentation rules
- Use only features verified on the presentation machine.
- Prepare a clean guest state and a backup plan.
- Do not claim networking, persistence or commands that have not been tested.
- Explain the difference between the host web interface and guest Linux.
- Keep a record of the exact guest image and browser used.
