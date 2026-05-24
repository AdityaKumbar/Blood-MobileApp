import { View } from "react-native";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <View className={`rounded-lg bg-health-border/60 ${className}`} />;
}
