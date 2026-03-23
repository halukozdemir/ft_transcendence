import { W, H, CX, CY } from "../../game/constants";
import type { GameState } from "../../game/types";
import Field from "./Field";
import Player from "./Player";
import Ball from "./Ball";

interface Props {
  state:      GameState | null;
  myPlayerId: string | null;
}

export default function GameCanvas({ state, myPlayerId }: Props) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Field />

      {/* ── Players ── */}
      {state?.players.map((p) => (
        <Player key={p.id} {...p} isMe={p.id === myPlayerId} />
      ))}

      {/* ── Ball ── */}
      {state?.ball && <Ball x={state.ball.x} y={state.ball.y} />}


      {/* ── Waiting overlay ── */}
      {!state && (
        <text
          x={CX} y={CY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fillOpacity={0.3}
          fontSize={20}
          fontFamily="'Segoe UI', sans-serif"
        >
          Waiting for server...
        </text>
      )}
    </svg>
  );
}
