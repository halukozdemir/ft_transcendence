import { CX, CY, CR, FX, FY, FW, FH, GW, GH, GY } from "../../constants/game";
const LINE = { stroke: "white", strokeOpacity: 0.1,  strokeWidth: 2, fill: "none" } as const;
const GOAL = { stroke: "white", strokeOpacity: 0.25, strokeWidth: 2              } as const;

export default function Field() {
  return (
    <g>
      
      <rect
        x={FX} y={FY} width={FW} height={FH}
        fill="#0c0c1e"
        stroke="white" strokeOpacity={0.1} strokeWidth={2}
        rx={6}
      />

      
      <line x1={CX} y1={FY} x2={CX} y2={FY + FH} {...LINE} />

      
      <circle cx={CX} cy={CY} r={CR} {...LINE} />

      
      <circle cx={CX} cy={CY} r={5} fill="white" fillOpacity={0.15} />

      
      <rect
        x={FX - GW} y={GY} width={GW} height={GH}
        fill="white" fillOpacity={0.03}
        {...GOAL}
      />

      
      <rect
        x={FX + FW} y={GY} width={GW} height={GH}
        fill="white" fillOpacity={0.03}
        {...GOAL}
      />

      
      <CornerArc x={FX}      y={FY}      sweep={1} />
      <CornerArc x={FX + FW} y={FY}      sweep={0} />
      <CornerArc x={FX}      y={FY + FH} sweep={0} />
      <CornerArc x={FX + FW} y={FY + FH} sweep={1} />
    </g>
  );
}

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
