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
      className={`h-14 flex-row items-center justify-center rounded-full ${
        isSecondary ? "border border-health-border bg-health-surfaceSoft" : "bg-brand-600"
      } ${isDisabled ? "opacity-60" : "opacity-100"}`}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? "#001b3c" : "#ffffff"} />
      ) : (
        <Text
          className={`text-base font-semibold tracking-wide ${isSecondary ? "text-health-text" : "text-white"}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
});
