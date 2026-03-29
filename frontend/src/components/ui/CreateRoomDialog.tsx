import { useState } from "react";

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateRoomData) => Promise<void> | void;
}

export interface CreateRoomData {
  title: string;
  maxPlayers: number;
  isLocked: boolean;
  password: string;
}

const MAX_PLAYERS_OPTIONS = [2, 4, 6, 8, 10, 12];

const CreateRoomDialog = ({ open, onClose, onCreate }: CreateRoomDialogProps) => {
  const [title, setTitle] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Room name is required.");
      return;
    }
    if (isLocked && !password.trim()) {
      setError("You must enter a password for a private room.");
      return;
    }
    try {
      setError("");
      await onCreate({ title: title.trim(), maxPlayers, isLocked, password: password.trim() });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Room could not be created.");
    }
  };

  const handleClose = () => {
    setTitle("");
    setMaxPlayers(6);
    setIsLocked(false);
    setPassword("");
    setError("");
    onClose();
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-(--dashboard-primary) focus:ring-1 focus:ring-(--dashboard-primary)/50";

  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md rounded-2xl bg-[var(--dashboard-card)] border border-white/10 shadow-2xl pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="text-base font-bold text-white">Create Room</h2>
            <button
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              onClick={handleClose}
              type="button"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">

            {/* Room Name */}
            <div>
              <label className={labelClass}>Room Name</label>
              <input
                autoFocus
                className={inputClass}
                maxLength={40}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="[EU] Pro 3v3 - No Lag"
                type="text"
                value={title}
              />
            </div>

            {/* Maximum Players */}
            <div>
              <label className={labelClass}>Maximum Players</label>
              <div className="grid grid-cols-6 gap-2">
                {MAX_PLAYERS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    className={[
                      "cursor-pointer rounded-xl py-3 text-sm font-black transition-all",
                      maxPlayers === n
                        ? "dashboard-primary-gradient text-white shadow-[0_0_16px_rgba(90,90,246,0.35)]"
                        : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20",
                    ].join(" ")}
                    onClick={() => setMaxPlayers(n)}
                    type="button"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Private Room */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Private Room</p>
                <p className="text-xs text-slate-500 mt-0.5">Password required to join the room</p>
              </div>
              <button
                className={[
                  "cursor-pointer relative w-11 h-6 rounded-full transition-colors",
                  isLocked ? "bg-(--dashboard-primary)" : "bg-white/10",
                ].join(" ")}
                onClick={() => { setIsLocked(!isLocked); setPassword(""); }}
                type="button"
              >
                <span
                  className={[
                    "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
                    isLocked ? "translate-x-5" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </div>

            {/* Password */}
            {isLocked && (
              <div>
                <label className={labelClass}>Password</label>
                <input
                  className={inputClass}
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={password}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-6 py-4">
            <button
              className="cursor-pointer w-full rounded-xl py-2.5 text-sm font-bold dashboard-primary-gradient text-white hover:brightness-110 transition-all active:scale-95"
              onClick={handleSubmit}
              type="button"
            >
              Create
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default CreateRoomDialog;
