export type ThemeMode = "light" | "dark";

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    primary: string;
    background: string;
    surface: string;
    surfaceSoft: string;
    text: string;
    mutedText: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    white: string;
    black: string;
  };
}

export const lightTheme: AppTheme = {
  mode: "light",
  colors: {
    primary: "#E11D48",
    background: "#ECEFF3",
    surface: "#FFFFFF",
    surfaceSoft: "#F8FAFC",
    text: "#0F172A",
    mutedText: "#475569",
    border: "#DCE2EA",
    accent: "#E11D48",
    success: "#059669",
    warning: "#EA580C",
    danger: "#E11D48",
    white: "#FFFFFF",
    black: "#000000"
  }
};

export const darkTheme: AppTheme = {
  mode: "dark",
  colors: {
    primary: "#F87171",
    background: "#0B1220",
    surface: "#111B2E",
    surfaceSoft: "#1A2A44",
    text: "#E5EDF8",
    mutedText: "#9AB0CC",
    border: "#263855",
    accent: "#2DD4BF",
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F87171",
    white: "#FFFFFF",
    black: "#000000"
  }
};
