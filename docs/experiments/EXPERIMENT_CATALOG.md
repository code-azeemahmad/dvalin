# Complete OS Experiments Catalog

This catalog documents the 20 structured, interactive operating systems experiments implemented in WebOS Phase 7.

---

## Summary Matrix

| ID | Title | Category | Difficulty | Mode | Steps | Quiz |
|---|---|---|---|---|---|---|
| `exp-proc-01` | Understanding Processes & PIDs | Processes | Beginner | real-guest | 3 | Yes |
| `exp-proc-02` | Parent and Child Process Lifecycle | Processes | Intermediate | real-guest | 3 | Yes |
| `exp-proc-03` | Linux Signals & Process Control | Processes | Intermediate | real-guest | 3 | Yes |
| `exp-proc-04` | CPU Scheduling & Multitasking | Processes | Advanced | hybrid | 3 | Yes |
| `exp-mem-01` | Inspecting System Memory & /proc/meminfo | Memory | Beginner | real-guest | 3 | Yes |
| `exp-mem-02` | Dynamic Memory Allocation & Heap | Memory | Intermediate | real-guest | 3 | Yes |
| `exp-mem-03` | Virtual Memory & Paging Concepts | Memory | Advanced | hybrid | 3 | Yes |
| `exp-mem-04` | Memory Pressure & Out-Of-Memory Conditions | Memory | Advanced | real-guest | 3 | Yes |
| `exp-fs-01` | Filesystem Hierarchy & Directory Trees | Filesystem | Beginner | real-guest | 3 | Yes |
| `exp-fs-02` | Inodes, Links, and Metadata | Filesystem | Intermediate | real-guest | 3 | Yes |
| `exp-fs-03` | Mounting & Virtual Filesystems | Filesystem | Intermediate | real-guest | 3 | Yes |
| `exp-fs-04` | File Permissions & DAC Enforcement | Permissions | Beginner | real-guest | 3 | Yes |
| `exp-sh-01` | Shell Variables & Environment | Shell | Beginner | real-guest | 3 | Yes |
| `exp-sh-02` | Shell Conditions, Tests, and Loops | Shell | Intermediate | real-guest | 3 | Yes |
| `exp-sh-03` | Shell Functions & Modularity | Shell | Intermediate | real-guest | 3 | Yes |
| `exp-sh-04` | Pipelines, Redirection, & IPC | Shell | Beginner | real-guest | 3 | Yes |
| `exp-kern-01` | Kernel Architecture & Identification | Kernel | Beginner | real-guest | 3 | Yes |
| `exp-kern-02` | The Virtual /proc Filesystem | Kernel | Intermediate | real-guest | 3 | Yes |
| `exp-kern-03` | Linux Device Nodes & /dev | Devices | Intermediate | real-guest | 3 | Yes |
| `exp-kern-04` | The Linux Boot & Init Sequence | Kernel | Advanced | hybrid | 3 | Yes |

---

## Detailed Category Breakdown

### 1. Processes (`processes`)

#### `exp-proc-01`: Understanding Processes & PIDs
- **Objective:** Discover process identifiers, inspect current shell PID (`$$`), and explore init process (PID 1).
- **Steps:**
  1. Print current shell PID: `echo $$`
  2. List all active processes: `ps -ef`
  3. Inspect Process ID 1 in `/proc`: `ls -ld /proc/1`
- **Knowledge Check:** What is the role of PID 1 in Linux? (Root ancestor process of all user-space processes).

#### `exp-proc-02`: Parent and Child Process Lifecycle
- **Objective:** Observe process creation via fork/exec and state transitions with backgrounding and waiting.
- **Steps:**
  1. Spawn asynchronous child process: `sleep 2 & CHILD_PID=$!; echo "CHILD=$CHILD_PID"`
  2. Query running child state: `ps | grep -v grep | grep sleep`
  3. Wait for child termination: `wait $CHILD_PID; echo "EXIT=$?"`
- **Knowledge Check:** What happens when a child process finishes before its parent calls wait()? (Zombie state).

