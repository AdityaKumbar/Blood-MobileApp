import { useEffect, useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View, Alert, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { Screen } from "../../components/ui/Screen";
import { Card } from "../../components/ui/Card";
import { HOME_ROUTES } from "../../navigation/constants";
import type { HomeStackScreenProps } from "../../navigation/types";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { acceptEmergencyDonation, fetchEmergencyFeed } from "../../redux/slices/emergencySlice";

type Props = HomeStackScreenProps<typeof HOME_ROUTES.HOME_DETAILS>;

export function HomeDetailsScreen({ route, navigation }: Props) {
  const feed = useAppSelector((state) => state.emergency.feed);
  const request = useMemo(
    () => feed.find((item) => item.id === route.params.requestId) ?? null,
    [feed, route.params.requestId]
  );

  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const handleDonateNow = async () => {
    if (!request) return;

    if (request.id.startsWith("mock")) {
      Alert.alert(
        "Donation Accepted! 🩸",
        "Thank you! Your commitment to donate has been registered on this demo request. The hospital profile and administrator dashboard have been updated.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }

    try {
      await dispatch(acceptEmergencyDonation({
        requestId: request.id,
        donorName: auth.user?.fullName || "Alex Rivera"
      })).unwrap();

      Alert.alert(
        "Donation Accepted! 🩸",
        "Your commitment to donate has been registered. The hospital profile and administrator dashboard have been updated in real-time.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      
      void dispatch(fetchEmergencyFeed());
    } catch (err: any) {
      Alert.alert("Unable to Register Donation", err || "Please try again later.");
    }
  };

  const handleOpenDirections = () => {
    if (!request) return;
    const lat = request.latitude || 15.8497;
    const lng = request.longitude || 74.4977;
    const label = encodeURIComponent(request.hospital || "Hospital");
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    });
    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    });
  };

  // Hide the default React Navigation header so we can draw our high-fidelity pixel-perfect header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <Screen padded={false} scrollable={false}>
      {/* Custom Mockup Header Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-[#eaecef] h-16">
        <Pressable 
          className="flex-row items-center active:opacity-75"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#b7102a" />
          <Text className="text-[#b7102a] text-lg font-bold ml-1.5">
            Request Details
          </Text>
        </Pressable>
        <Pressable className="p-1 active:opacity-75">
          <Ionicons name="notifications" size={24} color="#b7102a" />
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1 bg-health-bg" 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-y-4">
          
          {/* Urgency Badge */}
          <View className="bg-[#b7102a] rounded-3xl p-4 flex-row items-center justify-center gap-x-2 shadow-sm">
            <Ionicons name="warning" size={18} color="#fff" />
            <Text className="text-white text-sm font-extrabold tracking-wider uppercase">
              URGENT - {request?.oxygenNeeded ? "Oxygen Flasks" : (request?.bloodGroup ?? "O+") + " Blood"} Needed
            </Text>
          </View>

          {/* Hospital Contact Card */}
          <View className="bg-white rounded-3xl p-4 border border-[#EAECEF] flex-row items-center justify-between shadow-sm">
            <View className="flex-1 gap-y-1">
              <Text className="text-lg font-extrabold text-[#001b3c] leading-tight">
                {request?.hospital ?? "City Hospital"}
              </Text>
              <Text className="text-xs text-[#5b403f] font-semibold">
                Active Request • Available 24/7
              </Text>
              <View className="flex-row items-start gap-x-1.5 mt-1.5">
                <Ionicons name="location-outline" size={14} color="#5b403f" style={{ marginTop: 2 }} />
                <Text className="text-xs text-[#8f6f6e] flex-1 leading-relaxed">
                  {request?.address ?? "450 Medical Center Drive, West District, Metro City 10293"}
                </Text>
              </View>
            </View>
            <Pressable 
              onPress={() => {
                if (request?.contactNumber) {
                  Linking.openURL(`tel:${request.contactNumber}`).catch(() => {
                    Alert.alert("Error", "Could not initiate call to " + request.contactNumber);
                  });
                } else {
                  Alert.alert("Info", "No phone number available for this hospital request.");
                }
              }}
              className="w-11 h-11 rounded-full bg-[#d2ebfc] items-center justify-center ml-3 active:opacity-85"
            >
              <Ionicons name="call" size={18} color="#005fa2" />
            </Pressable>
          </View>

          {/* Case Context Card */}
          <View className="bg-[#F0F3FF] rounded-3xl p-4 gap-y-1.5">
            <Text className="text-[10px] font-extrabold text-[#5b403f] tracking-widest uppercase">
              Case Context
            </Text>
            <Text className="text-sm text-[#001b3c] leading-relaxed">
              {request?.patientName 
                ? `Emergency ${request.oxygenNeeded ? "Oxygen Setup" : "Surgery"} - A patient named ${request.patientName} requires urgent ${request.oxygenNeeded ? `${request.unitsRequired} Liters of Oxygen` : `${request.bloodGroup} Blood`} for a critical medical procedure.` 
                : `Emergency Procedure - A patient requires ${request?.oxygenNeeded ? "Oxygen cylinders" : "Blood transfusion"} at the earliest.`}
            </Text>
          </View>

          {/* Inventory Status Card */}
          <View className="bg-[#ffdad6] rounded-3xl p-4 gap-y-2.5">
            <Text className="text-[10px] font-extrabold text-[#b7102a] tracking-widest uppercase">
              Inventory Status
            </Text>
            <View className="flex-row items-center gap-x-1.5">
              <Ionicons name="alert-circle" size={18} color="#b7102a" />
              <Text className="text-sm font-extrabold text-[#b7102a]">
                {request?.status === "FULFILLED" ? "Donation Complete" : "Critical Shortage"}
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View className="h-[6px] bg-[#b7102a]/10 rounded-full overflow-hidden">
              <View className="h-full bg-[#b7102a] rounded-full" style={{ width: request?.status === "FULFILLED" ? "100%" : "25%", backgroundColor: request?.status === "FULFILLED" ? "#2e7d32" : "#b7102a" }} />
            </View>
            
            <Text className="text-xs text-[#b7102a] font-semibold" style={{ color: request?.status === "FULFILLED" ? "#2e7d32" : "#b7102a" }}>
              {request?.status === "FULFILLED" ? "All requested units successfully donated!" : "Only 1 unit remaining in stock. Urgent donors needed!"}
            </Text>
          </View>

          {/* Real Map Visual */}
          <View className="h-[180px] rounded-3xl overflow-hidden border border-[#EAECEF]">
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ width: "100%", height: "100%" }}
              initialRegion={{
                latitude: request?.latitude || 15.8497,
                longitude: request?.longitude || 74.4977,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015
              }}
            >
              <Marker
                coordinate={{
                  latitude: request?.latitude || 15.8497,
                  longitude: request?.longitude || 74.4977
                }}
                title={request?.hospital || "Hospital"}
                description={request?.address || "Belagavi, India"}
                pinColor="#b7102a"
              />
            </MapView>
          </View>

          {/* Actions Section */}
          <View className="gap-y-3 mt-1">
            <Pressable 
              className="h-12 rounded-2xl flex-row items-center justify-center gap-x-2 active:opacity-90 shadow-sm"
              style={{
                backgroundColor: request?.status === "FULFILLED" ? "#8f6f6e" : "#b7102a",
                opacity: request?.status === "FULFILLED" ? 0.7 : 1,
                shadowColor: "#b7102a",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2
              }}
              disabled={request?.status === "FULFILLED"}
              onPress={handleDonateNow}
            >
              <Ionicons name="heart" size={18} color="#fff" />
              <Text className="text-white text-base font-bold">
                {request?.status === "FULFILLED" ? "Donation Fulfilled" : "Donate Now"}
              </Text>
            </Pressable>
            
            <Pressable 
              className="h-12 bg-[#EBF3FC] border border-[#CBE2FB] rounded-2xl items-center justify-center active:opacity-90"
              onPress={handleOpenDirections}
            >
              <Text className="text-[#2b6485] text-base font-bold">
                Get Directions
              </Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </Screen>
  );
}
