# Architecture Decision Records

Record decisions that materially affect architecture. Add newest decisions at the top. Use Proposed, Accepted, Superseded or Rejected status.

## ADR-001: Run a real Linux guest in the browser
- **Status:** Proposed
- **Decision:** Use v86 to emulate a PC and run a Linux guest in the browser.
- **Context:** The project must demonstrate genuine OS behaviour rather than a simulated terminal.
- **Consequences:** Guest image compatibility, emulator lifecycle, input/display integration and asset delivery are critical.

## ADR-002: Select Tiny Core Linux x86 TinyCore as initial guest candidate
- **Status:** Proposed; compatibility unverified
- **Decision:** Start with Tiny Core Linux x86 TinyCore, candidate version 17.1.
- **Context:** A lightweight CLI + graphical desktop guest is desirable.
- **Consequences:** Must verify boot compatibility with v86, guest utilities, GUI and RAM requirements before committing to the image.

## ADR-003: Use React + TypeScript + Vite for host UI
- **Status:** Proposed
- **Decision:** Use React and TypeScript with Vite.
- **Context:** The project needs a modular browser interface around the emulator.
- **Consequences:** React must not implement guest OS functions.

## ADR-004: Keep initial deployment client-side
- **Status:** Proposed
- **Decision:** Host as a static HTTPS application; no backend for initial release.
- **Context:** v86 runs in the browser and initial features are local to the user's session.
- **Consequences:** Persistence is browser-local; guest networking and cloud sync are deferred.

## ADR template
### ADR-NNN: Title
- **Status:** Proposed / Accepted / Superseded / Rejected
- **Date:** YYYY-MM-DD
- **Context:**
- **Decision:**
- **Alternatives considered:**
- **Consequences:**
- **Evidence / references:**
