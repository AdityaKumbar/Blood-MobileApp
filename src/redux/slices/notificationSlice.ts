import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import * as notificationApi from "../../api/notificationApi";
import type { AsyncStatus } from "../../types/common";
import type { AppNotification } from "../../types/notification";
import { extractErrorMessage } from "../../utils/error";

interface NotificationState {
  items: AppNotification[];
  fetchStatus: AsyncStatus;
  updateStatus: AsyncStatus;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  fetchStatus: "idle",
  updateStatus: "idle",
  error: null
};

export const fetchNotifications = createAsyncThunk<AppNotification[], void, { rejectValue: string }>(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationApi.fetchNotifications();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to load notifications."));
    }
  }
);

export const markNotificationRead = createAsyncThunk<
  AppNotification | null,
  string,
  { rejectValue: string }
>("notifications/markRead", async (notificationId, { rejectWithValue }) => {
  try {
    return await notificationApi.markNotificationAsRead(notificationId);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Unable to mark notification as read."));
  }
});

export const markAllNotificationsRead = createAsyncThunk<boolean, void, { rejectValue: string }>(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationApi.markAllNotificationsAsRead();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to mark all as read."));
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    prependNotification(state, action: PayloadAction<AppNotification>) {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.unshift({ ...action.payload, read: false });
      }
    },
    clearNotificationError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload ?? "Unable to load notifications.";
      })
      .addCase(markNotificationRead.pending, (state) => {
        state.updateStatus = "loading";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        if (!action.payload) return;
        state.items = state.items.map((item) =>
          item.id === action.payload?.id ? { ...item, ...action.payload, read: true } : item
        );
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload ?? "Unable to mark notification as read.";
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.updateStatus = "loading";
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.updateStatus = "succeeded";
        state.items = state.items.map((item) => ({ ...item, read: true }));
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload ?? "Unable to mark all as read.";
      });
  }
});

export const { prependNotification, clearNotificationError } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
