let onNetworkError: (() => void) | null = null;

export function registerApiNetworkErrorHandler(handler: () => void) {
  onNetworkError = handler;
}

export function notifyApiNetworkError() {
  onNetworkError?.();
}
