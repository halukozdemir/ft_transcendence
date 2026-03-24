import AppIcon from "../dashboard/AppIcon";

interface ProfileHeroData {
  username: string;
  tierName: string;
  country: string;
  countryCode: string;
  avatarUrl: string;
  bannerUrl: string;
  isOnline: boolean;
  isPro: boolean;
}

interface ProfileHeroProps {
  profile: ProfileHeroData;
  onAddFriend?: () => void;
  onChallenge?: () => void;
}

const ProfileHero = ({ profile, onAddFriend, onChallenge }: ProfileHeroProps) => {
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
                <img alt={profile.username} className="w-full h-full object-cover" src={profile.avatarUrl} />
              </div>
              {profile.isOnline && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-[var(--dashboard-bg)] rounded-full"></div>
              )}
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-4xl font-bold text-white">{profile.username}</h2>
                {profile.isPro && (
                  <span className="px-2 py-0.5 rounded bg-[var(--dashboard-primary)] text-[10px] font-bold uppercase tracking-wider text-white">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-slate-300 flex items-center gap-2 text-sm sm:text-base mt-1">
                <span className="material-symbols-outlined text-sm">workspace_premium</span>
                {profile.tierName} • {profile.country} {profile.countryCode}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-none px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              onClick={onAddFriend}
              type="button"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              Add Friend
            </button>
            <button
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[var(--dashboard-primary)] hover:bg-[var(--dashboard-primary)]/90 rounded-xl font-semibold text-sm shadow-lg shadow-[var(--dashboard-primary)]/20 transition-all flex items-center justify-center gap-2 text-white"
              onClick={onChallenge}
              type="button"
            >
              <AppIcon name="quickMatch" size={18} />
              Challenge
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
