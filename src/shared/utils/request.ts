import { BusinessError } from "@/shared/errors/business.error";
import { useAlertStore } from "@/shared/stores/useAlertStore";
import type {
  SafeRequest,
  SafeRequestOptions,
  SafeRequestError,
} from "@/shared/interface/request";

export async function safeRequest<T>(
  action: () => Promise<T>,
  options: SafeRequestOptions = {}
): Promise<SafeRequest<T>> {
  const { showAlert = true } = options;
  try {
    const data = await action();
    return { status: true, data, error: null };
  } catch (e: unknown) {
    const error: SafeRequestError = {
      code: "UNKNOWN_ERROR",
      message: "Ups, ocurrió algo inesperado. Por favor, intenta más tarde.",
      details: {},
    };
    if (e instanceof BusinessError && e.message) {
      error.message = e.message;
      error.code = e.code;
      error.details = e.errors;
    }
    if (showAlert) {
      const alertStore = useAlertStore();
      if (error instanceof BusinessError && error.message) {
        alertStore.showError({ title: error.message });
      } else {
        alertStore.showGlobalError();
      }
    }
    console.error("Error:", error);
    return { status: false, error, data: null };
  }
}
