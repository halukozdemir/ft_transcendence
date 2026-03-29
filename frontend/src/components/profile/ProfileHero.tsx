
interface ProfileHeroData {
  username: string;
  level: number;
  rank: number;
  avatarUrl: string;
  bannerUrl: string;
  isOnline: boolean;
  lastSeen: string | null;
  dateJoined: string;
}

interface ProfileHeroProps {
  profile: ProfileHeroData;
  onAddFriend?: () => void;
  isOwnProfile?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
}

function lastSeenText(lastSeen: string | null, isOnline: boolean): string {
  if (isOnline) return "Şu an çevrimiçi";
  if (!lastSeen) return "Hiç görülmedi";
  const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000);
  if (diff < 60) return "Az önce çevrimdışı";
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

const ProfileHero = ({ profile, onAddFriend, isOwnProfile }: ProfileHeroProps) => {
  return (
    <section className="relative mb-8">
      <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--dashboard-bg)] via-[var(--dashboard-bg)]/40 to-transparent z-10"></div>
        <img
          alt="Profile banner"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          src={profile.bannerUrl}
          onError={(e) => { (e.target as HTMLImageElement).src = "/banner.jpg"; }}
        />
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 z-20 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-[var(--dashboard-bg)] overflow-hidden shadow-2xl bg-slate-800">
                <img
                  alt={profile.username}
                  className="w-full h-full object-cover"
                  src={profile.avatarUrl}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/profile.jpg"; }}
                />
              </div>
              {profile.isOnline && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-[var(--dashboard-bg)] rounded-full"></div>
              )}
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-4xl font-bold text-white">{profile.username}</h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base mt-1">
                Seviye {profile.level} • #{profile.rank.toLocaleString()} Küresel
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${profile.isOnline ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${profile.isOnline ? "bg-emerald-400" : "bg-slate-500"}`} />
                  {lastSeenText(profile.lastSeen, profile.isOnline)}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {formatDate(profile.dateJoined)} tarihinde katıldı
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {!isOwnProfile && (
              <button
                className="cursor-pointer flex-1 sm:flex-none px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                onClick={onAddFriend}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                Arkadaş Ekle
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
