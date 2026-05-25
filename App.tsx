import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Provider } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { store } from "./src/redux/store";
import { useAppDispatch, useAppSelector } from "./src/redux/hooks";
import { bootstrapAuth, loginUser, logoutUser, registerUser } from "./src/redux/slices/authSlice";
import { fetchEmergencyDetails, fetchEmergencyFeed } from "./src/redux/slices/emergencySlice";
import { fetchDonorProfile, fetchDonationHistory } from "./src/redux/slices/donorSlice";
import { fetchNotifications } from "./src/redux/slices/notificationSlice";
import { setProfileInfo } from "./src/redux/slices/profileSettingsSlice";

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

  const selectedEmergency = emergency.selectedRequest ?? emergency.feed.find((x) => x.id === selectedEmergencyId) ?? null;
  const urgentFeed = useMemo(() => emergency.feed.filter((item) => item.status !== "FULFILLED"), [emergency.feed]);

  // Combined verified requests from admin/live feed and fallback items
  const allRequestsList = useMemo(() => {
    const live = emergency.feed.map((item, idx) => {
      const isCritical = item.urgency === "CRITICAL" || item.urgency === "HIGH";
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
        distance: `${(1.2 + idx * 0.8).toFixed(1)} miles away`,
        liveItem: item as any
      };
    });

    const fallbacks = [
      {
        id: "mock-r1",
        patientName: "Sarah Jenkins",
        bloodGroup: "O+",
        unitsRequired: 3,
        hospital: "Central Medical Center",
        urgency: "CRITICAL",
        oxygenNeeded: false,
        contactNumber: "+15550199",
        status: "OPEN",
        backendStatus: "FORWARDED_TO_APP",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        distance: "2.4 miles away",
        liveItem: null as any
      },
      {
        id: "mock-r2",
        patientName: "Robert Chen",
        bloodGroup: "A-",
        unitsRequired: 2,
        hospital: "St. Jude Trauma Care",
        urgency: "HIGH",
        oxygenNeeded: false,
        contactNumber: "+15550244",
        status: "OPEN",
        backendStatus: "FORWARDED_TO_APP",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        distance: "5.1 miles away",
        liveItem: null as any
      },
      {
        id: "mock-r3",
        patientName: "Maria Rodriguez",
        bloodGroup: "B+",
        unitsRequired: 5,
        hospital: "Metro Pulmonary Clinic",
        urgency: "MEDIUM",
        oxygenNeeded: true, // Oxygen Request!
        contactNumber: "+15550388",
        status: "OPEN",
        backendStatus: "FORWARDED_TO_APP",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        distance: "4.8 miles away",
        liveItem: null as any
      },
      {
        id: "mock-r4",
        patientName: "David Kim",
        bloodGroup: "AB-",
        unitsRequired: 1,
        hospital: "City Red Cross",
        urgency: "LOW",
        oxygenNeeded: false,
        contactNumber: "+15550422",
        status: "FULFILLED", // Resolved!
        backendStatus: "RESOLVED",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        distance: "0.8 miles away",
        liveItem: null as any
      },
      {
        id: "mock-r5",
        patientName: "Elena Rostova",
        bloodGroup: "O-",
        unitsRequired: 10,
        hospital: "General Hospital",
        urgency: "CRITICAL",
        oxygenNeeded: true, // Oxygen Request!
        contactNumber: "+15550577",
        status: "FULFILLED", // Resolved!
        backendStatus: "RESOLVED",
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString(), // 1.5 days ago
        distance: "2.1 miles away",
        liveItem: null as any
      }
    ];

    const combined = [...live];
    for (const fb of fallbacks) {
      if (!combined.some(x => x.id === fb.id || (x.hospital === fb.hospital && x.patientName === fb.patientName))) {
        combined.push(fb);
      }
    }
    return combined;
  }, [emergency.feed]);

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

  // Combine live feed with mockup cards as fallback so the visual is exactly like the image
  const requestsToShow = useMemo(() => {
    const live = urgentFeed.map((item, idx) => {
      const isCritical = item.urgency === "CRITICAL" || item.urgency === "HIGH";
      return {
        id: item.id,
        hospital: item.hospital,
        unit: item.patientName ? `Patient: ${item.patientName}` : "Main Campus",
        bloodGroup: item.bloodGroup as any,
        stockStatus: isCritical ? "Critical Stock" : "Low Stock",
        distance: `${(1.2 + idx * 1.5).toFixed(1)} miles away`,
        isCritical,
        liveItem: item as any
      };
    });

    if (live.length >= 3) {
      return live.slice(0, 4);
    }

    const fallbacks = [
      {
        id: "mock-1",
        hospital: "Central Medical Center",
        unit: "Main Campus - Unit 4B",
        bloodGroup: "O+" as any,
        stockStatus: "Critical Stock",
        distance: "2.4 miles away",
        isCritical: true,
        liveItem: null as any
      },
      {
        id: "mock-2",
        hospital: "St. Jude Trauma Care",
        unit: "Emergency Ward",
        bloodGroup: "AB-" as any,
        stockStatus: "Critical Stock",
        distance: "5.1 miles away",
        isCritical: true,
        liveItem: null as any
      },
      {
        id: "mock-3",
        hospital: "City Red Cross",
        unit: "Community Hub",
        bloodGroup: "A+" as any,
        stockStatus: "Low Stock",
        distance: "0.8 miles away",
        isCritical: false,
        liveItem: null as any
      }
    ];

    const combined = [...live];
    for (const fb of fallbacks) {
      if (combined.length < 3 && !combined.some(x => x.bloodGroup === fb.bloodGroup && x.hospital === fb.hospital)) {
        combined.push(fb);
      }
    }
    return combined as Array<{
      id: string;
      hospital: string;
      unit: string;
      bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
      stockStatus: string;
      distance: string;
      isCritical: boolean;
      liveItem: any;
    }>;
  }, [urgentFeed]);

  const historyToRenderInApp = useMemo(() => {
    const defaultHistory = [
      {
        id: "mock-h1",
        location: "City General Hospital",
        type: "Whole Blood Donation",
        date: "Feb 14, 2024",
        isRed: true,
      },
      {
        id: "mock-h2",
        location: "Red Cross Mobile Unit",
        type: "Plasma Donation",
        date: "Nov 20, 2023",
        isRed: false,
      },
      {
        id: "mock-h3",
        location: "Northside Medical Center",
        type: "Whole Blood Donation",
        date: "Aug 05, 2023",
        isRed: true,
      },
    ];
    if (donor.history && donor.history.length > 0) {
      return donor.history.map((item, idx) => ({
        id: item.id,
        location: item.location,
        type: item.units ? `${item.units} Unit(s) - Whole Blood` : "Whole Blood Donation",
        date: new Date(item.donatedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        isRed: idx % 2 === 0
      }));
    }
    return defaultHistory;
  }, [donor.history]);

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
            <View style={s.topLeftBrand}>
              <Text style={s.logoRegular}>bloodtype </Text>
              <Text style={s.logoBold}>LifeStream</Text>
            </View>
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

      <ScrollView
        contentContainerStyle={[s.content, !isAuth && s.withTabs]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
                Your commitment to donating blood is saving lives every month. You are a community hero.
              </Text>
              <View style={s.impactStatsRow}>
                <View style={s.impactStatItem}>
                  <Text style={s.impactStatNumber}>
                    {donor.history.length > 0 ? donor.history.length : "12"}
                  </Text>
                  <Text style={s.impactStatLabel}>Donations</Text>
                </View>
                <View style={s.impactStatDivider} />
                <View style={s.impactStatItem}>
                  <Text style={s.impactStatNumber}>
                    {donor.history.length > 0 ? donor.history.length * 3 : "36"}
                  </Text>
                  <Text style={s.impactStatLabel}>Lives Saved</Text>
                </View>
              </View>
            </View>

            {/* Next Eligibility Card */}
            <View style={s.eligibilityCard}>
              <Text style={s.eligibilityTitle}>Next Eligibility</Text>
              <Text style={s.eligibilitySubtitle}>
                You are eligible to donate in 14 days.
              </Text>
              
              <View style={s.progressBarTrack}>
                <View style={[s.progressBarFill, { width: "70%" }]} />
              </View>
              
              <View style={s.eligibilityDatesRow}>
                <Text style={s.eligibilityDateText}>Last: Oct 12</Text>
                <Text style={s.eligibilityDateText}>Target: Dec 12</Text>
              </View>
            </View>

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

            {/* Live requests status */}
            {emergency.feedStatus === "loading" && urgentFeed.length === 0 ? (
              <View style={{ paddingVertical: 10, alignItems: "center" }}>
                <Text style={s.small}>Loading requests from API...</Text>
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
                    <Text style={s.hospitalName}>{item.hospital}</Text>
                    <Text style={s.hospitalUnit}>{item.unit}</Text>
                  </View>
                </View>

                <View style={s.cardBottom}>
                  <Pressable 
                    style={s.donateButton} 
                    onPress={() => {
                      if (item.liveItem) {
                        setSelectedEmergencyId(item.liveItem.id);
                        setRoute("requestDetails");
                      } else {
                        setRoute("map");
                      }
                    }}
                  >
                    <Text style={s.donateButtonText}>Donate Now</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </Pressable>
                  <Pressable style={s.locateButton} onPress={() => setRoute("map")}>
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

        {!isAuth && route === "map" && (
          <View style={s.stack}>
            <View style={s.sectionHeader}>
              <View style={s.sectionHeaderLeft}>
                <Ionicons name="map-outline" size={22} color="#b7102a" style={{ marginRight: 8 }} />
                <Text style={s.sectionTitle}>Blood Request Map</Text>
              </View>
            </View>
            <Text style={s.muted}>Requests from live feed ({urgentFeed.length})</Text>
            {urgentFeed.map((item) => (
              <Pressable
                key={item.id}
                style={s.mapCard}
                onPress={() => {
                  setSelectedEmergencyId(item.id);
                  setRoute("requestDetails");
                }}
              >
                <View style={s.mapCardLeft}>
                  <View style={s.mapBloodBadge}>
                    <Text style={s.mapBloodText}>{item.bloodGroup}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.mapHospitalName}>{item.hospital}</Text>
                    <Text style={s.mapPatientName}>Patient: {item.patientName}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#5b403f" />
              </Pressable>
            ))}
          </View>
        )}

        {!isAuth && route === "requestDetails" && (
          <View style={s.stack}>
            {/* Urgency Badge */}
            <View style={{ backgroundColor: "#b7102a", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Ionicons name="warning" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>
                URGENT - {selectedEmergency?.bloodGroup ?? "O+"} Needed
              </Text>
            </View>

            {/* Hospital Contact Info */}
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#EAECEF", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#001b3c" }}>
                  {selectedEmergency?.hospital ?? "City Hospital"}
                </Text>
                <Text style={{ fontSize: 13, color: "#5b403f", fontWeight: "500" }}>
                  1.2 miles away • Open 24/7
                </Text>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 4 }}>
                  <Ionicons name="location-outline" size={14} color="#5b403f" style={{ marginTop: 2 }} />
                  <Text style={{ fontSize: 13, color: "#8f6f6e", flex: 1, lineHeight: 17 }}>
                    450 Medical Center Drive, West District, Metro City 10293
                  </Text>
                </View>
              </View>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#d2ebfc", alignItems: "center", justifyContent: "center", marginLeft: 12 }}>
                <Ionicons name="call" size={18} color="#005fa2" />
              </View>
            </View>

            {/* Case Context Card */}
            <View style={{ backgroundColor: "#F0F3FF", borderRadius: 16, padding: 16, gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#5b403f", letterSpacing: 0.8 }}>
                CASE CONTEXT
              </Text>
              <Text style={{ fontSize: 14, color: "#001b3c", lineHeight: 20 }}>
                {selectedEmergency?.patientName 
                  ? `Emergency Surgery - A patient named ${selectedEmergency.patientName} requires ${selectedEmergency.bloodGroup} blood for a scheduled cardiac procedure.` 
                  : `Emergency Surgery - A patient requires ${selectedEmergency?.bloodGroup ?? "O+"} blood for a scheduled cardiac procedure.`}
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
                  Critical Shortage
                </Text>
              </View>
              
              {/* Progress bar track */}
              <View style={{ height: 6, backgroundColor: "rgba(183, 16, 42, 0.1)", borderRadius: 3, overflow: "hidden" }}>
                <View style={{ height: "100%", width: "25%", backgroundColor: "#b7102a", borderRadius: 3 }} />
              </View>
              <Text style={{ fontSize: 12, color: "#b7102a", fontWeight: "600" }}>
                Only 1 unit remaining in stock.
              </Text>
            </View>

            {/* Premium Generated Map Visual */}
            <View style={{ height: 180, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#EAECEF" }}>
              <Image 
                source={require("./src/assets/map_location_card.png")} 
                style={{ width: "100%", height: "100%" }} 
                resizeMode="cover"
              />
            </View>

            {/* Action Buttons */}
            <View style={{ gap: 12, marginTop: 4 }}>
              <Pressable 
                style={{ height: 50, backgroundColor: "#b7102a", borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, elevation: 2, shadowColor: "#b7102a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }}
                onPress={() => setRoute("dashboard")}
              >
                <Ionicons name="heart" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Donate Now</Text>
              </Pressable>
              
              <Pressable 
                style={{ height: 50, backgroundColor: "#EBF3FC", borderWidth: 1, borderColor: "#CBE2FB", borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
                onPress={() => setRoute("map")}
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
                    {reqFilterUrgency === "critical" ? "Critical ✅" : "Critical Only"}
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
                          {item.hospital}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#5b403f", marginTop: 2 }}>
                          Patient: {item.patientName} • Required: {item.unitsRequired} {item.oxygenNeeded ? "Liters" : "Units"}
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
                <Text style={[s.body, { textAlign: "center" }]}>No donations recorded yet.</Text>
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
                Silver Tier Donor • Member since Jan 2022
              </Text>

              {/* Donations Count Badge */}
              <View style={s.mockDonationBadge}>
                <Text style={s.mockDonationBadgeText}>
                  {(donor.history && donor.history.length > 0 ? donor.history.length : 8)} Donations
                </Text>
              </View>
            </View>

            {/* Donation History Section */}
            <Text style={s.mockHistoryTitle}>Donation History</Text>

            {/* Timeline List */}
            <View style={s.mockTimelineContainer}>
              {/* Timeline Line */}
              <View style={s.mockTimelineLine} />

              {historyToRenderInApp.map((item) => (
                <View key={item.id} style={s.mockTimelineItem}>
                  {/* Timeline dot */}
                  <View
                    style={[
                      s.mockTimelineDot,
                      { backgroundColor: item.isRed ? "#b7102a" : "#2b6485" }
                    ]}
                  >
                    <Ionicons name="water" size={16} color="white" />
                  </View>

                  {/* Card content */}
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
  topLeftBrand: { flexDirection: "row", alignItems: "center" },
  logoRegular: { color: c.primary, fontSize: 22, fontWeight: "400" },
  logoBold: { color: c.primary, fontSize: 22, fontWeight: "700" },
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

