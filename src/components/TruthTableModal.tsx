import React, { useState } from 'react';
import { CircuitNode, Wire } from '../types';
import { generateTruthTable } from '../utils/circuitSolver';
import { X, Copy, Check, Table } from 'lucide-react';

interface TruthTableModalProps {
  nodes: CircuitNode[];
  wires: Wire[];
  isOpen: boolean;
  onClose: () => void;
  onApplyRowInputs?: (inputs: Record<string, boolean>) => void;
}

export const TruthTableModal: React.FC<TruthTableModalProps> = ({
  nodes,
  wires,
  isOpen,
  onClose,
  onApplyRowInputs,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { inputNames, outputNames, entries } = generateTruthTable(nodes, wires);

  const copyToClipboard = () => {
    if (entries.length === 0) return;

    // Build markdown table
    const headers = [...inputNames, ...outputNames].join(' | ');
    const divider = [...inputNames, ...outputNames].map(() => '---').join(' | ');
    const rows = entries.map((e) => {
      const inVals = inputNames.map((n) => (e.inputs[n] ? '1' : '0')).join(' | ');
      const outVals = outputNames.map((n) => (e.outputs[n] ? '1' : '0')).join(' | ');
      return `${inVals} | ${outVals}`;
    });

    const markdown = `| ${headers} |\n| ${divider} |\n${rows.map((r) => `| ${r} |`).join('\n')}`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/60">
              <Table size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Circuit Truth Table</h2>
              <p className="text-xs text-slate-400">
                Automated combinatorial analysis of active inputs and outputs
              </p>
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
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin">
          {entries.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm font-medium text-slate-300">
                No interactive inputs or outputs found on this sheet.
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Add at least one Toggle Switch or Push Button, and at least one LED, Probe, or Buzzer connected through gates to view the truth table.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                <span>
                  Showing {entries.length} states ({inputNames.length} inputs, {outputNames.length} outputs)
                </span>
                <span className="text-[11px] text-sky-400">
                  Tip: Click any row to test that state on the live canvas
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                <table className="w-full text-center text-xs">
                  <thead className="bg-slate-950/80 text-slate-300 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-800 text-slate-500">#</th>
                      {inputNames.map((name, i) => (
                        <th key={`th_in_${name}_${i}`} className="py-2.5 px-3 border-r border-slate-800 text-sky-400 font-semibold">
                          {name}
                        </th>
                      ))}
                      {outputNames.map((name, i) => (
                        <th key={`th_out_${name}_${i}`} className="py-2.5 px-3 border-r last:border-r-0 border-slate-800 text-emerald-400 font-semibold">
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {entries.map((row, idx) => (
                      <tr
                        key={`row_${idx}`}
                        onClick={() => onApplyRowInputs?.(row.inputs)}
                        className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                      >
                        <td className="py-2 px-3 border-r border-slate-800 text-slate-500 text-[10px]">
                          {idx}
                        </td>
                        {inputNames.map((name, inIdx) => {
                          const val = row.inputs[name];
                          return (
                            <td
                              key={`td_in_${idx}_${inIdx}`}
                              className={`py-2 px-3 border-r border-slate-800 font-bold ${
                                val ? 'text-sky-400 bg-sky-950/20' : 'text-slate-500'
                              }`}
                            >
                              {val ? '1' : '0'}
                            </td>
                          );
                        })}
                        {outputNames.map((name, outIdx) => {
                          const val = row.outputs[name];
                          return (
                            <td
                              key={`td_out_${idx}_${outIdx}`}
                              className={`py-2 px-3 border-r last:border-r-0 border-slate-800 font-bold ${
                                val ? 'text-emerald-400 bg-emerald-950/25' : 'text-slate-500'
                              }`}
                            >
                              {val ? '1' : '0'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors disabled:opacity-40"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied Markdown' : 'Copy Table'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
