import { useEffect } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

import {
  ActiveEmergencyRequestsCard,
  AvailabilitySummaryCard,
  DashboardSkeleton,
  DonationReminderCard,
  NearbyHospitalsCard,
  QuickActionCard,
  WelcomeCard
} from "../../components/dashboard/DashboardWidgets";
import { Screen } from "../../components/ui/Screen";
import { useAuth } from "../../hooks/useAuth";

export function DashboardScreen() {
  const {
    user,
    fetchUserStatus,
    refreshCurrentUser,
    isAuthenticated,
    isBootstrapping
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !user) {
      void refreshCurrentUser();
    }
  }, [isAuthenticated, refreshCurrentUser, user]);

  const refreshing = fetchUserStatus === "loading" && !isBootstrapping;

  const bloodSummary = {
    availableUnits: 124,
    totalCenters: 18
  };

  const oxygenSummary = {
    availableUnits: 67,
    totalCenters: 12
  };

  const activeRequests = [
    { id: "1", bloodGroup: "A+", hospital: "City Care Hospital", location: "2.3 km away" },
    { id: "2", bloodGroup: "O-", hospital: "Lifeline Trauma Center", location: "4.1 km away" }
  ];

  const nearbyHospitals = ["Apollo Community Hospital", "Red Cross Medical Center", "Sunrise MultiCare"];

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-3 pb-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refreshCurrentUser()} />}
      >
        <WelcomeCard userName={user?.fullName ?? "Responder"} />

        {isBootstrapping ? (
          <DashboardSkeleton />
        ) : (
          <View className="gap-3">
            <QuickActionCard onPress={() => {}} />

            <AvailabilitySummaryCard
              title="Blood Availability"
              availableUnits={bloodSummary.availableUnits}
              totalCenters={bloodSummary.totalCenters}
              tint="success"
            />

            <AvailabilitySummaryCard
              title="Oxygen Availability"
              availableUnits={oxygenSummary.availableUnits}
              totalCenters={oxygenSummary.totalCenters}
              tint="warning"
            />

            <ActiveEmergencyRequestsCard requests={activeRequests} />
            <NearbyHospitalsCard hospitals={nearbyHospitals} />
            <DonationReminderCard />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
