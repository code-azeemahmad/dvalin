# OS Experiments & Lab Architecture

## 1. Architectural Mission & Philosophy

The WebOS OS Lab provides an interactive, hands-on systems programming and operating systems laboratory running directly in the browser. Unlike conventional browser-based learning environments that mock shell environments with static JSON lookups or hardcoded JavaScript string switches, WebOS executes real operating system commands inside a genuine x86 Linux kernel (Linux 6.18.35-tinycore running BusyBox v1.36.1 on v86).

Where browser sandbox boundaries prevent raw hardware access (such as CPU hardware ring transitions or physical page tables in WASM memory), the OS Lab clearly delineates between:
1. **`real-guest`**: Live execution inside the Tiny Core Linux virtual machine.
2. **`educational-simulation`**: Interactive theoretical diagrams modeling concepts such as multi-level paging and scheduling queues.
3. **`hybrid`**: Real Linux commands paired with pedagogical visualizers and interactive knowledge-check quizzes.

```
+-----------------------------------------------------------------------------------+
|                                WebOS Host Desktop                                 |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                       OS Lab Window (ExperimentsApp)                        |  |
|  |  +--------------------+  +-----------------------------------------------+  |  |
|  |  | ExperimentCatalog  |  | ExperimentDetail                              |  |  |
|  |  | - 20 Labs          |  | - Step Runner & Status Badges                 |  |  |
|  |  | - 7 Categories     |  | - Live Output Terminal Panel                  |  |  |
|  |  | - Search & Filters |  | - Interactive Knowledge Check Quiz            |  |  |
|  |  +--------------------+  +-----------------------------------------------+  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  | ResourceMonitorView (Guest Linux Metrics vs Host Browser Metrics)     |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  +---------------------------------------+-------------------------------------+  |
|                                          | (Hook / Services)                      |
|                                          v                                        |
|                     +---------------------------------------+                     |
|                     |           ExperimentRunner            |                     |
|                     | - Workspace Isolation                 |                     |
|                     | - Command Safety Validation           |                     |
|                     | - Delimited Marker Protocol           |                     |
|                     +-------------------+-------------------+                     |
+-----------------------------------------|-----------------------------------------+
                                          |
                              (Serial & Command Dispatch)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         v86 Virtual Machine (WebAssembly)                         |
|  +-----------------------------------------------------------------------------+  |
|  | Linux Guest Kernel 6.18.35-tinycore (i686)                                  |  |
|  | BusyBox v1.36.1 Shell (ash)                                                 |  |
|  | Isolated Workspace: /tmp/webos-experiments/<expId>/                         |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Subsystems

### 2.1 ExperimentRegistry (`ExperimentRegistry.ts`)
The central registry maintains the immutable definitions of all 20 experiments across 7 core operating system categories:
- Processes (`processes`)
- Memory Management (`memory`)
- Filesystem & Metadata (`filesystem`)
- Security & Permissions (`permissions`)
- Shell & Scripting (`shell`)
- Kernel & Subsystems (`kernel`)
- Hardware & Devices (`devices`)

The registry validates all definitions upon registration, ensuring each step contains non-empty commands, explanations, and unambiguous validation rules.

### 2.2 ExperimentSafety (`ExperimentSafety.ts`)
Before any command reaches the emulator dispatch queue, it is validated against strict safety constraints:
- **Workspace Confinement**: All file creation, editing, and execution is strictly confined to `/tmp/webos-experiments/<expId>/`.
- **Destructive Command Blocking**: Prohibits `rm -rf /`, raw disk formatting (`mkfs`, `fdisk`, `dd if=/dev/zero of=/dev/sd*`), fork bombs (`:(){ :|:& };:`), reboot/poweroff commands, and root privilege escalation attempts.
- **Marker Wrapping**: Safely wraps commands with execution wrappers that capture exit codes and standard error:
  ```bash
  mkdir -p "${workspace}" && cd "${workspace}" && echo "___START_${stepId}___" && (${command}) 2>&1; __CODE=$?; echo "___END_${stepId}___:$__CODE"
  ```

### 2.3 ExperimentRunner (`ExperimentRunner.ts`)
The execution engine communicates with `EmulatorManager`:
1. Sends the wrapped command string over the guest serial/keyboard interface.
2. Intercepts serial stream chunks, buffering output until the unique terminating marker `___END_<stepId>___:<codeNum>` is encountered.
3. Evaluates output against the step's `validationRules`:
   - `exitCode`: Exact exit code matching (typically `0`).
   - `contains`: Required output substring presence.
   - `not-contains`: Absence of error strings.
   - `regex`: Pattern matching on guest standard output.
4. Triggers progress persistence via `ExperimentProgressService`.

### 2.4 ExperimentProgressService (`ExperimentProgressService.ts`)
User lab progress, completed step indices, quiz question answers, and completion timestamps are persisted locally in `localStorage` under key `webos_experiment_progress_v1`. Progress survives page reloads, browser restarts, and VM state reinstantiation.

### 2.5 ResourceMonitoringService (`ResourceMonitoringService.ts`)
Provides real-time bounded telemetry (default sampling period 3000ms):
- **Guest Operating System Telemetry**: Directly queries `/proc/uptime`, `/proc/meminfo` (`MemTotal`, `MemFree`), `/proc/version`, and process counts from the active Linux kernel.
- **Host Browser Telemetry**: Measures JavaScript heap consumption via `performance.memory` and display framebuffer canvas dimensions.
- **Strict Boundary Separation**: Host browser heap metrics and guest kernel RAM are strictly separated and badged to prevent confusing host memory with guest physical memory.
