import React from 'react';
import { HelpCircle, X, MousePointer, Cable, Play, Layers, Github } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/60">
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">LogicFlow Quick Guide</h2>
              <p className="text-xs text-slate-400">Controls, wiring & simulation tips</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Cable className="text-emerald-400 shrink-0 mt-0.5" size={18} />
            <div>
              <div className="font-semibold text-slate-200">Connecting Wires</div>
              <p className="text-slate-400 mt-0.5">
                Drag from any output pin (right side) to an input pin (left side), or vice versa. Wires automatically light up green when high (1) with animated current flow.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <MousePointer className="text-sky-400 shrink-0 mt-0.5" size={18} />
            <div>
              <div className="font-semibold text-slate-200">Editing & Moving</div>
              <p className="text-slate-400 mt-0.5">
                Drag any gate to move it. Click a wire to select it and click its red delete button or press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">Delete</kbd>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Play className="text-amber-400 shrink-0 mt-0.5" size={18} />
            <div>
              <div className="font-semibold text-slate-200">Real-Time Simulation & Clock</div>
              <p className="text-slate-400 mt-0.5">
                Simulation runs continuously in real-time. Use the top toolbar to Pause or Step through clock cycles. Click Toggle Switches to flip 0/1, or click Clock settings icon to change its frequency.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <Layers className="text-purple-400 shrink-0 mt-0.5" size={18} />
            <div>
              <div className="font-semibold text-slate-200">Multi-Sheet Projects</div>
              <p className="text-slate-400 mt-0.5">
                Create new sheets with the bottom tabs bar (+ New Sheet). Double click any tab to rename it. All circuit sheets are automatically saved to your browser's <code className="text-sky-300 font-mono">localStorage</code>!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/40">
          <a
            href="https://github.com/ktesla39/LogicFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Github size={14} />
            <span>GitHub Repository (MIT)</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
