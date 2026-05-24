import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";

import { showToast } from "../slices/appUiSlice";

export const appErrorMiddleware: Middleware = (store) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as string | { message?: string } | undefined;
    const message = typeof payload === "string" ? payload : payload?.message;
    store.dispatch(
      showToast({
        message: message || "Request failed. Please try again.",
        variant: "error"
      })
    );
  }
  return next(action);
};
