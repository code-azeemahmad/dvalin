import React, { useState, useEffect, useRef } from 'react';
import { useEmulator } from '@/features/emulator/useEmulator';
import { EmulatorManager } from '@/features/emulator/EmulatorManager';
import { Terminal as TerminalIcon, Trash2 } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'system' | 'error';
  text: string;
}

export const TerminalApp: React.FC = () => {
  const { status, serialOutput } = useEmulator();
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
    const cmd = input.trim();
    if (!cmd) return;

    // Record in history
    setHistory((prev) => [cmd, ...prev.filter((h) => h !== cmd)]);
    setHistoryIndex(-1);
    setInput('');

    // Append command to display
    setLines((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        type: 'command',
        text: `tc@box:~$ ${cmd}`,
      },
    ]);

    // Handle local helper commands
    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    if (cmd === 'help') {
      setLines((prev) => [
        ...prev,
        {
          id: `help-${Date.now()}`,
          type: 'system',
          text: `WebOS Terminal executes commands inside Tiny Core Linux (i686).
Available baseline utilities include:
  • Navigation: pwd, ls, cd, mkdir, rmdir
  • Inspection: uname -a, cat, head, tail, df, free, ps, top, dmesg
  • Shell: ash, echo, grep, find, which, env, export
  • Utilities: clear (clears terminal buffer), help (shows this note)
Output is returned directly from the guest operating system.`,
        },
      ]);
      return;
    }

    // Verify VM status before forwarding
    if (status !== 'running') {
      setLines((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: 'error',
          text: `Error: Guest Linux system is currently ${status.toUpperCase()}.
Please boot the virtual machine from the Start Menu or Tiny Core Linux Desktop window.`,
        },
      ]);
      return;
    }

    // Send command to guest VM
    try {
      const manager = EmulatorManager.getInstance();
      // Send to serial port
      manager.sendSerialCommand(cmd);
      // Also send to PS/2 keyboard buffer so console reacts
      manager.sendText(cmd + '\n');
    } catch (err: any) {
      setLines((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: 'error',
          text: `Failed to dispatch command to guest: ${err?.message || err}`,
        },
      ]);
    }
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
      {/* Top Terminal Info Bar */}
      <div className="h-7 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0">
        <div className="flex items-center space-x-1.5">
          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>tc@box: ~ (ash shell)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setLines([])}
            title="Clear terminal buffer"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

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
            tc@box:~$
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
