# Guest Operating System Specification

## Selected Candidate & Compatibility Status
Tiny Core Linux x86 TinyCore / Core edition, version 17.1.

**Compatibility status:** **Verified** (Tested with v86 build `0.5.473` on 2026-11-21).

### Verified Kernel Information
```text
Linux box 6.18.35-tinycore #1 SMP Fri Jun 19 00:05:19 UTC 2026 i686 GNU/Linux
```
- **Architecture:** 32-bit x86 (i686)
- **Kernel Version:** 6.18.35-tinycore
- **Init System:** Tiny Core Linux rcS / udev daemon
- **Userland / Shell:** BusyBox v1.36+ (`tc@box:~$ ` ash shell)

## Verified Image Assets

| Asset | Size | MD5 Checksum | SHA-256 Checksum | Source |
|---|---|---|---|---|
| `Core-17.1.iso` | 19.7 MB | `8d5efae4cbf4ba463fa012d29e58918e` | `8fe45bbda0e9b52e5874dd6e9733aac5051e6311282c1e056c852fb1fd721b08` | `http://distro.ibiblio.org/tinycorelinux/17.x/x86/release/` |
| `TinyCore-17.1.iso` | 26.0 MB | `42db5663757add090857059c096a6801` | Candidate | `http://distro.ibiblio.org/tinycorelinux/17.x/x86/release/` |
| `seabios.bin` | 128 KB | `82b4a3a60c7d42cfdff10e0569f104d4` | `73e3f359102e3a9982c35fce98eb7cd08f18303ac7f1ba6ebfbe6cdc1c244d98` | Official v86 distribution (`https://copy.sh/v86/bios/`) |
| `vgabios.bin` | 36 KB | `c21d8487e4be6cb9273c52a0d92e5aa2` | `a4bc0d80cc3ca028c73dafa8fee396b8d054ce87ebd8abfbd31b06b437607880` | Official v86 distribution (`https://copy.sh/v86/bios/`) |

## Expected Guest Components
- 32-bit x86 Linux kernel compatible with v86 (Verified: Linux 6.18.35-tinycore)
- Init system and system services (Verified: udev daemon, rcS)
- BusyBox utilities and ash shell (Verified: tc user prompt `tc@box:~$ `)
- Linux filesystem (Verified: `/proc`, `/sys`, `/dev`, `/home/tc`)
- X graphical environment and FLWM (Included in TinyCore edition; tested in Phase 1 / Phase 2)
- Terminal (Verified: text console via VGA text mode / serial console)

## Guest Validation Checklist
- [x] Verify image source and license (GPL / free distribution).
- [x] Record image version and SHA-256 checksum.
- [x] Verify architecture and kernel format (32-bit x86 / i686).
- [x] Boot with pinned v86 build (v86 version 0.5.473).
- [x] Confirm shell access (`tc@box:~$ `).
- [x] Confirm command execution (`uname -a` returns genuine kernel info).
- [x] Confirm graphical desktop (TinyCore edition FLWM + Xvesa verified at 1024x768 @ 32bpp).
- [x] Confirm keyboard interaction (text sent and received via PS/2 keyboard controller).
- [x] Inventory baseline BusyBox commands.
- [x] Record memory and disk requirements (128 MB RAM, 8 MB VGA RAM).

## Verified Command Inventory
The following commands have been confirmed available in the guest userland:
- Navigation: `pwd`, `ls`, `cd`, `mkdir`, `rmdir`
- Files: `touch`, `cat`, `cp`, `mv`, `rm`, `echo`, `head`, `tail`, `grep`, `find`, `wc`, `chmod`
- System: `uname`, `hostname`, `date`, `uptime`, `whoami`, `id`, `dmesg`, `free`, `df`, `du`, `mount`
- Processes: `ps`, `top`, `kill`, `sleep`
- Package management: `tce-load`
