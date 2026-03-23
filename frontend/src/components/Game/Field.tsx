import { CX, CY, CR, FX, FY, FW, FH, GW, GH, GY } from "../../game/constants";

// ── Stroke tokens ────────────────────────────────────────────────────────────
const LINE = { stroke: "white", strokeOpacity: 0.1,  strokeWidth: 2, fill: "none" } as const;
const GOAL = { stroke: "white", strokeOpacity: 0.25, strokeWidth: 2              } as const;

// ── Field background + markings (no <svg> root — lives inside GameCanvas) ───

export default function Field() {
  return (
    <g>
      {/* ── Field surface ── */}
      <rect
        x={FX} y={FY} width={FW} height={FH}
        fill="#0c0c1e"
        stroke="white" strokeOpacity={0.1} strokeWidth={2}
        rx={6}
      />

      {/* ── Center line ── */}
      <line x1={CX} y1={FY} x2={CX} y2={FY + FH} {...LINE} />

      {/* ── Center circle ── */}
      <circle cx={CX} cy={CY} r={CR} {...LINE} />

      {/* ── Center dot ── */}
      <circle cx={CX} cy={CY} r={5} fill="white" fillOpacity={0.15} />

      {/* ── Left goal ── */}
      <rect
        x={FX - GW} y={GY} width={GW} height={GH}
        fill="white" fillOpacity={0.03}
        {...GOAL}
      />

      {/* ── Right goal ── */}
      <rect
        x={FX + FW} y={GY} width={GW} height={GH}
        fill="white" fillOpacity={0.03}
        {...GOAL}
      />

      {/* ── Corner arcs ── */}
      <CornerArc x={FX}      y={FY}      sweep={1} />
      <CornerArc x={FX + FW} y={FY}      sweep={0} />
      <CornerArc x={FX}      y={FY + FH} sweep={0} />
      <CornerArc x={FX + FW} y={FY + FH} sweep={1} />
    </g>
  );
}

// ── Corner arc helper ────────────────────────────────────────────────────────

const ARC_R = 22;

function CornerArc({ x, y, sweep }: { x: number; y: number; sweep: 0 | 1 }) {
  const dx = x === FX ? ARC_R : -ARC_R;
  const dy = y === FY ? ARC_R : -ARC_R;
  return (
    <path
      d={`M ${x} ${y + dy} A ${ARC_R} ${ARC_R} 0 0 ${sweep} ${x + dx} ${y}`}
      {...LINE}
    />
  );
}
