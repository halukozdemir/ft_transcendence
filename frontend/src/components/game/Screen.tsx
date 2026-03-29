import { useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import Scoreboard from "./Scoreboard";
import type { GameState } from "../../types/game";

interface Props {
  state:      GameState | null;
  myPlayerId: string | null;
  connected?: boolean;
  onLeaveRoom?: () => void;
  onSwitchTeam?: () => void;
  onToggleReady?: () => void;
}

export default function Screen({ state, myPlayerId, connected = false, onLeaveRoom, onSwitchTeam, onToggleReady }: Props) {
  const myTeam = state?.players.find((p) => p.id === myPlayerId)?.team;
  const isFinished = state?.match.status === "finished";
  const isLobby = state?.match.status === "lobby";
  const isInProgress = state?.match.status === "in_progress";
  const winnerTeam = state?.match.winnerTeam;

  const winnerLabel = !winnerTeam
    ? "Berabere"
    : winnerTeam === "red"
      ? "Kırmızı Takım Kazandı"
      : "Mavi Takım Kazandı";

  const iWon = Boolean(myTeam && winnerTeam && myTeam === winnerTeam);

  // Check if current player is ready
  const myLobbyPlayer = state?.lobby.players.find((p) => p.id === myPlayerId);
  const amReady = myLobbyPlayer?.ready ?? false;

  // Check if my team's opponent team is full (for switch button)
  const otherTeam = myTeam === "red" ? "blue" : "red";
  const otherTeamCount = state?.room.teams[otherTeam] ?? 0;
  const otherTeamMax = state?.room.maxPlayersPerTeam ?? 1;
  const canSwitch = otherTeamCount < otherTeamMax;

  // Countdown for returning to lobby after match end
  const [returnCountdown, setReturnCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (isFinished) {
      setReturnCountdown(5);
      const interval = setInterval(() => {
        setReturnCountdown((prev) => (prev && prev > 0 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setReturnCountdown(null);
    }
  }, [isFinished]);

  return (
    <div className="w-full h-full bg-bg overflow-hidden rounded-xl p-2 gap-2"
      style={{ display: "grid", gridTemplateRows: state ? "auto 1fr" : "1fr" }}
    >
      {/* Scoreboard - only during match or finished */}
      {state && (isInProgress || isFinished) && (
        <div className="flex flex-col items-center gap-2">
          <Scoreboard score={state.score} match={state.match} />
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Oda: {state.room.id ?? "-"}
            </span>
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Oyuncu: {state.room.playerCount}/{state.room.maxPlayers}
            </span>
          </div>
        </div>
      )}

      {/* Lobby header */}
      {state && isLobby && (
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-bold text-white">Lobi</h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Oda: {state.room.id ?? "-"}
            </span>
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Oyuncu: {state.room.playerCount}/{state.room.maxPlayers}
            </span>
          </div>
        </div>
      )}

      {/* Canvas area */}
      <div className="relative overflow-hidden">
        {/* Leave button during gameplay */}
        {state && isInProgress && (
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

        {/* LOBBY OVERLAY */}
        {state && isLobby && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="w-[min(95%,520px)] rounded-2xl border border-border bg-surface/95 p-5 shadow-xl">

              {/* Teams side by side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Red Team */}
                <div className="rounded-xl border border-team-red/30 bg-team-red/5 p-3">
                  <h3 className="text-center text-sm font-bold text-team-red mb-3">
                    Kırmızı Takım ({state.room.teams.red}/{state.room.maxPlayersPerTeam})
                  </h3>
                  <div className="space-y-2">
                    {state.lobby.players
                      .filter((p) => p.team === "red")
                      .map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                            p.id === myPlayerId
                              ? "bg-team-red/20 border border-team-red/40"
                              : "bg-white/5"
                          }`}
                        >
                          <span className="text-white/90 truncate">
                            {p.clientId?.toString().slice(0, 8) || "Oyuncu"}
                            {p.id === myPlayerId && " (Sen)"}
                          </span>
                          <span className={`text-xs font-semibold ${p.ready ? "text-green-400" : "text-white/40"}`}>
                            {p.ready ? "HAZIR" : "Bekliyor"}
                          </span>
                        </div>
                      ))}
                    {Array.from({ length: state.room.maxPlayersPerTeam - state.room.teams.red }).map((_, i) => (
                      <div key={`empty-red-${i}`} className="rounded-lg border border-dashed border-white/10 px-3 py-2 text-sm text-white/20 text-center">
                        Boş Slot
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blue Team */}
                <div className="rounded-xl border border-team-blue/30 bg-team-blue/5 p-3">
                  <h3 className="text-center text-sm font-bold text-team-blue mb-3">
                    Mavi Takım ({state.room.teams.blue}/{state.room.maxPlayersPerTeam})
                  </h3>
                  <div className="space-y-2">
                    {state.lobby.players
                      .filter((p) => p.team === "blue")
                      .map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                            p.id === myPlayerId
                              ? "bg-team-blue/20 border border-team-blue/40"
                              : "bg-white/5"
                          }`}
                        >
                          <span className="text-white/90 truncate">
                            {p.clientId?.toString().slice(0, 8) || "Oyuncu"}
                            {p.id === myPlayerId && " (Sen)"}
                          </span>
                          <span className={`text-xs font-semibold ${p.ready ? "text-green-400" : "text-white/40"}`}>
                            {p.ready ? "HAZIR" : "Bekliyor"}
                          </span>
                        </div>
                      ))}
                    {Array.from({ length: state.room.maxPlayersPerTeam - state.room.teams.blue }).map((_, i) => (
                      <div key={`empty-blue-${i}`} className="rounded-lg border border-dashed border-white/10 px-3 py-2 text-sm text-white/20 text-center">
                        Boş Slot
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status info */}
              <div className="mt-4 rounded-xl border border-border bg-bg/60 px-3 py-2 text-center text-xs text-white/60">
                {!state.lobby.teamsEqual && (
                  <span>Takımlar eşit olmalı. </span>
                )}
                {state.lobby.teamsEqual && !state.lobby.allReady && (
                  <span>Tüm oyuncular hazır olmalı. ({state.lobby.readyCount}/{state.lobby.totalCount} hazır)</span>
                )}
                {state.lobby.canStart && (
                  <span className="text-green-400 font-semibold">Maç başlıyor...</span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={onSwitchTeam}
                  disabled={!connected || !canSwitch}
                  className="flex-1 rounded-xl border border-yellow-500/40 bg-yellow-500/15 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/25 disabled:cursor-not-allowed disabled:border-border disabled:bg-bg/40 disabled:text-white/40"
                >
                  Takım Değiştir
                </button>
                <button
                  type="button"
                  onClick={onToggleReady}
                  disabled={!connected}
                  className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    amReady
                      ? "border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                      : "border-green-500/40 bg-green-500/15 text-green-300 hover:bg-green-500/25"
                  } disabled:cursor-not-allowed disabled:border-border disabled:bg-bg/40 disabled:text-white/40`}
                >
                  {amReady ? "Hazır Değilim" : "Hazırım"}
                </button>
                <button
                  type="button"
                  onClick={onLeaveRoom}
                  className="rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/25"
                >
                  Çık
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MATCH FINISHED OVERLAY */}
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

              <div className="mt-4 rounded-xl border border-border bg-bg/60 px-3 py-2 text-xs text-white/60">
                {returnCountdown !== null && returnCountdown > 0 ? (
                  <span>{returnCountdown} saniye içinde lobiye dönülüyor...</span>
                ) : (
                  <span>Lobiye dönülüyor...</span>
                )}
              </div>

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
      </div>
    </div>
  );
}
