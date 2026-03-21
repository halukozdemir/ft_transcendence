import { useEffect, useRef, useState } from "react";
import { LuInfo, LuSendHorizontal } from "react-icons/lu";

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

const TEAM_COLOR: Record<TeamColor, string> = {
  red:       "text-team-red",
  blue:      "text-team-blue",
  spectator: "text-spectator",
};

const MOCK_MESSAGES: Message[] = [
  { type: "player", id: "1", timestamp: "12:04", sender: "ProStriker",  team: "red",       content: "What a save!"         },
  { type: "player", id: "2", timestamp: "12:05", sender: "CyberGoalie", team: "blue",      content: "Calculated."          },
  { type: "system", id: "3", content: "Red Team leading by 1 point."                                                        },
  { type: "player", id: "4", timestamp: "12:06", sender: "ProStriker",  team: "red",       content: "Rematch after this?"  },
  { type: "player", id: "5", timestamp: "12:07", sender: "Spectator99", team: "spectator", content: "GG WP"                },
  { type: "player", id: "1", timestamp: "12:04", sender: "ProStriker",  team: "red",       content: "What a save!"         },
  { type: "player", id: "2", timestamp: "12:05", sender: "CyberGoalie", team: "blue",      content: "Calculated."          },
  { type: "system", id: "3", content: "Red Team leading by 1 point."                                                        },
  { type: "player", id: "4", timestamp: "12:06", sender: "ProStriker",  team: "red",       content: "Rematch after this?"  },
  { type: "player", id: "5", timestamp: "12:07", sender: "Spectator99", team: "spectator", content: "GG WP"                },
  { type: "player", id: "1", timestamp: "12:04", sender: "ProStriker",  team: "red",       content: "What a save!"         },
  { type: "player", id: "2", timestamp: "12:05", sender: "CyberGoalie", team: "blue",      content: "Calculated."          },
  { type: "system", id: "3", content: "Red Team leading by 1 point."                                                        },
  { type: "player", id: "4", timestamp: "12:06", sender: "ProStriker",  team: "red",       content: "Rematch after this?"  },
  { type: "player", id: "5", timestamp: "12:07", sender: "Spectator99", team: "spectator", content: "GG WP"                },

];

export default function Chat() {
  const [messages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput]     = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement !== inputRef.current)
        inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    // TODO: emit message via WebSocket
    setInput("");
  };

  return (
    <div className="flex flex-col gap-2 w-80 overflow-hidden">

      {/* ── Message list — max height + scroll ── */}
      <div className="overflow-y-auto scrollbar-thin max-h-96 px-4 pt-5 pb-3 space-y-3.5 bg-surface border border-border rounded-2xl">
        {messages.map((msg) =>
          msg.type === "system" ? (
            <SystemMsg key={msg.id} content={msg.content} />
          ) : (
            <ChatMsg key={msg.id} msg={msg} />
          )
        )}
      </div>

      {/* ── Input — bg only when focused ── */}
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
        <button
          onClick={handleSend}
          aria-label="Send"
          className="text-muted hover:text-white transition-colors cursor-pointer"
        >
          <LuSendHorizontal className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

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
