# UI/UX Design Specification — WebOS

## Design goal
Present WebOS as a clear, approachable educational operating-system lab. The guest Linux desktop remains the primary experience; host UI should frame and control it without pretending to be the guest OS.

## Main screens

### 1. Welcome screen
Display:
- WebOS name and version.
- Short explanation that a real Linux guest will run in the browser.
- Guest profile and known limitations.
- Start Linux action.
- Browser/system requirements.
- Link to project information and lab guide.

### 2. Boot screen
Display:
- Booting status and elapsed time where available.
- Actual guest boot output if safely exposed through v86.
- Clear error and retry actions.
- Do not fabricate progress percentages or kernel messages.

### 3. Linux desktop screen
Display:
- Actual v86 guest display.
- Host toolbar for start/stop/reset/save/restore/fullscreen as supported.
- Emulator state indicator distinct from guest-reported metrics.
- A clear keyboard/mouse capture and release affordance.

### 4. OS laboratory
Display:
- Experiment title, learning objective, prerequisites and steps.
- Commands the learner should type into the guest.
- Expected observations, not fake command output.
- Reset/cleanup instructions where needed.

## Interaction principles
- Do not steal keyboard shortcuts unexpectedly.
- Explain how to release input capture.
- Confirm destructive host-side actions such as deleting saved snapshots.
- Make boot failure, storage quota failure and restore failure understandable.
- Provide responsive host controls, but prioritize desktop browsers for the emulator.

## Visual system
The exact palette, typography, spacing scale, icon library and component tokens are not specified in the source plan. Choose them during implementation and document the final tokens here. Do not invent an existing brand system.

## Accessibility
- Semantic buttons and headings.
- Visible keyboard focus.
- Accessible labels for icon-only controls.
- Sufficient contrast.
- Status updates announced appropriately.
- Do not rely on colour alone for VM state.

## Important distinction
The WebOS host shell is not the Linux desktop. The guest desktop must be rendered from the actual emulator output.
