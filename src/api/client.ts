import { create, type AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import { env } from "../constants/env";
import { notifyApiNetworkError } from "../services/apiBridge";

let inMemoryAccessToken: string | null = null;

export function setAuthHeaderToken(accessToken: string | null) {
  inMemoryAccessToken = accessToken;
}

export function clearAuthHeaderToken() {
  inMemoryAccessToken = null;
}

export const apiClient = create({
  baseURL: env.apiBaseUrl,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = config as InternalAxiosRequestConfig;
  const headers = (nextConfig.headers ?? {}) as AxiosHeaders & Record<string, string>;

  if (inMemoryAccessToken) {
    headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  } else if ("Authorization" in headers) {
    delete headers.Authorization;
  }

  headers.Accept = "application/json";
  nextConfig.headers = headers;

  return nextConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      notifyApiNetworkError();
    }
    return Promise.reject(error);
  }
);
