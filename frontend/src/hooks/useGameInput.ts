import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Socket } from "socket.io-client";

interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

const MOVE_KEYS: Record<string, keyof InputState> = {
  ArrowUp: "up",    w: "up",    W: "up",
  ArrowDown: "down",  s: "down",  S: "down",
  ArrowLeft: "left",  a: "left",  A: "left",
  ArrowRight: "right", d: "right", D: "right",
};

const KICK_KEYS = new Set(["x", "X"]);

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;

  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function useGameInput(socketRef: MutableRefObject<Socket | null>) {
  const inputRef = useRef<InputState>({
    up: false, down: false, left: false, right: false,
  });

  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      if (KICK_KEYS.has(e.key) && !e.repeat) {
        e.preventDefault();
        socketRef.current?.emit("kick");
        return;
      }
      const action = MOVE_KEYS[e.key];
      if (!action) return;
      e.preventDefault();
      inputRef.current[action] = true;
      socketRef.current?.emit("input", { ...inputRef.current });
    }

    function onUp(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      const action = MOVE_KEYS[e.key];
      if (!action) return;
      e.preventDefault();
      inputRef.current[action] = false;
      socketRef.current?.emit("input", { ...inputRef.current });
    }

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [socketRef]);
}
