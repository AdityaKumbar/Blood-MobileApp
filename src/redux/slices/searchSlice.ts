import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import * as searchApi from "../../api/searchApi";
import { defaultSearchFilters } from "../../constants/search";
import type { AsyncStatus } from "../../types/common";
import type { SearchFilters, SearchResultItem } from "../../types/search";
import { extractErrorMessage } from "../../utils/error";

interface SearchState {
  filters: SearchFilters;
  results: SearchResultItem[];
  status: AsyncStatus;
  error: string | null;
}

const initialState: SearchState = {
  filters: defaultSearchFilters,
  results: [],
  status: "idle",
  error: null
};

export const fetchSearchResults = createAsyncThunk<SearchResultItem[], SearchFilters, { rejectValue: string }>(
  "search/fetchResults",
  async (filters, { rejectWithValue }) => {
    try {
      return await searchApi.searchResources(filters);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Unable to search resources right now."));
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchFilters(state, action: PayloadAction<SearchFilters>) {
      state.filters = action.payload;
    },
    clearSearchError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.filters = action.meta.arg;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unable to search resources.";
      });
  }
});

export const { setSearchFilters, clearSearchError } = searchSlice.actions;
export const searchReducer = searchSlice.reducer;
