import type { PropsWithChildren } from "react";
import { View } from "react-native";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <View
      className={`rounded-3xl border border-health-border bg-health-surface p-4 ${className}`}
      style={{
        shadowColor: "#1D3557",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2
      }}
    >
      {children}
    </View>
  );
}
