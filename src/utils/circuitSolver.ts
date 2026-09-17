import { CircuitNode, NodeType, Pin, TruthTableEntry, Wire } from '../types';
import { computeCircuitExpressions } from './booleanAlgebra';

export function getNodeDimensions(type: NodeType): { width: number; height: number } {
  switch (type) {
    case 'AND':
    case 'OR':
    case 'NAND':
    case 'NOR':
    case 'XOR':
    case 'XNOR':
      return { width: 110, height: 72 };
    case 'NOT':
    case 'BUFFER':
      return { width: 100, height: 60 };
    case 'TRI_STATE':
      return { width: 100, height: 64 };
    case 'D_FLIP_FLOP':
    case 'T_FLIP_FLOP':
      return { width: 110, height: 80 };
    case 'JK_FLIP_FLOP':
    case 'SR_FLIP_FLOP':
      return { width: 110, height: 88 };
    case 'HALF_ADDER':
      return { width: 110, height: 80 };
    case 'FULL_ADDER':
      return { width: 110, height: 88 };
    case 'MUX_2TO1':
    case 'DEMUX_1TO2':
      return { width: 96, height: 72 };
    case 'SWITCH':
      return { width: 88, height: 54 };
    case 'BUTTON':
      return { width: 78, height: 58 };
    case 'CLOCK':
      return { width: 90, height: 54 };
    case 'HIGH_CONST':
    case 'LOW_CONST':
      return { width: 76, height: 44 };
    case 'LED':
      return { width: 68, height: 76 };
    case 'PROBE':
      return { width: 96, height: 58 };
    case 'SEVEN_SEG':
      return { width: 96, height: 120 };
    case 'BUZZER':
      return { width: 78, height: 64 };
    default:
      return { width: 100, height: 70 };
  }
}

/**
 * Reconfigures pin count for multi-input logic gates (2 to 8 inputs)
 */
export function updateGateInputCount(node: CircuitNode, newCount: number): CircuitNode {
  const count = Math.max(2, Math.min(8, newCount));
  const height = node.height;
  const newInputs: Pin[] = [];

  const pinLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  for (let i = 0; i < count; i++) {
    let offsetY = 36;
    if (count === 2) {
      offsetY = i === 0 ? 22 : 50;
    } else if (count === 3) {
      offsetY = i === 0 ? 18 : i === 1 ? 36 : 54;
    } else if (count === 4) {
      offsetY = 16 + i * 14;
    } else {
      offsetY = 14 + (i / (count - 1)) * 44;
    }

    const existingPin = node.inputs[i];
    newInputs.push({
      id: existingPin ? existingPin.id : `${node.id}_in_${i}`,
      nodeId: node.id,
      type: 'input',
      name: pinLetters[i] || `IN_${i}`,
      index: i,
      offsetX: 2,
      offsetY: Math.round(offsetY),
      value: existingPin ? existingPin.value : false,
      expression: existingPin ? existingPin.expression : undefined,
    });
  }

  return {
    ...node,
    inputs: newInputs,
    state: {
      ...node.state,
      inputCount: count,
    },
  };
}

