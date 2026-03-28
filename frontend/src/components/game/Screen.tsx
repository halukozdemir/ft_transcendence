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
        <div className="flex flex-col items-center gap-2">
          <Scoreboard score={state.score} match={state.match} />
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Oda: {state.room.id ?? "-"}
            </span>
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Oyuncu: {state.room.playerCount}/{state.room.maxPlayers}
            </span>
            <span className={`px-2 py-1 rounded border ${state.room.isFull ? "bg-red-500/15 border-red-500/40 text-red-300" : "bg-green-500/15 border-green-500/40 text-green-300"}`}>
              {state.room.isFull ? "Oda Dolu" : `Açık (${state.room.availableSlots} boş)`}
            </span>
            <span className="px-2 py-1 rounded bg-team-red/15 border border-team-red/40 text-team-red">
              Kırmızı: {state.room.teams.red}
            </span>
            <span className="px-2 py-1 rounded bg-team-blue/15 border border-team-blue/40 text-team-blue">
              Mavi: {state.room.teams.blue}
            </span>
          </div>
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
