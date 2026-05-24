export type RealtimeConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface InventoryUpdateEvent {
  bloodUnits: number;
  oxygenUnits: number;
  updatedAt: string;
}
