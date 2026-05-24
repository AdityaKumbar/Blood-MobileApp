import { Text, View } from "react-native";

import type { EmergencyRequestStatus } from "../../types/emergency";

interface RequestStatusBadgeProps {
  status: EmergencyRequestStatus;
}

const statusStyles: Record<
  EmergencyRequestStatus,
  { label: string; containerClassName: string; textClassName: string }
> = {
  OPEN: { label: "Open", containerClassName: "bg-brand-50", textClassName: "text-brand-700" },
  IN_PROGRESS: {
    label: "In Progress",
    containerClassName: "bg-health-surfaceSoft",
    textClassName: "text-health-accentDark"
  },
  FULFILLED: {
    label: "Fulfilled",
    containerClassName: "bg-emerald-50",
    textClassName: "text-health-success"
  },
  CANCELLED: { label: "Cancelled", containerClassName: "bg-slate-200", textClassName: "text-slate-700" }
};

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const config = statusStyles[status] ?? statusStyles.OPEN;

  return (
    <View className={`self-start rounded-full px-3 py-1 ${config.containerClassName}`}>
      <Text className={`text-xs font-semibold ${config.textClassName}`}>{config.label}</Text>
    </View>
  );
}
