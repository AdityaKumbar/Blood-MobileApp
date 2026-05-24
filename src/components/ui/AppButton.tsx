import { ActivityIndicator, Pressable, Text } from "react-native";
import { memo } from "react";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export const AppButton = memo(function AppButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary"
}: AppButtonProps) {
  const isSecondary = variant === "secondary";
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`h-12 items-center justify-center rounded-xl ${
        isSecondary ? "border border-health-border bg-health-surface" : "bg-brand-600"
      } ${isDisabled ? "opacity-60" : "opacity-100"}`}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? "#0f172a" : "#ffffff"} />
      ) : (
        <Text
          className={`text-base font-semibold ${isSecondary ? "text-health-text" : "text-white"}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
});
