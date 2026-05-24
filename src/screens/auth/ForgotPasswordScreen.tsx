import { useEffect, useState } from "react";
import { Text } from "react-native";

import { AuthFooterLink } from "../../components/auth/AuthFooterLink";
import { AuthShell } from "../../components/auth/AuthShell";
import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { InlineError } from "../../components/ui/InlineError";
import { AUTH_ROUTES } from "../../navigation/constants";
import type { AuthStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  clearForgotPasswordState,
  requestPasswordReset
} from "../../redux/slices/authSlice";
import { forgotPasswordSchema } from "../../validations/authValidation";

type Props = AuthStackScreenProps<typeof AUTH_ROUTES.FORGOT_PASSWORD>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { forgotPasswordStatus, forgotPasswordMessage, forgotPasswordError } = useAppSelector(
    (state) => state.auth
  );
  const [identifier, setIdentifier] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();

  useEffect(() => {
    return () => {
      dispatch(clearForgotPasswordState());
    };
  }, [dispatch]);

  const isSubmitting = forgotPasswordStatus === "loading";
  const isSuccess = forgotPasswordStatus === "succeeded";

  const handleSubmit = async () => {
    const parsed = forgotPasswordSchema.safeParse({ identifier });

    if (!parsed.success) {
      setFieldError(parsed.error.flatten().fieldErrors.identifier?.[0]);
      return;
    }

    setFieldError(undefined);
    await dispatch(requestPasswordReset(parsed.data));
  };

  const handleBackToLogin = () => {
    dispatch(clearForgotPasswordState());
    navigation.navigate(AUTH_ROUTES.LOGIN);
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your email or phone number and we'll send reset instructions."
      footer={
        <AuthFooterLink
          prompt="Remembered your password?"
          linkLabel="Back to Sign In"
          onPress={handleBackToLogin}
        />
      }
    >
      {forgotPasswordError ? <InlineError message={forgotPasswordError} /> : null}
      {forgotPasswordMessage ? (
        <Text className="mb-3 rounded-xl bg-health-surfaceSoft px-3 py-2 text-sm text-health-accentDark">
          {forgotPasswordMessage}
        </Text>
      ) : null}

      <AppInput
        label="Email or Phone"
        value={identifier}
        onChangeText={setIdentifier}
        placeholder="name@email.com or 9876543210"
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        error={fieldError}
      />

      <AppButton
        label={isSuccess ? "Resend Instructions" : "Send Instructions"}
        onPress={handleSubmit}
        loading={isSubmitting}
      />

      <Text className="mt-4 text-xs leading-5 text-health-muted">
        For security, we only confirm when instructions are sent and never expose account existence.
      </Text>
    </AuthShell>
  );
}
