import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";

interface ScreenProps extends PropsWithChildren {
  padded?: boolean;
  scrollable?: boolean;
}

export function Screen({ children, padded = true, scrollable = false }: ScreenProps) {
  const contentClassName = padded ? "px-5 py-4" : "";

  return (
    <SafeAreaView className="flex-1 bg-health-bg">
      {scrollable ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={contentClassName}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={padded ? "flex-1 px-5 py-4" : "flex-1"}>{children}</View>
      )}
    </SafeAreaView>
  );
}
