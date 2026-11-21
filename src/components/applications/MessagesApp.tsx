import React, { useState } from 'react';
import { Send, Circle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'Dash' | 'You' | 'System';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'Dash',
    text: 'Hey Dash! Welcome to Retrium OS.',
    time: '20:00',
  },
  {
    id: 'm2',
    sender: 'Dash',
    text: 'Everything in this system is powered by a genuine 32-bit x86 Linux machine running right in your browser via WebAssembly (v86).',
    time: '20:01',
  },
  {
    id: 'm3',
    sender: 'Dash',
    text: 'You can open the Terminal (>_) from the dock to run real Linux commands like `uname -a`, `ls -la`, `cat /proc/cpuinfo`, and `top`.',
    time: '20:02',
  },
  {
    id: 'm4',
    sender: 'Dash',
    text: "Double-click ReadMe.txt or Dash's Journal on your desktop to edit, save, or write new notes.",
    time: '20:03',
  },
  {
    id: 'm5',
    sender: 'Dash',
    text: 'Use the Control Panel to customize your wallpaper, test VM snapshots, or configure display scaling.',
    time: '20:04',
  },
  {
    id: 'm6',
    sender: 'Dash',
    text: "Enjoy your session! Send a message below if you want to chat or have questions about the system.",
    time: '20:05',
  },
];

export const MessagesApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Auto-reply
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'Dash',
        text: `Got your message: "${text}". The guest Linux kernel is running smoothly at 100% health! Try running \`cat /proc/uptime\` in the Terminal!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1000);
  };

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {/* Sidebar: Contacts */}
      <div className="w-48 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="h-10 px-3 border-b border-slate-800 flex items-center font-bold text-xs text-slate-300">
          Chats
        </div>
        <div className="p-2 flex flex-col space-y-1">
          <div className="p-2 rounded-lg bg-slate-800 flex items-center space-x-2.5 cursor-pointer">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xs">
                D
              </div>
              <Circle className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="flex-1 truncate">
              <div className="font-semibold text-xs text-white">Dash</div>
              <div className="text-[10px] text-slate-400 truncate">Online · Retrium OS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {/* Header */}
        <div className="h-10 px-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-200">Dash</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
              Active Now
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Retrium Core v1.0</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'You' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div className="text-[10px] text-slate-400 mb-0.5 font-mono px-1">
                {msg.sender} · {msg.time}
              </div>
              <div
                className={`p-2.5 rounded-xl text-xs leading-relaxed shadow-md ${
                  msg.sender === 'You'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 outline-none focus:border-sky-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 rounded-lg text-white cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
