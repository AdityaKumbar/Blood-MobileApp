import type { AvailabilityFilter, SearchFilters } from "../types/search";

export const availabilityFilters: AvailabilityFilter[] = [
  "all",
  "available_now",
  "limited",
  "unavailable"
];

export const defaultSearchFilters: SearchFilters = {
  query: "",
  bloodGroup: "ALL",
  availability: "all",
  includeBlood: true,
  includeOxygen: true,
  includeHospitals: true
};
