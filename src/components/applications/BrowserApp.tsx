import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Globe,
  ExternalLink,
  ShieldCheck,
  Search,
  BookOpen,
  Newspaper,
  Terminal,
  CloudSun,
} from 'lucide-react';

interface QuickTile {
  name: string;
  url: string;
  icon: string;
  desc: string;
}

const QUICK_TILES: QuickTile[] = [
  {
    name: 'DuckDuckGo Search',
    url: 'https://html.duckduckgo.com/html/?q=',
    icon: '🔍',
    desc: 'Live privacy search engine returning instant web results',
  },
  {
    name: 'FrogFind Web Search',
    url: 'https://frogfind.com/',
    icon: '🐸',
    desc: 'Lightweight web search built specifically for retro and embedded browsers',
  },
  {
    name: 'Wikipedia',
    url: 'https://en.m.wikipedia.org/',
    icon: '📖',
    desc: 'The free encyclopedia with millions of articles',
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/',
    icon: '📰',
    desc: 'Tech, programming, and computer science discussions',
  },
  {
    name: 'Tiny Core Linux',
    url: 'http://tinycorelinux.net/',
    icon: '🐧',
    desc: 'Official home of the lightweight x86 guest operating system',
  },
  {
    name: 'Live Weather',
    url: 'https://wttr.in/',
    icon: '🌦️',
    desc: 'Real-time terminal-style worldwide weather forecast',
  },
  {
    name: 'Wiby Classic Web',
    url: 'https://wiby.org/',
    icon: '🌐',
    desc: 'Search engine for the classic, lightweight, indie web',
  },
];

