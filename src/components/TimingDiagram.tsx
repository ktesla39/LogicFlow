import React from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

export interface SignalHistory {
  id?: string;
  name: string;
  color: string;
  history: boolean[]; // Array of boolean states (up to 36 samples)
}

interface TimingDiagramProps {
  signals: SignalHistory[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export const TimingDiagram: React.FC<TimingDiagramProps> = ({
  signals,
  isOpen,
  onToggle,
  onClear,
}) => {
  const SAMPLES_COUNT = 32;

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md transition-all select-none z-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80">
        <div
          className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white"
          onClick={onToggle}
        >
          <Activity size={15} className="text-emerald-400" />
          <span className="text-xs font-semibold">Signal Waveforms</span>
          <span className="text-[10px] font-mono text-slate-500">
            ({signals.length} monitored signals)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && signals.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] text-slate-400 hover:text-rose-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
            >
              Clear Buffer
            </button>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="p-1 text-slate-400 hover:text-slate-200 rounded"
          >
            {isOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded Waveform Tracks */}
      {isOpen && (
        <div className="p-3 max-h-48 overflow-y-auto space-y-2.5 font-mono text-xs">
          {signals.length === 0 ? (
            <div className="text-center py-3 text-slate-500 text-xs">
              Connect components to see live logic waveforms as the circuit runs.
            </div>
          ) : (
            signals.map((sig, idx) => {
              // Ensure we display up to SAMPLES_COUNT samples
              const padded = sig.history.slice(-SAMPLES_COUNT);
              while (padded.length < SAMPLES_COUNT) {
                padded.unshift(false);
              }

              // Compute SVG path for digital square wave
              const stepWidth = 14;
              const highY = 4;
              const lowY = 22;
              let pathD = '';

              padded.forEach((val, pIdx) => {
                const x1 = pIdx * stepWidth;
                const x2 = (pIdx + 1) * stepWidth;
                const y = val ? highY : lowY;

                if (pIdx === 0) {
                  pathD += `M ${x1} ${y} L ${x2} ${y}`;
                } else {
                  const prevVal = padded[pIdx - 1];
                  if (prevVal !== val) {
                    // Vertical transition edge
                    pathD += ` L ${x1} ${y} L ${x2} ${y}`;
                  } else {
                    pathD += ` L ${x2} ${y}`;
                  }
                }
              });

              const currentVal = padded[padded.length - 1];

              return (
                <div key={sig.id || `sig_${sig.name}_${idx}`} className="flex items-center gap-3">
                  <div className="w-28 truncate shrink-0 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300 truncate" title={sig.name}>
                      {sig.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1 rounded ${
                        currentVal ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {currentVal ? '1' : '0'}
                    </span>
                  </div>

                  {/* SVG Waveform track */}
                  <div className="flex-1 overflow-x-hidden bg-slate-900/60 rounded border border-slate-800 p-1">
                    <svg
                      width={SAMPLES_COUNT * stepWidth}
                      height="26"
                      className="overflow-visible"
                    >
                      {/* Grid guideline for low */}
                      <line
                        x1="0"
                        y1={lowY}
                        x2={SAMPLES_COUNT * stepWidth}
                        y2={lowY}
                        stroke="#334155"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                      {/* Waveform line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={sig.color || (currentVal ? '#10b981' : '#38bdf8')}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
