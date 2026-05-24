import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { EMERGENCY_ROUTES } from "../constants";
import type { EmergencyStackParamList } from "../types";
import { EmergencyDetailsScreen } from "../../screens/main/EmergencyDetailsScreen";
import { EmergencyScreen } from "../../screens/main/EmergencyScreen";

const Stack = createNativeStackNavigator<EmergencyStackParamList>();

export function EmergencyStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={EMERGENCY_ROUTES.EMERGENCY}
      screenOptions={{ headerShadowVisible: false }}
    >
      <Stack.Screen
        name={EMERGENCY_ROUTES.EMERGENCY}
        component={EmergencyScreen}
        options={{ title: "Emergency" }}
      />
      <Stack.Screen
        name={EMERGENCY_ROUTES.EMERGENCY_DETAILS}
        component={EmergencyDetailsScreen}
        options={{ title: "Emergency Details" }}
      />
    </Stack.Navigator>
  );
}
