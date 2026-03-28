import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Socket } from "socket.io-client";

interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

const MOVE_KEYS_BY_KEY: Record<string, keyof InputState> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  W: "up",
  s: "down",
  S: "down",
  a: "left",
  A: "left",
  d: "right",
  D: "right",
};

const MOVE_KEYS_BY_CODE: Record<string, keyof InputState> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
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
    function resolveMoveAction(e: KeyboardEvent): keyof InputState | undefined {
      return MOVE_KEYS_BY_CODE[e.code] || MOVE_KEYS_BY_KEY[e.key];
    }

    function emitInput() {
      socketRef.current?.emit("input", { ...inputRef.current });
    }

    function onDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      if (KICK_KEYS.has(e.key) && !e.repeat) {
        e.preventDefault();
        socketRef.current?.emit("kick");
        return;
      }
      const action = resolveMoveAction(e);
      if (!action) return;
      e.preventDefault();
      if (inputRef.current[action]) return;
      inputRef.current[action] = true;
      emitInput();
    }

    function onUp(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      const action = resolveMoveAction(e);
      if (!action) return;
      e.preventDefault();
      if (!inputRef.current[action]) return;
      inputRef.current[action] = false;
      emitInput();
    }

    function resetInput() {
      inputRef.current = { up: false, down: false, left: false, right: false };
      emitInput();
    }

    function onVisibilityChange() {
      if (document.hidden) resetInput();
    }

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", resetInput);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", resetInput);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [socketRef]);
}
