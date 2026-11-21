# Tiny Core Linux 17.1 — Filesystem & File Operations

**Date:** 2026-11-21  
**Status:** Implemented & Verified in Guest  
**Scope:** Directory manipulation, file lifecycle, text processing pipelines, and filesystem architecture.

---

## 1. Filesystem Architecture & Memory Boundaries

In WebOS, Tiny Core Linux 17.1 operates with an in-memory virtual root filesystem (`rootfs` / `tmpfs`):

```
+--------------------------------------------------------------------------+
| Tiny Core Linux VFS Structure (RAM tmpfs @ 128 MB Physical Memory)        |
|                                                                          |
|  / (rootfs, tmpfs)                                                       |
|  ├── /bin, /sbin, /usr       (BusyBox symlinks and static binaries)     |
|  ├── /etc                    (Configuration, in-memory writable)         |
|  ├── /home/tc                (User home directory, in-memory writable)   |
|  ├── /tmp                    (Temporary workspace, in-memory writable)   |
|  ├── /tmp/tcloop/<pkg>       (Read-only loopback mounts of SquashFS TCZs)|
|  ├── /proc, /sys             (Virtual kernel pseudo-filesystems)         |
|  └── /mnt/sr0 (or /mnt/hdc)  (Read-only CD-ROM ISO9660 filesystem)      |
+--------------------------------------------------------------------------+
```

### 1.1 Memory Boundaries & Storage Constraints
- **Root Filesystem Type:** `tmpfs` / `rootfs`
- **Total Storage Capacity:** Bound to allocated virtual RAM (~100 MB available for temporary storage with 128 MB total VM RAM).
- **Persistence Boundary:** All modifications made to `/home/tc`, `/tmp`, and `/etc` reside exclusively in volatile WebAssembly memory. They are reset upon VM reboot or page refresh until Phase 6 persistence is implemented.

---

## 2. Directory Operations Verification

Tested directly inside the guest virtual machine:

### 2.1 Nested Directory Creation & Deletion
```sh
mkdir -p /tmp/webos-test/sub1/sub2/sub3
test -d /tmp/webos-test/sub1/sub2/sub3 && echo "DIR_CREATED"
```
- **Evidence:** `mkdir -p` correctly creates parent and leaf directories.
- **Removal:** `rmdir /tmp/webos-test/sub1/sub2/sub3` removes empty leaf; `rmdir` on a non-empty directory correctly exits with status `1` (`rmdir: '/tmp/webos-test': Directory not empty`).
- **Recursive Removal:** `rm -rf /tmp/webos-test` cleanly removes entire subtrees.

### 2.2 Navigation
```sh
cd /tmp/webos-test/sub1 && pwd
```
- Returns `/tmp/webos-test/sub1`.
- Attempting `cd /nonexistent_path` yields `sh: cd: can't cd to /nonexistent_path` and returns non-zero exit status (`1`).

---

## 3. File Creation, Content & Modification

### 3.1 Creation, Writing, and Appending
```sh
# Creation and overwrite
printf "WebOS File Operations Test\nLine 1: Alpha\n" > /tmp/testfile.txt

# Append
printf "Line 2: Beta\nLine 3: Gamma\n" >> /tmp/testfile.txt
```
- **Verification:** `cat /tmp/testfile.txt` outputs all 3 lines sequentially.
- **Line Count:** `wc -l /tmp/testfile.txt` outputs `4`.
- **Character Count:** `wc -c /tmp/testfile.txt` outputs exact byte length.

### 3.2 Copying, Renaming, and Moving
```sh
# Copy
cp /tmp/testfile.txt /tmp/testfile.bak
test -f /tmp/testfile.bak && echo "COPY_SUCCESS"

# Rename / Move
mv /tmp/testfile.bak /tmp/testfile_renamed.txt
test -f /tmp/testfile_renamed.txt && ! test -f /tmp/testfile.bak && echo "MOVE_SUCCESS"
```
- **Integrity Verification:** `cmp /tmp/testfile.txt /tmp/testfile_renamed.txt` exits with `0`, proving byte-identical replication.

---

## 4. Text Processing Pipelines

Tiny Core's BusyBox userland supports standard Unix streaming pipelines:

### 4.1 Pattern Searching with `grep`
```sh
grep "Beta" /tmp/testfile.txt
# Output: Line 2: Beta
grep -c "Line" /tmp/testfile.txt
# Output: 3
```

### 4.2 Stream Transformation with `sed`
```sh
sed -e 's/Beta/Omega/' /tmp/testfile.txt
# Replaces "Beta" with "Omega" in stream output
```

### 4.3 Field Parsing with `awk` & `cut`
```sh
cut -d: -f2 /tmp/testfile.txt | tr -d ' '
# Extracts field 2, stripping whitespace
```

### 4.4 Sorting & Uniqueness with `sort` and `uniq`
```sh
printf "banana\napple\norange\napple\n" | sort | uniq -c
# Output:
#   2 apple
#   1 banana
#   1 orange
```
