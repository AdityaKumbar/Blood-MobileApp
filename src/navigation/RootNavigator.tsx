import { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoadingScreen } from "../components/ui/LoadingScreen";
import { useRealtimeUpdates } from "../hooks/useRealtimeUpdates";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { bootstrapAuth, fetchCurrentUser } from "../redux/slices/authSlice";
import { ROOT_ROUTES } from "./constants";
import { AuthStackNavigator } from "./stacks/AuthStackNavigator";
import { MainTabNavigator } from "./tabs/MainTabNavigator";
import type { RootStackParamList } from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isBootstrapping, status } = useAppSelector((state) => state.auth);
  useRealtimeUpdates();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    if (status === "authenticated") {
      void dispatch(fetchCurrentUser());
    }
  }, [dispatch, status]);

  if (isBootstrapping) {
    return <LoadingScreen label="Preparing your account..." />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {status === "authenticated" ? (
        <RootStack.Screen name={ROOT_ROUTES.MAIN_TABS} component={MainTabNavigator} />
      ) : (
        <RootStack.Screen name={ROOT_ROUTES.AUTH_STACK} component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
}
