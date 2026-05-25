import { Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  variant?: "soft" | "solid";
}

export function SectionHeader({ title, subtitle, variant = "soft" }: SectionHeaderProps) {
  const isSolid = variant === "solid";

  return (
    <View
      className={`rounded-3xl border p-5 ${isSolid ? "border-brand-700 bg-brand-600" : "border-health-border bg-health-surfaceSoft"}`}
      style={{
        shadowColor: "#1D3557",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isSolid ? 0.2 : 0.08,
        shadowRadius: 16,
        elevation: 4
      }}
    >
      <Text className={`text-2xl font-bold ${isSolid ? "text-white" : "text-health-text"}`}>{title}</Text>
      {subtitle ? (
        <Text className={`mt-1 text-sm ${isSolid ? "text-red-100" : "text-health-muted"}`}>{subtitle}</Text>
      ) : null}
    </View>
  );
}
