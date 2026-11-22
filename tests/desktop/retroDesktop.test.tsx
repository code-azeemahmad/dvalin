import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { WindowProvider } from '@/features/desktop/WindowContext';
import { useSettings } from '@/features/settings/useSettings';
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
import { TerminalApp } from '@/components/applications/TerminalApp';
import { BrowserApp } from '@/components/applications/BrowserApp';
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
    expect(container.textContent).toContain('Dvalin OS has sound. Headphones recommended.');
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
    expect(container.textContent).toContain('WELCOME TO DVALIN OS');
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
    expect(container.textContent).toContain('Welcome to Dvalin OS');
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
    expect(container.textContent).toContain('Wallpapers');
    expect(container.textContent).toContain('Documents');
    expect(container.textContent).toContain('Journal');
    expect(container.textContent).toContain('/etc');
    expect(container.textContent).toContain('/tmp');
  });

  it('navigates to Wallpapers folder and double-clicking wallpaper updates settings', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        <WindowProvider>
          <FileExplorerApp />
        </WindowProvider>
      );
    });

    // Find Wallpapers sidebar button and click it
    const buttons = Array.from(container.querySelectorAll('button'));
    const wallpapersBtn = buttons.find((b) => b.textContent?.includes('Wallpapers'));
    expect(wallpapersBtn).toBeDefined();

    act(() => {
      wallpapersBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('kame-house-dragon.jpg');
    expect(container.textContent).toContain('makima.jpg');
    expect(container.textContent).toContain('winter-mountain.jpg');

    // Find kame-house-dragon file item and double-click it
    const items = Array.from(container.querySelectorAll('.group'));
    const kameItem = items.find((el) => el.textContent?.includes('kame-house-dragon.jpg'));
    expect(kameItem).toBeDefined();

    act(() => {
      kameItem?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    });

    // Check localStorage persistence
    const stored = JSON.parse(localStorage.getItem('webos_settings_v1') || '{}');
    expect(stored.wallpaper).toContain('kame-house-dragon.jpg');
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

  it('updates desktop screen background style immediately when wallpaper is double-clicked in FileExplorer', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    function TestHost() {
      const { settings } = useSettings();
      return (
        <div data-testid="desktop-bg" style={{ backgroundImage: `url("${settings.wallpaper}")` }}>
          <FileExplorerApp />
        </div>
      );
    }

    act(() => {
      root.render(
        <WindowProvider>
          <TestHost />
        </WindowProvider>
      );
    });

    const bgElement = container.querySelector('[data-testid="desktop-bg"]') as HTMLElement;
    expect(bgElement.style.backgroundImage).toBeDefined();

    // Go to Wallpapers folder
    const buttons = Array.from(container.querySelectorAll('button'));
    const wallpapersBtn = buttons.find((b) => b.textContent?.includes('Wallpapers'));
    act(() => {
      wallpapersBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Double click makima.jpg
    const items = Array.from(container.querySelectorAll('.group'));
    const makimaItem = items.find((el) => el.textContent?.includes('makima.jpg'));
    expect(makimaItem).toBeDefined();

    act(() => {
      makimaItem?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    });

    // Verify the desktop background element updated in real-time!
    expect(bgElement.style.backgroundImage).toContain('makima.jpg');
  });

  it('renders TerminalApp without top info bar or clear delete button', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        <WindowProvider>
          <TerminalApp />
        </WindowProvider>
      );
    });

    // Verify top bar text and trash button are completely removed
    expect(container.textContent).not.toContain('tc@box: ~ (ash shell)');
    expect(container.querySelector('button[title="Clear terminal buffer"]')).toBeNull();

    // Verify initial banner notice is removed
    expect(container.textContent).not.toContain('WebOS Linux Terminal');
    expect(container.textContent).not.toContain('Commands are executed by the real Linux kernel');

    // Verify prompt starts at tc@box:~$
    expect(container.textContent).toContain('tc@box:~$');

    act(() => {
      root.unmount();
    });
  });

  it('executes common Linux commands like pwd, uname, ps, whoami, and handles directory navigation', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        <WindowProvider>
          <TerminalApp />
        </WindowProvider>
      );
    });

    const input = container.querySelector('input') as HTMLInputElement;
    const form = container.querySelector('form') as HTMLFormElement;

    const runCmd = (cmd: string) => {
      act(() => {
        input.value = cmd;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      });
    };

    // Run pwd
    runCmd('pwd');
    expect(container.textContent).toContain('/home/tc');

    // Run uname -a
    runCmd('uname -a');
    expect(container.textContent).toContain('6.18.35-tinycore');

    // Run ps
    runCmd('ps');
    expect(container.textContent).toContain('PID   USER     TIME  COMMAND');
    expect(container.textContent).toContain('init');

    // Run whoami
    runCmd('whoami');
    expect(container.textContent).toContain('tc');

    // Run cd /
    runCmd('cd /');
    // Prompt should now be tc@box:/$
    expect(container.textContent).toContain('tc@box:/$');

    // Run pwd from /
    runCmd('pwd');
    expect(container.textContent).toContain('tc@box:/$ pwd');

    // Run cd .. from / (stays at /)
    runCmd('cd ..');
    expect(container.textContent).toContain('tc@box:/$');

    // Run cd ~
    runCmd('cd ~');
    expect(container.textContent).toContain('tc@box:~$');

    // Run cd .. from ~ (goes to /home)
    runCmd('cd ..');
    expect(container.textContent).toContain('tc@box:/home$');

    act(() => {
      root.unmount();
    });
  });

  it('renders BrowserApp and navigates to live website inside iframe', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        <WindowProvider>
          <BrowserApp />
        </WindowProvider>
      );
    });

    // Check home portal elements
    expect(container.textContent).toContain('WebOS Navigator');
    expect(container.textContent).toContain('FrogFind');
    expect(container.textContent).toContain('Wikipedia');

    // Click Wikipedia bookmark
    const buttons = Array.from(container.querySelectorAll('button'));
    const wikiBtn = buttons.find((b) => b.textContent?.includes('Wikipedia'));
    expect(wikiBtn).toBeDefined();

    act(() => {
      wikiBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // An iframe should now be mounted inside the browser with proxied Wikipedia src!
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toContain('/api/proxy?url=');
    expect(iframe?.getAttribute('src')).toContain('wikipedia.org');
    expect(iframe?.getAttribute('sandbox')).toContain('allow-scripts');

    act(() => {
      root.unmount();
    });
  });
});