export function createDefaultNode(
  type: NodeType,
  x: number,
  y: number,
  id?: string,
  stateOverride?: CircuitNode['state'],
  customLabel?: string
): CircuitNode {
  const nodeId = id || `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const { width, height } = getNodeDimensions(type);

  const inputs: Pin[] = [];
  const outputs: Pin[] = [];

  const initialInputCount = stateOverride?.inputCount || 2;

  switch (type) {
    case 'AND':
    case 'OR':
    case 'NAND':
    case 'NOR':
    case 'XOR':
    case 'XNOR': {
      const pinLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      for (let i = 0; i < initialInputCount; i++) {
        let offsetY = 36;
        if (initialInputCount === 2) {
          offsetY = i === 0 ? 22 : 50;
        } else if (initialInputCount === 3) {
          offsetY = i === 0 ? 18 : i === 1 ? 36 : 54;
        } else {
          offsetY = 16 + i * 14;
        }

        inputs.push({
          id: `${nodeId}_in_${i}`,
          nodeId,
          type: 'input',
          name: pinLetters[i],
          index: i,
          offsetX: 2,
          offsetY: Math.round(offsetY),
          value: false,
        });
      }

      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'Q',
        index: 0,
        offsetX: 108,
        offsetY: 36,
        value: false,
      });
      break;
    }

    case 'NOT':
    case 'BUFFER': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'A',
        index: 0,
        offsetX: 2,
        offsetY: 30,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'Q',
        index: 0,
        offsetX: 98,
        offsetY: 30,
        value: type === 'NOT' ? true : false,
      });
      break;
    }

    case 'SWITCH': {
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'OUT',
        index: 0,
        offsetX: 86,
        offsetY: 27,
        value: stateOverride?.isOn ?? false,
      });
      break;
    }

    case 'BUTTON': {
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'OUT',
        index: 0,
        offsetX: 76,
        offsetY: 29,
        value: stateOverride?.isOn ?? false,
      });
      break;
    }

    case 'CLOCK': {
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'CLK',
        index: 0,
        offsetX: 88,
        offsetY: 27,
        value: false,
      });
      break;
    }

    case 'HIGH_CONST': {
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: '1',
        index: 0,
        offsetX: 74,
        offsetY: 22,
        value: true,
      });
      break;
    }

    case 'LOW_CONST': {
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: '0',
        index: 0,
        offsetX: 74,
        offsetY: 22,
        value: false,
      });
      break;
    }

    case 'LED': {
      // Light Bulb: terminal at the bottom lead of the bulb base
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'IN',
        index: 0,
        offsetX: 34,
        offsetY: 74,
        value: false,
      });
      break;
    }

    case 'PROBE': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'IN',
        index: 0,
        offsetX: 2,
        offsetY: 29,
        value: false,
      });
      break;
    }

    case 'BUZZER': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'IN',
        index: 0,
        offsetX: 2,
        offsetY: 32,
        value: false,
      });
      break;
    }

    case 'SEVEN_SEG': {
      const pinNames = ['A (1)', 'B (2)', 'C (4)', 'D (8)'];
      for (let i = 0; i < 4; i++) {
        inputs.push({
          id: `${nodeId}_in_${i}`,
          nodeId,
          type: 'input',
          name: pinNames[i],
          index: i,
          offsetX: 2,
          offsetY: 26 + i * 24,
          value: false,
        });
      }
      break;
    }

    case 'TRI_STATE': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'IN',
        index: 0,
        offsetX: 2,
        offsetY: 24,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_1`,
        nodeId,
        type: 'input',
        name: 'EN',
        index: 1,
        offsetX: 48,
        offsetY: 60,
        value: true,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'OUT',
        index: 0,
        offsetX: 98,
        offsetY: 24,
        value: false,
      });
      break;
    }

    case 'D_FLIP_FLOP': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'D',
        index: 0,
        offsetX: 2,
        offsetY: 24,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_1`,
        nodeId,
        type: 'input',
        name: 'CLK',
        index: 1,
        offsetX: 2,
        offsetY: 56,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'Q',
        index: 0,
        offsetX: 108,
        offsetY: 24,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_1`,
        nodeId,
        type: 'output',
        name: '~Q',
        index: 1,
        offsetX: 108,
        offsetY: 56,
        value: true,
      });
      break;
    }

    case 'T_FLIP_FLOP': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'T',
        index: 0,
        offsetX: 2,
        offsetY: 24,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_1`,
        nodeId,
        type: 'input',
        name: 'CLK',
        index: 1,
        offsetX: 2,
        offsetY: 56,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'Q',
        index: 0,
        offsetX: 108,
        offsetY: 24,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_1`,
        nodeId,
        type: 'output',
        name: '~Q',
        index: 1,
        offsetX: 108,
        offsetY: 56,
        value: true,
      });
      break;
    }

    case 'JK_FLIP_FLOP': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'J',
        index: 0,
        offsetX: 2,
        offsetY: 20,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_1`,
        nodeId,
        type: 'input',
        name: 'CLK',
        index: 1,
        offsetX: 2,
        offsetY: 44,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_2`,
        nodeId,
        type: 'input',
        name: 'K',
        index: 2,
        offsetX: 2,
        offsetY: 68,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'Q',
        index: 0,
        offsetX: 108,
        offsetY: 24,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_1`,
        nodeId,
        type: 'output',
        name: '~Q',
        index: 1,
        offsetX: 108,
        offsetY: 64,
        value: true,
      });
      break;
    }

    case 'SR_FLIP_FLOP': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'S',
        index: 0,
        offsetX: 2,
        offsetY: 20,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_1`,
        nodeId,
        type: 'input',
        name: 'CLK',
        index: 1,
        offsetX: 2,
        offsetY: 44,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_2`,
        nodeId,
        type: 'input',
        name: 'R',
        index: 2,
        offsetX: 2,
        offsetY: 68,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'Q',
        index: 0,
        offsetX: 108,
        offsetY: 24,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_1`,
        nodeId,
        type: 'output',
        name: '~Q',
        index: 1,
        offsetX: 108,
        offsetY: 64,
        value: true,
      });
      break;
    }

    case 'HALF_ADDER': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'A',
        index: 0,
        offsetX: 2,
        offsetY: 24,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_1`,
        nodeId,
        type: 'input',
        name: 'B',
        index: 1,
        offsetX: 2,
        offsetY: 56,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'SUM',
        index: 0,
        offsetX: 108,
        offsetY: 24,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_1`,
        nodeId,
        type: 'output',
        name: 'CARRY',
        index: 1,
        offsetX: 108,
        offsetY: 56,
        value: false,
      });
      break;
    }

    case 'FULL_ADDER': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'A',
        index: 0,
        offsetX: 2,
        offsetY: 20,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_1`,
        nodeId,
        type: 'input',
        name: 'B',
        index: 1,
        offsetX: 2,
        offsetY: 44,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_2`,
        nodeId,
        type: 'input',
        name: 'Cin',
        index: 2,
        offsetX: 2,
        offsetY: 68,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'SUM',
        index: 0,
        offsetX: 108,
        offsetY: 28,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_1`,
        nodeId,
        type: 'output',
        name: 'Cout',
        index: 1,
        offsetX: 108,
        offsetY: 60,
        value: false,
      });
      break;
    }

    case 'MUX_2TO1': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'D0',
        index: 0,
        offsetX: 2,
        offsetY: 20,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_1`,
        nodeId,
        type: 'input',
        name: 'D1',
        index: 1,
        offsetX: 2,
        offsetY: 50,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_2`,
        nodeId,
        type: 'input',
        name: 'SEL',
        index: 2,
        offsetX: 48,
        offsetY: 70,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'Y',
        index: 0,
        offsetX: 94,
        offsetY: 35,
        value: false,
      });
      break;
    }

    case 'DEMUX_1TO2': {
      inputs.push({
        id: `${nodeId}_in_0`,
        nodeId,
        type: 'input',
        name: 'IN',
        index: 0,
        offsetX: 2,
        offsetY: 35,
        value: false,
      });
      inputs.push({
        id: `${nodeId}_in_1`,
        nodeId,
        type: 'input',
        name: 'SEL',
        index: 1,
        offsetX: 48,
        offsetY: 70,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_0`,
        nodeId,
        type: 'output',
        name: 'Y0',
        index: 0,
        offsetX: 94,
        offsetY: 20,
        value: false,
      });
      outputs.push({
        id: `${nodeId}_out_1`,
        nodeId,
        type: 'output',
        name: 'Y1',
        index: 1,
        offsetX: 94,
        offsetY: 50,
        value: false,
      });
      break;
    }
  }

  const defaultLabel = customLabel || type;

  return {
    id: nodeId,
    type,
    label: defaultLabel,
    x,
    y,
    width,
    height,
    inputs,
    outputs,
    state: {
      isOn: false,
      frequencyHz: 1,
      color: '#10b981',
      variableName:
        stateOverride?.variableName ||
        (type === 'SWITCH' || type === 'BUTTON'
          ? customLabel || 'A'
          : type === 'CLOCK'
          ? 'CLK'
          : type === 'HIGH_CONST'
          ? 'VCC'
          : type === 'LOW_CONST'
          ? 'GND'
          : ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'BUFFER', 'TRI_STATE'].includes(type)
          ? 'Y'
          : ['D_FLIP_FLOP', 'JK_FLIP_FLOP', 'SR_FLIP_FLOP', 'T_FLIP_FLOP'].includes(type)
          ? 'Q'
          : type === 'HALF_ADDER' || type === 'FULL_ADDER'
          ? 'SUM'
          : type === 'MUX_2TO1' || type === 'DEMUX_1TO2'
          ? 'Y'
          : type === 'PROBE' || type === 'LED'
          ? customLabel || 'OUT'
          : type === 'SEVEN_SEG'
          ? 'HEX'
          : type === 'BUZZER'
          ? 'BUZZ'
          : undefined),
      ...stateOverride,
    },
  };
}

