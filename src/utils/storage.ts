import AsyncStorage from "@react-native-async-storage/async-storage";

import { storageKeys } from "../constants/storageKeys";
import type { AuthTokens, AuthUser } from "../types/auth";

export async function persistAuthSession(payload: { tokens: AuthTokens; user: AuthUser }) {
  const { tokens, user } = payload;

  await AsyncStorage.multiSet([
    [storageKeys.accessToken, tokens.accessToken],
    [storageKeys.refreshToken, tokens.refreshToken ?? ""],
    [storageKeys.user, JSON.stringify(user)]
  ]);
}

export async function getPersistedAuthSession() {
  const entries = await AsyncStorage.multiGet([
    storageKeys.accessToken,
    storageKeys.refreshToken,
    storageKeys.user
  ]);
  const entryMap = Object.fromEntries(entries);
  const accessToken = entryMap[storageKeys.accessToken];
  const refreshToken = entryMap[storageKeys.refreshToken];
  const userJson = entryMap[storageKeys.user];

  if (!accessToken || !userJson) {
    return null;
  }

  const user = JSON.parse(userJson) as AuthUser;

  return {
    tokens: {
      accessToken,
      refreshToken: refreshToken || undefined
    },
    user
  };
}

export async function clearPersistedAuthSession() {
  await AsyncStorage.multiRemove([
    storageKeys.accessToken,
    storageKeys.refreshToken,
    storageKeys.user
  ]);
}
