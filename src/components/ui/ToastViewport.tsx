import { useEffect } from "react";
import { Text, View } from "react-native";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { dismissToast } from "../../redux/slices/appUiSlice";

const variantClassMap = {
  info: "bg-slate-800",
  success: "bg-emerald-700",
  warning: "bg-amber-700",
  error: "bg-red-700"
} as const;

export function ToastViewport() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.appUi.toasts);

  useEffect(() => {
    if (!toasts.length) return;
    const timer = setTimeout(() => {
      dispatch(dismissToast(toasts[0].id));
    }, 2500);
    return () => clearTimeout(timer);
  }, [dispatch, toasts]);

  return (
    <View pointerEvents="none" className="absolute inset-x-4 top-14 z-50 gap-2">
      {toasts.slice(0, 3).map((toast) => (
        <View key={toast.id} className={`rounded-xl px-3 py-3 ${variantClassMap[toast.variant]}`}>
          <Text className="text-sm font-medium text-white">{toast.message}</Text>
        </View>
      ))}
    </View>
  );
}
