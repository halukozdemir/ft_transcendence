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
  banner: string;
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
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!isJson) {
    if (!res.ok) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }
    return data;
  }

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

  // Update Profile
  updateProfile: async (accessToken: string, payload: { username?: string; avatar?: File; banner?: File }): Promise<UserProfile> => {
    if (payload.avatar) {
      const avatarFormData = new FormData();
      avatarFormData.append("avatar", payload.avatar);
      const avatarRes = await fetch(`${API_BASE_URL}/profile/avatar/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: avatarFormData,
      });
      await handleResponse(avatarRes);
    }

    if (payload.banner) {
      const bannerFormData = new FormData();
      bannerFormData.append("banner", payload.banner);
      const bannerRes = await fetch(`${API_BASE_URL}/profile/banner/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: bannerFormData,
      });
      await handleResponse(bannerRes);
    }

    if (payload.username) {
      const profileRes = await fetch(`${API_BASE_URL}/profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username: payload.username }),
      });
      return handleResponse(profileRes);
    }

    // Refresh and return the latest profile after avatar/banner-only updates
    const profileRes = await fetch(`${API_BASE_URL}/profile/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return handleResponse(profileRes);
  },

  // Change Password
  changePassword: async (accessToken: string, payload: { old_password: string; new_password: string; new_password2: string }): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/password/change/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Delete Account
  deleteAccount: async (accessToken: string, password: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/delete/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return handleResponse(res);
  },

  // Presence
  setPresence: async (accessToken: string, status: "online" | "offline"): Promise<void> => {
    await fetch(`${API_BASE_URL}/presence/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    });
  },

  // OAuth 42 Redirect
  getOAuth42Url: (): string => `${API_BASE_URL}/oauth/42/`,
};
