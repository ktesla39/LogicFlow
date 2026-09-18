import { CircuitNode, Wire } from '../types';

/**
 * Intelligent Boolean Symbolic Algebra Engine
 * Implements standard Boolean algebraic notation:
 * - A + B for OR
 * - A · B for AND
 * - Ā (overbar / complement) for NOT / negation
 * - (A.B)̄ for NAND
 * - (A + B)̄ for NOR
 * - A ⊕ B for XOR
 * - (A ⊕ B)̄ for XNOR
 */

// Combining overline character (standard mathematical complement bar over letter)
export const OVERBAR = '\u0305';

// Check if a string is completely enclosed in balanced parentheses
function isEnclosed(str: string): boolean {
  if (!str.startsWith('(') || !str.endsWith(')')) return false;
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') depth--;
    if (depth === 0 && i < str.length - 1) return false;
  }
  return depth === 0;
}

// Check if string ends with an overbar
function hasOverbar(str: string): boolean {
  return str.endsWith(OVERBAR) || str.endsWith('\u0304');
}

// Strip trailing overbar
function stripOverbar(str: string): string {
  return str.replace(/[\u0305\u0304]$/, '');
}

/**
 * Normalizes user input for variables, supporting keyboard shortcuts:
 * - A_ or A' -> Ā (bar over A)
 * - ~A, !A, /A -> Ā
 */
