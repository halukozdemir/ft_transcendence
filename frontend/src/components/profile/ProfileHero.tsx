
interface ProfileHeroData {
  username: string;
  level: number;
  rank: number;
  avatarUrl: string;
  bannerUrl: string;
  isOnline: boolean;
}

interface ProfileHeroProps {
  profile: ProfileHeroData;
  onAddFriend?: () => void;
  isOwnProfile?: boolean;
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
        />
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 z-20 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-[var(--dashboard-bg)] overflow-hidden shadow-2xl bg-slate-800">
                <img
                  alt={profile.username}
                  className="w-full h-full object-cover"
                  src={profile.avatarUrl}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/profile.png"; }}
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
