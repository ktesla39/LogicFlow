import React, { useState } from 'react';
import { SimulationSettings } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faForwardStep,
  faTable,
  faWaveSquare,
  faBookOpen,
  faCodeBranch,
  faBorderAll,
  faMagnet,
  faVolumeHigh,
  faVolumeXmark,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faExpand,
  faDownload,
  faCircleQuestion,
  faHouse,
  faPlus,
  faPen,
  faCheck,
  faSun,
  faMoon,
  faSquarePlus,
  faBolt,
  faTag,
} from '@fortawesome/free-solid-svg-icons';

interface TopBarProps {
  settings: SimulationSettings;
  projectName?: string;
  onNavigateHome?: () => void;
  onRenameProject?: (newName: string) => void;
  onNewCircuit?: () => void;
  onUpdateSettings: (settings: Partial<SimulationSettings>) => void;
  onStepSimulation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onOpenTruthTable: () => void;
  onOpenExportModal: () => void;
  onOpenHelpModal: () => void;
  onLoadPreset: (presetIndex: number) => void;
  onToggleMobileDrawer: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  projectName = 'Untitled Circuit',
  onNavigateHome,
  onRenameProject,
  onNewCircuit,
  onUpdateSettings,
  onStepSimulation,
  onZoomIn,
  onZoomOut,
  onResetView,
  onOpenTruthTable,
  onOpenExportModal,
  onOpenHelpModal,
  onLoadPreset,
  onToggleMobileDrawer,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectName);

  const isDark = settings.theme === 'dark';

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleInput.trim()) {
      onRenameProject?.(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const toggleTheme = () => {
    onUpdateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <header
      id="logicflow-topbar"
      className={`flex items-center justify-between px-3 sm:px-4 py-2 border-b z-30 select-none gap-2 overflow-x-auto scrollbar-none transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-slate-100'
          : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-800 shadow-2xs'
      }`}
    >
      {/* Brand, Home Navigation & Project Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Add Component Button */}
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          className="md:hidden p-1.5 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow hover:bg-sky-500 transition-colors"
          title="Add Component"
        >
          <FontAwesomeIcon icon={faSquarePlus} className="w-3.5 h-3.5" />
        </button>

        {/* Home / Projects Dashboard Button */}
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors shadow-sm"
            title="Return to Main Menu / Projects"
          >
            <FontAwesomeIcon icon={faHouse} className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Projects</span>
          </button>
        )}

        {/* Project Title (Inline Editable) */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2 sm:pl-3">
          {isEditingTitle ? (
            <form onSubmit={handleSaveTitle} className="flex items-center gap-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                autoFocus
                className="bg-slate-950 border border-sky-400 rounded px-2 py-0.5 text-xs text-white font-mono focus:outline-none w-36"
              />
              <button type="submit" className="p-1 text-sky-400 hover:text-white" title="Save title">
                <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <div
              onClick={() => {
                setTitleInput(projectName);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800/70 cursor-pointer group/title"
              title="Click to rename project"
            >
              <span className="text-xs sm:text-sm font-bold text-white font-mono max-w-[130px] sm:max-w-[200px] truncate">
                {projectName}
              </span>
              <FontAwesomeIcon
                icon={faPen}
                className="w-2.5 h-2.5 text-slate-500 group-hover/title:text-sky-400 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Quick New Circuit Button */}
        {onNewCircuit && (
          <button
            type="button"
            onClick={onNewCircuit}
            className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-colors"
            title="Create a new blank circuit"
          >
            <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5 text-emerald-400" />
            <span>New</span>
          </button>
        )}
      </div>

      {/* Primary Simulation Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Run / Pause Toggle */}
        <button
          type="button"
          id="btn-toggle-run"
          onClick={() => onUpdateSettings({ running: !settings.running })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-md transition-all ${
            settings.running
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
          }`}
          title={settings.running ? 'Pause simulation' : 'Run simulation'}
        >
          <FontAwesomeIcon icon={settings.running ? faPause : faPlay} className="w-3 h-3" />
          <span className="hidden sm:inline">
            {settings.running ? 'SIMULATING' : 'PAUSED'}
          </span>
        </button>

        {/* Step Button */}
        <button
          type="button"
          id="btn-step"
          onClick={onStepSimulation}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-medium transition-colors"
          title="Step one clock pulse forward"
        >
          <FontAwesomeIcon icon={faForwardStep} className="w-3 h-3" />
          <span className="hidden md:inline">Step</span>
        </button>

        {/* Truth Table Generator Button */}
        <button
          type="button"
          id="btn-truth-table"
          onClick={onOpenTruthTable}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700/80 text-xs font-medium transition-colors"
          title="Generate Truth Table"
        >
          <FontAwesomeIcon icon={faTable} className="w-3 h-3" />
          <span className="hidden md:inline">Truth Table</span>
        </button>

        {/* Oscilloscope / Waveforms Button */}
        <button
          type="button"
          id="btn-waveform"
          onClick={() =>
            onUpdateSettings({ showTimingDiagram: !settings.showTimingDiagram })
          }
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            settings.showTimingDiagram
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Toggle Waveform Scope"
        >
          <FontAwesomeIcon icon={faWaveSquare} className="w-3 h-3" />
          <span className="hidden lg:inline">Waveforms</span>
        </button>
      </div>

      {/* Secondary Controls & View Tools */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Circuit Examples Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition-colors"
            title="Load Circuit Examples"
          >
            <FontAwesomeIcon icon={faBookOpen} className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Examples</span>
          </button>

          {showPresetsMenu && (
            <div
              className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs"
              onClick={() => setShowPresetsMenu(false)}
            >
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Preset Circuits
              </div>
              <button
                type="button"
                onClick={() => onLoadPreset(0)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                1. All Logic Gates
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset(1)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                2. Half Adder
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset(2)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                3. SR Latch (Memory)
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset(3)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                4. Clock & 7-Segment
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset(4)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                5. D Flip-Flop (Sequential)
              </button>
              <button
                type="button"
                onClick={() => onLoadPreset(5)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                6. 2:1 Multiplexer Router
              </button>
            </div>
          )}
        </div>

        {/* Wire Style: Curved vs Orthogonal */}
        <button
          type="button"
          onClick={() =>
            onUpdateSettings({
              wireStyle: settings.wireStyle === 'curved' ? 'orthogonal' : 'curved',
            })
          }
          className="hidden sm:flex p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
          title={`Wire Style: ${settings.wireStyle === 'curved' ? 'Curved Bezier' : 'Orthogonal Manhattan'}`}
        >
          <FontAwesomeIcon icon={faCodeBranch} className="w-3.5 h-3.5" />
        </button>

        {/* Snap to Grid Toggle */}
        <button
          type="button"
          onClick={() => onUpdateSettings({ snapToGrid: !settings.snapToGrid })}
          className={`hidden sm:flex p-1.5 rounded-lg border transition-colors ${
            settings.snapToGrid
              ? 'bg-sky-950 border-sky-600 text-sky-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title={settings.snapToGrid ? 'Snap to Grid: ON' : 'Snap to Grid: OFF'}
        >
          <FontAwesomeIcon icon={faMagnet} className="w-3.5 h-3.5" />
        </button>

        {/* Canvas Grid Lines Toggle */}
        <button
          type="button"
          onClick={() => onUpdateSettings({ showGrid: !settings.showGrid })}
          className={`hidden sm:flex p-1.5 rounded-lg border transition-colors ${
            settings.showGrid
              ? 'bg-sky-950 border-sky-600 text-sky-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title={settings.showGrid ? 'Grid: Visible' : 'Grid: Hidden'}
        >
          <FontAwesomeIcon icon={faBorderAll} className="w-3.5 h-3.5" />
        </button>

        {/* Circuit Flow Notation (0/1 & Boolean Expressions) Toggle */}
        <button
          type="button"
          id="btn-toggle-notation"
          onClick={() =>
            onUpdateSettings({
              showWireExpressions: !settings.showWireExpressions,
            })
          }
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            settings.showWireExpressions
              ? 'bg-sky-950/80 border-sky-500 text-sky-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title={
            settings.showWireExpressions
              ? 'Circuit Flow Notation: ON (Showing 1/0 & Boolean Logic)'
              : 'Circuit Flow Notation: OFF (Click to display flow state & Boolean expressions)'
          }
        >
          <FontAwesomeIcon icon={faBolt} className="w-3 h-3 text-amber-400" />
          <span className="hidden xl:inline">Notation</span>
        </button>

        {/* Component Variables Toggle */}
        <button
          type="button"
          id="btn-toggle-variables"
          onClick={() =>
            onUpdateSettings({
              showComponentVariables: !settings.showComponentVariables,
            })
          }
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            settings.showComponentVariables !== false
              ? 'bg-sky-950/80 border-sky-500 text-sky-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title={
            settings.showComponentVariables !== false
              ? 'Component Variables: Visible above all components (Click to toggle)'
              : 'Component Variables: Hidden (Click to show variables above all components)'
          }
        >
          <FontAwesomeIcon icon={faTag} className="w-3 h-3 text-sky-400" />
          <span className="hidden xl:inline">Variables</span>
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          type="button"
          id="btn-toggle-theme"
          onClick={toggleTheme}
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-300'
          }`}
          title={isDark ? 'Switch to Light Blueprint Theme' : 'Switch to Dark Mode Theme'}
        >
          <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="w-3.5 h-3.5" />
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
          title={settings.soundEnabled ? 'Audio: Enabled' : 'Audio: Muted'}
        >
          <FontAwesomeIcon icon={settings.soundEnabled ? faVolumeHigh : faVolumeXmark} className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center bg-slate-800 rounded-lg border border-slate-700/80 overflow-hidden">
          <button
            type="button"
            onClick={onZoomOut}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Zoom out (-)"
          >
            <FontAwesomeIcon icon={faMagnifyingGlassMinus} className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onResetView}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Reset zoom & pan"
          >
            <FontAwesomeIcon icon={faExpand} className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Zoom in (+)"
          >
            <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="w-3 h-3" />
          </button>
        </div>

        {/* Export / Import Button */}
        <button
          type="button"
          id="btn-export-import"
          onClick={onOpenExportModal}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
          title="Export / Import Circuit JSON"
        >
          <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
        </button>

        {/* Help Button */}
        <button
          type="button"
          onClick={onOpenHelpModal}
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/80'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-2xs'
          }`}
          title="Quick Help & Shortcuts"
        >
          <FontAwesomeIcon icon={faCircleQuestion} className="w-3.5 h-3.5" />
        </button>

        {/* Official GitHub Repository Link */}
        <a
          href="https://github.com/ktesla39/LogicFlow"
          target="_blank"
          rel="noopener noreferrer"
          id="btn-github-link"
          className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/80'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300 shadow-2xs'
          }`}
          title="LogicFlow on GitHub (https://github.com/ktesla39/LogicFlow)"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
      </div>
    </header>
  );
};
