export type TeamColor = "red" | "blue";

export interface PlayerState {
  id:     string;
  name:   string;
  team:   TeamColor;
  x:      number;
  y:      number;
  ready?: boolean;
}

export interface BallState {
  x: number;
  y: number;
}

export interface ScoreState {
  red:  number;
  blue: number;
}

export interface LobbyPlayer {
  id: string;
  clientId: string;
  displayName?: string;
  team: TeamColor;
  ready: boolean;
}

export interface LobbyState {
  players: LobbyPlayer[];
  teamsEqual: boolean;
  allReady: boolean;
  canStart: boolean;
  readyCount: number;
  totalCount: number;
}

export interface MatchState {
  redTeamName:  string;
  blueTeamName: string;
  round:        number;
  timeLeft:     number; 
  status: "lobby" | "in_progress" | "finished";
  endReason: string | null;
  winnerTeam: TeamColor | null;
  loserTeam: TeamColor | null;
  forfeitTeam: TeamColor | null;
  disconnectedTeam: TeamColor | null;
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
  lobby:   LobbyState;
  room:    RoomState;
}
