import { useState, useEffect, useRef, useCallback } from "react";
import type { MutableRefObject } from "react";
import type { Socket } from "socket.io-client";
interface DebugAPI {
  getPacketRate: () => number;
  getBufferSize: () => number;
  getServerOffset: () => number | null;
  getRenderDelay: () => number;
  setRenderDelay: (v: number) => void;
  getLastRaw: () => any;
}

interface Props {
  socketRef: MutableRefObject<Socket | null>;
  debug: DebugAPI;
  connected: boolean;
}

type Tab = "net" | "config" | "log";

interface LogEntry {
  time: string;
  event: string;
  detail: string;
}

const SLIDER_CONFIGS = [
  { key: "playerSpeed",    label: "Player Speed",    min: 0.1, max: 3,    step: 0.05, default: 0.5  },
  { key: "kickPower",      label: "Kick Power",      min: 1,   max: 30,   step: 0.5,  default: 8    },
  { key: "kickRadius",     label: "Kick Radius",     min: 10,  max: 60,   step: 1,    default: 25   },
  { key: "playerFriction", label: "Player Friction",  min: 0.5, max: 0.99, step: 0.01, default: 0.9  },
  { key: "ballFriction",   label: "Ball Friction",    min: 0.9, max: 1,    step: 0.005,default: 0.99 },
  { key: "renderDelay",    label: "Render Delay (ms)", min: 0,  max: 300,  step: 5,    default: 100  },
] as const;

