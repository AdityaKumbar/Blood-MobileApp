import { apiClient } from "./client";
import { apiPaths } from "../constants/api";
import type { DonorProfile, DonationHistoryItem, RegisterDonorPayload } from "../types/donor";
import { unwrapApiData, type ApiEnvelope } from "./response";

export async function fetchDonorProfile() {
  const { data } = await apiClient.get<ApiEnvelope<DonorProfile>>(apiPaths.donor.profile);
  return unwrapApiData(data);
}

export async function registerAsDonor(payload: RegisterDonorPayload) {
  const { data } = await apiClient.post<ApiEnvelope<DonorProfile>>(apiPaths.donor.register, payload);
  return unwrapApiData(data);
}

export async function updateDonorAvailability(isAvailable: boolean) {
  const { data } = await apiClient.patch<ApiEnvelope<DonorProfile>>(apiPaths.donor.availability, { isAvailable });
  return unwrapApiData(data);
}

export async function fetchDonationHistory() {
  const { data } = await apiClient.get<ApiEnvelope<DonationHistoryItem[]>>(apiPaths.donor.history);
  return unwrapApiData(data);
}
