import Constants from "expo-constants";
import { Platform } from "react-native";

declare const process: {
  env: Record<string, string | undefined>;
};

const FALLBACK_API_BASE = "http://localhost:5000/api";
const FALLBACK_SOCKET_URL = "http://localhost:5000";

function getExpoDevHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(":")[0]?.trim();
  return host || null;
}

function getPlatformLoopbackHost(): string {
  if (Platform.OS === "android") {
    // Android emulator cannot reach host machine via localhost.
    return "10.0.2.2";
  }
  return "localhost";
}

function resolveRuntimeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const isLoopbackHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (!isLoopbackHost) {
      return url;
    }

    const expoDevHost = getExpoDevHost();
    const runtimeHost = expoDevHost || getPlatformLoopbackHost();

    parsed.hostname = runtimeHost;
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

const apiBaseUrlFromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const socketUrlFromEnv = process.env.EXPO_PUBLIC_SOCKET_URL?.trim();
const demoAuthModeFromEnv = process.env.EXPO_PUBLIC_DEMO_AUTH?.trim().toLowerCase();

export const env = {
  apiBaseUrl: resolveRuntimeUrl(apiBaseUrlFromEnv || FALLBACK_API_BASE),
  socketUrl: resolveRuntimeUrl(socketUrlFromEnv || FALLBACK_SOCKET_URL),
  demoAuthMode: demoAuthModeFromEnv === "true"
};
