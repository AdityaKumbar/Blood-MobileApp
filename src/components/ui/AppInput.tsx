import { useEffect, useMemo, useState } from "react";
import type { KeyboardTypeOptions, TextInputProps } from "react-native";
import { Pressable, Text, TextInput, View } from "react-native";

interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  showPasswordToggle?: boolean;
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  containerClassName?: string;
}

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  showPasswordToggle = false,
  textContentType,
  autoComplete,
  autoCapitalize,
  returnKeyType,
  onSubmitEditing,
  containerClassName = ""
}: AppInputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  useEffect(() => {
    setIsSecure(secureTextEntry);
  }, [secureTextEntry]);

  const resolvedAutoCapitalize = useMemo(() => {
    if (autoCapitalize) {
      return autoCapitalize;
    }

    if (keyboardType === "email-address") {
      return "none";
    }

    return "sentences";
  }, [autoCapitalize, keyboardType]);

  const shouldShowPasswordToggle = secureTextEntry && showPasswordToggle;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-health-muted">{label}</Text>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8f6f6e"
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={resolvedAutoCapitalize}
          autoCorrect={false}
          textContentType={textContentType}
          autoComplete={autoComplete}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          importantForAutofill={textContentType ? "yes" : "noExcludeDescendants"}
          accessibilityLabel={label}
          className={`h-12 rounded-xl border bg-health-surface px-4 text-base text-health-text ${
            shouldShowPasswordToggle ? "pr-20" : ""
          } ${error ? "border-brand-600" : "border-health-border"}`}
        />

        {shouldShowPasswordToggle ? (
          <Pressable
            onPress={() => setIsSecure((current) => !current)}
            className="absolute right-3 top-3 rounded-md px-2 py-1"
            accessibilityRole="button"
          >
            <Text className="text-xs font-semibold text-health-accent">
              {isSecure ? "Show" : "Hide"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="mt-1 text-xs text-brand-600">{error}</Text> : null}
    </View>
  );
}
