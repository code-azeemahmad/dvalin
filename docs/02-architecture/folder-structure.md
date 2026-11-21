# Application Folder Structure — WebOS

This is a proposed source layout, not a claim that these directories already exist. Adapt it to the actual repository rather than forcing a refactor.

```text
webos/
├── public/
│   ├── assets/
│   │   ├── bios/
│   │   ├── linux/
│   │   └── icons/
│   └── images/
├── src/
│   ├── components/
│   │   ├── WelcomeScreen/
│   │   ├── BootScreen/
│   │   ├── DesktopFrame/
│   │   ├── EmulatorDisplay/
│   │   ├── SystemToolbar/
│   │   └── StatusBar/
│   ├── features/
│   │   ├── emulator/
│   │   ├── persistence/
│   │   ├── labs/
│   │   └── documentation/
│   ├── hooks/
│   ├── services/
│   ├── pages/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── docs/
├── project-management/
├── .agents/
├── AGENTS.md
├── GEMINI.md
├── CLAUDE.md
├── README.md
└── package.json
```

## Module responsibilities
- `components/`: reusable host UI components.
- `features/emulator/`: v86 configuration, lifecycle, event types and integration.
- `features/persistence/`: snapshot and file persistence flows.
- `features/labs/`: experiment metadata and UI instructions.
- `features/documentation/`: OS concept and command reference content.
- `hooks/`: React hooks that adapt services to UI.
- `services/`: browser storage and other host-side adapters.
- `pages/`: top-level screens.
- `tests/`: unit, integration and browser tests.

Keep large BIOS and guest image assets out of Git unless repository size, licensing and distribution rights have been reviewed. Prefer documented download/build steps and checksums.
