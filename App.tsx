import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState, useRef } from "react";
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View, Platform, Linking, RefreshControl } from "react-native";
import { Provider } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

import { store } from "./src/redux/store";
import { useAppDispatch, useAppSelector } from "./src/redux/hooks";
import { bootstrapAuth, loginUser, logoutUser, registerUser } from "./src/redux/slices/authSlice";
import { acceptEmergencyDonation, createEmergencyRequest, fetchEmergencyDetails, fetchEmergencyFeed } from "./src/redux/slices/emergencySlice";
import { AppBrand } from "./src/components/branding/AppBrand";
import { fetchDonorProfile, fetchDonationHistory } from "./src/redux/slices/donorSlice";
import { NextEligibilityCard } from "./src/components/donor/NextEligibilityCard";
import { formatDonationType } from "./src/utils/donation";
import { getEligibilityDisplay, resolveLastDonatedAt } from "./src/utils/eligibility";
import { fetchNotifications } from "./src/redux/slices/notificationSlice";
import { setProfileInfo } from "./src/redux/slices/profileSettingsSlice";
import { searchResources } from "./src/api/searchApi";
import { fetchMyEmergencyRequests } from "./src/api/emergencyApi";

type Route = "login" | "signup" | "dashboard" | "map" | "requestDetails" | "requests" | "history" | "profile" | "notifications" | "editProfile";

const c = {
  bg: "#f7f8fc",
  surface: "#ffffff",
  primary: "#b7102a",
  secondary: "#2b6485",
  secondaryContainer: "#a3d8fe",
  text: "#001b3c",
  muted: "#5b403f",
  outline: "#8f6f6e",
  outlineVariant: "#e4bebc",
  low: "#f0f3ff",
  error: "#ffdad6"
};

const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

