# Tiny Core Linux 17.1 — Process Management & Signals

**Date:** 2026-11-21  
**Status:** Implemented & Verified in Guest  
**Scope:** Process creation, process table inspection, signal delivery, priority adjustment, and process reaping.

---

## 1. Process Model & Process Table

In WebOS, all processes execute natively under the guest Linux kernel (`6.18.35-tinycore`). Process state is maintained directly by the kernel's scheduler and exposed via the `/proc` virtual filesystem:

```
+--------------------------------------------------------------------------+
| Linux Kernel Process Tree (i686)                                         |
|                                                                          |
|  PID 1: /sbin/init                                                       |
|   └── PID 1015: -sh (login shell /dev/tty1, UID 1001 tc)                |
|        ├── Subshell / Worker processes (e.g. sleep 30 &)                 |
|        └── Xvesa / Window Manager (if GUI mode active)                   |
|                                                                          |
|  Virtual Kernel Interface (/proc):                                       |
|   ├── /proc/<pid>/status    (Name, State, PPID, VmSize, VmRSS, Threads)  |
|   ├── /proc/<pid>/cmdline   (Null-delimited command arguments)           |
|   └── /proc/<pid>/stat      (Raw kernel scheduler statistics)            |
+--------------------------------------------------------------------------+
```

---

## 2. Process Inspection Utilities

### 2.1 Process Listing with `ps`
BusyBox 1.36.1 provides standard process table inspection:
```sh
ps -o pid,user,stat,comm
```
Output format:
```
  PID USER       STAT COMMAND
    1 root       S    init
 1015 tc         S    -sh
 1050 tc         R    ps
```
- **Process States:** `R` (Running), `S` (Interruptible Sleep), `D` (Uninterruptible Sleep), `Z` (Zombie/Defunct), `T` (Stopped).

### 2.2 Continuous Monitoring with `top`
- Interactive monitoring: `top`
- Headless / Batch execution for scripts: `top -b -n 1 | head -n 15`
  - Reports total tasks, CPU utilization breakdown (usr, sys, nic, idle, io), and memory usage.

---

## 3. Process Creation & Job Control

### 3.1 Background Process Spawning
Appending an ampersand (`&`) directs the BusyBox shell to fork a child process and execute it concurrently:
```sh
sleep 60 &
CHILD_PID=$!
echo "Spawned child PID: $CHILD_PID"
```
- The shell variable `$!` reliably captures the PID of the most recently spawned background job.

### 3.2 Job Table Inspection
```sh
jobs
```
Displays all background jobs associated with the current shell session.

---

## 4. Signal Handling & Termination

Signals provide asynchronous inter-process communication:

| Signal Name | Number | Default Action | Verified in Guest |
|---|---|---|---|
| `SIGHUP` | 1 | Terminate process (hangup) | **Verified** |
| `SIGINT` | 2 | Interrupt from keyboard (<kbd>Ctrl+C</kbd>) | **Verified** |
| `SIGKILL` | 9 | Immediate, uncatchable termination | **Verified** |
| `SIGTERM` | 15 | Polite termination request (clean shutdown) | **Verified** |
| `SIGCONT` | 18 | Continue executing if stopped | **Verified** |
| `SIGSTOP` | 19 | Stop process execution | **Verified** |

### 4.1 Signal Delivery Verification Sequence
```sh
# 1. Spawn worker
sleep 60 &
PID=$!

# 2. Verify process exists in /proc
test -d "/proc/$PID" && echo "PROCESS_ACTIVE"

# 3. Send SIGTERM (15)
kill -15 "$PID"

# 4. Wait for child to exit and capture wait status
wait "$PID"
EXIT_STATUS=$?
echo "Exit status: $EXIT_STATUS"

# 5. Verify process was reaped from process table
! test -d "/proc/$PID" && echo "PROCESS_REAPED"
```
- When a process terminates due to signal 15 (`SIGTERM`), `wait` returns exit code `143` (`128 + 15`), matching standard POSIX signal reporting.
- Once reaped, the entry `/proc/<pid>` is immediately removed by the Linux kernel.

---

## 5. Priority Control & Persistence

### 5.1 Process Niceness with `nice` and `renice`
- Launching with lower priority:
  ```sh
  nice -n 10 ./compute_heavy.sh &
  ```
- Adjusting priority of running process:
  ```sh
  renice -n 5 -p <pid>
  ```

### 5.2 Immune Execution with `nohup`
```sh
nohup sleep 100 > /tmp/nohup.log 2>&1 &
```
Ensures background tasks continue running even if the controlling terminal session disconnects.
