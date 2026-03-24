import type { Match } from "../../../domain/models/profile";
import MatchHistoryRow from "./MatchHistoryRow";

interface MatchHistoryTableProps {
  matches: Match[];
  onMatchClick?: (matchId: string) => void;
  onViewMore?: () => void;
}

const MatchHistoryTable = ({ matches, onMatchClick, onViewMore }: MatchHistoryTableProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--dashboard-primary)]">history</span>
          Match History
        </h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-[var(--dashboard-primary)]/20 text-[var(--dashboard-primary)] text-xs font-bold rounded-lg border border-[var(--dashboard-primary)]/30" type="button">
            ALL
          </button>
          <button className="px-3 py-1 bg-white/5 text-slate-400 text-xs font-bold rounded-lg border border-white/10" type="button">
            3v3
          </button>
          <button className="px-3 py-1 bg-white/5 text-slate-400 text-xs font-bold rounded-lg border border-white/10" type="button">
            DUEL
          </button>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {matches.map((match) => (
          <MatchHistoryRow key={match.id} match={match} onClick={onMatchClick} />
        ))}
      </div>
      <button
        className="w-full py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-white/5 border-t border-white/10"
        onClick={onViewMore}
        type="button"
      >
        View More Matches
      </button>
    </div>
  );
};

export default MatchHistoryTable;
