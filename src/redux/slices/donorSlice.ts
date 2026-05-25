import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import * as donorApi from "../../api/donorApi";
import type { AsyncStatus } from "../../types/common";
import type { DonationHistoryItem, DonorEligibility, RegisterDonorPayload } from "../../types/donor";
import { extractErrorMessage } from "../../utils/error";

interface DonorState {
  isRegistered: boolean;
  isAvailable: boolean;
  lastDonatedAt: string | null;
  eligibility: DonorEligibility | null;
  history: DonationHistoryItem[];
  profileStatus: AsyncStatus;
  registerStatus: AsyncStatus;
  availabilityStatus: AsyncStatus;
  historyStatus: AsyncStatus;
  error: string | null;
}

const initialState: DonorState = {
  isRegistered: false,
  isAvailable: false,
  lastDonatedAt: null,
  eligibility: null,
  history: [],
  profileStatus: "idle",
  registerStatus: "idle",
  availabilityStatus: "idle",
  historyStatus: "idle",
  error: null
};

export const fetchDonorProfile = createAsyncThunk("donor/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    return await donorApi.fetchDonorProfile();
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Unable to fetch donor profile."));
  }
});

export const registerDonor = createAsyncThunk(
  "donor/register",
  async (payload: RegisterDonorPayload, { rejectWithValue }) => {
    try {
      return await donorApi.registerAsDonor(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to register as donor."));
    }
  }
);

export const updateDonorAvailability = createAsyncThunk(
  "donor/updateAvailability",
  async (isAvailable: boolean, { rejectWithValue }) => {
    try {
      return await donorApi.updateDonorAvailability(isAvailable);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to update donor availability."));
    }
  }
);

export const fetchDonationHistory = createAsyncThunk(
  "donor/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await donorApi.fetchDonationHistory();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to fetch donation history."));
    }
  }
);

const donorSlice = createSlice({
  name: "donor",
  initialState,
  reducers: {
    clearDonorError(state) {
      state.error = null;
    },
    setLocalAvailability(state, action: PayloadAction<boolean>) {
      state.isAvailable = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonorProfile.pending, (state) => {
        state.profileStatus = "loading";
        state.error = null;
      })
      .addCase(fetchDonorProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.isRegistered = action.payload.isRegistered;
        state.isAvailable = action.payload.isAvailable;
        state.lastDonatedAt = action.payload.lastDonatedAt ?? null;
        state.eligibility = action.payload.eligibility;
        state.history = action.payload.history;
      })
      .addCase(fetchDonorProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = (action.payload as string) ?? "Unable to fetch donor profile.";
      })
      .addCase(registerDonor.pending, (state) => {
        state.registerStatus = "loading";
        state.error = null;
      })
      .addCase(registerDonor.fulfilled, (state, action) => {
        state.registerStatus = "succeeded";
        state.isRegistered = action.payload.isRegistered;
        state.isAvailable = action.payload.isAvailable;
        state.lastDonatedAt = action.payload.lastDonatedAt ?? null;
        state.eligibility = action.payload.eligibility;
      })
      .addCase(registerDonor.rejected, (state, action) => {
        state.registerStatus = "failed";
        state.error = (action.payload as string) ?? "Unable to register as donor.";
      })
      .addCase(updateDonorAvailability.pending, (state) => {
        state.availabilityStatus = "loading";
        state.error = null;
      })
      .addCase(updateDonorAvailability.fulfilled, (state, action) => {
        state.availabilityStatus = "succeeded";
        state.isAvailable = action.payload.isAvailable;
      })
      .addCase(updateDonorAvailability.rejected, (state, action) => {
        state.availabilityStatus = "failed";
        state.error = (action.payload as string) ?? "Unable to update donor availability.";
      })
      .addCase(fetchDonationHistory.pending, (state) => {
        state.historyStatus = "loading";
      })
      .addCase(fetchDonationHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = action.payload;
      })
      .addCase(fetchDonationHistory.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.error = (action.payload as string) ?? "Unable to fetch donation history.";
      });
  }
});

export const { clearDonorError, setLocalAvailability } = donorSlice.actions;
export const donorReducer = donorSlice.reducer;
