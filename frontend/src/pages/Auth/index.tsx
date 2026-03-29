import { useEffect } from "react";
import { useNavigate } from "react-router";
import { dashboardThemeVars } from "../../constants/appColors";
import { useAuth } from "../../context/authContext";
import LoginRegisterForm from "../../components/auth/LoginRegisterForm";

const AuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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
            <p className="text-slate-400">En iyi rekabetçi oyun platformu</p>
          </div>

          {/* Forms */}
          <LoginRegisterForm />

          {/* Footer */}
          <p className="text-center text-xs text-slate-500">
            Giriş yaparak kullanım koşullarımızı ve gizlilik politikamızı kabul etmiş olursunuz
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
