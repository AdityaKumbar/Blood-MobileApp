import type { EmergencyRequest, EmergencyRequestStatus } from "../types/emergency";

export interface BackendEmergencyRequest {
  _id: string;
  patientName: string;
  requestType: "BLOOD" | "OXYGEN";
  bloodGroup: EmergencyRequest["bloodGroup"] | null;
  oxygenUnits: number | null;
  unitsRequired?: number;
  hospital: string;
  priority: EmergencyRequest["urgency"];
  status: "PENDING" | "APPROVED" | "FORWARDED_TO_APP" | "REJECTED" | "ASSIGNED" | "RESOLVED";
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapBackendStatus(status: BackendEmergencyRequest["status"]): EmergencyRequestStatus {
  if (status === "RESOLVED") return "FULFILLED";
  if (status === "REJECTED") return "CANCELLED";
  if (status === "APPROVED" || status === "ASSIGNED" || status === "FORWARDED_TO_APP") return "IN_PROGRESS";
  return "OPEN";
}

export function mapEmergencyItem(item: BackendEmergencyRequest): EmergencyRequest {
  return {
    id: item._id,
    patientName: item.patientName,
    bloodGroup: item.bloodGroup ?? "O+",
    unitsRequired: item.unitsRequired ?? item.oxygenUnits ?? 1,
    hospital: item.hospital,
    urgency: item.priority,
    oxygenNeeded: item.requestType === "OXYGEN",
    contactNumber: item.contactNumber ?? "",
    status: mapBackendStatus(item.status),
    backendStatus: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}
