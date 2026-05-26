import { useEffect } from "react";
import { FlatList, Text, View } from "react-native";

import { Card } from "../../components/ui/Card";
import { Screen } from "../../components/ui/Screen";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchEmergencyFeed } from "../../redux/slices/emergencySlice";

export function EmergencyFeedScreen() {
  const dispatch = useAppDispatch();
  const updates = useAppSelector((state) => state.emergency.feed);

  useEffect(() => {
    void dispatch(fetchEmergencyFeed());
  }, [dispatch]);

  return (
    <Screen>
      <Text className="text-2xl font-bold text-health-text">Emergency Feed</Text>
      <Text className="mt-1 text-sm text-health-muted">
        Live blood and oxygen emergency notifications.
      </Text>

      <FlatList
        data={updates}
        keyExtractor={(item) => item.id}
        className="mt-4"
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <Card>
            <Text className="text-sm text-health-muted">
              No active emergency updates right now.
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card>
            <Text className="text-base font-semibold text-health-text">
              {item.bloodGroup} - {item.unitsRequired} units
            </Text>
            <Text className="mt-1 text-sm text-health-muted">{item.hospital}</Text>
            <Text className="mt-1 text-xs text-brand-700">{item.isInventory ? "Inventory Stock Request" : `Patient: ${item.patientName}`}</Text>
          </Card>
        )}
      />
    </Screen>
  );
}
