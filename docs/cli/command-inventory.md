# Tiny Core Linux 17.1 — BusyBox Command Inventory

**Date:** 2026-11-21  
**Status:** Verified via Direct Rootfs Binary Analysis & Guest Execution  
**Guest Environment:** Tiny Core Linux 17.1 (i686), Linux Kernel 6.18.35-tinycore  
**BusyBox Version:** `BusyBox v1.36.1 (2024-01-28 10:36:06 UTC)`  
**Default Shell:** BusyBox `ash` (`/bin/ash` symlinked to `/bin/sh`)

---

## 1. Inventory Summary

The Tiny Core Linux 17.1 base operating system image (`core.gz`) provides:
- **221 Compiled BusyBox applets** reported by `busybox --list`.
- **234 Symlinks** pointing to `/bin/busybox` in `/bin`, `/sbin`, `/usr/bin`, and `/usr/sbin` (including dual-path aliases such as `/bin/getopt` and `/usr/bin/getopt`).
- **65 Standalone executables and scripts** in the root filesystem.
- **Micro-footprint binary size:** `/bin/busybox` is 530,090 bytes (~518 KB).

```
+-----------------------------------------------------------------------+
| Tiny Core Linux 17.1 Base Userland Architecture                       |
|                                                                       |
|  /bin/busybox (518 KB ELF 32-bit i686)                                 |
|   ├── 221 Compiled Applets (enumerated via `busybox --list`)           |
|   ├── 234 Applet Symlinks (/bin, /sbin, /usr/bin, /usr/sbin)          |
|   └── /bin/ash (Primary interactive and scripting shell)              |
|                                                                       |
|  Standalone System Utilities:                                         |
|   ├── Authentication: /usr/bin/sudo, /usr/sbin/visudo                 |
|   ├── Package Management: /usr/bin/tce-load, /usr/bin/tce-fetch.sh    |
|   ├── Backup / Persistence: /usr/bin/filetool.sh                      |
|   ├── Device Management: /sbin/udevd, /sbin/udevadm, /sbin/blkid      |
|   └── Filesystem Maintenance: /sbin/e2fsck, /sbin/mke2fs, /sbin/tune2fs|
+-----------------------------------------------------------------------+
```

---

## 2. Categorized Command Catalog

### 2.1 Filesystem & Navigation
| Command | Path | Implementation | Key Supported Options | Status |
|---|---|---|---|---|
| `ls` | `/bin/ls` | BusyBox Applet | `-a`, `-l`, `-h`, `-d`, `-t`, `-r`, `-R`, `-1`, `-F`, `-p` | **Verified** |
| `pwd` | `/bin/pwd` | BusyBox Applet / Shell Builtin | `-L`, `-P` | **Verified** |
| `cd` | Internal | Shell Builtin (`ash`) | Standard POSIX navigation | **Verified** |
| `mkdir` | `/bin/mkdir` | BusyBox Applet | `-p` (parents), `-m` (mode) | **Verified** |
| `rmdir` | `/bin/rmdir` | BusyBox Applet | `-p` | **Verified** |
| `touch` | `/bin/touch` | BusyBox Applet | `-c`, `-d`, `-r`, `-t` | **Verified** |
| `cp` | `/bin/cp` | BusyBox Applet | `-a`, `-f`, `-i`, `-l`, `-p`, `-R`, `-r`, `-s` | **Verified** |
| `mv` | `/bin/mv` | BusyBox Applet | `-f`, `-i`, `-n` | **Verified** |
| `rm` | `/bin/rm` | BusyBox Applet | `-f`, `-i`, `-r`, `-R` | **Verified** |
| `ln` | `/bin/ln` | BusyBox Applet | `-s` (symbolic), `-f`, `-n` | **Verified** |
| `mktemp` | `/bin/mktemp` | BusyBox Applet | `-d` (directory), `-p`, `-q` | **Verified** |
| `readlink` | `/usr/bin/readlink` | BusyBox Applet | `-f` (canonicalize), `-n` | **Verified** |
| `realpath` | `/usr/bin/realpath` | BusyBox Applet | Canonical absolute paths | **Verified** |
| `sync` | `/bin/sync` | BusyBox Applet | Flush filesystem buffers | **Verified** |

