import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import AppIcon from "../../components/ui/AppIcon";
import { gameApi } from "../../services/gameApi";

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  avatar: string;
  elo_rating: number;
  tier: string;
  total_matches: number;
  wins: number;
}

const MOCK_ALL_TIME: LeaderboardEntry[] = [
  { rank: 1,  user_id: 1,  username: "SniperKing",    avatar: "", elo_rating: 2840, tier: "diamond",  total_matches: 312, wins: 248 },
  { rank: 2,  user_id: 2,  username: "GhostKeeper",   avatar: "", elo_rating: 2710, tier: "diamond",  total_matches: 289, wins: 221 },
  { rank: 3,  user_id: 3,  username: "BallerKilla",   avatar: "", elo_rating: 2650, tier: "diamond",  total_matches: 275, wins: 198 },
  { rank: 4,  user_id: 4,  username: "CaptainKick",   avatar: "", elo_rating: 2480, tier: "platinum", total_matches: 201, wins: 142 },
  { rank: 5,  user_id: 5,  username: "Baller99",      avatar: "", elo_rating: 2310, tier: "platinum", total_matches: 188, wins: 124 },
  { rank: 6,  user_id: 6,  username: "TheWall",       avatar: "", elo_rating: 2190, tier: "gold",     total_matches: 165, wins: 103 },
  { rank: 7,  user_id: 7,  username: "ChillZone",     avatar: "", elo_rating: 2050, tier: "gold",     total_matches: 144, wins: 88  },
  { rank: 8,  user_id: 8,  username: "ProPlayer_99",  avatar: "", elo_rating: 1920, tier: "gold",     total_matches: 130, wins: 74  },
  { rank: 9,  user_id: 9,  username: "SpeedDemon",    avatar: "", elo_rating: 1750, tier: "silver",   total_matches: 112, wins: 58  },
  { rank: 10, user_id: 10, username: "IronFoot",      avatar: "", elo_rating: 1620, tier: "silver",   total_matches: 98,  wins: 47  },
  { rank: 11, user_id: 11, username: "FlashStep",     avatar: "", elo_rating: 1540, tier: "silver",   total_matches: 91,  wins: 43  },
  { rank: 12, user_id: 12, username: "NightOwl",      avatar: "", elo_rating: 1460, tier: "silver",   total_matches: 87,  wins: 39  },
  { rank: 13, user_id: 13, username: "TurboKick",     avatar: "", elo_rating: 1380, tier: "bronze",   total_matches: 74,  wins: 31  },
  { rank: 14, user_id: 14, username: "QuickPass",     avatar: "", elo_rating: 1290, tier: "bronze",   total_matches: 68,  wins: 26  },
  { rank: 15, user_id: 15, username: "DribbleMaster", avatar: "", elo_rating: 1210, tier: "bronze",   total_matches: 61,  wins: 22  },
  { rank: 16, user_id: 16, username: "AceShot",       avatar: "", elo_rating: 1140, tier: "bronze",   total_matches: 55,  wins: 18  },
  { rank: 17, user_id: 17, username: "SoloWing",      avatar: "", elo_rating: 1060, tier: "bronze",   total_matches: 49,  wins: 15  },
  { rank: 18, user_id: 18, username: "ColdBlood",     avatar: "", elo_rating: 980,  tier: "bronze",   total_matches: 42,  wins: 12  },
  { rank: 19, user_id: 19, username: "Rookie_X",      avatar: "", elo_rating: 890,  tier: "bronze",   total_matches: 35,  wins: 9   },
  { rank: 20, user_id: 20, username: "NewbieKick",    avatar: "", elo_rating: 810,  tier: "bronze",   total_matches: 28,  wins: 6   },
];

const MOCK_MONTHLY: LeaderboardEntry[] = [
  { rank: 1,  user_id: 7,  username: "ChillZone",     avatar: "", elo_rating: 420,  tier: "gold",     total_matches: 38, wins: 31 },
  { rank: 2,  user_id: 3,  username: "BallerKilla",   avatar: "", elo_rating: 395,  tier: "diamond",  total_matches: 34, wins: 27 },
  { rank: 3,  user_id: 11, username: "FlashStep",     avatar: "", elo_rating: 370,  tier: "silver",   total_matches: 31, wins: 24 },
  { rank: 4,  user_id: 1,  username: "SniperKing",    avatar: "", elo_rating: 340,  tier: "diamond",  total_matches: 28, wins: 21 },
  { rank: 5,  user_id: 15, username: "DribbleMaster", avatar: "", elo_rating: 310,  tier: "bronze",   total_matches: 25, wins: 18 },
  { rank: 6,  user_id: 9,  username: "SpeedDemon",    avatar: "", elo_rating: 280,  tier: "silver",   total_matches: 22, wins: 15 },
  { rank: 7,  user_id: 4,  username: "CaptainKick",   avatar: "", elo_rating: 255,  tier: "platinum", total_matches: 20, wins: 13 },
  { rank: 8,  user_id: 19, username: "Rookie_X",      avatar: "", elo_rating: 220,  tier: "bronze",   total_matches: 18, wins: 11 },
  { rank: 9,  user_id: 6,  username: "TheWall",       avatar: "", elo_rating: 195,  tier: "gold",     total_matches: 16, wins: 9  },
  { rank: 10, user_id: 13, username: "TurboKick",     avatar: "", elo_rating: 170,  tier: "bronze",   total_matches: 14, wins: 7  },
];

