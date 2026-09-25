import { BusinessError } from "@/shared/errors/business.error";
import { useAlertStore } from "@/shared/stores/useAlertStore";
import type {
  SafeRequest,
  SafeRequestOptions,
  SafeRequestError,
} from "@/shared/interface/request";

export async function safeRequest<T>(
  action: () => Promise<T>,
  options: SafeRequestOptions = {},
): Promise<SafeRequest<T>> {
  const { showAlert = true } = options;
  try {
    const data = await action();
    return { status: true, data, error: null };
  } catch (e: unknown) {
    /*
     * ⛔ Petición CANCELADA, no fallida.
     *
     * `ApiRequest` deduplica por endpoint: si la misma petición se pide otra vez
     * antes de responder, aborta la anterior y la rechaza con `null`. Eso es
     * flujo normal —pasa siempre que dos pantallas piden lo mismo al montar— y
     * tratarlo como error llenaba la consola de `Error: null` y, con
     * `showAlert`, sacaba un cartel de fallo por una petición que nadie esperaba
     * ya.
     *
     * Se devuelve `status: false` con `data: null`: quien llama ya contempla ese
     * caso (`data ?? []`), y la respuesta buena llega por la petición que la
     * reemplazó.
     */
    if (e === null) {
      return {
        status: false,
        data: null,
        error: {
          code: "REQUEST_CANCELLED",
          message: "",
          details: {},
        },
      };
    }

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
    console.error("Error:", e);
    return { status: false, error, data: null };
  }
}
