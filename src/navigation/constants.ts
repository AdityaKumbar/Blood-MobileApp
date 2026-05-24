export const ROOT_ROUTES = {
  AUTH_STACK: "AuthStack",
  MAIN_TABS: "MainTabs"
} as const;

export const AUTH_ROUTES = {
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword"
} as const;

export const TAB_ROUTES = {
  HOME_TAB: "HomeTab",
  SEARCH_TAB: "SearchTab",
  EMERGENCY_TAB: "EmergencyTab",
  NOTIFICATIONS_TAB: "NotificationsTab",
  PROFILE_TAB: "ProfileTab"
} as const;

export const HOME_ROUTES = {
  HOME: "Home",
  HOME_DETAILS: "HomeDetails"
} as const;

export const SEARCH_ROUTES = {
  SEARCH: "Search",
  SEARCH_RESULTS: "SearchResults"
} as const;

export const EMERGENCY_ROUTES = {
  EMERGENCY: "Emergency",
  EMERGENCY_DETAILS: "EmergencyDetails"
} as const;

export const NOTIFICATION_ROUTES = {
  NOTIFICATIONS: "Notifications",
  NOTIFICATION_DETAILS: "NotificationDetails"
} as const;

export const PROFILE_ROUTES = {
  PROFILE: "Profile",
  EDIT_PROFILE: "EditProfile",
  SETTINGS: "Settings"
} as const;

export const TAB_LABELS: Record<keyof typeof TAB_ROUTES, string> = {
  HOME_TAB: "Home",
  SEARCH_TAB: "Search",
  EMERGENCY_TAB: "Emergency",
  NOTIFICATIONS_TAB: "Notifications",
  PROFILE_TAB: "Profile"
};
