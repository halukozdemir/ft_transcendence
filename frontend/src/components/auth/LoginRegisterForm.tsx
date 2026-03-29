import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router";
type FormMode = "login" | "register";

const LoginRegisterForm = () => {
  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [localError, setLocalError] = useState("");

  const { login, register, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  const displayError = localError || authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    try {
      if (mode === "login") {
        if (!email || !password) {
          setLocalError("Email and password are required");
          return;
        }
        await login(email, password);
        navigate("/");
      } else {
        if (!email || !username || !password || !password2) {
          setLocalError("All fields are required");
          return;
        }
        if (password !== password2) {
          setLocalError("Passwords do not match");
          return;
        }
        await register(email, username, password, password2);
        navigate("/");
      }
    } catch (err) {
      
    }
  };

  return (
    <div className="w-full max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        
        <div className="flex gap-2 rounded-lg border border-white/10 p-1">
          <button
            className={`flex-1 rounded py-2 text-sm font-semibold cursor-pointer transition-colors ${
              mode === "login"
                ? "bg-[var(--dashboard-primary)] text-white"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => {
              setMode("login");
              setLocalError("");
            }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`flex-1 rounded py-2 text-sm font-semibold cursor-pointer transition-colors ${
              mode === "register"
                ? "bg-[var(--dashboard-primary)] text-white"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => {
              setMode("register");
              setLocalError("");
            }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        
        {displayError && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm text-red-300">
            {displayError}
          </div>
        )}

        
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            Email
          </label>
          <input
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--dashboard-primary)] focus:ring-1 focus:ring-[var(--dashboard-primary)]/50"
            autoComplete={mode === "login" ? "username" : "email"}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </div>

        
        {mode === "register" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
              Username
            </label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--dashboard-primary)] focus:ring-1 focus:ring-[var(--dashboard-primary)]/50"
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              type="text"
              value={username}
            />
          </div>
        )}

        
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            Password
          </label>
          <input
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--dashboard-primary)] focus:ring-1 focus:ring-[var(--dashboard-primary)]/50"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            value={password}
          />
        </div>

        
        {mode === "register" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--dashboard-primary)] focus:ring-1 focus:ring-[var(--dashboard-primary)]/50"
              autoComplete="new-password"
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="••••••••"
              type="password"
              value={password2}
            />
          </div>
        )}

        
        <button
          className="w-full rounded-lg bg-[var(--dashboard-primary)] hover:bg-[var(--dashboard-primary)]/90 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--dashboard-primary)]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default LoginRegisterForm;