const PAGE_SIZE = 7;


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

type Tab = "alltime" | "monthly";

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("alltime");
  const [allTimeData, setAllTimeData] = useState<LeaderboardEntry[]>(MOCK_ALL_TIME);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const leaderboard = tab === "alltime" ? allTimeData : MOCK_MONTHLY;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await gameApi.getLeaderboard(100);
        if (data?.length) setAllTimeData(data);
      } catch {
        // mock data kullanılmaya devam eder
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Arama değişince sayfayı sıfırla
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const top3 = leaderboard.slice(0, 3);

  const filtered = useMemo(
    () => leaderboard.filter((e) =>
      e.username.toLowerCase().includes(search.toLowerCase())
    ),
    [leaderboard, search]
  );

  // Arama varsa tüm sonuçları, yoksa top3 hariç kalanları paginate et
  const tableData = search ? filtered : leaderboard.slice(3);
  const totalPages = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE));
  const paginated = tableData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Liderlik Tablosu</h1>

      {/* Top 3 Podium — sadece arama yokken */}
      {!search && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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
                <p className="text-xs text-slate-400">{entry.elo_rating} puan</p>
                <div className={`w-full ${sizes[i]} rounded-xl border flex items-center justify-center text-2xl font-black ${podiumColor[podiumIndex]}`}>
                  #{entry.rank}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-1 rounded-lg border border-white/10 p-1 w-full mb-6">
        {(["alltime", "monthly"] as Tab[]).map((t) => (
          <button
            key={t}
            className={[
              "cursor-pointer flex-1 rounded py-2 text-sm font-semibold transition-colors",
              tab === t
                ? "bg-(--dashboard-primary) text-white"
                : "text-slate-400 hover:text-white",
            ].join(" ")}
            onClick={() => { setTab(t); setPage(1); setSearch(""); }}
            type="button"
          >
            {t === "alltime" ? "Tüm Zamanlar" : "Bu Ay"}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

        {/* Arama */}
        <div className="p-4 border-b border-white/10">
          <label className="group relative block">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-(--dashboard-primary)">
              <AppIcon name="search" size={16} />
            </span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-(--dashboard-primary)"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Oyuncu ara..."
              type="text"
              value={search}
            />
          </label>
        </div>

        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/10">
          <div className="col-span-1 text-xs font-bold text-slate-500 uppercase">Sıra</div>
          <div className="col-span-5 text-xs font-bold text-slate-500 uppercase">Oyuncu</div>
          <div className="col-span-3 text-xs font-bold text-slate-500 uppercase">Puan</div>
          <div className="col-span-3 text-xs font-bold text-slate-500 uppercase text-right">G / T</div>
        </div>

        {/* Rows */}
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-white/5 animate-pulse">
                <div className="col-span-1 h-4 bg-white/10 rounded" />
                <div className="col-span-5 h-4 bg-white/10 rounded" />
                <div className="col-span-2 h-4 bg-white/10 rounded" />
                <div className="col-span-2 h-4 bg-white/10 rounded" />
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
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <Avatar entry={entry} />
                  <span className="truncate text-sm font-semibold text-white">{entry.username}</span>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="text-sm font-bold text-(--dashboard-primary)">{entry.elo_rating}</span>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2 text-sm">
                  <span className="font-semibold text-green-400">{entry.wins}G</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">{entry.total_matches}</span>
                </div>
              </button>
            ))
        }

        {paginated.length === 0 && !loading && (
          <div className="py-12 text-center text-slate-500 text-sm">
            {search ? `"${search}" için sonuç bulunamadı` : "Henüz sıralamada oyuncu yok"}
          </div>
        )}

        {/* Pagination */}
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
                    p === page
                      ? "bg-(--dashboard-primary) text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5",
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
