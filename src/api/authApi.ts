import { apiClient } from "./client";
import { apiPaths } from "../constants/api";
import { env } from "../constants/env";
import { unwrapApiData, type ApiEnvelope } from "./response";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterPayload
} from "../types/auth";

const DEMO_LOGIN_IDENTIFIER = "demo@bloodapp.com";
const DEMO_LOGIN_PHONE = "9999999999";
const DEMO_LOGIN_PASSWORD = "demo123";

function buildDemoAuthResponse(identifier: string): AuthResponse {
  const isEmail = identifier.includes("@");

  return {
    user: {
      id: "demo-user-1",
      fullName: "Demo User",
      email: isEmail ? identifier : DEMO_LOGIN_IDENTIFIER,
      phone: isEmail ? DEMO_LOGIN_PHONE : identifier,
      role: "DONOR"
    },
    tokens: {
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token"
    }
  };
}

function mapBackendAuthResponse(data: {
  user: { id: string; name: string; email?: string; role: AuthResponse["user"]["role"] };
  accessToken: string | null;
  refreshToken: string | null;
}): AuthResponse {
  return {
    user: {
      id: data.user.id,
      fullName: data.user.name,
      email: data.user.email,
      role: data.user.role
    },
    tokens: {
      accessToken: data.accessToken ?? "",
      refreshToken: data.refreshToken ?? undefined
    }
  };
}

type BackendAuthData = {
  user: { id: string; name: string; email?: string; role: AuthResponse["user"]["role"] };
  accessToken: string | null;
  refreshToken: string | null;
};

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (env.demoAuthMode) {
    const normalizedIdentifier = payload.identifier.trim().toLowerCase();
    const isValidIdentifier =
      normalizedIdentifier === DEMO_LOGIN_IDENTIFIER || normalizedIdentifier === DEMO_LOGIN_PHONE;
    const isValidPassword = payload.password === DEMO_LOGIN_PASSWORD;

    if (!isValidIdentifier || !isValidPassword) {
      throw new Error(
        "Invalid demo credentials. Use demo@bloodapp.com (or 9999999999) with password demo123."
      );
    }

    return buildDemoAuthResponse(normalizedIdentifier);
  }

  const { data } = await apiClient.post<ApiEnvelope<BackendAuthData>>(
    apiPaths.auth.login,
    {
      email: payload.identifier,
      password: payload.password
    }
  );
  return mapBackendAuthResponse(unwrapApiData(data));
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  if (env.demoAuthMode) {
    return {
      user: {
        id: `demo-${Date.now()}`,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        role: "DONOR"
      },
      tokens: {
        accessToken: "demo-access-token",
        refreshToken: "demo-refresh-token"
      }
    };
  }

  const { data } = await apiClient.post<ApiEnvelope<BackendAuthData>>(
    apiPaths.auth.register,
    {
      name: payload.fullName,
      email: payload.email,
      password: payload.password,
      role: "DONOR"
    }
  );
  return mapBackendAuthResponse(unwrapApiData(data));
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  if (env.demoAuthMode) {
    return {
      message: `Demo mode is active. Reset link skipped for ${payload.identifier}.`
    };
  }

  try {
    const { data } = await apiClient.post<ApiEnvelope<ForgotPasswordResponse>>(apiPaths.auth.forgotPassword, payload);
    return unwrapApiData(data);
  } catch {
    return {
      message: "Password reset is not configured in backend yet. Contact your administrator."
    };
  }
}
