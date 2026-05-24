import "./global.css";
import "react-native-gesture-handler";

import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppRuntime } from "./src/app/AppRuntime";
import { AppRootNavigator } from "./src/navigation/AppRootNavigator";
import { store } from "./src/redux/store";
import { AppThemeProvider, useAppTheme } from "./src/theme";

function ThemedAppShell() {
  const { theme, mode } = useAppTheme();
  const baseTheme = mode === "dark" ? DarkTheme : DefaultTheme;
  const appTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <NavigationContainer theme={appTheme}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <AppRuntime />
        <AppRootNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <ThemedAppShell />
        </AppThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
