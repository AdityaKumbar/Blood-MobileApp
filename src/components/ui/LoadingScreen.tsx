import { ActivityIndicator, Text, View } from "react-native";

import { Screen } from "./Screen";

interface LoadingScreenProps {
  label?: string;
}

export function LoadingScreen({ label = "Loading..." }: LoadingScreenProps) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="text-sm text-health-muted">{label}</Text>
      </View>
    </Screen>
  );
}
