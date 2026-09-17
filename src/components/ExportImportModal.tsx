import React, { useState } from 'react';
import { Sheet } from '../types';
import { Download, Upload, Copy, Check, X, RefreshCw } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  sheets: Sheet[];
  activeSheetId: string;
  onClose: () => void;
  onImportSheets: (imported: Sheet[]) => void;
  onResetToDefaults: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  sheets,
  activeSheetId,
  onClose,
  onImportSheets,
  onResetToDefaults,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const currentSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  const exportCurrentSheet = () => {
    const data = JSON.stringify([currentSheet], null, 2);
    setJsonText(data);
    setStatusMsg({ type: 'success', text: `Loaded "${currentSheet.name}" JSON below` });
  };

  const exportAllSheets = () => {
    const data = JSON.stringify(sheets, null, 2);
    setJsonText(data);
    setStatusMsg({ type: 'success', text: `Loaded all ${sheets.length} sheets JSON below` });
  };

  const copyJson = () => {
    if (!jsonText) exportAllSheets();
    const textToCopy = jsonText || JSON.stringify(sheets, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const textToSave = jsonText || JSON.stringify(sheets, null, 2);
    const blob = new Blob([textToSave], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logicflow-circuits-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setJsonText(content);
      tryImport(content);
    };
    reader.readAsText(file);
  };

  const tryImport = (rawText?: string) => {
    const toParse = rawText || jsonText;
    try {
      const parsed = JSON.parse(toParse);
      let importedSheets: Sheet[] = [];

      if (Array.isArray(parsed)) {
        importedSheets = parsed;
      } else if (parsed && typeof parsed === 'object' && parsed.nodes) {
        importedSheets = [parsed];
      } else {
        throw new Error('Invalid format: expected sheet object or array of sheets');
      }

      onImportSheets(importedSheets);
      setStatusMsg({ type: 'success', text: `Successfully imported ${importedSheets.length} sheet(s)!` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Failed to import JSON: ${err.message || 'Syntax error'}` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/60">
              <Download size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Export & Import Circuits</h2>
              <p className="text-xs text-slate-400">Save circuit data to file or restore from JSON</p>
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

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {statusMsg && (
            <div
              className={`p-2.5 rounded-lg border text-xs font-medium ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-700 text-rose-300'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={exportCurrentSheet}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-center"
            >
              Current Sheet
            </button>
            <button
              type="button"
              onClick={exportAllSheets}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-center"
            >
              All Sheets
            </button>
            <button
              type="button"
              onClick={downloadFile}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1.5"
            >
              <Download size={13} />
              Download
            </button>
            <label className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload size={13} />
              Upload File
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* JSON Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 font-medium">Circuit JSON Data:</span>
              <button
                type="button"
                onClick={copyJson}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste LogicFlow JSON here to import, or click 'All Sheets' to export..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-sky-500 scrollbar-thin"
            />
          </div>

          {/* Reset to Default Presets */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Restore factory circuit examples?</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all sheets to default circuit presets?')) {
                  onResetToDefaults();
                  onClose();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:border-rose-700 hover:text-rose-300 border border-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              Reset Examples
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => tryImport()}
            disabled={!jsonText.trim()}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-xs font-semibold text-white shadow transition-colors"
          >
            Import JSON
          </button>
        </div>
      </div>
    </div>
  );
};
