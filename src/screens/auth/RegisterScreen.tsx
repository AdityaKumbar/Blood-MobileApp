import { useState } from "react";

import { AuthFooterLink } from "../../components/auth/AuthFooterLink";
import { AuthShell } from "../../components/auth/AuthShell";
import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { AppSelectPills } from "../../components/ui/AppSelectPills";
import { InlineError } from "../../components/ui/InlineError";
import { bloodGroups } from "../../constants/bloodGroups";
import { AUTH_ROUTES } from "../../navigation/constants";
import type { AuthStackScreenProps } from "../../navigation/types";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { clearAuthError, registerUser } from "../../redux/slices/authSlice";
import type { BloodGroup } from "../../types/auth";
import { registerSchema } from "../../validations/authValidation";

type Props = AuthStackScreenProps<typeof AUTH_ROUTES.REGISTER>;

type RegisterFormState = {
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  password: string;
  confirmPassword: string;
};

type RegisterFieldErrors = Partial<Record<keyof RegisterFormState, string>>;

const initialState: RegisterFormState = {
  name: "",
  email: "",
  phone: "",
  bloodGroup: "",
  password: "",
  confirmPassword: ""
};

export function RegisterScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { registerStatus, error } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState<RegisterFormState>(initialState);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  const isSubmitting = registerStatus === "loading";

  const updateField = <T extends keyof RegisterFormState>(key: T, value: RegisterFormState[T]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    dispatch(clearAuthError());

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const formatted = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: formatted.name?.[0],
        email: formatted.email?.[0],
        phone: formatted.phone?.[0],
        bloodGroup: formatted.bloodGroup?.[0],
        password: formatted.password?.[0],
        confirmPassword: formatted.confirmPassword?.[0]
      });
      return;
    }

    setFieldErrors({});
    await dispatch(
      registerUser({
        fullName: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        bloodGroup: parsed.data.bloodGroup as BloodGroup,
        password: parsed.data.password
      })
    );
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join the donor network and respond when every second matters."
      footer={
        <AuthFooterLink
          prompt="Already have an account?"
          linkLabel="Sign in"
          onPress={() => navigation.navigate(AUTH_ROUTES.LOGIN)}
        />
      }
    >
      {error ? <InlineError message={error} /> : null}

      <AppInput
        label="Name"
        value={form.name}
        onChangeText={(value) => updateField("name", value)}
        placeholder="Your full name"
        autoCapitalize="words"
        autoComplete="name"
        error={fieldErrors.name}
      />

      <AppInput
        label="Email"
        value={form.email}
        onChangeText={(value) => updateField("email", value)}
        keyboardType="email-address"
        autoComplete="email"
        autoCapitalize="none"
        placeholder="name@email.com"
        error={fieldErrors.email}
      />

      <AppInput
        label="Phone"
        value={form.phone}
        onChangeText={(value) => updateField("phone", value)}
        keyboardType="phone-pad"
        autoComplete="tel"
        autoCapitalize="none"
        placeholder="9876543210"
        error={fieldErrors.phone}
      />

      <AppSelectPills
        label="Blood Group"
        value={form.bloodGroup ? (form.bloodGroup as BloodGroup) : null}
        options={bloodGroups}
        onChange={(value) => updateField("bloodGroup", value)}
        error={fieldErrors.bloodGroup}
      />

      <AppInput
        label="Password"
        value={form.password}
        onChangeText={(value) => updateField("password", value)}
        placeholder="Create a password"
        secureTextEntry
        showPasswordToggle
        textContentType="newPassword"
        autoComplete="new-password"
        autoCapitalize="none"
        error={fieldErrors.password}
      />

      <AppInput
        label="Confirm Password"
        value={form.confirmPassword}
        onChangeText={(value) => updateField("confirmPassword", value)}
        placeholder="Confirm password"
        secureTextEntry
        showPasswordToggle
        textContentType="password"
        autoComplete="password"
        autoCapitalize="none"
        error={fieldErrors.confirmPassword}
      />

      <AppButton label="Sign Up" onPress={handleSubmit} loading={isSubmitting} />
    </AuthShell>
  );
}
