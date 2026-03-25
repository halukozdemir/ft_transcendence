import type { MatchState, ScoreState } from "../../types/game";

interface Props {
  score: ScoreState;
  match: MatchState;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m} : ${s}`;
}

export default function Scoreboard({ score, match }: Props) {
  return (
    // font-size is the single scale knob — everything inside uses em
    <div
      style={{ fontSize: "clamp(10px, 1.25vw, 16px)" }}
      className="flex items-stretch bg-surface border border-border rounded-[1em] overflow-hidden select-none"
    >

      {/* ── Red section ── */}
      <div className="flex items-center gap-[0.75em] px-[1.2em] py-[0.6em]">
        <div className="flex flex-col items-end gap-[0.35em]">
          <span
            style={{ fontSize: "0.68em", letterSpacing: "0.15em" }}
            className="text-team-red font-semibold uppercase leading-none"
          >
            Red Team
          </span>
          <span
            style={{ fontSize: "1.35em" }}
            className="text-white font-black tracking-wide leading-none"
          >
            {match.redTeamName.toUpperCase()}
          </span>
        </div>
        <div
          style={{ width: "2.75em", height: "2.75em", borderRadius: "0.55em" }}
          className="flex items-center justify-center bg-team-red/15 border border-team-red/40 shrink-0"
        >
          <span style={{ fontSize: "1.35em" }} className="text-team-red font-black leading-none">
            {score.red}
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ margin: "0.75em 0" }} className="w-px bg-border" />

      {/* ── Timer ── */}
      <div className="flex items-center justify-center px-[1.8em]">
        <span
          style={{ fontSize: "1.35em", letterSpacing: "0.2em" }}
          className="text-system font-bold leading-none"
        >
          {formatTime(match.timeLeft)}
        </span>
      </div>

      {/* ── Divider ── */}
      <div style={{ margin: "0.75em 0" }} className="w-px bg-border" />

      {/* ── Blue section ── */}
      <div className="flex items-center gap-[0.75em] px-[1.2em] py-[0.6em]">
        <div
          style={{ width: "2.75em", height: "2.75em", borderRadius: "0.55em" }}
          className="flex items-center justify-center bg-team-blue/15 border border-team-blue/40 shrink-0"
        >
          <span style={{ fontSize: "1.35em" }} className="text-team-blue font-black leading-none">
            {score.blue}
          </span>
        </div>
        <div className="flex flex-col items-start gap-[0.35em]">
          <span
            style={{ fontSize: "0.68em", letterSpacing: "0.15em" }}
            className="text-team-blue font-semibold uppercase leading-none"
          >
            Blue Team
          </span>
          <span
            style={{ fontSize: "1.35em" }}
            className="text-white font-black tracking-wide leading-none"
          >
            {match.blueTeamName.toUpperCase()}
          </span>
        </div>
      </div>

    </div>
  );
}
