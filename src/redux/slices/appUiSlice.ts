import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

type ToastVariant = "info" | "success" | "warning" | "error";

export interface AppToast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface AppUiState {
  isOffline: boolean;
  toasts: AppToast[];
}

const initialState: AppUiState = {
  isOffline: false,
  toasts: []
};

const appUiSlice = createSlice({
  name: "appUi",
  initialState,
  reducers: {
    setOffline(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;
    },
    showToast(
      state,
      action: PayloadAction<{ message: string; variant?: ToastVariant }>
    ) {
      state.toasts.push({
        id: nanoid(),
        message: action.payload.message,
        variant: action.payload.variant ?? "info"
      });
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    }
  }
});

export const { setOffline, showToast, dismissToast } = appUiSlice.actions;
export const appUiReducer = appUiSlice.reducer;
