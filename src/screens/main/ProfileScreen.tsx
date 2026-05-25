import { useEffect } from "react";
import { Text, View, Image, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppBrand } from "../../components/branding/AppBrand";
import { Screen } from "../../components/ui/Screen";
import { PROFILE_ROUTES } from "../../navigation/constants";
import type { ProfileStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { logoutUser } from "../../redux/slices/authSlice";
import { fetchDonationHistory, fetchDonorProfile } from "../../redux/slices/donorSlice";
import { formatDonationType } from "../../utils/donation";

type Props = ProfileStackScreenProps<typeof PROFILE_ROUTES.PROFILE>;

export function ProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const profileInfo = useAppSelector((state) => state.profileSettings.profileInfo);
  const donor = useAppSelector((state) => state.donor);

  useEffect(() => {
    void dispatch(fetchDonorProfile());
    void dispatch(fetchDonationHistory());
  }, [dispatch]);

  const historyToRender = donor.history.map((item, idx) => ({
    id: item.id,
    location: item.location,
    type: formatDonationType(item.donationType, item.units),
    date: new Date(item.donatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    isRed: idx % 2 === 0,
  }));

  const totalDonations = donor.history.length;
  const hasHistory = totalDonations > 0;
  const isHistoryLoading = donor.historyStatus === "loading";

  return (
    <Screen padded={false}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-[#eaecef]">
        <AppBrand />
        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => dispatch(logoutUser())}>
            <Ionicons name="log-out-outline" size={24} color="#001b3c" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate(PROFILE_ROUTES.SETTINGS)}>
            <Ionicons name="notifications-outline" size={24} color="#001b3c" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-health-bg"
        contentContainerClassName="px-5 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View className="bg-white rounded-3xl border border-[#eaecef] p-6 items-center shadow-sm">
          {/* Avatar Container */}
          <View className="relative w-24 h-24 items-center justify-center">
            <Image
              source={profileInfo.avatarUri ? { uri: profileInfo.avatarUri } : require("../../assets/dummy_avatar.png")}
              className="w-24 h-24 rounded-full border-2 border-white shadow-md"
              resizeMode="cover"
            />
            {/* Blood Type Badge Overlay */}
            <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 border-2 border-white items-center justify-center shadow-sm">
              <Text className="text-white text-xs font-bold">
                {user?.bloodGroup ?? "—"}
              </Text>
            </View>
          </View>

          {/* Name & Details */}
          <Text className="mt-4 text-2xl font-bold text-health-text text-center">
            {profileInfo.fullName || user?.fullName || "Donor User"}
          </Text>
          <Text className="mt-1 text-sm text-health-muted text-center font-medium">
            {user?.role === "DONOR" ? "Silver Tier Donor" : "Silver Tier Donor"} • Member since Jan 2022
          </Text>

          {/* Donations Count Badge */}
          <View className="mt-3 bg-[#a3d8fe]/30 px-5 py-1.5 rounded-full">
            <Text className="text-[#005fa2] text-xs font-bold tracking-wide">
              {totalDonations} Donations
            </Text>
          </View>
        </View>

        {/* Donation History Section */}
        <Text className="mt-6 text-xl font-bold text-health-text">
          Donation History
        </Text>

        {isHistoryLoading ? (
          <Text className="mt-4 text-sm text-health-muted">Loading donation history...</Text>
        ) : null}

        {!isHistoryLoading && !hasHistory ? (
          <View className="mt-4 bg-white border border-[#eaecef] rounded-2xl p-6 items-center">
            <Ionicons name="water-outline" size={32} color="#9ca3af" />
            <Text className="mt-3 text-sm text-health-muted text-center">
              No donation till now.
            </Text>
          </View>
        ) : null}

        {!isHistoryLoading && hasHistory ? (
          <View className="mt-4 relative pl-1">
            <View className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-health-border/40" />

            {historyToRender.map((item) => (
              <View key={item.id} className="flex-row items-center mb-4">
                <View
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-10 ${
                    item.isRed ? "bg-brand-600" : "bg-[#2b6485]"
                  }`}
                >
                  <Ionicons name="water" size={16} color="white" />
                </View>

                <View className="flex-1 ml-4 bg-white border border-[#eaecef] rounded-2xl p-4 shadow-xs">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-health-text font-bold text-sm flex-1 mr-2" numberOfLines={1}>
                      {item.location}
                    </Text>
                    <View className="bg-[#EBF3FC] px-2 py-1 rounded-md">
                      <Text className="text-[#2b6485] font-bold text-[10px]">
                        {item.date}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-health-muted text-xs mt-1">
                    {item.type}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Action Buttons */}
        <View className="mt-4 gap-3">

          <Pressable
            className="h-13 bg-white border border-health-border rounded-2xl flex-row items-center justify-center gap-2 active:opacity-80"
            onPress={() => navigation.navigate(PROFILE_ROUTES.EDIT_PROFILE)}
          >
            <Ionicons name="create-outline" size={18} color="#b7102a" />
            <Text className="text-brand-600 text-sm font-bold">
              Edit Profile
            </Text>
          </Pressable>

          <Pressable
            className="flex-row items-center justify-center gap-2 mt-4 py-2 active:opacity-80"
            onPress={() => dispatch(logoutUser())}
          >
            <Ionicons name="log-out-outline" size={20} color="#b7102a" />
            <Text className="text-brand-600 text-base font-bold">
              Logout
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
