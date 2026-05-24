import { apiClient } from "./client";
import { apiPaths } from "../constants/api";
import type { SearchFilters, SearchResultItem } from "../types/search";
import { unwrapApiData, type ApiEnvelope } from "./response";

interface SearchResourcesResponse {
  results: SearchResultItem[];
}

export async function searchResources(filters: SearchFilters) {
  const { data } = await apiClient.get<ApiEnvelope<SearchResourcesResponse>>(apiPaths.search.resources, {
    params: {
      query: filters.query,
      bloodGroup: filters.bloodGroup,
      availability: filters.availability,
      includeBlood: filters.includeBlood,
      includeOxygen: filters.includeOxygen,
      includeHospitals: filters.includeHospitals
    }
  });
  return unwrapApiData(data).results;
}
