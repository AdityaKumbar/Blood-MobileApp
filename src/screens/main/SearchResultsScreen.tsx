import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

import { SearchResultCard } from "../../components/search/SearchResultCard";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { Screen } from "../../components/ui/Screen";
import { SEARCH_ROUTES } from "../../navigation/constants";
import type { SearchStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchSearchResults } from "../../redux/slices/searchSlice";

type Props = SearchStackScreenProps<typeof SEARCH_ROUTES.SEARCH_RESULTS>;

export function SearchResultsScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const { results, filters, status, error } = useAppSelector((state) => state.search);

  return (
    <Screen>
      <Text className="text-2xl font-bold text-health-text">Results</Text>
      <Text className="mt-1 text-sm text-health-muted">
        Showing matches for: {route.params.query}
      </Text>
      {error ? <InlineError message={error} /> : null}

      {status === "loading" && results.length === 0 ? (
        <View className="mt-4 items-center">
          <ActivityIndicator color="#DC2626" />
          <Text className="mt-2 text-xs text-health-muted">Searching availability...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          className="mt-4"
          contentContainerClassName="pb-8"
          ItemSeparatorComponent={() => <View className="h-3" />}
          refreshControl={
            <RefreshControl
              refreshing={status === "loading"}
              onRefresh={() => {
                void dispatch(fetchSearchResults(filters));
              }}
            />
          }
          ListEmptyComponent={
            <Card>
              <Text className="text-sm text-health-muted">
                No matching providers found. Try changing blood group or availability filters.
              </Text>
            </Card>
          }
          renderItem={({ item }) => <SearchResultCard item={item} />}
        />
      )}
    </Screen>
  );
}
