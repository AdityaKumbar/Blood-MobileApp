import { useEffect, useState, useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

import { EmergencyRequestForm } from "../../components/emergency/EmergencyRequestForm";
import { RequestStatusBadge } from "../../components/emergency/RequestStatusBadge";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { MetricCard } from "../../components/ui/MetricCard";
import { Screen } from "../../components/ui/Screen";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { EMERGENCY_ROUTES } from "../../navigation/constants";
import type { EmergencyStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  clearEmergencyError,
  createEmergencyRequest,
  fetchEmergencyFeed
} from "../../redux/slices/emergencySlice";
import type { CreateEmergencyRequestPayload, EmergencyRequest } from "../../types/emergency";

type Props = EmergencyStackScreenProps<typeof EMERGENCY_ROUTES.EMERGENCY>;

// Belagavi Location Presets to map requests without explicit coordinates
const BELAGAVI_PRESETS = [
  { latitude: 15.8497, longitude: 74.4977 }, // Channamma Circle
  { latitude: 15.8400, longitude: 74.5020 }, // Tilakwadi
  { latitude: 15.8590, longitude: 74.5080 }, // Camp
  { latitude: 15.8320, longitude: 74.5120 }, // Shahapur
  { latitude: 15.8370, longitude: 74.4920 }, // Hindwadi
  { latitude: 15.8200, longitude: 74.4990 }, // Angol
  { latitude: 15.8110, longitude: 74.4820 }  // Udyambag
];

export function EmergencyScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { feed, createStatus, feedStatus, error } = useAppSelector((state) => state.emergency);
  const connectionStatus = useAppSelector((state) => state.realtime.connectionStatus);
  const activeCount = feed.filter((item) => item.status === "OPEN" || item.status === "IN_PROGRESS").length;

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedMapRequest, setSelectedMapRequest] = useState<EmergencyRequest | null>(null);

  useEffect(() => {
    void dispatch(fetchEmergencyFeed());
  }, [dispatch]);

  const handleCreateRequest = async (payload: CreateEmergencyRequestPayload) => {
    dispatch(clearEmergencyError());
    await dispatch(createEmergencyRequest(payload)).unwrap();
  };

  // Maps coordinates to feed items, fallback to presets if missing
  const geolocatedFeed = useMemo(() => {
    const getRealCoordinates = (hospitalName: string, createdLat: any, createdLng: any, idx: number) => {
      let lat = createdLat != null ? Number(createdLat) : null;
      let lng = createdLng != null ? Number(createdLng) : null;
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }

      const name = (hospitalName || "").toLowerCase();
      if (name.includes("kle")) {
        return { latitude: 15.887074, longitude: 74.519596 }; // Real KLE Hospital
      }
      if (name.includes("venugram")) {
        return { latitude: 15.825873, longitude: 74.497471 }; // Real Venugram Hospital
      }
      if (name.includes("lifestream") || name.includes("system admin")) {
        return { latitude: 15.8352169, longitude: 74.5067137 }; // Real LifeStream Blood Bank
      }

      const preset = BELAGAVI_PRESETS[idx % BELAGAVI_PRESETS.length];
      return { latitude: preset.latitude, longitude: preset.longitude };
    };

    return feed.map((item, idx) => {
      const coords = getRealCoordinates(item.hospital, item.latitude, item.longitude, idx);
      return {
        ...item,
        latitude: coords.latitude,
        longitude: coords.longitude
      };
    });
  }, [feed]);

  const handleOpenDirections = (req: any) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${req.latitude},${req.longitude}`,
      android: `geo:0,0?q=${req.latitude},${req.longitude}(${encodeURIComponent(req.hospital)})`,
      default: `https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`
    });
    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`);
    });
  };

  const renderRequest = ({ item }: { item: EmergencyRequest }) => (
    <Pressable
      className="active:opacity-80"
      onPress={() => navigation.navigate(EMERGENCY_ROUTES.EMERGENCY_DETAILS, { requestId: item.id })}
    >
      <Card>
        <View className="flex-row items-start justify-between">
          <Text className="text-base font-semibold text-health-text">
            {item.bloodGroup} - {item.unitsRequired} units
          </Text>
          <RequestStatusBadge status={item.status} />
        </View>
        <Text className="mt-2 text-sm text-health-text">{item.hospital}</Text>
        <Text className="mt-1 text-xs text-health-muted">{item.isInventory ? "Inventory Stock Request" : `Patient: ${item.patientName}`}</Text>
        <Text className="mt-1 text-xs text-health-muted">Contact: {item.contactNumber}</Text>
        <Text className="mt-1 text-xs text-health-muted">
          Urgency: {item.urgency} {item.oxygenNeeded ? "- Oxygen needed" : ""}
        </Text>
      </Card>
    </Pressable>
  );

  return (
    <Screen padded={false}>
      {/* Header Info */}
      <View className="px-5 pt-4">
        <SectionHeader
          title="Emergency Command Center"
          subtitle="Dispatch cases instantly or monitor active geolocations."
          variant="solid"
        />

        <View className="mt-3 flex-row gap-3">
          <MetricCard label="Live Connection" value={connectionStatus.toLowerCase()} />
          <MetricCard label="Active Requests" value={`${activeCount} cases`} />
        </View>

        {error ? <InlineError message={error} /> : null}

        {/* View Switch Toggle */}
        <View className="flex-row mt-4 p-1.5 bg-[#f1f3f6] rounded-2xl border border-gray-200">
          <Pressable
            onPress={() => setViewMode("list")}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
              viewMode === "list" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Ionicons
              name="list"
              size={15}
              color={viewMode === "list" ? "#b7102a" : "#8f6f6e"}
              style={{ marginRight: 6 }}
            />
            <Text
              className={`text-xs font-bold ${
                viewMode === "list" ? "text-health-text" : "text-health-muted"
              }`}
            >
              List View
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("map")}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
              viewMode === "map" ? "bg-white shadow-sm" : ""
            }`}
          >
            <Ionicons
              name="map"
              size={15}
              color={viewMode === "map" ? "#b7102a" : "#8f6f6e"}
              style={{ marginRight: 6 }}
            />
            <Text
              className={`text-xs font-bold ${
                viewMode === "map" ? "text-health-text" : "text-health-muted"
              }`}
            >
              Google Maps
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Screen Mode Contents */}
      {viewMode === "list" ? (
        <FlatList
          className="flex-1 mt-3 px-5"
          data={feed}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-16"
          ItemSeparatorComponent={() => <View className="h-3" />}
          refreshControl={
            <RefreshControl
              refreshing={feedStatus === "loading"}
              onRefresh={() => {
                void dispatch(fetchEmergencyFeed());
              }}
            />
          }
          ListHeaderComponent={
            <View>
              <View className="mt-2 mb-4">
                <Card className="rounded-3xl border border-[#e4bebc] bg-[#fff5f5]">
                  <Text className="mb-3 text-base font-bold text-[#b7102a]">
                    Create Emergency Request
                  </Text>
                  <EmergencyRequestForm
                    loading={createStatus === "loading"}
                    onSubmit={handleCreateRequest}
                  />
                </Card>
              </View>

              <Text className="mb-2.5 mt-2 text-lg font-bold text-[#001b3c]">
                Live Emergency Feed
              </Text>
              {feedStatus === "loading" && feed.length === 0 ? (
                <View className="mb-4 mt-2 items-center">
                  <ActivityIndicator color="#DC2626" />
                  <Text className="mt-2 text-xs text-health-muted">
                    Loading emergency feed...
                  </Text>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            feedStatus === "loading" ? null : (
              <Card className="border-l-4 border-l-[#b7102a]">
                <Text className="text-sm text-health-muted">
                  No active emergency requests right now.
                </Text>
              </Card>
            )
          }
          renderItem={renderRequest}
        />
      ) : (
        /* Map View Section */
        <View className="flex-1 mt-4 relative bg-gray-50 overflow-hidden">
          <MapView
            className="w-full h-full"
            initialRegion={{
              latitude: 15.8497,
              longitude: 74.4977,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08
            }}
          >
            {geolocatedFeed.map((req) => {
              const isBlood = !req.oxygenNeeded;
              const markerColor = isBlood ? "#b7102a" : "#2b6485";
              return (
                <Marker
                  key={req.id}
                  coordinate={{ latitude: req.latitude!, longitude: req.longitude! }}
                  title={req.hospital}
                  description={`${req.bloodGroup} - ${req.unitsRequired} Units required`}
                  pinColor={markerColor}
                  onPress={() => setSelectedMapRequest(req)}
                />
              );
            })}
          </MapView>

          {/* Map Overlay Card */}
          {selectedMapRequest ? (
            <View className="absolute bottom-6 left-5 right-5 bg-white/95 rounded-3xl p-5 border border-[#e4bebc] shadow-xl backdrop-blur-md">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <View className="flex-row items-center gap-x-2">
                    <View
                      className={`px-2 py-0.5 rounded-md ${
                        selectedMapRequest.oxygenNeeded ? "bg-[#e2f1fd]" : "bg-[#fff0f0]"
                      }`}
                    >
                      <Text
                        className={`text-[9px] font-bold uppercase ${
                          selectedMapRequest.oxygenNeeded ? "text-[#2b6485]" : "text-[#b7102a]"
                        }`}
                      >
                        {selectedMapRequest.oxygenNeeded ? "Oxygen" : "Blood"}
                      </Text>
                    </View>
                    <View className="px-2 py-0.5 rounded-md bg-gray-100">
                      <Text className="text-[9px] font-bold text-gray-600 uppercase">
                        {selectedMapRequest.urgency}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-base font-bold text-[#001b3c] mt-2">
                    {selectedMapRequest.hospital}
                  </Text>
                  <Text className="text-xs text-health-muted mt-0.5">
                    {selectedMapRequest.isInventory ? "Inventory Stock" : `Patient: ${selectedMapRequest.patientName}`} • Group: {selectedMapRequest.bloodGroup}
                  </Text>
                  <Text className="text-xs font-bold text-[#b7102a] mt-1.5">
                    Required: {selectedMapRequest.unitsRequired} {selectedMapRequest.oxygenNeeded ? "Units" : "Bags"}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setSelectedMapRequest(null)}
                  className="p-1 rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={16} color="#5b403f" />
                </Pressable>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-x-2 mt-4">
                {selectedMapRequest.contactNumber ? (
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${selectedMapRequest.contactNumber}`)}
                    className="flex-1 h-10 bg-brand-50 border border-brand-100 rounded-xl items-center justify-center flex-row"
                  >
                    <Ionicons name="call" size={13} color="#0d9488" style={{ marginRight: 4 }} />
                    <Text className="text-[11px] font-bold text-[#0d9488]">Call</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() => handleOpenDirections(selectedMapRequest)}
                  className="flex-1 h-10 bg-rose-50 border border-rose-100 rounded-xl items-center justify-center flex-row"
                >
                  <Ionicons name="navigate" size={13} color="#b7102a" style={{ marginRight: 4 }} />
                  <Text className="text-[11px] font-bold text-rose-700">Navigate</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    const reqId = selectedMapRequest.id;
                    setSelectedMapRequest(null);
                    navigation.navigate(EMERGENCY_ROUTES.EMERGENCY_DETAILS, { requestId: reqId });
                  }}
                  className="flex-1 h-10 bg-[#b7102a] rounded-xl items-center justify-center flex-row"
                >
                  <Text className="text-[11px] font-bold text-white">Donate</Text>
                  <Ionicons name="chevron-forward" size={12} color="#fff" style={{ marginLeft: 2 }} />
                </Pressable>
              </View>
            </View>
          ) : (
            /* Mini Guide Badge when no marker is selected */
            <View className="absolute top-4 left-5 bg-white/90 border border-gray-200 px-3.5 py-2 rounded-full shadow-sm">
              <Text className="text-[10px] font-semibold text-health-text">
                📍 Tap pins to view emergency cases in Belagavi
              </Text>
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}
