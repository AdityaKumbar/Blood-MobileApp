import { apiClient } from "./client";
import type { AppNotification } from "../types/notification";
import { isAxiosError } from "axios";

interface NotificationsResponse {
  notifications: AppNotification[];
}

export async function fetchNotifications() {
  try {
    const { data } = await apiClient.get<NotificationsResponse>("/notifications");
    return data.notifications;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const { data } = await apiClient.patch<AppNotification>(`/notifications/${notificationId}/read`);
  return data;
}

export async function markAllNotificationsAsRead() {
  await apiClient.post("/notifications/read-all");
  return true;
}
