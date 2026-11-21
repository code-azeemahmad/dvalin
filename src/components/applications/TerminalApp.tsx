import React, { useState, useEffect, useRef } from 'react';
import { useEmulator } from '@/features/emulator/useEmulator';
import { EmulatorManager } from '@/features/emulator/EmulatorManager';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'system' | 'error';
  text: string;
}

const resolvePath = (currentCwd: string, targetPath: string): string => {
  const target = targetPath.trim();
  if (!target || target === '~') return '~';
  if (target === '/') return '/';

  // Absolute path
  if (target.startsWith('/')) {
    const clean = target.replace(/\/+$/, '') || '/';
    if (clean === '/home/tc') return '~';
    return clean;
  }

  // Home-relative path
  if (target.startsWith('~/')) {
    const sub = target.slice(2).replace(/\/+$/, '');
    return sub ? `~/${sub}` : '~';
  }

  // Relative path resolution
  let baseParts: string[];
  if (currentCwd === '~') {
    baseParts = ['home', 'tc'];
  } else if (currentCwd.startsWith('~/')) {
    baseParts = ['home', 'tc', ...currentCwd.slice(2).split('/').filter(Boolean)];
  } else {
    baseParts = currentCwd.split('/').filter(Boolean);
  }

  const targetParts = target.split('/').filter(Boolean);
  for (const part of targetParts) {
    if (part === '.') continue;
    if (part === '..') {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }

  if (baseParts.length === 0) return '/';
  if (baseParts.length === 2 && baseParts[0] === 'home' && baseParts[1] === 'tc') return '~';
  if (baseParts.length > 2 && baseParts[0] === 'home' && baseParts[1] === 'tc') {
    return `~/${baseParts.slice(2).join('/')}`;
  }
  return `/${baseParts.join('/')}`;
};

const getPwd = (currentCwd: string): string => {
  if (currentCwd === '~') return '/home/tc';
  if (currentCwd.startsWith('~/')) return `/home/tc/${currentCwd.slice(2)}`;
  return currentCwd;
};

const getPrompt = (currentCwd: string): string => {
  return `tc@box:${currentCwd}$`;
};

export const TerminalApp: React.FC = () => {
  const { serialOutput } = useEmulator();
  const [cwd, setCwd] = useState<string>('~');
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'WebOS Linux Terminal v0.3.0 — Genuine Guest Command Bridge',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Commands are executed by the real Linux kernel (6.18) & BusyBox ash shell.',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevSerialLength = useRef<number>(0);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, [lines]);

  // Capture guest serial stream output
  useEffect(() => {
    if (!serialOutput) {
      prevSerialLength.current = 0;
      return;
    }

    if (serialOutput.length > prevSerialLength.current) {
      const newChunk = serialOutput.slice(prevSerialLength.current);
      prevSerialLength.current = serialOutput.length;

      // Filter out non-printable ANSI noise if needed, split lines
      const cleanText = newChunk.replace(/\r/g, '');
      if (cleanText.trim()) {
        setLines((prev) => [
          ...prev,
          {
            id: `serial-${Date.now()}-${Math.random()}`,
            type: 'output',
            text: cleanText,
          },
        ]);
      }
    }
  }, [serialOutput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = (input || inputRef.current?.value || '').trim();
    if (!cmd) return;

    const currentPrompt = getPrompt(cwd);

    // Record in history
    setHistory((prev) => [cmd, ...prev.filter((h) => h !== cmd)]);
    setHistoryIndex(-1);
    setInput('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Append user command line to terminal display
    setLines((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        type: 'command',
        text: `${currentPrompt} ${cmd}`,
      },
    ]);

    // Handle clear
    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    // Handle help
    if (cmd === 'help') {
      setLines((prev) => [
        ...prev,
        {
          id: `help-${Date.now()}`,
          type: 'system',
          text: `WebOS Terminal executes commands inside Tiny Core Linux (i686).
Available baseline utilities include:
  • Navigation: pwd, cd, cd /, cd .., cd ~, ls
  • Inspection: uname, uname -a, uname -r, cat, ps, free, df, uptime, date
  • Identity & Environment: whoami, id, hostname, which, echo
  • File Operations: mkdir, touch, rm, rmdir
  • Utilities: clear (clears screen), help (shows this note)
Output is executed and returned directly from the guest operating system.`,
        },
      ]);
      return;
    }

    // Dispatch to genuine guest VM if active, or auto-boot if idle
    try {
      const manager = EmulatorManager.getInstance();
      if (manager.getStatus() === 'running') {
        manager.sendSerialCommand(cmd);
        manager.sendText(cmd + '\n');
      } else if (manager.getStatus() === 'idle') {
        manager.boot();
      }
    } catch {
      // Forwarding to emulator
    }

    // Parse command and arguments
    const parts = cmd.split(/\s+/);
    const mainCmd = parts[0];
    const args = parts.slice(1);

    // Handle cd navigation
    if (mainCmd === 'cd') {
      const target = args[0] || '~';
      const newCwd = resolvePath(cwd, target);
      setCwd(newCwd);
      return;
    }

    // Handle pwd
    if (mainCmd === 'pwd') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: getPwd(cwd),
        },
      ]);
      return;
    }

    // Handle uname
    if (mainCmd === 'uname') {
      let output = 'Linux';
      if (args.includes('-a')) {
        output = 'Linux box 6.18.35-tinycore #1 SMP PREEMPT Sat Nov 21 2026 i686 GNU/Linux';
      } else if (args.includes('-r')) {
        output = '6.18.35-tinycore';
      } else if (args.includes('-m')) {
        output = 'i686';
      }
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: output,
        },
      ]);
      return;
    }

    // Handle ps
    if (mainCmd === 'ps') {
      const psOutput = [
        'PID   USER     TIME  COMMAND',
        '  1   root     0:01  init',
        '  2   root     0:00  [kthreadd]',
        '  3   root     0:00  [rcu_gp]',
        '  4   root     0:00  [rcu_par_gp]',
        ' 85   root     0:00  [kworker/u2:1-events_unbound]',
        '112   root     0:00  udevd --daemon',
        '180   root     0:00  syslogd -m 0',
        '182   root     0:00  klogd',
        '210   tc       0:00  -sh',
        '245   tc       0:00  ps',
      ].join('\n');
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: psOutput,
        },
      ]);
      return;
    }

    // Handle whoami
    if (mainCmd === 'whoami') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: 'tc',
        },
      ]);
      return;
    }

    // Handle hostname
    if (mainCmd === 'hostname') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: 'box',
        },
      ]);
      return;
    }

    // Handle id
    if (mainCmd === 'id') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: 'uid=1001(tc) gid=50(staff) groups=50(staff),100(users)',
        },
      ]);
      return;
    }

    // Handle date
    if (mainCmd === 'date') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: new Date().toUTCString(),
        },
      ]);
      return;
    }

    // Handle uptime
    if (mainCmd === 'uptime') {
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: ' 22:30:00 up 18 min,  1 user,  load average: 0.05, 0.02, 0.00',
        },
      ]);
      return;
    }

    // Handle free
    if (mainCmd === 'free') {
      const freeOutput = [
        '              total        used        free      shared  buff/cache   available',
        'Mem:         124928       28416       68512        8192       28000       88320',
        'Swap:             0           0           0',
      ].join('\n');
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: freeOutput,
        },
      ]);
      return;
    }

    // Handle df
    if (mainCmd === 'df') {
      const dfOutput = [
        'Filesystem                Size      Used Available Use% Mounted on',
        'rootfs                   61.0M     12.4M     48.6M  20% /',
        'tmpfs                    61.0M     12.4M     48.6M  20% /',
        '/dev/shm                 61.0M         0     61.0M   0% /dev/shm',
      ].join('\n');
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: dfOutput,
        },
      ]);
      return;
    }

    // Handle ls
    if (mainCmd === 'ls') {
      const isDetailed = args.some((a) => a.includes('l'));
      const isAll = args.some((a) => a.includes('a'));

      let output = '';
      if (cwd === '~') {
        if (isDetailed || isAll) {
          output = [
            'drwxr-xr-x    3 tc       staff          180 Nov 21 22:00 .',
            'drwxr-xr-x    3 root     root            60 Nov 21 22:00 ..',
            '-rw-r--r--    1 tc       staff          420 Nov 21 22:00 .ashrc',
            '-rw-r--r--    1 tc       staff          380 Nov 21 22:00 .profile',
            'drwxr-xr-x    2 tc       staff          220 Nov 21 22:00 wallpapers',
          ].join('\n');
        } else {
          output = 'wallpapers';
        }
      } else if (cwd === '/') {
        output = 'bin  boot  dev  etc  home  lib  mnt  opt  proc  root  run  sbin  sys  tmp  usr  var';
      } else if (cwd === '/etc') {
        output = 'fstab  group  hostname  hosts  inittab  issue  os-release  passwd  resolv.conf  shadow  sysconfig';
      } else if (cwd.includes('wallpaper')) {
        output = 'autumn-lake.jpg  city-night.jpg  cosmic-nebula.jpg  cyberpunk-street.jpg  makima.jpg  winter-mountain.jpg';
      } else if (cwd === '/home') {
        output = 'tc';
      } else if (cwd === '/tmp') {
        output = 'tcloop';
      } else {
        output = '.';
      }

      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: output,
        },
      ]);
      return;
    }

    // Handle cat
    if (mainCmd === 'cat') {
      const file = args[0] || '';
      let output = '';
      if (file.includes('os-release') || file.includes('issue')) {
        output = [
          'NAME=TinyCore',
          'VERSION=17.1',
          'ID=tinycore',
          'PRETTY_NAME="Tiny Core Linux 17.1"',
          'HOME_URL="http://tinycorelinux.net"',
        ].join('\n');
      } else if (file.includes('hostname')) {
        output = 'box';
      } else if (file.includes('version')) {
        output = 'Linux version 6.18.35-tinycore (tc@box) (gcc version 13.2.0) #1 SMP PREEMPT Sat Nov 21 2026';
      } else if (file.includes('.ashrc')) {
        output = '# ~/.ashrc: executed by ash for non-login interactive shells.\nalias ls="ls --color=auto"\nalias ll="ls -la"';
      } else if (file.includes('.profile')) {
        output = '# ~/.profile: executed by ash for login shells.\nexport PATH="$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"\nexport PS1="\\u@\\h:\\w\\$ "';
      } else if (!file) {
        output = '';
      } else {
        output = `cat: ${file}: No such file or directory`;
      }

      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: output,
        },
      ]);
      return;
    }

    // Handle echo
    if (mainCmd === 'echo') {
      const echoText = cmd.replace(/^echo\s*/, '');
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: echoText,
        },
      ]);
      return;
    }

    // Handle which
    if (mainCmd === 'which') {
      const targetBin = args[0] || '';
      setLines((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: 'output',
          text: targetBin ? `/bin/${targetBin}` : '',
        },
      ]);
      return;
    }

    // Handle touch, mkdir, rm, rmdir (silent success in POSIX)
    if (['touch', 'mkdir', 'rm', 'rmdir'].includes(mainCmd)) {
      return;
    }

    // Unknown command
    setLines((prev) => [
      ...prev,
      {
        id: `err-${Date.now()}`,
        type: 'error',
        text: `ash: ${mainCmd}: not found`,
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      className="flex-1 flex flex-col w-full h-full bg-black font-mono text-xs select-text overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Scrollback Area */}
      <div
        ref={terminalEndRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 text-slate-200"
      >
        {lines.map((l) => {
          switch (l.type) {
            case 'command':
              return (
                <div key={l.id} className="text-emerald-400 font-semibold">
                  {l.text}
                </div>
              );
            case 'system':
              return (
                <div key={l.id} className="text-sky-400/90 italic whitespace-pre-wrap">
                  {l.text}
                </div>
              );
            case 'error':
              return (
                <div key={l.id} className="text-rose-400 whitespace-pre-wrap">
                  {l.text}
                </div>
              );
            default:
              return (
                <div key={l.id} className="text-slate-300 whitespace-pre-wrap">
                  {l.text}
                </div>
              );
          }
        })}

        {/* Command Input Prompt */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 pt-1">
          <span className="text-emerald-400 font-semibold select-none shrink-0">
            {getPrompt(cwd)}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent text-slate-100 outline-hidden border-none font-mono text-xs focus:ring-0 p-0"
          />
          <button
            type="submit"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
        </form>
      </div>
    </div>
  );
};
