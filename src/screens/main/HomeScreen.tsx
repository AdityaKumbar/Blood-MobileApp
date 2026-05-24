import { useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "../../components/ui/Card";
import { Screen } from "../../components/ui/Screen";
import { RequestStatusBadge } from "../../components/emergency/RequestStatusBadge";
import { HOME_ROUTES } from "../../navigation/constants";
import type { HomeStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchEmergencyFeed } from "../../redux/slices/emergencySlice";

type Props = HomeStackScreenProps<typeof HOME_ROUTES.HOME>;

export function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { feed, feedStatus } = useAppSelector((state) => state.emergency);
  const forwardedCount = feed.filter((item) => item.status === "IN_PROGRESS").length;
  const openCount = feed.filter((item) => item.status === "OPEN").length;
  const criticalCount = feed.filter((item) => item.urgency === "HIGH" || item.urgency === "CRITICAL").length;

  useEffect(() => {
    void dispatch(fetchEmergencyFeed());
  }, [dispatch]);

  return (
    <Screen>
      <View className="rounded-3xl bg-health-text p-5">
        <Text className="text-xs uppercase tracking-wide text-slate-200">Control Center</Text>
        <Text className="mt-2 text-2xl font-bold text-white">Response Dashboard</Text>
        <Text className="mt-2 text-sm text-slate-300">Live feed of urgent blood and oxygen needs.</Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        <Card className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs uppercase tracking-wide text-health-muted">Open</Text>
            <Ionicons name="folder-open-outline" size={16} color="#5B6B81" />
          </View>
          <Text className="mt-2 text-2xl font-bold text-health-text">{openCount}</Text>
        </Card>
        <Card className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs uppercase tracking-wide text-health-muted">In Progress</Text>
            <Ionicons name="sync-outline" size={16} color="#5B6B81" />
          </View>
          <Text className="mt-2 text-2xl font-bold text-health-text">{forwardedCount}</Text>
        </Card>
      </View>

      <Card className="mt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-health-text">Critical alerts</Text>
          <Ionicons name="warning-outline" size={16} color="#D97706" />
        </View>
        <Text className="mt-2 text-2xl font-bold text-health-text">{criticalCount}</Text>
      </Card>

      <Text className="mb-2 mt-5 text-lg font-semibold text-health-text">Latest Requests</Text>
      {feedStatus === "loading" && feed.length === 0 ? (
        <View className="mt-2 items-center">
          <ActivityIndicator color="#DC2626" />
          <Text className="mt-2 text-xs text-health-muted">Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={feed.slice(0, 8)}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-8"
          ItemSeparatorComponent={() => <View className="h-3" />}
          refreshControl={
            <RefreshControl
              refreshing={feedStatus === "loading"}
              onRefresh={() => {
                void dispatch(fetchEmergencyFeed());
              }}
            />
          }
          ListEmptyComponent={
            <Card>
              <Text className="text-sm text-health-muted">
                No forwarded or active requests available right now.
              </Text>
            </Card>
          }
          renderItem={({ item }) => (
            <Pressable
              className="active:opacity-80"
              onPress={() =>
                navigation.navigate(HOME_ROUTES.HOME_DETAILS, { requestId: item.id })
              }
            >
              <Card className="rounded-3xl">
                <View className="flex-row items-start justify-between">
                  <Text className="pr-2 text-base font-semibold text-health-text">
                    {item.oxygenNeeded ? "Oxygen" : item.bloodGroup} - {item.unitsRequired} units
                  </Text>
                  <RequestStatusBadge status={item.status} />
                </View>
                <Text className="mt-2 text-sm text-health-text">{item.hospital}</Text>
                <Text className="mt-1 text-xs text-health-muted">Patient: {item.patientName}</Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