function AppContent() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const emergency = useAppSelector((s) => s.emergency);
  const donor = useAppSelector((s) => s.donor);
  const notifications = useAppSelector((s) => s.notifications);
  const profileSettings = useAppSelector((s) => s.profileSettings);

  const [route, setRoute] = useState<Route>("login");
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);

  // States for Verified Requests tab
  const [reqSearchQuery, setReqSearchQuery] = useState("");
  const [reqFilterType, setReqFilterType] = useState<"all" | "blood" | "oxygen">("all");
  const [reqFilterUrgency, setReqFilterUrgency] = useState<"all" | "critical">("all");
  const [reqFilterStatus, setReqFilterStatus] = useState<"all" | "active" | "resolved">("all");

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState<string>("O+");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatarUri, setEditAvatarUri] = useState("");

  // Live map & user location states and ref
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedHospitalMarker, setSelectedHospitalMarker] = useState<any | null>(null);
  const [mapFilter, setMapFilter] = useState<"all" | "blood" | "oxygen">("all");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("All");
  const [quickRequestType, setQuickRequestType] = useState<"blood" | "oxygen">("blood");
  const [quickHospitalOpen, setQuickHospitalOpen] = useState(false);
  const [quickHospital, setQuickHospital] = useState("KLE Hospital");
  const [approvedHospitals, setApprovedHospitals] = useState<string[]>([]);
  const [myImmediateRequests, setMyImmediateRequests] = useState<any[]>([]);

  const requestLocationPermission = async (shouldCenter = false) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission is off. Please allow location access to show nearby requests.");
        if (shouldCenter) {
          mapRef.current?.animateToRegion({
            latitude: 15.8497,
            longitude: 74.4977,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 800);
        }
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc);
      setLocationError(null);

      if (shouldCenter || !userLocation) {
        mapRef.current?.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }, 800);
      }
    } catch (err) {
      console.error("Error getting location:", err);
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("location services") || message.includes("unavailable")) {
        setLocationError("Location services are turned off. Turn on GPS/location services and try again.");
      } else {
        setLocationError("Unable to fetch your current location right now. Please try again.");
      }
      if (shouldCenter) {
        mapRef.current?.animateToRegion({
          latitude: 15.8497,
          longitude: 74.4977,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (route === "map" || route === "dashboard") {
      dispatch(fetchEmergencyFeed());
    }
    if (route === "map") {
      requestLocationPermission();
    }
  }, [route, dispatch]);

  // Smoothly animate map camera when selected hospital marker changes
  useEffect(() => {
    if (route === "map" && selectedHospitalMarker?.latitude && selectedHospitalMarker?.longitude) {
      const timer = setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: selectedHospitalMarker.latitude,
          longitude: selectedHospitalMarker.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015
        }, 800);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedHospitalMarker, route]);

  const formatDistanceFromUser = (lat?: number | null, lng?: number | null) => {
    if (!userLocation?.coords || typeof lat !== "number" || typeof lng !== "number") {
      return "📍 Turn on location to see distance";
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

  const urgentFeed = useMemo(() => emergency.feed.filter((item) => item.status !== "FULFILLED"), [emergency.feed]);

  // Combined verified requests from live feed
  const allRequestsList = useMemo(() => {
    const REAL_HOSPITAL_LOCATIONS = [
      { latitude: 15.887074, longitude: 74.519596, name: "KLE Hospital" }, // KLE Hospital
      { latitude: 15.825873, longitude: 74.497471, name: "Venugram Hospital" } // Venugram Hospital
    ];

    const getRealCoordinates = (hospitalName: string, createdLat: any, createdLng: any, idx: number) => {
      let lat = createdLat != null ? Number(createdLat) : null;
      let lng = createdLng != null ? Number(createdLng) : null;
      // If valid coordinates exist in database, always use them
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }

      // Fall back to known hospital locations
      const name = (hospitalName || "").toLowerCase();
      if (name.includes("kle")) {
        return { latitude: 15.887074, longitude: 74.519596 }; // KLE Hospital
      }
      if (name.includes("venugram")) {
        return { latitude: 15.825873, longitude: 74.497471 }; // Venugram Hospital
      }

      // Default fallback to first hospital in list
      return { latitude: REAL_HOSPITAL_LOCATIONS[0].latitude, longitude: REAL_HOSPITAL_LOCATIONS[0].longitude };
    };

    const getHospitalAddress = (dbAddress?: string | null) => {
      // Only use database address - no hardcoded fallbacks
      if (dbAddress && dbAddress.trim().length > 0) {
        return dbAddress.trim();
      }
      return "";
    };

    const live = emergency.feed.map((item, idx) => {
      const coords = getRealCoordinates(item.hospital, item.latitude, item.longitude, idx);
      const address = getHospitalAddress(item.address);

      return {
        id: item.id,
        patientName: item.patientName || "Anonymous Patient",
        bloodGroup: (item.bloodGroup || "O+") as any,
        unitsRequired: item.unitsRequired || 1,
        hospital: item.hospital || "City Hospital",
        urgency: (item.urgency || "MEDIUM") as any,
        oxygenNeeded: !!item.oxygenNeeded,
        contactNumber: item.contactNumber || "",
        status: (item.status || "OPEN") as any,
        backendStatus: (item.backendStatus || "FORWARDED_TO_APP") as any,
        createdAt: item.createdAt || new Date().toISOString(),
        distance: formatDistanceFromUser(coords.latitude, coords.longitude),
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: address,
        liveItem: item as any
      };
    });

    return live;
  }, [emergency.feed]);

  const filteredMapRequests = useMemo(() => {
    return allRequestsList.filter((item) => {
      // 1. Hide resolved/fulfilled/completed requests
      if (item.status === "FULFILLED" || item.backendStatus === "RESOLVED") return false;

      // 2. Main type filters (Blood / Oxygen)
      if (mapFilter === "blood" && item.oxygenNeeded) return false;
      if (mapFilter === "oxygen" && !item.oxygenNeeded) return false;

      // 3. Specific Blood Group filter (only applicable when Blood or All is active)
      if ((mapFilter === "all" || mapFilter === "blood") && selectedBloodGroup !== "All") {
        if (item.oxygenNeeded || item.bloodGroup !== selectedBloodGroup) {
          return false;
        }
      }

      // 4. Coordinates check
      return !!item.latitude && !!item.longitude;
    });
  }, [allRequestsList, mapFilter, selectedBloodGroup]);

  const mapMarkerGroups = useMemo(() => {
    const urgencyRank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const groups = new Map<string, typeof filteredMapRequests>();

    for (const item of filteredMapRequests) {
      const lat = item.latitude!;
      const lng = item.longitude!;
      const key = `${lat.toFixed(5)}|${lng.toFixed(5)}`;
      const bucket = groups.get(key) ?? [];
      bucket.push(item);
      groups.set(key, bucket);
    }

    return Array.from(groups.entries()).map(([key, items]) => {
      const sorted = [...items].sort(
        (a, b) => (urgencyRank[a.urgency] ?? 9) - (urgencyRank[b.urgency] ?? 9)
      );
      const representative = sorted[0];
      return {
        key,
        latitude: representative.latitude!,
        longitude: representative.longitude!,
        hospital: representative.hospital,
        bloodGroup: representative.bloodGroup,
        oxygenNeeded: representative.oxygenNeeded,
        urgency: representative.urgency,
        activeCount: items.length,
        clusterItems: sorted,
        representative,
      };
    });
  }, [filteredMapRequests]);

  const selectedEmergency = useMemo(() => {
    return allRequestsList.find((x) => x.id === selectedEmergencyId) ?? emergency.selectedRequest ?? null;
  }, [allRequestsList, selectedEmergencyId, emergency.selectedRequest]);

  const filteredRequests = useMemo(() => {
    return allRequestsList.filter((item) => {
      // 1. Search Query filter
      if (reqSearchQuery.trim()) {
        const query = reqSearchQuery.toLowerCase();
        const matchesHospital = item.hospital.toLowerCase().includes(query);
        const matchesPatient = item.patientName.toLowerCase().includes(query);
        const matchesBlood = item.bloodGroup.toLowerCase().includes(query);
        if (!matchesHospital && !matchesPatient && !matchesBlood) {
          return false;
        }
      }

      // 2. Type filter
      if (reqFilterType === "blood" && item.oxygenNeeded) return false;
      if (reqFilterType === "oxygen" && !item.oxygenNeeded) return false;

      // 3. Urgency filter
      if (reqFilterUrgency === "critical" && item.urgency !== "CRITICAL") return false;

      // 4. Status filter
      if (reqFilterStatus === "active" && (item.status === "FULFILLED" || item.status === "CANCELLED")) return false;
      if (reqFilterStatus === "resolved" && item.status !== "FULFILLED") return false;

      return true;
    });
  }, [allRequestsList, reqSearchQuery, reqFilterType, reqFilterUrgency, reqFilterStatus]);

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
        stockStatus: isCritical ? "Critical Stock" : "Low Stock",
        distance: formatDistanceFromUser(item.latitude, item.longitude),
        isCritical,
        liveItem: item as any
      };
    });
  }, [urgentFeed, userLocation]);

  const quickHospitalOptions = useMemo(() => {
    return approvedHospitals;
  }, [approvedHospitals]);

  useEffect(() => {
    if (quickHospitalOptions.length > 0 && !quickHospitalOptions.includes(quickHospital)) {
      setQuickHospital(quickHospitalOptions[0]);
    }
  }, [quickHospitalOptions, quickHospital]);

  const eligibilityDisplay = useMemo(() => {
    const lastDonatedAt = resolveLastDonatedAt(donor.lastDonatedAt, donor.history[0]?.donatedAt);
    return getEligibilityDisplay(donor.eligibility, lastDonatedAt);
  }, [donor.eligibility, donor.lastDonatedAt, donor.history]);

  const historyToRenderInApp = useMemo(
    () =>
      donor.history.map((item, idx) => ({
        id: item.id,
        location: item.location,
        type: formatDonationType(item.donationType, item.units),
        date: new Date(item.donatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        isRed: idx % 2 === 0,
      })),
    [donor.history]
  );

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    if (auth.status === "authenticated") {
      dispatch(fetchEmergencyFeed());
      dispatch(fetchDonorProfile());
      dispatch(fetchDonationHistory());
      dispatch(fetchNotifications());
      if (route === "login" || route === "signup") setRoute("dashboard");
    } else if (auth.status === "unauthenticated") {
      setRoute("login");
    }
  }, [auth.status, dispatch]);

  useEffect(() => {
    let isMounted = true;
    const loadApprovedHospitals = async () => {
      if (auth.status !== "authenticated") {
        if (isMounted) setApprovedHospitals([]);
        return;
      }
      try {
        const results = await searchResources({
          query: "",
          bloodGroup: "ALL",
          availability: "all",
          includeBlood: false,
          includeOxygen: false,
          includeHospitals: true
        });
        if (!isMounted) return;
        const names = [
          ...new Set(
            results
              .filter((item) => item.type === "hospital")
              .map((item) => item.name?.trim())
              .filter(Boolean) as string[]
          )
        ];
        setApprovedHospitals(names);
      } catch {
        if (isMounted) setApprovedHospitals([]);
      }
    };
    void loadApprovedHospitals();
    return () => {
      isMounted = false;
    };
  }, [auth.status]);

  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const loadMyImmediateRequests = async () => {
      if (auth.status !== "authenticated") {
        if (isMounted) setMyImmediateRequests([]);
        return;
      }
      try {
        const rows = await fetchMyEmergencyRequests();
        if (!isMounted) return;
        setMyImmediateRequests(rows.slice(0, 6));
      } catch {
        if (isMounted) setMyImmediateRequests([]);
      }
    };

    void loadMyImmediateRequests();
    if (route === "dashboard" && auth.status === "authenticated") {
      timer = setInterval(() => {
        void loadMyImmediateRequests();
      }, 15000);
    }

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [auth.status, route]);

  useEffect(() => {
    if (selectedEmergencyId) {
      dispatch(fetchEmergencyDetails(selectedEmergencyId));
    }
  }, [selectedEmergencyId, dispatch]);

  useEffect(() => {
    setEditName(profileSettings.profileInfo.fullName || auth.user?.fullName || "");
    setEditPhone(profileSettings.profileInfo.phone || auth.user?.phone || "");
    setEditAvatarUri(profileSettings.profileInfo.avatarUri || "");
  }, [
    profileSettings.profileInfo.fullName,
    profileSettings.profileInfo.phone,
    profileSettings.profileInfo.avatarUri,
    auth.user?.fullName,
    auth.user?.phone,
  ]);

  const isAuth = auth.status !== "authenticated";
  const compactHeader =
    route === "notifications" || route === "requestDetails" || route === "history" || route === "editProfile";

  const handlePickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo library access to select a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setEditAvatarUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = () => {
    const name = editName.trim();
    const phone = editPhone.trim();
    if (!name || name.length < 3) {
      Alert.alert("Invalid name", "Please enter at least 3 characters.");
      return;
    }
    if (!/^[0-9]{10,14}$/.test(phone)) {
      Alert.alert("Invalid phone", "Phone number must be 10 to 14 digits.");
      return;
    }

    dispatch(
      setProfileInfo({
        fullName: name,
        phone,
        avatarUri: editAvatarUri,
      })
    );
    Alert.alert("Success", "Profile updated successfully.");
    setRoute("profile");
  };

  const TabItem = ({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) => {
    return (
      <Pressable onPress={onPress} style={[s.tabItem, active && s.tabItemActive]}>
        <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={22} color={active ? "#005fa2" : "#5b403f"} />
        {active && <Text style={s.tabLabelActive}>{label}</Text>}
      </Pressable>
    );
  };

  const handleDonateNow = async () => {
    if (!selectedEmergency) {
      Alert.alert("Info", "This is a demo donation. Thank you!");
      setRoute("dashboard");
      return;
    }

    if (selectedEmergency.id.startsWith("mock")) {
      Alert.alert(
        "Donation Accepted! ðŸ©¸", 
        "Thank you! Your commitment to donate has been registered on this demo request. The hospital profile and administrator dashboard have been updated.",
        [{ text: "OK", onPress: () => setRoute("dashboard") }]
      );
      return;
    }

    try {
      await dispatch(acceptEmergencyDonation({
        requestId: selectedEmergency.id,
        donorName: auth.user?.fullName || "Alex Rivera"
      })).unwrap();

      Alert.alert(
        "Donation Accepted! ðŸ©¸",
        "Your commitment to donate has been registered. The hospital profile and administrator dashboard have been updated in real-time.",
        [{ text: "OK", onPress: () => setRoute("dashboard") }]
      );
      
      void dispatch(fetchEmergencyFeed());
    } catch (err: any) {
      Alert.alert("Unable to Register Donation", err || "Please try again later.");
    }
  };

  const handleOpenDirections = () => {
    if (!selectedEmergency) return;
    const lat = selectedEmergency.latitude || 15.8497;
    const lng = selectedEmergency.longitude || 74.4977;
    const label = encodeURIComponent(selectedEmergency.hospital || "Hospital");
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    });
    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    });
  };

  const handleQuickEmergencyRequest = async () => {
    const patientName = profileSettings.profileInfo.fullName?.trim() || auth.user?.fullName?.trim() || "";
    const contactNumber = profileSettings.profileInfo.phone?.trim() || auth.user?.phone?.trim() || "";
    const userBloodGroup = (auth.user?.bloodGroup || bloodGroup || "O+") as any;

    if (!patientName) {
      Alert.alert("Name missing", "Please update your profile name before posting a request.");
      return;
    }
    if (contactNumber && !/^[0-9]{10,14}$/.test(contactNumber)) {
      Alert.alert("Invalid phone", "Phone number must be 10 to 14 digits.");
      return;
    }
    if (!quickHospital.trim() || !quickHospitalOptions.includes(quickHospital)) {
      Alert.alert("Hospital unavailable", "No approved hospital is available right now. Please try again shortly.");
      return;
    }

    try {
      await dispatch(
        createEmergencyRequest({
          patientName,
          bloodGroup: userBloodGroup,
          unitsRequired: quickRequestType === "oxygen" ? 5 : 1,
          hospital: quickHospital.trim(),
          urgency: "CRITICAL",
          oxygenNeeded: quickRequestType === "oxygen",
          contactNumber
        })
      ).unwrap();

      Alert.alert(
        "Request submitted",
        `Your urgent ${quickRequestType === "oxygen" ? "oxygen" : "blood"} request has been sent to admin for review. Waiting for admin forwarding. It will appear in the app feed after admin forwards it.`
      );
      setQuickHospitalOpen(false);
      void dispatch(fetchEmergencyFeed());
      void fetchMyEmergencyRequests()
        .then((rows) => setMyImmediateRequests(rows.slice(0, 6)))
        .catch(() => {});
    } catch (err: any) {
      Alert.alert("Unable to post request", err || "Please try again later.");
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      
      {/* Dynamic/Mockup Header */}
      <View style={s.top}>
        <View style={s.topLeft}>
          {compactHeader ? (
            <Pressable onPress={() => setRoute("dashboard")} style={s.backBtn}>
              <Ionicons name="arrow-back" size={24} color={route === "requestDetails" ? "#b7102a" : c.text} />
              <Text style={[s.brandCompact, route === "requestDetails" && { color: "#b7102a" }]}>{title(route)}</Text>
            </Pressable>
          ) : (
            <AppBrand />
          )}
        </View>
        {compactHeader && route === "requestDetails" ? (
          <Pressable onPress={() => setRoute("notifications")} style={s.bellBtn}>
            <Ionicons name="notifications" size={24} color="#b7102a" />
          </Pressable>
        ) : !compactHeader ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {!isAuth && (
              <Pressable onPress={() => dispatch(logoutUser())}>
                <Ionicons name="log-out-outline" size={24} color={c.text} />
              </Pressable>
            )}
            <Pressable onPress={() => setRoute("notifications")} style={s.bellBtn}>
              <Ionicons name="notifications-outline" size={24} color={c.text} />
              {notifications.items.length > 0 && <View style={s.badgeDot} />}
            </Pressable>
          </View>
        ) : null}
      </View>

      {!isAuth && route === "map" ? (
        <View style={{ flex: 1, position: "relative" }}>
          {/* Interactive live map */}
          <MapView
            ref={mapRef}
            style={{ width: "100%", height: "100%" }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            initialRegion={{
              latitude: selectedHospitalMarker?.latitude || 15.8497,
              longitude: selectedHospitalMarker?.longitude || 74.4977,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            }}
          >

            {mapMarkerGroups.map((group) => {
              const isCritical = group.urgency === "CRITICAL";
              const accentColor = group.oxygenNeeded
                ? markerAppearance.oxygen.border
                : markerAppearance.blood.border;
              const markerLabel = group.oxygenNeeded ? "O2" : group.bloodGroup || "O+";

              return (
                <Marker
                  key={group.key}
                  coordinate={{ latitude: group.latitude, longitude: group.longitude }}
                  onPress={() =>
                    setSelectedHospitalMarker({
                      ...group.representative,
                      activeCount: group.activeCount,
                      clusterItems: group.clusterItems,
                      clusterIndex: 0,
                    })
                  }
                  anchor={{ x: 0.5, y: 0.5 }}
                  tracksViewChanges={Platform.OS === "android"}
                  title={`${group.oxygenNeeded ? "Oxygen" : "Blood"} ${markerLabel}${group.activeCount > 1 ? ` x${group.activeCount}` : ""}`}
                  description={group.hospital}
                >
                  <View
                    style={[
                      mStyles.mapIconMarker,
                      { borderColor: isCritical ? markerAppearance.critical.border : accentColor },
                    ]}
                    collapsable={false}
                  >
                    <Text style={mStyles.mapIconMarkerText}>
                      {group.oxygenNeeded ? "O2" : "🩸"}
                    </Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {/* Floating filter header */}
          <View style={mStyles.floatingFilterCard}>
            <Text style={mStyles.filterTitle}>Interactive Live Map</Text>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
              {(["all", "blood", "oxygen"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setMapFilter(t)}
                  style={[
                    mStyles.filterTabButton,
                    mapFilter === t && mStyles.filterTabActive
                  ]}
                >
                  <Text style={[
                    mStyles.filterTabText,
                    mapFilter === t && mStyles.filterTabTextActive
                  ]}>
                    {t === "all" ? "All" : t === "blood" ? "Blood" : "Oxygen"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {(mapFilter === "all" || mapFilter === "blood") && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ gap: 6, paddingVertical: 4 }}
                style={{ marginTop: 8 }}
              >
                {["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => {
                  const isActive = selectedBloodGroup === bg;
                  return (
                    <Pressable
                      key={bg}
                      onPress={() => setSelectedBloodGroup(bg)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: isActive ? "#b7102a" : "#F7F8FC",
                        borderWidth: 1,
                        borderColor: isActive ? "#b7102a" : "#eaecef",
                      }}
                    >
                      <Text style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: isActive ? "#ffffff" : "#5b403f",
                      }}>
                        {bg}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {selectedHospitalMarker ? (
            <View style={mStyles.selectedMarkerOverlay}>
              <Ionicons
                name={selectedHospitalMarker.oxygenNeeded ? "pulse" : "water"}
                size={13}
                color={selectedHospitalMarker.oxygenNeeded ? "#2b6485" : "#b7102a"}
              />
              <Text style={mStyles.selectedMarkerOverlayText}>
                {selectedHospitalMarker.oxygenNeeded ? "O2" : (selectedHospitalMarker.bloodGroup || "O+")}
                {selectedHospitalMarker.activeCount > 1 ? ` x${selectedHospitalMarker.activeCount}` : ""}
              </Text>
            </View>
          ) : null}

          {/* Floating Action Buttons */}
          <View style={mStyles.floatingFabContainer}>
            <Pressable 
              onPress={() => requestLocationPermission(true)}
              style={mStyles.fabButton}
            >
              <Ionicons name="locate" size={22} color="#005fa2" />
            </Pressable>

            <Pressable 
              onPress={() => mapRef.current?.animateToRegion({
                latitude: 15.8497,
                longitude: 74.4977,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05
              }, 800)}
              style={mStyles.fabButton}
            >
              <Ionicons name="business" size={22} color="#b7102a" />
            </Pressable>
          </View>

          {/* Floating Hospital Detail Card */}
          {selectedHospitalMarker ? (
            <View style={mStyles.floatingDetailCard}>
              <View style={mStyles.detailCardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={[
                    mStyles.typeBadge,
                    { backgroundColor: selectedHospitalMarker.oxygenNeeded ? "#E6FFFA" : "#FFF0F0" }
                  ]}>
                    <Text style={{
                      fontSize: 10,
                      fontWeight: "800",
                      color: selectedHospitalMarker.oxygenNeeded ? "#0d9488" : "#b7102a"
                    }}>
                      {selectedHospitalMarker.oxygenNeeded ? "OXYGEN" : "BLOOD"}
                    </Text>
                  </View>
                  <Text style={[
                    mStyles.urgencyBadge,
                    selectedHospitalMarker.urgency === "CRITICAL" ? { color: "#b7102a" } : { color: "#2b6485" }
                  ]}>
                    {selectedHospitalMarker.urgency}
                  </Text>
                </View>
                <Pressable onPress={() => setSelectedHospitalMarker(null)}>
                  <Ionicons name="close-circle" size={24} color="#8f6f6e" />
                </Pressable>
              </View>
              <View style={mStyles.detailsCapsuleRow}>
                <Ionicons
                  name={selectedHospitalMarker.oxygenNeeded ? "pulse" : "water"}
                  size={13}
                  color={selectedHospitalMarker.urgency === "CRITICAL" ? "#ff003c" : (selectedHospitalMarker.oxygenNeeded ? "#2b6485" : "#b7102a")}
                />
                <Text style={mStyles.detailsCapsuleText}>
                  {`${selectedHospitalMarker.oxygenNeeded ? "O2" : selectedHospitalMarker.bloodGroup || "O+"} : ${selectedHospitalMarker.urgency || "MEDIUM"}`}
                </Text>
              </View>

              <Text style={mStyles.hospitalName} numberOfLines={1}>
                {selectedHospitalMarker.hospital}
              </Text>
              <Text style={mStyles.patientName}>
                🩸 {selectedHospitalMarker.bloodGroup || "O+"}
              </Text>
              <Text style={mStyles.patientName}>
                👤 {selectedHospitalMarker.patientName || "Anonymous"} • Need: {selectedHospitalMarker.unitsRequired} {selectedHospitalMarker.oxygenNeeded ? "Liters" : "Units"}
              </Text>
              <Text style={mStyles.patientMeta}>
                📍 {formatDistanceFromUser(selectedHospitalMarker.latitude, selectedHospitalMarker.longitude)}
              </Text>
              {selectedHospitalMarker.activeCount > 1 ? (
                <View style={mStyles.clusterNavRow}>
                  <Pressable
                    style={mStyles.clusterNavBtn}
                    onPress={() =>
                      setSelectedHospitalMarker((prev: any) => {
                        if (!prev?.clusterItems?.length) return prev;
                        const total = prev.clusterItems.length;
                        const current = typeof prev.clusterIndex === "number" ? prev.clusterIndex : 0;
                        const nextIndex = (current - 1 + total) % total;
                        return {
                          ...prev,
                          ...prev.clusterItems[nextIndex],
                          activeCount: total,
                          clusterItems: prev.clusterItems,
                          clusterIndex: nextIndex,
                        };
                      })
                    }
                  >
                    <Text style={mStyles.clusterNavBtnText}>{"<"}</Text>
                  </Pressable>
                  <Text style={mStyles.patientMeta}>
                    📌 Request {(selectedHospitalMarker.clusterIndex ?? 0) + 1}/{selectedHospitalMarker.activeCount}
                  </Text>
                  <Pressable
                    style={mStyles.clusterNavBtn}
                    onPress={() =>
                      setSelectedHospitalMarker((prev: any) => {
                        if (!prev?.clusterItems?.length) return prev;
                        const total = prev.clusterItems.length;
                        const current = typeof prev.clusterIndex === "number" ? prev.clusterIndex : 0;
                        const nextIndex = (current + 1) % total;
                        return {
                          ...prev,
                          ...prev.clusterItems[nextIndex],
                          activeCount: total,
                          clusterItems: prev.clusterItems,
                          clusterIndex: nextIndex,
                        };
                      })
                    }
                  >
                    <Text style={mStyles.clusterNavBtnText}>{">"}</Text>
                  </Pressable>
                </View>
              ) : null}
              
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <Pressable 
                  style={mStyles.detailsBtn} 
                  onPress={() => {
                    setSelectedEmergencyId(selectedHospitalMarker.id);
                    setRoute("requestDetails");
                  }}
                >
                  <Text style={mStyles.detailsBtnText}>View Details</Text>
                </Pressable>
                
                <Pressable 
                  style={mStyles.directionsBtn} 
                  onPress={() => {
                    const lat = selectedHospitalMarker.latitude || 15.8497;
                    const lng = selectedHospitalMarker.longitude || 74.4977;
                    const label = encodeURIComponent(selectedHospitalMarker.hospital || "Hospital");
                    const url = Platform.select({
                      ios: `maps:0,0?q=${lat},${lng}`,
                      android: `geo:0,0?q=${lat},${lng}(${label})`,
                      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                    });
                    Linking.openURL(url!).catch(() => {
                      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
                    });
                  }}
                >
                  <Ionicons name="navigate-outline" size={16} color="#fff" />
                  <Text style={mStyles.directionsBtnText}>Directions</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={mStyles.floatingSummaryCard}>
              <Ionicons name="map" size={20} color="#b7102a" />
              <Text style={mStyles.summaryText}>
                Select any marker on the map to see hospital details, get directions, and donate!
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[s.content, !isAuth && s.withTabs]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={emergency.feedStatus === "loading"}
              onRefresh={() => dispatch(fetchEmergencyFeed())}
              colors={["#b7102a"]}
              tintColor="#b7102a"
            />
          }
        >
        {isAuth && route === "login" && (
          <View style={s.authCard}>
            <Text style={s.h1}>Welcome Back</Text>
            <Text style={s.muted}>Log in to continue saving lives.</Text>
            <View style={{ gap: 14, marginTop: 8 }}>
              <Field label="EMAIL ADDRESS OR PHONE NUMBER" value={loginIdentifier} setValue={setLoginIdentifier} />
              <Field label="PASSWORD" value={loginPassword} setValue={setLoginPassword} secure />
            </View>
            {auth.error ? <Text style={s.error}>{auth.error}</Text> : null}
            <Primary
              text={auth.loginStatus === "loading" ? "Logging in..." : "Login"}
              onPress={() => dispatch(loginUser({ identifier: loginIdentifier, password: loginPassword }))}
            />
            <Footer lead="Don't have an account?" action="Sign Up" onPress={() => setRoute("signup")} />
          </View>
        )}

        {isAuth && route === "signup" && (
          <View style={s.authCard}>
            <Text style={s.h1}>Become a LifeSaver</Text>
            <Text style={s.muted}>Join our donor community and save lives nearby.</Text>
            <View style={{ gap: 14, marginTop: 8 }}>
              <Field label="FULL NAME" value={fullName} setValue={setFullName} />
              <Field label="EMAIL ADDRESS" value={email} setValue={setEmail} />
              <Field label="PHONE NUMBER" value={phone} setValue={setPhone} />
              <Text style={s.label}>BLOOD TYPE</Text>
              <View style={s.grid}>
                {bloodTypes.map((b) => (
                  <Pressable key={b} onPress={() => setBloodGroup(b)} style={[s.blood, bloodGroup === b && s.bloodActive]}>
                    <Text style={[s.bloodTxt, bloodGroup === b && s.bloodTxtActive]}>{b}</Text>
                  </Pressable>
                ))}
              </View>
              <Field label="PASSWORD" value={password} setValue={setPassword} secure />
            </View>
            <View style={[s.row, { marginVertical: 8 }]}>
              <Switch value={agree} onValueChange={setAgree} trackColor={{ false: c.outlineVariant, true: c.secondary }} />
              <Text style={[s.small, { flex: 1 }]}>I agree to Terms of Service and Privacy Policy.</Text>
            </View>
            {auth.error ? <Text style={s.error}>{auth.error}</Text> : null}
            <Primary
              text={auth.registerStatus === "loading" ? "Creating..." : "Create Account"}
              onPress={() =>
                dispatch(registerUser({ fullName, email, phone, bloodGroup: bloodGroup as any, password }))
              }
            />
            <Footer lead="Already have an account?" action="Login" onPress={() => setRoute("login")} />
          </View>
        )}

        {!isAuth && route === "dashboard" && (
          <View style={s.stack}>
            {/* Profile Card */}
            <View style={s.profileCard}>
              <View style={s.profileRow}>
                <View style={s.avatarContainer}>
                  <Ionicons name="person" size={22} color="#b7102a" />
                </View>
                <View style={s.profileTextContainer}>
                  <Text style={s.profileName}>{auth.user?.fullName ?? "Alex Rivera"}</Text>
                  <Text style={s.profileSubtitle}>CERTIFIED DONOR</Text>
                </View>
              </View>
              
              <View style={s.bloodTypeRow}>
                <Text style={s.bloodTypeLabel}>Your Blood Type</Text>
                <View style={s.bloodTypeBadge}>
                  <Ionicons name="water" size={14} color="#b7102a" style={{ marginRight: 4 }} />
                  <Text style={s.bloodTypeBadgeText}>{auth.user?.bloodGroup ?? bloodGroup}</Text>
                </View>
              </View>
            </View>

            {/* Lifetime Impact Card */}
            <View style={s.impactCard}>
              <View style={s.impactHeader}>
                <Text style={s.impactTitle}>Your Lifetime Impact</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              </View>
              <Text style={s.impactText}>
                Your commitment to donating blood is saving lives. You are a community hero.
              </Text>
              <View style={s.impactStatsRow}>
                <View style={s.impactStatItem}>
                  <Text style={s.impactStatNumber}>{donor.history.length}</Text>
                  <Text style={s.impactStatLabel}>Donations</Text>
                </View>
              </View>
            </View>

            <NextEligibilityCard
              variant="stylesheet"
              display={eligibilityDisplay}
              styles={{
                card: s.eligibilityCard,
                title: s.eligibilityTitle,
                subtitle: s.eligibilitySubtitle,
                track: s.progressBarTrack,
                fill: s.progressBarFill,
                datesRow: s.eligibilityDatesRow,
                dateText: s.eligibilityDateText,
              }}
            />

            {/* Urgent Requests Header */}
            <View style={s.sectionHeader}>
              <View style={s.sectionHeaderLeft}>
                <Ionicons name="megaphone-outline" size={22} color="#b7102a" style={{ marginRight: 8 }} />
                <Text style={s.sectionTitle}>Urgent Requests</Text>
              </View>
              <Pressable onPress={() => setRoute("map")}>
                <Text style={s.seeMapLink}>See Map</Text>
              </Pressable>
            </View>

            <View style={s.quickRequestCard}>
              <Text style={s.quickRequestTitle}>Immediate Request</Text>
              <Text style={s.quickRequestSubtitle}>Post instantly for Blood or Oxygen using your profile details.</Text>

              <View style={s.quickTypeRow}>
                <Pressable
                  onPress={() => setQuickRequestType("blood")}
                  style={[s.quickTypeBtn, quickRequestType === "blood" && s.quickTypeBtnActive]}
                >
                  <Text style={[s.quickTypeTxt, quickRequestType === "blood" && s.quickTypeTxtActive]}>Blood</Text>
                </Pressable>
                <Pressable
                  onPress={() => setQuickRequestType("oxygen")}
                  style={[s.quickTypeBtn, quickRequestType === "oxygen" && s.quickTypeBtnActive]}
                >
                  <Text style={[s.quickTypeTxt, quickRequestType === "oxygen" && s.quickTypeTxtActive]}>Oxygen</Text>
                </Pressable>
              </View>

              <Text style={s.quickLabel}>Hospital</Text>
              <Pressable style={s.quickDropdown} onPress={() => setQuickHospitalOpen((prev) => !prev)}>
                <Text style={s.quickDropdownText}>{quickHospital}</Text>
                <Ionicons name={quickHospitalOpen ? "chevron-up" : "chevron-down"} size={16} color="#5b403f" />
              </Pressable>
              {quickHospitalOpen ? (
                <View style={s.quickDropdownList}>
                  {quickHospitalOptions.map((hospitalName) => (
                    <Pressable
                      key={hospitalName}
                      style={s.quickDropdownItem}
                      onPress={() => {
                        setQuickHospital(hospitalName);
                        setQuickHospitalOpen(false);
                      }}
                    >
                      <Text style={s.quickDropdownItemText}>{hospitalName}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <Pressable
                style={[s.quickPostBtn, emergency.createStatus === "loading" && { opacity: 0.7 }]}
                onPress={handleQuickEmergencyRequest}
                disabled={emergency.createStatus === "loading"}
              >
                <Ionicons name="send" size={14} color="#fff" />
                <Text style={s.quickPostBtnText}>
                  {emergency.createStatus === "loading" ? "Posting..." : "Post Immediate Request"}
                </Text>
              </Pressable>
            </View>

            <View style={s.quickRequestCard}>
              <Text style={s.quickRequestTitle}>My Immediate Request Status</Text>
              <Text style={s.quickRequestSubtitle}>Track your submitted requests and approval progress.</Text>
              {myImmediateRequests.length === 0 ? (
                <Text style={{ marginTop: 10, fontSize: 12, color: "#5b403f" }}>
                  No immediate requests yet.
                </Text>
              ) : (
                <View style={{ marginTop: 10, gap: 8 }}>
                  {myImmediateRequests.slice(0, 3).map((item) => {
                    const statusLabel =
                      item.backendStatus === "PENDING"
                        ? "Pending Admin Review"
                        : item.backendStatus === "APPROVED"
                          ? "Approved by Blood Bank"
                          : item.backendStatus === "FORWARDED_TO_APP"
                            ? "Forwarded to App"
                            : item.backendStatus === "ASSIGNED"
                              ? "Donor Assigned"
                              : item.backendStatus === "RESOLVED"
                                ? "Fulfilled"
                                : item.backendStatus;
                    const statusColor =
                      item.backendStatus === "PENDING"
                        ? "#8f6f6e"
                        : item.backendStatus === "APPROVED"
                          ? "#1d4ed8"
                          : item.backendStatus === "FORWARDED_TO_APP"
                            ? "#2b6485"
                            : item.backendStatus === "ASSIGNED"
                              ? "#0d9488"
                              : item.backendStatus === "RESOLVED"
                                ? "#2e7d32"
                                : "#5b403f";

                    return (
                      <View key={item.id} style={{ borderWidth: 1, borderColor: "#EAECEF", borderRadius: 10, padding: 10, backgroundColor: "#fff" }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text style={{ fontSize: 13, fontWeight: "700", color: "#001b3c" }}>
                            {item.oxygenNeeded ? "Oxygen Request" : `${item.bloodGroup} Blood Request`}
                          </Text>
                          <Text style={{ fontSize: 11, fontWeight: "700", color: statusColor }}>{statusLabel}</Text>
                        </View>
                        <Text style={{ marginTop: 4, fontSize: 12, color: "#5b403f" }}>{item.hospital}</Text>
                        {item.backendStatus === "APPROVED" && !item.oxygenNeeded ? (
                          <Text style={{ marginTop: 4, fontSize: 12, color: "#1d4ed8", fontWeight: "600" }}>
                            {item.bloodGroup} blood approved by blood bank.
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Live requests status */}
            {emergency.feedStatus === "loading" && urgentFeed.length === 0 ? (
              <View style={{ paddingVertical: 10, alignItems: "center" }}>
                <Text style={s.small}>Loading requests from API...</Text>
              </View>
            ) : null}

            {emergency.feedStatus !== "loading" && requestsToShow.length === 0 ? (
              <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#EAECEF", alignItems: "center" }}>
                <Ionicons name="checkmark-circle-outline" size={22} color="#2b6485" />
                <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "700", color: "#001b3c" }}>
                  No live urgent requests right now
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: "#5b403f", textAlign: "center" }}>
                  You are all caught up. Check again soon for new nearby requests.
                </Text>
              </View>
            ) : null}

            {/* Requests List */}
            {requestsToShow.map((item) => (
              <View key={item.id} style={[
                s.requestCard, 
                { borderLeftColor: item.isCritical ? "#b7102a" : "#2b6485" }
              ]}>
                <View style={s.cardHeader}>
                  <View style={[
                    s.stockBadge,
                    { 
                      backgroundColor: item.isCritical ? "#FFF0F0" : "#EBF3FC",
                      borderColor: item.isCritical ? "#FDCACA" : "#CBE2FB"
                    }
                  ]}>
                    <Ionicons 
                      name={item.isCritical ? "warning" : "water"} 
                      size={12} 
                      color={item.isCritical ? "#b7102a" : "#2b6485"} 
                    />
                    <Text style={[
                      s.stockBadgeText,
                      { color: item.isCritical ? "#b7102a" : "#2b6485" }
                    ]}>
                      {item.stockStatus}
                    </Text>
                  </View>
                  <Text style={s.distanceText}>{item.distance}</Text>
                </View>

                <View style={s.cardMiddle}>
                  <View style={[
                    s.bloodGroupContainer,
                    { backgroundColor: item.isCritical ? "#FFF0F0" : "#EBF3FC" }
                  ]}>
                    <Text style={[
                      s.bloodGroupText,
                      { color: item.isCritical ? "#b7102a" : "#2b6485" }
                    ]}>
                      {item.bloodGroup}
                    </Text>
                  </View>
                  <View style={s.hospitalInfo}>
                    <Text style={s.hospitalName}>{item.patientLabel}</Text>
                    <Text style={s.hospitalUnit}>{item.hospital}</Text>
                  </View>
                </View>

                <View style={s.cardBottom}>
                  <Pressable 
                    style={s.donateButton} 
                    onPress={() => {
                      setSelectedEmergencyId(item.liveItem.id);
                      setRoute("requestDetails");
                    }}
                  >
                    <Text style={s.donateButtonText}>Donate Now</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </Pressable>
                  <Pressable 
                    style={s.locateButton} 
                    onPress={() => {
                      setSelectedHospitalMarker(item.liveItem);
                      setRoute("map");
                    }}
                  >
                    <Ionicons name="locate-outline" size={18} color="#2b6485" />
                  </Pressable>
                </View>
              </View>
            ))}

            {/* Promo Banner Card */}
            <Pressable onPress={() => setRoute("map")} style={s.promoCard}>
              <View style={s.promoHeader}>
                <View style={s.promoBadge}>
                  <Ionicons name="location" size={16} color="#b7102a" />
                </View>
              </View>
              <View style={s.promoFooter}>
                <Text style={s.promoTitle}>Find centers near you</Text>
                <Text style={s.promoSubtitle}>4 active locations within 10 miles</Text>
              </View>
            </Pressable>
          </View>
        )}



        {!isAuth && route === "requestDetails" && (
          <View style={s.stack}>
            {/* Urgency Badge */}
            <View style={{ backgroundColor: "#b7102a", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Ionicons name="warning" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>
                URGENT - {selectedEmergency?.oxygenNeeded ? "Oxygen Flasks" : (selectedEmergency?.bloodGroup ?? "O+") + " Blood"} Needed
              </Text>
            </View>

            {/* Hospital Contact Info */}
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#EAECEF", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#001b3c" }}>
                  {selectedEmergency?.hospital ?? "City Hospital"}
                </Text>
                <Text style={{ fontSize: 13, color: "#5b403f", fontWeight: "500" }}>
                  Active Request | Available 24/7
                </Text>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 4 }}>
                  <Ionicons name="location-outline" size={14} color="#5b403f" style={{ marginTop: 2 }} />
                  <Text style={{ fontSize: 13, color: "#8f6f6e", flex: 1, lineHeight: 17 }}>
                    {selectedEmergency?.address ?? "450 Medical Center Drive, West District, Metro City 10293"}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  if (selectedEmergency?.contactNumber) {
                    Linking.openURL(`tel:${selectedEmergency.contactNumber}`).catch(() => {
                      Alert.alert("Error", "Could not initiate call to " + selectedEmergency.contactNumber);
                    });
                  } else {
                    Alert.alert("Info", "No phone contact number provided for this request.");
                  }
                }}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#d2ebfc", alignItems: "center", justifyContent: "center", marginLeft: 12 }}
              >
                <Ionicons name="call" size={18} color="#005fa2" />
              </Pressable>
            </View>

            {/* Case Context Card */}
            <View style={{ backgroundColor: "#F0F3FF", borderRadius: 16, padding: 16, gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#5b403f", letterSpacing: 0.8 }}>
                CASE CONTEXT
              </Text>
              <Text style={{ fontSize: 14, color: "#001b3c", lineHeight: 20 }}>
                {selectedEmergency?.patientName 
                  ? `Emergency ${selectedEmergency.oxygenNeeded ? "Oxygen Setup" : "Surgery"} - A patient named ${selectedEmergency.patientName} requires urgent ${selectedEmergency.oxygenNeeded ? `${selectedEmergency.unitsRequired} Liters of Oxygen` : `${selectedEmergency.bloodGroup} Blood`} for a critical medical procedure.` 
                  : `Emergency Procedure - A patient requires ${selectedEmergency?.oxygenNeeded ? "Oxygen cylinders" : "Blood transfusion"} at the earliest.`}
              </Text>
            </View>

            {/* Inventory Status Card */}
            <View style={{ backgroundColor: "#ffdad6", borderRadius: 16, padding: 16, gap: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#b7102a", letterSpacing: 0.8 }}>
                INVENTORY STATUS
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="alert-circle" size={18} color="#b7102a" />
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#b7102a" }}>
                  {selectedEmergency?.status === "FULFILLED" ? "Donation Complete" : "Critical Shortage"}
                </Text>
              </View>
              
              {/* Progress bar track */}
              <View style={{ height: 6, backgroundColor: "rgba(183, 16, 42, 0.1)", borderRadius: 3, overflow: "hidden" }}>
                <View style={{ height: "100%", width: selectedEmergency?.status === "FULFILLED" ? "100%" : "25%", backgroundColor: selectedEmergency?.status === "FULFILLED" ? "#2e7d32" : "#b7102a", borderRadius: 3 }} />
              </View>
              <Text style={{ fontSize: 12, color: selectedEmergency?.status === "FULFILLED" ? "#2e7d32" : "#b7102a", fontWeight: "600" }}>
                {selectedEmergency?.status === "FULFILLED" ? "All requested units successfully donated!" : `Only 1 unit remaining in stock. Urgent donors needed!`}
              </Text>
            </View>

            {/* Real Map Visual */}
            <View style={{ height: 180, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#EAECEF" }}>
              <MapView
                style={{ width: "100%", height: "100%" }}
                initialRegion={{
                  latitude: selectedEmergency?.latitude || 15.8497,
                  longitude: selectedEmergency?.longitude || 74.4977,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015
                }}
              >
                <Marker
                  coordinate={{
                    latitude: selectedEmergency?.latitude || 15.8497,
                    longitude: selectedEmergency?.longitude || 74.4977
                  }}
                  title={selectedEmergency?.hospital || "Hospital"}
                  description={selectedEmergency?.address || "Belagavi, India"}
                  pinColor="#b7102a"
                />
              </MapView>
            </View>

            {/* Action Buttons */}
            <View style={{ gap: 12, marginTop: 4 }}>
              <Pressable 
                style={{ 
                  height: 50, 
                  backgroundColor: selectedEmergency?.status === "FULFILLED" ? "#8f6f6e" : "#b7102a", 
                  borderRadius: 14, 
                  flexDirection: "row", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: 8, 
                  opacity: selectedEmergency?.status === "FULFILLED" ? 0.7 : 1,
                  elevation: 2, 
                  shadowColor: "#b7102a", 
                  shadowOffset: { width: 0, height: 2 }, 
                  shadowOpacity: 0.15, 
                  shadowRadius: 4 
                }}
                disabled={selectedEmergency?.status === "FULFILLED"}
                onPress={handleDonateNow}
              >
                <Ionicons name="heart" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {selectedEmergency?.status === "FULFILLED" ? "Donation Fulfilled" : "Donate Now"}
                </Text>
              </Pressable>
              
              <Pressable 
                style={{ height: 50, backgroundColor: "#EBF3FC", borderWidth: 1, borderColor: "#CBE2FB", borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
                onPress={handleOpenDirections}
              >
                <Text style={{ color: "#2b6485", fontSize: 16, fontWeight: "700" }}>Get Directions</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!isAuth && route === "requests" && (
          <View style={s.stack}>
            {/* Header info bar */}
            <View style={{ backgroundColor: "#F0F3FF", borderLeftWidth: 4, borderLeftColor: "#2b6485", padding: 14, borderRadius: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="shield-checkmark" size={20} color="#2b6485" />
                <Text style={{ fontWeight: "800", color: "#2b6485", fontSize: 14 }}>
                  VERIFIED BY ADMIN
                </Text>
              </View>
              <Text style={{ color: "#5b403f", fontSize: 13, marginTop: 4, lineHeight: 18 }}>
                These urgent requests are forwarded by Lifestream Admin and represent active critical cases in the system.
              </Text>
            </View>

            {/* Search Input */}
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#eaecef", borderRadius: 12, paddingHorizontal: 12, height: 46 }}>
              <Ionicons name="search-outline" size={20} color="#8f6f6e" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search hospital, patient, or blood group..."
                placeholderTextColor="#8f6f6e"
                value={reqSearchQuery}
                onChangeText={setReqSearchQuery}
                style={{ flex: 1, height: "100%", color: "#001b3c", fontSize: 14 }}
              />
              {reqSearchQuery ? (
                <Pressable onPress={() => setReqSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#8f6f6e" />
                </Pressable>
              ) : null}
            </View>

            {/* Quick Filters Group */}
            <View style={{ gap: 8 }}>
              {/* Type selector (All, Blood, Oxygen) */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["all", "blood", "oxygen"] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setReqFilterType(t)}
                    style={{
                      flex: 1,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: reqFilterType === t ? "#2b6485" : "#fff",
                      borderWidth: 1,
                      borderColor: reqFilterType === t ? "#2b6485" : "#eaecef",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 4
                    }}
                  >
                    {t === "blood" && <Ionicons name="water" size={14} color={reqFilterType === t ? "#fff" : "#b7102a"} />}
                    {t === "oxygen" && <Ionicons name="pulse" size={14} color={reqFilterType === t ? "#fff" : "#2b6485"} />}
                    <Text style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: reqFilterType === t ? "#fff" : "#5b403f",
                      textTransform: "capitalize"
                    }}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Status and Urgency filter buttons */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {/* Active / Resolved tabs */}
                <View style={{ flex: 2, flexDirection: "row", backgroundColor: "#fff", borderWidth: 1, borderColor: "#eaecef", borderRadius: 10, padding: 3 }}>
                  {(["all", "active", "resolved"] as const).map((sState) => (
                    <Pressable
                      key={sState}
                      onPress={() => setReqFilterStatus(sState)}
                      style={{
                        flex: 1,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: reqFilterStatus === sState ? "#EBF3FC" : "transparent",
                        alignItems: "center"
                      }}
                    >
                      <Text style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: reqFilterStatus === sState ? "#005fa2" : "#5b403f",
                        textTransform: "capitalize"
                      }}>
                        {sState}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Critical Only Toggle */}
                <Pressable
                  onPress={() => setReqFilterUrgency(reqFilterUrgency === "all" ? "critical" : "all")}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    backgroundColor: reqFilterUrgency === "critical" ? "#FFF0F0" : "#fff",
                    borderWidth: 1,
                    borderColor: reqFilterUrgency === "critical" ? "#FDCACA" : "#eaecef",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 4
                  }}
                >
                  <Ionicons name="warning" size={14} color="#b7102a" />
                  <Text style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#b7102a"
                  }}>
                    {reqFilterUrgency === "critical" ? "Critical âœ…" : "Critical Only"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
              <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 32, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#eaecef", gap: 12 }}>
                <Ionicons name="document-text-outline" size={48} color="#8f6f6e" />
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#001b3c" }}>No requests found</Text>
                <Text style={{ fontSize: 13, color: "#8f6f6e", textAlign: "center", lineHeight: 18 }}>
                  No admin forwarded requests match the current filters. Try resetting search or type options.
                </Text>
              </View>
            ) : (
              filteredRequests.map((item) => {
                const isCritical = item.urgency === "CRITICAL" || item.urgency === "HIGH";
                const isResolved = item.status === "FULFILLED";
                const borderLeftColor = isResolved ? "#8f8f8f" : item.oxygenNeeded ? "#2b6485" : "#b7102a";
                
                return (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "#eaecef",
                      borderLeftWidth: 5,
                      borderLeftColor,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.03,
                      shadowRadius: 6,
                      elevation: 2,
                      gap: 12
                    }}
                  >
                    {/* Header: Badges & Distance */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                        {/* Urgency Badge */}
                        <View style={{
                          backgroundColor: isResolved ? "#F3F4F6" : isCritical ? "#FFF0F0" : "#EBF3FC",
                          borderColor: isResolved ? "#E5E7EB" : isCritical ? "#FDCACA" : "#CBE2FB",
                          borderWidth: 1,
                          paddingVertical: 3,
                          paddingHorizontal: 8,
                          borderRadius: 6,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4
                        }}>
                          <Ionicons
                            name={isResolved ? "checkmark-circle" : isCritical ? "warning" : "information-circle"}
                            size={12}
                            color={isResolved ? "#4B5563" : isCritical ? "#b7102a" : "#2b6485"}
                          />
                          <Text style={{
                            fontSize: 10,
                            fontWeight: "800",
                            color: isResolved ? "#4B5563" : isCritical ? "#b7102a" : "#2b6485",
                            textTransform: "uppercase"
                          }}>
                            {isResolved ? "RESOLVED" : item.urgency}
                          </Text>
                        </View>

                        {/* Request Type Badge */}
                        <View style={{
                          backgroundColor: item.oxygenNeeded ? "#E6FFFA" : "#FFF5F5",
                          borderColor: item.oxygenNeeded ? "#B2F5EA" : "#FEB2B2",
                          borderWidth: 1,
                          paddingVertical: 3,
                          paddingHorizontal: 8,
                          borderRadius: 6
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: "800",
                            color: item.oxygenNeeded ? "#0d9488" : "#e53e3e"
                          }}>
                            {item.oxygenNeeded ? "OXYGEN" : "BLOOD"}
                          </Text>
                        </View>
                      </View>

                      <Text style={{ fontSize: 12, color: "#8f6f6e", fontWeight: "600" }}>
                        {item.distance}
                      </Text>
                    </View>

                    {/* Middle: Badge & Info */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      {/* Left Badge */}
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: isResolved ? "#F3F4F6" : item.oxygenNeeded ? "#EBF3FC" : "#FFF0F0",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {item.oxygenNeeded ? (
                          <Ionicons name="pulse" size={24} color={isResolved ? "#9CA3AF" : "#2b6485"} />
                        ) : (
                          <Text style={{
                            fontSize: 18,
                            fontWeight: "800",
                            color: isResolved ? "#9CA3AF" : "#b7102a"
                          }}>
                            {item.bloodGroup}
                          </Text>
                        )}
                      </View>

                      {/* Details */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: "800", color: "#001b3c" }} numberOfLines={1}>
                          Patient: {item.patientName}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#5b403f", marginTop: 2 }} numberOfLines={1}>
                          {item.hospital}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#5b403f", marginTop: 1 }}>
                          Required: {item.unitsRequired} {item.oxygenNeeded ? "Liters" : "Units"}
                        </Text>
                      </View>
                    </View>

                    {/* Footer: Date & Actions */}
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f1f3f6", paddingTop: 10, marginTop: 2 }}>
                      <Text style={{ fontSize: 11, color: "#8f6f6e" }}>
                        Forwarded: {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </Text>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {item.contactNumber ? (
                          <Pressable
                            onPress={() => Alert.alert("Contact Info", `Call patient's hospital contact: ${item.contactNumber}`)}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              borderWidth: 1,
                              borderColor: "#eaecef",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#fff"
                            }}
                          >
                            <Ionicons name="call" size={16} color="#2b6485" />
                          </Pressable>
                        ) : null}

                        <Pressable
                          onPress={() => {
                            if (item.liveItem) {
                              setSelectedEmergencyId(item.liveItem.id);
                              setRoute("requestDetails");
                            } else {
                              Alert.alert("Mock Request Info", `This is a sample forwarded request from ${item.hospital}.`);
                            }
                          }}
                          style={{
                            height: 36,
                            paddingHorizontal: 14,
                            borderRadius: 10,
                            backgroundColor: isResolved ? "#E5E7EB" : "#b7102a",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4
                          }}
                        >
                          <Text style={{
                            color: isResolved ? "#4B5563" : "#fff",
                            fontSize: 12,
                            fontWeight: "700"
                          }}>
                            {isResolved ? "View Logs" : "View Details"}
                          </Text>
                          <Ionicons name="arrow-forward" size={12} color={isResolved ? "#4B5563" : "#fff"} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {!isAuth && route === "history" && (
          <View style={s.stack}>
            <View style={s.sectionHeader}>
              <View style={s.sectionHeaderLeft}>
                <Ionicons name="time-outline" size={22} color="#b7102a" style={{ marginRight: 8 }} />
                <Text style={s.sectionTitle}>Donation History</Text>
              </View>
            </View>
            {donor.historyStatus === "loading" ? <Text style={s.small}>Loading history...</Text> : null}
            {donor.history.length === 0 ? (
              <View style={s.profileCard}>
                <Text style={[s.body, { textAlign: "center" }]}>No donation till now.</Text>
              </View>
            ) : (
              donor.history.map((item) => (
                <View key={item.id} style={s.historyCard}>
                  <View style={s.historyHeader}>
                    <Text style={s.historyLocation}>{item.location}</Text>
                    <Text style={s.historyUnits}>{item.units} unit(s)</Text>
                  </View>
                  <Text style={s.historyDate}>{new Date(item.donatedAt).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {!isAuth && route === "profile" && (
          <View style={s.stack}>
            {/* White Profile Card */}
            <View style={s.mockProfileCard}>
              {/* Avatar Container */}
              <View style={s.mockAvatarWrapper}>
                <Image
                  source={profileSettings.profileInfo.avatarUri ? { uri: profileSettings.profileInfo.avatarUri } : require("./src/assets/dummy_avatar.png")}
                  style={s.mockAvatarImage}
                  resizeMode="cover"
                />
                {/* Blood Type Badge Overlay */}
                <View style={s.mockBloodBadge}>
                  <Text style={s.mockBloodBadgeText}>
                    {auth.user?.bloodGroup || "O+"}
                  </Text>
                </View>
              </View>

              {/* Name & Details */}
              <Text style={s.mockProfileName}>
                {profileSettings.profileInfo.fullName || auth.user?.fullName || "Donor User"}
              </Text>
              <Text style={s.mockProfileSubtitle}>
                Silver Tier Donor | Member since Jan 2022
              </Text>

              {/* Donations Count Badge */}
              <View style={s.mockDonationBadge}>
                <Text style={s.mockDonationBadgeText}>
                  {donor.history.length} Donations
                </Text>
              </View>
            </View>

            {/* Donation History Section */}
            <Text style={s.mockHistoryTitle}>Donation History</Text>

            {donor.historyStatus === "loading" ? (
              <Text style={s.small}>Loading donation history...</Text>
            ) : null}

            {donor.historyStatus !== "loading" && donor.history.length === 0 ? (
              <View style={s.profileCard}>
                <Text style={[s.body, { textAlign: "center" }]}>No donation till now.</Text>
              </View>
            ) : null}

            {donor.history.length > 0 ? (
              <View style={s.mockTimelineContainer}>
                <View style={s.mockTimelineLine} />

                {historyToRenderInApp.map((item) => (
                  <View key={item.id} style={s.mockTimelineItem}>
                    <View
                      style={[
                        s.mockTimelineDot,
                        { backgroundColor: item.isRed ? "#b7102a" : "#2b6485" }
                      ]}
                    >
                      <Ionicons name="water" size={16} color="white" />
                    </View>

                    <View style={s.mockTimelineCard}>
                      <View style={s.mockTimelineHeader}>
                        <Text style={s.mockTimelineLocation} numberOfLines={1}>
                          {item.location}
                        </Text>
                        <View style={s.mockTimelineDateBadge}>
                          <Text style={s.mockTimelineDateText}>
                            {item.date}
                          </Text>
                        </View>
                      </View>
                      <Text style={s.mockTimelineType}>
                        {item.type}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={{ gap: 12, marginTop: 8 }}>
              <Pressable
                style={s.mockLoadOlderBtn}
                onPress={() => {}}
              >
                <Text style={s.mockLoadOlderText}>
                  Load Older History
                </Text>
              </Pressable>

              <Pressable
                style={s.mockEditProfileBtn}
                onPress={() => setRoute("editProfile")}
              >
                <Ionicons name="create-outline" size={18} color="#b7102a" />
                <Text style={s.mockEditProfileText}>
                  Edit Profile
                </Text>
              </Pressable>

              <Pressable
                style={s.mockLogoutBtn}
                onPress={() => dispatch(logoutUser())}
              >
                <Ionicons name="log-out-outline" size={20} color="#b7102a" />
                <Text style={s.mockLogoutText}>
                  Logout
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {!isAuth && route === "editProfile" && (
          <View style={s.stack}>
            <View style={s.mockProfileCard}>
              <Text style={s.mockHistoryTitle}>Edit Profile</Text>
              <Pressable onPress={handlePickProfileImage} style={s.mockAvatarWrapper}>
                <Image
                  source={editAvatarUri ? { uri: editAvatarUri } : require("./src/assets/dummy_avatar.png")}
                  style={s.mockAvatarImage}
                  resizeMode="cover"
                />
                <View style={s.mockBloodBadge}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </Pressable>
              <Text style={s.small}>Tap photo to change</Text>

              <View style={{ width: "100%", gap: 12, marginTop: 12 }}>
                <Field label="FULL NAME" value={editName} setValue={setEditName} />
                <Field label="PHONE NUMBER" value={editPhone} setValue={setEditPhone} />
              </View>
            </View>

            <Pressable style={s.primaryButton} onPress={handleSaveProfile}>
              <Text style={s.primaryButtonText}>Save Changes</Text>
            </Pressable>
            <Pressable style={s.secondaryButton} onPress={() => setRoute("profile")}>
              <Text style={s.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {!isAuth && route === "notifications" && (
          <View style={s.stack}>
            <View style={s.filter}>
              <Pressable style={[s.fBtn, !urgentOnly && s.fBtnActive]} onPress={() => setUrgentOnly(false)}>
                <Text style={[s.fTxt, !urgentOnly && s.fTxtActive]}>All</Text>
              </Pressable>
              <Pressable style={[s.fBtn, urgentOnly && s.fBtnActive]} onPress={() => setUrgentOnly(true)}>
                <Text style={[s.fTxt, urgentOnly && s.fTxtActive]}>Urgent</Text>
              </Pressable>
            </View>
            {notifications.fetchStatus === "loading" ? <Text style={s.small}>Loading notifications...</Text> : null}
            {notifications.items.length === 0 ? (
              <View style={s.profileCard}>
                <Text style={[s.body, { textAlign: "center" }]}>No notifications yet.</Text>
              </View>
            ) : (
              notifications.items
                .filter((n) => (urgentOnly ? n.type === "EMERGENCY_ALERT" : true))
                .map((n) => (
                  <View key={n.id} style={[
                    s.noticeCard,
                    n.type === "EMERGENCY_ALERT" && { borderLeftColor: "#b7102a" }
                  ]}>
                    <View style={s.noticeHeader}>
                      <Text style={s.noticeTitle}>{n.title}</Text>
                      <Ionicons 
                        name={n.type === "EMERGENCY_ALERT" ? "alert-circle" : "information-circle"} 
                        size={18} 
                        color={n.type === "EMERGENCY_ALERT" ? "#b7102a" : "#2b6485"} 
                      />
                    </View>
                    <Text style={s.noticeBody}>{n.subtitle || n.body || ""}</Text>
                    <Text style={s.noticeTime}>{new Date(n.createdAt).toLocaleDateString()}</Text>
                  </View>
                ))
            )}
          </View>
        )}
      </ScrollView>
      )}

      {/* Stylized Mockup Bottom Tab Navigation */}
      {!isAuth && route !== "requestDetails" && (
        <View style={s.tabs}>
          <TabItem icon="home" label="Home" active={route === "dashboard"} onPress={() => setRoute("dashboard")} />
          <TabItem icon="map" label="Map" active={route === "map"} onPress={() => setRoute("map")} />
          <TabItem icon="list" label="Requests" active={route === "requests"} onPress={() => setRoute("requests")} />
          <TabItem icon="person" label="Profile" active={route === "profile" || route === "history"} onPress={() => setRoute("profile")} />
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

function title(r: Route) {
  return r === "notifications"
    ? "Notifications"
    : r === "requestDetails"
      ? "Request Details"
      : r === "history"
        ? "Donation History"
        : r === "editProfile"
          ? "Edit Profile"
          : r === "requests"
            ? "Forwarded Requests"
            : "LifeStream";
}

function Field({ label, value, setValue, secure = false }: { label: string; value: string; setValue: (v: string) => void; secure?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput secureTextEntry={secure} value={value} onChangeText={setValue} style={s.input} placeholderTextColor="#8f6f6e" />
    </View>
  );
}

function Primary({ text, onPress }: { text: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={s.pBtn}><Text style={s.pTxt}>{text}</Text></Pressable>;
}

function Footer({ lead, action, onPress }: { lead: string; action: string; onPress: () => void }) {
  return <View style={s.footer}><Text style={s.small}>{lead} </Text><Pressable onPress={onPress}><Text style={s.link}>{action}</Text></Pressable></View>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  top: { 
    height: 64, 
    backgroundColor: c.surface, 
    borderBottomWidth: 1, 
    borderBottomColor: "#eaecef", 
    paddingHorizontal: 20, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between" 
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandCompact: { color: c.text, fontSize: 20, fontWeight: "700", marginLeft: 6 },
  backBtn: { flexDirection: "row", alignItems: "center" },
  bellBtn: { padding: 4, position: "relative" },
  badgeDot: { 
    position: "absolute", 
    right: 4, 
    top: 4, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: c.primary 
  },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 },
  withTabs: { paddingBottom: 110 },
  stack: { gap: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  
  // Auth Card Styles
  authCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#eaecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  h1: { color: c.text, fontSize: 24, fontWeight: "700", lineHeight: 30 },
  body: { color: c.text, fontSize: 16 },
  muted: { color: c.muted, fontSize: 14, lineHeight: 20 },
  label: { color: c.muted, fontSize: 11, letterSpacing: 0.6, fontWeight: "700" },
  small: { color: c.muted, fontSize: 12 },
  input: { 
    height: 48, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: "#c5b4b3", 
    paddingHorizontal: 14, 
    color: c.text, 
    backgroundColor: c.surface, 
    fontSize: 16 
  },
  pBtn: { 
    height: 48, 
    borderRadius: 12, 
    backgroundColor: c.primary, 
    alignItems: "center", 
    justifyContent: "center", 
    marginTop: 8,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  pTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 },
  link: { color: c.primary, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  blood: { width: 72, height: 42, borderRadius: 12, borderWidth: 1, borderColor: "#c5b4b3", alignItems: "center", justifyContent: "center" },
  bloodActive: { backgroundColor: c.secondary, borderColor: c.secondary },
  bloodTxt: { color: c.text, fontWeight: "700" },
  bloodTxtActive: { color: "#fff" },

  // Profile Card Styles
  profileCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffdad6",
    alignItems: "center",
    justifyContent: "center",
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: c.text,
  },
  profileSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8f6f6e",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  bloodTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F8FC",
    padding: 12,
    borderRadius: 12,
  },
  bloodTypeLabel: {
    fontSize: 14,
    color: c.text,
    fontWeight: "500",
  },
  bloodTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffdad6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e4bebc",
  },
  bloodTypeBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#b7102a",
  },

  // Lifetime Impact Card Styles
  impactCard: {
    backgroundColor: "#b7102a",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#b7102a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  impactHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  impactText: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
    lineHeight: 18,
    marginBottom: 20,
  },
  impactStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    paddingTop: 16,
  },
  impactStatItem: {
    alignItems: "center",
    flex: 1,
  },
  impactStatNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  impactStatLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    marginTop: 2,
  },
  impactStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  // Eligibility Card Styles
  eligibilityCard: {
    backgroundColor: "#2b6485",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#2b6485",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  eligibilityTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  eligibilitySubtitle: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#a3d8fe",
    borderRadius: 3,
  },
  eligibilityDatesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eligibilityDateText: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.85,
    fontWeight: "500",
  },

  // Section Header Styles
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 4,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: c.text,
  },
  seeMapLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b7102a",
  },
  quickRequestCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAECEF",
    marginBottom: 6,
  },
  quickRequestTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: c.text,
  },
  quickRequestSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#5b403f",
  },
  quickTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  quickTypeBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    backgroundColor: "#F8FAFC",
  },
  quickTypeBtnActive: {
    backgroundColor: "#FFF1F3",
    borderColor: "#F9C7D0",
  },
  quickTypeTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5b403f",
  },
  quickTypeTxtActive: {
    color: "#b7102a",
  },
  quickLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "600",
    color: c.text,
  },
  quickDropdown: {
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  quickDropdownText: {
    fontSize: 13,
    color: c.text,
    fontWeight: "500",
  },
  quickDropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  quickDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  quickDropdownItemText: {
    fontSize: 13,
    color: c.text,
  },
  quickPostBtn: {
    marginTop: 12,
    backgroundColor: "#b7102a",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  quickPostBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  // Urgent Request Card Styles
  requestCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 12,
    color: "#5b403f",
    fontWeight: "500",
  },
  cardMiddle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  bloodGroupContainer: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bloodGroupText: {
    fontSize: 18,
    fontWeight: "800",
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: "700",
    color: c.text,
  },
  hospitalUnit: {
    fontSize: 12,
    color: "#5b403f",
    marginTop: 2,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  donateButton: {
    flex: 1,
    height: 40,
    backgroundColor: "#b7102a",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  donateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  locateButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EAECEF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surface,
  },

  // Promo Card Styles
  promoCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#112233",
    height: 140,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4
  },
  promoHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  promoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  promoFooter: {
    gap: 4,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  promoSubtitle: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.8,
  },

  // Map Screen Card Styles
  mapCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eaecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  mapCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  mapBloodBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  mapBloodText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#b7102a",
  },
  mapHospitalName: {
    fontSize: 16,
    fontWeight: "700",
    color: c.text,
  },
  mapPatientName: {
    fontSize: 12,
    color: "#5b403f",
    marginTop: 2,
  },

  // Request Details Card Styles
  detailsCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eaecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b7102a",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  detailsBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  detailsMain: {
    gap: 12,
  },
  detailsHospital: {
    fontSize: 22,
    fontWeight: "700",
    color: c.text,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#eaecef",
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 13,
    color: "#5b403f",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: c.text,
    fontWeight: "600",
  },
  detailValueBold: {
    fontSize: 16,
    color: "#b7102a",
    fontWeight: "700",
  },
  detailBloodBadge: {
    backgroundColor: "#FFF0F0",
    borderColor: "#FDCACA",
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailBloodText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#b7102a",
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: c.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EBF3FC",
    borderWidth: 1,
    borderColor: "#CBE2FB",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#2b6485",
    fontSize: 16,
    fontWeight: "700",
  },

  // History Screen Card Styles
  historyCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eaecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 6,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyLocation: {
    fontSize: 16,
    fontWeight: "700",
    color: c.text,
    flex: 1,
  },
  historyUnits: {
    fontSize: 14,
    fontWeight: "700",
    color: "#b7102a",
  },
  historyDate: {
    fontSize: 12,
    color: "#5b403f",
  },

  // Profile info styles
  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F7F8FC",
  },
  profileInfoLabel: {
    fontSize: 14,
    color: "#5b403f",
  },
  profileInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: c.text,
  },

  // Notice card styles
  noticeCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eaecef",
    borderLeftWidth: 4,
    borderLeftColor: "#2b6485",
    gap: 8,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: c.text,
    flex: 1,
  },
  noticeBody: {
    fontSize: 13,
    color: "#5b403f",
    lineHeight: 18,
  },
  noticeTime: {
    fontSize: 11,
    color: "#8f6f6e",
    alignSelf: "flex-end",
  },

  // Tabs styles
  tabs: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: c.surface,
    borderTopWidth: 1,
    borderTopColor: "#eaecef",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: "#d2ebfc",
  },
  tabLabelActive: {
    color: "#005fa2",
    fontSize: 12,
    fontWeight: "700",
  },
  filter: { flexDirection: "row", borderRadius: 12, backgroundColor: c.low, padding: 4, gap: 6 },
  fBtn: { flex: 1, alignItems: "center", borderRadius: 8, paddingVertical: 10 },
  fBtnActive: { backgroundColor: c.primary },
  fTxt: { color: c.muted, fontWeight: "700" },
  fTxtActive: { color: "#fff" },
  error: { color: "#93000a", backgroundColor: c.error, padding: 8, borderRadius: 8 },

  // Premium Redesigned Profile Mock Styles
  mockProfileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#eaecef",
    alignItems: "center",
    shadowColor: "#1d3557",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  mockAvatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
  },
  mockAvatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  mockBloodBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#b7102a",
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mockBloodBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  mockProfileName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#001b3c",
    marginTop: 16,
    textAlign: "center",
  },
  mockProfileSubtitle: {
    fontSize: 13,
    color: "#5b403f",
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
  mockDonationBadge: {
    backgroundColor: "rgba(163, 216, 254, 0.3)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 14,
  },
  mockDonationBadgeText: {
    color: "#005fa2",
    fontSize: 12,
    fontWeight: "700",
  },
  mockHistoryTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#001b3c",
    marginTop: 24,
    marginBottom: 4,
  },
  mockTimelineContainer: {
    position: "relative",
    paddingLeft: 2,
    marginTop: 12,
  },
  mockTimelineLine: {
    position: "absolute",
    left: 19,
    top: 24,
    bottom: 24,
    width: 2,
    backgroundColor: "rgba(228, 190, 188, 0.4)",
  },
  mockTimelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mockTimelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    zIndex: 10,
  },
  mockTimelineCard: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eaecef",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  mockTimelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mockTimelineLocation: {
    fontSize: 15,
    fontWeight: "700",
    color: "#001b3c",
    flex: 1,
    marginRight: 8,
  },
  mockTimelineDateBadge: {
    backgroundColor: "#EBF3FC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mockTimelineDateText: {
    color: "#2b6485",
    fontSize: 10,
    fontWeight: "700",
  },
  mockTimelineType: {
    fontSize: 12,
    color: "#5b403f",
    marginTop: 4,
  },
  mockLoadOlderBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EBF3FC",
    alignItems: "center",
    justifyContent: "center",
  },
  mockLoadOlderText: {
    color: "#2b6485",
    fontSize: 14,
    fontWeight: "700",
  },
  mockEditProfileBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E4BEBC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mockEditProfileText: {
    color: "#b7102a",
    fontSize: 14,
    fontWeight: "700",
  },
  mockLogoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  mockLogoutText: {
    color: "#b7102a",
    fontSize: 16,
    fontWeight: "700",
  }
});

const markerAppearance = {
  minWidth: 176,
  bubbleMinHeight: 52,
  pinWidth: 6,
  pinHeight: 10,
  iconSize: 15,
  blood: {
    border: "#b7102a",
    selectedBg: "#FFF0F0",
  },
  oxygen: {
    border: "#2b6485",
    selectedBg: "#EAF5FC",
  },
  critical: {
    border: "#ff003c",
    bg: "#ffe5ec",
    shadow: "#ff003c",
    text: "#ff003c",
  },
} as const;

const mStyles = StyleSheet.create({
  userLocationBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 95, 162, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  userLocationInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#005fa2",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  markerRoot: {
    minWidth: markerAppearance.minWidth,
    minHeight: markerAppearance.bubbleMinHeight + markerAppearance.pinHeight,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  markerBubble: {
    minWidth: markerAppearance.minWidth,
    minHeight: markerAppearance.bubbleMinHeight,
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    gap: 3,
  },
  markerTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  markerDash: {
    fontSize: 11,
    fontWeight: "700",
    color: "#001b3c",
    marginHorizontal: -1,
  },
  markerHospital: {
    fontSize: 10,
    fontWeight: "700",
    color: "#001b3c",
    lineHeight: 13,
  },
  markerClusterCount: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2b6485",
    marginTop: 2,
  },
  bloodMarker: {
    borderColor: markerAppearance.blood.border,
  },
  oxygenMarker: {
    borderColor: markerAppearance.oxygen.border,
  },
  selectedMarker: {
    borderWidth: 3,
  },
  markerLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#001b3c",
    paddingRight: 2,
  },
  criticalMarker: {
    borderColor: markerAppearance.critical.border,
    backgroundColor: markerAppearance.critical.bg,
    borderWidth: 3,
    shadowColor: markerAppearance.critical.shadow,
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  criticalText: {
    color: markerAppearance.critical.text,
    fontWeight: "900",
  },
  markerPin: {
    width: markerAppearance.pinWidth,
    height: markerAppearance.pinHeight,
    alignSelf: "center",
    marginTop: -2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  capsuleRoot: {
    minWidth: 152,
    maxWidth: 168,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  capsuleBody: {
    minWidth: 152,
    maxWidth: 168,
    borderWidth: 2,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  capsuleTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  capsuleTopText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#001b3c",
  },
  capsuleHospital: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "700",
    color: "#001b3c",
  },
  capsuleCritical: {
    backgroundColor: markerAppearance.critical.bg,
  },
  capsuleCriticalText: {
    color: "#ffffff",
  },
  capsulePin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -2,
  },
  calloutWrap: {
    alignItems: "center",
    paddingBottom: 2,
  },
  iconMarkerWrap: {
    width: 64,
    minHeight: 62,
    paddingTop: 2,
    paddingBottom: 6,
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "visible",
  },
  iconMarkerBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },
  iconMarkerCritical: {
    backgroundColor: markerAppearance.critical.bg,
  },
  iconMarkerDrop: {
    width: 12,
    height: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: "45deg" }],
    marginTop: -1,
  },
  iconMarkerPulseDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
  },
  iconMarkerBadge: {
    marginTop: 4,
    minWidth: 46,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 2,
    elevation: 3,
  },
  iconMarkerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconMarkerBadgeDrop: {
    width: 7,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    transform: [{ rotate: "45deg" }],
    marginTop: -1,
  },
  iconMarkerBadgePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  iconMarkerBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ffffff",
  },
  iconMarkerCountPill: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  iconMarkerCountText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: -1,
  },
  simpleMarkerPill: {
    width: 92,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 2,
  },
  simpleMarkerPillCritical: {
    backgroundColor: markerAppearance.critical.bg,
    borderColor: markerAppearance.critical.border,
  },
  simpleMarkerPillText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "800",
    color: "#001b3c",
    textAlign: "center",
  },
  simpleMarkerPillTextCritical: {
    color: markerAppearance.critical.text,
  },
  floatingFilterCard: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eaecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  selectedMarkerOverlay: {
    position: "absolute",
    top: 168,
    left: 16,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4bebc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 9,
  },
  selectedMarkerOverlayText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#001b3c",
  },
  mapIconMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  mapIconMarkerText: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#001b3c",
  },
  filterTabButton: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eaecef",
  },
  filterTabActive: {
    backgroundColor: "#005fa2",
    borderColor: "#005fa2",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5b403f",
  },
  filterTabTextActive: {
    color: "#ffffff",
  },
  floatingFabContainer: {
    position: "absolute",
    right: 16,
    bottom: 220,
    gap: 12,
    zIndex: 10,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eaecef",
  },
  floatingDetailCard: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eaecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 10,
  },
  detailCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  urgencyBadge: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detailsCapsuleRow: {
    marginBottom: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#F9FAFB",
  },
  detailsCapsuleText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#001b3c",
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#001b3c",
  },
  patientName: {
    fontSize: 13,
    color: "#5b403f",
    marginTop: 4,
  },
  patientMeta: {
    fontSize: 12,
    color: "#5b6472",
    marginTop: 4,
    fontWeight: "600",
  },
  clusterNavRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clusterNavBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F7F8FC",
    borderWidth: 1,
    borderColor: "#E4BEBC",
    alignItems: "center",
    justifyContent: "center",
  },
  clusterNavBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#b7102a",
    lineHeight: 16,
  },
  detailsBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EBF3FC",
    borderWidth: 1,
    borderColor: "#CBE2FB",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsBtnText: {
    color: "#2b6485",
    fontSize: 14,
    fontWeight: "700",
  },
  directionsBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#b7102a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  directionsBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  floatingSummaryCard: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#eaecef",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    color: "#5b403f",
    lineHeight: 16,
  }
});



