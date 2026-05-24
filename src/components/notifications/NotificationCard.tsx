import { Pressable, Text, View } from "react-native";

import type { AppNotification } from "../../types/notification";
import { Card } from "../ui/Card";
import { NotificationBadge } from "./NotificationBadge";

interface NotificationCardProps {
  item: AppNotification;
  onPress: () => void;
}

export function NotificationCard({ item, onPress }: NotificationCardProps) {
  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <Card>
        <View className="flex-row items-start justify-between">
          <NotificationBadge type={item.type} />
          {!item.read ? <View className="h-2.5 w-2.5 rounded-full bg-brand-600" /> : null}
        </View>
        <Text className="mt-2 text-base font-semibold text-health-text">{item.title}</Text>
        <Text className="mt-1 text-sm text-health-muted">{item.subtitle}</Text>
      </Card>
    </Pressable>
  );
}
