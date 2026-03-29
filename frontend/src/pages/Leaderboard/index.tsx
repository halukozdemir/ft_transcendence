import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import AppIcon from "../../components/ui/AppIcon";
import { gameApi, type LeaderboardEntry } from "../../services/gameApi";
const PAGE_SIZE = 10;

const podiumColor = [
  "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
  "bg-slate-400/20 border-slate-400/40 text-slate-300",
  "bg-orange-500/20 border-orange-500/40 text-orange-400",
];

const Avatar = ({ entry }: { entry: LeaderboardEntry }) => (
  <div className="size-10 shrink-0 rounded-full overflow-hidden border border-white/10 bg-(--dashboard-border) flex items-center justify-center text-xs font-bold text-white">
    {entry.avatar
      ? <img alt={entry.username} className="size-full object-cover" src={entry.avatar} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      : entry.username.charAt(0).toUpperCase()
    }
  </div>
);

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    gameApi.getLeaderboard(100)
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const top3 = data.slice(0, 3);

  const filtered = useMemo(
    () => data.filter((e) => e.username.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  const tableData = search ? filtered : data.slice(3);
  const totalPages = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE));
  const paginated = tableData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Leaderboard</h1>

      
      {!search && top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[top3[1], top3[0], top3[2]].map((entry, i) => {
            if (!entry) return <div key={i} />;
            const podiumIndex = entry.rank - 1;
            const sizes = ["h-28", "h-36", "h-28"];
            return (
              <button
                key={entry.user_id}
                className="cursor-pointer flex flex-col items-center justify-end gap-2 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/8 transition-colors p-4"
                onClick={() => navigate(`/profile?user_id=${entry.user_id}`)}
                type="button"
              >
                <div className={`size-14 rounded-full overflow-hidden border-2 ${podiumColor[podiumIndex]} flex items-center justify-center text-sm font-bold bg-(--dashboard-border)`}>
                  {entry.avatar
                    ? <img alt={entry.username} className="size-full object-cover" src={entry.avatar} />
                    : entry.username.charAt(0).toUpperCase()
                  }
                </div>
                <p className="text-sm font-bold text-white truncate max-w-full">{entry.username}</p>
                <p className="text-xs text-slate-400">{entry.xp.toLocaleString()} XP</p>
                <div className={`w-full ${sizes[i]} rounded-xl border flex items-center justify-center text-2xl font-black ${podiumColor[podiumIndex]}`}>
                  #{entry.rank}
                </div>
              </button>
            );
          })}
        </div>
      )}

      
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

        
        <div className="p-4 border-b border-white/10">
          <label className="group relative block">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-(--dashboard-primary)">
              <AppIcon name="search" size={16} />
            </span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-(--dashboard-primary)"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search player..."
              type="text"
              value={search}
            />
          </label>
        </div>

        
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/10">
          <div className="col-span-1 text-xs font-bold text-slate-500 uppercase">Rank</div>
          <div className="col-span-4 text-xs font-bold text-slate-500 uppercase">Player</div>
          <div className="col-span-2 text-xs font-bold text-slate-500 uppercase">Level</div>
          <div className="col-span-3 text-xs font-bold text-slate-500 uppercase">XP</div>
          <div className="col-span-2 text-xs font-bold text-slate-500 uppercase text-right">W / T</div>
        </div>

        
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-white/5 animate-pulse">
                <div className="col-span-1 h-4 bg-white/10 rounded" />
                <div className="col-span-4 h-4 bg-white/10 rounded" />
                <div className="col-span-2 h-4 bg-white/10 rounded" />
                <div className="col-span-3 h-4 bg-white/10 rounded" />
                <div className="col-span-2 h-4 bg-white/10 rounded" />
              </div>
            ))
          : paginated.map((entry) => (
              <button
                key={entry.user_id}
                className="cursor-pointer w-full grid grid-cols-12 gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-left"
                onClick={() => navigate(`/profile?user_id=${entry.user_id}`)}
                type="button"
              >
                <div className="col-span-1 flex items-center">
                  <span className="text-sm font-semibold text-slate-400">#{entry.rank}</span>
                </div>
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <Avatar entry={entry} />
                  <span className="truncate text-sm font-semibold text-white">{entry.username}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm font-bold text-slate-300">Level {entry.level}</span>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="text-sm font-bold text-(--dashboard-primary)">{entry.xp.toLocaleString()} XP</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2 text-sm">
                  <span className="font-semibold text-green-400">{entry.wins}W</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">{entry.total_matches}</span>
                </div>
              </button>
            ))
        }

        {paginated.length === 0 && !loading && (
          <div className="py-12 text-center text-slate-500 text-sm">
            {search ? `No results found for "${search}"` : "No players on the leaderboard yet"}
          </div>
        )}

        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
            <span className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, tableData.length)} / {tableData.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                type="button"
              >
                <AppIcon name="chevronLeft" size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={[
                    "cursor-pointer size-8 rounded-lg text-sm font-bold transition-colors",
                    p === page ? "bg-(--dashboard-primary) text-white" : "text-slate-400 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                  onClick={() => setPage(p)}
                  type="button"
                >
                  {p}
                </button>
              ))}
              <button
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                type="button"
              >
                <AppIcon name="chevronRight" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
