import type { Friend } from "../../types/lobby";
import AppIcon from "./AppIcon";
interface FriendRowProps {
  friend: Friend;
  onAction?: (friendId: string, status: Friend["status"]) => void;
}

const statusClassByType = {
  ingame: "bg-green-500",
  available: "bg-green-500",
  offline: "bg-slate-600",
} as const;

const detailClassByType = {
  ingame: "text-green-400",
  available: "text-green-400",
  offline: "text-slate-400",
} as const;

const FriendRow = ({ friend, onAction }: FriendRowProps) => {
  const isFull =
    friend.status === "ingame" &&
    friend.currentPlayers !== undefined &&
    friend.maxPlayers !== undefined &&
    friend.currentPlayers >= friend.maxPlayers;

  return (
    <div className={[
      "flex items-center justify-between",
      friend.status === "offline" ? "opacity-60" : "",
    ].join(" ")}>
      <div className="flex items-center gap-3">
        <div className="relative">
          {friend.avatarUrl ? (
            <img alt={friend.nickname} className="size-8 rounded-full object-cover" src={friend.avatarUrl} />
          ) : (
            <div className="size-8 rounded-full bg-[var(--dashboard-border)] text-[10px] font-bold text-white grid place-items-center">
              {friend.initials}
            </div>
          )}
          <div
            className={[
              "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-[var(--dashboard-card)]",
              statusClassByType[friend.status],
            ].join(" ")}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{friend.nickname}</p>
          <p className={["text-[10px]", detailClassByType[friend.status]].join(" ")}>
            {friend.detail}
            {friend.status === "ingame" && friend.currentPlayers !== undefined && friend.maxPlayers !== undefined && (
              <span className="text-slate-400"> • {friend.currentPlayers}/{friend.maxPlayers} players</span>
            )}
          </p>
        </div>
      </div>

      {friend.status === "ingame" && (
        <button
          className={[
            "transition-colors",
            isFull
              ? "text-slate-600 cursor-not-allowed"
              : "cursor-pointer text-slate-500 hover:text-(--dashboard-primary)",
          ].join(" ")}
          disabled={isFull}
          onClick={() => !isFull && onAction?.(friend.id, friend.status)}
          type="button"
        >
          <AppIcon name="join" size={18} />
        </button>
      )}
    </div>
  );
};

export default FriendRow;
