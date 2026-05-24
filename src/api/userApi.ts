import { apiPaths } from "../constants/api";
import type { AuthUser } from "../types/auth";
import { apiClient } from "./client";
import { unwrapApiData, type ApiEnvelope } from "./response";

interface CurrentUserResponse {
  id: string;
  name: string;
  email?: string;
  role: AuthUser["role"];
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<ApiEnvelope<CurrentUserResponse>>(apiPaths.auth.profile);
  const user = unwrapApiData(data);
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    role: user.role
  };
}
