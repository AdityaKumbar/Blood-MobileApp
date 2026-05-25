import type { bloodGroups } from "../constants/bloodGroups";

export type UserRole = "DONOR" | "HOSPITAL" | "BLOOD_BANK" | "OXYGEN_SUPPLIER" | "ADMIN" | "SUPER_ADMIN";
export type BloodGroup = (typeof bloodGroups)[number];

export interface AuthUser {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  bloodGroup?: BloodGroup;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  password: string;
}

export interface ForgotPasswordPayload {
  identifier: string;
}

export interface ForgotPasswordResponse {
  message: string;
}
