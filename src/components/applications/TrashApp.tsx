import React, { useState } from 'react';
import { Trash2, RotateCcw, FileText, Check } from 'lucide-react';

interface TrashItem {
  id: string;
  name: string;
  originalPath: string;
  size: string;
  deletedAt: string;
}

const INITIAL_TRASH_ITEMS: TrashItem[] = [
  {
    id: 't1',
    name: 'old_draft.txt',
    originalPath: '/home/tc/Documents/old_draft.txt',
    size: '340 B',
    deletedAt: 'Nov 20 14:10',
  },
  {
    id: 't2',
    name: 'temp_scratch.log',
    originalPath: '/tmp/temp_scratch.log',
    size: '1.2 KB',
    deletedAt: 'Nov 21 16:30',
  },
];

export const TrashApp: React.FC = () => {
  const [items, setItems] = useState<TrashItem[]>(INITIAL_TRASH_ITEMS);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmptyTrash = () => {
    setItems([]);
    setMessage('Trash emptied successfully.');
    setTimeout(() => setMessage(null), 2500);
  };

  const handleRestoreAll = () => {
    setItems([]);
    setMessage('All items restored to original paths.');
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-10 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-xs">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span className="font-semibold text-slate-200">Recycle Bin</span>
          <span className="text-[10px] text-slate-500 font-mono">({items.length} items)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRestoreAll}
            disabled={items.length === 0}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-sky-400" />
            <span>Restore All</span>
          </button>
          <button
            type="button"
            onClick={handleEmptyTrash}
            disabled={items.length === 0}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-medium cursor-pointer transition-colors"
          >
            <Trash2 className="w-3 h-3 text-white" />
            <span>Empty Trash</span>
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {message && (
        <div className="h-8 px-3 bg-emerald-950/80 border-b border-emerald-800/80 flex items-center text-xs text-emerald-400 space-x-1.5 animate-in fade-in duration-200">
          <Check className="w-3.5 h-3.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Table View */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-900">
        {items.length > 0 ? (
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                <th className="pb-2 font-semibold">Name</th>
                <th className="pb-2 font-semibold">Original Location</th>
                <th className="pb-2 font-semibold">Size</th>
                <th className="pb-2 font-semibold">Date Deleted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50">
                  <td className="py-2.5 flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-200">{item.name}</span>
                  </td>
                  <td className="py-2.5 text-slate-400 text-[11px]">{item.originalPath}</td>
                  <td className="py-2.5 text-slate-400">{item.size}</td>
                  <td className="py-2.5 text-slate-500 text-[11px]">{item.deletedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
            <Trash2 className="w-12 h-12 text-slate-700" />
            <p className="text-xs">Trash is empty</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 px-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <span>Ready</span>
        <span>Space used: {items.reduce((acc, curr) => acc + (curr.size.includes('KB') ? 1.2 : 0.3), 0).toFixed(1)} KB</span>
      </div>
    </div>
  );
};
