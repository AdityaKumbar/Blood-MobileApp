import { useMemo } from "react";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  clearAuthError,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser
} from "../redux/slices/authSlice";
import type { LoginPayload, RegisterPayload } from "../types/auth";

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return useMemo(
    () => ({
      ...auth,
      isAuthenticated: auth.status === "authenticated",
      login: (payload: LoginPayload) => dispatch(loginUser(payload)),
      register: (payload: RegisterPayload) => dispatch(registerUser(payload)),
      logout: () => dispatch(logoutUser()),
      refreshCurrentUser: () => dispatch(fetchCurrentUser()),
      clearError: () => dispatch(clearAuthError())
    }),
    [auth, dispatch]
  );
}
