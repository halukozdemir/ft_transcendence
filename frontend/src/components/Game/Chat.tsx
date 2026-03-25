import { useEffect, useRef, useState } from "react";
import { LuInfo, LuSendHorizontal, LuChevronDown, LuMessageSquare } from "react-icons/lu";

type TeamColor = "red" | "blue" | "spectator";

interface PlayerMessage {
  type: "player";
  id: string;
  timestamp: string;
  sender: string;
  team: TeamColor;
  content: string;
}

interface SystemMessage {
  type: "system";
  id: string;
  content: string;
}

type Message = PlayerMessage | SystemMessage;

interface ChatProps {
  roomName?: string;
  username?: string;
}

const TEAM_COLOR: Record<TeamColor, string> = {
  red:       "text-team-red",
  blue:      "text-team-blue",
  spectator: "text-spectator",
};

const GHOST_DURATION = 5000;
const GHOST_COUNT    = 5;

type Ghost = Message & { ghostKey: string };

type WsPayload = {
  message?: string;
  sender?: string;
  timestamp?: string;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createTimestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function sanitizeRoomName(roomName: string) {
  const normalized = roomName.replace(/\W+/g, "_");
  return normalized || "lobby";
}

export default function Chat({ roomName = "game", username = "Player" }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]   = useState("");
  const [focused, setFocused] = useState(false);
  const [open, setOpen]     = useState(true);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  // Enter key focuses input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement !== inputRef.current)
        inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Populate ghosts when chat closes, clear when opens
  useEffect(() => {
    if (open) {
      setGhosts([]);
      return;
    }
    const recent = messages.slice(-GHOST_COUNT).map((m, i) => ({
      ...m,
      ghostKey: `${m.id}-${i}-${Date.now()}`,
    }));
    setGhosts(recent);
    const t = setTimeout(() => setGhosts([]), GHOST_DURATION);
    return () => clearTimeout(t);
  }, [open, messages]);

  useEffect(() => {
    const room = sanitizeRoomName(roomName);
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/chat/${room}/`);

    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setMessages((prev) => [
        ...prev,
        { type: "system", id: createId(), content: `Connected to room: ${room}` },
      ]);
    };

    socket.onmessage = (event) => {
      try {
        const data: WsPayload = JSON.parse(event.data);
        const message = data.message?.trim();
        if (!message) return;

        setMessages((prev) => [
          ...prev,
          {
            type: "player",
            id: createId(),
            timestamp: data.timestamp || createTimestamp(),
            sender: data.sender || "anonymous",
            team: "spectator",
            content: message,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { type: "system", id: createId(), content: "Invalid message payload received." },
        ]);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      setMessages((prev) => [
        ...prev,
        { type: "system", id: createId(), content: "Chat connection closed." },
      ]);
    };

    socket.onerror = () => {
      setMessages((prev) => [
        ...prev,
        { type: "system", id: createId(), content: "Chat connection error." },
      ]);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [roomName]);

  const handleSend = () => {
    const message = input.trim();
    if (!message) return;

    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [
        ...prev,
        { type: "system", id: createId(), content: "Socket is not connected yet." },
      ]);
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        message,
        sender: username,
        timestamp: createTimestamp(),
      })
    );

    setInput("");
  };

  return (
    <div className="flex flex-col gap-2 w-full">

      {/* ── Ghost mode (closed) ── */}
      <div className={`grid transition-all duration-300 ease-in-out ${!open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1.5 px-1 pb-1">

            {/* Floating messages */}
            {ghosts.map((g) => (
              <div
                key={g.ghostKey}
                style={{ animation: `ghost-fade ${GHOST_DURATION}ms ease-in-out forwards` }}
              >
                {g.type === "system"
                  ? <GhostSystemMsg content={g.content} />
                  : <GhostChatMsg msg={g} />}
              </div>
            ))}

            {/* Minimal input — only visible when focused */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${focused ? "bg-surface border border-border opacity-100" : "opacity-0 pointer-events-none"}`}>
              <input
                type="text"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Press Enter to chat..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-muted outline-none"
              />
              <button onClick={handleSend} aria-label="Send" className="text-muted hover:text-white transition-colors cursor-pointer">
                <LuSendHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Reopen button */}
            <button
              onClick={() => setOpen(true)}
              className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-muted hover:text-white transition-colors text-xs cursor-pointer"
            >
              <LuMessageSquare className="w-3.5 h-3.5" />
              <span className="font-semibold tracking-wide">Chat</span>
            </button>

          </div>
        </div>
      </div>

      {/* ── Open mode ── */}
      <div className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 pb-1">

            {/* Chatbox: header + messages */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(false)}
                aria-label="Minimize chat"
                className="w-full flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <span className="text-xs font-semibold text-muted uppercase tracking-widest">
                  Chat {connected ? "(online)" : "(offline)"}
                </span>
                <LuChevronDown className="w-4 h-4 text-muted" />
              </button>

              <div className="overflow-y-auto scrollbar-thin max-h-72 border-t border-border px-4 pt-4 pb-3 space-y-3.5">
                {messages.map((msg) =>
                  msg.type === "system"
                    ? <SystemMsg key={msg.id} content={msg.content} />
                    : <ChatMsg key={msg.id} msg={msg} />
                )}
              </div>
            </div>

            {/* Input */}
            <div className={`flex items-center gap-2 px-4 py-3.5 transition-colors ${focused ? "bg-surface border border-border rounded-2xl" : ""}`}>
              <input
                type="text"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Press Enter to chat..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-muted outline-none"
              />
              <button onClick={handleSend} aria-label="Send" className="text-muted hover:text-white transition-colors cursor-pointer">
                <LuSendHorizontal className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

// ── Message components ──────────────────────────────────────────────────────

function ChatMsg({ msg }: { msg: PlayerMessage }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-muted text-xs font-mono shrink-0">{msg.timestamp}</span>
      <p className="text-sm leading-snug">
        <span className={`font-bold ${TEAM_COLOR[msg.team]}`}>{msg.sender}:</span>
        {" "}
        <span className="text-white font-semibold">{msg.content}</span>
      </p>
    </div>
  );
}

function SystemMsg({ content }: { content: string }) {
  return (
    <div className="flex items-center gap-2 bg-surface-alt border border-system/20 rounded-lg px-3 py-2">
      <LuInfo className="w-4 h-4 text-system shrink-0" />
      <span className="text-system text-sm">
        <span className="font-semibold">System:</span> {content}
      </span>
    </div>
  );
}

// Ghost variants — no backgrounds, just text
function GhostChatMsg({ msg }: { msg: PlayerMessage }) {
  return (
    <p className="text-sm leading-snug px-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
      <span className={`font-bold ${TEAM_COLOR[msg.team]}`}>{msg.sender}:</span>
      {" "}
      <span className="text-white font-semibold">{msg.content}</span>
    </p>
  );
}

function GhostSystemMsg({ content }: { content: string }) {
  return (
    <p className="text-xs text-system px-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
      <span className="font-semibold">System:</span> {content}
    </p>
  );
}
