import { Sheet } from '../types';
import { createDefaultNode } from './circuitSolver';

export function createPresetSheets(): Sheet[] {
  // 1. ALL LOGIC GATES SHOWCASE
  const gateTypes: Array<{ type: any; label: string; y: number }> = [
    { type: 'AND', label: 'AND Gate', y: 40 },
    { type: 'OR', label: 'OR Gate', y: 160 },
    { type: 'NOT', label: 'NOT (Inverter)', y: 280 },
    { type: 'NAND', label: 'NAND Gate', y: 400 },
    { type: 'NOR', label: 'NOR Gate', y: 520 },
    { type: 'XOR', label: 'XOR Gate', y: 640 },
    { type: 'XNOR', label: 'XNOR Gate', y: 760 },
    { type: 'BUFFER', label: 'Buffer', y: 880 },
  ];

  const sheet1Nodes: any[] = [];
  const sheet1Wires: any[] = [];

  gateTypes.forEach((item, idx) => {
    const isSingleInput = item.type === 'NOT' || item.type === 'BUFFER';

    // Gate node
    const gate = createDefaultNode(item.type, 380, item.y, `gate_${item.type}_${idx}`, { variableName: 'Y' }, item.label);
    sheet1Nodes.push(gate);

    // Switch A
    const swA = createDefaultNode('SWITCH', 140, item.y - (isSingleInput ? 0 : 15), `sw_a_${idx}`, { isOn: idx % 2 === 0, variableName: 'A' }, `${item.type} A`);
    sheet1Nodes.push(swA);

    // Wire A -> Gate input 0
    sheet1Wires.push({
      id: `w_a_${idx}`,
      fromNodeId: swA.id,
      fromPinId: swA.outputs[0].id,
      toNodeId: gate.id,
      toPinId: gate.inputs[0].id,
      value: Boolean(swA.state.isOn),
    });

    if (!isSingleInput) {
      // Switch B
      const swB = createDefaultNode('SWITCH', 140, item.y + 45, `sw_b_${idx}`, { isOn: idx > 2, variableName: 'B' }, `${item.type} B`);
      sheet1Nodes.push(swB);

      // Wire B -> Gate input 1
      sheet1Wires.push({
        id: `w_b_${idx}`,
        fromNodeId: swB.id,
        fromPinId: swB.outputs[0].id,
        toNodeId: gate.id,
        toPinId: gate.inputs[1].id,
        value: Boolean(swB.state.isOn),
      });
    }

    // LED Output
    const led = createDefaultNode('LED', 600, item.y, `led_${idx}`, { color: '#10b981', variableName: 'LED' }, `${item.type} Out`);
    sheet1Nodes.push(led);

    // Probe Output
    const probe = createDefaultNode('PROBE', 720, item.y + 6, `probe_${idx}`, { variableName: 'OUT' }, `${item.type} Bit`);
    sheet1Nodes.push(probe);

    // Wire Gate out -> LED
    sheet1Wires.push({
      id: `w_out_led_${idx}`,
      fromNodeId: gate.id,
      fromPinId: gate.outputs[0].id,
      toNodeId: led.id,
      toPinId: led.inputs[0].id,
      value: false,
    });

    // Wire Gate out -> Probe (fan-out)
    sheet1Wires.push({
      id: `w_out_probe_${idx}`,
      fromNodeId: gate.id,
      fromPinId: gate.outputs[0].id,
      toNodeId: probe.id,
      toPinId: probe.inputs[0].id,
      value: false,
    });
  });

  const sheet1: Sheet = {
    id: 'sheet_all_gates',
    name: 'All Logic Gates',
    nodes: sheet1Nodes,
    wires: sheet1Wires,
    pan: { x: 40, y: 30 },
    zoom: 0.85,
    updatedAt: Date.now(),
  };

  // 2. HALF ADDER CIRCUIT
  const swAddA = createDefaultNode('SWITCH', 100, 100, 'ha_sw_a', { isOn: true, variableName: 'A' }, 'Input A');
  const swAddB = createDefaultNode('SWITCH', 100, 240, 'ha_sw_b', { isOn: true, variableName: 'B' }, 'Input B');
  const xorGate = createDefaultNode('XOR', 320, 90, 'ha_xor', { variableName: 'SUM' }, 'XOR (Sum)');
  const andGate = createDefaultNode('AND', 320, 250, 'ha_and', { variableName: 'CARRY' }, 'AND (Carry)');
  const sumLed = createDefaultNode('LED', 560, 90, 'ha_sum_led', { color: '#38bdf8', variableName: 'S_OUT' }, 'Sum (S)');
  const carryLed = createDefaultNode('LED', 560, 250, 'ha_carry_led', { color: '#f59e0b', variableName: 'C_OUT' }, 'Carry (C)');

  const sheet2Wires = [
    { id: 'w_ha_1', fromNodeId: swAddA.id, fromPinId: swAddA.outputs[0].id, toNodeId: xorGate.id, toPinId: xorGate.inputs[0].id, value: true },
    { id: 'w_ha_2', fromNodeId: swAddB.id, fromPinId: swAddB.outputs[0].id, toNodeId: xorGate.id, toPinId: xorGate.inputs[1].id, value: true },
    { id: 'w_ha_3', fromNodeId: swAddA.id, fromPinId: swAddA.outputs[0].id, toNodeId: andGate.id, toPinId: andGate.inputs[0].id, value: true },
    { id: 'w_ha_4', fromNodeId: swAddB.id, fromPinId: swAddB.outputs[0].id, toNodeId: andGate.id, toPinId: andGate.inputs[1].id, value: true },
    { id: 'w_ha_5', fromNodeId: xorGate.id, fromPinId: xorGate.outputs[0].id, toNodeId: sumLed.id, toPinId: sumLed.inputs[0].id, value: false },
    { id: 'w_ha_6', fromNodeId: andGate.id, fromPinId: andGate.outputs[0].id, toNodeId: carryLed.id, toPinId: carryLed.inputs[0].id, value: true },
  ];

  const sheet2: Sheet = {
    id: 'sheet_half_adder',
    name: 'Half Adder',
    nodes: [swAddA, swAddB, xorGate, andGate, sumLed, carryLed],
    wires: sheet2Wires,
    pan: { x: 100, y: 100 },
    zoom: 1,
    updatedAt: Date.now(),
  };

  // 3. SR LATCH (CROSS-COUPLED NOR GATES)
  const btnSet = createDefaultNode('BUTTON', 80, 100, 'sr_btn_s', { isOn: false, variableName: 'S' }, 'Set (S)');
  const btnReset = createDefaultNode('BUTTON', 80, 280, 'sr_btn_r', { isOn: false, variableName: 'R' }, 'Reset (R)');
  const nor1 = createDefaultNode('NOR', 300, 110, 'sr_nor_1', { variableName: 'Q' }, 'NOR 1');
  const nor2 = createDefaultNode('NOR', 300, 270, 'sr_nor_2', { variableName: 'Q̄' }, 'NOR 2');
  const ledQ = createDefaultNode('LED', 520, 110, 'sr_led_q', { color: '#10b981', variableName: 'Q' }, 'Output Q');
  const ledQBar = createDefaultNode('LED', 520, 270, 'sr_led_qbar', { color: '#ef4444', variableName: 'Q̄' }, 'Output Q̄');

  const sheet3Wires = [
    { id: 'w_sr_1', fromNodeId: btnReset.id, fromPinId: btnReset.outputs[0].id, toNodeId: nor1.id, toPinId: nor1.inputs[0].id, value: false },
    { id: 'w_sr_2', fromNodeId: btnSet.id, fromPinId: btnSet.outputs[0].id, toNodeId: nor2.id, toPinId: nor2.inputs[1].id, value: false },
    { id: 'w_sr_3', fromNodeId: nor1.id, fromPinId: nor1.outputs[0].id, toNodeId: ledQ.id, toPinId: ledQ.inputs[0].id, value: true },
    { id: 'w_sr_4', fromNodeId: nor2.id, fromPinId: nor2.outputs[0].id, toNodeId: ledQBar.id, toPinId: ledQBar.inputs[0].id, value: false },
    // Cross-coupling feedback loops
    { id: 'w_sr_fb1', fromNodeId: nor1.id, fromPinId: nor1.outputs[0].id, toNodeId: nor2.id, toPinId: nor2.inputs[0].id, value: true },
    { id: 'w_sr_fb2', fromNodeId: nor2.id, fromPinId: nor2.outputs[0].id, toNodeId: nor1.id, toPinId: nor1.inputs[1].id, value: false },
  ];

  const sheet3: Sheet = {
    id: 'sheet_sr_latch',
    name: 'SR Latch (Memory)',
    nodes: [btnSet, btnReset, nor1, nor2, ledQ, ledQBar],
    wires: sheet3Wires,
    pan: { x: 100, y: 100 },
    zoom: 1,
    updatedAt: Date.now(),
  };

  // 4. CLOCK & 7-SEGMENT DISPLAY
  const clock = createDefaultNode('CLOCK', 80, 120, 'c7_clock', { frequencyHz: 2, variableName: 'CLK' }, 'Pulse Clock');
  const swBit0 = createDefaultNode('SWITCH', 80, 220, 'c7_sw_0', { isOn: true, variableName: 'B0' }, 'Bit 0 (1)');
  const swBit1 = createDefaultNode('SWITCH', 80, 320, 'c7_sw_1', { isOn: false, variableName: 'B1' }, 'Bit 1 (2)');
  const swBit2 = createDefaultNode('SWITCH', 80, 420, 'c7_sw_2', { isOn: true, variableName: 'B2' }, 'Bit 2 (4)');
  const swBit3 = createDefaultNode('SWITCH', 80, 520, 'c7_sw_3', { isOn: false, variableName: 'B3' }, 'Bit 3 (8)');
  const sevenSeg = createDefaultNode('SEVEN_SEG', 340, 240, 'c7_display', { variableName: 'HEX' }, '7-Segment Hex');
  const buzzer = createDefaultNode('BUZZER', 340, 120, 'c7_buzzer', { variableName: 'BUZZ' }, 'Alarm Buzzer');

  const sheet4Wires = [
    { id: 'w_c7_clk', fromNodeId: clock.id, fromPinId: clock.outputs[0].id, toNodeId: buzzer.id, toPinId: buzzer.inputs[0].id, value: false },
    { id: 'w_c7_0', fromNodeId: swBit0.id, fromPinId: swBit0.outputs[0].id, toNodeId: sevenSeg.id, toPinId: sevenSeg.inputs[0].id, value: true },
    { id: 'w_c7_1', fromNodeId: swBit1.id, fromPinId: swBit1.outputs[0].id, toNodeId: sevenSeg.id, toPinId: sevenSeg.inputs[1].id, value: false },
    { id: 'w_c7_2', fromNodeId: swBit2.id, fromPinId: swBit2.outputs[0].id, toNodeId: sevenSeg.id, toPinId: sevenSeg.inputs[2].id, value: true },
    { id: 'w_c7_3', fromNodeId: swBit3.id, fromPinId: swBit3.outputs[0].id, toNodeId: sevenSeg.id, toPinId: sevenSeg.inputs[3].id, value: false },
  ];

  const sheet4: Sheet = {
    id: 'sheet_clock_7seg',
    name: 'Clock & 7-Segment',
    nodes: [clock, swBit0, swBit1, swBit2, swBit3, sevenSeg, buzzer],
    wires: sheet4Wires,
    pan: { x: 100, y: 60 },
    zoom: 0.95,
    updatedAt: Date.now(),
  };

  // 5. D FLIP-FLOP WITH CLOCK & DATA SWITCH
  const dDataSw = createDefaultNode('SWITCH', 80, 100, 'dff_sw_d', { isOn: true, variableName: 'D' }, 'Data (D)');
  const dClkGen = createDefaultNode('CLOCK', 80, 240, 'dff_clock', { frequencyHz: 1, variableName: 'CLK' }, 'Clock Pulse');
  const dFlipFlop = createDefaultNode('D_FLIP_FLOP', 300, 120, 'dff_node', { variableName: 'Q' }, 'D Flip-Flop');
  const dLedQ = createDefaultNode('LED', 520, 100, 'dff_led_q', { color: '#10b981', variableName: 'Q_OUT' }, 'Output Q');
  const dLedQBar = createDefaultNode('LED', 520, 240, 'dff_led_qbar', { color: '#ef4444', variableName: 'Q̄_OUT' }, 'Output ~Q');

  const sheet5Wires = [
    { id: 'w_dff_1', fromNodeId: dDataSw.id, fromPinId: dDataSw.outputs[0].id, toNodeId: dFlipFlop.id, toPinId: dFlipFlop.inputs[0].id, value: true },
    { id: 'w_dff_2', fromNodeId: dClkGen.id, fromPinId: dClkGen.outputs[0].id, toNodeId: dFlipFlop.id, toPinId: dFlipFlop.inputs[1].id, value: false },
    { id: 'w_dff_3', fromNodeId: dFlipFlop.id, fromPinId: dFlipFlop.outputs[0].id, toNodeId: dLedQ.id, toPinId: dLedQ.inputs[0].id, value: false },
    { id: 'w_dff_4', fromNodeId: dFlipFlop.id, fromPinId: dFlipFlop.outputs[1].id, toNodeId: dLedQBar.id, toPinId: dLedQBar.inputs[0].id, value: true },
  ];

  const sheet5: Sheet = {
    id: 'sheet_d_flipflop',
    name: 'D Flip-Flop Sequential',
    nodes: [dDataSw, dClkGen, dFlipFlop, dLedQ, dLedQBar],
    wires: sheet5Wires,
    pan: { x: 100, y: 100 },
    zoom: 1,
    updatedAt: Date.now(),
  };

  // 6. 2:1 MULTIPLEXER ROUTING
  const muxIn0 = createDefaultNode('SWITCH', 80, 80, 'mux_sw_0', { isOn: false, variableName: 'D0' }, 'Input 0 (Low)');
  const muxIn1 = createDefaultNode('SWITCH', 80, 200, 'mux_sw_1', { isOn: true, variableName: 'D1' }, 'Input 1 (High)');
  const muxSel = createDefaultNode('SWITCH', 80, 320, 'mux_sw_sel', { isOn: true, variableName: 'SEL' }, 'Select (S)');
  const muxNode = createDefaultNode('MUX_2TO1', 300, 140, 'mux_node', { variableName: 'Y' }, '2:1 Multiplexer');
  const muxOutLed = createDefaultNode('LED', 520, 160, 'mux_led', { color: '#0284c7', variableName: 'Y_OUT' }, 'Selected Y');

  const sheet6Wires = [
    { id: 'w_mux_0', fromNodeId: muxIn0.id, fromPinId: muxIn0.outputs[0].id, toNodeId: muxNode.id, toPinId: muxNode.inputs[0].id, value: false },
    { id: 'w_mux_1', fromNodeId: muxIn1.id, fromPinId: muxIn1.outputs[0].id, toNodeId: muxNode.id, toPinId: muxNode.inputs[1].id, value: true },
    { id: 'w_mux_sel', fromNodeId: muxSel.id, fromPinId: muxSel.outputs[0].id, toNodeId: muxNode.id, toPinId: muxNode.inputs[2].id, value: true },
    { id: 'w_mux_out', fromNodeId: muxNode.id, fromPinId: muxNode.outputs[0].id, toNodeId: muxOutLed.id, toPinId: muxOutLed.inputs[0].id, value: true },
  ];

  const sheet6: Sheet = {
    id: 'sheet_mux_routing',
    name: '2:1 Multiplexer Router',
    nodes: [muxIn0, muxIn1, muxSel, muxNode, muxOutLed],
    wires: sheet6Wires,
    pan: { x: 100, y: 100 },
    zoom: 1,
    updatedAt: Date.now(),
  };

  return [sheet1, sheet2, sheet3, sheet4, sheet5, sheet6];
}
