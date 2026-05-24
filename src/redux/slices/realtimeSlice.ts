import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { InventoryUpdateEvent, RealtimeConnectionStatus } from "../../types/realtime";

interface RealtimeState {
  connectionStatus: RealtimeConnectionStatus;
  lastError: string | null;
  inventory: InventoryUpdateEvent | null;
}

const initialState: RealtimeState = {
  connectionStatus: "idle",
  lastError: null,
  inventory: null
};

const realtimeSlice = createSlice({
  name: "realtime",
  initialState,
  reducers: {
    setRealtimeStatus(state, action: PayloadAction<RealtimeConnectionStatus>) {
      state.connectionStatus = action.payload;
      if (action.payload !== "error") {
        state.lastError = null;
      }
    },
    setRealtimeError(state, action: PayloadAction<string>) {
      state.connectionStatus = "error";
      state.lastError = action.payload;
    },
    setInventoryUpdate(state, action: PayloadAction<InventoryUpdateEvent>) {
      state.inventory = action.payload;
    }
  }
});

export const { setRealtimeStatus, setRealtimeError, setInventoryUpdate } = realtimeSlice.actions;
export const realtimeReducer = realtimeSlice.reducer;
