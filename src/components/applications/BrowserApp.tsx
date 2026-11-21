import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

interface Bookmark {
  title: string;
  url: string;
  content: string;
}

const BOOKMARKS: Record<string, Bookmark> = {
  'retrium://welcome': {
    title: 'Welcome to Retrium OS',
    url: 'retrium://welcome',
    content: `
# Welcome to Retrium OS Web Portal

Retrium OS provides an authentic x86 PC emulation layer in the browser powered by v86 and Tiny Core Linux 17.1.

### Features:
- **Zero Simulation:** Commands are executed inside a genuine Linux kernel (6.18) with BusyBox userland.
- **WASM Acceleration:** Emulation runs at near-native x86 bytecode interpretation in WebAssembly.
- **Hardware Profile:** 128MB RAM, SeaBIOS, VGA BIOS with 1024x768 framebuffer.
- **Desktop Shell:** Clean retro aesthetic inspired by classic operating systems.

Use the bottom dock or desktop icons to open apps!
`,
  },
  'retrium://tinycore': {
    title: 'Tiny Core Linux 17.1 Reference',
    url: 'retrium://tinycore',
    content: `
# Tiny Core Linux 17.1 (i686)

Tiny Core Linux is a minimalist Linux operating system focusing on providing a base system using Linux kernel, Busybox, and FLTK GUI.

### Essential Commands:
- \`uname -a\` : Kernel and CPU architecture details
- \`version\` : Tiny Core Linux release version
- \`df -h\` : Mounted filesystem statistics
- \`free -m\` : System RAM and buffer metrics
- \`tce-status\` : Active extension package list
- \`ps aux\` : Process table
`,
  },
  'retrium://experiments': {
    title: 'OS Laboratory & Kernel Notes',
    url: 'retrium://experiments',
    content: `
# Operating Systems Laboratory

Understanding Linux guest internals:
1. **/proc filesystem**: A virtual pseudo-filesystem created on-the-fly by the Linux kernel to expose process and runtime statistics.
2. **/sys (sysfs)**: Unified kernel device tree.
3. **Interrupts & Timers**: Managed through the emulated 8259 PIC and 8254 PIT.
4. **Memory Management**: Paging and translation lookaside buffer (TLB) emulated in WebAssembly.
`,
  },
};

export const BrowserApp: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('retrium://welcome');
  const [inputUrl, setInputUrl] = useState<string>('retrium://welcome');
  const [history, setHistory] = useState<string[]>(['retrium://welcome']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const navigateTo = (url: string) => {
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('retrium://')) {
      target = `https://duckduckgo.com/?q=${encodeURIComponent(target)}`;
    }
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(target);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
    setCurrentUrl(target);
    setInputUrl(target);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(inputUrl);
  };

  const isInternal = currentUrl.startsWith('retrium://');
  const currentBookmark = isInternal ? BOOKMARKS[currentUrl] : null;

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Address Toolbar */}
      <div className="h-10 px-3 bg-slate-950 border-b border-slate-800 flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigateTo(currentUrl)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigateTo('retrium://welcome')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs">
          <Globe className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-transparent outline-none text-slate-200 font-mono text-xs select-text"
          />
        </form>

        <div className="flex items-center space-x-1">
          <span title="Sandbox Protected" className="p-1 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="h-7 px-3 bg-slate-950/70 border-b border-slate-800 flex items-center space-x-3 text-[11px] font-mono text-slate-400 shrink-0">
        <button
          type="button"
          onClick={() => navigateTo('retrium://welcome')}
          className="hover:text-white cursor-pointer hover:underline"
        >
          Retrium Home
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => navigateTo('retrium://tinycore')}
          className="hover:text-white cursor-pointer hover:underline"
        >
          Tiny Core Linux
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => navigateTo('retrium://experiments')}
          className="hover:text-white cursor-pointer hover:underline"
        >
          OS Lab
        </button>
      </div>

      {/* Page Content Viewport */}
      <div className="flex-1 bg-slate-950 overflow-y-auto p-6 font-sans">
        {currentBookmark ? (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl leading-relaxed">
            <h1 className="text-xl font-bold text-sky-400 mb-4 border-b border-slate-800 pb-2">
              {currentBookmark.title}
            </h1>
            <div className="prose prose-invert text-xs space-y-3 font-mono text-slate-300 whitespace-pre-line select-text">
              {currentBookmark.content}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-slate-900 rounded-xl border border-slate-800">
            <Globe className="w-12 h-12 text-sky-400 mb-3 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-200 mb-1">External Web Destination</h2>
            <p className="text-xs text-slate-400 max-w-md mb-4 font-mono truncate">
              {currentUrl}
            </p>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-semibold text-white shadow-md transition-colors"
            >
              <span>Open in New Browser Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 px-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <span>WebOS Sandboxed Navigator</span>
        <span>Status: 200 OK</span>
      </div>
    </div>
  );
};
