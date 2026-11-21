# OS Laboratory Experiments

## Purpose
Guided experiments teach operating-system concepts using commands executed in the real Linux guest. The host page provides instructions; it must not simulate command results.

## Experiment 1 — Process management
**Objective:** observe process creation, identification and termination.

1. Open the guest terminal.
2. Run `sleep 300 &`.
3. Run `ps`.
4. Identify the process ID.
5. Run `kill PID`, replacing `PID` with the actual ID.
6. Run `ps` again and verify the process is gone.

**Concepts:** process creation, PID, background execution, signals and termination.

## Experiment 2 — Filesystem navigation
**Objective:** explore the guest directory hierarchy.

1. Run `pwd`.
2. Run `ls -la /`.
3. Explore `/etc`, `/home`, `/proc` and `/dev` where present.
4. Create a lab directory with `mkdir`.
5. Create and inspect a file.

**Concepts:** directory hierarchy, files, virtual filesystems and device nodes.

## Experiment 3 — Memory inspection
**Objective:** inspect guest memory reporting.

1. Run `free` if available.
2. Run `cat /proc/meminfo`.
3. Identify total and available memory fields.
4. Compare the values and discuss what the guest sees.

**Concepts:** memory reporting and procfs.

## Experiment 4 — File permissions
**Objective:** observe Linux permission bits.

1. Create a script file.
2. Inspect it with `ls -l`.
3. Apply `chmod +x` if supported.
4. Execute the script.
5. Remove execute permission and observe the difference.

**Concepts:** permission bits and executable files.

## Experiment 5 — Shell scripting
**Objective:** execute a script in the guest shell.

Example script:

```sh
#!/bin/sh
echo "Welcome to WebOS"
echo "Current user:"
whoami
echo "Kernel:"
uname -a
```

Save as `system-info.sh`, make executable if supported, then run it.

## Lab content requirements
Each future experiment should include learning objectives, prerequisites, exact guest commands, expected observations, explanation, cleanup and a verification method. Clearly mark commands that depend on optional packages.