/**
 * Evaluates the circuit by propagating logic levels through wires and gates.
 * Uses an iterative fixed-point loop to handle sequential feedback (latches, oscillators).
 */
export function evaluateCircuit(
  nodes: CircuitNode[],
  wires: Wire[],
  timeMs: number = Date.now()
): { nodes: CircuitNode[]; wires: Wire[]; buzzerActive: boolean } {
  // Clone nodes and wires to preserve immutability
  const nodeMap = new Map<string, CircuitNode>();
  nodes.forEach((n) => {
    nodeMap.set(n.id, {
      ...n,
      inputs: n.inputs.map((p) => ({ ...p })),
      outputs: n.outputs.map((p) => ({ ...p })),
      state: { ...n.state },
    });
  });

  const updatedWires: Wire[] = wires.map((w) => ({ ...w }));

  // 1. Evaluate clock nodes based on current timestamp
  nodeMap.forEach((node) => {
    if (node.type === 'CLOCK') {
      const freq = node.state.frequencyHz || 1;
      const periodMs = 1000 / freq;
      const halfPeriod = periodMs / 2;
      const phase = timeMs % periodMs;
      const clkVal = phase < halfPeriod;
      if (node.outputs[0]) {
        node.outputs[0].value = clkVal;
      }
    } else if (node.type === 'SWITCH' || node.type === 'BUTTON') {
      if (node.outputs[0]) {
        node.outputs[0].value = Boolean(node.state.isOn);
      }
    } else if (node.type === 'HIGH_CONST') {
      if (node.outputs[0]) {
        node.outputs[0].value = true;
      }
    } else if (node.type === 'LOW_CONST') {
      if (node.outputs[0]) {
        node.outputs[0].value = false;
      }
    }
  });

  // 2. Iterative relaxation solver (up to 12 passes for feedback loops)
  const MAX_PASSES = 12;
  let hasChanged = true;
  let pass = 0;

  while (hasChanged && pass < MAX_PASSES) {
    hasChanged = false;
    pass++;

    // Propagate output pin values through wires to input pins
    for (const wire of updatedWires) {
      const sourceNode = nodeMap.get(wire.fromNodeId);
      const targetNode = nodeMap.get(wire.toNodeId);
      if (!sourceNode || !targetNode) continue;

      const sourcePin = sourceNode.outputs.find((p) => p.id === wire.fromPinId);
      const targetPin = targetNode.inputs.find((p) => p.id === wire.toPinId);

      if (sourcePin && targetPin) {
        const sourceVal = sourcePin.value;
        wire.value = sourceVal;
        if (targetPin.value !== sourceVal) {
          targetPin.value = sourceVal;
          hasChanged = true;
        }
      }
    }

    // Evaluate logic gates based on current input values
    nodeMap.forEach((node) => {
      const inVals = node.inputs.map((p) => p.value);
      let outVal = false;

      switch (node.type) {
        case 'AND':
          outVal = inVals.length > 0 && inVals.every(Boolean);
          break;
        case 'OR':
          outVal = inVals.some(Boolean);
          break;
        case 'NOT':
          outVal = !inVals[0];
          break;
        case 'NAND':
          outVal = !(inVals.length > 0 && inVals.every(Boolean));
          break;
        case 'NOR':
          outVal = !inVals.some(Boolean);
          break;
        case 'XOR': {
          const trueCount = inVals.filter(Boolean).length;
          outVal = trueCount % 2 === 1;
          break;
        }
        case 'XNOR': {
          const trueCount = inVals.filter(Boolean).length;
          outVal = trueCount % 2 === 0;
          break;
        }
        case 'BUFFER':
          outVal = Boolean(inVals[0]);
          break;
        case 'TRI_STATE': {
          const inVal = Boolean(inVals[0]);
          const enVal = inVals[1] !== undefined ? Boolean(inVals[1]) : true;
          outVal = enVal ? inVal : false;
          break;
        }

        case 'HALF_ADDER': {
          const a = Boolean(inVals[0]);
          const b = Boolean(inVals[1]);
          const sum = a !== b;
          const carry = a && b;
          if (node.outputs[0] && node.outputs[0].value !== sum) {
            node.outputs[0].value = sum;
            hasChanged = true;
          }
          if (node.outputs[1] && node.outputs[1].value !== carry) {
            node.outputs[1].value = carry;
            hasChanged = true;
          }
          return;
        }

        case 'FULL_ADDER': {
          const a = Boolean(inVals[0]);
          const b = Boolean(inVals[1]);
          const cin = Boolean(inVals[2]);
          const sum = (a !== b) !== cin;
          const cout = (a && b) || (cin && (a !== b));
          if (node.outputs[0] && node.outputs[0].value !== sum) {
            node.outputs[0].value = sum;
            hasChanged = true;
          }
          if (node.outputs[1] && node.outputs[1].value !== cout) {
            node.outputs[1].value = cout;
            hasChanged = true;
          }
          return;
        }

        case 'MUX_2TO1': {
          const d0 = Boolean(inVals[0]);
          const d1 = Boolean(inVals[1]);
          const sel = Boolean(inVals[2]);
          const y = sel ? d1 : d0;
          if (node.outputs[0] && node.outputs[0].value !== y) {
            node.outputs[0].value = y;
            hasChanged = true;
          }
          return;
        }

        case 'DEMUX_1TO2': {
          const inputSig = Boolean(inVals[0]);
          const sel = Boolean(inVals[1]);
          const y0 = !sel ? inputSig : false;
          const y1 = sel ? inputSig : false;
          if (node.outputs[0] && node.outputs[0].value !== y0) {
            node.outputs[0].value = y0;
            hasChanged = true;
          }
          if (node.outputs[1] && node.outputs[1].value !== y1) {
            node.outputs[1].value = y1;
            hasChanged = true;
          }
          return;
        }

        case 'D_FLIP_FLOP': {
          const d = Boolean(inVals[0]);
          const clk = Boolean(inVals[1]);
          const isRisingEdge = clk && !node.state.prevClk;
          if (node.state.q === undefined) {
            node.state.q = false;
            node.state.qBar = true;
          }
          if (isRisingEdge) {
            node.state.q = d;
            node.state.qBar = !d;
          }
          if (node.outputs[0] && node.outputs[0].value !== node.state.q) {
            node.outputs[0].value = Boolean(node.state.q);
            hasChanged = true;
          }
          if (node.outputs[1] && node.outputs[1].value !== node.state.qBar) {
            node.outputs[1].value = Boolean(node.state.qBar);
            hasChanged = true;
          }
          return;
        }

        case 'T_FLIP_FLOP': {
          const t = Boolean(inVals[0]);
          const clk = Boolean(inVals[1]);
          const isRisingEdge = clk && !node.state.prevClk;
          if (node.state.q === undefined) {
            node.state.q = false;
            node.state.qBar = true;
          }
          if (isRisingEdge && t) {
            node.state.q = !node.state.q;
            node.state.qBar = !node.state.q;
          }
          if (node.outputs[0] && node.outputs[0].value !== node.state.q) {
            node.outputs[0].value = Boolean(node.state.q);
            hasChanged = true;
          }
          if (node.outputs[1] && node.outputs[1].value !== node.state.qBar) {
            node.outputs[1].value = Boolean(node.state.qBar);
            hasChanged = true;
          }
          return;
        }

        case 'JK_FLIP_FLOP': {
          const j = Boolean(inVals[0]);
          const clk = Boolean(inVals[1]);
          const k = Boolean(inVals[2]);
          const isRisingEdge = clk && !node.state.prevClk;
          if (node.state.q === undefined) {
            node.state.q = false;
            node.state.qBar = true;
          }
          if (isRisingEdge) {
            if (j && k) {
              node.state.q = !node.state.q;
            } else if (j) {
              node.state.q = true;
            } else if (k) {
              node.state.q = false;
            }
            node.state.qBar = !node.state.q;
          }
          if (node.outputs[0] && node.outputs[0].value !== node.state.q) {
            node.outputs[0].value = Boolean(node.state.q);
            hasChanged = true;
          }
          if (node.outputs[1] && node.outputs[1].value !== node.state.qBar) {
            node.outputs[1].value = Boolean(node.state.qBar);
            hasChanged = true;
          }
          return;
        }

        case 'SR_FLIP_FLOP': {
          const s = Boolean(inVals[0]);
          const clk = Boolean(inVals[1]);
          const r = Boolean(inVals[2]);
          const isRisingEdge = clk && !node.state.prevClk;
          if (node.state.q === undefined) {
            node.state.q = false;
            node.state.qBar = true;
          }
          if (isRisingEdge) {
            if (s && r) {
              node.state.q = false;
              node.state.qBar = false;
            } else if (s) {
              node.state.q = true;
              node.state.qBar = false;
            } else if (r) {
              node.state.q = false;
              node.state.qBar = true;
            } else {
              node.state.qBar = !node.state.q;
            }
          }
          if (node.outputs[0] && node.outputs[0].value !== node.state.q) {
            node.outputs[0].value = Boolean(node.state.q);
            hasChanged = true;
          }
          if (node.outputs[1] && node.outputs[1].value !== node.state.qBar) {
            node.outputs[1].value = Boolean(node.state.qBar);
            hasChanged = true;
          }
          return;
        }

        default:
          return;
      }

      if (node.outputs[0] && node.outputs[0].value !== outVal) {
        node.outputs[0].value = outVal;
        hasChanged = true;
      }
    });
  }

  // Update prevClk on sequential nodes for edge detection on the next simulation cycle
  nodeMap.forEach((node) => {
    if (
      node.type === 'D_FLIP_FLOP' ||
      node.type === 'T_FLIP_FLOP' ||
      node.type === 'JK_FLIP_FLOP' ||
      node.type === 'SR_FLIP_FLOP'
    ) {
      node.state.prevClk = Boolean(node.inputs[1]?.value);
    }
  });

  let buzzerActive = false;
    nodeMap.forEach((node) => {
      if (node.type === 'BUZZER' && node.inputs[0]?.value) {
        buzzerActive = true;
      }
    });

    const evaluatedNodes = Array.from(nodeMap.values());

    // 4. Compute symbolic Boolean algebra expressions for all pins, wires, and nodes
    try {
      const { nodeExpressions, wireExpressions } = computeCircuitExpressions(evaluatedNodes, updatedWires);

      updatedWires.forEach((w) => {
        w.expression = wireExpressions.get(w.id);
      });

      evaluatedNodes.forEach((node) => {
        const exprData = nodeExpressions.get(node.id);
        if (exprData) {
          node.inputs.forEach((pin, idx) => {
            pin.expression = exprData.inputs[idx];
          });
          node.outputs.forEach((pin, idx) => {
            pin.expression = exprData.outputs[idx];
          });
          if (exprData.outputs[0] !== undefined) {
            node.state.computedExpression = exprData.outputs[0];
          }
        }
      });
    } catch (e) {
      console.warn('Error evaluating symbolic expressions:', e);
    }

    return {
      nodes: evaluatedNodes,
      wires: updatedWires,
      buzzerActive,
    };
  }

