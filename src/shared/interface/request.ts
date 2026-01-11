type RetryRequest = () => Promise<unknown>;

export interface SafeRequestError {
  code: string;
  message: string | null;
  details?: string[] | Record<string, string[]> | null;
}

export interface SafeRequest<T> {
  status: boolean;
  data: T | null;
  error: SafeRequestError | null;
}
export interface SafeRequestOptions {
  showAlert?: boolean; // Default: true
  retryAction?: RetryRequest | null;
}
