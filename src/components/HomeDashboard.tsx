import React, { useState } from 'react';
import { Project } from '../types';
import { createPresetSheets } from '../utils/presets';
import {
  Plus,
  FolderOpen,
  Copy,
  Trash2,
  Upload,
  Download,
  Clock,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
  Edit2,
  Check,
  Github,
} from 'lucide-react';

interface HomeDashboardProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onCreateBlankProject: (name?: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onImportProject: (importedData: any) => void;
  onLoadPresetAsProject: (presetType: 'half_adder' | 'sr_latch' | 'all_gates' | 'd_flipflop' | 'mux_routing' | 'clock_7seg') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  projects,
  onOpenProject,
  onCreateBlankProject,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
  onImportProject,
  onLoadPresetAsProject,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const handleStartRename = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveRename = (projectId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editName.trim()) {
      onRenameProject(projectId, editName.trim());
    }
    setEditingId(null);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportProject(parsed);
      } catch {
        alert('Invalid circuit JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Helper to count components across project sheets
  const getProjectStats = (project: Project) => {
    let gateCount = 0;
    let inputCount = 0;
    let outputCount = 0;
    let wireCount = 0;

    project.sheets.forEach((sheet) => {
      wireCount += sheet.wires?.length || 0;
      sheet.nodes?.forEach((n) => {
        if (['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'BUFFER'].includes(n.type)) {
          gateCount++;
        } else if (['SWITCH', 'BUTTON', 'CLOCK', 'HIGH_CONST', 'LOW_CONST'].includes(n.type)) {
          inputCount++;
        } else {
          outputCount++;
        }
      });
    });

    const totalNodes = gateCount + inputCount + outputCount;
    return { gateCount, inputCount, outputCount, wireCount, totalNodes };
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Banner & Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-950/60 ring-1 ring-white/20">
            <Cpu className="text-white" size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-mono">
                LOGICFLOW <span className="text-sky-400">STUDIO</span>
              </h1>
              
            </div>
            <p className="text-xs text-slate-400">Digital Logic Circuit Design & Symbolic Algebra Lab</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/ktesla39/LogicFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            title="View on GitHub"
          >
            <Github size={14} />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors">
            <Upload size={14} />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => onCreateBlankProject()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>New Blank Circuit</span>
          </button>
        </div>
      </header>

      {/* Main Home Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Welcome & Quick Action Hero */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 md:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Start Designing Your Digital Circuits
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Build combinational and sequential logic circuits from scratch. Wire authentic IEEE logic gates directly, assign algebraic variable names like <code className="text-sky-300">A, B, C</code>, and calculate Boolean equations in real time.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onCreateBlankProject()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-950 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Plus size={18} />
                <span>Build From Scratch</span>
                <ArrowRight size={15} className="ml-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
              >
                <Layers size={16} className="text-slate-400" />
                <span>{showPresets ? 'Hide Starter Templates' : 'Explore Starter Templates'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Optional Starter Templates / Presets (Collapsible) */}
        {showPresets && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                Starter Circuit Templates
              </h3>
              <span className="text-xs text-slate-500">Click to clone into a new project</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div
                onClick={() => onLoadPresetAsProject('all_gates')}
                className="group p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-sky-500/50 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/50">
                    Showcase
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-sky-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">All Logic Gates Interactive</h4>
                <p className="text-xs text-slate-400">
                  Interactive reference featuring AND, OR, NOT, NAND, NOR, XOR, XNOR and Buffer with live switches and probes.
                </p>
              </div>

              <div
                onClick={() => onLoadPresetAsProject('half_adder')}
                className="group p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/50 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                    Arithmetic
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Half Adder Circuit</h4>
                <p className="text-xs text-slate-400">
                  Binary addition using XOR gate for Sum (A ⊕ B) and AND gate for Carry Out (A · B).
                </p>
              </div>

              <div
                onClick={() => onLoadPresetAsProject('sr_latch')}
                className="group p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/50 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
                    Sequential
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">SR Latch (Cross-Coupled NOR)</h4>
                <p className="text-xs text-slate-400">
                  Bistable 1-bit memory element demonstrating Set, Reset, Memory retention, and feedback loops.
                </p>
              </div>

              <div
                onClick={() => onLoadPresetAsProject('d_flipflop')}
                className="group p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/50">
                    Flip-Flop
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">D Flip-Flop Register</h4>
                <p className="text-xs text-slate-400">
                  Edge-triggered clock storage capturing Data pin state on clock pulse transitions into Q and ~Q.
                </p>
              </div>

              <div
                onClick={() => onLoadPresetAsProject('mux_routing')}
                className="group p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/50 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                    Routing
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">2:1 Multiplexer Router</h4>
                <p className="text-xs text-slate-400">
                  Data selector channeling either Input 0 or Input 1 directly to output Y based on Select control line.
                </p>
              </div>

              <div
                onClick={() => onLoadPresetAsProject('clock_7seg')}
                className="group p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-rose-500/50 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/50">
                    Display & Audio
                  </span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Clock & 7-Segment Display</h4>
                <p className="text-xs text-slate-400">
                  Pulse oscillator driving buzzer sound together with 4-bit hexadecimal 7-segment numeric decoder.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* User Saved Projects */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="text-sky-400" size={18} />
              <h3 className="text-base font-bold text-white">Your Circuits</h3>
              <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onCreateBlankProject()}
              className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              <Plus size={14} />
              <span>New Circuit</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                <Cpu size={24} />
              </div>
              <h4 className="text-base font-semibold text-slate-200">No Circuits Saved Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a fresh blank circuit to begin placing logic gates and wiring your design.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onCreateBlankProject()}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                >
                  Create Blank Circuit
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const stats = getProjectStats(project);
                const isEditing = editingId === project.id;

                return (
                  <div
                    key={project.id}
                    onClick={() => onOpenProject(project.id)}
                    className="group flex flex-col justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-slate-700 cursor-pointer transition-all duration-150 shadow-md hover:shadow-xl hover:shadow-black/40 relative"
                  >
                    {/* Top Row: Title & Actions */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleSaveRename(project.id, e)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 flex-1"
                          >
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              autoFocus
                              className="flex-1 bg-slate-950 border border-sky-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="p-1 rounded bg-sky-600 text-white hover:bg-sky-500"
                              title="Save"
                            >
                              <Check size={12} />
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-1.5 truncate group/title">
                            <h4 className="text-sm font-bold text-white truncate font-mono">
                              {project.name}
                            </h4>
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(project, e)}
                              className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-400 hover:text-sky-400 transition-opacity"
                              title="Rename project"
                            >
                              <Edit2 size={11} />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onDuplicateProject(project.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
                            title="Duplicate circuit"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProject(project.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete circuit"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Component Summary Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {stats.totalNodes === 0 ? (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            Empty circuit
                          </span>
                        ) : (
                          <>
                            {stats.gateCount > 0 && (
                              <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60">
                                {stats.gateCount} {stats.gateCount === 1 ? 'gate' : 'gates'}
                              </span>
                            )}
                            {stats.inputCount > 0 && (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                                {stats.inputCount} in
                              </span>
                            )}
                            {stats.outputCount > 0 && (
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                                {stats.outputCount} out
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {stats.wireCount} {stats.wireCount === 1 ? 'wire' : 'wires'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Timestamp & Open Action */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <Clock size={11} />
                        <span>{formatTimeAgo(project.updatedAt)}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Open</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-5 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-300">LogicFlow Studio</span>
            <span>•</span>
            <span>Open Source Digital Logic Circuit Simulator</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
              MIT License
            </span>
            <a
              href="https://github.com/ktesla39/LogicFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors font-mono"
            >
              <Github size={13} />
              <span>github.com/ktesla39/LogicFlow</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
