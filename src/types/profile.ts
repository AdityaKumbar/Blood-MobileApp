export interface NotificationPreferences {
  emergencyAlerts: boolean;
  donationReminders: boolean;
  approvalNotifications: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface ProfileInfo {
  fullName: string;
  phone: string;
}