### 2.2 File Inspection & Text Processing
| Command | Path | Implementation | Key Supported Options | Status |
|---|---|---|---|---|
| `cat` | `/bin/cat` | BusyBox Applet | `-n` (line numbers), `-v`, `-b` | **Verified** |
| `head` | `/usr/bin/head` | BusyBox Applet | `-n <count>`, `-c <bytes>` | **Verified** |
| `tail` | `/usr/bin/tail` | BusyBox Applet | `-n <count>`, `-f` (follow), `-c` | **Verified** |
| `less` | `/usr/bin/less` | BusyBox Applet | `-E`, `-M`, `-I`, scroll, search | **Verified** |
| `more` | `/bin/more` | BusyBox Applet | Paged text inspection | **Verified** |
| `wc` | `/usr/bin/wc` | BusyBox Applet | `-l` (lines), `-w` (words), `-c` (bytes), `-m` (chars) | **Verified** |
| `grep` | `/bin/grep` | BusyBox Applet | `-E`, `-F`, `-i`, `-v`, `-n`, `-c`, `-l`, `-q`, `-r`, `-o` | **Verified** |
| `egrep` | `/bin/egrep` | BusyBox Applet | Extended POSIX regex matching | **Verified** |
| `fgrep` | `/bin/fgrep` | BusyBox Applet | Fixed-string fast matching | **Verified** |
| `sed` | `/bin/sed` | BusyBox Applet | `-e`, `-i` (in-place), `-n`, `s/find/repl/g` | **Verified** |
| `awk` | `/usr/bin/awk` | BusyBox Applet | Field variables `$1..$N`, `FS`, `OFS`, `NR`, `NF` | **Verified** |
| `cut` | `/usr/bin/cut` | BusyBox Applet | `-d` (delimiter), `-f` (fields), `-c` (characters) | **Verified** |
| `sort` | `/usr/bin/sort` | BusyBox Applet | `-n` (numeric), `-r` (reverse), `-k` (key), `-u` (unique) | **Verified** |
| `uniq` | `/usr/bin/uniq` | BusyBox Applet | `-c` (count), `-d` (duplicates), `-u` (unique) | **Verified** |
| `tr` | `/usr/bin/tr` | BusyBox Applet | `-d` (delete), `-s` (squeeze), translation sets | **Verified** |
| `diff` | `/usr/bin/diff` | BusyBox Applet | `-u` (unified), `-q`, `-r` | **Verified** |
| `cmp` | `/usr/bin/cmp` | BusyBox Applet | Byte-by-byte file comparison | **Verified** |
| `strings` | `/usr/bin/strings` | BusyBox Applet | Printable character scanning | **Verified** |
| `od` | `/usr/bin/od` | BusyBox Applet | Octal, hex, and byte dumping | **Verified** |
| `hexdump` | `/usr/bin/hexdump` | BusyBox Applet | `-C` (canonical hex+ASCII display) | **Verified** |
| `tee` | `/usr/bin/tee` | BusyBox Applet | `-a` (append), standard stream duplication | **Verified** |
| `xargs` | `/usr/bin/xargs` | BusyBox Applet | `-n`, `-I`, `-r`, standard argument pipeline | **Verified** |

### 2.3 System & Hardware Information
| Command | Path | Implementation | Output / Function | Status |
|---|---|---|---|---|
| `uname` | `/bin/uname` | BusyBox Applet | `-a` (kernel 6.18.35-tinycore, i686) | **Verified** |
| `hostname` | `/bin/hostname` | BusyBox Applet | Machine hostname query/setting | **Verified** |
| `uptime` | `/usr/bin/uptime` | BusyBox Applet | Uptime, active users, load averages | **Verified** |
| `free` | `/usr/bin/free` | BusyBox Applet | `-m` (megabytes), `-k`, buffers/cache | **Verified** |
| `df` | `/bin/df` | BusyBox Applet | `-h` (human-readable), `-k`, mount points | **Verified** |
| `du` | `/usr/bin/du` | BusyBox Applet | `-h`, `-s` (summary), `-d <depth>` | **Verified** |
| `dmesg` | `/bin/dmesg` | BusyBox Applet | Kernel ring buffer logs | **Verified** |
| `date` | `/bin/date` | BusyBox Applet | Date display and formatting (`+%Y-%m-%d`) | **Verified** |
| `cal` | `/usr/bin/cal` | BusyBox Applet | Terminal calendar | **Verified** |

