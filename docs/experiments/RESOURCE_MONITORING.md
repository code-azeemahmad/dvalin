# Real-Time OS Resource Monitoring Architecture

## 1. Overview & Pedagogical Objective

A central challenge in web-hosted operating system emulators is distinguishing between **host browser execution metrics** (JavaScript engine heap, DOM repaint rates, browser tab memory) and **guest operating system kernel metrics** (x86 CPU instruction counters, kernel page allocations, process counts).

In WebOS Phase 7, the **`ResourceMonitoringService`** provides real-time telemetry that enforces strict boundary separation between host and guest.

---

## 2. Telemetry Architecture

```
                                  ResourceMonitoringService
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             [Guest Linux Kernel]                         [Host Web Application]
            (via EmulatorManager)                      (via Browser APIs & DOM)
                       │                                           │
       ├── /proc/uptime (Guest Uptime)             ├── performance.memory (JS Heap)
       ├── /proc/meminfo (Total & Free RAM)        ├── Canvas Dimensions (VGA Res)
       ├── /proc/version (Kernel Release)          └── 3000ms Bounded Polling Loop
       └── ps | wc -l (Active Processes)
```

---

## 3. Metric Taxonomy & Sources

### 3.1 Guest Operating System Metrics (`source: 'guest-linux'`)

| Metric | Source | Description | Precision / Unit |
|---|---|---|---|
| `uptimeSeconds` | `/proc/uptime` | Seconds elapsed since SeaBIOS kernel bootstrap | Integer (seconds) |
| `memTotalKb` | `/proc/meminfo` (`MemTotal`) | Total physical RAM allocated to x86 guest (v86 config) | Kilobytes (128 MB default) |
| `memFreeKb` | `/proc/meminfo` (`MemFree`) | Physical RAM pages unallocated in guest Linux memory | Kilobytes |
| `processCount` | `ps` output lines | Total processes currently running in guest Linux user space | Integer count |
| `kernelRelease` | `uname -r` / `/proc/version` | Compiled Linux kernel release string | `6.18.35-tinycore` |
| `cpuModel` | `/proc/cpuinfo` (`model name`) | Emulated x86 CPU core model reported by v86 | String (`QEMU Virtual CPU`) |

### 3.2 Host Browser Application Metrics (`source: 'host-browser'`)

| Metric | Source | Description | Precision / Unit |
|---|---|---|---|
| `jsHeapUsedMb` | `window.performance.memory.usedJSHeapSize` | Memory allocated by V8 for React components and state | Megabytes (or `0` if restricted) |
| `jsHeapTotalMb` | `window.performance.memory.totalJSHeapSize` | Total V8 memory heap pool allocated to the browser tab | Megabytes |
| `screenResolution` | `#v86-screen-container canvas` | Physical pixel dimensions of emulated VGA framebuffer | e.g. `1024x768` |
| `displayScale` | `window.devicePixelRatio` | Browser window pixel density ratio | Floating point (e.g. `1.0`, `2.0`) |
| `pollingIntervalMs`| Internal service configuration | Telemetry collection rate | 3000 ms (bounded) |

---

## 4. Rate Limiting & Performance Considerations

1. **Bounded 3000ms Sampling Rate**: To guarantee zero UI lag and prevent serial port contention while a user is typing in `terminal` or `os-lab`, telemetry queries are dispatched at a conservative 3-second interval.
2. **Idle State Handling**: When the emulator is stopped or uninitialized, guest polling is automatically bypassed and placeholder telemetry is emitted with clear status indicators.
3. **Pause / Resume Controls**: Users can pause the telemetry stream at any time using the "Pause Telemetry" toggle button in the Resource Monitor tab.
4. **Listener Cleanups**: All subscribers register via standard unsubscribe functions, preventing memory leaks when windows are closed or unmounted.
