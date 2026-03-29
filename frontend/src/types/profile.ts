export type RankTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
export type AchievementType = "tournament" | "streak" | "verified" | "special";

export interface PlayerStats {
  totalMatches: number;
  winPercentage: number;
  xp?: number;
  level?: number;
  xpInLevel?: number;
  xpGoal?: number;
  goalsScored: number;
  goalsPerGame: number;
  offenseRating: number;
  defenseRating: number;
  weeklyMatches: number;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  icon: string;
  title: string;
  description: string;
  unlockedAt?: Date;
  locked?: boolean;
}

export interface Match {
  id: string;
  roomName: string;
  result: "WIN" | "LOSS" | "DRAW";
  score: { us: number; them: number };
  timestamp: Date;
  timeAgoText: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  tier: RankTier;
  tierName: string;
  country: string;
  countryCode: string;
  avatarUrl: string;
  bannerUrl: string;
  isOnline: boolean;
  isPro: boolean;
  stats: PlayerStats;
  achievements: Achievement[];
  recentMatches: Match[];
  joinDate: Date;
}
