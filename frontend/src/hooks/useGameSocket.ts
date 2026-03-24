import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, PlayerState, BallState } from "../game/types";
import { FX, FY, FW, FH } from "../game/constants";

// Backend field dimensions
const SERVER_W = 800;
const SERVER_H = 500;

// How far behind real-time we render (ms).
// Absorbs WiFi jitter by always having 2+ snapshots to interpolate between.
const RENDER_DELAY = 100;

function getOrCreateClientId(): string {
  const key = "ft_game_client_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
}

function transformState(raw: any): GameState {
  const players = Object.values(raw.players || {}).map((p: any) => ({
    id: p.id,
    name: p.team === "red" ? "Red" : "Blue",
    team: p.team as "red" | "blue",
    x: FX + (p.x / SERVER_W) * FW,
    y: FY + (p.y / SERVER_H) * FH,
  }));

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
    },
  };
}

interface Snapshot {
  state: GameState;
  time: number; // Server time in MS
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

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
  };
}

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const bufferRef = useRef<Snapshot[]>([]);
  const rafRef = useRef<number>(0);

  // For server clock sync
  const serverOffsetRef = useRef<number | null>(null);

  useEffect(() => {
    const clientId = getOrCreateClientId();

    const socket = io(window.location.origin, {
      path: "/ws/game/",
      transports: ["websocket"],
      auth: { clientId },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("joined", () => {
      setMyPlayerId(socket.id ?? null);
    });

    socket.on("state", (raw: any) => {
      const serverTime = raw.meta?.serverTimeMs || performance.now();
      const clientTime = performance.now();

      // Simple clock sync: offset = serverTime - clientTime
      // We take the minimum offset to avoid network delay bias
      const currentOffset = serverTime - clientTime;
      if (serverOffsetRef.current === null) {
        serverOffsetRef.current = currentOffset;
      } else {
        // Slow smoothing of offset
        serverOffsetRef.current = serverOffsetRef.current * 0.99 + currentOffset * 0.01;
      }

      bufferRef.current.push({
        state: transformState(raw),
        time: serverTime,
      });

      // Keep buffer bounded
      if (bufferRef.current.length > 60) {
        bufferRef.current = bufferRef.current.slice(-30);
      }
    });

    socket.on("room_full", () => {
      console.warn("Room is full");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Snapshot interpolation loop
    function tick() {
      const buffer = bufferRef.current;
      const offset = serverOffsetRef.current;

      if (buffer.length >= 2 && offset !== null) {
        const currentServerTime = performance.now() + offset;
        const renderTime = currentServerTime - RENDER_DELAY;

        // Find two snapshots straddling renderTime
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
          // Interpolate between the two snapshots
          const total = to.time - from.time;
          const elapsed = renderTime - from.time;
          const t = total > 0 ? elapsed / total : 1;
          setState(interpolate(from.state, to.state, t));
        } else if (buffer.length > 0) {
          const latest = buffer[buffer.length - 1];
          if (renderTime > latest.time) {
            // Ahead of buffer — show latest state
            setState(latest.state);
          } else if (renderTime < buffer[0].time) {
             // Behind buffer — show oldest state
             setState(buffer[0].state);
          }
        }

        // Discard snapshots we'll never need again
        // Keep at least 2 to avoid flicker if buffer is small
        while (buffer.length > 5 && buffer[1].time < renderTime) {
          buffer.shift();
        }
      } else if (buffer.length === 1) {
        // Only one snapshot so far — show it immediately
        setState(buffer[0].state);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      socket.disconnect();
    };
  }, []);

  return { state, myPlayerId, connected, socket: socketRef };
}
