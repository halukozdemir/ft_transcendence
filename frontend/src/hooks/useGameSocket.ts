import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, PlayerState, BallState, LobbyState } from "../types/game";
import { FX, FY, FW, FH } from "../constants/game";


const SERVER_W = 800;
const SERVER_H = 500;


const INITIAL_RENDER_DELAY = 100;

/**
 * Convert raw server payload into the normalized client-side game state shape.
 */
function transformState(raw: any): GameState {
  const players = Object.values(raw.players || {}).map((p: any) => ({
    id: p.id,
    name: p.team === "red" ? "Red" : "Blue",
    team: p.team as "red" | "blue",
    x: FX + (p.x / SERVER_W) * FW,
    y: FY + (p.y / SERVER_H) * FH,
    ready: Boolean(p.ready),
  }));

  const room = raw.room || {};
  const playerCount = Number(room.playerCount ?? players.length ?? 0);
  const maxPlayers = Number(room.maxPlayers ?? 2);
  const availableSlots = Number(room.availableSlots ?? Math.max(0, maxPlayers - playerCount));

  const lobby: LobbyState = raw.lobby ? {
    players: Array.isArray(raw.lobby.players) ? raw.lobby.players : [],
    teamsEqual: Boolean(raw.lobby.teamsEqual),
    allReady: Boolean(raw.lobby.allReady),
    canStart: Boolean(raw.lobby.canStart),
    readyCount: Number(raw.lobby.readyCount ?? 0),
    totalCount: Number(raw.lobby.totalCount ?? 0),
  } : {
    players: [],
    teamsEqual: false,
    allReady: false,
    canStart: false,
    readyCount: 0,
    totalCount: 0,
  };

  return {
    players,
    ball: {
      x: FX + (raw.ball.x / SERVER_W) * FW,
      y: FY + (raw.ball.y / SERVER_H) * FH,
    },
    score: raw.score,
    match: {
      redTeamName: "Red",
      blueTeamName: "Blue",
      round: 1,
      timeLeft: raw.match?.timeRemainingSeconds ?? 0,
      status: raw.match?.status ?? "lobby",
      endReason: raw.match?.endReason ?? null,
      winnerTeam: raw.match?.winnerTeam ?? null,
      loserTeam: raw.match?.loserTeam ?? null,
      forfeitTeam: raw.match?.forfeitTeam ?? null,
      disconnectedTeam: raw.match?.disconnectedTeam ?? null,
    },
    lobby,
    room: {
      id: room.id ?? null,
      playerCount,
      maxPlayers,
      availableSlots,
      isFull: Boolean(room.isFull ?? playerCount >= maxPlayers),
      teams: {
        red: Number(room.teams?.red ?? players.filter((p: any) => p.team === "red").length),
        blue: Number(room.teams?.blue ?? players.filter((p: any) => p.team === "blue").length),
      },
      minPlayersPerTeam: Number(room.minPlayersPerTeam ?? 1),
      maxPlayersPerTeam: Number(room.maxPlayersPerTeam ?? Math.max(1, Math.ceil(maxPlayers / 2))),
    },
  };
}

interface Snapshot {
  state: GameState;
  time: number;
}

