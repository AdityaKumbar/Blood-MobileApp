import { useMemo } from "react";
import { Text, View } from "react-native";

import { Card } from "../../components/ui/Card";
import { Screen } from "../../components/ui/Screen";
import { HOME_ROUTES } from "../../navigation/constants";
import type { HomeStackScreenProps } from "../../navigation/types";
import { useAppSelector } from "../../redux/hooks";
import { RequestStatusBadge } from "../../components/emergency/RequestStatusBadge";

type Props = HomeStackScreenProps<typeof HOME_ROUTES.HOME_DETAILS>;

export function HomeDetailsScreen({ route }: Props) {
  const feed = useAppSelector((state) => state.emergency.feed);
  const request = useMemo(
    () => feed.find((item) => item.id === route.params.requestId) ?? null,
    [feed, route.params.requestId]
  );

  return (
    <Screen>
      <Text className="text-2xl font-bold text-health-text">Request Details</Text>
      <Text className="mt-1 text-sm text-health-muted">
        Live details from website emergency request workflow.
      </Text>

      <View className="mt-4">
        {!request ? (
          <Card>
            <Text className="text-sm text-health-muted">Request not found in current feed.</Text>
          </Card>
        ) : (
          <Card>
            <View className="flex-row items-start justify-between">
              <Text className="text-base font-semibold text-health-text">
                {request.oxygenNeeded ? "Oxygen" : request.bloodGroup} - {request.unitsRequired} units
              </Text>
              <RequestStatusBadge status={request.status} />
            </View>
            <Text className="mt-2 text-sm text-health-text">{request.hospital}</Text>
            <Text className="mt-1 text-xs text-health-muted">Patient: {request.patientName}</Text>
            <Text className="mt-1 text-xs text-health-muted">Urgency: {request.urgency}</Text>
            <Text className="mt-1 text-xs text-health-muted">Contact: {request.contactNumber || "-"}</Text>
          </Card>
        )}
      </View>
    </Screen>
  );
}
