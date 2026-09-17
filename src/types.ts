export type GateType =
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'NAND'
  | 'NOR'
  | 'XOR'
  | 'XNOR'
  | 'BUFFER'
  | 'TRI_STATE';

export type FlipFlopType =
  | 'D_FLIP_FLOP'
  | 'JK_FLIP_FLOP'
  | 'SR_FLIP_FLOP'
  | 'T_FLIP_FLOP';

export type CombinationalType =
  | 'HALF_ADDER'
  | 'FULL_ADDER'
  | 'MUX_2TO1'
  | 'DEMUX_1TO2';

export type InputType =
  | 'SWITCH'
  | 'BUTTON'
  | 'CLOCK'
  | 'HIGH_CONST'
  | 'LOW_CONST';

export type OutputType =
  | 'LED'
  | 'PROBE'
  | 'SEVEN_SEG'
  | 'BUZZER';

export type NodeType =
  | GateType
  | FlipFlopType
  | CombinationalType
  | InputType
  | OutputType;

export interface Pin {
  id: string;
  nodeId: string;
  type: 'input' | 'output';
  name: string;
  index: number;
  // Offset relative to node top-left
  offsetX: number;
  offsetY: number;
  value: boolean;
  expression?: string;
}

export interface CircuitNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: Pin[];
  outputs: Pin[];
  // Internal state for interactive elements (e.g. switch isOn, clock freq, etc.)
  state: {
    isOn?: boolean;
    frequencyHz?: number;
    color?: string;
    customLabel?: string;
    variableName?: string;
    computedExpression?: string;
    inputCount?: number;
    lastToggleTime?: number;
    prevClk?: boolean;
    q?: boolean;
    qBar?: boolean;
  };
}

export interface Wire {
  id: string;
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
  value: boolean;
  expression?: string;
}

export interface Sheet {
  id: string;
  name: string;
  nodes: CircuitNode[];
  wires: Wire[];
  pan: { x: number; y: number };
  zoom: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  sheets: Sheet[];
  activeSheetId: string;
  createdAt: number;
  updatedAt: number;
}

export interface SimulationSettings {
  running: boolean;
  clockHz: number;
  speedMs: number;
  showGrid: boolean;
  snapToGrid: boolean;
  wireStyle: 'curved' | 'orthogonal';
  soundEnabled: boolean;
  showTimingDiagram: boolean;
  theme?: 'dark' | 'light';
  showWireExpressions?: boolean;
  showComponentVariables?: boolean;
}

export interface DraggingWire {
  fromNodeId: string;
  fromPinId: string;
  fromPinType: 'input' | 'output';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  hoverPinId?: string;
  isSnapped?: boolean;
}

export interface TruthTableEntry {
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
}
