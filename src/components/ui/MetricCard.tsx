import { Text, View } from "react-native";

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <View
      className="flex-1 rounded-3xl border border-health-border bg-health-surface p-4"
      style={{
        shadowColor: "#1D3557",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2
      }}
    >
      <Text className="text-xs uppercase tracking-wide text-health-muted">{label}</Text>
      <Text className="mt-2 text-2xl font-bold text-health-text">{value}</Text>
      {hint ? <Text className="mt-1 text-xs text-health-muted">{hint}</Text> : null}
    </View>
  );
}

