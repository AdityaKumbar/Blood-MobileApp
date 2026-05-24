import { useEffect } from "react";
import { Text, View } from "react-native";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setOffline, showToast } from "../redux/slices/appUiSlice";
import { registerApiNetworkErrorHandler } from "../services/apiBridge";
import { ToastViewport } from "../components/ui/ToastViewport";

export function AppRuntime() {
  const dispatch = useAppDispatch();
  const isOffline = useAppSelector((state) => state.appUi.isOffline);

  useEffect(() => {
    registerApiNetworkErrorHandler(() => {
      dispatch(setOffline(true));
      dispatch(
        showToast({
          message: "You appear to be offline. Some data may be stale.",
          variant: "warning"
        })
      );
    });
  }, [dispatch]);

  return (
    <>
      {isOffline ? (
        <View className="absolute inset-x-0 top-0 z-50 items-center bg-amber-600 py-2">
          <Text className="text-xs font-semibold text-white">Offline mode</Text>
        </View>
      ) : null}
      <ToastViewport />
    </>
  );
}
