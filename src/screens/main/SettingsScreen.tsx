import { useState } from "react";
import { Text, View } from "react-native";

import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { Screen } from "../../components/ui/Screen";
import { EmergencyContactCard, SettingsSwitchRow } from "../../components/settings/SettingsComponents";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  addEmergencyContact,
  removeEmergencyContact,
  setNotificationPreference
} from "../../redux/slices/profileSettingsSlice";

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { notificationPreferences, emergencyContacts } = useAppSelector((state) => state.profileSettings);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");

  const handleAddContact = () => {
    if (!name.trim() || !phone.trim()) return;
    dispatch(addEmergencyContact({ name: name.trim(), relation: relation.trim() || "Contact", phone: phone.trim() }));
    setName("");
    setRelation("");
    setPhone("");
  };

  return (
    <Screen scrollable>
      <View className="pb-8">
        <Text className="text-2xl font-bold text-health-text">Settings</Text>
        <Text className="mt-1 text-sm text-health-muted">Notification and emergency contact preferences.</Text>

        <View className="mt-4">
          <Text className="mb-2 text-base font-semibold text-health-text">Notification Preferences</Text>
          <SettingsSwitchRow
            label="Emergency Alerts"
            description="Receive real-time emergency alert notifications."
            value={notificationPreferences.emergencyAlerts}
            onValueChange={(value) =>
              dispatch(setNotificationPreference({ key: "emergencyAlerts", value }))
            }
          />
          <SettingsSwitchRow
            label="Donation Reminders"
            description="Get reminders when you are eligible to donate."
            value={notificationPreferences.donationReminders}
            onValueChange={(value) =>
              dispatch(setNotificationPreference({ key: "donationReminders", value }))
            }
          />
          <SettingsSwitchRow
            label="Approval Notifications"
            description="Receive updates on request and profile approvals."
            value={notificationPreferences.approvalNotifications}
            onValueChange={(value) =>
              dispatch(setNotificationPreference({ key: "approvalNotifications", value }))
            }
          />
        </View>

        <View className="mt-4">
          <Text className="mb-2 text-base font-semibold text-health-text">Emergency Contacts</Text>
          <AppInput label="Name" value={name} onChangeText={setName} placeholder="Contact name" />
          <AppInput
            label="Relation"
            value={relation}
            onChangeText={setRelation}
            placeholder="Relation (e.g. Sister)"
          />
          <AppInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Contact number"
          />
          <View className="mb-3">
            <AppButton label="Add Contact" variant="secondary" onPress={handleAddContact} />
          </View>

          <View className="gap-3">
            {emergencyContacts.map((contact) => (
              <EmergencyContactCard
                key={contact.id}
                contact={contact}
                onRemove={(id) => dispatch(removeEmergencyContact(id))}
              />
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}