interface UseGameSocketOptions {
  roomId?: string;
  roomPassword?: string;
  username?: string;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate between two snapshots to render smooth motion between network ticks.
 */
function interpolate(from: GameState, to: GameState, t: number): GameState {
  const ct = Math.max(0, Math.min(1, t));

  const players: PlayerState[] = to.players.map((tp) => {
    const fp = from.players.find((p) => p.id === tp.id);
    if (!fp) return { ...tp };
    return {
      ...tp,
      x: lerp(fp.x, tp.x, ct),
      y: lerp(fp.y, tp.y, ct),
    };
  });

  return {
    players,
    ball: {
      x: lerp(from.ball.x, to.ball.x, ct),
      y: lerp(from.ball.y, to.ball.y, ct),
    } as BallState,
    score: to.score,
    match: to.match,
    lobby: to.lobby,
    room: to.room,
  };
}

/**
 * Manage authenticated game socket connection with snapshot buffering and frame interpolation.
 */
export function useGameSocket(accessToken?: string | null, options: UseGameSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const bufferRef = useRef<Snapshot[]>([]);
  const rafRef = useRef<number>(0);
  const renderDelayRef = useRef(INITIAL_RENDER_DELAY);
  const packetTimesRef = useRef<number[]>([]);
  const lastRawRef = useRef<any>(null);

  const serverOffsetRef = useRef<number | null>(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      console.warn("No access token provided to useGameSocket");
      return;
    }

    const socket = io(window.location.origin, {
      path: "/ws/game/",
      transports: ["websocket"],
      auth: {
        token: accessToken,
        roomId: options.roomId,
        roomPassword: options.roomPassword,
        username: options.username,
      },
    });
    socketRef.current = socket;
    joinedRef.current = false;

    socket.on("connect", () => {
      setConnected(true);
      setJoinError(null);
    });

    socket.on("joined", () => {
      joinedRef.current = true;
      setMyPlayerId(socket.id ?? null);
    });

    socket.on("state", (raw: any) => {
      const serverTime = raw.meta?.serverTimeMs || performance.now();
      const clientTime = performance.now();

      // Smooth clock offset to avoid abrupt render-time jumps on jittery links.
      const currentOffset = serverTime - clientTime;
      if (serverOffsetRef.current === null) {
        serverOffsetRef.current = currentOffset;
      } else {
        serverOffsetRef.current = serverOffsetRef.current * 0.99 + currentOffset * 0.01;
      }

      lastRawRef.current = raw;
      packetTimesRef.current.push(clientTime);
      if (packetTimesRef.current.length > 120) {
        packetTimesRef.current = packetTimesRef.current.slice(-60);
      }

      bufferRef.current.push({
        state: transformState(raw),
        time: serverTime,
      });

      // Bound buffer size to cap memory and interpolation scan cost.
      if (bufferRef.current.length > 60) {
        bufferRef.current = bufferRef.current.slice(-30);
      }
    });

    socket.on("room_full", () => {
      setJoinError("Room is full.");
      console.warn("Room is full");
    });

    socket.on("room_not_found", () => {
      setJoinError("Room not found.");
    });

    socket.on("room_invalid_password", () => {
      setJoinError("Incorrect room password.");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      if (joinedRef.current) {
        setJoinError("Connection lost. Reconnecting...");
      } else if (options.roomId) {
        setJoinError((prev: string | null) => prev || "Could not join room.");
      }
    });

    socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });

    socket.on("connect_error", (error: any) => {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("authentication failed") || message.includes("no authentication token")) {
        setJoinError("Session authentication failed.");
        return;
      }
      if (options.roomId && !joinedRef.current) {
        setJoinError("Could not join room.");
      }
    });

    
    function tick() {
      const buffer = bufferRef.current;
      const offset = serverOffsetRef.current;

      if (buffer.length >= 2 && offset !== null) {
        // Render slightly in the past to increase chance of having two snapshots.
        const currentServerTime = performance.now() + offset;
        const renderTime = currentServerTime - renderDelayRef.current;

        let from: Snapshot | null = null;
        let to: Snapshot | null = null;

        for (let i = buffer.length - 1; i >= 1; i--) {
          if (buffer[i - 1].time <= renderTime && buffer[i].time >= renderTime) {
            from = buffer[i - 1];
            to = buffer[i];
            break;
          }
        }

        if (from && to) {
          const total = to.time - from.time;
          const elapsed = renderTime - from.time;
          const t = total > 0 ? elapsed / total : 1;
          setState(interpolate(from.state, to.state, t));
        } else if (buffer.length > 0) {
          const latest = buffer[buffer.length - 1];
          if (renderTime > latest.time) {
            setState(latest.state);
          } else if (renderTime < buffer[0].time) {
             setState(buffer[0].state);
          }
        }

        while (buffer.length > 5 && buffer[1].time < renderTime) {
          // Drop obsolete snapshots once they are no longer useful for interpolation.
          buffer.shift();
        }
      } else if (buffer.length === 1) {
        setState(buffer[0].state);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      joinedRef.current = false;
      socket.disconnect();
    };
  }, [accessToken, options.roomId, options.roomPassword]);

  const debug = {
    getPacketRate: () => {
      const times = packetTimesRef.current;
      if (times.length < 2) return 0;
      const span = (times[times.length - 1] - times[0]) / 1000;
      return span > 0 ? Math.round((times.length - 1) / span) : 0;
    },
    getBufferSize: () => bufferRef.current.length,
    getServerOffset: () => serverOffsetRef.current,
    getRenderDelay: () => renderDelayRef.current,
    setRenderDelay: (v: number) => { renderDelayRef.current = v; },
    getLastRaw: () => lastRawRef.current,
  };

  const switchTeam = () => {
    socketRef.current?.emit("switch_team");
  };

  const toggleReady = () => {
    socketRef.current?.emit("toggle_ready");
  };

  return { state, myPlayerId, connected, joinError, socket: socketRef, debug, switchTeam, toggleReady };
}
