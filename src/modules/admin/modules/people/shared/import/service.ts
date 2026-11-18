import { importRepository as repository } from "./repository";
import type { ApiResponse } from "@/shared/interface/api-response";

const dataOf = <T>(response: ApiResponse<T>): T => {
  if (!response.success || response.data === null)
    throw new Error(
      response.error?.message || "No se pudo completar la operación.",
    );
  return response.data;
};

export const importService = {
  submit: async (...args: Parameters<typeof repository.submit>) =>
    dataOf(await repository.submit(...args)),
};
