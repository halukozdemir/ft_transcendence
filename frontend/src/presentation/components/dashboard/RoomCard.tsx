import { appColors } from "../../../app/appColors";
import type { Room } from "../../../domain/models/lobby";
import AppIcon from "./AppIcon";

interface RoomCardProps {
  room: Room;
  onJoin?: (roomId: string) => void;
}

const statusColorByHealth = {
  healthy: appColors.success,
  warning: appColors.warning,
  offline: "#64748b",
} as const;

const RoomCard = ({ room, onJoin }: RoomCardProps) => {
  const occupancyRate = Math.round((room.currentPlayers / room.maxPlayers) * 100);
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <article
      className={[
        "rounded-xl p-4 flex items-center justify-between gap-4",
        isFull
          ? "bg-[color:rgba(21,25,33,0.6)] opacity-60"
          : "dashboard-card dashboard-glow-border group",
      ].join(" ")}
    >
      <div className="min-w-0 flex items-center gap-4">
        <span
          className="size-2 rounded-full shrink-0"
          style={{ backgroundColor: statusColorByHealth[room.health] }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-bold text-white group-hover:text-[var(--dashboard-primary)] transition-colors">
              {room.title}
            </h4>
            {room.isLocked ? <AppIcon className="text-slate-600" name="lock" size={16} /> : null}
            {room.isVerified ? <AppIcon className="text-slate-600" name="verified" size={16} /> : null}
          </div>
          <p className="text-xs text-slate-500">
            Host: <span className="text-slate-300">{room.host}</span> • {room.map}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 md:gap-10">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-white">
            {room.currentPlayers} / {room.maxPlayers}
          </span>
          <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-[var(--dashboard-border)]">
            <div
              className="h-full"
              style={{
                width: `${occupancyRate}%`,
                backgroundColor: isFull ? "#64748b" : appColors.primary,
              }}
            />
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center">
          <span
            className="text-xs font-black"
            style={{ color: room.health === "warning" ? appColors.warning : statusColorByHealth[room.health] }}
          >
            {room.pingMs}ms
          </span>
          <span className="text-[10px] uppercase text-slate-600">Ping</span>
        </div>

        <button
          className={[
            "rounded-lg px-5 py-2 text-sm font-bold transition-all",
            isFull
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "dashboard-primary-gradient text-white hover:brightness-110 active:scale-95",
          ].join(" ")}
          disabled={isFull}
          onClick={() => onJoin?.(room.id)}
          type="button"
        >
          {isFull ? "FULL" : "JOIN"}
        </button>
      </div>
    </article>
  );
};

export default RoomCard;
