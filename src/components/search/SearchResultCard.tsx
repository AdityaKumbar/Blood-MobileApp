import { Text, View, Pressable, Linking, Platform } from "react-native";

import type { SearchResultItem } from "../../types/search";
import { Card } from "../ui/Card";

interface SearchResultCardProps {
  item: SearchResultItem;
}

export function SearchResultCard({ item }: SearchResultCardProps) {
  const heading =
    item.type === "blood"
      ? "Blood Availability"
      : item.type === "oxygen"
        ? "Oxygen Availability"
        : "Nearby Hospital";

  return (
    <Card>
      <Text className="text-xs uppercase tracking-wide text-health-muted">{heading}</Text>
      <Text className="mt-1 text-base font-semibold text-health-text">{item.name}</Text>
      <Text className="mt-1 text-sm text-health-muted">{item.location}</Text>
      <Text className="mt-2 text-xs text-health-accent">Status: {item.availabilityLabel}</Text>

      {item.bloodGroups?.length ? (
        <Text className="mt-1 text-xs text-health-muted">Blood Groups: {item.bloodGroups.join(", ")}</Text>
      ) : null}
      {typeof item.oxygenUnits === "number" ? (
        <Text className="mt-1 text-xs text-health-muted">Oxygen Units: {item.oxygenUnits}</Text>
      ) : null}
      {typeof item.distanceKm === "number" ? (
        <Text className="mt-1 text-xs text-health-muted">{item.distanceKm.toFixed(1)} km away</Text>
      ) : null}

      {item.phone ? (
        <Text className="mt-1 text-xs text-health-muted">Phone: {item.phone}</Text>
      ) : null}

      {item.latitude && item.longitude ? (
        <Text className="mt-1 text-xs text-health-muted">Coords: {item.latitude}, {item.longitude}</Text>
      ) : null}

      {(item.phone || (item.latitude && item.longitude)) && (
        <View className="mt-3 flex-row gap-2">
          {item.phone ? (
            <Pressable
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
              className="flex-1 items-center justify-center rounded-xl bg-brand-50 border border-brand-100 py-2.5"
            >
              <Text className="text-xs font-semibold text-brand-700">📞 Call Hospital</Text>
            </Pressable>
          ) : null}
          {item.latitude && item.longitude ? (
            <Pressable
              onPress={() => {
                const mapUrl = Platform.select({
                  ios: `maps:0,0?q=${item.latitude},${item.longitude}`,
                  android: `geo:0,0?q=${item.latitude},${item.longitude}(${encodeURIComponent(item.name)})`,
                  default: `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`
                });
                Linking.openURL(mapUrl).catch(() => {
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`);
                });
              }}
              className="flex-1 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 py-2.5"
            >
              <Text className="text-xs font-semibold text-rose-700">📍 View on Map</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </Card>
  );
}
