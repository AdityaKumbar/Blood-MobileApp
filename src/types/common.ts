export type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

export interface ApiErrorShape {
  message: string;
  statusCode?: number;
}
