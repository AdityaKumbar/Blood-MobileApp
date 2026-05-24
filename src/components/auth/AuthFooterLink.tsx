import { Pressable, Text, View } from "react-native";

interface AuthFooterLinkProps {
  prompt: string;
  linkLabel: string;
  onPress: () => void;
}

export function AuthFooterLink({ prompt, linkLabel, onPress }: AuthFooterLinkProps) {
  return (
    <View className="flex-row items-center justify-center">
      <Text className="text-sm text-health-muted">{prompt} </Text>
      <Pressable onPress={onPress} accessibilityRole="button">
        <Text className="text-sm font-semibold text-health-accent">{linkLabel}</Text>
      </Pressable>
    </View>
  );
}
