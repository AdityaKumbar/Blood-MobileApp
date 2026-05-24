import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HOME_ROUTES } from "../constants";
import type { HomeStackParamList } from "../types";
import { HomeDetailsScreen } from "../../screens/main/HomeDetailsScreen";
import { HomeScreen } from "../../screens/main/HomeScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={HOME_ROUTES.HOME}
      screenOptions={{ headerShadowVisible: false }}
    >
      <Stack.Screen name={HOME_ROUTES.HOME} component={HomeScreen} options={{ title: "Home" }} />
      <Stack.Screen
        name={HOME_ROUTES.HOME_DETAILS}
        component={HomeDetailsScreen}
        options={{ title: "Home Details" }}
      />
    </Stack.Navigator>
  );
}
