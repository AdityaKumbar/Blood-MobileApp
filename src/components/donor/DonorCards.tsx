import { Switch, Text, View } from "react-native";

import type { DonationHistoryItem, DonorEligibility } from "../../types/donor";
import { formatDonationType } from "../../utils/donation";
import { AppButton } from "../ui/AppButton";
import { Card } from "../ui/Card";

export function DonorRegistrationCard({
  isRegistered,
  loading,
  onRegister
}: {
  isRegistered: boolean;
  loading: boolean;
  onRegister: () => void;
}) {
  if (isRegistered) return null;

  return (
    <Card>
      <Text className="text-base font-semibold text-health-text">Become a Donor</Text>
      <Text className="mt-1 text-sm text-health-muted">
        Register as an active donor to receive verified emergency donation requests.
      </Text>
      <View className="mt-3">
        <AppButton label="Register as Donor" loading={loading} onPress={onRegister} />
      </View>
    </Card>
  );
}

export function AvailabilityCard({
  isAvailable,
  loading,
  onToggle
}: {
  isAvailable: boolean;
  loading: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <Card>
      <Text className="text-base font-semibold text-health-text">Availability</Text>
      <View className="mt-3 flex-row items-center justify-between">
        <View className="pr-3">
          <Text className="text-sm font-medium text-health-text">
            {isAvailable ? "Available for donation" : "Not available right now"}
          </Text>
          <Text className="mt-1 text-xs text-health-muted">
            Toggle this to control whether you receive urgent donor requests.
          </Text>
        </View>
        <Switch
          value={isAvailable}
          disabled={loading}
          onValueChange={onToggle}
          trackColor={{ false: "#D8E3EE", true: "#0F766E" }}
          thumbColor="#FFFFFF"
        />
      </View>
    </Card>
  );
}

export function EligibilityCard({ eligibility }: { eligibility: DonorEligibility | null }) {
  return (
    <Card>
      <Text className="text-base font-semibold text-health-text">Eligibility Status</Text>
      <Text className="mt-2 text-sm text-health-muted">
        {eligibility?.isEligible
          ? "You are currently eligible to donate."
          : `Not eligible now${
              eligibility?.nextEligibleDate
                ? `, next eligible on ${new Date(eligibility.nextEligibleDate).toLocaleDateString()}`
                : "."
            }`}
      </Text>
      {eligibility?.reason ? <Text className="mt-1 text-xs text-health-muted">{eligibility.reason}</Text> : null}
    </Card>
  );
}

export function DonationTimelineCard({
  history,
  loading
}: {
  history: DonationHistoryItem[];
  loading: boolean;
}) {
  return (
    <Card>
      <Text className="text-base font-semibold text-health-text">Donation History</Text>
      {loading ? <Text className="mt-2 text-xs text-health-muted">Loading donation timeline...</Text> : null}
      {!loading && history.length === 0 ? (
        <Text className="mt-2 text-sm text-health-muted">No donation till now.</Text>
      ) : null}
      <View className="mt-3 gap-3">
        {history.map((item) => (
          <View key={item.id} className="rounded-xl bg-health-bg px-3 py-3">
            <Text className="text-sm font-semibold text-health-text">{item.location}</Text>
            <Text className="mt-1 text-xs text-health-muted">
              {new Date(item.donatedAt).toLocaleDateString()} - {formatDonationType(item.donationType, item.units)}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
