import type { Match } from "../../types/profile";
import MatchHistoryRow from "./MatchHistoryRow";

interface MatchHistoryTableProps {
  matches: Match[];
  onMatchClick?: (matchId: string) => void;
  onViewMore?: () => void;
}

const MatchHistoryTable = ({ matches, onMatchClick, onViewMore }: MatchHistoryTableProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-lg font-bold">Maç Geçmişi</h3>
      </div>
      <div className="divide-y divide-white/5">
        {matches.map((match) => (
          <MatchHistoryRow key={match.id} match={match} onClick={onMatchClick} />
        ))}
      </div>
      <button
        className="cursor-pointer w-full py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-white/5 border-t border-white/10"
        onClick={onViewMore}
        type="button"
      >
        Daha Fazla Maç Göster
      </button>
    </div>
  );
};

export default MatchHistoryTable;
