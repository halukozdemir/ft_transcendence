import type { Achievement } from "../../types/profile";
import type { IconType } from "react-icons";
import { MdEmojiEvents, MdLock, MdVerified, MdWhatshot } from "react-icons/md";
interface AchievementBadgesProps {
  achievements: Achievement[];
}

const colorByType = {
  tournament: "bg-yellow-500/20 border-yellow-500/30 text-yellow-500",
  streak: "bg-[var(--dashboard-primary)]/20 border-[var(--dashboard-primary)]/30 text-[var(--dashboard-primary)]",
  verified: "bg-emerald-500/20 border-emerald-500/30 text-emerald-500",
  special: "bg-slate-500/20 border-slate-500/30 text-slate-400",
} as const;

const iconByType: Record<Achievement["type"], IconType> = {
  tournament: MdEmojiEvents,
  streak: MdWhatshot,
  verified: MdVerified,
  special: MdLock,
};

const AchievementBadges = ({ achievements }: AchievementBadgesProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-4">Recent Achievements</h3>
      {achievements.length === 0 && (
        <p className="text-sm text-slate-500">No achievements unlocked yet.</p>
      )}
      <div className="flex flex-wrap gap-3">
        {achievements.map((achievement) => {
          const colors = colorByType[achievement.type];
          const Icon = iconByType[achievement.type];
          const opacity = achievement.locked ? "opacity-50" : "";

          return (
            <div
              key={achievement.id}
              className={`w-12 h-12 rounded-lg flex items-center justify-center border cursor-help group relative ${colors} ${opacity}`}
            >
              <Icon size={20} />

              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-900/95 px-3 py-2 text-left opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                <p className="text-xs font-semibold text-white">{achievement.title}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-300">{achievement.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementBadges;
