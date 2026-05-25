import { Text, View, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BRAND_COLOR = "#b7102a";

type AppBrandSize = "sm" | "md";

const SIZES: Record<AppBrandSize, { mark: number; icon: number; fontSize: number }> = {
  sm: { mark: 28, icon: 16, fontSize: 18 },
  md: { mark: 36, icon: 20, fontSize: 22 },
};

type Props = {
  size?: AppBrandSize;
  style?: ViewStyle;
};

export function AppBrand({ size = "md", style }: Props) {
  const { mark, icon, fontSize } = SIZES[size];

  return (
    <View
      style={[{ flexDirection: "row", alignItems: "center", gap: 10 }, style]}
      accessibilityRole="header"
    >
      <View
        accessibilityLabel="Blood donation logo"
        style={{
          width: mark,
          height: mark,
          borderRadius: mark / 2,
          backgroundColor: BRAND_COLOR,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="water" size={icon} color="#ffffff" />
      </View>
      <Text style={{ fontSize, fontWeight: "700", color: BRAND_COLOR }}>LifeStream</Text>
    </View>
  );
}
