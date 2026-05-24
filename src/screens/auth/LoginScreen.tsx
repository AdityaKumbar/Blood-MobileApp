import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthFooterLink } from "../../components/auth/AuthFooterLink";
import { AuthShell } from "../../components/auth/AuthShell";
import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { InlineError } from "../../components/ui/InlineError";
import { AUTH_ROUTES } from "../../navigation/constants";
import type { AuthStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { clearAuthError, loginUser } from "../../redux/slices/authSlice";
import { loginSchema } from "../../validations/authValidation";

type Props = AuthStackScreenProps<typeof AUTH_ROUTES.LOGIN>;

export function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});

  const isSubmitting = status === "loading";

  const handleSubmit = async () => {
    dispatch(clearAuthError());

    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      const formatted = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        identifier: formatted.identifier?.[0],
        password: formatted.password?.[0]
      });
      return;
    }

    setFieldErrors({});
    await dispatch(loginUser(parsed.data));
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to respond quickly to blood and oxygen requests in your area."
      footer={
        <AuthFooterLink
          prompt="No account yet?"
          linkLabel="Create one"
          onPress={() => navigation.navigate(AUTH_ROUTES.REGISTER)}
        />
      }
    >
      {error ? <InlineError message={error} /> : null}

      <AppInput
        label="Email"
        value={identifier}
        onChangeText={setIdentifier}
        placeholder="name@email.com"
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        returnKeyType="next"
        error={fieldErrors.identifier}
      />

      <AppInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        showPasswordToggle
        textContentType="password"
        autoComplete="current-password"
        autoCapitalize="none"
        returnKeyType="done"
        error={fieldErrors.password}
      />

      <View className="mb-4 mt-1 items-end">
        <Pressable onPress={() => navigation.navigate(AUTH_ROUTES.FORGOT_PASSWORD)}>
          <Text className="text-sm font-medium text-health-accent">Forgot password?</Text>
        </Pressable>
      </View>

      <AppButton label="Sign In" onPress={handleSubmit} loading={isSubmitting} />
    </AuthShell>
  );
}
