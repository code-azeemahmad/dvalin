# Tiny Core Linux 17.1 — Utility Availability & Evaluation

**Date:** 2026-11-21  
**Status:** Evaluated & Documented  
**Scope:** Missing utilities analysis, BusyBox alternatives, and extension package trade-offs.

---

## 1. Candidate Evaluation Matrix

In accordance with Phase 5 guidelines, we evaluate commonly expected command-line utilities against the actual Tiny Core Linux 17.1 environment. Utilities are installed or added only when the roadmap benefits justify image-size and dependency overhead.

| Candidate Utility | Present in Base? | Base Alternative Available? | Tiny Core Extension | Assessment & Recommendation |
|---|---|---|---|---|
| **`less`** | **Yes** (`/usr/bin/less`) | Built-in BusyBox applet | N/A | **Retain Base Applet**: Full paging, search (`/`), and quit (`q`) work reliably. |
| **`which`** | **Yes** (`/usr/bin/which`) | Built-in BusyBox applet | N/A | **Retain Base Applet**: Correctly searches `$PATH` and resolves executable locations. |
| **`unzip`** | **Yes** (`/usr/bin/unzip`) | Built-in BusyBox applet | N/A | **Retain Base Applet**: Handles standard PKZIP archives cleanly. |
| **`wget`** | **Yes** (`/usr/bin/wget`) | Built-in BusyBox applet | N/A | **Retain Base Applet**: Basic HTTP/FTP retrieval functional. |
| **`nano`** | No | `vi` (`/bin/vi`), `editor` (GUI) | `nano.tcz` (~250 KB) | **Evaluate Alternative**: BusyBox `vi` is present in console mode; FLTK `editor` is present in GUI mode. Installing `nano` is optional and deferred to prevent ISO bloat. |
| **`file`** | No | Basic MIME / header inspection | `file.tcz` (~750 KB) | **Evaluate Alternative**: Useful for magic byte detection, but not strictly required for Phase 5 OS labs. |
| **`tree`** | No | `find` + `awk` shell tree function | `tree.tcz` (~45 KB) | **Provide Shell Implementation**: A 15-line shell function using `find` and `sed` provides hierarchy visualization without external binary dependencies. |
| **`curl`** | No | `wget` (`/usr/bin/wget`) | `curl.tcz` (~600 KB) | **Retain Built-in `wget`**: BusyBox `wget` covers file fetching. Since networking is disabled by default for security, `curl` is unnecessary. |
| **`bash`** | No | `ash` (`/bin/ash`) | `bash.tcz` (~1.4 MB) | **Retain `ash`**: `ash` is strictly POSIX compliant, fast, and lightweight. Bash introduces 1.4 MB overhead without educational necessity. |

---

## 2. In-Depth Candidate Profiles

### 2.1 File Pagers: `less` and `more`
- **Current State:** Both `/usr/bin/less` and `/bin/more` exist as BusyBox applets.
- **Verification:**
  - Paging large outputs (`dmesg | less`) functions as expected.
  - Environment variable `PAGER='less -EM'` is set in `/etc/skel/.profile`.
- **Verdict:** No additional package required.

### 2.2 Text Editors: `vi` vs `nano`
- **Current State:** `/bin/vi` is installed in the base rootfs. In the graphical desktop, `/usr/local/bin/editor` (FLTK Notepad) is available.
- **Verification:**
  - `/bin/vi` supports standard modal editing (`i` insert, `:w` save, `:q` quit, `dd`, `yy`, `p`).
- **Verdict:** For educational labs, standard `vi` and GUI `editor` provide complete coverage. `nano.tcz` is unnecessary for base OS capabilities.

### 2.3 Hierarchy Viewer: `tree` via POSIX Shell
- **Problem:** `tree` is frequently used in OS education to inspect directory layouts, but is not included in BusyBox.
- **Solution:** WebOS provides a lightweight POSIX-compatible shell script `tree.sh` in `guest/scripts/filesystem/` that utilizes `find` and `sed` to render visual directory trees without adding external binary packages:
```sh
#!/bin/sh
# Lightweight POSIX tree utility
find "${1:-.}" | sed -e "s/[^-][^\/]*\// |/g" -e "s/|\([^ ]\)/+---\1/"
```

### 2.4 Package Management & Extension Mechanics
Tiny Core Linux uses `.tcz` (Tiny Core Zipped) SquashFS extensions.
- When an extension is loaded via `tce-load -i <package>.tcz`:
  1. It loop-mounts the package under `/tmp/tcloop/<package>/`.
  2. It symlinks all binaries into `/usr/local/bin/` and libraries into `/usr/local/lib/`.
  3. No rootfs disk expansion occurs because files are read directly from compressed SquashFS blocks.
- **Policy for Phase 5:** Preserve offline integrity. WebOS operates in an isolated, secure browser sandbox without requiring remote package repositories for baseline OS labs.
