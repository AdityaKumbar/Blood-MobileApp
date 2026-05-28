import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { prependEmergencyUpdate, upsertEmergencyUpdate } from "../redux/slices/emergencySlice";
import { prependNotification } from "../redux/slices/notificationSlice";
import {
  setInventoryUpdate,
  setRealtimeError,
  setRealtimeStatus
} from "../redux/slices/realtimeSlice";
import { socketService } from "../socket/socketService";
import type { EmergencyRequest } from "../types/emergency";
import type { AppNotification } from "../types/notification";
import type { InventoryUpdateEvent } from "../types/realtime";
import { mapEmergencyItem, type BackendEmergencyRequest } from "../api/emergencyMappers";

export function useRealtimeUpdates() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);

  useEffect(() => {
    if (!accessToken) {
      socketService.disconnect();
      dispatch(setRealtimeStatus("disconnected"));
      return;
    }

    dispatch(setRealtimeStatus("connecting"));
    const socket = socketService.connect(accessToken);

    const onConnect = () => dispatch(setRealtimeStatus("connected"));
    const onDisconnect = () => dispatch(setRealtimeStatus("disconnected"));
    const onConnectError = (error: Error) => dispatch(setRealtimeError(error.message));

    const normalizeEmergencyPayload = (payload: EmergencyRequest | BackendEmergencyRequest): EmergencyRequest => {
      if ("id" in payload) return payload;
      return mapEmergencyItem(payload);
    };

    const isForwardedForApp = (item: EmergencyRequest) =>
      item.backendStatus === "FORWARDED_TO_APP" ||
      item.backendStatus === "ASSIGNED" ||
      item.backendStatus === "RESOLVED";

    const onEmergencyCreate = (payload: EmergencyRequest | BackendEmergencyRequest) => {
      const normalized = normalizeEmergencyPayload(payload);
      if (!isForwardedForApp(normalized)) return;
      dispatch(prependEmergencyUpdate(normalized));
    };
    const onEmergencyUpdate = (payload: EmergencyRequest | BackendEmergencyRequest) => {
      const normalized = normalizeEmergencyPayload(payload);
      if (!isForwardedForApp(normalized)) return;
      dispatch(upsertEmergencyUpdate(normalized));
    };
    const onNotificationNew = (payload: AppNotification) =>
      dispatch(
        prependNotification({
          ...payload,
          type: payload.type ?? "EMERGENCY_ALERT",
          read: false,
          createdAt: payload.createdAt ?? new Date().toISOString()
        })
      );
    const onInventoryUpdate = (payload: InventoryUpdateEvent) => dispatch(setInventoryUpdate(payload));

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("new-emergency", onEmergencyCreate);
    socket.on("request-forwarded-to-app", onEmergencyUpdate);
    socket.on("request-approved", onEmergencyUpdate);
    socket.on("donor-assigned", onEmergencyUpdate);
    socket.on("notification:new", onNotificationNew);
    socket.on("inventory-updated", onInventoryUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("new-emergency", onEmergencyCreate);
      socket.off("request-forwarded-to-app", onEmergencyUpdate);
      socket.off("request-approved", onEmergencyUpdate);
      socket.off("donor-assigned", onEmergencyUpdate);
      socket.off("notification:new", onNotificationNew);
      socket.off("inventory-updated", onInventoryUpdate);
      socketService.disconnect();
    };
  }, [accessToken, dispatch]);
}
