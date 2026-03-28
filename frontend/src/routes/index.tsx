import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/Main";
import GameLayout from "../layouts/Game";
import DashboardPage from "../pages/Dashboard";
import ProfilePage from "../pages/Profile";
import FriendsPage from "../pages/Friends";
import AuthPage from "../pages/Auth";
import LeaderboardPage from "../pages/Leaderboard";
import ReplaysPage from "../pages/Replays";
import SettingsPage from "../pages/Settings";
import TermsPage from "../pages/Terms";
import PrivacyPage from "../pages/Privacy";
import OAuthCallbackPage from "../pages/OAuthCallback";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const withLayout = (element: React.ReactNode) => (
  <ProtectedRoute>
    <MainLayout>{element}</MainLayout>
  </ProtectedRoute>
);

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/oauth/callback",
    element: <OAuthCallbackPage />,
  },
  {
    path: "/",
    element: withLayout(<DashboardPage />),
  },
  {
    path: "/profile",
    element: withLayout(<ProfilePage />),
  },
  {
    path: "/friends",
    element: withLayout(<FriendsPage />),
  },
  {
    path: "/game",
    element: (
      <ProtectedRoute>
        <GameLayout />
      </ProtectedRoute>
    ),
  },
  {
    path: "/leaderboard",
    element: withLayout(<LeaderboardPage />),
  },
  {
    path: "/replays",
    element: withLayout(<ReplaysPage />),
  },
  {
    path: "/terms",
    element: withLayout(<TermsPage />),
  },
  {
    path: "/privacy",
    element: withLayout(<PrivacyPage />),
  },
  {
    path: "/settings",
    element: withLayout(<SettingsPage />),
  },
]);

export default router;
