import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [clearOnNext, setClearOnNext] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const inputDigit = (digit: string) => {
    if (clearOnNext || display === '0') {
      setDisplay(digit);
      setClearOnNext(false);
    } else {
      if (display.length < 12) {
        setDisplay(display + digit);
      }
    }
  };

  const inputDecimal = () => {
    if (clearOnNext) {
      setDisplay('0.');
      setClearOnNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setClearOnNext(false);
  };

  const handleOperation = (nextOp: string) => {
    const current = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(current);
    } else if (operation) {
      const result = calculate(prevValue, current, operation);
      setDisplay(String(result));
      setPrevValue(result);
      setHistory((prev) => [`${prevValue} ${operation} ${current} = ${result}`, ...prev.slice(0, 15)]);
    }

    setOperation(nextOp);
    setClearOnNext(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
      case '*':
        return a * b;
      case '÷':
      case '/':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    if (prevValue === null || !operation) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operation);
    setHistory((prev) => [`${prevValue} ${operation} ${current} = ${result}`, ...prev.slice(0, 15)]);
    setDisplay(String(result));
    setPrevValue(null);
    setOperation(null);
    setClearOnNext(true);
  };

  const handleToggleSign = () => {
    const current = parseFloat(display);
    setDisplay(String(-current));
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay(String(current / 100));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        handleOperation('+');
      } else if (e.key === '-') {
        handleOperation('-');
      } else if (e.key === '*') {
        handleOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 select-none p-4 font-mono justify-between">
      {/* Top Bar with History Toggle */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-bold text-slate-300">Retro Calc-80</span>
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center space-x-1 hover:text-white cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span className="text-[10px]">{showHistory ? 'Hide' : 'Log'}</span>
        </button>
      </div>

      {/* LCD Display */}
      <div className="bg-emerald-950/80 border-2 border-emerald-800/80 rounded-lg p-3 text-right shadow-inner mb-3">
        <div className="text-[10px] text-emerald-400 h-4">
          {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
        </div>
        <div className="text-2xl font-bold text-emerald-300 tracking-wider overflow-hidden truncate">
          {display}
        </div>
      </div>

      {/* History Drawer or Keypad */}
      {showHistory ? (
        <div className="flex-1 bg-slate-950 rounded-lg p-2 overflow-y-auto text-xs text-slate-300 flex flex-col space-y-1 mb-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tape History</div>
          {history.map((h, i) => (
            <div key={i} className="text-right font-mono py-0.5 border-b border-slate-800 text-emerald-400">
              {h}
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center text-slate-600 text-xs py-8 italic">No calculations yet</div>
          )}
        </div>
      ) : (
        /* Keypad Grid */
        <div className="grid grid-cols-4 gap-2 flex-1">
          <button
            type="button"
            onClick={handleClear}
            className="p-3 bg-red-800/80 hover:bg-red-700 active:bg-red-900 text-white rounded-lg font-bold text-sm shadow cursor-pointer transition-colors"
          >
            C
          </button>
          <button
            type="button"
            onClick={handleToggleSign}
            className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 rounded-lg font-bold text-sm shadow cursor-pointer transition-colors"
          >
            ±
          </button>
          <button
            type="button"
            onClick={handlePercent}
            className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 rounded-lg font-bold text-sm shadow cursor-pointer transition-colors"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleOperation('÷')}
            className="p-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg font-bold text-sm shadow cursor-pointer transition-colors"
          >
            ÷
          </button>

          <button
            type="button"
            onClick={() => inputDigit('7')}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => inputDigit('8')}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => inputDigit('9')}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleOperation('×')}
            className="p-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg font-bold text-sm shadow cursor-pointer transition-colors"
          >
            ×
          </button>

          <button
            type="button"
            onClick={() => inputDigit('4')}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => inputDigit('5')}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => inputDigit('6')}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleOperation('-')}
            className="p-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg font-bold text-sm shadow cursor-pointer transition-colors"
          >
            -
          </button>

          <button
            type="button"
            onClick={() => inputDigit('1')}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => inputDigit('2')}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => inputDigit('3')}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleOperation('+')}
            className="p-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg font-bold text-sm shadow cursor-pointer transition-colors"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => inputDigit('0')}
            className="col-span-2 p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            0
          </button>
          <button
            type="button"
            onClick={inputDecimal}
            className="p-3 bg-slate-700/80 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            .
          </button>
          <button
            type="button"
            onClick={handleEquals}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg font-bold text-base shadow cursor-pointer transition-colors"
          >
            =
          </button>
        </div>
      )}
    </div>
  );
};
