import type { Match } from "../../types/profile";
interface MatchHistoryRowProps {
  match: Match;
  onClick?: (matchId: string) => void;
}

const resultColor = {
  WIN: "bg-emerald-500/20 border-emerald-500/30 text-emerald-500",
  LOSS: "bg-red-500/20 border-red-500/30 text-red-500",
  DRAW: "bg-slate-500/20 border-slate-500/30 text-slate-400",
} as const;

const resultEmoji = {
  WIN: "W",
  LOSS: "L",
  DRAW: "D",
} as const;

const MatchHistoryRow = ({ match, onClick }: MatchHistoryRowProps) => {
  return (
    <div
      className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer"
      onClick={() => onClick?.(match.id)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${resultColor[match.result]}`}>
          {resultEmoji[match.result]}
        </div>
        <div>
          <p className="font-bold text-sm">{match.roomName}</p>
          <p className="text-xs text-slate-500">{match.timeAgoText}</p>
        </div>
      </div>
      <div className="text-xl font-black tracking-widest text-white px-3 py-1 bg-white/5 rounded-lg border border-white/10">
        {match.score.us} - {match.score.them}
      </div>
    </div>
  );
};

export default MatchHistoryRow;