export function formatUserVariableInput(input: string): string {
  const val = input.trim();
  if (!val) return '';

  // Handle ~A, !A, /A -> Ā
  if (/^[~!/]([A-Za-z0-9]+)$/.test(val)) {
    const match = val.match(/^[~!/]([A-Za-z0-9]+)$/);
    return (match ? match[1].toUpperCase() : val) + OVERBAR;
  }

  // Handle A_ or A' -> Ā
  if (/^([A-Za-z0-9]+)[_']$/.test(val)) {
    const match = val.match(/^([A-Za-z0-9]+)[_']$/);
    return (match ? match[1].toUpperCase() : val) + OVERBAR;
  }

  return val;
}

// Check if an expression is an atomic token (e.g. single variable A, Ā, (A.B)̄)
function isAtomic(expr: string): boolean {
  const trimmed = expr.trim();
  if (/^[A-Za-z0-9]+[\u0305\u0304]?$/.test(trimmed)) return true;
  if (/^[¬~!][A-Za-z0-9]+$/.test(trimmed)) return true;
  if (/^[A-Za-z0-9]+_$/.test(trimmed)) return true;
  if (isEnclosed(trimmed)) return true;
  if (hasOverbar(trimmed) && isEnclosed(stripOverbar(trimmed))) return true;
  return false;
}

// Wraps expression in parentheses if needed for operator precedence
function parenthesizeForAnd(expr: string): string {
  const trimmed = expr.trim();
  if (isAtomic(trimmed)) return trimmed;
  // If expression contains OR or XOR, wrap in parentheses for AND precedence
  if (trimmed.includes('+') || trimmed.includes('⊕')) {
    return `(${trimmed})`;
  }
  return trimmed;
}

export function buildNotExpression(expr: string): string {
  const trimmed = expr.trim();
  if (trimmed === '0') return '1';
  if (trimmed === '1') return '0';

  // Double negation elimination:
  // 1) Ā -> A or (A.B)̄ -> A.B
  if (hasOverbar(trimmed)) {
    const without = stripOverbar(trimmed);
    if (isEnclosed(without)) return without.slice(1, -1).trim();
    return without;
  }

  // 2) ¬A, ~A, !A -> A
  if (trimmed.startsWith('¬') || trimmed.startsWith('~') || trimmed.startsWith('!')) {
    const inner = trimmed.slice(1).trim();
    if (isEnclosed(inner)) return inner.slice(1, -1).trim();
    return inner;
  }

  // 3) A_ -> A
  if (/^[A-Za-z0-9]+_$/.test(trimmed)) {
    return trimmed.slice(0, -1);
  }

  // Single variable: A -> Ā (bar over A)
  if (/^[A-Za-z0-9]+$/.test(trimmed)) {
    return `${trimmed}${OVERBAR}`;
  }

  // Enclosed compound expression: (A.B) -> (A.B)̄
  if (isEnclosed(trimmed)) {
    return `${trimmed}${OVERBAR}`;
  }

  // Compound expression: A.B -> (A.B)̄
  return `(${trimmed})${OVERBAR}`;
}

export function buildAndExpression(a: string, b: string): string {
  const e1 = a.trim();
  const e2 = b.trim();

  // Annihilation: 0 . X = 0
  if (e1 === '0' || e2 === '0') return '0';
  // Identity: 1 . X = X
  if (e1 === '1') return e2;
  if (e2 === '1') return e1;
  // Idempotence: X . X = X
  if (e1 === e2) return e1;
  // Complement: X . X̄ = 0
  if (buildNotExpression(e1) === e2 || buildNotExpression(e2) === e1) return '0';

  const termA = parenthesizeForAnd(e1);
  const termB = parenthesizeForAnd(e2);

  // Alphabetical sort for symmetry if simple atomic variables
  if (termA > termB && isAtomic(termA) && isAtomic(termB)) {
    return `${termB}.${termA}`;
  }
  return `${termA} · ${termB}`;
}

export function buildOrExpression(a: string, b: string): string {
  const e1 = a.trim();
  const e2 = b.trim();

  // Annihilation: 1 + X = 1
  if (e1 === '1' || e2 === '1') return '1';
  // Identity: 0 + X = X
  if (e1 === '0') return e2;
  if (e2 === '0') return e1;
  // Idempotence: X + X = X
  if (e1 === e2) return e1;
  // Complement: X + X̄ = 1
  if (buildNotExpression(e1) === e2 || buildNotExpression(e2) === e1) return '1';

  // Sort terms if atomic for clean canonical appearance
  if (e1 > e2 && isAtomic(e1) && isAtomic(e2)) {
    return `${e2}+${e1}`;
  }
  return `${e1}+${e2}`;
}

export function buildXorExpression(a: string, b: string): string {
  const e1 = a.trim();
  const e2 = b.trim();

  if (e1 === e2) return '0';
  if (e1 === '0') return e2;
  if (e2 === '0') return e1;
  if (e1 === '1') return buildNotExpression(e2);
  if (e2 === '1') return buildNotExpression(e1);
  if (buildNotExpression(e1) === e2 || buildNotExpression(e2) === e1) return '1';

  const termA = isAtomic(e1) ? e1 : `(${e1})`;
  const termB = isAtomic(e2) ? e2 : `(${e2})`;
  return `${termA} ⊕ ${termB}`;
}

export function buildXnorExpression(a: string, b: string): string {
  const e1 = a.trim();
  const e2 = b.trim();

  if (e1 === e2) return '1';
  if (e1 === '0') return buildNotExpression(e2);
  if (e2 === '0') return buildNotExpression(e1);
  if (e1 === '1') return e2;
  if (e2 === '1') return e1;
  if (buildNotExpression(e1) === e2 || buildNotExpression(e2) === e1) return '0';

  const termA = isAtomic(e1) ? e1 : `(${e1})`;
  const termB = isAtomic(e2) ? e2 : `(${e2})`;
  return `${termA} ⊙ ${termB}`;
}

/**
 * Assigns clean, default variable names (A, B, C, D...) to inputs that don't have custom variable names.
 */
export function getDefaultInputVariableName(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (index < letters.length) {
    return letters[index];
  }
  return `X${index + 1}`;
}

/**
 * Extracts or infers a clean, mathematical variable name for any circuit node.
 */
export function extractCleanVariableName(node: CircuitNode): string {
  if (node.state?.variableName && node.state.variableName.trim() !== '') {
    return node.state.variableName.trim();
  }

  const label = (node.label || '').trim();

  // Pattern like "Input A", "Switch B", "Data (D)", "Set (S)"
  const parenMatch = label.match(/\(([A-Za-z0-9_̄~]+)\)/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1];
  }

  const suffixLetterMatch = label.match(/(?:Input|Switch|Button|Gate|Out|Bit|sw|btn|led|probe)\s*([A-Za-z0-9_]+)$/i);
  if (suffixLetterMatch && suffixLetterMatch[1]) {
    return suffixLetterMatch[1];
  }

  if (/^[A-Za-z0-9_]{1,6}$/.test(label) && label !== node.type) {
    return label;
  }

  switch (node.type) {
    case 'SWITCH':
    case 'BUTTON':
      return 'A';
    case 'CLOCK':
      return 'CLK';
    case 'HIGH_CONST':
      return 'VCC';
    case 'LOW_CONST':
      return 'GND';
    case 'AND':
    case 'OR':
    case 'NOT':
    case 'NAND':
    case 'NOR':
    case 'XOR':
    case 'XNOR':
    case 'BUFFER':
    case 'TRI_STATE':
      return 'Y';
    case 'D_FLIP_FLOP':
    case 'JK_FLIP_FLOP':
    case 'SR_FLIP_FLOP':
    case 'T_FLIP_FLOP':
      return 'Q';
    case 'HALF_ADDER':
    case 'FULL_ADDER':
      return 'SUM';
    case 'MUX_2TO1':
      return 'Y';
    case 'DEMUX_1TO2':
      return 'Y';
    case 'LED':
    case 'PROBE':
      return 'OUT';
    case 'SEVEN_SEG':
      return 'HEX';
    case 'BUZZER':
      return 'BUZZ';
    default:
      return 'VAR';
  }
}

export interface ComponentVariableDisplay {
  varName: string;
  expression?: string;
  badgeText: string;
  subText?: string;
  isHigh: boolean;
  tooltip: string;
}

/**
 * Returns structured variable information and formatted text for display directly above any component.
 */
export function getComponentVariableDisplay(node: CircuitNode): ComponentVariableDisplay {
  const varName = extractCleanVariableName(node);
  const outVal = Boolean(node.outputs[0]?.value);
  const in0Val = Boolean(node.inputs[0]?.value);
  const isHigh =
    node.type === 'SWITCH' || node.type === 'BUTTON'
      ? Boolean(node.state?.isOn)
      : node.outputs.length > 0
      ? outVal
      : in0Val;

  const rawExpr =
    node.state?.computedExpression ||
    node.outputs[0]?.expression ||
    node.inputs[0]?.expression;
  const hasCustomVar = Boolean(node.state?.variableName && node.state.variableName.trim() !== '');

  switch (node.type) {
    case 'SWITCH':
    case 'BUTTON': {
      const bit = node.state?.isOn ? '1' : '0';
      return {
        varName,
        badgeText: `${varName} = ${bit}`,
        subText: bit,
        isHigh: Boolean(node.state?.isOn),
        tooltip: `Variable: ${varName} (State: ${bit === '1' ? 'HIGH' : 'LOW'}) • Click to edit`,
      };
    }

    case 'CLOCK': {
      const freq = node.state?.frequencyHz || 1;
      const bit = outVal ? '1' : '0';
      return {
        varName,
        expression: `${freq}Hz`,
        badgeText: `${varName} (${freq}Hz) = ${bit}`,
        subText: `${freq}Hz`,
        isHigh: outVal,
        tooltip: `Clock Variable: ${varName} (${freq}Hz, state: ${bit}) • Click to edit`,
      };
    }

    case 'HIGH_CONST':
      return {
        varName: varName || 'VCC',
        badgeText: `${varName || 'VCC'} = 1`,
        isHigh: true,
        tooltip: `Constant HIGH Variable: ${varName || 'VCC'} = 1`,
      };

    case 'LOW_CONST':
      return {
        varName: varName || 'GND',
        badgeText: `${varName || 'GND'} = 0`,
        isHigh: false,
        tooltip: `Constant LOW Variable: ${varName || 'GND'} = 0`,
      };

    case 'AND':
    case 'OR':
    case 'NOT':
    case 'NAND':
    case 'NOR':
    case 'XOR':
    case 'XNOR':
    case 'BUFFER':
    case 'TRI_STATE': {
      const bit = outVal ? '1' : '0';
      if (rawExpr && rawExpr !== '0' && rawExpr !== '1') {
        const fullExpr = hasCustomVar ? `${varName} = ${rawExpr}` : rawExpr;
        return {
          varName,
          expression: rawExpr,
          badgeText: `${fullExpr} = ${bit}`,
          subText: bit,
          isHigh: outVal,
          tooltip: `${node.type} Gate Variable: ${fullExpr} = ${bit} • Click to rename`,
        };
      }
      return {
        varName,
        badgeText: `${varName} = ${bit}`,
        subText: bit,
        isHigh: outVal,
        tooltip: `${node.type} Gate Variable: ${varName} (Output: ${bit}) • Click to rename`,
      };
    }

    case 'D_FLIP_FLOP':
    case 'JK_FLIP_FLOP':
    case 'SR_FLIP_FLOP':
    case 'T_FLIP_FLOP': {
      const qVal = node.state?.q ? '1' : '0';
      return {
        varName,
        badgeText: `${varName} = ${qVal}`,
        subText: qVal,
        isHigh: Boolean(node.state?.q),
        tooltip: `Sequential Variable: ${varName} = ${qVal} • Click to rename`,
      };
    }

    case 'HALF_ADDER':
    case 'FULL_ADDER': {
      const sVal = node.outputs[0]?.value ? '1' : '0';
      const cVal = node.outputs[1]?.value ? '1' : '0';
      return {
        varName,
        badgeText: `${varName}: S=${sVal}, C=${cVal}`,
        isHigh: Boolean(node.outputs[0]?.value || node.outputs[1]?.value),
        tooltip: `${node.type} Output Variables: Sum=${sVal}, Carry=${cVal}`,
      };
    }

    case 'MUX_2TO1': {
      const bit = outVal ? '1' : '0';
      return {
        varName,
        badgeText: `${varName} = ${bit}`,
        isHigh: outVal,
        tooltip: `Multiplexer Output Variable: ${varName} = ${bit}`,
      };
    }

    case 'DEMUX_1TO2': {
      const y0 = node.outputs[0]?.value ? '1' : '0';
      const y1 = node.outputs[1]?.value ? '1' : '0';
      return {
        varName,
        badgeText: `${varName}: Y0=${y0}, Y1=${y1}`,
        isHigh: Boolean(node.outputs[0]?.value || node.outputs[1]?.value),
        tooltip: `Demultiplexer Variables: Y0=${y0}, Y1=${y1}`,
      };
    }

    case 'PROBE': {
      const bit = in0Val ? '1' : '0';
      if (rawExpr && rawExpr !== '0' && rawExpr !== '1') {
        return {
          varName,
          expression: rawExpr,
          badgeText: `${varName} = ${rawExpr} (${bit})`,
          subText: bit,
          isHigh: in0Val,
          tooltip: `Probe Variable: ${varName} = ${rawExpr} = ${bit} • Click to rename`,
        };
      }
      return {
        varName,
        badgeText: `${varName} = ${bit}`,
        subText: bit,
        isHigh: in0Val,
        tooltip: `Probe Variable: ${varName} = ${bit} • Click to rename`,
      };
    }

    case 'LED': {
      const bit = in0Val ? '1' : '0';
      return {
        varName,
        badgeText: `${varName} = ${bit}`,
        subText: bit,
        isHigh: in0Val,
        tooltip: `Indicator Variable: ${varName} = ${bit} • Click to rename`,
      };
    }

    case 'SEVEN_SEG':
      return {
        varName,
        badgeText: `${varName}`,
        isHigh: true,
        tooltip: `Display Variable: ${varName}`,
      };

    case 'BUZZER':
      return {
        varName,
        badgeText: `${varName} = ${in0Val ? 'ON' : 'OFF'}`,
        isHigh: in0Val,
        tooltip: `Sound Variable: ${varName} (${in0Val ? 'Active' : 'Muted'})`,
      };

    default:
      return {
        varName,
        badgeText: `${varName}`,
        isHigh: outVal,
        tooltip: `Component Variable: ${varName}`,
      };
  }
}

/**
 * Resolves the symbolic variable expression for all nodes and wires in the circuit.
 */
export function computeCircuitExpressions(
  nodes: CircuitNode[],
  wires: Wire[]
): {
  nodeExpressions: Map<string, { inputs: string[]; outputs: string[] }>;
  wireExpressions: Map<string, string>;
} {
  const nodeMap = new Map<string, CircuitNode>(nodes.map((n) => [n.id, n]));
  const nodeExpressions = new Map<string, { inputs: string[]; outputs: string[] }>();
  const wireExpressions = new Map<string, string>();

  // Map each input pin to its driving wire
  const pinToWire = new Map<string, Wire>();
  wires.forEach((w) => {
    pinToWire.set(w.toPinId, w);
  });

  // Assign variable names to primary inputs
  const inputNodes = nodes.filter((n) =>
    ['SWITCH', 'BUTTON', 'CLOCK', 'HIGH_CONST', 'LOW_CONST'].includes(n.type)
  );

  let inputVarCounter = 0;
  const inputVariables = new Map<string, string>();

  inputNodes.forEach((node) => {
    if (node.state.variableName && node.state.variableName.trim() !== '') {
      inputVariables.set(node.id, node.state.variableName.trim());
    } else if (node.type === 'HIGH_CONST') {
      inputVariables.set(node.id, '1');
    } else if (node.type === 'LOW_CONST') {
      inputVariables.set(node.id, '0');
    } else if (node.type === 'CLOCK') {
      inputVariables.set(node.id, 'CLK');
    } else {
      const extracted = extractCleanVariableName(node);
      if (extracted && extracted !== 'IN' && extracted !== 'VAR') {
        inputVariables.set(node.id, extracted);
      } else {
        const vName = getDefaultInputVariableName(inputVarCounter++);
        inputVariables.set(node.id, vName);
      }
    }
  });

  // Recursive expression solver with cycle/feedback protection
  const visiting = new Set<string>();

  function getNodeOutputExpression(nodeId: string, outputPinIndex: number = 0): string {
    const node = nodeMap.get(nodeId);
    if (!node) return '0';

    // Primary input nodes
    if (['SWITCH', 'BUTTON', 'CLOCK', 'HIGH_CONST', 'LOW_CONST'].includes(node.type)) {
      return inputVariables.get(node.id) || '0';
    }

    // Feedback detection (e.g. SR flip-flop or oscillator)
    const visitKey = `${nodeId}:${outputPinIndex}`;
    if (visiting.has(visitKey)) {
      return `Q_${node.label || 'prev'}`;
    }

    // If already computed, return cached output
    const cached = nodeExpressions.get(nodeId);
    if (cached && cached.outputs[outputPinIndex] !== undefined) {
      return cached.outputs[outputPinIndex];
    }

    visiting.add(visitKey);

    // Resolve inputs to this node
    const inputExprs: string[] = node.inputs.map((pin, pIdx) => {
      const incomingWire = pinToWire.get(pin.id);
      if (!incomingWire) {
        return `0`; // Floating input defaults to 0
      }
      const expr = getNodeOutputExpression(incomingWire.fromNodeId, 0);
      wireExpressions.set(incomingWire.id, expr);
      return expr;
    });

    let outputExpr = '0';
    const in0 = inputExprs[0] || '0';
    const in1 = inputExprs[1] || '0';

    switch (node.type) {
      case 'BUFFER':
        outputExpr = in0;
        break;

      case 'NOT':
        outputExpr = buildNotExpression(in0);
        break;

      case 'AND': {
        const valid = inputExprs.length > 0 ? inputExprs : ['0'];
        outputExpr = valid.reduce((acc, curr) => buildAndExpression(acc, curr));
        break;
      }

      case 'NAND': {
        const valid = inputExprs.length > 0 ? inputExprs : ['0'];
        const andPart = valid.reduce((acc, curr) => buildAndExpression(acc, curr));
        outputExpr = buildNotExpression(andPart);
        break;
      }

      case 'OR': {
        const valid = inputExprs.length > 0 ? inputExprs : ['0'];
        outputExpr = valid.reduce((acc, curr) => buildOrExpression(acc, curr));
        break;
      }

      case 'NOR': {
        const valid = inputExprs.length > 0 ? inputExprs : ['0'];
        const orPart = valid.reduce((acc, curr) => buildOrExpression(acc, curr));
        outputExpr = buildNotExpression(orPart);
        break;
      }

      case 'XOR': {
        const valid = inputExprs.length > 0 ? inputExprs : ['0'];
        outputExpr = valid.reduce((acc, curr) => buildXorExpression(acc, curr));
        break;
      }

      case 'XNOR': {
        const valid = inputExprs.length > 0 ? inputExprs : ['0'];
        if (valid.length === 2) {
          outputExpr = buildXnorExpression(valid[0], valid[1]);
        } else {
          const xorPart = valid.reduce((acc, curr) => buildXorExpression(acc, curr));
          outputExpr = buildNotExpression(xorPart);
        }
        break;
      }

      case 'LED':
      case 'PROBE':
      case 'BUZZER':
        outputExpr = in0;
        break;

      case 'SEVEN_SEG':
        outputExpr = `HEX(${inputExprs.join(',')})`;
        break;

      default:
        outputExpr = in0;
    }

    visiting.delete(visitKey);

    const outputs = [outputExpr];
    nodeExpressions.set(nodeId, { inputs: inputExprs, outputs });
    return outputExpr;
  }

  // Evaluate all nodes
  nodes.forEach((n) => {
    getNodeOutputExpression(n.id, 0);
  });

  return { nodeExpressions, wireExpressions };
}
