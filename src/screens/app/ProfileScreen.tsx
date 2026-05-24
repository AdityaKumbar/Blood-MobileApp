import { Text, View } from "react-native";

import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { Screen } from "../../components/ui/Screen";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logoutUser } from "../../redux/slices/authSlice";

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Screen>
      <Text className="text-2xl font-bold text-health-text">Profile</Text>
      <Text className="mt-1 text-sm text-health-muted">Your account and activity snapshot.</Text>

      <View className="mt-4 gap-3">
        <Card>
          <Text className="text-xs uppercase tracking-wide text-health-muted">Role</Text>
          <Text className="mt-1 text-base font-semibold text-health-text">{user?.role ?? "-"}</Text>
        </Card>
        <Card>
          <Text className="text-xs uppercase tracking-wide text-health-muted">Contact</Text>
          <Text className="mt-1 text-base text-health-text">
            {user?.email ?? user?.phone ?? "-"}
          </Text>
        </Card>
      </View>

      <View className="mt-auto">
        <AppButton label="Sign Out" variant="secondary" onPress={() => dispatch(logoutUser())} />
      </View>
    </Screen>
  );
}
