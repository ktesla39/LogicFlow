import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CircuitNode, DraggingWire, Pin, Sheet, Wire } from '../types';
import { WireRenderer } from './WireRenderer';
import { NodeComponent } from './NodeComponent';
import { createDefaultNode, updateGateInputCount } from '../utils/circuitSolver';
import { formatUserVariableInput } from '../utils/booleanAlgebra';
import { sound } from '../utils/sound';
import {
  Play,
  Pause,
  SkipForward,
  ZoomIn,
  ZoomOut,
  Trash2,
  Cpu,
  Minus,
  Plus,
  Maximize2,
  X,
} from 'lucide-react';

interface CanvasProps {
  sheet: Sheet;
  selectedNodeId: string | null;
  selectedWireId: string | null;
  showGrid: boolean;
  snapToGrid: boolean;
  wireStyle: 'curved' | 'orthogonal';
  simulationRunning: boolean;
  theme?: 'dark' | 'light';
  showWireExpressions?: boolean;
  showComponentVariables?: boolean;
  onTogglePlayPause: () => void;
  onStepSimulation: () => void;
  onUpdateSheet: (updated: Partial<Sheet>) => void;
  onSelectNode: (nodeId: string | null) => void;
  onSelectWire: (wireId: string | null) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteWire: (wireId: string) => void;
  onToggleSwitch: (nodeId: string) => void;
  onButtonPress: (nodeId: string, pressed: boolean) => void;
  onUpdateNodeState: (nodeId: string, state: Partial<CircuitNode['state']>) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  sheet,
  selectedNodeId,
  selectedWireId,
  showGrid,
  snapToGrid,
  wireStyle,
  simulationRunning,
  theme = 'light',
  showWireExpressions = false,
  showComponentVariables = true,
  onTogglePlayPause,
  onStepSimulation,
  onUpdateSheet,
  onSelectNode,
  onSelectWire,
  onDeleteNode,
  onDeleteWire,
  onToggleSwitch,
  onButtonPress,
  onUpdateNodeState,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and drag states
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Node drag state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragNodeOffset, setDragNodeOffset] = useState({ x: 0, y: 0 });

  // Wire drawing state
  const [draggingWire, setDraggingWire] = useState<DraggingWire | null>(null);

  // Inspector visibility toggle (only opened on right-click desktop or double-tap mobile)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Multi-touch tracking for pinch-to-zoom
  const touchDistanceRef = useRef<number | null>(null);

  // Selected Node reference
  const selectedNode = sheet.nodes.find((n) => n.id === selectedNodeId) || null;

  // Convert screen coordinates to canvas world coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;
      return {
        x: (clientX - sheet.pan.x) / sheet.zoom,
        y: (clientY - sheet.pan.y) / sheet.zoom,
      };
    },
    [sheet.pan, sheet.zoom]
  );

  // Snapping helper
  const snapCoord = useCallback(
    (val: number, step: number = 16) => {
      if (!snapToGrid) return val;
      return Math.round(val / step) * step;
    },
    [snapToGrid]
  );

  const pendingSheetUpdateRef = useRef<Partial<Sheet> | null>(null);
  const sheetUpdateFrameRef = useRef<number | null>(null);
  const scheduleSheetUpdate = useCallback(
    (updated: Partial<Sheet>) => {
      pendingSheetUpdateRef.current = {
        ...pendingSheetUpdateRef.current,
        ...updated,
      };
      if (sheetUpdateFrameRef.current !== null) return;

      sheetUpdateFrameRef.current = window.requestAnimationFrame(() => {
        sheetUpdateFrameRef.current = null;
        const nextUpdate = pendingSheetUpdateRef.current;
        pendingSheetUpdateRef.current = null;
        if (nextUpdate) onUpdateSheet(nextUpdate);
      });
    },
    [onUpdateSheet]
  );

  useEffect(() => {
    return () => {
      if (sheetUpdateFrameRef.current !== null) {
        window.cancelAnimationFrame(sheetUpdateFrameRef.current);
      }
    };
  }, []);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? sheet.zoom * zoomFactor : sheet.zoom / zoomFactor;
    const clampedZoom = Math.min(Math.max(newZoom, 0.3), 3.0);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPanX = mouseX - (mouseX - sheet.pan.x) * (clampedZoom / sheet.zoom);
    const newPanY = mouseY - (mouseY - sheet.pan.y) * (clampedZoom / sheet.zoom);

    onUpdateSheet({
      zoom: clampedZoom,
      pan: { x: newPanX, y: newPanY },
    });
  };

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, 0.3), 3.0);
    onUpdateSheet({ zoom: clamped });
  };

  // Canvas background mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      onSelectNode(null);
      onSelectWire(null);
      setIsInspectorOpen(false);
      setIsPanning(true);
      setPanStart({ x: e.clientX - sheet.pan.x, y: e.clientY - sheet.pan.y });
    }
  };

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      scheduleSheetUpdate({
        pan: {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        },
      });
      return;
    }

    if (draggedNodeId) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const targetX = snapCoord(worldPos.x - dragNodeOffset.x);
      const targetY = snapCoord(worldPos.y - dragNodeOffset.y);

      const updatedNodes = sheet.nodes.map((node) => {
        if (node.id === draggedNodeId) {
          return { ...node, x: targetX, y: targetY };
        }
        return node;
      });

      scheduleSheetUpdate({ nodes: updatedNodes });
      return;
    }

    if (draggingWire) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const nearest = getNearestTargetPin(worldPos.x, worldPos.y, draggingWire, 32);
      setDraggingWire({
        ...draggingWire,
        currentX: nearest ? nearest.x : worldPos.x,
        currentY: nearest ? nearest.y : worldPos.y,
        hoverPinId: nearest ? nearest.pin.id : undefined,
        isSnapped: !!nearest,
      });
    }
  };

  // Helper to connect a wire between source and destination pins
  const connectWire = (
    sourcePinId: string,
    destPinId: string,
    sourceNodeId: string,
    destNodeId: string
  ) => {
    // Check if identical wire already exists
    const wireExists = sheet.wires.some(
      (w) => w.fromPinId === sourcePinId && w.toPinId === destPinId
    );

    if (!wireExists) {
      // In digital schematic rules, an input terminal can only accept one driver signal wire
      const filteredWires = sheet.wires.filter((w) => w.toPinId !== destPinId);
      const newWire: Wire = {
        id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fromNodeId: sourceNodeId,
        fromPinId: sourcePinId,
        toNodeId: destNodeId,
        toPinId: destPinId,
        value: false,
      };

      onUpdateSheet({ wires: [...filteredWires, newWire] });
      sound.playClick();
    }
  };

  // Find nearest compatible pin for magnetic snapping
  const getNearestTargetPin = useCallback(
    (
      worldX: number,
      worldY: number,
      activeWire: DraggingWire,
      maxDistance: number = 32
    ) => {
      const targetType = activeWire.fromPinType === 'output' ? 'input' : 'output';
      let closest: { pin: Pin; distance: number; x: number; y: number } | null = null;

      for (const n of sheet.nodes) {
        if (n.id === activeWire.fromNodeId) continue;
        const pins = targetType === 'input' ? n.inputs : n.outputs;
        for (const p of pins) {
          if (p.id === activeWire.fromPinId) continue;
          const px = n.x + p.offsetX;
          const py = n.y + p.offsetY;
          const dist = Math.hypot(worldX - px, worldY - py);
          if (dist <= maxDistance) {
            if (!closest || dist < closest.distance) {
              closest = { pin: p, distance: dist, x: px, y: py };
            }
          }
        }
      }
      return closest;
    },
    [sheet.nodes]
  );

  // Mouse up handler
  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (draggedNodeId) setDraggedNodeId(null);

    if (draggingWire) {
      // If releasing over a magnetically snapped or hovered compatible pin
      if (draggingWire.hoverPinId) {
        let foundPin: Pin | null = null;
        for (const n of sheet.nodes) {
          const p = [...n.inputs, ...n.outputs].find((x) => x.id === draggingWire.hoverPinId);
          if (p) {
            foundPin = p;
            break;
          }
        }

        if (foundPin) {
          const isStartOutput = draggingWire.fromPinType === 'output';
          const sourceNodeId = isStartOutput ? draggingWire.fromNodeId : foundPin.nodeId;
          const sourcePinId = isStartOutput ? draggingWire.fromPinId : foundPin.id;
          const destNodeId = isStartOutput ? foundPin.nodeId : draggingWire.fromNodeId;
          const destPinId = isStartOutput ? foundPin.id : draggingWire.fromPinId;
          connectWire(sourcePinId, destPinId, sourceNodeId, destNodeId);
        }
      }
      setDraggingWire(null);
    }
  };

  // Node selection and start drag
  const handleNodeSelect = (nodeId: string, e: React.MouseEvent | React.TouchEvent) => {
    onSelectNode(nodeId);
    onSelectWire(null);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const node = sheet.nodes.find((n) => n.id === nodeId);
    if (node) {
      const worldPos = screenToWorld(clientX, clientY);
      setDragNodeOffset({
        x: worldPos.x - node.x,
        y: worldPos.y - node.y,
      });
      setDraggedNodeId(nodeId);
    }
  };

  // Inspect node properties (called on right-click desktop or double-click/tap mobile)
  const handleInspectNode = (nodeId: string) => {
    onSelectNode(nodeId);
    onSelectWire(null);
    setIsInspectorOpen(true);
    sound.playClick();
  };

  // Start wire creation from a pin
  const handleStartWire = (pin: Pin, e: React.MouseEvent | React.TouchEvent) => {
    const node = sheet.nodes.find((n) => n.id === pin.nodeId);
    if (!node) return;

    const startX = node.x + pin.offsetX;
    const startY = node.y + pin.offsetY;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const worldPos = screenToWorld(clientX, clientY);

    setDraggingWire({
      fromNodeId: pin.nodeId,
      fromPinId: pin.id,
      fromPinType: pin.type,
      startX,
      startY,
      currentX: worldPos.x,
      currentY: worldPos.y,
    });
  };

  // Connect wire on destination pin (direct target release or click)
  const handleEndWire = (targetPin: Pin, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!draggingWire) return;

    if (draggingWire.fromPinId === targetPin.id) {
      setDraggingWire(null);
      return;
    }

    if (draggingWire.fromPinType === targetPin.type) {
      setDraggingWire(null);
      return;
    }

    const isStartOutput = draggingWire.fromPinType === 'output';
    const sourceNodeId = isStartOutput ? draggingWire.fromNodeId : targetPin.nodeId;
    const sourcePinId = isStartOutput ? draggingWire.fromPinId : targetPin.id;
    const destNodeId = isStartOutput ? targetPin.nodeId : draggingWire.fromNodeId;
    const destPinId = isStartOutput ? targetPin.id : draggingWire.fromPinId;

    connectWire(sourcePinId, destPinId, sourceNodeId, destNodeId);
    setDraggingWire(null);
  };

  // Drag & drop from component palette
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/logicflow-type');
    if (!type) return;

    const worldPos = screenToWorld(e.clientX, e.clientY);

    let customLabel: string | undefined;
    let varName: string | undefined;

    if (type === 'SWITCH' || type === 'BUTTON') {
      const usedVars = new Set(
        sheet.nodes
          .filter((n) => n.type === 'SWITCH' || n.type === 'BUTTON')
          .map((n) => n.state.variableName || n.label)
      );
      const varCandidates = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      varName = varCandidates.find((v) => !usedVars.has(v)) || `IN${sheet.nodes.length + 1}`;
      customLabel = varName;
    } else if (type === 'PROBE') {
      const usedVars = new Set(
        sheet.nodes
          .filter((n) => n.type === 'PROBE')
          .map((n) => n.state.variableName || n.label)
      );
      const varCandidates = ['Y', 'Z', 'F', 'Q', 'OUT1', 'OUT2'];
      varName = varCandidates.find((v) => !usedVars.has(v)) || `OUT${sheet.nodes.length + 1}`;
      customLabel = varName;
    }

    const newNode = createDefaultNode(
      type as any,
      snapCoord(worldPos.x - 45),
      snapCoord(worldPos.y - 30),
      undefined,
      varName ? { variableName: varName } : undefined,
      customLabel
    );

    onUpdateSheet({ nodes: [...sheet.nodes, newNode] });
    onSelectNode(newNode.id);
    sound.playClick();
  };

  // Handle gate input count adjustment from Inspector [-] [+]
  const handleInputCountChange = (delta: number) => {
    if (!selectedNode) return;
    const currentCount = selectedNode.inputs.length || 2;
    const newCount = Math.max(2, Math.min(8, currentCount + delta));
    if (newCount === currentCount) return;

    const reconfiguredNode = updateGateInputCount(selectedNode, newCount);
    const validPinIds = new Set(reconfiguredNode.inputs.map((p) => p.id));

    // Remove any wires whose pins are no longer present
    const validWires = sheet.wires.filter(
      (w) => w.toNodeId !== reconfiguredNode.id || validPinIds.has(w.toPinId)
    );

    const updatedNodes = sheet.nodes.map((n) =>
      n.id === reconfiguredNode.id ? reconfiguredNode : n
    );

    onUpdateSheet({ nodes: updatedNodes, wires: validWires });
    sound.playClick();
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      onSelectNode(null);
      onSelectWire(null);
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - sheet.pan.x,
        y: e.touches[0].clientY - sheet.pan.y,
      });
      touchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if (isPanning) {
        scheduleSheetUpdate({
          pan: {
            x: e.touches[0].clientX - panStart.x,
            y: e.touches[0].clientY - panStart.y,
          },
        });
      } else if (draggedNodeId) {
        const worldPos = screenToWorld(e.touches[0].clientX, e.touches[0].clientY);
        const targetX = snapCoord(worldPos.x - dragNodeOffset.x);
        const targetY = snapCoord(worldPos.y - dragNodeOffset.y);

        const updatedNodes = sheet.nodes.map((node) => {
          if (node.id === draggedNodeId) {
            return { ...node, x: targetX, y: targetY };
          }
          return node;
        });
        scheduleSheetUpdate({ nodes: updatedNodes });
      } else if (draggingWire) {
        const worldPos = screenToWorld(e.touches[0].clientX, e.touches[0].clientY);
        const nearest = getNearestTargetPin(worldPos.x, worldPos.y, draggingWire, 36);
        setDraggingWire({
          ...draggingWire,
          currentX: nearest ? nearest.x : worldPos.x,
          currentY: nearest ? nearest.y : worldPos.y,
          hoverPinId: nearest ? nearest.pin.id : undefined,
          isSnapped: !!nearest,
        });
      }
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / touchDistanceRef.current;
      const newZoom = Math.min(Math.max(sheet.zoom * factor, 0.3), 3.0);
      touchDistanceRef.current = dist;
      onUpdateSheet({ zoom: newZoom });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggedNodeId(null);

    if (draggingWire) {
      if (draggingWire.hoverPinId) {
        let foundPin: Pin | null = null;
        for (const n of sheet.nodes) {
          const p = [...n.inputs, ...n.outputs].find((x) => x.id === draggingWire.hoverPinId);
          if (p) {
            foundPin = p;
            break;
          }
        }

        if (foundPin) {
          const isStartOutput = draggingWire.fromPinType === 'output';
          const sourceNodeId = isStartOutput ? draggingWire.fromNodeId : foundPin.nodeId;
          const sourcePinId = isStartOutput ? draggingWire.fromPinId : foundPin.id;
          const destNodeId = isStartOutput ? foundPin.nodeId : draggingWire.fromNodeId;
          const destPinId = isStartOutput ? foundPin.id : draggingWire.fromPinId;
          connectWire(sourcePinId, destPinId, sourceNodeId, destNodeId);
        }
      }
      setDraggingWire(null);
    }
    touchDistanceRef.current = null;
  };

  // Is the selected node a configurable logic gate?
  const isConfigurableGate =
    selectedNode && ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].includes(selectedNode.type);

  const getComponentFriendlyName = (type?: string) => {
    switch (type) {
      case 'AND': return 'AND Gate';
      case 'OR': return 'OR Gate';
      case 'NAND': return 'NAND Gate';
      case 'NOR': return 'NOR Gate';
      case 'XOR': return 'XOR Gate';
      case 'XNOR': return 'XNOR Gate';
      case 'NOT': return 'NOT Gate (Inverter)';
      case 'BUFFER': return 'Buffer';
      case 'TRI_STATE': return 'Tri-State Buffer';
      case 'SWITCH': return 'Toggle Switch';
      case 'BUTTON': return 'Push Button';
      case 'CLOCK': return 'Clock Pulse Oscillator';
      case 'HIGH_CONST': return 'High Constant (1)';
      case 'LOW_CONST': return 'Low Constant (0)';
      case 'LED': return 'Light Bulb';
      case 'SEVEN_SEG': return '4-Bit Digit Display';
      case 'PROBE': return 'Digital Logic Probe';
      case 'BUZZER': return 'Piezo Buzzer Alarm';
      case 'D_FLIP_FLOP': return 'D Flip-Flop';
      case 'T_FLIP_FLOP': return 'T Flip-Flop';
      case 'JK_FLIP_FLOP': return 'JK Flip-Flop';
      case 'SR_FLIP_FLOP': return 'SR Flip-Flop';
      case 'HALF_ADDER': return 'Half Adder';
      case 'FULL_ADDER': return 'Full Adder';
      case 'MUX_2TO1': return '2:1 Multiplexer';
      case 'DEMUX_1TO2': return '1:2 Demultiplexer';
      default: return 'Circuit Component';
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      id="logicflow-canvas"
      className={`relative flex-1 w-full h-full overflow-hidden ${
        isDark ? 'bg-[#0b0f19]' : 'bg-[#e4e7ec]'
      } cursor-grab active:cursor-grabbing select-none`}
      style={{ touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchEndCapture={handleTouchEnd}
    >
      {/* Crisp Grid Lines */}
      {showGrid && (
        <svg id="logicflow-grid-svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-80">
          <defs>
            <pattern
              id="logicflow-canvas-grid"
              x={sheet.pan.x % (20 * sheet.zoom)}
              y={sheet.pan.y % (20 * sheet.zoom)}
              width={20 * sheet.zoom}
              height={20 * sheet.zoom}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${20 * sheet.zoom} 0 L 0 0 0 ${20 * sheet.zoom}`}
                fill="none"
                stroke={isDark ? '#1e293b' : '#cbd5e1'}
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#logicflow-canvas-grid)" />
        </svg>
      )}

      {/* World Transform Container */}
      <div
        className="absolute origin-top-left will-change-transform"
        style={{
          transform: `translate(${sheet.pan.x}px, ${sheet.pan.y}px) scale(${sheet.zoom})`,
        }}
      >
        {/* SVG Wire Layer */}
        <svg
          className="absolute top-0 left-0 overflow-visible pointer-events-none"
          style={{ width: '1px', height: '1px' }}
        >
          <WireRenderer
            wires={sheet.wires}
            nodes={sheet.nodes}
            selectedWireId={selectedWireId}
            draggingWire={draggingWire}
            wireStyle={wireStyle}
            theme={theme}
            showWireExpressions={showWireExpressions}
            onSelectWire={onSelectWire}
            onDeleteWire={onDeleteWire}
          />
        </svg>

        {/* HTML Components Layer */}
        <div className="absolute top-0 left-0 pointer-events-auto">
          {sheet.nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              theme={theme}
              showVariables={showComponentVariables}
              onSelect={handleNodeSelect}
              onInspect={handleInspectNode}
              onDelete={onDeleteNode}
              onStartWire={handleStartWire}
              onEndWire={handleEndWire}
              onToggleSwitch={onToggleSwitch}
              onButtonPress={onButtonPress}
              onUpdateState={onUpdateNodeState}
              onUpdateLabel={(nodeId, newLabel) =>
                onUpdateNodeState(nodeId, { variableName: newLabel })
              }
            />
          ))}
        </div>
      </div>

      {/* Bottom Simulation Controls (Bottom-Left) */}
      <div
        data-export-ignore="true"
        className={`logicflow-export-ignore absolute bottom-4 left-4 z-30 flex items-center rounded-lg shadow-xl overflow-hidden p-1 gap-1 select-none border transition-colors ${
          isDark ? 'bg-[#202428] border-[#33383f]' : 'bg-white/95 border-slate-300 shadow-md'
        }`}
      >
        <button
          type="button"
          onClick={onTogglePlayPause}
          className={`p-2 rounded flex items-center justify-center transition-colors ${
            simulationRunning
              ? 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
              : isDark
              ? 'text-slate-300 hover:bg-[#2b3137]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title={simulationRunning ? 'Pause Simulation' : 'Run Simulation'}
        >
          <Play size={16} fill={simulationRunning ? 'currentColor' : 'none'} />
        </button>
        <button
          type="button"
          onClick={onTogglePlayPause}
          className={`p-2 rounded flex items-center justify-center transition-colors ${
            !simulationRunning
              ? 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
              : isDark
              ? 'text-slate-300 hover:bg-[#2b3137]'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Pause Simulation"
        >
          <Pause size={16} />
        </button>
        <button
          type="button"
          onClick={onStepSimulation}
          className={`p-2 rounded flex items-center justify-center transition-colors ${
            isDark
              ? 'text-slate-300 hover:bg-[#2b3137] hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Single Step Simulation"
          aria-label="Single Step Simulation"
        >
          <SkipForward size={16} />
        </button>
        <div className={`h-5 w-px mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
        <span
          className={`text-[11px] font-mono px-2 font-medium ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {simulationRunning ? 'Running (1.0 kHz)' : 'Paused'}
        </span>
      </div>

      {/* Bottom Zoom Controls (Bottom-Right) */}
      <div
        data-export-ignore="true"
        className={`logicflow-export-ignore absolute bottom-4 right-4 z-30 flex items-center rounded-lg shadow-xl px-3 py-1.5 gap-2.5 select-none border transition-colors ${
          isDark ? 'bg-[#202428] border-[#33383f] text-slate-300' : 'bg-white/95 border-slate-300 text-slate-700 shadow-md'
        }`}
      >
        <button
          type="button"
          onClick={() => handleZoomChange(sheet.zoom - 0.15)}
          className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>

        <input
          type="range"
          min="0.3"
          max="2.5"
          step="0.05"
          value={sheet.zoom}
          onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
          className="w-24 h-1.5 bg-slate-400/40 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
        />

        <button
          type="button"
          onClick={() => handleZoomChange(sheet.zoom + 0.15)}
          className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-950'}`}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>

        <button
          type="button"
          onClick={() => onUpdateSheet({ zoom: 1.0, pan: { x: 80, y: 80 } })}
          className={`text-xs font-mono font-semibold transition-colors ml-1 ${
            isDark ? 'text-slate-200 hover:text-[#38bdf8]' : 'text-slate-800 hover:text-sky-600'
          }`}
          title="Reset to 100%"
        >
          {Math.round(sheet.zoom * 100)}%
        </button>
      </div>

      {/* Floating Inspector Panel (Bottom-Right corner) */}
      {isInspectorOpen && selectedNode && (
        <div
          id="logicflow-inspector"
          data-export-ignore="true"
          className="logicflow-export-ignore absolute bottom-16 right-4 z-40 w-64 rounded-lg shadow-2xl bg-[#1b2026] border border-[#2e353f] overflow-hidden text-slate-100 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with cyan logic gate icon + LogicFlow branding + close button */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#22272e] border-b border-[#2d333b]">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-[#38bdf8]" />
              <span className="font-bold text-xs tracking-wider text-white">LogixFlow</span>
            </div>
            <button
              type="button"
              onClick={() => setIsInspectorOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              title="Close Inspector"
            >
              <X size={13} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-3.5 flex flex-col gap-3">
            {/* Component Title */}
            <div>
              <h3 className="text-sm font-bold text-[#38bdf8] leading-tight">
                {getComponentFriendlyName(selectedNode.type)}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                ID: {selectedNode.id.slice(0, 10)}
              </p>
            </div>

            {/* Input Count Stepper for multi-input logic gates ([-] 2 [+]) */}
            {isConfigurableGate && (
              <div className="flex items-center justify-between bg-[#15191e] p-2 rounded border border-[#2b313a]">
                <span className="text-xs text-slate-300 font-medium">Input Count</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleInputCountChange(-1)}
                    disabled={selectedNode.inputs.length <= 2}
                    className="w-6 h-6 rounded bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-40 disabled:hover:bg-[#0284c7] flex items-center justify-center text-white text-xs font-bold transition-colors"
                    title="Decrease input count"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-xs font-mono font-bold text-white">
                    {selectedNode.inputs.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInputCountChange(1)}
                    disabled={selectedNode.inputs.length >= 8}
                    className="w-6 h-6 rounded bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-40 disabled:hover:bg-[#0284c7] flex items-center justify-center text-white text-xs font-bold transition-colors"
                    title="Increase input count"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Variable Name / Label Editing */}
            <div className="flex items-center justify-between bg-[#15191e] p-2 rounded border border-[#2b313a]">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200 font-medium">Variable Name</span>
                <span className="text-[10px] text-slate-400">Shown above component</span>
              </div>
              <input
                type="text"
                value={selectedNode.state?.variableName ?? selectedNode.label ?? ''}
                onChange={(e) => {
                  const val = formatUserVariableInput(e.target.value);
                  onUpdateNodeState(selectedNode.id, { variableName: val });
                }}
                maxLength={10}
                className="w-20 bg-[#22272e] border border-slate-600 focus:border-[#38bdf8] rounded px-1.5 py-0.5 text-xs font-mono font-bold text-white text-center focus:outline-none"
                placeholder="A"
              />
            </div>

            {/* Quick Toggle for Switch */}
            {selectedNode.type === 'SWITCH' && (
              <button
                type="button"
                onClick={() => onToggleSwitch(selectedNode.id)}
                className={`w-full py-1.5 px-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  selectedNode.state?.isOn
                    ? 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
                    : 'bg-[#282e37] text-slate-300 hover:bg-[#323944]'
                }`}
              >
                <span>State:</span>
                <span>{selectedNode.state?.isOn ? 'HIGH (1)' : 'LOW (0)'}</span>
              </button>
            )}

            {/* Clock Frequency Controller */}
            {selectedNode.type === 'CLOCK' && (
              <div className="flex items-center justify-between bg-[#15191e] p-2 rounded border border-[#2b313a]">
                <span className="text-xs text-slate-300 font-medium">Frequency</span>
                <select
                  value={selectedNode.state?.frequencyHz || 1}
                  onChange={(e) =>
                    onUpdateNodeState(selectedNode.id, {
                      frequencyHz: parseFloat(e.target.value),
                    })
                  }
                  className="bg-[#22272e] border border-slate-600 focus:border-[#38bdf8] rounded px-2 py-0.5 text-xs font-mono font-bold text-white focus:outline-none"
                >
                  <option value={0.5}>0.5 Hz</option>
                  <option value={1}>1 Hz</option>
                  <option value={2}>2 Hz</option>
                  <option value={4}>4 Hz</option>
                  <option value={8}>8 Hz</option>
                </select>
              </div>
            )}

            {/* LED Bulb Color Picker */}
            {selectedNode.type === 'LED' && (
              <div className="flex items-center justify-between bg-[#15191e] p-2 rounded border border-[#2b313a]">
                <span className="text-xs text-slate-300 font-medium">Color</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { color: '#10b981', title: 'Green' },
                    { color: '#38bdf8', title: 'Sky Blue' },
                    { color: '#ef4444', title: 'Red' },
                    { color: '#f59e0b', title: 'Amber' },
                    { color: '#a855f7', title: 'Purple' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      title={c.title}
                      onClick={() => onUpdateNodeState(selectedNode.id, { color: c.color })}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        (selectedNode.state?.color || '#10b981') === c.color
                          ? 'scale-125 ring-2 ring-white'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Output State Indicator - Supports all multi-output components */}
            {selectedNode.outputs.length > 0 && (
              <div className="flex flex-col gap-1 py-0.5">
                <span className="text-slate-400 text-xs">
                  {selectedNode.outputs.length === 1 ? 'Output Logic:' : 'Outputs:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.outputs.map((outPin) => (
                    <span
                      key={outPin.id}
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        outPin.value
                          ? 'bg-sky-950 text-[#38bdf8] border border-sky-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {outPin.name}: {outPin.value ? '1 (HIGH)' : '0 (LOW)'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Boolean Algebra Expression (if available) */}
            {selectedNode.state?.computedExpression && (
              <div className="flex flex-col gap-1 bg-[#15191e] p-2 rounded border border-[#2b313a]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Boolean Formula
                </span>
                <span className="text-xs font-mono font-bold text-[#38bdf8] truncate">
                  {selectedNode.state.computedExpression}
                </span>
              </div>
            )}

            {/* Delete Component Button */}
            <button
              type="button"
              onClick={() => {
                onDeleteNode(selectedNode.id);
                setIsInspectorOpen(false);
              }}
              className="w-full mt-1 py-1.5 px-2 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 size={13} />
              <span>Delete Component</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State Help hint if canvas is empty */}
      {sheet.nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-slate-500">
          <div
            className={`p-5 sm:p-6 border border-dashed rounded-2xl flex flex-col items-center max-w-sm mx-4 text-center shadow-lg transition-colors backdrop-blur-sm ${
              isDark
                ? 'border-slate-700/80 bg-slate-900/85 text-slate-400'
                : 'border-slate-300 bg-white/90 text-slate-600'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
              <Cpu size={27} className="text-[#0284c7]" />
            </div>
            <span className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              LogixFlow Circuit Canvas
            </span>
            <p className="text-xs mt-1.5 leading-relaxed">
              <span className="hidden sm:inline">Drag logic gates, switches, and bulbs from the sidebar to start creating your circuit. </span>
              <span className="sm:hidden">Tap the + button above to add your first component. </span>
              Right-click on desktop or double-tap on mobile to inspect properties.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
