import { useEffect } from "react";
import { Text, View } from "react-native";

import { NotificationBadge } from "../../components/notifications/NotificationBadge";
import { Card } from "../../components/ui/Card";
import { Screen } from "../../components/ui/Screen";
import { NOTIFICATION_ROUTES } from "../../navigation/constants";
import type { NotificationsStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { markNotificationRead } from "../../redux/slices/notificationSlice";

type Props = NotificationsStackScreenProps<typeof NOTIFICATION_ROUTES.NOTIFICATION_DETAILS>;

export function NotificationDetailsScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) =>
    state.notifications.items.find((notification) => notification.id === route.params.notificationId)
  );

  useEffect(() => {
    if (item && !item.read) {
      void dispatch(markNotificationRead(item.id));
    }
  }, [dispatch, item]);

  return (
    <Screen>
      <Text className="text-2xl font-bold text-health-text">Notification Details</Text>
      <Text className="mt-1 text-sm text-health-muted">
        Detailed context for selected notification.
      </Text>

      <View className="mt-4">
        <Card>
          <Text className="text-xs uppercase text-health-muted">Notification ID</Text>
          <Text className="mt-1 text-base font-semibold text-health-text">
            {route.params.notificationId}
          </Text>
          {item ? (
            <View className="mt-3">
              <NotificationBadge type={item.type} />
            </View>
          ) : null}
          <Text className="mt-3 text-sm font-semibold text-health-text">{item?.title ?? "Unknown alert"}</Text>
          <Text className="mt-1 text-sm text-health-muted">{item?.subtitle ?? "No details available."}</Text>
          <Text className="mt-2 text-sm text-health-muted">{item?.body ?? "No extra details available."}</Text>
        </Card>
      </View>
    </Screen>
  );
}
