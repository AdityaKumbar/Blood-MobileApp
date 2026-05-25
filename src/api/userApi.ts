import { apiPaths } from "../constants/api";
import type { AuthUser } from "../types/auth";
import { apiClient } from "./client";
import { unwrapApiData, type ApiEnvelope } from "./response";

interface CurrentUserResponse {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role: AuthUser["role"];
}

interface UpdateCurrentUserPayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<ApiEnvelope<CurrentUserResponse>>(apiPaths.auth.profile);
  const user = unwrapApiData(data);
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role
  };
}

export async function updateCurrentUser(payload: UpdateCurrentUserPayload) {
  const { data } = await apiClient.patch<ApiEnvelope<CurrentUserResponse>>(apiPaths.auth.profile, payload);
  const user = unwrapApiData(data);
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    role: user.role
  };
}
