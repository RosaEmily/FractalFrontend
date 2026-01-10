import { BusinessError } from "@/shared/errors/business.error";
import { RequestError } from "@/shared/errors/request.error";
import type { ApiResponse } from "@/shared/interface/api-response";
import axios, {
  isAxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method,
} from "axios";

export class ApiRequest {
  private readonly axios: AxiosInstance;
  private controllers = new Map<string, AbortController>();

  constructor(axiosInstance?: AxiosInstance) {
    this.axios =
      axiosInstance ??
      axios.create({
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
        },
      });

    this.setUpInterceptors();
  }

  private setUpInterceptors() {
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response,

      (error: unknown) => {
        // ⛔ cancelaciones → ignorar
        if (
          axios.isCancel(error) ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return Promise.reject(null);
        }

        if (isAxiosError(error)) {
          const response = error.response;
          const data = response?.data ?? {};
          const httpCode = response?.status ?? 500;

          // ⛔ Otros errores → flujo normal
          return Promise.reject(
            new RequestError(
              data.message ?? "Unknown error",
              data.code ?? httpCode,
              httpCode,
              data.errors ?? null
            )
          );
        }

        return Promise.reject(error);
      }
    );
  }

  private getController(key: string): AbortController {
    // Si existe una request previa → cancelar
    if (this.controllers.has(key)) {
      this.controllers.get(key)!.abort();
    }

    const controller = new AbortController();
    this.controllers.set(key, controller);

    return controller;
  }

  // =======================================================
  // 🔥 MÉTODO BASE — Centraliza errores y respuesta tipada
  // =======================================================
  private async handleRequest<T>(
    method: Method,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const key = `${method}:${url}`;
    const controller = this.getController(key);
    try {
      const response = await this.axios.request<ApiResponse<T>>({
        method,
        url,
        data,
        ...config,
        signal: controller.signal,
      });
      return response.data;
    } catch (error: unknown) {
      if (error === null) {
        return Promise.reject(null);
      }

      if (error instanceof RequestError) {
        throw new BusinessError(error.message, error.code, error.errors);
      }

      throw error;
    } finally {
      this.controllers.delete(key);
    }
  }

  // =======================================================
  // Métodos públicos — TIPADOS y limpios
  // =======================================================

  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest<T>("GET", url, undefined, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest<T>("DELETE", url, undefined, config);
  }

  post<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.handleRequest<T>("POST", url, data, config);
  }

  put<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.handleRequest<T>("PUT", url, data, config);
  }

  patch<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.handleRequest<T>("PATCH", url, data, config);
  }

  // =======================================================
  // Descargar archivo
  // =======================================================
  async getFileBlob(url: string, config?: AxiosRequestConfig): Promise<Blob> {
    try {
      const response = await this.axios.get(url, {
        ...config,
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      if (error instanceof RequestError) {
        throw new BusinessError(error.message, error.code, error.errors);
      }
      throw error;
    }
  }

  // =======================================================
  // Upload archivo
  // =======================================================
  uploadFile<T>(
    url: string,
    file: File,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);
    return this.handleRequest<T>("POST", url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  }
}
