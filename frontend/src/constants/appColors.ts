import type { CSSProperties } from "react";
export const appColors = {
  primary: "#5a5af6",
  backgroundDark: "#0e0e0e",
  cardDark: "#181818",
  borderMuted: "#272727",
  textMuted: "#94a3b8",
  success: "#22c55e",
  warning: "#facc15",
  danger: "#ef4444",
} as const;

export const dashboardThemeVars: CSSProperties = {
  "--dashboard-primary": appColors.primary,
  "--dashboard-bg": appColors.backgroundDark,
  "--dashboard-card": appColors.cardDark,
  "--dashboard-border": appColors.borderMuted,
  "--dashboard-muted": appColors.textMuted,
} as CSSProperties;
