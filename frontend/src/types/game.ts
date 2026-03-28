export type TeamColor = "red" | "blue";

export interface PlayerState {
  id:     string;
  name:   string;
  team:   TeamColor;
  x:      number;
  y:      number;
}

export interface BallState {
  x: number;
  y: number;
}

export interface ScoreState {
  red:  number;
  blue: number;
}

export interface MatchState {
  redTeamName:  string;
  blueTeamName: string;
  round:        number;
  timeLeft:     number; // seconds
  status: "waiting" | "in_progress" | "finished";
  endReason: string | null;
  winnerTeam: TeamColor | null;
  loserTeam: TeamColor | null;
  forfeitTeam: TeamColor | null;
  disconnectedTeam: TeamColor | null;
  rematch: {
    acceptedCount: number;
    requiredCount: number;
    requestedPlayerIds: string[];
    timeoutRemainingSeconds: number | null;
  };
}

export interface RoomState {
  id: string | null;
  playerCount: number;
  maxPlayers: number;
  availableSlots: number;
  isFull: boolean;
  teams: {
    red: number;
    blue: number;
  };
  minPlayersPerTeam: number;
  maxPlayersPerTeam: number;
}

export interface GameState {
  players: PlayerState[];
  ball:    BallState;
  score:   ScoreState;
  match:   MatchState;
  room:    RoomState;
}
