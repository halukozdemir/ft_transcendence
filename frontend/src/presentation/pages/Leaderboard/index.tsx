import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { dashboardThemeVars } from "../../../app/appColors";
import { gameApi } from "../../../infrastructure/api/gameApi";
import AppIcon from "../../components/dashboard/AppIcon";

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

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await gameApi.getLeaderboard(100);
        setLeaderboard(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load leaderboard";
        setError(message);
        console.error("Leaderboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--dashboard-bg)] flex items-center justify-center" style={dashboardThemeVars}>
        <p className="text-slate-400">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)]" style={dashboardThemeVars}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--dashboard-border)] bg-[color:rgba(21,25,33,0.9)] backdrop-blur-md px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
            type="button"
          >
            <AppIcon name="brand" size={28} />
            <h1 className="text-xl font-bold text-white">Leaderboard</h1>
          </button>
          <button
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            onClick={() => navigate("/")}
            type="button"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[var(--dashboard-border)] rounded-t-lg">
            <div className="col-span-1 text-xs font-bold text-slate-400 uppercase">Rank</div>
            <div className="col-span-4 text-xs font-bold text-slate-400 uppercase">Player</div>
            <div className="col-span-2 text-xs font-bold text-slate-400 uppercase">Rating</div>
            <div className="col-span-2 text-xs font-bold text-slate-400 uppercase">Tier</div>
            <div className="col-span-3 text-xs font-bold text-slate-400 uppercase">Record</div>
          </div>

          {/* Leaderboard Entries */}
          {leaderboard.map((entry) => (
            <div
              key={entry.user_id}
              className="grid grid-cols-12 gap-4 px-4 py-4 bg-[var(--dashboard-card)] hover:bg-[var(--dashboard-card)]/80 transition-colors rounded-lg border border-[var(--dashboard-border)] cursor-pointer"
              onClick={() => navigate(`/profile?user_id=${entry.user_id}`)}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center">
                {entry.rank <= 3 ? (
                  <div className={`inline-block px-3 py-1 rounded-full font-bold ${
                    entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                    entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    #{entry.rank}
                  </div>
                ) : (
                  <span className="font-semibold text-slate-300">#{entry.rank}</span>
                )}
              </div>

              {/* Player */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-[var(--dashboard-primary)]/50 overflow-hidden bg-[var(--dashboard-border)]">
                  {entry.avatar ? (
                    <img
                      alt={entry.username}
                      className="w-full h-full object-cover"
                      src={entry.avatar}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{entry.username}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="col-span-2 flex items-center">
                <div className="flex flex-col">
                  <span className="font-bold text-[var(--dashboard-primary)]">{entry.elo_rating}</span>
                  <span className="text-xs text-slate-500">SR</span>
                </div>
              </div>

              {/* Tier */}
              <div className="col-span-2 flex items-center">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  entry.tier === 'diamond' ? 'bg-blue-500/20 text-blue-400' :
                  entry.tier === 'platinum' ? 'bg-cyan-500/20 text-cyan-400' :
                  entry.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                  entry.tier === 'silver' ? 'bg-gray-400/20 text-gray-300' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {entry.tier}
                </div>
              </div>

              {/* Record */}
              <div className="col-span-3 flex items-center">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-green-400">{entry.wins}W</span>
                    <span className="text-xs text-slate-500">Wins</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-300">{entry.total_matches}</span>
                    <span className="text-xs text-slate-500">Total</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {leaderboard.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-slate-400">No players in leaderboard yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
