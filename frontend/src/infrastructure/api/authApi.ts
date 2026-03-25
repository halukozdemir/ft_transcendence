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

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    // Extract error message from Django response
    if (data.detail) throw new Error(data.detail);
    if (data.error) throw new Error(data.error);
    if (typeof data === 'object') {
      const errors = Object.entries(data)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');
      if (errors) throw new Error(errors);
    }
    throw new Error(`${res.status}: ${res.statusText}`);
  }
  return data;
}

// Register
export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Login
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
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
    return handleResponse(res);
  },

  // Refresh Token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    return handleResponse(res);
  },

  // OAuth 42 Redirect
  getOAuth42Url: (): string => `${API_BASE_URL}/oauth/42/`,
};
