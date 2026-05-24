import { Pressable, Text, View } from "react-native";

interface AppSelectPillsProps<T extends string> {
  label: string;
  value: T | null;
  options: readonly T[];
  onChange: (value: T) => void;
  error?: string;
}

export function AppSelectPills<T extends string>({
  label,
  value,
  options,
  onChange,
  error
}: AppSelectPillsProps<T>) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-health-text">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isActive = value === option;

          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              className={`min-w-[54px] items-center rounded-xl border px-3 py-2 ${
                isActive
                  ? "border-health-accent bg-health-surfaceSoft"
                  : "border-health-border bg-health-surface"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isActive ? "text-health-accentDark" : "text-health-text"
                }`}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="mt-1 text-xs text-brand-600">{error}</Text> : null}
    </View>
  );
}
