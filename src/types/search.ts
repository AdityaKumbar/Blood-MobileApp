import type { BloodGroup } from "./auth";

export type SearchResourceType = "blood" | "oxygen" | "hospital";
export type AvailabilityFilter = "all" | "available_now" | "limited" | "unavailable";

export interface SearchFilters {
  query: string;
  bloodGroup: BloodGroup | "ALL";
  availability: AvailabilityFilter;
  includeBlood: boolean;
  includeOxygen: boolean;
  includeHospitals: boolean;
}

export interface SearchResultItem {
  id: string;
  type: SearchResourceType;
  name: string;
  location: string;
  availabilityLabel: string;
  bloodGroups?: BloodGroup[];
  oxygenUnits?: number;
  distanceKm?: number;
  phone?: string;
  latitude?: number;
  longitude?: number;
}
