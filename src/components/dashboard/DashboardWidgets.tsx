import { Pressable, Text, View } from "react-native";

import { Card } from "../ui/Card";

interface WelcomeCardProps {
  userName: string;
}

export function WelcomeCard({ userName }: WelcomeCardProps) {
  return (
    <Card className="border-0 bg-health-accent p-5">
      <Text className="text-xs font-semibold uppercase tracking-wider text-white/80">
        Home Dashboard
      </Text>
      <Text className="mt-2 text-2xl font-bold text-white">Welcome, {userName}</Text>
      <Text className="mt-1 text-sm text-white/90">
        Stay prepared to respond quickly to blood and oxygen emergencies nearby.
      </Text>
    </Card>
  );
}

interface QuickActionCardProps {
  onPress: () => void;
}

export function QuickActionCard({ onPress }: QuickActionCardProps) {
  return (
    <Card className="p-0">
      <Pressable
        onPress={onPress}
        className="rounded-2xl border border-brand-300 bg-brand-50 px-4 py-4 active:opacity-80"
      >
        <Text className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Emergency
        </Text>
        <Text className="mt-1 text-lg font-bold text-brand-700">Create Emergency Request</Text>
        <Text className="mt-1 text-sm text-health-muted">
          Trigger rapid notifications to donors, hospitals, and blood banks.
        </Text>
      </Pressable>
    </Card>
  );
}

interface AvailabilitySummaryCardProps {
  title: string;
  availableUnits: number;
  totalCenters: number;
  tint: "success" | "warning";
}

export function AvailabilitySummaryCard({
  title,
  availableUnits,
  totalCenters,
  tint
}: AvailabilitySummaryCardProps) {
  const textColor = tint === "success" ? "text-health-success" : "text-health-warning";

  return (
    <Card>
      <Text className="text-xs font-semibold uppercase tracking-wide text-health-muted">{title}</Text>
      <Text className={`mt-2 text-2xl font-bold ${textColor}`}>{availableUnits} units</Text>
      <Text className="mt-1 text-sm text-health-muted">{totalCenters} centers reporting inventory</Text>
    </Card>
  );
}

interface EmergencyRequestItem {
  id: string;
  bloodGroup: string;
  hospital: string;
  location: string;
}

interface ActiveEmergencyRequestsCardProps {
  requests: EmergencyRequestItem[];
}

export function ActiveEmergencyRequestsCard({ requests }: ActiveEmergencyRequestsCardProps) {
  return (
    <Card>
      <Text className="text-base font-semibold text-health-text">Active Emergency Requests</Text>
      <View className="mt-3 gap-3">
        {requests.map((request) => (
          <View key={request.id} className="rounded-xl bg-health-bg px-3 py-3">
            <Text className="text-sm font-semibold text-brand-700">{request.bloodGroup} required</Text>
            <Text className="mt-1 text-sm text-health-text">{request.hospital}</Text>
            <Text className="mt-1 text-xs text-health-muted">{request.location}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

interface NearbyHospitalsCardProps {
  hospitals: string[];
}

export function NearbyHospitalsCard({ hospitals }: NearbyHospitalsCardProps) {
  return (
    <Card>
      <Text className="text-base font-semibold text-health-text">Nearby Hospitals</Text>
      <View className="mt-3 gap-2">
        {hospitals.map((hospital) => (
          <View key={hospital} className="rounded-xl border border-health-border bg-health-surfaceSoft px-3 py-2">
            <Text className="text-sm font-medium text-health-text">{hospital}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function DonationReminderCard() {
  return (
    <Card className="border-health-accent bg-health-surfaceSoft">
      <Text className="text-xs font-semibold uppercase tracking-wide text-health-accent">
        Donation Reminder
      </Text>
      <Text className="mt-2 text-base font-semibold text-health-text">You are eligible in 5 days</Text>
      <Text className="mt-1 text-sm text-health-muted">
        Schedule your next blood donation and help keep critical units available.
      </Text>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <View className="gap-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <Card key={index}>
          <View className="h-3 w-24 rounded-full bg-health-border" />
          <View className="mt-3 h-4 w-2/3 rounded-full bg-health-border" />
          <View className="mt-2 h-4 w-1/2 rounded-full bg-health-border" />
        </Card>
      ))}
    </View>
  );
}
