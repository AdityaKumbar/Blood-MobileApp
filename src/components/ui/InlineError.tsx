import { Text } from "react-native";

interface InlineErrorProps {
  message: string;
}

export function InlineError({ message }: InlineErrorProps) {
  return (
    <Text className="mb-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{message}</Text>
  );
}
