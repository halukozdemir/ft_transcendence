import { useState, useEffect } from "react";
import { MdCheckCircle, MdExitToApp, MdRadioButtonUnchecked } from "react-icons/md";
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
    ? "Draw"
    : winnerTeam === "red"
      ? "Red Team Won"
      : "Purple Team Won";

  const iWon = Boolean(myTeam && winnerTeam && myTeam === winnerTeam);

  
  const myLobbyPlayer = state?.lobby.players.find((p) => p.id === myPlayerId);
  const amReady = myLobbyPlayer?.ready ?? false;

  
  const canJoinTeam = (team: "red" | "blue") => {
    if (!connected || !state || !myTeam) return false;
    if (myTeam === team) return false;
    return state.room.teams[team] < state.room.maxPlayersPerTeam;
  };

  const handleJoinEmptySlot = (team: "red" | "blue") => {
    if (!state || !myTeam || myTeam === team) return;
    if (!canJoinTeam(team)) return;
    onSwitchTeam?.();
  };

  
  const [returnCountdown, setReturnCountdown] = useState<number | null>(null);
  const [showLobbyOverlay, setShowLobbyOverlay] = useState(isLobby);
  const [lobbyOverlayVisible, setLobbyOverlayVisible] = useState(isLobby);
  const [showFinishOverlay, setShowFinishOverlay] = useState(isFinished);
  const [finishOverlayVisible, setFinishOverlayVisible] = useState(isFinished);

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

  useEffect(() => {
    if (isLobby) {
      setShowLobbyOverlay(true);
      const raf = requestAnimationFrame(() => setLobbyOverlayVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setLobbyOverlayVisible(false);
    const timeout = setTimeout(() => setShowLobbyOverlay(false), 280);
    return () => clearTimeout(timeout);
  }, [isLobby]);

  useEffect(() => {
    if (isFinished) {
      setShowFinishOverlay(true);
      const raf = requestAnimationFrame(() => setFinishOverlayVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setFinishOverlayVisible(false);
    const timeout = setTimeout(() => setShowFinishOverlay(false), 280);
    return () => clearTimeout(timeout);
  }, [isFinished]);

  const getLobbyPlayerName = (p: { displayName?: string; clientId?: string; id: string }) => {
    const displayName = p.displayName?.trim();
    const fallback = p.clientId?.toString().trim();
    const baseName = displayName || (fallback ? `Player #${fallback}` : "Player");
    return p.id === myPlayerId ? `${baseName} (You)` : baseName;
  };

  const getTeamLabel = (team: "red" | "blue") => (team === "red" ? "Red Team" : "Purple Team");

  return (
    <div className="w-full h-full bg-bg overflow-hidden rounded-xl p-2 gap-2"
      style={{ display: "grid", gridTemplateRows: state ? "auto 1fr" : "1fr" }}
    >
      
      {state && (isInProgress || isFinished) && (
        <div className="flex flex-col items-center gap-2">
          <Scoreboard score={state.score} match={state.match} />
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Room: {state.room.id ?? "-"}
            </span>
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Players: {state.room.playerCount}/{state.room.maxPlayers}
            </span>
          </div>
        </div>
      )}

      
      {state && isLobby && (
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-bold text-white">Match Lobby</h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Room: {state.room.id ?? "-"}
            </span>
            <span className="px-2 py-1 rounded bg-surface border border-border text-white/80">
              Players: {state.room.playerCount}/{state.room.maxPlayers}
            </span>
          </div>
        </div>
      )}

      
      <div className="relative overflow-hidden">
        
        {state && isInProgress && (
          <div className="absolute top-2 right-2 z-[5]">
            <button
              type="button"
              onClick={onLeaveRoom}
              className="rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"
            >
              Leave Room
            </button>
          </div>
        )}

        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
            isLobby ? "opacity-90 scale-[0.985]" : "opacity-100 scale-100"
          }`}
        >
          <div className="h-full aspect-12/7 max-w-full rounded-xl overflow-hidden">
            <GameCanvas state={state} myPlayerId={myPlayerId} />
          </div>
        </div>

        
        {state && showLobbyOverlay && (
          <div
            className={`absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
              lobbyOverlayVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className={`w-[min(95%,560px)] rounded-2xl border border-border bg-surface/95 p-5 shadow-[0_14px_50px_rgba(0,0,0,0.45)] transition-all duration-300 ${
                lobbyOverlayVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-[0.98]"
              }`}
            >
              <div className="mb-4 rounded-xl border border-white/10 bg-bg/40 px-3 py-2">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                  Select an empty slot to switch team
                </div>
              </div>

              
              <div className="grid grid-cols-2 gap-4">
                
                <div className="rounded-xl border border-team-red/30 bg-team-red/5 p-3">
                  <h3 className="text-center text-sm font-bold text-team-red mb-3">
                    {getTeamLabel("red")} ({state.room.teams.red}/{state.room.maxPlayersPerTeam})
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
                            {getLobbyPlayerName(p)}
                          </span>
                          <span className={`text-xs font-semibold ${p.ready ? "text-green-400" : "text-white/40"}`}>
                            {p.ready ? "READY" : "Waiting"}
                          </span>
                        </div>
                      ))}
                    {Array.from({ length: state.room.maxPlayersPerTeam - state.room.teams.red }).map((_, i) => (
                      <button
                        key={`empty-red-${i}`}
                        type="button"
                        onClick={() => handleJoinEmptySlot("red")}
                        disabled={!canJoinTeam("red")}
                        className={`w-full rounded-lg border border-dashed px-3 py-2 text-sm text-center transition ${
                          canJoinTeam("red")
                            ? "cursor-pointer border-team-red/40 bg-team-red/10 text-team-red hover:bg-team-red/20"
                            : "cursor-not-allowed border-white/10 text-white/20"
                        }`}
                      >
                        {canJoinTeam("red") ? (
                          <span className="inline-flex items-center justify-center gap-1">Join this slot</span>
                        ) : "Empty Slot"}
                      </button>
                    ))}
                  </div>
                </div>

                
                <div className="rounded-xl border border-team-blue/30 bg-team-blue/5 p-3">
                  <h3 className="text-center text-sm font-bold text-team-blue mb-3">
                    {getTeamLabel("blue")} ({state.room.teams.blue}/{state.room.maxPlayersPerTeam})
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
                            {getLobbyPlayerName(p)}
                          </span>
                          <span className={`text-xs font-semibold ${p.ready ? "text-green-400" : "text-white/40"}`}>
                            {p.ready ? "READY" : "Waiting"}
                          </span>
                        </div>
                      ))}
                    {Array.from({ length: state.room.maxPlayersPerTeam - state.room.teams.blue }).map((_, i) => (
                      <button
                        key={`empty-blue-${i}`}
                        type="button"
                        onClick={() => handleJoinEmptySlot("blue")}
                        disabled={!canJoinTeam("blue")}
                        className={`w-full rounded-lg border border-dashed px-3 py-2 text-sm text-center transition ${
                          canJoinTeam("blue")
                            ? "cursor-pointer border-team-blue/40 bg-team-blue/10 text-team-blue hover:bg-team-blue/20"
                            : "cursor-not-allowed border-white/10 text-white/20"
                        }`}
                      >
                        {canJoinTeam("blue") ? (
                          <span className="inline-flex items-center justify-center gap-1">Join this slot</span>
                        ) : "Empty Slot"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              
              <div className="mt-4 rounded-xl border border-border bg-bg/60 px-3 py-2 text-center text-xs text-white/60">
                {!state.lobby.teamsEqual && (
                  <span>Teams must be balanced. </span>
                )}
                {state.lobby.teamsEqual && !state.lobby.allReady && (
                  <span>All players must be ready. ({state.lobby.readyCount}/{state.lobby.totalCount} ready)</span>
                )}
                {state.lobby.canStart && (
                  <span className="text-green-400 font-semibold">Match starting...</span>
                )}
              </div>

              
              <div className="flex gap-2 mt-4">
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
                  <span className="inline-flex items-center gap-1.5">
                    {amReady ? <MdRadioButtonUnchecked /> : <MdCheckCircle />}
                    {amReady ? "Not Ready" : "I'm Ready"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onLeaveRoom}
                  className="rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/25"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <MdExitToApp /> Leave
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        
        {state && showFinishOverlay && (
          <div
            className={`absolute inset-0 z-10 flex items-center justify-center bg-black/45 backdrop-blur-[1px] transition-opacity duration-300 ${
              finishOverlayVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className={`w-[min(92%,420px)] rounded-2xl border border-border bg-surface/95 p-5 text-center shadow-xl transition-all duration-300 ${
                finishOverlayVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-[0.98]"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Match Finished</p>
              <h3 className={`mt-2 text-2xl font-black ${winnerTeam === "red" ? "text-team-red" : winnerTeam === "blue" ? "text-team-blue" : "text-system"}`}>
                {winnerLabel}
              </h3>
              <p className="mt-2 text-sm text-white/80">
                {winnerTeam ? (iWon ? "Congratulations, your team won." : "The opposing team won this round.") : "The match ended in a draw."}
              </p>

              <div className="mt-4 rounded-xl border border-border bg-bg/60 px-3 py-2 text-xs text-white/60">
                {returnCountdown !== null && returnCountdown > 0 ? (
                  <span>Returning to lobby in {returnCountdown} seconds...</span>
                ) : (
                  <span>Returning to lobby...</span>
                )}
              </div>

              <button
                type="button"
                onClick={onLeaveRoom}
                className="mt-4 w-full rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/25"
              >
                <span className="inline-flex items-center gap-1.5">
                  <MdExitToApp /> Leave Room
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
