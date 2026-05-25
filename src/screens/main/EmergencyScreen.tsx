import { useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";

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

export function EmergencyScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { feed, createStatus, feedStatus, error } = useAppSelector((state) => state.emergency);
  const connectionStatus = useAppSelector((state) => state.realtime.connectionStatus);
  const activeCount = feed.filter((item) => item.status === "OPEN" || item.status === "IN_PROGRESS").length;

  useEffect(() => {
    void dispatch(fetchEmergencyFeed());
  }, [dispatch]);

  const handleCreateRequest = async (payload: CreateEmergencyRequestPayload) => {
    dispatch(clearEmergencyError());
    await dispatch(createEmergencyRequest(payload)).unwrap();
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
        <Text className="mt-1 text-xs text-health-muted">Patient: {item.patientName}</Text>
        <Text className="mt-1 text-xs text-health-muted">Contact: {item.contactNumber}</Text>
        <Text className="mt-1 text-xs text-health-muted">
          Urgency: {item.urgency} {item.oxygenNeeded ? "- Oxygen needed" : ""}
        </Text>
      </Card>
    </Pressable>
  );

  return (
    <Screen>
      <FlatList
        className="flex-1"
        data={feed}
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
        ListHeaderComponent={
          <View>
            <SectionHeader
              title="Emergency Dashboard"
              subtitle="Dispatch requests fast. Track fulfillment in one command center."
              variant="solid"
            />
            <View className="mt-3 flex-row gap-3">
              <MetricCard label="Live" value={connectionStatus.toLowerCase()} />
              <MetricCard label="Active" value={`${activeCount} cases`} />
            </View>

            {error ? <InlineError message={error} /> : null}

            <View className="mt-4">
              <Card className="rounded-3xl border-brand-100 bg-health-surfaceSoft">
                <Text className="mb-3 text-base font-semibold text-health-text">Create Emergency Request</Text>
                <EmergencyRequestForm loading={createStatus === "loading"} onSubmit={handleCreateRequest} />
              </Card>
            </View>

            <Text className="mb-2 mt-5 text-lg font-semibold text-health-text">Live Emergency Feed</Text>
            {feedStatus === "loading" && feed.length === 0 ? (
              <View className="mb-3 mt-2 items-center">
                <ActivityIndicator color="#DC2626" />
                <Text className="mt-2 text-xs text-health-muted">Loading emergency feed...</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          feedStatus === "loading" ? null : (
      <Card className="border-l-4 border-l-brand-600">
              <Text className="text-sm text-health-muted">No active emergency requests right now.</Text>
            </Card>
          )
        }
        renderItem={renderRequest}
      />
    </Screen>
  );
}
