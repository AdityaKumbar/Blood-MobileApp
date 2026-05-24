import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

import type { EmergencyContact, NotificationPreferences, ProfileInfo } from "../../types/profile";

interface ProfileSettingsState {
  profileInfo: ProfileInfo;
  notificationPreferences: NotificationPreferences;
  emergencyContacts: EmergencyContact[];
}

const initialState: ProfileSettingsState = {
  profileInfo: {
    fullName: "",
    phone: ""
  },
  notificationPreferences: {
    emergencyAlerts: true,
    donationReminders: true,
    approvalNotifications: true
  },
  emergencyContacts: [
    { id: "ec-1", name: "Rahul Verma", relation: "Brother", phone: "9876543210" }
  ]
};

const profileSettingsSlice = createSlice({
  name: "profileSettings",
  initialState,
  reducers: {
    setProfileInfo(state, action: PayloadAction<ProfileInfo>) {
      state.profileInfo = action.payload;
    },
    setNotificationPreference(
      state,
      action: PayloadAction<{ key: keyof NotificationPreferences; value: boolean }>
    ) {
      const { key, value } = action.payload;
      state.notificationPreferences[key] = value;
    },
    addEmergencyContact(state, action: PayloadAction<Omit<EmergencyContact, "id">>) {
      state.emergencyContacts.unshift({ id: nanoid(), ...action.payload });
    },
    removeEmergencyContact(state, action: PayloadAction<string>) {
      state.emergencyContacts = state.emergencyContacts.filter((contact) => contact.id !== action.payload);
    }
  }
});

export const {
  setProfileInfo,
  setNotificationPreference,
  addEmergencyContact,
  removeEmergencyContact
} = profileSettingsSlice.actions;
export const profileSettingsReducer = profileSettingsSlice.reducer;
