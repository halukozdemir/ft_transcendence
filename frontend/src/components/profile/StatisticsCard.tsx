import type { PlayerStats } from "../../types/profile";

interface StatisticsCardProps {
  stats: PlayerStats;
}

const StatisticsCard = ({ stats }: StatisticsCardProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-6">Kariyer İstatistikleri</h3>
      <div className="space-y-6">
        {/* Win Rate */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-slate-400 text-sm font-medium">Kazanma Oranı</span>
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
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Toplam Maç</span>
            <div className="text-2xl font-bold mt-1">{stats.totalMatches.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Atılan Gol</span>
            <div className="text-2xl font-bold mt-1">{stats.goalsScored.toLocaleString()}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatisticsCard;
