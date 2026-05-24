import { useEffect } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { NotificationCard } from "../../components/notifications/NotificationCard";
import { AppButton } from "../../components/ui/AppButton";
import { Card } from "../../components/ui/Card";
import { InlineError } from "../../components/ui/InlineError";
import { Screen } from "../../components/ui/Screen";
import { NOTIFICATION_ROUTES } from "../../navigation/constants";
import type { NotificationsStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  clearNotificationError,
  fetchNotifications,
  markAllNotificationsRead
} from "../../redux/slices/notificationSlice";

type Props = NotificationsStackScreenProps<typeof NOTIFICATION_ROUTES.NOTIFICATIONS>;

export function NotificationsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { items, fetchStatus, updateStatus, error } = useAppSelector((state) => state.notifications);
  const unreadCount = items.filter((item) => !item.read).length;

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <Screen>
      <View className="rounded-3xl bg-health-surface p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-health-text">Notifications</Text>
          <Ionicons name="notifications-outline" size={20} color="#0F172A" />
        </View>
        <Text className="mt-2 text-sm text-health-muted">Alerts, updates, and response activity.</Text>
        <Text className="mt-3 text-xs uppercase tracking-wide text-health-muted">Unread: {unreadCount}</Text>
      </View>
      {error ? <InlineError message={error} /> : null}

      <View className="mb-3 mt-3">
        <AppButton
          label="Mark All as Read"
          variant="secondary"
          loading={updateStatus === "loading"}
          onPress={() => {
            dispatch(clearNotificationError());
            void dispatch(markAllNotificationsRead());
          }}
        />
      </View>

      {fetchStatus === "loading" && items.length === 0 ? (
        <View className="mt-5 items-center">
          <ActivityIndicator color="#DC2626" />
          <Text className="mt-2 text-xs text-health-muted">Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={fetchStatus === "loading"}
              onRefresh={() => void dispatch(fetchNotifications())}
            />
          }
          ListEmptyComponent={
            <Card>
              <Text className="text-sm text-health-muted">No notifications yet.</Text>
            </Card>
          }
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onPress={() =>
                navigation.navigate(NOTIFICATION_ROUTES.NOTIFICATION_DETAILS, {
                  notificationId: item.id
                })
              }
            />
          )}
        />
      )}
    </Screen>
  );
}
