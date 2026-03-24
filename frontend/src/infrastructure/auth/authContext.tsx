import { createContext, useContext, useEffect, useState } from "react";
import type { UserProfile } from "../api/authApi";
import { authApi } from "../api/authApi";

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
  setTokensFromOAuth: (access: string, refresh: string) => Promise<void>;
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

  // Fetch user profile when token is available
  useEffect(() => {
    if (accessToken && !user) {
      (async () => {
        try {
          const profile = await authApi.getProfile(accessToken);
          setUser(profile);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch profile", err);
          // Try to refresh token
          if (refreshToken) {
            try {
              const { access } = await authApi.refreshToken(refreshToken);
              setAccessToken(access);
              localStorage.setItem("accessToken", access);
            } catch (refreshErr) {
              // Clear tokens if refresh fails
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      setAccessToken(response.tokens.access);
      setRefreshToken(response.tokens.refresh);
      localStorage.setItem("accessToken", response.tokens.access);
      localStorage.setItem("refreshToken", response.tokens.refresh);
      setUser(response.user as unknown as UserProfile);
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
      setUser(response.user as unknown as UserProfile);
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

  const setTokensFromOAuth = async (access: string, refresh: string) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    try {
      const profile = await authApi.getProfile(access);
      setUser(profile);
    } catch (err) {
      console.error("Failed to fetch profile after OAuth", err);
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
        setTokensFromOAuth,
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
