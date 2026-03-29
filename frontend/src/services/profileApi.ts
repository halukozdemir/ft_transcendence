/**
 * Profile & Social API Client
 * Extended endpoints for profile, friends, blocking, and statistics
 */

export interface Friend {
  id: number;
  username: string;
  avatar: string;
  online_status: boolean;
  is_friend?: boolean;
}

export interface BlockedUser {
  id: number;
  username: string;
  email: string;
}

export interface ProfileStats {
  user_id: number;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  xp: number;
  level: number;
  ranking: number;
  achievements: Achievement[];
  last_match_date: string | null;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  unlocked_at: string;
}

export interface MatchHistory {
  id: number;
  opponent_id: number;
  opponent_name: string;
  opponent_avatar: string;
  result: 'win' | 'loss' | 'draw';
  my_score: number;
  opponent_score: number;
  played_at: string;
  duration_seconds: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar: string;
  online_status: boolean;
  bio?: string;
  created_at: string;
  stats?: ProfileStats;
  friends?: Friend[];
  blocked_count?: number;
}

const API_BASE_URL = "/api/auth";

export const profileApi = {
  // Get all users (for friends discovery)
  getAllUsers: async (accessToken: string, search?: string, limit?: number): Promise<Friend[]> => {
    let url = `${API_BASE_URL}/users/`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (limit) params.append("limit", limit.toString());
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get all users failed: ${res.statusText}`);
    return res.json();
  },

  // Get user profile (same as authApi, but included here for convenience)
  getProfile: async (accessToken: string): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE_URL}/profile/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get profile failed: ${res.statusText}`);
    return res.json();
  },

  // Get user by ID (public profile)
  getUserPublic: async (userId: number): Promise<Partial<UserProfile>> => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/`);
    if (!res.ok) throw new Error(`Get user failed: ${res.statusText}`);
    return res.json();
  },

  // Update profile
  updateProfile: async (
    accessToken: string,
    data: { username?: string; bio?: string }
  ): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE_URL}/profile/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Update profile failed: ${res.statusText}`);
    return res.json();
  },

  // Get user statistics
  getStats: async (userId: number, accessToken: string): Promise<ProfileStats> => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/stats/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get stats failed: ${res.statusText}`);
    return res.json();
  },

  // Get match history
  getMatchHistory: async (
    userId: number,
    accessToken: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ results: MatchHistory[]; total: number }> => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/matches/?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get match history failed: ${res.statusText}`);
    return res.json();
  },

  // Get achievements
  getAchievements: async (userId: number, accessToken: string): Promise<Achievement[]> => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/achievements/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get achievements failed: ${res.statusText}`);
    return res.json();
  },

  // Get friends list
  getFriends: async (accessToken: string): Promise<Friend[]> => {
    const res = await fetch(`${API_BASE_URL}/friends/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get friends failed: ${res.statusText}`);
    return res.json();
  },

  // Get friend requests
  getFriendRequests: async (accessToken: string): Promise<Friend[]> => {
    const res = await fetch(`${API_BASE_URL}/friends/requests/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get friend requests failed: ${res.statusText}`);
    return res.json();
  },

  // Send friend request
  sendFriendRequest: async (targetUserId: number, accessToken: string): Promise<{ sent: boolean }> => {
    const res = await fetch(`${API_BASE_URL}/friends/add/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: targetUserId }),
    });
    if (!res.ok) throw new Error(`Send friend request failed: ${res.statusText}`);
    return res.json();
  },

  // Accept friend request
  acceptFriendRequest: async (friendUserId: number, accessToken: string): Promise<{ accepted: boolean }> => {
    const res = await fetch(`${API_BASE_URL}/friends/accept/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: friendUserId }),
    });
    if (!res.ok) throw new Error(`Accept friend request failed: ${res.statusText}`);
    return res.json();
  },

  // Remove friend
  removeFriend: async (friendUserId: number, accessToken: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/friends/${friendUserId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) throw new Error(`Remove friend failed: ${res.statusText}`);
  },

  // Block user
  blockUser: async (userId: number, accessToken: string): Promise<{ blocked: boolean }> => {
    const res = await fetch(`${API_BASE_URL}/users/block/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error(`Block user failed: ${res.statusText}`);
    return res.json();
  },

  // Unblock user
  unblockUser: async (userId: number, accessToken: string): Promise<{ unblocked: boolean }> => {
    const res = await fetch(`${API_BASE_URL}/users/unblock/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) throw new Error(`Unblock user failed: ${res.statusText}`);
    return res.json();
  },

  // Get blocked users
  getBlockedUsers: async (accessToken: string): Promise<BlockedUser[]> => {
    const res = await fetch(`${API_BASE_URL}/users/blocked/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get blocked users failed: ${res.statusText}`);
    return res.json();
  },
};
