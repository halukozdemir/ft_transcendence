import { useNavigate } from "react-router";
import { useAuth } from "../../context/authContext";
import AppIcon from "../ui/AppIcon";

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ProfileDrawer = ({ open, onClose }: ProfileDrawerProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userInitials = (user?.username || user?.email || "??").slice(0, 2).toUpperCase();

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/auth");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-72 flex-col bg-[var(--dashboard-card)] shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--dashboard-border)] px-5 py-4">
          <span className="text-sm font-semibold text-white">Menü</span>
          <button
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-[var(--dashboard-border)] hover:text-white"
            onClick={onClose}
            type="button"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Profile */}
        <button
          className="cursor-pointer flex items-center gap-4 border-b border-[var(--dashboard-border)] px-5 py-5 text-left transition-colors hover:bg-white/5"
          onClick={() => go("/profile")}
          type="button"
        >
          <div className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-[var(--dashboard-primary)]/40">
            <img
              alt="avatar"
              className="size-full object-cover"
              src={user?.avatar || "/profile.jpg"}
              onError={(e) => { (e.target as HTMLImageElement).src = "/profile.jpg"; }}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{user?.username || userInitials}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </button>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4">
          {[
            { label: "Lobi",         path: "/",            icon: "brand"         },
            { label: "Profil",       path: "/profile",     icon: "verified"      },
            { label: "Liderlik Tablosu", path: "/leaderboard", icon: "filter"    },
            { label: "Ayarlar",      path: "/settings",    icon: "settings"      },
          ].map(({ label, path, icon }) => (
            <button
              key={label}
              className="cursor-pointer flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              onClick={() => go(path)}
              type="button"
            >
              <AppIcon name={icon as any} size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto border-t border-[var(--dashboard-border)] px-3 py-4">
          <button
            className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            onClick={handleLogout}
            type="button"
          >
            <AppIcon name="join" size={18} />
            Çıkış Yap
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDrawer;
