import { useState } from "react";
import { useNavigate } from "react-router";
import ActionButton from "../../components/ui/ActionButton";
import AppIcon from "../../components/ui/AppIcon";
import CreateRoomDialog from "../../components/ui/CreateRoomDialog";
import FriendRow from "../../components/ui/FriendRow";
import RoomCard from "../../components/ui/RoomCard";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/authContext";
import { rooms, friends as mockFriends, profile as mockProfile } from "./mockLobbyData";
import "./dashboard.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createRoomOpen, setCreateRoomOpen] = useState(false);

  const displayFriends = (user?.friends || []).length > 0
    ? (user?.friends || []).map((f) => ({
        id: String(f.id),
        nickname: f.username,
        status: f.online_status ? "available" as const : "offline" as const,
        detail: f.online_status ? "Çevrimiçi" : "Çevrimdışı",
        avatarUrl: f.avatar || undefined,
        initials: f.username.slice(0, 2).toUpperCase(),
      }))
    : mockFriends;

  const xpPct = Math.round((mockProfile.xpCurrent / mockProfile.xpGoal) * 100);
  const wlRatio = mockProfile.losses > 0
    ? (mockProfile.wins / mockProfile.losses).toFixed(2)
    : mockProfile.wins.toString();

  const goToGame = (source?: string, maxPlayers?: number) => {
    const params = new URLSearchParams();
    if (source) params.set("source", source);
    if (maxPlayers && maxPlayers > 2) params.set("maxPlayers", String(maxPlayers));
    const query = params.toString() ? `?${params.toString()}` : "";
    navigate(`/game${query}`);
  };

  const friendList = (
    <>
      {displayFriends.map((friend) => (
        <FriendRow
          friend={friend}
          key={friend.id}
          onAction={(_, status) => { if (status === "ingame") goToGame("friend-join"); }}
        />
      ))}
    </>
  );

  return (
    <div className="dashboard-root flex h-full flex-col px-4">

      {/* ── Mobile action bar ─────────────────────────────── */}
      <div className="flex gap-3 border-b border-(--dashboard-border) py-3 lg:hidden">
        <ActionButton icon="quickMatch" label="HIZLI MAÇ" onClick={() => goToGame("quick-match")} variant="primary" />
        <ActionButton icon="createRoom" label="ODA OLUŞTUR" onClick={() => setCreateRoomOpen(true)} />
      </div>

      {/* ── Three-column layout ───────────────────────────── */}
      <div className="flex flex-1 gap-0 overflow-hidden bg-surface border border-(--dashboard-border)">

        {/* Left sidebar — lg+ */}
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
                  src={user?.avatar || "/profile.png"}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/profile.png"; }}
                />
              </div>
              <span className="absolute right-0 bottom-0 rounded-full border-2 border-(--dashboard-card) bg-(--dashboard-primary) px-2 py-0.5 text-[10px] font-black">
                LVL {mockProfile.level}
              </span>
            </div>
            <h3 className="mb-1 text-base font-bold text-white xl:text-lg">{user?.username || mockProfile.nickname}</h3>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{mockProfile.rankText}</p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-(--dashboard-border)">
              <div className="h-full bg-(--dashboard-primary)" style={{ width: `${xpPct}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              XP: {mockProfile.xpCurrent.toLocaleString()} / {mockProfile.xpGoal.toLocaleString()}
            </p>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Galibiyet"   value={String(mockProfile.wins)}   />
            <StatCard label="Mağlubiyet" value={String(mockProfile.losses)} />
            <div className="col-span-2">
              <StatCard accent label="G/M Oranı" value={wlRatio} />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1">
          </div>
        </aside>

        {/* Divider */}
        <div className="hidden w-px shrink-0 bg-(--dashboard-border) lg:block" />

        {/* Center — room list */}
        <section className="flex flex-1 flex-col overflow-hidden px-4">
          <div className="pt-6 pb-2">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-white md:text-2xl">Aktif Odalar</h1>
            </div>

            <label className="group relative block">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-(--dashboard-primary)">
                <AppIcon name="search" size={18} />
              </span>
              <input
                className="w-full rounded-xl border-2 border-(--dashboard-border) bg-(--dashboard-card) py-3 pr-4 pl-12 text-white placeholder:text-slate-600 focus:border-(--dashboard-primary) focus:ring-0"
                placeholder="Oda adı veya sunucu ara..."
                type="text"
              />
            </label>
          </div>

          <div className="dashboard-scrollbar flex-1 space-y-3 overflow-y-auto pb-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onJoin={goToGame} />
            ))}

            {/* Mobile: friends inline below rooms */}
            <div className="xl:hidden pt-2">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                Çevrimiçi Arkadaşlar
              </h4>
              <div className="space-y-3">{friendList}</div>
              <button
                className="cursor-pointer mt-3 w-full rounded-lg py-2 text-xs font-semibold text-slate-400 hover:text-white border border-(--dashboard-border) hover:border-white/20 transition-colors"
                onClick={() => navigate("/friends")}
                type="button"
              >
                Tüm Arkadaşlar
              </button>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="hidden w-px shrink-0 bg-(--dashboard-border) xl:block" />

        {/* Right sidebar — xl+ */}
        <aside className="hidden w-72 shrink-0 flex-col gap-6 overflow-y-auto px-4 py-6 xl:flex">
          <div className="space-y-3">
            <ActionButton icon="quickMatch" label="HIZLI MAÇ" onClick={() => goToGame("quick-match")} variant="primary" />
            <ActionButton icon="createRoom" label="ODA OLUŞTUR" onClick={() => setCreateRoomOpen(true)} />
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Çevrimiçi Arkadaşlar</h4>
            <div className="space-y-4">{friendList}</div>
            <button
              className="cursor-pointer mt-2 w-full rounded-lg py-2 text-xs font-semibold text-slate-400 hover:text-white border border-(--dashboard-border) hover:border-white/20 transition-colors"
              onClick={() => navigate("/friends")}
              type="button"
            >
              Tüm Arkadaşlar
            </button>
          </div>
        </aside>

      </div>

      <CreateRoomDialog
        open={createRoomOpen}
        onClose={() => setCreateRoomOpen(false)}
        onCreate={(data) => { console.log("Oda oluşturuldu:", data); goToGame("create-room", data.maxPlayers); }}
      />
    </div>
  );
};

export default DashboardPage;
