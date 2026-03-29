import { createContext, useContext, useEffect, useState } from "react";
import type { UserProfile } from "../services/authApi";
import { authApi } from "../services/authApi";

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, password2: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem("accessToken");
  });
  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem("refreshToken");
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (!accessToken) return;
    const profile = await authApi.getProfile(accessToken);
    setUser(profile);
    setError(null);
  };

  
  useEffect(() => {
    if (accessToken && !user) {
      (async () => {
        try {
          await refreshProfile();
        } catch (err) {
          console.error("Failed to fetch profile", err);
          
          if (refreshToken) {
            try {
              const { access } = await authApi.refreshToken(refreshToken);
              setAccessToken(access);
              localStorage.setItem("accessToken", access);
            } catch (refreshErr) {
              
              setAccessToken(null);
              setRefreshToken(null);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            }
          }
        }
      })();
    }
  }, [accessToken, user, refreshToken]);

  
  useEffect(() => {
    if (!accessToken || !user) return;

    authApi.setPresence(accessToken, "online");
    const heartbeat = setInterval(() => {
      authApi.setPresence(accessToken, "online");
    }, 3000);

    
    const profilePoll = setInterval(() => {
      refreshProfile();
    }, 10000);

    return () => {
      clearInterval(heartbeat);
      clearInterval(profilePoll);
    };
  }, [accessToken, user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      setAccessToken(response.tokens.access);
      setRefreshToken(response.tokens.refresh);
      localStorage.setItem("accessToken", response.tokens.access);
      localStorage.setItem("refreshToken", response.tokens.refresh);
      const profile = await authApi.getProfile(response.tokens.access);
      setUser(profile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string, password2: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register({ email, username, password, password2 });
      setAccessToken(response.tokens.access);
      setRefreshToken(response.tokens.refresh);
      localStorage.setItem("accessToken", response.tokens.access);
      localStorage.setItem("refreshToken", response.tokens.refresh);
      const profile = await authApi.getProfile(response.tokens.access);
      setUser(profile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Registration failed";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken && !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
