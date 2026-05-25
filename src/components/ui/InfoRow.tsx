import { Text, View } from "react-native";

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-3 py-1">
      <Text className="text-xs uppercase tracking-wide text-health-muted">{label}</Text>
      <Text className="max-w-[65%] text-right text-sm font-medium text-health-text">{value}</Text>
    </View>
  );
}