#### `exp-proc-03`: Linux Signals & Process Control
- **Objective:** Use kill to send POSIX signals and verify custom signal traps (`SIGTERM`, `SIGKILL`).
- **Steps:**
  1. Spawn background worker with trap: `sh -c 'trap "echo TRAPPED_SIGTERM; exit 0" TERM; while true; do sleep 1; done' & W_PID=$!; echo "WORKER=$W_PID"`
  2. Send SIGTERM (15) to worker: `kill -15 $W_PID; wait $W_PID; echo "TERMINATED_CLEANLY"`
  3. Demonstrate uncatchable SIGKILL (9): `sleep 60 & K_PID=$!; kill -9 $K_PID; wait $K_PID; echo "KILLED"`
- **Knowledge Check:** Which POSIX signal cannot be caught, blocked, or ignored by any process? (`SIGKILL` - 9).

#### `exp-proc-04`: CPU Scheduling & Multitasking
- **Objective:** Explore Linux scheduler mechanics, nice levels, and interactive scheduling queues.
- **Steps:**
  1. Inspect process priority & nice values: `ps -o pid,user,pri,ni,comm | head -n 10`
  2. Launch low-priority worker with nice: `nice -n 10 sleep 1 & N_PID=$!; ps -o pid,pri,ni,comm | grep sleep`
  3. Cleanup worker: `wait $N_PID 2>/dev/null; echo "NICE_RUN_OK"`
- **Knowledge Check:** How does a positive nice value (e.g. +10) affect a process? (Lowers process priority).

---

### 2. Memory (`memory`)

#### `exp-mem-01`: Inspecting System Memory & /proc/meminfo
- **Objective:** Analyze physical RAM distribution, buffers, caches, and swap status.
- **Steps:**
  1. Query summary memory stats: `free -m`
  2. Inspect kernel memory metrics: `grep -E "^(MemTotal|MemFree|Buffers|Cached):" /proc/meminfo`
  3. Compute memory utilization percentage: `awk '/MemTotal/{t=$2} /MemFree/{f=$2} END{printf "Used: %.1f%%\n", ((t-f)/t)*100}' /proc/meminfo`
- **Knowledge Check:** What does Buffers and Cached memory represent in Linux? (Kernel caching disk blocks and page files in RAM).

#### `exp-mem-02`: Dynamic Memory Allocation & Heap
- **Objective:** Observe heap allocation behavior and memory growth.
- **Steps:**
  1. Allocate temporary memory block in ramfs: `dd if=/dev/zero of=/tmp/webos-experiments/exp-mem-02/blob.bin bs=1M count=4 2>&1`
  2. Verify buffer size on filesystem: `ls -lh /tmp/webos-experiments/exp-mem-02/blob.bin`
  3. Release allocated block and verify sync: `rm -f /tmp/webos-experiments/exp-mem-02/blob.bin && sync && echo "MEMORY_FREED_OK"`
- **Knowledge Check:** Where is dynamic memory requested by malloc() allocated in a process address space? (The process Heap).

#### `exp-mem-03`: Virtual Memory & Paging Concepts
- **Objective:** Explore virtual-to-physical address translation and 4KB paging mechanisms.
- **Steps:**
  1. Query architecture page size: `getconf PAGESIZE`
  2. Inspect virtual memory maps of current shell: `head -n 15 /proc/$$/maps`
  3. Calculate virtual address space limits: `grep "VmallocTotal" /proc/meminfo`
- **Knowledge Check:** What is the standard virtual memory page size on x86 32-bit Linux? (4096 bytes / 4 KB).

#### `exp-mem-04`: Memory Pressure & Out-Of-Memory Conditions
- **Objective:** Learn how Linux manages severe memory constraints and OOM killer configurations.
- **Steps:**
  1. Inspect OOM score configuration: `cat /proc/$$/oom_score && cat /proc/$$/oom_score_adj`
  2. Query kernel overcommit configuration: `cat /proc/sys/vm/overcommit_memory`
  3. Inspect page dirty background ratios: `cat /proc/sys/vm/dirty_ratio`
- **Knowledge Check:** What is the purpose of the Linux Out-Of-Memory (OOM) killer? (Terminates lowest-priority memory-heavy processes to protect system stability).

---

### 3. Filesystem & Permissions (`filesystem` & `permissions`)

