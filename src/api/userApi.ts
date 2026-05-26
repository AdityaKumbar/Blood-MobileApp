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
  bloodGroup?: string;
}

interface UpdateCurrentUserPayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

function normalizeBloodGroup(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? (trimmed as AuthUser["bloodGroup"]) : undefined;
}

function buildProfileUpdatePayload(payload: UpdateCurrentUserPayload) {
  const body: UpdateCurrentUserPayload = {};

  const name = payload.name?.trim();
  const phone = payload.phone?.trim();
  const avatarUrl = payload.avatarUrl?.trim();

  if (name) body.name = name;
  if (phone) body.phone = phone;
  if (avatarUrl) body.avatarUrl = avatarUrl;

  return body;
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
    role: user.role,
    bloodGroup: normalizeBloodGroup(user.bloodGroup)
  };
}

export async function updateCurrentUser(payload: UpdateCurrentUserPayload) {
  const { data } = await apiClient.patch<ApiEnvelope<CurrentUserResponse>>(
    apiPaths.auth.profile,
    buildProfileUpdatePayload(payload)
  );
  return unwrapApiData(data);
}