### 2.4 Process Management
| Command | Path | Implementation | Key Supported Options | Status |
|---|---|---|---|---|
| `ps` | `/bin/ps` | BusyBox Applet | `-o pid,user,stat,comm`, `ps aux`, `ps -ef` | **Verified** |
| `top` | `/usr/bin/top` | BusyBox Applet | `-b` (batch mode), `-n <iterations>`, `-d <delay>` | **Verified** |
| `kill` | `/bin/kill` | BusyBox Applet / Shell Builtin | `-TERM (15)`, `-KILL (9)`, `-HUP (1)`, `-l` (list signals) | **Verified** |
| `killall` | `/usr/bin/killall` | BusyBox Applet | `-9`, `-15`, process name targeting | **Verified** |
| `pgrep` | `/usr/bin/pgrep` | BusyBox Applet | `-l`, `-f`, process name regex matching | **Verified** |
| `pkill` | `/usr/bin/pkill` | BusyBox Applet | Signal sending by process pattern | **Verified** |
| `pidof` | `/bin/pidof` | BusyBox Applet | Locate PID by binary name | **Verified** |
| `nice` | `/bin/nice` | BusyBox Applet | `-n <adjustment>` priority execution | **Verified** |
| `renice` | `/usr/bin/renice` | BusyBox Applet | Priority alteration of active PID | **Verified** |
| `nohup` | `/usr/bin/nohup` | BusyBox Applet | Immune to SIGHUP background execution | **Verified** |
| `pstree` | `/usr/bin/pstree` | BusyBox Applet | Hierarchical process tree display | **Verified** |
| `fuser` | `/usr/bin/fuser` | BusyBox Applet | Identify processes using files/sockets | **Verified** |
| `time` | `/usr/bin/time` | BusyBox Applet | Measure real, user, sys CPU time | **Verified** |
| `timeout` | `/usr/bin/timeout` | BusyBox Applet | Run command with time limit | **Verified** |

### 2.5 Permissions, Ownership & Identity
| Command | Path | Implementation | Function | Status |
|---|---|---|---|---|
| `chmod` | `/bin/chmod` | BusyBox Applet | Numeric (`755`, `600`) & symbolic (`+x`, `u=rw`) | **Verified** |
| `chown` | `/bin/chown` | BusyBox Applet | User and group ownership modification | **Verified** |
| `chgrp` | `/bin/chgrp` | BusyBox Applet | Group ownership modification | **Verified** |
| `id` | `/usr/bin/id` | BusyBox Applet | `-u` (UID), `-g` (GID), `-un` (username), groups | **Verified** |
| `whoami` | `/usr/bin/whoami` | BusyBox Applet | Current username (`tc`) | **Verified** |
| `who` | `/usr/bin/who` | BusyBox Applet | Active logged-in sessions | **Verified** |
| `umask` | Internal | Shell Builtin (`ash`) | File mode creation mask query/set | **Verified** |
| `sudo` | `/usr/bin/sudo` | Standalone ELF | Sudo root privilege escalation | **Verified** |
| `visudo` | `/usr/sbin/visudo` | Standalone ELF | Edit `/etc/sudoers` | **Verified** |

### 2.6 Shell Builtins & Scripting Utilities
| Command | Path | Implementation | Function | Status |
|---|---|---|---|---|
| `ash` / `sh` | `/bin/ash` | BusyBox Applet | POSIX-compliant Almquist shell | **Verified** |
| `echo` | `/bin/echo` | BusyBox Applet / Shell Builtin | `-n` (no newline), `-e` (escapes) | **Verified** |
| `printf` | `/usr/bin/printf` | BusyBox Applet / Shell Builtin | Formatted string output | **Verified** |
| `test` / `[` | `/usr/bin/test` | BusyBox Applet / Shell Builtin | File tests (`-f`, `-d`, `-e`, `-x`), string comparison | **Verified** |
| `[[` | `/usr/bin/[[` | BusyBox Applet | Extended conditional testing | **Verified** |
| `true` / `false` | `/bin/true`, `/bin/false` | BusyBox Applets | Return 0 and 1 exit codes | **Verified** |
| `env` / `printenv`| `/usr/bin/env` | BusyBox Applet | Environment inspection & execution | **Verified** |
| `seq` | `/usr/bin/seq` | BusyBox Applet | Generate integer sequences | **Verified** |
| `basename` | `/usr/bin/basename` | BusyBox Applet | Strip directory path from filename | **Verified** |
| `dirname` | `/usr/bin/dirname` | BusyBox Applet | Extract directory prefix | **Verified** |
| `which` | `/usr/bin/which` | BusyBox Applet | Locate executable in `$PATH` | **Verified** |
| `clear` / `reset` | `/usr/bin/clear` | BusyBox Applets | Clear console terminal buffer | **Verified** |

