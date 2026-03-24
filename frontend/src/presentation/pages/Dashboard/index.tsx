import { dashboardThemeVars } from "../../../app/appColors";
import { useNavigate } from "react-router";
import ActionButton from "../../components/dashboard/ActionButton";
import AppIcon from "../../components/dashboard/AppIcon";
import FriendRow from "../../components/dashboard/FriendRow";
import StatCard from "../../components/dashboard/StatCard";
import { useAuth } from "../../../infrastructure/auth/authContext";
import "./dashboard.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userInitials = (user?.username || user?.email || "XX").slice(0, 2).toUpperCase();
  const userFriends = (user?.friends || []).map((friend) => ({
    id: String(friend.id),
    nickname: friend.username,
    status: friend.online_status ? "available" as const : "offline" as const,
    detail: friend.online_status ? "Online" : "Offline",
    avatarUrl: friend.avatar || undefined,
    initials: friend.username.slice(0, 2).toUpperCase(),
  }));

  const goToGame = (source?: string) => {
    const query = source ? `?source=${encodeURIComponent(source)}` : "";
    navigate(`/game${query}`);
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="dashboard-root min-h-screen text-slate-100" style={dashboardThemeVars}>
      <header className="sticky top-0 z-50 border-b border-[var(--dashboard-border)] bg-[color:rgba(21,25,33,0.7)] px-4 py-3 backdrop-blur-md md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[var(--dashboard-primary)]">
              <AppIcon name="brand" size={30} />
              <h2 className="text-lg font-bold tracking-tight text-white md:text-xl">HAX_CLONE</h2>
            </div>
            <nav className="hidden items-center gap-6 pl-6 md:flex">
              <button
                className="border-b-2 border-[var(--dashboard-primary)] pb-1 text-sm font-medium text-white"
                onClick={() => navigate("/")}
                type="button"
              >
                Lobby
              </button>
              <button className="text-sm font-medium text-slate-400 transition-colors hover:text-white" type="button">
                Replays
              </button>
              <button className="text-sm font-medium text-slate-400 transition-colors hover:text-white" type="button">
                Leaderboards
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-[color:rgba(40,40,57,0.65)] px-3 py-1.5 md:flex">
              <span className="dashboard-pulse-dot size-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-slate-300">XXX ONLINE</span>
            </div>
            <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-[var(--dashboard-border)]" type="button">
              <AppIcon name="notifications" size={22} />
            </button>
            <button
              className="dashboard-primary-gradient grid size-8 place-items-center overflow-hidden rounded-full text-xs font-bold text-white shadow-[0_0_14px_rgba(90,90,246,0.35)] transition-transform hover:scale-105"
              onClick={goToProfile}
              type="button"
            >
              {user?.avatar ? (
                <img alt="User avatar" className="size-full object-cover" src={user.avatar} />
              ) : (
                userInitials
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-50px)] overflow-hidden">
        <aside className="dashboard-card hidden w-72 shrink-0 border-r border-[var(--dashboard-border)] p-6 lg:flex lg:flex-col lg:gap-8">
          <button
            className="flex cursor-pointer flex-col items-center text-center transition-opacity hover:opacity-80"
            onClick={goToProfile}
            type="button"
          >
            <div className="relative mb-4">
              <div className="size-24 rounded-full border-2 border-[color:rgba(90,90,246,0.3)] p-1">
                {user?.avatar ? (
                  <img alt="Player avatar" className="size-full rounded-full object-cover" src={user.avatar} />
                ) : (
                  <div className="grid size-full place-items-center rounded-full bg-[var(--dashboard-border)] text-xl font-bold text-white">
                    {userInitials}
                  </div>
                )}
              </div>
              <span className="absolute right-0 bottom-0 rounded-full border-2 border-[var(--dashboard-card)] bg-[var(--dashboard-primary)] px-2 py-0.5 text-[10px] font-black">
                LVL XXX
              </span>
            </div>
            <h3 className="mb-1 text-lg font-bold text-white">{user?.username || "XXX"}</h3>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">XXX</p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--dashboard-border)]">
              <div className="h-full bg-[var(--dashboard-primary)]" style={{ width: "0%" }} />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">XP: XXX / XXX</p>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Wins" value="XXX" />
            <StatCard label="Losses" value="XXX" />
            <div className="col-span-2">
              <StatCard accent label="W/L Ratio" value="XXX" />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1">
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-colors hover:bg-[var(--dashboard-border)] hover:text-white" href="#">
              <AppIcon name="settings" size={20} />
              <span className="text-sm font-medium">Settings</span>
            </a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-colors hover:bg-[var(--dashboard-border)] hover:text-white" href="#">
              <AppIcon name="support" size={20} />
              <span className="text-sm font-medium">Support</span>
            </a>
          </div>
        </aside>

        <section className="flex flex-1 flex-col overflow-hidden">
          <div className="px-4 pt-6 pb-2 md:px-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Active Rooms</h1>
              <button
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-[var(--dashboard-border)] px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-[#35354d]"
                type="button"
              >
                <AppIcon name="filter" size={16} />
                Filter
              </button>
            </div>

            <label className="group relative block">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[var(--dashboard-primary)]">
                <AppIcon name="search" size={18} />
              </span>
              <input
                className="w-full rounded-xl border-2 border-[var(--dashboard-border)] bg-[var(--dashboard-card)] py-3 pr-4 pl-12 text-white placeholder:text-slate-600 focus:border-[var(--dashboard-primary)] focus:ring-0"
                placeholder="Search by room name or host..."
                type="text"
              />
            </label>
          </div>

          <div className="dashboard-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
            <article className="dashboard-card rounded-xl border border-dashed border-[var(--dashboard-border)] p-8 text-center text-slate-400">
              Room list: XXX
            </article>
          </div>
        </section>

        <aside className="dashboard-card hidden w-80 shrink-0 border-l border-[var(--dashboard-border)] p-6 xl:flex xl:flex-col xl:gap-6">
          <div className="space-y-4">
            <ActionButton icon="quickMatch" label="QUICK MATCH" onClick={() => goToGame("quick-match")} variant="primary" />
            <ActionButton icon="createRoom" label="CREATE ROOM" onClick={() => goToGame("create-room")} />
          </div>

          <div className="mt-4">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Friends Online</h4>
            <div className="space-y-4">
              {userFriends.length > 0 ? userFriends.map((friend) => (
                <FriendRow
                  friend={friend}
                  key={friend.id}
                  onAction={(_, status) => {
                    if (status === "ingame") {
                      goToGame("friend-join");
                    }
                  }}
                />
              )) : <p className="text-xs text-slate-500">XXX</p>}
            </div>
          </div>

          <article className="mt-auto rounded-xl border border-white/5 bg-[color:rgba(40,40,57,0.35)] p-4">
            <div className="mb-2 flex items-center gap-3">
              <AppIcon className="text-[var(--dashboard-primary)]" name="campaign" size={18} />
              <p className="text-xs font-bold text-white">News & Updates</p>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">XXX</p>
            <button className="mt-2 text-[11px] font-bold text-[var(--dashboard-primary)] hover:underline" type="button">
              Read more
            </button>
          </article>
        </aside>
      </main>

      <footer className="dashboard-card flex items-center justify-between border-t border-[var(--dashboard-border)] px-4 py-1.5 text-[10px] font-medium text-slate-500 md:px-6">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-green-500" />
            Server Status: XXX
          </span>
          <span>Version: XXX</span>
        </div>
        <div className="hidden gap-4 md:flex">
          <a className="transition-colors hover:text-white" href="#">
            Privacy
          </a>
          <a className="transition-colors hover:text-white" href="#">
            Terms
          </a>
          <a className="transition-colors hover:text-white" href="#">
            Discord Community
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
