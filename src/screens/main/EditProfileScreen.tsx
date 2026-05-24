import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { Screen } from "../../components/ui/Screen";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setProfileInfo } from "../../redux/slices/profileSettingsSlice";

export function EditProfileScreen() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const profileInfo = useAppSelector((state) => state.profileSettings.profileInfo);
  const [name, setName] = useState(profileInfo.fullName || authUser?.fullName || "");
  const [phone, setPhone] = useState(profileInfo.phone || authUser?.phone || "");

  useEffect(() => {
    if (!profileInfo.fullName && authUser?.fullName) {
      setName(authUser.fullName);
    }
    if (!profileInfo.phone && authUser?.phone) {
      setPhone(authUser.phone);
    }
  }, [authUser?.fullName, authUser?.phone, profileInfo.fullName, profileInfo.phone]);

  return (
    <Screen scrollable>
      <Text className="text-2xl font-bold text-health-text">Edit Profile</Text>
      <Text className="mt-1 text-sm text-health-muted">
        Update profile details used for request communication.
      </Text>

      <View className="mt-4">
        <AppInput label="Full Name" value={name} onChangeText={setName} />
        <AppInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </View>

      <AppButton
        label="Save Changes"
        onPress={() =>
          dispatch(
            setProfileInfo({
              fullName: name.trim(),
              phone: phone.trim()
            })
          )
        }
      />
    </Screen>
  );
}
