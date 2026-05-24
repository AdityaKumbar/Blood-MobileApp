import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "./slices/authSlice";
import { emergencyReducer } from "./slices/emergencySlice";
import { notificationReducer } from "./slices/notificationSlice";
import { realtimeReducer } from "./slices/realtimeSlice";
import { searchReducer } from "./slices/searchSlice";
import { donorReducer } from "./slices/donorSlice";
import { profileSettingsReducer } from "./slices/profileSettingsSlice";
import { appUiReducer } from "./slices/appUiSlice";
import { appErrorMiddleware } from "./middleware/appErrorMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    emergency: emergencyReducer,
    notifications: notificationReducer,
    realtime: realtimeReducer,
    search: searchReducer,
    donor: donorReducer,
    profileSettings: profileSettingsReducer,
    appUi: appUiReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(appErrorMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
