import { apiPaths } from "../constants/api";
import type {
  CreateEmergencyRequestPayload,
  EmergencyRequestStatus
} from "../types/emergency";
import { apiClient } from "./client";
import { unwrapApiData, type ApiEnvelope } from "./response";
import { mapEmergencyItem, type BackendEmergencyRequest } from "./emergencyMappers";

interface BackendEmergencyListData {
  items: BackendEmergencyRequest[];
}

export async function createEmergencyRequest(payload: CreateEmergencyRequestPayload) {
  const { data } = await apiClient.post<ApiEnvelope<BackendEmergencyRequest>>(apiPaths.emergency.create, {
    patientName: payload.patientName,
    requestType: payload.oxygenNeeded ? "OXYGEN" : "BLOOD",
    unitsRequired: payload.unitsRequired,
    bloodGroup: payload.oxygenNeeded ? undefined : payload.bloodGroup,
    oxygenUnits: payload.oxygenNeeded ? payload.unitsRequired : undefined,
    hospital: payload.hospital,
    priority: payload.urgency,
    contactNumber: payload.contactNumber
  });
  return mapEmergencyItem(unwrapApiData(data));
}

export async function fetchEmergencyFeed() {
  const { data } = await apiClient.get<ApiEnvelope<BackendEmergencyListData>>(apiPaths.emergency.feed, {
    params: { forApp: true, limit: 50 }
  });
  return unwrapApiData(data).items.map(mapEmergencyItem);
}

export async function fetchEmergencyRequestById(requestId: string) {
  const feed = await fetchEmergencyFeed();
  const found = feed.find((item) => item.id === requestId);
  if (!found) {
    throw new Error("Emergency request not found");
  }
  return found;
}

export async function updateEmergencyRequestStatus(
  requestId: string,
  status: EmergencyRequestStatus
) {
  if (status !== "FULFILLED") {
    throw new Error("Backend currently supports only resolve operation from the app.");
  }
  const { data } = await apiClient.patch<ApiEnvelope<BackendEmergencyRequest>>(
    apiPaths.emergency.updateStatus(requestId)
  );
  return mapEmergencyItem(unwrapApiData(data));
}

export async function assignEmergencyRequestDonor(requestId: string, assignedDonor: string) {
  const { data } = await apiClient.patch<ApiEnvelope<BackendEmergencyRequest>>(
    apiPaths.emergency.assignDonor(requestId),
    { assignedDonor }
  );
  return mapEmergencyItem(unwrapApiData(data));
}
