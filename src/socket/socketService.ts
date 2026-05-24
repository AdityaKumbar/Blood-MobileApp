import { io, type Socket } from "socket.io-client";

import { env } from "../constants/env";

type EventHandler<T = unknown> = (payload: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private authToken: string | null = null;

  connect(accessToken: string) {
    this.authToken = accessToken;

    if (this.socket) {
      this.socket.auth = { token: accessToken };
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    this.socket = io(env.socketUrl, {
      transports: ["websocket"],
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  isConnected() {
    return Boolean(this.socket?.connected);
  }

  on<T = unknown>(event: string, handler: EventHandler<T>) {
    this.socket?.on(event, handler);
    return () => this.off(event, handler);
  }

  off<T = unknown>(event: string, handler?: EventHandler<T>) {
    if (!this.socket) return;
    if (handler) {
      this.socket.off(event, handler);
      return;
    }
    this.socket.off(event);
  }

  emit<T = unknown>(event: string, payload: T) {
    this.socket?.emit(event, payload);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
