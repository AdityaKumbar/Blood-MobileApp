import { Switch, Text, View } from "react-native";

import { bloodGroups } from "../../constants/bloodGroups";
import { availabilityFilters } from "../../constants/search";
import type { SearchFilters } from "../../types/search";
import { AppInput } from "../ui/AppInput";
import { AppSelectPills } from "../ui/AppSelectPills";

interface SearchFiltersProps {
  value: SearchFilters;
  onChange: (next: SearchFilters) => void;
}

export function SearchFilters({ value, onChange }: SearchFiltersProps) {
  const update = <K extends keyof SearchFilters>(key: K, next: SearchFilters[K]) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <View>
      <AppInput
        label="Search Query"
        value={value.query}
        onChangeText={(text) => update("query", text)}
        placeholder="Search by city, provider, hospital"
      />

      <AppSelectPills
        label="Blood Group"
        value={value.bloodGroup}
        options={["ALL", ...bloodGroups]}
        onChange={(group) => update("bloodGroup", group)}
      />

      <AppSelectPills
        label="Availability"
        value={value.availability}
        options={availabilityFilters}
        onChange={(availability) => update("availability", availability)}
      />

      <View className="mb-4 rounded-xl border border-health-border bg-health-surface p-3">
        <Text className="mb-3 text-sm font-semibold text-health-text">Search Categories</Text>
        <FilterSwitch
          label="Blood Availability"
          enabled={value.includeBlood}
          onChange={(enabled) => update("includeBlood", enabled)}
        />
        <FilterSwitch
          label="Oxygen Availability"
          enabled={value.includeOxygen}
          onChange={(enabled) => update("includeOxygen", enabled)}
        />
        <FilterSwitch
          label="Nearby Hospitals"
          enabled={value.includeHospitals}
          onChange={(enabled) => update("includeHospitals", enabled)}
        />
      </View>
    </View>
  );
}

function FilterSwitch({
  label,
  enabled,
  onChange
}: {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-sm text-health-text">{label}</Text>
      <Switch
        value={enabled}
        onValueChange={onChange}
        trackColor={{ false: "#D8E3EE", true: "#0F766E" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
