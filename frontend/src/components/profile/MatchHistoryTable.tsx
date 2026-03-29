import type { Match } from "../../types/profile";
import MatchHistoryRow from "./MatchHistoryRow";

interface MatchHistoryTableProps {
  matches: Match[];
  onMatchClick?: (matchId: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MatchHistoryTable = ({ matches, onMatchClick, page, totalPages, onPageChange }: MatchHistoryTableProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-lg font-bold">Maç Geçmişi</h3>
      </div>
      <div className="divide-y divide-white/5">
        {matches.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Henüz hiç maç oynanmadı.</p>
        ) : (
          matches.map((match) => (
            <MatchHistoryRow key={match.id} match={match} onClick={onMatchClick} />
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
            Önceki
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${p === page ? "bg-[var(--dashboard-primary)] text-white" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
                onClick={() => onPageChange(p)}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            Sonraki
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchHistoryTable;
