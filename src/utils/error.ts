import { isAxiosError } from "axios";

export function extractErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (isAxiosError(error)) {
    const apiMessage = (error.response?.data as { message?: string } | undefined)?.message;
    return apiMessage ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
