import { useEffect, useState } from "react";
import { Text, View, Image, Pressable, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { Screen } from "../../components/ui/Screen";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setProfileInfo } from "../../redux/slices/profileSettingsSlice";
import { PROFILE_ROUTES } from "../../navigation/constants";
import type { ProfileStackScreenProps } from "../../navigation/types";

type Props = ProfileStackScreenProps<typeof PROFILE_ROUTES.EDIT_PROFILE>;

export function EditProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const profileInfo = useAppSelector((state) => state.profileSettings.profileInfo);
  
  const [name, setName] = useState(profileInfo.fullName || authUser?.fullName || "");
  const [phone, setPhone] = useState(profileInfo.phone || authUser?.phone || "");
  const [avatarUri, setAvatarUri] = useState(profileInfo.avatarUri || "");

  useEffect(() => {
    if (!profileInfo.fullName && authUser?.fullName) {
      setName(authUser.fullName);
    }
    if (!profileInfo.phone && authUser?.phone) {
      setPhone(authUser.phone);
    }
  }, [authUser?.fullName, authUser?.phone, profileInfo.fullName, profileInfo.phone]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to change your profile photo!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSaveChanges = () => {
    dispatch(
      setProfileInfo({
        fullName: name.trim(),
        phone: phone.trim(),
        avatarUri: avatarUri,
      })
    );
    Alert.alert("Success", "Profile details updated successfully!", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <Screen padded={false}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-[#eaecef]">
        <Pressable onPress={() => navigation.goBack()} className="flex-row items-center">
          <Ionicons name="arrow-back" size={24} color="#b7102a" />
          <Text className="ml-2 text-brand-600 text-lg font-bold">Edit Profile</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 bg-health-bg"
        contentContainerClassName="px-5 py-6 pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Upload Card */}
        <View className="bg-white rounded-3xl border border-[#eaecef] p-6 items-center shadow-sm mb-6">
          <Text className="text-base font-bold text-health-text mb-4">Profile Photo</Text>
          
          <Pressable onPress={handlePickImage} className="relative active:opacity-90">
            <View className="w-28 h-28 rounded-full border-2 border-[#eaecef] overflow-hidden bg-health-bg items-center justify-center shadow-inner">
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} className="w-28 h-28" />
              ) : (
                <Image source={require("../../assets/dummy_avatar.png")} className="w-28 h-28" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 border-2 border-white items-center justify-center shadow-sm">
              <Ionicons name="camera" size={14} color="white" />
            </View>
          </Pressable>

          <Pressable onPress={handlePickImage} className="mt-4 bg-[#EBF3FC] px-4 py-2 rounded-full active:opacity-80">
            <Text className="text-[#2b6485] text-xs font-bold">Choose From Gallery</Text>
          </Pressable>

          <Text className="mt-4 text-xs text-health-muted text-center leading-relaxed">
            Tap the camera icon or button to select an image from your device's photo library.
          </Text>
        </View>

        {/* Profile Info Details Card */}
        <View className="bg-white rounded-3xl border border-[#eaecef] p-6 shadow-sm mb-6">
          <Text className="text-base font-bold text-health-text mb-4">Personal Details</Text>
          
          <View className="gap-4">
            <AppInput 
              label="Full Name" 
              value={name} 
              onChangeText={setName} 
              placeholder="e.g. Elena Rodriguez" 
            />
            <AppInput 
              label="Phone Number" 
              value={phone} 
              onChangeText={setPhone} 
              keyboardType="phone-pad" 
              placeholder="e.g. +1 555-0199" 
            />
          </View>
        </View>

        {/* Save Button */}
        <AppButton
          label="Save Profile Changes"
          onPress={handleSaveChanges}
        />
      </ScrollView>
    </Screen>
  );
}
