import GameCanvas from "./GameCanvas";
import Scoreboard from "./Scoreboard";
import type { GameState } from "../../types/game";

interface Props {
  state:      GameState | null;
  myPlayerId: string | null;
}

export default function Screen({ state, myPlayerId }: Props) {
  return (
    <div className="w-full h-full bg-bg overflow-hidden rounded-xl p-2 gap-2"
      style={{ display: "grid", gridTemplateRows: state ? "auto 1fr" : "1fr" }}
    >
      {/* ── Scoreboard ── */}
      {state && (
        <div className="flex justify-center">
          <Scoreboard score={state.score} match={state.match} />
        </div>
      )}

      {/* ── Canvas ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full aspect-12/7 max-w-full rounded-xl overflow-hidden">
            <GameCanvas state={state} myPlayerId={myPlayerId} />
          </div>
        </div>
      </div>

    </div>
  );
}
