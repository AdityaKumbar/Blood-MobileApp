import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import * as authApi from "../../api/authApi";
import { clearAuthHeaderToken, setAuthHeaderToken } from "../../api/client";
import * as userApi from "../../api/userApi";
import type { AsyncStatus } from "../../types/common";
import {
  clearPersistedAuthSession,
  getPersistedAuthSession,
  persistAuthSession
} from "../../utils/storage";
import { extractErrorMessage } from "../../utils/error";
import type { AuthResponse, ForgotPasswordPayload, LoginPayload, RegisterPayload } from "../../types/auth";

interface AuthState {
  user: AuthResponse["user"] | null;
  tokens: AuthResponse["tokens"] | null;
  isBootstrapping: boolean;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  loginStatus: AsyncStatus;
  registerStatus: AsyncStatus;
  logoutStatus: AsyncStatus;
  fetchUserStatus: AsyncStatus;
  forgotPasswordStatus: AsyncStatus;
  forgotPasswordMessage: string | null;
  forgotPasswordError: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isBootstrapping: true,
  status: "idle",
  error: null,
  loginStatus: "idle",
  registerStatus: "idle",
  logoutStatus: "idle",
  fetchUserStatus: "idle",
  forgotPasswordStatus: "idle",
  forgotPasswordMessage: null,
  forgotPasswordError: null
};

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async () => {
  const session = await getPersistedAuthSession();
  if (!session) {
    return null;
  }

  setAuthHeaderToken(session.tokens.accessToken);
  return session;
});

export const loginUser = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string }>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      await persistAuthSession(response);
      setAuthHeaderToken(response.tokens.accessToken);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to login right now."));
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.register(payload);
    await persistAuthSession(response);
    setAuthHeaderToken(response.tokens.accessToken);
    return response;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Unable to register right now."));
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  clearAuthHeaderToken();
  await clearPersistedAuthSession();
});

export const fetchCurrentUser = createAsyncThunk<
  AuthResponse["user"],
  void,
  { rejectValue: string }
>("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    return await userApi.getCurrentUser();
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Unable to fetch profile."));
  }
});

export const requestPasswordReset = createAsyncThunk<
  string,
  ForgotPasswordPayload,
  { rejectValue: string }
>("auth/requestPasswordReset", async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.forgotPassword(payload);
    return response.message || "If an account exists, reset instructions have been sent.";
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Unable to send reset instructions right now."));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearForgotPasswordState(state) {
      state.forgotPasswordStatus = "idle";
      state.forgotPasswordMessage = null;
      state.forgotPasswordError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.isBootstrapping = false;

        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = action.payload.tokens;
          state.status = "authenticated";
          return;
        }

        state.status = "unauthenticated";
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.isBootstrapping = false;
        state.status = "unauthenticated";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.loginStatus = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.status = "authenticated";
        state.loginStatus = "succeeded";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.loginStatus = "failed";
        state.error = action.payload ?? "Unable to login.";
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.registerStatus = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.status = "authenticated";
        state.registerStatus = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.registerStatus = "failed";
        state.error = action.payload ?? "Unable to register.";
      })
      .addCase(logoutUser.pending, (state) => {
        state.logoutStatus = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.status = "unauthenticated";
        state.logoutStatus = "succeeded";
        state.loginStatus = "idle";
        state.registerStatus = "idle";
        state.fetchUserStatus = "idle";
      })
      .addCase(logoutUser.rejected, (state) => {
        state.logoutStatus = "failed";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.fetchUserStatus = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.fetchUserStatus = "succeeded";
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.fetchUserStatus = "failed";
        state.error = action.payload ?? "Unable to fetch profile.";
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.forgotPasswordStatus = "loading";
        state.forgotPasswordMessage = null;
        state.forgotPasswordError = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.forgotPasswordStatus = "succeeded";
        state.forgotPasswordMessage = action.payload;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.forgotPasswordStatus = "failed";
        state.forgotPasswordError =
          typeof action.payload === "string"
            ? action.payload
            : "Unable to send reset instructions.";
      });
  }
});

export const { clearAuthError, clearForgotPasswordState } = authSlice.actions;
export const authReducer = authSlice.reducer;
