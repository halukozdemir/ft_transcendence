// ── Canvas ──────────────────────────────────────────────────────────────────
export const W = 1200;
export const H = 700;

// ── Field rect ───────────────────────────────────────────────────────────────
export const FX = 90;
export const FY = 92;   // scoreboard ends at ~80, 12px gap
export const FW = 1020;
export const FH = 572;  // H - FY - 36 bottom margin

// ── Goals ────────────────────────────────────────────────────────────────────
export const GW = 36;
export const GH = 168;
export const GY = FY + (FH - GH) / 2;

// ── Center ───────────────────────────────────────────────────────────────────
export const CX = W / 2;
export const CY = H / 2;
export const CR = 90; // center circle radius

// ── Physics ──────────────────────────────────────────────────────────────────
export const PLAYER_RADIUS = 22;
export const BALL_RADIUS   = 13;
