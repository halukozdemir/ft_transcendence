import { useEffect } from "react";
import { useNavigate } from "react-router";
import { dashboardThemeVars } from "../../constants/appColors";
import { useAuth } from "../../context/authContext";
import LoginRegisterForm from "../../components/auth/LoginRegisterForm";
const AuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0e11] to-[#151921] text-white" style={dashboardThemeVars}>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-white">Pingle</span>
              </h1>
            </div>
          </div>

          <LoginRegisterForm />

          <p className="text-center text-xs text-slate-500">
            By signing in, you agree to our terms of use and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
