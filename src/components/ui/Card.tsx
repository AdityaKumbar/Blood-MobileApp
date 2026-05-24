import type { PropsWithChildren } from "react";
import { View } from "react-native";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <View className={`rounded-2xl border border-health-border bg-health-surface p-4 ${className}`}>
      {children}
    </View>
  );
}
