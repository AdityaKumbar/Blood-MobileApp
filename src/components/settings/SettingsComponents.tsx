import { Pressable, Switch, Text, View } from "react-native";

import type { EmergencyContact } from "../../types/profile";
import { Card } from "../ui/Card";

export function SettingsSwitchRow({
  label,
  description,
  value,
  onValueChange
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between rounded-xl border border-health-border bg-health-surface px-3 py-3">
      <View className="max-w-[75%]">
        <Text className="text-sm font-semibold text-health-text">{label}</Text>
        <Text className="mt-1 text-xs text-health-muted">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D8E3EE", true: "#0F766E" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export function EmergencyContactCard({
  contact,
  onRemove
}: {
  contact: EmergencyContact;
  onRemove: (id: string) => void;
}) {
  return (
    <Card>
      <Text className="text-base font-semibold text-health-text">{contact.name}</Text>
      <Text className="mt-1 text-sm text-health-muted">{contact.relation}</Text>
      <Text className="mt-1 text-sm text-health-muted">{contact.phone}</Text>
      <Pressable onPress={() => onRemove(contact.id)} className="mt-3 self-start">
        <Text className="text-xs font-semibold text-brand-700">Remove</Text>
      </Pressable>
    </Card>
  );
}
