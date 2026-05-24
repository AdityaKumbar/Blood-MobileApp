import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { SEARCH_ROUTES } from "../constants";
import type { SearchStackParamList } from "../types";
import { SearchResultsScreen } from "../../screens/main/SearchResultsScreen";
import { SearchScreen } from "../../screens/main/SearchScreen";

const Stack = createNativeStackNavigator<SearchStackParamList>();

export function SearchStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={SEARCH_ROUTES.SEARCH}
      screenOptions={{ headerShadowVisible: false }}
    >
      <Stack.Screen
        name={SEARCH_ROUTES.SEARCH}
        component={SearchScreen}
        options={{ title: "Search" }}
      />
      <Stack.Screen
        name={SEARCH_ROUTES.SEARCH_RESULTS}
        component={SearchResultsScreen}
        options={{ title: "Search Results" }}
      />
    </Stack.Navigator>
  );
}
