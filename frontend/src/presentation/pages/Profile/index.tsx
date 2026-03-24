import { dashboardThemeVars } from "../../../app/appColors";
import ProfileHero from "../../components/profile/ProfileHero";
import { useAuth } from "../../../infrastructure/auth/authContext";
import { useNavigate } from "react-router";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAddFriend = () => {
    console.log("Add friend clicked");
  };

  const handleChallenge = () => {
    console.log("Challenge clicked");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading profile...</p>
      </div>
    );
  }

  const profileData = {
    username: user.username,
    tierName: "XXX",
    country: "XXX",
    countryCode: "XXX",
    avatarUrl: user.avatar || "",
    bannerUrl: "",
    isOnline: user.online_status,
    isPro: false,
  };

  return (
    <div className="min-h-screen bg-white/5 dark:bg-[var(--dashboard-bg)]" style={dashboardThemeVars}>
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 dark:bg-[var(--dashboard-bg)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate("/")}
                type="button"
              >
                <div className="w-8 h-8 bg-[var(--dashboard-primary)] rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">sports_soccer</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  HAX<span className="text-[var(--dashboard-primary)]">CLONE</span>
                </h1>
              </button>
              <nav className="hidden md:flex items-center gap-6">
                <button
                  className="text-sm font-medium text-slate-400 hover:text-[var(--dashboard-primary)] transition-colors"
                  onClick={() => navigate("/")}
                  type="button"
                >
                  Dashboard
                </button>
                <button className="text-sm font-medium text-[var(--dashboard-primary)]" type="button">
                  Profile
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--dashboard-primary)]/50"
                  placeholder="Search players..."
                  type="text"
                />
              </div>
              <button
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
              <div className="w-10 h-10 rounded-full border-2 border-[var(--dashboard-primary)]/50 overflow-hidden bg-slate-700">
                {user.avatar ? (
                  <img alt="User avatar" className="w-full h-full object-cover" src={user.avatar} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHero onAddFriend={handleAddFriend} onChallenge={handleChallenge} profile={profileData} />

        {/* Statistics and Match History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Statistics */}
          <div className="lg:col-span-5 space-y-6">
            <section className="dashboard-card rounded-2xl border border-[var(--dashboard-border)] p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Statistics</h3>
              <p className="mt-4 text-slate-300">XXX</p>
            </section>
            <section className="dashboard-card rounded-2xl border border-[var(--dashboard-border)] p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Achievements</h3>
              <p className="mt-4 text-slate-300">XXX</p>
            </section>
          </div>

          {/* Right Column: Match History */}
          <div className="lg:col-span-7">
            <section className="dashboard-card rounded-2xl border border-[var(--dashboard-border)] p-6 min-h-[280px]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Match History</h3>
              <p className="mt-4 text-slate-300">XXX</p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-6 h-6 bg-slate-500 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">sports_soccer</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight">HAXCLONE</h1>
          </div>
          <div className="flex gap-8 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            <a className="hover:text-[var(--dashboard-primary)] transition-colors" href="#">
              Privacy
            </a>
            <a className="hover:text-[var(--dashboard-primary)] transition-colors" href="#">
              Terms
            </a>
            <a className="hover:text-[var(--dashboard-primary)] transition-colors" href="#">
              Discord
            </a>
            <a className="hover:text-[var(--dashboard-primary)] transition-colors" href="#">
              API
            </a>
          </div>
          <p className="text-xs text-slate-600">© 2024 Haxball Clone Project. v2.4.0</p>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;
