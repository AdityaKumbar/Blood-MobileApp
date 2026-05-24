import { useEffect } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import {
  AvailabilityCard,
  DonationTimelineCard,
  DonorRegistrationCard,
  EligibilityCard
} from "../../components/donor/DonorCards";
import { InlineError } from "../../components/ui/InlineError";
import { Screen } from "../../components/ui/Screen";
import { PROFILE_ROUTES } from "../../navigation/constants";
import type { ProfileStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logoutUser } from "../../redux/slices/authSlice";
import {
  clearDonorError,
  fetchDonationHistory,
  fetchDonorProfile,
  registerDonor,
  updateDonorAvailability
} from "../../redux/slices/donorSlice";

type Props = ProfileStackScreenProps<typeof PROFILE_ROUTES.PROFILE>;

export function ProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const profileInfo = useAppSelector((state) => state.profileSettings.profileInfo);
  const donor = useAppSelector((state) => state.donor);
  const initials = (profileInfo.fullName || user?.fullName || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    void dispatch(fetchDonorProfile());
    void dispatch(fetchDonationHistory());
  }, [dispatch]);

  const handleRegisterDonor = async () => {
    dispatch(clearDonorError());
    await dispatch(
      registerDonor({
        bloodGroup: "O+",
        city: "Pune"
      })
    );
  };

  const handleToggleAvailability = async (next: boolean) => {
    dispatch(clearDonorError());
    await dispatch(updateDonorAvailability(next));
  };

  return (
    <Screen scrollable>
      <View className="pb-8">
        <View className="rounded-3xl bg-health-surface p-5">
          <Text className="text-2xl font-bold text-health-text">Profile</Text>
          <Text className="mt-1 text-sm text-health-muted">Account and donor preferences.</Text>
        </View>
        {donor.error ? <InlineError message={donor.error} /> : null}

        <View className="mt-4 gap-3">
          <Card className="items-center rounded-3xl">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-health-surfaceSoft">
              <Text className="text-xl font-bold text-health-accentDark">{initials || "U"}</Text>
            </View>
            <Text className="mt-3 text-lg font-semibold text-health-text">
              {profileInfo.fullName || user?.fullName || "User"}
            </Text>
            <Text className="mt-1 text-sm text-health-muted">
              {profileInfo.phone || user?.phone || user?.email || "-"}
            </Text>
            <View className="mt-4 w-full rounded-2xl bg-health-surfaceSoft p-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="shield-checkmark-outline" size={16} color="#115E59" />
                <Text className="text-xs uppercase tracking-wide text-health-accentDark">Role</Text>
              </View>
              <Text className="mt-1 text-base font-semibold text-health-text">{user?.role ?? "-"}</Text>
            </View>
          </Card>

          <DonorRegistrationCard
            isRegistered={donor.isRegistered}
            loading={donor.registerStatus === "loading"}
            onRegister={() => void handleRegisterDonor()}
          />
          <AvailabilityCard
            isAvailable={donor.isAvailable}
            loading={donor.availabilityStatus === "loading"}
            onToggle={(next) => void handleToggleAvailability(next)}
          />
          <EligibilityCard eligibility={donor.eligibility} />
          <DonationTimelineCard
            history={donor.history}
            loading={donor.historyStatus === "loading" || donor.profileStatus === "loading"}
          />
        </View>

        <View className="mt-4 gap-3">
          <AppButton
            label="Edit Profile"
            variant="secondary"
            onPress={() => navigation.navigate(PROFILE_ROUTES.EDIT_PROFILE)}
          />
          <AppButton
            label="Settings"
            variant="secondary"
            onPress={() => navigation.navigate(PROFILE_ROUTES.SETTINGS)}
          />
          <AppButton label="Sign Out" onPress={() => dispatch(logoutUser())} />
        </View>
      </View>
    </Screen>
  );
}
