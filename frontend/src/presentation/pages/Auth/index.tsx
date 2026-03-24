import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { dashboardThemeVars } from "../../../app/appColors";
import { useAuth } from "../../../infrastructure/auth/authContext";
import LoginRegisterForm from "../../components/auth/LoginRegisterForm";

const AuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setTokensFromOAuth } = useAuth();
  const [searchParams] = useSearchParams();

  // Handle OAuth callback from 42
  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");

    if (access && refresh) {
      setTokensFromOAuth(access, refresh).then(() => {
        navigate("/");
      });
    }
  }, [searchParams, setTokensFromOAuth, navigate]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleOAuth42 = () => {
    // Redirect to the 42 OAuth endpoint
    window.location.href = "/api/auth/oauth/42/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e11] to-[#151921] text-white" style={dashboardThemeVars}>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-12">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-[var(--dashboard-primary)] rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white">sports_soccer</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                HAX<span className="text-[var(--dashboard-primary)]">CLONE</span>
              </h1>
            </div>
            <p className="text-slate-400">Your ultimate competitive gaming platform</p>
          </div>

          {/* Forms */}
          <LoginRegisterForm />

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <div className="px-3 text-xs text-slate-500 uppercase tracking-widest">Or continue with</div>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          {/* OAuth 42 Button */}
          <button
            className="w-full flex items-center justify-center gap-3 rounded-lg border-2 border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all shadow-lg hover:shadow-xl"
            onClick={handleOAuth42}
            type="button"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.016 12.016 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            42 School
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500">
            By signing in, you agree to our terms and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
