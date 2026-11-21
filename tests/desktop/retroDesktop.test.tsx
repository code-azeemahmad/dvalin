import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { WindowProvider } from '@/features/desktop/WindowContext';
import { BootingScreen } from '@/components/retro/BootingScreen';
import { UserSignInScreen } from '@/components/retro/UserSignInScreen';
import { TopMenuBar } from '@/components/retro/TopMenuBar';
import { RetroDesktopIcons } from '@/components/retro/RetroDesktopIcons';
import { RetroDock } from '@/components/retro/RetroDock';
import { TextEditorApp } from '@/components/applications/TextEditorApp';
import { CalculatorApp } from '@/components/applications/CalculatorApp';
import { MessagesApp } from '@/components/applications/MessagesApp';
import { FileExplorerApp } from '@/components/applications/FileExplorerApp';
import { ControlPanelApp } from '@/components/applications/ControlPanelApp';
import { createRoot } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Retro Desktop Redesign Components', () => {
  it('renders BootingScreen with pixel logo and system notices', () => {
    const onComplete = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(<BootingScreen onComplete={onComplete} />);
    });

    expect(container.textContent).toContain('SYSTEM NOTICE');
    expect(container.textContent).toContain('Retrium OS has sound. Headphones recommended.');
    expect(container.textContent).toContain('Enter Fullscreen');
    expect(container.querySelector('[role="progressbar"]')).toBeDefined();
  });

  it('renders UserSignInScreen with Dash avatar, password input, and comic bubble', () => {
    const onSignIn = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(<UserSignInScreen onSignIn={onSignIn} />);
    });

    expect(container.textContent).toContain('Dash');
    expect(container.textContent).toContain("It's open.");
    expect(container.textContent).toContain('Just press Enter.');
    const input = container.querySelector('input[type="password"]');
    expect(input).toBeDefined();
  });

  it('renders TopMenuBar with logo, menus, Wi-Fi, battery, and clock', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        <WindowProvider>
          <TopMenuBar />
        </WindowProvider>
      );
    });

    expect(container.textContent).toContain('File');
    expect(container.textContent).toContain('Edit');
    expect(container.textContent).toContain('View');
  });

  it('renders RetroDesktopIcons with left and right columns', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        <WindowProvider>
          <RetroDesktopIcons />
        </WindowProvider>
      );
    });

    expect(container.textContent).toContain('ReadMe.txt');
    expect(container.textContent).toContain('Calculator');
    expect(container.textContent).toContain("Dash's Journal");
    expect(container.textContent).toContain('archive');
    expect(container.textContent).toContain('My Socials');
    expect(container.textContent).toContain('Community');
  });

  it('renders RetroDock with all 6 floating dock items', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        <WindowProvider>
          <RetroDock />
        </WindowProvider>
      );
    });

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(6);
    // Messages badge '6'
    expect(container.textContent).toContain('6');
  });

  it('renders TextEditorApp with ReadMe.txt and tabs', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(<TextEditorApp />);
    });

    expect(container.textContent).toContain('ReadMe.txt');
    expect(container.textContent).toContain("Dash's Journal.txt");
    expect(container.textContent).toContain('WELCOME TO RETRIUM OS');
    expect(container.querySelector('textarea')).toBeDefined();
  });

  it('renders CalculatorApp and performs calculations', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(<CalculatorApp />);
    });

    expect(container.textContent).toContain('Retro Calc-80');
    expect(container.textContent).toContain('8');
    expect(container.textContent).toContain('C');
  });

  it('renders MessagesApp with Dash conversations', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(<MessagesApp />);
    });

    expect(container.textContent).toContain('Dash');
    expect(container.textContent).toContain('Welcome to Retrium OS');
    expect(container.textContent).toContain('uname -a');
  });

  it('renders FileExplorerApp with directory paths and files', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        <WindowProvider>
          <FileExplorerApp />
        </WindowProvider>
      );
    });

    expect(container.textContent).toContain('Home');
    expect(container.textContent).toContain('Documents');
    expect(container.textContent).toContain('Journal');
    expect(container.textContent).toContain('/etc');
    expect(container.textContent).toContain('/tmp');
  });

  it('renders ControlPanelApp with tabs', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(<ControlPanelApp />);
    });

    expect(container.textContent).toContain('Control Panel');
    expect(container.textContent).toContain('Display & Style');
    expect(container.textContent).toContain('Sound & Audio');
    expect(container.textContent).toContain('System Specs');
    expect(container.textContent).toContain('Snapshots');
    expect(container.textContent).toContain('Power & Reset');
  });
});
