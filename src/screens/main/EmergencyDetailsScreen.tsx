import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { RequestStatusBadge } from "../../components/emergency/RequestStatusBadge";
import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { InfoRow } from "../../components/ui/InfoRow";
import { InlineError } from "../../components/ui/InlineError";
import { Screen } from "../../components/ui/Screen";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { EMERGENCY_ROUTES } from "../../navigation/constants";
import type { EmergencyStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  acceptEmergencyDonation,
  clearEmergencyError,
  fetchEmergencyDetails,
  updateEmergencyStatus
} from "../../redux/slices/emergencySlice";

type Props = EmergencyStackScreenProps<typeof EMERGENCY_ROUTES.EMERGENCY_DETAILS>;

export function EmergencyDetailsScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const { selectedRequest, detailsStatus, updateStatusState, error } = useAppSelector(
    (state) => state.emergency
  );
  const authUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(clearEmergencyError());
    void dispatch(fetchEmergencyDetails(route.params.requestId));
  }, [dispatch, route.params.requestId]);

  const request = selectedRequest?.id === route.params.requestId ? selectedRequest : null;

  const handleStatusUpdate = async (status: "IN_PROGRESS" | "FULFILLED") => {
    await dispatch(updateEmergencyStatus({ requestId: route.params.requestId, status }));
  };

  const handleDonorAccept = async () => {
    const donorName = authUser?.fullName?.trim();
    if (!donorName) return;
    await dispatch(acceptEmergencyDonation({ requestId: route.params.requestId, donorName }));
  };

  return (
    <Screen>
      <SectionHeader
        title="Request Details"
        subtitle="Request timeline and critical response information."
      />

      {error ? <InlineError message={error} /> : null}

      {detailsStatus === "loading" && !request ? (
        <View className="mt-6 items-center">
          <ActivityIndicator color="#B7102A" />
          <Text className="mt-2 text-xs text-health-muted">Loading request details...</Text>
        </View>
      ) : null}

      {request ? (
        <View className="mt-4 gap-3">
          <Card>
            <Text className="text-xs uppercase text-health-muted">Request ID</Text>
            <Text className="mt-1 text-base font-semibold text-health-text">{request.id}</Text>
            <View className="mt-3">
              <RequestStatusBadge status={request.status} />
            </View>
          </Card>

          <Card>
            <Text className="text-xs uppercase text-health-muted">{request.isInventory ? "Type" : "Patient"}</Text>
            <Text className="mt-1 text-base font-semibold text-health-text">{request.isInventory ? "Inventory Stock" : request.patientName}</Text>
            <View className="mt-2">
              <InfoRow label="Hospital" value={request.hospital} />
              <InfoRow label="Contact" value={request.contactNumber} />
            </View>
          </Card>

          <Card className="bg-health-surfaceSoft">
            <Text className="text-xs uppercase text-health-muted">Medical Requirement</Text>
            <Text className="mt-1 text-base font-semibold text-health-text">
              {request.bloodGroup} - {request.unitsRequired} units
            </Text>
            <Text className="mt-2 text-sm text-health-muted">
              Urgency: {request.urgency} {request.oxygenNeeded ? "- Oxygen Needed" : ""}
            </Text>
          </Card>

          <View className="gap-2">
            {authUser?.role === "DONOR" && request.backendStatus === "FORWARDED_TO_APP" ? (
              <AppButton
                label="I Will Donate"
                loading={updateStatusState === "loading"}
                onPress={() => void handleDonorAccept()}
              />
            ) : null}
            <AppButton
              label="Mark In Progress"
              loading={updateStatusState === "loading"}
              disabled={request.status !== "OPEN" || authUser?.role === "DONOR"}
              onPress={() => void handleStatusUpdate("IN_PROGRESS")}
            />
            <AppButton
              label="Mark Fulfilled"
              variant="secondary"
              loading={updateStatusState === "loading"}
              disabled={
                request.status === "FULFILLED" ||
                request.status === "CANCELLED" ||
                authUser?.role === "DONOR"
              }
              onPress={() => void handleStatusUpdate("FULFILLED")}
            />
          </View>
        </View>
      ) : null}

      {!request && detailsStatus !== "loading" ? (
        <View className="mt-4">
          <Card>
            <Text className="text-sm text-health-muted">
              Request not found for ID: {route.params.requestId}
            </Text>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
