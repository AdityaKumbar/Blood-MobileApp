import { Text, View } from "react-native";

import type { EligibilityDisplay } from "../../utils/eligibility";

type Props = {
  display: EligibilityDisplay;
  variant?: "nativewind" | "stylesheet";
  styles?: {
    card: object;
    title: object;
    subtitle: object;
    track: object;
    fill: object;
    datesRow: object;
    dateText: object;
  };
};

export function NextEligibilityCard({ display, variant = "nativewind", styles }: Props) {
  if (variant === "stylesheet" && styles) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Next Eligibility</Text>
        <Text style={styles.subtitle}>{display.message}</Text>
        {display.showProgress ? (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${display.progressPercent}%` }]} />
          </View>
        ) : null}
        <View style={styles.datesRow}>
          <Text style={styles.dateText}>{display.lastLabel}</Text>
          <Text style={styles.dateText}>{display.targetLabel}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-[#2b6485] rounded-3xl p-5 shadow-md">
      <Text className="text-lg font-bold text-white">Next Eligibility</Text>
      <Text className="text-[13px] text-white opacity-90 leading-relaxed mt-1 mb-4">
        {display.message}
      </Text>
      {display.showProgress ? (
        <View className="h-[6px] bg-white/20 rounded-full mb-2.5 overflow-hidden">
          <View
            className="h-full bg-[#a3d8fe] rounded-full"
            style={{ width: `${display.progressPercent}%` }}
          />
        </View>
      ) : null}
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] text-white/85 font-medium">{display.lastLabel}</Text>
        <Text className="text-[11px] text-white/85 font-medium">{display.targetLabel}</Text>
      </View>
    </View>
  );
}
