import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState } from "../game/types";
import { FX, FY, FW, FH } from "../game/constants";

// Backend field dimensions
const SERVER_W = 800;
const SERVER_H = 500;

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
      timeLeft: 0,
    },
  };
}

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(window.location.origin, {
      path: "/ws/game/",
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("joined", () => {
      setMyPlayerId(socket.id ?? null);
    });

    socket.on("state", (raw: any) => {
      setState(transformState(raw));
    });

    socket.on("room_full", () => {
      console.warn("Room is full");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { state, myPlayerId, connected, socket: socketRef };
}
