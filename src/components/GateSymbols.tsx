import React from 'react';
import { NodeType } from '../types';
import { decodeSevenSegment } from '../utils/circuitSolver';

interface GateSymbolProps {
  type: NodeType;
  width: number;
  height: number;
  isActive: boolean;
  state?: any;
  inputs?: boolean[];
  theme?: 'dark' | 'light';
}

export const GateSymbol: React.FC<GateSymbolProps> = ({
  type,
  width,
  height,
  isActive,
  state,
  inputs = [],
  theme = 'light',
}) => {
  // Adaptive color palette: Pure white in light mode / dark slate in dark mode
  const isDark = theme === 'dark';
  const strokeColor = isDark ? '#f8fafc' : '#111827';
  const bodyColor = isDark ? '#1e293b' : '#ffffff';
  const highSignalColor = isDark ? '#38bdf8' : '#0284c7';
  const lowSignalColor = isDark ? '#64748b' : '#374151';
  const inputCount = state?.inputCount || (inputs.length > 2 ? inputs.length : 2);

  // Helper to get lead color
  const getLeadColor = (val?: boolean) => (val ? highSignalColor : lowSignalColor);

  switch (type) {
    case 'AND': {
      // D-shape with 2, 3, or 4 inputs
      const is3 = inputCount === 3;
      const is4 = inputCount === 4;
      return (
        <svg width={width} height={height} viewBox="0 0 110 72" className="overflow-visible">
          {/* Main D-shape Body */}
          <path
            d="M 24 12 L 52 12 A 24 24 0 0 1 52 60 L 24 60 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Input Lead Stubs */}
          {!is3 && !is4 && (
            <>
              <line x1="2" y1="22" x2="24" y2="22" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="50" x2="24" y2="50" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
            </>
          )}
          {is3 && (
            <>
              <line x1="2" y1="18" x2="24" y2="18" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="36" x2="24" y2="36" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
              <line x1="2" y1="54" x2="24" y2="54" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
            </>
          )}
          {is4 && (
            <>
              <line x1="2" y1="16" x2="24" y2="16" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="30" x2="24" y2="30" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
              <line x1="2" y1="42" x2="24" y2="42" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
              <line x1="2" y1="56" x2="24" y2="56" stroke={getLeadColor(inputs[3])} strokeWidth="2.5" />
            </>
          )}

          {/* Output Lead Stub */}
          <line x1="76" y1="36" x2="108" y2="36" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'NAND': {
      const is3 = inputCount === 3;
      const is4 = inputCount === 4;
      return (
        <svg width={width} height={height} viewBox="0 0 110 72" className="overflow-visible">
          <path
            d="M 22 12 L 48 12 A 24 24 0 0 1 48 60 L 22 60 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Inversion Bubble */}
          <circle cx="76" cy="36" r="4.5" fill={bodyColor} stroke={strokeColor} strokeWidth="2.2" />

          {/* Input Leads */}
          {!is3 && !is4 && (
            <>
              <line x1="2" y1="22" x2="22" y2="22" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="50" x2="22" y2="50" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
            </>
          )}
          {is3 && (
            <>
              <line x1="2" y1="18" x2="22" y2="18" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="36" x2="22" y2="36" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
              <line x1="2" y1="54" x2="22" y2="54" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
            </>
          )}
          {is4 && (
            <>
              <line x1="2" y1="16" x2="22" y2="16" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="30" x2="22" y2="30" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
              <line x1="2" y1="42" x2="22" y2="42" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
              <line x1="2" y1="56" x2="22" y2="56" stroke={getLeadColor(inputs[3])} strokeWidth="2.5" />
            </>
          )}

          {/* Output Lead */}
          <line x1="81" y1="36" x2="108" y2="36" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'OR': {
      const is3 = inputCount === 3;
      const is4 = inputCount === 4;
      return (
        <svg width={width} height={height} viewBox="0 0 110 72" className="overflow-visible">
          <path
            d="M 20 12 C 32 24, 32 48, 20 60 C 44 60, 68 50, 78 36 C 68 22, 44 12, 20 12 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {!is3 && !is4 && (
            <>
              <line x1="2" y1="22" x2="26" y2="22" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="50" x2="26" y2="50" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
            </>
          )}
          {is3 && (
            <>
              <line x1="2" y1="18" x2="24" y2="18" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="36" x2="29" y2="36" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
              <line x1="2" y1="54" x2="24" y2="54" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
            </>
          )}
          {is4 && (
            <>
              <line x1="2" y1="16" x2="23" y2="16" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="30" x2="28" y2="30" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
              <line x1="2" y1="42" x2="28" y2="42" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
              <line x1="2" y1="56" x2="23" y2="56" stroke={getLeadColor(inputs[3])} strokeWidth="2.5" />
            </>
          )}

          <line x1="78" y1="36" x2="108" y2="36" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'NOR': {
      const is3 = inputCount === 3;
      const is4 = inputCount === 4;
      return (
        <svg width={width} height={height} viewBox="0 0 110 72" className="overflow-visible">
          <path
            d="M 18 12 C 30 24, 30 48, 18 60 C 40 60, 64 50, 74 36 C 64 22, 40 12, 18 12 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="78.5" cy="36" r="4.5" fill={bodyColor} stroke={strokeColor} strokeWidth="2.2" />

          {!is3 && !is4 && (
            <>
              <line x1="2" y1="22" x2="24" y2="22" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="50" x2="24" y2="50" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
            </>
          )}
          {is3 && (
            <>
              <line x1="2" y1="18" x2="22" y2="18" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="36" x2="27" y2="36" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
              <line x1="2" y1="54" x2="22" y2="54" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
            </>
          )}
          {is4 && (
            <>
              <line x1="2" y1="16" x2="21" y2="16" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
              <line x1="2" y1="30" x2="26" y2="30" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
              <line x1="2" y1="42" x2="26" y2="42" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
              <line x1="2" y1="56" x2="21" y2="56" stroke={getLeadColor(inputs[3])} strokeWidth="2.5" />
            </>
          )}

          <line x1="83" y1="36" x2="108" y2="36" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'XOR': {
      return (
        <svg width={width} height={height} viewBox="0 0 110 72" className="overflow-visible">
          {/* Isolated Input Curve */}
          <path
            d="M 14 12 C 26 24, 26 48, 14 60"
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Main Body */}
          <path
            d="M 22 12 C 34 24, 34 48, 22 60 C 44 60, 68 50, 78 36 C 68 22, 44 12, 22 12 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="2" y1="22" x2="20" y2="22" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="50" x2="20" y2="50" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="78" y1="36" x2="108" y2="36" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'XNOR': {
      return (
        <svg width={width} height={height} viewBox="0 0 110 72" className="overflow-visible">
          <path
            d="M 12 12 C 24 24, 24 48, 12 60"
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 20 12 C 32 24, 32 48, 20 60 C 42 60, 64 50, 74 36 C 64 22, 42 12, 20 12 Z"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="78.5" cy="36" r="4.5" fill={bodyColor} stroke={strokeColor} strokeWidth="2.2" />
          <line x1="2" y1="22" x2="18" y2="22" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="50" x2="18" y2="50" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="83" y1="36" x2="108" y2="36" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'BUFFER': {
      return (
        <svg width={width} height={height} viewBox="0 0 100 60" className="overflow-visible">
          <polygon
            points="24,12 74,30 24,48"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="2" y1="30" x2="24" y2="30" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="74" y1="30" x2="98" y2="30" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'NOT': {
      return (
        <svg width={width} height={height} viewBox="0 0 100 60" className="overflow-visible">
          <polygon
            points="22,12 66,30 22,48"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="71.5" cy="30" r="4.5" fill={bodyColor} stroke={strokeColor} strokeWidth="2.2" />
          <line x1="2" y1="30" x2="22" y2="30" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="76" y1="30" x2="98" y2="30" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'SWITCH': {
      // Authentic LogicFlow Toggle Switch: Square white box with toggle slider inside
      const isOn = Boolean(state?.isOn);
      return (
        <svg width={width} height={height} viewBox="0 0 88 54" className="overflow-visible">
          {/* Chassis Box */}
          <rect
            x="4"
            y="4"
            width="64"
            height="46"
            rx="4"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
          />

          {/* Slider Slot */}
          <rect
            x="14"
            y="17"
            width="44"
            height="20"
            rx="10"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Toggle Slider Knob */}
          <circle
            cx={isOn ? 46 : 26}
            cy="27"
            r="8"
            fill={isOn ? highSignalColor : '#64748b'}
            stroke="#0f172a"
            strokeWidth="1.5"
            className="transition-all duration-200"
          />

          {/* Output Lead Stub */}
          <line x1="68" y1="27" x2="86" y2="27" stroke={getLeadColor(isOn)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'LED': {
      // Authentic LogicFlow Light Bulb: Upright glass dome, metal base, vibrant electric blue halo when ON
      const isLit = Boolean(inputs[0]);
      return (
        <svg width={width} height={height} viewBox="0 0 68 76" className="overflow-visible">
          <defs>
            {/* Electric Blue Glow Filter when Light Bulb is ON */}
            <filter id="bulb-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Radial glow background */}
            <radialGradient id="bulb-radial" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Glowing Aura when ON */}
          {isLit && (
            <circle cx="34" cy="26" r="28" fill="url(#bulb-radial)" filter="url(#bulb-glow)" />
          )}

          {/* Glass Dome */}
          <path
            d="M 22 46 C 12 40, 10 18, 34 10 C 58 18, 56 40, 46 46 Z"
            fill={isLit ? '#e0f2fe' : bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Tungsten Filament */}
          <path
            d="M 28 42 L 30 26 L 34 22 L 38 26 L 40 42"
            fill="none"
            stroke={isLit ? highSignalColor : '#64748b'}
            strokeWidth={isLit ? '2.5' : '1.8'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Filament coils in center */}
          {isLit && (
            <circle cx="34" cy="22" r="3" fill="#ffffff" stroke={highSignalColor} strokeWidth="1.5" />
          )}

          {/* Metallic Screw Base */}
          <rect x="26" y="46" width="16" height="5" rx="1.5" fill="#94a3b8" stroke={strokeColor} strokeWidth="2" />
          <rect x="28" y="51" width="12" height="4" rx="1.5" fill="#64748b" stroke={strokeColor} strokeWidth="2" />
          <path d="M 30 55 L 38 55 L 36 59 L 32 59 Z" fill="#334155" stroke={strokeColor} strokeWidth="1.5" />

          {/* Bottom Lead Stub connecting to terminal pad */}
          <line x1="34" y1="59" x2="34" y2="74" stroke={getLeadColor(isLit)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'BUTTON': {
      const isPressed = Boolean(state?.isOn);
      return (
        <svg width={width} height={height} viewBox="0 0 78 58" className="overflow-visible">
          <rect x="4" y="6" width="56" height="46" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          {/* Button push cap */}
          <rect
            x="14"
            y="14"
            width="36"
            height="30"
            rx="6"
            fill={isPressed ? highSignalColor : '#e2e8f0'}
            stroke={strokeColor}
            strokeWidth="2"
            className="transition-all duration-100"
          />
          <text
            x="32"
            y="33"
            textAnchor="middle"
            fill={isPressed ? '#ffffff' : '#475569'}
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            PUSH
          </text>
          <line x1="60" y1="29" x2="76" y2="29" stroke={getLeadColor(isPressed)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'CLOCK': {
      return (
        <svg width={width} height={height} viewBox="0 0 90 54" className="overflow-visible">
          <rect x="4" y="4" width="66" height="46" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          {/* Pulse wave icon */}
          <path
            d="M 16 34 L 26 34 L 26 18 L 40 18 L 40 34 L 54 34 L 54 18 L 60 18"
            fill="none"
            stroke={isActive ? highSignalColor : strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="37" y="44" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold">
            {state?.frequencyHz || 1} Hz
          </text>
          <line x1="70" y1="27" x2="88" y2="27" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'HIGH_CONST': {
      return (
        <svg width={width} height={height} viewBox="0 0 76 44" className="overflow-visible">
          <rect x="4" y="4" width="54" height="36" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          <text x="31" y="27" textAnchor="middle" fill={highSignalColor} fontSize="18" fontWeight="bold" fontFamily="sans-serif">
            1
          </text>
          <line x1="58" y1="22" x2="74" y2="22" stroke={highSignalColor} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'LOW_CONST': {
      return (
        <svg width={width} height={height} viewBox="0 0 76 44" className="overflow-visible">
          <rect x="4" y="4" width="54" height="36" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          <text x="31" y="27" textAnchor="middle" fill="#475569" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
            0
          </text>
          <line x1="58" y1="22" x2="74" y2="22" stroke={lowSignalColor} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'SEVEN_SEG': {
      // Authentic LogicFlow 4-Bit Digit Display
      const { hexChar } = decodeSevenSegment(inputs);
      return (
        <svg width={width} height={height} viewBox="0 0 96 120" className="overflow-visible">
          {/* Chassis */}
          <rect x="20" y="8" width="68" height="104" rx="6" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />

          {/* 4 Input lead stubs on the left */}
          <line x1="2" y1="26" x2="20" y2="26" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="50" x2="20" y2="50" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="2" y1="74" x2="20" y2="74" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
          <line x1="2" y1="98" x2="20" y2="98" stroke={getLeadColor(inputs[3])} strokeWidth="2.5" />

          {/* Display screen */}
          <rect x="28" y="16" width="52" height="72" rx="4" fill="#0f172a" />
          <text
            x="54"
            y="68"
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="46"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {hexChar}
          </text>
          <text x="54" y="103" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            4-Bit Digit
          </text>
        </svg>
      );
    }

    case 'PROBE': {
      const bit = inputs[0] ? 1 : 0;
      return (
        <svg width={width} height={height} viewBox="0 0 96 58" className="overflow-visible">
          <line x1="2" y1="29" x2="18" y2="29" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <rect x="18" y="6" width="72" height="46" rx="6" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          <text
            x="54"
            y="36"
            textAnchor="middle"
            fill={bit === 1 ? highSignalColor : '#475569'}
            fontSize="26"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {bit}
          </text>
        </svg>
      );
    }

    case 'BUZZER': {
      const isSounding = Boolean(inputs[0]);
      return (
        <svg width={width} height={height} viewBox="0 0 78 64" className="overflow-visible">
          <line x1="2" y1="32" x2="16" y2="32" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <rect x="16" y="8" width="56" height="48" rx="6" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          <path
            d="M 32 24 L 42 18 L 42 46 L 32 40 Z"
            fill={isSounding ? highSignalColor : '#64748b'}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          {isSounding && (
            <path
              d="M 48 24 C 54 28, 54 36, 48 40 M 52 20 C 60 26, 60 38, 52 44"
              fill="none"
              stroke={highSignalColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}
        </svg>
      );
    }

    case 'TRI_STATE': {
      const inVal = Boolean(inputs[0]);
      const enVal = inputs[1] !== undefined ? Boolean(inputs[1]) : true;
      return (
        <svg width={width} height={height} viewBox="0 0 100 64" className="overflow-visible">
          <line x1="2" y1="24" x2="24" y2="24" stroke={getLeadColor(inVal)} strokeWidth="2.5" />
          <line x1="48" y1="60" x2="48" y2="36" stroke={getLeadColor(enVal)} strokeWidth="2.5" />
          <polygon
            points="24,10 68,24 24,38"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="68" y1="24" x2="98" y2="24" stroke={getLeadColor(isActive)} strokeWidth="2.5" />
          <text x="48" y="54" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
            EN
          </text>
        </svg>
      );
    }

    case 'D_FLIP_FLOP': {
      const qVal = Boolean(state?.q);
      const qBarVal = Boolean(state?.qBar);
      return (
        <svg width={width} height={height} viewBox="0 0 110 80" className="overflow-visible">
          {/* IC Body */}
          <rect x="20" y="8" width="70" height="64" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          {/* Leads */}
          <line x1="2" y1="24" x2="20" y2="24" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="56" x2="20" y2="56" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="90" y1="24" x2="108" y2="24" stroke={getLeadColor(qVal)} strokeWidth="2.5" />
          <line x1="90" y1="56" x2="108" y2="56" stroke={getLeadColor(qBarVal)} strokeWidth="2.5" />
          {/* Clock Caret */}
          <path d="M 20 50 L 28 56 L 20 62" fill="none" stroke={strokeColor} strokeWidth="2" />
          {/* Labels */}
          <text x="32" y="28" fill={strokeColor} fontSize="12" fontWeight="bold" fontFamily="monospace">D</text>
          <text x="74" y="28" fill={strokeColor} fontSize="12" fontWeight="bold" fontFamily="monospace">Q</text>
          <text x="72" y="60" fill={strokeColor} fontSize="12" fontWeight="bold" fontFamily="monospace">~Q</text>
          <text x="55" y="44" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">D-FF</text>
        </svg>
      );
    }

    case 'T_FLIP_FLOP': {
      const qVal = Boolean(state?.q);
      const qBarVal = Boolean(state?.qBar);
      return (
        <svg width={width} height={height} viewBox="0 0 110 80" className="overflow-visible">
          <rect x="20" y="8" width="70" height="64" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          <line x1="2" y1="24" x2="20" y2="24" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="56" x2="20" y2="56" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="90" y1="24" x2="108" y2="24" stroke={getLeadColor(qVal)} strokeWidth="2.5" />
          <line x1="90" y1="56" x2="108" y2="56" stroke={getLeadColor(qBarVal)} strokeWidth="2.5" />
          <path d="M 20 50 L 28 56 L 20 62" fill="none" stroke={strokeColor} strokeWidth="2" />
          <text x="32" y="28" fill={strokeColor} fontSize="12" fontWeight="bold" fontFamily="monospace">T</text>
          <text x="74" y="28" fill={strokeColor} fontSize="12" fontWeight="bold" fontFamily="monospace">Q</text>
          <text x="72" y="60" fill={strokeColor} fontSize="12" fontWeight="bold" fontFamily="monospace">~Q</text>
          <text x="55" y="44" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">T-FF</text>
        </svg>
      );
    }

    case 'JK_FLIP_FLOP': {
      const qVal = Boolean(state?.q);
      const qBarVal = Boolean(state?.qBar);
      return (
        <svg width={width} height={height} viewBox="0 0 110 88" className="overflow-visible">
          <rect x="20" y="8" width="70" height="72" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          <line x1="2" y1="20" x2="20" y2="20" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="44" x2="20" y2="44" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="2" y1="68" x2="20" y2="68" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
          <line x1="90" y1="24" x2="108" y2="24" stroke={getLeadColor(qVal)} strokeWidth="2.5" />
          <line x1="90" y1="64" x2="108" y2="64" stroke={getLeadColor(qBarVal)} strokeWidth="2.5" />
          <path d="M 20 38 L 28 44 L 20 50" fill="none" stroke={strokeColor} strokeWidth="2" />
          <text x="32" y="24" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">J</text>
          <text x="32" y="72" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">K</text>
          <text x="74" y="28" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">Q</text>
          <text x="72" y="68" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">~Q</text>
          <text x="55" y="48" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">JK-FF</text>
        </svg>
      );
    }

    case 'SR_FLIP_FLOP': {
      const qVal = Boolean(state?.q);
      const qBarVal = Boolean(state?.qBar);
      return (
        <svg width={width} height={height} viewBox="0 0 110 88" className="overflow-visible">
          <rect x="20" y="8" width="70" height="72" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          <line x1="2" y1="20" x2="20" y2="20" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="44" x2="20" y2="44" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="2" y1="68" x2="20" y2="68" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
          <line x1="90" y1="24" x2="108" y2="24" stroke={getLeadColor(qVal)} strokeWidth="2.5" />
          <line x1="90" y1="64" x2="108" y2="64" stroke={getLeadColor(qBarVal)} strokeWidth="2.5" />
          <path d="M 20 38 L 28 44 L 20 50" fill="none" stroke={strokeColor} strokeWidth="2" />
          <text x="32" y="24" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">S</text>
          <text x="32" y="72" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">R</text>
          <text x="74" y="28" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">Q</text>
          <text x="72" y="68" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">~Q</text>
          <text x="55" y="48" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">SR-FF</text>
        </svg>
      );
    }

    case 'HALF_ADDER': {
      const aVal = Boolean(inputs[0]);
      const bVal = Boolean(inputs[1]);
      const sumVal = aVal !== bVal;
      const carryVal = aVal && bVal;
      return (
        <svg width={width} height={height} viewBox="0 0 110 80" className="overflow-visible">
          <rect x="20" y="8" width="70" height="64" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          <line x1="2" y1="24" x2="20" y2="24" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="56" x2="20" y2="56" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="90" y1="24" x2="108" y2="24" stroke={getLeadColor(sumVal)} strokeWidth="2.5" />
          <line x1="90" y1="56" x2="108" y2="56" stroke={getLeadColor(carryVal)} strokeWidth="2.5" />
          <text x="30" y="28" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">A</text>
          <text x="30" y="60" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">B</text>
          <text x="68" y="28" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">Σ</text>
          <text x="68" y="60" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">Co</text>
          <text x="55" y="44" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">HALF ADD</text>
        </svg>
      );
    }

    case 'FULL_ADDER': {
      const aVal = Boolean(inputs[0]);
      const bVal = Boolean(inputs[1]);
      const cinVal = Boolean(inputs[2]);
      const sumVal = (aVal !== bVal) !== cinVal;
      const coutVal = (aVal && bVal) || (cinVal && (aVal !== bVal));
      return (
        <svg width={width} height={height} viewBox="0 0 110 88" className="overflow-visible">
          <rect x="20" y="8" width="70" height="72" rx="4" fill={bodyColor} stroke={strokeColor} strokeWidth="2.5" />
          <line x1="2" y1="20" x2="20" y2="20" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="44" x2="20" y2="44" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="2" y1="68" x2="20" y2="68" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
          <line x1="90" y1="28" x2="108" y2="28" stroke={getLeadColor(sumVal)} strokeWidth="2.5" />
          <line x1="90" y1="60" x2="108" y2="60" stroke={getLeadColor(coutVal)} strokeWidth="2.5" />
          <text x="30" y="24" fill={strokeColor} fontSize="10" fontWeight="bold" fontFamily="monospace">A</text>
          <text x="30" y="48" fill={strokeColor} fontSize="10" fontWeight="bold" fontFamily="monospace">B</text>
          <text x="26" y="72" fill={strokeColor} fontSize="9" fontWeight="bold" fontFamily="monospace">Cin</text>
          <text x="68" y="32" fill={strokeColor} fontSize="11" fontWeight="bold" fontFamily="monospace">Σ</text>
          <text x="66" y="64" fill={strokeColor} fontSize="9" fontWeight="bold" fontFamily="monospace">Cout</text>
          <text x="55" y="48" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">FULL ADD</text>
        </svg>
      );
    }

    case 'MUX_2TO1': {
      const d0 = Boolean(inputs[0]);
      const d1 = Boolean(inputs[1]);
      const sel = Boolean(inputs[2]);
      const yVal = sel ? d1 : d0;
      return (
        <svg width={width} height={height} viewBox="0 0 96 72" className="overflow-visible">
          <polygon
            points="20,10 72,18 72,52 20,60"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="2" y1="20" x2="20" y2="20" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="2" y1="50" x2="20" y2="50" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="48" y1="70" x2="48" y2="56" stroke={getLeadColor(inputs[2])} strokeWidth="2.5" />
          <line x1="72" y1="35" x2="94" y2="35" stroke={getLeadColor(yVal)} strokeWidth="2.5" />
          <text x="26" y="24" fill={strokeColor} fontSize="9" fontWeight="bold" fontFamily="monospace">0</text>
          <text x="26" y="54" fill={strokeColor} fontSize="9" fontWeight="bold" fontFamily="monospace">1</text>
          <text x="62" y="38" fill={strokeColor} fontSize="10" fontWeight="bold" fontFamily="monospace">Y</text>
          <text x="48" y="36" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">MUX</text>
          <text x="48" y="66" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">S</text>
        </svg>
      );
    }

    case 'DEMUX_1TO2': {
      const inSig = Boolean(inputs[0]);
      const sel = Boolean(inputs[1]);
      const y0 = !sel ? inSig : false;
      const y1 = sel ? inSig : false;
      return (
        <svg width={width} height={height} viewBox="0 0 96 72" className="overflow-visible">
          <polygon
            points="20,18 72,10 72,60 20,52"
            fill={bodyColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line x1="2" y1="35" x2="20" y2="35" stroke={getLeadColor(inputs[0])} strokeWidth="2.5" />
          <line x1="48" y1="70" x2="48" y2="56" stroke={getLeadColor(inputs[1])} strokeWidth="2.5" />
          <line x1="72" y1="20" x2="94" y2="20" stroke={getLeadColor(y0)} strokeWidth="2.5" />
          <line x1="72" y1="50" x2="94" y2="50" stroke={getLeadColor(y1)} strokeWidth="2.5" />
          <text x="26" y="38" fill={strokeColor} fontSize="10" fontWeight="bold" fontFamily="monospace">IN</text>
          <text x="64" y="24" fill={strokeColor} fontSize="9" fontWeight="bold" fontFamily="monospace">0</text>
          <text x="64" y="54" fill={strokeColor} fontSize="9" fontWeight="bold" fontFamily="monospace">1</text>
          <text x="48" y="36" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">DEMUX</text>
          <text x="48" y="66" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">S</text>
        </svg>
      );
    }

    default:
      return null;
  }
};

/**
 * Clean schematic previews for the Component Palette (supporting light and dark themes)
 */
export const PaletteGateSymbol: React.FC<{ type: NodeType; theme?: 'dark' | 'light' }> = ({
  type,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const stroke = isDark ? '#f1f5f9' : '#0f172a';
  const fill = isDark ? '#1e293b' : '#ffffff';

  switch (type) {
    case 'AND':
      return (
        <svg width="56" height="34" viewBox="0 0 68 40" className="overflow-visible">
          <path d="M 16 6 L 34 6 A 14 14 0 0 1 34 34 L 16 34 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="4" y1="12" x2="16" y2="12" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="12" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="28" x2="16" y2="28" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="28" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="48" y1="20" x2="62" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="62" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'NAND':
      return (
        <svg width="56" height="34" viewBox="0 0 68 40" className="overflow-visible">
          <path d="M 14 6 L 32 6 A 14 14 0 0 1 32 34 L 14 34 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="49" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="12" x2="14" y2="12" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="12" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="28" x2="14" y2="28" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="28" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="52" y1="20" x2="64" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="64" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'OR':
      return (
        <svg width="56" height="34" viewBox="0 0 68 40" className="overflow-visible">
          <path d="M 14 6 C 22 13, 22 27, 14 34 C 30 34, 46 28, 52 20 C 46 12, 30 6, 14 6 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="4" y1="12" x2="18" y2="12" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="12" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="28" x2="18" y2="28" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="28" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="52" y1="20" x2="64" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="64" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'NOR':
      return (
        <svg width="56" height="34" viewBox="0 0 68 40" className="overflow-visible">
          <path d="M 12 6 C 20 13, 20 27, 12 34 C 28 34, 44 28, 50 20 C 44 12, 28 6, 12 6 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="53" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="12" x2="16" y2="12" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="12" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="28" x2="16" y2="28" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="28" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="56" y1="20" x2="66" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="66" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'XOR':
      return (
        <svg width="56" height="34" viewBox="0 0 68 40" className="overflow-visible">
          <path d="M 10 6 C 18 13, 18 27, 10 34" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M 16 6 C 24 13, 24 27, 16 34 C 32 34, 48 28, 54 20 C 48 12, 32 6, 16 6 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="4" y1="12" x2="14" y2="12" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="12" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="28" x2="14" y2="28" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="28" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="54" y1="20" x2="66" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="66" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'XNOR':
      return (
        <svg width="56" height="34" viewBox="0 0 68 40" className="overflow-visible">
          <path d="M 8 6 C 16 13, 16 27, 8 34" fill="none" stroke={stroke} strokeWidth="2" />
          <path d="M 14 6 C 22 13, 22 27, 14 34 C 30 34, 46 28, 52 20 C 46 12, 30 6, 14 6 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="55" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="12" x2="12" y2="12" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="12" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="28" x2="12" y2="28" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="28" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="58" y1="20" x2="66" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="66" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'BUFFER':
      return (
        <svg width="56" height="34" viewBox="0 0 68 40" className="overflow-visible">
          <polygon points="16,6 48,20 16,34" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="4" y1="20" x2="16" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="48" y1="20" x2="64" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="64" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'NOT':
      return (
        <svg width="56" height="34" viewBox="0 0 68 40" className="overflow-visible">
          <polygon points="14,6 44,20 14,34" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="48" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="20" x2="14" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="51" y1="20" x2="64" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="64" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'SWITCH':
      return (
        <svg width="44" height="34" viewBox="0 0 54 40" className="overflow-visible">
          <rect x="4" y="4" width="38" height="32" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />
          <rect x="10" y="13" width="26" height="14" rx="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="18" cy="20" r="5" fill="#64748b" stroke="#0f172a" strokeWidth="1" />
          <line x1="42" y1="20" x2="52" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="52" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'LED':
      // Light Bulb icon in Palette
      return (
        <svg width="44" height="44" viewBox="0 0 44 48" className="overflow-visible">
          <path d="M 14 30 C 8 26, 6 12, 22 6 C 38 12, 36 26, 30 30 Z" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M 18 26 L 20 16 L 22 14 L 24 16 L 26 26" fill="none" stroke="#64748b" strokeWidth="1.5" />
          <rect x="17" y="30" width="10" height="4" fill="#94a3b8" stroke={stroke} strokeWidth="1.5" />
          <rect x="18" y="34" width="8" height="3" fill="#64748b" stroke={stroke} strokeWidth="1.5" />
          <circle cx="22" cy="42" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'SEVEN_SEG':
      // 4-Bit Digit icon in Palette
      return (
        <svg width="44" height="44" viewBox="0 0 50 56" className="overflow-visible">
          <rect x="12" y="4" width="34" height="48" rx="4" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="29" y="36" textAnchor="middle" fill={stroke} fontSize="28" fontWeight="bold" fontFamily="monospace">
            F
          </text>
          <line x1="4" y1="14" x2="12" y2="14" stroke={stroke} strokeWidth="1.5" />
          <circle cx="4" cy="14" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="24" x2="12" y2="24" stroke={stroke} strokeWidth="1.5" />
          <circle cx="4" cy="24" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="34" x2="12" y2="34" stroke={stroke} strokeWidth="1.5" />
          <circle cx="4" cy="34" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="4" y1="44" x2="12" y2="44" stroke={stroke} strokeWidth="1.5" />
          <circle cx="4" cy="44" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'BUTTON':
      return (
        <svg width="44" height="34" viewBox="0 0 54 40" className="overflow-visible">
          <rect x="4" y="4" width="36" height="32" rx="4" fill={fill} stroke={stroke} strokeWidth="2" />
          <rect x="12" y="10" width="20" height="20" rx="4" fill="#e2e8f0" stroke={stroke} strokeWidth="1.5" />
          <line x1="40" y1="20" x2="50" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="50" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'CLOCK':
      return (
        <svg width="44" height="34" viewBox="0 0 54 40" className="overflow-visible">
          <rect x="4" y="4" width="38" height="32" rx="4" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M 12 24 L 18 24 L 18 14 L 26 14 L 26 24 L 34 24" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="42" y1="20" x2="52" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="52" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'HIGH_CONST':
      return (
        <svg width="44" height="34" viewBox="0 0 54 40" className="overflow-visible">
          <rect x="4" y="4" width="36" height="32" rx="4" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="22" y="27" textAnchor="middle" fill={stroke} fontSize="20" fontWeight="bold">1</text>
          <line x1="40" y1="20" x2="50" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="50" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'LOW_CONST':
      return (
        <svg width="44" height="34" viewBox="0 0 54 40" className="overflow-visible">
          <rect x="4" y="4" width="36" height="32" rx="4" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="22" y="27" textAnchor="middle" fill={stroke} fontSize="20" fontWeight="bold">0</text>
          <line x1="40" y1="20" x2="50" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="50" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'PROBE':
      return (
        <svg width="44" height="34" viewBox="0 0 54 40" className="overflow-visible">
          <line x1="4" y1="20" x2="14" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <rect x="14" y="6" width="36" height="28" rx="4" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="32" y="26" textAnchor="middle" fill={stroke} fontSize="18" fontWeight="bold" fontFamily="monospace">?</text>
        </svg>
      );

    case 'BUZZER':
      return (
        <svg width="44" height="34" viewBox="0 0 54 40" className="overflow-visible">
          <line x1="4" y1="20" x2="14" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <rect x="14" y="6" width="36" height="28" rx="4" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M 22 16 L 30 12 L 30 28 L 22 24 Z" fill={stroke} />
          <path d="M 34 16 C 37 18, 37 22, 34 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'TRI_STATE':
      return (
        <svg width="56" height="34" viewBox="0 0 68 40" className="overflow-visible">
          <polygon points="16,6 48,20 16,34" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="4" y1="20" x2="16" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="4" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="48" y1="20" x2="64" y2="20" stroke={stroke} strokeWidth="2" />
          <circle cx="64" cy="20" r="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <line x1="32" y1="38" x2="32" y2="26" stroke={stroke} strokeWidth="1.5" />
          <circle cx="32" cy="38" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
      );

    case 'D_FLIP_FLOP':
      return (
        <svg width="50" height="36" viewBox="0 0 60 44" className="overflow-visible">
          <rect x="12" y="4" width="36" height="36" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="18" y="16" fill={stroke} fontSize="9" fontWeight="bold" fontFamily="monospace">D</text>
          <path d="M 12 28 L 17 32 L 12 36" fill="none" stroke={stroke} strokeWidth="1.5" />
          <text x="38" y="16" fill={stroke} fontSize="9" fontWeight="bold" fontFamily="monospace">Q</text>
          <text x="36" y="34" fill={stroke} fontSize="8" fontWeight="bold" fontFamily="monospace">~Q</text>
        </svg>
      );

    case 'T_FLIP_FLOP':
      return (
        <svg width="50" height="36" viewBox="0 0 60 44" className="overflow-visible">
          <rect x="12" y="4" width="36" height="36" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="18" y="16" fill={stroke} fontSize="9" fontWeight="bold" fontFamily="monospace">T</text>
          <path d="M 12 28 L 17 32 L 12 36" fill="none" stroke={stroke} strokeWidth="1.5" />
          <text x="38" y="16" fill={stroke} fontSize="9" fontWeight="bold" fontFamily="monospace">Q</text>
          <text x="36" y="34" fill={stroke} fontSize="8" fontWeight="bold" fontFamily="monospace">~Q</text>
        </svg>
      );

    case 'JK_FLIP_FLOP':
      return (
        <svg width="50" height="36" viewBox="0 0 60 44" className="overflow-visible">
          <rect x="12" y="4" width="36" height="36" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="17" y="14" fill={stroke} fontSize="8" fontWeight="bold" fontFamily="monospace">J</text>
          <path d="M 12 20 L 16 22 L 12 24" fill="none" stroke={stroke} strokeWidth="1.2" />
          <text x="17" y="34" fill={stroke} fontSize="8" fontWeight="bold" fontFamily="monospace">K</text>
          <text x="38" y="16" fill={stroke} fontSize="9" fontWeight="bold" fontFamily="monospace">Q</text>
          <text x="36" y="34" fill={stroke} fontSize="8" fontWeight="bold" fontFamily="monospace">~Q</text>
        </svg>
      );

    case 'SR_FLIP_FLOP':
      return (
        <svg width="50" height="36" viewBox="0 0 60 44" className="overflow-visible">
          <rect x="12" y="4" width="36" height="36" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="17" y="14" fill={stroke} fontSize="8" fontWeight="bold" fontFamily="monospace">S</text>
          <path d="M 12 20 L 16 22 L 12 24" fill="none" stroke={stroke} strokeWidth="1.2" />
          <text x="17" y="34" fill={stroke} fontSize="8" fontWeight="bold" fontFamily="monospace">R</text>
          <text x="38" y="16" fill={stroke} fontSize="9" fontWeight="bold" fontFamily="monospace">Q</text>
          <text x="36" y="34" fill={stroke} fontSize="8" fontWeight="bold" fontFamily="monospace">~Q</text>
        </svg>
      );

    case 'HALF_ADDER':
      return (
        <svg width="50" height="36" viewBox="0 0 60 44" className="overflow-visible">
          <rect x="12" y="4" width="36" height="36" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="30" y="22" textAnchor="middle" fill={stroke} fontSize="9" fontWeight="bold">HA</text>
          <text x="16" y="14" fill="#64748b" fontSize="7">A</text>
          <text x="16" y="34" fill="#64748b" fontSize="7">B</text>
          <text x="40" y="14" fill="#64748b" fontSize="7">Σ</text>
          <text x="40" y="34" fill="#64748b" fontSize="7">C</text>
        </svg>
      );

    case 'FULL_ADDER':
      return (
        <svg width="50" height="36" viewBox="0 0 60 44" className="overflow-visible">
          <rect x="12" y="4" width="36" height="36" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="30" y="24" textAnchor="middle" fill={stroke} fontSize="9" fontWeight="bold">FA</text>
          <text x="15" y="13" fill="#64748b" fontSize="6">A</text>
          <text x="15" y="24" fill="#64748b" fontSize="6">B</text>
          <text x="14" y="35" fill="#64748b" fontSize="5">Ci</text>
          <text x="41" y="14" fill="#64748b" fontSize="7">Σ</text>
          <text x="39" y="34" fill="#64748b" fontSize="5">Co</text>
        </svg>
      );

    case 'MUX_2TO1':
      return (
        <svg width="50" height="36" viewBox="0 0 60 44" className="overflow-visible">
          <polygon points="14,6 44,12 44,32 14,38" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="28" y="25" textAnchor="middle" fill={stroke} fontSize="8" fontWeight="bold">MUX</text>
        </svg>
      );

    case 'DEMUX_1TO2':
      return (
        <svg width="50" height="36" viewBox="0 0 60 44" className="overflow-visible">
          <polygon points="14,12 44,6 44,38 14,32" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x="28" y="25" textAnchor="middle" fill={stroke} fontSize="7" fontWeight="bold">DEMUX</text>
        </svg>
      );

    default:
      return null;
  }
};
