import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import * as emergencyApi from "../../api/emergencyApi";
import type { AsyncStatus } from "../../types/common";
import type {
  CreateEmergencyRequestPayload,
  EmergencyRequest,
  EmergencyRequestStatus
} from "../../types/emergency";
import { extractErrorMessage } from "../../utils/error";

interface EmergencyState {
  feed: EmergencyRequest[];
  selectedRequest: EmergencyRequest | null;
  createStatus: AsyncStatus;
  feedStatus: AsyncStatus;
  detailsStatus: AsyncStatus;
  updateStatusState: AsyncStatus;
  error: string | null;
}

function dedupeById(items: EmergencyRequest[]) {
  const seen = new Set<string>();
  const next: EmergencyRequest[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    next.push(item);
  }
  return next;
}

const initialState: EmergencyState = {
  feed: [],
  selectedRequest: null,
  createStatus: "idle",
  feedStatus: "idle",
  detailsStatus: "idle",
  updateStatusState: "idle",
  error: null
};

export const createEmergencyRequest = createAsyncThunk<
  EmergencyRequest,
  CreateEmergencyRequestPayload,
  { rejectValue: string }
>("emergency/createEmergencyRequest", async (payload, { rejectWithValue }) => {
  try {
    return await emergencyApi.createEmergencyRequest(payload);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Unable to create emergency request."));
  }
});

export const fetchEmergencyFeed = createAsyncThunk<EmergencyRequest[], void, { rejectValue: string }>(
  "emergency/fetchEmergencyFeed",
  async (_, { rejectWithValue }) => {
    try {
      return await emergencyApi.fetchEmergencyFeed();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to fetch emergency feed."));
    }
  }
);

export const fetchEmergencyDetails = createAsyncThunk<
  EmergencyRequest,
  string,
  { rejectValue: string }
>("emergency/fetchEmergencyDetails", async (requestId, { rejectWithValue }) => {
  try {
    return await emergencyApi.fetchEmergencyRequestById(requestId);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Unable to fetch request details."));
  }
});

export const updateEmergencyStatus = createAsyncThunk<
  EmergencyRequest,
  { requestId: string; status: EmergencyRequestStatus },
  { rejectValue: string }
>("emergency/updateEmergencyStatus", async ({ requestId, status }, { rejectWithValue }) => {
  try {
    return await emergencyApi.updateEmergencyRequestStatus(requestId, status);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Unable to update request status."));
  }
});

export const acceptEmergencyDonation = createAsyncThunk<
  EmergencyRequest,
  { requestId: string; donorName: string },
  { rejectValue: string }
>("emergency/acceptEmergencyDonation", async ({ requestId, donorName }, { rejectWithValue }) => {
  try {
    return await emergencyApi.assignEmergencyRequestDonor(requestId, donorName);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Unable to accept this donation request."));
  }
});

const emergencySlice = createSlice({
  name: "emergency",
  initialState,
  reducers: {
    clearEmergencyError(state) {
      state.error = null;
    },
    prependEmergencyUpdate(state, action: PayloadAction<EmergencyRequest>) {
      const exists = state.feed.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.feed.unshift(action.payload);
      }
    },
    upsertEmergencyUpdate(state, action: PayloadAction<EmergencyRequest>) {
      const index = state.feed.findIndex((item) => item.id === action.payload.id);
      if (index === -1) {
        state.feed.unshift(action.payload);
      } else {
        state.feed[index] = action.payload;
      }
      if (state.selectedRequest?.id === action.payload.id) {
        state.selectedRequest = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEmergencyRequest.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createEmergencyRequest.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.selectedRequest = action.payload;
      })
      .addCase(createEmergencyRequest.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload ?? "Unable to create emergency request.";
      })
      .addCase(fetchEmergencyFeed.pending, (state) => {
        state.feedStatus = "loading";
        state.error = null;
      })
      .addCase(fetchEmergencyFeed.fulfilled, (state, action) => {
        state.feedStatus = "succeeded";
        state.feed = dedupeById(action.payload);
      })
      .addCase(fetchEmergencyFeed.rejected, (state, action) => {
        state.feedStatus = "failed";
        state.error = action.payload ?? "Unable to fetch emergency feed.";
      })
      .addCase(fetchEmergencyDetails.pending, (state) => {
        state.detailsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchEmergencyDetails.fulfilled, (state, action) => {
        state.detailsStatus = "succeeded";
        state.selectedRequest = action.payload;
      })
      .addCase(fetchEmergencyDetails.rejected, (state, action) => {
        state.detailsStatus = "failed";
        state.error = action.payload ?? "Unable to fetch request details.";
      })
      .addCase(updateEmergencyStatus.pending, (state) => {
        state.updateStatusState = "loading";
        state.error = null;
      })
      .addCase(updateEmergencyStatus.fulfilled, (state, action) => {
        state.updateStatusState = "succeeded";
        state.selectedRequest = action.payload;
        state.feed = dedupeById(
          state.feed.map((item) => (item.id === action.payload.id ? action.payload : item))
        );
      })
      .addCase(updateEmergencyStatus.rejected, (state, action) => {
        state.updateStatusState = "failed";
        state.error = action.payload ?? "Unable to update request status.";
      })
      .addCase(acceptEmergencyDonation.pending, (state) => {
        state.updateStatusState = "loading";
        state.error = null;
      })
      .addCase(acceptEmergencyDonation.fulfilled, (state, action) => {
        state.updateStatusState = "succeeded";
        state.selectedRequest = action.payload;
        state.feed = dedupeById(
          state.feed.map((item) => (item.id === action.payload.id ? action.payload : item))
        );
      })
      .addCase(acceptEmergencyDonation.rejected, (state, action) => {
        state.updateStatusState = "failed";
        state.error = action.payload ?? "Unable to accept this donation request.";
      });
  }
});

export const { clearEmergencyError, prependEmergencyUpdate, upsertEmergencyUpdate } = emergencySlice.actions;
export const emergencyReducer = emergencySlice.reducer;
