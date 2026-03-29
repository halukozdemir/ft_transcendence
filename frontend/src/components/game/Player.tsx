import { PLAYER_RADIUS } from "../../constants/game";
import type { PlayerState } from "../../types/game";
interface Props extends PlayerState {
  isMe: boolean;
}

const TEAM_FILL: Record<string, string> = {
  red:  "#ff4040",
  blue: "#a855f7",
};

const TEAM_SHADOW: Record<string, string> = {
  red:  "drop-shadow(0 0 10px rgba(255,64,64,0.7)) drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
  blue: "drop-shadow(0 0 10px rgba(168,85,247,0.7)) drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
};

export default function Player({ x, y, name, team, isMe }: Props) {
  const fill   = TEAM_FILL[team] ?? "#888";
  const r      = PLAYER_RADIUS;

  const shadow = TEAM_SHADOW[team] ?? "drop-shadow(0 4px 6px rgba(0,0,0,0.5))";

  return (
    <g style={{ filter: shadow }}>
      
      {isMe && (
        <circle
          cx={x} cy={y} r={r + 5}
          fill="none"
          stroke={fill}
          strokeOpacity={0.35}
          strokeWidth={3}
        />
      )}

      
      <circle
        cx={x} cy={y} r={r}
        fill={fill}
        fillOpacity={isMe ? 1 : 0.75}
        stroke="white"
        strokeOpacity={isMe ? 0.6 : 0.2}
        strokeWidth={isMe ? 2 : 1}
      />

      
      <text
        x={x} y={y + r + 14}
        textAnchor="middle"
        fill="white"
        fillOpacity={isMe ? 1 : 0.6}
        fontSize={13}
        fontWeight={isMe ? "bold" : "normal"}
        fontFamily="'Segoe UI', sans-serif"
      >
        {isMe ? "YOU" : name}
      </text>
    </g>
  );
}
