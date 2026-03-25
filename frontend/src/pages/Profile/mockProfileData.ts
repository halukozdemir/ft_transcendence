import type { Achievement, Match, PlayerStats } from "../../types/profile";

export const mockStats: PlayerStats = {
  totalMatches: 1248,
  winPercentage: 76,
  goalsScored: 3421,
  goalsPerGame: 2.7,
  offenseRating: 82,
  defenseRating: 68,
  weeklyMatches: 14,
};

export const mockAchievements: Achievement[] = [
  { id: "a1", type: "tournament", icon: "emoji_events", title: "Champion",     description: "Won a tournament"              },
  { id: "a2", type: "streak",     icon: "local_fire",  title: "On Fire",       description: "10 win streak"                  },
  { id: "a3", type: "verified",   icon: "verified",    title: "Verified Pro",  description: "Reached Pro rank"               },
  { id: "a4", type: "tournament", icon: "emoji_events", title: "Top Scorer",   description: "Most goals in a season"         },
  { id: "a5", type: "streak",     icon: "local_fire",  title: "Unstoppable",   description: "20 win streak"                  },
  { id: "a6", type: "special",    icon: "lock",        title: "???",           description: "Locked achievement", locked: true },
];

export const mockMatches: Match[] = [
  {
    id: "m1",
    roomName: "[EU] PRO 3V3 - NO LAG",
    result: "WIN",
    score: { us: 5, them: 2 },
    timestamp: new Date("2024-03-20T18:30:00"),
    timeAgoText: "2 saat önce",
  },
  {
    id: "m2",
    roomName: "1V1 RANKED ONLY",
    result: "WIN",
    score: { us: 3, them: 1 },
    timestamp: new Date("2024-03-20T16:00:00"),
    timeAgoText: "5 saat önce",
  },
  {
    id: "m3",
    roomName: "Beginners Only | Fun Room",
    result: "LOSS",
    score: { us: 1, them: 4 },
    timestamp: new Date("2024-03-19T21:00:00"),
    timeAgoText: "Dün",
  },
  {
    id: "m4",
    roomName: "[EU] PRO 3V3 - NO LAG",
    result: "WIN",
    score: { us: 6, them: 3 },
    timestamp: new Date("2024-03-19T18:00:00"),
    timeAgoText: "Dün",
  },
  {
    id: "m5",
    roomName: "[NA] REAL PHYSICS 4V4",
    result: "DRAW",
    score: { us: 2, them: 2 },
    timestamp: new Date("2024-03-18T20:00:00"),
    timeAgoText: "2 gün önce",
  },
];
