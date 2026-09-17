import React, { useState } from 'react';
import { NodeType } from '../types';
import { PaletteGateSymbol } from './GateSymbols';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ComponentPaletteProps {
  onAddComponent: (type: NodeType) => void;
  isMobileDrawerOpen: boolean;
  onToggleMobileDrawer: () => void;
  theme?: 'dark' | 'light';
}

interface PaletteItem {
  type: NodeType;
  name: string;
}

const INPUT_CONTROLS: PaletteItem[] = [
  { type: 'SWITCH', name: 'Toggle Switch' },
  { type: 'BUTTON', name: 'Push Button' },
  { type: 'CLOCK', name: 'Clock' },
  { type: 'HIGH_CONST', name: 'High Constant' },
  { type: 'LOW_CONST', name: 'Low Constant' },
];

const OUTPUT_CONTROLS: PaletteItem[] = [
  { type: 'LED', name: 'Light Bulb' },
  { type: 'SEVEN_SEG', name: '4-Bit Digit' },
  { type: 'PROBE', name: 'Probe' },
  { type: 'BUZZER', name: 'Buzzer' },
];

const LOGIC_GATES: PaletteItem[] = [
  { type: 'BUFFER', name: 'Buffer' },
  { type: 'NOT', name: 'NOT Gate' },
  { type: 'AND', name: 'AND Gate' },
  { type: 'NAND', name: 'NAND Gate' },
  { type: 'OR', name: 'OR Gate' },
  { type: 'NOR', name: 'NOR Gate' },
  { type: 'XOR', name: 'XOR Gate' },
  { type: 'XNOR', name: 'XNOR Gate' },
  { type: 'TRI_STATE', name: 'Tri-State' },
];

const FLIP_FLOPS: PaletteItem[] = [
  { type: 'D_FLIP_FLOP', name: 'D Flip-Flop' },
  { type: 'T_FLIP_FLOP', name: 'T Flip-Flop' },
  { type: 'JK_FLIP_FLOP', name: 'JK Flip-Flop' },
  { type: 'SR_FLIP_FLOP', name: 'SR Flip-Flop' },
];

const COMBINATIONAL_BLOCKS: PaletteItem[] = [
  { type: 'HALF_ADDER', name: 'Half Adder' },
  { type: 'FULL_ADDER', name: 'Full Adder' },
  { type: 'MUX_2TO1', name: '2:1 MUX' },
  { type: 'DEMUX_1TO2', name: '1:2 DEMUX' },
];

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onAddComponent,
  isMobileDrawerOpen,
  onToggleMobileDrawer,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [inputsOpen, setInputsOpen] = useState(true);
  const [outputsOpen, setOutputsOpen] = useState(true);
  const [gatesOpen, setGatesOpen] = useState(true);
  const [flipFlopsOpen, setFlipFlopsOpen] = useState(true);
  const [combOpen, setCombOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/logicflow-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const renderSectionHeader = (
    title: string,
    isOpen: boolean,
    toggle: () => void,
    count: number
  ) => (
    <button
      type="button"
      onClick={toggle}
      className={`w-full flex items-center justify-between px-3 py-2 select-none transition-colors border-b ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border-slate-700/60'
          : 'bg-slate-200/95 hover:bg-slate-300/80 text-slate-800 border-slate-300'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`text-xs font-semibold tracking-wide ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          {title}
        </span>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
            isDark
              ? 'text-slate-400 bg-slate-900/80 border-slate-700/50'
              : 'text-slate-600 bg-slate-100 border-slate-300'
          }`}
        >
          {count}
        </span>
      </div>
      <div className="w-4 h-4 rounded bg-[#0284c7] flex items-center justify-center text-white text-[10px] shadow-xs">
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </div>
    </button>
  );

  const filterItems = (items: PaletteItem[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) => item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
    );
  };

  const renderGrid = (items: PaletteItem[]) => {
    const filtered = filterItems(items);
    if (filtered.length === 0) return null;

    return (
      <div
        className={`grid grid-cols-2 gap-1.5 p-2 transition-colors ${
          isDark ? 'bg-slate-900/90' : 'bg-slate-100'
        }`}
      >
        {filtered.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            onClick={() => onAddComponent(item.type)}
            className={`flex flex-col items-center justify-center p-2 rounded border shadow-xs hover:shadow transition-all cursor-grab active:cursor-grabbing group select-none min-h-[66px] ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-750 border-slate-700/70 hover:border-sky-500 text-slate-200'
                : 'bg-white hover:bg-sky-50 border-slate-200 hover:border-sky-500 text-slate-700'
            }`}
            title={`Click or drag to add ${item.name}`}
          >
            <div className="w-full flex items-center justify-center py-0.5 group-hover:scale-105 transition-transform">
              <PaletteGateSymbol type={item.type} theme={theme} />
            </div>
            <span
              className={`text-[10px] font-medium text-center leading-tight mt-1 truncate max-w-full transition-colors ${
                isDark
                  ? 'text-slate-300 group-hover:text-sky-400'
                  : 'text-slate-700 group-hover:text-sky-600'
              }`}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const paletteContent = (
    <div
      className={`flex flex-col h-full select-none transition-colors border-r ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300/80'
      }`}
    >
      {/* Search Filter for Instant Access */}
      <div
        className={`p-2 border-b transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-200/80 border-slate-300'
        }`}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search components..."
          className={`w-full rounded-lg px-2.5 py-1.5 text-xs transition-colors focus:outline-none focus:border-sky-500 border ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-400'
              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-2xs'
          }`}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 1. Input Controls */}
        <div>
          {renderSectionHeader('Input Controls', inputsOpen, () => setInputsOpen(!inputsOpen), INPUT_CONTROLS.length)}
          {inputsOpen && renderGrid(INPUT_CONTROLS)}
        </div>

        {/* 2. Output Controls */}
        <div>
          {renderSectionHeader('Output Controls', outputsOpen, () => setOutputsOpen(!outputsOpen), OUTPUT_CONTROLS.length)}
          {outputsOpen && renderGrid(OUTPUT_CONTROLS)}
        </div>

        {/* 3. Logic Gates */}
        <div>
          {renderSectionHeader('Logic Gates', gatesOpen, () => setGatesOpen(!gatesOpen), LOGIC_GATES.length)}
          {gatesOpen && renderGrid(LOGIC_GATES)}
        </div>

        {/* 4. Flip-Flops & Latches */}
        <div>
          {renderSectionHeader('Flip-Flops & Latches', flipFlopsOpen, () => setFlipFlopsOpen(!flipFlopsOpen), FLIP_FLOPS.length)}
          {flipFlopsOpen && renderGrid(FLIP_FLOPS)}
        </div>

        {/* 5. Multiplexers & Adders */}
        <div>
          {renderSectionHeader('Adders & MUX', combOpen, () => setCombOpen(!combOpen), COMBINATIONAL_BLOCKS.length)}
          {combOpen && renderGrid(COMBINATIONAL_BLOCKS)}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Palette */}
      <aside id="component-palette" className="hidden md:flex flex-col w-56 shrink-0 z-20 shadow-sm">
        {paletteContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onToggleMobileDrawer}
          />
          <div
            className={`relative w-64 max-w-[80vw] h-full shadow-2xl flex flex-col z-10 transition-colors ${
              isDark ? 'bg-slate-900' : 'bg-slate-100'
            }`}
          >
            <div
              className={`p-3 flex items-center justify-between border-b transition-colors ${
                isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <span className="font-semibold text-xs">Components</span>
              <button
                type="button"
                onClick={onToggleMobileDrawer}
                className={`p-1 rounded transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{paletteContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
