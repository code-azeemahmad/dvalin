# System Architecture — WebOS

## 1. Architectural overview
WebOS consists of a browser host application, a v86 emulator and a Linux guest.

```text
User
 |
Browser host
 |-- React + TypeScript UI
 |-- Emulator lifecycle/service layer
 |-- Browser storage adapter
 |-- OS laboratory content
 |
 v86 emulator (WebAssembly)
 |-- Emulated x86 CPU
 |-- Guest RAM
 |-- VGA and input devices
 |-- Virtual disk / configured devices
 |
Linux guest
 |-- Linux kernel
 |-- init and services
 |-- BusyBox / shell
 |-- guest filesystem
 |-- X environment and FLWM (if image supports/configures them)
 |-- guest applications
```

## 2. Responsibility boundaries

| Responsibility | Owner |
|---|---|
| Welcome screen, toolbar, settings, labs | React host |
| Emulator creation and lifecycle | Emulator service using v86 API |
| x86 instruction emulation | v86 |
| Guest process scheduling and execution | Linux kernel |
| Shell command interpretation | Guest shell |
| Guest file operations | Guest utilities, filesystem and kernel |
| Guest GUI rendering | Guest graphical stack, displayed by v86 |
| Keyboard/mouse forwarding | Browser integration and v86 |
| Snapshot creation/restoration | v86 API |
| Snapshot storage | Browser storage adapter |

The frontend must not imitate guest OS functions. Any host-side status display must be clearly distinguished from guest-reported information.

## 3. Boot lifecycle
1. Load host application.
2. Show welcome screen.
3. User requests boot.
4. Validate required BIOS, emulator and guest image assets.
5. Create a single v86 instance.
6. Initialize virtual hardware and load the configured guest.
7. Observe emulator events and guest boot output.
8. Mark guest as ready only after a defined guest-ready signal or a documented manual verification method.
9. Forward input and display guest output.
10. On stop/reset/unmount, perform documented lifecycle cleanup.

The exact ready signal must be chosen during the proof of concept. Do not equate emulator initialization with Linux boot completion.

## 4. Frontend modules
- Welcome/boot screens
- Desktop frame and emulator display
- System toolbar and status indicators
- Emulator manager/service
- Input and display integration
- Persistence manager
- OS laboratory and documentation
- Settings and help

## 5. Emulator service contract
The service should provide a typed, testable interface for:
- initialize/configure
- start or boot
- stop or destroy
- reset
- status and event subscription
- save state
- restore state

Method names and exact signatures must match the selected v86 API version. Do not invent methods; consult upstream TypeScript definitions and examples.

## 6. State model
Suggested host UI states:
- `idle`
- `initializing`
- `booting`
- `running`
- `saving`
- `restoring`
- `stopping`
- `stopped`
- `error`

Define valid transitions and prevent conflicting actions (for example, starting while an instance is already booting).

## 7. Data flow
User input is captured by the browser integration and delivered to the emulated guest input device. The guest terminal receives input, the shell interprets commands, guest utilities run, and the Linux kernel performs the corresponding operations. The resulting guest display is rendered through v86.

## 8. Deployment architecture
Initial deployment is a static HTTPS website. No application backend is required for the initial single-user, client-side VM. A backend/relay may be considered only for a specific later requirement such as shared cloud storage or a network proxy.

## 9. Architecture constraints
- v86 supports 32-bit Linux; upstream compatibility documentation says 64-bit kernels are not supported.
- v86 supports a 9p filesystem via virtio, but configuration and guest mounting must be tested.
- Snapshot persistence and persistent file storage are distinct requirements.
- Guest networking is optional and deferred.
- One emulator instance per active WebOS session.

## 10. Architecture validation
The first architecture gate is a local v86 boot test using the chosen Tiny Core candidate. Record image checksum, v86 version/commit, BIOS assets, configuration, browser, boot outcome and any required adjustments.
