import type { PlayerStats } from "../../../domain/models/profile";

interface StatisticsCardProps {
  stats: PlayerStats;
}

const StatisticsCard = ({ stats }: StatisticsCardProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[var(--dashboard-primary)]">analytics</span>
        Career Statistics
      </h3>
      <div className="space-y-6">
        {/* Win Rate */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-slate-400 text-sm font-medium">Win Percentage</span>
            <span className="text-[var(--dashboard-primary)] text-xl font-bold">{stats.winPercentage}%</span>
          </div>
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--dashboard-primary)] rounded-full shadow-[0_0_12px_rgba(90,90,246,0.5)]"
              style={{ width: `${stats.winPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Total Matches</span>
            <div className="text-2xl font-bold mt-1">{stats.totalMatches.toLocaleString()}</div>
            <div className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              +{stats.weeklyMatches} this week
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Goals Scored</span>
            <div className="text-2xl font-bold mt-1">{stats.goalsScored.toLocaleString()}</div>
            <div className="text-[10px] text-[var(--dashboard-primary)] flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs">grade</span>
              {stats.goalsPerGame.toFixed(1)} per game
            </div>
          </div>
        </div>

        {/* Rating Bars */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Offense Rating</span>
                <span className="text-white font-semibold">{stats.offenseRating}/100</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${stats.offenseRating}%` }}></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Defense Rating</span>
                <span className="text-white font-semibold">{stats.defenseRating}/100</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.defenseRating}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
