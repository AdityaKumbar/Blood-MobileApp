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
  isInventory?: boolean;
  createdBy?: {
    _id?: string;
    name?: string;
    phone?: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
  } | null;
}

type HospitalPreset = {
  keywords: string[];
  latitude: number;
  longitude: number;
  address: string;
};

const HOSPITAL_PRESETS: HospitalPreset[] = [
  {
    keywords: ["venugram"],
    latitude: 15.825873,
    longitude: 74.497471,
    address: "3rd gate Congress road"
  },
  {
    keywords: ["kle"],
    latitude: 15.887074,
    longitude: 74.519596,
    address: "KLE Hospital, Belagavi"
  },
  {
    keywords: ["lifestream", "system admin"],
    latitude: 15.8352169,
    longitude: 74.5067137,
    address: "Belagavi, India"
  }
];

function resolveHospitalPreset(hospitalName: string | null | undefined) {
  const name = (hospitalName ?? "").toLowerCase();
  if (!name) return null;
  return (
    HOSPITAL_PRESETS.find((preset) => preset.keywords.some((keyword) => name.includes(keyword))) ??
    null
  );
}

export function mapBackendStatus(status: BackendEmergencyRequest["status"]): EmergencyRequestStatus {
  if (status === "RESOLVED") return "FULFILLED";
  if (status === "REJECTED") return "CANCELLED";
  if (status === "APPROVED" || status === "ASSIGNED" || status === "FORWARDED_TO_APP") return "IN_PROGRESS";
  return "OPEN";
}

export function mapEmergencyItem(item: BackendEmergencyRequest): EmergencyRequest {
  const preset = resolveHospitalPreset(item.hospital);
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
    updatedAt: item.updatedAt,
    latitude: preset?.latitude ?? item.createdBy?.latitude ?? null,
    longitude: preset?.longitude ?? item.createdBy?.longitude ?? null,
    address: preset?.address ?? item.createdBy?.address ?? null,
    isInventory: !!item.isInventory
  };
}
