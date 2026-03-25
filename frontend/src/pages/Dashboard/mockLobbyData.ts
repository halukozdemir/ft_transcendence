import type { Friend, PlayerProfile, Room } from "../../types/lobby";

export const profile: PlayerProfile = {
  nickname: "ProPlayer_99",
  level: 24,
  rankText: "Küresel Sıralama: #4,201",
  xpCurrent: 14250,
  xpGoal: 20000,
  wins: 150,
  losses: 45,
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD9SVkYpoFNO7yDa05rUKFjc1oo2Xf2AAvFTWqkXZgU7pZpCjH-kciBmRstG3eXD7QBK5lmtEFBuAgbHkF9RH_pfvkF521X5gLvLQq4aWu4cukssiNLi9FnYzhpheY9AP3XkykzYKTCcQaXhQxaZVM7LJsPGgdy5_4vMSwuB9MOo3I8-COyeKRDZtiAauxdN4shiGTrj8EROCcDjI2oLez42NsCFYZCrozKsQzE4LS3JXYwsw244WBAsTEKwyBozgWSaWdXTpV1Z8xd",
};

export const rooms: Room[] = [
  {
    id: "room-1",
    title: "[EU] PRO 3V3 - NO LAG",
    host: "CaptainKick",
    map: "Classic Map",
    currentPlayers: 4,
    maxPlayers: 6,
    pingMs: 18,
    isLocked: true,
    health: "healthy",
  },
  {
    id: "room-2",
    title: "Beginners Only | Fun Room",
    host: "ChillZone",
    map: "Big Map",
    currentPlayers: 2,
    maxPlayers: 10,
    pingMs: 32,
    health: "healthy",
  },
  {
    id: "room-3",
    title: "[NA] REAL PHYSICS 4V4",
    host: "Baller99",
    map: "Real Socc",
    currentPlayers: 7,
    maxPlayers: 8,
    pingMs: 84,
    health: "warning",
  },
  {
    id: "room-4",
    title: "1V1 RANKED ONLY",
    host: "TheWall",
    map: "Small Map",
    currentPlayers: 1,
    maxPlayers: 2,
    pingMs: 22,
    isVerified: true,
    health: "healthy",
  },
  {
    id: "room-5",
    title: "Tournament Finals Lobby",
    host: "Admin",
    map: "Classic",
    currentPlayers: 12,
    maxPlayers: 12,
    pingMs: 15,
    isLocked: true,
    health: "offline",
  },
];

export const friends: Friend[] = [
  {
    id: "friend-1",
    nickname: "SniperKing",
    status: "ingame",
    detail: "Oyunda",
    currentPlayers: 4,
    maxPlayers: 6,
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9RrPuOSBBqV0ic0GjUwOFRilSIEGbjNU6v2gGTw6T1B8nCQ8JWei2EvEilT9MurgCt7lNyeiJZ2c7BjEu-14pdqAGA7cuxNk5DSL1UYTXJNkx1zZtRcBPdfUghVby28xwg_6VlC9c9VLLAo3fkieCpJGphXQDu4fC-OJ3u0-HmOTwPLRSh0_uYrAzNKChNkA5w1R14naVjrCVy27zjGWtSxITUtIb9AdBNmhWkewfkHEvgLeaZqaLtxghZZwsYq7aRPe6g-LzO0gi",
  },
  {
    id: "friend-2",
    nickname: "GhostKeeper",
    status: "available",
    detail: "Müsait",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAWwOadiikk9zupJ8D0h4AH2tzfP1bNZ9YWC_ovCZd_PkIwXg08hZf5CHUHn7awYspCu90Q-s92gkVTo8Qno3vUZ5nyxTIirFAOVJOiGE7GJREbmXVIqPKAHm0mQww5tJlviMQFXSYBFGmI1DrooNhnjjIu9GzU7C5TeUUasIb3rIHOdEGkFXIbeKK0GPUiZO_awrggrxWHzPlfT9M0qeYSJ1-fvhh5lkzFGP4-SxveFQbO5-XMMxKPbesn5FmIyZcV3U3HZgBWudjj",
  },
  {
    id: "friend-3",
    nickname: "BallerKilla",
    status: "offline",
    detail: "Çevrimdışı",
    initials: "BK",
  },
];
