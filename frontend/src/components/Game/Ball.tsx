import { BALL_RADIUS } from "../../game/constants";
import type { BallState } from "../../game/types";

export default function Ball({ x, y }: BallState) {
  const r = BALL_RADIUS;

  return (
    <g>
      {/* ── Outer glow (wide, soft purple) ── */}
      <circle
        cx={x} cy={y} r={r * 2.8}
        fill="rgba(180,130,255,0.12)"
      />

      {/* ── Mid glow ── */}
      <circle
        cx={x} cy={y} r={r * 1.8}
        fill="rgba(200,160,255,0.18)"
      />

      {/* ── Dashed orbit ring ── */}
      <circle
        cx={x} cy={y} r={r + 7}
        fill="none"
        stroke="rgba(200,170,255,0.45)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />

      {/* ── Body ── */}
      <circle
        cx={x} cy={y} r={r}
        fill="white"
        style={{ filter: "drop-shadow(0 0 6px rgba(220,180,255,0.9)) drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
      />

      {/* ── Shine ── */}
      <circle
        cx={x - r * 0.28} cy={y - r * 0.28} r={r * 0.32}
        fill="white"
        fillOpacity={0.6}
      />
    </g>
  );
}
