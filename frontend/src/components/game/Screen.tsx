import { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import Scoreboard from "./Scoreboard";
import type { GameState } from "../../types/game";

interface Props {
  state:      GameState | null;
  myPlayerId: string | null;
  connected?: boolean;
  onRematch?: () => void;
  onLeaveRoom?: () => void;
}

export default function Screen({ state, myPlayerId, connected = false, onRematch, onLeaveRoom }: Props) {
  const myTeam = state?.players.find((p) => p.id === myPlayerId)?.team;
  const isFinished = state?.match.status === "finished";
  const winnerTeam = state?.match.winnerTeam;
  const hasMissingTeam = Boolean(state && (state.room.teams.red === 0 || state.room.teams.blue === 0));
  const isWaitingForOpponent = Boolean(
    state
    && !isFinished
    && state.match.status !== "in_progress"
    && state.room.playerCount > 0
    && (state.match.endReason === "opponent_missing" || hasMissingTeam)
  );
  const missingTeamLabel = state?.room.teams.red === 0 ? "Kırmızı" : "Mavi";
  const rematchAccepted = Boolean(state?.match.rematch.requestedPlayerIds.includes(myPlayerId || ""));

  const winnerLabel = !winnerTeam
    ? "Berabere"
    : winnerTeam === "red"
      ? "Kırmızı Takım Kazandı"
      : "Mavi Takım Kazandı";

  const iWon = Boolean(myTeam && winnerTeam && myTeam === winnerTeam);

  // Countdown timer for rematch timeout
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const timeout = state?.match.rematch.timeoutRemainingSeconds;
    if (timeout && timeout > 0) {
      setCountdown(timeout);
      const interval = setInterval(() => {
        setCountdown((prev) => (prev && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdown(null);
    }
  }, [state?.match.rematch.timeoutRemainingSeconds]);

  // Auto-leave room when rematch timeout expires
  useEffect(() => {
    if (countdown === 0) {
      const timer = setTimeout(() => {
        onLeaveRoom?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown, onLeaveRoom]);

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
        {/* Leave button - top right during gameplay */}
        {state && !isWaitingForOpponent && !isFinished && (
          <div className="absolute top-2 right-2 z-[5]">
            <button
              type="button"
              onClick={onLeaveRoom}
              className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"
            >
              Odadan Çık
            </button>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full aspect-12/7 max-w-full rounded-xl overflow-hidden">
            <GameCanvas state={state} myPlayerId={myPlayerId} />
          </div>
        </div>

        {state && isWaitingForOpponent && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <div className="w-[min(92%,420px)] rounded-2xl border border-border bg-surface/95 p-5 text-center shadow-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Maç Durdu</p>
              <h3 className="mt-2 text-2xl font-black text-system">Oyuncu Bekleniyor</h3>
              <p className="mt-2 text-sm text-white/80">
                {missingTeamLabel} takımından en az 1 oyuncu bağlanınca maç yeniden başlayacak.
              </p>
              <button
                type="button"
                onClick={onLeaveRoom}
                className="mt-4 w-full rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/25"
              >
                Odadan Çık
              </button>
            </div>
          </div>
        )}

        {state && isFinished && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
            <div className="w-[min(92%,420px)] rounded-2xl border border-border bg-surface/95 p-5 text-center shadow-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Maç Bitti</p>
              <h3 className={`mt-2 text-2xl font-black ${winnerTeam === "red" ? "text-team-red" : winnerTeam === "blue" ? "text-team-blue" : "text-system"}`}>
                {winnerLabel}
              </h3>
              <p className="mt-2 text-sm text-white/80">
                {winnerTeam ? (iWon ? "Tebrikler, senin takımın kazandı." : "Bu turu rakip takım aldı.") : "Skor eşit bitti."}
              </p>

              <div className="mt-4 rounded-xl border border-border bg-bg/60 px-3 py-2 text-xs text-white/80">
                <div className="flex items-center justify-between">
                  <div>
                    Rematch: <span className="font-semibold text-white">{state.match.rematch.acceptedCount}/{state.match.rematch.requiredCount}</span>
                  </div>
                  {countdown !== null && (
                    <div className={`font-semibold ${countdown <= 10 ? "text-red-400" : "text-yellow-300"}`}>
                      {countdown}s
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={onRematch}
                  disabled={!connected || rematchAccepted}
                  className="flex-1 rounded-xl border border-system/40 bg-system/15 px-4 py-2 text-sm font-semibold text-system transition hover:bg-system/25 disabled:cursor-not-allowed disabled:border-border disabled:bg-bg/40 disabled:text-white/40"
                >
                  {!connected ? "Bağlantı bekleniyor" : rematchAccepted ? "Rematch onayın alındı" : "Rematch iste"}
                </button>
                <button
                  type="button"
                  onClick={onLeaveRoom}
                  className="flex-1 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/25"
                >
                  Odadan Çık
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
