export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export function unwrapApiData<T>(envelope: ApiEnvelope<T>): T {
  return envelope.data;
}
