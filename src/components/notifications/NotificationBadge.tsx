import { Text, View } from "react-native";

import type { NotificationType } from "../../types/notification";

const badgeConfig: Record<NotificationType, { label: string; container: string; text: string }> = {
  EMERGENCY_ALERT: { label: "Emergency", container: "bg-brand-50", text: "text-brand-700" },
  DONATION_REMINDER: { label: "Donation", container: "bg-health-surfaceSoft", text: "text-health-accentDark" },
  APPROVAL: { label: "Approval", container: "bg-emerald-50", text: "text-health-success" }
};

export function NotificationBadge({ type }: { type: NotificationType }) {
  const config = badgeConfig[type];
  return (
    <View className={`self-start rounded-full px-2 py-1 ${config.container}`}>
      <Text className={`text-[10px] font-semibold ${config.text}`}>{config.label}</Text>
    </View>
  );
}
