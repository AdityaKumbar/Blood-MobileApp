import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";

import { darkTheme, lightTheme, type AppTheme, type ThemeMode } from "./theme";

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: "light"
});

export function AppThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === "dark" ? "dark" : "light";
  const theme = mode === "dark" ? darkTheme : lightTheme;
  const value = useMemo(() => ({ theme, mode }), [theme, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
