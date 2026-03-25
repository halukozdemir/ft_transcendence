export type RoomHealth = "healthy" | "warning" | "offline";

export interface Room {
  id: string;
  title: string;
  host: string;
  map: string;
  currentPlayers: number;
  maxPlayers: number;
  pingMs: number;
  isLocked?: boolean;
  isVerified?: boolean;
  health: RoomHealth;
}

export type FriendStatus = "ingame" | "available" | "offline";

export interface Friend {
  id: string;
  nickname: string;
  status: FriendStatus;
  detail: string;
  initials?: string;
  avatarUrl?: string;
  currentPlayers?: number;
  maxPlayers?: number;
}

export interface PlayerProfile {
  nickname: string;
  level: number;
  rankText: string;
  xpCurrent: number;
  xpGoal: number;
  wins: number;
  losses: number;
  avatarUrl: string;
}
