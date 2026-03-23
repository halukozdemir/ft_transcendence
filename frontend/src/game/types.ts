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
}

export interface GameState {
  players: PlayerState[];
  ball:    BallState;
  score:   ScoreState;
  match:   MatchState;
}
