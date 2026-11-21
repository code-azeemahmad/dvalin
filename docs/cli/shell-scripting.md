# Tiny Core Linux 17.1 — Shell Scripting Standards & Architecture

**Date:** 2026-11-21  
**Status:** Implemented & Verified in Guest  
**Shell Environment:** BusyBox `ash` (Almquist Shell), strictly POSIX-compliant  
**Binary Path:** `/bin/ash` (symlinked as `/bin/sh`)

---

## 1. Shell Architecture & Capabilities

Tiny Core Linux 17.1 executes all shell scripts and interactive login sessions under BusyBox **`ash` (Almquist Shell)**. Unlike GNU Bash, `ash` is lightweight (~110 KB compiled memory footprint) and strictly implements the IEEE Std 1003.1 (POSIX) shell specification.

```
+--------------------------------------------------------------------------+
| Tiny Core Linux Shell Environment                                        |
|                                                                          |
|  /bin/sh -> /bin/busybox (applet: ash)                                   |
|                                                                          |
|  Supported Language Constructs:                                          |
|   ├── Parameter Expansion (${VAR:-default}, ${#VAR})                     |
|   ├── POSIX Arithmetic ($(( a + b * c )))                               |
|   ├── Command Substitution ($(uname -r) or `date`)                       |
|   ├── Control Structures (if/then/elif/else, case/in/esac)               |
|   ├── Iteration Loops (for in ..., while [ ... ], until [ ... ])         |
|   ├── Modular Functions (func_name() { ... return $code; })             |
|   ├── Positional Argument Handling ($0, $1..$N, $#, $@, shift)           |
|   └── Signal Traps (trap 'handler' EXIT INT TERM)                        |
+--------------------------------------------------------------------------+
```

---

## 2. Incompatible Bashisms & Constraints

To ensure all scripts execute reliably without syntax errors under `ash`, scripts must avoid non-POSIX Bash features:

| Bash Feature | Supported in `ash`? | Portable POSIX / `ash` Alternative |
|---|---|---|
| Arrays `arr=(a b c)` | **No** | Use whitespace-separated lists and `for item in $list; do ...` |
| `function name { ... }` | **No** | Use standard POSIX function declaration: `name() { ... }` |
| Process substitution `<(cmd)` | **No** | Use named pipes (`mkfifo`) or temporary files in `/tmp` |
| Regex match `[[ $str =~ re ]]` | **No** | Use `expr "$str" : "$re"` or pipe to `grep -E` |
| Substring replacement `${v/a/b}` | **No** | Use `echo "$v" | sed 's/a/b/'` or `cut`/`awk` |
| `echo -e` ANSI colors | Varies | Use `printf "\033[32m%s\033[0m\n" "text"` |
| `source file.sh` | Partial | Use standard dot operator: `. file.sh` |

---

## 3. Modular Guest Script Suite

All scripts reside in `guest/scripts/` and have been verified directly in the guest environment:

### 3.1 Filesystem Scripts (`guest/scripts/filesystem/`)
- **`file-operations.sh`**: Directory nesting, creation, content writing, appending, copying, moving, renaming, line counting, and cleanup.
- **`tree.sh`**: Pure POSIX directory tree visualizer using `find` and `sed`.

### 3.2 Process Management Scripts (`guest/scripts/process/`)
- **`process-lifecycle.sh`**: Process creation, background spawning with `&`, `/proc` status inspection, signal delivery (`kill -15`), wait status evaluation, and reaping verification.

### 3.3 Permissions Scripts (`guest/scripts/permissions/`)
- **`permission-demo.sh`**: File mode manipulation with `chmod`, kernel execution bit enforcement (blocking execution when `+x` is absent and allowing when granted), and ownership testing.

### 3.4 Core Scripting Demos (`guest/scripts/scripting/`)
- **`variables.sh`**: Variable assignment, default expansion (`${VAR:-default}`), string length (`${#VAR}`), and command substitution.
- **`conditions.sh`**: File/directory tests (`-d`, `-f`, `-e`), integer comparisons (`-gt`, `-lt`, `-eq`), string equality (`=`), and `case/esac` architecture branching.
- **`loops.sh`**: `for-in` list iteration, `while` numeric loops, and `seq` step generation.
- **`functions.sh`**: Pure arithmetic functions, argument parsing, local scope, and boolean exit code returns.
- **`arguments.sh`**: Positional arguments `$1..$N`, argument count `$#`, and argument array traversal.
- **`traps.sh`**: Safe resource cleanup using `trap <handler> EXIT INT TERM`.