export const BrowserApp: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('dvalin://welcome');
  const [inputUrl, setInputUrl] = useState<string>('dvalin://welcome');
  const [history, setHistory] = useState<string[]>(['dvalin://welcome']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [useProxy, setUseProxy] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for navigation messages from the proxied iframe
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === 'WEBOS_NAVIGATE' && typeof e.data.url === 'string') {
        const newUrl = e.data.url;
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), newUrl]);
        setHistoryIndex((prev) => prev + 1);
        setCurrentUrl(newUrl);
        setInputUrl(newUrl);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [historyIndex]);

  const formatUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return 'dvalin://welcome';
    if (trimmed.startsWith('dvalin://') || trimmed.startsWith('about:')) {
      return trimmed;
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    // Check if it looks like a domain name (e.g. wikipedia.org, github.com, news.ycombinator.com)
    if (trimmed.includes('.') && !trimmed.includes(' ')) {
      return `https://${trimmed}`;
    }
    // Otherwise treat as search query on DuckDuckGo HTML
    return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`;
  };

  const navigateTo = (url: string) => {
    const target = formatUrl(url);
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

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(inputUrl);
  };

  const isInternal = currentUrl.startsWith('dvalin://') || currentUrl === 'about:blank';
  const iframeSrc = useProxy ? `/api/proxy?url=${encodeURIComponent(currentUrl)}` : currentUrl;

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Address & Controls Toolbar */}
      <div className="h-10 px-3 bg-slate-950 border-b border-slate-800 flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleBack}
            disabled={historyIndex === 0}
            title="Go Back"
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            title="Go Forward"
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReload}
            title="Reload Page"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigateTo('dvalin://welcome')}
            title="Browser Home"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL Input Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex items-center px-2 py-1 bg-slate-900 border border-slate-700 focus-within:border-sky-500 rounded text-xs transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400 mr-2 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter web address or search query..."
            className="w-full bg-transparent outline-none text-slate-200 font-mono text-xs select-text"
          />
        </form>

        <div className="flex items-center space-x-1">
          {/* Toggle Proxy Bypass */}
          <button
            type="button"
            onClick={() => setUseProxy(!useProxy)}
            title={useProxy ? "Proxy active: frame blocks bypassed (Click to toggle direct)" : "Direct mode (Click to enable proxy)"}
            className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center space-x-1 cursor-pointer transition-colors ${
              useProxy
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Proxy</span>
          </button>

          {!isInternal && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open current page in new tab"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-300 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="h-7 px-3 bg-slate-950/70 border-b border-slate-800 flex items-center space-x-3 text-[11px] font-mono text-slate-400 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => navigateTo('dvalin://welcome')}
          className="hover:text-white cursor-pointer hover:underline shrink-0"
        >
          Home Portal
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => navigateTo('https://html.duckduckgo.com/html/?q=')}
          className="hover:text-white cursor-pointer hover:underline flex items-center space-x-1 shrink-0"
        >
          <Search className="w-2.5 h-2.5 text-amber-400" />
          <span>DuckDuckGo</span>
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => navigateTo('https://frogfind.com/')}
          className="hover:text-white cursor-pointer hover:underline flex items-center space-x-1 shrink-0"
        >
          <span>🐸 FrogFind</span>
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => navigateTo('https://en.m.wikipedia.org/')}
          className="hover:text-white cursor-pointer hover:underline flex items-center space-x-1 shrink-0"
        >
          <BookOpen className="w-2.5 h-2.5" />
          <span>Wikipedia</span>
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => navigateTo('https://news.ycombinator.com/')}
          className="hover:text-white cursor-pointer hover:underline flex items-center space-x-1 shrink-0"
        >
          <Newspaper className="w-2.5 h-2.5" />
          <span>Hacker News</span>
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => navigateTo('http://tinycorelinux.net/')}
          className="hover:text-white cursor-pointer hover:underline flex items-center space-x-1 shrink-0"
        >
          <Terminal className="w-2.5 h-2.5" />
          <span>Tiny Core</span>
        </button>
        <span className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => navigateTo('https://wttr.in/')}
          className="hover:text-white cursor-pointer hover:underline flex items-center space-x-1 shrink-0"
        >
          <CloudSun className="w-2.5 h-2.5" />
          <span>Weather</span>
        </button>
      </div>

      {/* Main Viewport: Live Web Surfing iframe or Home Portal */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-950">
        {isInternal ? (
          <div className="w-full h-full overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header Banner */}
              <div className="text-center py-4">
                <div className="inline-flex p-3 bg-sky-500/10 rounded-2xl mb-3 border border-sky-500/20">
                  <Globe className="w-8 h-8 text-sky-400" />
                </div>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  WebOS Navigator
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Surf websites and search the live internet directly inside WebOS without connection errors.
                </p>
              </div>

              {/* In-Page Quick Search Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputUrl && inputUrl !== 'dvalin://welcome') {
                    navigateTo(inputUrl);
                  }
                }}
                className="flex items-center px-4 py-2.5 bg-slate-900 border border-slate-700 focus-within:border-sky-500 rounded-xl shadow-lg transition-colors"
              >
                <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search the web (e.g. linux commands, tech news)..."
                  value={inputUrl === 'dvalin://welcome' ? '' : inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-100 text-xs font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shrink-0 ml-2"
                >
                  Search
                </button>
              </form>

              {/* Quick Launch Website Tiles */}
              <div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Featured Web Destinations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {QUICK_TILES.map((tile) => (
                    <button
                      key={tile.name}
                      type="button"
                      onClick={() => navigateTo(tile.url)}
                      className="flex flex-col text-left p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center space-x-2.5 mb-1.5">
                        <span className="text-lg">{tile.icon}</span>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                          {tile.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {tile.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Emulation Details */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>CORS & Frame-Blocking Bypass Enabled</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  WebOS routes external websites through a built-in proxy bridge that strips <code className="text-sky-400">X-Frame-Options</code> and <code className="text-sky-400">Content-Security-Policy: frame-ancestors</code>. This ensures search engines and modern web pages load directly within the window without "refused to connect" errors.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <iframe
              key={`${currentUrl}-${reloadKey}-${useProxy}`}
              ref={iframeRef}
              src={iframeSrc}
              title="Web Browser Viewport"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
              allow="fullscreen; clipboard-read; clipboard-write"
            />
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 px-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <span className="truncate max-w-xs">{currentUrl}</span>
        <span className="flex items-center space-x-2">
          {useProxy && <span className="text-emerald-400">Proxy Shield Active</span>}
          <span>Sandboxed HTML5 Navigator</span>
        </span>
      </div>
    </div>
  );
};