/**
 * 7-Segment display decoder:
 * Takes 4 binary inputs (A: bit 0, B: bit 1, C: bit 2, D: bit 3)
 * Returns array of 7 segment booleans: [a, b, c, d, e, f, g] and hex character
 */
export function decodeSevenSegment(inputs: boolean[]): {
  segments: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  hexChar: string;
} {
  const val =
    (inputs[0] ? 1 : 0) +
    (inputs[1] ? 2 : 0) +
    (inputs[2] ? 4 : 0) +
    (inputs[3] ? 8 : 0);

  const hexChar = val.toString(16).toUpperCase();

  // Segment mapping: a (top), b (top-right), c (bottom-right), d (bottom), e (bottom-left), f (top-left), g (center)
  const segmentTable: Record<number, [boolean, boolean, boolean, boolean, boolean, boolean, boolean]> = {
    0: [true, true, true, true, true, true, false],
    1: [false, true, true, false, false, false, false],
    2: [true, true, false, true, true, false, true],
    3: [true, true, true, true, false, false, true],
    4: [false, true, true, false, false, true, true],
    5: [true, false, true, true, false, true, true],
    6: [true, false, true, true, true, true, true],
    7: [true, true, true, false, false, false, false],
    8: [true, true, true, true, true, true, true],
    9: [true, true, true, true, false, true, true],
    10: [true, true, true, false, true, true, true], // A
    11: [false, false, true, true, true, true, true], // b
    12: [true, false, false, true, true, true, false], // C
    13: [false, true, true, true, true, false, true], // d
    14: [true, false, false, true, true, true, true], // E
    15: [true, false, false, false, true, true, true], // F
  };

  return {
    segments: segmentTable[val] || [false, false, false, false, false, false, false],
    hexChar,
  };
}