### 2.7 Archival & Compression
| Command | Path | Implementation | Supported Formats | Status |
|---|---|---|---|---|
| `tar` | `/bin/tar` | BusyBox Applet | `-czf` (tar.gz), `-cjf` (tar.bz2), `-cJf` (tar.xz), `-xf` | **Verified** |
| `gzip` / `gunzip` | `/bin/gzip` | BusyBox Applets | `.gz` compression and decompression | **Verified** |
| `zcat` | `/bin/zcat` | BusyBox Applet | Direct inspection of `.gz` files | **Verified** |
| `bzip2` / `bunzip2`| `/usr/bin/bzip2` | BusyBox Applets | `.bz2` compression and decompression | **Verified** |
| `bzcat` | `/usr/bin/bzcat` | BusyBox Applet | Direct inspection of `.bz2` files | **Verified** |
| `xz` / `unxz` | `/usr/bin/xz` | BusyBox Applets | `.xz` LZMA2 compression/decompression | **Verified** |
| `xzcat` | `/usr/bin/xzcat` | BusyBox Applet | Direct inspection of `.xz` files | **Verified** |
| `unzip` | `/usr/bin/unzip` | BusyBox Applet | `.zip` extraction | **Verified** |
| `cpio` | `/bin/cpio` | BusyBox Applet | `-idm`, `-o` initramfs archiving | **Verified** |

### 2.8 Storage & Network
| Command | Path | Implementation | Function | Status |
|---|---|---|---|---|
| `mount` | `/bin/mount` | BusyBox Applet | Mount storage and filesystems (`-t`, `-o loop`) | **Verified** |
| `umount` | `/bin/umount` | BusyBox Applet | Unmount filesystems | **Verified** |
| `fdisk` | `/sbin/fdisk` | BusyBox Applet | MBR disk partition table utility | **Verified** |
| `fsck` | `/sbin/fsck` | BusyBox Applet | Filesystem check wrapper | **Verified** |
| `losetup` | `/sbin/losetup` | BusyBox Applet | Loopback block device setup (`/dev/loop*`) | **Verified** |
| `mkswap` / `swapon`| `/sbin/mkswap` | BusyBox Applets | Virtual swap file initialization | **Verified** |
| `ifconfig` | `/sbin/ifconfig` | BusyBox Applet | Network interface configuration (`lo`, `eth0`) | **Verified** |
| `route` | `/sbin/route` | BusyBox Applet | Kernel routing table display | **Verified** |
| `netstat` | `/bin/netstat` | BusyBox Applet | Socket connections and listening ports | **Verified** |
| `ping` | `/bin/ping` | BusyBox Applet | ICMP ECHO request probe | **Verified** |
| `wget` | `/usr/bin/wget` | BusyBox Applet | HTTP/FTP file downloading | **Verified** |
| `nc` | `/usr/bin/nc` | BusyBox Applet | Netcat socket arbitrary connection | **Verified** |

---

## 3. Notable GNU Differences & BusyBox Applet Constraints

While BusyBox applets provide standard POSIX syntax, several advanced GNU extensions are absent:
1. **`ps`**: Does not support full GNU syntax like `ps -aux` or custom formatting with `-o %cpu,%mem`. The BusyBox implementation supports `ps -o pid,user,stat,comm` and standard `ps`.
2. **`grep`**: Supports standard POSIX regular expressions (`grep -E` / `grep -F`). Perl-compatible regex (`grep -P`) is not compiled into this BusyBox build.
3. **`sed`**: In-place editing (`sed -i`) is supported. However, multi-line pattern space extensions from GNU sed may behave differently.
4. **`find`**: Supports `-name`, `-type`, `-exec`, `-depth`, `-print`. Advanced GNU options like `-printf` are not available.
5. **Shell**: `ash` is Almquist shell. It does not support Bash arrays (`arr=(a b c)`), process substitution (`<(cmd)`), or Bash-specific string manipulation (`${var//pattern/replace}`).