function ts(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(3, "0")}`;
}

export default function DebugPanel({ socketRef, debug, connected }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("net");
  const [stats, setStats] = useState({ pps: 0, buffer: 0, offset: 0, delay: 100 });
  const [rawState, setRawState] = useState<any>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [fps, setFps] = useState(0);
  const [config, setConfig] = useState<Record<string, number>>(() => {
    const c: Record<string, number> = {};
    SLIDER_CONFIGS.forEach((s) => (c[s.key] = s.default));
    return c;
  });

  const fpsFrames = useRef<number[]>([]);
  const logRef = useRef<LogEntry[]>([]);
  const logBoxRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "`") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  
  useEffect(() => {
    let raf = 0;
    function frame(now: number) {
      fpsFrames.current.push(now);
      const cutoff = now - 1000;
      while (fpsFrames.current.length > 0 && fpsFrames.current[0] < cutoff) {
        fpsFrames.current.shift();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  
  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => {
      setStats({
        pps: debug.getPacketRate(),
        buffer: debug.getBufferSize(),
        offset: Math.round(debug.getServerOffset() ?? 0),
        delay: debug.getRenderDelay(),
      });
      setRawState(debug.getLastRaw());
      setFps(fpsFrames.current.length);
    }, 250);
    return () => clearInterval(iv);
  }, [open, debug]);

  
  const addLog = useCallback((event: string, detail: string) => {
    const entry: LogEntry = { time: ts(), event, detail };
    logRef.current = [...logRef.current.slice(-99), entry];
    setLogs(logRef.current);
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onState = () => addLog("state", "received");
    const onJoined = (d: any) => addLog("joined", `team: ${d?.team}`);
    const onConnect = () => addLog("connect", socket.id ?? "");
    const onDisconnect = (reason: string) => addLog("disconnect", reason);
    const onRoomFull = () => addLog("room_full", "");

    socket.on("state", onState);
    socket.on("joined", onJoined);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_full", onRoomFull);

    return () => {
      socket.off("state", onState);
      socket.off("joined", onJoined);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_full", onRoomFull);
    };
  }, [socketRef, addLog]);

  
  useEffect(() => {
    logBoxRef.current?.scrollTo(0, logBoxRef.current.scrollHeight);
  }, [logs]);

  
  const handleSlider = (key: string, value: number) => {
    setConfig((c) => ({ ...c, [key]: value }));
    if (key === "renderDelay") {
      debug.setRenderDelay(value);
    } else {
      socketRef.current?.emit("debug:config", { [key]: value });
    }
  };

  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 z-50 px-2 py-1 rounded bg-black/60 text-[10px] text-white/50 cursor-pointer hover:text-white/80 select-none"
      >
        ` debug
      </div>
    );
  }

  const raw = rawState;
  const players = raw?.players ? Object.values(raw.players) as any[] : [];
  const ball = raw?.ball;
  const match = raw?.match;

  return (
    <div className="fixed bottom-3 right-3 z-50 w-80 max-h-[70vh] flex flex-col rounded-lg bg-black/85 backdrop-blur text-[11px] text-white/90 font-mono border border-white/10 shadow-2xl select-none">
      
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
        <div className="flex gap-2">
          {(["net", "config", "log"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                tab === t ? "bg-white/20 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-sm leading-none">
          x
        </button>
      </div>

      
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {tab === "net" && (
          <>
            <Row label="Status" value={
              <span className={connected ? "text-green-400" : "text-red-400"}>
                {connected ? "connected" : "disconnected"}
              </span>
            } />
            <Row label="Match" value={match?.status ?? "—"} />
            <Row label="Players" value={players.length} />
            <Row label="FPS" value={fps} />
            <Sep />
            <Row label="Packets/s" value={stats.pps} />
            <Row label="Buffer" value={stats.buffer} />
            <Row label="Clock Offset" value={`${stats.offset}ms`} />
            <Row label="Render Delay" value={`${stats.delay}ms`} />
            <Sep />
            <div className="text-white/40 text-[9px] uppercase tracking-wider mt-1">Server Coords</div>
            {players.map((p: any) => (
              <Row key={p.id} label={`${p.team}`} value={`(${Math.round(p.x)}, ${Math.round(p.y)})`} />
            ))}
            {ball && <Row label="Ball" value={`(${Math.round(ball.x)}, ${Math.round(ball.y)})`} />}
            <Row label="Score" value={`${raw?.score?.red ?? 0} - ${raw?.score?.blue ?? 0}`} />
            <Row label="Time" value={`${match?.timeRemainingSeconds ?? 0}s`} />
          </>
        )}

        {tab === "config" && (
          <>
            {SLIDER_CONFIGS.map((s) => (
              <div key={s.key} className="mb-2">
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-white/60">{s.label}</span>
                  <span className="text-white/90 font-bold">{config[s.key]}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={config[s.key]}
                  onChange={(e) => handleSlider(s.key, parseFloat(e.target.value))}
                  className="w-full h-1 appearance-none bg-white/20 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            ))}
            <button
              onClick={() => {
                const defaults: Record<string, number> = {};
                SLIDER_CONFIGS.forEach((s) => (defaults[s.key] = s.default));
                setConfig(defaults);
                debug.setRenderDelay(defaults.renderDelay);
                const serverDefaults = { ...defaults };
                delete serverDefaults.renderDelay;
                socketRef.current?.emit("debug:config", serverDefaults);
              }}
              className="mt-2 w-full py-1 rounded bg-white/10 text-white/60 hover:bg-white/20 hover:text-white text-[10px] uppercase tracking-wider"
            >
              Reset Defaults
            </button>
          </>
        )}

        {tab === "log" && (
          <div ref={logBoxRef} className="max-h-[50vh] overflow-y-auto space-y-px">
            {logs.length === 0 && <div className="text-white/30">No events yet...</div>}
            {logs.map((l, i) => (
              <div key={i} className="flex gap-2 text-[10px] leading-tight">
                <span className="text-white/30 shrink-0">{l.time}</span>
                <span className={
                  l.event === "state" ? "text-blue-400" :
                  l.event === "connect" ? "text-green-400" :
                  l.event === "disconnect" ? "text-red-400" :
                  "text-yellow-400"
                }>{l.event}</span>
                {l.detail && <span className="text-white/50">{l.detail}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50">{label}</span>
      <span className="text-white/90">{typeof value === "number" ? value : value}</span>
    </div>
  );
}

function Sep() {
  return <div className="border-t border-white/5 my-1" />;
}
