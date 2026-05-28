import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { Screen } from "../../components/ui/Screen";
import { HOME_ROUTES, TAB_ROUTES } from "../../navigation/constants";
import type { HomeStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchEmergencyFeed } from "../../redux/slices/emergencySlice";
import { NextEligibilityCard } from "../../components/donor/NextEligibilityCard";
import { fetchDonorProfile, fetchDonationHistory } from "../../redux/slices/donorSlice";
import { getEligibilityDisplay, resolveLastDonatedAt } from "../../utils/eligibility";

type Props = HomeStackScreenProps<typeof HOME_ROUTES.HOME>;

export function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const { feed, feedStatus } = useAppSelector((state) => state.emergency);
  const donor = useAppSelector((state) => state.donor);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  const urgentFeed = useMemo(() => feed.filter((item) => item.status !== "FULFILLED"), [feed]);

  const eligibilityDisplay = useMemo(() => {
    const lastDonatedAt = resolveLastDonatedAt(
      donor.lastDonatedAt,
      donor.history[0]?.donatedAt
    );
    return getEligibilityDisplay(donor.eligibility, lastDonatedAt);
  }, [donor.eligibility, donor.lastDonatedAt, donor.history]);

  const formatDistanceFromUser = (lat?: number | null, lng?: number | null) => {
    if (!userLocation?.coords || typeof lat !== "number" || typeof lng !== "number") {
      return "Distance unavailable";
    }
    const toRad = (v: number) => (v * Math.PI) / 180;
    const earthRadiusM = 6371000;
    const dLat = toRad(lat - userLocation.coords.latitude);
    const dLng = toRad(lng - userLocation.coords.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLocation.coords.latitude)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceM = earthRadiusM * c;
    if (distanceM < 1000) return `${Math.round(distanceM)} m away`;
    return `${(distanceM / 1000).toFixed(1)} km away`;
  };

  const requestsToShow = useMemo(() => {
    return urgentFeed.slice(0, 4).map((item) => {
      const isCritical = item.urgency === "CRITICAL" || item.urgency === "HIGH";
      return {
        id: item.id,
        hospital: item.hospital,
        patientLabel: item.isInventory
          ? "Inventory Stock"
          : `Patient: ${item.patientName || "Anonymous Patient"}`,
        bloodGroup: item.bloodGroup as any,
        stockStatus: item.isInventory ? "Inventory Request" : (isCritical ? "Critical Stock" : "Low Stock"),
        distance: formatDistanceFromUser(item.latitude, item.longitude),
        isCritical,
        liveItem: item as any
      };
    });
  }, [urgentFeed, userLocation]);

  useEffect(() => {
    void dispatch(fetchEmergencyFeed());
    void dispatch(fetchDonorProfile());
    void dispatch(fetchDonationHistory());
    void Location.requestForegroundPermissionsAsync().then((result) => {
      if (result.status === "granted") {
        void Location.getCurrentPositionAsync({}).then(setUserLocation).catch(() => {});
      }
    });
  }, [dispatch]);

  return (
    <Screen padded={false} scrollable={true}>
      <View className="px-4 pt-4 pb-24 gap-y-4 bg-health-bg">
        
        {/* Profile Card */}
        <View className="bg-white rounded-3xl p-4 border border-[#EAECEF] shadow-sm gap-y-4">
          <View className="flex-row items-center gap-x-3">
            <View className="w-12 h-12 rounded-full bg-[#ffdad6] items-center justify-center">
              <Ionicons name="person" size={22} color="#b7102a" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#001b3c]">
                {auth.user?.fullName ?? "Alex Rivera"}
              </Text>
              <Text className="text-[11px] font-semibold text-[#8f6f6e] tracking-wider mt-0.5">
                CERTIFIED DONOR
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between bg-[#F7F8FC] p-3 rounded-2xl">
            <Text className="text-sm font-medium text-[#001b3c]">
              Your Blood Type
            </Text>
            <View className="flex-row items-center bg-[#ffdad6] py-1.5 px-3 rounded-full border border-[#e4bebc]">
              <Ionicons name="water" size={14} color="#b7102a" style={{ marginRight: 4 }} />
              <Text className="text-sm font-bold text-[#b7102a]">
                {auth.user?.bloodGroup ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Lifetime Impact Card */}
        <View className="bg-[#b7102a] rounded-3xl p-5 shadow-md">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-white">
              Your Lifetime Impact
            </Text>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          </View>
          <Text className="text-[13px] text-white opacity-90 leading-relaxed mb-5">
            Your commitment to donating blood is saving lives. You are a community hero.
          </Text>
          <View className="items-center border-t border-white/20 pt-4">
            <Text className="text-2xl font-extrabold text-white">
              {donor.history.length}
            </Text>
            <Text className="text-xs text-white opacity-85 mt-0.5">
              Donations
            </Text>
          </View>
        </View>

        <NextEligibilityCard display={eligibilityDisplay} />

        {/* Urgent Requests Header */}
        <View className="flex-row items-center justify-between mt-3 mb-1">
          <View className="flex-row items-center">
            <Ionicons name="megaphone-outline" size={22} color="#b7102a" style={{ marginRight: 8 }} />
            <Text className="text-lg font-bold text-[#001b3c]">
              Urgent Requests
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate(TAB_ROUTES.EMERGENCY_TAB as any)}>
            <Text className="text-sm font-semibold text-[#b7102a]">
              See Map
            </Text>
          </Pressable>
        </View>

        {/* Loading Indicator */}
        {feedStatus === "loading" && urgentFeed.length === 0 ? (
          <View className="py-4 items-center">
            <ActivityIndicator color="#b7102a" />
            <Text className="text-xs text-[#5b403f] mt-2">Loading live requests...</Text>
          </View>
        ) : null}

        {feedStatus !== "loading" && requestsToShow.length === 0 ? (
          <View className="bg-white rounded-3xl p-5 border border-[#EAECEF] shadow-sm items-center">
            <Ionicons name="checkmark-circle-outline" size={22} color="#2b6485" />
            <Text className="text-sm font-semibold text-[#001b3c] mt-2">
              No live urgent requests right now
            </Text>
            <Text className="text-xs text-[#5b403f] mt-1 text-center">
              You are all caught up. Check again soon for new nearby requests.
            </Text>
          </View>
        ) : null}

        {/* Requests List */}
        {requestsToShow.map((item) => (
          <View
            key={item.id}
            className="bg-white rounded-3xl p-4 border border-[#EAECEF] shadow-sm border-l-4"
            style={{ borderLeftColor: item.isCritical ? "#b7102a" : "#2b6485" }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View
                className="flex-row items-center py-1 px-2 rounded-md border"
                style={{
                  backgroundColor: item.isCritical ? "#FFF0F0" : "#EBF3FC",
                  borderColor: item.isCritical ? "#FDCACA" : "#CBE2FB"
                }}
              >
                <Ionicons
                  name={item.isCritical ? "warning" : "water"}
                  size={12}
                  color={item.isCritical ? "#b7102a" : "#2b6485"}
                />
                <Text
                  className="text-[11px] font-semibold ml-1"
                  style={{ color: item.isCritical ? "#b7102a" : "#2b6485" }}
                >
                  {item.stockStatus}
                </Text>
              </View>
              <Text className="text-xs text-[#5b403f] font-medium">
                {item.distance}
              </Text>
            </View>

            <View className="flex-row items-center gap-x-3 mb-4">
              <View
                className="w-[46px] h-[46px] rounded-xl items-center justify-center"
                style={{ backgroundColor: item.isCritical ? "#FFF0F0" : "#EBF3FC" }}
              >
                <Text
                  className="text-lg font-extrabold"
                  style={{ color: item.isCritical ? "#b7102a" : "#2b6485" }}
                >
                  {item.bloodGroup}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-[#001b3c]">
                  {item.patientLabel}
                </Text>
                <Text className="text-xs text-[#5b403f] mt-0.5">
                  {item.hospital}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-x-2">
              <Pressable
                className="flex-1 h-10 bg-[#b7102a] rounded-xl flex-row items-center justify-center gap-x-1 active:opacity-90"
                onPress={() => {
                  navigation.navigate(HOME_ROUTES.HOME_DETAILS, { requestId: item.liveItem.id });
                }}
              >
                <Text className="color-white text-sm font-bold">Donate Now</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </Pressable>
              <Pressable
                className="w-10 h-10 rounded-xl border border-[#EAECEF] items-center justify-center bg-white active:bg-[#f7f8fc]"
                onPress={() => navigation.navigate(TAB_ROUTES.EMERGENCY_TAB as any)}
              >
                <Ionicons name="locate-outline" size={18} color="#2b6485" />
              </Pressable>
            </View>
          </View>
        ))}

        {/* Promo Banner Card */}
        <Pressable
          className="rounded-3xl p-5 bg-[#112233] h-[140px] justify-between shadow-sm mt-1 active:opacity-95"
          onPress={() => navigation.navigate(TAB_ROUTES.EMERGENCY_TAB as any)}
        >
          <View className="flex-row justify-end">
            <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
              <Ionicons name="location" size={16} color="#b7102a" />
            </View>
          </View>
          <View className="gap-y-1">
            <Text className="text-lg font-bold text-white">
              Find centers near you
            </Text>
            <Text className="text-[13px] text-white opacity-80">
              4 active locations within 10 miles
            </Text>
          </View>
        </Pressable>
        
      </View>
    </Screen>
  );
}

