# Tiny Core Linux 17.1 — Permissions, Ownership & Security

**Date:** 2026-11-21  
**Status:** Implemented & Verified in Guest  
**Scope:** DAC permission bits, umask, execute enforcement, ownership, and privilege escalation.

---

## 1. Discretionary Access Control (DAC) Model

Tiny Core Linux adheres to the standard Unix Discretionary Access Control (DAC) security model, implemented directly by the Linux kernel's VFS layer:

```
+--------------------------------------------------------------------------+
| Linux File Permission Bits (12-bit octal structure)                      |
|                                                                          |
|  Special Bits     User (Owner)       Group              Others           |
|  [SUID|SGID|Sticky]  [ r | w | x ]   [ r | w | x ]      [ r | w | x ]   |
|     (4   2   1)        (4   2   1)     (4   2   1)        (4   2   1)    |
|                                                                          |
|  Guest Identity Context:                                                 |
|   - Default User: tc (UID 1001)                                          |
|   - Primary Group: staff (GID 50)                                        |
|   - Root Identity: root (UID 0, GID 0) accessible via /usr/bin/sudo     |
+--------------------------------------------------------------------------+
```

---

## 2. Identity & Mask Inspection

### 2.1 User and Group Identity
```sh
id
# Output: uid=1001(tc) gid=50(staff) groups=50(staff),...
whoami
# Output: tc
```

### 2.2 Default Creation Mask (`umask`)
```sh
umask
# Output: 0022
```
- With `0022`, newly created files default to mode `0644` (`-rw-r--r--`).
- Newly created directories default to mode `0755` (`drwxr-xr-x`).

---

## 3. Permission Alteration with `chmod`

Both numeric octal notation and symbolic notation are supported:

### 3.1 Numeric Mode Verification
```sh
touch /tmp/perm_test.txt

# Restrict to owner read/write only (600)
chmod 600 /tmp/perm_test.txt
ls -l /tmp/perm_test.txt | grep -- "-rw-------"

# Make read-only (400)
chmod 400 /tmp/perm_test.txt
ls -l /tmp/perm_test.txt | grep -- "-r--------"

# Open read/write to all (666)
chmod 666 /tmp/perm_test.txt
ls -l /tmp/perm_test.txt | grep -- "-rw-rw-rw-"
```

### 3.2 Symbolic Mode Verification
```sh
# Add execute bit to all
chmod +x /tmp/perm_test.txt
ls -l /tmp/perm_test.txt | grep -- "-rwxrwxrwx"

# Remove write bit from others
chmod o-w /tmp/perm_test.txt
ls -l /tmp/perm_test.txt | grep -- "-rwxrwxr-x"
```

---

## 4. Execution Bit Enforcement

The Linux kernel strictly enforces the execute (`x`) permission bit on binaries and scripts:

```sh
# 1. Create executable shell script WITHOUT execute bit (mode 0644)
printf '#!/bin/sh\necho "EXEC_SUCCESS"\n' > /tmp/exec_test.sh
chmod 644 /tmp/exec_test.sh

# 2. Attempt direct execution
/tmp/exec_test.sh
# Expected: sh: /tmp/exec_test.sh: Permission denied (Exit code 126)

# 3. Grant execute bit (mode 0755)
chmod 755 /tmp/exec_test.sh

# 4. Attempt direct execution again
/tmp/exec_test.sh
# Output: EXEC_SUCCESS (Exit code 0)
```
- **Finding:** The kernel correctly blocks direct `execve()` syscalls on files lacking the execute bit, returning errno `EACCES` (Permission denied).
- When execute permissions are granted via `chmod +x`, the kernel parses the `#!/bin/sh` shebang and executes the script successfully.

---

## 5. Ownership & Privilege Escalation

### 5.1 Unprivileged Ownership Restrictions
In standard Linux, an unprivileged user (`tc`) cannot reassign file ownership to arbitrary users (`root`) without elevated privileges:
```sh
touch /tmp/ownership_test.txt
chown root:root /tmp/ownership_test.txt
# Output: chown: /tmp/ownership_test.txt: Operation not permitted (Exit code 1)
```

### 5.2 Sudo Privilege Escalation
Tiny Core Linux provides `/usr/bin/sudo` preconfigured for passwordless administrative operations:
```sh
sudo chown root:staff /tmp/ownership_test.txt
ls -l /tmp/ownership_test.txt | grep "root staff"
# Output verified: File successfully transferred to root ownership
```
- **Cleanup:** Unprivileged user `tc` can delete the file from `/tmp` because `/tmp` has write permissions (`rwxrwxrwt`) and standard directory sticky bit semantics apply.
