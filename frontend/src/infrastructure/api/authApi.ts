export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  password2: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar: string;
  online_status: boolean;
  friends: Array<{
    id: number;
    username: string;
    avatar: string;
    online_status: boolean;
  }>;
}

const API_BASE_URL = "/api/auth";

// Register
export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Register failed: ${res.statusText}`);
    return res.json();
  },

  // Login
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.statusText}`);
    return res.json();
  },

  // Logout
  logout: async (refreshToken: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },

  // Get Profile
  getProfile: async (accessToken: string): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE_URL}/profile/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get profile failed: ${res.statusText}`);
    return res.json();
  },

  // Refresh Token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) throw new Error(`Token refresh failed: ${res.statusText}`);
    return res.json();
  },

  // OAuth 42 Redirect
  getOAuth42Url: (): string => `${API_BASE_URL}/oauth/42/`,
};
