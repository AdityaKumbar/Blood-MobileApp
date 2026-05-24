import type { EmergencyRequestStatus, EmergencyUrgency } from "../types/emergency";

export const emergencyUrgencies: EmergencyUrgency[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const emergencyStatuses: EmergencyRequestStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "FULFILLED",
  "CANCELLED"
];
