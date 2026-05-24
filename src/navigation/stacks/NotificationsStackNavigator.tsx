import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { NOTIFICATION_ROUTES } from "../constants";
import type { NotificationsStackParamList } from "../types";
import { NotificationDetailsScreen } from "../../screens/main/NotificationDetailsScreen";
import { NotificationsScreen } from "../../screens/main/NotificationsScreen";

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export function NotificationsStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={NOTIFICATION_ROUTES.NOTIFICATIONS}
      screenOptions={{ headerShadowVisible: false }}
    >
      <Stack.Screen
        name={NOTIFICATION_ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
      <Stack.Screen
        name={NOTIFICATION_ROUTES.NOTIFICATION_DETAILS}
        component={NotificationDetailsScreen}
        options={{ title: "Notification Details" }}
      />
    </Stack.Navigator>
  );
}
