import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Socket } from "socket.io-client";

interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  kick: boolean;
}

const KEY_MAP: Record<string, keyof InputState> = {
  ArrowUp: "up",    w: "up",    W: "up",
  ArrowDown: "down",  s: "down",  S: "down",
  ArrowLeft: "left",  a: "left",  A: "left",
  ArrowRight: "right", d: "right", D: "right",
  x: "kick", X: "kick",
};

export function useGameInput(socketRef: MutableRefObject<Socket | null>) {
  const inputRef = useRef<InputState>({
    up: false, down: false, left: false, right: false, kick: false,
  });

  useEffect(() => {
    function handleKey(e: KeyboardEvent, pressed: boolean) {
      const action = KEY_MAP[e.key];
      if (!action) return;
      e.preventDefault();
      inputRef.current[action] = pressed;
      socketRef.current?.emit("input", { ...inputRef.current });
    }

    const onDown = (e: KeyboardEvent) => handleKey(e, true);
    const onUp = (e: KeyboardEvent) => handleKey(e, false);

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [socketRef]);
}
