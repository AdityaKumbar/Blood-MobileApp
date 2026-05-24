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
            <View className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full bg-health-surfaceSoft" />
            <View className="pointer-events-none absolute -left-12 top-24 h-32 w-32 rounded-full bg-brand-50" />

            <View className="mx-auto w-full max-w-[480px]">
              <View className="mb-5">
                <Text className="text-xs font-semibold uppercase tracking-wider text-health-accent">
                  BloodAPP Care
                </Text>
                <Text className="mt-2 text-3xl font-bold text-health-text">{title}</Text>
                <Text className="mt-2 text-sm leading-5 text-health-muted">{subtitle}</Text>
              </View>

              <Card className="rounded-3xl p-5">{children}</Card>

              {footer ? <View className="mt-4">{footer}</View> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