#### `exp-fs-01`: Filesystem Hierarchy & Directory Trees
- **Objective:** Explore Linux standard directories (`/bin`, `/etc`, `/proc`, `/tmp`, `/dev`).
- **Steps:**
  1. Inspect root directory layout: `ls -la /`
  2. Create nested workspace tree: `mkdir -p /tmp/webos-experiments/exp-fs-01/a/b/c && tree /tmp/webos-experiments/exp-fs-01 2>/dev/null || find /tmp/webos-experiments/exp-fs-01`
  3. Validate relative and absolute paths: `cd /tmp/webos-experiments/exp-fs-01/a/b && pwd`
- **Knowledge Check:** What is the designated purpose of the /etc directory? (System-wide configuration files).

#### `exp-fs-02`: Inodes, Links, and Metadata
- **Objective:** Demystify filesystem inodes, hard links vs symbolic links, and link count increments.
- **Steps:**
  1. Create file and inspect inode number: `printf "Hello Inode\n" > /tmp/webos-experiments/exp-fs-02/target.txt && ls -i /tmp/webos-experiments/exp-fs-02/target.txt`
  2. Create hard link and verify shared inode: `ln /tmp/webos-experiments/exp-fs-02/target.txt /tmp/webos-experiments/exp-fs-02/hardlink.txt && ls -li /tmp/webos-experiments/exp-fs-02/`
  3. Create symbolic link: `ln -s /tmp/webos-experiments/exp-fs-02/target.txt /tmp/webos-experiments/exp-fs-02/symlink.txt && ls -li /tmp/webos-experiments/exp-fs-02/symlink.txt`
- **Knowledge Check:** What happens to the target file data if you delete the original file when a hard link exists? (Data remains accessible through the hard link until link count reaches 0).

#### `exp-fs-03`: Mounting & Virtual Filesystems
- **Objective:** Inspect active mount points, filesystem types (`rootfs`, `tmpfs`, `sysfs`, `proc`), and read/write flags.
- **Steps:**
  1. List mounted filesystems: `mount | head -n 10`
  2. Inspect disk free space and mount capacities: `df -h`
  3. Query `/proc/mounts` table: `grep -E "tmpfs|proc|sysfs" /proc/mounts`
- **Knowledge Check:** What is a key characteristic of `tmpfs`? (Stores files directly in volatile RAM / swap).

#### `exp-fs-04`: File Permissions & DAC Enforcement
- **Objective:** Understand Discretionary Access Control (DAC), permission bits (`rwxrwxrwx`), and octal notation.
- **Steps:**
  1. Create script and verify default permissions: `printf "#!/bin/sh\necho HELLO_PERM\n" > /tmp/webos-experiments/exp-fs-04/run.sh && ls -l /tmp/webos-experiments/exp-fs-04/run.sh`
  2. Test execution failure without execute bit: `chmod 644 /tmp/webos-experiments/exp-fs-04/run.sh && (/tmp/webos-experiments/exp-fs-04/run.sh 2>&1 || echo "PERMISSION_DENIED_VERIFIED")`
  3. Grant execute permission and run: `chmod 755 /tmp/webos-experiments/exp-fs-04/run.sh && /tmp/webos-experiments/exp-fs-04/run.sh`
- **Knowledge Check:** What does octal permission `755` represent? (`rwxr-xr-x`: Owner read/write/execute, Group & Others read/execute).

---

### 4. Shell & Scripting (`shell`)

#### `exp-sh-01`: Shell Variables & Environment
- **Objective:** Master local shell variables, exported environment variables, and parameter expansion.
- **Steps:**
  1. Define local variable: `LAB_VAR="Antigravity_OS"; echo "VAR=$LAB_VAR"`
  2. Export variable to child subshell: `export EXP_VAR="Exported_Val"; sh -c 'echo "CHILD_SEES=$EXP_VAR"'`
  3. Inspect environment variables: `env | grep -E "^(USER|HOME|SHELL|PATH)="`
- **Knowledge Check:** How do unexported local variables behave in child processes? (They are not inherited by child processes).

