import { createBrowserRouter } from "react-router";
import GameLayout from "../layouts/Game";
import DashboardPage from "../presentation/pages/Dashboard";
import ProfilePage from "../presentation/pages/Profile";
import AuthPage from "../presentation/pages/Auth";
import LeaderboardPage from "../presentation/pages/Leaderboard";
import ReplaysPage from "../presentation/pages/Replays";
import TermsPage from "../presentation/pages/Terms";
import PrivacyPage from "../presentation/pages/Privacy";
import ProtectedRoute from "../presentation/components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
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
    element: (
      <ProtectedRoute>
        <LeaderboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/replays",
    element: (
      <ProtectedRoute>
        <ReplaysPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/terms",
    element: (
      <ProtectedRoute>
        <TermsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/privacy",
    element: (
      <ProtectedRoute>
        <PrivacyPage />
      </ProtectedRoute>
    ),
  },
]);

export default router;
