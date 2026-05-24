import { useMemo, useState } from "react";
import { Switch, Text, View } from "react-native";

import { bloodGroups } from "../../constants/bloodGroups";
import { emergencyUrgencies } from "../../constants/emergency";
import type { BloodGroup } from "../../types/auth";
import type { CreateEmergencyRequestPayload, EmergencyUrgency } from "../../types/emergency";
import { AppButton } from "../ui/AppButton";
import { AppInput } from "../ui/AppInput";
import { AppSelectPills } from "../ui/AppSelectPills";

interface EmergencyRequestFormProps {
  loading?: boolean;
  onSubmit: (payload: CreateEmergencyRequestPayload) => Promise<void> | void;
}

interface FormState {
  patientName: string;
  bloodGroup: BloodGroup | null;
  unitsRequired: string;
  hospital: string;
  urgency: EmergencyUrgency;
  oxygenNeeded: boolean;
  contactNumber: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  patientName: "",
  bloodGroup: null,
  unitsRequired: "",
  hospital: "",
  urgency: "HIGH",
  oxygenNeeded: false,
  contactNumber: ""
};

export function EmergencyRequestForm({ loading = false, onSubmit }: EmergencyRequestFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});

  const canSubmit = useMemo(
    () =>
      form.patientName.trim().length > 1 &&
      !!form.bloodGroup &&
      Number(form.unitsRequired) > 0 &&
      form.hospital.trim().length > 1 &&
      form.contactNumber.trim().length >= 10,
    [form]
  );

  const updateField = <T extends keyof FormState>(key: T, value: FormState[T]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!form.patientName.trim()) next.patientName = "Patient name is required.";
    if (!form.bloodGroup) next.bloodGroup = "Blood group is required.";
    if (!form.unitsRequired || Number.isNaN(Number(form.unitsRequired)) || Number(form.unitsRequired) < 1) {
      next.unitsRequired = "Units required must be at least 1.";
    }
    if (!form.hospital.trim()) next.hospital = "Hospital is required.";
    if (!/^\d{10,15}$/.test(form.contactNumber.trim())) {
      next.contactNumber = "Enter a valid contact number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      patientName: form.patientName.trim(),
      bloodGroup: form.bloodGroup as BloodGroup,
      unitsRequired: Number(form.unitsRequired),
      hospital: form.hospital.trim(),
      urgency: form.urgency,
      oxygenNeeded: form.oxygenNeeded,
      contactNumber: form.contactNumber.trim()
    });
    setForm(initialState);
    setErrors({});
  };

  return (
    <View>
      <AppInput
        label="Patient Name"
        value={form.patientName}
        onChangeText={(value) => updateField("patientName", value)}
        placeholder="Enter patient full name"
        autoCapitalize="words"
        error={errors.patientName}
      />
      <AppSelectPills
        label="Blood Group"
        value={form.bloodGroup}
        options={bloodGroups}
        onChange={(value) => updateField("bloodGroup", value)}
        error={errors.bloodGroup}
      />
      <AppInput
        label="Units Required"
        value={form.unitsRequired}
        onChangeText={(value) => updateField("unitsRequired", value)}
        placeholder="e.g. 2"
        keyboardType="number-pad"
        error={errors.unitsRequired}
      />
      <AppInput
        label="Hospital"
        value={form.hospital}
        onChangeText={(value) => updateField("hospital", value)}
        placeholder="Hospital name"
        error={errors.hospital}
      />
      <AppSelectPills
        label="Urgency"
        value={form.urgency}
        options={emergencyUrgencies}
        onChange={(value) => updateField("urgency", value)}
        error={errors.urgency}
      />
      <View className="mb-4 flex-row items-center justify-between rounded-xl border border-health-border bg-health-surface px-4 py-3">
        <View className="pr-3">
          <Text className="text-sm font-medium text-health-text">Oxygen Needed</Text>
          <Text className="mt-1 text-xs text-health-muted">Enable if oxygen support is also required.</Text>
        </View>
        <Switch
          value={form.oxygenNeeded}
          onValueChange={(value) => updateField("oxygenNeeded", value)}
          trackColor={{ false: "#D8E3EE", true: "#0F766E" }}
          thumbColor="#FFFFFF"
        />
      </View>
      <AppInput
        label="Contact Number"
        value={form.contactNumber}
        onChangeText={(value) => updateField("contactNumber", value)}
        placeholder="Primary contact number"
        keyboardType="phone-pad"
        error={errors.contactNumber}
      />

      <View className="mt-1">
        <AppButton
          label="Create Emergency Request"
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}
