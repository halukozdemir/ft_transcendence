import type { Achievement } from "../../types/profile";

interface AchievementBadgesProps {
  achievements: Achievement[];
}

const colorByType = {
  tournament: "bg-yellow-500/20 border-yellow-500/30 text-yellow-500",
  streak: "bg-[var(--dashboard-primary)]/20 border-[var(--dashboard-primary)]/30 text-[var(--dashboard-primary)]",
  verified: "bg-emerald-500/20 border-emerald-500/30 text-emerald-500",
  special: "bg-slate-500/20 border-slate-500/30 text-slate-400",
} as const;

const iconByType = {
  tournament: "emoji_events",
  streak: "local_fire_department",
  verified: "verified",
  special: "lock",
} as const;

const AchievementBadges = ({ achievements }: AchievementBadgesProps) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-4">Son Başarımlar</h3>
      {achievements.length === 0 && (
        <p className="text-sm text-slate-500">Henüz hiç başarım kazanılmadı.</p>
      )}
      <div className="flex flex-wrap gap-3">
        {achievements.map((achievement) => {
          const colors = colorByType[achievement.type];
          const icon = iconByType[achievement.type];
          const opacity = achievement.locked ? "opacity-50" : "";

          return (
            <div
              key={achievement.id}
              className={`w-12 h-12 rounded-lg flex items-center justify-center border cursor-help group relative ${colors} ${opacity}`}
              title={achievement.description}
            >
              <span className="material-symbols-outlined">{icon}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementBadges;
