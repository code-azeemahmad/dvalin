import React, { useState } from 'react';
import { Save, Plus, FileText, Check, Copy } from 'lucide-react';

interface FileDoc {
  id: string;
  title: string;
  content: string;
  isModified?: boolean;
}

const DEFAULT_DOCS: FileDoc[] = [
  {
    id: 'readme',
    title: 'ReadMe.txt',
    content: `===================================================================
                       WELCOME TO RETRIUM OS
===================================================================

Retrium OS is a modern web-based desktop environment hosting a 
GENUINE 32-bit x86 Linux operating system running right in your
browser via WebAssembly and v86 emulation!

KEY CAPABILITIES & ARCHITECTURE:
--------------------------------
1. REAL LINUX KERNEL:
   - Operating System: Tiny Core Linux 17.1 (i686)
   - Linux Kernel: 6.18.35-tinycore
   - Hardware: Emulated x86 PC with 128MB RAM, SeaBIOS, VGA BIOS
   - Shell: BusyBox Ash Shell with standard GNU/Linux toolchain

2. TERMINAL (Bottom Dock '>_'):
   - Execute real Linux commands directly in the guest!
   - Try running:
       * uname -a          (View Linux kernel build details)
       * ls -la /          (Inspect the root filesystem)
       * cat /proc/cpuinfo (View emulated x86 CPU details)
       * free -m           (Inspect system memory usage)
       * ps                (View active guest processes)
       * top               (Interactive process monitor)

3. FILE EXPLORER (Vintage PC icon):
   - Browse virtual guest directories and storage files.

4. CALCULATOR (Desktop icon):
   - Retro pixel calculator with complete arithmetic operations.

5. MESSAGES (Bottom Dock icon with red badge):
   - 6 new incoming messages from Dash and system daemons.

6. CONTROL PANEL:
   - Customize wallpaper, sound, display scale, and system snapshots.

Enjoy exploring Retrium OS!
`,
  },
  {
    id: 'journal',
    title: "Dash's Journal.txt",
    content: `===================================================================
                     DASH'S PERSONAL JOURNAL
===================================================================

[Day 1 - The Spark]
Today I set out to build Retrium OS. Most web desktops are just fake
React mockups that echo static strings. I wanted something real—a true
x86 machine booting genuine Linux in the browser. 

[Day 5 - The Kernel Boots]
SeaBIOS fired up, VGA BIOS initialized, and then... "Linux version 6.18"!
Seeing Tiny Core Linux take over the virtual hardware was magical.
The ash shell works, /proc is populated, and memory is managed by the
real kernel.

[Day 12 - Pixel Sunset]
I designed the desktop interface with a retro pixel sunset backdrop.
The warm oranges and purples remind me of classic operating systems from
the late 90s, but with modern smoothness.

[Day 20 - Release]
Everything is connected: real Linux commands in the Terminal, file
management, retro calculator, messaging, and snapshot persistence.
If you're reading this, welcome to the machine!

- Dash
`,
  },
];

export const TextEditorApp: React.FC = () => {
  const [docs, setDocs] = useState<FileDoc[]>(DEFAULT_DOCS);
  const [activeDocId, setActiveDocId] = useState<string>('readme');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const activeDoc = docs.find((d) => d.id === activeDocId) || docs[0];

  const handleContentChange = (newContent: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, content: newContent, isModified: true } : d))
    );
  };

  const handleNewDoc = () => {
    const newId = `doc-${Date.now()}`;
    const newDoc: FileDoc = {
      id: newId,
      title: `Untitled-${docs.length + 1}.txt`,
      content: '',
      isModified: true,
    };
    setDocs((prev) => [...prev, newDoc]);
    setActiveDocId(newId);
  };

  const handleSave = () => {
    setDocs((prev) =>
      prev.map((d) => (d.id === activeDocId ? { ...d, isModified: false } : d))
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeDoc.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = activeDoc.content.split('\n').length;
  const wordCount = activeDoc.content.trim() ? activeDoc.content.trim().split(/\s+/).length : 0;
  const charCount = activeDoc.content.length;

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Tab Bar */}
      <div className="h-9 px-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {docs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setActiveDocId(doc.id)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-t-md text-xs font-mono transition-colors cursor-pointer ${
                activeDocId === doc.id
                  ? 'bg-slate-800 text-sky-400 font-bold border-t-2 border-sky-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{doc.title}</span>
              {doc.isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          ))}
          <button
            type="button"
            onClick={handleNewDoc}
            title="New Document"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Text to Clipboard"
            className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            title="Save Document"
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium cursor-pointer transition-colors"
          >
            {saved ? <Check className="w-3 h-3 text-white" /> : <Save className="w-3 h-3" />}
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="w-12 py-3 bg-slate-900 border-r border-slate-800 text-right pr-2 text-slate-600 select-none overflow-hidden shrink-0">
          {Array.from({ length: Math.max(lineCount, 25) }, (_, i) => (
            <div key={i + 1} className="leading-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={activeDoc.content}
          onChange={(e) => handleContentChange(e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-slate-200 outline-none resize-none leading-5 font-mono select-text"
          placeholder="Start typing your document..."
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 px-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center space-x-3">
          <span>UTF-8</span>
          <span>Plain Text</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>{lineCount} lines</span>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>
    </div>
  );
};
