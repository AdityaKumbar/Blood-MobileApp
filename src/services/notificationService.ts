export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export function mapNotificationPayload(payload: Partial<InAppNotification>): InAppNotification {
  return {
    id: payload.id ?? Math.random().toString(36).slice(2),
    title: payload.title ?? "Notification",
    message: payload.message ?? "",
    createdAt: payload.createdAt ?? new Date().toISOString(),
    read: payload.read ?? false
  };
}
