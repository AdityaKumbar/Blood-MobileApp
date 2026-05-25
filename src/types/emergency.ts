import type { BloodGroup } from "./auth";

export type EmergencyUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type EmergencyRequestStatus = "OPEN" | "IN_PROGRESS" | "FULFILLED" | "CANCELLED";
export type BackendEmergencyStatus =
  | "PENDING"
  | "APPROVED"
  | "FORWARDED_TO_APP"
  | "REJECTED"
  | "ASSIGNED"
  | "RESOLVED";

export interface EmergencyRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospital: string;
  urgency: EmergencyUrgency;
  oxygenNeeded: boolean;
  contactNumber: string;
  status: EmergencyRequestStatus;
  backendStatus: BackendEmergencyStatus;
  createdAt: string;
  updatedAt: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateEmergencyRequestPayload {
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospital: string;
  urgency: EmergencyUrgency;
  oxygenNeeded: boolean;
  contactNumber: string;
}

export interface EmergencyFeedResponse {
  requests: EmergencyRequest[];
}
