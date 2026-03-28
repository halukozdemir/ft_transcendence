/**
 * Game Service API Client
 * REST endpoints for game management
 */

export interface GameRenderConfig {
  simulationFps: number;
  broadcastFps: number;
  viewport: {
    width: number;
    height: number;
  };
  render: {
    court: {
      width: number;
      height: number;
    };
  };
}

export interface MatchRecord {
  id: number;
  player1_id: number;
  player2_id: number;
  winner_id: number;
  score_p1: number;
  score_p2: number;
  duration_seconds: number;
  played_at: string;
}

export interface PlayerStats {
  user_id: number;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  ranking: number;
  elo_rating: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  avatar: string;
  elo_rating: number;
  tier: string;
  total_matches: number;
  wins: number;
}

export interface ActiveRoomEntry {
  id: string;
  title: string;
  host: string;
  currentPlayers: number;
  maxPlayers: number;
  isLocked: boolean;
  isFull: boolean;
  availableSlots: number;
  pingMs: number;
  health: "healthy" | "warning" | "offline";
  matchStatus: "waiting" | "in_progress" | "finished";
  teams: {
    red: number;
    blue: number;
  };
  minPlayersPerTeam: number;
  maxPlayersPerTeam: number;
  createdAt: number;
}

export interface ActiveRoomsResponse {
  rooms: ActiveRoomEntry[];
  totalRooms: number;
  totalPlayers: number;
  serverTimeMs: number;
}

export interface CreateActiveRoomPayload {
  title: string;
  maxPlayers: number;
  isLocked?: boolean;
  password?: string;
}

export interface CreateActiveRoomResponse {
  room: ActiveRoomEntry;
}

export interface ValidateRoomPasswordResponse {
  valid: boolean;
  requiresPassword: boolean;
}

const API_BASE_URL = "/api/game";
const AUTH_API_BASE = "/api/auth";

export const gameApi = {
  // Get game render configuration
  getRenderConfig: async (): Promise<GameRenderConfig> => {
    const res = await fetch(`${API_BASE_URL}/render-config/`);
    if (!res.ok) throw new Error(`Get render config failed: ${res.statusText}`);
    return res.json();
  },

  // Get player stats
  getPlayerStats: async (userId: number, accessToken: string): Promise<PlayerStats> => {
    const res = await fetch(`${API_BASE_URL}/stats/${userId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get stats failed: ${res.statusText}`);
    return res.json();
  },

  // Get match history
  getMatchHistory: async (userId: number, accessToken: string, limit = 20): Promise<MatchRecord[]> => {
    const res = await fetch(`${API_BASE_URL}/matches/?user_id=${userId}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Get match history failed: ${res.statusText}`);
    return res.json();
  },

  // Get leaderboard - from auth service
  getLeaderboard: async (limit = 50): Promise<LeaderboardEntry[]> => {
    const res = await fetch(`${AUTH_API_BASE}/leaderboard/?limit=${limit}`);
    if (!res.ok) throw new Error(`Get leaderboard failed: ${res.statusText}`);
    return res.json();
  },

  // Health check
  health: async (): Promise<{ status: string; service: string }> => {
    const res = await fetch(`${API_BASE_URL}/health/`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  // Get active rooms (live)
  getActiveRooms: async (): Promise<ActiveRoomsResponse> => {
    const res = await fetch(`${API_BASE_URL}/rooms/`);
    if (!res.ok) throw new Error(`Get rooms failed: ${res.statusText}`);
    return res.json();
  },

  createRoom: async (payload: CreateActiveRoomPayload): Promise<CreateActiveRoomResponse> => {
    const res = await fetch(`${API_BASE_URL}/rooms/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let message = `Create room failed: ${res.statusText}`;
      try {
        const data = await res.json();
        if (typeof data?.error === "string" && data.error.trim()) {
          message = data.error;
        }
      } catch {
        // keep fallback message
      }
      throw new Error(message);
    }
    return res.json();
  },

  validateRoomPassword: async (roomId: string, password: string): Promise<ValidateRoomPasswordResponse> => {
    const res = await fetch(`${API_BASE_URL}/rooms/${encodeURIComponent(roomId)}/validate-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error(`Validate room password failed: ${res.statusText}`);
    return res.json();
  },
};
