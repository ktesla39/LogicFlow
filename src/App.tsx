import { useState, useEffect, useRef, useCallback } from 'react';
import { CircuitNode, NodeType, Project, Sheet, SimulationSettings } from './types';
import { createPresetSheets } from './utils/presets';
import { evaluateCircuit, createDefaultNode } from './utils/circuitSolver';
import { sound } from './utils/sound';
import { TopBar } from './components/TopBar';
import { ComponentPalette } from './components/ComponentPalette';
import { Canvas } from './components/Canvas';
import { SheetTabs } from './components/SheetTabs';
import { TruthTableModal } from './components/TruthTableModal';
import { TimingDiagram, SignalHistory } from './components/TimingDiagram';
import { ExportImportModal } from './components/ExportImportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { HomeDashboard } from './components/HomeDashboard';

const STORAGE_PROJECTS_KEY = 'LOGICFLOW_PROJECTS_V4';
const STORAGE_ACTIVE_PROJECT_KEY = 'LOGICFLOW_ACTIVE_PROJECT_V4';
const STORAGE_SETTINGS_KEY = 'LOGICFLOW_SETTINGS_V4';

const DEFAULT_SETTINGS: SimulationSettings = {
  running: true,
  clockHz: 1,
  speedMs: 50,
  showGrid: true,
  snapToGrid: true,
  wireStyle: 'curved',
  soundEnabled: true,
  showTimingDiagram: false,
  theme: 'light',
  showWireExpressions: true,
  showComponentVariables: true,
};

interface HistoryEntry {
  projects: Project[];
  activeProjectId: string | null;
}

