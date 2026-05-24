import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AUTH_ROUTES } from "../constants";
import type { AuthStackParamList } from "../types";
import { ForgotPasswordScreen } from "../../screens/auth/ForgotPasswordScreen";
import { LoginScreen } from "../../screens/auth/LoginScreen";
import { RegisterScreen } from "../../screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={AUTH_ROUTES.LOGIN}
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: 18, fontWeight: "600" }
      }}
    >
      <Stack.Screen
        name={AUTH_ROUTES.LOGIN}
        component={LoginScreen}
        options={{ title: "Sign In" }}
      />
      <Stack.Screen
        name={AUTH_ROUTES.REGISTER}
        component={RegisterScreen}
        options={{ title: "Create Account" }}
      />
      <Stack.Screen
        name={AUTH_ROUTES.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
        options={{ title: "Reset Password" }}
      />
    </Stack.Navigator>
  );
}