/**
 * Computes an automated Truth Table for the circuit.
 * Identifies primary user inputs (SWITCH, BUTTON) and outputs (LED, PROBE, BUZZER).
 */
export function generateTruthTable(
  nodes: CircuitNode[],
  wires: Wire[]
): { inputNames: string[]; outputNames: string[]; entries: TruthTableEntry[] } {
  const inputNodes = nodes.filter((n) => n.type === 'SWITCH' || n.type === 'BUTTON');
  const outputNodes = nodes.filter(
    (n) => n.type === 'LED' || n.type === 'PROBE' || n.type === 'BUZZER'
  );

  if (inputNodes.length === 0 || outputNodes.length === 0) {
    return { inputNames: [], outputNames: [], entries: [] };
  }

  // Cap inputs to 6 (64 combinations) to prevent browser stutter
  const selectedInputs = inputNodes.slice(0, 6);
  const totalCombinations = 1 << selectedInputs.length;
  const entries: TruthTableEntry[] = [];

  // Deduplicate names to guarantee uniqueness in headers and entry records
  const getUniqueNames = (itemNodes: CircuitNode[]) => {
    const labelCounts = new Map<string, number>();
    itemNodes.forEach((n) => {
      const lbl = n.state.variableName || n.label || n.type;
      labelCounts.set(lbl, (labelCounts.get(lbl) || 0) + 1);
    });

    const currentCounts = new Map<string, number>();
    return itemNodes.map((n) => {
      const lbl = n.state.variableName || n.label || n.type;
      if ((labelCounts.get(lbl) || 0) > 1) {
        const c = (currentCounts.get(lbl) || 0) + 1;
        currentCounts.set(lbl, c);
        return `${lbl} #${c}`;
      }
      return lbl;
    });
  };

  const inputNames = getUniqueNames(selectedInputs);
  const outputNames = getUniqueNames(outputNodes);

  for (let i = 0; i < totalCombinations; i++) {
    // Set inputs for this combination
    const simNodes = nodes.map((n) => {
      const inIdx = selectedInputs.findIndex((inp) => inp.id === n.id);
      if (inIdx !== -1) {
        const bitVal = Boolean((i >> (selectedInputs.length - 1 - inIdx)) & 1);
        return {
          ...n,
          state: { ...n.state, isOn: bitVal },
          outputs: n.outputs.map((p) => ({ ...p, value: bitVal })),
        };
      }
      return n;
    });

    const evaluated = evaluateCircuit(simNodes, wires, 0);

    const inputRow: Record<string, boolean> = {};
    selectedInputs.forEach((inp, idx) => {
      inputRow[inputNames[idx]] = Boolean((i >> (selectedInputs.length - 1 - idx)) & 1);
    });

    const outputRow: Record<string, boolean> = {};
    outputNodes.forEach((outNode, idx) => {
      const evaluatedOut = evaluated.nodes.find((n) => n.id === outNode.id);
      outputRow[outputNames[idx]] = evaluatedOut?.inputs[0]?.value ?? false;
    });

    entries.push({
      inputs: inputRow,
      outputs: outputRow,
    });
  }

  return { inputNames, outputNames, entries };
}
