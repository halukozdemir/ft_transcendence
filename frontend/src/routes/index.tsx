import { createBrowserRouter } from "react-router";
import GameLayout from "../layouts/Game";
import DashboardPage from "../presentation/pages/Dashboard";
import ProfilePage from "../presentation/pages/Profile";
import AuthPage from "../presentation/pages/Auth";
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
]);

export default router;