function createBlankProject(name: string = 'Untitled Circuit'): Project {
  const sheetId = `sheet_${Date.now()}`;
  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    sheets: [
      {
        id: sheetId,
        name: 'Main Circuit',
        nodes: [],
        wires: [],
        pan: { x: 80, y: 80 },
        zoom: 1,
        updatedAt: Date.now(),
      },
    ],
    activeSheetId: sheetId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export default function App() {
  // Start from Home Tab (Main Menu) by default
  const [viewMode, setViewMode] = useState<'home' | 'editor'>('home');

  // Multi-project repository in localStorage
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // LocalStorage read error fallback
    }
    return [];
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_ACTIVE_PROJECT_KEY);
    } catch {
      return null;
    }
  });

  const [settings, setSettings] = useState<SimulationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isTruthTableOpen, setIsTruthTableOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Digital oscilloscope signal histories
  const [signals, setSignals] = useState<SignalHistory[]>([]);
  const historyRef = useRef<{ past: HistoryEntry[]; future: HistoryEntry[] }>({
    past: [],
    future: [],
  });
  const [historyRevision, setHistoryRevision] = useState(0);

  // Sound sync
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Dark/Light Theme class synchronization
  useEffect(() => {
    const isDark = settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Active Project & Active Sheet resolution
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  const currentSheet: Sheet = (activeProject &&
    (activeProject.sheets.find((s) => s.id === activeProject.activeSheetId) ||
      activeProject.sheets[0])) || {
    id: 'sheet_fallback',
    name: 'Main Circuit',
    nodes: [],
    wires: [],
    pan: { x: 80, y: 80 },
    zoom: 1,
    updatedAt: Date.now(),
  };

  const recordHistory = useCallback(() => {
    historyRef.current.past.push({ projects, activeProjectId });
    historyRef.current.future = [];
    setHistoryRevision((revision) => revision + 1);
  }, [projects, activeProjectId]);

  const handleUndo = useCallback(() => {
    const previous = historyRef.current.past.pop();
    if (!previous) return;

    historyRef.current.future.push({ projects, activeProjectId });
    setProjects(previous.projects);
    setActiveProjectId(previous.activeProjectId);
    setSelectedNodeId(null);
    setSelectedWireId(null);
    setHistoryRevision((revision) => revision + 1);
  }, [projects, activeProjectId]);

  const handleRedo = useCallback(() => {
    const next = historyRef.current.future.pop();
    if (!next) return;

    historyRef.current.past.push({ projects, activeProjectId });
    setProjects(next.projects);
    setActiveProjectId(next.activeProjectId);
    setSelectedNodeId(null);
    setSelectedWireId(null);
    setHistoryRevision((revision) => revision + 1);
  }, [projects, activeProjectId]);

  const canUndo = historyRevision >= 0 && historyRef.current.past.length > 0;
  const canRedo = historyRevision >= 0 && historyRef.current.future.length > 0;

  // Debounced persistence keeps drag and simulation updates off the storage path.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
        if (activeProjectId) {
          localStorage.setItem(STORAGE_ACTIVE_PROJECT_KEY, activeProjectId);
        }
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [projects, activeProjectId, settings]);

  // Update current active project & sheet
  const handleUpdateCurrentSheet = useCallback(
    (updated: Partial<Sheet>) => {
      if (!activeProject) return;

      recordHistory();

      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          if (p.id !== activeProject.id) return p;

          const updatedSheets = p.sheets.map((s) => {
            if (s.id === currentSheet.id) {
              return { ...s, ...updated, updatedAt: Date.now() };
            }
            return s;
          });

          return {
            ...p,
            sheets: updatedSheets,
            updatedAt: Date.now(),
          };
        })
      );
    },
    [activeProject, currentSheet.id, recordHistory]
  );

  // Simulation tick logic
  const stepSimulation = useCallback(() => {
    if (!activeProject) return;

    // Evaluate before scheduling React state so waveform history never reads a deferred updater.
    const evaluated = evaluateCircuit(currentSheet.nodes, currentSheet.wires, Date.now());
    const { nodes: evaluatedNodes, wires: evaluatedWires, buzzerActive } = evaluated;

    setProjects((prevProjects) =>
      prevProjects.map((proj) => {
        if (proj.id !== activeProject.id) return proj;

        const updatedSheets = proj.sheets.map((sheet) => {
          if (sheet.id !== proj.activeSheetId) return sheet;

          return {
            ...sheet,
            nodes: evaluatedNodes,
            wires: evaluatedWires,
          };
        });

        return {
          ...proj,
          sheets: updatedSheets,
        };
      })
    );

    // Side effects AFTER state update (not inside updater)
    sound.playBuzzer(buzzerActive);

    // Update signals after projects state is committed
    if (evaluatedNodes.length > 0) {
      const monitoredNodes = evaluatedNodes.filter(
        (n) =>
          n.type === 'CLOCK' ||
          n.type === 'SWITCH' ||
          n.type === 'LED' ||
          n.type === 'PROBE' ||
          n.type === 'BUZZER'
      );

      if (monitoredNodes.length > 0) {
        setSignals((prevSignals) => {
          const newSignals = monitoredNodes.map((n) => {
            const existing = prevSignals.find((s) => s.id === n.id);
            const isHigh =
              n.type === 'LED' || n.type === 'PROBE' || n.type === 'BUZZER'
                ? Boolean(n.inputs[0]?.value)
                : Boolean(n.outputs[0]?.value);

            const history = existing ? [...existing.history, isHigh] : [isHigh];
            if (history.length > 36) history.shift();

            return {
              id: n.id,
              name: n.label,
              color: n.state.color || '#10b981',
              history,
            };
          });
          return newSignals;
        });
      }
    }
  }, [activeProject, currentSheet.nodes, currentSheet.wires]);

  const hasTimeDependentCircuit = currentSheet.nodes.some((node) =>
    ['CLOCK', 'D_FLIP_FLOP', 'T_FLIP_FLOP', 'JK_FLIP_FLOP', 'SR_FLIP_FLOP'].includes(node.type)
  );

  // Timer-based simulation avoids running JavaScript on every display frame.
  useEffect(() => {
    if (viewMode !== 'editor' || !settings.running || !hasTimeDependentCircuit) {
      sound.stopBuzzer();
      return;
    }

    const interval = Math.max(settings.speedMs, 30);

    const intervalId = window.setInterval(stepSimulation, interval);

    return () => {
      window.clearInterval(intervalId);
      sound.stopBuzzer();
    };
  }, [viewMode, settings.running, settings.speedMs, stepSimulation]);

  // PROJECT MANAGEMENT HANDLERS
  const handleCreateBlankProject = (name: string = 'Untitled Circuit') => {
    const newProj = createBlankProject(name);
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setViewMode('editor');
    setSelectedNodeId(null);
    setSelectedWireId(null);
    sound.playClick();
  };

  const handleOpenProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setViewMode('editor');
    setSelectedNodeId(null);
    setSelectedWireId(null);
    sound.playClick();
  };

  const handleDuplicateProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    const clonedProject: Project = {
      ...JSON.parse(JSON.stringify(target)),
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${target.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setProjects((prev) => [clonedProject, ...prev]);
    sound.playClick();
  };

  const handleDeleteProject = (projectId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this circuit project?');
    if (!confirmed) return;

    const remaining = projects.filter((p) => p.id !== projectId);
    setProjects(remaining);
    if (activeProjectId === projectId) {
      setActiveProjectId(remaining[0]?.id || null);
    }
    sound.playClick();
  };

  const handleRenameProject = (projectId: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, name: newName, updatedAt: Date.now() } : p))
    );
  };

  const handleImportProject = (importedData: any) => {
    let importedProject: Project;

    if (importedData.sheets && Array.isArray(importedData.sheets)) {
      // Full Project format
      importedProject = {
        ...importedData,
        id: `proj_${Date.now()}`,
        name: importedData.name || 'Imported Circuit',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else if (Array.isArray(importedData)) {
      // Sheets array format
      const sheetId = `sheet_${Date.now()}`;
      importedProject = {
        id: `proj_${Date.now()}`,
        name: 'Imported Project',
        sheets: importedData,
        activeSheetId: importedData[0]?.id || sheetId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else {
      alert('Unrecognized circuit data format');
      return;
    }

    setProjects((prev) => [importedProject, ...prev]);
    setActiveProjectId(importedProject.id);
    setViewMode('editor');
    sound.playClick();
  };

  const handleLoadPresetAsProject = (
    presetType: 'half_adder' | 'sr_latch' | 'all_gates' | 'd_flipflop' | 'mux_routing' | 'clock_7seg'
  ) => {
    const presets = createPresetSheets();
    let selectedSheet: Sheet;
    let title: string;

    if (presetType === 'half_adder') {
      selectedSheet = presets[1];
      title = 'Half Adder Circuit';
    } else if (presetType === 'sr_latch') {
      selectedSheet = presets[2];
      title = 'SR Latch Circuit';
    } else if (presetType === 'clock_7seg') {
      selectedSheet = presets[3];
      title = 'Clock & 7-Segment Circuit';
    } else if (presetType === 'd_flipflop') {
      selectedSheet = presets[4];
      title = 'D Flip-Flop Circuit';
    } else if (presetType === 'mux_routing') {
      selectedSheet = presets[5];
      title = '2:1 Multiplexer Router';
    } else {
      selectedSheet = presets[0];
      title = 'All Logic Gates Interactive';
    }

    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: title,
      sheets: [
        {
          ...selectedSheet,
          id: `sheet_${Date.now()}`,
          name: 'Circuit',
          updatedAt: Date.now(),
        },
      ],
      activeSheetId: `sheet_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Ensure activeSheetId matches
    newProj.activeSheetId = newProj.sheets[0].id;

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setViewMode('editor');
    sound.playClick();
  };

  // MULTI-SHEET OPERATIONS WITHIN ACTIVE PROJECT
  const handleCreateSheet = () => {
    if (!activeProject) return;
    const newSheetId = `sheet_${Date.now()}`;
    const newSheet: Sheet = {
      id: newSheetId,
      name: `Sheet ${activeProject.sheets.length + 1}`,
      nodes: [],
      wires: [],
      pan: { x: 80, y: 80 },
      zoom: 1,
      updatedAt: Date.now(),
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            sheets: [...p.sheets, newSheet],
            activeSheetId: newSheetId,
            updatedAt: Date.now(),
          };
        }
        return p;
      })
    );
    setSelectedNodeId(null);
    setSelectedWireId(null);
    sound.playClick();
  };

  const handleSelectSheet = (sheetId: string) => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProject.id ? { ...p, activeSheetId: sheetId } : p))
    );
    setSelectedNodeId(null);
    setSelectedWireId(null);
    sound.playClick();
  };

  const handleRenameSheet = (id: string, newName: string) => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            sheets: p.sheets.map((s) => (s.id === id ? { ...s, name: newName } : s)),
            updatedAt: Date.now(),
          };
        }
        return p;
      })
    );
  };

  const handleDuplicateSheet = (id: string) => {
    if (!activeProject) return;
    const target = activeProject.sheets.find((s) => s.id === id);
    if (!target) return;

    const idMap = new Map<string, string>();
    const clonedNodes = target.nodes.map((node) => {
      const newNodeId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      idMap.set(node.id, newNodeId);

      const newInputs = node.inputs.map((pin, i) => {
        const newPinId = `${newNodeId}_in_${i}`;
        idMap.set(pin.id, newPinId);
        return { ...pin, id: newPinId, nodeId: newNodeId };
      });

      const newOutputs = node.outputs.map((pin, i) => {
        const newPinId = `${newNodeId}_out_${i}`;
        idMap.set(pin.id, newPinId);
        return { ...pin, id: newPinId, nodeId: newNodeId };
      });

      return {
        ...node,
        id: newNodeId,
        inputs: newInputs,
        outputs: newOutputs,
        state: { ...node.state },
      };
    });

    const clonedWires = target.wires.map((wire) => ({
      ...wire,
      id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromNodeId: idMap.get(wire.fromNodeId) || wire.fromNodeId,
      fromPinId: idMap.get(wire.fromPinId) || wire.fromPinId,
      toNodeId: idMap.get(wire.toNodeId) || wire.toNodeId,
      toPinId: idMap.get(wire.toPinId) || wire.toPinId,
    }));

    const newSheetId = `sheet_${Date.now()}`;
    const newSheet: Sheet = {
      ...target,
      id: newSheetId,
      name: `${target.name} (Copy)`,
      nodes: clonedNodes,
      wires: clonedWires,
      updatedAt: Date.now(),
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            sheets: [...p.sheets, newSheet],
            activeSheetId: newSheetId,
            updatedAt: Date.now(),
          };
        }
        return p;
      })
    );
    sound.playClick();
  };

  const handleDeleteSheet = (id: string) => {
    if (!activeProject || activeProject.sheets.length <= 1) return;
    const remaining = activeProject.sheets.filter((s) => s.id !== id);
    if (remaining.length === 0) return;

    const deletedWasActive = activeProject.activeSheetId === id;
    const newActiveId = deletedWasActive ? remaining[0].id : activeProject.activeSheetId;

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProject.id) return p;
        return {
          ...p,
          sheets: remaining,
          activeSheetId: newActiveId,
          updatedAt: Date.now(),
        };
      })
    );
    sound.playClick();
  };

  const handleSelectAdjacentSheet = (direction: -1 | 1) => {
    if (!activeProject || activeProject.sheets.length < 2) return;
    const currentIndex = activeProject.sheets.findIndex((sheet) => sheet.id === currentSheet.id);
    const nextIndex = (currentIndex + direction + activeProject.sheets.length) % activeProject.sheets.length;
    handleSelectSheet(activeProject.sheets[nextIndex].id);
  };

  // NODE OPERATIONS WITH INTELLIGENT VARIABLE NAMING
  const handleAddComponent = (type: NodeType) => {
    const canvasEl = document.getElementById('logicflow-canvas');
    const width = canvasEl?.clientWidth || 800;
    const height = canvasEl?.clientHeight || 600;

    const centerX = (width / 2 - currentSheet.pan.x) / currentSheet.zoom;
    const centerY = (height / 2 - currentSheet.pan.y) / currentSheet.zoom;

    const jitterX = (Math.random() - 0.5) * 40;
    const jitterY = (Math.random() - 0.5) * 40;

    // Smart variable assignment for inputs (A, B, C...) and probes (Y, Z, F...)
    let customLabel: string | undefined;
    let varName: string | undefined;

    if (type === 'SWITCH' || type === 'BUTTON') {
      const usedVars = new Set(
        currentSheet.nodes
          .filter((n) => n.type === 'SWITCH' || n.type === 'BUTTON')
          .map((n) => n.state.variableName || n.label)
      );
      const varCandidates = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      varName = varCandidates.find((v) => !usedVars.has(v)) || `IN${currentSheet.nodes.length + 1}`;
      customLabel = varName;
    } else if (type === 'PROBE') {
      const usedVars = new Set(
        currentSheet.nodes
          .filter((n) => n.type === 'PROBE')
          .map((n) => n.state.variableName || n.label)
      );
      const varCandidates = ['Y', 'Z', 'F', 'Q', 'OUT1', 'OUT2'];
      varName = varCandidates.find((v) => !usedVars.has(v)) || `OUT${currentSheet.nodes.length + 1}`;
      customLabel = varName;
    }

    const newNode = createDefaultNode(
      type,
      Math.round(centerX + jitterX),
      Math.round(centerY + jitterY),
      undefined,
      varName ? { variableName: varName } : undefined,
      customLabel
    );

    handleUpdateCurrentSheet({
      nodes: [...currentSheet.nodes, newNode],
    });
    setSelectedNodeId(newNode.id);
    sound.playClick();
  };

  const handleDeleteNode = (nodeId: string) => {
    const remainingNodes = currentSheet.nodes.filter((n) => n.id !== nodeId);
    const remainingWires = currentSheet.wires.filter(
      (w) => w.fromNodeId !== nodeId && w.toNodeId !== nodeId
    );

    handleUpdateCurrentSheet({
      nodes: remainingNodes,
      wires: remainingWires,
    });
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    sound.playClick();
  };

  const handleDeleteWire = (wireId: string) => {
    const remainingWires = currentSheet.wires.filter((w) => w.id !== wireId);
    handleUpdateCurrentSheet({ wires: remainingWires });
    if (selectedWireId === wireId) setSelectedWireId(null);
    sound.playClick();
  };

  // Interactive node events
  const handleToggleSwitch = (nodeId: string) => {
    const updatedNodes = currentSheet.nodes.map((node) => {
      if (node.id === nodeId && node.type === 'SWITCH') {
        const nextState = !node.state.isOn;
        return {
          ...node,
          state: { ...node.state, isOn: nextState },
          outputs: node.outputs.map((p) => ({ ...p, value: nextState })),
        };
      }
      return node;
    });

    sound.playClick();
    const evaluated = evaluateCircuit(updatedNodes, currentSheet.wires, Date.now());
    handleUpdateCurrentSheet({ nodes: evaluated.nodes, wires: evaluated.wires });
  };

  const handleButtonPress = (nodeId: string, pressed: boolean) => {
    const updatedNodes = currentSheet.nodes.map((node) => {
      if (node.id === nodeId && node.type === 'BUTTON') {
        return {
          ...node,
          state: { ...node.state, isOn: pressed },
          outputs: node.outputs.map((p) => ({ ...p, value: pressed })),
        };
      }
      return node;
    });

    if (pressed) sound.playClick();
    const evaluated = evaluateCircuit(updatedNodes, currentSheet.wires, Date.now());
    handleUpdateCurrentSheet({ nodes: evaluated.nodes, wires: evaluated.wires });
  };

  const handleUpdateNodeState = (nodeId: string, partial: Partial<CircuitNode['state']>) => {
    const updatedNodes = currentSheet.nodes.map((n) =>
      n.id === nodeId ? { ...n, state: { ...n.state, ...partial } } : n
    );
    handleUpdateCurrentSheet({ nodes: updatedNodes });
  };

  // Zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(currentSheet.zoom * 1.2, 3.0);
    handleUpdateCurrentSheet({ zoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(currentSheet.zoom / 1.2, 0.3);
    handleUpdateCurrentSheet({ zoom: newZoom });
  };

  const handleResetView = () => {
    handleUpdateCurrentSheet({ zoom: 1.0, pan: { x: 80, y: 80 } });
  };

  const handleExportSvg = async () => {
    const canvas = document.getElementById('logicflow-canvas');
    if (!canvas) return;

    try {
      const { toSvg } = await import('html-to-image');
      const svgDataUrl = await toSvg(canvas, {
        backgroundColor: settings.theme === 'dark' ? '#0b0f19' : '#e4e7ec',
        filter: (node) => !node.classList?.contains('logicflow-export-ignore'),
      });
      const link = document.createElement('a');
      link.href = svgDataUrl;
      link.download = `logixflow-circuit-${Date.now()}.svg`;
      link.click();
    } catch (error) {
      console.warn('Failed to export SVG:', error);
    }
  };

  // Apply truth table row test directly to canvas
  const handleApplyTruthTableRow = (rowInputs: Record<string, boolean>) => {
    const inputNodes = currentSheet.nodes.filter(
      (n) => n.type === 'SWITCH' || n.type === 'BUTTON'
    );
    const selectedInputs = inputNodes.slice(0, 6);

    const labelCounts = new Map<string, number>();
    selectedInputs.forEach((n) => {
      const lbl = n.state.variableName || n.label || n.type;
      labelCounts.set(lbl, (labelCounts.get(lbl) || 0) + 1);
    });

    const currentCounts = new Map<string, number>();
    const nodeToName = new Map<string, string>();
    selectedInputs.forEach((n) => {
      const lbl = n.state.variableName || n.label || n.type;
      if ((labelCounts.get(lbl) || 0) > 1) {
        const c = (currentCounts.get(lbl) || 0) + 1;
        currentCounts.set(lbl, c);
        nodeToName.set(n.id, `${lbl} #${c}`);
      } else {
        nodeToName.set(n.id, lbl);
      }
    });

    const updatedNodes = currentSheet.nodes.map((node) => {
      const uniqueName = nodeToName.get(node.id);
      const val =
        uniqueName && rowInputs[uniqueName] !== undefined
          ? rowInputs[uniqueName]
          : rowInputs[node.state.variableName || node.label];

      if ((node.type === 'SWITCH' || node.type === 'BUTTON') && val !== undefined) {
        return {
          ...node,
          state: { ...node.state, isOn: val },
          outputs: node.outputs.map((p) => ({ ...p, value: val })),
        };
      }
      return node;
    });

    const evaluated = evaluateCircuit(updatedNodes, currentSheet.wires, Date.now());
    handleUpdateCurrentSheet({ nodes: evaluated.nodes, wires: evaluated.wires });
  };

  // Load preset circuit directly into active project
  const handleLoadPresetIntoProject = (index: number) => {
    if (!activeProject) return;
    const presets = createPresetSheets();
    if (presets[index]) {
      const preset = presets[index];
      const newSheet: Sheet = {
        ...preset,
        id: `sheet_${Date.now()}`,
        name: preset.name,
        updatedAt: Date.now(),
      };
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? { ...p, sheets: [...p.sheets, newSheet], activeSheetId: newSheet.id }
            : p
        )
      );
      sound.playClick();
    }
  };

  // Central keyboard command layer. Text fields keep their native editing shortcuts.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (isEditable) return;

      const key = event.key.toLowerCase();
      const hasModifier = event.ctrlKey || event.metaKey;

      if (hasModifier && key === 'z') {
        event.preventDefault();
        event.shiftKey ? handleRedo() : handleUndo();
        return;
      }

      if (hasModifier && key === 'y') {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (event.key === 'Escape') {
        setIsMobileDrawerOpen(false);
        setIsTruthTableOpen(false);
        setIsExportModalOpen(false);
        setIsHelpModalOpen(false);
        return;
      }

      if (viewMode !== 'editor') return;

      if (hasModifier && key === 's') {
        event.preventDefault();
        if (event.shiftKey) {
          void handleExportSvg();
        } else {
          setIsExportModalOpen(true);
        }
        return;
      }

      if (hasModifier && key === 'o') {
        event.preventDefault();
        setIsExportModalOpen(true);
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (selectedNodeId) handleDeleteNode(selectedNodeId);
        else if (selectedWireId) handleDeleteWire(selectedWireId);
        return;
      }

      if (event.key === ' ') {
        event.preventDefault();
        setSettings((previous) => ({ ...previous, running: !previous.running }));
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        stepSimulation();
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        handleZoomIn();
        return;
      }

      if (event.key === '-') {
        event.preventDefault();
        handleZoomOut();
        return;
      }

      if (event.key === '0') {
        event.preventDefault();
        handleResetView();
        return;
      }

      if (key === 'g') {
        setSettings((previous) => ({ ...previous, showGrid: !previous.showGrid }));
      } else if (key === 's') {
        setSettings((previous) => ({ ...previous, snapToGrid: !previous.snapToGrid }));
      } else if (key === '?') {
        setIsHelpModalOpen(true);
      } else if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        handleSelectAdjacentSheet(-1);
      } else if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        handleSelectAdjacentSheet(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    viewMode,
    selectedNodeId,
    selectedWireId,
    activeProject,
    currentSheet.id,
    handleUndo,
    handleRedo,
    handleExportSvg,
    stepSimulation,
  ]);

  // If in Home Tab (Main Menu), render the Home Dashboard
  if (viewMode === 'home') {
    return (
      <HomeDashboard
        projects={projects}
        onOpenProject={handleOpenProject}
        onCreateBlankProject={handleCreateBlankProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        onImportProject={handleImportProject}
        onLoadPresetAsProject={handleLoadPresetAsProject}
      />
    );
  }

  // Otherwise, render the Circuit Editor Workspace
  return (
    <div
      className={`flex flex-col h-dvh min-h-screen w-screen overflow-hidden antialiased font-sans transition-colors ${
        settings.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Application Bar with Navigation to Home & Project Title */}
      <TopBar
        settings={settings}
        projectName={activeProject?.name || 'Untitled Circuit'}
        onNavigateHome={() => setViewMode('home')}
        onRenameProject={(newName) => activeProject && handleRenameProject(activeProject.id, newName)}
        onNewCircuit={() => handleCreateBlankProject()}
        onUpdateSettings={(partial) => setSettings({ ...settings, ...partial })}
        onStepSimulation={stepSimulation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onOpenTruthTable={() => setIsTruthTableOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onExportSvg={handleExportSvg}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onLoadPreset={handleLoadPresetIntoProject}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
      />

      {/* Main Workspace Area (Component Palette Sidebar + Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Component Palette Sidebar (Features ANSI/IEEE Gate Symbols) */}
        <ComponentPalette
          onAddComponent={handleAddComponent}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onToggleMobileDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          theme={settings.theme || 'light'}
        />

        {/* Center Interactive Circuit Canvas (Direct Terminal Wiring & Variable Output Displays) */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Canvas
            sheet={currentSheet}
            selectedNodeId={selectedNodeId}
            selectedWireId={selectedWireId}
            showGrid={settings.showGrid}
            snapToGrid={settings.snapToGrid}
            wireStyle={settings.wireStyle}
            simulationRunning={settings.running}
            theme={settings.theme || 'light'}
            showWireExpressions={settings.showWireExpressions || false}
            showComponentVariables={settings.showComponentVariables !== false}
            onTogglePlayPause={() => setSettings({ ...settings, running: !settings.running })}
            onStepSimulation={stepSimulation}
            onUpdateSheet={handleUpdateCurrentSheet}
            onSelectNode={setSelectedNodeId}
            onSelectWire={setSelectedWireId}
            onDeleteNode={handleDeleteNode}
            onDeleteWire={handleDeleteWire}
            onToggleSwitch={handleToggleSwitch}
            onButtonPress={handleButtonPress}
            onUpdateNodeState={handleUpdateNodeState}
          />

          {/* Collapsible Digital Timing Waveform Scope */}
          <TimingDiagram
            signals={signals}
            isOpen={settings.showTimingDiagram}
            onToggle={() =>
              setSettings({ ...settings, showTimingDiagram: !settings.showTimingDiagram })
            }
            onClear={() => setSignals([])}
          />

          {/* Multi-Sheet Tabs Bar */}
          <SheetTabs
            sheets={activeProject?.sheets || [currentSheet]}
            activeSheetId={activeProject?.activeSheetId || currentSheet.id}
            onSelectSheet={handleSelectSheet}
            onCreateSheet={handleCreateSheet}
            onRenameSheet={handleRenameSheet}
            onDuplicateSheet={handleDuplicateSheet}
            onDeleteSheet={handleDeleteSheet}
            theme={settings.theme || 'light'}
          />
        </div>
      </div>

      {/* Dialog Modals */}
      <TruthTableModal
        nodes={currentSheet.nodes}
        wires={currentSheet.wires}
        isOpen={isTruthTableOpen}
        onClose={() => setIsTruthTableOpen(false)}
        onApplyRowInputs={handleApplyTruthTableRow}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        sheets={activeProject?.sheets || [currentSheet]}
        activeSheetId={activeProject?.activeSheetId || currentSheet.id}
        onClose={() => setIsExportModalOpen(false)}
        onImportSheets={(imported) => {
          if (!activeProject) return;
          if (imported.length === 0) return;
          setProjects((prev) =>
            prev.map((p) => (p.id === activeProject.id ? { ...p, sheets: imported } : p))
          );
        }}
        onResetToDefaults={() => {
          if (!activeProject) return;
          const defaults = createPresetSheets();
          setProjects((prev) =>
            prev.map((p) => (p.id === activeProject.id ? { ...p, sheets: defaults } : p))
          );
        }}
      />

      <ShortcutsModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
