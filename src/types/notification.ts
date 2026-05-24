export type NotificationType = "EMERGENCY_ALERT" | "DONATION_REMINDER" | "APPROVAL";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  body?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, string>;
}
