import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import ActionButton from "../../components/ui/ActionButton";
import AppIcon from "../../components/ui/AppIcon";
import CreateRoomDialog from "../../components/ui/CreateRoomDialog";
import type { CreateRoomData } from "../../components/ui/CreateRoomDialog";
import FriendRow from "../../components/ui/FriendRow";
import RoomCard from "../../components/ui/RoomCard";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/authContext";
import { gameApi } from "../../services/gameApi";
import { profileApi } from "../../services/profileApi";
import type { Friend, Room } from "../../types/lobby";
interface PlayerStats {
  xp: number;
  level: number;
  wins: number;
  losses: number;
  ranking: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [joinLockedRoomOpen, setJoinLockedRoomOpen] = useState(false);
  const [joinLockedRoomId, setJoinLockedRoomId] = useState<string | null>(null);
  const [joinRoomPassword, setJoinRoomPassword] = useState("");
  const [joinRoomError, setJoinRoomError] = useState("");
  const [joinRoomLoading, setJoinRoomLoading] = useState(false);
  const [joinDialogMounted, setJoinDialogMounted] = useState(false);
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsRefreshing, setRoomsRefreshing] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);

  
  useEffect(() => {
    if (!user || !accessToken) return;
    profileApi.getStats(user.id, accessToken)
      .then((data) => setPlayerStats({
        xp: data.xp,
        level: data.level,
        wins: data.wins,
        losses: data.losses,
        ranking: data.ranking,
      }))
      .catch(() => {});
  }, [user, accessToken]);

  
  useEffect(() => {
    let isCancelled = false;

    const normalizeRooms = (items: Awaited<ReturnType<typeof gameApi.getActiveRooms>>["rooms"]): Room[] =>
      items.map((room) => ({
        id: room.id,
        title: room.title,
        host: room.host,
        map: `${room.maxPlayersPerTeam}v${room.maxPlayersPerTeam}`,
        currentPlayers: room.currentPlayers,
        maxPlayers: room.maxPlayers,
        pingMs: room.pingMs,
        isLocked: room.isLocked,
        matchStatus: room.matchStatus,
        isVerified: room.matchStatus === "in_progress",
        health: room.health,
      }));

    const fetchRooms = async () => {
      try {
        const response = await gameApi.getActiveRooms();
        if (!isCancelled) setActiveRooms(normalizeRooms(response.rooms));
      } catch {
        if (!isCancelled) setActiveRooms([]);
      } finally {
        if (!isCancelled) setRoomsLoading(false);
      }
    };

    fetchRooms();
    const poll = setInterval(fetchRooms, 3000);
    return () => { isCancelled = true; clearInterval(poll); };
  }, []);

  useEffect(() => {
    if (joinLockedRoomOpen) {
      setJoinDialogMounted(true);
      const raf = requestAnimationFrame(() => setJoinDialogVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setJoinDialogVisible(false);
    const timeout = setTimeout(() => setJoinDialogMounted(false), 220);
    return () => clearTimeout(timeout);
  }, [joinLockedRoomOpen]);

  const filteredRooms = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return activeRooms;
    return activeRooms.filter((room: Room) =>
      room.title.toLowerCase().includes(q) || room.host.toLowerCase().includes(q)
    );
  }, [activeRooms, searchText]);

  const normalizeRoom = (room: Awaited<ReturnType<typeof gameApi.getActiveRooms>>["rooms"][number]): Room => ({
    id: room.id,
    title: room.title,
    host: room.host,
    map: `${room.maxPlayersPerTeam}v${room.maxPlayersPerTeam}`,
    currentPlayers: room.currentPlayers,
    maxPlayers: room.maxPlayers,
    pingMs: room.pingMs,
    isLocked: room.isLocked,
    matchStatus: room.matchStatus,
    isVerified: room.matchStatus === "in_progress",
    health: room.health,
  });

  const handleRefreshRooms = async () => {
    setRoomsRefreshing(true);
    try {
      const response = await gameApi.getActiveRooms();
      setActiveRooms(response.rooms.map(normalizeRoom));
    } catch {
      setActiveRooms([]);
    } finally {
      setRoomsLoading(false);
      setRoomsRefreshing(false);
    }
  };

  const roomPasswordKey = (roomId: string) => `game-room-password:${roomId}`;

  const goToRoom = (roomId: string, roomPassword?: string) => {
    const params = new URLSearchParams();
    params.set("roomId", roomId);
    const key = roomPasswordKey(roomId);
    if (roomPassword && roomPassword.trim().length > 0) {
      sessionStorage.setItem(key, roomPassword.trim());
    } else {
      sessionStorage.removeItem(key);
    }
    navigate(`/game?${params.toString()}`);
  };

  const handleJoinRoom = async (roomId: string) => {
    const room = activeRooms.find((r: Room) => r.id === roomId);
    if (!room) { goToRoom(roomId); return; }
    if (room.matchStatus === "in_progress") return;

    if (room.isLocked) {
      setJoinLockedRoomId(roomId);
      setJoinRoomPassword("");
      setJoinRoomError("");
      setJoinLockedRoomOpen(true);
      return;
    }
    goToRoom(roomId);
  };

  const handleJoinLockedRoom = async () => {
    if (!joinLockedRoomId) return;
    const trimmed = joinRoomPassword.trim();
    if (!trimmed) {
      setJoinRoomError("Please enter the room password.");
      return;
    }

    setJoinRoomLoading(true);
    setJoinRoomError("");
    try {
      const result = await gameApi.validateRoomPassword(joinLockedRoomId, trimmed);
      if (!result.valid) {
        setJoinRoomError("Incorrect password.");
        return;
      }
      setJoinLockedRoomOpen(false);
      goToRoom(joinLockedRoomId, trimmed);
    } catch {
      setJoinRoomError("Password validation failed. Please try again.");
    } finally {
      setJoinRoomLoading(false);
    }
  };

  const closeJoinLockedRoomDialog = () => {
    setJoinLockedRoomOpen(false);
    setJoinLockedRoomId(null);
    setJoinRoomPassword("");
    setJoinRoomError("");
    setJoinRoomLoading(false);
  };

  const handleCreateRoom = async (data: CreateRoomData) => {
    const created = await gameApi.createRoom({
      title: data.title,
      maxPlayers: data.maxPlayers,
      isLocked: data.isLocked,
      password: data.password,
    });
    setActiveRooms((prev: Room[]) => [normalizeRoom(created.room), ...prev.filter((r: Room) => r.id !== created.room.id)]);
    goToRoom(created.room.id, data.isLocked ? data.password : undefined);
  };

  const goToGame = (source?: string) => {
    const query = source ? `?source=${encodeURIComponent(source)}` : "";
    navigate(`/game${query}`);
  };

  const displayFriends: Friend[] = (user?.friends || []).map((f: any) => ({
    id: String(f.id),
    nickname: f.username,
    status: f.online_status ? "available" as const : "offline" as const,
    detail: f.online_status ? "Online" : "Offline",
    avatarUrl: f.avatar || undefined,
    initials: f.username.slice(0, 2).toUpperCase(),
  }));

  
  const level = playerStats?.level ?? 1;
  const xp = playerStats?.xp ?? 0;
  const xpInLevel = xp % 100;
  const xpPct = xpInLevel;
  const wlRatio = playerStats
    ? playerStats.losses > 0
      ? (playerStats.wins / playerStats.losses).toFixed(2)
      : String(playerStats.wins)
    : "—";

  const friendList = (
    <>
      {displayFriends.length === 0 ? (
        <p className="text-xs text-slate-500">No friends added yet.</p>
      ) : (
        displayFriends.map((friend: Friend) => (
          <FriendRow
            friend={friend}
            key={friend.id}
            onAction={(_, status) => { if (status === "ingame") goToGame("friend-join"); }}
          />
        ))
      )}
    </>
  );

  return (
    <div className="flex h-full flex-col px-4 font-[Inter,sans-serif]">

      
      <div className="flex gap-3 border-b border-(--dashboard-border) py-3 lg:hidden">
        <ActionButton label="QUICK MATCH" onClick={() => goToGame("quick-match")} variant="primary" />
        <ActionButton label="CREATE ROOM" onClick={() => setCreateRoomOpen(true)} />
      </div>

      
      <div className="flex flex-1 gap-0 overflow-hidden bg-surface border border-(--dashboard-border)">

        
        <aside className="hidden w-64 shrink-0 flex-col gap-6 overflow-y-auto px-4 py-6 lg:flex xl:w-72">
          <button
            className="cursor-pointer flex flex-col items-center text-center transition-opacity hover:opacity-80"
            onClick={() => navigate("/profile")}
            type="button"
          >
            <div className="relative mb-4">
              <div className="size-20 rounded-full border-2 border-[rgba(90,90,246,0.3)] p-1 xl:size-24">
                <img
                  alt="Player avatar"
                  className="size-full rounded-full object-cover"
                  src={user?.avatar || "/profile.jpg"}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/profile.jpg"; }}
                />
              </div>
              <span className="absolute right-0 bottom-0 rounded-full border-2 border-(--dashboard-card) bg-(--dashboard-primary) px-2 py-0.5 text-[10px] font-black">
                LVL {level}
              </span>
            </div>
            <h3 className="mb-1 text-base font-bold text-white xl:text-lg">{user?.username ?? "—"}</h3>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {playerStats ? `Global Rank: #${playerStats.ranking.toLocaleString()}` : "—"}
            </p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-(--dashboard-border)">
              <div className="h-full bg-(--dashboard-primary)" style={{ width: `${xpPct}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              XP: {xpInLevel} / 100
            </p>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Wins"   value={playerStats ? String(playerStats.wins) : "—"} />
            <StatCard label="Losses" value={playerStats ? String(playerStats.losses) : "—"} />
            <div className="col-span-2">
              <StatCard accent label="W/L Ratio" value={wlRatio} />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1" />
        </aside>

        
        <div className="hidden w-px shrink-0 bg-(--dashboard-border) lg:block" />

        
        <section className="flex flex-1 flex-col overflow-hidden px-4">
          <div className="pt-6 pb-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h1 className="text-xl font-bold text-white md:text-2xl">Active Rooms</h1>
              <button
                className="cursor-pointer rounded-lg border border-(--dashboard-border) px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={roomsRefreshing}
                onClick={handleRefreshRooms}
                type="button"
              >
                {roomsRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <label className="group relative block">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-(--dashboard-primary)">
                <AppIcon name="search" size={18} />
              </span>
              <input
                className="w-full rounded-xl border-2 border-(--dashboard-border) bg-(--dashboard-card) py-3 pr-4 pl-12 text-white placeholder:text-slate-600 focus:border-(--dashboard-primary) focus:ring-0"
                placeholder="Search room name or host..."
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </label>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pb-6 [scrollbar-width:thin] [scrollbar-color:var(--dashboard-border)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--dashboard-border)">
            {roomsLoading && activeRooms.length === 0 && (
              <p className="text-sm text-slate-500">Loading rooms...</p>
            )}
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} />
            ))}
            {!roomsLoading && filteredRooms.length === 0 && (
              <p className="text-sm text-slate-500">No active rooms found.</p>
            )}

            
            <div className="xl:hidden pt-2">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                Online Friends
              </h4>
              <div className="space-y-3">{friendList}</div>
              <button
                className="cursor-pointer mt-3 w-full rounded-lg py-2 text-xs font-semibold text-slate-400 hover:text-white border border-(--dashboard-border) hover:border-white/20 transition-colors"
                onClick={() => navigate("/friends")}
                type="button"
              >
                All Friends
              </button>
            </div>
          </div>
        </section>

        
        <div className="hidden w-px shrink-0 bg-(--dashboard-border) xl:block" />

        
        <aside className="hidden w-72 shrink-0 flex-col gap-6 overflow-y-auto px-4 py-6 xl:flex">
          <div className="space-y-3">
            <ActionButton label="QUICK MATCH" onClick={() => goToGame("quick-match")} variant="primary" />
            <ActionButton label="CREATE ROOM" onClick={() => setCreateRoomOpen(true)} />
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Online Friends</h4>
            <div className="space-y-4">{friendList}</div>
            <button
              className="cursor-pointer mt-2 w-full rounded-lg py-2 text-xs font-semibold text-slate-400 hover:text-white border border-(--dashboard-border) hover:border-white/20 transition-colors"
              onClick={() => navigate("/friends")}
              type="button"
            >
              All Friends
            </button>
          </div>
        </aside>

      </div>

      <CreateRoomDialog
        open={createRoomOpen}
        onClose={() => setCreateRoomOpen(false)}
        onCreate={handleCreateRoom}
      />

      {joinDialogMounted && (
        <>
          <div
            className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${joinDialogVisible ? "opacity-100" : "opacity-0"}`}
            onClick={closeJoinLockedRoomDialog}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className={`w-full max-w-md rounded-2xl bg-[var(--dashboard-card)] border border-white/10 shadow-2xl pointer-events-auto transition-all duration-200 ${joinDialogVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"}`}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h2 className="text-base font-bold text-white">Join Private Room</h2>
                <button
                  className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                  onClick={closeJoinLockedRoomDialog}
                  type="button"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-slate-300">This room is protected. Enter the password to join.</p>
                <input
                  autoFocus
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-(--dashboard-primary) focus:ring-1 focus:ring-(--dashboard-primary)/50"
                  name="room-access-code"
                  onChange={(e) => setJoinRoomPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleJoinLockedRoom();
                    }
                  }}
                  placeholder="••••••••"
                  type="password"
                  value={joinRoomPassword}
                />
                {joinRoomError && <p className="text-sm text-red-400">{joinRoomError}</p>}
              </div>

              <div className="border-t border-white/10 px-6 py-4 flex gap-2">
                <button
                  className="cursor-pointer flex-1 rounded-xl py-2.5 text-sm font-bold bg-[linear-gradient(135deg,var(--dashboard-primary),#7a6bff)] text-white hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                  disabled={joinRoomLoading}
                  onClick={handleJoinLockedRoom}
                  type="button"
                >
                  {joinRoomLoading ? "Checking..." : "Join"}
                </button>
                <button
                  className="cursor-pointer flex-1 rounded-xl py-2.5 text-sm font-semibold border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={closeJoinLockedRoomDialog}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
