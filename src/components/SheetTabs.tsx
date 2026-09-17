import React, { useState } from 'react';
import { Sheet } from '../types';
import { Plus, Copy, Trash2, Edit2, Layers, Check, X } from 'lucide-react';

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onCreateSheet: () => void;
  onRenameSheet: (id: string, newName: string) => void;
  onDuplicateSheet: (id: string) => void;
  onDeleteSheet: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onCreateSheet,
  onRenameSheet,
  onDuplicateSheet,
  onDeleteSheet,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (sheet: Sheet) => {
    setEditingId(sheet.id);
    setEditName(sheet.name);
  };

  const saveRename = () => {
    if (editingId && editName.trim()) {
      onRenameSheet(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  return (
    <div
      id="sheet-tabs-bar"
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs overflow-x-auto select-none scrollbar-thin z-20 border-t transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/90 border-slate-300'
      }`}
    >
      {/* Sheets Icon / Label */}
      <div className="flex items-center gap-1.5 mr-2 font-medium shrink-0">
        <Layers size={14} className={isDark ? 'text-sky-400' : 'text-sky-600'} />
        <span
          className={`hidden sm:inline text-[11px] font-semibold uppercase tracking-wider ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          Sheets
        </span>
      </div>

      {/* Tabs Container */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
        {sheets.map((sheet) => {
          const isActive = sheet.id === activeSheetId;
          const isEditing = editingId === sheet.id;

          if (isEditing) {
            return (
              <div
                key={sheet.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border shadow-sm shrink-0 ${
                  isDark ? 'bg-slate-800 border-sky-500' : 'bg-white border-sky-500'
                }`}
              >
                <input
                  type="text"
                  value={editName}
                  autoFocus
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename();
                    if (e.key === 'Escape') cancelRename();
                  }}
                  className={`px-1.5 py-0.5 text-xs rounded outline-none w-28 border ${
                    isDark
                      ? 'bg-slate-950 text-slate-100 border-slate-700'
                      : 'bg-slate-50 text-slate-900 border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={saveRename}
                  className="p-1 text-emerald-500 hover:text-emerald-400"
                >
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  onClick={cancelRename}
                  className="p-1 text-rose-500 hover:text-rose-400"
                >
                  <X size={12} />
                </button>
              </div>
            );
          }

          return (
            <div
              key={sheet.id}
              onClick={() => onSelectSheet(sheet.id)}
              onDoubleClick={() => startRename(sheet)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-t border-x cursor-pointer transition-all shrink-0 ${
                isActive
                  ? isDark
                    ? 'bg-slate-950 border-slate-700 text-sky-400 font-semibold shadow-sm'
                    : 'bg-white border-slate-300 text-sky-600 font-semibold shadow-xs'
                  : isDark
                  ? 'bg-slate-900/70 border-transparent hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  : 'bg-slate-200/50 border-transparent hover:bg-slate-300/80 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="truncate max-w-[130px]">{sheet.name}</span>

              {/* Node count pill */}
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? isDark
                      ? 'bg-sky-950 text-sky-300 border border-sky-800'
                      : 'bg-sky-100 text-sky-700 border border-sky-300'
                    : isDark
                    ? 'bg-slate-800 text-slate-500'
                    : 'bg-slate-300/80 text-slate-600'
                }`}
              >
                {sheet.nodes.length}
              </span>

              {/* Action tools on active sheet */}
              {isActive && (
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(sheet);
                    }}
                    className={`p-0.5 rounded transition-colors ${
                      isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                    title="Rename sheet"
                  >
                    <Edit2 size={11} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSheet(sheet.id);
                    }}
                    className={`p-0.5 rounded transition-colors ${
                      isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                    title="Duplicate sheet"
                  >
                    <Copy size={11} />
                  </button>

                  {sheets.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSheet(sheet.id);
                      }}
                      className={`p-0.5 rounded transition-colors ${
                        isDark
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                      title="Delete sheet"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Sheet Button */}
      <button
        type="button"
        id="btn-create-sheet"
        onClick={onCreateSheet}
        className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-colors shrink-0 ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/80'
            : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-300 shadow-2xs'
        }`}
        title="Add new circuit sheet"
      >
        <Plus size={13} />
        <span className="hidden sm:inline text-xs font-medium">New Sheet</span>
      </button>
    </div>
  );
};
