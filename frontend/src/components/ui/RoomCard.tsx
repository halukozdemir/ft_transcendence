import { appColors } from "../../constants/appColors";
import type { Room } from "../../types/lobby";
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
  const isInProgress = room.matchStatus === "in_progress";
  const isJoinDisabled = isFull || isInProgress;

  return (
    <article
      className={[
        "rounded-xl p-4 flex items-center justify-between gap-4",
        isJoinDisabled
          ? "bg-[color:rgba(21,25,33,0.6)] opacity-60"
          : "bg-(--dashboard-card) border border-[rgba(90,90,246,0.15)] transition-[border-color,box-shadow] duration-200 hover:border-[rgba(90,90,246,0.45)] hover:shadow-[0_0_16px_rgba(90,90,246,0.15)] group",
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
            {room.isLocked ? (
              <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Private Room
              </span>
            ) : null}
            {isInProgress ? (
              <span className="rounded-md border border-blue-400/40 bg-blue-400/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-300">
                In Progress
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">
            Host: <span className="text-slate-300">{room.host}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 md:gap-10">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-white">
            {room.currentPlayers} / {room.maxPlayers}
          </span>
          <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-(--dashboard-border)">
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
          <span className="text-[10px] uppercase text-slate-600">Latency</span>
        </div>

        <button
          className={[
            "rounded-lg px-5 py-2 text-sm font-bold transition-all",
            isJoinDisabled
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "cursor-pointer bg-[linear-gradient(135deg,var(--dashboard-primary),#7a6bff)] text-white hover:brightness-110 active:scale-95",
          ].join(" ")}
          disabled={isJoinDisabled}
          onClick={() => onJoin?.(room.id)}
          type="button"
        >
          {isInProgress ? "IN GAME" : isFull ? "FULL" : room.isLocked ? "JOIN WITH PASSWORD" : "JOIN"}
        </button>
      </div>
    </article>
  );
};

export default RoomCard;
