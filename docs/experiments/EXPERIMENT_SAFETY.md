# OS Experiments Safety, Security & Isolation Rules

## 1. Safety Architecture Overview

The WebOS OS Lab executes real Linux commands on an x86 emulator running in the user's browser. Although v86 runs in a WebAssembly sandbox isolated from the host OS, guest commands can potentially disrupt the running Linux virtual machine (causing kernel panics, system lockups, or data corruption).

To guarantee stability, safety, and repeatable experiments, the **`ExperimentSafety`** engine enforces three layers of isolation:

```
[User Command in Lab UI]
            │
            ▼
[Layer 1: Static Rule Validation]  ──(Destructive Pattern Detected)──► [REJECT: Safe Error Displayed]
            │
            ▼ (Permitted)
[Layer 2: Workspace Directory Confinement] (/tmp/webos-experiments/<expId>/)
            │
            ▼
[Layer 3: Execution Wrapping & Marker Protocol] (Exit code & stderr capture)
            │
            ▼
[Guest Shell Execution in v86]
```

---

## 2. Command Validation & Blocked Operations

`ExperimentSafety.validateCommand(command)` inspects commands against strict regex patterns. Any attempt to execute the following classes of operations is rejected before execution:

| Operation Pattern | Description | Rationale |
|---|---|---|
| `rm\s+-r[fF]\s+/` | Recursive deletion of root `/` | Destroys the guest root filesystem, bricking the VM. |
| `mkfs`, `fdisk`, `cfdisk` | Filesystem creation / partition table manipulation | Causes catastrophic data loss on mounted disks. |
| `dd\s+if=.*of=/dev/[hs]d` | Raw block overwrites to guest disk devices | Overwrites boot sectors or partition superblocks. |
| `:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:` | Fork bomb | Starves kernel process table, freezing the emulator. |
| `reboot`, `poweroff`, `halt`, `shutdown` | System halt or power commands | Terminates the guest operating system unannounced. |
| `> /dev/kmem`, `> /dev/mem` | Direct physical memory writes | Causes immediate CPU page fault / kernel crash. |
| `chmod\s+-R\s+000\s+/` | Stripping permissions across `/` | Breaks system dynamic linker and basic utilities. |

---

## 3. Workspace Directory Isolation

All experiments that create, modify, or delete files are strictly confined to their dedicated workspace directory:
```
/tmp/webos-experiments/<experiment_id>/
```

### Safety Rules:
1. **Per-Experiment Isolation**: Each experiment operates exclusively within `/tmp/webos-experiments/<sanitized_id>/`.
2. **Path Sanitization**: Experiment IDs are strictly sanitized using `replace(/[^a-zA-Z0-9]/g, '_')` to prevent path traversal (`../`) or shell injection.
3. **Automatic Provisioning**: The workspace directory is ensured with `mkdir -p "${workspace}"` prior to step execution.
4. **Scoped Cleanup**: Upon experiment reset or lab exit, `ExperimentSafety.getCleanupCommand(expId)` removes only `/tmp/webos-experiments/<sanitized_id>/`, never touching parent directories.

---

## 4. Delimited Marker Execution Protocol

To capture precise command output, exit codes, and error messages without relying on fragile heuristic delays or serial polling loops, `ExperimentSafety.wrapCommandForExecution()` constructs a wrapped execution string:

```bash
mkdir -p "/tmp/webos-experiments/<expId>" && cd "/tmp/webos-experiments/<expId>" && echo "___START_<stepId>___" && (<command>) 2>&1; __CODE=$?; echo "___END_<stepId>___:$__CODE"
```

### Protocol Mechanics:
1. `echo "___START_<stepId>___"`: Signals the start of actual command output, allowing the runner to discard any previous prompt echoes.
2. `(<command>) 2>&1`: Runs the command in an isolated subshell, combining stdout and stderr so syntax errors and kernel messages are accurately presented to the learner.
3. `__CODE=$?`: Captures the numeric exit status immediately upon subshell completion.
4. `echo "___END_<stepId>___:$__CODE"`: Emits a guaranteed delimiter containing the step exit code.

---

## 5. Educational Sandboxing Guarantees

1. **Host Safety**: Guest commands have zero access to the user's host filesystem, host operating system, local network, or host browser storage.
2. **Deterministic Lab State**: Experiments can be reset to their initial state at any time via the "Reset Experiment" button, which executes the cleanup sequence and clears saved step progress.
3. **No Phantom Progress**: Steps only succeed when validation rules (exit code, required tokens, regex patterns) are strictly satisfied on actual guest output.
