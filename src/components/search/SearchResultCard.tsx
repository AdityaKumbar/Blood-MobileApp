import { Text, View } from "react-native";

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
    </Card>
  );
}
