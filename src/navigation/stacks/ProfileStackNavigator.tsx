import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { PROFILE_ROUTES } from "../constants";
import type { ProfileStackParamList } from "../types";
import { EditProfileScreen } from "../../screens/main/EditProfileScreen";
import { ProfileScreen } from "../../screens/main/ProfileScreen";
import { SettingsScreen } from "../../screens/main/SettingsScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={PROFILE_ROUTES.PROFILE}
      screenOptions={{ headerShadowVisible: false }}
    >
      <Stack.Screen
        name={PROFILE_ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name={PROFILE_ROUTES.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name={PROFILE_ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Stack.Navigator>
  );
}
