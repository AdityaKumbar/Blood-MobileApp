import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/ui/AppButton";
import { SearchFilters } from "../../components/search/SearchFilters";
import { Screen } from "../../components/ui/Screen";
import { SEARCH_ROUTES } from "../../navigation/constants";
import type { SearchStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { clearSearchError, fetchSearchResults, setSearchFilters } from "../../redux/slices/searchSlice";
import { InlineError } from "../../components/ui/InlineError";
import type { SearchFilters as SearchFiltersType } from "../../types/search";

type Props = SearchStackScreenProps<typeof SEARCH_ROUTES.SEARCH>;

export function SearchScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { filters, status, error } = useAppSelector((state) => state.search);

  const handleSearch = async () => {
    dispatch(clearSearchError());
    await dispatch(fetchSearchResults(filters));
    navigation.navigate(SEARCH_ROUTES.SEARCH_RESULTS, { query: filters.query || "all resources" });
  };

  const handleFilterChange = (next: SearchFiltersType) => {
    dispatch(setSearchFilters(next));
  };

  return (
    <Screen scrollable>
      <View className="rounded-3xl bg-health-surfaceSoft p-5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="search" size={18} color="#115E59" />
          <Text className="text-xs uppercase tracking-wide text-health-accentDark">Smart Finder</Text>
        </View>
        <Text className="mt-2 text-2xl font-bold text-health-text">Find donors and oxygen fast</Text>
        <Text className="mt-2 text-sm text-health-muted">
          Filter by type, group, city, and urgency to get actionable matches.
        </Text>
      </View>
      {error ? <InlineError message={error} /> : null}

      <View className="mt-4 rounded-3xl border border-health-border bg-health-surface p-4">
        <SearchFilters value={filters} onChange={handleFilterChange} />
      </View>

      <View className="mt-4 pb-24">
        <AppButton label="Search Now" loading={status === "loading"} onPress={() => void handleSearch()} />
      </View>
    </Screen>
  );
}
