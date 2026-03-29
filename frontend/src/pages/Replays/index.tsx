import { useEffect, useState } from "react";
import type { MatchHistory } from "../../services/profileApi";
import { useNavigate, useSearchParams } from "react-router";
import { dashboardThemeVars } from "../../constants/appColors";
import { useAuth } from "../../context/authContext";
import { profileApi } from "../../services/profileApi";
import AppIcon from "../../components/ui/AppIcon";
const ReplaysPage = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [matches, setMatches] = useState<MatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get("user_id") || user?.id.toString();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!userId || !accessToken) return;

      try {
        setLoading(true);
        const data = await profileApi.getMatchHistory(Number(userId), accessToken, 50);
        setMatches(data.results);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load match history";
        setError(message);
        console.error("Match history error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [userId, accessToken]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--dashboard-bg)] flex items-center justify-center" style={dashboardThemeVars}>
        <p className="text-slate-400">Loading replays...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)]" style={dashboardThemeVars}>
      
      <header className="sticky top-0 z-50 border-b border-[var(--dashboard-border)] bg-[color:rgba(21,25,33,0.9)] backdrop-blur-md px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
            type="button"
          >
            <AppIcon name="brand" size={28} />
            <h1 className="text-xl font-bold text-white">Match History</h1>
          </button>
          <button
            className="cursor-pointer text-sm font-medium text-slate-400 hover:text-white transition-colors"
            onClick={() => navigate("/")}
            type="button"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-lg p-4 hover:border-[var(--dashboard-primary)]/50 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                
                <div className="col-span-2">
                  {match.result === "win" ? (
                    <div className="inline-block px-3 py-1 rounded-lg bg-green-500/20 text-green-400 font-bold text-sm">
                      VICTORY
                    </div>
                  ) : match.result === "draw" ? (
                    <div className="inline-block px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 font-bold text-sm">
                      DRAW
                    </div>
                  ) : (
                    <div className="inline-block px-3 py-1 rounded-lg bg-red-500/20 text-red-400 font-bold text-sm">
                      DEFEAT
                    </div>
                  )}
                </div>

                
                <div className="col-span-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-white">{match.my_score}</span>
                    <span className="text-slate-500">-</span>
                    <span className="text-2xl font-bold text-white">{match.opponent_score}</span>
                  </div>
                </div>

                
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-[var(--dashboard-primary)]/50 overflow-hidden bg-[var(--dashboard-border)] flex-shrink-0">
                    {match.opponent_avatar ? (
                      <img
                        alt={match.opponent_name}
                        className="w-full h-full object-cover"
                        src={match.opponent_avatar}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                        {match.opponent_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{match.opponent_name}</p>
                  </div>
                </div>

                
                <div className="col-span-4 text-right">
                  <p className="text-xs text-slate-500">
                    {formatDuration(match.duration_seconds)} • {formatDate(match.played_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {matches.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-slate-400">No match history yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReplaysPage;
