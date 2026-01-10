type RetryRequest = () => Promise<unknown>;

export interface SafeRequest<T> {
    status: boolean;
    data: T | null;
    error: unknown | null;
}
export interface SafeRequestOptions {
    showAlert?: boolean; // Default: true
    retryAction?: RetryRequest | null;
}
