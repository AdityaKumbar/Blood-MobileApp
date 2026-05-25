import type { PropsWithChildren, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

import { Card } from "../ui/Card";
import { Screen } from "../ui/Screen";

interface AuthShellProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-health-bg"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="relative flex-1 px-5 pb-6 pt-6">
            <View className="pointer-events-none absolute -right-16 -top-12 h-64 w-64 rounded-full bg-brand-100 opacity-50" />
            <View className="pointer-events-none absolute -left-14 top-28 h-44 w-44 rounded-full bg-blue-100 opacity-70" />
            <View className="pointer-events-none absolute bottom-10 right-8 h-24 w-24 rounded-full bg-health-surfaceSoft opacity-80" />

            <View className="mx-auto w-full max-w-[480px]">
              <View className="mb-5 rounded-3xl border border-health-border bg-health-surfaceSoft p-4">
                <Text className="text-xs font-semibold uppercase tracking-[2px] text-health-accent">
                  Emergency Blood Connect
                </Text>
                <Text className="mt-2 text-4xl font-bold text-health-text">{title}</Text>
                <Text className="mt-2 text-sm leading-5 text-health-muted">{subtitle}</Text>
              </View>

              <Card className="rounded-3xl border-2 p-5">{children}</Card>

              {footer ? <View className="mt-4">{footer}</View> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
