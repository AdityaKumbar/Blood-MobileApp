import type { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  AUTH_ROUTES,
  EMERGENCY_ROUTES,
  HOME_ROUTES,
  NOTIFICATION_ROUTES,
  PROFILE_ROUTES,
  ROOT_ROUTES,
  SEARCH_ROUTES,
  TAB_ROUTES
} from "./constants";

export type AuthStackParamList = {
  [AUTH_ROUTES.LOGIN]: undefined;
  [AUTH_ROUTES.REGISTER]: undefined;
  [AUTH_ROUTES.FORGOT_PASSWORD]: undefined;
};

export type HomeStackParamList = {
  [HOME_ROUTES.HOME]: undefined;
  [HOME_ROUTES.HOME_DETAILS]: { requestId: string };
};

export type SearchStackParamList = {
  [SEARCH_ROUTES.SEARCH]: undefined;
  [SEARCH_ROUTES.SEARCH_RESULTS]: { query: string };
};

export type EmergencyStackParamList = {
  [EMERGENCY_ROUTES.EMERGENCY]: undefined;
  [EMERGENCY_ROUTES.EMERGENCY_DETAILS]: { requestId: string };
};

export type NotificationsStackParamList = {
  [NOTIFICATION_ROUTES.NOTIFICATIONS]: undefined;
  [NOTIFICATION_ROUTES.NOTIFICATION_DETAILS]: { notificationId: string };
};

export type ProfileStackParamList = {
  [PROFILE_ROUTES.PROFILE]: undefined;
  [PROFILE_ROUTES.EDIT_PROFILE]: undefined;
  [PROFILE_ROUTES.SETTINGS]: undefined;
};

export type MainTabParamList = {
  [TAB_ROUTES.HOME_TAB]: NavigatorScreenParams<HomeStackParamList>;
  [TAB_ROUTES.SEARCH_TAB]: NavigatorScreenParams<SearchStackParamList>;
  [TAB_ROUTES.EMERGENCY_TAB]: NavigatorScreenParams<EmergencyStackParamList>;
  [TAB_ROUTES.NOTIFICATIONS_TAB]: NavigatorScreenParams<NotificationsStackParamList>;
  [TAB_ROUTES.PROFILE_TAB]: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  [ROOT_ROUTES.AUTH_STACK]: NavigatorScreenParams<AuthStackParamList>;
  [ROOT_ROUTES.MAIN_TABS]: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  BottomTabScreenProps<MainTabParamList, typeof TAB_ROUTES.HOME_TAB>
>;

export type SearchStackScreenProps<T extends keyof SearchStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SearchStackParamList, T>,
  BottomTabScreenProps<MainTabParamList, typeof TAB_ROUTES.SEARCH_TAB>
>;

export type EmergencyStackScreenProps<T extends keyof EmergencyStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<EmergencyStackParamList, T>,
    BottomTabScreenProps<MainTabParamList, typeof TAB_ROUTES.EMERGENCY_TAB>
  >;

export type NotificationsStackScreenProps<T extends keyof NotificationsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<NotificationsStackParamList, T>,
    BottomTabScreenProps<MainTabParamList, typeof TAB_ROUTES.NOTIFICATIONS_TAB>
  >;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  BottomTabScreenProps<MainTabParamList, typeof TAB_ROUTES.PROFILE_TAB>
>;
