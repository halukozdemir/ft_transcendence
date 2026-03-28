import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/authContext";
import AppIcon from "../ui/AppIcon";
import ProfileDrawer from "./ProfileDrawer";

const NAV_LINKS = [
  { label: "Lobi",        path: "/"            },
  { label: "Arkadaşlar",  path: "/friends"     },
  { label: "Liderlik Tablosu", path: "/leaderboard" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user }  = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userInitials = (user?.username || user?.email || "??").slice(0, 2).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-(--dashboard-border) bg-[rgba(14,14,14,0.85)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-360 items-center justify-between gap-3 px-4 py-3">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              className="cursor-pointer flex items-center gap-2 text-(--dashboard-primary)"
              onClick={() => navigate("/")}
              type="button"
            >
              <span className="text-xl font-black tracking-tight text-white">Pingle</span>
            </button>

            <nav className="hidden items-center gap-6 pl-6 md:flex">
              {NAV_LINKS.map(({ label, path }) => {
                const active = location.pathname === path;
                return (
                  <button
                    key={path}
                    className={
                      active
                        ? "cursor-pointer border-b-2 border-(--dashboard-primary) pb-1 text-sm font-semibold text-white"
                        : "cursor-pointer pb-1 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                    }
                    onClick={() => navigate(path)}
                    type="button"
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-[rgba(40,40,57,0.65)] px-3 py-1.5 md:flex">
              <span className="size-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-slate-300">ÇEVRIMIÇI</span>
            </div>

            <button
              className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-(--dashboard-border)"
              type="button"
              aria-label="Bildirimler"
            >
              <AppIcon name="notifications" size={22} />
            </button>

            <button
              className="cursor-pointer grid size-8 place-items-center overflow-hidden rounded-full bg-(--dashboard-primary) text-xs font-bold text-white shadow-[0_0_14px_rgba(90,90,246,0.35)] transition-transform hover:scale-105"
              onClick={() => setDrawerOpen(true)}
              type="button"
              aria-label="Profile menu"
            >
              {user?.avatar ? (
                <img
                  alt="User avatar"
                  className="size-full object-cover"
                  src={user.avatar}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/profile.png"; }}
                />
              ) : (
                userInitials
              )}
            </button>
          </div>

        </div>
      </header>

      <ProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default Navbar;