#### `exp-sh-02`: Shell Conditions, Tests, and Loops
- **Objective:** Construct conditional tests (`[ -f ]`, `[ -d ]`) and iteration loops.
- **Steps:**
  1. Test file and directory presence: `test -d /proc && test -f /etc/issue && echo "TESTS_PASSED"`
  2. Execute for loop with range: `for i in 1 2 3 4; do printf "%s " "$i"; done; echo ""`
  3. While loop with counter arithmetic: `CNT=1; while [ $CNT -le 3 ]; do printf "Step%d " "$CNT"; CNT=$((CNT + 1)); done; echo ""`
- **Knowledge Check:** What command tests conditional expressions in standard POSIX shell? (`test` or `[`).

#### `exp-sh-03`: Shell Functions & Modularity
- **Objective:** Write modular functions with positional arguments and return values.
- **Steps:**
  1. Define and call POSIX function: `greet() { echo "Welcome to $1!"; }; greet "WebOS"`
  2. Arithmetic function with return code: `add() { return $(($1 + $2)); }; add 3 4; echo "SUM=$?"`
  3. Capture function stdout into variable: `get_kernel() { uname -r; }; K=$(get_kernel); echo "KERNEL=$K"`
- **Knowledge Check:** What is the maximum return code integer value supported by exit/return in POSIX shell? (255 - single unsigned byte).

#### `exp-sh-04`: Pipelines, Redirection, & IPC
- **Objective:** Connect commands with pipes (`|`), standard input/output redirection (`>`, `>>`, `<`), and filters (`grep`, `sort`, `wc`).
- **Steps:**
  1. Stream redirection to file: `printf "zebra\napple\nmango\n" > /tmp/webos-experiments/exp-sh-04/words.txt && cat /tmp/webos-experiments/exp-sh-04/words.txt`
  2. Multi-stage pipeline sort and head: `cat /tmp/webos-experiments/exp-sh-04/words.txt | sort | head -n 2`
  3. Count filtered occurrences: `cat /tmp/webos-experiments/exp-sh-04/words.txt | grep -c "a"`
- **Knowledge Check:** Which file descriptor number corresponds to standard error (stderr)? (2).

---

### 5. Kernel & System (`kernel` & `devices`)

#### `exp-kern-01`: Kernel Architecture & Identification
- **Objective:** Query kernel release version, architecture, compiler version, and boot parameters.
- **Steps:**
  1. Query full kernel banner: `uname -a`
  2. Read Linux kernel build version: `cat /proc/version`
  3. Inspect kernel command line boot flags: `cat /proc/cmdline`
- **Knowledge Check:** What kernel command line parameter tells Linux to boot into graphical or quiet mode? (`quiet`, `vga=791`, `nodhcp`).

#### `exp-kern-02`: The Virtual /proc Filesystem
- **Objective:** Discover how `/proc` provides a runtime window into kernel data structures.
- **Steps:**
  1. Inspect CPU architecture info: `cat /proc/cpuinfo | head -n 12`
  2. Query system uptime and idle time: `cat /proc/uptime`
  3. List supported filesystem types compiled into kernel: `cat /proc/filesystems`
- **Knowledge Check:** Does the `/proc` filesystem consume disk storage? (No, it is a virtual pseudo-filesystem generated dynamically in RAM by the kernel).

#### `exp-kern-03`: Linux Device Nodes & /dev
- **Objective:** Examine character devices, block devices, and major/minor numbers.
- **Steps:**
  1. Inspect null and zero devices: `ls -l /dev/null /dev/zero`
  2. Read bytes from random generator: `head -c 8 /dev/urandom | od -t x1`
  3. Inspect virtual console and tty devices: `ls -l /dev/tty0 /dev/console`
- **Knowledge Check:** What type of device does `c` signify in `crw-rw-rw- 1 root root /dev/null`? (Character device).

#### `exp-kern-04`: The Linux Boot & Init Sequence
- **Objective:** Trace the stages from bootloader handoff to init execution.
- **Steps:**
  1. Inspect dmesg kernel boot ring buffer: `dmesg | head -n 15`
  2. Check init system configuration: `head -n 10 /etc/inittab 2>/dev/null || cat /etc/init.d/rcS 2>/dev/null || ls /etc/init*`
  3. Inspect system runlevel or default target: `runlevel 2>/dev/null || echo "N 5"`
- **Knowledge Check:** What is the first user-space program executed by the Linux kernel after mounting the root filesystem? (`/sbin/init` - PID 1).
