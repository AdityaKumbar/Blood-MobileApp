import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppSelector } from "../../redux/hooks";
import { colors } from "../../theme";
import { TAB_LABELS, TAB_ROUTES } from "../constants";
import type { MainTabParamList } from "../types";
import { EmergencyStackNavigator } from "../stacks/EmergencyStackNavigator";
import { HomeStackNavigator } from "../stacks/HomeStackNavigator";
import { NotificationsStackNavigator } from "../stacks/NotificationsStackNavigator";
import { ProfileStackNavigator } from "../stacks/ProfileStackNavigator";
import { SearchStackNavigator } from "../stacks/SearchStackNavigator";

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabLabel({ focused, label }: { focused: boolean; label: string }) {
  return (
    <Text
      style={{
        color: focused ? colors.primary : colors.mutedText,
        fontSize: 12,
        fontWeight: focused ? "700" : "500"
      }}
    >
      {label}
    </Text>
  );
}

function TabIcon({
  focused,
  name
}: {
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
}) {
  return <Ionicons name={name} size={20} color={focused ? colors.primary : colors.mutedText} />;
}

export function MainTabNavigator() {
  const unreadCount = useAppSelector(
    (state) => state.notifications.items.filter((notification) => !notification.read).length
  );

  return (
    <Tab.Navigator
      initialRouteName={TAB_ROUTES.HOME_TAB}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 12,
          height: 74,
          borderRadius: 28,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E4BEBC",
          shadowColor: "#1d3557",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 22,
          elevation: 12
        },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarHideOnKeyboard: true
      }}
    >
      <Tab.Screen
        name={TAB_ROUTES.HOME_TAB}
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="home-outline" />,
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label={TAB_LABELS.HOME_TAB} />
        }}
      />
      <Tab.Screen
        name={TAB_ROUTES.SEARCH_TAB}
        component={SearchStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="search-outline" />,
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label={TAB_LABELS.SEARCH_TAB} />
        }}
      />
      <Tab.Screen
        name={TAB_ROUTES.EMERGENCY_TAB}
        component={EmergencyStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="pulse-outline" />,
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label={TAB_LABELS.EMERGENCY_TAB} />
          )
        }}
      />
      <Tab.Screen
        name={TAB_ROUTES.NOTIFICATIONS_TAB}
        component={NotificationsStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="notifications-outline" />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.white,
            fontSize: 10
          },
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label={TAB_LABELS.NOTIFICATIONS_TAB} />
          )
        }}
      />
      <Tab.Screen
        name={TAB_ROUTES.PROFILE_TAB}
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="person-outline" />,
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label={TAB_LABELS.PROFILE_TAB} />
          )
        }}
      />
    </Tab.Navigator>
  );
}
